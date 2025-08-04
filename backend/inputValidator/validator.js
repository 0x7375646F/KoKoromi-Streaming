const Joi = require('joi');

const passwordRule = Joi.string()
  .min(8)
  .max(50)
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/[a-z]/, 'lowercase')
  .pattern(/[0-9]/, 'number')
  .pattern(/[_!@#$%^&*(),.?":{}|<>]/, 'special')
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password must not exceed 50 characters',
    'string.pattern.name': 'Password must contain at least one {#name} character',
    'any.required': 'Password is required'
  });

const usernameRule = Joi.string()
  .min(2)
  .max(32)
  .pattern(/^[a-z0-9_.]+$/, 'letters, numbers, underscore, and periods only')
  .required()
  .messages({
    'string.min': 'Username must be at least 2 characters',
    'string.max': 'Username must not exceed 32 characters',
    'string.pattern.base': 'Username can only contain letters, numbers, underscores, and periods (no spaces)',
    'any.required': 'Username is required'
});



const otpRule = Joi.string()
  .length(6)
  .required()
  .messages({
    'string.length': 'OTP must be exactly 6 digits',
    'any.required': 'OTP is required'
  });

module.exports = {
  passwordRule,
  usernameRule,
  otpRule
};
