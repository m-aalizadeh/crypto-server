exports.getCsrfToken = (req, res) => {
  res.status(200).json({ csurfToken: req.csrfToken() });
};
