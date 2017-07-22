// Login/signup screen
$("#loginSelect").click(function(){
	$(this).addClass("active");
	$("#signupSelect").removeClass("active");
	$(".loginForm").show();
	$(".signupForm").hide();
});

$("#signupSelect").click(function(){
	$(this).addClass("active");
	$("#loginSelect").removeClass("active");
	$(".loginForm").hide();
	$(".signupForm").show();
});

//Hide/show the text of a message by clicking on the info bar of that message
$(".messageInfo").click(function(){
	$(this).next().toggle();
});
