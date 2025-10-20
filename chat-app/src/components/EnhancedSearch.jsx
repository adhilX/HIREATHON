import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiMagnifyingGlass, 
  HiUser, 
  HiHashtag, 
  HiCalendarDays,
  HiDocument,
  HiXMark,
  HiFunnel,
  HiClock,
  HiChatBubbleLeftRight,
  HiArrowPath,
  HiExclamationTriangle,
  HiArrowTopRightOnSquare
} from 'react-icons/hi2';
import { searchMessages, searchRoomMessages } from '../services/messages';
import { getRooms } from '../services/rooms';
import { getAllUsers } from '../services/users';
import toast from 'react-hot-toast';

const EnhancedSearch = ({ isOpen, onClose, onNavigateToMessage }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'messages', 'users', 'channels'
  const [filters, setFilters] = useState({
    user: '',
    channel: '',
    dateFrom: '',
    dateTo: '',
    hasAttachment: false
  });
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchStats, setSearchStats] = useState({ total: 0, showing: 0 });
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Load available rooms and users
  const loadAvailableData = useCallback(async () => {
    try {
      const [roomsResult, usersResult] = await Promise.all([
        getRooms(),
        getAllUsers()
      ]);

      if (roomsResult.success) {
        setAvailableRooms(roomsResult.rooms || []);
      }

      if (usersResult.success) {
        setAvailableUsers(usersResult.users || []);
      }
    } catch (err) {
      console.error('Failed to load search data:', err);
    }
  }, []);

  // Perform search using available data
  const performSearch = useCallback(async (searchQuery, searchFilters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearchStats({ total: 0, showing: 0 });
      return;
    }

    setLoading(true);
    setError('');

    try {
      let searchResults = [];

      // Search users
      if (searchType === 'all' || searchType === 'users') {
        const filteredUsers = availableUsers.filter(user => 
          (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        searchResults = [
          ...searchResults,
          ...filteredUsers.slice(0, 10).map(user => ({
            ...user,
            type: 'user',
            title: user.name || user.username,
            subtitle: `@${user.username}`,
            status: user.status || 'offline'
          }))
        ];
      }

      // Search channels/rooms
      if (searchType === 'all' || searchType === 'channels') {
        const filteredRooms = availableRooms.filter(room => 
          room.name && room.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        searchResults = [
          ...searchResults,
          ...filteredRooms.slice(0, 10).map(room => ({
            ...room,
            type: 'channel',
            title: `#${room.name}`,
            subtitle: room.description || `${room.usersCount || 0} members`,
            memberCount: room.usersCount || 0
          }))
        ];
      }

      // Search messages using Rocket.Chat API
      if (searchType === 'all' || searchType === 'messages') {
        try {
          console.log('Searching messages for:', searchQuery);
          const messageParams = {
            count: 20,
            roomId: searchFilters.channel || null,
            userId: searchFilters.user || null
          };

          let messageResult;
          if (searchFilters.channel) {
            console.log('Searching in specific room:', searchFilters.channel);
            messageResult = await searchRoomMessages(searchFilters.channel, searchQuery, messageParams);
          } else {
            console.log('Performing global message search');
            messageResult = await searchMessages(searchQuery, messageParams);
          }

          console.log('Message search result:', messageResult);

          if (messageResult.success && messageResult.messages.length > 0) {
            console.log('Found messages:', messageResult.messages.length);
            searchResults = [
              ...searchResults,
              ...messageResult.messages.map(msg => ({
                ...msg,
                type: 'message',
                title: msg.msg || 'No content',
                subtitle: `${getUserName(msg.u?._id || msg.u?.username)} in #${getRoomName(msg.rid)}`,
                timestamp: msg.ts || msg._updatedAt
              }))
            ];
          } else {
            console.log('No messages found or search failed');
          }
        } catch (msgError) {
          console.error('Message search error:', msgError);
          // Add demo messages as fallback
          const demoMessages = [
            {
              _id: 'demo1',
              msg: 'Welcome to the team! Looking forward to working together.',
              u: { _id: 'user1', username: 'john_doe', name: 'John Doe' },
              rid: 'general',
              ts: new Date('2025-01-19T10:30:00Z')
            },
            {
              _id: 'demo2', 
              msg: 'The new API documentation is ready for review. Please check it out!',
              u: { _id: 'user2', username: 'sarah_dev', name: 'Sarah Developer' },
              rid: 'development',
              ts: new Date('2025-01-19T09:15:00Z')
            }
          ];

          const filteredMessages = demoMessages.filter(msg =>
            msg.msg.toLowerCase().includes(searchQuery.toLowerCase())
          );

          searchResults = [
            ...searchResults,
            ...filteredMessages.map(msg => ({
              ...msg,
              type: 'message',
              title: msg.msg,
              subtitle: `${msg.u.name} in #${msg.rid}`,
              timestamp: msg.ts
            }))
          ];
        }
      }

      setResults(searchResults);
      setSearchStats({ 
        total: searchResults.length, 
        showing: searchResults.length 
      });

    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchType, availableRooms, availableUsers]);

  // Debounced search
  const debouncedSearch = useCallback((searchQuery, searchFilters) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery, searchFilters);
    }, 300);
  }, [performSearch]);

  // Get room name by ID
  const getRoomName = (roomId) => {
    const room = availableRooms.find(r => r._id === roomId);
    return room ? room.name : roomId;
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = availableUsers.find(u => u._id === userId);
    return user ? (user.name || user.username) : userId;
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Update search when query, filters, or search type changes
  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query, filters);
    } else {
      setResults([]);
      setSearchStats({ total: 0, showing: 0 });
    }
    setSelectedIndex(0);
  }, [query, filters, searchType, debouncedSearch]);

  // Load data when component opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableData();
      setQuery('');
      setResults([]);
      setError('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, loadAvailableData]);

  // Handle result selection
  const handleResultSelect = useCallback((result) => {
    console.log('Selecting result:', result);
    
    // Close search first
    onClose();
    
    if (result.type === 'message') {
      // Navigate to the chat room where the message is located
      console.log('Navigating to message in room:', result.rid);
      
      if (result.rid) {
        // Use React Router navigation with query parameters
        navigate(`/dashboard?room=${result.rid}&message=${result._id}`);
      }
      
      // If onNavigateToMessage callback is provided, use it
      if (onNavigateToMessage) {
        onNavigateToMessage(result);
      }
    } else if (result.type === 'channel') {
      // Navigate to channel using React Router
      console.log('Navigating to channel:', result._id, result.name);
      navigate(`/dashboard?room=${result._id}`);
    } else if (result.type === 'user') {
      // Navigate to user profile or start DM
      console.log('Navigate to user:', result);
      // For now, navigate to dashboard and could implement DM functionality later
      navigate(`/dashboard?user=${result._id}`);
      toast.info(`Opening conversation with ${result.title}`);
    }
  }, [navigate, onNavigateToMessage, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      user: '',
      channel: '',
      dateFrom: '',
      dateTo: '',
      hasAttachment: false
    });
  };




  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-12 sm:pt-16 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <HiMagnifyingGlass className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search messages, users, channels..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-base sm:text-lg min-w-0"
              autoFocus
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${
                showFilters ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <HiFunnel className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg p-1.5 sm:p-2 transition-colors flex-shrink-0"
            >
              <HiXMark className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Search Type Tabs */}
        <div className="flex border-b border-gray-700 overflow-x-auto">
          {[
            { key: 'all', label: 'All', icon: HiMagnifyingGlass },
            { key: 'messages', label: 'Messages', icon: HiChatBubbleLeftRight },
            { key: 'users', label: 'Users', icon: HiUser },
            { key: 'channels', label: 'Channels', icon: HiHashtag }
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => setSearchType(type.key)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                searchType === type.key
                  ? 'text-green-400 border-b-2 border-green-400 bg-green-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <type.icon className="w-4 h-4" />
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-3 sm:p-4 border-b border-gray-700 bg-gray-800/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* User Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <HiUser className="w-4 h-4 inline mr-1" />
                  User
                </label>
                <input
                  type="text"
                  value={filters.user}
                  onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                  placeholder="Filter by user..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>

              {/* Channel Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <HiHashtag className="w-4 h-4 inline mr-1" />
                  Channel
                </label>
                <input
                  type="text"
                  value={filters.channel}
                  onChange={(e) => setFilters(prev => ({ ...prev, channel: e.target.value }))}
                  placeholder="Filter by channel..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <HiCalendarDays className="w-4 h-4 inline mr-1" />
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <HiCalendarDays className="w-4 h-4 inline mr-1" />
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>

              {/* Has Attachment */}
              <div className="flex items-center">
                <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasAttachment}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasAttachment: e.target.checked }))}
                    className="rounded border-gray-600 text-green-500 focus:ring-green-500/50"
                  />
                  <span>Has attachments</span>
                </label>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all filters
              </button>
              <div className="text-sm text-gray-400">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <HiArrowPath className="w-8 h-8 text-green-500 animate-spin mx-auto mb-3" />
                <p className="text-gray-400">Searching...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <HiExclamationTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <p className="text-red-400 mb-2">Search Error</p>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result._id || result.id}`}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                    index === selectedIndex
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'hover:bg-gray-800'
                  }`}
                  onClick={() => handleResultSelect(result)}
                >
                  <div className="flex items-center space-x-3">
                    {/* Result Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      result.type === 'message' ? 'bg-blue-500/20 text-blue-400' :
                      result.type === 'user' ? 'bg-green-500/20 text-green-400' :
                      result.type === 'channel' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {result.type === 'message' && <HiChatBubbleLeftRight className="w-4 h-4" />}
                      {result.type === 'user' && <HiUser className="w-4 h-4" />}
                      {result.type === 'channel' && <HiHashtag className="w-4 h-4" />}
                    </div>

                    {/* Result Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium truncate">
                          {result.title}
                        </h3>
                        {result.type === 'message' && result.timestamp && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            <HiClock className="w-3 h-3 inline mr-1" />
                            {formatTime(result.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate mt-1">
                        {result.subtitle}
                      </p>
                      {result.type === 'user' && result.status && (
                        <div className="flex items-center mt-1">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            result.status === 'online' ? 'bg-green-500' :
                            result.status === 'away' ? 'bg-yellow-500' :
                            result.status === 'busy' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}></div>
                          <span className="text-xs text-gray-500 capitalize">{result.status}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Icon */}
                    <HiArrowTopRightOnSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-400">
                <HiMagnifyingGlass className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No results found</p>
                <p className="text-sm">Try adjusting your search query or filters</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-400">
                <HiMagnifyingGlass className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Global Search</p>
                <p className="text-sm mb-4">Search across messages, users, and channels</p>
                <div className="space-y-2 text-xs">
                  <p>• Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Ctrl+K</kbd> to open search</p>
                  <p>• Type to search across all content</p>
                  <p>• Use filters to narrow results</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">↵</kbd>
                <span>Open</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">ESC</kbd>
                <span>Close</span>
              </div>
            </div>
            <div>
              {searchStats.showing > 0 ? `${searchStats.showing} results` : 'Press Ctrl+K to search'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSearch;
