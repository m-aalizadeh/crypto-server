const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const rateLimit = require("./middlewares/rateLimit");
const timeout = require("./middlewares/timeLimit");
const { activityLogger, errorLogger } = require("./middlewares/activityLogger");
const routes = require("./routes");
const dotenv = require("dotenv");
const { connectDb } = require("./config/database");

dotenv.config();
connectDb();

const port = process.env.PORT || 8000;

const app = express();
app.use(helmet());
app.use(
  helmet.hsts({
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  })
);
app.use(xss());
app.use(rateLimit);
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(activityLogger);
app.use(express.json());
app.use(timeout);
app.use("/api/v1", routes);
app.use(errorLogger);
app.listen(port, () => console.log("Server is running on port %d", port));
