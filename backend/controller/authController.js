const UserAccount = require("../db/model/userModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { usernameRule, passwordRule, otpRule } = require("../inputValidator/validator");
const { generateUserAvatar } = require("../utils/avatarGenerator");
require('dotenv').config();

const createUserSchema = Joi.object({
  username: usernameRule,
  password: passwordRule
});


const verifyUserSchema = Joi.object({
  username: usernameRule,
  otp: otpRule
});

const resetUserSchema = Joi.object({
  username: usernameRule,
  newPassword: passwordRule,
  otp: otpRule
});

const createUser = async(req,res) => {
    try{
        const { error, value } = createUserSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        const { username, password } = value;

        const user = await UserAccount.findOne({ where: { username } });
        if(user && user.verified) return res.status(400).json({ message: "Username already taken" });
        const sha = crypto.createHash("sha256").update(password).digest("hex");
        const hashed = await bcrypt.hash(sha, 10);
       
        if(user && !user.verified){
            user.password = hashed;
            await user.save();
            return res.status(201).json({
                totp_secret: user.totp,
            });
        } else {
            const secret = speakeasy.generateSecret({ length: 10, name: `kokoromi:${username}`});
            const avatarUrl = generateUserAvatar(username);
            await UserAccount.create({
                username,
                password: hashed,
                totp: secret.base32,
                pfp: avatarUrl
            });
            return res.status(201).json({
                totp_secret: secret.base32,
                avatar_url: avatarUrl
            });
        }
    }catch(error){
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const verifyUser = async(req,res) =>{
    try{
        const { error, value } = verifyUserSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { username, otp } = value;

        const user = await UserAccount.findOne({ where: { username } });
        if (!user) return res.status(404).json({ message: "User not found" });
        if(user.verified) return res.status(400).json({message:"User already verified"});

        const valid = speakeasy.totp.verify({
            secret: user.totp,
            encoding: "base32",
            token: otp,
            window: 0
        });
        
        if (!valid) return res.status(401).json({ message: "Invalid otp" });
        
        user.verified = true;
        await user.save();
        
        return res.status(200).json({ message: "TOTP verified. You may now log in." });
    } catch(error){
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const resetUserPass = async(req,res) => {
    try{
        const { error, value } = resetUserSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
    
        const { username, newPassword, otp } = value;

        const user = await UserAccount.findOne({ where: { username } });
        if (!user) return res.status(404).json({ message: "User not found" });
        if(!user.verified) return res.status(401).json({ message: "User not verified"});
        if (user.banned) return res.status(403).json({ message: "User is banned" });
        
        const valid = speakeasy.totp.verify({
            secret: user.totp,
            encoding: "base32",
            token: otp,
            window: 0
        });

        if (!valid) return res.status(401).json({ message: "Invalid otp" });
        const sha = crypto.createHash("sha256").update(newPassword).digest("hex");
        const hashed = await bcrypt.hash(sha, 10);
        user.password = hashed;
        user.tokenVersion += 1;
        await user.save();
        return res.status(200).json({ message: "Password resetted. You may now log in." });

    }catch(error){
        console.error("Password reset failed:", error);
        return res.status(500).json({ message: "Server error" });
    }
}


const loginUser = async (req, res) => {
    try {
      const { error, value } = createUserSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });
      const { username, password } = value;
      
      const user = await UserAccount.findOne({ where: { username } });
      if (!user) return res.status(404).json({ message: "User not found" });
      if (!user.verified) return res.status(403).json({ message: "User not verified" });
      if (user.banned) return res.status(403).json({ message: "User is banned" });
  
      const sha = crypto.createHash("sha256").update(password).digest("hex");
      const validPassword = await bcrypt.compare(sha, user.password);
      if (!validPassword) 
        return res.status(401).json({ message: "Invalid credentials" });
  
      const token = jwt.sign(
        { 
          id: user.id,
          tokenVersion: user.tokenVersion
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
  
      return res.status(200).json({ 
        message: "Login successful",
        token: token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          verified: user.verified,
          pfp: user.pfp,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
};

const logoutUser = async(req,res) =>{
    try {
        const user = req.user;
        user.tokenVersion += 1;
        await user.save();
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    createUser,
    verifyUser,
    resetUserPass,
    loginUser,
    logoutUser
}
