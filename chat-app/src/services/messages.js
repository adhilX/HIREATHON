import api from '../axios/axiosInstance';

// Get messages for a room
export const getMessages = async (roomId, count = 50) => {
  try {
    const response = await api.get(`/channels.history?roomId=${roomId}&count=${count}`);
    return {
      success: true,
      messages: response.data.messages || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch messages',
    };
  }
};

// Send a message
export const sendMessage = async (roomId, message, threadId = null) => {
  try {
    const messageData = {
      rid: roomId,
      msg: message,
    };
    
    // Add thread ID if this is a thread reply
    if (threadId) {
      messageData.tmid = threadId;
    }
    
    const response = await api.post('/chat.sendMessage', {
      message: messageData,
    });
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to send message',
    };
  }
};

// Edit a message
export const editMessage = async (messageId, newText, roomId) => {
  try {
    const response = await api.post('/chat.update', {
      msgId: messageId,
      text: newText,
      roomId: roomId,
    });
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to edit message',
    };
  }
};

// Delete a message
export const deleteMessage = async (messageId, roomId) => {
  try {
    const response = await api.post('/chat.delete', {
      msgId: messageId,
      roomId: roomId,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to delete message',
    };
  }
};

// Pin a message
export const pinMessage = async (messageId) => {
  console.log('Pinning message:', messageId);
  try {
    const response = await api.post('/chat.pinMessage', {
      messageId: messageId,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to pin message',
    };
  }
};

// Unpin a message
export const unpinMessage = async (messageId) => {
  console.log(messageId);
  try {
    const response = await api.post('/chat.unPinMessage', {
      messageId: messageId,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to unpin message',
    };
  }
};

// Get pinned messages for a room
export const getPinnedMessages = async (roomId) => {
  try {
    const response = await api.get(`/channels.messages?roomId=${roomId}&query={"pinned":true}`);
    return {
      success: true,
      messages: response.data.messages || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get pinned messages',
    };
  }
};

// Search messages globally
export const searchMessages = async (searchQuery, filters = {}) => {
  try {
    // Try the search API first
    const params = new URLSearchParams();
    params.append('searchText', searchQuery);
    
    if (filters.count) params.append('count', filters.count);
    if (filters.roomId) params.append('roomId', filters.roomId);
    if (filters.userId) params.append('userId', filters.userId);

    const response = await api.get(`/chat.search?${params.toString()}`);
    
    return {
      success: true,
      messages: response.data.messages || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    console.warn('Global search API not available, trying alternative approach');
    
    // Fallback: Get recent messages from multiple rooms and filter
    try {
      // Get list of rooms first
      const roomsResponse = await api.get('/channels.list');
      const rooms = roomsResponse.data.channels || [];
      
      let allMessages = [];
      
      // Get recent messages from first few rooms
      for (const room of rooms.slice(0, 5)) {
        try {
          const messagesResponse = await api.get(`/channels.history?roomId=${room._id}&count=20`);
          if (messagesResponse.data.messages) {
            allMessages = [...allMessages, ...messagesResponse.data.messages];
          }
        } catch (roomError) {
          console.warn(`Failed to get messages from room ${room.name}`);
        }
      }
      
      // Filter messages by search query
      const filteredMessages = allMessages.filter(msg => 
        msg.msg && msg.msg.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return {
        success: true,
        messages: filteredMessages.slice(0, filters.count || 20),
        total: filteredMessages.length,
      };
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError);
      return {
        success: false,
        error: 'Search functionality not available',
        messages: [],
        total: 0,
      };
    }
  }
};

// Search messages in a specific room
export const searchRoomMessages = async (roomId, searchQuery, filters = {}) => {
  try {
    const response = await api.get(`/channels.history?roomId=${roomId}&count=${filters.count || 50}`);
    
    if (response.data.messages) {
      // Filter messages locally by search query
      const filteredMessages = response.data.messages.filter(msg => 
        msg.msg && msg.msg.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return {
        success: true,
        messages: filteredMessages,
        total: filteredMessages.length,
      };
    }
    
    return {
      success: true,
      messages: [],
      total: 0,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to search room messages',
      messages: [],
      total: 0,
    };
  }
};
