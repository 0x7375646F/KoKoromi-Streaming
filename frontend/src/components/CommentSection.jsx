import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { createComment, getComments, updateComment, deleteComment } from '../services/commentService';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const CommentSection = ({ animeId, episodeId }) => {
    const { user } = useAuthStore();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Fetch comments from the API
     */
    const fetchComments = async (page = 1, append = false) => {
        try {
            setIsLoading(true);
            const response = await getComments(animeId, episodeId, page);
            
            if (append) {
                setComments(prev => [...prev, ...response.data.comments]);
            } else {
                setComments(response.data.comments);
            }
            
            setHasMore(response.data.pagination.hasNextPage);
            setCurrentPage(response.data.pagination.currentPage);
        } catch (error) {
            toast.error('Failed to load comments');
            console.error('Error fetching comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Load comments on component mount
     */
    useEffect(() => {
        if (animeId && episodeId) {
            fetchComments(1, false);
        }
    }, [animeId, episodeId]);

    /**
     * Submit new comment
     */
    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to comment');
            return;
        }
        
        if (!newComment.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await createComment(animeId, episodeId, newComment.trim());
            setComments(prev => [response.data, ...prev]);
            setNewComment('');
            toast.success('Comment posted successfully!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Start editing comment
     */
    const handleEditComment = (comment) => {
        setEditingComment(comment.id);
        setEditContent(comment.content);
    };

    /**
     * Cancel editing
     */
    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditContent('');
    };

    /**
     * Submit edited comment
     */
    const handleSubmitEdit = async (commentId) => {
        if (!editContent.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }

        try {
            const response = await updateComment(commentId, editContent.trim());
            setComments(prev => 
                prev.map(comment => 
                    comment.id === commentId ? response.data : comment
                )
            );
            setEditingComment(null);
            setEditContent('');
            toast.success('Comment updated successfully!');
        } catch (error) {
            toast.error(error.message);
        }
    };

    /**
     * Delete comment
     */
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            await deleteComment(commentId);
            setComments(prev => prev.filter(comment => comment.id !== commentId));
            toast.success('Comment deleted successfully!');
        } catch (error) {
            toast.error(error.message);
        }
    };

    /**
     * Load more comments
     */
    const loadMoreComments = () => {
        if (hasMore && !isLoading) {
            fetchComments(currentPage + 1, true);
        }
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (error) {
            return 'Unknown time';
        }
    };

    return (
        <div className="bg-card/80 rounded-lg p-4 mt-4">
            <h3 className="text-xl font-semibold mb-4 text-white">Comments</h3>
            
            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            {user.pfp ? (
                                <img 
                                    src={user.pfp} 
                                    alt={user.username} 
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                    <FaUser className="text-black" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts about this episode..."
                                className="w-full p-3 bg-lightbg border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-primary"
                                rows="3"
                                maxLength="1000"
                            />
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-400">
                                    {newComment.length}/1000 characters
                                </span>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-6 p-4 bg-lightbg rounded-lg text-center">
                    <p className="text-gray-400">Please login to leave a comment</p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="bg-lightbg rounded-lg p-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                {comment.user?.pfp ? (
                                    <img 
                                        src={comment.user.pfp} 
                                        alt={comment.user.username} 
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                        <FaUser className="text-black" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                                                 <div className="flex items-center gap-2 mb-2">
                                   <span className="font-medium text-white">
                                     {comment.user?.username || 'Unknown User'}
                                   </span>
                                   <span className="text-sm text-gray-400">
                                     {formatDate(comment.createdAt)}
                                   </span>
                                   {comment.isEdited && (
                                     <span className="text-xs text-orange-400">(edited)</span>
                                   )}
                                 </div>
                                
                                {editingComment === comment.id ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full p-2 bg-backGround border border-gray-600 rounded text-white resize-none focus:outline-none focus:border-primary"
                                            rows="3"
                                            maxLength="1000"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSubmitEdit(comment.id)}
                                                className="px-3 py-1 bg-primary text-black rounded text-sm hover:bg-primary/80 transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-white mb-2 whitespace-pre-wrap">{comment.content}</p>
                                        
                                        {/* Comment Actions */}
                                        {user && (comment.userId === user.id || user.role === 'root') && (
                                            <div className="flex gap-2">
                                                {comment.userId === user.id && (
                                                    <button
                                                        onClick={() => handleEditComment(comment)}
                                                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <FaEdit size={12} />
                                                        Edit
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className={`flex items-center gap-1 text-sm transition-colors ${
                                                        user.role === 'root' && comment.userId !== user.id
                                                            ? 'text-orange-400 hover:text-orange-300'
                                                            : 'text-red-400 hover:text-red-300'
                                                    }`}
                                                >
                                                    <FaTrash size={12} />
                                                    {user.role === 'root' && comment.userId !== user.id ? 'Admin Delete' : 'Delete'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                )}
                
                {hasMore && !isLoading && (
                    <div className="text-center">
                        <button
                            onClick={loadMoreComments}
                            className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/80 transition-colors"
                        >
                            Load More Comments
                        </button>
                    </div>
                )}
                
                {comments.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-400">
                        <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentSection; 