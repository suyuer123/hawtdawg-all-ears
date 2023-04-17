var productID = "com.cfca.seceditctl.gzcb.pers";
var extensionName = productID + ".extension";
var reqEventName  = productID + ".request";
var respEventName = productID + ".response";
var cbEventName   = productID + ".callback";

var isInstalledNode = document.createElement('div');
isInstalledNode.id = extensionName;
document.body.appendChild(isInstalledNode);

chrome.runtime.onMessage.addListener(
    function (request) {
        try {
            if (request.function == "JSCallback")
            {
                var evtTest = new CustomEvent(cbEventName, { detail: JSON.stringify(request) });
                document.dispatchEvent(evtTest);
                return true;
            }
        }
        catch (e) {
            var resultObj = new Object();
            resultObj.errorcode = 1;
            resultObj.result = e.message;
            
            var evtTest = new CustomEvent(cbEventName, { detail: JSON.stringify(resultObj) });
            document.dispatchEvent(evtTest);

            return true;
        }
    }
);