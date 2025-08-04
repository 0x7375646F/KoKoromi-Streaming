import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import notify from '../utils/Toast';
import {
  getDashboardStats,
  getUsers,
  manageUser,
  getApiStatuses,
  checkApiStatus,
  getAllComments,
  deleteComment
} from '../services/adminService';
import ConfirmationModal from '../components/ConfirmationModal';

// Icons (you can use any icon library like heroicons, lucide-react, etc.)
const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    users: "👥",
    api: "🔗",
    dashboard: "📊",
    settings: "⚙️",
    logout: "🚪",
    search: "🔍",
    filter: "🔧",
    refresh: "🔄",
    check: "✅",
    ban: "🚫",
    delete: "🗑️",
    edit: "✏️",
    add: "➕",
    stats: "📈",
    warning: "⚠️",
    error: "❌",
    success: "✅",
    close: "✕",
    view: "👁️",
    eye: "👁️"
  };
  return <span className={className}>{icons[name] || "📄"}</span>;
};

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [apiStatuses, setApiStatuses] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [commentSearch, setCommentSearch] = useState('');
  const [commentAnimeId, setCommentAnimeId] = useState('');
  const [commentEpisodeId, setCommentEpisodeId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [commentPage, setCommentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: null,
    user: null,
    action: null
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
    fetchApiStatuses();
    fetchComments();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [currentPage, userSearch, userStatus]);

  useEffect(() => {
    if (activeTab === 'comments') {
      fetchComments();
    }
  }, [commentPage, commentSearch, commentAnimeId, commentEpisodeId]);

  const fetchDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      setDashboardStats(response.data);
    } catch (error) {
      notify('error', error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: userSearch,
        status: userStatus
      };
      
      const response = await getUsers(params);
      
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      notify('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiStatuses = async () => {
    try {
      const response = await getApiStatuses();
      setApiStatuses(response.data);
    } catch (error) {
      notify('error', error.message);
    }
  };

  const fetchComments = async () => {
    try {
      const params = {
        page: commentPage,
        limit: 20,
        search: commentSearch,
        animeId: commentAnimeId,
        episodeId: commentEpisodeId
      };
      
      const response = await getAllComments(params);
      
      setComments(response.data.comments);
      setCommentTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      notify('error', error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      notify('success', 'Comment deleted successfully');
      fetchComments();
    } catch (error) {
      notify('error', error.message);
    }
  };

  const handleManageUser = async (userId, action, reason = null) => {
    try {
      await manageUser(userId, action, reason);
      notify('success', `User ${action}ed successfully`);
      fetchUsers();
      fetchDashboardStats();
    } catch (error) {
      notify('error', error.message);
    }
  };

  const showConfirmationModal = (type, user, action) => {
    setConfirmationModal({
      isOpen: true,
      type,
      user,
      action
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      type: null,
      user: null,
      action: null
    });
  };

  const handleConfirmAction = async (reason = '') => {
    const { type, user, action } = confirmationModal;
    
    try {
      if (type === 'delete') {
        await handleManageUser(user.id, 'delete'); // Don't send reason for delete
      } else if (type === 'ban') {
        await handleManageUser(user.id, 'ban', reason);
      }
    } catch (error) {
      notify('error', error.message);
    }
  };

  const getModalConfig = () => {
    const { type, user } = confirmationModal;
    
    switch (type) {
      case 'delete':
        return {
          title: 'Delete User',
          message: `Are you sure you want to permanently delete ${user?.username}? This action cannot be undone.`,
          confirmText: 'Delete User',
          confirmColor: 'red',
          showReasonInput: false
        };
      case 'ban':
        return {
          title: 'Ban User',
          message: `Are you sure you want to ban ${user?.username}? They will not be able to access the platform.`,
          confirmText: 'Ban User',
          confirmColor: 'red',
          showReasonInput: true
        };
      default:
        return {};
    }
  };

  const handleCheckApiStatus = async (apiId) => {
    try {
      await checkApiStatus(apiId);
      notify('success', 'API status checked successfully');
      fetchApiStatuses();
    } catch (error) {
      notify('error', error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'up': return 'text-green-400 bg-green-400/10';
      case 'down': return 'text-red-400 bg-red-400/10';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'up': return 'success';
      case 'down': return 'error';
      case 'warning': return 'warning';
      default: return 'warning';
    }
  };

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary/80 text-sm font-medium">Total Users</p>
              <p className="text-xl lg:text-2xl font-bold text-white">{dashboardStats?.users?.total || 0}</p>
            </div>
            <Icon name="users" className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Verified Users</p>
              <p className="text-xl lg:text-2xl font-bold text-white">{dashboardStats?.users?.verified || 0}</p>
            </div>
            <Icon name="check" className="w-6 h-6 lg:w-8 lg:h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 text-sm font-medium">Banned Users</p>
              <p className="text-xl lg:text-2xl font-bold text-white">{dashboardStats?.users?.banned || 0}</p>
            </div>
            <Icon name="ban" className="w-6 h-6 lg:w-8 lg:h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total APIs</p>
              <p className="text-xl lg:text-2xl font-bold text-white">{dashboardStats?.apis?.total || 0}</p>
            </div>
            <Icon name="api" className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium">Total Comments</p>
              <p className="text-xl lg:text-2xl font-bold text-white">{dashboardStats?.comments?.total || 0}</p>
            </div>
            <Icon name="edit" className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* API Status Overview */}
      <div className="bg-card/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 lg:p-6">
        <h3 className="text-lg lg:text-xl font-semibold text-white mb-4">System Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <Icon name="success" className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
            <div>
              <p className="text-green-400 text-sm">Up APIs</p>
              <p className="text-lg lg:text-xl font-bold text-white">{dashboardStats?.apis?.up || 0}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <Icon name="error" className="w-5 h-5 lg:w-6 lg:h-6 text-red-400" />
            <div>
              <p className="text-red-400 text-sm">Down APIs</p>
              <p className="text-lg lg:text-xl font-bold text-white">{dashboardStats?.apis?.down || 0}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <Icon name="users" className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
            <div>
              <p className="text-blue-400 text-sm">Recent Users</p>
              <p className="text-lg lg:text-xl font-bold text-white">{dashboardStats?.users?.recent || 0}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <Icon name="edit" className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-400" />
            <div>
              <p className="text-yellow-400 text-sm">Recent Comments</p>
              <p className="text-lg lg:text-xl font-bold text-white">{dashboardStats?.comments?.recent || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const UsersTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card/80 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
          />
        </div>
        
        <select
          value={userStatus}
          onChange={(e) => setUserStatus(e.target.value)}
          className="px-4 py-2 bg-card/80 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
        >
          <option value="">All Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="banned">Banned</option>
          <option value="active">Active</option>
        </select>
        
        <button
          onClick={() => {
            setUserSearch('');
            setUserStatus('');
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-primary hover:bg-primary/80 text-black rounded-lg transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-card/80 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.picture || user.pfp || 'https://via.placeholder.com/40'}
                        alt={user.username}
                        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full mr-2 lg:mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">{user.username}</div>
                        <div className="text-xs lg:text-sm text-gray-400">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col lg:flex-row lg:space-x-2 space-y-1 lg:space-y-0">
                      {user.verified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          Verified
                        </span>
                      )}
                      {user.banned && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                          Banned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.role}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!user.banned ? (
                        <button
                          onClick={() => showConfirmationModal('ban', user, 'ban')}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Ban User"
                        >
                          <Icon name="ban" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleManageUser(user.id, 'unban')}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Unban User"
                        >
                          <Icon name="check" />
                        </button>
                      )}
                      <button
                        onClick={() => showConfirmationModal('delete', user, 'delete')}
                        className="text-red-600 hover:text-red-500 transition-colors"
                        title="Delete User"
                      >
                        <Icon name="delete" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-card/80 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-card/60"
          >
            Previous
          </button>
          
          <span className="px-3 py-2 text-white">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-card/80 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-card/60"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  // Unified refresh handler for all dashboard data
  const handleFullRefresh = () => {
    fetchApiStatuses();
    fetchDashboardStats();
    fetchUsers();
  };

  const ApiStatusTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg lg:text-xl font-semibold text-white">API Status Monitoring</h3>
        <button
          onClick={handleFullRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/80 text-black rounded-lg transition-colors"
        >
          <Icon name="refresh" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {apiStatuses.map((api) => (
          <div key={api.id} className="bg-card/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 lg:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">{api.name}</h4>
                <p className="text-sm text-gray-400">{api.category}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(api.status)}`}>
                <Icon name={getStatusIcon(api.status)} className="w-3 h-3 inline mr-1" />
                {api.status}
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-300 break-all">{api.url}</p>
              {api.responseTime && (
                <p className="text-sm text-gray-400">
                  Response: {api.responseTime}ms
                </p>
              )}
              {api.lastCheck && (
                <p className="text-sm text-gray-400">
                  Last Check: {new Date(api.lastCheck).toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleCheckApiStatus(api.id)}
                className="flex-1 px-3 py-2 bg-primary hover:bg-primary/80 text-black rounded-lg text-sm transition-colors"
              >
                Check Status
              </button>
              <button
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                title="Edit API"
              >
                <Icon name="edit" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CommentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg lg:text-xl font-semibold text-white">Comment Management</h3>
        <button
          onClick={fetchComments}
          className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/80 text-black rounded-lg transition-colors"
        >
          <Icon name="refresh" className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">Refresh</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <input
          type="text"
          placeholder="Search comments..."
          value={commentSearch}
          onChange={(e) => setCommentSearch(e.target.value)}
          className="px-4 py-2 bg-lightbg border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
        />
        <input
          type="text"
          placeholder="Anime ID..."
          value={commentAnimeId}
          onChange={(e) => setCommentAnimeId(e.target.value)}
          className="px-4 py-2 bg-lightbg border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
        />
        <input
          type="text"
          placeholder="Episode ID..."
          value={commentEpisodeId}
          onChange={(e) => setCommentEpisodeId(e.target.value)}
          className="px-4 py-2 bg-lightbg border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
        />
        <button
          onClick={() => {
            setCommentPage(1);
            fetchComments();
          }}
          className="px-4 py-2 bg-primary hover:bg-primary/80 text-black rounded-lg transition-colors font-medium"
        >
          Search
        </button>
        <button
          onClick={() => {
            setCommentSearch('');
            setCommentAnimeId('');
            setCommentEpisodeId('');
            setCommentPage(1);
            fetchComments();
          }}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
        >
          Clear
        </button>
      </div>

                  {/* Comments List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-card/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 lg:p-6">
            {/* Header with user info and actions */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <img
                  src={comment.user?.pfp || 'https://via.placeholder.com/40'}
                  alt={comment.user?.username}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-white truncate">{comment.user?.username}</h4>
                    {comment.user?.role === 'root' && (
                      <span className="px-2 py-1 bg-primary text-black text-xs rounded-full flex-shrink-0">Admin</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">
                      <span className="font-medium">Anime:</span> {comment.animeId}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-medium">Episode ID:</span> {comment.episodeId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                                  <button
                    onClick={() => navigate(`/watch/${comment.animeId}?ep=${comment.episodeId}`)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                    title="View Comment in Context"
                  >
                    <Icon name="view" className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline font-medium">View</span>
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                    title="Delete Comment"
                  >
                    <Icon name="delete" className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline font-medium">Delete</span>
                  </button>
              </div>
            </div>
            
            {/* Comment content */}
            <div className="bg-lightbg rounded-lg p-4 mb-4">
              <p className="text-white whitespace-pre-wrap line-clamp-3 leading-relaxed">{comment.content}</p>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-2">
                {comment.isEdited && <span className="text-orange-400">(Edited)</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {commentTotalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => {
              setCommentPage(commentPage - 1);
            }}
            disabled={commentPage === 1}
            className="px-4 py-2 bg-primary hover:bg-primary/80 disabled:bg-gray-600 text-black rounded-lg transition-colors font-medium"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-white font-medium">
            Page {commentPage} of {commentTotalPages}
          </span>
          <button
            onClick={() => {
              setCommentPage(commentPage + 1);
            }}
            disabled={commentPage === commentTotalPages}
            className="px-4 py-2 bg-primary hover:bg-primary/80 disabled:bg-gray-700 text-black rounded-lg transition-colors font-medium"
          >
            Next
          </button>
        </div>
      )}

      {comments.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No comments found</p>
          <p className="text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: 'dashboard' },
    { id: 'users', name: 'User Management', icon: 'users' },
    { id: 'comments', name: 'Comment Management', icon: 'edit' },
    { id: 'api', name: 'API Status', icon: 'api' },
    { id: 'settings', name: 'Settings', icon: 'settings' }
  ];

  return (
    <div className="min-h-screen bg-backGround">
      <Helmet>
        <title>Admin Dashboard - Kokoromi</title>
        <meta name="description" content="Admin dashboard for Kokoromi anime platform" />
      </Helmet>

      <div className="flex flex-col lg:flex-row">
        {/* Mobile Menu Button */}
        <div className="lg:hidden p-4 bg-card/80 border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-black rounded-lg"
          >
            <Icon name="dashboard" />
            <span>Menu</span>
          </button>
        </div>

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-80 bg-card/80 backdrop-blur-sm border-b lg:border-b-0 lg:border-r border-white/10 min-h-screen lg:min-h-screen`}>
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-white">Admin Panel</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white hover:text-gray-300"
              >
                <Icon name="close" />
              </button>
            </div>
            
            {/* User Info */}
            {user && (
              <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={user.picture || user.pfp || 'https://via.placeholder.com/40'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-white font-medium">{user.username}</p>
                    <p className="text-primary/80 text-sm">Super Admin</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/home')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-primary hover:bg-primary/80 text-black rounded-lg text-sm transition-colors"
                >
                  <Icon name="dashboard" />
                  <span>Return to Site</span>
                </button>
              </div>
            )}
            
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-black'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Icon name={tab.icon} className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Message */}
            <div className="mb-6 p-4 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-xl">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
                Welcome back, {user?.username}! 👑
              </h2>
              <p className="text-primary/80">
                Manage your anime platform from this admin dashboard.
              </p>
            </div>
            
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'comments' && <CommentsTab />}
            {activeTab === 'api' && <ApiStatusTab />}
            {activeTab === 'settings' && (
              <div className="text-center text-white">
                <h3 className="text-xl font-semibold mb-4">Settings</h3>
                <p className="text-gray-400">Settings panel coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirmAction}
        type={confirmationModal.type}
        user={confirmationModal.user}
        {...getModalConfig()}
      />
    </div>
  );
};

export default AdminDashboard;
