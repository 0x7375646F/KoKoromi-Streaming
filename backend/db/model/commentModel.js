const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    animeId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Anime ID from the external API'
    },
    episodeId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Episode ID or episode number'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: {
                args: [1, 1000],
                msg: "Comment must be between 1 and 1000 characters long."
            },
            notEmpty: {
                msg: "Comment content cannot be empty."
            }
        }
    },
    isEdited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['animeId', 'episodeId'],
            name: 'anime_episode_index'
        }
    ]
});

module.exports = Comment; 