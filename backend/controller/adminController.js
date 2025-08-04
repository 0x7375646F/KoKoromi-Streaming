const fetch = require('node-fetch');
const { Op } = require('sequelize');
const UserAccount = require('../db/model/userModel');
const ApiStatus = require('../db/model/apiStatusModel');
const Comment = require('../db/model/commentModel');
const apiMonitorService = require('../services/apiMonitorService');
const { generateUserAvatar } = require('../utils/avatarGenerator');
const { 
    apiStatusSchema,
    updateApiStatusSchema,
    userManagementSchema 
} = require('../inputValidator/adminValidator');

// User Management
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};
        
        if (search) {
            whereClause = {
                [Op.or]: [
                    { username: { [Op.like]: `%${search}%` } },
                    { id: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        if (status) {
            if (status === 'verified') whereClause.verified = true;
            else if (status === 'unverified') whereClause.verified = false;
            else if (status === 'banned') whereClause.banned = true;
            else if (status === 'active') whereClause.banned = false;
        }

        const { count, rows: users } = await UserAccount.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['password', 'totp'] }
        });

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalUsers: count,
                    usersPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserAccount.findByPk(id, {
            attributes: { exclude: ['password', 'totp'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const manageUser = async (req, res) => {
    try {
        const { error, value } = userManagementSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { userId, action, reason } = value;
        const user = await UserAccount.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Only require reason for ban
        if (action === 'ban' && (!reason || !reason.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Reason is required to ban a user.'
            });
        }

        let message = '';
        switch (action) {
            case 'ban':
                await user.update({ banned: true });
                message = `User ${user.username} has been banned`;
                break;
            case 'unban':
                await user.update({ banned: false });
                message = `User ${user.username} has been unbanned`;
                break;
            case 'delete':
                await user.destroy();
                message = `User ${user.username} has been deleted`;
                break;
        }

        res.json({
            success: true,
            message,
            data: {
                userId,
                action,
                reason: reason || null
            }
        });
    } catch (error) {
        console.error('Manage user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// API Status Management
const getAllApiStatus = async (req, res) => {
    try {
        const { category = '' } = req.query;
        let whereClause = {};
        
        if (category) {
            whereClause.category = category;
        }

        const apis = await ApiStatus.findAll({
            where: whereClause,
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: apis
        });
    } catch (error) {
        console.error('Get all API status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const addApiStatus = async (req, res) => {
    try {
        const { error, value } = apiStatusSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const api = await apiMonitorService.addApi(value);

        res.status(201).json({
            success: true,
            message: 'API status added successfully',
            data: api
        });
    } catch (error) {
        console.error('Add API status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const updateApiStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateApiStatusSchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const api = await apiMonitorService.updateApi(id, value);

        res.json({
            success: true,
            message: 'API status updated successfully',
            data: api
        });
    } catch (error) {
        console.error('Update API status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const deleteApiStatus = async (req, res) => {
    try {
        const { id } = req.params;
        await apiMonitorService.removeApi(id);

        res.json({
            success: true,
            message: 'API status deleted successfully'
        });
    } catch (error) {
        console.error('Delete API status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const checkApiStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const api = await ApiStatus.findByPk(id);

        if (!api) {
            return res.status(404).json({
                success: false,
                message: 'API status not found'
            });
        }

        // Use the monitoring service to check the API status
        await apiMonitorService.checkApiStatus(api);

        // Get the updated API data
        const updatedApi = await ApiStatus.findByPk(id);

        res.json({
            success: true,
            message: 'API status checked successfully',
            data: {
                id: updatedApi.id,
                name: updatedApi.name,
                status: updatedApi.status,
                responseTime: updatedApi.responseTime,
                lastError: updatedApi.lastError,
                lastCheck: updatedApi.lastCheck
            }
        });
    } catch (error) {
        console.error('Check API status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get monitoring service status
const getMonitoringStatus = async (req, res) => {
    try {
        const status = apiMonitorService.getMonitoringStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Get monitoring status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await UserAccount.count();
        const verifiedUsers = await UserAccount.count({ where: { verified: true } });
        const bannedUsers = await UserAccount.count({ where: { banned: true } });
        const totalApis = await ApiStatus.count();
        const upApis = await ApiStatus.count({ where: { status: 'up' } });
        const downApis = await ApiStatus.count({ where: { status: 'down' } });
        const totalComments = await Comment.count();

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentUsers = await UserAccount.count({
            where: {
                createdAt: {
                    [Op.gte]: sevenDaysAgo
                }
            }
        });

        const recentComments = await Comment.count({
            where: {
                createdAt: {
                    [Op.gte]: sevenDaysAgo
                }
            }
        });

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    verified: verifiedUsers,
                    banned: bannedUsers,
                    recent: recentUsers
                },
                apis: {
                    total: totalApis,
                    up: upApis,
                    down: downApis
                },
                comments: {
                    total: totalComments,
                    recent: recentComments
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Admin Comment Management
const getAllComments = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', animeId = '', episodeId = '' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};
        
        if (search) {
            whereClause = {
                [Op.or]: [
                    { content: { [Op.like]: `%${search}%` } },
                    { animeId: { [Op.like]: `%${search}%` } },
                    { episodeId: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        if (animeId) {
            whereClause.animeId = animeId;
        }

        if (episodeId) {
            whereClause.episodeId = episodeId;
        }

        const { count, rows: comments } = await Comment.findAndCountAll({
            where: whereClause,
            include: [{
                model: UserAccount,
                as: 'user',
                attributes: ['id', 'username', 'pfp', 'role']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                comments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalComments: count,
                    commentsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findOne({
            where: { id: commentId },
            include: [{
                model: UserAccount,
                as: 'user',
                attributes: ['id', 'username', 'role']
            }]
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        await comment.destroy();

        res.json({
            success: true,
            message: 'Comment deleted successfully by admin',
            data: {
                deletedComment: {
                    id: comment.id,
                    content: comment.content,
                    animeId: comment.animeId,
                    episodeId: comment.episodeId,
                    user: comment.user
                }
            }
        });
    } catch (error) {
        console.error('Admin delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
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
}; 