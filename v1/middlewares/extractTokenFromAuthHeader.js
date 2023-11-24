const { createRes } = require("../utils/createRes");

function extractTokenFromAuthHeader(req, res, next) {
  const authHeader = req.headers.authorization;
  // console.log(
  // "🚀 ~ file: authController.js:148 ~ handleLogout ~ authHeader:",
  // authHeader
  // );

  if (!authHeader) {
    return res
      .status(403)
      .json(createRes([`Authorization header not found.`], null, true));
  }

  const [bearer, token] = authHeader.split(" ");

  if (bearer !== "Bearer") {
    return res
      .status(403)
      .json(createRes([`Wrong Bearer Token format.`], null, true));
  }

  if (token === "null" || !token)
    return res.status(403).json(createRes([`Token not found.`], null, true));

  req.token = token;
  next();
}

module.exports = {
  extractTokenFromAuthHeader,
};
