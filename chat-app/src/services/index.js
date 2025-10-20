// Central export file for all services
// This allows for clean imports like: import { login, getRooms } from '../services'

// Authentication services
export {
  login,
  signup,
  getUserInfo,
  logout
} from './auth';

// Room services
export {
  getRooms,
  createChannel,
  getRoomInfo,
  getRoomRoles,
  canAddUsersToRoom
} from './rooms';

// Message services
export {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  pinMessage,
  unpinMessage,
  getPinnedMessages
} from './messages';

// Thread services
export {
  getThreadMessages,
  getThreadsList
} from './threads';

// User services
export {
  getUsersPresence,
  getAllUsers,
  getUserPresence,
  setUserPresence
} from './users';

// Channel management services
export {
  addUserToChannel,
  addUsersToChannel,
  getChannelMembers,
  removeUserFromChannel,
  addChannelModerator,
  removeChannelModerator
} from './channels';

// Analytics services
export {
  getAnalyticsOverview,
  getUserActivityAnalytics,
  getChannelActivityAnalytics,
  getHourlyActivityAnalytics,
  getRecentActivity,
  getFullAnalytics
} from './analytics';
