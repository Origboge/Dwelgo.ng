import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zillow-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] relative overflow-hidden group';
  
  const variants = {
    // Primary is now solid Zillow Blue
    primary: 'bg-zillow-600 text-white hover:bg-zillow-700 shadow-md border border-transparent',
    // Secondary is basically same as primary or could be white
    secondary: 'bg-white text-zillow-600 border border-zillow-600 hover:bg-zillow-50',
    outline: 'bg-transparent border border-gray-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/40',
    ghost: 'text-zillow-600 hover:text-zillow-700 hover:bg-zillow-50 dark:text-zillow-400 dark:hover:bg-zillow-900/20',
    glass: 'bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20',
    // Glow updated to blue
    glow: 'bg-zillow-600 text-white shadow-lg shadow-zillow-600/30 hover:shadow-zillow-600/50 hover:bg-zillow-700 border border-transparent',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center">{children}</span>
    </button>
  );
};