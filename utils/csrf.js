const csrf = require("csurf");

exports.csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
});

exports.ensureCsrfToken = (req, res, next) => {
  if (!req.csrfToken) {
    return res
      .status(403)
      .json({ status: "success", message: "CSRF token missing" });
  }
  next();
};
