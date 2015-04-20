function receiveMessage(message,sender,sendResponse){
	var returnMsg = {type:"FROM_PAGE",text:"",command: message.command, commandSrc: message.commandSrc};
	if(message.success){
		if(message.message != "FAILED"){
			var successMsg = document.createTextNode(message.command);
			returnMsg.text = "Success";
			window.postMessage(returnMsg,"*");
		}else{
			console.log(message);
			returnMsg.text = "Failed";
			window.postMessage(returnMsg,"*");
		}	
	}else{
		returnMsg.text = "Failed";
		window.postMessage(returnMsg,"*");
	}
}

chrome.runtime.onMessage.addListener(receiveMessage);

