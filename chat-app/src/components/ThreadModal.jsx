import React, { useState, useEffect, useRef } from 'react';
import { 
  HiXMark, 
  HiChatBubbleLeftRight, 
  HiPaperAirplane,
  HiUsers,
  HiClock
} from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage } from '../services';
import Message from './Message';
import '../styles/scrollbar.css';

const ThreadModal = ({ 
  isOpen, 
  onClose, 
  parentMessage, 
  threadReplies = [], 
  onNewReply,
  roomId 
}) => {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const repliesEndRef = useRef(null);

  // Auto-scroll to bottom when new replies are added
  useEffect(() => {
    if (repliesEndRef.current) {
      repliesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [threadReplies]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim() || sending) return;

    setSending(true);
    setError('');

    // Create temporary reply for immediate display
    const tempReply = {
      _id: `temp-reply-${Date.now()}`,
      msg: replyText.trim(),
      ts: new Date(),
      u: {
        _id: user._id,
        username: user.username || user.name || 'You',
        name: user.name || user.username || 'You'
      },
      rid: roomId,
      tmid: parentMessage._id, // Thread message ID
      _updatedAt: new Date(),
      isThreadReply: true
    };

    // Add temporary reply immediately
    onNewReply(tempReply);
    setReplyText('');

    try {
      // Send the actual reply (you may need to implement thread-specific API)
      const result = await sendMessage(roomId, replyText.trim(), parentMessage._id);
      
      if (!result.success) {
        setError(result.error || 'Failed to send reply');
        // Remove temporary reply on error
        // You might want to implement a way to remove temp messages
      }
    } catch (err) {
      console.error('Error sending thread reply:', err);
      setError('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply(e);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen || !parentMessage) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`ml-auto w-full max-w-md h-full bg-black border-l border-gray-800 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <HiChatBubbleLeftRight className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Thread</h3>
              <p className="text-xs text-gray-400">
                {threadReplies.length} {threadReplies.length === 1 ? 'reply' : 'replies'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Parent Message */}
        <div className="flex-shrink-0 p-4 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {(parentMessage.u?.name || parentMessage.u?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-green-400 text-sm">
                  {parentMessage.u?.name || parentMessage.u?.username || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(parentMessage.ts)}
                </span>
              </div>
              <p className="text-white text-sm leading-relaxed">
                {parentMessage.msg}
              </p>
            </div>
          </div>
        </div>

        {/* Thread Replies */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 message-scrollbar min-h-0">
          {threadReplies.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <HiChatBubbleLeftRight className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">No replies yet</p>
              <p className="text-gray-500 text-xs mt-1">Be the first to reply!</p>
            </div>
          ) : (
            threadReplies.filter(reply => reply && reply._id).map((reply, index) => {
              const isOwn = reply.u?._id === user?._id;
              return (
                <div key={reply._id || `reply-${index}`} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {(reply.u?.name || reply.u?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-blue-400 text-sm">
                        {reply.u?.name || reply.u?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(reply.ts)}
                      </span>
                      {/* {reply._id && reply._id.startsWith('temp-') && (
                        <span className="text-xs text-yellow-400">Sending...</span>
                      )} */}
                    </div>
                    <div className={`inline-block px-3 py-2 rounded-lg text-sm ${
                      isOwn 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/10 text-white border border-white/20'
                    }`}>
                      {reply.msg}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={repliesEndRef} />
        </div>

        {/* Reply Input */}
        <div className="flex-shrink-0 p-4 border-t border-gray-800">
          {error && (
            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSendReply} className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Reply to thread..."
                disabled={sending}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                rows="2"
              />
            </div>
            <button
              type="submit"
              disabled={!replyText.trim() || sending}
              className={`p-2 rounded-lg transition-all duration-300 ${
                !replyText.trim() || sending
                  ? 'bg-white/20 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/30'
              }`}
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <HiPaperAirplane className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ThreadModal;
