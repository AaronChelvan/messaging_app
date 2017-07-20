var express = require("express");
var router  = express.Router({mergeParams: true});
var User = require("../models/user");
var Message = require("../models/message");
var middleware = require("../middleware");

//Messages Route (basically the home page once a user is logged in)
router.get("/messages", middleware.isLoggedIn, function(req, res){
	var id = req.user._id; //The database ID of the current user

	User.findById(id).populate("messages").exec(function(error, foundUser){
		if(error){
			console.log(error);
			res.render("error.html", {error});
		} else {
			console.log(foundUser)
			res.render("messages.html", {user: foundUser});
		}
	});
});

router.get("/messages/new", middleware.isLoggedIn, function(req, res){
	res.render("newMessage.html");
});

router.post("/messages", middleware.isLoggedIn, function(req, res){
	var currentDateTime = getDateTime();

	//Delete a message
	if (req.body.deleteMessageID != undefined) {
		Message.findByIdAndRemove(req.body.deleteMessageID, function(error){
			if (error) {
				console.log(error);
				res.render("error.html", {error});
			} else {
				res.redirect("/messages");
			}
		});
		return;
	}

	//Create a message

	User.findOne({username: req.body.recipient}, function(error, foundUser){
		if (foundUser == null) {
			//If the user does not exist, don't create the message
			console.log("Attempted to send a message to a user that does not exist");
			res.render("newMessage.html", {error: "That user does not exist!"});
		} else {
			//If the user exists, create the message
			Message.create({
				sender: req.user.username,
				recipient: req.body.recipient,
				dateTimeReceived: currentDateTime,
				message: req.body.message,
				subject: req.body.subject
			}, function(err, message){
				User.findOne({username: req.body.recipient}, function(error, foundUser){
					if(error){
						console.log(error);
						res.render("error.html", {error});
					} else {
						foundUser.messages.push(message);
						foundUser.save(function(error, data){
							if(err){
								console.log(error);
							} else {
								console.log(data);
							}
						});
						res.redirect("/messages");
					}
				});
			});
		}
	});
});

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
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

module.exports = router;
