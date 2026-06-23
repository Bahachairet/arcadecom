const express =
  require("express");

const router =
  express.Router();

const authController =
  require("./auth.controller");

const passport = require(
  "../../config/passport"
);

router.post(
  "/register",
  authController.register
);

router.post(
  "/login",
  authController.login
);

router.post(
  "/logout",
  authController.logout
);

router.get(
  "/me",
  authController.me
);
router.get(
  "/google",
  passport.authenticate(
    "google",
    {
      scope: ["profile", "email"],
    }
  )
);
const {
  setSessionCookie,
} = require(
  "../../utils/cookies"
);
router.get(
  "/google/callback",

  passport.authenticate(
    "google",
    {
      session: false,
      failureRedirect:
        "/login",
    }
  ),

  (req, res) => {
    setSessionCookie(
      res,
      req.user.sessionId
    );

    res.redirect(process.env.CLIENT_URL);
  }
);

module.exports = router;