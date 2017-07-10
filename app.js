var express = require("express");
var app = express();
var nunjucks = require("nunjucks");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
var Message = require("./models/message");

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
	secret: "blah blah top secret :D",
	resave: false,
	saveUninitialized: false
}));

//Configure Nunjucks
nunjucks.configure("views", {
    autoescape: true,
    express: app
});

//Connect the database
mongoose.connect('mongodb://localhost/messaging_app_db');

//Set up Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Default Route
//If not logged in, go to 'home.html'
//If logged in, go to 'messages.html'
app.get("/", isLoggedIn, function(req, res){
	res.render("messages.html");
});

//Home Route
//Contains links to Login and Sign Up Pages
app.get("/home", isNotLoggedIn, function(req, res){
	res.render("home.html");
});

//Login Routes
app.get("/login", isNotLoggedIn, function(req, res){
	res.render("login.html");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/messages",
    failureRedirect: "/login"
}), function(req, res){
});

//Sign Up Routes
app.get("/signup", isNotLoggedIn, function(req, res){
	res.render("signup.html");
});

app.post("/signup", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(error, user){
        if (error) {
            console.log(error);
            res.render("login.html");
        } else {
			passport.authenticate("local")(req, res, function(){
	        	res.redirect("messages");
			});
    	}
    });
});

//Logout Route
app.post("/logout", function(req, res){
   req.logout();
   res.redirect("/home");
});

//Messages Route (basically the home page once a user is logged in)
app.get("/messages", isLoggedIn, function(req, res){
	var user = req.user; //The current user
	res.render("messages.html", {user});
});

app.get("/messages/new", isLoggedIn, function(req, res){
	res.render("newMessage.html");
});

app.post("/messages", isLoggedIn, function(req, res){
	var currentDateTime = getDateTime();

	Message.create({
		sender: req.user.username,
		recipient: req.body.recipient,
		dateTimeReceived: currentDateTime,
		message: req.body.message,
		subject: req.body.subject
	}, function(err, post){
		User.findOne({username: req.body.recipient}, function(error, foundUser){
			if(error){
				console.log(error);
			} else {
				foundUser.messages.push(message);
				foundUser.save(function(error, data){
					if(err){
						console.log(error);
					} else {
						console.log(data);
					}
				});
			}
		});
	});

	res.redirect("/messages");
});

//For all other routes, the page does not exist
app.get("\*", function(req, res){
    res.render("error.html");
});

//Middleware for checking is a user is logged in
//If they are not logged in, redirect to 'login.html'
//Used for routes which require the user to be logged in
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/home");
}

//Middleware for checking is a user is not logged in
//If they are logged in, redirect to 'messages.html'
//Used for routes which require the user to not be logged in (home, login, sign up)
function isNotLoggedIn(req, res, next){
	if (!(req.isAuthenticated())) {
		return next();
	}
	res.redirect("/messages");
}

//A function that returns a string containing the current date and time
//YYYY-MM-DD-HH-MM-SS
//TODO - look into whether the locale of the server/client has any impact on the date returned
function getDateTime() {
    var date = new Date();
	var year = date.getFullYear();
    var month = date.getMonth() + 1; //+1 Since getMonth() returns a number between 0 & 11
	if (month < 10) {
		month = "0" + month;
	}
    var day  = date.getDate();
	if (day < 10) {
		day = "0" + day;
	}
    var hour = date.getHours();
	if (hour < 10) {
		hour = "0" + hour;
	}
    var minute  = date.getMinutes();
	if (minute < 10) {
		minute = "0" + minute;
	}
    var second  = date.getSeconds();
	if (second < 10) {
		second = "0" + second;
	}
    return year + "-" + month + "-" + day + "-" + hour + "-" + minute + "-" + second;
}

app.listen(3000, function(){
	console.log("Listening on port 3000!")
});
