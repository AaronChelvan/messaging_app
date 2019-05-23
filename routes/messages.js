var express = require("express");
var router  = express.Router({mergeParams: true});
var User = require("../models/user");
var Conversation = require("../models/conversation");
var Message = require("../models/message");
var middleware = require("../middleware");

//Messages Route (basically the home page once a user is logged in)
router.get("/messages", middleware.isLoggedIn, function(req, res){
	var id = req.user._id; //The database ID of the current user

	User.findById(id).populate({path: "conversations", populate: {path: "messages"}}).exec(function(error, foundUser){
		if(error){
			console.log(error);
			res.render("error.html", {error});
		} else {
			res.render("messages.html", {user: foundUser, lastActiveConversation:req.session["lastActiveConversation"]});
		}
	});
});

// The page for creating a new conversation
router.get("/messages/new", middleware.isLoggedIn, function(req, res){
	res.render("newConversation.html", {user: req.user});
});

//Create a new conversation
router.post("/messages/newConversation", middleware.isLoggedIn, function(req, res){
	var currentDateTime = getDateTime();

	User.findOne({username: req.body.recipient}, function(error, foundUser){
		if (foundUser == null) {
			//If the user does not exist, don't create the conversation
			console.log("Attempted to send a message to a user that does not exist");
			res.render("newConversation.html", {error: "That user does not exist!"});
		} else if (req.body.recipient === req.user.username){
			console.log("Attempted to send a message to yourself");
			res.render("newConversation.html", {error: "Can't send a message to yourself!"});
		} else {
			//If the user exists, create the conversation
			createConversation(req.user.username, req.body.recipient, currentDateTime, req.body.messageText);
			res.redirect("/messages");
		}
	});
});

// Delete a conversation
router.post("/messages/deleteConversation", middleware.isLoggedIn, function(req, res){
	Conversation.findOne({_id: req.body.conversationID}, function(error, foundConversation){
		if (error) {
			console.log(error);
		} else if (foundConversation.usersWatching == 2) {
			// Decrement "usersWatching".
			// But do not delete all of the messages in the conversation yet, because
			// the other user in the conversation has not deleted their copy of the conversation.
			foundConversation.usersWatching = 1;
			foundConversation.save(function(error, data){
				if (error){
					console.log(error);
					res.render("error.html", {error});
				}
			});

			// Remove the conversation from the current user's array of conversations
			removeConversationFromUser(req.user.username, foundConversation._id);
		} else {
			// Remove every message in the conversation from the database,
			// since both users in the conversation have deleted it
			foundConversation.messages.forEach(function(message){
				Message.findByIdAndRemove(message, function(error){
					if (error) {
						console.log(error);
						res.render("error.html", {error});
					}
				});
			});

			// Remove the conversation itself from the database
			Conversation.findByIdAndRemove(foundConversation, function(error){
				if (error) {
					console.log(error);
				}
			});

			//Remove the conversation from the user's array of conversations
			removeConversationFromUser(req.user.username, foundConversation._id);
		}
	});
	res.redirect("/messages");
});

//Create a new message for an existing conversation
router.post("/messages/newMessage", middleware.isLoggedIn, function(req, res){
	var currentDateTime = getDateTime();
	addMessageToConversation(req.user.username, currentDateTime, req.body.messageText, req.body.conversationID);
	req.session['lastActiveConversation'] = req.body.conversationID;
	res.redirect("/messages");
});

//A function that returns a string containing the current date and time
//YYYY-MM-DD-HH-MM-SS
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

// Given a sender, recipient, a timestamp, and the contents of the first message in the conversation,
// create a conversation object and add it to the database
function createConversation(sender, recipient, currentDateTime, messageContents) {
	Conversation.create({
		userA: sender,
		userB: recipient,
		lastMessageTime: currentDateTime,
		usersWatching: 2,
		messages: []
	}, function(error, conversation){
		if (error) {
			console.log(error);
			res.render("error.html", {error});
		} else {
			//Add the conversation to the recipient's conversation list
			addConversationToUser(recipient, conversation);
			//Add the conversation to the sender's conversation list
			addConversationToUser(sender, conversation);
			//Once the conversation has been created, create the first message, and add it to the conversation
			addMessageToConversation(sender, currentDateTime, messageContents, conversation);
		}
	});
}

// Given a conversation and a username,
// add a reference to that conversation to the user's conversation list in the database
function addConversationToUser(username, conversation) {
	User.findOne({username: username}, function(error, foundUser){
		if(error){
			console.log(error);
			res.render("error.html", {error});
		} else {
			foundUser.conversations.push(conversation);
			foundUser.save(function(error, data){
				if(error){
					console.log(error);
					res.render("error.html", {error});
				}
			});
		}
	});
}

// Given a conversation ID and a username,
// remove the that conversation from the user's conversation list
function removeConversationFromUser(username, conversationID) {
	User.findOne({username: username}, function(error, foundUser){
		if (error) {
			console.log(error);
		} else {
			var index = foundUser.conversations.indexOf(conversationID);
			if (index > -1) {
				foundUser.conversations.splice(index, 1);
			}

			foundUser.save(function(error, data){
				if (error){
					console.log(error);
					res.render("error.html", {error});
				}
			});
		}
	});
}

// Create a new message and add it to a particular conversation
// Include the username of the sender, and a timestamp
function addMessageToConversation(sender, currentDateTime, messageContents, conversationID) {
	Message.create({
		sender: sender,
		timeSent: currentDateTime,
		messageText: messageContents
	}, function(error, message){
		if (error) {
			console.log(error);
			res.render("error.html", {error});
		} else {
			Conversation.findOne({_id: conversationID}, function(error, foundConversation){
				if (error){
					console.log(error);
					res.render("error.html", {error});
				} else {
					foundConversation.messages.push(message);
					foundConversation.lastMessageTime = currentDateTime;
					foundConversation.save(function(error, data){
						if (error){
							console.log(error);
							res.render("error.html", {error});
						}
					});
				}
			});
		}
	});
}

module.exports = router;
