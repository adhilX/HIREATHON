import { useState, useEffect, useCallback } from 'react';

export const useGlobalSearch = (onOpenSearch) => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event) => {
    // Ctrl+K or Cmd+K to open search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      console.log('Ctrl+K pressed - opening search');
      event.preventDefault();
      setIsOpen(true);
      if (onOpenSearch) {
        onOpenSearch();
      }
    }
    
    // Escape to close
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen, onOpenSearch]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const open = useCallback(() => {
    setIsOpen(true);
    if (onOpenSearch) {
      onOpenSearch();
    }
  }, [onOpenSearch]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    open,
    close
  };
};
