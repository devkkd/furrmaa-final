import api from '../config/api';
import { pickAndUploadImage } from '../utils/imageUpload';

export function parseAgeLabelToYears(ageLabel: string): number | undefined {
  const s = ageLabel.trim().toLowerCase();
  if (s.includes('month')) {
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? Math.max(0, Math.round(n / 12)) : 0;
  }
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function formatAgeFromYears(age?: number): string {
  if (age == null || Number.isNaN(age)) return '';
  if (age < 1) return '6 Months';
  return age === 1 ? '1 Year' : `${age} Year`;
}

export async function fetchMyPets() {
  const res = await api.CLIENT.get(api.ENDPOINTS.USER_PETS);
  return res.data?.pets || [];
}

export async function fetchPet(petId: string) {
  const res = await api.CLIENT.get(`${api.ENDPOINTS.USER_PETS}/${petId}`);
  return res.data?.pet;
}

export async function createPet(payload: Record<string, unknown>) {
  const res = await api.CLIENT.post(api.ENDPOINTS.USER_PETS, payload);
  return res.data?.pet;
}

export async function updatePet(petId: string, payload: Record<string, unknown>) {
  const res = await api.CLIENT.put(`${api.ENDPOINTS.USER_PETS}/${petId}`, payload);
  return res.data?.pet;
}

export async function deletePet(petId: string) {
  await api.CLIENT.delete(`${api.ENDPOINTS.USER_PETS}/${petId}`);
}

export async function uploadPetImage() {
  const result = await pickAndUploadImage('furmaa/pets');
  return result?.url || null;
}
