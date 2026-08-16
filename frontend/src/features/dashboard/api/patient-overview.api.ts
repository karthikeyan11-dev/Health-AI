import { patientsApi } from '@/api';
import type { PatientOverviewData } from '@/sdk';

export const patientOverviewApi = {
  /**
   * Fetches patient health overview analytics via generated PatientsApi SDK.
   */
  async getPatientOverview(): Promise<PatientOverviewData> {
    const response = await patientsApi.getPatientOverview();
    return response.data.data;
  },
};
