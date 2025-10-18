import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRooms, getMessages } from '../services/rocketchat';
import RoomList from './RoomList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TeamView from './features/TeamView';
import './ChatLayout.css';

const ChatLayout = () => {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'team', 'threads', 'pinned'

  // Load rooms on mount
  useEffect(() => {
    const loadRooms = async () => {
      if (!user) return;
      
      try {
        const result = await getRooms();
        if (result.success) {
          setRooms(result.rooms);
          // Select the first room by default
          if (result.rooms.length > 0) {
            setCurrentRoom(result.rooms[0]);
          }
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [user]);

  // Load messages when room changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentRoom || !user) return;
      
      try {
        const result = await getMessages(currentRoom._id);
        if (result.success) {
          setMessages(result.messages.reverse()); // Reverse to show oldest first
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load messages');
      }
    };

    loadMessages();
  }, [currentRoom, user]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!currentRoom || !user) return;

    const pollMessages = async () => {
      try {
        const result = await getMessages(currentRoom._id);
        if (result.success) {
          const newMessages = result.messages.reverse();
          setMessages(prevMessages => {
            // Only update if we have new messages
            if (newMessages.length !== prevMessages.length) {
              return newMessages;
            }
            return prevMessages;
          });
        }
      } catch (err) {
        console.error('Error polling messages:', err);
      }
    };

    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [currentRoom, user]);

  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setMessages([]);
  };

  const handleNewMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="chat-layout">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-layout">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'threads', label: 'Threads', icon: '🧵' },
    { id: 'pinned', label: 'Pinned', icon: '📌' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'team':
        return <TeamView />;
      case 'threads':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">All Threads</h2>
            <p className="text-gray-500">Coming soon...</p>
          </div>
        );
      case 'pinned':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Pinned Messages</h2>
            <p className="text-gray-500">Coming soon...</p>
          </div>
        );
      case 'chat':
      default:
        return (
          <div className="flex h-full">
            <div className="w-80 border-r border-gray-200 bg-gray-50">
              <RoomList 
                rooms={rooms} 
                currentRoom={currentRoom} 
                onRoomSelect={handleRoomSelect} 
              />
            </div>
            
            <div className="flex-1 flex flex-col">
              {currentRoom ? (
                <>
                  <div className="border-b border-gray-200 p-4 bg-white">
                    <h3 className="font-semibold text-lg">#{currentRoom.name}</h3>
                    <p className="text-gray-600 text-sm">{currentRoom.topic || 'No topic set'}</p>
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <MessageList 
                      messages={messages} 
                      currentUserId={user._id}
                    />
                  </div>
                  
                  <div className="border-t border-gray-200 p-4 bg-white">
                    <MessageInput 
                      roomId={currentRoom._id}
                      onNewMessage={handleNewMessage}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Select a room to start chatting</h3>
                    <p className="text-gray-500">Choose a room from the sidebar to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Rocket.Chat</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{user?.name || user?.username}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatLayout;

