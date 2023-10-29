/* @(#) $Id: viewPKCS10CSR.js,v 1.33 2011/03/22 04:04:14 subrata Exp $ */

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



/*
const nsIFilePicker = Components.interfaces.nsIFilePicker;
const nsFilePicker = "@mozilla.org/filepicker;1";
*/
const nsIDialogParamBlock = Components.interfaces.nsIDialogParamBlock;
const nsDialogParamBlock = "@mozilla.org/embedcomp/dialogparam;1";

var gPkcs10CSRWindowElem;
var pkcs10CSRDataElem;
var pkcs10CSRDataCaptionElem;
var pkcs10CSROutFilePickerElem;
var pkcs10CSRInFilePickerElem;
var caServerTypeElem;
var caServerCertSignURLElem;
var caServerIssuerSubjectDNElem;
var caServerIssuerAliasElem;
var saveButtonElem;
var cancelButtonElem;

var pkcs10CSRData = "";
var userNickName = null;
var sentKeyToCAServer = false;

var gParams = null;

function initViewPKCS10CSRWin()
{
    if (window.arguments && window.arguments[0]) {
    	gParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);
    	pkcs10CSRData = gParams.GetString(0);
    	userNickName = gParams.GetString(1);
    }

    gPkcs10CSRWindowElem = document.getElementById('uploadCSRAndGetSignedCert');

    saveButtonElem = document.getElementById('SaveButton');
    cancelButtonElem = document.getElementById('CancelButton');

    pkcs10CSRDataCaptionElem = document.getElementById('keymgr.cert.csr.msg.pkcs10.view.pkcs10CSRData.caption');
    if (userNickName != null) {
	pkcs10CSRDataCaptionElem.label = "CSR Data for " + userNickName;
    }
    else {
    	userNickName = "DummyUser";
    }



    pkcs10CSRDataElem = document.getElementById('keymgr.cert.csr.msg.pkcs10.view.pkcs10CSRData');
    pkcs10CSRDataElem.value = pkcs10CSRData;

    pkcs10CSROutFilePickerElem = document.getElementById('keymgr.cert.csr.msg.pkcs10.view.file.path');
    pkcs10CSRInFilePickerElem = document.getElementById('keymgr.cert.csr.msg.pkcs10.view.infile.path');
    if (!gParams) {
	pkcs10CSRInFilePickerElem.hidden = false;
	saveButtonElem.hidden = true;
	cancelButtonElem.hidden = true;
    }

    caServerTypeElem = document.getElementById("keymgr.cert.csr.msg.pkcs10.view.ca.server.type");
    caServerCertSignURLElem = document.getElementById("keymgr.cert.csr.msg.pkcs10.view.ca.server.url");
    caServerIssuerSubjectDNElem = document.getElementById("keymgr.cert.csr.msg.pkcs10.view.issuer.subjdn");
    caServerIssuerAliasElem = document.getElementById("keymgr.cert.csr.msg.pkcs10.view.issuer.alias");


    sentKeyToCAServer = false;

    initDefaultCAServerURLList();

    // initCAServerTab();
}

function initDefaultCAServerURLList()
{
    var defaultCAServerURLList = [
	/*
    	"http://localhost:18080/certdemo/pki/pkcs10/uploadCSRAndSignCertByMsCA.jsp", 
    	"http://gemstar.usae.avaya.com:18080/certdemo/pki/pkcs10/uploadCSRAndSignCertByCA.jsp",
	"http://135.9.71.17/certsrv/certfnsh.asp",
	*/
    	"http://localhost:18080/certdemo/pki/pkcs10/uploadCSRAndSignCertByCA.jsp"
	];
    var i = 0;
    for (i = 0; i < defaultCAServerURLList.length; i++) {
    	var caServerURL = defaultCAServerURLList[i];
	caServerCertSignURLElem.value = caServerURL;
	caServerFieldAutoCompleteAction(caServerCertSignURLElem);
    }
    caServerCertSignURLElem.value = "";

    // Initialize CA Server Type 
    caServerTypeElem = document.getElementById("keymgr.cert.csr.msg.pkcs10.view.ca.server.type");
    var caServerDefaultType = getPrefValue((caServerTypeElem.id + ".default"), "String");
    if (caServerDefaultType == null) {
    	caServerDefaultType = "pkcs10CA";
    }
    var caServerTypeSelectedItemId = caServerTypeElem.id + "." + caServerDefaultType;
    var caServerTypeSelectedItemElem = document.getElementById(caServerTypeSelectedItemId);
    if (caServerTypeSelectedItemElem != null) {
	caServerTypeElem.selectedItem = caServerTypeSelectedItemElem;
    }
    else {
    	// alert("loginToCAServerBefore(): couldn't find element : " + caServerTypeSelectedItemId);
    	dump("setFormCAServerInfo(): couldn't find element : " + caServerTypeSelectedItemId + "\n");
    }

    // Initialize CA Server URL 
    caServerCertSignURLElem = document.getElementById("keymgr.cert.csr.msg.pkcs10.view.ca.server.url");
    // var caServerDefaultURL = getPrefValue((caServerCertSignURLElem.id + ".default"), "String");
    var caServerDefaultURL = getPrefValue((caServerCertSignURLElem.id + "." + caServerDefaultType), "String");
    if (caServerDefaultURL == null) {
	caServerDefaultURL = "";
    }
    caServerCertSignURLElem.value = caServerDefaultURL;
}

function handleCertIssuerTypeChange(selectedIssuerTypeElem, issuerTypeElem)
{
    var caServerType = selectedIssuerTypeElem.value;
    var caServerDefaultURL = getPrefValue((caServerCertSignURLElem.id + "." + caServerType), "String");
    if (caServerDefaultURL == null) {
    	caServerDefaultURL = "";
    }
    // formCAServerURLElem = document.getElementById("keymgr.createAvProdCert.wizard.page.issuer.serverURL");
    caServerCertSignURLElem.value = caServerDefaultURL;
}

function onLoad()
{
}

function onClose()
{
}

function onCancel()
{
    if (!gParams) {
    	// window.close();
    	return;
    }

    if (sentKeyToCAServer) {
    	gParams.SetInt(0, 1);
    }
    else {
    	gParams.SetInt(0, 0);
    }
    window.close();
}

function loadCSRInFile()
{
    dump("loadCSRInFile():....................Start.\n");

    if (pkcs10CSRInFilePickerElem.file) {
    	pkcs10CSRDataElem.value = pkcs10CSRInFilePickerElem.readFile();
    }

    dump("loadCSRInFile():....................End.\n");
}

function doSavePKCS10CSR()
{
    // dump("doSaveCSR():....................Start.\n");

    var csrOutFile = savePKCS10CSRToLocalFS();
    if (!gParams) {
	return;
    }
    if (csrOutFile == null) {
    	gParams.SetInt(0, 0);
    	window.close();
	return;
    }

    gParams.SetInt(0, 1);
    window.close();

    // dump("doSaveCSR():....................End.\n");
}

/* nsIFile */
function savePKCS10CSRToLocalFS()
{

    var csrFileName = userNickName + "_pkcs10_csr_base64.p10";

    pkcs10CSROutFilePickerElem.defaultFileName = csrFileName;
    var /* nsIFile */ csrFile = pkcs10CSROutFilePickerElem.selectFile();
    if (csrFile == null) {
    	return null;
    }
    try {
	pkcs10CSROutFilePickerElem.saveFile(pkcs10CSRDataElem.value);
    } catch (ex) {
    	dump("savePKCS10CSRToLocalFS(): pkcs10CSROutFilePickerElem.saveFile() failed - " + ex);
	return null;
    }
    return csrFile;
}

function doSaveAndSendPKCS10CSRToCA()
{
    // dump("\n");
    // dump("doSaveAndSendPKCS10CSRToCA():....................Start.\n");

    var csrFileName = userNickName + "_pkcs10_csr_base64.p10";
    pkcs10CSROutFilePickerElem.defaultFileName = csrFileName;
    var /* nsIFile */ csrFile = pkcs10CSROutFilePickerElem.selectFile();
    if (csrFile == null) {
        if (!gParams) {
	    return;
        }
    	gParams.SetInt(0, 0);
    	window.close();
    	return;
    }
    saveAndSendPKCS10CSRToCA(csrFile);
    // window.close();

    // dump("doSaveAndSendPKCS10CSRToCA():....................End.\n");
    // dump("\n");
}

function doSendPKCS10CSRToCA()
{
    // dump("\n");
    dump("viewPKCS10CSR.js(): doSendPKCS10CSRToCA():............Start.\n");

    var csrFileName = userNickName + "_pkcs10_csr_base64.p10";

    // pkcs10CSROutFilePickerElem.fileDisplayDirPath = "KeyManager/CSRTmp";
    pkcs10CSROutFilePickerElem.defaultFileName = csrFileName;
    var /* nsIFile */ tempCSRFile = pkcs10CSROutFilePickerElem.autoSelectFile();
    if (tempCSRFile == null) {
        if (!gParams) {
	    return;
        }
    	gParams.SetInt(0, 0);
	window.close();
    	return;
    }

    saveAndSendPKCS10CSRToCA(tempCSRFile);

    // window.close();

    // dump("viewPKCS10CSR.js(): doSendPKCS10CSRToCA():............End.\n");
    // dump("\n");
}

function saveAndSendPKCS10CSRToCA(/* nsIFile */ csrOutFile)
{
    // dump("viewPKCS10CSR.js(): saveAndSendPKCS10CSRToCA():.......Start.\n");

    var gParams = null;
    if (window.arguments && window.arguments[0]) {
    	gParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);
    }
    try {
	pkcs10CSROutFilePickerElem.saveFile(pkcs10CSRDataElem.value);
    } catch (ex) {
    	dump("saveAndSendPKCS10CSRToCA(): pkcs10CSROutFilePickerElem.saveFile() failed - " + ex + "\n");
        if (!gParams) {
	    return;
        }
    	gParams.SetInt(0, 0);
    	window.close();
	return;
    }

    sendPKCS10CSRFileToCA(csrOutFile);

    // dump("viewPKCS10CSR.js(): saveAndSendPKCS10CSRToCA():.........End.\n");
}

var msCryptoUploadCSRFormId = "MSCryptoUploadCSRAndSignCertForm";

var uploadFileFormId = "UploadCSRAndSignCertForm";
var uploadFormFileItemId = "Pkcs10CSRFile";

var uploadCSRAndSignCertResultIFrameId = "UploadCSRAndSignCertResultIFrame";

function sendPKCS10CSRFileToCA(/* nsIFile */ csrInFile)
{
    // dump("viewPKCS10CSR.js(): sendPKCS10CSRFileToCA():........Start.\n");

    var caServerCertSignURL = caServerCertSignURLElem.value;
    var csrUploadURIStr = caServerCertSignURL;
    dump("viewPKCS10CSR.js(): csrUploadURIStr: " + csrUploadURIStr + "\n");

    uploadCSRFileUsingCAForm(
		csrInFile,
		csrUploadURIStr,
                uploadCSRAndSignCertResultIFrameId
                );

    // dump("viewPKCS10CSR.js(): sendPKCS10CSRFileToCA():...........End.\n");
}

function uploadCSRFile(/* nsIFile */ csrInFile, /* String */ csrUploadURIStr)
{

    // dump("viewPKCS10CSR.js(): uploadCSRFile():...........Start.\n");

    var /* HTMLFrameElement */ csrUploadResultFrame = null;
    // csrUploadResultFrame = document.getElementById(uploadCSRAndSignCertResultIFrameId);
    // var xulDocWin = csrUploadResultFrame.contentWindow;
    // var xulDocument = csrUploadResultFrame.contentDocument;

    uploadCSRFileUsingCAForm(
		csrInFile,
		csrUploadURIStr,
                uploadCSRAndSignCertResultIFrameId
                );

    // dump("viewPKCS10CSR.js(): uploadCSRFile():............End.\n");
}

function uploadCSRFileUsingCAForm(/* nsIFile*/ inLocalFile,
                                /* String */ fileUploadURIStr,
                                /* String */ targetRespWindow
                                )
{
    if (caServerTypeElem.selectedItem.value == "pkcs10CA") {
    	uploadCSRFileUsingPKCS10CAForm(
		inLocalFile,
		fileUploadURIStr,
                targetRespWindow
                );
    }
    else if (caServerTypeElem.selectedItem.value == "msCertService") {
    	uploadCSRFileUsingMsCryptoForm(
		inLocalFile,
		fileUploadURIStr,
                targetRespWindow
                );
    }
    else {
   	alert("CA Services : " + caServerTypeElem.selectedItem.value + " is not supported yet.");
    }
}

function uploadCSRFileUsingPKCS10CAForm(/* nsIFile*/ inLocalFile,
                                /* String */ fileUploadURIStr,
                                /* String */ targetRespWindow
                                )
{

    dump("viewPKCS10CSR.js(): uploadCSRFileUsingPKCS10CAForm():............Start.\n");

    dump("uploadCSRFileUsingPKCS10CAForm(): inLocalFile: " + inLocalFile.path + "\n");
    dump("uploadCSRFileUsingPKCS10CAForm(): fileUploadURIStr: " + fileUploadURIStr + "\n");
    dump("uploadCSRFileUsingPKCS10CAForm(): targetRespWindow: " + targetRespWindow + "\n");


    var uploadFileFormElem = document.getElementById(uploadFileFormId);
    if (uploadFileFormElem == null) {
        alert(uploadFileFormId + " form XUL element not found.");
        return;
    }

    // uploadFileFormElem.ProxyCertFile.value = inLocalFile.path;
    var thisCertFile = document.getElementById(uploadFormFileItemId);
    if (thisCertFile == null) {
        alert(uploadFormFileItemId + " file XUL element not found.");
        return;
    }
    // Assign the signed cert file to the "file-type" input variable in the form
    thisCertFile.value = inLocalFile.path;

    uploadFileFormElem.issuerSubjectDN = caServerIssuerSubjectDNElem.value;
    uploadFileFormElem.issuerAlias = caServerIssuerAliasElem.value;

    // Assign the POST JSP for uploading the cert file. The JSP also
    // imports the file into the keystore for the proxy certifcate.
    uploadFileFormElem.action = fileUploadURIStr;
    if (targetRespWindow) {
        uploadFileFormElem.target = targetRespWindow;
    }

    dump("uploadCSRFileUsingPKCS10CAForm(): uploadFileFormElem.enctype : " + uploadFileFormElem.enctype + "\n");
    dump("uploadCSRFileUsingPKCS10CAForm(): uploadFileFormElem.action : " + uploadFileFormElem.action + "\n");
    dump("uploadCSRFileUsingPKCS10CAForm(): uploadFileFormElem.length : " + uploadFileFormElem.length + "\n");
    for (var i = 0; i < uploadFileFormElem.length; i++) {
        dump("uploadCSRFileUsingPKCS10CAForm(): uploadFileFormElem[" + i + "] : " +
                uploadFileFormElem[i].name + " = " + uploadFileFormElem[i].value  +
                                " (" + uploadFileFormElem[i].type + ")" + "\n"
				);
    }

    // send the form to the server
    uploadFileFormElem.submit();
    sentKeyToCAServer = true;

    // Save the URL in the form-history
    caServerFieldAutoCompleteAction(caServerCertSignURLElem);

    dump("viewPKCS10CSR.js(): uploadCSRFileUsingPKCS10CAForm():............End.\n");
}

function uploadCSRFileUsingMsCryptoForm(/* nsIFile*/ inLocalFile,
                                /* String */ fileUploadURIStr,
                                /* String */ targetRespWindow
                                )
{

    dump("viewPKCS10CSR.js(): uploadCSRFileUsingMsCryptoForm():............Start.\n");

    dump("uploadCSRFileUsingMsCryptoForm(): inLocalFile: " + inLocalFile.path + "\n");
    dump("uploadCSRFileUsingMsCryptoForm(): fileUploadURIStr: " + fileUploadURIStr + "\n");
    dump("uploadCSRFileUsingMsCryptoForm(): targetRespWindow: " + targetRespWindow + "\n");


    var uploadFileFormElem = document.getElementById(msCryptoUploadCSRFormId);
    if (uploadFileFormElem == null) {
        alert(msCryptoUploadCSRFormId + " form XUL element not found.");
        return;
    }

    var L_SavedReqCert_Text="Saved-Request Certificate";

    // set request
    uploadFileFormElem.CertRequest.value	= pkcs10CSRDataElem.value;

    // set defaults for values we need on install
    uploadFileFormElem.TargetStoreFlags.value	= 0; // 0=Use default (=user store), but ignored when saving cert.
    uploadFileFormElem.SaveCert.value		= "yes";
    uploadFileFormElem.Mode.value		= "newreq";
    uploadFileFormElem.FriendlyType.value	= L_SavedReqCert_Text;
    // append the local date to the type
    uploadFileFormElem.FriendlyType.value	+= " ("+(new Date()).toLocaleString()+")";
    //not created by xenroll, not supported
    uploadFileFormElem.ThumbPrint.value		= "";
    uploadFileFormElem.CertAttrib.value		= "\r\n";
    // uploadFileFormElem.CertAttrib.value		+= "UserAgent:Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.3) Gecko/20060426 Firefox/1.5.0.3\r\n";;

    // Assign the POST JSP for uploading the cert file. The JSP also
    // imports the file into the keystore for the proxy certifcate.
    uploadFileFormElem.action = fileUploadURIStr;
    if (targetRespWindow) {
        uploadFileFormElem.target = targetRespWindow;
    }

    dump("uploadCSRFileUsingMsCryptoForm(): uploadFileFormElem.enctype : " + uploadFileFormElem.enctype + "\n");
    dump("uploadCSRFileUsingMsCryptoForm(): uploadFileFormElem.action : " + uploadFileFormElem.action + "\n");
    dump("uploadCSRFileUsingMsCryptoForm(): uploadFileFormElem.length : " + uploadFileFormElem.length + "\n");
    for (var i = 0; i < uploadFileFormElem.length; i++) {
        dump("uploadCSRFileUsingMsCryptoForm(): uploadFileFormElem[" + i + "] : " +
                uploadFileFormElem[i].name + " = " + uploadFileFormElem[i].value  +
                                " (" + uploadFileFormElem[i].type + ")"
                                 + "\n");
    }

    // send the form to the server
    uploadFileFormElem.submit();
    sentKeyToCAServer = true;

    // Save the URL in the form-history
    caServerFieldAutoCompleteAction(caServerCertSignURLElem);

    dump("viewPKCS10CSR.js(): uploadCSRFileUsingMsCryptoForm():............End.\n");
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

    if (caServerType == "pkcs10CA") {
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

    caServerURLObj.caServerURL		= caServerHomeURL;
    caServerURLObj.caServerLoginURL	= caServerLoginURL;
    caServerURLObj.caServerDownloadCertChainURL = caServerDownloadCertChainURL;
    caServerURLObj.caServerDownloadSignedCertURL = caServerDownloadSignedCertURL;

    return caServerURLObj;
}

function getCACertChain()
{
    // caServerCertSignURLElem = document.getElementById("keymgr.cert.csr.msg.pkcs10.view.ca.server.url");
    var caServerURLObj = getCAServerLoginURL(
    				caServerCertSignURLElem.value,
				"form",
				caServerTypeElem.selectedItem.value
				);
    if (caServerURLObj == null) {
    	return false;
    }

    var /* HTMLFrameElement */ caServerResponseConsole = document.getElementById(uploadCSRAndSignCertResultIFrameId);
    if (caServerResponseConsole == null) {
    	return false;
    }
    // createCertWizardLoginConsole.contentWindow.location = caServerURL;
    caServerResponseConsole.contentWindow.location = caServerURLObj.caServerDownloadCertChainURL;

    return true;
}


function loginToCAServer()
{
    var caServerCertSignURL = caServerCertSignURLElem.value;
    if (caServerCertSignURL == "") {
    	return false;
    }
    
    var caServerURLObj = getCAServerLoginURL(
    				caServerCertSignURL,
				"form",
				caServerTypeElem.selectedItem.value
				);
    if (caServerURLObj == null) {
    	return false;
    }

    // alert("caServerURL: " + caServerURLObj.caServerURL);
    // alert("caServerCertSignURL: " + caServerURLObj.caServerCertSignURL);
    var retVal = loginToWebServer(caServerURLObj.caServerLoginURL, caServerURLObj.caServerURL);

    var caServerType = caServerTypeElem.selectedItem.value;
    setPrefValue((caServerTypeElem.id + ".default"), "String", caServerType);
    setPrefValue((caServerCertSignURLElem.id + "." + caServerType), "String", caServerCertSignURLElem.value);

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


function handleCAServerFieldChange(textBoxElem)
{
}

function caServerFieldAutoCompleteAction(aSrcTextBoxElem)
{
    var formFieldKey = aSrcTextBoxElem.id;
    var formFieldValue = aSrcTextBoxElem.value;
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

