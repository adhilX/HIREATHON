import React, { useState, useEffect } from 'react';
import { getChannelMembers, removeUserFromChannel, addChannelModerator, removeChannelModerator } from '../services';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import toast from 'react-hot-toast';

const ChannelMembers = ({ isOpen, onClose, channel }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null,
    loading: false
  });

  useEffect(() => {
    if (isOpen && channel) {
      loadMembers();
    }
  }, [isOpen, channel]);

  const loadMembers = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getChannelMembers(channel._id);
      if (result.success) {
        setMembers(result.members);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load channel members');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToModerator = (userId, userName) => {
    const memberToPromote = members.find(m => m._id === userId);
    
    setConfirmationModal({
      isOpen: true,
      type: 'info',
      title: 'Promote to Moderator',
      message: `Are you sure you want to promote "${userName || memberToPromote?.username || 'this user'}" to moderator in #${channel.name}? They will gain additional permissions.`,
      confirmText: 'Promote',
      onConfirm: () => confirmPromoteToModerator(userId),
      loading: false
    });
  };

  const confirmPromoteToModerator = async (userId) => {
    setConfirmationModal(prev => ({ ...prev, loading: true }));
    setActionLoading(prev => ({ ...prev, [userId]: 'promoting' }));
    
    try {
      const result = await addChannelModerator(channel._id, userId);
      if (result.success) {
        toast.success('User promoted to moderator successfully');
        // Refresh members list to show updated roles
        await loadMembers();
        setConfirmationModal(prev => ({ ...prev, isOpen: false, loading: false }));
      } else {
        setError(result.error);
        toast.error(result.error || 'Failed to promote user to moderator');
        setConfirmationModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Error promoting user:', err);
      setError('Failed to promote user to moderator');
      toast.error('Failed to promote user to moderator');
      setConfirmationModal(prev => ({ ...prev, loading: false }));
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const handleRemoveModerator = (userId, userName) => {
    const memberToDemote = members.find(m => m._id === userId);
    
    setConfirmationModal({
      isOpen: true,
      type: 'warning',
      title: 'Remove Moderator Role',
      message: `Are you sure you want to remove moderator privileges from "${userName || memberToDemote?.username || 'this user'}" in #${channel.name}? They will lose their moderator permissions.`,
      confirmText: 'Remove Role',
      onConfirm: () => confirmRemoveModerator(userId),
      loading: false
    });
  };

  const confirmRemoveModerator = async (userId) => {
    setConfirmationModal(prev => ({ ...prev, loading: true }));
    setActionLoading(prev => ({ ...prev, [userId]: 'demoting' }));
    
    try {
      const result = await removeChannelModerator(channel._id, userId);
      if (result.success) {
        toast.success('Moderator role removed successfully');
        // Refresh members list to show updated roles
        await loadMembers();
        setConfirmationModal(prev => ({ ...prev, isOpen: false, loading: false }));
      } else {
        setError(result.error);
        toast.error(result.error || 'Failed to remove moderator role');
        setConfirmationModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Error removing moderator:', err);
      setError('Failed to remove moderator role');
      toast.error('Failed to remove moderator role');
      setConfirmationModal(prev => ({ ...prev, loading: false }));
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const handleRemoveUser = (userId, userName) => {
    const memberToRemove = members.find(m => m._id === userId);
    
    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: 'Remove User from Channel',
      message: `Are you sure you want to remove "${userName || memberToRemove?.username || 'this user'}" from #${channel.name}? This action cannot be undone.`,
      confirmText: 'Remove User',
      onConfirm: () => confirmRemoveUser(userId),
      loading: false
    });
  };

  const confirmRemoveUser = async (userId) => {
    setConfirmationModal(prev => ({ ...prev, loading: true }));
    setActionLoading(prev => ({ ...prev, [userId]: 'removing' }));
    
    try {
      const result = await removeUserFromChannel(channel._id, userId);
      if (result.success) {
        toast.success('User removed from channel successfully');
        // Refresh members list
        await loadMembers();
        // Close confirmation modal
        setConfirmationModal(prev => ({ ...prev, isOpen: false, loading: false }));
      } else {
        setError(result.error);
        toast.error(result.error || 'Failed to remove user from channel');
        setConfirmationModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Error removing user:', err);
      setError('Failed to remove user from channel');
      toast.error('Failed to remove user from channel');
      setConfirmationModal(prev => ({ ...prev, loading: false }));
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const getRoleDisplay = (member) => {
    if (member.roles?.includes('owner')) return 'Owner';
    if (member.roles?.includes('moderator')) return 'Moderator';
    return 'Member';
  };

  const getRoleBadgeColor = (member) => {
    if (member.roles?.includes('owner')) return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    if (member.roles?.includes('moderator')) return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    return 'bg-green-500/20 text-green-400 border border-green-500/30';
  };

  const canManageUser = (member) => {
    // Can't manage yourself or owners
    if (member._id === user._id || member.roles?.includes('owner')) {
      return false;
    }
    
    // Find current user's role in this channel
    const currentUserMember = members.find(m => m._id === user._id);
    const currentUserRoles = currentUserMember?.roles || [];
    
    // Only owners and moderators can manage members
    const canManage = currentUserRoles.includes('owner') || currentUserRoles.includes('moderator');
    
    return canManage;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Channel Members</h2>
            <p className="text-sm text-green-400 mt-1 truncate">#{channel?.name} • {members.length} members</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">👥</div>
              <p className="text-gray-400">No members found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map(member => {
                const isCurrentUser = member._id === user._id;
                const currentAction = actionLoading[member._id];
                
                return (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors gap-3"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-xs sm:text-sm">
                            {(member.name || member.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <p className="text-sm font-medium text-white truncate">
                            {member.name || member.username}
                            {isCurrentUser && <span className="text-gray-400 ml-1">(You)</span>}
                          </p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full self-start ${getRoleBadgeColor(member)}`}>
                            {getRoleDisplay(member)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 truncate">@{member.username}</p>
                        {member.status && (
                          <div className="flex items-center mt-1">
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              member.status === 'online' ? 'bg-green-500' : 
                              member.status === 'away' ? 'bg-yellow-500' : 
                              member.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                            }`}></span>
                            <span className="text-xs text-gray-500 capitalize">{member.status}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {canManageUser(member) && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                        {/* Moderator Actions - Only show if current user is owner or moderator */}
                        {(() => {
                          const currentUserMember = members.find(m => m._id === user._id);
                          const currentUserRoles = currentUserMember?.roles || [];
                          const isOwner = currentUserRoles.includes('owner');
                          const isModerator = currentUserRoles.includes('moderator');
                          
                          // If user is already a moderator, show remove button (only for owners)
                          if (member.roles?.includes('moderator')) {
                            return isOwner ? (
                              <button
                                onClick={() => handleRemoveModerator(member._id, member.name || member.username)}
                                disabled={currentAction}
                                className="px-2 sm:px-3 py-1 text-xs font-medium text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                              >
                                {currentAction === 'demoting' ? 'Removing...' : 'Remove Mod'}
                              </button>
                            ) : null;
                          }
                          
                          // If user is not a moderator, show make mod button (only for owners)
                          return isOwner ? (
                            <button
                              onClick={() => handlePromoteToModerator(member._id, member.name || member.username)}
                              disabled={currentAction}
                              className="px-2 sm:px-3 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {currentAction === 'promoting' ? 'Promoting...' : 'Make Mod'}
                            </button>
                          ) : null;
                        })()}

                        {/* Remove User */}
                        <button
                          onClick={() => handleRemoveUser(member._id, member.name || member.username)}
                          disabled={currentAction}
                          className="px-2 sm:px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {currentAction === 'removing' ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 sm:p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        loading={confirmationModal.loading}
        confirmText={confirmationModal.confirmText}
        cancelText="Cancel"
      />
    </div>
  );
};

export default ChannelMembers;
