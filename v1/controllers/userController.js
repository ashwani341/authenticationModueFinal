const { validationResult } = require("express-validator");
const User = require("../models/User");
const mongoose = require("mongoose");
const generateUsername = require("../utils/generateUsername");
const getUserRoleId = require("../utils/getUserRoleId");
const { createRes } = require("../utils/createRes");
const { encryptPassword } = require("../utils/passwordEncDec");
const MobileUser = require("../models/MobileUser");

//= for creating user ====================================================================================================
async function createUser(req, res) {
  try {
    //= errors from express-validator ====================================================================================================
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json(createRes([errors.array()[0].msg], null, true));

    const newUser = req.body;
    // console.log("before generating username: ", newUser);

    //= generating username ====================================================================================================
    newUser.username = generateUsername(newUser.email);
    // console.log("after generating username: ", newUser);

    //= assigning default role 'USER' to newUSer ====================================================================================================
    const userRoleId = await getUserRoleId();
    newUser.roles = [userRoleId];
    // console.log("after assigning default role: ", newUser);

    //= hashing the password ====================================================================================================
    const hashedPassword = await encryptPassword(newUser.password);
    newUser.password = hashedPassword;

    const user = await User.create(newUser);
    return res
      .status(200)
      .json(createRes(["User created successfully."], user));
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

//= for fetching all the users ====================================================================================================
async function getAllUsers(req, res) {
  try {
    // const users = await User.find().populate("roles");
    const users = await User.find();

    return res
      .status(200)
      .json(createRes(["Fetched all the users successfully."], users));
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}
//= for fetching single User ====================================================================================================
async function getUserById(req, res) {
  try {
    // console.log("req.user: ", req.user);
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json(createRes([`'${id}' is not a valid ObjectId.`], null, true));

    const user = await User.findById(id);
    if (!user)
      return res
        .status(200)
        .json(createRes([`No record found with id: '${id}'.`], null, true));

    return res
      .status(200)
      .json(createRes([`User with id '${id}' fetched successfully.`], user));
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

//= for fetching mobile users ====================================================================================================
async function getMobileUserById(req, res) {
  try {
    // console.log("req.user: ", req.user);
    const mobile = req.params.id;
    // console.log("🚀 ~ file: userController.js:91 ~ getMobileUserById ~ mobile:", mobile)

    const user = await MobileUser.findOne({ mobile });
    if (!user)
      return res
        .status(200)
        .json(createRes([`No record found with mobile no.: '${mobile}'.`], null, true));

    return res
      .status(200)
      .json(createRes([`User with mobile '${mobile}' fetched successfully.`], user));
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

//= for updating an existing user ====================================================================================================
async function updateUser(req, res) {
  try {
    //= errors from express-validator ====================================================================================================
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json(createRes([errors.array()[0].msg], null, true));

    const id = req.params.id;
    let newUser = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json(createRes([`'${id}' is not a valid ObjectId.`], null, true));

    const user = await User.findById(id);
    if (!user)
      return res
        .status(200)
        .json(createRes([`No record found with id: '${id}'.`], null, true));

    //= hashing the password ====================================================================================================
    // const hashedPassword = await encryptPassword(newUser.password);
    // newUser.password = hashedPassword;

    //= making the updated user's password same as previously stored one ====================================================================================================
    newUser.password = user.password;

    const updatedUser = await User.findByIdAndUpdate(id, newUser, {
      new: true,
    });

    return res
      .status(200)
      .json(
        createRes([`User with id '${id}' updated successfully.`], updatedUser)
      );
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

//= for deleting an existing user ====================================================================================================
async function deleteUser(req, res) {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json(createRes([`'${id}' is not a valid ObjectId.`], null, true));

    const user = await User.findById(id);
    if (!user)
      return res
        .status(200)
        .json(createRes([`No record found with id: '${id}'.`], null, true));

    const deletedUser = await User.findByIdAndRemove(id);

    return res
      .status(200)
      .json(
        createRes([`User with id '${id}' deleted successfully.`], deletedUser)
      );
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMobileUserById,
};
