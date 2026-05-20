const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = getApiBaseUrl();
