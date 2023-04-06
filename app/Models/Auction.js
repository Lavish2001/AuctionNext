'use strict';

const { Model } = require('sequelize');
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Auction extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.myAssociation = models.Auction.belongsTo(models.Item, {
                foreignKey: "item_id",
                as: 'Item'
            });

            this.myAssociation = models.Auction.hasMany(models.Bid, {
                foreignKey: "auction_id",
                as: 'Bidding'
            });
        }
    };
    Auction.init({

        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },

        item_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        bidder_id: {
            type: DataTypes.BIGINT
        },
        bid_amount: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        started_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        ended_at: {
            type: DataTypes.DATE
        }

    }, {
        sequelize,
        tableName: 'Auction',
        timestamps: true,
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        underscored: true
    });


    Auction.beforeCreate(async (data) => {
        const liveAuction = await Auction.findOne({
            where: {
                ended_at: { [Op.gt]: data.started_at }
            }
        });

        if (liveAuction) {
            throw new Error('Already Live Auction is running.');
        }
    });


    return Auction;

};