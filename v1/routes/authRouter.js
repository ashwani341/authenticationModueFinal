const router = require("express").Router();

const {
  handleRegister,
  handleLogin,
  handleLogout,
  handleSetSession,
  handleGetSession,
  handleSessionDestroy,
  handleVerify,
  handleEmailPasswordReset,
  handleSendPasswordResetEmail,
  handleSendOTP,
  handleverifyOTP,
  handleMobileUserFNLN,
} = require("../controllers/authController");
const {
  emailValidationChain,
  passwordValidationChain,
  newPasswordValidationChain,
  mobileNoValidationChain,
} = require("../validations/validChains");
const { handleRefreshToken } = require("../controllers/tokenController");
const passport = require("passport");
const {
  extractTokenFromAuthHeader,
} = require("../middlewares/extractTokenFromAuthHeader");
const { findOne, findOneAndUpdate } = require("../models/GoogleUser");
const GoogleUser = require("../models/GoogleUser");
const { createRes } = require("../utils/createRes");

router.post(
  "/register",
  [emailValidationChain(), passwordValidationChain()],
  handleRegister
);
router.post("/login", handleLogin);
router.get(
  "/verify",
  passport.authenticate("jwt", { session: false }),
  handleVerify
);
router.post(
  "/email/password/reset/send",
  emailValidationChain(),
  handleSendPasswordResetEmail
);
router.post(
  "/email/password/reset",
  [
    newPasswordValidationChain(),
    extractTokenFromAuthHeader,
    passport.authenticate("jwt", { session: false }),
  ],
  handleEmailPasswordReset
);
router.get(
  "/logout",
  extractTokenFromAuthHeader,
  passport.authenticate("jwt", { session: false }),
  handleLogout
);

router.get("/refresh", handleRefreshToken);

//#region login with google endpoints ####################################################################################################
router.get(
  "/google",
  (req, res, next) => {
    //= if the user is already logged in redirect ====================================================================================================
    if (req?.session?.passport?.user)
      return res.redirect(
        `${process.env.FRONTEND_URI}/`
      );

    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "api/v1/auth/google/logout",
//     successReturnToOrRedirect: `${process.env.FRONTEND_URI}/`,
//   })
// );
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", function (err, user, info, status) {
    console.log("🚀 ~ file: authRouter.js:68 ~ user:", user);
    if (err) {
      console.log("🚀 ~ file: authRouter.js:70 ~ err:", err);
      return res.redirect(`${process.env.FRONTEND_URI}/login?error=${err}`);
    }
    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URI}/login?error='User not found.'`
      );
    }
    //= first store the user into session then redirect ====================================================================================================
    req.session.passport = { user };
    return res.redirect(`${process.env.FRONTEND_URI}/`);
  })(req, res, next);
});

router.get("/google/user", (req, res) => {
  if (!req?.user)
    return res.status(400).json(createRes(["Not logged in."], null, true));

  return res.status(200).json(req.user);
});

// router.get("/google/logout", async function (req, res) {
//   try {
//     const currentUser = req?.session?.passport?.user;
//     if (currentUser) {
//       console.log("🚀 ~ file: authRouter.js:78 ~ currentUser:", currentUser);

//       const accessToken = currentUser.accessTokens[0];

//       const user = await GoogleUser.findOne({ email: currentUser.email });
//       user.accessTokens = user.accessTokens.filter(
//         (token) => token !== accessToken
//       );
//       await GoogleUser.findOneAndUpdate(
//         { email: currentUser.email },
//         { accessTokens: user.accessTokens }
//       );
//     }

//     req.logout(function (err) {
//       if (err) {
//         console.log("🚀 ~ file: authRouter.js:111 ~ err:", err);
//         return res.sendStatus(500);
//       }
//       return res.redirect(`${process.env.FRONTEND_URI}/login`);
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(createRes([error.message], null, true));
//   }
// });
//#endregion login with google endpoints #################################################################################################

//#region OTP Login ####################################################################################################
router.post("/otp/send", handleSendOTP);
router.post("/otp/verify", handleverifyOTP);
router.post("/mobileuser/fnln", handleMobileUserFNLN);
// router.post("/mobileuser/logout", handleMobileUserFNLN);
//#endregion OTP Login #################################################################################################

// router.get("/setSession", handleSetSession);
// router.get("/getSession", handleGetSession);
// router.get("/destroySession", handleSessionDestroy);

module.exports = router;
