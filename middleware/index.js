var User = require("../models/user");
var Message = require("../models/message");

var middlewareObj = {};

//Middleware for checking is a user is logged in
//If they are not logged in, redirect to 'login.html'
//Used for routes which require the user to be logged in
middlewareObj.isLoggedIn = function(req, res, next){
	if (req.isAuthenticated()) {
		next();
	} else {
		res.redirect("/home");
	}
}

//Middleware for checking is a user is not logged in
//If they are logged in, redirect to 'messages.html'
//Used for routes which require the user to not be logged in (home, login, sign up)
middlewareObj.isNotLoggedIn = function(req, res, next){
	if (!(req.isAuthenticated())) {
		next();
	} else {
		res.redirect("/messages");
	}
}

module.exports = middlewareObj;
