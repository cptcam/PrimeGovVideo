var permittedSite = "http://localhost/PrimeGovVideo/";

function messageMonarch(message, sender){
	console.log("Message to send to monarch: ", message);
	var monarchUrl = message.commandURL;
	var tabId = sender.tab.id;
	var response = {success: false, message: "Error", command: message.commandName, commandSrc: message.commandSrc};
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
			console.log("Successful response from Monarch:");
			console.log(xmlhttp.responseText);
			response.message = xmlhttp.responseText;
			response.success = true;
			chrome.tabs.sendMessage(sender.tab.id,response);
		}
	}
	xmlhttp.onerror = function(ev){
		console.log("Error on xmlhttp request: ", ev);
		chrome.tabs.sendMessage(sender.tab.id,response);
	}
	xmlhttp.open("GET",monarchUrl,true);
	xmlhttp.send();
}

function processMessage(request, sender, sendResponse){
	console.log("Received message from: ", sender);
	var response = {success: false, commandSrc: request.commandSrc};
	var domainUrl = sender.url.substr(0,31);
	console.log(domainUrl);
	if(domainUrl != permittedSite){
		console.log("Site not permitted to speak with Matrox.");
		sendResponse(response);
	}else{
		response.success = true;
		sendResponse(response);
		messageMonarch(request,sender);
	}
}

chrome.runtime.onMessageExternal.addListener(processMessage);
