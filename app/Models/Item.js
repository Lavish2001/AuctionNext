'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    class Item extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    Item.init({

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
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        item_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_price: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_price: {
            type: DataTypes.BIGINT
        },
        item_id: {
            type: DataTypes.STRING,
            allowNull: false
        }

    }, {
        sequelize,
        tableName: 'Item',
        timestamps: true,
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        underscored: true
    });

    return Item;

};