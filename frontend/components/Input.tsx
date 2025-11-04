import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & { 
  label: string; 
  error?: string;
  icon?: React.ReactNode;
};

export const Input: React.FC<Props> = ({ label, error, icon, className = '', ...rest }) => (
  <div className="mb-6">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className="text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        </div>
      )}
      <input 
        className={`
          w-full px-4 py-3 ${icon ? 'pl-10' : ''} 
          bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600 
          rounded-lg shadow-sm
          text-gray-900 dark:text-gray-100
          placeholder-gray-500 dark:placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...rest} 
      />
    </div>
    {error && (
      <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);


