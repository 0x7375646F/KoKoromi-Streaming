import { useState, useEffect } from "react";
import { FaXmark, FaUser, FaCheck, FaTrash, FaArrowRightFromBracket } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import authService from "../services/authService";
import useAuthStore from "../store/authStore";

// Utility function to get effective profile picture
const getEffectiveProfilePic = (user) => {
  return user?.pfp || '/default-avatar.svg';
};

const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showUsernameEdit, setShowUsernameEdit] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewUsername("");
      setCurrentPassword("");
      setNewPassword("");
      setShowUsernameEdit(false);
      setShowPasswordEdit(false);
    }
  }, [isOpen]);

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast.error("Please enter a new username");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.updateUsername(newUsername);
      
      if (result.success) {
        toast.success("Username updated successfully!");
        updateUser({ username: newUsername });
        setShowUsernameEdit(false);
        setNewUsername("");
      } else {
        toast.error(result.message || "Failed to update username");
      }
    } catch (error) {
      console.error("Update username error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      toast.error("Please fill in all password fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.updatePassword(currentPassword, newPassword);
      
      if (result.success) {
        toast.success("Password updated successfully!");
        setShowPasswordEdit(false);
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error(result.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Update password error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.deleteAccount();
      
      if (result.success) {
        toast.success("Account deleted successfully");
        logout();
        onClose();
      } else {
        toast.error(result.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      logout();
      toast.success("Logged out successfully!");
      onClose();
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-card/90 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition-colors p-2 -m-2"
        >
          <FaXmark size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Profile Settings</h2>
          <p className="text-sm sm:text-base text-gray-400">Manage your profile and avatar</p>
        </div>

        {/* Current Profile Picture */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="relative inline-block">
            <img
              src={getEffectiveProfilePic(user)}
              alt={user?.username || 'User'}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-600 mx-auto mb-3 sm:mb-4"
              onError={(e) => {
                e.target.src = '/default-avatar.svg';
              }}
            />
            {user?.pfp && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-primary text-black rounded-full p-1">
                <FaCheck size={10} className="sm:w-3 sm:h-3" />
              </div>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white">{user?.username}</h3>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
              User
            </span>
          </div>
        </div>

        {/* Account Settings */}
        <div className="space-y-4">
          <h4 className="text-base sm:text-lg font-semibold text-white">Account Settings</h4>
          
          {/* Username Update */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base text-gray-300">Username</span>
              {!showUsernameEdit && (
                <button
                  onClick={() => setShowUsernameEdit(true)}
                  className="text-primary hover:text-primary/80 transition-colors p-2 -m-2"
                >
                  <FaEdit size={16} />
                </button>
              )}
            </div>
            
            {showUsernameEdit ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-backGround border border-gray-600 rounded-md text-white focus:outline-none focus:border-primary transition-colors text-sm sm:text-base"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateUsername}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-primary text-black rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaCheck size={16} />
                    )}
                    Update
                  </button>
                  <button
                    onClick={() => setShowUsernameEdit(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors text-sm sm:text-base font-medium"
                  >
                    <FaTimes size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-backGround border border-gray-600 rounded-md text-white text-sm sm:text-base">
                {user?.username}
              </div>
            )}
          </div>

          {/* Password Update */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base text-gray-300">Password</span>
              {!showPasswordEdit && (
                <button
                  onClick={() => setShowPasswordEdit(true)}
                  className="text-primary hover:text-primary/80 transition-colors p-2 -m-2"
                >
                  <FaEdit size={16} />
                </button>
              )}
            </div>
            
            {showPasswordEdit ? (
              <div className="space-y-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-backGround border border-gray-600 rounded-md text-white focus:outline-none focus:border-primary transition-colors text-sm sm:text-base"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-backGround border border-gray-600 rounded-md text-white focus:outline-none focus:border-primary transition-colors text-sm sm:text-base"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdatePassword}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-primary text-black rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaCheck size={16} />
                    )}
                    Update
                  </button>
                  <button
                    onClick={() => setShowPasswordEdit(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors text-sm sm:text-base font-medium"
                  >
                    <FaTimes size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-backGround border border-gray-600 rounded-md text-gray-400 text-sm sm:text-base">
                ••••••••
              </div>
            )}
          </div>
        </div>

        {/* Logout Section */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-600">
          <h4 className="text-base sm:text-lg font-semibold text-white mb-3">Session</h4>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
          >
            <FaArrowRightFromBracket size={16} />
            Logout
          </button>
        </div>

        {/* Danger Zone */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-red-500/30">
          <h4 className="text-base sm:text-lg font-semibold text-red-400 mb-3">Danger Zone</h4>
          <button
            onClick={handleDeleteAccount}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaTrash size={16} />
            )}
            Delete Account
          </button>
        </div>

        {/* Account Info */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-600">
          <h4 className="text-base sm:text-lg font-semibold text-white mb-3">Account Information</h4>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Username:</span>
              <span className="text-white">{user?.username}</span>
            </div>
            {user?.createdAt && (
              <div className="flex justify-between">
                <span className="text-gray-400">Member Since:</span>
                <span className="text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal; 