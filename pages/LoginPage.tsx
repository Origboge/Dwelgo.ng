import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Building2, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'user' | 'agent'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent scroll jump during submission
  React.useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login(email, password);

      // Enforce Role Check based on active tab
      if (activeTab === 'agent' && user.role !== 'agent') {
        throw new Error("This account is not registered as an Agent. Please use the Buyer/Renter login.");
      }
      if (activeTab === 'user' && user.role === 'agent') {
        throw new Error("This account is an Agent account. Please use the Agent login.");
      }

      const params = new URLSearchParams(location.search);
      const redirectPath = params.get('redirect');
      navigate(redirectPath || '/');
    } catch (err: any) {
      const backendMessage = err.response?.data?.message || err.message;

      if (backendMessage === 'Invalid credentials' || backendMessage === 'User not found') {
        setError('Incorrect password or email. Please try again.');
      } else if (backendMessage) {
        setError(backendMessage);
      } else {
        setError('Failed to login. Please check your connection.');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-zillow-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-zillow-600">
              <Lock className="animate-pulse" size={32} />
            </div>
          </div>
          <p className="mt-8 text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">Authenticating <span className="text-zillow-600">Account</span></p>
        </div>
      )}
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
        <img
          src={activeTab === 'user'
            ? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
            : "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          }
          alt="Modern Property"
          className="w-full h-full object-cover opacity-60 transition-opacity duration-500"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {activeTab === 'user' ? "Find your dream home" : "Manage your portfolio"}
          </h2>
          <p className="text-lg text-gray-200">
            {activeTab === 'user'
              ? "Log in to access your saved searches and contact agents directly."
              : "Access your dashboard, manage listings, and connect with potential buyers."
            }
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-900">
        <div className="w-full max-w-md bg-white dark:bg-slate-950 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">

          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 lg:hidden">
              <Building2 className="text-zillow-600" size={32} />
            </Link>
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Please select your account type securely log in.</p>
          </div>

          {/* Login Type Tabs */}
          <div className="flex p-1 bg-gray-100 dark:bg-slate-900 rounded-lg mb-8 border border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => { setActiveTab('user'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-md transition-all ${activeTab === 'user'
                ? 'bg-white dark:bg-slate-800 text-zillow-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <User size={18} /> Buyer / Renter
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('agent'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-md transition-all ${activeTab === 'agent'
                ? 'bg-white dark:bg-slate-800 text-zillow-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <Briefcase size={18} /> Agent
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100 animate-pulse">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              rightIcon={
                <div onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              }
              required
            />

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="mr-2 rounded text-zillow-600 focus:ring-zillow-600" />
                <label htmlFor="remember" className="text-slate-600 dark:text-slate-400">Remember me</label>
              </div>
              <Link to="/forgot-password" className="text-zillow-600 hover:text-zillow-800 font-medium">Forgot password?</Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? 'Signing in...' : `Sign in as ${activeTab === 'user' ? 'Buyer' : 'Agent'}`}
            </Button>

            <div className="text-center mt-6">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Don't have an account?{' '}
                <Link to="/register" className="text-zillow-600 font-bold hover:underline">
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};