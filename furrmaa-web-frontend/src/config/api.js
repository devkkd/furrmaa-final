// API Configuration
import { getApiBaseUrl } from '@/lib/apiBase';

// API endpoints helper
export const API_ENDPOINTS = {
  // Add your endpoints here
  // Example:
  // products: `${getApiBaseUrl()}/products`,
};

// Fetch wrapper with error handling
export const apiClient = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};
