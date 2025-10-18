import axios from 'axios';

const BASE_URL = import.meta.env.VITE_ROCKETCHAT_URL;

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

// Helper function to get auth headers
export const getAuthHeaders = (authToken, userId) => ({
  'X-Auth-Token': authToken,
  'X-User-Id': userId,
  'Content-Type': 'application/json',
});

// Request interceptor to add auth headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Get auth data from localStorage or context
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (authToken && userId) {
      config.headers['X-Auth-Token'] = authToken;
      config.headers['X-User-Id'] = userId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Handle 401 unauthorized errors
//     if (error.response?.status === 401) {
//       // Clear auth data and redirect to login
//       localStorage.removeItem('authToken');
//       localStorage.removeItem('userId');
//       localStorage.removeItem('user');
      
//       // You can dispatch a logout action or redirect here
//       window.location.href = '/login';
//     }
    
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;