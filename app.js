var express = require("express");
var app = express();
var nunjucks = require("nunjucks");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");

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

//Database schemas and models
/*var UserSchema = new mongoose.Schema({
	username: String
});
var User = mongoose.model("User", UserSchema);*/

var MessageSchema = new mongoose.Schema({
	sender: String, //username
	recipient: String, //username
	dateTimeReceived: String, //Maybe Number instead?
	message: String
});
var Message = mongoose.model("Message", MessageSchema);

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
	//List all users
	/*User.find({}, function(error, users){
	    if (error) {
	        console.log(error);
	    } else {
	        console.log(users);
	    }
	});*/
	var name = "Aaron";
	res.render("home.html", {name});
});

//Login Routes
app.get("/login", function(req, res){
	res.render("login.html");
});
app.post("/login", function(req,res){

});

//Sign Up Routes
app.get("/signup", function(req, res){
	res.render("signup.html");
});
app.post("/signup", function(req, res){

});




app.get("/home", function(req, res){
	//List all users
	/*User.find({}, function(error, users){
	    if (error) {
	        console.log(error);
	    } else {
	        console.log(users);
	    }
	});*/
	var name = "Aaron";
	res.render("home.html", {name});
});

app.get("\*", function(req, res){
    res.render("error.html");
	console.log("ERROR");
});

app.listen(3000, function(){
	console.log("Listening on port 3000!")
});
