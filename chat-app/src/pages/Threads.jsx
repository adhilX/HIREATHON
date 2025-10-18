import React from 'react';

const Threads = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Threads</h1>
          <p className="text-gray-600">Centralized view of all conversation threads</p>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🧵</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Threads Coming Soon</h3>
          <p className="text-gray-600 mb-6">
            We're working on bringing you a centralized view of all conversation threads with search and reply functionality.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-medium text-blue-900 mb-2">Planned Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Thread list with activity sorting</li>
              <li>• Unread count and mentions</li>
              <li>• Thread search and filtering</li>
              <li>• Quick reply interface</li>
              <li>• Thread notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Threads;
