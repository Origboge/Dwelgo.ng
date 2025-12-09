import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Building2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await resetPassword(email);
            setIsSubmitted(true);
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
            {/* Left Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
                <img
                    src="https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                    alt="Modern Interior"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center">
                    <h2 className="text-4xl font-bold mb-6">Secure & Seamless</h2>
                    <p className="text-lg text-gray-200">Reset your password to regain access to your saved homes.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-900">
                <div className="w-full max-w-md bg-white dark:bg-slate-950 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">

                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6 lg:hidden">
                            <Building2 className="text-zillow-600" size={32} />
                        </Link>
                        <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Reset Password</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your email to receive reset instructions</p>
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Ex. sarah@example.com"
                                icon={<Mail size={18} />}
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full h-11"
                                disabled={isLoading}
                                variant="primary"
                            >
                                {isLoading ? 'Sending Instructions...' : 'Reset Password'}
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
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Check your email</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    We have sent password reset instructions to <strong>{email}</strong>
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Resend Email
                            </Button>
                            <div>
                                <Link to="/login" className="text-sm font-bold text-zillow-600 hover:underline">
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
