import React, { useState, useEffect } from 'react';
import { getPinnedMessages, unpinMessage } from '../services';
import { useAuth } from '../contexts/AuthContext';

const PinnedMessages = ({ isOpen, onClose, channel, isModal = true }) => {
  const { user } = useAuth();
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && channel) {
      loadPinnedMessages();
    }
  }, [isOpen, channel]);

  const loadPinnedMessages = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getPinnedMessages(channel._id);
      if (result.success) {
        setPinnedMessages(result.messages);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load pinned messages');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpin = async (messageId) => {
    try {
      const result = await unpinMessage(messageId);
      if (result.success) {
        // Remove the unpinned message from the list
        setPinnedMessages(prev => prev.filter(msg => msg._id !== messageId));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to unpin message');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatMessagePreview = (text) => {
    if (!text) return '';
    return text.length > 200 ? text.substring(0, 200) + '...' : text;
  };

  if (!isOpen) return null;

  const containerClass = isModal 
    ? "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    : "h-full flex flex-col bg-black";
    
  const contentClass = isModal
    ? "bg-black border border-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] flex flex-col"
    : "bg-black h-full flex flex-col";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Pinned Messages</h2>
            <p className="text-sm text-green-400 mt-1 truncate">#{channel?.name} • {pinnedMessages.length} pinned messages</p>
          </div>
          {isModal && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Pinned Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : pinnedMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📌</div>
              <h3 className="text-lg font-medium text-white mb-2">No Pinned Messages</h3>
              <p className="text-gray-400">
                Pin important messages to keep them easily accessible for everyone in the channel.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pinnedMessages.map((message) => (
                <div
                  key={message._id}
                  className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 sm:p-4 hover:bg-green-500/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Message Header */}
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-xs sm:text-sm">
                            {(message.u?.name || message.u?.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="font-medium text-white text-sm sm:text-base truncate">
                              {message.u?.name || message.u?.username || 'Unknown User'}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-400">
                              {formatTime(message.ts)}
                            </span>
                          </div>
                          <span className="text-green-400 text-xs sm:text-sm">📌 Pinned</span>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="bg-white/10 rounded-lg p-2 sm:p-3 border border-white/20">
                        <p className="text-white whitespace-pre-wrap text-sm sm:text-base break-words">
                          {formatMessagePreview(message.msg)}
                        </p>
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="bg-white/5 rounded-lg p-2 border border-white/10">
                                {attachment.image_url && (
                                  <img 
                                    src={attachment.image_url} 
                                    alt="Attachment" 
                                    className="max-w-xs rounded"
                                  />
                                )}
                                {attachment.title && (
                                  <div className="font-medium text-sm text-white">{attachment.title}</div>
                                )}
                                {attachment.description && (
                                  <div className="text-sm text-gray-300">{attachment.description}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleUnpin(message._id)}
                        className="p-1.5 sm:p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Unpin message"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isModal ? (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-gray-800">
            <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              💡 Tip: Hover over any message and click 📌 to pin it
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-6 border-t border-gray-800">
            <div className="text-xs sm:text-sm text-gray-400 text-center">
              💡 Tip: Hover over any message in chat and click 📌 to pin it
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinnedMessages;
