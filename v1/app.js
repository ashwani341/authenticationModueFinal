const https = require("https");
const express = require("express");
const app = express();
const myEnv = require("dotenv").config();
require("dotenv-expand").expand(myEnv);
const mongoose = require("mongoose");
const morgan = require("morgan");
const passport = require("passport");
const configurePassport = require("./configs/passportConfig");
const configureCors = require("./configs/corsConfig");
const session = require("express-session");
const fs = require("fs");
const MongoDBStore = require("connect-mongodb-session")(session);
const { v4: uuidv4 } = require("uuid");

const authRouter = require("./routes/authRouter");
const roleRouter = require("./routes/roleRouter");
const userRouter = require("./routes/userRouter");
const mobileUserRouter = require("./routes/mobileUserRouter");
const googleAuthRouter = require("./routes/googleAuthRouter");
const allowCredentials = require("./configs/allowCredentials");
const { SESSION_COOKIE_OPTIONS } = require("./utils/constants");
const { createRes } = require("./utils/createRes");
const { transporter } = require("./configs/transporter");
const { createRolesInDB } = require("./utils/createRolesInDB");

//= START constants ====================================================================================================
const PORT = process.env.PORT || 8000;
const DB = process.env.DB_NAME || "auth-db";
const DB_URI = process.env.MONGODB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;
// console.log("🚀 ~ file: app.js:21 ~ SESSION_SECRET:", SESSION_SECRET);
// console.log("🚀 ~ file: app.js:9 ~ DB_URI:", DB_URI);
//= END constants ====================================================================================================

//= START https certificates code ====================================================================================================
const serverOptions = {
  key: fs.readFileSync("../sslcerts/private-key.pem"),
  cert: fs.readFileSync("../sslcerts/public-cert.pem"),
};

//= END https certificates code ====================================================================================================

//= START connecting to mongodb ====================================================================================================
mongoose
  .connect(DB_URI)
  .then(() => {
    https.createServer(serverOptions, app).listen(PORT, () => {
      createRolesInDB(); //if roles are not there in the db, it creates

      console.log(
        `Connected to the database '${DB}'\nApp is running at 'https://localhost:${PORT}'`
      );
    });
  })
  .catch((err) => console.error(err.message));
//= END connecting to mongodb ====================================================================================================

//= START middlewares ====================================================================================================
app.use(morgan("combined"));
// app.use(express.urlencoded())
app.use(express.json());

//= START session-store settings ====================================================================================================
const store = new MongoDBStore({
  uri: DB_URI,
  collection: "sessions",
});
// Catch errors
store.on("error", function (error) {
  console.log(error);
});
//= END session-store settings ====================================================================================================

// app.set("trust proxy", 1); // trust first proxy: used for reverse proxy e.g. if the server is forwarding request through Nginx or apache(read more)
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    genid: function (req) {
      return uuidv4(); // use UUIDs for session IDs
    },
    cookie: SESSION_COOKIE_OPTIONS, // only sends cookie back when site has https enabled
    store: store,
  })
);

// passport middleware initialization
app.use(passport.initialize());
app.use(passport.session());
//= END middlewares ====================================================================================================

//= START configurations ====================================================================================================
app.use(allowCredentials); // required for secured sessions(http-only + secure coockies)
configureCors(app);
configurePassport(passport);
//= END configurations ====================================================================================================

//= START endpoints ====================================================================================================
// for testing
app.get("/", (req, res) => {
  // req.session.abc = "test";

  res.status(200).send("up!");
});
app.get("/api/v1", (req, res) => {
  // console.log("req.session.abc: ", req.session.abc);

  res.status(200).send("/api/v1: up!");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/roles", roleRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/mobileusers", mobileUserRouter);
//= END endpoints ====================================================================================================
