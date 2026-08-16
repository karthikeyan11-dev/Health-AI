export const HEALTH_MONITORING_TEXTS = {
  TITLE: 'Health Monitoring',
  SUBTITLE:
    'Real-time and historical physiological telemetry from connected patient hardware sensors.',
  LOADING_TEXT: 'Loading physiological telemetry records...',
  ERROR_TITLE: 'Unable to Load Telemetry Data',
  ERROR_SUBTITLE:
    'We encountered an error while fetching your health monitoring records. Please try again.',
  RETRY_BUTTON: 'Retry Loading Telemetry',
  EMPTY_READINGS: 'No sensor telemetry readings available for the selected filters.',
  EMPTY_DEVICES: 'No registered devices found.',
  FILTERS: {
    TIME_RANGE_LABEL: 'Time Horizon',
    DEVICE_LABEL: 'Filter by Device',
    ALL_DEVICES_LABEL: 'All Registered Devices',
  },
  TIME_RANGE_OPTIONS: [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'all', label: 'All History' },
  ],
  CHARTS: {
    HEART_RATE_TITLE: 'Heart Rate History',
    HEART_RATE_SUBTITLE: 'PPG optical heart rate sensor measurements over time (BPM)',
    SPO2_TITLE: 'Blood Oxygen (SpO₂) History',
    SPO2_SUBTITLE: 'Blood oxygen saturation percentage level history (%)',
    TEMPERATURE_TITLE: 'Body Temperature History',
    TEMPERATURE_SUBTITLE: 'Infrared / thermistor body temperature telemetry (°C)',
    COMBINED_TITLE: 'Combined Vital Trends',
    COMBINED_SUBTITLE: 'Multi-vital sign correlation chart (Heart Rate, SpO₂, Temperature)',
  },
} as const;
