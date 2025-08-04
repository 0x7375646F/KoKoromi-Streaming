const Joi = require('joi');

const apiStatusSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'API name is required'
    }),
    url: Joi.string().uri().required().messages({
        'string.uri': 'Please provide a valid URL',
        'any.required': 'API URL is required'
    }),
    description: Joi.string().optional(),
    checkInterval: Joi.number().integer().min(30).max(3600).default(300).messages({
        'number.min': 'Check interval must be at least 30 seconds',
        'number.max': 'Check interval cannot exceed 3600 seconds (1 hour)'
    }),
    category: Joi.string().default('general')
});

const updateApiStatusSchema = Joi.object({
    name: Joi.string().optional(),
    url: Joi.string().uri().optional().messages({
        'string.uri': 'Please provide a valid URL'
    }),
    description: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    checkInterval: Joi.number().integer().min(30).max(3600).optional().messages({
        'number.min': 'Check interval must be at least 30 seconds',
        'number.max': 'Check interval cannot exceed 3600 seconds (1 hour)'
    }),
    category: Joi.string().optional()
});

const userManagementSchema = Joi.object({
    userId: Joi.number().integer().required().messages({
        'any.required': 'User ID is required',
        'number.base': 'User ID must be a number'
    }),
    action: Joi.string().valid('ban', 'unban', 'delete').required().messages({
        'any.only': 'Action must be ban, unban, or delete',
        'any.required': 'Action is required'
    }),
    reason: Joi.string().optional()
});

module.exports = {
    apiStatusSchema,
    updateApiStatusSchema,
    userManagementSchema
}; 