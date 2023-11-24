const { body } = require("express-validator");

//= validation chain for emails ====================================================================================================
const emailValidationChain = () =>
  body("email").isEmail().withMessage("Invalid email.");

//= validation chain for strong passwords ====================================================================================================
const passwordValidationChain = () =>
  body("password")
    .isStrongPassword()
    .withMessage(
      "Password must be atleast 8 characters long and must contain 1 special character, 1 capital letter and 1 number."
    );
const newPasswordValidationChain = () =>
  body("newPassword")
    .isStrongPassword()
    .withMessage(
      "Password must be atleast 8 characters long and must contain 1 special character, 1 capital letter and 1 number."
    );
const mobileNoValidationChain = () =>
  body("newPassword").isMobilePhone().withMessage("Not a valid mobile number.");

module.exports = {
  emailValidationChain,
  passwordValidationChain,
  newPasswordValidationChain,
  mobileNoValidationChain,
};
