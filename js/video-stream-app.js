/*------------------------------------------------------*/
/*------------VIDEO STREAMING APPLICATION---------------*/
/*------------------------------------------------------*/
function videoStreamingApplication(){
	this.monarchDevices = new Array();
	this.youtubeApp = new youtubeApplication();
	this.extensionMsgr = new monarchExtensionMessenger();
	
	this.addMonarch = function(){
		
	}
	
	this.editMonarch = function(){
		
	}
	
	this.deleteMonarch = function(){
		
	}
	
	this.setPrimaryMonarch = function(){
		
	}
	
	this.startNewVideo = function(){
		
	}
	
	this.startVideoPreview = function(){
		
	}
	
	this.startLiveVideo = function(){
		
	}
	
	this.stopVideo = function(){
		
	}
}

/*------------------------------------------------------*/
/*------------MONARCH EXTENSION MESSENGER---------------*/
/*------------------------------------------------------*/
function monarchExtensionMessenger(){
	this.extensionId = "joehnajgbogjpnmmpebapfgiifjcaoop";
	
	this.extensionMessageResponse = function(response){
		if(!response.success){
			handleError();
		}else{
			console.log("Message successfully sent to Extension.");
		}
	}
	
	this.sendMessage = function(monarchInstructionObj){
		chrome.runtime.sendMessage(this.extensionId,monarchInstructionObj
			,this.extensionMessageResponse);
	}
}

/*------------------------------------------------------*/
/*-------------------MONARCH OBJECT---------------------*/
/*------------------------------------------------------*/
function monarch(ipAddress){
	this.ipAddress = ipAddress;
	return this;
}

/*------------------------------------------------------*/
/*---------------MONARCH USER OBJECT--------------------*/
/*------------------------------------------------------*/
function monarchUser(password){
	this.username = "admin";
	this.password = password;
	return this;
}

/*------------------------------------------------------*/
/*-----------MONARCH INSTRUCTION OBJECT-----------------*/
/*------------------------------------------------------*/
function monarchInstruction(monarchObj,monarchUserObj,commandObj){
	this.commandName = commandObj.commandName;
	this.commandURL = new monarchCommandURL(monarchUserObj.username,monarchUserObj.password,
		monarchObj.ipAddress,commandObj.toString()).toString();
	return this;
}

/*------------------------------------------------------*/
/*-----------MONARCH COMMAND URL OBJECT-----------------*/
/*------------------------------------------------------*/
function monarchCommandURL(username,password,ipAddress,command){
	this.url = "http://" + username + ":" + password + "@" +
		ipAddress + "/Monarch/syncconnect/sdk.aspx?command=" +
		command;
	this.toString = function(){
		return this.url;
	}
	return this;
}

/*------------------------------------------------------*/
/*-------------MONARCH COMMAND OBJECTS------------------*/
/*------------------------------------------------------*/

/*----------------GetStatusCommand----------------------*/
function getStatusCommand(){
	this.commandName = "GetStatus";
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

/*--------------StartStreamingCommand-------------------*/
function startStreamingCommand(){
	this.commandName = "StartStreaming";
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

/*--------------StartRecordingCommand-------------------*/
function startRecordingCommand(){
	this.commandName = "StartRecording";
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

/*----------StartStreamingAndRecordingCommand------------*/
function startStreamingAndRecordingCommand(){
	this.commandName = "StartStreamingAndRecording";
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

/*---------------StopStreamingCommand--------------------*/
function stopStreamingCommand(){
	this.commandName = "StopStreaming";
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

/*---------------StopRecordingCommand--------------------*/
function stopRecordingCommand(){
	this.commandName = "StopRecording";
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

/*------------GetStreamingVideoDataRate------------------*/
function getStreamingVideoDataRateCommand(){
	this.commandName = "GetStreamingVideoDataRate";
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

/*------------SetStreamingVideoDataRate------------------*/
function setStreamingVideoDataRateCommand(){
	this.commandName = "SetStreamingVideoDataRate";
	this.averageBitRate = -1;
	this.toString = function(){
		return this.commandName + ',' + this.averageBitRate;
	}
	return this;
}

/*---------------------SetRTSP---------------------------*/
function setRTSPCommand(){
	this.commandName = "SetRTSP";
	this.urlName = '';
	this.port = -1;
	this.toString = function(){
		return this.commandName + ',' + this.urlName + ',' + this.port;
	}
	return this;
}

/*---------------------GetRTSP---------------------------*/
function getRTSPCommand(){
	this.commandName = "GetRTSP";
	this.toString = function(){
		return this.commandName + ',' + this.averageBitRate;
	}
	return this;
}

/*---------------------SetRTMP---------------------------*/
function setRTMPCommand(url,streamName,password){
	this.commandName = "SetRTMP";
	this.url = url;
	this.streamName = streamName;
	this.username = 'admin';
	this.password = password;
	this.toString = function(){
		return this.commandName + ',' + this.url + ',' + this.streamName + ',' + this.username
		+ ',' + this.password;
	}
	return this;
}

/*---------------------GetRTMP---------------------------*/
function getRTMPCommand(){
	this.commandName = "GetRTMP";
	this.toString = function(){
		return this.commandName + ',' + this.averageBitRate;
	}
	return this;
}

/*------------------------------------------------------*/
/*----------------YouTube Application-------------------*/
/*------------------------------------------------------*/
function youtubeApplication(){
	//this.clientId = '462388181157-eq6ac5p3bkvoapo3c5aghnkfk52jcdcl.apps.googleusercontent.com';
	//this.apiKey = 'AIzaSyDKJ1-q1mmkLjkmHlzjgAr7JXdjsFQHp2A';
	//this.scopes = 'https://www.googleapis.com/auth/youtube';
	this.authorized = false;
	this.clientLib = gapi.client.load('youtube','v3');
	this.liveBroadcast = new liveBroadcast();
	this.liveStream = new liveStream();
	this.checkAuth = function(){
		gapi.client.setApiKey = this.apiKey;
		gapi.auth.authorize({client_id: this.clientId, scope: this.scopes, 
			immediate: true}, handleAuthResult);
	}
	this.auth = function(){
		gapi.client.setApiKey = this.apiKey;
		gapi.auth.authorize({client_id: this.clientId, scope: this.scopes, 
			immediate: false}, handleAuthResult);
	}
	this.executeLibFxn = function(libFxn){
		gapi.client.load('youtube','v3').then(libFxn);
	}
	return this;
}

/*------------------------------------------------------*/
/*----------------YouTube liveBroadcast-----------------*/
/*------------------------------------------------------*/
function liveBroadcast(){
	this.id = '';
	this.status = '';
	this.embedHtml = '';
	this.updateBroadcastStatus = function(){
		this.list();
	}
	this.insert = function(part,liveBroadcastRequestBody){
		var request = gapi.client.youtube.liveBroadcasts.insert(part,liveBroadcastRequestBody);
		request.then(function(resp){
			console.log(resp);
			this.id = resp.result.id;
			this.status = resp.result.status.lifeCycleStatus;
			createLiveStream();
		},youtubeAPIError,this);
	}
	this.bind = function(stream){
		var request = gapi.client.youtube.liveBroadcasts.bind({id:this.id,part:"snippet,status",
			streamId: stream.id});
		request.then(function(resp){
			console.log(resp);
			var extensionMsg = new setRTMPCommand(stream.url,stream.streamName,user.password);
			extensionMsgr.sendMessage(new monarchInstruction(myMonarch,user,extensionMsg));
			document.getElementById('waitingMessage').innerHTML = 'Assigning streaming address on Monarch...';
		},youtubeAPIError, this);
	}
	this.transition = function(transitionState){
		var request = gapi.client.youtube.liveBroadcasts.transition({broadcastStatus: transitionState,
			id: this.id, part: "contentDetails,status"});
		request.then(function(resp){
			console.log(resp);
			this.embedHtml = resp.result.contentDetails.monitorStream.embedHtml;
			this.status = resp.result.status.lifeCycleStatus;
		},youtubeAPIError,this);
	}
	this.list = function(){
		var request = gapi.client.youtube.liveBroadcasts.list({part:"contentDetails,status",
		id: this.id});
		request.then(function(resp){
			console.log(resp);
			this.status = resp.result.items[0].status.lifeCycleStatus;
			this.embedHtml = resp.result.items[0].contentDetails.monitorStream.embedHtml;
			document.getElementById('inputVideoName').disabled = true;
			document.getElementById('inputStreamStartDatetime').disabled = true;
			document.getElementById('inputStreamEndDatetime').disabled = true;
			startStream.disabled = true;
		},youtubeAPIError,this);
	}
}

/*------------------------------------------------------*/
/*----------------YouTube liveStream--------------------*/
/*------------------------------------------------------*/
function liveStream(){
	this.id = '';
	this.title = '';
	this.streamName = '';
	this.url = '';
	this.format = '';
	this.ingestionType = '';
	this.streamStatus = '';
	this.updateStreamStatus = function(){
		console.log("Updating live stream status.");
		var request = gapi.client.youtube.liveStreams.list({part:"status",id:this.id});
		request.then(function(resp){
			console.log(resp);
			this.streamStatus = resp.result.items[0].status.streamStatus;
		},youtubeAPIError,this);
	}
	this.insert = function(part,liveStreamRequestBody){
		var request = gapi.client.youtube.liveStreams.insert(part,liveStreamRequestBody);
		request.then(function(resp){
			console.log(resp);
			this.id = resp.result.id;
			this.title = resp.result.snippet.title;
			this.streamName = resp.result.cdn.ingestionInfo.streamName;
			this.url = resp.result.cdn.ingestionInfo.ingestionAddress;
			this.format = resp.result.cdn.format;
			this.ingestionType = resp.result.ingestionType;
			this.streamStatus = resp.result.status.streamStatus;
			bindStreamAndBroadcast();
		},youtubeAPIError,this);
	}
}

/*------------------------------------------------------*/
/*---------------YouTube Library Error------------------*/
/*------------------------------------------------------*/
function youtubeAPIError(reason){
	console.log('Error ' + reason.result.error.message);
}

/*------------------------------------------------------*/
/*-------------YouTube Part Argument--------------------*/
/*------------------------------------------------------*/
function part(parts){
	this.part = parts;
	return this;
}

/*------------------------------------------------------*/
/*-------YouTube liveStream Request Body Argument-------*/
/*------------------------------------------------------*/
function liveStreamRequestBody(snippet,cdn){
	this.snippet = snippet;
	this.cdn = cdn;
	return this;
}

/*------------------------------------------------------*/
/*-----YouTube liveBroadcast Request Body Argument------*/
/*------------------------------------------------------*/
function liveBroadcastRequestBody(snippet,status,contentDetails){
	this.snippet = snippet;
	this.status = status;
	this.contentDetails = contentDetails;
	return this;
}