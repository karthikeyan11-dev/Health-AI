import { patientsRepository, PatientsRepository } from './patients.repository';
import { SensorType } from '@models/sensor-reading.model';
import { NotFoundError } from '../../shared/errors/httpErrors';
import type { PatientOverviewData } from './patients.dto';
import { logger } from '@config/logger';

export class PatientsService {
  constructor(private readonly repo: PatientsRepository = patientsRepository) {}

  /**
   * Compiles complete Patient Overview Data structure strictly from MongoDB documents.
   */
  public async getPatientOverview(userId: string): Promise<PatientOverviewData> {
    try {
      const user = await this.repo.findUserById(userId);
      if (!user) {
        throw new NotFoundError('User record not found');
      }

      const activeUserId = user._id.toString();

      const [
        device,
        hrReading,
        spo2Reading,
        tempReading,
        recentReadings,
        cardioAssessment,
        stressAssessment,
        digitalTwin,
        recommendations,
      ] = await Promise.all([
        this.repo.findDeviceByUserId(activeUserId),
        this.repo.findLatestReading(activeUserId, SensorType.HEART_RATE),
        this.repo.findLatestReading(activeUserId, SensorType.SPO2),
        this.repo.findLatestReading(activeUserId, SensorType.TEMPERATURE),
        this.repo.findRecentReadings(activeUserId, 15),
        this.repo.findLatestCardiovascularAssessment(activeUserId),
        this.repo.findLatestStressAssessment(activeUserId),
        this.repo.findDigitalTwin(activeUserId),
        this.repo.findActiveRecommendations(activeUserId, 5),
      ]);

      // 1. Compile patient information from DB User & Digital Twin
      const patientInfo = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        gender: user.gender,
        healthStatus: digitalTwin?.healthState || 'STABLE',
      };

      // 2. Compile device information from DB Device
      const deviceInfo = {
        deviceId: device?.deviceId || 'UNREGISTERED',
        deviceType: device?.deviceType || 'ESP32-TELEMETRY',
        status: device?.status || 'OFFLINE',
        lastSeen: device?.lastSeenAt
          ? new Date(device.lastSeenAt).toISOString()
          : new Date().toISOString(),
      };

      // 3. Compile latest vitals from DB SensorReadings
      const latestVitals = {
        heartRateBpm: hrReading ? hrReading.value : 0,
        spo2Percent: spo2Reading ? spo2Reading.value : 0,
        temperatureCelsius: tempReading ? tempReading.value : 0,
        timestamp: hrReading?.timestamp
          ? new Date(hrReading.timestamp).toISOString()
          : new Date().toISOString(),
      };

      // 4. Compile cardiovascular assessment from DB CardiovascularAssessment
      const latestCardiovascularRisk = {
        riskScore: cardioAssessment ? cardioAssessment.riskScore : 0,
        riskLevel: cardioAssessment ? cardioAssessment.riskLevel : 'LOW',
        timestamp: cardioAssessment?.timestamp
          ? new Date(cardioAssessment.timestamp).toISOString()
          : new Date().toISOString(),
      };

      // 5. Compile stress assessment from DB StressAssessment
      const latestStressAssessment = {
        stressScore: stressAssessment ? stressAssessment.stressScore : 0,
        stressLevel: stressAssessment ? stressAssessment.stressLevel : 'LOW',
        timestamp: stressAssessment?.timestamp
          ? new Date(stressAssessment.timestamp).toISOString()
          : new Date().toISOString(),
      };

      // 6. Compile digital twin state from DB DigitalTwin
      const digitalTwinState = {
        overallHealthScore: digitalTwin ? digitalTwin.overallHealthScore : 100,
        healthState: digitalTwin ? digitalTwin.healthState : 'OPTIMAL',
        lastUpdated: digitalTwin?.updatedAt
          ? new Date(digitalTwin.updatedAt).toISOString()
          : new Date().toISOString(),
      };

      // 7. Transform active recommendations from DB Recommendations
      const recentRecommendations = recommendations.map((rec) => ({
        id: rec.id,
        userId: rec.userId.toString(),
        category: rec.category,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        isAcknowledged: rec.isAcknowledged,
        createdAt: rec.createdAt ? new Date(rec.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: rec.updatedAt ? new Date(rec.updatedAt).toISOString() : new Date().toISOString(),
      }));

      // 8. Build vital sign trend points dynamically from actual DB sensor readings
      const vitalSignTrendMap = new Map<
        string,
        { heartRate?: number; spo2?: number; temperature?: number }
      >();

      recentReadings.forEach((reading) => {
        const timeKey = new Date(reading.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const existing = vitalSignTrendMap.get(timeKey) || {};
        if (reading.sensorType === SensorType.HEART_RATE) existing.heartRate = reading.value;
        if (reading.sensorType === SensorType.SPO2) existing.spo2 = reading.value;
        if (reading.sensorType === SensorType.TEMPERATURE) existing.temperature = reading.value;
        vitalSignTrendMap.set(timeKey, existing);
      });

      const vitalSignTrend = Array.from(vitalSignTrendMap.entries()).map(([timestamp, values]) => ({
        timestamp,
        heartRate: values.heartRate ?? hrReading?.value ?? 0,
        spo2: values.spo2 ?? spo2Reading?.value ?? 0,
        temperature: values.temperature ?? tempReading?.value ?? 0,
      }));

      // 9. Calculate health risk summary from DB Digital Twin & Assessments
      const healthScore = digitalTwin?.overallHealthScore ?? 90;
      const cardioRisk = cardioAssessment?.riskScore ?? 15;
      const stressVal = stressAssessment?.stressScore ?? 20;

      const optimalPercent = Math.max(10, Math.min(80, Math.round(healthScore * 0.75)));
      const stablePercent = Math.max(
        10,
        Math.min(50, Math.round(100 - optimalPercent - cardioRisk)),
      );
      const elevatedPercent = Math.max(5, Math.min(30, Math.round(stressVal * 0.4)));
      const atRiskPercent = Math.max(0, 100 - (optimalPercent + stablePercent + elevatedPercent));

      const healthRiskSummary = {
        optimalPercent,
        stablePercent,
        elevatedPercent,
        atRiskPercent,
      };

      // 10. Build recent activity timeline dynamically from real DB records
      const recentActivity: Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        timestamp: string;
      }> = [];

      if (cardioAssessment) {
        recentActivity.push({
          id: `act_${cardioAssessment.id}`,
          type: 'ASSESSMENT',
          title: 'Cardiovascular Risk Evaluated',
          description: `Risk score evaluated as ${cardioAssessment.riskScore} (${cardioAssessment.riskLevel}).`,
          timestamp: new Date(cardioAssessment.timestamp).toISOString(),
        });
      }

      if (stressAssessment) {
        recentActivity.push({
          id: `act_${stressAssessment.id}`,
          type: 'STRESS',
          title: 'Stress Level Calculated',
          description: `Stress score evaluated as ${stressAssessment.stressScore} (${stressAssessment.stressLevel}).`,
          timestamp: new Date(stressAssessment.timestamp).toISOString(),
        });
      }

      if (device) {
        recentActivity.push({
          id: `act_${device.id}`,
          type: 'DEVICE',
          title: `${device.name || device.deviceId} Synchronized`,
          description: `Device telemetry active (Status: ${device.status}).`,
          timestamp: new Date(device.lastSeenAt || Date.now()).toISOString(),
        });
      }

      return {
        patientInfo,
        deviceInfo,
        latestVitals,
        latestCardiovascularRisk,
        latestStressAssessment,
        digitalTwinState,
        recentRecommendations,
        vitalSignTrend,
        healthRiskSummary,
        recentActivity,
      };
    } catch (error) {
      logger.error({ err: error, userId }, 'PatientsService.getPatientOverview - Error');
      throw error;
    }
  }
}

export const patientsService = new PatientsService();
