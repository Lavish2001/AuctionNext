const graph = {
    SFO: { LAX: 250, ORD: 400, JFK: 600, DFW: 800 },
    LAX: { ORD: 250, DFW: 300, ATL: 700 },
    ORD: { JFK: 200, DFW: 350, ATL: 450 },
    JFK: { BOS: 150, ATL: 600 },
    DFW: { BOS: 400, ATL: 200, MIA: 900 },
    BOS: { MIA: 750, SEA: 1200 },
    ATL: { MIA: 300, SEA: 1000 },
    MIA: { SEA: 1500, DEN: 800 },
    SEA: { DEN: 350, PHX: 900 },
    DEN: { PHX: 450, LAS: 400 },
    PHX: { LAS: 250, SLC: 700 },
    LAS: { SLC: 400, MSP: 1000 },
    SLC: { MSP: 500, DCA: 1100 },
    MSP: { DCA: 300, IAH: 1200 },
    DCA: { IAH: 400, PDX: 1500 },
    IAH: { PDX: 600, MCO: 900 },
    PDX: { MCO: 800, BWI: 1300 },
    MCO: { BWI: 500, SJC: 1600 },
    BWI: { SJC: 900, STL: 800 },
    SJC: { STL: 350, RDU: 1400 },
    STL: { RDU: 400, PIT: 900 },
    RDU: { PIT: 200, DTW: 1000 },
    PIT: { DTW: 300, HOU: 800 },
    DTW: { HOU: 400, SAN: 1200 },
    HOU: { SAN: 500, PHL: 1400 },
    SAN: { PHL: 700, MEM: 1100 },
    PHL: { MEM: 300, IND: 900 },
    MEM: { IND: 400, AUS: 800 },
    IND: { AUS: 250, MSY: 1000 },
    AUS: { MSY: 500, MCI: 1300 },
    MSY: { MCI: 600, BNA: 1200 },
    MCI: { BNA: 350, RNO: 1500 },
  };

  let charges = 0;
let permanent_charges = Infinity;
let count = 0;
let route = [];

const find_cheapest_route = (start, finish2, rate, path) => {
  charges += rate;
  path.push(finish2);

  if (finish2 === start) {
    if (permanent_charges > charges) {
      permanent_charges = charges;
      route = path.slice(); // Store a copy of the current path
    }
  } else {
    for (let x in graph) {
      for (let y in graph[x]) {
        if (x !== finish && y === finish2) {
          find_cheapest_route(start, x, graph[x][y], path);
        }
      }
    }
  }

  charges -= rate;
  path.pop();
};

const find_cheapest_path = (graph, finish, start) => {
  for (let x in graph) {
    for (let y in graph[x]) {
      if (y === finish) {
        find_cheapest_route(start, x, graph[x][y], []);
      }
    }
  }
};

const start = "SFO";
const finish = "MCI";

find_cheapest_path(graph, finish, start);
console.log("Shortest Route:", route);
console.log("Cheapest Price:", permanent_charges);





const comment = await sequelize.query(`WITH RECURSIVE
cte AS
( SELECT id, feature_id, user_id, parent_comment_id, comment_text, created_at as createdAt
    FROM comments WHERE parent_comment_id is null and feature_id=1
      UNION ALL
  SELECT comments.id, comments.feature_id, comments.user_id, comments.parent_comment_id, comments.comment_text, comments.created_at
    FROM cte JOIN comments ON cte.id = comments.parent_comment_id
)
SELECT cte.*, JSON_OBJECT('id',users.id,'username',users.username,'email',users.email,'profile_pic',users.profile_pic,'createdAt',users.created_at) as User,
CASE WHEN COUNT(comment_media.comment_id) > 0
THEN JSON_ARRAYAGG(JSON_OBJECT('id', comment_media.id, 'comment_id', comment_media.comment_id, 'path', comment_media.path, 'createdAt', comment_media.created_at))
ELSE JSON_ARRAY()
END as Images
from cte
INNER JOIN users on cte.user_id = users.id
LEFT JOIN comment_media on cte.id = comment_media.comment_id
GROUP BY cte.id, cte.feature_id, cte.user_id, cte.parent_comment_id, cte.comment_text, cte.createdAt
ORDER BY parent_comment_id;`,
{
  type: QueryTypes.SELECT,
  replacements: [id],
});




// async productStat(req, res) {
//     const input = req.body;
//     let orderBy = isset(input.orderBy, "DESC");
//     let stats_by = isset(input.stats_by, "days");
//     let limit = parseInt(isset(input.limit, 10));
//     let offset = 0 + (isset(input.page, 1) - 1) * limit;
//     let between;
//     let stat_type;
//     if (offset < 1) {
//       offset = 0;
//     }
//     if (stats_by === 'months') {
//       between = [literal('DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)'), literal('DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)')];
//       stat_type = 'month';
//     }else if (stats_by === 'years') {
//       between = [literal('DATE_SUB(CURRENT_DATE, INTERVAL 5 YEAR)'), literal('DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)')];
//       stat_type = 'year'
//     }else{
//       between = [literal('CURRENT_DATE - INTERVAL 30 DAY'), literal('CURRENT_DATE')];
//       stat_type = 'date';
//     }
//     try {
//         const data = await Product.findAll({
//           attributes: [
//             [Sequelize.literal(`${stat_type}(created_at)`), stat_type],
//             [Sequelize.fn('count', Sequelize.col('id')), 'count'],
//           ],
//           where: {
//             created_at: {
//               [Op.between]: between,
//             },
//           },
//           group: [Sequelize.col(stat_type)],
//           order: [[Sequelize.col(stat_type),'DESC']],
//         });
//         return res.status(200).send({
//           type: "RXSUCCESS",
//           message: "data fetch successfully",
//           count: data.length,
//           data: data,
//         });
//     } catch (error) {
//       console.log(error);
//       return res.status(400).send({
//         type: "RXERROR",
//         message: "Somthing went wrong"
//       });
//     }
//   };





  function validate2fa(secretKey, code) {
    const keyBuffer = base32.decode(secretKey);
    const time = Math.floor(Date.now() / 1000 / 30); // Time step is 30 seconds
  
    // Generate the expected code using the TOTP algorithm
    const hmac = crypto.createHmac('sha1', keyBuffer);
    const counterBuffer = Buffer.alloc(8);
  
    counterBuffer.writeBigInt64BE(BigInt(time));
    hmac.update(counterBuffer);
    const hmacResult = hmac.digest();
    // Extract the 4 bytes starting from the offset
    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const truncatedHash = hmacResult.readUInt32BE(offset) & 0x7fffffff;
    // Generate the 6-digit expected code
    const expectedCode = String(truncatedHash % 1000000).padStart(6, '0');
    console.log("~~~~~~~~~~~~~",expectedCode,"~~~~~~~~~~~~~~~~")
    return code === expectedCode;
  }




//   const text = "my website is lavish.ai"


// let match = text.match(/(https?|ftp)?:?\/?\/?(www\.)?[\w-0-9]+(\.)+(\w){2,4}/g)

// console.log(match)

// const text = "hello my email id is invalid.email@example.com please contact me for any query."


// let match = text.match(/[\w.-]+@[\w.-]+\.[A-Za-z]+\s/g)

// console.log(match[0].replace(" ",""))


// const text = "hello my email id is Lavish Neoliya please contact me for any query."


// let match = text.match(/[A-Z][a-z]+\s+[A-Z][a-z]+/g);

// console.log(222,match[0].replace(" ",""),222)
