import React, { useState, useEffect } from 'react';
import { getAllUsers, addUserToChannel, addUsersToChannel, getChannelMembers } from '../services';
import toast from 'react-hot-toast';

const AddUserToChannel = ({ isOpen, onClose, channel, onUserAdded }) => {
  const [users, setUsers] = useState([]);
  const [channelMembers, setChannelMembers] = useState([]);
  const [filterTerm, setFilterTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addingUsers, setAddingUsers] = useState(false);

  // Load users and channel members when modal opens
  useEffect(() => {
    if (isOpen && channel) {
      loadUsersAndMembers();
    }
  }, [isOpen, channel]);

  const loadUsersAndMembers = async () => {
    setLoading(true);
    setError('');

    try {
      const [usersResult, membersResult] = await Promise.all([
        getAllUsers(),
        getChannelMembers(channel._id)
      ]);

      if (usersResult.success) {
        console.log('Loaded users:', usersResult.users);
        setUsers(usersResult.users);
      } else {
        console.error('Failed to load users:', usersResult.error);
        setError(usersResult.error);
        toast.error('Failed to load users');
      }

      if (membersResult.success) {
        console.log('Loaded channel members:', membersResult.members);
        setChannelMembers(membersResult.members);
      } else {
        console.error('Failed to load channel members:', membersResult.error);
        toast.error('Failed to load channel members');
      }
    } catch (err) {
      console.error('Error loading users and members:', err);
      setError('Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Filter users and exclude existing members
  const filteredUsers = users.filter(user => {
    const matchesFilter = filterTerm === '' || 
                         user.name?.toLowerCase().includes(filterTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(filterTerm.toLowerCase()) ||
                         user.emails?.[0]?.address?.toLowerCase().includes(filterTerm.toLowerCase());
    
    const isNotMember = !channelMembers.some(member => member._id === user._id);
    
    return matchesFilter && isNotMember;
  });

  const handleUserToggle = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === user._id);
      if (isSelected) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAddUsers = async () => {
    if (selectedUsers.length === 0) return;

    setAddingUsers(true);
    setError('');

    try {
      let result;
      
      if (selectedUsers.length === 1) {
        // Single user - use individual invite
        result = await addUserToChannel(channel._id, selectedUsers[0]._id);
      } else {
        // Multiple users - use bulk invite
        const userIds = selectedUsers.map(user => user._id);
        result = await addUsersToChannel(channel._id, userIds);
      }

      if (result.success) {
        // Success - notify parent and close modal
        toast.success(`Successfully added ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''} to #${channel.name}`);
        if (onUserAdded) {
          onUserAdded(selectedUsers);
        }
        handleClose();
      } else {
        setError(result.error);
        toast.error(result.error || 'Failed to add users to channel');
      }
    } catch (err) {
      console.error('Error adding users to channel:', err);
      setError('Failed to add users to channel');
      toast.error('Failed to add users to channel');
    } finally {
      setAddingUsers(false);
    }
  };

  const handleClose = () => {
    setFilterTerm('');
    setSelectedUsers([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Add Users to Channel</h2>
            <p className="text-sm text-green-400 mt-1 truncate">#{channel?.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 sm:p-6 border-b border-gray-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="w-full px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm sm:text-base"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {selectedUsers.length > 0 && (
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">Selected users ({selectedUsers.length}):</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {selectedUsers.map(user => (
                  <span
                    key={user._id}
                    className="inline-flex items-center px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 text-xs sm:text-sm rounded-full border border-green-500/30"
                  >
                    <span className="truncate max-w-[100px] sm:max-w-none">{user.name || user.username}</span>
                    <button
                      onClick={() => handleUserToggle(user)}
                      className="ml-1 sm:ml-2 text-green-300 hover:text-white flex-shrink-0"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">👥</div>
              <p className="text-gray-400">
                {filterTerm ? 'No users found matching your filter' : 'All users are already members of this channel'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(user => {
                const isSelected = selectedUsers.some(u => u._id === user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => handleUserToggle(user)}
                    className={`flex items-center p-2 sm:p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs sm:text-sm">
                          {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-white truncate">
                          {user.name || user.username}
                        </p>
                        {user.status && (
                          <span className={`ml-2 w-2 h-2 rounded-full ${
                            user.status === 'online' ? 'bg-green-500' : 
                            user.status === 'away' ? 'bg-yellow-500' : 
                            user.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                          }`}></span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">@{user.username}</p>
                      {user.emails?.[0]?.address && (
                        <p className="text-xs text-gray-500 truncate hidden sm:block">{user.emails[0].address}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-white/20'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            disabled={addingUsers}
          >
            Cancel
          </button>
          <button
            onClick={handleAddUsers}
            disabled={selectedUsers.length === 0 || addingUsers}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center hover:shadow-lg hover:shadow-green-500/30"
          >
            {addingUsers && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {addingUsers ? 'Adding...' : `Add ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserToChannel;
