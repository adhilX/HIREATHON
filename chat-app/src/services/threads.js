import api from '../axios/axiosInstance';

// Get thread messages for a specific thread
export const getThreadMessages = async (roomId, threadId, options = {}) => {
  try {
    const {
      offset = 0,
      count = 50,
      sort = { 'ts': 1 } // Sort by timestamp ascending for threads
    } = options;

    console.log('getThreadMessages called with:', { roomId, threadId, options });

    // Try different approaches to get thread messages
    
    // Approach 1: Use channels.messages with query filter
    const queryFilter = {
      tmid: threadId
    };

    const params = new URLSearchParams({
      roomId: roomId,
      offset: offset.toString(),
      count: count.toString(),
      query: JSON.stringify(queryFilter)
    });

    if (Object.keys(sort).length > 0) {
      params.append('sort', JSON.stringify(sort));
    }

    console.log('API call URL:', `/channels.messages?${params.toString()}`);

    const response = await api.get(`/channels.messages?${params.toString()}`);
    
    console.log('API response:', response.data);
    
    return {
      success: true,
      messages: response.data.messages || [],
      count: response.data.count || 0,
      offset: response.data.offset || 0,
      total: response.data.total || 0
    };
  } catch (error) {
    console.error('getThreadMessages error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get thread messages',
    };
  }
};

// Get threads list for a room
export const getThreadsList = async (roomId, options = {}) => {
  try {
    const {
      offset = 0,
      count = 50,
      sort = { 'ts': -1 }, // Sort by timestamp descending by default
      type = '', // 'unread', 'following', or empty for all
      text = '',
      fields = {}
    } = options;

    // Build query parameters
    const params = new URLSearchParams({
      rid: roomId,
      offset: offset.toString(),
      count: count.toString()
    });

    // Add optional parameters if provided
    if (Object.keys(sort).length > 0) {
      params.append('sort', JSON.stringify(sort));
    }
    
    if (type) {
      params.append('type', type);
    }
    
    if (text) {
      params.append('text', text);
    }
    
    if (Object.keys(fields).length > 0) {
      params.append('fields', JSON.stringify(fields));
    }

    const response = await api.get(`/chat.getThreadsList?${params.toString()}`);
    
    return {
      success: true,
      threads: response.data.threads || [],
      count: response.data.count || 0,
      offset: response.data.offset || 0,
      total: response.data.total || 0
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get threads list',
    };
  }
};
