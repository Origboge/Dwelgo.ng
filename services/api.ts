import axios from 'axios';

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
        const token = localStorage.getItem('propertyhub_token'); // We will switch to this key
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Errors (e.g. 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            // Ideally triggered a logout action here or refresh token flow
            // For now, we just reject to let the caller handle it or redirect
            console.warn('Unauthorized access - potential token expiry');
        }
        return Promise.reject(error);
    }
);
