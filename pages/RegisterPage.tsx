import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mail, Lock, User as UserIcon, Building, Phone, AlertCircle, Building2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<'user' | 'agent'>('user');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agencyName: ''
  });
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('role') === 'agent') {
      setRole('agent');
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (role === 'agent' && !formData.agencyName) {
      setError('Agency Name is required for agents');
      return;
    }

    try {
      await register({
        ...formData,
        role
      });
      navigate('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-blue-900">
        <img 
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
            alt="Modern House" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center">
            <h2 className="text-4xl font-bold mb-6">Find your place.</h2>
            <p className="text-lg text-gray-200">Join millions of people finding their next home on PropertyHub.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-900">
        <div className="w-full max-w-lg bg-white dark:bg-slate-950 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
          <div className="text-center mb-8">
             <Link to="/" className="inline-flex items-center gap-2 mb-6 lg:hidden">
              <Building2 className="text-zillow-600" size={32} />
            </Link>
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Create an account</h1>
          </div>

          {/* Role Toggle */}
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-md flex mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded transition-all flex items-center justify-center gap-2 ${
                role === 'user' 
                  ? 'bg-white dark:bg-slate-700 text-zillow-600 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
              onClick={() => setRole('user')}
            >
              Buyer / Renter
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded transition-all flex items-center justify-center gap-2 ${
                role === 'agent' 
                  ? 'bg-white dark:bg-slate-700 text-zillow-600 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
              onClick={() => setRole('agent')}
            >
              Agent / Landlord
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-md flex items-center text-red-600 dark:text-red-400 text-sm font-medium">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Input 
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
              <Input 
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
              />
            </div>

            <Input 
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              required
            />

            <Input 
              label="Phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />

            {role === 'agent' && (
              <div className="p-4 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
                <Input 
                  label="Brokerage / Agency Name"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  placeholder="e.g. Century 21"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                required
              />
              <Input 
                label="Confirm"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6 h-10"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Submit'}
            </Button>
            
            <p className="text-xs text-slate-500 text-center mt-4">
                By submitting, I accept PropertyHub's Terms of Use.
            </p>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-zillow-600 hover:text-zillow-800 font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};