const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const rateLimit = require("./src/middlewares/rateLimit");
const timeout = require("./src/middlewares/timeLimit");
const {
  activityLogger,
  errorLogger,
} = require("./src/middlewares/activityLogger");
const routes = require("./src/routes");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./docs/swagger.yaml");

const { connectDb } = require("./src/config/database");

dotenv.config();
connectDb();

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
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(activityLogger);
app.use(express.json());
app.use(timeout);
app.use("/api/v1", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errorLogger);

module.exports = app;
