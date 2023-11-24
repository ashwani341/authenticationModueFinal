const passport = require("passport");

const router = require("express").Router();

//#region login with google endpoints ####################################################################################################
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/callback",
  passport.authenticate("google", {
    successReturnToOrRedirect: `${process.env.FRONTEND_URI}/`,
    failureRedirect: `${process.env.FRONTEND_URI}/login`,
  })
);
router.get("/user", (req, res) => {
  res.status(200).json(req.user);
});

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    return res.redirect(`${process.env.FRONTEND_URI}`);
  });
});
//#endregion login with google endpoints #################################################################################################

module.exports = router;
