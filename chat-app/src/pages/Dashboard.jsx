import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { getRooms, getMessages, canAddUsersToRoom } from '../services';
import { 
  HiUsers, 
  HiUserPlus, 
  HiBookmark, 
  HiMagnifyingGlass,
  HiHashtag,
  HiChatBubbleLeftRight,
  HiPlus
} from 'react-icons/hi2';
import RoomList from '../components/RoomList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import CreateChannel from '../components/CreateChannel';
import AddUserToChannel from '../components/AddUserToChannel';
import ChannelMembers from '../components/ChannelMembers';
import PinnedMessages from '../components/PinnedMessages';

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [canAddUsers, setCanAddUsers] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(false);

  // Load rooms on mount
  useEffect(() => {
    const loadRooms = async () => {
      if (!user) return;
      
      try {
        const result = await getRooms();
        if (result.success) {
          setRooms(result.rooms);
          
          // Check URL parameters for navigation
          const roomParam = searchParams.get('room');
          const userParam = searchParams.get('user');
          
          if (roomParam) {
            // Find the room by ID or name
            const targetRoom = result.rooms.find(room => 
              room._id === roomParam || room.name === roomParam
            );
            if (targetRoom) {
              setCurrentRoom(targetRoom);
              console.log('Navigated to room from URL:', targetRoom.name);
            } else {
              console.warn('Room not found:', roomParam);
              // If room not found, select first room
              if (result.rooms.length > 0) {
                setCurrentRoom(result.rooms[0]);
              }
            }
          } else if (userParam) {
            // Handle user parameter (for future DM functionality)
            console.log('User parameter detected:', userParam);
            // For now, just select the first room
            if (result.rooms.length > 0) {
              setCurrentRoom(result.rooms[0]);
            }
          } else {
            // Select the first room by default
            if (result.rooms.length > 0) {
              setCurrentRoom(result.rooms[0]);
            }
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
  }, [user, searchParams]);

  // Load messages when room changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentRoom || !user) return;
      
      try {
        const result = await getMessages(currentRoom._id);
        if (result.success) {
          setMessages(result.messages.reverse()); // Reverse to show oldest first
          
          // Check if there's a specific message to highlight
          const messageParam = searchParams.get('message');
          if (messageParam) {
            console.log('Highlighting message:', messageParam);
            // Scroll to message after a short delay to ensure DOM is updated
            setTimeout(() => {
              const messageElement = document.getElementById(`message-${messageParam}`);
              if (messageElement) {
                messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                messageElement.classList.add('highlight-message');
                // Remove highlight after 3 seconds
                setTimeout(() => {
                  messageElement.classList.remove('highlight-message');
                  // Clear message parameter from URL after highlighting
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('message');
                  setSearchParams(newParams);
                }, 3000);
              }
            }, 500);
          }
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load messages');
      }
    };

    loadMessages();
  }, [currentRoom, user, searchParams]);

  // Check user permissions when room changes
  useEffect(() => {
    const checkUserPermissions = async () => {
      if (!currentRoom || !user) {
        setCanAddUsers(false);
        return;
      }

      setCheckingPermissions(true);
      try {
        console.log('Checking permissions for room:', currentRoom._id, 'user:', user._id);
        const hasPermission = await canAddUsersToRoom(currentRoom._id, user._id);
        console.log('Can add users permission:', hasPermission);
        setCanAddUsers(hasPermission);
      } catch (err) {
        console.error('Error checking permissions:', err);
        setCanAddUsers(false);
      } finally {
        setCheckingPermissions(false);
      }
    };

    checkUserPermissions();
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

    // const interval = setInterval(pollMessages, 3000);
    // return () => clearInterval(interval);
  }, [currentRoom, user]);

  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setMessages([]);
    // Update URL to reflect current room selection
    setSearchParams({ room: room._id });
    console.log('Room selected:', room.name);
  };
  const handleNewMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  const handleChannelCreated = async (newChannel) => {
    // Refresh the rooms list to include the new channel
    try {
      const result = await getRooms();
      if (result.success) {
        setRooms(result.rooms);
        // Optionally select the new channel
        const createdChannel = result.rooms.find(room => room._id === newChannel._id);
        if (createdChannel) {
          setCurrentRoom(createdChannel);
        }
      }
    } catch (err) {
      console.error('Error refreshing rooms:', err);
    }
  };

  const handleUserAdded = (addedUsers) => {
    // You could show a success message or refresh channel info here
    console.log('Users added to channel:', addedUsers);
  };

  const handleMessageUpdate = (messageId, newText, isDeleted = false, isPinned = null) => {
    setMessages(prevMessages => {
      if (isDeleted) {
        // Remove the message
        return prevMessages.filter(msg => msg._id !== messageId);
      } else {
        // Update the message text and/or pin status
        return prevMessages.map(msg => {
          if (msg._id === messageId) {
            const updates = {};
            if (newText !== msg.msg) {
              updates.msg = newText;
              updates.editedAt = new Date().toISOString();
            }
            if (isPinned !== null) {
              updates.pinned = isPinned;
            }
            return { ...msg, ...updates };
          }
          return msg;
        });
      }
    });
  };

  // Check if current user is channel owner or has admin permissions
  const isChannelOwner = (room) => {
    if (!room || !user) return false;
    
    // Check if user is the room owner
    if (room.u && room.u._id === user._id) {
      return true;
    }
    
    // Check if user is in the room's owner list
    if (room.owner && room.owner._id === user._id) {
      return true;
    }
    
    // Check if user has admin role in the room
    if (room.roles && room.roles[user._id]) {
      const userRoles = room.roles[user._id];
      return userRoles.includes('owner') || userRoles.includes('moderator') || userRoles.includes('admin');
    }
    
    // For channels created by the user, check if they're the creator
    if (room.ts && room.u && room.u._id === user._id) {
      return true;
    }
    
    // Fallback: check if user has general admin permissions
    if (user.roles && (user.roles.includes('admin') || user.roles.includes('owner'))) {
      return true;
    }
    
    return false;
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
    <div className="flex h-full bg-black">
      {/* Channels Sidebar */}
      <div className="w-72 bg-black border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 bg-black">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-white">Channels</h2>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="p-1.5 text-white hover:text-white hover:bg-green-500 rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
              title="Create Channel"
            >
              <HiPlus className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-400">
            {rooms.length} channel{rooms.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto sidebar-scrollbar">
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
            <div className="bg-black border-b border-gray-800 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center shadow-sm shadow-green-500/30 flex-shrink-0">
                    <HiHashtag className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white truncate">{currentRoom.name}</h3>
                    {currentRoom.topic && (
                      <p className="text-sm text-gray-400 truncate hidden sm:block">{currentRoom.topic}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <button 
                    onClick={() => setShowMembers(true)}
                    className="p-2 text-white hover:text-white hover:bg-green-500 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
                    title="View Members"
                  >
                    <HiUsers className="w-5 h-5" />
                  </button>
                  {canAddUsers && (
                    <button 
                      onClick={() => setShowAddUser(true)}
                      className={`p-2 text-white hover:text-white hover:bg-green-500 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 ${
                        checkingPermissions ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={checkingPermissions ? "Checking permissions..." : "Add Users"}
                      disabled={checkingPermissions}
                    >
                      {checkingPermissions ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <HiUserPlus className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => setShowPinnedMessages(true)}
                    className="p-2 text-white hover:text-white hover:bg-green-500 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
                    title="View Pinned Messages"
                  >
                    <HiBookmark className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-white hover:text-white hover:bg-green-500 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30">
                    <HiMagnifyingGlass className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden bg-black">
              <MessageList 
                messages={messages} 
                currentUserId={user._id}
                onMessageUpdate={handleMessageUpdate}
                roomId={currentRoom._id}
              />
            </div>
            
            {/* Message Input */}
            <div className="bg-black border-t border-gray-800 p-3 sm:p-4">
              <MessageInput 
                roomId={currentRoom._id}
                onNewMessage={handleNewMessage}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            <div className="text-center max-w-md mx-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-white/30">
                <HiChatBubbleLeftRight className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Welcome to Rocket.Chat</h3>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">
                Select a channel from the sidebar to start chatting with your team.
              </p>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-xs sm:text-sm text-green-400">
                  💡 <strong>Tip:</strong> Use the sidebar to navigate between different channels and features.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      <CreateChannel
        isOpen={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        onChannelCreated={handleChannelCreated}
      />

      {/* Add User to Channel Modal */}
      <AddUserToChannel
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        channel={currentRoom}
        onUserAdded={handleUserAdded}
      />

      {/* Channel Members Modal */}
      <ChannelMembers
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        channel={currentRoom}
      />

      {/* Pinned Messages Modal */}
      <PinnedMessages
        isOpen={showPinnedMessages}
        onClose={() => setShowPinnedMessages(false)}
        channel={currentRoom}
      />
    </div>
  );
};

export default Dashboard;
