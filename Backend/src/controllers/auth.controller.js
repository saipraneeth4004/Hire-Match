const userModel = require('../models/user.model'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @name Register User Controller
 * @route POST /api/auth/register
 * @description Register a new user,expects username,email and password in the request body,returns the created user object
 * @access Public
 */

async function registerUserController(req,res){
    const {username,email,password} = req.body; 

    if(!username || !email || !password){
        return res.status(400).json({message:"All fields are required"})
    } 

    const isUserAlreadyExists= await userModel.findOne({$or:[{username},{email}]})
    
    if(isUserAlreadyExists){
        return res.status(400).json({message:"Username or email already exists"})
    }
    const hash= await bcrypt.hash(password,10); 
    
    const user = await userModel.create({
        username,
        email,
        password:hash
    }) 

  const token=jwt.sign(
        {id:user._id,username:user.username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )
    res.cookie("token",token) 
    res.status(201).json({
        message:"User registered successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        },
        token
    })
} 


/** 
 * @name Login User Controller 
 * @route POST /api/auth/login
 * @description Login a user,expects email and password in the request body,returns the user object and token
 * @access Public
*/

async function loginUserController(req,res){
    const {email,password} = req.body;

    if (!email || !password){
        return res.status(400).json({message:"All fields are required"})
    }
    const user = await userModel.findOne({email})

    if(!user){
        return res.status(400).json({message:"Invalid credentials"})
    }  
    
    const isPasswordMatch = await bcrypt.compare(password,user.password) 

    if(!isPasswordMatch){
        return res.status(400).json({message:"Invalid credentials"})
    }
    const token=jwt.sign(
        {id:user._id,username:user.username},
        process.env.JWT_SECRET, {expiresIn:"1d"}
    )  

    res.cookie("token",token) 
    res.status(200).json({
        message:"User logged in successfully",
        user:{
            id:user._id,
            username:user.username 
        }
    }) 



}

/**
 * 
 * @name Logout User Controller
 * @route GET /api/auth/logout
 * @description Logout a user by clearing the token cookie and blacklisting the token,returns a success message
 * @access Public 
 */



async function logoutUserController(req,res){
   const token=req.cookies.token;
    if(token){
        await tokenBlacklistModel.create({token})
    }
    res.clearCookie("token") 
    res.status(200).json({message:"User logged out successfully"})
}
 
/** * 
 * @name Get Me Controller
 * @description Get the current logged in user's details,returns the user object
 * @access Private
 */
async function getMeController(req,res){
    const user=await userModel.findById(req.user.id) 

    res.status(200).json({
        message:"User details fetched successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
        })
}




module.exports = {
    registerUserController ,
    loginUserController,
    logoutUserController,
    getMeController
}