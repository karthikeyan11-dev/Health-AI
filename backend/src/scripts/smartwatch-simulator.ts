import axios from 'axios';
import { io as socketIOClient, type Socket } from 'socket.io-client';
import { SensorType } from '../models/sensor-reading.model';

export type SimulatorProfile =
  'HEALTHY_REST' | 'CARDIO_STRAIN' | 'EXERCISE_ZONE' | 'RELAXATION_RECOVERY' | 'CIRCADIAN_DYNAMIC';

export interface SimulatorConfig {
  backendUrl: string;
  email: string;
  password: string;
  deviceId: string;
  intervalMs: number;
  profile: SimulatorProfile;
  noiseLevel: number;
  useWebSocket: boolean;
}

export interface PhysiologicalBaselines {
  heartRate: number;
  restingHr: number;
  spo2: number;
  temperature: number;
  systolicBp: number;
  diastolicBp: number;
  hrv: number;
  stepsPerSec: number;
  caloriesBurnedPerSec: number;
  distanceKmPerSec: number;
  respiratoryRate: number;
}

const PROFILE_BASELINES: Record<SimulatorProfile, PhysiologicalBaselines> = {
  HEALTHY_REST: {
    heartRate: 68,
    restingHr: 62,
    spo2: 98.8,
    temperature: 36.6,
    systolicBp: 118,
    diastolicBp: 78,
    hrv: 65,
    stepsPerSec: 0.1,
    caloriesBurnedPerSec: 0.02,
    distanceKmPerSec: 0.0001,
    respiratoryRate: 14,
  },
  CARDIO_STRAIN: {
    heartRate: 104,
    restingHr: 92,
    spo2: 94.5,
    temperature: 37.2,
    systolicBp: 148,
    diastolicBp: 96,
    hrv: 22,
    stepsPerSec: 0.2,
    caloriesBurnedPerSec: 0.03,
    distanceKmPerSec: 0.0002,
    respiratoryRate: 20,
  },
  EXERCISE_ZONE: {
    heartRate: 152,
    restingHr: 65,
    spo2: 97.2,
    temperature: 37.8,
    systolicBp: 135,
    diastolicBp: 82,
    hrv: 38,
    stepsPerSec: 2.8,
    caloriesBurnedPerSec: 0.22,
    distanceKmPerSec: 0.0035,
    respiratoryRate: 28,
  },
  RELAXATION_RECOVERY: {
    heartRate: 60,
    restingHr: 58,
    spo2: 99.2,
    temperature: 36.5,
    systolicBp: 112,
    diastolicBp: 72,
    hrv: 78,
    stepsPerSec: 0.05,
    caloriesBurnedPerSec: 0.015,
    distanceKmPerSec: 0.00005,
    respiratoryRate: 12,
  },
  CIRCADIAN_DYNAMIC: {
    heartRate: 72,
    restingHr: 64,
    spo2: 98.0,
    temperature: 36.7,
    systolicBp: 120,
    diastolicBp: 80,
    hrv: 55,
    stepsPerSec: 0.5,
    caloriesBurnedPerSec: 0.04,
    distanceKmPerSec: 0.0005,
    respiratoryRate: 16,
  },
};

export class SmartwatchSimulator {
  private config: SimulatorConfig;
  private token: string | null = null;
  private userId: string | null = null;
  private socket: Socket | null = null;
  private intervalTimer: NodeJS.Timeout | null = null;
  private accumulatedSteps = 6800;
  private accumulatedCalories = 1850;
  private accumulatedDistance = 4.8;
  private batteryLevel = 94;
  private tickCount = 0;

  constructor(customConfig?: Partial<SimulatorConfig>) {
    this.config = {
      backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
      email: process.env.SIMULATOR_EMAIL || 'karthikeyanm2209@gmail.com',
      password: process.env.SIMULATOR_PASSWORD || 'Karthi@1111',
      deviceId: process.env.SIMULATOR_DEVICE_ID || 'WATCH_HEALTH_AI_PRO_01',
      intervalMs:
        customConfig?.intervalMs || parseInt(process.env.SIMULATOR_INTERVAL_MS || '3000', 10),
      profile: (process.env.SIMULATOR_PROFILE as SimulatorProfile) || 'HEALTHY_REST',
      noiseLevel: parseFloat(process.env.SIMULATOR_NOISE || '0.04'),
      useWebSocket: process.env.SIMULATOR_USE_WS === 'true',
      ...customConfig,
    };
  }

  /**
   * Authenticates against the backend to receive session JWT.
   */
  public async authenticate(): Promise<void> {
    try {
      console.log(`[Smartwatch Simulator] 🔑 Authenticating with ${this.config.backendUrl}...`);
      const response = await axios.post(`${this.config.backendUrl}/api/v1/auth/login`, {
        email: this.config.email,
        password: this.config.password,
      });

      this.token = response.data?.accessToken || response.data?.data?.accessToken;

      if (!this.token) {
        throw new Error('Missing accessToken from auth response');
      }

      // Fetch user profile to get exact userId
      const profileRes = await axios.get(`${this.config.backendUrl}/api/v1/auth/profile`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      this.userId = profileRes.data?.data?.id || profileRes.data?.data?._id || profileRes.data?.id;

      console.log(`[Smartwatch Simulator] ✅ Authenticated successfully for User: ${this.userId}`);

      if (this.config.useWebSocket) {
        this.connectWebSocket();
      }
    } catch (error: unknown) {
      const errMessage =
        axios.isAxiosError(error) && error.response?.data?.error?.message
          ? (error.response.data.error.message as string)
          : error instanceof Error
            ? error.message
            : String(error);
      console.error(`[Smartwatch Simulator] ❌ Authentication failed: ${errMessage}`);
      throw error;
    }
  }

  /**
   * Connects to backend Socket.IO telemetry hub.
   */
  private connectWebSocket(): void {
    if (!this.token) return;

    this.socket = socketIOClient(this.config.backendUrl, {
      auth: { token: this.token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log(`[Smartwatch Simulator] ⚡ WebSocket Connected (ID: ${this.socket?.id})`);
    });

    this.socket.on('telemetry:alert', (alert: { severity?: string; title?: string }) => {
      console.log(
        `[Smartwatch Simulator] 🚨 ALERT RECEIVED: [${alert.severity || 'WARNING'}] ${alert.title || ''}`,
      );
    });
  }

  /**
   * Generates a realistic physiological reading package with gaussian jitter.
   */
  public generateTelemetryPacket(): {
    deviceId: string;
    batteryLevel: number;
    readings: Array<{
      sensorType: SensorType;
      value: number;
      unit: string;
      confidence: number;
      timestamp: string;
    }>;
  } {
    const baselines = PROFILE_BASELINES[this.config.profile];
    const jitter = (base: number, maxPercent: number = this.config.noiseLevel): number => {
      const delta = (Math.random() * 2 - 1) * maxPercent * base;
      return base + delta;
    };

    const deltaSec = this.config.intervalMs / 1000;
    this.accumulatedSteps += Math.round(
      baselines.stepsPerSec * deltaSec * (0.8 + Math.random() * 0.4),
    );
    this.accumulatedCalories += Number((baselines.caloriesBurnedPerSec * deltaSec).toFixed(2));
    this.accumulatedDistance += Number((baselines.distanceKmPerSec * deltaSec).toFixed(4));

    // Slow battery discharge
    this.tickCount++;
    if (this.tickCount % 50 === 0 && this.batteryLevel > 5) {
      this.batteryLevel -= 1;
    }

    const nowIso = new Date().toISOString();
    const hr = Math.round(jitter(baselines.heartRate, 0.05));
    const restingHr = Math.round(baselines.restingHr);
    const spo2 = Number(Math.min(100, Math.max(88, jitter(baselines.spo2, 0.01))).toFixed(1));
    const temp = Number(jitter(baselines.temperature, 0.008).toFixed(1));
    const sysBp = Math.round(jitter(baselines.systolicBp, 0.04));
    const diaBp = Math.round(jitter(baselines.diastolicBp, 0.04));
    const hrv = Math.round(Math.max(10, jitter(baselines.hrv, 0.08)));
    const respRate = Math.round(jitter(baselines.respiratoryRate, 0.06));

    return {
      deviceId: this.config.deviceId,
      batteryLevel: this.batteryLevel,
      readings: [
        {
          sensorType: SensorType.HEART_RATE,
          value: hr,
          unit: 'bpm',
          confidence: 98.5,
          timestamp: nowIso,
        },
        {
          sensorType: SensorType.RESTING_HEART_RATE,
          value: restingHr,
          unit: 'bpm',
          confidence: 96.0,
          timestamp: nowIso,
        },
        {
          sensorType: SensorType.SPO2,
          value: spo2,
          unit: '%',
          confidence: 99.0,
          timestamp: nowIso,
        },
        {
          sensorType: SensorType.TEMPERATURE,
          value: temp,
          unit: '°C',
          confidence: 97.5,
          timestamp: nowIso,
        },
        {
          sensorType: SensorType.BLOOD_PRESSURE_SYSTOLIC,
          value: sysBp,
          unit: 'mmHg',
          confidence: 94.0,
          timestamp: nowIso,
        },
        {
          sensorType: SensorType.BLOOD_PRESSURE_DIASTOLIC,
          value: diaBp,
          unit: 'mmHg',
          confidence: 94.0,
          timestamp: nowIso,
        },
        {
          sensorType: SensorType.HRV,
          value: hrv,
          unit: 'ms',
          confidence: 95.0,
          timestamp: nowIso,
        },
        {
          sensorType: SensorType.STEPS,
          value: this.accumulatedSteps,
          unit: 'steps',
          confidence: 99.9,
          timestamp: nowIso,
        },
        {
          sensorType: SensorType.CALORIES_BURNED,
          value: Number(this.accumulatedCalories.toFixed(1)),
          unit: 'kcal',
          confidence: 92.0,
          timestamp: nowIso,
        },
        {
          sensorType: SensorType.DISTANCE,
          value: Number(this.accumulatedDistance.toFixed(2)),
          unit: 'km',
          confidence: 95.0,
          timestamp: nowIso,
        },
        {
          sensorType: SensorType.RESPIRATORY_RATE,
          value: respRate,
          unit: 'breaths/min',
          confidence: 93.0,
          timestamp: nowIso,
        },
      ],
    };
  }

  /**
   * Pushes a single batch packet to the backend ingestion endpoint.
   */
  public async sendTelemetryBatch(): Promise<void> {
    if (!this.token) {
      await this.authenticate();
    }

    const payload = this.generateTelemetryPacket();

    try {
      const response = await axios.post(
        `${this.config.backendUrl}/api/v1/telemetry/ingest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        },
      );

      const hrReading = payload.readings.find((r) => r.sensorType === SensorType.HEART_RATE)?.value;
      const bpSys = payload.readings.find(
        (r) => r.sensorType === SensorType.BLOOD_PRESSURE_SYSTOLIC,
      )?.value;
      const bpDia = payload.readings.find(
        (r) => r.sensorType === SensorType.BLOOD_PRESSURE_DIASTOLIC,
      )?.value;
      const spo2 = payload.readings.find((r) => r.sensorType === SensorType.SPO2)?.value;
      const hrv = payload.readings.find((r) => r.sensorType === SensorType.HRV)?.value;

      console.log(
        `[Smartwatch] ⌚ [${this.config.profile}] HR: ${hrReading} bpm | BP: ${bpSys}/${bpDia} | SpO2: ${spo2}% | HRV: ${hrv}ms | Steps: ${this.accumulatedSteps} | Bat: ${this.batteryLevel}% (Accepted: ${response.status})`,
      );
    } catch (error: unknown) {
      const errMessage =
        axios.isAxiosError(error) && error.response?.data?.error?.message
          ? (error.response.data.error.message as string)
          : error instanceof Error
            ? error.message
            : String(error);
      console.error(`[Smartwatch] ⚠️ Telemetry transmission error: ${errMessage}`);
    }
  }

  /**
   * Starts periodic live streaming.
   */
  public async start(): Promise<void> {
    console.log('================================================================');
    console.log('       HEALTH AI SMARTWATCH TELEMETRY SIMULATOR                 ');
    console.log('================================================================');
    console.log(`📡 Backend URL:   ${this.config.backendUrl}`);
    console.log(`⌚ Device ID:     ${this.config.deviceId}`);
    console.log(`👤 Target User:   ${this.config.email}`);
    console.log(`📊 Mode Profile:  ${this.config.profile}`);
    console.log(`⏱️ Sync Interval: ${this.config.intervalMs}ms`);
    console.log('================================================================');

    await this.authenticate();

    // Initial transmission
    await this.sendTelemetryBatch();

    // Loop
    this.intervalTimer = setInterval(() => {
      void this.sendTelemetryBatch();
    }, this.config.intervalMs);
  }

  /**
   * Changes the active physiological profile on the fly.
   */
  public setProfile(profile: SimulatorProfile): void {
    console.log(
      `[Smartwatch Simulator] 🔄 Switching profile from ${this.config.profile} to ${profile}`,
    );
    this.config.profile = profile;
  }

  /**
   * Stops the simulator.
   */
  public stop(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    console.log('[Smartwatch Simulator] 🛑 Simulator stopped.');
  }
}

// Direct CLI Execution
if (require.main === module) {
  // Parse CLI args (e.g., --profile=CARDIO_STRAIN --interval=2000)
  const args = process.argv.slice(2);
  const cliConfig: Partial<SimulatorConfig> = {};

  for (const arg of args) {
    if (arg.startsWith('--profile=')) {
      cliConfig.profile = arg.replace('--profile=', '') as SimulatorProfile;
    } else if (arg.startsWith('--interval=')) {
      cliConfig.intervalMs = parseInt(arg.replace('--interval=', ''), 10);
    } else if (arg.startsWith('--url=')) {
      cliConfig.backendUrl = arg.replace('--url=', '');
    }
  }

  const simulator = new SmartwatchSimulator(cliConfig);
  void simulator.start();

  process.on('SIGINT', () => {
    simulator.stop();
    process.exit(0);
  });
}
