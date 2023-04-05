'use strict';

const { date } = require('joi');
const { Model } = require('sequelize');
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Bid extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.myAssociation = models.Bid.belongsTo(models.User, {
                foreignKey: "bidder_id",
                as: 'Bidder'
            });
        }
    };
    Bid.init({

        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },

        auction_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        bidder_id: {
            type: DataTypes.BIGINT
        },
        bid_amount: {
            type: DataTypes.BIGINT,
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'Bid',
        timestamps: true,
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        underscored: true
    });

    return Bid;

};