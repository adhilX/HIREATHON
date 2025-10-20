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
