import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mail, Lock, AlertCircle, Building2, UserCircle2 } from 'lucide-react';
import { MOCK_AGENTS } from '../constants';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleDemoAgentLogin = async () => {
      // Login as Sarah
      const demoAgent = MOCK_AGENTS[0];
      try {
          await login(demoAgent.email, 'password');
          navigate(`/agents/${demoAgent.id}`); // Go straight to dashboard
      } catch (e) {
          setError("Demo login failed");
      }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-zillow-600">
        <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
            alt="Real Estate" 
            className="w-full h-full object-cover opacity-80 mix-blend-multiply"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center">
            <Building2 size={64} className="mb-6" />
            <h2 className="text-4xl font-bold mb-4">Welcome to PropertyHub</h2>
            <p className="text-xl font-light max-w-md">Sign in to save your favorite homes and get instant alerts.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-900">
        <div className="w-full max-w-md bg-white dark:bg-slate-950 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 lg:hidden">
              <Building2 className="text-zillow-600" size={32} />
            </Link>
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Sign in</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Access your saved searches and homes</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-md flex items-center text-red-600 dark:text-red-400 text-sm font-medium">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
            
            <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
            />

            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                    <input type="checkbox" id="remember" className="mr-2 rounded text-zillow-600 focus:ring-zillow-600" />
                    <label htmlFor="remember" className="text-slate-600 dark:text-slate-400">Remember me</label>
                </div>
                <a href="#" className="text-zillow-600 hover:text-zillow-800 font-medium">Forgot password?</a>
            </div>

            <Button 
              type="submit" 
              className="w-full h-10"
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-950 px-2 text-slate-500 font-medium">Or connect with</span></div>
            </div>
            
            <Button 
              type="button" 
              variant="outline"
              className="w-full h-10 text-sm"
              onClick={handleDemoAgentLogin}
            >
               <UserCircle2 className="mr-2" size={18} /> Login as Agent (Demo)
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-slate-500 dark:text-slate-400">
              New to PropertyHub?{' '}
              <Link to="/register" className="text-zillow-600 hover:text-zillow-800 font-bold">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};