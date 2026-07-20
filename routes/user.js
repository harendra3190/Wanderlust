const express = require("express");
const router = express.Router();
const user = require("../models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { saveRedirectUrl } = require("../midddleware.js");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res) => {
    try{
        const { email, username, password } = req.body;
    newUser = new user({ email, username });
    const registeredUser = await user.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
    });    


     
    req.flash("success", "Successfully signed up!");
    res.redirect("/listings");

    }

    catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }   
    
}));

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post("/login",saveRedirectUrl, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }),async (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect(res.locals.redirectUrl || "/listings");
});

router.get("/logout", (req, res,next) => {
  req.logout((err) => {
    if (err) {
        return next(err);
    }
    req.flash("success", "Successfully logged out!");
    res.redirect("/listings");
  });

});





module.exports = router;