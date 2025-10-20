import React from 'react';
import { 
  HiChatBubbleLeftRight, 
  HiUsers, 
  HiClock,
  HiAtSymbol,
  HiHashtag
} from 'react-icons/hi2';

const ThreadCard = ({ thread, onClick }) => {
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
            {(thread.parentMessage.u?.name || thread.parentMessage.u?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-green-400 text-sm">
                {thread.parentMessage.u?.name || thread.parentMessage.u?.username || 'Unknown User'}
              </span>
              <span className="text-gray-500">in</span>
              <div className="flex items-center space-x-1 text-gray-400">
                <HiHashtag className="w-3 h-3" />
                <span className="text-xs">{thread.room.name}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <HiClock className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">
                {formatTime(thread.lastActivity)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {thread.hasMentions && (
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <HiAtSymbol className="w-3 h-3 text-white" />
            </div>
          )}
          {thread.unreadCount > 0 && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full min-w-[20px] text-center">
              {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Original Message */}
      <div className="mb-3 p-3 bg-black/20 rounded-lg border-l-2 border-green-500/50">
        <p className="text-white text-sm leading-relaxed">
          {truncateText(thread.parentMessage.msg)}
        </p>
      </div>

      {/* Thread Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-green-400">
            <HiChatBubbleLeftRight className="w-4 h-4" />
            <span className="text-sm font-medium">
              {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-blue-400">
            <HiUsers className="w-4 h-4" />
            <span className="text-sm">
              {thread.participants} {thread.participants === 1 ? 'participant' : 'participants'}
            </span>
          </div>
        </div>

        {/* Recent Participants */}
        <div className="flex -space-x-1">
          {thread.replies.slice(-3).reverse().map((reply, idx) => (
            <div
              key={reply._id || `reply-${idx}`}
              className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-black flex items-center justify-center text-white text-xs font-semibold"
              style={{ zIndex: 3 - idx }}
              title={reply.u?.name || reply.u?.username}
            >
              {(reply.u?.name || reply.u?.username || 'U').charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Last Reply Preview */}
      {thread.lastReply && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {(thread.lastReply.u?.name || thread.lastReply.u?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-blue-400">
                  {thread.lastReply.u?.name || thread.lastReply.u?.username}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(new Date(thread.lastReply.ts))}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {truncateText(thread.lastReply.msg, 80)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadCard;
