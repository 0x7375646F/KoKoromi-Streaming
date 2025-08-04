const { DataTypes, DatabaseError, EmptyResultError } = require("sequelize");
const { sequelize } = require("../database");

const UserAccount = sequelize.define('User',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
        validate: {
            len: {
                args: [2, 32],
                msg: "Username must be between 2 and 32 characters long."
            },
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    totp:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('user','root'),
        defaultValue: 'user',
        allowNull: false,
    },
    pfp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    banned:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    tokenVersion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
},{
    timestamps: true,
})

module.exports = UserAccount;
