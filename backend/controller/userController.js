const Joi = require("joi");
const UserAccount = require("../db/model/userModel");
const { usernameRule, passwordRule } = require("../inputValidator/validator");
const crypto = require('crypto')
const bcrypt = require("bcrypt");

const usernameSchema = Joi.object({
    username: usernameRule,
});
const passwordSchema = Joi.object({
    currentPassword: passwordRule,
    newPassword: passwordRule
})

const me = async (req, res) => {
    try {
        return res.status(200).json({
            id: req.user.id,
            username: req.user.username,
            role: req.user.role,
            pfp: req.user.pfp,
            verified: req.user.verified,
            banned: req.user.banned,
            createdAt: req.user.createdAt
        });
      } catch (error) {
        console.error('Fetch user error:', error);
        return res.status(500).json({ message: 'Server error' });
      }
}

const deleteUser = async (req, res) => {
    try {
      const user = req.user;
      await user.destroy();
      return res.status(200).json({ message: 'User account deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  

const updateUsername = async(req,res) => {
    try{
        const { error, value } = usernameSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        if (req.user.username === value.username) return res.status(200).json({ message: 'Username is already your current username' });
        const userExist =  await UserAccount.findOne( {where: {username: value.username}});
        if(userExist) return res.status(409).json({ message: 'Username already used' });
        req.user.username = value.username;
        await req.user.save();
        return res.status(200).json({message:'username updated'});
    } catch(error) {
        console.error('Update username error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}


const updatePassword = async (req, res) => {
    try {
      const { error, value } = passwordSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });
  
      const { currentPassword, newPassword } = value;
  
      const user = req.user;
      const currentPasswordHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
      const isMatch = await bcrypt.compare(currentPasswordHash, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

      const newPasswordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
      const newHashed = await bcrypt.hash(newPasswordHash, 10);
  

      user.password = newHashed;
      user.tokenVersion += 1;
      await user.save();
      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Update password error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    me,
    updateUsername,
    updatePassword,
    deleteUser
}