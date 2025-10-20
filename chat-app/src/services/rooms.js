import api from '../axios/axiosInstance';

// Get rooms/channels
export const getRooms = async () => {
  try {
    const response = await api.get('/rooms.get');
    return {
      success: true,
      rooms: response.data.update || response.data.rooms || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch rooms',
    };
  }
};

// Create a new channel
export const createChannel = async (channelData) => {
  try {
    const response = await api.post('/channels.create', {
      name: channelData.name,
      description: channelData.description || '',
      type: channelData.type || 'c', // 'c' for channel, 'p' for private group
      readOnly: channelData.readOnly || false,
      members: channelData.members || [],
    });

    return {
      success: true,
      channel: response.data.channel,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create channel',
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

// Get room roles and permissions
export const getRoomRoles = async (roomId) => {
  try {
    const response = await api.get(`/channels.roles?roomId=${roomId}`);
    return {
      success: true,
      roles: response.data.roles || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get room roles',
    };
  }
};

// Check if user has permission to add users to room
export const canAddUsersToRoom = async (roomId, userId) => {
  try {
    // Get room info to check ownership and permissions
    const roomInfo = await getRoomInfo(roomId);
    if (!roomInfo.success) return false;
    
    const room = roomInfo.room;
    
    // Check if user is owner
    if (room.u && room.u._id === userId) {
      return true;
    }
    
    // Check if user has moderator role
    const rolesInfo = await getRoomRoles(roomId);
    if (rolesInfo.success) {
      const userRoles = rolesInfo.roles.filter(role => role.u._id === userId);
      return userRoles.some(role => role.roles.includes('moderator') || role.roles.includes('owner'));
    }
    
    return false;
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  }
};
