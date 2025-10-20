import { useState, useEffect, useCallback } from 'react';
import { getUsersPresence, getUserPresence } from '../services';

export const useUsersPresence = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all users and their presence
  const fetchUsersPresence = useCallback(async () => {
    try {
      setError(null);
      
      const result = await getUsersPresence();
      
      if (result.success) {
        // Process users and add default status
        const processedUsers = result.users.map((user) => ({
          ...user,
          status: user.status || user.statusText || 'online',
          lastLogin: user.lastLogin || user._updatedAt || null
        }));
        
        setUsers(processedUsers);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch users presence');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a specific user's presence
  const updateUserPresence = useCallback((userId, presence) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user._id === userId 
          ? { ...user, status: presence.status, lastLogin: presence.lastLogin }
          : user
      )
    );
  }, []);

  // Get status color for UI
  const getStatusColor = useCallback((status) => {
    if (!status) return 'bg-gray-500';
    
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'online':
      case 'active':
        return 'bg-green-500';
      case 'away':
      case 'idle':
        return 'bg-yellow-500';
      case 'busy':
      case 'dnd':
      case 'do not disturb':
        return 'bg-red-500';
      case 'offline':
      case 'invisible':
      default:
        return 'bg-gray-500';
    }
  }, []);

  // Get status text for UI
  const getStatusText = useCallback((status) => {
    if (!status) return 'Offline';
    
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'online':
      case 'active':
        return 'Online';
      case 'away':
      case 'idle':
        return 'Away';
      case 'busy':
      case 'dnd':
      case 'do not disturb':
        return 'Busy';
      case 'offline':
      case 'invisible':
      default:
        return 'Offline';
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUsersPresence();
  }, [fetchUsersPresence]);

  // Poll for presence updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsersPresence();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUsersPresence]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsersPresence,
    updateUserPresence,
    getStatusColor,
    getStatusText,
  };
};
