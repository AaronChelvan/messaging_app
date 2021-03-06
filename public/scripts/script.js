// Clicking on the login button reveals the login form
$("#loginSelect").click(function(){
	$(this).addClass("active");
	$("#signupSelect").removeClass("active");
	$(".loginForm").show();
	$(".signupForm").hide();
});

// Clicking on the signup button reveals the signup form
$("#signupSelect").click(function(){
	$(this).addClass("active");
	$("#loginSelect").removeClass("active");
	$(".loginForm").hide();
	$(".signupForm").show();
});

// Clicking on the information bar of a conversation reveals the text of the conversation
$(".messageInfo").click(function() {
   var classes = $(this).attr("class");
   var conversationID = classes.split(" ")[1];
   $(".conversationText").hide();
   $(".conversationText" + "." + conversationID).show();
});

// Every time a message is sent & the page is reloaded, we want the conversation textbox to
// be scrolled down to the bottom, so that the most recent messages are shown.
$('.conversationTextBox').scrollTop($('.conversationTextBox')[0].scrollHeight);
