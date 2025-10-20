import { useState, useEffect, useCallback } from 'react';
import { getRooms, getThreadsList, getThreadMessages, getMessages } from '../services';
import { useAuth } from '../contexts/AuthContext';

export const useThreads = (options = {}) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extract options with defaults
  const {
    type = 'following', // 'following', 'unread', or '' for all
    roomId = null, // Specific room ID, or null for all rooms
    count = 50,
    searchText = ''
  } = options;

  // Fetch all threads from all rooms using the new API
  const fetchThreads = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const allThreads = [];
      let roomsToProcess = [];

      if (roomId) {
        // If specific room ID provided, only process that room
        roomsToProcess = [{ _id: roomId, name: 'Current Room' }];
      } else {
        // Get all rooms
        const roomsResult = await getRooms();
        if (!roomsResult.success) {
          throw new Error(roomsResult.error);
        }
        roomsToProcess = roomsResult.rooms;
      }

      // Process each room to get threads using the new API
      for (const room of roomsToProcess) {
        try {
          // Get threads from this room using the new API
          const threadsResult = await getThreadsList(room._id, {
            count,
            sort: { 'ts': -1 }, // Sort by newest first
            type,
            text: searchText
          });

          if (threadsResult.success && threadsResult.threads) {
            // Process each thread and fetch its replies
            for (const apiThread of threadsResult.threads) {
              try {
                // Get the actual thread replies
                const threadMessagesResult = await getThreadMessages(room._id, apiThread._id, {
                  count: 100 // Get up to 100 replies per thread
                });

                let replies = [];
                let lastReply = null;
                
                if (threadMessagesResult.success) {
                  // Filter out the parent message and get only replies
                  replies = threadMessagesResult.messages.filter(msg => 
                    msg.tmid === apiThread._id && msg._id !== apiThread._id
                  );
                  lastReply = replies[replies.length - 1] || null;
                }

                const participants = [...new Set(replies.map(r => r.u?._id))];
                
                allThreads.push({
                  id: apiThread._id,
                  parentMessage: {
                    _id: apiThread._id,
                    msg: apiThread.msg,
                    ts: apiThread.ts,
                    u: apiThread.u,
                    rid: room._id
                  },
                  replies: replies,
                  room,
                  replyCount: apiThread.tcount || replies.length || 0,
                  lastActivity: new Date(apiThread.tlm || lastReply?.ts || apiThread.ts || Date.now()),
                  lastReply: lastReply,
                  participants: participants.length,
                  unreadCount: apiThread.unread || 0,
                  hasMentions: apiThread.mentions?.includes(user._id) || 
                             replies.some(r => r.msg?.includes(`@${user.username}`))
                });
              } catch (err) {
                console.error(`Error fetching replies for thread ${apiThread._id}:`, err);
                // Add thread without replies if fetching fails
                allThreads.push({
                  id: apiThread._id,
                  parentMessage: {
                    _id: apiThread._id,
                    msg: apiThread.msg,
                    ts: apiThread.ts,
                    u: apiThread.u,
                    rid: room._id
                  },
                  replies: [],
                  room,
                  replyCount: apiThread.tcount || 0,
                  lastActivity: new Date(apiThread.tlm || apiThread.ts || Date.now()),
                  lastReply: null,
                  participants: 0,
                  unreadCount: apiThread.unread || 0,
                  hasMentions: false
                });
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching threads for room ${room._id}:`, err);
          // Continue with other rooms even if one fails
        }
      }

      // Sort threads by last activity (newest first)
      allThreads.sort((a, b) => b.lastActivity - a.lastActivity);
      
      setThreads(allThreads);
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, type, roomId, count, searchText]);

  // Fetch replies for a specific thread
  const fetchThreadReplies = useCallback(async (roomId, threadId) => {
    try {
      console.log('Fetching thread replies for:', { roomId, threadId });
      
      // Try the specific thread messages API first
      const threadMessagesResult = await getThreadMessages(roomId, threadId, {
        count: 100
      });

      console.log('Thread messages result:', threadMessagesResult);

      if (threadMessagesResult.success && threadMessagesResult.messages.length > 0) {
        console.log('All messages from thread API:', threadMessagesResult.messages);
        
        // Filter out the parent message and get only replies
        const replies = threadMessagesResult.messages.filter(msg => {
          console.log('Checking message:', { id: msg._id, tmid: msg.tmid, threadId });
          return msg.tmid === threadId && msg._id !== threadId;
        });
        
        console.log('Filtered replies from thread API:', replies);
        return replies;
      }

      // Fallback: Get all messages from room and filter for this thread
      console.log('Fallback: Getting all room messages and filtering...');
      const allMessagesResult = await getMessages(roomId, 200); // Get more messages to find threads
      
      if (allMessagesResult.success) {
        console.log('All room messages:', allMessagesResult.messages);
        
        const threadReplies = allMessagesResult.messages.filter(msg => {
          const isThreadReply = msg.tmid === threadId && msg._id !== threadId;
          if (isThreadReply) {
            console.log('Found thread reply:', msg);
          }
          return isThreadReply;
        });
        
        console.log('Filtered thread replies from room messages:', threadReplies);
        return threadReplies;
      }

      return [];
    } catch (err) {
      console.error(`Error fetching replies for thread ${threadId}:`, err);
      return [];
    }
  }, []);

  // Refresh threads
  const refreshThreads = useCallback(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    loading,
    error,
    refreshThreads,
    fetchThreadReplies,
    totalThreads: threads.length,
    totalUnread: threads.reduce((sum, thread) => sum + thread.unreadCount, 0),
    totalMentions: threads.filter(thread => thread.hasMentions).length
  };
};
