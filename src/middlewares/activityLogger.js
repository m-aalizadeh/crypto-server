// middleware/activityLogger.js
const winston = require("winston");
const { createLogger, format, transports } = winston;
const { combine, timestamp, json, printf } = format;
const mongoose = require("mongoose");

// 1. Database Schema for Activity Logs (MongoDB example)
const activityLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level: String,
  message: String,
  meta: {
    method: String,
    url: String,
    ip: String,
    status: Number,
    duration: Number,
    userAgent: String,
    userId: mongoose.Schema.Types.Mixed,
    error: mongoose.Schema.Types.Mixed,
  },
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

// 2. Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message}: ${JSON.stringify(
    meta
  )}`;
});

// 3. Configure Winston logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [
    // Console transport with pretty printing
    new transports.Console({
      format: combine(format.colorize(), consoleFormat),
    }),
    // File transport
    new transports.File({ filename: "logs/activity.log" }),
    // Error-specific file transport
    new transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
  ],
});

// 4. Sensitive data filter
const sensitiveFields = ["password", "token", "creditCard", "authorization"];
const sanitizeData = (data) => {
  if (!data || typeof data !== "object") return data;

  const result = Array.isArray(data) ? [...data] : { ...data };

  sensitiveFields.forEach((field) => {
    if (result[field]) {
      result[field] = "**REDACTED**";
    }
  });

  return result;
};

// 5. Main middleware function
exports.activityLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip, headers, body, user } = req;

  // Log request details
  const requestLog = {
    method,
    url: originalUrl,
    ip,
    userAgent: headers["user-agent"],
    userId: user?._id || null,
  };

  logger.info("Request", requestLog);

  // Log sanitized request body
  if (body && Object.keys(body).length > 0) {
    logger.debug("Request Body", {
      body: sanitizeData(body),
    });
  }

  // Log response details when finished
  res.on("finish", async () => {
    const duration = Date.now() - start;
    const responseLog = {
      method,
      url: originalUrl,
      status: res.statusCode,
      duration,
      userId: user?._id || null,
    };

    logger.info("Response", responseLog);

    // Log slow requests
    if (duration > 1000) {
      logger.warn("Slow Request", {
        ...responseLog,
        threshold: "1000ms",
      });
    }

    // Save to database (non-blocking)
    try {
      await ActivityLog.create({
        level: "info",
        message: "HTTP Request",
        meta: responseLog,
      });
    } catch (err) {
      logger.error("Failed to save activity log", { error: err.message });
    }
  });

  // Error handling
  res.on("error", (err) => {
    logger.error("Response Error", {
      error: err.message,
      stack: err.stack,
      url: originalUrl,
      method,
    });
  });

  next();
};

// 6. Error logging middleware (to be used after routes)
exports.errorLogger = (err, req, res, next) => {
  const { method, originalUrl, user } = req;

  logger.error("Application Error", {
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: originalUrl,
    method,
    userId: user?._id || null,
  });

  // Save error to database
  ActivityLog.create({
    level: "error",
    message: err.message,
    meta: {
      method,
      url: originalUrl,
      error: {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      userId: user?._id || null,
    },
  }).catch((dbErr) => {
    logger.error("Failed to save error log", { error: dbErr.message });
  });

  next(err);
};
