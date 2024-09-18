// index.js
require("./bin/kernel");
let serverless = require("serverless-http");
let express = require("express");
let path = require("path");
let logger = require("morgan");
let cookieParser = require("cookie-parser");
let userRoutes = require("./routes/UserApi");
let itemRoutes = require("./routes/ItemApi");
let auctionRoutes = require("./routes/AuctionApi");
let messageRoutes = require('./routes/MessageApi');
let locationRoutes = require('./routes/LocationApi');
const { sequelize } = require('./app/Models/index');


// Import the library:


let cors = require("cors");
let app = express();

const dir = (__dirname + '/Public/Items');


// sequelize.sync();


// view engine setup
app.set("views", path.join(__dirname, "resources/views"));
app.set("view engine", "ejs"); // only EJS template engine.

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// Then use it before your routes are set up:

app.use(cors());
app.use("/", userRoutes);
app.use("/", itemRoutes);
app.use("/", auctionRoutes);
app.use("/", messageRoutes);
app.use("/", locationRoutes);


// Images

app.use('/Images', express.static(path.join(dir)));



app.post('/hooks', async (req, res) => {
  console.log(req)
})


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next({
    status: 404,
    message: "Not Found"
  });
});

// error handler
app.use((err, req, res, next) => {
  if (err.status === 404) {
    return res.status(400).render("errors/404");
  }

  if (err.status === 500) {
    return res.status(500).render("errors/500");
  }
  next();
});

module.exports = app;
module.exports.handler = serverless(app);

// console.log(new Date(Date.now() + 1800000).toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: 'numeric' }))


// const transactions = [
//   { id: 1, amount: 100 },
//   { id: 2, amount: 50 },
//   { id: 3, amount: 200 },
//   { id: 4, amount: 75 },
// ];

// const maxAmount = transactions.reduce((max, transaction) => {
//   return transaction.amount > max ? transaction.amount : max;
// }, 0);

// console.log(maxAmount); // Output: 200

// var arr = [{ name: 'lavish', salary: 2000 }, { name: 'david', salary: 10000 }, { name: 'john', salary: 5000 }];

// arr.sort((a, b) => {
//   return a.salary > b.salary ? -1 : 1
// });
// console.log(arr)


    // async getArticleViewAnalytic(req, res) {

    //     let input = req.body
    //     let user_id = req.authUser.user_id;
    //     // Validate params
    //     let result = validateParameters(["project_uid","filter"], input);
    //     if (result != 'valid') {
    //         let error = formatJoiError(result.errors);
    //         return res.status(400).send({
    //             type: "RXERROR",
    //             message: "Invalid params",
    //             errors: error
    //         });
    //     }
    //     // Check if the project exists
    //     let projectData = await getProjectData(input.project_uid);
    //     if (!projectData) {
    //         return res.status(400).send({
    //             type: "RXERROR",
    //             message: "Invalid project"
    //         });
    //     }
    //     let project_id = projectData.id;
    //     const permission = await userPrivilege({ type: 'project', searchParam: { user_id: user_id, project_id: project_id }, allowedRole: ['owner','editor'], key: input.project_uid })
    //     console.log("permission", permission);
    //     if (permission !== 'valid') {
    //         return res.status(400).send({
    //             type: "RXERROR",
    //             message: permission.message,
    //         })
    //     };

    //     let filter = input.filter;
    //     let array = [];
    //     let upperAttribute;
    //     let lowerAttribute
    //     let current_date;
    //     let upperWhere;
    //     let lowerWhere;
    //     let searchLimit;
    
    //     // set values for days filter
    //     if (filter == 'days') {
    //       array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    //       upperAttribute = "MONTH",
    //       lowerAttribute = "DAY",
    //       upperWhere = "MONTH",
    //       lowerWhere = "DAY"
    //       current_date = new Date().getDate();
    //       searchLimit = 1;
    //     }
    
    //     // set values for months filter
    //     if (filter == 'months') {
    //       array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    //       upperAttribute = "YEAR",
    //       lowerAttribute = "MONTH",
    //       upperWhere = "YEAR",
    //       lowerWhere = "MONTH"
    //       current_date = new Date().getMonth() + 1;
    //       searchLimit = 1;
    //     }
    
    //     // set values for years filter
    //     if (filter == 'years') {
    //       array = [0, 0, 0, 0, 0];
    //       upperAttribute = "YEAR",
    //       lowerAttribute = "YEAR",
    //       upperWhere = "YEAR",
    //       lowerWhere = "MONTH"
    //       current_date = new Date().getFullYear();
    //       searchLimit = 5;
    //     }
    
    //     try{
    //     // get records form users table based on values
    //     let article_view = await ChatbotHelpdeskArticleView.findAll({
    //       attributes: [
    //         [Sequelize.fn(`${upperAttribute}`, Sequelize.col("created_at")), "u"],
    //         [Sequelize.fn(`${lowerAttribute}`, Sequelize.col("created_at")), "l"],
    //         [Sequelize.fn("COUNT", Sequelize.col("created_at")), "count"]
    //       ],
    //       where: {
    //         created_at: {
    //           [Op.gte]: Sequelize.literal(`NOW() + INTERVAL 1 ${lowerWhere} - INTERVAL ${searchLimit} ${upperWhere} `)
    //         }
    //       },
    //       group: ["u", "l"],
    //     });
    //     let data = await this.formatData(article_view,current_date,array);
    //         return res.status(200).send({ type: "RXSUCCESS", message: "Articles analytics fetch successfully", data: data });  
    //     } catch(error) {
    //         console.log("Error", error.message)
    //         return res.status(400).send({ type: "RXERROR", message: "Something went wrong" });
    //     }
    // };


    // async formatData(response,current_date,data){
    //   console.log(JSON.stringify(response))
    //   let array=data;
    //   for (let i = 0; i < response.length; i++) {
    //     // console.log(JSON.stringify(response[i]))
  
    //     // index to be updated
    //     let updateIndex = current_date - response[i].dataValues.l
  
    //     // check if index is positive
    //     if (updateIndex >= 0) {
    //       array[updateIndex] = +response[i].dataValues.count;
    //     }
  
    //     //check if index is negative
    //     if (updateIndex < 0) {
  
    //       // convert negative index to positive
    //       let toUpdate = updateIndex * -1
  
    //       // logic to update negaive indexs from back side
    //       let len = array.length
  
    //       // find index to be updated for negative values
    //       let toUpdateIndex = len - toUpdate
  
    //       // update to respective
    //       array[toUpdateIndex] = +response[i].dataValues.count;
    //     }
    //   }
    //   // console.log("\n\n\n\n");
    //   return array;
    // };
