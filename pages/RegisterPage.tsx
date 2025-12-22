import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mail, Lock, User as UserIcon, Building, Phone, AlertCircle, Building2, Eye, EyeOff, MapPin } from 'lucide-react';
import { NIGERIA_LOCATIONS } from '../nigeriaLocations';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<'user' | 'agent'>('user');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agencyName: '',
    state: '',
    city: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const availableCities = formData.state ? NIGERIA_LOCATIONS[formData.state as keyof typeof NIGERIA_LOCATIONS] || [] : [];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('role') === 'agent') {
      setRole('agent');
    }
  }, [location]);

  // Prevent scroll jump during submission
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const phoneRegex = /^(?:\+234|0)[789]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please provide a valid Nigerian phone number (e.g. 080... or +234...)');
      return;
    }

    if (role === 'agent' && !formData.agencyName) {
      setError('Agency Name is required for agents');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the Terms and Conditions to sign up.');
      return;
    }
    try {
      await register({
        ...formData,
        role
      });
      const params = new URLSearchParams(location.search);
      const redirectPath = params.get('redirect');
      navigate(redirectPath || '/');
    } catch (err: any) {
      const backendError = err.response?.data?.message;
      if (backendError === 'Email already registered') {
        setError('This email is already in use. Try signing in or use another email.');
      } else if (backendError) {
        setError(backendError);
      } else {
        setError('Registration failed. Please check your connection or try again.');
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
              <UserIcon className="animate-pulse" size={32} />
            </div>
          </div>
          <p className="mt-8 text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">Creating <span className="text-zillow-600">Account</span></p>
        </div>
      )}
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-blue-900">
        <img
          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          alt="Modern House"
          className="w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center">
          <h2 className="text-4xl font-bold mb-6">Find your place.</h2>
          <p className="text-lg text-gray-200">Join millions of people finding their next home on Dwelgo.ng.</p>
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
              className={`flex-1 py-2 text-sm font-semibold rounded transition-all flex items-center justify-center gap-2 ${role === 'user'
                ? 'bg-white dark:bg-slate-700 text-zillow-600 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              onClick={() => setRole('user')}
            >
              Buyer / Renter
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded transition-all flex items-center justify-center gap-2 ${role === 'agent'
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
                icon={<UserIcon size={18} />}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                icon={<UserIcon size={18} />}
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
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              icon={<Phone size={18} />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
                <div className="relative">
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-zillow-500 focus:border-zillow-500 sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none"
                    required
                  >
                    <option value="">Select State</option>
                    {Object.keys(NIGERIA_LOCATIONS).map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="relative">
                <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                <div className="relative">
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-zillow-500 focus:border-zillow-500 sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none"
                    required
                    disabled={!formData.state}
                  >
                    <option value="">Select City</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {role === 'agent' && (
              <div className="p-4 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
                <Input
                  label="Brokerage / Agency Name"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  placeholder="e.g. Century 21"
                  icon={<Building size={18} />}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
                icon={<Lock size={18} />}
                rightIcon={
                  <div onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                }
              />
              <Input
                label="Confirm"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                required
                icon={<Lock size={18} />}
                rightIcon={
                  <div onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                }
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

            <div className="mt-4 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-zillow-600 focus:ring-zillow-500 cursor-pointer"
              />
              <label htmlFor="terms" className="cursor-pointer">
                I agree to the {' '}
                <Link to="/terms" target="_blank" className="text-zillow-600 hover:text-zillow-800 font-bold underline">
                  Terms and Conditions
                </Link>
                {' '} of PropertyHub.
              </label>
            </div>
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