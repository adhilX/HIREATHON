import React from 'react';
import './RoomList.css';

const RoomList = ({ rooms, currentRoom, onRoomSelect }) => {
  const getRoomIcon = (room) => {
    if (room.t === 'c') return '#';
    if (room.t === 'd') return '@';
    return '🔒';
  };

  const truncateText = (text, length) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  return (
    <div className="h-full">
      <div className="p-4 space-y-2">
        {rooms.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">💬</div>
            <p className="text-sm text-gray-400">No channels available</p>
            <p className="text-xs text-gray-500 mt-1">Create a channel to get started</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room._id}
              className={`group flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                currentRoom?._id === room._id
                  ? 'bg-green-500 border-l-4 border-green-400 shadow-lg shadow-green-500/20'
                  : 'hover:bg-green-500/10 hover:shadow-lg hover:shadow-green-500/10'
              }`}
              onClick={() => onRoomSelect(room)}
            >
              {/* Channel Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                currentRoom?._id === room._id
                  ? 'bg-white text-green-500 shadow-sm'
                  : 'bg-green-500/20 text-white group-hover:bg-green-500/30 group-hover:shadow-sm group-hover:shadow-green-500/20'
              }`}>
                {getRoomIcon(room)}
              </div>
              
              {/* Channel Info */}
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate transition-colors duration-300 ${
                  currentRoom?._id === room._id
                    ? 'text-white'
                    : 'text-white'
                }`}>
                  {room.name || room.fname || 'Unnamed Room'}
                </div>
                <div className={`text-xs truncate mt-0.5 transition-colors duration-300 ${
                  currentRoom?._id === room._id
                    ? 'text-green-100'
                    : 'text-gray-400'
                }`}>
                  {truncateText(room.topic || room.lastMessage?.msg || 'No recent messages', 40)}
                </div>
              </div>
              
              {/* Unread Badge */}
              {room.unread > 0 && (
                <div className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center shadow-sm shadow-green-500/30">
                  {room.unread > 99 ? '99+' : room.unread}
                </div>
              )}
              
              {/* Active Indicator */}
              {currentRoom?._id === room._id && (
                <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoomList;

