const {Router}=require('express'); 
const authController = require('../controllers/auth.controller');

const authRouter = Router()


/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */ 

authRouter.post('/register',authController.registerUserController) 

/** 
 * @route POST /api/auth/login
 * @desc Login a user with email and password
 * @access Public
 */

authRouter.post('/login',authController.loginUserController)


/**
 * @route GET /api/auth/logout
 * @desc Logout a user by clearing the token cookie and blacklisting the token
 * @access Public
 */
authRouter.get('/logout',authController.logoutUserController)

module.exports = authRouter; 