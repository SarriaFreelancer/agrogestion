import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || Math.random().toString(36).substr(2, 9);
  
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm
            dark:bg-gray-800 dark:border-gray-600 dark:text-white
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : 'pl-3'}
            ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
