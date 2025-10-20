// User status constants
export const USER_STATUS = {
  ONLINE: 'online',
  AWAY: 'away',
  DND: 'dnd',
  OFFLINE: 'offline',
};

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
  THREAD: 'thread',
};

// Notification types
export const NOTIFICATION_TYPES = {
  MENTION: 'mention',
  THREAD_REPLY: 'thread_reply',
  DIRECT_MESSAGE: 'direct_message',
  CHANNEL_MESSAGE: 'channel_message',
  STATUS_UPDATE: 'status_update',
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  DND_TOGGLE: 'ctrl+shift+d',
  NEW_THREAD: 'ctrl+t',
  ESCAPE: 'escape',
  ENTER: 'enter',
};

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/v1/login',
  LOGOUT: '/api/v1/logout',
  ME: '/api/v1/me',
  ROOMS: '/api/v1/rooms.get',
  MESSAGES: '/api/v1/channels.history',
  SEND_MESSAGE: '/api/v1/chat.sendMessage',
  ROOM_INFO: '/api/v1/rooms.info',
  USER_STATUS: '/api/v1/users.setStatus',
  THREADS: '/api/v1/chat.getThreadsList',
  PINNED_MESSAGES: '/api/v1/chat.getPinnedMessages',
  NOTIFICATIONS: '/api/v1/notifications.get',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_ID: 'userId',
  USER_DATA: 'user',
  USER_STATUS: 'userStatus',
  NOTIFICATION_SETTINGS: 'notificationSettings',
  THEME: 'theme',
};

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Modal sizes
export const MODAL_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  XL: 'xl',
};

// Button variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  OUTLINE: 'outline',
  GHOST: 'ghost',
};

// Button sizes
export const BUTTON_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Icon sizes
export const ICON_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  XL: 'xl',
};

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Polling intervals
export const POLLING_INTERVALS = {
  MESSAGES: 3000,
  USER_STATUS: 5000,
  NOTIFICATIONS: 10000,
  STATS: 30000,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  LOAD_MORE_THRESHOLD: 5,
};


// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
  MAX_FILES: 5,
};

// Validation
export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  MESSAGE_MAX_LENGTH: 1000,
  PASSWORD_MIN_LENGTH: 8,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  MESSAGE_SEND_FAILED: 'Failed to send message. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  MESSAGE_SENT: 'Message sent successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  STATUS_UPDATED: 'Status updated successfully!',
};
