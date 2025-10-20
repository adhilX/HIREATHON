import React, { useState } from 'react';
import { createChannel } from '../services';

const CreateChannel = ({ isOpen, onClose, onChannelCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    readOnly: false,
    broadcast: false,
    encrypted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Channel name is required');
      return;
    }

    // Validate channel name (no spaces, special characters)
    const channelNameRegex = /^[a-zA-Z0-9-_]+$/;
    if (!channelNameRegex.test(formData.name)) {
      setError('Channel name can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createChannel(formData);
      
      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          readOnly: false,
          broadcast: false,
          encrypted: false,
        });
        
        // Notify parent component
        if (onChannelCreated) {
          onChannelCreated(result.channel);
        }
        
        // Close modal
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to create channel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      readOnly: false,
      broadcast: false,
      encrypted: false,
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black border border-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Create Channel</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Channel Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              Channel Name *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400">#</span>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. general, random, development"
                className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Use lowercase letters, numbers, hyphens, and underscores only
            </p>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What's this channel about?"
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 resize-none"
            />
          </div>

          {/* Channel Options */}
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-medium text-white">Channel Options</h3>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="readOnly"
                checked={formData.readOnly}
                onChange={handleInputChange}
                className="rounded border-white/20 bg-white/10 text-green-500 focus:ring-green-500/50 focus:ring-offset-0"
              />
              <span className="ml-2 text-sm text-gray-300">Read-only channel</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="broadcast"
                checked={formData.broadcast}
                onChange={handleInputChange}
                className="rounded border-white/20 bg-white/10 text-green-500 focus:ring-green-500/50 focus:ring-offset-0"
              />
              <span className="ml-2 text-sm text-gray-300">Broadcast channel</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="encrypted"
                checked={formData.encrypted}
                onChange={handleInputChange}
                className="rounded border-white/20 bg-white/10 text-green-500 focus:ring-green-500/50 focus:ring-offset-0"
              />
              <span className="ml-2 text-sm text-gray-300">Encrypted channel</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center hover:shadow-lg hover:shadow-green-500/30"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannel;
