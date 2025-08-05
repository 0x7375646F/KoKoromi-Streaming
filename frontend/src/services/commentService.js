import axios from 'axios';
import {API_BACKEND_URL} from '../config/config';

/**
 * Create axios instance with auth token
 */
const createApiInstance = () => {
    const token = localStorage.getItem('authToken');
    return axios.create({
        baseURL: API_BACKEND_URL,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        }
    });
};

/**
 * Create a new comment
 */
export const createComment = async (animeId, episodeId, content) => {
    try {
        const api = createApiInstance();
        const response = await api.post('/comments', {
            animeId,
            episodeId,
            content
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create comment');
    }
};

/**
 * Get comments for a specific anime episode
 */
export const getComments = async (animeId, episodeId, page = 1, limit = 20) => {
    try {
        const api = createApiInstance();
        const response = await api.get('/comments/episode', {
            params: {
                animeId,
                episodeId,
                page,
                limit
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch comments');
    }
};

/**
 * Update a comment
 */
export const updateComment = async (commentId, content) => {
    try {
        const api = createApiInstance();
        const response = await api.put(`/comments/${commentId}`, {
            content
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update comment');
    }
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId) => {
    try {
        const api = createApiInstance();
        const response = await api.delete(`/comments/${commentId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete comment');
    }
};

/**
 * Get user's comments
 */
export const getUserComments = async (page = 1, limit = 20) => {
    try {
        const api = createApiInstance();
        const response = await api.get('/comments/user', {
            params: {
                page,
                limit
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user comments');
    }
}; 