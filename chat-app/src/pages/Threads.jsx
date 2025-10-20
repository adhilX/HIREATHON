import React, { useState } from 'react';
import { useThreads } from '../hooks/useThreads';
import ThreadCard from '../components/ThreadCard';
import ThreadModal from '../components/ThreadModal';
import { 
  HiMagnifyingGlass, 
  HiAdjustmentsHorizontal,
  HiChatBubbleLeftRight,
  HiArrowPath,
  HiExclamationCircle,
  HiAtSymbol,
  HiClock
} from 'react-icons/hi2';

const Threads = () => {
  const { threads, loading, error, refreshThreads, fetchThreadReplies, totalThreads, totalUnread, totalMentions } = useThreads();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('activity'); // 'activity', 'replies', 'mentions'
  const [selectedThread, setSelectedThread] = useState(null);

  // Filter and sort threads
  const filteredThreads = threads
    .filter(thread => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        thread.parentMessage.msg?.toLowerCase().includes(searchLower) ||
        thread.parentMessage.u?.name?.toLowerCase().includes(searchLower) ||
        thread.room.name?.toLowerCase().includes(searchLower) ||
        thread.replies.some(reply => reply.msg?.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'replies':
          return b.replyCount - a.replyCount;
        case 'mentions':
          if (a.hasMentions !== b.hasMentions) {
            return a.hasMentions ? -1 : 1;
          }
          return b.lastActivity - a.lastActivity;
        case 'activity':
        default:
          return b.lastActivity - a.lastActivity;
      }
    });

  const handleThreadClick = async (thread) => {
    // Fetch fresh replies when opening a thread
    const freshReplies = await fetchThreadReplies(thread.room._id, thread.id);
    
    // Update the thread with fresh replies
    const updatedThread = {
      ...thread,
      replies: freshReplies
    };
    
    setSelectedThread(updatedThread);
  };

  const handleCloseThread = () => {
    setSelectedThread(null);
  };

  const handleNewReply = (reply) => {
    // Update the thread with new reply
    if (selectedThread) {
      setSelectedThread(prev => ({
        ...prev,
        replies: [...prev.replies, reply],
        replyCount: prev.replyCount + 1,
        lastActivity: new Date(reply.ts),
        lastReply: reply
      }));
    }
    // Refresh threads to update the list
    refreshThreads();
  };

  const sortOptions = [
    { value: 'activity', label: 'Recent Activity', icon: HiClock },
    { value: 'replies', label: 'Most Replies', icon: HiChatBubbleLeftRight },
    { value: 'mentions', label: 'Mentions', icon: HiAtSymbol }
  ];

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiExclamationCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Threads</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refreshThreads}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full bg-black flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">All Threads</h1>
              <p className="text-gray-400 mt-1">
                {totalThreads} active threads
                {totalUnread > 0 && (
                  <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    {totalUnread} unread
                  </span>
                )}
                {totalMentions > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {totalMentions} mentions
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={refreshThreads}
              className="p-2 text-white hover:text-white hover:bg-green-500 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
              title="Refresh threads"
            >
              <HiArrowPath className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search threads, messages, or participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
              />
            </div>

            {/* Sort Options */}
            <div className="flex space-x-2">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                const isActive = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && threads.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <HiArrowPath className="w-8 h-8 text-green-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading threads...</p>
              </div>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiChatBubbleLeftRight className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery ? 'No threads found' : 'No active threads'}
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search query or filters'
                    : 'Start conversations and reply in threads to see them here'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 max-w-4xl mx-auto">
              {filteredThreads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  onClick={() => handleThreadClick(thread)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thread Modal */}
      {selectedThread && (
        <ThreadModal
          isOpen={!!selectedThread}
          onClose={handleCloseThread}
          parentMessage={selectedThread.parentMessage}
          threadReplies={selectedThread.replies}
          onNewReply={handleNewReply}
          roomId={selectedThread.room._id}
        />
      )}
    </>
  );
};

export default Threads;
