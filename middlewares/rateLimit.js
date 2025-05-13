const rateLimitMap = new Map();

const customRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const limit = 100;
  const windowMs = 15 * 60 * 1000;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 0, lastReset: Date.now() });
  }
  const record = rateLimitMap.get(ip);

  if (Date.now() - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = Date.now();
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil(
      (record.lastReset + windowMs - Date.now()) / 1000
    );
    res.set("Retry-After", retryAfter);
    return res
      .status(429)
      .json({ status: "error", message: "Too many requests" });
  }

  record.count++;
  next();
};

module.exports = customRateLimiter;
