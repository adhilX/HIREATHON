# Services Documentation

This directory contains all the API service functions for the Rocket.Chat integration, organized by functionality.

## File Structure

```
services/
├── index.js           # Central export file for all services
├── auth.js           # Authentication related functions
├── rooms.js          # Room/channel management
├── messages.js       # Message operations (send, edit, delete, pin)
├── threads.js        # Thread-specific operations
├── users.js          # User management and presence
├── channels.js       # Channel member management
└── README.md         # This documentation
```

## Usage

### Importing Services

You can import services in two ways:

#### 1. From the central index file (Recommended)
```javascript
import { login, getRooms, sendMessage } from '../services';
```

#### 2. From specific service files
```javascript
import { login } from '../services/auth';
import { getRooms } from '../services/rooms';
import { sendMessage } from '../services/messages';
```

## Service Categories

### 🔐 Authentication (`auth.js`)
- `login(username, password)` - User login
- `signup(userData)` - User registration
- `getUserInfo()` - Get current user info
- `logout()` - User logout

### 🏠 Rooms (`rooms.js`)
- `getRooms()` - Get all rooms/channels
- `createChannel(channelData)` - Create new channel
- `getRoomInfo(roomId)` - Get room details
- `getRoomRoles(roomId)` - Get room roles and permissions
- `canAddUsersToRoom(roomId, userId)` - Check user permissions

### 💬 Messages (`messages.js`)
- `getMessages(roomId, count)` - Get room messages
- `sendMessage(roomId, message, threadId)` - Send message
- `editMessage(messageId, newText, roomId)` - Edit message
- `deleteMessage(messageId, roomId)` - Delete message
- `pinMessage(messageId)` - Pin message
- `unpinMessage(messageId)` - Unpin message
- `getPinnedMessages(roomId)` - Get pinned messages

### 🧵 Threads (`threads.js`)
- `getThreadsList(roomId, options)` - Get threads in room
- `getThreadMessages(roomId, threadId, options)` - Get thread replies

### 👥 Users (`users.js`)
- `getAllUsers()` - Get all users
- `getUsersPresence()` - Get users with presence info
- `getUserPresence(userId)` - Get specific user presence
- `setUserPresence(status)` - Set user status

### 🔧 Channels (`channels.js`)
- `addUserToChannel(channelId, userId)` - Add single user
- `addUsersToChannel(channelId, userIds)` - Add multiple users
- `getChannelMembers(channelId)` - Get channel members
- `removeUserFromChannel(channelId, userId)` - Remove user
- `addChannelModerator(channelId, userId)` - Add moderator
- `removeChannelModerator(channelId, userId)` - Remove moderator

## Response Format

All service functions return a consistent response format:

```javascript
// Success response
{
  success: true,
  data: {...}, // or specific property like 'user', 'rooms', 'messages'
  // Additional metadata like count, offset, total for paginated responses
}

// Error response
{
  success: false,
  error: "Error message"
}
```

## Examples

### Authentication
```javascript
import { login, logout } from '../services';

// Login
const result = await login('username', 'password');
if (result.success) {
  console.log('User:', result.user);
  console.log('Token:', result.authToken);
}

// Logout
await logout();
```

### Sending Messages
```javascript
import { sendMessage } from '../services';

// Regular message
const result = await sendMessage('roomId', 'Hello world!');

// Thread reply
const threadReply = await sendMessage('roomId', 'Reply text', 'parentMessageId');
```

### Managing Threads
```javascript
import { getThreadsList, getThreadMessages } from '../services';

// Get all threads in a room
const threads = await getThreadsList('roomId', {
  type: 'following',
  count: 50
});

// Get replies for a specific thread
const replies = await getThreadMessages('roomId', 'threadId');
```

## Migration from Old Structure

The old monolithic `rocketchat.js` file has been split into these organized modules. All imports have been updated to use the new structure. The central `index.js` file ensures backward compatibility and clean imports.

## Adding New Services

When adding new service functions:

1. Add the function to the appropriate service file
2. Export it from that file
3. Add the export to `services/index.js`
4. Update this README with documentation

## Error Handling

All service functions include proper error handling and return consistent response formats. Always check the `success` property before accessing data:

```javascript
const result = await someServiceFunction();
if (result.success) {
  // Use result.data or specific properties
} else {
  console.error('Error:', result.error);
}
```
