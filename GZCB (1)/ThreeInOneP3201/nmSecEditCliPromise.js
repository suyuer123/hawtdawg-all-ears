Browser = {
    IE:      "Internet Explorer",
    Edge:    "Edge",
    Chrome:  "Chrome",
    Safari:  "Safari",
    Firefox: "Firefox",
};

function GenerateRandomId() {
    var charstring = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    var maxPos = charstring.length;
    var randomId = '';
    for (i = 0; i < 10; i++) {
        randomId += charstring.charAt(Math.floor(Math.random() * maxPos));
    }
    return randomId;
}

if (typeof FO == "undefined") {
    var FO = {};
    FO.UNSET_HOOK = "0";
    FO.SET_HOOK = "1";
    FO.GET_VALUE = "2";
    FO.GET_VERSION = "3";
    FO.CLEAR = "4";
    FO.GET_LEN_INTENSITY = "5";
    FO.GET_COMPLEX_INTENSITY = "6";
    FO.GET_CLIENT_RANDOM = "7";
    FO.GET_PASSWORD_STRENGTH = "8";
    FO.IS_WEAK_PASSWORD = "9";
    FO.GET_PASSWORD_HASH = "10";
    FO.GET_NETINFO = "11";
    FO.GET_LEN = "12";
    FO.GET_HARDWARE_INFO = "13";
    FO.GET_USER_INFO = "14";
    FO.GET_OS_VER_INFO = "15";
    FO.GET_KEY_STATE = "16";
    FO.GET_NETINFO_IPv6 = "18";
}

function SetDisabled(objID, state) {
    try {
        var obj = document.getElementById(objID);
        obj.disabled = state;
        if (state == true) {
            obj.value = "";
            obj.style.borderWidth = "1px";
            obj.style.borderColor = "#EBEBE4";
            obj.style.backgroundColor = "#EBEBE4";
        }
        else {
            obj.style.borderWidth = obj.SecEditCtl.m_BorderWidth;
            obj.style.borderColor = obj.SecEditCtl.m_borderColors0;
            obj.style.backgroundColor = obj.SecEditCtl.m_backgroundColors0;
        }
    }
    catch (e) {
        alert(e);
        return;
    }
}
// Encapsulate Chrome sendMessage callback to Promise
function SendMessageforChrome(request) {
    return new Promise(function (resolve, reject) {
        console.log(request);
        chrome.runtime.sendMessage(nmSecEditCtl.chromeExtension, request, function (response) {
            console.log(response);
            if (response) {
                if (0 == response.errorcode) {
                    resolve(response);
                }
                else {
                    reject(response);
                }
            }
            else {
                var result = new Object();
                result.errorcode = 1;
                result.result = chrome.runtime.lastError.message;
                reject(result);
            }
        });
    });
}

// Encapsulate Edge sendMessage callback to Promise
function SendMessageforEdge(request) {
    return new Promise(function (resolve, reject) {
        console.log(request);
        chrome.runtime.sendMessage(nmSecEditCtl.edgeExtension, request, function (response) {
            console.log(response);
            if (response) {
                if (0 == response.errorcode) {
                    resolve(response);
                }
                else {
                    reject(response);
                }
            }
            else {
                var result = new Object();
                result.errorcode = 1;
                result.result = chrome.runtime.lastError.message;
                reject(result);
            }
        });
    });
}

// Encapsulate Firefox event to Promise
function SendMessagebyEvent(request) {
    
    var reqEventName = nmSecEditCtl.reqEventName;
    var respEventName = nmSecEditCtl.respEventName;
    
    if (request.message != null && request.message.msgid != null)
    {
        respEventName += "." + request.message.msgid;
    }
    
    var event = new CustomEvent(reqEventName, { detail: request });
    var documentObj=window.top.document
    documentObj.dispatchEvent(event);

    return new Promise(function (resolve, reject) {
        documentObj.addEventListener(respEventName, function CallBack(e) {
            documentObj.removeEventListener(e.type, CallBack);
            var eJson = JSON.parse(e.detail);
            if (null != eJson && 0 == eJson.errorcode) {
                resolve(eJson);
            }
            else {
                reject(eJson);
            }
        }, false);
    });
}

function PromiseSend(browser, requestJSON) {
    if (Browser.Chrome == browser.name) {
        return SendMessageforChrome(requestJSON);
    }
    else if(Browser.Edge == browser.name){
        return SendMessageforEdge(requestJSON);
    }
    else {
        return SendMessagebyEvent(requestJSON);
    }
}

function nmSecEditCtl(oid) {

    this.pwdinput = document.getElementById(oid);
    if (this.pwdinput != null)
    {
        this.pwdinput.SecEditCtl = this;
    }
}
nmSecEditCtl.browser = BrowserInfo();
nmSecEditCtl.chromeExtension = "nnohnofemfgmcboenhdnpbncceenhiob";
nmSecEditCtl.edgeExtension = "gfhompomkhpopadkcimcefhadlkcmodb";
nmSecEditCtl.productID = "com.cfca.seceditctl.gzcb.pers";
nmSecEditCtl.extensionName = nmSecEditCtl.productID + ".extension";
nmSecEditCtl.reqEventName  = nmSecEditCtl.productID + ".request";
nmSecEditCtl.respEventName = nmSecEditCtl.productID + ".response";
nmSecEditCtl.cbEventName   = nmSecEditCtl.productID + ".callback";

nmSecEditCtl.checkExtension = function (object) {
    return new Promise(function (resolve, reject) {
        var result = new Object();
        var browser = nmSecEditCtl.browser;
        if (Browser.Chrome == browser.name || Browser.Edge == browser.name) {
            // chrome.runtime.sendMessage() could check extension  existence.
            resolve(object);
        }
        else if (Browser.Firefox == browser.name) {
            if (window.top.document.getElementById(nmSecEditCtl.extensionName)) {
                resolve(object);
            }
            else {
                result.errorcode = 1;
                result.result = "Extension does not exist!";
                reject(result);
            }
        }
        else {
            result.errorcode = 1;
            result.result = "Only support Chrome/Edge/Firefox";
            reject(result);
        }
    });
}

// Following used to the old extension (v3.2.0.1) and the new extension (v3.2.0.2)

nmSecEditCtl.IsConnected = false;
nmSecEditCtl.connid = null;

nmSecEditCtl.GetConnectionID = function (nmObj) {
    return  (nmObj != null && nmObj.connid != null) ? nmObj.connid : nmSecEditCtl.connid;
}

nmSecEditCtl.GetConnectState = function (nmObj) {
    return nmSecEditCtl.IsConnected;
}

nmSecEditCtl.Connect = function () {
    var nmObj = this;
    var requestJSON = new Object();
    requestJSON.type = "connect";
    requestJSON.host = nmSecEditCtl.productID;

    return nmSecEditCtl.checkExtension(requestJSON)
        .then(function (response) {
            return PromiseSend(nmSecEditCtl.browser, response);
        })
        .then(function (response) {
            if (response != null && response.connid != null)
                nmObj.connid = response.connid;
            nmObj.IsConnected = true;
            return Promise.resolve(response);
        });
}

nmSecEditCtl.prototype.GetExtVersion = function () {
    var requestJSON = new Object();
    requestJSON.type = "getExtensionVersion";
    requestJSON.host = nmSecEditCtl.productID;
    requestJSON.connid = nmSecEditCtl.GetConnectionID(this);

    return nmSecEditCtl.checkExtension(requestJSON)
        .then(function (response) {
            return PromiseSend(nmSecEditCtl.browser, response);
        });
}

nmSecEditCtl.prototype.init = function () {
    var object = this.pwdinput;

    this.m_ObjectID = object.id;
    this.m_MinLength = object.attributes.MinLength.value;
    this.m_MaxLength = object.attributes.MaxLength.value;
    this.m_CipherType = object.attributes.CipherType.value;
    this.m_ServerRandom = object.attributes.ServerRandom.value;
    this.m_RestrictRegExp = object.attributes.RestrictRegExp.value;
    this.m_IntensityRegExp = object.attributes.IntensityRegExp.value;

    var borderColors = new Array();
    borderColors = object.attributes.BorderColor.value.split("|");
    this.m_borderColors0 = borderColors[0];
    this.m_borderColors1 = borderColors[1];

    var backgroundColors = new Array();
    backgroundColors = object.attributes.BackgroundColor.value.split("|");
    this.m_backgroundColors0 = backgroundColors[0];
    this.m_backgroundColors1 = backgroundColors[1];

    this.m_BorderWidth = object.attributes.BorderWidth.value + "px";

    var msgJSON = new Object();
    var paramArr = new Array();
    var obj = new Object();

    obj.ObjectID = object.id;
    obj.MinLength = this.m_MinLength;
    obj.MaxLength = this.m_MaxLength;
    obj.CipherType = this.m_CipherType;
    obj.ServerRandom = this.m_ServerRandom;
    obj.RestrictRegExp = this.m_RestrictRegExp;
    obj.IntensityRegExp = this.m_IntensityRegExp;
    paramArr.push(obj);

    msgJSON.function = "SetAttributes";
    msgJSON.msgid = GenerateRandomId();
    msgJSON.params = paramArr;

    var requestJSON = new Object();
    requestJSON.type = "SetAttributes";
    requestJSON.host = nmSecEditCtl.productID;
    requestJSON.connid = nmSecEditCtl.GetConnectionID(this);
    requestJSON.message = msgJSON;

    return nmSecEditCtl.checkExtension(requestJSON)
        .then(function (response) {
            return PromiseSend(nmSecEditCtl.browser, response)
                .then(
                    function (response) {
                        if (0 == response.errorcode) {
                            SetDisabled(response.oid, false);
                            InitPwdEdit(nmSecEditCtl.browser, response.oid);
                        }
                        else {
                            SetDisabled(response.oid, true);
                            throw new Error(response.errorcode);
                        }
                    }
                );
        });
}

nmSecEditCtl.prototype.GetVersion = function () {
    this.Version = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_VERSION, this.m_ObjectID);
}

nmSecEditCtl.prototype.GetValue = function () {
    this.EncryptValue = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_VALUE, this.m_ObjectID);
}

nmSecEditCtl.prototype.GetLengthIntensity = function () {
    this.LenIntensity = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_LEN_INTENSITY, this.m_ObjectID);
}

nmSecEditCtl.prototype.GetComplexIntensity = function () {
    this.ComplexIntensity = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_COMPLEX_INTENSITY, this.m_ObjectID);
}

nmSecEditCtl.prototype.GetClientRandom = function () {
    this.ClientRandom = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_CLIENT_RANDOM, this.m_ObjectID);
}

nmSecEditCtl.prototype.GetPasswordStrength = function () {
    this.PasswordStrength = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_PASSWORD_STRENGTH, this.m_ObjectID);
}

nmSecEditCtl.prototype.IsWeakPassword = function () {
    this.WeakPassword = "";
    return SendToExt(nmSecEditCtl.browser, FO.IS_WEAK_PASSWORD, this.m_ObjectID);
}

nmSecEditCtl.prototype.GetPasswordHash = function () {
    this.PasswordHash = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_PASSWORD_HASH, this.m_ObjectID);
}

nmSecEditCtl.prototype.GetPasswordLength = function () {
    this.PasswordLength = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_LEN, this.m_ObjectID);
}

nmSecEditCtl.prototype.GetHardwareInfo = function (DeviceName, DeviceProperty) {
    this.HardwareInfo = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_HARDWARE_INFO, this.m_ObjectID, DeviceName, DeviceProperty);
}

nmSecEditCtl.prototype.GetUserInfo = function () {
    this.UserInfo = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_USER_INFO, this.m_ObjectID);
}

nmSecEditCtl.prototype.GetOSVerInfo = function () {
    this.OSVerInfo = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_OS_VER_INFO, this.ObjectID);
}

nmSecEditCtl.prototype.GetNetInfo = function () {
    this.NetInfo = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_NETINFO_IPv6, this.m_ObjectID);
}

nmSecEditCtl.prototype.GetKeyState = function () {
    this.CapsLockState = "";
    return SendToExt(nmSecEditCtl.browser, FO.GET_KEY_STATE, this.m_ObjectID);
}

nmSecEditCtl.prototype.Clear = function () {
    return SendToExt(nmSecEditCtl.browser, FO.CLEAR, this.m_ObjectID);
}

nmSecEditCtl.Disconnect = function () {
    var requestJSON = new Object();
    requestJSON.type = "disconnect";
    requestJSON.host = nmSecEditCtl.productID;
    requestJSON.connid = nmSecEditCtl.GetConnectionID(this);
    requestJSON.message = "";
    
    this.IsConnected = false;
    if (nmSecEditCtl.IsConnected != undefined)
        nmSecEditCtl.IsConnected = false;       // For old extension compatibility     

    return PromiseSend(nmSecEditCtl.browser, requestJSON)
        .then(function (response) {
            if (response.errorcode == false) {
                ;
            }
        });
}

function DoClick(response) {
    var pwdinput = document.getElementById(response.oid);
    var object = pwdinput.SecEditCtl;

    if (0 == response.errorcode) {
        var result = response.result;
        switch (response.opcode) {
            case FO.SET_HOOK:
            case FO.UNSET_HOOK:
                break;
            case FO.GET_VALUE:
                object.EncryptValue = result;
                break;
            case FO.GET_VERSION:
                object.Version = result;
                break;
            case FO.CLEAR:
                object.value = "";
                break;
            case FO.GET_LEN_INTENSITY:
                if (result == "1") { result = "true"; } else { result = "false"; }
                object.LenIntensity = result;
                break;
            case FO.GET_COMPLEX_INTENSITY:
                if (result == "1") { result = "true"; } else { result = "false"; }
                object.ComplexIntensity = result;
                break;
            case FO.GET_CLIENT_RANDOM:
                object.ClientRandom = result;
                break;
            case FO.GET_PASSWORD_STRENGTH:
                object.PasswordStrength = result;
                break;
            case FO.IS_WEAK_PASSWORD:
                if (result == "1") { result = "true"; } else { result = "false"; }
                object.WeakPassword = result;
                break;
            case FO.GET_PASSWORD_HASH:
                object.PasswordHash = result;
                break;
            case FO.GET_NETINFO_IPv6:
                object.NetInfo = result;
                break;
            case FO.GET_LEN:
                object.PasswordLength = result;
                break;
            case FO.GET_HARDWARE_INFO:
                object.HardwareInfo = result;
                break;
            case FO.GET_USER_INFO:
                object.UserInfo = result;
                break;
            case FO.GET_OS_VER_INFO:
                object.OSVerInfo = result;
                break;
            case FO.GET_KEY_STATE:
                object.CapsLockState = result;
                break;
        }
        return result;
    }
    else {
        throw new Error(response.errorcode);
    }
}

function SendToExt(browser, index, objID, WMIType, WMIProperty) {
    var msgJSON = new Object();
    var paramArr = new Array();

    var Op = new Object();
    Op[objID] = index;
    if (index == FO.GET_HARDWARE_INFO) {
        if (WMIProperty == undefined)
            Op[WMIType] = "default";
        else
            Op[WMIType] = WMIProperty;
    }
    paramArr.push(Op);

    msgJSON.function = "OperateClick";
    msgJSON.msgid = GenerateRandomId();
    msgJSON.params = paramArr;

    var requestJSON = new Object();
    requestJSON.type = "OperateClick";
    requestJSON.host = nmSecEditCtl.productID;
    requestJSON.message = msgJSON;
    requestJSON.connid = nmSecEditCtl.GetConnectionID(this);

    return nmSecEditCtl.checkExtension(requestJSON)
        .then(function (response) {
            return PromiseSend(nmSecEditCtl.browser, response);
        })
        .then(function (response) {
            return DoClick(response);
        });
}

function InitPwdEdit(browser, ObjectID) {
    var object;
    object = document.getElementById(ObjectID);

    function moveToEnd() {
        object.focus();
        var len = object.value.length;

        if (document.selection) {
            var sel = object.createTextRange();
            sel.moveStart('character', len);
            sel.collapse();
            sel.select();
        } else if (typeof object.selectionStart == 'number' &&
            typeof object.selectionEnd == 'number') {
            object.selectionStart = object.selectionEnd = len;
        }
    }

    object.onmousedown = function (e) {
        var e = e || window.event;
        e.preventDefault();
        moveToEnd();
        return false;
    }

    object.oncontextmenu = function () {
        moveToEnd();  //for Edge
        return false;
    }

    object.onkeydown = function (e) {
        e = e || window.event;
        kc = e.keyCode || e.charCode;
        if (kc == 9) {
            return true;
        } else if (kc == 13) {
            EnterFunction(ObjectID);
        } else {
            return false;
        }
    }

    object.onclick = function () {
        moveToEnd();
        return true;
    }

    object.onpaste = function () {
        return false;
    }

    object.onfocus = function () {

        if (nmSecEditCtl.GetConnectState(object.SecEditCtl) == true) {
        
            object.style.borderColor = object.SecEditCtl.m_borderColors1;
            object.style.backgroundColor = object.SecEditCtl.m_backgroundColors1;
            
            SendToExt(object.SecEditCtl.browser, FO.SET_HOOK, ObjectID)
                .catch(function (response) {
                    SetDisabled(ObjectID, true)
                    alert("FO.SET_HOOK error. " + response.result);
                });
        }
        return true;
    }

    object.onblur = function () {
        if (nmSecEditCtl.GetConnectState(object.SecEditCtl) == true) {
            object.style.borderColor = object.SecEditCtl.m_borderColors0;
            object.style.backgroundColor = object.SecEditCtl.m_backgroundColors0;

            SendToExt(object.SecEditCtl.browser, FO.UNSET_HOOK, ObjectID)
                .catch(function (response) {
                    alert("FO.UNSET_HOOK error. " + response.result);
                });

            object.nextSibling.style.display = 'none';
        }
        return true;
    }
}

window.top.document.addEventListener(nmSecEditCtl.cbEventName,
    function DoJSCallback(e) {
        var jsonObj = JSON.parse(e.detail);

        if (jsonObj.function === "JSCallback") {
            var param = jsonObj.params[0];
            var propertyArr = Object.getOwnPropertyNames(param);

            var objID = propertyArr[0]
            var objOp = param[objID];

            var paramName;
            var paramValue;

            var obj = document.getElementById(objID);

            if (obj != null) {
                switch (objOp) {
                    case "0":
                        break;

                    case "1":       // Danger
                        obj.SecEditCtl.Clear();
                        obj.style.border = '2px red solid';
                        obj.value = "";
                        SetDisabled(objID, true);
                        break;

                    case "2":       // SetText
                        paramName = propertyArr[1]
                        paramValue = param[paramName];

                        var content = "";
                        for (var i = 0; i < paramValue; i++) {
                            content = content + "*";
                        }
                        obj.value = content;

                        var evtObj = document.createEvent('UIEvents');
                        evtObj.initUIEvent('keypress', true, true, window, 1);
                        obj.dispatchEvent(evtObj);

                        break;
                        
                    case "3":       // PressTab
                        if (objID == "SecEditBox1") {
                            NextObjID = "clearSIPBox1";
                        }

                        if (objID == "SecEditBox2") {
                            NextObjID = "clearSIPBox2";
                        }
                        obj.blur();
                        document.getElementById(NextObjID).focus();
                    break;
                    case "99":
                        SetDisabled("SecEditBox1", true);
                        SetDisabled("SecEditBox2", true);
                    default:
                        break;
                }
            }
        }
    }, false);

function BrowserInfo() {
    var res = {
        name: "",
        version: "",
    };
    var reg;
    var userAgent = self.navigator.userAgent;

    if (reg = /edg\/([\d\.]+)/i.exec(userAgent)) {
        res.name = "Edge";
        res.version = reg[1];
    }
    else if (/msie/i.test(userAgent)) {
        res.name = "Internet Explorer";
        res.version = /msie ([\d\.]+)/i.exec(userAgent)[1];
    }
    else if (/Trident/i.test(userAgent)) {
        res.name = "Internet Explorer";
        res.version = /rv:([\d\.]+)/i.exec(userAgent)[1];
    }
    else if (/chrome/i.test(userAgent)) {
        res.name = "Chrome";
        res.version = /chrome\/([\d\.]+)/i.exec(userAgent)[1];
    }
    else if (/safari/i.test(userAgent)) {
        res.name = "Safari";
        res.version = /version\/([\d\.]+)/i.exec(userAgent)[1];
    }
    else if (/firefox/i.test(userAgent)) {
        res.name = "Firefox";
        res.version = /firefox\/([\d\.]+)/i.exec(userAgent)[1];
    }
    return res;
}