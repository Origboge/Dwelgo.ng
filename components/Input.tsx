import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative group">
        <input
          className={`
            w-full px-4 py-3 rounded-md border transition-all duration-200 outline-none
            bg-white dark:bg-slate-900 
            text-slate-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-600
            ${icon ? 'pl-11' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
              : 'border-gray-300 dark:border-slate-700 focus:border-zillow-600 focus:ring-1 focus:ring-zillow-600 hover:border-gray-400'
            }
            ${className}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-zillow-600 transition-colors pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};