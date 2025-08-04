const express = require('express');
const router = express.Router();
const { adminAuthMiddleware, requirePermission, requireSuperAdmin } = require('../middleware/adminAuthMiddleware');
const { 
    getAllUsers, 
    getUserById, 
    manageUser, 
    getAllApiStatus, 
    addApiStatus, 
    updateApiStatus, 
    deleteApiStatus, 
    checkApiStatus, 
    getDashboardStats, 
    getMonitoringStatus,
    getAllComments,
    deleteComment
} = require('../controller/adminController');
// Dashboard Routes
router.get('/dashboard/stats', adminAuthMiddleware, getDashboardStats);
router.get('/monitoring/status', adminAuthMiddleware, getMonitoringStatus);
// User Management Routes
router.get('/users', adminAuthMiddleware, requirePermission('userManagement'), getAllUsers);
router.get('/users/:id', adminAuthMiddleware, requirePermission('userManagement'), getUserById);
router.post('/users/manage', adminAuthMiddleware, requirePermission('userManagement'), manageUser);
// API Status Management Routes
router.get('/api-status', adminAuthMiddleware, requirePermission('apiMonitoring'), getAllApiStatus);
router.post('/api-status', adminAuthMiddleware, requirePermission('apiMonitoring'), addApiStatus);
router.put('/api-status/:id', adminAuthMiddleware, requirePermission('apiMonitoring'), updateApiStatus);
router.delete('/api-status/:id', adminAuthMiddleware, requirePermission('apiMonitoring'), deleteApiStatus);
router.post('/api-status/:id/check', adminAuthMiddleware, requirePermission('apiMonitoring'), checkApiStatus);
// Comment Management Routes
router.get('/comments', adminAuthMiddleware, requirePermission('userManagement'), getAllComments);
router.delete('/comments/:commentId', adminAuthMiddleware, requirePermission('userManagement'), deleteComment);
module.exports = router; 