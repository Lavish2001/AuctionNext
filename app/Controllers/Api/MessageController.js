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
//             async function getNestedData(message) {
//                 const data = message.toJSON();
//                 const nested = await message.getMsg();
//                 if (nested) {
//                     data.Msg = await getNestedData(nested);
//                 }
//                 return data;
//             }


//             const allMessages = await Message.findOne({
//                 where: { child_id: id }, include: [
//                     { model: Message, as: 'Msg' }
//                 ]
//             })
//             const allMessages2 = await getNestedData(allMessages);

//             if (allMessages2) {
//                 return res.status(200).json({ status: "success", data: allMessages2 });
//             }
//         } catch (err) {
//             return res.status(500).json({ status: "failed", message: err.message });
//         }
//     }
// };











const { Op } = require("sequelize");
const { Item } = model("");
const { Message } = model("");
const { checkAdmin, upload } = helper("Helper");
const { sequelize } = require('../../Models/index');
const { QueryTypes } = require('sequelize');


module.exports = class MessageController {
    async sendMessage(req, res) {
        try {
            const { id } = req.query;

            const allMessages = await sequelize.query(
                `WITH RECURSIVE cte AS (
          SELECT id, child_id, parent_id, message, send_by, created_at, updated_at, 1 as level
          FROM Message
          WHERE child_id = ${id}
          
          UNION ALL
          
          SELECT Message.id, Message.child_id, Message.parent_id, Message.message, Message.send_by, Message.created_at, Message.updated_at, cte.level + 1 as level
          FROM Message
          JOIN cte ON cte.id = Message.child_id
        )
        SELECT id, child_id, parent_id, message, send_by, created_at, updated_at, level FROM cte ORDER BY level;`,
                {
                    type: QueryTypes.SELECT,
                }
            );

            if (allMessages) {
                return res.status(200).json({ status: "success", data: allMessages });
            }
        } catch (err) {
            return res.status(500).json({ status: "failed", message: err.message });
        }
    }
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
//             const message = await Message.create({
//                 child_id: 2,
//                 message: 'Hello Child 2',
//                 send_by: 1
//             });

//             if (message) {
//                 return res.status(200).json({ status: "success", data: message });
//             }
//         } catch (err) {
//             return res.status(500).json({ status: "failed", message: err.message });
//         }
//     }
// };






