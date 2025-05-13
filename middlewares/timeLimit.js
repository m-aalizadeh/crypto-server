const timeout = require("express-timeout-handler");

const timeLimit = timeout.handler({
  timeout: 10000,
  onTimeout: (req, res) => {
    res.status(503).json({ status: "error", message: "Request timed out" });
  },
  onDelayedResponse: (req, method, args, requestTime) => {
    console.warn(`Attempted to call ${method} after timeout`);
  },
});

module.exports = timeLimit;
