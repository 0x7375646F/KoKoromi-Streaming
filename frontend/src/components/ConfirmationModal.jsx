import { useState } from 'react';
import { FaXmark, FaTrash, FaBan } from 'react-icons/fa6';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type, 
  user, 
  title, 
  message, 
  confirmText, 
  confirmColor = 'red',
  showReasonInput = false 
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (showReasonInput && !reason.trim()) {
      return; // Don't proceed if reason is required but not provided
    }
    
    setIsLoading(true);
    try {
      await onConfirm(reason);
      onClose();
      setReason('');
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <FaTrash className="w-6 h-6 text-red-400" />;
      case 'ban':
        return <FaBan className="w-6 h-6 text-red-400" />;
      default:
        return <span className="w-6 h-6 text-yellow-400 text-2xl">⚠️</span>;
    }
  };

  const getConfirmButtonClass = () => {
    switch (confirmColor) {
      case 'red':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'yellow':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'green':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-red-600 hover:bg-red-700 text-white';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card/95 backdrop-blur-sm border border-white/10 rounded-xl p-6 w-full max-w-md relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FaXmark size={20} />
        </button>

        {/* Icon and Title */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">{message}</p>
        </div>

        {/* User Info */}
        {user && (
          <div className="mb-6 p-4 bg-backGround/50 border border-white/10 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={user.picture || user.pfp || '/default-avatar.svg'}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/default-avatar.svg';
                }}
              />
              <div>
                <p className="text-white font-medium">{user.username}</p>
                <p className="text-gray-400 text-sm">ID: {user.id}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reason Input (for ban actions) */}
        {showReasonInput && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for {type === 'ban' ? 'banning' : 'action'} (required)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Enter reason for ${type === 'ban' ? 'banning' : 'this action'}...`}
              className="w-full px-4 py-3 bg-backGround border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors resize-none"
              rows={3}
              required
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || (showReasonInput && !reason.trim())}
            className={`flex-1 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonClass()}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 