const express = require("express");
const router = express.Router();
const user = require("../models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { saveRedirectUrl } = require("../midddleware.js");
const userController = require("../controllers/users.js");

router.route("/signup")
.get(userController.renderSignupForm)
.post( wrapAsync(userController.Signup));

router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }),userController.Login);






router.get("/logout",userController.Logout);





module.exports = router;