//Hide/show the text of a message by clicking on the info bar of that message
$(".messageInfo").click(function(){
	$(this).next().toggle();
});
