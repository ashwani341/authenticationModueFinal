const express = require("express");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMobileUserById,
} = require("../controllers/userController");
const {
  emailValidationChain,
  passwordValidationChain,
} = require("../validations/validChains");
const passport = require("passport");

const router = express.Router();

// router.post(
//   "/",
//   [emailValidationChain(), passwordValidationChain()],
//   createUser
// );
// router.get("/", getAllUsers);

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  getMobileUserById
);

// router.put("/:id", emailValidationChain(), updateUser);
// router.delete("/:id", deleteUser);

module.exports = router;
