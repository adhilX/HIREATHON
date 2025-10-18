import api from '../axios/axiosInstance';

// Authentication
export const login = async (username, password) => {
  try {
    const response = await api.post('/login', {
      user: username,
      password: password,
    });

    return {
      success: true,
      authToken: response.data.data.authToken,
      userId: response.data.data.userId,
      user: response.data.data.me,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Login failed',
    };
  }
};

// Signup/Register
export const signup = async (userData) => {
  try {
    const response = await api.post('/users.register', {
      name: userData.name,
      username: userData.username,
      email: userData.email,
      pass: userData.password,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Registration failed',
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

// Get all users with presence info
export const getUsersPresence = async () => {
  try {
    const response = await api.get('/users.list');
    return {
      success: true,
      users: response.data.users || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get users',
    };
  }
};

// Get user presence by userId
export const getUserPresence = async (userId) => {
  try {
    const response = await api.get(`/users.getPresence?userId=${userId}`);
    return {
      success: true,
      presence: response.data.presence,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get user presence',
    };
  }
};

// Set user presence status
export const setUserPresence = async (status) => {
  try {
    const response = await api.post('/users.setStatus', {
      status: status, // 'online', 'away', 'busy', 'offline'
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to set presence',
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

