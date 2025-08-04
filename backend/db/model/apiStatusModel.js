const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const ApiStatus = sequelize.define('ApiStatus', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    lastCheck: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('up', 'down', 'warning', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown'
    },
    responseTime: {
        type: DataTypes.INTEGER, // in milliseconds
        allowNull: true
    },
    lastError: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    checkInterval: {
        type: DataTypes.INTEGER, // in seconds
        allowNull: false,
        defaultValue: 300 // 5 minutes
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'general'
    }
}, {
    timestamps: true,
});

module.exports = ApiStatus; 