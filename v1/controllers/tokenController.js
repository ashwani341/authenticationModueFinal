// const { validationResult } = require("express-validator");
const jwtUtil = require("../utils/jwt/jwtUtil");
const { createRes } = require("../utils/createRes");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

async function handleRefreshToken(req, res) {
  try {
    // //= errors from express-validator ====================================================================================================
    // const errors = validationResult(req);
    // if (!errors.isEmpty())
    //   return res
    //     .status(400)
    //     .json(createRes([errors.array()[0].msg], null, true));

    if (!req?.session?.rt)
      return res.status(401).json(createRes(["Refresh Token not found."], null, true));


    //= extracting jwt token ====================================================================================================
    const refreshToken = req.session.rt;
    // console.log(
    // "🚀 ~ file: tokenController.js:26 ~ handleRefreshToken ~ refreshToken:",
    // refreshToken
    // );

    const decoded = jwt.verify(refreshToken, jwtSecret);
    // console.log(
    // "🚀 ~ file: tokenController.js:27 ~ refreshToken ~ decoded:",
    // decoded
    // );
    const id = decoded.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(403)
        .json(createRes([`'${id}' is not a valid ObjectId.`], null, true));

    let user = await User.findById(id);
    if (!user)
      return res
        .status(400)
        .json(createRes([`No record found with id: '${id}'.`], null, true));

    const accessToken = jwtUtil.generateAccessToken(user);

    user = {
      ...user._doc,
      accessToken,
    };

    // return res.sendStatus(200);

    return res.status(200).json(
      createRes(["Aceess token generated successfully."], {
        user,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

module.exports = {
  handleRefreshToken,
};
