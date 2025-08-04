const Comment = require('../db/model/commentModel');
const UserAccount = require('../db/model/userModel');
const { createCommentSchema, updateCommentSchema, getCommentsSchema } = require('../inputValidator/commentValidator');

/**
 * Create a new comment
 */
const createComment = async (req, res) => {
    try {
        const { error, value } = createCommentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { animeId, episodeId, content } = value;
        const userId = req.user.id;

        const comment = await Comment.create({
            animeId,
            episodeId,
            userId,
            content: content.trim()
        });

        // Fetch the comment with user details
        const commentWithUser = await Comment.findOne({
            where: { id: comment.id },
            include: [{
                model: UserAccount,
                as: 'user',
                attributes: ['id', 'username', 'pfp']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: commentWithUser
        });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get comments for a specific anime episode
 */
const getComments = async (req, res) => {
    try {
        const { error, value } = getCommentsSchema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { animeId, episodeId, page = 1, limit = 20 } = value;
        const offset = (page - 1) * limit;

        const { count, rows: comments } = await Comment.findAndCountAll({
            where: {
                animeId,
                episodeId
            },
            include: [{
                model: UserAccount,
                as: 'user',
                attributes: ['id', 'username', 'pfp']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: {
                comments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalComments: count,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update a comment (only by the comment owner)
 */
const updateComment = async (req, res) => {
    try {
        const { error, value } = updateCommentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { content } = value;
        const commentId = req.params.id;
        const userId = req.user.id;

        const comment = await Comment.findOne({
            where: { id: commentId }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (comment.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own comments'
            });
        }

        await comment.update({
            content: content.trim(),
            isEdited: true
        });

        // Fetch updated comment with user details
        const updatedComment = await Comment.findOne({
            where: { id: commentId },
            include: [{
                model: UserAccount,
                as: 'user',
                attributes: ['id', 'username', 'pfp']
            }]
        });

        res.json({
            success: true,
            message: 'Comment updated successfully',
            data: updatedComment
        });
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Delete a comment (only by the comment owner or admin)
 */
const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const comment = await Comment.findOne({
            where: { id: commentId }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Allow deletion if user is admin or comment owner
        if (comment.userId !== userId && userRole !== 'root') {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own comments'
            });
        }

        await comment.destroy();

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get user's comments
 */
const getUserComments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: comments } = await Comment.findAndCountAll({
            where: { userId },
            include: [{
                model: UserAccount,
                as: 'user',
                attributes: ['id', 'username', 'pfp']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: {
                comments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalComments: count,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get user comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createComment,
    getComments,
    updateComment,
    deleteComment,
    getUserComments
}; 