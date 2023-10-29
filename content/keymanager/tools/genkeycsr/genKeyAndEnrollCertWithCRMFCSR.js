/* @(#) $Id: genKeyAndEnrollCertWithCRMFCSR.js,v 1.19 2011/03/22 04:04:13 subrata Exp $ */

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

var crmfReqURIParams = "";
// var gCAServerURL = 'http://quasar.home.mazumdar.net:28000/caserver/cgi-bin/CA/signUserCert.jsp'
// var gCAServerURL = 'http://quasar.usae.avaya.com:28000/caserver/cgi-bin/CA/signUserCert.jsp'
// var gCAServerURL = 'http://localhost:28000/caserver/cgi-bin/CA/signUserCert.jsp'
var gCAServerURL = 'http://localhost:18080/proxycertdemo/pki/crmf/cgi-bin/CA/signUserCert.jsp'

var crmfCSRUploadFormIframeId = "CrmfCSRUploadFormIFrame";
var gCRMFCSRUploadFormId = "UploadCRMFCSRAndSignCertForm";
var crmfCSRUploadFormResultTargetId = "CrmfCSRUploadFormResultIFrame";

var gUploadCRMFCSRWindowElem;
var gCAServerCertSignURLElem;
var gCAServerIssuerSubjectDNElem;


var gCRMFCSRFormData;

var sentKeyToCAServer = false;

function initUploadCRMFCSRFormWin()
{
    var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);

    var subject = dialogParams.GetString(0);
    var keyType = dialogParams.GetString(1);
    var keyParamsArg = dialogParams.GetString(2);
    var encodedCSRFormData = dialogParams.GetString(3);

    // dump("uploadCRMFCSRForm.js:encodedCSRFormData:\n" + encodedCSRFormData + "\n");

    gUploadCRMFCSRWindowElem = document.getElementById('uploadCRMFCSRForm');

    var crmfCSRSDataElem = document.getElementById("keymgr.cert.csr.msg.crmf.view.csrData");
    gCAServerCertSignURLElem = document.getElementById("keymgr.cert.csr.msg.crmf.view.ca.server.url");
    // gCAServerIssuerSubjectDNElem = document.getElementById("keymgr.cert.csr.msg.crmf.view.issuer.subjdn");

    initDefaultCAServerURLList();
    if (gCAServerCertSignURLElem.value != "") {
    	gCAServerURL = gCAServerCertSignURLElem.value;
    }


    // For nore info: https://developer.mozilla.org/En/HTML/HTML_Extensions/KEYGEN_Tag 

    var keyparams = "";
    if (keyType == "rsa") {
        keyparams = "1024";
    }
    else if (keyType == "dsa") {
	keyparams = null;
    }
    else if (keyType == "ec") {
	keyparams = keyParamsArg;
	if (!keyparams) {
    	    keyparams = "secp256r1";
	}
    }

    gCRMFCSRFormData = decodeURIComponent(encodedCSRFormData);

    sentKeyToCAServer = false;

    doGenerateCRMFRequest(subject, keyType, keyparams);
}

var gCRMFObject = null;
function doGenerateCRMFRequest(/* String */ subject, /* String */ keyType, /* String */ aKeyParams)
{
    // For more info: https://developer.mozilla.org/En/JavaScript_crypto/GenerateCRMFRequest

    dump("uploadCRMFCSRForm.js: doGenerateCRMFRequest(): ......Start.\n");

    var reqDN = subject;		// argv[0]
    var regTokenArg = null;		// argv[1]
    var authenticatorArg = null;	// argv[2]
    var escrowCertArg = null; 		// argv[3]
    var jsCallbackFuncArg = "doGenerateCRMFRequestCB();"; // argv[4]
    var keySizeInt = 0;			// argv[5]
    var keyParams = null;		// argv[6]
    var keyGenAlg = null;		// argv[7]

    if (keyType == "rsa") {
    	keySizeInt = parseInt(aKeyParams);
    	keyParams = null;
    	keyGenAlg = "rsa-dual-use"; // "rsa-ex" | "rsa-sign"
    }
    else if (keyType == "dsa") {
    	keySizeInt = parseInt(aKeyParams);
    	keyParams = null;
    	keyGenAlg = "dsa-sign-nonrepudiation";
    }
    else if (keyType == "ec") {
	keySizeInt = 0;
    	// keyParams = "curve=secp256r1";
    	keyParams = "curve=" + aKeyParams;
	keyGenAlg = "ec-dual-use"; // ec-sign-nonrepudiation | ec-sign | ec-nonrepudiation | ec-ex
    }
    dump("uploadCRMFCSRForm.js: doGenerateCRMFRequest(): " + 
    					"subject: " + subject + " " + 
    					"keyType: " + keyType + " " + 
    					"keySize: " + keySizeInt + " " + 
					"keyParams: " + keyParams + " " + 
    					"keyGenAlg: " + keyGenAlg + " " + 
					"\n");

    try {
    	gCRMFObject = window.crypto.generateCRMFRequest(
			subject, 
			regTokenArg,
			authenticatorArg,
			escrowCertArg,
			jsCallbackFuncArg,
			keySizeInt, // must be of integer type
			keyParams,
			keyGenAlg
			);
			// - we can add as many triplet {keySize, keyParams, keyGenAlg} 
			//   as we want to the argument list. 
			// - keySize must be of integer type.
    } catch (ex) {
    	dump("uploadCRMFCSRForm.js: doGenerateCRMFRequest(): window.crypto.generateCRMFRequest() failed for keyType: " + keyType + " - ex:\n" + ex + "\n");
	return;
    }

    var crmfCSRSDataElem = document.getElementById("keymgr.cert.csr.msg.crmf.view.csrData");
    crmfCSRSDataElem.value = gCRMFObject.request;
    dump("doGenerateCRMFRequest(): gCRMFObject.request:\n" + gCRMFObject.request + "\n");

    dump("uploadCRMFCSRForm.js: doGenerateCRMFRequest(): ......End.\n");
}

function doGenerateCRMFRequestCB()
{
    dump("uploadCRMFCSRForm.js: doGenerateCRMFRequestCB(): ......Start.\n");
    /*
    if (typeof(gCRMFObject) != "undefined") {
    	dump("doGenerateCRMFRequestCB(): gCRMFObject.request:\n" + gCRMFObject.request + "\n");
    }
    */
    dump("uploadCRMFCSRForm.js: doGenerateCRMFRequestCB(): ......End.\n");
}


function initDefaultCAServerURLList()
{
    var defaultCAServerURLList = [
	/*
	"http://135.9.71.17/certsrv/certfnsh.asp",
        "http://quasar.usae.avaya.com:18080/certdemo/pki/crmf/cgi-bin/CA/signUserCert.jsp",
        "http://gemstar.usae.avaya.com:18080/certdemo/pki/crmf/cgi-bin/CA/signUserCert.jsp",
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


function onCancel()
{
    var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);
    if (sentKeyToCAServer) {
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


function getCAServerLoginURL(caServerCertSignURL, reqSrcType, caServerType)
{
    if (caServerCertSignURL == "") {
	alert("caServerCertSignURL is missing.");
    	return null;
    }

    var loginURL = null;
    var caServerHomeURL;
    var caServerLoginURL;
    var caServerDownloadCertChainURL;
    var caServerDownloadSignedCertURL;


    var caServerURLObj = new Object();
    caServerURLObj.caServerCertSignURL = caServerCertSignURL;

    var urlItems = caServerCertSignURL.split("/"); 
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

    caServerURLObj.caServerURL		= caServerHomeURL;
    caServerURLObj.caServerLoginURL	= caServerLoginURL;
    caServerURLObj.caServerDownloadCertChainURL = caServerDownloadCertChainURL;
    caServerURLObj.caServerDownloadSignedCertURL = caServerDownloadSignedCertURL;

    return caServerURLObj;
}

/*
function loginToCAServer()
{
    var caServerCertSignURL = gCAServerCertSignURLElem.value;
    var csrUploadURIStr = caServerCertSignURL;

    if (caServerCertSignURL == "") {
    	return;
    }
    caServerCertSignURL += "?login=true";

    var params = Components.classes[nsDialogParamBlock].createInstance(nsIDialogParamBlock);
    params.SetInt(0, 1);
    params.SetString(0, caServerCertSignURL);
    window.openDialog('chrome://keymanager/content/tools/genkeycsr/generateCSRCAServerLoginConsole.xul', "",
                    			'chrome,centerscreen,resizable,modal', params);
}
*/
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

    if (params.GetInt(0) == 0) { // Selected Cancel or failed.
    	return false;
    }
    return true;
}


function doSendCRMFCSRToCA()
{

    dump("uploadCRMFCSRForm.js: doSendCRMFCSRToCA():....................Start.\n");
    var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);

    var /* HTMLFormElement */ uploadForm = document.getElementById(gCRMFCSRUploadFormId);
    if (uploadForm == null) {
    	uploadForm = crmfCSRUploadFormDoc.form[gCRMFCSRUploadFormId];
    }

    var crmfReq = "key=" + xxx + 
    			+ gCRMFCSRFormData;
    uploadFileFormElem.crmfreq.value		= "";

    var caServerCertSignURL = gCAServerCertSignURLElem.value;
    uploadForm.action = caServerCertSignURL;
    // uploadForm.enctype = "application/x-www-form-urlencoded";

    uploadForm.submit();
    sentKeyToCAServer = true;

    dialogParams.SetInt(0, 1);
    // window.close();
    dump("uploadCRMFCSRForm.js: doSendCRMFCSRToCA():....................End.\n");
}


