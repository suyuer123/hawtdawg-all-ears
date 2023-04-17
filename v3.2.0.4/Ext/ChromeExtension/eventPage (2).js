// Store port for native messaging connections
var portArr = {};

chrome.runtime.onMessageExternal.addListener(
    function (request, sender, senderCallback) {
        try {
            if (request.type == "connect") {
                connectToNativeHost(request.host, sender, senderCallback);
            } else if (request.type == "disconnect") {
                disconnectToNativeHost(sender, senderCallback);
            } else if (request.type == "checkHost") {
                checkHostPort(sender, senderCallback);
            } else if (request.type == "getExtensionVersion") {
                getExtensionVersion(sender, senderCallback);
            } else {
                sendToNativeHost(request, sender);

                document.addEventListener('receiveNativeMsgEvent',
                function send2docment(e) {
                    senderCallback(e.detail);
                    document.removeEventListener(e.type, send2docment);
                }, false);
            }
            return true;
        }
        catch (e) {
	    var response = {"errorcode": 1, "result": e.message};
            senderCallback(response);
        }
    });

// Connect to native host and get the communicatetion port  
function connectToNativeHost(host, sender, senderCallback) {
    try {
        tabID = sender.tab.id;
        if (null != portArr[tabID]) {
            portArr[tabID].disconnect();
            delete portArr[tabID];
        }

        var port = chrome.runtime.connectNative(host);
        port.onMessage.addListener(onNativeMessage);
        port.onDisconnect.addListener(onDisconnected);
        port.name = tabID;
        portArr[tabID] = port;

        senderCallback({ "errorcode": 0 });
    }
    catch (e) {
        throw e;
    }
}

function onNativeMessage(message) {
    if (message.function == "JSCallback") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var lastTabId = tabs[0].id;
            chrome.tabs.sendMessage(lastTabId, message);
        })
    }
    else {
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent('receiveNativeMsgEvent', true, false, message);
        document.dispatchEvent(evt);
    }
}

function onDisconnected(port) {
    message = {"function":"JSCallback", "params":[{"":"99", "result": "Host disconnected"}]};
    chrome.tabs.sendMessage(port.name, message);
}

// Disconnect from native host
function disconnectToNativeHost(sender, senderCallback) {
    try {
        tabID = sender.tab.id;
        if (null != portArr[tabID]) {
            portArr[tabID].disconnect();
            delete portArr[tabID];
        }
        	
        senderCallback({ "errorcode": 0 });
    }
    catch (e) {
        console.log(e.message);
    }
}

// Send message to native host
function sendToNativeHost(request, sender) {
    try {
        tabID = sender.tab.id;
        var port = portArr[tabID];
        port.postMessage(request.message);
    }
    catch (e) {
        throw e;
    }
}

function checkHostPort(sender, senderCallback) {
    try {
        tabID = sender.tab.id;
        var port = portArr[tabID];
        if (null != port) {
            senderCallback({ "errorcode": 0 });
        }
        else {
	    var response = {"errorcode": 1, "result": "Attempt to postMessage on disconnected port"};
            senderCallback(response);
        }
    }
    catch (e) {
        throw e;
    }
}

function getExtensionVersion(sender, senderCallback) {
    try {
        var manifest = chrome.runtime.getManifest();
        var response = {"errorcode": 0, "result": manifest.version};
        senderCallback(response);
    }
    catch (e) {
        throw e;
    }
}