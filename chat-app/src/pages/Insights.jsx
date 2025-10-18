import React from 'react';

const Insights = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Insights</h1>
          <p className="text-gray-600">Analytics and statistics for team communication</p>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-600 mb-6">
            Comprehensive insights into team communication patterns, activity levels, and engagement metrics.
          </p>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-medium text-purple-900 mb-2">Planned Features:</h4>
            <ul className="text-sm text-purple-800 space-y-1 text-left">
              <li>• User activity analytics</li>
              <li>• Team contribution metrics</li>
              <li>• Most active hours visualization</li>
              <li>• Reaction statistics</li>
              <li>• Channel activity insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
