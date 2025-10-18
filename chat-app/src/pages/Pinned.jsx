import React from 'react';

const Pinned = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pinned Messages</h1>
          <p className="text-gray-600">Important messages pinned across all channels</p>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Pinned Messages Dashboard</h3>
          <p className="text-gray-600 mb-6">
            A centralized dashboard to view and manage all pinned messages across your channels and teams.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-medium text-yellow-900 mb-2">Planned Features:</h4>
            <ul className="text-sm text-yellow-800 space-y-1 text-left">
              <li>• View all pinned messages</li>
              <li>• Filter by team, project, or date</li>
              <li>• Pin/unpin functionality</li>
              <li>• Search through pinned content</li>
              <li>• Export pinned messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pinned;
