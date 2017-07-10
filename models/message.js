var mongoose = require("mongoose");

var MessageSchema = new mongoose.Schema({
	sender: String, //username of sender
	recipient: String, //username of recipient
	dateTimeReceived: String, //Maybe Number instead?
	message: String
});

module.exports = mongoose.model("Message", MessageSchema);
