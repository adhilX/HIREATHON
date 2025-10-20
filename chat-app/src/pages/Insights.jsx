
import React, { useState, useEffect } from 'react';
import { getFullAnalytics } from '../services';
import { 
  HiChartBarSquare, 
  HiUsers, 
  HiChatBubbleLeftRight, 
  HiClock,
  HiArrowTrendingUp,
  HiArrowPath,
  HiExclamationTriangle
} from 'react-icons/hi2';

const Insights = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overview: null,
    userActivity: [],
    hourlyActivity: [],
    channelActivity: [],
    recentActivity: []
  });
  const [error, setError] = useState(null);

  const maxMessages = analyticsData.hourlyActivity.length > 0 
    ? Math.max(...analyticsData.hourlyActivity.map(h => h.messages))
    : 100;

  // Fetch analytics data
  const fetchAnalyticsData = async (selectedTimeRange = timeRange) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getFullAnalytics(selectedTimeRange);
      
      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        setError(result.error || 'Failed to load analytics data');
      }
    } catch (err) {
      setError('An unexpected error occurred while loading analytics');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data function
  const refreshData = () => {
    fetchAnalyticsData(timeRange);
  };

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
    fetchAnalyticsData(newTimeRange);
  };

  // Initial data load
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Format relative time for recent activity
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="h-full bg-black overflow-y-auto scrollbar-green smooth-scroll">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Insights into team communication and activity</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select 
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              disabled={loading}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            {/* Refresh Button */}
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <HiArrowPath className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 flex items-center space-x-3">
            <HiExclamationTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <div className="text-red-400 font-medium">Error Loading Analytics</div>
              <div className="text-red-300 text-sm">{error}</div>
            </div>
            <button
              onClick={refreshData}
              className="ml-auto px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading analytics data...</p>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        {!loading && analyticsData.overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <HiChatBubbleLeftRight className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{analyticsData.overview.totalMessages?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-400">Total Messages</div>
                </div>
              </div>
              <div className="flex items-center text-green-400 text-sm">
                <HiArrowTrendingUp className="w-4 h-4 mr-1" />
                Live data from {timeRange}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <HiUsers className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{analyticsData.overview.activeUsers || '0'}</div>
                  <div className="text-sm text-gray-400">Active Users</div>
                </div>
              </div>
              <div className="flex items-center text-green-400 text-sm">
                <HiArrowTrendingUp className="w-4 h-4 mr-1" />
                Real-time count
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <HiChartBarSquare className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{analyticsData.overview.totalChannels || '0'}</div>
                  <div className="text-sm text-gray-400">Total Channels</div>
                </div>
              </div>
              <div className="flex items-center text-blue-400 text-sm">
                From Rocket.Chat API
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <HiClock className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{analyticsData.overview.avgResponseTime || 'N/A'}</div>
                  <div className="text-sm text-gray-400">Avg Response Time</div>
                </div>
              </div>
              <div className="flex items-center text-yellow-400 text-sm">
                Calculated metric
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hourly Activity Chart */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Activity by Hour</h3>
              <div className="space-y-2">
                {analyticsData.hourlyActivity.map((item) => (
                <div key={item.hour} className="flex items-center space-x-3">
                  <div className="w-8 text-sm text-gray-400">{item.hour}:00</div>
                  <div className="flex-1 bg-white/10 rounded-full h-2 relative">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(item.messages / maxMessages) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm text-gray-400 text-right">{item.messages}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Top Contributors</h3>
            <div className="space-y-4">
              {analyticsData.userActivity.map((user, index) => (
                <div key={`${user.username || user.name}-${index}`} className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full text-white font-semibold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.messages} messages</div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs text-gray-500">{user.reactions} reactions</div>
                      <div className={`w-2 h-2 rounded-full ${
                        user.status === 'online' ? 'bg-green-500' :
                        user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Activity */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Channel Activity</h3>
            <div className="space-y-4">
              {analyticsData.channelActivity.map((channel) => (
                <div key={channel.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-400">#</div>
                    <div className="font-medium text-white">{channel.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{channel.messages} messages</div>
                    <div className="text-xs text-gray-400">{channel.members} members</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {analyticsData.recentActivity.length > 0 ? (
                analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 ${activity.color} rounded-full mt-2`}></div>
                    <div>
                      <div className="text-white text-sm">{activity.message}</div>
                      <div className="text-gray-400 text-xs">{formatRelativeTime(activity.timestamp)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm">No recent activity available</div>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
