var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport");

var User        = require("../models/user");


//Sign up page route
router.get("/signup", function(req, res) {
    res.render("signup.ejs");
});

//Handle sign up logic
router.post("/signup", function(req, res) {
    var newUser = new User({
        username: req.body.username
    });
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err.message);
            req.flash("error", err.message);
            return res.redirect("/signup");
        } else {
            passport.authenticate("local")(req, res, function() {
                req.flash("success", "Welcome on board "+ req.user.username);
                res.redirect("/");
            });
        }
    });
});


//Login page route
router.get("/login", function(req, res) {
    res.render("login.ejs");
});
//Handle login logic route
router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: "Failed to login, please check your login/password",
    successFlash: "Welcome back"
}), function(req, res) {});



//Handle logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged off successfully, come back again!")
    res.redirect("/");
})

//Middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
	req.flash("error", "You must be logged in to access this page!");
    res.redirect("/login");
}
module.exports = router;