import React from 'react';
import './Message.css';

const Message = ({ message, isOwn }) => {
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

  return (
    <div className={`message-container ${isOwn ? 'own' : 'other'}`}>
      <div className="message-bubble">
        <div className="message-header">
          <span className="sender-name">
            {message.u?.name || message.u?.username || message.username || 'Sending...'}
          </span>
          <span className="message-time">
            {formatTime(message.ts || message._updatedAt || message.createdAt)}
          </span>
        </div>
        
        <div className="message-content">
          {message.msg}
        </div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="attachment">
                {attachment.image_url && (
                  <img 
                    src={attachment.image_url} 
                    alt="Attachment" 
                    className="attachment-image"
                  />
                )}
                {attachment.title && (
                  <div className="attachment-title">{attachment.title}</div>
                )}
                {attachment.description && (
                  <div className="attachment-description">{attachment.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;

