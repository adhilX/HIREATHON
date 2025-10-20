import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 flex items-center space-x-3 max-w-sm";
    
    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`;
    }

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white translate-x-0 opacity-100`;
      case 'error':
        return `${baseStyles} bg-red-500 text-white translate-x-0 opacity-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white translate-x-0 opacity-100`;
      case 'info':
        return `${baseStyles} bg-blue-500 text-white translate-x-0 opacity-100`;
      default:
        return `${baseStyles} bg-gray-500 text-white translate-x-0 opacity-100`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📌';
    }
  };

  return (
    <div className={getToastStyles()}>
      <span className="text-lg">{getIcon()}</span>
      <span className="flex-1 font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="text-white hover:text-gray-200 transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
