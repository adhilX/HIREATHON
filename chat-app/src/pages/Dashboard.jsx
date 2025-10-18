import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRooms, getMessages } from '../services/rocketchat';
import RoomList from '../components/RoomList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';

const Dashboard = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            // Merge messages, replacing temporary ones with real ones
            const mergedMessages = [...prevMessages];
            
            newMessages.forEach(newMsg => {
              const existingIndex = mergedMessages.findIndex(msg => 
                msg._id === newMsg._id || 
                (msg._id.startsWith('temp-') && msg.msg === newMsg.msg && Math.abs(new Date(msg.ts) - new Date(newMsg.ts)) < 5000)
              );
              
              if (existingIndex >= 0) {
                // Replace temporary message with real one
                mergedMessages[existingIndex] = newMsg;
              } else {
                // Add new message if it doesn't exist
                const isDuplicate = mergedMessages.some(msg => 
                  msg._id === newMsg._id || 
                  (msg.msg === newMsg.msg && Math.abs(new Date(msg.ts) - new Date(newMsg.ts)) < 1000)
                );
                if (!isDuplicate) {
                  mergedMessages.push(newMsg);
                }
              }
            });
            
            // Sort by timestamp
            return mergedMessages.sort((a, b) => new Date(a.ts) - new Date(b.ts));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-medium mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      {/* Channels Sidebar */}
      <div className="w-72 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-semibold text-gray-900 mb-2">Channels</h2>
          <div className="text-sm text-gray-500">
            {rooms.length} channel{rooms.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <RoomList 
            rooms={rooms} 
            currentRoom={currentRoom} 
            onRoomSelect={handleRoomSelect} 
          />
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Channel Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-gray-600 text-sm">#</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{currentRoom.name}</h3>
                    {currentRoom.topic && (
                      <p className="text-sm text-gray-500">{currentRoom.topic}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    👥
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    📌
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    🔍
                  </button>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden bg-white">
              <MessageList 
                messages={messages} 
                currentUserId={user._id}
              />
            </div>
            
            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <MessageInput 
                roomId={currentRoom._id}
                onNewMessage={handleNewMessage}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Rocket.Chat</h3>
              <p className="text-gray-500 mb-4">
                Select a channel from the sidebar to start chatting with your team.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Use the sidebar to navigate between different channels and features.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
