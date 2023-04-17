
function ButtonOnClickExt(objID) {
    document.getElementById("encryptedResult").value = "";
    document.getElementById("getSIPBox1Value").disabled = true;
    document.getElementById("getSIPBox2Value").disabled = true;
    var pwdinput = document.getElementById(objID);
    var obj = pwdinput.SecEditCtl;
    if (pwdinput.value == "") {
        alert("please input a password!");
        document.getElementById("getSIPBox1Value").disabled = false;
        document.getElementById("getSIPBox2Value").disabled = false;
        return;
    }

    obj.GetClientRandom()
        .then(function () { return obj.GetVersion(); })
        .then(function () { return obj.GetValue(); })
        .then(function () { return obj.GetLengthIntensity(); })
        .then(function () { return obj.GetComplexIntensity(); })
        .then(function () { return obj.GetPasswordStrength(); })
        .then(function () { return obj.IsWeakPassword(); })
        .then(function () { return obj.GetPasswordHash(); })
        .then(function () { return obj.GetNetInfo(); })
        .then(function () { return obj.GetPasswordLength(); })
        .then(function () { return obj.SM3HashData("1234", "56789", null); })
        .then(function () {
            document.getElementById("encryptedResult").value = "Version: \n" + obj.Version + "\n\nLength Intensity: \n" + obj.LenIntensity + "\n\nPassword length: \n" + obj.PasswordLength + "\n\nComplex Intensity: \n" + obj.ComplexIntensity + "\n\nIs Weak Password: \n" + obj.WeakPassword + "\n\nPassword Strength: \n" + obj.PasswordStrength + "\n\nClient Random: \n" + obj.ClientRandom + "\n\nEncrypted Password: \n" + obj.EncryptValue + "\n\nServer Random: \nMDEyMzQ1Njc4OWFiY2RlZg==" + "\n\nHASH: \n" + obj.PasswordHash + "\n\nNetInfo: \n" + obj.NetInfo + "\n\nSM3HashData: \n" + obj.SM3Hash + "\n";
            document.getElementById("getSIPBox1Value").disabled = false;
            document.getElementById("getSIPBox2Value").disabled = false;
        })
        .catch(function (error) {
            alert(error);
        });
}

function ClearData(objID) {
    var obj = document.getElementById(objID);
    obj.value = "";
    obj.SecEditCtl.Clear();
}

function DisconnectHost() {
    nmSecEditCtl.Disconnect();
}

function detectCapsLock(event) {

    var obj = document.getElementById(event.target.id);
    obj.SecEditCtl.GetKeyState()
        .then(function () {
            if (obj.SecEditCtl.CapsLockState == 1) {
                obj.nextSibling.style.display = 'block';
            }
            else {
                obj.nextSibling.style.display = 'none';
            }
        });

}

function LoadObj() {
    document.getElementById("FakeSecEditBox1").innerHTML = "<input type=\"password\" id=\"SecEditBox1\" size=\"30\" value=\"\" disabled=\"true\" MinLength=\"4\" MaxLength=\"24\" CipherType=\"0\" BorderWidth=\"0\" BorderColor=\"#CCEEFF|#FF0\" BackgroundColor=\"#0F0|#0D0\" ServerRandom=\"MDEyMzQ1Njc4OWFiY2RlZg==\" RestrictRegExp=\"([!-~]+)\" IntensityRegExp=\"(^[!-~]*[A-Za-z]+[!-~]*[0-9]+[!-~]*$)|(^[!-~]*[0-9]+[!-~]*[A-Za-z]+[!-~]*$)\">";
    document.getElementById("FakeSecEditBox1").innerHTML += "<div class=\"lock_tips\" id=\"caps_lock_tips1\" style=\"display: none; top: 100px; left: 120px; \"><span class=\"lock_tips_row\"></span> <span>大写锁定已打开</span></div>";
    document.getElementById("FakeSecEditBox2").innerHTML = "<input type=\"password\" id=\"SecEditBox2\" size=\"30\" value=\"\" disabled=\"true\" MinLength=\"4\" MaxLength=\"24\" CipherType=\"1\" BorderWidth=\"0\" BorderColor=\"#CCEEFF|#FF0\" BackgroundColor=\"#0F0|#0D0\" ServerRandom=\"MDEyMzQ1Njc4OWFiY2RlZg==\" RestrictRegExp=\"([!-~]+)\" IntensityRegExp=\"(^[!-~]*[A-Za-z]+[!-~]*[0-9]+[!-~]*$)|(^[!-~]*[0-9]+[!-~]*[A-Za-z]+[!-~]*$)\">";
    document.getElementById("FakeSecEditBox2").innerHTML += "<div class=\"lock_tips\" id=\"caps_lock_tips2\" style=\"display: none; top: 135px; left: 120px; \"><span class=\"lock_tips_row\"></span> <span>大写锁定已打开</span></div>";

    var extensionVer = "";
    var hostVer = "";
    var SecEdit1 = new nmSecEditCtl("SecEditBox1");
    var SecEdit2 = new nmSecEditCtl("SecEditBox2");

    document.getElementById('SecEditBox1').onkeypress = detectCapsLock;
    document.getElementById('SecEditBox2').onkeypress = detectCapsLock;

    nmSecEditCtl.Connect()
        .then(function () {
            return SecEdit1.init();
        })
        .then(function () {
            return SecEdit2.init();
        })
        .then(function (response) {
            SetDisabled("SecEditBox1", false);
            SetDisabled("SecEditBox2", false);
        })
        .catch(function (response) {
            alert(response.result);
        });
}

LoadObj();
