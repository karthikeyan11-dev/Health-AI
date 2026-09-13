import { Types } from 'mongoose';
import { TelemetryRepository, telemetryRepository as defaultRepo } from './telemetry.repository';
import {
  type IngestTelemetryInput,
  type IngestTelemetryResult,
  type LatestTelemetrySummary,
  type TelemetryReadingItem,
  SENSOR_DEFAULT_UNITS,
  SENSOR_PHYSIOLOGICAL_LIMITS,
} from './telemetry.dto';
import { SensorType, type ISensorReadingDocument } from '../../models/sensor-reading.model';
import { broadcastTelemetry, broadcastAlert } from '../../config/socket';
import { BadRequestError } from '../../shared/errors/httpErrors';
import { logger } from '../../config/logger';

export class TelemetryService {
  constructor(
    private readonly repository: TelemetryRepository = defaultRepo,
    private readonly broadcastFn = broadcastTelemetry,
    private readonly alertFn = broadcastAlert,
  ) {}

  /**
   * Ingests a batch of telemetry sensor readings, validates values,
   * persists to MongoDB, updates device heartbeat, and streams over WebSockets.
   */
  public async ingestTelemetry(
    userId: string,
    input: IngestTelemetryInput,
  ): Promise<IngestTelemetryResult> {
    if (!input || !Array.isArray(input.readings) || input.readings.length === 0) {
      throw new BadRequestError('Telemetry payload must contain a non-empty array of readings');
    }

    // 1. Verify user's patient profile if present
    const patient = await this.repository.findPatientByUserId(userId);
    const patientObjectId = patient ? (patient._id as Types.ObjectId) : undefined;
    const userObjectId = new Types.ObjectId(userId);

    // 2. Validate and format each reading
    const validReadings: Array<{
      userId: Types.ObjectId;
      patientId?: Types.ObjectId;
      deviceId?: string;
      sensorType: SensorType;
      value: number;
      unit: string;
      confidence?: number;
      metadata?: Record<string, unknown>;
      timestamp: Date;
    }> = [];

    let alertsTriggered = 0;

    for (const item of input.readings) {
      this.validateReadingItem(item);

      const resolvedUnit = item.unit || SENSOR_DEFAULT_UNITS[item.sensorType];
      const resolvedTimestamp = item.timestamp ? new Date(item.timestamp) : new Date();

      validReadings.push({
        userId: userObjectId,
        patientId: patientObjectId,
        deviceId: input.deviceId,
        sensorType: item.sensorType,
        value: item.value,
        unit: resolvedUnit,
        confidence: item.confidence,
        metadata: item.metadata,
        timestamp: resolvedTimestamp,
      });

      // Check physiological alerts
      const alert = this.checkPhysiologicalAlert(userId, item);
      if (alert) {
        alertsTriggered++;
        this.alertFn(userId, alert);
      }
    }

    // 3. Persist to MongoDB in bulk
    await this.repository.insertManyReadings(validReadings);

    // 4. Update device heartbeat & battery if provided
    if (input.deviceId || input.batteryLevel !== undefined) {
      await this.repository.updateDeviceHeartbeat(userId, input.deviceId, input.batteryLevel);
    }

    // 5. Broadcast real-time packet to user's WebSocket room
    const packetPayload = {
      userId,
      deviceId: input.deviceId,
      batteryLevel: input.batteryLevel,
      readings: validReadings.map((r) => ({
        sensorType: r.sensorType,
        value: r.value,
        unit: r.unit,
        timestamp: r.timestamp.toISOString(),
        confidence: r.confidence,
        metadata: r.metadata,
      })),
      receivedAt: new Date().toISOString(),
    };

    this.broadcastFn(userId, packetPayload);

    logger.info(
      { userId, deviceId: input.deviceId, count: validReadings.length, alertsTriggered },
      'Smartwatch telemetry successfully ingested and broadcasted',
    );

    return {
      ingestedCount: validReadings.length,
      deviceId: input.deviceId,
      batteryLevel: input.batteryLevel,
      timestamp: packetPayload.receivedAt,
      alertsTriggered,
    };
  }

  /**
   * Retrieves the latest reading for each sensor type along with device connection status.
   */
  public async getLatestTelemetry(userId: string): Promise<LatestTelemetrySummary> {
    const [latestReadingsMap, primaryDevice] = await Promise.all([
      this.repository.findLatestReadingsByUserId(userId),
      this.repository.findPrimaryDeviceByUserId(userId),
    ]);

    const formattedReadings: Record<
      string,
      {
        sensorType: SensorType;
        value: number;
        unit: string;
        timestamp: string;
        confidence?: number;
      }
    > = {};

    let latestTimestamp: Date = new Date(0);

    for (const [sensorType, reading] of latestReadingsMap.entries()) {
      formattedReadings[sensorType] = {
        sensorType,
        value: reading.value,
        unit: reading.unit,
        timestamp: reading.timestamp.toISOString(),
        confidence: reading.confidence,
      };

      if (reading.timestamp > latestTimestamp) {
        latestTimestamp = reading.timestamp;
      }
    }

    return {
      userId,
      device: primaryDevice
        ? {
            deviceId: primaryDevice.deviceId,
            name: primaryDevice.name,
            status: primaryDevice.status,
            batteryLevel: primaryDevice.batteryLevel,
            lastSeenAt: primaryDevice.lastSeenAt?.toISOString(),
          }
        : null,
      readings: formattedReadings,
      lastUpdated:
        latestTimestamp.getTime() > 0 ? latestTimestamp.toISOString() : new Date().toISOString(),
    };
  }

  /**
   * Retrieves historical time-series sensor readings for charting.
   */
  public async getHistoricalReadings(
    userId: string,
    sensorType?: SensorType,
    limit = 50,
  ): Promise<ISensorReadingDocument[]> {
    return this.repository.findHistoricalReadings(userId, sensorType, limit);
  }

  /**
   * Validates individual sensor reading against enum and range constraints.
   */
  private validateReadingItem(item: TelemetryReadingItem): void {
    if (!item.sensorType || !Object.values(SensorType).includes(item.sensorType)) {
      throw new BadRequestError(`Invalid or unsupported sensorType: ${String(item.sensorType)}`);
    }

    if (typeof item.value !== 'number' || isNaN(item.value)) {
      throw new BadRequestError(
        `Invalid numeric value for sensor ${item.sensorType}: ${String(item.value)}`,
      );
    }

    const limits = SENSOR_PHYSIOLOGICAL_LIMITS[item.sensorType];
    if (limits && (item.value < limits.min || item.value > limits.max)) {
      throw new BadRequestError(
        `Value ${item.value} for ${item.sensorType} is outside realistic physiological range [${limits.min}, ${limits.max}]`,
      );
    }
  }

  /**
   * Evaluates if a reading crosses critical clinical alert thresholds.
   */
  private checkPhysiologicalAlert(
    userId: string,
    item: TelemetryReadingItem,
  ): {
    userId: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    title: string;
    message: string;
    metric: string;
    value: number;
    timestamp: string;
  } | null {
    const limits = SENSOR_PHYSIOLOGICAL_LIMITS[item.sensorType];

    if (limits.alertHigh !== undefined && item.value >= limits.alertHigh) {
      const isSevere = item.value >= limits.alertHigh * 1.15;
      return {
        userId,
        severity: isSevere ? 'CRITICAL' : 'WARNING',
        title: `Elevated ${item.sensorType.replace(/_/g, ' ')} Alert`,
        message: `${item.sensorType.replace(/_/g, ' ')} registered ${item.value} ${SENSOR_DEFAULT_UNITS[item.sensorType]}, exceeding safety threshold (${limits.alertHigh}).`,
        metric: item.sensorType,
        value: item.value,
        timestamp: new Date().toISOString(),
      };
    }

    if (limits.alertLow !== undefined && item.value <= limits.alertLow) {
      const isSevere = item.value <= limits.alertLow * 0.85;
      return {
        userId,
        severity: isSevere ? 'CRITICAL' : 'WARNING',
        title: `Low ${item.sensorType.replace(/_/g, ' ')} Alert`,
        message: `${item.sensorType.replace(/_/g, ' ')} registered ${item.value} ${SENSOR_DEFAULT_UNITS[item.sensorType]}, dropping below safety threshold (${limits.alertLow}).`,
        metric: item.sensorType,
        value: item.value,
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  }
}

export const telemetryService = new TelemetryService();
