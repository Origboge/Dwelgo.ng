
import React, { useState, useEffect } from 'react';
import { Menu, X, Heart, Building2, LogOut, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col font-sans relative text-slate-900 dark:text-white bg-gray-50 dark:bg-slate-950">
         {children}
      </div>
    );
  }

  const handleSellClick = () => {
    if (!user) {
      navigate('/register?role=agent');
    } else if (user.role === 'agent') {
      navigate(`/agents/${user.id}`);
    } else {
      // User is logged in but not an agent
      alert("Please upgrade to an Agent account to sell properties.");
      // In a real app, this would redirect to an upgrade page
    }
  };

  const navLinks = [
    { name: 'Agents', path: '/agents' },
    { name: 'Advertise', path: '/advertise' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 py-3 shadow-sm' : 'bg-transparent border-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="flex items-center justify-center text-zillow-600 dark:text-zillow-400">
                <Building2 size={32} strokeWidth={2.5} />
              </div>
              <span className={`text-2xl font-bold tracking-tight transition-colors ${isScrolled ? 'text-zillow-600 dark:text-white' : 'text-white'}`}>
                Property<span className="font-normal">Hub</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className={`hidden lg:flex items-center gap-8 ${isScrolled ? 'text-slate-700 dark:text-gray-300' : 'text-white'}`}>
                {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="text-sm font-medium hover:text-zillow-600 dark:hover:text-zillow-400 transition-colors pb-1 border-b-2 border-transparent hover:border-zillow-600"
                    >
                    {link.name}
                    </Link>
                ))}
                {/* Special Sell Button Logic */}
                <button
                    onClick={handleSellClick}
                    className="text-sm font-medium hover:text-zillow-600 dark:hover:text-zillow-400 transition-colors pb-1 border-b-2 border-transparent hover:border-zillow-600"
                >
                    Sell
                </button>
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-4 shrink-0">
                 <button 
                  onClick={toggleTheme} 
                  className={`transition-colors hover:text-zillow-600 ${isScrolled ? 'text-slate-700 dark:text-gray-300' : 'text-white'}`}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                 </button>

                 <Link 
                   to="/saved" 
                   className={`transition-colors hover:text-zillow-600 ${isScrolled ? 'text-slate-700 dark:text-gray-300' : 'text-white'}`}
                  >
                    <Heart size={20} />
                 </Link>
                 
                 {user ? (
                   <div className="flex items-center gap-3 pl-2">
                       {/* Dashboard Link for Agents */}
                       {user.role === 'agent' && (
                         <Link to={`/agents/${user.id}`}>
                           <Button variant="ghost" size="sm" className={isScrolled ? '' : 'text-white hover:text-white hover:bg-white/20'}>
                              <LayoutDashboard size={16} className="mr-1" /> Dashboard
                           </Button>
                         </Link>
                       )}

                       <img 
                         src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`} 
                         alt={user.firstName}
                         className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                       />
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className={isScrolled ? 'text-slate-700' : 'text-white hover:bg-white/20'}
                        onClick={logout}
                      >
                        Sign Out
                     </Button>
                   </div>
                 ) : (
                   <div className="flex items-center gap-3 pl-2">
                       <Link to="/login" className={`text-sm font-bold hover:text-zillow-400 transition-colors ${isScrolled ? 'text-zillow-600 dark:text-white' : 'text-white'}`}>Sign In</Link>
                       <Link to="/register">
                        <Button variant={isScrolled ? 'primary' : 'glass'} size="sm" className="rounded-md">Get Started</Button>
                       </Link>
                   </div>
                 )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-4 lg:hidden">
              <button 
                className={`p-2 transition-colors ${isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`}
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      <div className={`lg:hidden fixed inset-0 z-[60] pointer-events-none ${mobileMenuOpen ? 'pointer-events-auto' : ''}`}>
           <div 
             className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
             onClick={() => setMobileMenuOpen(false)}
           />
           <div className={`absolute top-0 right-0 h-full w-[80%] max-w-sm bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex flex-col h-full p-6">
                 <div className="flex justify-between items-center mb-8">
                    <span className="text-xl font-bold text-zillow-600 dark:text-white">Menu</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                       <X size={24} />
                    </button>
                 </div>
                 <div className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium text-slate-900 dark:text-white hover:text-zillow-600 dark:hover:text-zillow-400 py-2 border-b border-gray-100 dark:border-gray-800"
                      >
                        {link.name}
                      </Link>
                    ))}
                    
                     <button
                        onClick={() => {
                            setMobileMenuOpen(false);
                            handleSellClick();
                        }}
                        className="text-lg font-medium text-slate-900 dark:text-white hover:text-zillow-600 dark:hover:text-zillow-400 py-2 border-b border-gray-100 dark:border-gray-800 text-left"
                    >
                        Sell
                    </button>
                    
                    {user?.role === 'agent' && (
                        <Link 
                           to={`/agents/${user.id}`}
                           onClick={() => setMobileMenuOpen(false)}
                           className="text-lg font-medium text-zillow-600 py-2 border-b border-gray-100 dark:border-gray-800"
                        >
                           My Dashboard
                        </Link>
                    )}

                    <div className="mt-4 flex items-center justify-between py-2">
                         <span className="text-slate-600 dark:text-slate-400">Dark Mode</span>
                         <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300">
                             {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                         </button>
                    </div>
                    {user ? (
                        <Button variant="outline" className="w-full justify-center mt-6" onClick={() => { logout(); setMobileMenuOpen(false); }}>Sign Out</Button>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}><Button variant="outline" className="w-full justify-center">Sign In</Button></Link>
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)}><Button variant="primary" className="w-full justify-center">Join</Button></Link>
                        </div>
                    )}
                 </div>
              </div>
           </div>
      </div>

      <main className="flex-grow pt-0">
        {children}
      </main>

      <footer className="bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
          <div className="container mx-auto px-6">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="md:col-span-1">
                   <Link to="/" className="flex items-center gap-2 mb-4">
                      <div className="text-zillow-600">
                        <Building2 size={24} />
                      </div>
                      <span className="text-xl font-bold tracking-tight text-zillow-600 dark:text-white">
                        PropertyHub
                      </span>
                   </Link>
                   <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      Leading the way in real estate excellence. Find your place with us.
                   </p>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">Real Estate</h4>
                    <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-sm">
                        <li><a href="#" className="hover:text-zillow-600 hover:underline">Browse Homes</a></li>
                        <li><a href="#" className="hover:text-zillow-600 hover:underline">Sell Your Home</a></li>
                        <li><a href="#" className="hover:text-zillow-600 hover:underline">Rentals</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
                    <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-sm">
                        <li><a href="#" className="hover:text-zillow-600 hover:underline">About Us</a></li>
                        <li><a href="#" className="hover:text-zillow-600 hover:underline">Careers</a></li>
                        <li><a href="#" className="hover:text-zillow-600 hover:underline">Help Center</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">Resources</h4>
                    <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-sm">
                        <li><a href="#" className="hover:text-zillow-600 hover:underline">Blog</a></li>
                        <li><a href="#" className="hover:text-zillow-600 hover:underline">Guides</a></li>
                        <li><a href="#" className="hover:text-zillow-600 hover:underline">Agent Finder</a></li>
                    </ul>
                </div>
             </div>
             
             <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                 <div className="flex gap-4 mb-4 md:mb-0">
                     <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                     <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                     <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                 </div>
                 <div className="text-center md:text-right">
                     <p className="text-xs text-slate-400">&copy; 2025 PropertyHub, Inc. All rights reserved.</p>
                 </div>
             </div>
             <div className="flex justify-center mt-6">
                 <img src="https://s.zillowstatic.com/pfs/static/z-logo-default.svg" className="h-0 opacity-0" alt="hidden reference" /> {/* Just to acknowledge Zillow inspiration without using their logo */}
             </div>
          </div>
      </footer>
    </div>
  );
};
