import React from 'react';

const Search = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Search</h1>
          <p className="text-gray-600">Advanced search with filters and shareable results</p>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Search Coming Soon</h3>
          <p className="text-gray-600 mb-6">
            Powerful search capabilities with multi-filter options and shareable URLs for your search results.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-medium text-green-900 mb-2">Planned Features:</h4>
            <ul className="text-sm text-green-800 space-y-1 text-left">
              <li>• Multi-filter search (user, channel, date)</li>
              <li>• File type filtering</li>
              <li>• Inline message/file previews</li>
              <li>• Shareable search URLs</li>
              <li>• Search history and saved searches</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
