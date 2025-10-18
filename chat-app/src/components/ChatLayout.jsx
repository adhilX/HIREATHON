import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRooms, getMessages } from '../services/rocketchat';
import RoomList from './RoomList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatLayout.css';

const ChatLayout = () => {
  const { user, logout } = useAuth();
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

  return (
    <div className="chat-layout">
      <div className="chat-header">
        <div className="user-info">
          <span className="user-name">{user?.name || user?.username}</span>
          <span className="user-status">Online</span>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="chat-content">
        <div className="sidebar">
          <RoomList 
            rooms={rooms} 
            currentRoom={currentRoom} 
            onRoomSelect={handleRoomSelect} 
          />
        </div>
        
        <div className="chat-area">
          {currentRoom ? (
            <>
              <div className="chat-header-room">
                <h3>#{currentRoom.name}</h3>
                <p>{currentRoom.topic || 'No topic set'}</p>
              </div>
              
              <MessageList 
                messages={messages} 
                currentUserId={user._id}
              />
              
              <MessageInput 
                roomId={currentRoom._id}
                onNewMessage={handleNewMessage}
              />
            </>
          ) : (
            <div className="no-room-selected">
              <h3>Select a room to start chatting</h3>
              <p>Choose a room from the sidebar to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;

