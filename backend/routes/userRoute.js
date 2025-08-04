const route = require('express').Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

route.get('/me', authMiddleware, userController.me);
route.delete('/me',authMiddleware,userController.deleteUser);
route.put('/username',authMiddleware,userController.updateUsername);
route.put('/password',authMiddleware,userController.updatePassword);

module.exports = route;