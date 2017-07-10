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
app.get("/", function(req, res){
	var name = "Aaron";
	res.render("home.html", {name});
});

//Home Route
//Contains links to Login and Sign Up Pages
app.get("/home", function(req, res){
	var name = "Aaron";
	res.render("home.html", {name});
});

//Login Routes
app.get("/login", function(req, res){
	res.render("login.html");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/messages",
    failureRedirect: "/login"
}), function(req, res){
});

//Sign Up Routes
app.get("/signup", function(req, res){
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
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/login");
});

//Messages Route (basically the home page once a user is logged in)
app.get("/messages", function(req, res){
	res.render("messages.html");
});

//For all other routes, the page does not exist
app.get("\*", function(req, res){
    res.render("error.html");
});

//Middleware for checking is a user is logged in
//If they are not logged in, redirect to 'login.html'
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(3000, function(){
	console.log("Listening on port 3000!")
});
