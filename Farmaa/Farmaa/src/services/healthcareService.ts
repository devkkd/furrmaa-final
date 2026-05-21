import api from '../config/api';

export type MedicalRecord = {
  _id?: string;
  date?: string;
  condition?: string;
  treatment?: string;
};

export async function fetchMedicalHistory(petId: string): Promise<MedicalRecord[]> {
  const res = await api.CLIENT.get(`${api.ENDPOINTS.HEALTHCARE}/pet/${petId}/history`);
  return res.data?.medicalHistory || [];
}

export async function addMedicalRecord(
  petId: string,
  record: { condition: string; treatment?: string; date?: string }
) {
  const res = await api.CLIENT.post(`${api.ENDPOINTS.HEALTHCARE}/pet/${petId}/record`, {
    condition: record.condition,
    treatment: record.treatment || '',
    date: record.date || new Date().toISOString(),
  });
  return res.data?.pet;
}
