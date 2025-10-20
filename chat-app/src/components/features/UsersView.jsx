import React from 'react';
import { useUsersPresence } from '../../hooks/useUsersPresence';
import { useAuth } from '../../contexts/AuthContext';
import { HiArrowPath } from 'react-icons/hi2';

const UsersView = () => {
  const { users, loading, error, refetch, getStatusColor, getStatusText } = useUsersPresence();
  const { user: currentUser } = useAuth();

  if (loading) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Users</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Users Status</h2>
            <p className="text-gray-400 mt-1">Real-time user presence and availability</p>
          </div>
          <button 
            onClick={refetch}
            disabled={loading}
            className="p-2 text-white hover:text-white hover:bg-green-500 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50"
            title="Refresh users status"
          >
            <HiArrowPath className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-green smooth-scroll">
        <div className="p-6">
          {/* Users List */}
          <div className="space-y-3">
            {users.filter((user) => user._id !== currentUser._id).map((user) => (
              <div 
                key={user._id} 
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      {/* Status Indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${getStatusColor(user.status)}`}></div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white">
                          {user.name || user.username}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-sm">@{user.username}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`}></div>
                      <span className="text-sm text-gray-300 capitalize">
                        {getStatusText(user.status)}
                      </span>
                    </div>
                    {user.lastLogin && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last seen: {new Date(user.lastLogin).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
              <p className="text-gray-400">
                Users will appear here when they come online
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersView;
