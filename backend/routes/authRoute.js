const route = require('express').Router();
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit')


const createLimiter = (max, message) => rateLimit({
    windowMs: 10 * 60 * 1000,
    max,
    message: { message },
});

const registerLimiter = createLimiter(5, 'Too many register attempts, please try again after 10 minutes.');
const loginLimiter = createLimiter(5, 'Too many login attempts, please try again after 10 minutes.');
const resetLimiter = createLimiter(5, 'Too many password reset attempts, please try again after 10 minutes.');
const verifyLimiter = createLimiter(10, 'Too many verify attempts, please try again after 10 minutes.');


route.post('/register', registerLimiter ,authController.createUser);
route.post('/verify', verifyLimiter, authController.verifyUser);
route.post('/login',loginLimiter,authController.loginUser);
route.post('/logout',authMiddleware,authController.logoutUser);
route.post('/reset',resetLimiter, authController.resetUserPass);


module.exports = route;