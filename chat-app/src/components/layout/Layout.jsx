import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { setUserPresence } from '../../services';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import EnhancedSearch from '../EnhancedSearch';
import { 
  HiChatBubbleLeftRight, 
  HiUsers, 
  HiChatBubbleBottomCenterText, 
  HiChartBarSquare,
  HiBell,
  HiCog6Tooth,
  HiArrowRightOnRectangle,
  HiChevronLeft,
  HiChevronRight,
  HiBookmark,
  HiChevronDown,
  HiMagnifyingGlass
} from 'react-icons/hi2';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('online');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEnhancedSearch, setShowEnhancedSearch] = useState(false);
  const statusDropdownRef = useRef(null);

  // Global search hook for Ctrl+K
  const { isOpen: isGlobalSearchOpen, close: closeGlobalSearch } = useGlobalSearch(
    () => {
      console.log('Opening enhanced search from Ctrl+K');
      setShowEnhancedSearch(true);
    }
  );
  

  const navigation = [
    { name: 'Chat', href: '/dashboard', icon: HiChatBubbleLeftRight, description: 'Messages & Channels' },
    { name: 'Users', href: '/users', icon: HiUsers, description: 'User Presence' },
    { name: 'Threads', href: '/threads', icon: HiChatBubbleBottomCenterText, description: 'All Threads' },
    { name: 'Pinned', href: '/pinned', icon: HiBookmark, description: 'Pinned Messages' },
    { name: 'Insights', href: '/insights', icon: HiChartBarSquare, description: 'Analytics' },
  ];

  const statusOptions = [
    { value: 'online', label: 'Online', color: 'bg-green-500', description: 'Available to chat' },
    { value: 'away', label: 'Away', color: 'bg-yellow-500', description: 'Stepped away' },
    { value: 'busy', label: 'Busy', color: 'bg-red-500', description: 'Do not disturb' },
    { value: 'offline', label: 'Offline', color: 'bg-gray-500', description: 'Appear offline' }
  ];

  const handleLogout = () => {
    logout();
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const result = await setUserPresence(newStatus);
      if (result.success) {
        setCurrentStatus(newStatus);
        setShowStatusDropdown(false);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getCurrentStatusInfo = () => {
    return statusOptions.find(status => status.value === currentStatus) || statusOptions[0];
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getPageTitle = () => {
    const currentPage = navigation.find(item => item.href === location.pathname);
    return currentPage ? currentPage.name : 'Dashboard';
  };

  return (
    <div className="h-screen flex bg-black">
      {/* Sidebar */}
      <div className={`bg-black border-r border-gray-800 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-white/20">
                  <span className="text-black font-bold text-sm">RC</span>
                </div>
                <h1 className="text-white font-semibold">Rocket.Chat</h1>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-white hover:text-white p-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-white/30 hover:bg-white/10"
            >
              {sidebarCollapsed ? <HiChevronRight className="w-4 h-4" /> : <HiChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto sidebar-scrollbar">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 group ${
                  isActive
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                    : 'text-gray-300 hover:bg-green-500/20 hover:text-white hover:shadow-lg hover:shadow-green-500/20'
                }`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75 truncate">{item.description}</div>
                  </div>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0 shadow-sm shadow-white/50"></div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-800 relative" ref={statusDropdownRef}>
          <button 
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={`w-full flex items-center space-x-3 p-3 mx-2 my-2 rounded-lg hover:bg-white/5 transition-all duration-300 ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            disabled={updatingStatus}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg shadow-white/30">
                <span className="text-black font-medium text-sm">
                  {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getCurrentStatusInfo().color} rounded-full border-2 border-black shadow-sm`}></div>
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-white font-medium truncate">
                    {user?.name || user?.username}
                  </div>
                  <div className="text-gray-300 text-xs">
                    {updatingStatus ? 'Updating...' : getCurrentStatusInfo().label}
                  </div>
                </div>
                <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  showStatusDropdown ? 'rotate-180' : ''
                }`} />
              </>
            )}
          </button>

          {/* Status Dropdown */}
          {showStatusDropdown && !sidebarCollapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-1 mx-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl shadow-black/50 py-1 z-50">
              <div className="px-3 py-2 border-b border-gray-700/50">
                <div className="text-white text-sm font-medium">Set Status</div>
              </div>
              <div className="py-1">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={updatingStatus}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-white/10 transition-colors duration-200 ${
                      currentStatus === status.value ? 'bg-white/15' : ''
                    } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-3 h-3 rounded-full ${status.color} flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">{status.label}</div>
                      <div className="text-gray-400 text-xs truncate">{status.description}</div>
                    </div>
                    {currentStatus === status.value && (
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Logout Button */}
          {!sidebarCollapsed && (
            <div className="px-2">
              <button
                onClick={handleLogout}
                className="w-full mt-2 px-3 py-2 text-sm text-white hover:text-white hover:bg-green-500 rounded-lg transition-all duration-300 text-left hover:shadow-lg hover:shadow-green-500/30 flex items-center space-x-2"
              >
                <HiArrowRightOnRectangle className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-black">
        {/* Top Bar */}
        <div className="bg-black border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{getPageTitle()}</h2>
              <p className="text-sm text-gray-400 mt-1">
                {navigation.find(item => item.href === location.pathname)?.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button 
                onClick={() => setShowEnhancedSearch(true)}
                className="p-2 text-white hover:text-white hover:bg-green-500 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
                title="Search Messages (Ctrl+Shift+F)"
              >
                <HiMagnifyingGlass className="w-5 h-5" />
              </button>
              

              {/* Quick Actions */}
              <button className="p-2 text-white hover:text-white hover:bg-green-500 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30">
                <HiBell className="w-5 h-5" />
              </button>
              <button className="p-2 text-white hover:text-white hover:bg-green-500 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30">
                <HiCog6Tooth className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden bg-black">
          <Outlet />
        </div>
      </div>


      {/* Enhanced Search */}
      <EnhancedSearch
        isOpen={showEnhancedSearch}
        onClose={() => {
          setShowEnhancedSearch(false);
          closeGlobalSearch();
        }}
      />
    </div>
  );
};

export default Layout;
