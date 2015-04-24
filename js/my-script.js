/*------------------------------------------------------*/
/*---------------TABLE OF CONTENTS----------------------*/
/*------------------------------------------------------*/
// 1. GLOBAL VARIABLES
// 2. INITIALIZATION FUNCTIONS
// 3. APPLICATION VIEW
//     a. TOP NAVIGATION
//         i. MONARCH TOGGLE
//		       A. EDIT MONARCH FORM
//             B. ADD MONARCH FORM
//		ii. SETTINGS TOGGLE
//			A. GOOGLE+ SIGN IN DIV
//				I. GOOGLE+ SIGN IN BUTTON
//		iii. ARCHIVED VIDEOS
// 	  b. MAIN PANEL
//	  	i. LOADING MESSAGE DIV
//		ii. NEW BROADCAST FORM
//		iii. LIVE STREAM PANEL
//			A. PREVIEW VIDEO
//			B. PUBLIC VIDEO
//      iv. ARCHIVED VIDEO PANEL
// 	  c. BOTTOM NAVIGATION
//	  	i. START STREAM BUTTON
//		ii. STOP STREAM BUTTON	
// 4. APPLICATION VIEW CONTROL
//    a. DOM COMMUNICATOR
// 5. EXTENSION COMMUNICATOR
//	  a. MONARCH USER
//    b. MONARCH DEVICE
//    c. MONARCH INSTRUCTION
//    d. MONARCH COMMANDS
// 6. YOUTUBE API COMMUNICATOR
//    a. YOUTUBE LIVE BROADCAST
//    b. YOUTUBE LIVE STREAM
// 7. YOUTUBE VIDEO OBJECT

// 1. GLOBAL VARIABLES
var user = null;
var monarchDevices = [];
var archivedVids = [];
var domComm = null;
var youtubeApp = null;
var matroxComm = null;
var topNavigation = null;
var streamingPanel = null;
var archivePanel = null;
var bottomNavigation = null;
function handleAuthResult(authResult){
	if (authResult && !authResult.error) {
		console.log("Authorization result: ", authResult);
		//Validate Token
		youtubeApp.validateToken(authResult);
	}
}
function showBlockElement(el){
	el.style.display = 'block';
}
function hideElement(el){
	el.style.display = 'none';
}
function disableBtn(btn){
	btn.disabled = true;
}
function enableBtn(btn){
	btn.disabled = false;
}
function backwardsCompatibleAddEventListener(el,evNew,evOld,fnxn,immediate){
	if(el.addEventListener){
		el.addEventListener(evNew,fnxn,immediate);
	}else if(el.attachEvent){
		el.attachEvent(evOld,fnxn,immediate);
	}
}
function backwardsCompatibleRemoveEventListener(el,evNew,evOld,fnxn,useCapture){
	if(el.removeEventListener){
		el.removeEventListener(evNew,fnxn,useCapture);
	}else if(el.detachEvent){
		el.detachEvent(evOld,fnxn,useCapture);
	}
}
function clientRequest(request,requester,onFulfilled){
	var apiRequest = request;
	apiRequest.then(onFulfilled,youtubeAPIError,requester);
}
function youtubeAPIError(reason){
	domComm.handleStreamError('startStream',reason.result.error.message);
}
function part(parts){
	this.part = parts;
	return this;
}
function liveStreamRequestBody(snippet,cdn){
	this.snippet = snippet;
	this.cdn = cdn;
	return this;
}
function liveBroadcastRequestBody(snippet,status,contentDetails){
	this.snippet = snippet;
	this.status = status;
	this.contentDetails = contentDetails;
	return this;
}

// 2. INITIALIZATION FUNCTIONS
// document.body.onload = 
function initialize(){
	domComm = new DOMCommunicator();
	matroxComm = new monarchExtensionMessenger();
	topNavigation = new TopNav();
	streamingPanel = new StreamPanel();
	archivePanel = new ArchivedVideoPanel();
	bottomNavigation = new BottomNav();
	CrossriderAPI.bindExtensionEvent(document.body,'receiveMonarchMsg', domComm.handleMonarchMsg);
	//backwardsCompatibleAddEventListener(window,'message','message',domComm.handleMonarchMsg,false);
	if(document.cookie){
		domComm.initializePage(document.cookie);
	}
}
backwardsCompatibleAddEventListener(document,'DOMContentLoaded','onload',initialize,false);

function initializeApp(){
	youtubeApp = new youtubeApplication();
}

// 3. APPLICATION VIEW
// 3a. TOP NAVIGATION
function TopNav(){
	this.html = document.getElementById('top-nav');
	this.monarchToggle = new MonarchToggleButton();
	this.settingsToggle = new SettingsToggleButton();
	this.liveVideoLink = new LiveVideoLink();
	this.archivedVideosList = new ArchivedVideosList();
}

// 3ai. MONARCH TOGGLE
function MonarchToggleButton(){
	this.html = document.getElementById('monarch-devices-btn');
	this.monarchToggleMenu = new MonarchToggleMenu();
	this.toggleMonarchMenu = function(){
		if(topNavigation.monarchToggle.monarchToggleMenu.html.style.display == 'block'){
			topNavigation.monarchToggle.monarchToggleMenu.hide();
		}else{
			topNavigation.monarchToggle.monarchToggleMenu.show();
		}
	};
	backwardsCompatibleAddEventListener(this.html,'click','onclick',this.toggleMonarchMenu,false);
}

function MonarchToggleMenu(){
	this.html = document.getElementById('monarch-device-collapse');
	this.addMonarchForm = new AddMonarchForm();
	this.hide = function(){
		hideElement(this.html);
	}
	this.show = function(){
		showBlockElement(this.html);
	}
	this.addMonarchDevice = function(){
		// Add Valid Monarch to Devices
		var monarchRowCopy = $("#editMonarchRow").clone();
		var numberOfDevices = monarchDevices.length;
		
		// Alter IDs of Copy
		var monarchRow = monarchRowCopy[0];
		function incrementId(el){
			el.id += numberOfDevices;
		}
		incrementId(monarchRow);
		
		var monarchButton = monarchRow.getElementsByTagName('button')[0];
		monarchButton.setAttribute('data-target', monarchButton.getAttribute('data-target') + numberOfDevices);
		
		var monarchModal = monarchRow.getElementsByClassName('modal')[0];
		incrementId(monarchModal);
		
		var monarchModalForm = monarchRow.getElementsByTagName('form')[0];
		incrementId(monarchModalForm);
		backwardsCompatibleAddEventListener(monarchModalForm,'submit','onsubmit',function(ev){ev.preventDefault();return false;},false);
		
		var monarchModalFormLabels = monarchModalForm.getElementsByTagName('label');
		for(var i = 0, ii = monarchModalFormLabels.length; i < ii; i++){
			monarchModalFormLabels[i].setAttribute("for", monarchModalFormLabels[i].getAttribute("for") + numberOfDevices);
		}
		
		var monarchModalFormInputs = monarchModalForm.getElementsByTagName('input');
		for(var i = 0, ii = monarchModalFormInputs.length; i < ii; i++){
			incrementId(monarchModalFormInputs[i]);
		}
		
		//Insert copy into list item
		var li = document.createElement('li');
		li.appendChild(monarchRow);
		
		// Insert Copy Onto Page
		this.html.firstElementChild.insertBefore(li,addMonarchRow.parentElement);
	}
}

//	3aiA. EDIT MONARCH FORM
//  3aiB. ADD MONARCH FORM
function AddMonarchForm(){
	this.html = document.getElementById('addMonarchForm');
	this.closeBtn = new AddMonarchFormCloseBtn();
	this.submitBtn = new AddMonarchFormSubmitBtn();
	this.monarchLoadingMessageDiv = new MonarchLoadingMessageDiv();
	this.inputs = [new AddMonarchFormIPAddressInput(), new AddMonarchFormPasswordInput()];
	this.disableButtons = function(){
		this.closeBtn.disable();
		this.submitBtn.disable();
	}

	this.enableButtons = function(){
		this.closeBtn.enable();
		this.submitBtn.enable();
	}

	this.monarchFormSubmission = function(ev){
		console.log("Monarch form submission event: ", ev);
		if(ev.preventDefault) ev.preventDefault();
		domComm.handleAddMonarchFormSubmission(ev);
		return false;
	}

	backwardsCompatibleAddEventListener(this.html,'submit','onsubmit',domComm.handleAddMonarchFormSubmission,false);

	this.insertErrorMessage = function(){
		document.getElementById('addMonarchFormModalBody').appendChild(new errorAlert('No Matrox Monarch with the given IP Address and Password found. Please try again.'));
	}

	this.insertSuccessMessage = function(){
		document.getElementById('addMonarchFormModalBody').appendChild(new successAlert('The Matrox Monarch with the given IP Address and Password was added.'));
	}
}

function AddMonarchFormIPAddressInput(){
	this.html = document.getElementById('inputMonarchIP');
}

function AddMonarchFormPasswordInput(){
	this.html = document.getElementById('inputMonarchPassword');
}

function MonarchLoadingMessageDiv(){
	this.html = document.getElementById('waitingForMonarch');
	this.show = function(){
		showBlockElement(this.html);
	}
	this.hide = function(){
		hideElement(this.html);
	}
}

function AddMonarchFormCloseBtn(){
	this.html = document.getElementById('addMonarchFormCloseBtn');
	this.disable = function(){
		disableBtn(this.html);
	}
	this.enable = function(){
		enableBtn(this.html);
	}
}

function AddMonarchFormSubmitBtn(){
	this.html = document.getElementById('addMonarchFormSubmitBtn');
	this.disable = function(){
		disableBtn(this.html);
	}
	this.enable = function(){
		enableBtn(this.html);
	}
}

function errorAlert(msg){
	this.msg = '<strong>Error.</strong> ' + msg;
	var errorAlert = new alert(this.msg);
	errorAlert.className += ' alert-danger';
	return errorAlert;
}

function successAlert(msg){
	this.msg = '<strong>Success!</strong> ' + msg;  
	var successAlert = new alert(this.msg);
	successAlert.className += ' alert-success'; 
	return successAlert;
}

function alert(msg){
	var alert = document.createElement('div');
	alert.className = 'alert alert-dismissable';
	alert.setAttribute('role','alert');
	
	alert.appendChild(new closeBtn());
	alert.appendChild(new alertMsg(msg));
	
	return alert;
}

function closeBtn(){
	var closeBtn = document.createElement('button');
	closeBtn.className = 'close';
	closeBtn.setAttribute('type','button');
	closeBtn.setAttribute('data-dismiss','alert');
	closeBtn.setAttribute('aria-label','Close');
	
	var closeText = document.createTextNode('x');
	var closeSpan = document.createElement('span');
	closeSpan.setAttribute('aria-hidden','true');
	closeSpan.appendChild(closeText);
	closeBtn.appendChild(closeSpan);
	
	return closeBtn;
}

function alertMsg(msg){
	var alertMsg = document.createElement('p');
	alertMsg.innerHTML = msg;
	return alertMsg;
}

// 3aii. SETTINGS TOGGLE
function SettingsToggleButton(){
	this.html = document.getElementById('settings-btn');
	this.settingsToggleMenu = new SettingsToggleMenu();
	this.toggleSettingsMenu = function(){
		if(topNavigation.settingsToggle.settingsToggleMenu.html.style.display == 'block'){
			topNavigation.settingsToggle.settingsToggleMenu.hide();
		}else{
			topNavigation.settingsToggle.settingsToggleMenu.show();
		}
	}
	backwardsCompatibleAddEventListener(this.html,'click','onclick',this.toggleSettingsMenu,false);
}

function SettingsToggleMenu(){
	this.html = document.getElementById('settings-collapse');
	this.signInBtn = new GooglePlusSignInSpan(1);
	this.hide = function(){
		hideElement(this.html);
	}
	this.show = function(){
		showBlockElement(this.html);
	}
}

// 3aiiA. GOOGLE+ SIGN IN SPAN
function GooglePlusSignInSpan(num){
	this.html = document.getElementById('signinButton' + num);
	this.show = function(){
		showBlockElement(this.html);
	}
	this.hide = function(){
		hideElement(this.html);
	}
}

// 3aiiAI. GOOGLE+ SIGN IN BUTTON
/*function GooglePlusSignInButton(num){
	this.html = document.getElementsByClassName('g-signin')[num];
	this.html.setAttribute('data-callback',youtubeApp.handleAuthResult);
}*/

// 3aiii. ARCHIVED VIDEOS
function ArchivedVideosList(){
	this.html = document.getElementById('archived-videos-list');
	this.signInBtn = new GooglePlusSignInSpan(2);
	this.addVideo = function(html){
		html.id = 'lst' + html.id;
		this.html.appendChild(html);
	}
}

function videoListItem(id,title,date,img){
	var dateToAdd = new Date(date);
	var btn = document.createElement('button');
	btn.setAttribute('type','button');
	btn.setAttribute('data-toggle','modal');
	btn.setAttribute('data-target','#archivedYouTubeVideoModal');
	backwardsCompatibleAddEventListener(btn,'click','onclick',domComm.loadArchivedVideo,false);
	var li = document.createElement('li');
	li.id = id;
	var h2 = document.createElement('h2');
	h2.appendChild(document.createTextNode(title));
	var p = document.createElement('p');
	p.appendChild(document.createTextNode(dateToAdd.toDateString()));
	btn.appendChild(h2);
	btn.appendChild(p);
	btn.appendChild(img);
	li.appendChild(btn);
	return li;
}


function LiveVideoLink(){
	this.html = document.getElementById('live-video-link');
	backwardsCompatibleAddEventListener(this.html, 'click','onclick',domComm.displayLiveVideo,false);
}

// 	  b. MAIN PANEL
//	3bi. LOADING MESSAGE DIV
function YouTubeLoadingMessageDiv(){
	this.html = document.getElementById('waitingRow');
	this.youtubeLoadingMessage = new YouTubeLoadingMessge();
	this.updateMsg = function(message){
		this.youtubeLoadingMessage.changeMessage(message);
	}
	this.show = function(){
		showBlockElement(this.html);
	}
	this.hide = function(){
		hideElement(this.html);
	}
}

function YouTubeLoadingMessge(){
	this.html = document.getElementById('waitingMessage');
	this.changeMessage = function(message){
		this.html.innerHTML = message;
	}
}
//  3bii. NEW BROADCAST FORM
function StreamForm(){
	this.html = document.getElementById('stream-form');
	this.inputs = [new VideoNameInput(), new StreamStartDatetimeInput(), new StreamEndDatetimeInput()];
	backwardsCompatibleAddEventListener(this.html,'submit','onsubmit',domComm.createLiveEvent,false);
	this.enableInputs = function(){
		for(var i = 0, ii = this.inputs.length; i < ii; i++){
			this.inputs[i].enable();
		}
	}
	this.disableInputs = function(){
		for(var i = 0, ii = this.inputs.length; i < ii; i++){
			this.inputs[i].disable();
		}
	}
	this.show = function(){
		showBlockElement(this.html.parentElement);
	}
	this.hide = function(){
		hideElement(this.html.parentElement);
	}
}

function VideoNameInput(){
	this.html = document.getElementById('inputVideoName');
	this.enable = function(){
		enableBtn(this.html);
	}
	this.disable = function(){
		disableBtn(this.html);
	}
}

function StreamStartDatetimeInput(){
	this.html = document.getElementById('inputStreamStartDatetime');
	this.enable = function(){
		enableBtn(this.html);
	}
	this.disable = function(){
		disableBtn(this.html);
	}
}

function StreamEndDatetimeInput(){
	this.html = document.getElementById('inputStreamEndDatetime');
	this.enable = function(){
		enableBtn(this.html);
	}
	this.disable = function(){
		disableBtn(this.html);
	}
}

//	3biii. LIVE STREAM PANEL
function StreamPanel(){
	this.html = document.getElementById('streamingPanel');
	this.ytLoadingDiv = new YouTubeLoadingMessageDiv();
	this.streamForm = new StreamForm();
	this.previewPlayer = new PreviewPlayer();
	this.publicPlayer = new PublicPlayer();
	this.show = function(){
		showBlockElement(this.html);
	}
	this.hide = function(){
		hideElement(this.html);
	}
}
//  3biiiA. PREVIEW VIDEO
function PreviewPlayer(){
	this.html = document.getElementById('preview-frame');
	this.insertMonitorStream = function(embedHtml){
		insertYouTubeStream(this.html,embedHtml); 
	}
}

function insertYouTubeStream(html,embedHtml){
	html.removeChild(html.children[0]);
	html.innerHTML = embedHtml;
	html.children[0].className = "col col-xs-12";
	if(html.id == 'public-frame'){html.children[0].src += "?&autoplay=1";}
}

//  3biiiB. PUBLIC VIDEO
function PublicPlayer(){
	this.html = document.getElementById('public-frame');
	this.insertPublicStream = function(embedHtml){
		insertYouTubeStream(this.html,embedHtml);
	}
}

//  3biv. ARCHIVED VIDEO PANEL
function ArchivedVideoPanel(){
	this.html = document.getElementById('archivedVideoPanel');
	this.videosList = new ArchivedVideosPageView();
	this.videoPlaceholder = new ArchivedVideoPlaceholderImg();
	this.show = function(){
		showBlockElement(this.html);
	}
	this.hide = function(){
		hideElement(this.html);
	}
}

function ArchivedVideosPageView(){
	this.html = document.getElementById('archived-videos-page-view');
	this.addArchivedVideo = function(el){
		el.id = 'pnl' + el.id;
		el.className = "col-xs-12 col-sm-6 col-lg-4";
		this.html.appendChild(el);
	}
}

function ArchivedVideoPlaceholderImg(){
	this.html = document.getElementById('archived-video-placeholder');
	this.replacePlaceholderElement = function(){
		this.html = document.getElementById('archived-video-placeholder');
	}
}

//  3c. BOTTOM NAVIGATION
function BottomNav(){
	this.html = document.getElementById('bottom-nav');
	this.startStreamBtn = new StartStreamBtn();
	this.stopStreamBtn = new StopStreamBtn();
	this.enableStart = function(){
		this.startStreamBtn.enable();
	}
	this.enableStop = function(){
		this.stopStreamBtn.enable();
	}
	this.disableStart = function(){
		this.startStreamBtn.disable();
	}
	this.disableStop = function(){
		this.stopStreamBtn.disable();
	}
	this.insertErrorMessage = function(msg){
		this.html.appendChild(new errorAlert(msg));
	}
	this.insertSuccessMessage = function(msg){
		this.html.appendChild(new successAlert(msg));
	}
}

//	3ci. START STREAM BUTTON
function StartStreamBtn(){
	this.html = document.getElementById('startStream');
	this.disable = function(){
		disableBtn(this.html);
	}
	this.enable = function(){
		enableBtn(this.html);
	}
	this.changeBtnMsg = function(message){
		this.html.innerHTML = message;
	}
	backwardsCompatibleAddEventListener(this.html,'click','onclick',domComm.createLiveEvent,false);
	this.changeOnClickToLiveTransition = function(){
		this.html.removeEventListener()
		backwardsCompatibleRemoveEventListener(this.html,'click','onclick',domComm.createLiveEvent,false);
		backwardsCompatibleAddEventListener(this.html,'click','onclick',domComm.transitionBroadcastToLive,false);
	}
	this.changeOnClickToCreateLiveEvent = function(){
		backwardsCompatibleRemoveEventListener(this.html,'click','onclick',domComm.transitionBroadcastToLive,false);
		backwardsCompatibleAddEventListener(this.html,'click','onclick',domComm.createLiveEvent,false);
	}
}

//	3cii. STOP STREAM BUTTON
function StopStreamBtn(){
	this.html = document.getElementById('stopStream');
	this.disable = function(){
		disableBtn(this.html);
	}
	this.enable = function(){
		enableBtn(this.html);
	}
	backwardsCompatibleAddEventListener(this.html,'click','onclick',domComm.stopLiveStream,false);
}

// 4. APPLICATION VIEW CONTROL
// 4a. DOM COMMUNICATOR
function DOMCommunicator(){
	
	this.initializePage = function(cookie){
		var values = cookie.split('; ');
		if(values.length >= 2){
			var cookies = new Array();
			for(var i = 0,ii = values.length; i < ii; i++){
				cookies[cookies.length] = values[i].split('=');
			}
			for(var i = 0, ii = cookies.length; i < ii; i++){
				if(cookies[i][0] == "monarchIp"){
					monarchDevices[monarchDevices.length] = new monarch(cookies[i][1]);
				}else if(cookies[i][0] == "monarchPass"){
					user = new monarchUser(cookies[i][1]);
				}
			}
		}
		
		if(monarchDevices.length > 0 && user.password){
			matroxComm.sendMessage(new monarchInstruction(monarchDevices[0],user,new getStatusCommand('addMonarchForm')));
		}
	}
	
	this.handleAddMonarchFormSubmission = function(ev){
		console.log("Monarch form submission event: ", ev);
		if(ev.preventDefault){ev.preventDefault();}else{ev.defaultPrevented = true;}
		
		// Disable submit and close button
		topNavigation.monarchToggle.monarchToggleMenu.addMonarchForm.disableButtons();
		
		// Send message to extension
		// ev.srcElement.id
		var monarchFormId = topNavigation.monarchToggle.monarchToggleMenu.addMonarchForm.html.id;
		//var initialCommand = new getStatusCommand(monarchFormId);
		user = new monarchUser(topNavigation.monarchToggle.monarchToggleMenu.addMonarchForm.inputs[1].html.value);
		monarchDevices[monarchDevices.length] = new monarch(topNavigation.monarchToggle.monarchToggleMenu.addMonarchForm.inputs[0].html.value);
		var extensionMsg = new monarchInstruction(monarchDevices[monarchDevices.length - 1],user,new getStatusCommand(monarchFormId));
		matroxComm.sendMessage(extensionMsg);
		
		// Display waiting message
		topNavigation.monarchToggle.monarchToggleMenu.addMonarchForm.monarchLoadingMessageDiv.show();
		return false;
	}
	
	this.handleMessageResponseToExtension = function(src){
		console.log("Handling error from: ", src);
		
		// Insert error message
		topNavigation.monarchToggle.monarchToggleMenu.addMonarchForm.monarchLoadingMessageDiv.hide();
		topNavigation.monarchToggle.monarchToggleMenu.addMonarchForm.insertErrorMessage();
		
		// Enable submit and close buttons
		topNavigation.monarchToggle.monarchToggleMenu.addMonarchForm.enableButtons();
	}
	
	this.validMonarchLoaded = function(src){
		console.log("Valid monarch loaded.");
		
		// Take down loading gif
		topNavigation.monarchToggle.monarchToggleMenu.addMonarchForm.monarchLoadingMessageDiv.hide();
		
		//Add Monarch
		topNavigation.monarchToggle.monarchToggleMenu.addMonarchDevice();
		
		// Store Monarch Info in Cookie
		document.cookie = 'monarchIp=' + monarchDevices[monarchDevices.length - 1].ipAddress + ';';
		document.cookie = 'monarchPass=' + user.password + ';';
		
		// Allow YouTube Form Use
		topNavigation.monarchToggle.monarchToggleMenu.addMonarchForm.enableButtons();
		streamingPanel.ytLoadingDiv.hide();
		topNavigation.settingsToggle.settingsToggleMenu.signInBtn.show();
		topNavigation.archivedVideosList.signInBtn.show();
		
		// Display success message
		topNavigation.monarchToggle.monarchToggleMenu.addMonarchForm.insertSuccessMessage();
	}
	
	this.validGooglePlusSignIn = function(){
		topNavigation.settingsToggle.settingsToggleMenu.signInBtn.hide();
		topNavigation.archivedVideosList.signInBtn.hide();
		bottomNavigation.startStreamBtn.enable();
		streamingPanel.streamForm.enableInputs();
	}
	
	this.insertArchivedVideo = function(id,title,date,img,embedHtml){
		var imgCopy = $(img).clone();
		archivedVids[archivedVids.length] = new YtVideo(id,title,date,img,embedHtml);
		topNavigation.archivedVideosList.addVideo(new videoListItem(id,title,date,img));
		archivePanel.videosList.addArchivedVideo(new videoListItem(id,title,date,imgCopy[0]));
	}
	
	this.loadWaitingMessage = function(message){
		streamingPanel.ytLoadingDiv.updateMsg(message);
		streamingPanel.ytLoadingDiv.show();
	}
	
	this.createLiveEvent = function(){
		console.log("Create Live Broadcast!");
		domComm.loadWaitingMessage('Creating live event...');
		bottomNavigation.startStreamBtn.disable();
		var name = streamingPanel.streamForm.inputs[0].html.value;
		var start = new Date(streamingPanel.streamForm.inputs[1].html.value);
		var stop = new Date(streamingPanel.streamForm.inputs[2].html.value);
		var timeZoneOffset = start.getTimezoneOffset();
		var timeToAdd = timeZoneOffset/60;
		start.setHours(start.getHours() + timeToAdd);
		stop.setHours(stop.getHours() + timeToAdd);
		try{
			var snippet = {"title":name,"scheduledEndTime":stop.toISOString(),
				"scheduledStartTime":start.toISOString()};
			var status = {"privacyStatus":"unlisted"};
			var body = new liveBroadcastRequestBody(snippet,status,{});
			var partArg = new part("snippet,status,contentDetails");
			youtubeApp.liveBroadcast.insert(partArg,body);
		}catch(error){
			console.log("Error creating live broadcast: ",error);
			domComm.handleStreamError('startStream',error.message);
		}
	}
	
	this.createLiveStream = function(){
		console.log("Create Live Stream!");
		this.loadWaitingMessage('Creating live stream...');
		var snippet = {"title": streamingPanel.streamForm.inputs[0].html.value};
		var cdn = {"format":"1080p","ingestionType":"rtmp"};
		youtubeApp.liveStream.insert(new part("snippet,status,cdn"), new liveStreamRequestBody(snippet,cdn));
	}
	
	this.bindStreamAndBroadcast = function(){
		this.loadWaitingMessage('Binding stream and broadcast...');
		youtubeApp.liveBroadcast.bind(youtubeApp.liveStream);
	}
	
	this.startStreamOnMonarch = function(){
		var extensionMsg = new setRTMPCommand(youtubeApp.liveStream.url,youtubeApp.liveStream.streamName,user.password,'startStream');
		matroxComm.sendMessage(new monarchInstruction(monarchDevices[0],user,extensionMsg));
		this.loadWaitingMessage('Assigning streaming address on Monarch...');
	}
	
	this.embedPreviewStream = function(){
		console.log("View Preview Stream!");
		this.loadWaitingMessage('Preparing stream for previewing...');
		youtubeApp.liveBroadcast.list();
		this.beginPreviewStream();
	}
	
	this.startVideoStream = function(){
		console.log("Broadcast state: ",youtubeApp.liveBroadcast);
		this.loadWaitingMessage('Starting stream from Monarch HD...');
		matroxComm.sendMessage(new monarchInstruction(monarchDevices[0],user,new startStreamingCommand('startStream')));
	}
	
	this.broadcastCompleted = function(){
		streamingPanel.streamForm.disableInputs();
		bottomNavigation.startStreamBtn.disable();
	}
	
	this.beginPreviewStream = function(){
		this.loadWaitingMessage('Waiting for active stream...');
		var streamState = window.setInterval(function(){
			if(youtubeApp.liveStream.streamStatus != "active"){
				youtubeApp.liveStream.updateStreamStatus();
			}else{
				window.clearInterval(streamState);
				domComm.transitionBroadcastToTesting();
			}
		}, 2000);
		return false;
	}
	
	this.transitionBroadcastToTesting = function(){
		console.log("Transition to Testing!");
		youtubeApp.liveBroadcast.transition('testing');
		this.displayMonitorStream();
	}
	
	this.displayMonitorStream = function(){
		this.loadWaitingMessage('Broadcast transitioning to testing phase...');
		streamingPanel.streamForm.hide();
		streamingPanel.show();
		var broadcastState = window.setInterval(function(){
			if(youtubeApp.liveBroadcast.status != "testing"){
				youtubeApp.liveBroadcast.list();
			}else{
				window.clearInterval(broadcastState);
				domComm.insertPreviewPlayer();
				domComm.insertLivePlayer();
			}
		}, 2000);
	}
	
	this.insertPreviewPlayer = function(){
		this.loadWaitingMessage('Inserting preview stream monitor...');
		streamingPanel.previewPlayer.insertMonitorStream(youtubeApp.liveBroadcast.embedHtml);
		bottomNavigation.startStreamBtn.changeBtnMsg('Go Live');
		bottomNavigation.startStreamBtn.changeOnClickToLiveTransition();
		bottomNavigation.startStreamBtn.enable();
		bottomNavigation.stopStreamBtn.enable();
		streamingPanel.ytLoadingDiv.hide();
	}
	
	this.insertLivePlayer =	function(){
		var request = gapi.client.youtube.videos.list({part:"player,status",
				id: youtubeApp.liveBroadcast.id}); 
		var onFulfilled = function(resp){
			streamingPanel.publicPlayer.insertPublicStream(resp.result.items[0].player.embedHtml);
		}
		youtubeApp.clientLib.then(clientRequest(request,this,onFulfilled));
	}
	
	this.transitionBroadcastToLive = function(ev){
		console.log("Transition to live!");
		domComm.loadWaitingMessage('Stream transitioning to live!');
		youtubeApp.liveBroadcast.transition('live');
		youtubeApp.liveBroadcast.pollBroadcast('live');
		return false;
	}
	
	this.completeTransitionToLive = function(){
		streamingPanel.ytLoadingDiv.hide();
	}
	
	this.stopLiveStream = function(){
		console.log("Stop streaming!");
		domComm.loadWaitingMessage("Completing event stream...");
		bottomNavigation.stopStreamBtn.disable();
		youtubeApp.liveBroadcast.list();
		if(youtubeApp.liveBroadcast.status == 'live'){
			console.log("Transition to complete!");
			youtubeApp.liveBroadcast.transition('complete');
			youtubeApp.liveBroadcast.pollBroadcast('complete');
		}else{
			streamingPanel.ytLoadingDiv.hide();
		}
		matroxComm.sendMessage(new monarchInstruction(monarchDevices[0],user,new stopStreamingCommand('stopStream')));
	}
	
	this.restoreToDefault = function(){
		console.log("Restoring our default view");
		streamingPanel.streamForm.show();
		streamingPanel.hide();
		bottomNavigation.startStreamBtn.enable();
		bottomNavigation.startStreamBtn.changeBtnMsg('Start Streaming');
		bottomNavigation.startStreamBtn.changeOnClickToCreateLiveEvent();
		streamingPanel.streamForm.enableInputs();
	}
	
	this.handleStreamError = function(src,msg){
		streamingPanel.ytLoadingDiv.hide();
		bottomNavigation.insertErrorMessage(msg);
		bottomNavigation.startStreamBtn.enable();
		
		//Rollback Changes Made
		if(youtubeApp.liveBroadcast.bound){
			youtubeApp.liveBroadcast.unbind();
		}
		
		var unboundBroadcast = window.setInterval(function(){
			if(youtubeApp.liveBroadcast.id != '' && !youtubeApp.liveBroadcast.bound){
				window.clearInterval(unboundBroadcast);
				youtubeApp.liveBroadcast.deleteBroadcast(youtubeApp.liveBroadcast);
			}else{
				window.clearInterval(unboundBroadcast);
			}
		},1000);
		
		var deletedBroadcast = window.setInterval(function(){
			if(youtubeApp.liveStream.id != '' && youtubeApp.liveBroadcast.id == ''){
				window.clearInterval(deletedBroadcast);
				youtubeApp.liveStream.deleteStream(youtubeApp.liveStream);
			}else if(youtubeApp.liveStream.id == ''){
				window.clearInterval(deletedBroadcast);
			}
		},1000);
	}
	
	this.handleMonarchMsg = function(ev,data){
		console.log("Receiving message from monarch: ", ev);
		console.log("Data from monarch: ", data);
		if(data.type && data.type == "FROM_PAGE"){
			if(data.text == "Success"){
				if(data.command == "SetRTMP"){
					domComm.startVideoStream();
				}else if(data.command == "StartStreaming"){
					domComm.embedPreviewStream();
				}else if(data.command == "GetStatus"){
					domComm.validMonarchLoaded(data.commandSrc);
				}else if(data.command == "StopStreaming"){
					domComm.restoreToDefault();
				}
			}else{
				var src = data.commandSrc;
				if(src != 'addMonarchForm'){
					domComm.handleStreamError(src,"Monarch command " + ev.data.command + " failed.");
				}else{
					domComm.handleMessageResponseToExtension(src); 
				}
			}
		}
	}
	
	this.loadArchivedVideo = function(ev){
		streamingPanel.streamForm.hide();
		bottomNavigation.startStreamBtn.disable();
		bottomNavigation.stopStreamBtn.disable();
		archivePanel.show();
		var videoId = (ev.srcElement.nodeName == 'BUTTON')? ev.srcElement.parentElement.id.substring(3) 
			: ev.srcElement.parentElement.parentElement.id.substring(3);
		for(var i = 0, ii = archivedVids.length; i < ii; i++){
			if(archivedVids[i].id == videoId){
				domComm.displayArchivedVideo(archivedVids[i]);
			}
		}
	}
	
	this.displayArchivedVideo = function(video){
		var tempDiv = document.createElement('div');
		tempDiv.innerHTML = video.html;
		var el = tempDiv.firstChild;
		el.id = "archived-video-placeholder";
		el.className = 'col-xs-12';
		archivePanel.videoPlaceholder.html.parentElement.replaceChild(el,archivePanel.videoPlaceholder.html);
		archivePanel.videoPlaceholder.replacePlaceholderElement();
	}
	
	this.displayLiveVideo = function(){
		if(archivePanel.html.style.display == 'block'){
			archivePanel.hide();
			bottomNavigation.startStreamBtn.enable();
			streamingPanel.streamForm.show();
		}
	}
}

// 5. EXTENSION COMMUNICATOR
function monarchExtensionMessenger(){
	this.extensionId = "74416";
	//"adpiackmfegmpblfljmjbfahoglbeomh";
	
	this.extensionMessageResponse = function(ev,response){
		if(!response.success){
			domComm.handleMessageResponseToExtension(response.commandSrc);
		}	
	}
	CrossriderAPI.bindExtensionEvent(document.body,'messageReceived',this.extensionMessageResponse);
	
	this.sendMessage = function(monarchInstructionObj){
		console.log("Message being sent to Extension: ", monarchInstructionObj);
		CrossriderAPI.isAppInstalled(this.extensionId, function(isInstalled){
			if(isInstalled){
				// Send message to extension
				CrossriderAPI.fireExtensionEvent(document.body,'messageMonarch',monarchInstructionObj);
			}
		});
			/*chrome.runtime.sendMessage(this.extensionId,monarchInstructionObj
			,this.extensionMessageResponse);*/
	}
}

// 5a. MONARCH USER
function monarchUser(password){
	this.username = "admin";
	this.password = password;
	this.id = '';
	return this;
}

// 5b. MONARCH DEVICE
function monarch(ipAddress){
	this.ipAddress = ipAddress;
	return this;
}

// 5c. MONARCH INSTRUCTION
function monarchInstruction(monarchObj,monarchUserObj,commandObj){
	this.commandName = commandObj.commandName;
	this.commandSrc = commandObj.commandSrc;
	this.commandURL = new monarchCommandURL(monarchUserObj.username,monarchUserObj.password,
		monarchObj.ipAddress,commandObj.toString()).toString();
	return this;
}

function monarchCommandURL(username,password,ipAddress,command){
	this.url = "http://" + username + ":" + encodeURIComponent(password) + "@" +
		encodeURIComponent(ipAddress) + "/Monarch/syncconnect/sdk.aspx?command=" +
		command;
	this.toString = function(){
		return this.url;
	}
	return this;
}

//  5d. MONARCH COMMANDS
//  GetStatusCommand
function getStatusCommand(src){
	this.commandName = "GetStatus";
	this.commandSrc = src;
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

//  StartStreamingCommand
function startStreamingCommand(src){
	this.commandName = "StartStreaming";
	this.commandSrc = src;
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

//  StartRecordingCommand
function startRecordingCommand(src){
	this.commandName = "StartRecording";
	this.commandSrc = src;
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

//  StartStreamingAndRecordingCommand
function startStreamingAndRecordingCommand(src){
	this.commandName = "StartStreamingAndRecording";
	this.commandSrc = src;
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

//  StopStreamingCommand
function stopStreamingCommand(src){
	this.commandName = "StopStreaming";
	this.commandSrc = src;
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

//  StopRecordingCommand
function stopRecordingCommand(src){
	this.commandName = "StopRecording";
	this.commandSrc = src;
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

//  GetStreamingVideoDataRate
function getStreamingVideoDataRateCommand(src){
	this.commandName = "GetStreamingVideoDataRate";
	this.commandSrc = src;
	this.toString = function(){
		return this.commandName;
	}
	return this;
}

//  SetStreamingVideoDataRate
function setStreamingVideoDataRateCommand(src){
	this.commandName = "SetStreamingVideoDataRate";
	this.commandSrc = src;
	this.averageBitRate = -1;
	this.toString = function(){
		return this.commandName + ',' + this.averageBitRate;
	}
	return this;
}

//  SetRTSP
function setRTSPCommand(src){
	this.commandName = "SetRTSP";
	this.commandSrc = src;
	this.urlName = '';
	this.port = -1;
	this.toString = function(){
		return this.commandName + ',' + this.urlName + ',' + this.port;
	}
	return this;
}

//  GetRTSP
function getRTSPCommand(src){
	this.commandName = "GetRTSP";
	this.commandSrc = src;
	this.toString = function(){
		return this.commandName + ',' + this.averageBitRate;
	}
	return this;
}

//  SetRTMP
function setRTMPCommand(url,streamName,password,src){
	this.commandName = "SetRTMP";
	this.commandSrc = src;
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

//  GetRTMP
function getRTMPCommand(src){
	this.commandName = "GetRTMP";
	this.commandSrc = src;
	this.toString = function(){
		return this.commandName + ',' + this.averageBitRate;
	}
	return this;
}

// 6. YOUTUBE API COMMUNICATOR
function youtubeApplication(){
	this.clientId = '462388181157-eq6ac5p3bkvoapo3c5aghnkfk52jcdcl.apps.googleusercontent.com';
	this.authorized = false;
	this.archivedVideos = new Array();
	this.clientLib = gapi.client.load('youtube','v3');
	this.liveBroadcast = new liveBroadcast(this);
	this.liveStream = new liveStream(this);
	//this.signInBtn = document.getElementsByClassName('g-signin')[0];
	//this.signInBtn2 = document.getElementByClassName('g-signin')[1];
	this.handleAuthResult = function(authResult){
		if (authResult && !authResult.error) {
			console.log("Authorization result: ", authResult);
			//Validate Token
			validateToken(authResult);
		}
	}
	this.validateToken = function(authResult){
		if(authResult.client_id == youtubeApp.clientId){
			this.authorized = true;
			domComm.validGooglePlusSignIn();
			this.liveBroadcast.getArchivedEvents();
		}
	}
	this.getArchivedVideo = function(videoId){
		var request = gapi.client.youtube.videos.list({part:"player,snippet,status",
			id: videoId});
		var onFulfilled = function(resp){
			var currThumbnail = document.createElement('img');
			currThumbnail.src = resp.result.items[0].snippet.thumbnails.default.url;
			currThumbnail.className = 'archive-menu-thumbnail';
			domComm.insertArchivedVideo(resp.result.items[0].id, resp.result.items[0].snippet.title, resp.result.items[0].snippet.publishedAt, 
				currThumbnail, resp.result.items[0].player.embedHtml);
		}
		this.clientLib.then(clientRequest(request,this,onFulfilled));
	}
	return this;
}

//  6a. YOUTUBE LIVE BROADCAST
function liveBroadcast(ytApp){
	this.parentApplication = ytApp;
	this.id = '';
	this.status = '';
	this.embedHtml = '';
	this.bound = false;
	
	this.pollBroadcast = function(statusToPollFor){
		var broadcastState = window.setInterval(function(){
			if(youtubeApp.liveBroadcast.status != statusToPollFor){
				youtubeApp.liveBroadcast.list();
			}else{
				window.clearInterval(broadcastState);
				domComm.completeTransitionToLive();
			}
		 },2000);
	}
	
	this.insert = function(part,liveBroadcastRequestBody){
		var request = gapi.client.youtube.liveBroadcasts.insert(part,liveBroadcastRequestBody);
		var onFulfilled = function(resp){
			console.log(resp);
			this.id = resp.result.id;
			this.status = resp.result.status.lifeCycleStatus;
			domComm.createLiveStream();
		}
		this.parentApplication.clientLib.then(clientRequest(request,this,onFulfilled));
	}
	this.bind = function(stream){
		var request = gapi.client.youtube.liveBroadcasts.bind({id:this.id,part:"snippet,status",
			streamId: stream.id});
		var onFulfilled = function(resp){
			this.id = resp.result.id;
			this.bound = true;
			domComm.startStreamOnMonarch();
		}
		this.parentApplication.clientLib.then(clientRequest(request,this,onFulfilled));
	}
	this.unbind = function(){
		var request = gapi.client.youtube.liveBroadcasts.bind({id:this.id,part:"snippet,status"});
		var onFulfilled = function(){
			this.bound = false;
		}
		this.parentApplication.clientLib.then(clientRequest(request,this,onFulfilled));
	}
	this.transition = function(transitionState){
		var request = gapi.client.youtube.liveBroadcasts.transition({broadcastStatus: transitionState,
			id: this.id, part: "contentDetails,status"});
		var onFulfilled = function(resp){
			this.embedHtml = resp.result.contentDetails.monitorStream.embedHtml;
			this.status = resp.result.status.lifeCycleStatus;
		}
		this.parentApplication.clientLib.then(clientRequest(request,this,onFulfilled));
	}
	this.list = function(){
		var request = gapi.client.youtube.liveBroadcasts.list({part:"contentDetails,status",
			id: this.id});
		var onFulfilled = function(resp){
			this.status = resp.result.items[0].status.lifeCycleStatus;
			this.embedHtml = resp.result.items[0].contentDetails.monitorStream.embedHtml;
			if(this.status != 'complete'){
				domComm.broadcastCompleted();
			}
		}
		this.parentApplication.clientLib.then(clientRequest(request,this,onFulfilled));
	}
	this.getArchivedEvents = function(){
		var request = gapi.client.youtube.liveBroadcasts.list({part:"snippet,status",
			broadcastStatus: "completed",maxResults: 50});
		var onFulfilled = function(resp){
			console.log("Archived videos response: ", resp);
			var videos = resp.result.items;
			for(var i = 0, ii = videos.length; i < ii; i++){
				youtubeApp.getArchivedVideo(videos[i].id);
			}
		}
		this.parentApplication.clientLib.then(clientRequest(request,this,onFulfilled));
	}
	this.deleteBroadcast = function(src){
		var request = gapi.client.youtube.liveBroadcasts.delete({id:this.id});
		var onFulfilled = function(resp){
			src.id = '';
			src.status = '';
			src.embedHtml = '';
		}
		this.parentApplication.clientLib.then(clientRequest(request,this,onFulfilled));
	}
}

// 6b. YOUTUBE LIVE STREAM
function liveStream(ytApp){
	this.parentApplication = ytApp;
	this.id = '';
	this.title = '';
	this.streamName = '';
	this.url = '';
	this.format = '';
	this.ingestionType = '';
	this.streamStatus = '';
	this.updateStreamStatus = function(){
		var request = gapi.client.youtube.liveStreams.list({part:"status",id:this.id});
		var onFulfilled = function(resp){
			this.streamStatus = resp.result.items[0].status.streamStatus;
		}
		this.parentApplication.clientLib.then(clientRequest(request,this,onFulfilled));
	}
	this.insert = function(part,liveStreamRequestBody){
		var request = gapi.client.youtube.liveStreams.insert(part,liveStreamRequestBody);
		var onFulfilled = function(resp){
			this.id = resp.result.id;
			this.title = resp.result.snippet.title;
			this.streamName = resp.result.cdn.ingestionInfo.streamName;
			this.url = resp.result.cdn.ingestionInfo.ingestionAddress;
			this.format = resp.result.cdn.format;
			this.ingestionType = resp.result.ingestionType;
			this.streamStatus = resp.result.status.streamStatus;
			domComm.bindStreamAndBroadcast();
		}
		this.parentApplication.clientLib.then(clientRequest(request,this,onFulfilled));
	}
	this.deleteStream = function(src){
		var request = gapi.client.youtube.liveStreams.delete({id:this.id});
		var onFulfilled = function(resp){
			src.id = '';
			src.status = '';
			src.embedHtml = '';
		}
		this.parentApplication.clientLib.then(clientRequest(request,this,onFulfilled));
	}
}

// 7. YOUTUBE VIDEO OBJECT
function YtVideo(id,title,date,img,embedHtml){
	this.id = id;
	this.title = title;
	this.date = new Date(date);
	this.thumbnail = img;
	this.html = embedHtml;
}