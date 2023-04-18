'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    class Verification extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    Verification.init({

        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },

        phone: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        request_id: {
            type: DataTypes.STRING,
            allowNull: false
        }

    }, {
        sequelize,
        tableName: 'Verification',
        timestamps: true,
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        underscored: true
    });

    return Verification;

};








// const { Op } = require("sequelize");
// const { Item } = model("");
// const { Message } = model("");
// const { checkAdmin, upload } = helper("Helper");
// const { sequelize } = require('../../Models/index');
// const { QueryTypes } = require('sequelize');


// module.exports = class MessageController {
//     async sendMessage(req, res) {
//         try {
//             const { id } = req.query;

//             const allMessages = await sequelize.query(
//                 `WITH RECURSIVE cte AS (
//           SELECT id, child_id, parent_id, message, send_by, created_at, updated_at, 1 as level
//           FROM Message
//           WHERE child_id = ${id}
          
//           UNION ALL
          
//           SELECT Message.id, Message.child_id, Message.parent_id, Message.message, Message.send_by, Message.created_at, Message.updated_at, cte.level + 1 as level
//           FROM Message
//           JOIN cte ON cte.id = Message.child_id
//         )
//         SELECT id, child_id, parent_id, message, send_by, created_at, updated_at, level FROM cte ORDER BY parent_id;`,
//                 {
//                     type: QueryTypes.SELECT,
//                 }
//             );

//             if (allMessages) {
//                 return res.status(200).json({ status: "success", data: allMessages });
//             }
//         } catch (err) {
//             return res.status(500).json({ status: "failed", message: err.message });
//         }
//     }
// };
