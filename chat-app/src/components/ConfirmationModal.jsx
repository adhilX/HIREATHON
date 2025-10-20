import React from 'react';
import { HiExclamationTriangle, HiXMark } from 'react-icons/hi2';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // "danger", "warning", "info"
  loading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-400',
          confirmButton: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
          iconBg: 'bg-red-500/10'
        };
      case 'warning':
        return {
          icon: 'text-yellow-400',
          confirmButton: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
          iconBg: 'bg-yellow-500/10'
        };
      case 'info':
        return {
          icon: 'text-blue-400',
          confirmButton: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
          iconBg: 'bg-blue-500/10'
        };
      default:
        return {
          icon: 'text-red-400',
          confirmButton: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
          iconBg: 'bg-red-500/10'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className={`p-1.5 sm:p-2 rounded-full ${styles.iconBg} flex-shrink-0`}>
              <HiExclamationTriangle className={`w-5 h-5 sm:w-6 sm:h-6 ${styles.icon}`} />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white truncate">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
            disabled={loading}
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-700 bg-gray-800/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white ${styles.confirmButton} disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900`}
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
