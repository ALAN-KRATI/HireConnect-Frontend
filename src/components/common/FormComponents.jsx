import React from 'react';

// Error message component with professional styling
export const ErrorMessage = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`flex items-center gap-2 mt-1 text-sm text-red-600 ${className}`}>
      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>{error}</span>
    </div>
  );
};

// Success message component
export const SuccessMessage = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-2 mt-1 text-sm text-green-600 ${className}`}>
      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  );
};

// Warning message component
export const WarningMessage = ({ warning, className = '' }) => {
  if (!warning) return null;

  return (
    <div className={`flex items-center gap-2 mt-1 text-sm text-yellow-600 ${className}`}>
      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>{warning}</span>
    </div>
  );
};

// Form field wrapper with validation
export const FormField = ({
  label,
  children,
  error,
  success,
  warning,
  required = false,
  className = '',
  helpText
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {children}
      </div>
      {helpText && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
      <ErrorMessage error={error} />
      <SuccessMessage message={success} />
      <WarningMessage warning={warning} />
    </div>
  );
};

// Input component with validation styling
export const ValidatedInput = ({
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  success,
  warning,
  className = '',
  icon,
  ...props
}) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors';
  const stateClasses = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : success
    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
    : warning
    ? 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${baseClasses} ${stateClasses} ${icon ? 'pl-10' : ''} ${className}`}
        {...props}
      />
    </div>
  );
};

// Textarea component with validation styling
export const ValidatedTextarea = ({
  value,
  onChange,
  onBlur,
  error,
  success,
  warning,
  className = '',
  rows = 4,
  ...props
}) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-vertical';
  const stateClasses = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : success
    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
    : warning
    ? 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  return (
    <textarea
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      rows={rows}
      className={`${baseClasses} ${stateClasses} ${className}`}
      {...props}
    />
  );
};

// Select component with validation styling
export const ValidatedSelect = ({
  value,
  onChange,
  onBlur,
  error,
  success,
  warning,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white';
  const stateClasses = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : success
    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
    : warning
    ? 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  return (
    <select
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={`${baseClasses} ${stateClasses} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};