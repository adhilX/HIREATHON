import api from '../axios/axiosInstance';

// Authentication
export const login = async (username, password) => {
  try {
    const response = await api.post('/login', {
      user: username,
      password: password,
    });
    
    if (response.data.status === 'success') {
      return {
        success: true,
        authToken: response.data.data.authToken,
        userId: response.data.data.userId,
        user: response.data.data.me,
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Login failed',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Network error during login',
    };
  }
};

// Get user info
export const getUserInfo = async () => {
  try {
    const response = await api.get('/me');
    return {
      success: true,
      user: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get user info',
    };
  }
};

// Get rooms/channels
export const getRooms = async () => {
  try {
    const response = await api.get('/rooms.get');
    return {
      success: true,
      rooms: response.data.update || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get rooms',
    };
  }
};

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
      error: error.response?.data?.error || 'Failed to get messages',
    };
  }
};

// Send a message
export const sendMessage = async (roomId, message) => {
  try {
    const response = await api.post('/chat.sendMessage', {
      message: {
        rid: roomId,
        msg: message,
      },
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

// Get room info
export const getRoomInfo = async (roomId) => {
  try {
    const response = await api.get(`/rooms.info?roomId=${roomId}`);
    return {
      success: true,
      room: response.data.room,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get room info',
    };
  }
};

// Logout
export const logout = async () => {
  try {
    await api.post('/logout');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Logout failed',
    };
  }
};

