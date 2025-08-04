const Joi = require('joi');

const createCommentSchema = Joi.object({
    animeId: Joi.string().required().messages({
        'any.required': 'Anime ID is required',
        'string.empty': 'Anime ID cannot be empty'
    }),
    episodeId: Joi.string().required().messages({
        'any.required': 'Episode ID is required',
        'string.empty': 'Episode ID cannot be empty'
    }),
    content: Joi.string().min(1).max(1000).required().messages({
        'any.required': 'Comment content is required',
        'string.empty': 'Comment content cannot be empty',
        'string.min': 'Comment must be at least 1 character long',
        'string.max': 'Comment cannot exceed 1000 characters'
    })
});

const updateCommentSchema = Joi.object({
    content: Joi.string().min(1).max(1000).required().messages({
        'any.required': 'Comment content is required',
        'string.empty': 'Comment content cannot be empty',
        'string.min': 'Comment must be at least 1 character long',
        'string.max': 'Comment cannot exceed 1000 characters'
    })
});

const getCommentsSchema = Joi.object({
    animeId: Joi.string().required().messages({
        'any.required': 'Anime ID is required',
        'string.empty': 'Anime ID cannot be empty'
    }),
    episodeId: Joi.string().required().messages({
        'any.required': 'Episode ID is required',
        'string.empty': 'Episode ID cannot be empty'
    }),
    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).max(50).default(20).messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 50'
    })
});

module.exports = {
    createCommentSchema,
    updateCommentSchema,
    getCommentsSchema
}; 