import { api } from './api';
import { User } from '../types';

export const TOKEN_KEY = 'dwelgo_token';
export const USER_KEY = 'dwelgo_current_user';

const normalizeUser = (user: any): User => {
    if (!user) return user;

    // Ensure id exists
    if (!user.id && user._id) {
        user.id = user._id;
    }

    // Ensure firstName/lastName exist from name if missing
    if (user.name && (!user.firstName || !user.lastName)) {
        const parts = user.name.trim().split(' ');
        if (!user.firstName) user.firstName = parts[0];
        if (!user.lastName) user.lastName = parts.slice(1).join(' ') || '';
    }

    return user;
};

export const AuthService = {
    login: async (email: string, password: string): Promise<User> => {
        const response = await api.post('/auth/login', { email, password });

        let { user, accessToken } = response.data;
        user = normalizeUser(user);

        if (accessToken) {
            localStorage.setItem(TOKEN_KEY, accessToken);
        }

        AuthService.setCurrentUser(user);
        return user;
    },

    register: async (data: Partial<User> & { password: string }): Promise<User> => {
        // Map frontend fields to backend expectation if needed (e.g. firstName+lastName -> name)
        // Backend expects 'name', 'email', 'password', 'role'.
        const payload = {
            name: `${data.firstName} ${data.lastName}`.trim(),
            email: data.email,
            password: data.password,
            role: data.role || 'user',
            // Backend might not accept these extra fields yet based on controller, 
            // but we send them in case the model supports them or allows flexible schema
            phone: data.phone,
            agencyName: data.agencyName,
            state: data.state,
            city: data.city
        };

        const response = await api.post('/auth/register', payload);
        let { user, accessToken } = response.data;
        user = normalizeUser(user);

        if (accessToken) {
            localStorage.setItem(TOKEN_KEY, accessToken);
        }

        AuthService.setCurrentUser(user);
        return user;
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        // Optional: Call backend logout if endpoint exists
    },

    getCurrentUser: async (): Promise<User | null> => {
        try {
            // First check local storage for immediate UI render (optimistic)
            const stored = localStorage.getItem(USER_KEY);
            let optimisticUser = stored ? JSON.parse(stored) : null;

            // Self-heal: Normalize optimistic user
            if (optimisticUser) {
                optimisticUser = normalizeUser(optimisticUser);
            }

            // Verify with backend
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) return optimisticUser;

            const response = await api.get('/auth/me');
            let user = response.data.user;
            user = normalizeUser(user);

            AuthService.setCurrentUser(user);
            return user;
        } catch (error) {
            console.warn('Failed to validate session', error);
            // If backend says 401, clear session
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            return null;
        }
    },

    // Helper to sync user state to localStorage
    setCurrentUser: (user: User) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    // TODO: Implement backend endpoint for profile update
    updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
        const payload = { ...data };
        if (data.firstName || data.lastName) {
            payload.name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        }
        const response = await api.put('/auth/me', payload);
        let updatedUser = response.data.user;
        updatedUser = normalizeUser(updatedUser);

        // Update local storage
        AuthService.setCurrentUser(updatedUser);

        return updatedUser;
    },

    resetPassword: async (email: string): Promise<void> => {
        await api.post('/auth/forgot-password', { email });
    },
    deleteAccount: async (): Promise<void> => {
        await api.delete('/auth/me');
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }
};
