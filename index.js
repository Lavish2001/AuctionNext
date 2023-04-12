// index.js
require("./bin/kernel");
let serverless = require("serverless-http");
const { I18n } = require('i18n');
let express = require("express");
let path = require("path");
let logger = require("morgan");
let cookieParser = require("cookie-parser");
let userRoutes = require("./routes/UserApi");
let itemRoutes = require("./routes/ItemApi");
let auctionRoutes = require("./routes/AuctionApi");
// Import the library:
let cors = require("cors");
const { sequelize } = require("./app/Models/index");
let app = express();

const dir = (__dirname + '/Public/Items');
const i18n = new I18n({
  locales: ['english', 'hindi'],
  directory: path.join(__dirname, 'locals'),
  defaultLocale: 'hindi'
});

app.use(i18n.init);

app.get('/test', async (req, res) => {
  res.json({ login: res.__('LOGIN'), signup: res.__('SIGNUP') })
});


// const translate = require('translate-google');

// translate('भेजना चाहते हैं हिंदी में मैसेज लेकिन नहीं आती टाइपिंग? इन आसान Tips से मोबाइल से भेजें हिंदी में टेक्स्ट मैसेज', { to: 'en' }).then(res => {
//   console.log(res)
// }).catch(err => {
//   console.error(err)
// })




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


// Images

app.use('/Images', express.static(path.join(dir)));



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