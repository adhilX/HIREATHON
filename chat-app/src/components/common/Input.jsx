import React from 'react';
import clsx from 'clsx';

const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error = false,
  label,
  helperText,
  icon,
  iconPosition = 'left',
  size = 'medium',
  className,
  ...props
}) => {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base',
  };

  const inputClasses = clsx(
    'input',
    sizeClasses[size],
    {
      'pl-10': icon && iconPosition === 'left',
      'pr-10': icon && iconPosition === 'right',
      'border-danger-300 focus:ring-danger-500 focus:border-danger-500': error,
      'opacity-50 cursor-not-allowed': disabled,
    },
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
      </div>
      {helperText && (
        <p className={clsx(
          'mt-1 text-sm',
          error ? 'text-danger-600' : 'text-gray-500'
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
