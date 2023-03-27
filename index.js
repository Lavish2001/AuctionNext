// index.js
require("./bin/kernel");
let serverless = require("serverless-http");
let express = require("express");
let path = require("path");
let logger = require("morgan");
let cookieParser = require("cookie-parser");
let userRoutes = require("./routes/UserApi");
// Import the library:
let cors = require("cors");
const { sequelize } = require("./app/Models/index");
let app = express();

// sequelize.sync();

// view engine setup
app.set("views", path.join(__dirname, "resources/views"));
app.set("view engine", "twig"); // either pug,twig etc

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// Then use it before your routes are set up:

app.use(cors());
app.use("/api/v1/", userRoutes);

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
