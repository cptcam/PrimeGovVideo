  /************************************************************************************
  This is your Page Code. The appAPI.ready() code block will be executed on every page load.
  For more information please visit our docs site: http://docs.crossrider.com
*************************************************************************************/

appAPI.ready(function($) {
	function getBrowserSpecificUrl(URL){
		if(appAPI.platform == "IE"){
			return 'http://' + URL.substring(URL.indexOf('@') + 1);
		}
		return URL;
	}
	
	function messageMonarch(message){
		console.log("Messaging the monarch!");
		var monarchUrl = message.commandURL;
		console.log(monarchUrl);
		var returnMsg = {type:"FROM_PAGE",text:"Failed",command: message.commandName, commandSrc: message.commandSrc};
		appAPI.request.get({
			url: monarchUrl,
			onSuccess: function(response, additionalInfo){
				console.log("Response: ", response);
				console.log("Additional Info: ", additionalInfo);
				returnMsg.text = "Success";
				$('body').fireExtensionEvent('receiveMonarchMsg',returnMsg);
			},
			onFailure: function(httpCode){
				console.log("http code: ", httpCode);
				$('body').fireExtensionEvent('receiveMonarchMsg',returnMsg);
			}
		});
	}
	
	function processMessage(ev, data){
		console.log("Receiving message from page.");
		var response = {success: false, commandSrc: data.commandSrc};
		if(!appAPI.isMatchPages("http://*")){
			$('body').fireExtensionEvent('messageReceived',response);
		}else{
			response.success = true;
			$('body').fireExtensionEvent('messageReceived',response);
			messageMonarch(data);
		}
	}
   $('body').bindExtensionEvent('messageMonarch',processMessage);
});
