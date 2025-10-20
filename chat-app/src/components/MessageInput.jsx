import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage } from '../services';
import './MessageInput.css';

const MessageInput = ({ roomId, onNewMessage }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { authToken, userId, user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || sending) return;
    
    setSending(true);
    setError('');

    // Create a temporary message for immediate display
    const tempMessage = {
      _id: `temp-${Date.now()}`, // Temporary ID
      msg: message.trim(),
      ts: new Date(), // Current timestamp
      u: {
        _id: userId,
        username: user?.username || user?.name || 'You',
        name: user?.name || user?.username || 'You'
      },
      rid: roomId,
      _updatedAt: new Date()
    };

    // Add temporary message immediately for better UX
    onNewMessage(tempMessage);
    setMessage('');

    try {
      const result = await sendMessage(roomId, message.trim());
      
      if (result.success) {
        // The polling mechanism will fetch the real message from server
        // and replace the temporary one
        console.log('Message sent successfully');
      } else {
        setError(result.error || 'Failed to send message');
        // TODO: Remove the temporary message on error
      }
    } catch (err) {
      setError('An unexpected error occurred');
      // TODO: Remove the temporary message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 backdrop-blur-sm"
            rows="1"
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className={`p-3 rounded-lg transition-all duration-300 ${
            !message.trim() || sending
              ? 'bg-white/20 text-gray-400 cursor-not-allowed'
              : 'bg-green-500 text-white hover:shadow-lg hover:shadow-green-500/50 hover:scale-105'
          }`}
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

