var express = require("express");
var router  = express.Router({mergeParams: true});
var User = require("../models/user");
var Conversation = require("../models/conversation");
var Message = require("../models/message");
var middleware = require("../middleware");

//Messages Route (basically the home page once a user is logged in)
router.get("/messages", middleware.isLoggedIn, function(req, res){
	var id = req.user._id; //The database ID of the current user

	User.findById(id).populate("conversations").exec(function(error, foundUser){
		if(error){
			console.log(error);
			res.render("error.html", {error});
		} else {
			console.log(foundUser);
			foundUser.conversations.forEach(function(conversation){
				Conversation.findById(conversation._id).populate("messages").exec(function(error, foundConversation){
					if (error){
						console.log("error");
						res.render("error.html", {error});
					} else {
						res.render("messages.html", {user: foundUser});
					}
				});
			});
		}
	});
});

router.get("/messages/new", middleware.isLoggedIn, function(req, res){
	res.render("newConversation.html", {user: req.user});
});

//Create a new conversation
router.post("/messages/newConversation", middleware.isLoggedIn, function(req, res){
	var currentDateTime = getDateTime();

	User.findOne({username: req.body.recipient}, function(error, foundUser){
		if (foundUser == null) {
			//If the user does not exist, don't create the message
			console.log("Attempted to send a message to a user that does not exist");
			res.render("newMessage.html", {error: "That user does not exist!"});
		} else {
			//If the user exists, create the message
			Conversation.create({
				userA: req.user.username,
				userB: req.body.recipient,
				lastMessageTime: currentDateTime,
				usersWatching: 2,
				messages: []
			}, function(error, conversation){
				User.findOne({username: req.body.recipient}, function(error, foundUser){
					if(error){
						console.log(error);
						res.render("error.html", {error});
					} else {
						foundUser.conversations.push(conversation);
						foundUser.save(function(error, data){
							if(error){
								console.log(error);
							} else {
								console.log(data);
							}
						});
						//Once the conversation has been created, create the message
						Message.create({
							sender: req.user.username,
							timeSent: currentDateTime,
							message: req.body.message
						}, function(error, message){
							Conversation.findOne({_id: conversation}, function(error, foundConversation){
								if (error){
									console.log(error);
									res.render("error.html", {error});
								} else {
									foundConversation.messages.push(message);
									foundConversation.save(function(error, data){
										if (error){
											console.log(error);
										} else {
											console.log(data);
											res.redirect("/messages");
										}
									});
								}
							});
						});
					}
				});
			});
		}
	});
});

//Delete a conversation
router.post("/messages/deleteConversation", middleware.isLoggedIn, function(req, res){
	Conversation.findOne({_id: req.body.deleteConversationID}, function(error, foundConversation){
		if (foundConversation.usersWatching == 2) {
			foundConversation.usersWatching = 1; //TODO - Check if this is right
		} else {
			foundConversation.messages.forEach(function(message){
				Message.findByIdAndRemove(message, function(error){
					if (error) {
						console.log(error);
						res.render("error.html", {error});
					}
				});
			});
		}
	});
	res.redirect("/messages");
});

//Create a new message for an existing conversation
router.post("/messages/newMessage", middleware.isLoggedIn, function(req, res){

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
