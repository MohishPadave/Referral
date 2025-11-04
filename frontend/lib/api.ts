import axios from 'axios';

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // If explicitly set, use that
  if (process.env.NEXT_PUBLIC_API_BASE) {
    console.log('🔧 Using API URL from environment:', process.env.NEXT_PUBLIC_API_BASE);
    return process.env.NEXT_PUBLIC_API_BASE;
  }
  
  // In production, use Vercel backend URL
  if (process.env.NODE_ENV === 'production') {
    console.log('🚀 Production mode detected, using Vercel backend');
    return process.env.NEXT_PUBLIC_API_BASE || 'https://referral-hub-git-main-mohishs-projects-43ec9c03.vercel.app';
  }
  
  // Default to localhost for development
  console.log('🛠️ Development mode, using localhost');
  return 'http://localhost:4000';
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Create a test API without credentials for debugging
export const testApi = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: false,
  timeout: 10000,
});

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔍 Testing connection to:', api.defaults.baseURL);
    const response = await api.get('/health');
    console.log('✅ Backend connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Backend connection failed:', error.message);
    console.error('📍 Trying to connect to:', api.defaults.baseURL);
    return { success: false, error: error.message };
  }
};

// Test connection without credentials
export const testConnectionNoCredentials = async () => {
  try {
    console.log('🔍 Testing connection (no credentials) to:', testApi.defaults.baseURL);
    const response = await testApi.get('/health');
    console.log('✅ Backend connection successful (no credentials):', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Backend connection failed (no credentials):', error.message);
    return { success: false, error: error.message };
  }
};

// Add request interceptor for debugging and token handling
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('🔧 Request config:', {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials
    });
    
    // Add Authorization header if we have a token in localStorage (fallback for cookie issues)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Added Authorization header from localStorage');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      baseURL: error.config?.baseURL,
      code: error.code
    });
    
    // Log specific error types
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error - Check if backend is accessible:', error.config?.baseURL);
    }
    if (error.response?.status === 502) {
      console.error('🚫 502 Bad Gateway - Backend service might be down');
    }
    if (error.response?.status === 0) {
      console.error('🔒 CORS Error - Check CORS configuration on backend');
    }
    
    return Promise.reject(error);
  }
);


