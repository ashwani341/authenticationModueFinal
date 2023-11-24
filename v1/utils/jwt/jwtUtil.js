const jwt = require("jsonwebtoken");
const {
  ACCESS_TOKEN_AGE,
  REFRESH_TOKEN_AGE,
  EMAIL_VERIFICATION_TOKEN_AGE,
  EMAIL_PASSWORD_RESET_TOKEN_AGE,
} = require("../constants");

const jwtSecret = process.env.JWT_SECRET;

function generateAccessToken(user) {
  const jwtPayload = {
    userId: user.id,
  };
  const jwtOptions = {
    expiresIn: ACCESS_TOKEN_AGE,
  };

  const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
  // console.log("🚀 ~ file: authController.js:51 ~ register ~ token:", token);

  return token;
}

function generateRefreshToken(user) {
  const jwtPayload = {
    userId: user.id,
  };
  const jwtOptions = {
    expiresIn: REFRESH_TOKEN_AGE,
  };

  const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
  // console.log("🚀 ~ file: authController.js:51 ~ register ~ token:", token);

  return token;
}

function generateVerificationToken(user) {
  const jwtPayload = {
    email: user.email,
  };
  const jwtOptions = {
    expiresIn: EMAIL_VERIFICATION_TOKEN_AGE,
  };

  const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
  // console.log("🚀 ~ file: authController.js:51 ~ register ~ token:", token);

  return token;
}

function generatePasswordResetToken(user) {
  const jwtPayload = {
    email: user.email,
  };
  const jwtOptions = {
    expiresIn: EMAIL_PASSWORD_RESET_TOKEN_AGE,
  };

  const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
  // console.log("🚀 ~ file: authController.js:51 ~ register ~ token:", token);

  return token;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
};
