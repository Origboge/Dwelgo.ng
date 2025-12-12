import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Building2, ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', { token, newPassword: password });
            setIsSubmitted(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired token.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
            {/* Left Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
                <img
                    src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                    alt="Modern Apartment"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center">
                    <h2 className="text-4xl font-bold mb-6">Welcome Back</h2>
                    <p className="text-lg text-gray-200">Set a new secure password to access your account.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-900">
                <div className="w-full max-w-md bg-white dark:bg-slate-950 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">

                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6 lg:hidden">
                            <Building2 className="text-zillow-600" size={32} />
                        </Link>
                        <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">New Password</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Please create a new password for your account.</p>
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100 flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <Input
                                label="New Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<Lock size={18} />}
                                required
                            />

                            <Input
                                label="Confirm New Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<Lock size={18} />}
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full h-11"
                                disabled={isLoading}
                                variant="primary"
                            >
                                {isLoading ? 'Reseting...' : 'Set New Password'}
                            </Button>

                            <div className="text-center mt-6">
                                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center gap-2">
                                    <ArrowLeft size={16} /> Back to Sign In
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Password Reset!</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    Your password has been updated successfully.
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => navigate('/login')}
                            >
                                Go to Login
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
