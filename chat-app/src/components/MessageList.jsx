import React, { useEffect, useRef, useState } from 'react';
import Message from './Message';
import ThreadModal from './ThreadModal';
import { HiChatBubbleLeftRight } from 'react-icons/hi2';
import './MessageList.css';
import '../styles/scrollbar.css';

const MessageList = ({ messages, currentUserId, onMessageUpdate, roomId }) => {
  const messagesEndRef = useRef(null);
  const [threadModal, setThreadModal] = useState({
    isOpen: false,
    parentMessage: null,
    replies: []
  });
  const [threadReplies, setThreadReplies] = useState({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Organize messages and thread replies
  useEffect(() => {
    const replies = {};
    messages.forEach(message => {
      if (message.tmid) { // Thread message ID - indicates this is a reply
        if (!replies[message.tmid]) {
          replies[message.tmid] = [];
        }
        replies[message.tmid].push(message);
      }
    });
    
    // Sort replies by timestamp
    Object.keys(replies).forEach(threadId => {
      replies[threadId].sort((a, b) => new Date(a.ts) - new Date(b.ts));
    });
    
    setThreadReplies(replies);
  }, [messages]);

  const handleStartThread = (message) => {
    const replies = threadReplies[message._id] || [];
    setThreadModal({
      isOpen: true,
      parentMessage: message,
      replies: replies
    });
  };

  const handleCloseThread = () => {
    setThreadModal({
      isOpen: false,
      parentMessage: null,
      replies: []
    });
  };

  const handleNewThreadReply = (reply) => {
    const parentId = reply.tmid;
    setThreadReplies(prev => ({
      ...prev,
      [parentId]: [...(prev[parentId] || []), reply]
    }));
    
    // Update the modal if it's open for this thread
    if (threadModal.isOpen && threadModal.parentMessage?._id === parentId) {
      setThreadModal(prev => ({
        ...prev,
        replies: [...prev.replies, reply]
      }));
    }
  };

  const getThreadReplyCount = (messageId) => {
    return threadReplies[messageId]?.length || 0;
  };

  // Filter out thread replies from main message list
  const mainMessages = messages.filter(message => !message.tmid);

  if (mainMessages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiChatBubbleLeftRight className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-gray-400">No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="message-list h-full overflow-y-auto bg-black p-4 space-y-3 message-scrollbar smooth-scroll">
        {mainMessages.map((message, index) => {
          const replyCount = getThreadReplyCount(message._id);
          return (
            <div key={message._id || index} className="space-y-2">
              <Message
                message={message}
                isOwn={message.u?._id === currentUserId}
                onMessageUpdate={onMessageUpdate}
                roomId={roomId}
                onStartThread={() => handleStartThread(message)}
                threadReplyCount={replyCount}
              />
              
              {/* Thread Reply Indicator */}
              {replyCount > 0 && (
                <div className="ml-12 pl-4 border-l-2 border-green-500/30">
                  <button
                    onClick={() => handleStartThread(message)}
                    className="flex items-center space-x-2 text-sm text-green-400 hover:text-green-300 transition-colors group"
                  >
                    <div className="flex -space-x-1">
                      {threadReplies[message._id]?.slice(0, 3).map((reply, idx) => (
                        <div
                          key={reply._id}
                          className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-black flex items-center justify-center text-white text-xs font-semibold"
                          style={{ zIndex: 3 - idx }}
                        >
                          {(reply.u?.name || reply.u?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <span className="group-hover:underline">
                      {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-xs">
                      Last reply {new Date(threadReplies[message._id]?.[replyCount - 1]?.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Thread Modal */}
      <ThreadModal
        isOpen={threadModal.isOpen}
        onClose={handleCloseThread}
        parentMessage={threadModal.parentMessage}
        threadReplies={threadModal.replies}
        onNewReply={handleNewThreadReply}
        roomId={roomId}
      />
    </>
  );
};

export default MessageList;

