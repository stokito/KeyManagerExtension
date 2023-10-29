/* @(#) $Id: genKeyAndEnrollCertWithSignedSPKAC.js,v 1.3 2011/03/22 04:04:13 subrata Exp $ */

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is  Avaya Labs Research, Avaya Inc. Code.
 *
 * The Initial Developer of the Original Code is
 * Subrata Mazumdar, Avaya Labs Research, Avaya Inc.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Subrata Mazumdar (mazum@avaya.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


const nsIDialogParamBlock = Components.interfaces.nsIDialogParamBlock;
const nsDialogParamBlock = "@mozilla.org/embedcomp/dialogparam;1";

var gSignedSpkacURIParams = "";
var gCAServerURL = 'http://localhost:18080/certdemo/pki/crmf/cgi-bin/CA/signUserCert.jsp'

var gSignedSPKACUploadFormIframeId = "SignedSPKACUploadFormIFrame";
var gSignedSPKACUploadFormId = "SignedSPKACUploadForm";
var gSignedSPKACUploadFormResultTargetId = "SignedSPKACUploadFormResultIFrame";

var gUploadSignedSPKACWindowElem;
var gCAServerCertSignURLElem;
var gCAServerIssuerSubjectDNElem;

var gSentKeyToCAServer = false;

function GenKeyAndEnrollCertWithSignedSPKAC_initOnload()
{
    var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);

    var encodedCSRFormData = dialogParams.GetString(0);
    var keyType = dialogParams.GetString(1);
    var keyParamsArg = dialogParams.GetString(2);

    // dump("uploadSignedSPKACForm.js:encodedCSRFormData:\n" + encodedCSRFormData + "\n");

    gUploadSignedSPKACWindowElem = document.getElementById('uploadSignedSPKACForm');
    var challengeElem = document.getElementById('keymgr.cert.csr.msg.spkac.challenge');

    gCAServerCertSignURLElem = document.getElementById("keymgr.cert.csr.msg.spkac.view.ca.server.url");
    gCAServerIssuerSubjectDNElem = document.getElementById("keymgr.cert.csr.msg.spkac.view.issuer.subjdn");

    initDefaultCAServerURLList();
    if (gCAServerCertSignURLElem.value != "") {
    	gCAServerURL = gCAServerCertSignURLElem.value;
    }


    // For nore info: https://developer.mozilla.org/En/HTML/HTML_Extensions/KEYGEN_Tag 

    var moz_type = "_moz-type";
    var keygenvalue = "-mozilla-keygen";
    var keyChallenge = challengeElem.value;
    var keyparams = "";

    if (keyType == "dsa") {
	keyparams = keyParamsArg;
	if (!keyparams) {
    	    keyparams = "MIIBHwKBgQDMQJZuHRQA8pm1Lt4PUiQa8BmeV997t8FhSobt9JrJAuaZXGh0NArRN6fnHLiQlprSagw/MN8uc8NzEzoR8P+aqKtd1otL5gUufssJ/31zpiNclVcdLtdRZ7QXHKNX0Wb3NfwjELIGFeKYmk5ukgNvUaZb3rmVPAvcW7BlnpFLZQIVAIiakC49yfeFCj++EWI7cIAiZOTzAoGBAKD375z6E8j1FrE2IrzsXrUxQwXQby0Nw1FLrs4BW7QRgt1df8D3ykPoxHZQ9zdNfr1bszcAd0gtzsOVPNQmd6/g63Lgq48zp/2aGFem7EqsqBPzygFIBNghjhZsz/K/mh4K4Ba56On8UDCaUb0je42K0atssBj6oj1dk89CwFUq";
	}
    }
    else if (keyType == "ec") {
	keyparams = keyParamsArg;
	if (!keyparams) {
    	    keyparams = "secp256r1";
	}
    }
    var keygen =  "<keygen id=\"keygen\" name=\"key\"\n" +
    			"        " + moz_type + "=\"" + keygenvalue + "\"\n" +
    			"        " + "challenge=\"" + keyChallenge + "\"\n" +
			"        " + "KEYTYPE=\"" + keyType + "\"\n" +
			"        " + ((keyparams != "")?("KEYPARAMS=\"" + keyparams + "\" ") : " ") + "\n" + 
			"        " + "/>\n";
    var spkacFormData = decodeURIComponent(encodedCSRFormData);
    // var spkacFormData = "";

    // dump("uploadSignedSPKACForm.js:spkacFormData:\n" + spkacFormData + "\n");

    var formDocHtml = 
    '<html>\n' +
    '<BODY TEXT="#000000" LINK="#000000" VLINK="#000000" ALINK="#FF0000" BGCOLOR="#FFFFFF">\n' +
    '  <form\n' + 
    '    id="' + gSignedSPKACUploadFormId + '"\n' + 
    '    name="' + gSignedSPKACUploadFormId + '"\n' + 
    '    method="post"\n' +
    '    target="' + gSignedSPKACUploadFormResultTargetId + '"\n' + 
    '    action="' + gCAServerURL + '"\n' +
    '    >\n' +
    '    Select size for your key:\n    ' + keygen + '' +
    spkacFormData +
    '  </form>\n' +
    '  <p/>\n' +
    '</body>\n' +
    '</html>\n';

    dump("uploadSignedSPKACForm.js: formDocHtml: \n" + formDocHtml + "\n");

    var /* HTMLFrameElement */ signedSPKACUploadFormFrame = document.getElementById(gSignedSPKACUploadFormIframeId);
    var /* HTMLDocument */ signedSPKACUploadFormDoc = signedSPKACUploadFormFrame.contentDocument;
    // signedSPKACUploadForm.action = gCAServerURL;
    signedSPKACUploadFormDoc.write(formDocHtml);
    signedSPKACUploadFormDoc.close();

    gSentKeyToCAServer = false;

    // doGenerateCRMFRequestTest("cn=xxx,o=abc.com", keyType, parseInt("1024"));


    handleChallengeChange(challengeElem);

}


function initDefaultCAServerURLList()
{
    // TODO: Load this list from the perefernce
    var defaultCAServerURLList = [
	/*
        "http://quasar.usae.avaya.com:18080/certdemo/pki/crmf/cgi-bin/CA/signUserCert.jsp",
        "http://gemstar.usae.avaya.com:18080/certdemo/pki/crmf/cgi-bin/CA/signUserCert.jsp",
	"http://135.9.71.17/certsrv/certfnsh.asp",
	*/
        "http://localhost:18080/certdemo/pki/crmf/cgi-bin/CA/signUserCert.jsp"
	];
    var i = 0;
    for (i = 0; i < defaultCAServerURLList.length; i++) {
    	var caServerURL = defaultCAServerURLList[i];
	gCAServerCertSignURLElem.value = caServerURL;
	caServerFieldAutoCompleteAction(gCAServerCertSignURLElem);
    }
    gCAServerCertSignURLElem.value = "";

    // Initialize CA Server URL 
    var caServerDefaultURL = getPrefValue((gCAServerCertSignURLElem.id + ".default"), "String");
    // var caServerDefaultURL = getPrefValue((gCAServerCertSignURLElem.id + "." + caServerDefaultType), "String");
    if (caServerDefaultURL == null) {
    	// caServerDefaultURL = defaultCAServerURLList[0];
	caServerDefaultURL = "";
    }
    gCAServerCertSignURLElem.value = caServerDefaultURL;
}

function handleChallengeChange(aChallengeElem, ev)
{
    // aChallengeElem.value = trim(aChallengeElem.value);
    var /* HTMLFrameElement */ signedSPKACUploadFormFrame = document.getElementById(gSignedSPKACUploadFormIframeId);
    if (!signedSPKACUploadFormFrame) {
    	return;
    }
    var /* HTMLDocument */ signedSPKACUploadFormDoc = signedSPKACUploadFormFrame.contentDocument;
    var /* HTMLFormElement */ uploadFormElem = signedSPKACUploadFormDoc.getElementById(gSignedSPKACUploadFormId);
    if (!uploadFormElem) {
    	uploadFormElem = signedSPKACUploadFormDoc.form[gSignedSPKACUploadFormId];
    }
    // var keyGenElem = uploadFormElem.getElementById("keygen");
    var keyGenElem = signedSPKACUploadFormDoc.getElementById("keygen");
    if (!keyGenElem) {
        return;
    }
    keyGenElem.setAttribute("challenge", aChallengeElem.value);
}

function caServerFieldAutoCompleteAction(aSrcTextBoxElem)
{
    var formFieldKey = aSrcTextBoxElem.id;
    var formFieldValue = aSrcTextBoxElem.value;

    if (!formFieldKey || (formFieldValue == "")) {
    	return;
    }
    if (formFieldValue == "") {
    	return;
    }

    var formhistory = null;
    if ("nsIFormHistory" in Components.interfaces){
        formhistory = Components.classes["@mozilla.org/satchel/form-history;1"].
        			getService(Components.interfaces.nsIFormHistory);
    }
    else if ("nsIFormHistory2" in Components.interfaces){
        formhistory = Components.classes["@mozilla.org/satchel/form-history;1"].
        			getService(Components.interfaces.nsIFormHistory2);
    }
    if (!formhistory) {
    	return;
    }

    // use the same value for key as "autocompletesearchparam" in textbox:
    formhistory.addEntry(formFieldKey, formFieldValue);

    // do the rest of the things you need to do with query
}

function handleCAServerFieldChange(textBoxElem)
{
    caServerFieldAutoCompleteAction(textBoxElem);
}

function onLoad()
{
}

function onCancel()
{
    var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);
    if (gSentKeyToCAServer) {
    	dialogParams.SetInt(0, 1);
    }
    else {
    	dialogParams.SetInt(0, 0);
    }
    window.close();
}

function onClose()
{
}

function getCAServerLoginURL(aCAServerCertSignURL, reqSrcType, caServerType)
{
    // TODO: A design pattern for CA/RA server's base URL, log-on URL, CA-cert's retrieval URL
    //      that can be retrived from pereferences.
    if (aCAServerCertSignURL == "") {
	alert("aCAServerCertSignURL is missing.");
    	return null;
    }

    var loginURL = null;
    var caServerHomeURL;
    var caServerLoginURL;
    var caServerDownloadCertChainURL;
    var caServerDownloadSignedCertURL;


    var caServerURLObj = new Object();
    caServerURLObj.aCAServerCertSignURL = aCAServerCertSignURL;

    var urlItems = aCAServerCertSignURL.split("/"); 
    caServerHomeURL = urlItems[0] + "//" + urlItems[2] + "/" + urlItems[3];

        if (urlItems.length < 4) {
	    alert("Badly formatted caServer CertSign URL.");
	    return null;
        }
        if (reqSrcType != null) {
    	    caServerLoginURL = caServerHomeURL + "/login/?reqSrcType=" + reqSrcType;
        }
        else {
    	    caServerLoginURL = caServerHomeURL + "/login/";
        }
        caServerDownloadCertChainURL = caServerHomeURL + "/pki/pkcs10/getCACertChain.jsp";
	caServerDownloadSignedCertURL = caServerHomeURL;

    /*
    if (caServerType == "pkcs10CA") {
    }
    else if (caServerType == "msCertService") {
        var caServerBaseURL = caServerHomeURL;
        for (var i = 4; i < (urlItems.length -1); i++) {
    	    caServerBaseURL += "/" + urlItems[i];
        }
        caServerLoginURL = caServerBaseURL + "/certrqxt.asp";
        caServerDownloadCertChainURL = caServerBaseURL + "/certcarc.asp";
	caServerDownloadSignedCertURL = caServerBaseURL + "/certckpn.asp";
    }
    else {
   	alert("CA Services : " + caServerType + " is not supported yet.");
	return null;
    }
    */

    caServerURLObj.caServerURL		= caServerHomeURL;
    caServerURLObj.caServerLoginURL	= caServerLoginURL;
    caServerURLObj.caServerDownloadCertChainURL = caServerDownloadCertChainURL;
    caServerURLObj.caServerDownloadSignedCertURL = caServerDownloadSignedCertURL;

    return caServerURLObj;
}

function loginToCAServer()
{
    var caServerCertSignURL = gCAServerCertSignURLElem.value;
    if (caServerCertSignURL == "") {
    	return false;
    }
    
    var caServerURLObj = getCAServerLoginURL(
    				caServerCertSignURL,
				"form"
				);
    if (caServerURLObj == null) {
    	return false;
    }

    var retVal = loginToWebServer(caServerURLObj.caServerLoginURL, caServerURLObj.caServerURL);

    setPrefValue((gCAServerCertSignURLElem.id + ".default"), "String", gCAServerCertSignURLElem.value);

    return retVal;
}

function loginToWebServer(webServerLoginURL, webServerHomeURL)
{
    var params = Components.classes[nsDialogParamBlock].createInstance(nsIDialogParamBlock);
    params.SetInt(0, 2);
    params.SetString(0, webServerLoginURL);
    params.SetString(1, webServerHomeURL);

    window.setCursor('wait');
    var loginConsoleWin = window.openDialog('chrome://keymanager/content/tools/genkeycsr/generateCSRCAServerLoginConsole.xul', "",
                    			'chrome,centerscreen,resizable,modal', params);
    window.setCursor('auto');
    /*
    while ((!loginConsoleWin.closed) && (loginConsoleWin.loginStatus == null)) {
    }
    if (loginConsoleWin.loginStatus == true) {
    	return true;
    }
    return false;
    // return loginConsoleWin.loginStatus;
    */

    if (params.GetInt(0) == 0) { // Selected Cancel or failed.
    	return false;
    }
    return true;
}


function doSendSignedSPKACToCA()
{

    dump("uploadSignedSPKACForm.js: doSendSignedSPKACToCA():....................Start.\n");
    var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);

    var /* HTMLFrameElement */ signedSPKACUploadFormFrame = document.getElementById(gSignedSPKACUploadFormIframeId);
    var /* HTMLDocument */ signedSPKACUploadFormDoc = signedSPKACUploadFormFrame.contentDocument;
    var /* HTMLFormElement */ uploadForm = signedSPKACUploadFormDoc.getElementById(gSignedSPKACUploadFormId);
    if (uploadForm == null) {
    	uploadForm = signedSPKACUploadFormDoc.form[gSignedSPKACUploadFormId];
    }

    var caServerCertSignURL = gCAServerCertSignURLElem.value;
    uploadForm.action = caServerCertSignURL;
    // uploadForm.enctype = "application/x-www-form-urlencoded";

    uploadForm.submit();
    sentKeyToCAServer = true;

    dialogParams.SetInt(0, 1);
    // window.close();
    dump("uploadSignedSPKACForm.js: doSendSignedSPKACToCA():....................End.\n");
}

