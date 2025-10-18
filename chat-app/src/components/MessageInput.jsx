import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage } from '../services/rocketchat';
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
    <div className="message-input-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-wrapper">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="message-textarea"
            rows="1"
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="send-button"
          >
            {sending ? (
              <div className="sending-spinner"></div>
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
        </div>
      </form>
    </div>
  );
};

export default MessageInput;

