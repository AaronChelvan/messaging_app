var express = require("express");
var app = express();
var nunjucks = require("nunjucks");
var mongoose = require("mongoose");

//Configure Nunjucks
nunjucks.configure("views", {
    autoescape: true,
    express: app
});

//Connect the database
mongoose.connect('mongodb://localhost/messaging_app_db');

//Database schemas and models
var userSchema = new mongoose.Schema({
	username: String
});
var User = mongoose.model("User", userSchema);

var messageSchema = new mongoose.Schema({
	sender: String, //username
	recipient: String, //username
	dateTimeReceived: String, //Maybe Number instead?
	message: String
});
var Message = mongoose.model("Message", messageSchema);

//Home/Login page
app.get("/", function (req, res) {
	//List all users
	User.find({}, function(error, users){
	    if (error) {
	        console.log(error);
	    } else {
	        console.log(users);
	    }
	});
	var name = "Aaron";
	res.render("index.html", {name});
});

app.get("\*", function(req, res) {
    res.render("error.html");
});

app.listen(3000, function () {
	console.log("Listening on port 3000!")
});
