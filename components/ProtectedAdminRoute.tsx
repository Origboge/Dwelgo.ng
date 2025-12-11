
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedAdminRoute: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Must be logged in AND have role 'admin'
    if (!isAuthenticated || user?.role !== 'admin') {
        // Redirect to login if not authenticated, or home if authenticated but not admin
        // For security obscurity, sometimes we redirect to 404, but home is fine for now.
        return <Navigate to={isAuthenticated ? "/" : "/login"} replace />;
    }

    return <Outlet />;
};
