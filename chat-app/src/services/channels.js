import api from '../axios/axiosInstance';

// Add user to channel (single user)
export const addUserToChannel = async (channelId, userId) => {
  try {
    console.log('Adding user to channel:', { channelId, userId });
    const response = await api.post('/channels.invite', {
      roomId: channelId,
      userId: userId,
    });
    console.log('Add user response:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Add user to channel error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Failed to add user to channel',
    };
  }
};

// Add multiple users to channel (bulk invite)
export const addUsersToChannel = async (channelId, userIds) => {
  try {
    console.log('Adding multiple users to channel:', { channelId, userIds });
    const response = await api.post('/channels.invite', {
      roomId: channelId,
      userIds: userIds, // Array of user IDs
    });
    console.log('Add multiple users response:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Add multiple users to channel error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Failed to add users to channel',
    };
  }
};

// Get channel members
export const getChannelMembers = async (channelId) => {
  try {
    const response = await api.get(`/channels.members?roomId=${channelId}`);
    return {
      success: true,
      members: response.data.members || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get channel members',
    };
  }
};

// Remove user from channel
export const removeUserFromChannel = async (channelId, userId) => {
  try {
    const response = await api.post('/channels.kick', {
      roomId: channelId,
      userId: userId,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to remove user from channel',
    };
  }
};

// Add moderator to channel
export const addChannelModerator = async (channelId, userId) => {
  try {
    const response = await api.post('/channels.addModerator', {
      roomId: channelId,
      userId: userId,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to add moderator',
    };
  }
};

// Remove moderator from channel
export const removeChannelModerator = async (channelId, userId) => {
  try {
    const response = await api.post('/channels.removeModerator', {
      roomId: channelId,
      userId: userId,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to remove moderator',
    };
  }
};
