const Listing = require("../models/listing.js");
const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.Signup = async (req, res) => {
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
    
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.Login = async (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect(res.locals.redirectUrl || "/listings");
};

module.exports.Logout =  (req, res,next) => {
  req.logout((err) => {
    if (err) {
        return next(err);
    }
    req.flash("success", "Successfully logged out!");
    res.redirect("/listings");
  });

};