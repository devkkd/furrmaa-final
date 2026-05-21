// Debug utility for API calls
export const logAPIRequest = (method, url, data) => {
  if (__DEV__) {
    console.log(`📤 API Request: ${method.toUpperCase()} ${url}`, data || '');
  }
};

export const logAPIResponse = (response) => {
  if (__DEV__) {
    console.log('📥 API Response:', response.data);
  }
};

export const logAPIError = (error) => {
  if (__DEV__) {
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
  }
};

