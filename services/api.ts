import axios from 'axios';
import { TOKEN_KEY } from './AuthService';

// Base URL from environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Errors (e.g. 401, Network errors)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle Network Errors (No response from server)
        if (!error.response) {
            error.message = "Network error: Please check your internet connection.";
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            console.warn('Unauthorized access - potential token expiry');
        }

        // Handle common technical errors from backend
        if (error.response?.data?.message?.includes('ENOTFOUND') ||
            error.response?.data?.message?.includes('ECONNREFUSED')) {
            error.response.data.message = "System is temporarily unavailable. Please try again in a moment.";
        }

        return Promise.reject(error);
    }
);
