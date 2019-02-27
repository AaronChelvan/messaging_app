var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
	conversations: [ //All conversations this user has
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Conversation"
		}
	]
}, {
  usePushEach: true
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
