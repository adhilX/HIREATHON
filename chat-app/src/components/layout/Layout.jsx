import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigation = [
    { name: 'Chat', href: '/dashboard', icon: '💬', description: 'Messages & Channels' },
    { name: 'Team', href: '/team', icon: '👥', description: 'Team Presence' },
    { name: 'Threads', href: '/threads', icon: '🧵', description: 'All Threads' },
    { name: 'Pinned', href: '/pinned', icon: '📌', description: 'Pinned Messages' },
    { name: 'Search', href: '/search', icon: '🔍', description: 'Advanced Search' },
    { name: 'Insights', href: '/insights', icon: '📊', description: 'Analytics' },
  ];

  const handleLogout = () => {
    logout();
  };

  const getPageTitle = () => {
    const currentPage = navigation.find(item => item.href === location.pathname);
    return currentPage ? currentPage.name : 'Dashboard';
  };

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Sidebar */}
      <div className={`bg-gray-800 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RC</span>
                </div>
                <h1 className="text-white font-semibold">Rocket.Chat</h1>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-400 hover:text-white p-1 rounded transition-colors"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75 truncate">{item.description}</div>
                  </div>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-2 border-t border-gray-700">
          <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}>
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">
                  {user?.name || user?.username}
                </div>
                <div className="text-green-400 text-xs">Online</div>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="w-full mt-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-left"
            >
              🚪 Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {navigation.find(item => item.href === location.pathname)?.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                🔔
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
