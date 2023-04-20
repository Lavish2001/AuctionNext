'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    class Location extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    Location.init({

        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },

        company_name: DataTypes.STRING,
        company_address: DataTypes.STRING,
        longitude: DataTypes.FLOAT,
        latitude: DataTypes.FLOAT,
    }, {
        sequelize,
        tableName: 'Location',
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        underscored: true
    });

    return Location;

};