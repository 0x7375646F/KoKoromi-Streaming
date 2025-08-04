const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASS,{
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false
})

const connectDB = async()=>{
    try{
        await sequelize.authenticate();
        console.log("Database connected succesfully.");
        
        // Set up model associations
        const UserAccount = require('./model/userModel');
        const Comment = require('./model/commentModel');
        
        // Define associations
        UserAccount.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
        Comment.belongsTo(UserAccount, { foreignKey: 'userId', as: 'user' });
        
    } catch (error) {
        console.error("Unable to connect to the database: ", error);
    }
}
module.exports = {
    sequelize,
    connectDB
}