const express = require('express');
const router = express.Router();
const { 
    createComment, 
    getComments, 
    updateComment, 
    deleteComment, 
    getUserComments 
} = require('../controller/commentController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route - Get comments for an anime episode
router.get('/episode', getComments);

// Protected routes - require authentication
router.post('/', authMiddleware, createComment);
router.put('/:id', authMiddleware, updateComment);
router.delete('/:id', authMiddleware, deleteComment);
router.get('/user', authMiddleware, getUserComments);

module.exports = router; 