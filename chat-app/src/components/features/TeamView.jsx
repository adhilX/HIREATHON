import React, { useState } from 'react';
import { useTeamPresence } from '../../hooks/useTeamPresence';
import { setUserPresence } from '../../services/rocketchat';
import { useAuth } from '../../contexts/AuthContext';

const TeamView = () => {
  const { users, loading, error, refetch, getStatusColor, getStatusText } = useTeamPresence();
  const { user: currentUser } = useAuth();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Handle status change for current user
  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const result = await setUserPresence(newStatus);
      if (result.success) {
        // Refresh the team presence to get updated status
        await refetch();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Format last seen time
  const formatLastSeen = (lastLogin) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading team</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={refetch}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Status</h2>
            <p className="text-gray-600 mt-1">Real-time team presence and availability</p>
          </div>
          <button 
            onClick={refetch}
            className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            🔄 Refresh
          </button>
        </div>

      {/* Current User Status Selector */}
      {currentUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-3">Your Status</h3>
          <div className="flex flex-wrap gap-2">
            {['online', 'away', 'busy'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updatingStatus}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentUser.status === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
                <span>{getStatusText(status)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div className="space-y-3">
        {users.map((user) => (
          <div 
            key={user._id} 
            className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
              </div>
              {/* Status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 border-white`}></div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900 truncate">
                  {user.name || user.username}
                </h4>
                {user._id === currentUser?._id && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`text-sm font-medium ${
                  user.status === 'online' ? 'text-green-600' :
                  user.status === 'away' ? 'text-yellow-600' :
                  user.status === 'busy' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {getStatusText(user.status)}
                </span>
                {user.statusText && (
                  <span className="text-sm text-gray-500 truncate">
                    "{user.statusText}"
                  </span>
                )}
              </div>
            </div>

            {/* Last Seen */}
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {user.status === 'online' ? 'Active now' : formatLastSeen(user.lastLogin)}
              </div>
              {user.emails && user.emails[0] && (
                <div className="text-xs text-gray-400 truncate max-w-32">
                  {user.emails[0].address}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No team members found</div>
          <p className="text-gray-500 text-sm">Check your Rocket.Chat server connection</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default TeamView;
