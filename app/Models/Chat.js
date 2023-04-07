'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    class Chat extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.myAssociation = models.Chat.belongsTo(models.User, {
                foreignKey: "user_id",
                as: 'sender'
            });
        }
    };
    Chat.init({

        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },

        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        text: {
            type: DataTypes.STRING(1000),
            allowNull: false,
            validate: {
                len: [0, 1000]
            }
        },
        auction_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        }

    }, {
        sequelize,
        tableName: 'Chat',
        timestamps: true,
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        underscored: true
    });

    return Chat;

};