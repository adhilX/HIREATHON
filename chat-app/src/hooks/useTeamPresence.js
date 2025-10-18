import { useState, useEffect, useCallback } from 'react';
import { getUsersPresence, getUserPresence } from '../services/rocketchat';

export const useTeamPresence = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all users and their presence
  const fetchTeamPresence = useCallback(async () => {
    try {
      setError(null);
      const result = await getUsersPresence();
      
      if (result.success) {
        // Filter out bots and inactive users, add presence status
        const activeUsers = result.users
          .filter(user => user.type !== 'bot' && user.active !== false)
          .map(user => ({
            ...user,
            status: user.status || 'offline',
            statusText: user.statusText || '',
            lastLogin: user.lastLogin,
            utcOffset: user.utcOffset || 0,
          }));
        
        setUsers(activeUsers);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch team presence');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update specific user presence
  const updateUserPresence = useCallback(async (userId) => {
    try {
      const result = await getUserPresence(userId);
      if (result.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, status: result.presence }
              : user
          )
        );
      }
    } catch (err) {
      console.error('Failed to update user presence:', err);
    }
  }, []);

  // Get status color for UI
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  }, []);

  // Get status text
  const getStatusText = useCallback((status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Do Not Disturb';
      case 'offline':
      default:
        return 'Offline';
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTeamPresence();
  }, [fetchTeamPresence]);

  // Poll for presence updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTeamPresence();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchTeamPresence]);

  return {
    users,
    loading,
    error,
    refetch: fetchTeamPresence,
    updateUserPresence,
    getStatusColor,
    getStatusText,
  };
};
