// const { Op } = require("sequelize");
// const { Item } = model("");
// const { Message } = model("");
// const { checkAdmin, upload } = helper("Helper");
// const { sequelize } = require('../../Models/index');
// const { QueryTypes } = require('sequelize');


// module.exports = class MessageController {
//     async sendMessage(req, res) {
//         try {
//           const { id } = req.query;

//           // Define a recursive function to convert the tree into a nested array
//           async function getMessages(Id) {
//             const messages = await Message.findAll({
//               where: { child_id: Id },
//               raw: true,
//             });

//             const result = [];

//             for (const message of messages) {
//               const children = await getMessages(message.id);

//               if (children.length > 0) {
//                 message.children = children;
//               }

//               result.push(message);
//             }

//             return result;
//           }

//           // Call the recursive function to retrieve the nested array
//           const messages = await getMessages(id);

//           if (messages) {
//             return res.status(200).json({ status: "success", data: messages });
//           }
//         } catch (err) {
//           console.error(err);
//           return res.status(500).json({ status: "failed", message: err.message });
//         }
//       }

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
        SELECT id, child_id, parent_id, message, send_by, level FROM cte ORDER BY level;`,
        {
          type: QueryTypes.SELECT,
        }
      );


      // Define a recursive function to convert the tree into a nested array
      async function getMessages(Id) {
        const messages = allMessages.filter((item) => {
          return item.child_id == Id;
        });

        const result = [];

        for (const message of messages) {
          const parent = await getMessages(message.id);

          if (parent.length > 0) {
            message.parent = parent;
          }

          result.push(message);
        }

        return result;
      }

      // Call the recursive function to retrieve the nested array
      const messages = await getMessages(id);



      if (messages) {
        return res.status(200).json({ status: "success", data: messages });
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






