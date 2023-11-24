const { validationResult } = require("express-validator");
const generateUsername = require("../utils/generateUsername");
const getUserRoleId = require("../utils/getUserRoleId");
const User = require("../models/User");
const { encryptPassword, verifyPassword } = require("../utils/passwordEncDec");
const { createRes } = require("../utils/createRes");
const jwtUtil = require("../utils/jwt/jwtUtil");
const validator = require("validator");
const {
  sendPasswordVerificationMail,
} = require("../utils/sendPasswordResetMail");
const { sendVerificationEmail } = require("../utils/sendVerificationEmail");
const { format } = require("date-fns");
const GoogleUser = require("../models/GoogleUser");
const { generateOTP } = require("../utils/generateOTP");
const MobileUser = require("../models/MobileUser");
const PasswordResetToken = require("../models/PasswordResetToken");
const { sendOTP } = require("../configs/twillioSMS");
const OTPs = require("../models/OTPs");

async function handleRegister(req, res) {
  try {
    //#region errors thorwn by express-validator ####################################################################################################
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json(createRes([errors.array()[0].msg], null, true));
    //#endregion errors thorwn by express-validator #################################################################################################

    const newUser = req.body;

    let userExists = null;
    userExists = await GoogleUser.findOne({ email: newUser.email });
    if (userExists)
      return res
        .status(400)
        .json(createRes(["User already exists."], null, true));
    userExists = await User.findOne({ email: newUser.email });
    if (userExists)
      return res
        .status(400)
        .json(createRes(["User already exists."], null, true));

    //= generating username ====================================================================================================
    newUser.username = generateUsername(newUser.email);

    //= assigning default role 'USER' to newUSer ====================================================================================================
    const userRoleId = await getUserRoleId();
    newUser.roles = [userRoleId];
    newUser.lastLogin = Date.now();
    // // console.log(
    // // "🚀 ~ file: authController.js:21 ~ register ~ newUser:",
    // // newUser
    // // );

    //= hashing the password ====================================================================================================
    const hashedPassword = await encryptPassword(newUser.password);
    newUser.password = hashedPassword;
    // // console.log(
    // // "🚀 ~ file: authController.js:29 ~ register ~ newUser:",
    // // newUser
    // // );

    const user = await User.create(newUser);

    // send a link to the user's mail for verification
    await sendVerificationEmail(user);

    return res
      .status(200)
      .json(createRes(["User registration successfull."], user));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

async function handleLogin(req, res) {
  try {
    // //= errors from express-validator ====================================================================================================
    // const errors = validationResult(req);
    // if (!errors.isEmpty())
    //   return res.status(400).json({ errors: errors.array()[0].msg });

    const loginUserDetails = req.body;

    //= find the user with the given username ====================================================================================================
    let user = null;
    let mylastlogin = null;
    if (validator.isEmail(loginUserDetails.username)) {
      user = await User.findOne({ email: loginUserDetails.username });
    } else {
      user = await User.findOne({ username: loginUserDetails.username });
    }

    if (!user)
      return res.status(400).json(createRes([`User not found.`], null, true));

    mylastlogin = user.lastLogin;

    //= try to match the stored password and given password ====================================================================================================
    const isPasswordCorrect = await verifyPassword(
      loginUserDetails.password,
      user.password
    );
    if (isPasswordCorrect != null && !isPasswordCorrect)
      return res.status(400).json(createRes([`Wrong password.`], null, true));

    if (!user.isVerified)
      return res
        .status(401)
        .json(createRes([`Please verify Email first.`], null, true));

    //= generating jwt token ====================================================================================================
    const newAccessToken = jwtUtil.generateAccessToken(user);

    //= just add new accessToken ====================================================================================================
    user.accessTokens.push(newAccessToken);

    // let datez = new Date(mylastlogin)
    // const timez = datez.toLocaleTimeString('en-US', { timeStyle: 'short', timeZone: 'IST' });
    // console.log('login time',timez)
    user = await User.findByIdAndUpdate(
      user.id,
      {
        accessTokens: user.accessTokens,
        isEnabled: user.isEnabled,
        lastLogin: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      },
      {
        new: true,
      }
    );

    // const refreshToken = jwtUtil.generateRefreshToken(user);
    // // console.log(
    // // "🚀 ~ file: authController.js:47 ~ register ~ refreshToken:",
    // // refreshToken
    // // );
    // req.session.rt = refreshToken

    const resUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      roles: user.roles,
      accessToken: newAccessToken,
      provider: user.provider,
      isVerified: user.isVerified,
      isEnabled: user.isEnabled,
      lastLogin: mylastlogin,
    };
    // // console.log("🚀 ~ file: authController.js:103 ~ login ~ resUser:", resUser);

    return res.status(200).json(createRes(["Login successfull."], resUser));
    // return res.status(200).json({ message: "done!" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

async function handleVerify(req, res) {
  try {
    //= errors from express-validator ====================================================================================================
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json(createRes([errors.array()[0].msg], null, true));

    //= check for refresh token for the session ====================================================================================================
    // if (!req?.session?.rt)
    //   return res.status(401).json(createRes(["Refresh Token not found."], null, true));

    //= extract user after jwt verification ====================================================================================================
    const user = req.user;

    // if (!user.accessTokens.includes(accessToken))
    //   return res
    //     .status(403)
    //     .json(createRes([`Access Token mismatch`], null, true));

    if (user.isVerified)
      return res
        .status(403)
        .json(createRes(["User is already verified."], null));

    //= update the verification status ====================================================================================================
    await User.findByIdAndUpdate(user.id, { isVerified: true }, { new: true });

    // return res.sendStatus(200);
    return res
      .status(200)
      .json(createRes(["User verification successfull."], null));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

async function handleSendPasswordResetEmail(req, res) {
  try {
    //= errors from express-validator ====================================================================================================
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json(createRes([errors.array()[0].msg], null, true));

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json(createRes([`User not found.`], null, true));

    if (!user.isVerified)
      return res
        .status(403)
        .json(createRes(["User email is not verified."], null));

    //= send password reset mail ====================================================================================================
    await sendPasswordVerificationMail(user);

    // return res.sendStatus(200);
    return res.status(200).json(createRes(["Mail sent successfully."], null));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

async function handleEmailPasswordReset(req, res) {
  try {
    //= errors from express-validator ====================================================================================================
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json(createRes([errors.array()[0].msg], null, true));

    //= extract user after jwt verification ====================================================================================================
    const user = req.user;
    const token = req.token;
    if (!user.isVerified)
      return res
        .status(403)
        .json(createRes(["User email is not verified."], null));

    //= check if the token is present in the database ====================================================================================================
    const passwordResetToken = await PasswordResetToken.findOne({ token });
    if (!passwordResetToken)
      return res
        .status(400)
        .json(
          createRes(["Password reset link not valid. Try again."], null, true)
        );

    const { newPassword } = req.body;

    //= hashing the password ====================================================================================================
    const hashedPassword = await encryptPassword(newPassword);

    //= update the verification status ====================================================================================================
    await User.findByIdAndUpdate(
      user.id,
      { password: hashedPassword },
      { new: true }
    );

    //= delete the token after successfull password change ====================================================================================================
    await PasswordResetToken.findOneAndDelete({ email: user.email });

    // return res.sendStatus(200);
    return res
      .status(200)
      .json(createRes(["Password reset successfull."], null));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

async function handleLogout(req, res) {
  try {
    // //= errors from express-validator ====================================================================================================
    // const errors = validationResult(req);
    // if (!errors.isEmpty())
    //   return res
    //     .status(400)
    //     .json(createRes([errors.array()[0].msg], null, true));

    //= check for refresh token for the session ====================================================================================================
    // if (!req?.session?.rt)
    //   return res.status(401).json(createRes(["Refresh Token not found."], null, true));

    //= extracting jwt token ====================================================================================================
    // const refreshToken = req.session.rt
    // // console.log(
    // // "🚀 ~ file: tokenController.js:16 ~ refreshToken ~ token:",
    // // token
    // // );

    // //= START extracting token from header ====================================================================================================
    // const authHeader = req.headers.authorization;
    // // console.log(
    // //   "🚀 ~ file: authController.js:148 ~ handleLogout ~ authHeader:",
    // //   authHeader
    // // );

    // if (!authHeader) {
    //   return res
    //     .status(403)
    //     .json(createRes([`Authorization header not found.`], null, true));
    // }

    // if (authHeader.split(" ")[0] !== "Bearer") {
    //   return res
    //     .status(403)
    //     .json(createRes([`Something wrong with Bearer.`], null, true));
    // }

    // const accessToken = authHeader.split(" ")[1];
    // // console.log(
    // //   "🚀 ~ file: authController.js:154 ~ handleLogout ~ accessToken:",
    // //   accessToken
    // // );
    // if (accessToken === "null")
    //   return res.status(403).json(createRes([`Token not found`], null, true));
    // //= END extracting token from header ====================================================================================================

    // //= verify the token ====================================================================================================
    // const decoded = jwt.verify(accessToken, jwtSecret);

    // const user = await User.findById(decoded.userId);
    // if (!user)
    //   return res.status(403).json(createRes([`User not found`], null, true));

    const user = req.user;
    const accessToken = req.token;

    //#region Normal users logout ####################################################################################################
    if (user.provider === "local") {
      if (!user.accessTokens.includes(accessToken))
        return res
          .status(403)
          .json(createRes([`Access Token mismatch`], null, true));

      // remove the current token from the database
      user.accessTokens = user.accessTokens.filter(
        (token) => token !== accessToken
      );
      // console.log("user.accessTokens: ", user.accessTokens);

      //= delete the accessToken ====================================================================================================
      await User.findByIdAndUpdate(
        user.id,
        { accessTokens: user.accessTokens },
        { new: true }
      );
    }
    //#endregion Normal users logout #################################################################################################

    //#region googleusers logout ####################################################################################################
    if (user.provider === "google") {
      const currentUser = req?.session?.passport?.user;
      console.log(
        "🚀 ~ file: authController.js:356 ~ handleLogout ~ req?.session:",
        req?.session
      );
      if (currentUser) {
        console.log("🚀 ~ file: authRouter.js:78 ~ currentUser:", currentUser);

        const accessToken = currentUser.accessTokens[0];

        const user = await GoogleUser.findOne({ email: currentUser.email });
        user.accessTokens = user.accessTokens.filter(
          (token) => token !== accessToken
        );
        await GoogleUser.findOneAndUpdate(
          { email: currentUser.email },
          { accessTokens: user.accessTokens }
        );
      }

      req.logout(function (err) {
        if (err) {
          console.log("🚀 ~ file: authRouter.js:111 ~ err:", err);
          return res.sendStatus(500);
        }
      });
    }
    //#endregion googleusers logout #################################################################################################

    //#region mobile users logout ####################################################################################################
    if (user.provider === "mobile") {
      if (!user.accessTokens.includes(accessToken))
        return res
          .status(403)
          .json(createRes([`Access Token mismatch`], null, true));

      // remove the current token from the database
      user.accessTokens = user.accessTokens.filter(
        (token) => token !== accessToken
      );
      // console.log("user.accessTokens: ", user.accessTokens);

      //= delete the accessToken ====================================================================================================
      await MobileUser.findByIdAndUpdate(
        user.id,
        { accessTokens: user.accessTokens },
        { new: true }
      );
    }
    //#endregion mobile users logout #################################################################################################

    // return res.sendStatus(200);

    return res.status(200).json(createRes(["Loged out successfully."], null));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

//#region OTP Login handlers ####################################################################################################
let STORED_OTPS = {};

async function handleSendOTP(req, res) {
  try {
    //= errors from express-validator ====================================================================================================
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json(createRes([errors.array()[0].msg], null, true));

    let { mobile } = req.body;
    mobile = mobile.replace(/\s/g, ""); // removing all the white spaces
    // console.log(
    // "🚀 ~ file: authController.js:364 ~ handleSendOTP ~ mobile:",
    // mobile
    // );
    if (!mobile.startsWith("+91"))
      return res
        .status(400)
        .json(createRes(["Mobile no. should start with '+91'."], null, true));

    if (!mobile.slice(3).match(/^\d{10}$/))
      return res
        .status(400)
        .json(
          createRes(
            ["Please provide a valid mobile no(10 digits)."],
            null,
            true
          )
        );

    const OTP = generateOTP();
    console.log("🚀 ~ file: authController.js:372 ~ handleSendOTP ~ OTP:", OTP);

    let storedOTP = await OTPs.findOneAndUpdate({ mobile }, { otp: OTP });
    if (!storedOTP)
      storedOTP = await OTPs.create({
        mobile,
        otp: OTP,
      });
    console.log(
      "🚀 ~ file: authController.js:459 ~ handleSendOTP ~ storedOTP:",
      storedOTP
    );

    //= send otp to user ====================================================================================================
    // sendOTP(mobile, OTP);

    // return res.sendStatus(200);
    return res.status(200).json(createRes(["OTP sent successfully."], null));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

async function handleverifyOTP(req, res) {
  try {
    //= errors from express-validator ====================================================================================================
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json(createRes([errors.array()[0].msg], null, true));

    let { mobile } = req.body;
    mobile = mobile.replace(/\s/g, ""); // removing all the white spaces
    let { otp } = req.body;
    otp = parseInt(otp);

    const storedOTP = await OTPs.findOne({ mobile });
    if (!storedOTP)
      return res
        .status(500)
        .json(createRes(["Generate an OTP first."], null, true));

    if (otp !== storedOTP.otp)
      return res
        .status(500)
        .json(createRes(["OTP verification failed."], null, true));

    await OTPs.findOneAndDelete({ mobile });

    let user = await MobileUser.findOne({ mobile });
    console.log(
      "🚀 ~ file: authController.js:410 ~ handleverifyOTP ~ user:",
      user
    );

    if (!user) {
      //= assigning default role 'USER' to newUSer ====================================================================================================
      const userRoleId = await getUserRoleId();
      const roles = [userRoleId];
      const lastLogin = Date.now();

      user = await MobileUser.create({
        mobile,
        roles,
        firstName: null,
        lastName: null,
        username: null,
        // accessTokens: [newAccessToken],
        lastLogin,
      });
    } else {
      //= generating jwt token ====================================================================================================
      const newAccessToken = jwtUtil.generateAccessToken(user);
      user.accessTokens.push(newAccessToken);
      user = await MobileUser.findOneAndUpdate(
        { mobile },
        { accessTokens: user.accessTokens },
        { new: true }
      );
      if (!user)
        return res.status(500).json(createRes(["User not found."], null, true));
      // send only created token for this request, not all the tokens
      user.accessTokens = [newAccessToken];
    }

    // return res.sendStatus(200);
    return res
      .status(200)
      .json(createRes(["OTP verified successfully."], user));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

async function handleMobileUserFNLN(req, res) {
  try {
    //= errors from express-validator ====================================================================================================
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json(createRes([errors.array()[0].msg], null, true));

    let { mobile, firstName, lastName } = req.body;
    mobile = mobile.replace(/\s/g, ""); // removing all the white spaces

    let user = await MobileUser.findOne({ mobile });
    if (!user)
      return res.status(500).json(createRes(["User not found."], null, true));

    //= generating jwt token ====================================================================================================
    const newAccessToken = jwtUtil.generateAccessToken(user);
    const username = generateUsername(firstName + lastName);
    console.log(
      "🚀 ~ file: authController.js:561 ~ handleMobileUserFNLN ~ username:",
      username
    );

    user = await MobileUser.findOneAndUpdate(
      { mobile },
      { username, firstName, lastName, accessTokens: [newAccessToken] },
      { new: true }
    );
    if (!user)
      return res.status(500).json(createRes(["User not found."], null, true));

    //= send newly generated username in message ====================================================================================================
    // sendUsername(mobile, username);

    // return res.sendStatus(200);
    return res
      .status(200)
      .json(
        createRes(["First name and last name updated successfully."], user)
      );
  } catch (error) {
    console.error(error);
    return res.status(500).json(createRes([error.message], null, true));
  }
}
//#endregion OTP Login handlers #################################################################################################

async function handleSetSession(req, res) {
  try {
    // //= errors from express-validator ====================================================================================================
    // const errors = validationResult(req);
    // if (!errors.isEmpty())
    //   return res
    //     .status(400)
    //     .json(createRes([errors.array()[0].msg], null, true));

    req.session.authTest = "abc";

    return res.status(200).json(createRes(["setSession successfully."], null));
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

async function handleGetSession(req, res) {
  try {
    // //= errors from express-validator ====================================================================================================
    // const errors = validationResult(req);
    // if (!errors.isEmpty())
    //   return res
    //     .status(400)
    //     .json(createRes([errors.array()[0].msg], null, true));

    const sessionData = req.session;

    return res
      .status(200)
      .json(createRes(["getSession successfully."], sessionData));
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

async function handleSessionDestroy(req, res) {
  try {
    // //= errors from express-validator ====================================================================================================
    // const errors = validationResult(req);
    // if (!errors.isEmpty())
    //   return res
    //     .status(400)
    //     .json(createRes([errors.array()[0].msg], null, true));

    req.session.authTest = null;

    return res.status(200).json(createRes(["session destroyed successfully."]));
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

module.exports = {
  handleRegister,
  handleLogin,
  handleVerify,
  handleLogout,
  handleSendPasswordResetEmail,
  handleEmailPasswordReset,
  handleSendOTP,
  handleverifyOTP,
  handleMobileUserFNLN,
  handleSetSession,
  handleGetSession,
  handleSessionDestroy,
};
