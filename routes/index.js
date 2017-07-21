var express = require("express");
var router  = express.Router({mergeParams: true});
var passport = require("passport");
var User = require("../models/user.js");
var Message = require("../models/message.js");
var messageRoutes = require("./messages");
var middleware = require("../middleware/index.js");

router.use(messageRoutes);

//Default Route
router.get("/", middleware.isLoggedIn, function(req, res){
	if (req.isAuthenticated) { //If logged in, go to the '/messages' route
		res.redirect("/messages");
	} else { //If not logged in, go to the '/home' route
		res.redirect("/home");
	}
});

//Home Route
//Contains links to Login and Sign Up Pages
router.get("/home", middleware.isNotLoggedIn, function(req, res){
	res.render("home.html");
});

//Login Routes
router.get("/login", middleware.isNotLoggedIn, function(req, res){
	res.render("login.html");
});

//If login fails
router.get("/loginFail", middleware.isNotLoggedIn, function(req, res){
	error = "Username and/or password was entered incorrectly";
	res.render("login.html", {error});
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/messages",
    failureRedirect: "/loginFail"
}), function(req, res){
});

//Sign Up Routes
router.get("/signup", middleware.isNotLoggedIn, function(req, res){
	res.render("signup.html");
});

router.post("/signup", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(error, user){
        if (error) {
            console.log(error);
            res.render("signup.html", {error: "A user with that username already exists."});
        } else {
			passport.authenticate("local")(req, res, function(){
	        	res.redirect("messages");
			});
    	}
    });
});

//Logout Route
router.get("/logout", function(req, res){
   req.logout();
   res.redirect("/home");
});

//For all other routes, the page does not exist
router.get("\*", function(req, res){
    res.render("pageDoesNotExist.html");
});

module.exports = router;
