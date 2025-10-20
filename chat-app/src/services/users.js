import api from '../axios/axiosInstance';

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
      error: error.response?.data?.error || 'Failed to get users presence',
    };
  }
};

// Get all users (for adding to channels)
export const getAllUsers = async () => {
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
      message: '', // Optional status message
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to set user presence',
    };
  }
};
