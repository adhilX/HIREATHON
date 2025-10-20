import React, { useState, useRef, useEffect } from 'react';
import { editMessage, deleteMessage, pinMessage, unpinMessage } from '../services';
import { HiBookmark, HiPencil, HiTrash, HiEllipsisVertical, HiChatBubbleLeftRight } from 'react-icons/hi2';
import ConfirmationModal from './ConfirmationModal';
import './Message.css';
import toast from 'react-hot-toast';

const Message = ({ message, isOwn, onMessageUpdate, roomId, onStartThread, threadReplyCount = 0 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.msg || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatTime = (timestamp) => {
    // Handle cases where timestamp might be missing or invalid
    if (!timestamp) return 'Sending...';
    
    const date = new Date(timestamp);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Sending...';
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toDateString();
  };

  const shouldShowDate = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = getMessageDate(currentMessage.ts);
    const previousDate = getMessageDate(previousMessage.ts);
    
    return currentDate !== previousDate;
  };

  const handleEdit = async () => {
    if (!editText.trim() || editText === message.msg) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await editMessage(message._id, editText.trim(), roomId);
      if (result.success) {
        setIsEditing(false);
        if (onMessageUpdate) {
          onMessageUpdate(message._id, editText.trim());
        }
        toast.success('✏️ Message edited successfully!');
      } else {
        console.error('Failed to edit message:', result.error);
        toast.error('Failed to edit message');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Error editing message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setShowDropdown(false);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteMessage(message._id, roomId);
      if (result.success) {
        if (onMessageUpdate) {
          onMessageUpdate(message._id, null, true); // null text, true for delete
        }
        toast.success('🗑️ Message deleted successfully!');
        setShowDeleteConfirm(false);
      } else {
        console.error('Failed to delete message:', result.error);
        toast.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Error deleting message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(message.msg || '');
    }
  };

  const startEdit = () => {
    setIsEditing(true);
    setEditText(message.msg || '');
  };

  const handlePin = async () => {
    setIsLoading(true);
    try {
      const result = message.pinned 
        ? await unpinMessage(message._id)
        : await pinMessage(message._id);
      
      if (result.success) {
        if (onMessageUpdate) {
          onMessageUpdate(message._id, message.msg, false, !message.pinned);
        }
        
        // Show success toast
        if (message.pinned) {
          toast.success('📌 Message unpinned successfully!');
        } else {
          toast.success('📌 Message pinned successfully!');
        }
      } else {
        console.error('Failed to pin/unpin message:', result.error);
            toast.error(`Failed to ${message.pinned ? 'unpin' : 'pin'} message`);
      }
    } catch (error) {
      console.error('Error pinning/unpinning message:', error);
      toast.error(`Error ${message.pinned ? 'unpinning' : 'pinning'} message`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      id={`message-${message._id}`}
      className={`group flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 transition-all duration-200 px-2 sm:px-0`}
    >
      <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? 'order-1' : 'order-2'}`}>
        <div className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg transition-all duration-200 ${
          isOwn 
            ? 'bg-green-500 text-white ml-auto' 
            : 'bg-white/10 text-white border border-white/20 backdrop-blur-sm'
        }`}>
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="flex items-center min-w-0 flex-1">
              {!isOwn && (
                <span className="text-xs font-medium text-green-400 truncate">
                  {message.u?.name || message.u?.username || message.username || 'Unknown User'}
                </span>
              )}
              {message.pinned && (
                <HiBookmark className={`w-3 h-3 ${!isOwn ? 'ml-1' : ''} inline flex-shrink-0`} />
              )}
            </div>
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 text-gray-500 hover:text-white hover:bg-white/20 rounded transition-all duration-200 group-hover:text-gray-300"
                title="Message options"
              >
                <HiEllipsisVertical className="w-4 h-4" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-8 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg py-1 min-w-[140px] sm:min-w-[160px] z-10">
                  <button
                    onClick={() => {
                      onStartThread && onStartThread();
                      setShowDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
                  >
                    <HiChatBubbleLeftRight className="w-4 h-4" />
                    <span>Reply in Thread</span>
                    {threadReplyCount > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full">
                        {threadReplyCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handlePin();
                      setShowDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center space-x-2 hover:bg-white/10 transition-colors ${
                      message.pinned ? 'text-green-400' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <HiBookmark className="w-4 h-4" />
                    <span>{message.pinned ? 'Unpin' : 'Pin'}</span>
                  </button>
                  {isOwn && (
                    <>
                      <button
                        onClick={() => {
                          startEdit();
                          setShowDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
                      >
                        <HiPencil className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center space-x-2"
                      >
                        <HiTrash className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-1">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  autoFocus
                  disabled={isLoading}
                  rows="2"
                />
                <div className="flex space-x-2">
                  <button 
                    onClick={handleEdit}
                    disabled={isLoading || !editText.trim()}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(message.msg || '');
                    }}
                    disabled={isLoading}
                    className="px-3 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm leading-relaxed mb-2 break-words">{message.msg}</p>
                <div className={`text-xs text-right ${
                  isOwn ? 'text-green-100' : 'text-gray-400'
                }`}>
                  {formatTime(message.ts || message._updatedAt || message.createdAt)}
                  {message.editedAt && <span className="ml-1 opacity-75">(edited)</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        type="danger"
        loading={isLoading}
        confirmText="Delete Message"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Message;

