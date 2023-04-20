'use strict';

const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    class Message extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.myAssociation = models.Message.belongsTo(models.Message, {
                foreignKey: "parent_id",
                as: 'Msg',
                targetKey: 'send_by'
            });

            this.myAssociation = models.Message.hasMany(models.Message, {
                foreignKey: "send_by",
                as: 'Msg2',
                sourceKey: 'parent_id'
            })
        };
    };



    Message.init({

        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },

        child_id: {
            type: DataTypes.BIGINT
        },

        parent_id: {
            type: DataTypes.BIGINT,
            Hierarchy: true
        },
        message: {
            type: DataTypes.STRING(1000),
            allowNull: false,
            validate: {
                len: [0, 1000]
            }
        },
        send_by: {
            type: DataTypes.BIGINT,
            allowNull: false
        }

    }, {
        sequelize,
        tableName: 'Message',
        timestamps: true,
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        underscored: true
    });


    return Message;

};
