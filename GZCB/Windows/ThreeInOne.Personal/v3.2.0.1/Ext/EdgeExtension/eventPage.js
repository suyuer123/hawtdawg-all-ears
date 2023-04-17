// Store port for native messaging connections
var portArr = {};
var messageArr = {};
var connSeq = 0;

chrome.runtime.onMessageExternal.addListener(
    function (request, sender, senderCallback) {
        try {
            if (request.type == "connect") {
                connectToNativeHost(request, sender, senderCallback);
            } else if (request.type == "disconnect") {
                disconnectToNativeHost(request, sender, senderCallback);
            } else if (request.type == "checkHost") {
                checkHostPort(request, sender, senderCallback);
            } else if (request.type == "getExtensionVersion") {
                getExtensionVersion(request, sender, senderCallback);
            } else {
                sendToNativeHost(request, sender, senderCallback);
            }
            return true;
        }
        catch (e) {
            senderCallback({"errorcode": 1, "result": e.message});
        }
    });

// Connect to native host and get the communicatetion port  
function connectToNativeHost(request, sender, senderCallback) {
    try {
        var tabID = sender.tab.id;
        var connID = "";
        
        if (portArr[tabID] == null || portArr[tabID].port == null) {
            
            var port = chrome.runtime.connectNative(request.host);
            port.onMessage.addListener(onNativeMessage);
            port.onDisconnect.addListener(onDisconnected);
            port.name = tabID;
                        
            portArr[tabID] = new Array();
            portArr[tabID].port = port;
        }
        chrome.action.enable(tabID);

        connSeq += 1;
        connID = connSeq.toString();
        
        portArr[tabID][connID] = new Object();

        senderCallback({ "errorcode":0, "connid":connID });
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
        var receiveEventName = 'receiveNativeMsgEvent';
        if (message.msgid != null) {
            receiveEventName += ("." + message.msgid);
        }
        var messageInfo = messageArr[receiveEventName];
        if (null != messageInfo) {
            messageInfo.callback(message);
            delete messageArr[receiveEventName];
        }
    }
}

function onDisconnected(port) {
    message = {"function":"JSCallback", "params":[{"":"99", "result": "Host disconnected"}]};
    chrome.tabs.sendMessage(port.name, message);
}

// Disconnect from native host
function disconnectToNativeHost(request, sender, senderCallback) {
    try {
        var tabID = sender.tab.id;
        var connID = (request.connid != null ? request.connid : "" );
        
        // console.log("Disconnect connID:" + connID);
        if (portArr[tabID] != null && portArr[tabID][connID] != null) {
            
            delete portArr[tabID][connID];
            
            var currentConnCount = 0;
            for (var i in portArr[tabID]) {
                if (portArr[tabID][i] != portArr[tabID].port) {
                    currentConnCount += 1;
                }
            }
            
            if (currentConnCount == 0 && portArr[tabID].port != null) {
                portArr[tabID].port.disconnect();
                delete portArr[tabID].port;
                delete portArr[tabID];
            }
        }
        	
        senderCallback({ "errorcode": 0 });
    }
    catch (e) {
        console.log(e.message);
    }
}

// Send message to native host
function sendToNativeHost(request, sender, senderCallback) {
    try {
        var tabID = sender.tab.id;
        var connID = (request.connid != null ? request.connid : "" );
        
        if (portArr[tabID] != null && portArr[tabID][connID] != null && portArr[tabID].port != null) {     
            var port = portArr[tabID].port;
            port.postMessage(request.message);

            var receiveEventName = 'receiveNativeMsgEvent';
            if (request.message.msgid != null) {
                receiveEventName += ("." + request.message.msgid);
            }
            
            var messageInfo = new Object();
            messageInfo.port = port;
            messageInfo.tabID = tabID;
            messageInfo.callback = senderCallback;
            messageArr[receiveEventName] = messageInfo;
        }
        else {
            senderCallback({ "errorcode":1, "result":"The connid not exist!" });
        }
    }
    catch (e) {
        // console.log("sendToNativeHost error");
        throw e;
    }
}

function checkHostPort(request, sender, senderCallback) {
    try {
        var tabID = sender.tab.id;
        var connID = (request.connid != null ? request.connid : "" );
        if (portArr[tabID] != null && portArr[tabID].port != null && portArr[tabID][connID] != null) {
            senderCallback({ "errorcode": 0 });
        }
        else {
            senderCallback({"errorcode": 1, "result": "Attempt to postMessage on disconnected port"});
        }
    }
    catch (e) {
        throw e;
    }
}

function getExtensionVersion(request, sender, senderCallback) {
    try {
        var manifest = chrome.runtime.getManifest();
        var response = {"errorcode": 0, "result": manifest.version};
        senderCallback(response);
    }
    catch (e) {
        throw e;
    }
}