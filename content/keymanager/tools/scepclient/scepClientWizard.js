/* @(#) $Id: scepClientWizard.js,v 1.37 2012/10/07 17:20:54 subrata Exp $ */

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

var gScepClientOverrideCACapEnabled = false;
var gScepClientOverrideCACapValue = "GetNextCACert\nPOSTPKIOperation\nSHA-1\nSHA-256\n";
var gScepClientGetCACapFormPostEnabled = false;
var gScepClientGetCertInitialTestEnabled = false;
var gScepClientAvDeviceProfileEnabled = false;

var gScepClientWizardElem;
var scepClientWizardButtonNextElem;
var scepClientWizardButtonBackElem;
var scepClientWizardButtonFinishElem;
var scepClientWizardButtonCancelElem;

var scepClientReqMsgTypeMenuListElem;

var scepClientGetCertInitialReqidMenuListElem;
var scepClientGetCertInitialFileFormatElem;
var scepClientGetCertInitialFilePathElem;
var scepClientGetCertInitialHashAlgElem;

var gSCEPGetCertCACertPickerElem;
var gGetCertUseRAAsMsgRecipientElem;
var gSCEPGetCertRecipientCertPickerElem;
var scepClientGetCertSelfElem;
var scepClientGetCertSerialNoElem;
var gSCEPGetCertUserCertPickerElem;
var scepClientGetCertFileFormatElem;
var scepClientGetCertFilePathElem;
var scepClientGetCertCaServerURLElem;
var scepClientGetCertHashAlgElem;

var gSCEPReqUserCertCreateElem;

var gSCEPReqCAIdElem;
var gSCEPReqCACertPickerElem;
var gSCEPReqUseRAAsMsgRecipientElem;
var gSCEPReqRecipientCertPickerElem;


var gWizardInitFlag = false;
var scepClientWizardButtonNextOrigLabel = "Next";
var scepServerLoginFlag = false;


var gSCEPClientScepMsgType;
var gRenewCertOption = false;
var gInitParamUserCert = null;

var gCACapabilities = null;

function initScepClientWizardReqCertParams(aX509Cert, scepCmd)
{
    SCEPClientWizard.logTrace("initScepClientWizardReqParams():....................Start.");

    var renewParamCertOption = false;

    if (scepCmd != null) {
	setPrefStringValue("extensions.avpki.scepclient.msgtype.menuList",
				"keymgr.scepclient.msgtype." + scepCmd);
    }

    if (!aX509Cert) {
    	SCEPClientWizard.logTrace("initScepClientWizardReqParams():....................End(0).");
	return renewParamCertOption;
    }
    SCEPClientWizard.logDebug("initScepClientWizardReqParams(): aX509Cert: " + aX509Cert + "");


    gInitParamUserCert = aX509Cert;

    var userCertPickerElem = document.getElementById("keymgr.scepclient.pkcsreq.user.certpicker");
    if (userCertPickerElem != null) {
	userCertPickerElem.selectedCert = aX509Cert;
    }

    if (aX509Cert.issuer && aX509Cert.subjectName != aX509Cert.issuerName) {
	renewParamCertOption = true;
    }
    SCEPClientWizard.logDebug("initScepClientWizardReqParams(): renewParamCertOption: " + renewParamCertOption + "");

    SCEPClientWizard.logTrace("initScepClientWizardReqParams():......End.");
    return renewParamCertOption;
}

function initScepClientWizardReqParams(certDbKey, scepCmd)
{
    SCEPClientWizard.logTrace("initScepClientWizardReqParams():......Start.");

    var renewParamCertOption = false;

    // SCEPClientWizard.logDebug("initScepClientWizardReqParams(" + certDbKey + ", " + scepCmd + "):......Start.");
    var initParamUserCert = null;
    try {
	initParamUserCert = certdb.findCertByDBKey(certDbKey , null);
    } catch(ex) {
	initParamUserCert = null;
    }
    if (!initParamUserCert) {
	return renewParamCertOption;
    }

    renewParamCertOption =  initScepClientWizardReqCertParams(initParamUserCert, scepCmd);

    SCEPClientWizard.logTrace("initScepClientWizardReqParams():......End.");
    return renewParamCertOption;
}

function initScepClientWizardQryString()
{
    SCEPClientWizard.logTrace("initScepClientWizardQryString():......Start.");

    if ((window.location.search == null) || (window.location.search == "")) {
	return false;
    }


    var serachStr = "" + window.location.search;
    if (serachStr.indexOf("?") == 0) {
	serachStr = serachStr.substring(1);
    }
    var certDbKey = "";
    var scepCmd = "";
    var reqParams = serachStr.split("&");

    for (var i = 0; i < reqParams.length; i++) {
	var reqParamItem = reqParams[i];
	var reqParamItemNVP = reqParamItem.split("=");
	if (reqParamItemNVP.length < 2) {
	    continue;
	}
	if (reqParamItemNVP[0] == "certDbKey") {
	    certDbKey = decodeURIComponent(reqParamItemNVP[1]);
	    continue;
	}
	if (reqParamItemNVP[0] == "msgType") {
	    scepCmd = encodeURIComponent(reqParamItemNVP[1]);
	    continue;
	}
    }
    SCEPClientWizard.logTrace("initScepClientWizardQryString():......20.");
    if (certDbKey == "") {
	return false;
    }

    var renewParamCertOption = initScepClientWizardReqParams(certDbKey, scepCmd);

    SCEPClientWizard.logTrace("initScepClientWizardQryString():...............End.");

    return renewParamCertOption;
}

function initScepClientWizardParams()
{
    SCEPClientWizard.logTrace("initScepClientWizardParams():..........................Start.");

    var renewParamCertOption = false;

    if ((window.location.search != null) && (window.location.search != "")) {
	renewParamCertOption = initScepClientWizardQryString();
    	SCEPClientWizard.logTrace("initScepClientWizardParams():..........................End(0).");
	return renewParamCertOption;
    }
    if (typeof window.arguments == undefined) {
    	SCEPClientWizard.logTrace("initScepClientWizardParams():..........................End(1).");
	return renewParamCertOption;
    }
    if ((!window.arguments) || (window.arguments.length == 0) || (!window.arguments[0])) {
    	SCEPClientWizard.logTrace("initScepClientWizardParams():..........................End(2).");
	return renewParamCertOption;
    }

    SCEPClientWizard.logTrace("initScepClientWizardParams():..........................10.");

    var pkiParams = null;
    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    try {
	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    } catch (ex) { }


	var paramScepRecipientCert = null;
	var paramUserCert = null;
	var paramIssuerCert = null;
	try {
	    var x509Cert = null;
	    if (pkiParams) {
	        x509Cert = pkiParams.getISupportAtIndex(1);
	        if (x509Cert) {
	            paramUserCert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }
	        x509Cert = pkiParams.getISupportAtIndex(2);
	        if (x509Cert) {
	            paramIssuerCert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }
	        x509Cert = pkiParams.getISupportAtIndex(3);
	        if (x509Cert) {
	            paramScepRecipientCert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }
	    }
	} catch (ex) {
    	    SCEPClientWizard.logError("SCEPClientWizard.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}
   	SCEPClientWizard.logDebug("SCEPClientWizard.initWithDialogParams(): {\n" + 
			"    paramScepRecipientCert: "	+ paramScepRecipientCert + "\n" + 
			"    paramUserCert: "		+ paramUserCert + "\n" + 
			"    paramIssuerCert: "		+ paramIssuerCert + "\n" + 
			"}");

    var selectedCert = paramUserCert;
    gInitParamUserCert = paramUserCert;


    var paramScepRecipientServerURL = null;
    var paramScepMessageType = null;
    var paramScepRecipientIsRA = false;


    var paramString = null;
    var strIdx = 0;
    try {
        paramString = dialogParams.GetString(strIdx);
	if (paramString && (paramString != "")) {
	    paramScepRecipientServerURL = paramString;
	}
    } catch (ex) {}
    SCEPClientWizard.logDebug("SCEPClientWizard.initWithDialogParams(): strIdx: " + strIdx + " paramScepRecipientServerURL: " + paramScepRecipientServerURL); 

    strIdx++;
    try {
    	paramString = dialogParams.GetString(strIdx);
	if (paramString && (paramString != "")) {
	    paramScepMessageType = paramString;
	}
    } catch (ex) {}
    SCEPClientWizard.logDebug("SCEPClientWizard.initWithDialogParams(): strIdx: " + strIdx + " paramScepMessageType: " + paramScepMessageType); 

    try {
    	var paramInt = 0;
    	paramInt = dialogParams.GetInt(1);
	paramScepRecipientIsRA = (paramInt == 0) ? false : true;
    } catch (ex) {}
	
    renewParamCertOption = initScepClientWizardReqCertParams(paramUserCert, paramScepMessageType);
    SCEPClientWizard.logDebug("initScepClientWizardParams(): renewParamCertOption: " + renewParamCertOption);

    SCEPClientWizard.logTrace("initScepClientWizardParams():..........................End.");
    return renewParamCertOption;
}


function initScepClientWizardXULElem()
{
    initScepClientFormXULElems();

    gScepClientWizardElem		= document.getElementById('keymgr.scepclient.wizard');

    scepClientWizardButtonNextElem	= gScepClientWizardElem.getButton("next");
    scepClientWizardButtonBackElem	= gScepClientWizardElem.getButton("back");
    scepClientWizardButtonFinishElem	= gScepClientWizardElem.getButton("finish");
    scepClientWizardButtonCancelElem	= gScepClientWizardElem.getButton("cancel");

    scepClientWizardButtonNextOrigLabel = scepClientWizardButtonNextElem.label;

    scepClientReqMsgTypeMenuListElem	= document.getElementById("keymgr.scepclient.msgtype.menuList");

    gSCEPReqUserCertCreateElem		= document.getElementById("keymgr.scepclient.pkcsreq.user.createcert");
    pkcsReqUserCertRenewElem		= document.getElementById("keymgr.scepclient.pkcsreq.user.cert.renew");

    gSCEPReqCAIdElem			= document.getElementById("keymgr.scepclient.pkcsreq.issuer.caid");
    gSCEPReqCACertPickerElem		= document.getElementById("keymgr.scepclient.pkcsreq.issuer.certpicker");
    gSCEPReqUseRAAsMsgRecipientElem	= document.getElementById("keymgr.scepclient.pkcsreq.issuer.recipient.isra");
    gSCEPReqRecipientCertPickerElem	= document.getElementById("keymgr.scepclient.pkcsreq.issuer.recipient.certpicker");

    scepClientGetCertInitialReqidMenuListElem = document.getElementById("keymgr.scepclient.getcertinitial.reqid.menulist");
    scepClientGetCertInitialFilePathElem = document.getElementById("keymgr.scepclient.getcertinitial.scepreqmsg.filepicker");
    scepClientGetCertInitialHashAlgElem = document.getElementById("keymgr.scepclient.getcertinitial.hashAlgName.menulist");

    gSCEPGetCertCACertPickerElem	= document.getElementById("keymgr.scepclient.getcert.issuer.certpicker");
    gGetCertUseRAAsMsgRecipientElem 	= document.getElementById("keymgr.scepclient.getcert.recipient.isra");
    gSCEPGetCertRecipientCertPickerElem = document.getElementById("keymgr.scepclient.getcert.recipient.certpicker");
    scepClientGetCertSelfElem		= document.getElementById("keymgr.scepclient.getcert.self");
    scepClientGetCertSerialNoElem	= document.getElementById("keymgr.scepclient.getcert.serialNo");
    gSCEPGetCertUserCertPickerElem	= document.getElementById("keymgr.scepclient.getcert.user.certpicker");
    scepClientGetCertFilePathElem	= document.getElementById("keymgr.scepclient.getcert.scepreqmsg.filepicker");
    scepClientGetCertCaServerURLElem	= document.getElementById("keymgr.scepclient.getcert.server.url");
    scepClientGetCertHashAlgElem	= document.getElementById("keymgr.scepclient.getcert.hashAlgName.menulist");

    gSCEPReqUserCertCreateElem.refresh();

}

function getDefaultCACapabilities()
{
    var caCapabilitiesObj = {
	    srcDoc : null,
	    getNextCACert : false,
	    renewal : false,
	    postPKIOperation : false,
	    sha1 : false,
	    sha256 : false,
	    sha512 : false,
	    des3 : false
	    };
    return caCapabilitiesObj;
}

function initScepClientWizard()
{
    SCEPClientWizard.logTrace("initScepClientWizard():...................Start.");

    gCACapabilities = getDefaultCACapabilities();

    InitCertDB(); // Initializes XPCOM services for Cert-DB and KeyManager - defined certutil.js 

    initScepClientWizardXULElem();

    gRenewCertOption = initScepClientWizardParams();
    doOnloadInitScepClientWizard(gRenewCertOption, gInitParamUserCert);

    SCEPClientWizard.initOnLoad();

    SCEPClientWizard.logTrace("initScepClientWizard():...................40.");

    scepClientScepReqMsgGroupElem.hidden = false;

    scepClientScepRespMsgFileDataElem.hidden = true;
    scepClientScepRespImportCertGroupElem.hidden = false;

    var pageUserNextElem = document.getElementById("keymgr.scepclient.msgtype.wizardpage.next.PKCSReq");
    scepClientWizardButtonNextElem.label = pageUserNextElem.value;

    SCEPClientWizard.logTrace("initScepClientWizard():...................50.");

    // Load previously selected message type.
    var lastSelectedMsgTypeId = getPrefStringValue(scepClientReqMsgTypeMenuListElem.id);
    if (lastSelectedMsgTypeId != null) {
	var lastSelectedMsgTypeElem = document.getElementById(lastSelectedMsgTypeId);
	if (lastSelectedMsgTypeElem != null) {
	    scepClientReqMsgTypeMenuListElem.value = lastSelectedMsgTypeElem.value;
	}
    }

    // gScepClientWizardElem.canAdvance = false;

    SCEPClientWizard.logTrace("initScepClientWizard():...................End.");
}

function msgTypePageShow()
{
    SCEPClientWizard.logTrace("msgTypePageShow():......Start.");

    if (gWizardInitFlag == false) {
	initScepClientWizard();
    	gWizardInitFlag = true;
    }

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    initMsgTypePage();

    SCEPClientWizard.logTrace("msgTypePageShow():......End.");
    return true;
}

function initMsgTypePage()
{
    SCEPClientWizard.logTrace("initMsgTypePage():...................Start.");

    var msgTypePageElem = gScepClientWizardElem.currentPage;

    var reqMsgTypeSelectedMenuItem = scepClientReqMsgTypeMenuListElem.selectedItem;
    SCEPClientWizard.logDebug("initMsgTypePage(): reqMsgTypeSelectedMenuItem: " + reqMsgTypeSelectedMenuItem + "");
    SCEPClientWizard.logDebug("initMsgTypePage(): scepClientReqMsgTypeMenuListElem.selectedIndex: " + scepClientReqMsgTypeMenuListElem.selectedIndex + "");

    if (!reqMsgTypeSelectedMenuItem) {
    	scepClientReqMsgTypeMenuListElem.selectedIndex = 0;
    	reqMsgTypeSelectedMenuItem = scepClientReqMsgTypeMenuListElem.selectedItem;
    }

    SCEPClientWizard.logDebug("initMsgTypePage(): reqMsgTypeSelectedMenuItem.id: " + reqMsgTypeSelectedMenuItem.id + "");

    var pageUserNextElem = null;
    if (reqMsgTypeSelectedMenuItem.id == "keymgr.scepclient.msgtype.GetCACert") {
	pageUserNextElem = document.getElementById("keymgr.scepclient.msgtype.wizardpage.next.GetCACert");
	scepClientWizardButtonNextElem.label = pageUserNextElem.value;

	msgTypePageElem.next = "keymgr.scepclient.getcacert.wizardpage";
	gScepClientWizardElem.canAdvance = true;
    }
    else if (reqMsgTypeSelectedMenuItem.id == "keymgr.scepclient.msgtype.PKCSReq") {
	pageUserNextElem = document.getElementById("keymgr.scepclient.msgtype.wizardpage.next.PKCSReq");
	scepClientWizardButtonNextElem.label = pageUserNextElem.value;

	msgTypePageElem.next = "keymgr.scepclient.pkcsreq.user.wizardpage";
	gScepClientWizardElem.canAdvance = true;
    }
    else if (reqMsgTypeSelectedMenuItem.id == "keymgr.scepclient.msgtype.GetCertInitial") {
	pageUserNextElem = document.getElementById("keymgr.scepclient.msgtype.wizardpage.next.GetCertInitial");
	scepClientWizardButtonNextElem.label = pageUserNextElem.value;

	msgTypePageElem.next = "keymgr.scepclient.getcertinitial.wizardpage";
	gScepClientWizardElem.canAdvance = true;
    }
    else if (reqMsgTypeSelectedMenuItem.id == "keymgr.scepclient.msgtype.GetCert") {
	pageUserNextElem = document.getElementById("keymgr.scepclient.msgtype.wizardpage.next.GetCert");
	scepClientWizardButtonNextElem.label = pageUserNextElem.value;

	msgTypePageElem.next = "keymgr.scepclient.getcert.wizardpage";
	gScepClientWizardElem.canAdvance = true;
	getCertPagePreShow();
    }
    else if (reqMsgTypeSelectedMenuItem.id == "keymgr.scepclient.msgtype.GetCRL") {
	pageUserNextElem = document.getElementById("keymgr.scepclient.msgtype.wizardpage.next.GetCRL");
	scepClientWizardButtonNextElem.label = pageUserNextElem.value;

	msgTypePageElem.next = "keymgr.scepclient.wizard.page.getCRL";
	gScepClientWizardElem.canAdvance = true;
    }
    else {
	gScepClientWizardElem.canAdvance = false;
    }

    SCEPClientWizard.logTrace("initMsgTypePage():...................End.");
}

function handleWizardScepReqMsgTypeChange(aReqTypeMenuListElem, reqMsgTypeSelectedMenuItem)
{
    SCEPClientWizard.logTrace("handleWizardScepReqMsgTypeChange():...................Start.");

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    initMsgTypePage();

    SCEPClientWizard.logDebug("handleWizardScepReqMsgTypeChange(): aReqTypeMenuListElem.id: "  + aReqTypeMenuListElem.id + "");
    SCEPClientWizard.logDebug("handleWizardScepReqMsgTypeChange(): aReqTypeMenuListElem.selectedItem.id: "  + aReqTypeMenuListElem.selectedItem.id + "");
    setPrefStringValue(aReqTypeMenuListElem.id, aReqTypeMenuListElem.selectedItem.id);

    SCEPClientWizard.logTrace("handleWizardScepReqMsgTypeChange():...................End.");
}


function msgTypePageAdvanced()
{
    SCEPClientWizard.logTrace("msgTypePageAdvanced():...................Start.");

    SCEPClientWizard.logDebug("msgTypePageAdvanced(): scepClientReqMsgTypeMenuListElem.id: "  + scepClientReqMsgTypeMenuListElem.id + "");
    SCEPClientWizard.logDebug("msgTypePageAdvanced(): scepClientReqMsgTypeMenuListElem.selectedItem.id: "  + scepClientReqMsgTypeMenuListElem.selectedItem.id + "");

    setPrefStringValue(scepClientReqMsgTypeMenuListElem.id, scepClientReqMsgTypeMenuListElem.selectedItem.id);
    gSCEPClientScepMsgType = scepClientReqMsgTypeMenuListElem.selectedItem.value;

    // TODO: TESTTTTTTTTTTTTTTTTTTTTTTTTTT - remove after test
    if (gScepClientGetCertInitialTestEnabled) {
	if ("GetCertInitial" == scepClientReqMsgTypeMenuListElem.value) {
	    try {
		loadGetInitialCertTestData();
	    } catch (ex) {}
	}
    }


    gScepClientWizardElem.scepReqHttpMethod = null;

    SCEPClientWizard.logTrace("msgTypePageAdvanced():...................End.");
    return true;
}

function pkcsReqUserCertPageShow()
{
    SCEPClientWizard.logTrace("pkcsReqUserCertPageShow():..............................Start.");

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    // AV-Device profile is only applicable for SCEP-based enrollment for Avaya Trust-Manager
    var avDeviceProfileMenuElem = document.getElementById("keymgr.scepclient.pkcsreq.user.certreq.avdevprofiles");
    if (SCEPClientWizard.mAvDeviceProfileEnabled) {
    	avDeviceProfileMenuElem.hidden = false;
    }
    else {
    	avDeviceProfileMenuElem.hidden = true;
    }

    pkcsReqUserCertPickerElem.loginAllTokens(false);
    pkcsReqUserCertPickerElem.refresh();

    // pkcsReqUserCertRenewElem		= document.getElementById("keymgr.scepclient.pkcsreq.user.cert.renew");
    handlePKCSReqUseCertRenewChange(pkcsReqUserCertRenewElem);


    var pageUserNextElem = document.getElementById("keymgr.scepclient.pkcsreq.user.wizardpage.next");
    scepClientWizardButtonNextElem.label = pageUserNextElem.value;

    SCEPClientWizard.logTrace("pkcsReqUserCertPageShow():..............................End.");
    return true;
}

function handlePKCSReqUseCertRenewChange(aUserCertRenewElem, ev)
{
    SCEPClientWizard.logTrace("handlePKCSReqUseCertRenewChange():......................Start.");

    // handleReqCertRenew(pkcsReqUserCertRenewElem, ev);
    if (aUserCertRenewElem.checked) {
	pkcsReqUserCertPickerElem.certtype = "user_casigned";
    }
    else {
	pkcsReqUserCertPickerElem.certtype = "user_selfsigned";
    }
    handlePKCSReqUserCertPickerChange(pkcsReqUserCertPickerElem);

    SCEPClientWizard.logTrace("handlePKCSReqUseCertRenewChange():.......................End.");
}


function handlePKCSReqUserCertPickerChange(aPKCSReqUserCertPickerElem, ev)
{
    SCEPClientWizard.logTrace("handlePKCSReqUserCertPickerChange():......................Start.");

    pkcsReqUserNickNameMenuListChanged(aPKCSReqUserCertPickerElem, ev);


    var challengePWElem = document.getElementById("keymgr.scepclient.pkcsreq.user.certreq.challengepw");
    challengePWElem.value = "";

    pkcsReqUserCertPageValidate();

    SCEPClientWizard.logTrace("handlePKCSReqUserCertPickerChange():......................End.");
}

function handlePKCSReqUserCertCreate(aCreateCertButtonElem, ev)
{
    SCEPClientWizard.logTrace("handlePKCSReqUserCertCreate():......................Start.");
    if (ev) {
    	ev.stopPropagation();
    }
    var newX509Cert = aCreateCertButtonElem.newCert;

    if (newX509Cert) {
    	pkcsReqUserCertPickerElem.refresh(); // update the list of cert based on newly create cert.
	pkcsReqUserCertPickerElem.selectedCert = newX509Cert; // select the newly created cert.
	handlePKCSReqUserCertPickerChange(pkcsReqUserCertPickerElem);
    }

    SCEPClientWizard.logTrace("handlePKCSReqUserCertCreate():......................End.");
}

function getUserChallengePassword(ev)
{
    SCEPClientWizard.logTrace("SCEPClientWizard.getUserChallengePassword():...................Start.");
    if (ev) {
    	ev.stopPropagation();
    }

	// TODO: Implement Self-signed cert generation 
	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
					.createInstance(Components.interfaces.nsIPKIParamBlock);
	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
	dialogParams.SetInt(0, 0);
	// pkiParams.setISupportAtIndex(1, null);

	var getUserChallengePWDialogURL = 'chrome://keymanager/content/tools/scepclient/scepChallengePWDialog.xul';
	window.setCursor('wait');
	var getUserChallengePWDialog = window.openDialog(
						getUserChallengePWDialogURL, "",
						'chrome,centerscreen,resizable,modal',
						pkiParams
						);
	window.setCursor('auto');

    var retVal = dialogParams.GetInt(0);
    if (retVal == 0) {
	SCEPClientWizard.logError("SCEPClientWizard.getUserChallengePassword(): failed to retrive challlenge password.");
    	SCEPClientWizard.logTrace("SCEPClientWizard.getUserChallengePassword():...................End(0).");
	return;
    }
    var userChallengePW = dialogParams.GetString(0);

    var challengePWElem = document.getElementById("keymgr.scepclient.pkcsreq.user.certreq.challengepw");
    challengePWElem.value = userChallengePW;

    SCEPClientWizard.logTrace("SCEPClientWizard.getUserChallengePassword():...................End.");
}


function pkcsReqUserCertPageValidate()
{
    /*
    if (pkcsReqUserCertPickerElem.selectedIndex < 0) {
	gScepClientWizardElem.canAdvance = false;
	alert("No desired user-cert available for Cert enrollment.");
	return false;
    }
    */

    var selectedCert = pkcsReqUserCertPickerElem.getSelectedCert();
    if (!selectedCert) {
	gScepClientWizardElem.canAdvance = false;
	alert("No desired user-cert available for Cert enrollment.");
	return false;
    }

    if (pkcsReqUserCertRenewElem.checked && !selectedCert.issuer) {
	gScepClientWizardElem.canAdvance = false;
	alert("Selected cert's issuing cert is not avaialable in Cert-DB - please import the CA cert into the DB first.");
	return false;
    }

    gScepClientWizardElem.canAdvance = true;

    return true;
}

function pkcsReqUserCertPageAdvanced()
{
    SCEPClientWizard.logTrace("pkcsReqUserCertPageAdvanced():......Start.");

    var avDeviceProfileMenuElem = document.getElementById("keymgr.scepclient.pkcsreq.user.certreq.avdevprofiles");

    var selectedUserCert = pkcsReqUserCertPickerElem.getSelectedCert();
    if (!selectedUserCert) {
	SCEPClientWizard.logTrace("pkcsReqUserCertPageAdvanced():......End(0).");
	return false;
    }


    var pkcs9ChallengePassword = SCEPClientWizard.trim(pkcsReqUserChallengePWElem.value);
    SCEPClientWizard.logDebug("pkcsReqUserCertPageAdvanced(): pkcs9ChallengePassword: |" + pkcs9ChallengePassword + "|");
    var scepUserChallengePw = pkcs9ChallengePassword;
    if (pkcs9ChallengePassword != "") {
    	scepUserChallengePw  = avDeviceProfileMenuElem.value + pkcs9ChallengePassword;
    }
    SCEPClientWizard.logDebug("pkcsReqUserCertPageAdvanced(): scepUserChallengePw: |" + scepUserChallengePw + "|");

    var outCSRFilePickerElem = pkcsReqUserPKCS10CSRFilePickerElem;

    // generateCSR();
    generateCSRWithParam(selectedUserCert, scepUserChallengePw, outCSRFilePickerElem);

    pkcsReqIssuerCertPagePreShow();

    /*
    pkcsReqUserCsrPageShow();
    pkcsReqUserCsrPageAdvanced();
    */

    SCEPClientWizard.logTrace("pkcsReqUserCertPageAdvanced():......End.");
    return true;
}

function pkcsReqIssuerCertPagePreShow()
{
    SCEPClientWizard.logTrace("pkcsReqIssuerCertPagePreShow():......Start.");

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    var certRef = pkcsReqUserCertPickerElem.getSelectedCert();
    var caSignedUserCert = false;
    if (certRef != null) {
	if (certRef.subjectName != certRef.issuerName) {
	    caSignedUserCert = true;
	}
    }
    if (caSignedUserCert) {
	var issuerNickName = certRef.issuer.nickname;
	/*
	SCEPClientWizard.logDebug("pkcsReqIssuerCertPagePreShow(): pkcsReqCACertPickerElem.value: " + pkcsReqCACertPickerElem.value + " " + 
			"issuerNickName: " + issuerNickName + " " + 
			""
			);
	*/
	pkcsReqCACertPickerElem.value = issuerNickName;
	setPrefStringValue((pkcsReqCACertPickerElem.id + ".cert"), issuerNickName);
	pkcsReqCACertPickerElem.disabled = true;
    }
    else {
	pkcsReqCACertPickerElem.disabled = false;
	pkcsReqCACertPickerElem.setAttribute("certusagedisabled", true);
    }

    SCEPClientWizard.logTrace("pkcsReqIssuerCertPagePreShow():......End.");
}

/*
function pkcsReqUserCsrPageShow()
{
    SCEPClientWizard.logTrace("pkcsReqUserCsrPageShow():......Start.");

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    var pageCsrFilePathElem = document.getElementById("keymgr.scepclient.pkcsreq.csr.file.path_X");
    pageCsrFilePathElem.file = pkcsReqUserPKCS10CSRFilePickerElem.file;
    pageCsrFilePathElem.ascii = pkcsReqUserPKCS10CSRFilePickerElem.ascii;


    if (pkcsReqUserPKCS10CSRFilePickerElem.ascii) {
	displayAsciiFileItemData(pkcsReqUserPKCS10CSRFilePickerElem.ascii, 
				"keymgr.scepclient.pkcsreq.csr.file.path_X",
				"keymgr.scepclient.pkcsreq.csr.file.asciiData"
				);
	scepClientCSRFileDataElem.hidden = false;
    }

    SCEPClientWizard.logTrace("pkcsReqUserCsrPageShow():......End.");

    return true;
}

function pkcsReqUserCsrPageAdvanced()
{
    return true;
}
*/


function pkcsReqIssuerCertPageShow()
{
    SCEPClientWizard.logTrace("pkcsReqIssuerCertPageShow():...........................Start.");

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;


    try {
	handlePKCSReqIssuerCertPickerChange(pkcsReqCACertPickerElem);
    } catch(e) {
	alert("handlePKCSReqIssuerCertPickerChange() failed - " + e);
	return false;
    }
    var selecedCert = pkcsReqCACertPickerElem.getSelectedCert();
    if (!selecedCert) {
	gScepClientWizardElem.canAdvance = false;
    }

    if (pkcsReqScepServerURLElem.value == "") {
	var scepServerDefaultURL = getPrefStringValue((pkcsReqScepServerURLElem.id + ".default"));
	if (scepServerDefaultURL == null) {
	    // scepServerDefaultURL = "http://localhost:18080/certdemo/scep/cgi-bin/pkiclient.exe";
	    scepServerDefaultURL = "";
	}
	pkcsReqScepServerURLElem.value = scepServerDefaultURL;
    }

    var pageUserNextElem = document.getElementById("keymgr.scepclient.pkcsreq.issuer.wizardpage.next");
    scepClientWizardButtonNextElem.label = pageUserNextElem.value;

    handlePKCSReqScepServerURLChange(pkcsReqScepServerURLElem);


    var useExistingSignedUserCert = checkForSigedUserCert();
    if (useExistingSignedUserCert) {
	gScepClientWizardElem.canAdvance = false;
	// scepClientWizardCancel();
	return false;
    }

    SCEPClientWizard.logTrace("pkcsReqIssuerCertPageShow():...........................End.");
    return true;
}

function handlePKCSReqIssuerCertPickerChange(aSCEPCACertPickerElem, ev)
{
    SCEPClientWizard.logTrace("handlePKCSReqIssuerCertPickerChange():......Start.");
    if (!aSCEPCACertPickerElem.selectedCert) {
	gScepClientWizardElem.canAdvance = false;
	gSCEPReqRecipientCertPickerElem.selectedCert = null;
    	SCEPClientWizard.logTrace("handlePKCSReqIssuerCertPickerChange():......End(1).");
	return;
    }

    handlePKCSReqRAAsMsgRecipientChange(gSCEPReqUseRAAsMsgRecipientElem);

    if (!ev) {
    	SCEPClientWizard.logTrace("handlePKCSReqIssuerCertPickerChange():......End(0).");
    	return;
    }

    var useExistingSignedUserCert = checkForSigedUserCert();
    if (useExistingSignedUserCert) {
	gScepClientWizardElem.canAdvance = false;
	// scepClientWizardCancel();
	return;
    }

    SCEPClientWizard.logTrace("handlePKCSReqIssuerCertPickerChange():......End.");
}

function handlePKCSReqRAAsMsgRecipientChange(aUseRAAsMsgRecipientElem, ev)
{
    SCEPClientWizard.logTrace("handlePKCSReqRAAsMsgRecipientChange():......Start.");

    var certType = "";
    var certUsage = new String("");
    var cadn = new String("");
    var selectedCert = null;
    if (aUseRAAsMsgRecipientElem.checked) {
	certType = "server";
	/*
	certUsage = "SSLServer";
	certUsage = new String("");
	*/
	certUsage = "EmailRecipient";
	cadn = gSCEPReqCACertPickerElem.selectedCert.subjectName;
	selectedCert = null;

	gSCEPReqRecipientCertPickerElem.disabled = false;
	// gSCEPReqRecipientCertPickerElem.setAttribute("certusagedisabled", true);
    }
    else {
	certType = "ca";
	certUsage = "VerifyCA";
	cadn = new String("");
	selectedCert = gSCEPReqCACertPickerElem.selectedCert;

	gSCEPReqRecipientCertPickerElem.disabled = true;
	// gSCEPReqRecipientCertPickerElem.setAttribute("certusagedisabled", true);
    }
    gSCEPReqRecipientCertPickerElem.setAttribute("certtypedisabled", true);

    SCEPClientWizard.logDebug("handlePKCSReqRAAsMsgRecipientChange(): certType: " + certType + " certUsage: " + certUsage + " cadn: " + cadn + "");
    gSCEPReqRecipientCertPickerElem.initWithParams(certType, certUsage, cadn, selectedCert);
    handlePKCSReqScepRecipientCertPickerChange(gSCEPReqRecipientCertPickerElem);

    SCEPClientWizard.logTrace("handlePKCSReqRAAsMsgRecipientChange():......End.");
}

function handlePKCSReqScepRecipientCertPickerChange(aSCEPRecipientCertPickerElem, ev)
{
    SCEPClientWizard.logTrace("handlePKCSReqScepRecipientCertPickerChange():......Start.");

    pkcsReqCaNickNameMenuListChanged(aSCEPRecipientCertPickerElem, ev);

    pkcsReqIssuerCertPageValidate();

    SCEPClientWizard.logTrace("handlePKCSReqScepRecipientCertPickerChange():......End.");
}

function handlePKCSReqScepServerURLChange(aSCEPServerURLElem, ev)
{
    SCEPClientWizard.logTrace("handlePKCSReqScepServerURLChange():.......................Start.");

    handleScepServerURLFieldChange(aSCEPServerURLElem);

    var scepCAGetInfoRowElem = document.getElementById("keymgr.scepclient.pkcsreq.issuer.getinfo.row");

    if (aSCEPServerURLElem.value != "") {
	scepCAGetInfoRowElem.hidden = false;
    	scepInitCACapabilities(aSCEPServerURLElem.id);
    }
    else {
	scepCAGetInfoRowElem.hidden = true;
    }

    pkcsReqIssuerCertPageValidate();

    SCEPClientWizard.logTrace("handlePKCSReqScepServerURLChange():.......................End.");
}

function scepDownloadCACertRespCBFunc (aScepMsgType, aImportedX509Cert, aImportedCertType)
{
    	SCEPClientWizard.logTrace("scepDownloadCACertRespCBFunc():...................Start.");

	SCEPClientWizard.mWaitingForResponse = false;

	if (!aImportedX509Cert) {
    	    SCEPClientWizard.logTrace("scepDownloadCACertRespCBFunc():...................End(0).");
	    return;
	}
	SCEPClientWizard.logDebug("scepDownloadCACertRespCBFunc(): aScepMsgType: " + aScepMsgType);
	SCEPClientWizard.logDebug("scepDownloadCACertRespCBFunc(): aImportedX509Cert: " + aImportedX509Cert.nickname);
	SCEPClientWizard.logDebug("scepDownloadCACertRespCBFunc(): aImportedCertType: " + aImportedCertType);
        switch(aScepMsgType) {
	    /*
	    case "PKCSReq" : 
		if (aImportedCertType == Components.interfaces.nsIX509Cert.USER_CERT) {
	    	    SCEPClientWizard.mCASignedCertItemElem.cert = aImportedX509Cert;
		}
	    	break;
	    */
	    case "GetCACert" : 
		if (aImportedCertType == Components.interfaces.nsIX509Cert.CA_CERT) {
		    // SCEPClientWizard.mScepClientPkcsReqParam.issuerX509Cert = aImportedX509Cert;
	    	    pkcsReqCACertPickerElem.selectedCert = aImportedX509Cert;
	    	    handlePKCSReqIssuerCertPickerChange(pkcsReqCACertPickerElem);
		}
	    	break;
	    case "GetCARACert" : 
		if (aImportedCertType == Components.interfaces.nsIX509Cert.CA_CERT) {
	    	    pkcsReqCACertPickerElem.selectedCert = aImportedX509Cert;
	    	    handlePKCSReqIssuerCertPickerChange(pkcsReqCACertPickerElem);
		    break;
		}
		if (aImportedCertType == Components.interfaces.nsIX509Cert.SERVER_CERT) {
	    	    gSCEPReqRecipientCertPickerElem.selectedCert = aImportedX509Cert;
    	    	    handlePKCSReqScepRecipientCertPickerChange(gSCEPReqRecipientCertPickerElem);
		}
	    	break;
	    default:
		SCEPClientWizard.logError("scepDownloadCACertRespCBFunc(): INVALID aScepMsgType: " + aScepMsgType);
	    	break;
	}

    	SCEPClientWizard.logTrace("scepDownloadCACertRespCBFunc():...................End.");
}

function scepDownloadCACert(ev)
{
    	SCEPClientWizard.logTrace("SCEPClientBasicForm.scepGetCACertChain():...................Start.");

	if (ev) {
	   ev.stopPropagation();
	}

    	var scepServerObj = {
    	    scepServerURL		: pkcsReqScepServerURLElem.value,
	    scepServerHttpMethod	: "GET",
    	    scepServerURLDestIsRA	: gSCEPReqUseRAAsMsgRecipientElem.checked,
    	    scepServerCAId		: gSCEPReqCAIdElem.value,
    	    scepServerCACert		: null,
    	    scepServerCert		: null,
    	    userCert			: null,
	    scepServerUserChallengePW 	: null,
    	    scepMsgType			: "GetCACert",
    	    scepMsgPKCS10CSR		: null,
	    scepMsgHashAlg		: "SHA1", // MD5, SHA1, SHA256, SHA512
    	    scepMsgTransactionId	: null,
    	    scepMsgReqPKCS7		: null,
    	    scepMsgRespPKCS7		: null,
    	    scepMsgRespStatus		: null,
    	    scepMsgRespOutFilePicker	: null,
    	    scepMsgRespOutFileBase64	: true,
    	    caSignedUserCert		: null,
    	    scepRespCBFunc		: null,
    	    };

    	var scepGetCACertMsgType = "GetCACert";
	/*
	if (gSCEPReqUseRAAsMsgRecipientElem.checked) {
    	    scepGetCACertMsgType = "GetCARACert";
	}
	*/
	scepServerObj.scepMsgType = scepGetCACertMsgType;
	if (scepServerObj.scepServerCAId == "") {
	    scepServerObj.scepServerCAId = "XXXXX";
	}
	scepServerObj.scepRespCBFunc = scepDownloadCACertRespCBFunc;

    	SCEPClientWizard.logTrace("SCEPClientBasicForm.scepGetCACertChain():...................10.");
	window.setCursor('wait');
	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	jsSCEPClient.scepGetCACertChain();
	window.setCursor('auto');

    	SCEPClientWizard.logTrace("SCEPClientBasicForm.scepGetCACertChain():...................End.");
}

function pkcsReqIssuerCertPageValidate()
{
    if (!gSCEPReqCACertPickerElem.selectedCert || 
	!gSCEPReqRecipientCertPickerElem.selectedCert || 
	(pkcsReqScepServerURLElem.value == "")) {
	gScepClientWizardElem.canAdvance = false;
	return;
    }


    gScepClientWizardElem.canAdvance = true;
    return;
}

function checkForSigedUserCert ()
{
    	SCEPClientWizard.logTrace("SCEPClientWizard.checkForSigedUserCert():...................Start.");

    	var userX509Cert = pkcsReqUserCertPickerElem.getSelectedCert();
	var caX509Cert = pkcsReqCACertPickerElem.getSelectedCert();

	if (!userX509Cert || !caX509Cert) {
    	    SCEPClientWizard.logTrace("SCEPClientWizard.checkForSigedUserCert():...................End(0).");
	    return false;
	}

	if (pkcsReqUserCertRenewElem.checked) {
    	    SCEPClientWizard.logTrace("SCEPClientWizard.checkForSigedUserCert():...................End(1).");
	    return false;
	}

	var signedUserCert = null;
        try {
            signedUserCert = keyManager.findCASignedX509CertByCertSPKI(
                                        userX509Cert,
                                        caX509Cert
                                        );
        } catch (ex) { }
	// signedUserCert = userX509Cert; // For test only

	if (!signedUserCert) {
    	    SCEPClientWizard.logTrace("SCEPClientWizard.checkForSigedUserCert():...................End(2).");
	    return false;
	}
	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
				.createInstance(Components.interfaces.nsIPKIParamBlock);
	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
    
	pkiParams.setISupportAtIndex(1, null);
	var certIdx = 1;
	pkiParams.setISupportAtIndex(certIdx, signedUserCert);

	certIdx++;
	pkiParams.setISupportAtIndex(certIdx, caX509Cert);

        var signedCertNotifDialogURL = "chrome://keymanager/content/tools/scepclient/SCEPSignedUserCertNotif.xul";

	window.setCursor('wait');
        window.openDialog(signedCertNotifDialogURL,  "_blank",
                		'chrome,centerscreen,resizable=yes,titlebar,modal',
				dialogParams
				);
	window.setCursor('auto');

	var retVal = dialogParams.GetInt(0);
	if (retVal == 1) {
    	    SCEPClientWizard.logTrace("SCEPClientWizard.checkForSigedUserCert():...................End(3).");
	    return true;
	}

    	SCEPClientWizard.logTrace("SCEPClientWizard.checkForSigedUserCert():...................End.");
	return false;
}


function pkcsReqIssuerCertPageAdvanced()
{
    SCEPClientWizard.logTrace("pkcsReqIssuerCertPageAdvanced():.......................Start.");

    scepServerLoginFlag  = true;
    setPrefStringValue((pkcsReqScepServerURLElem.id + "." + "default"), pkcsReqScepServerURLElem.value);

    /*
    var selecedCert = pkcsReqCACertPickerElem.getSelectedCert();
    if (selecedCert != null) {
	setPrefStringValue((pkcsReqCACertPickerElem.id + ".cert"), selecedCert.nickname);
    }
    */

    SCEPClientWizard.logTrace("pkcsReqIssuerCertPageAdvanced():.......................End.");
    return true;
}

function pkcsReqScepCsrPageShow()
{
    SCEPClientWizard.logTrace("pkcsReqScepCsrPageShow():..........................Start.");

    gScepClientWizardElem.canAdvance = true;

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    scepClientScepReqMsgGroupElem.hidden = false;

    var pageUserCertItemElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.user.cert");
    var certRef = pkcsReqUserCertPickerElem.getSelectedCert();
    if (certRef == null) {
	alert("User cert is not selected - go back and select user cert.");
	return false;
    }
    pageUserCertItemElem.cert = certRef;

    var pageScepRecipientTypeElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.recipient.isra");
    pageScepRecipientTypeElem.checked = gSCEPReqUseRAAsMsgRecipientElem.checked;

    var pageIssuerCertItemElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.recipient.cert");
    // certRef = pkcsReqCACertPickerElem.getSelectedCert();
    certRef = gSCEPReqRecipientCertPickerElem.selectedCert;
    if (certRef == null) {
	alert("SCEP request message recipient cert is not selected - go back and select CA/RA cert.");
	return false;
    }
    pageIssuerCertItemElem.cert = certRef;

    var pageCsrFilePathElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.pkcs10.file.path");
    pageCsrFilePathElem.ascii = pkcsReqUserPKCS10CSRFilePickerElem.ascii;
    pageCsrFilePathElem.file = pkcsReqUserPKCS10CSRFilePickerElem.file;


    var pkcsCSRHashAlgMenuElem	= document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.hashAlgName.menulist");
    updateHashAlgMenu(pkcsCSRHashAlgMenuElem);

    var pkcsCSRHttpMethodMenuElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.scephttpmethod");
    // updateHttpMethodMenu(pkcsCSRHttpMethodMenuElem);
    updateScepHttpMethodMenu(pkcsCSRHttpMethodMenuElem);
    handlePKCSReqScepHttpMethodChange(pkcsCSRHttpMethodMenuElem);

    var pageUserNextElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.wizardpage.next");
    scepClientWizardButtonNextElem.label = pageUserNextElem.value;

    SCEPClientWizard.logTrace("pkcsReqScepCsrPageShow():..........................End.");
    return true;
}

function handlePKCSReqScepHttpMethodChange(aScepReqHttpMethodMenuElem, ev)
{
    SCEPClientWizard.logTrace("handlePKCSReqScepHttpMethodChange():..........................Start.");

    var scepCsrOutFilPickerElem	= document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.file.path");
    if (aScepReqHttpMethodMenuElem.value == "POST") {
	scepCsrOutFilPickerElem.ascii = false;
    }
    else {
	scepCsrOutFilPickerElem.ascii = true;
    }
    initScepReqOutFile();

    SCEPClientWizard.logTrace("handlePKCSReqScepHttpMethodChange():..........................End.");
}

function pkcsReqScepCsrPageAdvanced()
{
    SCEPClientWizard.logTrace("pkcsReqScepCsrPageAdvanced():...........................Start.");

    var certRef = pkcsReqUserCertPickerElem.getSelectedCert();
    if (certRef == null) {
	alert("User cert is not selected - go back and select user cert.");
	SCEPClientWizard.logTrace("pkcsReqScepCsrPageAdvanced():..............................End(0).");
	return false;
    }
    var pageUserCertItemElem = document.getElementById("keymgr.scepclient.scepreqmsg.user.cert");
    pageUserCertItemElem.cert = certRef;

    var scepCsrRecipientCertElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.recipient.cert");
    certRef = scepCsrRecipientCertElem.cert;
    if (certRef == null) {
	alert("SCEP request recipient cert is not selected - go back and select CA/RA cert.");
	SCEPClientWizard.logTrace("pkcsReqScepCsrPageAdvanced():..............................End(1).");
	return false;
    }

    var pageIssuerCertItemElem = document.getElementById("keymgr.scepclient.scepreqmsg.recipient.cert");
    pageIssuerCertItemElem.cert = certRef;

    // var retVal = generateScepRequest();
    var retVal = generateScepRequestWithCerts(pageUserCertItemElem.cert, pageIssuerCertItemElem.cert, false);
    if (retVal == false) {
	SCEPClientWizard.logError("pkcsReqScepCsrPageAdvanced(): generateScepRequestWithCerts() failed.");
	SCEPClientWizard.logTrace("pkcsReqScepCsrPageAdvanced():..............................End(2).");
	return false;
    }
    
    var pkcsCSRHttpMethodMenuElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.scephttpmethod");
    gScepClientWizardElem.scepReqHttpMethod = pkcsCSRHttpMethodMenuElem.value;

    SCEPClientWizard.logTrace("pkcsReqScepCsrPageAdvanced():...........................End.");
    return true;
}

function scepPKCS7ReqMsgSendPageShow()
{
    SCEPClientWizard.logTrace("scepPKCS7ReqMsgSendPageShow():...........................Start.");

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    gScepClientWizardElem.canAdvance = true;

    gScepClientWizardElem.caSignedX509Cert = null;

    var scepReqMsgTypeElem = document.getElementById("keymgr.scepclient.scepreqmsg.type");
    scepReqMsgTypeElem.value = gSCEPClientScepMsgType;

    // var pkcsCSRHttpMethodMenuElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.scephttpmethod");
    var thisPageMethodMenuElem = document.getElementById("keymgr.scepclient.scepreqmsg.scephttpmethod");
    thisPageMethodMenuElem.value = gScepClientWizardElem.scepReqHttpMethod;

    var pageUserNextElem = document.getElementById("keymgr.scepclient.pkcsreq.scepreqmsg.wizardpage.next");
    scepClientWizardButtonNextElem.label = pageUserNextElem.value;

    SCEPClientWizard.logTrace("scepPKCS7ReqMsgSendPageShow():...........................End.");
    return true;
}

function handleWizardScepRespMsgCBFunc(responseData, aHttpChannel, aStatus)
{
    SCEPClientWizard.logTrace("handleWizardScepRespMsgCBFunc():..................Start.");
    if (responseData) {
	SCEPClientWizard.logDebug("handleWizardScepRespMsgCBFunc(): responseData.length: " + responseData.length + "");
    }
    SCEPClientWizard.logDebug("handleWizardScepRespMsgCBFunc(): aStatus: " + aStatus + "");

    var contentType = null;
    try {
	contentType = aHttpChannel.getResponseHeader("Content-Type");
    } catch (ex) { }

    window.setCursor('auto');

    handleWizardScepRespMsgCBFunc.targetFilePath = null;

    if (responseData == null) {
	alert("handleWizardScepRespMsgCBFunc(): ERROR: HTTP invocation failed - status: " + aStatus + "\n" +
		"Possibly reasons are : \n" + 
		"  - Bad URL, \n" + 
		"  - Using GET method with large SCEP data - make sure you test with POST also\n" + 
		""
		);
	SCEPClientWizard.logTrace("handleWizardScepRespMsgCBFunc():..................End(0).");
	return;
    }
    if (responseData.length <= 0) {
	alert("HTTP invocation failed - responseData.length: " + responseData.length);
	SCEPClientWizard.logTrace("scepClientWizard.handleWizardScepRespMsgCBFunc():..................End(1).");
	return;
    }
    var responseDataType = (typeof responseData);
    SCEPClientWizard.logDebug("scepClientWizard.handleWizardScepRespMsgCBFunc(): responseDataType: " + responseDataType + "\n");
    if (!contentType || (contentType.indexOf("text") > 0) || (contentType.indexOf("html") > 0)) {
	    SCEPClientWizard.logError("scepClientWizard.handleWizardScepRespMsgCBFunc(): ERROR: HTTP invocation failed - bad content type: " + contentType + " - must not be text or html ");
	    SCEPClientWizard.logError("scepClientWizard.handleWizardScepRespMsgCBFunc(): ERROR: HTTP invocation failed - status: " + aStatus + "");
	    SCEPClientWizard.logDebug("scepClientWizard.handleWizardScepRespMsgCBFunc(): aResponseData:\n" + responseData + "");

	    if (responseDataType == "string") {
	    	var errorWin = window.openDialog("about:blank", "SCEPResp", "centerscreen,resizable=yes,scrollbars=yes,alwaysRaised=yes,dialog=yes,height=225,width=500,modalx");
	    	errorWin.document.write(responseData);
		errorWin.focus();
	    }
	    else {
	    	alert("ERROR: HTTP invocation failed - bad content type: " + contentType + " - must not be text or html ");
	    }
	    SCEPClientWizard.logTrace("scepClientWizard.handleWizardScepRespMsgCBFunc():..................End(2).");
	    return;
    }

    var /* nsIFile */ scepRespMsgFile = scepClientScepRespMsgFilepickerElem.file;
    var scepRespMsgFilePath = scepClientScepRespMsgFilepickerElem.value;
    var scepRespMsgFileIsAscii = scepClientScepRespMsgFilepickerElem.ascii;
    SCEPClientWizard.logDebug("handleWizardScepRespMsgCBFunc(): " + 
			"scepRespMsgFilePath: " + scepRespMsgFilePath + " " + 
			"scepClientScepRespMsgFilepickerElem.ascii: " + scepClientScepRespMsgFilepickerElem.ascii + " " + 
			"responseData.length: " + responseData.length +
			"");
    scepClientScepRespMsgFilepickerElem.saveBinData(responseData);
    scepClientScepRespMsgFilepickerElem.responseData = responseData;
    SCEPClientWizard.logDebug("SCEP response is saved in file: " + scepRespMsgFile.path + "(length: " + responseData.length + ")");
    gScepClientWizardElem.canAdvance = true;
    SCEPClientWizard.logTrace("handleWizardScepRespMsgCBFunc():..................End.");
}

function scepPKCS7ReqMsgSendPageAdvanced()
{
    SCEPClientWizard.logTrace("scepPKCS7ReqMsgSendPageAdvanced():..................Start.");

    var scepReqMsgTypeElem = document.getElementById("keymgr.scepclient.scepreqmsg.type");
    var scepReqMsgType = scepReqMsgTypeElem.value;

    var httpMethod = "POST";
    var scepReqMsgHttpMethodElem = document.getElementById("keymgr.scepclient.scepreqmsg.scephttpmethod");
    httpMethod = scepReqMsgHttpMethodElem.value;

    var encodeParam = true;

    SCEPClientWizard.logDebug("scepPKCS7ReqMsgSendPageAdvanced(): scepReqMsgType: " + scepReqMsgType + "");
    SCEPClientWizard.logDebug("scepPKCS7ReqMsgSendPageAdvanced(): httpMethod: " + httpMethod + "");
    SCEPClientWizard.logDebug("scepPKCS7ReqMsgSendPageAdvanced(): encodeParam: " + encodeParam + "");

    // var retVal = sendScepPKIRequest(handleWizardScepRespMsgCBFunc, scepReqMsgType);

    window.setCursor('wait');

    var retVal = sendScepPKIRequestWithHttpMethod(handleWizardScepRespMsgCBFunc, scepReqMsgType, httpMethod, encodeParam);

    if (retVal == false) {
	window.setCursor('auto');
	SCEPClientWizard.logError("scepPKCS7ReqMsgSendPageAdvanced(): sendScepPKIRequestWithHttpMethod() failed.");
	return false;
    }

    SCEPClientWizard.logTrace("scepPKCS7ReqMsgSendPageAdvanced():..................End.");
    return true;
}

function scepPKCS7RespMsgPageShow()
{
    SCEPClientWizard.logTrace("scepPKCS7RespMsgPageShow():..................Start.");

    gScepClientWizardElem.canAdvance = false;

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    var pageScepRespFilePathElem = document.getElementById("keymgr.scepclient.pkcsreq.sceprespmsg.file.path_X");

    // SCEPClientWizard.logDebug("scepPKCS7RespMsgPageShow(): scepClientScepRespMsgFilepickerElem.ascii: " + scepClientScepRespMsgFilepickerElem.ascii + "");

    pageScepRespFilePathElem.ascii = scepClientScepRespMsgFilepickerElem.ascii;
    pageScepRespFilePathElem.file = scepClientScepRespMsgFilepickerElem.file;

    scepClientScepRespMsgFileDataElem.hidden = true;
    if (scepClientScepRespMsgFilepickerElem.ascii) {
	displayAsciiFileItemData(scepClientScepRespMsgFilepickerElem.ascii, 
				"keymgr.scepclient.pkcsreq.sceprespmsg.file.path_X",
				"keymgr.scepclient.pkcsreq.sceprespmsg.file.asciiData"
				);
	scepClientScepRespMsgFileDataElem.hidden = false;
    }

    var pageUserNextElem = document.getElementById("keymgr.scepclient.pkcsreq.sceprespmsg.wizardpage.next");
    scepClientWizardButtonNextElem.label = pageUserNextElem.value;

    SCEPClientWizard.logTrace("scepPKCS7RespMsgPageShow():..................End.");

    return true;
}

function scepPKCS7RespMsgPageAdvanced()
{

    SCEPClientWizard.logTrace("scepPKCS7RespMsgPageAdvanced():..................Start.");
    /*
    SCEPClientWizard.logDebug("scepPKCS7RespMsgPageAdvanced():" + 
			" gScepClientWizardElem.currentPage.pageid: " + gScepClientWizardElem.currentPage.pageid +
			" gScepClientWizardElem.currentPage.next: " + gScepClientWizardElem.currentPage.next +
			"");
    */

    var scepCsrUserCertItemElem = document.getElementById("keymgr.scepclient.scepreqmsg.user.cert");
    var userCert = scepCsrUserCertItemElem.cert;
    if  (userCert == null) {
	alert("Can't find selected user cert.");
	return false;
    }
    var userAlias = userCert.nickname;
    if  (userAlias == null) {
	userAlias = "UnknownUser";
    }

    var scepCsrRecipientCertElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.recipient.cert");
    var caCert = scepCsrRecipientCertElem.cert;
    if  (caCert == null) {
	alert("Can't find selected CA cert.");
	return false;
    }
    var caAlias = caCert.nickname;

    var /* nsIFile */ scepRespMsgFile = scepClientScepRespMsgFilepickerElem.file;
    var scepRespMsgFileIsAscii = scepClientScepRespMsgFilepickerElem.ascii;

    var /* nsIFile */ aOutPkcs7CertFile = scepClientScepRespCertFilePickerElem.file;
    var aOutPkcs7CertFileIsAscii = scepClientScepRespCertFilePickerElem.ascii;

    if ((scepRespMsgFile == null) || (aOutPkcs7CertFile == null)) {
	alert("Input/Output files are missing.");
	return false;
    }

    SCEPClientWizard.logDebug("scepPKCS7RespMsgPageAdvanced(): readScepCertRespPKIMessageByNameToFile(): " +
			"scepRespMsgFileIsAscii: " + scepClientScepRespMsgFilepickerElem.ascii + " " + 
			"userAlias: " + userAlias + " " + 
			"caAlias: " + caAlias + " " + 
			"gScepReqTransactionId: " + gScepReqTransactionId + " " + 
			"gScepReqSenderNonce: " + gScepReqSenderNonce + " " + 
			"aOutPkcs7CertFileIsAscii: " + scepClientScepRespCertFilePickerElem.ascii + " " + 
			""
			);

    var pkiStatusObj = new Object();
    var failureInfoObj = new Object();
    /*
    var scepCerReadStatus;
    try {
	scepCerReadStatus = scepPkiClient.readScepCertRespPKIMessageByCertToFile(
					scepRespMsgFile, false,
					userCert, caCert,
					gScepReqTransactionId, gScepReqSenderNonce,
					aOutPkcs7CertFile, aOutPkcs7CertFileIsAscii,
					pkiStatusObj, failureInfoObj
					);
    } catch (ex) {
	SCEPClientWizard.logError("scepPKCS7RespMsgPageAdvanced(): scepPkiClient.readScepCertRespPKIMessageByCertToFile() failed - " + ex + "");
	alert("Failed to extract signed certificate from SCEP response message - internal processing error.");

	return false;
    }
    */
    {
    	var responseData = scepClientScepRespMsgFilepickerElem.responseData;
        SCEPClientWizard.logDebug("scepPKCS7RespMsgPageAdvanced(): responseData.length: " + responseData.length);
	var base64Svc = Components.classes["@avaya.com/pkm/base64;1"]
				    .getService(Components.interfaces.alrIBase64);
	var scepMsgRespPKCS7Base64 = base64Svc.encode(responseData, responseData.length);
        SCEPClientWizard.logDebug("scepPKCS7RespMsgPageAdvanced(): scepMsgRespPKCS7Base64:\n" + scepMsgRespPKCS7Base64);

	// Step 4. Parse PKCS#7 Response message
        var signedCertPKCS7Base64;
        try {
    	    signedCertPKCS7Base64 = scepPkiClient.readScepCertRespPKIMessageByCert(
					scepMsgRespPKCS7Base64,
					userCert, caCert,
					gScepReqTransactionId, gScepReqSenderNonce,
					pkiStatusObj, failureInfoObj
    					);
	    if (scepClientScepRespCertFilePickerElem.ascii) {
	    	scepClientScepRespCertFilePickerElem.saveData(signedCertPKCS7Base64);
	    }
	    else {
	    	base64Svc.decodeByFile(signedCertPKCS7Base64, scepClientScepRespCertFilePickerElem.file);
	    }
	    scepClientScepRespCertFilePickerElem.refresh();
        } catch (ex) {
    	    var msg = ("Failed to parse PKCS#7 SCEP response - ex:\n" + ex);
    	    SCEPClientWizard.logError("scepPKCS7RespMsgPageAdvanced(): scepPkiClient.readScepCertRespPKIMessageByCert() failed - ex:\n" + msg);
	    alert(msg);
	    return false;
        }
    }

    var pkiStatus = pkiStatusObj.value;
    var failureInfo = failureInfoObj.value;
    SCEPClientWizard.logDebug("scepPKCS7RespMsgPageAdvanced(): pkiStatus: " + pkiStatus + " failureInfo: " + failureInfo + "");

    switch (pkiStatus) {
	case alrIScepPkiClient.PKIStatus_FAILURE: 
	    alert("SCEP request failed - failure-id: " + failureInfo);
	    return false;
	case alrIScepPkiClient.PKIStatus_PENDING: 
	    // Save the SCEP Request info as preference for future query 
	    SCEPClientWizard.logDebug("scepPKCS7RespMsgPageAdvanced(): reqMsgType: " + scepClientReqMsgTypeMenuListElem.selectedItem.value + "");
	    if ("GetCertInitial" !=  scepClientReqMsgTypeMenuListElem.selectedItem.value) {
		var reqIdMenuLabel = addScepGetInitialCertByRequest(
						userCert,
						caCert,
						gScepReqTransactionId,
						pkcsReqScepServerURLElem.value
						);
		setPrefStringValue(scepClientGetCertInitialReqidMenuListElem.id, reqIdMenuLabel);
		SCEPClientWizard.logDebug("SCEP request is Pending - reqIdMenuLabel: " + reqIdMenuLabel + "");
	    }
	    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].
					getService(Components.interfaces.nsIPromptService);
	    var dialogOk = promptService.confirm(
			window,
		     	"Your SCEP Request is PENDING at the CA.",
		     	"Your request is sucessfully submitted to SCEP Server.\nA response from the server is pending.\nDo you want to poll for the Signed Certificate now?"
		     	);
	    if (dialogOk) {
		var msgTypeSelectedElem = document.getElementById("keymgr.scepclient.msgtype.GetCertInitial");
		scepClientReqMsgTypeMenuListElem.selectedItem = msgTypeSelectedElem;
		gSCEPClientScepMsgType = scepClientReqMsgTypeMenuListElem.selectedItem.value;
		gScepClientWizardElem.currentPage.next = "keymgr.scepclient.getcertinitial.wizardpage";
	    }
	    else {
		gScepClientWizardElem.currentPage.next = "keymgr.scepclient.wizard.page.final";
	    }
	    gScepClientWizardElem.canAdvance = true;
	    return true;
	case alrIScepPkiClient.PKIStatus_SUCCESS: 
	    SCEPClientWizard.logDebug("A 'SUCCESS' SCEP response is received from server.");

	    gScepClientWizardElem.currentPage.next = "keymgr.scepclient.pkcsreq.importcert.wizardpage";
	    gScepClientWizardElem.canAdvance = true;
	    break;
	default:
	    gScepClientWizardElem.canAdvance = false;
	    alert("Invalid PKI Status for SCEP response.");
	    return false;
    }
    /*
    SCEPClientWizard.logDebug("scepPKCS7RespMsgPageAdvanced():" + 
			" gScepClientWizardElem.currentPage.pageid: " + gScepClientWizardElem.currentPage.pageid +
			" gScepClientWizardElem.currentPage.next: " + gScepClientWizardElem.currentPage.next +
			"");
    */
    SCEPClientWizard.logTrace("scepPKCS7RespMsgPageAdvanced():..................End.");

    return true;
}

function scepPKCS7ResponseHandlerPageShow()
{
    SCEPClientWizard.logTrace("scepPKCS7ResponseHandlerPageShow():..................Start.");

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    scepClientScepRespImportCertGroupElem.hidden = false;

    var pageScepRespCertFilePathElem = document.getElementById("keymgr.scepclient.pkcsreq.importcert.file.path");
    pageScepRespCertFilePathElem.ascii = scepClientScepRespCertFilePickerElem.ascii;
    pageScepRespCertFilePathElem.file = scepClientScepRespCertFilePickerElem.file;

    scepClientScepRespImportCertFileDataElem.hidden = true;
    if (scepClientScepRespCertFilePickerElem.ascii) {
	displayAsciiFileItemData(scepClientScepRespCertFilePickerElem.ascii, 
				"keymgr.scepclient.pkcsreq.importcert.file.path",
				"keymgr.scepclient.pkcsreq.importcert.file.asciiData"
				);
    }

    var pageUserNextElem = document.getElementById("keymgr.scepclient.pkcsreq.importcert.wizardpage.next");
    scepClientWizardButtonNextElem.label = pageUserNextElem.value;

    SCEPClientWizard.logTrace("scepPKCS7ResponseHandlerPageShow():..................End.");

    return true;
}

function scepPKCS7ResponseHandlerPageAdvanced()
{
    SCEPClientWizard.logTrace("scepPKCS7ResponseHandlerPageAdvanced():..................Start.");

    var /* nsIFile */ pkcs7CertFile = scepClientScepRespCertFilePickerElem.file;
    var pkcs7CertFileIsAscii = scepClientScepRespCertFilePickerElem.ascii;

    try {
	keyManager.importCertsFromPKCS7File(
				null,
				pkcs7CertFile, pkcs7CertFileIsAscii,
				Components.interfaces.nsIX509Cert.USER_CERT
				);
    } catch (ex) {
	alert("scepPKCS7ResponseHandlerPageAdvanced(): keyManager.importCertsFromPKCS7File() failed - " + ex);
	return false;
    }

    // Get a reference to the signed user cert in the SCEP response.
    // We do not care about the CA certs in the SCEP response.

    var x059CertList = [];
    try {
    	x059CertList = SCEPClientWizard.mKeyManager.getX509CertsFromPKCS7File(pkcs7CertFile, pkcs7CertFileIsAscii);
    } catch (ex) {
    	x059CertList = [];
    	SCEPClientWizard.logError("scepPKCS7ResponseHandlerPageAdvanced(): SCEPClientWizard.mKeyManager.getX509CertsFromPKCS7Base64() failed - " + ex);
    } 

    // TODO: Order the certs in the array in following the issuer chain.
    //       index 0 for the root and signed cert the last item in the array.
    var caSignedX509Cert = null;
    if (x059CertList.length > 0) {
        var x059CertEnum = x059CertList.enumerate();
        for (var i = 0; x059CertEnum.hasMoreElements(); i++) {
	    var x509Cert = x059CertEnum.getNext();
	    if (!x509Cert) {
	        continue;
	    }
	    var x509Cert2 = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert2);
	    var x509Cert3 = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert3);
	    if (x509Cert3.isSelfSigned) {
	        continue;
	    }
	    // TODO: We do not expect people to use SCEP to retrive CA certs.
	    if (x509Cert2.certType != Components.interfaces.nsIX509Cert.CA_CERT) {
	        caSignedX509Cert = x509Cert;
	        break;
	    }
        }
    }
    SCEPClientWizard.logDebug("scepPKCS7ResponseHandlerPageAdvanced(): caSignedX509Cert: " + caSignedX509Cert);
    gScepClientWizardElem.caSignedX509Cert = caSignedX509Cert;

    // TODO: Make the following code for removal of cached GetInitialCert object conditional on the 
    //       type of message we sent.

    var scepCsrUserCertItemElem = document.getElementById("keymgr.scepclient.scepreqmsg.user.cert");
    // var userCert = scepClientScepReqMsgUserNickNameElem.cert;
    var userCert = scepCsrUserCertItemElem.cert;
    var scepCsrRecipientCertElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.recipient.cert");
    // var caCert = scepClientScepReqMsgIssuerNickNameElem.cert;
    var caCert = scepCsrRecipientCertElem.cert;
    var scepGetInitialCertObj = createScepGetInitialCertObj();
	    scepGetInitialCertObj.userCertNickName = userCert.nickname;
	    scepGetInitialCertObj.userCertSubject = userCert.subjectName;
	    scepGetInitialCertObj.scepRecipientCertNickName = caCert.nickname;
	    scepGetInitialCertObj.scepRecipientCertSubject = caCert.subjectName;
	    scepGetInitialCertObj.transactionId = gScepReqTransactionId;
	    scepGetInitialCertObj.caServerURL = pkcsReqScepServerURLElem.value;
    removeScepGetInitialCert(scepGetInitialCertObj);

    alert("Sucessfully imported certs from : " + scepClientScepRespCertFilePickerElem.value);

    SCEPClientWizard.logTrace("scepPKCS7ResponseHandlerPageAdvanced():..................End.");
    return true;
}

function scepFinalPageShow()
{
    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    var importedCertItemElem = document.getElementById("keymgr.scepclient.pkcsreq.final.cert");
    importedCertItemElem.cert = gScepClientWizardElem.caSignedX509Cert;
}

function scepFinalPageAdvanced()
{
}

function scepClientWizardFinish(wizardElem)
{
    SCEPClientWizard.logTrace("scepClientWizardFinish():..................Start.");

    if (typeof window.arguments == undefined) {
	return;
    }
    if ((!window.arguments) || (window.arguments.length == 0) || (!window.arguments[0])) {
	return;
    }
    var pkiParams = null;
    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    try {
	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    } catch (ex) { }

    pkiParams.setISupportAtIndex(1, null);
    if (pkiParams) {
	if (gScepClientWizardElem.caSignedX509Cert) {
    	    pkiParams.setISupportAtIndex(1, gScepClientWizardElem.caSignedX509Cert);
	}
    }
    dialogParams.SetInt(0, 1);

    SCEPClientWizard.logTrace("scepClientWizardFinish():..................End.");
}

function scepClientWizardCancel(wizardElem)
{
    SCEPClientWizard.logTrace("scepClientWizardCancel():..................Start.");
    if (typeof window.arguments == undefined) {
	return;
    }
    if ((!window.arguments) || (window.arguments.length == 0) || (!window.arguments[0])) {
	return;
    }
    var pkiParams = null;
    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    try {
	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    } catch (ex) { }

    dialogParams.SetInt(0, 0);

    SCEPClientWizard.logTrace("scepClientWizardCancel():..................End.");
}

function getCACertPageShow()
{
    SCEPClientWizard.logTrace("getCACertPageShow():..................Start.");

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    var scepGetCACertMsgTypeElem = document.getElementById("keymgr.scepclient.getcacert.msgtype");
    handleGetCACertMsgTypeChange(scepGetCACertMsgTypeElem);

    var scepClientScepCAServerURLElem = document.getElementById("keymgr.scepclient.getcacert.server.url");
    if (scepClientScepCAServerURLElem.value == "") {
	var scepServerDefaultURL = getPrefStringValue((pkcsReqScepServerURLElem.id + ".default"));
	if (scepServerDefaultURL == null) {
	    // scepServerDefaultURL = "http://localhost:18080/certdemo/scep/cgi-bin/pkiclient.exe";
	    scepServerDefaultURL = "";
	}
	// SCEPClientWizard.logDebug("getCACertPageShow(): scepServerDefaultURL: " + scepServerDefaultURL + "");
	scepClientScepCAServerURLElem.value = scepServerDefaultURL;
    }

    gCACapabilities = getDefaultCACapabilities();
    try {
	handleGetCACertScepServerURLChange(scepClientScepCAServerURLElem);
    } catch (ex) {
	SCEPClientWizard.logError("getCACertPageShow(): handleGetCACertScepServerURLChange() failed - ex: " + ex + "");
    }

    gScepClientWizardElem.canAdvance = false;

    SCEPClientWizard.logTrace("getCACertPageShow():..................End.");
    return true;
}

function handleGetCACertMsgTypeChange(aGetCACertMsgTypeElem, ev)
{
    SCEPClientWizard.logTrace("handleGetCACertMsgTypeChange():..................Start.");

    updateGetCACertMessageParam();

    var scepGetCACertMsgType = aGetCACertMsgTypeElem.selectedItem.value;
    var responseMayContainRACert = (aGetCACertMsgTypeElem.selectedItem.getAttribute("responsemaycontainra") == "true");

    var isRAFirstCertRowElem = document.getElementById("keymgr.scepclient.getcacert.israfirstcert.row");
    isRAFirstCertRowElem.hidden = !responseMayContainRACert;

    var scepGetCACertEditTrustInfoElem = document.getElementById("keymgr.scepclient.getcacert.edittrustinfo.row");
    scepGetCACertEditTrustInfoElem.hidden = true;

    SCEPClientWizard.logTrace("handleGetCACertMsgTypeChange():..................End.");
}

function handleGetCACertCAIdChange(aGetCACertCAIdElem, ev)
{
    updateGetCACertMessageParam();
}

function updateGetCACertMessageParam()
{
    SCEPClientWizard.logTrace("updateGetCACertMessageParam():..................Start.");

    var scepGetCACertMsgType = "GetCACert";
    var scepClientScepCACertTypeElem = document.getElementById("keymgr.scepclient.getcacert.msgtype");
    if (scepClientScepCACertTypeElem) {
	scepGetCACertMsgType = scepClientScepCACertTypeElem.selectedItem.value;
    }

    var caIdElem = document.getElementById("keymgr.scepclient.getcacert.caid");
    var scepClientIsRAElem = document.getElementById("keymgr.scepclient.getcacert.isra");
    var encodeMsgParamElem = document.getElementById("keymgr.scepclient.getcacert.param.encode");

    var encodeParm = encodeMsgParamElem.checked; // TODO: dynamically obtain the value from the form or preference

    var caId = caIdElem.value;
    var msgParam = "operation=" + scepGetCACertMsgType;
    if (caId != "") {
	if (encodeParm) {
	    msgParam += "&message=" + encodeURIComponent(caId);
	}
	else {
	    msgParam += "&message=" + caId;
	}
    }

    /*
    if (scepClientIsRAElem.checked) {
	msgParam += "&isra=true";
    }
    */

    var httpMessageParamElem = document.getElementById("keymgr.scepclient.getcacert.param");
    httpMessageParamElem.value = msgParam;
    // SCEPClientWizard.logDebug("updateGetCACertMessageParam(): msgParam: " + msgParam + "");

    SCEPClientWizard.logTrace("updateGetCACertMessageParam():..................End.");
}

function validateGetCACertParam()
{
    SCEPClientWizard.logTrace("validateGetCACertParam():..................Start.");

    var getCACertOptionsGroupElem = document.getElementById("keymgr.scepclient.getcacert.msgtype");
    var getCACertOptionElem = document.getElementById("keymgr.scepclient.getcacert.msgtype.ca");
    var getNextCertOptionElem = document.getElementById("keymgr.scepclient.getcacert.msgtype.next");
    var httpMessageParamElem = document.getElementById("keymgr.scepclient.getcacert.param");
    var httpMessageCmdElem = document.getElementById("keymgr.scepclient.getcacert.cmd");
    var caCapabilitiesRowElem = document.getElementById("keymgr.scepclient.getcacert.capabilities.row");
    var caCapabilitiesDocElem = document.getElementById("keymgr.scepclient.getcacert.capabilities");
    var scepServerURLElem = document.getElementById("keymgr.scepclient.getcacert.server.url");

    var scepServerURL = SCEPClientWizard.trim(scepServerURLElem.value);
    if ((scepServerURL == "") || !gCACapabilities) {
	getNextCertOptionElem.disabled = true;
	if (getNextCertOptionElem.selected) {
	    getCACertOptionsGroupElem.selectedIndex = 0;
	    handleGetCACertMsgTypeChange(getCACertOptionsGroupElem);
	}
	httpMessageCmdElem.disabled = true;
	caCapabilitiesRowElem.hidden = true;
    	SCEPClientWizard.logTrace("validateGetCACertParam():..................End(0).");
	return;
    }
    httpMessageCmdElem.disabled = false;
    caCapabilitiesRowElem.hidden = false;
    getNextCertOptionElem.disabled = !gCACapabilities.getNextCACert;

    var capabilitiesDoc = gCACapabilities.srcDoc;
    if (!capabilitiesDoc) {
	capabilitiesDoc = "CA Capabilties are not available from the SCEP server.";
    }
    caCapabilitiesDocElem.value = capabilitiesDoc;

    SCEPClientWizard.logTrace("validateGetCACertParam():..................End.");
}

function handleGetCACertScepServerURLChange(aSCEPServerURLElem, ev)
{
    SCEPClientWizard.logTrace("handleGetCACertScepServerURLChange():..................Start.");

    handleScepServerURLFieldChange(aSCEPServerURLElem);


    var getCACertOptionsGroupElem = document.getElementById("keymgr.scepclient.getcacert.msgtype");
    var getCACertOptionElem = document.getElementById("keymgr.scepclient.getcacert.msgtype.ca");
    var getNextCertOptionElem = document.getElementById("keymgr.scepclient.getcacert.msgtype.next");
    var httpMessageParamElem = document.getElementById("keymgr.scepclient.getcacert.param");
    var httpMessageCmdElem = document.getElementById("keymgr.scepclient.getcacert.cmd");
    var caCapabilitiesRowElem = document.getElementById("keymgr.scepclient.getcacert.capabilities.row");
    var caCapabilitiesDocElem = document.getElementById("keymgr.scepclient.getcacert.capabilities");
    caCapabilitiesDocElem.value = "";

    var scepServerURL = SCEPClientWizard.trim(aSCEPServerURLElem.value);
    SCEPClientWizard.logTrace("handleGetCACertScepServerURLChange(): scepServerURL: " + scepServerURL);


    if (!scepServerURL) {
    	validateGetCACertParam();
	SCEPClientWizard.logTrace("handleGetCACertScepServerURLChange():..................End(1).");
	return;
    }
    caCapabilitiesDocElem.value = "";
    showGetCACapabilities(aSCEPServerURLElem.id);
    validateGetCACertParam();

    SCEPClientWizard.logTrace("handleGetCACertScepServerURLChange():..................End.");
}

function scepGetCACertChain(aCAServerURLElemId, httpResponseTragetWindowId)
{
    SCEPClientWizard.logTrace("scepGetCACertChain():..................Start.");

    // var scepClientScepCAServerURLElem = document.getElementById("keymgr.scepclient.getcacert.server.url");
    var serverURLElemId = aCAServerURLElemId;
    if (serverURLElemId == null) {
	serverURLElemId = "keymgr.scepclient.getcacert.server.url";
    }

    /*
    var targetWindowId = httpResponseTragetWindowId;
    if (targetWindowId == null) {
	targetWindowId = "ScepClientWizardGetCACertConsoleFrame";
    }
    */

    var scepClientScepCAServerURLElem = document.getElementById(serverURLElemId);
    var scepServerURL = scepClientScepCAServerURLElem.value;

    setPrefStringValue((scepClientScepCAServerURLElem.id + ".default"), scepServerURL);
    // SCEPClientWizard.logDebug("scepGetCACertChain(): scepServerURL: " + scepServerURL + " save as pref with id: " + scepClientScepCAServerURLElem.id + ".default" + "");

    var scepGetCACertMsgType = "GetCACert";
    var scepClientScepCACertTypeElem = document.getElementById("keymgr.scepclient.getcacert.msgtype");
    if (scepClientScepCACertTypeElem) {
	scepGetCACertMsgType = scepClientScepCACertTypeElem.selectedItem.value;
    }


    /*
    var aReqParamStr = "operation=" + scepGetCACertMsgType;
    var caId = "xxx";
    if (caId) {
	aReqParamStr += "&message=" + caId;
    }
    */

    var httpMessageParamElem = document.getElementById("keymgr.scepclient.getcacert.param");
    var httpMessageParam = httpMessageParamElem.value;

    var httpMethod = "GET";
    invokeSandboxedHttp(scepServerURL, httpMethod, httpMessageParam, getCACertRespMsgCBFunc);



    window.setCursor('wait');

    SCEPClientWizard.logTrace("scepGetCACertChain():..................End.");
}

function getCACertRespMsgCBFunc(responseData, /* nsIChannel */ aHttpChannel, aStatus)
{
    SCEPClientWizard.logTrace("getCACertRespMsgCBFunc():..................Start.");

    window.setCursor('auto');

    var contentType = null;
    try {
	contentType = aHttpChannel.getResponseHeader("Content-Type");
    } catch (ex) {
	alert("getCACertRespMsgCBFunc(): HTTP invocation failed - status : " + aStatus + " - ex: " + ex);
	return;
    }
    SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): " + 
			"contentType: " + contentType + " " + 
			"aStatus: " + aStatus +
			""
			);

    if (responseData == null) {
	alert("getCACertRespMsgCBFunc(): HTTP invocation failed - status : " + aStatus);
	return;
    }
    SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): responseData.length: " + responseData.length + "");

    if (responseData.length <= 0) {
	alert("getCACertRespMsgCBFunc(): Http invocation failed - responseData.length: " + responseData.length);
	return;
    }

    var scepGetCACertMsgType = "GetCACert";
    var scepClientScepCACertTypeElem = document.getElementById("keymgr.scepclient.getcacert.msgtype");
    if (scepClientScepCACertTypeElem) {
	scepGetCACertMsgType = scepClientScepCACertTypeElem.selectedItem.value;
    }

    if (scepGetCACertMsgType == "GetCACaps") {
	alert("CA Capabilities:\n" + responseData);
	SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): CA Capabilities:\n" + responseData + "");
	return;
    }

    // SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): responseData: " + responseData + " " + "");
    if (contentType.indexOf("application") < 0) {
	alert("Unknown content type: " + contentType + "\n" + responseData);
	SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): Unknown content type: " + contentType + "\n" + responseData + "");
	return;
    }

    var certFileExtension = "p7b";
    var fileType = "x509-ca-ra-cert";
    if (contentType.indexOf("x-x509-ca-cert") > 0) {
	fileType = "x509-ca-cert";
	certFileExtension = "cer";
    }
    else if (contentType.indexOf("x-x509-ca-ra-cert-chain") > 0) {
	fileType = "x509-ca-ra-cert-chain";
    }

    var getCACertRespMsgFileName = "getCACertResp-" + fileType + "." + certFileExtension;
    var /* nsIFile */ getCACertRespMsgFile = pickCertOutTmpFile(getCACertRespMsgFileName);
    var getCACertRespMsgFilePath = getCACertRespMsgFile.path;
    var getCACertRespMsgFileIsAscii = false;
    SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): scepRespMsgFile.path: " + getCACertRespMsgFilePath + "");

    var getCACertFilePickerElem = document.getElementById("keymgr.scepclient.getcacert.file.path");
    getCACertFilePickerElem.filepath = getCACertRespMsgFilePath;
    getCACertFilePickerElem.ascii = false;
    getCACertFilePickerElem.saveBinData(responseData);
    // saveDataToFile(responseData, getCACertRespMsgFile);
    SCEPClientWizard.logDebug("GetCACert response is saved in file: " + getCACertRespMsgFilePath + "(length: " + responseData.length + ")");

    try {
	// CA Certificates are not imported if the internal token is note already logged-in state.
	// No idea why it is so may be because we try to add trust.
	var token = tokendb.getInternalKeyToken();
	if (token != null) {
	    token.login(false);
	    SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): successfully logged into internal token.");
	}
	else {
	    SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): NULL internal token.");
	}

	if (contentType.indexOf("x-x509-ca-cert") > 0) {
	    certdb.importCertsFromFile(null, getCACertRespMsgFile, Components.interfaces.nsIX509Cert.CA_CERT);
	    // alert("CA certs are successfully imported.");
	    SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): CA cert(s) are successfully imported.");
	}
	/*
	else if (contentType.indexOf("x-x509-ca-ra-cert") > 0) {
	    // RA cert is a server cert signed by the CA.
	    try {
		certdb.importCertsFromFile(null, getCACertRespMsgFile, Components.interfaces.nsIX509Cert.CA_CERT);
	    } catch (ex) {
		certdb.importCertsFromFile(null, getCACertRespMsgFile, Components.interfaces.nsIX509Cert.SERVER_CERT);
	    }
	    alert("RA/CA certs are successfully imported.");
	    SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): RA/CA certs are successfully imported.");
	}
	*/
	else if ((contentType.indexOf("x-x509-ca-ra-cert-chain") > 0)
		|| (contentType.indexOf("x-x509-ca-ra-cert") > 0)) {
	    var firstX509Cert = keyManager.importCARACertsFromPKCS7File(
				null,
				getCACertRespMsgFile,
				false
				);
	    var firstX509Cert2 = firstX509Cert.QueryInterface(Components.interfaces.nsIX509Cert2);
	    var certType = firstX509Cert2.certType;
	    var importCertType = "";
	    switch (certType) {
		case Components.interfaces.nsIX509Cert.SERVER_CERT : 
		    importCertType = "SERVER_CERT";
		    break;
		case Components.interfaces.nsIX509Cert.CA_CERT : 
		    importCertType = "CA_CERT";
		    break;
		default:
		    // All other types are not possible.
		    break;
	    }

	    /*
	    var isRAFirstCertElem = document.getElementById("keymgr.scepclient.getcacert.israfirstcert");
	    if (isRAFirstCertElem.checked) {
		certdb.importCertsFromFile(null, getCACertRespMsgFile, Components.interfaces.nsIX509Cert.SERVER_CERT);
		importCertType = "SERVER_CERT";
	    }
	    else {
		try {
		    certdb.importCertsFromFile(null, getCACertRespMsgFile, Components.interfaces.nsIX509Cert.CA_CERT);
		    importCertType = "CA_CERT";
		    SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): CA cert (chain) is successfully imported.");
		} catch (ex) {
		    SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): failed to import CA cert (chain) - may be PKCS#7 file is for RA.");
		    // RA cert is a server cert signed by the CA.
		    // If the first cert in PKCS#7 is RA cert, then certdb.importCertsFromFile() will fail with 
		    // nsIX509Cert.CA_CERT option. So, now we try it as server cert.
		    certdb.importCertsFromFile(null, getCACertRespMsgFile, Components.interfaces.nsIX509Cert.SERVER_CERT);
		    importCertType = "SERVER_CERT";
		}
	    }
	    */
	    if (importCertType == "SERVER_CERT") {
		alert("RA cert (chain) is successfully imported.");
		SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): RA cert (chain) is successfully imported.");
	    }
	    else {
		alert("CA cert (chain) is successfully imported.");
		SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): CA cert (chain) is successfully imported.");
	    }
	}
	else  {
	    alert("Unexpected content-type: " + contentType + " in the GetCACert response message.");
	    SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): Unexpected content-type: " + contentType + " in the GetCACert response message.");
	}
    } catch (ex) {
	// alert("Failed to import Certs in GetCACert response message - may be they are already present");
	SCEPClientWizard.logDebug("getCACertRespMsgCBFunc(): certs are not imported - may be they are already present - ex: " + ex  + "");
	return;
    }

    var scepGetCACertEditTrustInfoElem = document.getElementById("keymgr.scepclient.getcacert.edittrustinfo.row");
    scepGetCACertEditTrustInfoElem.hidden = false;
    /*
    var scepClientScepCACertTypeElem = document.getElementById("keymgr.scepclient.getcacert.msgtype");
    if (scepClientScepCACertTypeElem.selectedItem.value != "GetCACaps") {
    }
    */
    gScepClientWizardElem.canAdvance = true;


    SCEPClientWizard.logTrace("getCACertRespMsgCBFunc():..................End.");
}

/*
function sendGetCACertRequest(opType, caId, responseCBFunc)
{
    SCEPClientWizard.logTrace("sendGetCACertRequest():..................Start.");

    var aRemoteURL = scepClientScepCAServerURLElem.value;
    SCEPClientWizard.logDebug("doSubmitScepReqMsg(): aRemoteURL: " + aRemoteURL + "");

    var aHttpMethod = "GET";
    var aReqParamStr = "operation=" + opType;
    if (caId) {
	aReqParamStr += "message=" + caId;
    }

    invokeSandboxedHttp(aRemoteURL, aHttpMethod, aReqParamStr, getCACertRespMsgCBFunc);

    SCEPClientWizard.logTrace("sendGetCACertRequest():..................End.");
}
*/


function getCACertPageAdvanced()
{
    SCEPClientWizard.logTrace("getCACertPageAdvanced():..................Start.");

    // gScepClientWizardElem.currentPage.next = "keymgr.scepclient.wizard.page.msg.type";
    gScepClientWizardElem.currentPage.next = "keymgr.scepclient.msgtype.wizardpage";

    return true;
}


var scepClientGetInitialCertObj = null;

function getCertInitialPageShow()
{
    SCEPClientWizard.logTrace("getCertInitialPageShow():..................Start.");

    /*
    SCEPClientWizard.logDebug("getCertInitialPageShow():" + 
			" gScepClientWizardElem.currentPage.pageid: " + gScepClientWizardElem.currentPage.pageid +
			" gScepClientWizardElem.currentPage.next: " + gScepClientWizardElem.currentPage.next +
			"");
    */

    gCACapabilities = getDefaultCACapabilities();

    gScepClientWizardElem.canAdvance = false;

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;
    scepClientGetInitialCertObj = null;

    // TODO: make sure that param Groubox is hidden if there is no initial cert.
    var scepClientGetCertInitialParamElem = document.getElementById("keymgr.scepclient.getcertinitial.params");
    // scepClientGetCertInitialParamElem.hidden = true;

    try {
    initGetCertInitialList(scepClientGetCertInitialReqidMenuListElem);

    if (scepClientGetCertInitialReqidMenuListElem.selectedIndex < 0) {
	scepClientGetCertInitialReqidMenuListElem.selectedIndex = 0;
    }

    if (scepClientGetCertInitialReqidMenuListElem.selectedItem == null) {
	alert("No menu item is selected - please select one.");
	SCEPClientWizard.logTrace("getCertInitialPageShow():..................End(0).");
	return false;
    }

    // var getCertInitialStr = scepClientGetCertInitialReqidMenuListElem.selectedItem.value;
    var getCertInitialStr = scepClientGetCertInitialReqidMenuListElem.selectedItem.pendingInitialCertStr;
    if (getCertInitialStr == null) {
	alert("No menu item value is present - please select one.");
	SCEPClientWizard.logTrace("getCertInitialPageShow():..................End(1).");
	return false;
    }

    handleGetCertInitialMenuListChange(
			scepClientGetCertInitialReqidMenuListElem, 
			scepClientGetCertInitialReqidMenuListElem.selectedItem
			);
    /*
    scepClientGetInitialCertObj = createScepGetInitialCertObj(getCertInitialStr);
    initGetCertInitialParams(scepClientGetInitialCertObj);
    */

    } catch (ex) {
	SCEPClientWizard.logError("getCertInitialPageShow(): failure - ex: " + ex + "");
    }

    SCEPClientWizard.logTrace("getCertInitialPageShow():..................End.");
    return true;
}

function getCertInitialPageValidate()
{
    var scepClientGetCertInitialHashAlgMenuElem	= document.getElementById("keymgr.scepclient.getcertinitial.hashAlgName.menulist");
    var scepClientGetCertInitialHttpMethodElem = document.getElementById("keymgr.scepclient.getcertinitial.http.method");

    updateHashAlgMenu(scepClientGetCertInitialHashAlgMenuElem);
    updateScepHttpMethodMenu(scepClientGetCertInitialHttpMethodElem);
}

function handleGetCertInitialMenuListChange(aMenuListElem, ev)
{
    SCEPClientWizard.logTrace("handleGetCertInitialMenuListChange():..................Start.");

    var selectedItemElem = aMenuListElem.selectedItem;

    var getInitialCertStr = selectedItemElem.pendingInitialCertStr;

    scepClientGetInitialCertObj = createScepGetInitialCertObj(getInitialCertStr);
    if (scepClientGetInitialCertObj == null) {
	alert("Failed to extract information from Get-Initial-Cert string.");
	gScepClientWizardElem.canAdvance = false;
	return;
    }
    initGetCertInitialParams(scepClientGetInitialCertObj);

    if (!scepClientGetInitialCertObj.userCert) {
	alert("The user cert used to generate the SCEP request is missing from browser's CERT-DB - getInitialCert: " + getInitialCertStr + "");
	gScepClientWizardElem.canAdvance = false;
	return;
    }
    if (!scepClientGetInitialCertObj.scepRecipientCert) {
	alert("The CA cert used to sign the SCEP request is missing from browser's CERT-DB - getInitialCert: " + getInitialCertStr + "");
	gScepClientWizardElem.canAdvance = false;
	return;
    }

    if (!scepClientGetInitialCertObj.caServerURL) {
	alert("CA cert-enrollment URL is missing - getInitialCert: " + getInitialCertStr + "");
	gScepClientWizardElem.canAdvance = false;
	return;
    }

    // scepInitCACapabilities('keymgr.scepclient.getcertinitial.server.url');
    showGetCertInitialCACapabilities('keymgr.scepclient.getcertinitial.server.url');

    getCertInitialPageValidate();

    /*
    var scepClientGetCertInitialHashAlgMenuElem	= document.getElementById("keymgr.scepclient.getcertinitial.hashAlgName.menulist");
    updateHashAlgMenu(scepClientGetCertInitialHashAlgMenuElem);

    var scepClientGetCertInitialHttpMethodElem = document.getElementById("keymgr.scepclient.getcertinitial.http.method");
    // updateHttpMethodMenu(pkcsCSRHttpMethodMenuElem);
    updateScepHttpMethodMenu(scepClientGetCertInitialHttpMethodElem);
    handleGetCertInitialHttpMethodChange(scepClientGetCertInitialHttpMethodElem);
    */


    gScepClientWizardElem.canAdvance = true;

    SCEPClientWizard.logTrace("handleGetCertInitialMenuListChange():..................End.");
}

function deleteSelectedGetCertInitialReqId(aMenuListElemId)
{
    SCEPClientWizard.logTrace("deleteSelectedGetCertInitialReqId():..................Start.");

    var menuListElem = document.getElementById(aMenuListElemId);
    var getInitialCertStr = menuListElem.selectedItem.value;
    // SCEPClientWizard.logDebug("deleteSelectedGetCertInitialReqId(): getInitialCertStr: " + getInitialCertStr + "");

    // var getInitialCertObj = createScepGetInitialCertObj(getInitialCertStr);
    var getInitialCertObj = menuListElem.selectedItem.pendingInitialCert;
    if (getInitialCertObj == null) {
	getInitialCertObj = createScepGetInitialCertObj(aMenuListElemId.selectedItem.pendingInitialCertStr);
    }
    if (getInitialCertObj == null) {

	SCEPClientWizard.logError("deleteSelectedGetCertInitialReqId(): createScepGetInitialCertObj() failed.");
	return;
    }
    SCEPClientWizard.logTrace("deleteSelectedGetCertInitialReqId():..................10.");

    removeScepGetInitialCert(getInitialCertObj);

    menuListElem.selectedIndex = -1;

    getCertInitialPageShow();

    SCEPClientWizard.logTrace("deleteSelectedGetCertInitialReqId():..................End.");
}

function initGetCertInitialParams(scepGetInitialCertObj)
{
    SCEPClientWizard.logTrace("initGetCertInitialParams():..................Start.");

    var reqIdItemElem = null;

    /*
    SCEPClientWizard.logDebug("initGetCertInitialParams(): scepGetInitialCertObj.userCert: " + scepGetInitialCertObj.userCert + "");
    SCEPClientWizard.logDebug("initGetCertInitialParams(): scepGetInitialCertObj.scepRecipientCert: " + scepGetInitialCertObj.scepRecipientCert + "");
    */

    reqIdItemElem = document.getElementById("keymgr.scepclient.getcertinitial.user.cert");
    if (scepGetInitialCertObj.userCert) {
	reqIdItemElem.cert = scepGetInitialCertObj.userCert;
	initScepGetCertIntialOutFile(scepGetInitialCertObj.userCert);
    }
    else {
	reqIdItemElem.cert = null;
    }

    reqIdItemElem = document.getElementById("keymgr.scepclient.getcertinitial.user.subject");
    reqIdItemElem.value = scepGetInitialCertObj.userCertSubject;

    reqIdItemElem = document.getElementById("keymgr.scepclient.getcertinitial.receipient.cert");
    if (scepGetInitialCertObj.scepRecipientCert) {
	reqIdItemElem.cert = scepGetInitialCertObj.scepRecipientCert;
    }
    else {
	reqIdItemElem.cert = null;
    }

    reqIdItemElem = document.getElementById("keymgr.scepclient.getcertinitial.receipient.subject");
    reqIdItemElem.value = scepGetInitialCertObj.scepRecipientCertSubject;

    reqIdItemElem = document.getElementById("keymgr.scepclient.getcertinitial.transactionId");
    reqIdItemElem.value = scepGetInitialCertObj.transactionId;

    reqIdItemElem = document.getElementById("keymgr.scepclient.getcertinitial.server.url");
    reqIdItemElem.value = scepGetInitialCertObj.caServerURL;


    SCEPClientWizard.logTrace("initGetCertInitialParams():..................End.");
}

function handleGetCertInitialHttpMethodChange(aScepReqHttpMethodMenuElem, ev)
{
    SCEPClientWizard.logTrace("handleGetCertInitialHttpMethodChange():..........................Start.");

    var scepCsrOutFilPickerElem	= document.getElementById("keymgr.scepclient.getcertinitial.scepreqmsg.filepicker");
    if (aScepReqHttpMethodMenuElem.value == "POST") {
	scepCsrOutFilPickerElem.ascii = false;
    }
    else {
	scepCsrOutFilPickerElem.ascii = true;
    }

    SCEPClientWizard.logTrace("handleGetCertInitialHttpMethodChange():..........................End.");
}

function getCertInitialPageAdvanced()
{
    SCEPClientWizard.logTrace("getCertInitialPageAdvanced():..................Start.");

    if (scepClientGetInitialCertObj == null) {
	SCEPClientWizard.logError("getCertInitialPageAdvanced(): scepClientGetInitialCertObj is NULL.");
	gScepClientWizardElem.canAdvance = false;
	return false;
    }

    var retVal = generateScepGetCertInitialRequest(scepClientGetInitialCertObj);
    if (retVal == false) {
	gScepClientWizardElem.canAdvance = false;
	SCEPClientWizard.logError("getCertInitialPageAdvanced(): generateScepGetCertInitialRequest() failed.");
	return false;
    }

    var scepClientGetCertInitialHttpMethodElem = document.getElementById("keymgr.scepclient.getcertinitial.http.method");
    gScepClientWizardElem.scepReqHttpMethod = scepClientGetCertInitialHttpMethodElem.value;

    SCEPClientWizard.logTrace("getCertInitialPageAdvanced():..................End.");

    return true;
}


function getCertInitialReqPageShow()
{
    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    // var pageUserNextElem = document.getElementById("keymgr.scepclient.getcertinitial.wizardpage.next");
    // scepClientWizardButtonNextElem.label = pageUserNextElem.value;

    SCEPClientWizard.logTrace("getCertInitialReqPageShow():..................End.");
    return true;
}
function getCertInitialReqPageAdvanced()
{
    SCEPClientWizard.logTrace("getCertInitialReqPageAdvanced():..................End.");
    return true;
}



function getCertPagePreShow()
{
    var defaultCANickName =  getPrefStringValue(pkcsReqCACertPickerElem.id + ".cert");
    if (defaultCANickName) {
	setPrefStringValue((gSCEPGetCertCACertPickerElem.id + ".cert"), defaultCANickName);
    }

    var defaultUserNickName =  getPrefStringValue(pkcsReqUserCertPickerElem.id + ".cert");
    if (defaultUserNickName) {
	setPrefStringValue((gSCEPGetCertUserCertPickerElem.id + ".cert"), defaultUserNickName);
    }

    if (scepClientGetCertCaServerURLElem.value == "") {
	var defaultCAServerURL =  getPrefStringValue(pkcsReqScepServerURLElem.id + "." + "default");
	if (defaultCAServerURL) {
	    scepClientGetCertCaServerURLElem.value = defaultCAServerURL;
	}
    }

    /*
    scepClientForm_initNickNameMenuList(gSCEPGetCertCACertPickerElem, Components.interfaces.nsIX509Cert.CA_CERT);
    if (gSCEPGetCertCACertPickerElem.selectedIndex < 0) {
	gSCEPGetCertCACertPickerElem.selectedIndex = 0;
    }
    */
    gSCEPGetCertCACertPickerElem.refresh();


}

function getCertPageShow()
{
    SCEPClientWizard.logTrace("getCertPageShow():..................Start.");

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;
    gScepClientWizardElem.canAdvance = false;

    /*
    var caCertRef =  gSCEPGetCertCACertPickerElem.getSelectedCert();
    if (caCertRef == null) {
	return false;
    }
    handleGetCertCACertPickerChange(gSCEPGetCertCACertPickerElem);
    */

    var scepGetCertServerURLElem = document.getElementById("keymgr.scepclient.getcert.server.url");
    handleGetCertServerURLChange(scepGetCertServerURLElem);

    gSCEPGetCertCACertPickerElem.value = "";
    gSCEPGetCertCACertPickerElem.refresh();
    var caCertRef =  gSCEPGetCertCACertPickerElem.getSelectedCert();
    if (!caCertRef) {
	return;
    }
    handleGetCertCACertPickerChange(gSCEPGetCertCACertPickerElem);


    validateGetCertPageAdvance();

    SCEPClientWizard.logTrace("getCertPageShow():..................End.");
    return true;
}

function handleGetCertCACertPickerChange(aGetCertCACertPicker, ev)
{
    SCEPClientWizard.logTrace("handleGetCertCACertPickerChange():..................Start.");

    var caCertRef = aGetCertCACertPicker.getSelectedCert();
    if (!caCertRef) {
	validateGetCertPageAdvance();
	return;
    }
    handleGetCertUseRAAsMsgRecipientChange(gGetCertUseRAAsMsgRecipientElem);

    handleGetCertSelfChange(scepClientGetCertSelfElem);


    SCEPClientWizard.logTrace("handleGetCertCACertPickerChange():..................End.");
}

function handleGetCertUseRAAsMsgRecipientChange(aGetCertUseRAAsMsgRecipientElem, ev)
{
    SCEPClientWizard.logTrace("handleGetCertUseRAAsMsgRecipientChange():......Start.");

    var certType = "";
    var certUsage = new String("");
    var cadn = new String("");
    var selectedCert = null;
    if (aGetCertUseRAAsMsgRecipientElem.checked) {
	certType = "server";
	/*
	certUsage = "SSLServer";
	certUsage = new String("");
	*/
	certUsage = "EmailRecipient";
	cadn = gSCEPGetCertCACertPickerElem.selectedCert.subjectName;
	selectedCert = null;
	gSCEPGetCertRecipientCertPickerElem.disabled = false;
    }
    else {
	certType = "ca";
	certUsage = "VerifyCA";
	cadn = new String("");
	selectedCert = gSCEPGetCertCACertPickerElem.selectedCert;
	gSCEPGetCertRecipientCertPickerElem.disabled = true;
    }
    gSCEPGetCertRecipientCertPickerElem.setAttribute("certtypedisabled", true);

    SCEPClientWizard.logDebug("handleGetCertUseRAAsMsgRecipientChange(): certType: " + certType + " certUsage: " + certUsage + " cadn: " + cadn + "");
    gSCEPGetCertRecipientCertPickerElem.initWithParams(certType, certUsage, cadn, selectedCert);

    handleGetCertSCEPRecipientCertPickerChange(gSCEPGetCertRecipientCertPickerElem);

    SCEPClientWizard.logTrace("handleGetCertUseRAAsMsgRecipientChange():......End.");
}


function handleGetCertSCEPRecipientCertPickerChange(aGetCertSCEPRecipientCertPickerElem, ev)
{
    SCEPClientWizard.logTrace("handleGetCertSCEPRecipientCertPickerChange():......Start.");

    validateGetCertPageAdvance();

    SCEPClientWizard.logTrace("handleGetCertSCEPRecipientCertPickerChange():......End.");
}


function handleGetCertSelfChange(aGetCertSelfElem)
{
    SCEPClientWizard.logTrace("handleGetCertSelfChange():......................Start.");

    scepClientGetCertFilePathElem.value = "";

    handleGetCertSerialNoChange(scepClientGetCertSerialNoElem);

    var certType = "";
    var cadn = new String("");
    if (aGetCertSelfElem.checked) {
	certType = "user_selfsigned";
	cadn = new String("");
    }
    else {
	certType = "user_casigned";
	cadn = gSCEPGetCertCACertPickerElem.selectedCert.subjectName;
    }
    gSCEPGetCertUserCertPickerElem.initWithParams(certType, null, cadn, null);
    handleGetCertSignerCertPickerChange(gSCEPGetCertUserCertPickerElem);


    SCEPClientWizard.logTrace("handleGetCertSelfChange():......................End.");
}

function handleGetCertServerURLChange(aSCEPServerURLElem, ev)
{
    SCEPClientWizard.logTrace("handleGetCertServerURLChange():.......................Start.");

    handleScepServerURLFieldChange(aSCEPServerURLElem);

    // scepInitCACapabilities(aSCEPServerURLElem.id);
    showGetCertCACapabilities(aSCEPServerURLElem.id);

    var scepClientGetCertHashAlgMenuElem	= document.getElementById("keymgr.scepclient.getcert.hashAlgName.menulist");
    updateHashAlgMenu(scepClientGetCertHashAlgMenuElem);

    var scepClientGetCertHttpMethodElem = document.getElementById("keymgr.scepclient.getcert.http.method");
    // updateHttpMethodMenu(scepClientGetCertHttpMethodElem);
    updateScepHttpMethodMenu(scepClientGetCertHttpMethodElem);

    if (ev) {
	scepClientGetCertFilePathElem.filepath = "";
    }
    handleGetCertHttpMethodChange(scepClientGetCertHttpMethodElem);

    validateGetCertPageAdvance();
    SCEPClientWizard.logTrace("handleGetCertServerURLChange():.......................End.");
}


function handleGetCertSerialNoChange(serialNoElem)
{
    SCEPClientWizard.logTrace("handleGetCertSerialNoChange():......................Start.");

    validateGetCertPageAdvance();

    if (serialNoElem.value == "") {
	return;
    }
    textboxAutoCompleteAction(serialNoElem);

    SCEPClientWizard.logTrace("handleGetCertSerialNoChange():......................End.");
}

function handleGetCertSignerCertPickerChange(aGetCertSignerCertPickerElem, ev)
{
    SCEPClientWizard.logTrace("handleGetCertSignerCertPickerChange():..................Start.");

    if (ev) {
	scepClientGetCertFilePathElem.filepath = "";
    }

    var signerCert = aGetCertSignerCertPickerElem.getSelectedCert();
    SCEPClientWizard.logDebug("handleGetCertSignerCertPickerChange(): signerCert: " + signerCert + "");
    if (signerCert) {
	initScepGetCertOutFile(signerCert);
    }

    validateGetCertPageAdvance();

    SCEPClientWizard.logTrace("handleGetCertSignerCertPickerChange():..................End.");
}

function handleGetCertHttpMethodChange(aGetCertHttpMethodMenuElem, ev)
{
    SCEPClientWizard.logTrace("handleGetCertHttpMethodChange():..........................Start.");

    var scepCsrOutFilPickerElem	= document.getElementById("keymgr.scepclient.getcert.scepreqmsg.filepicker");
    if (aGetCertHttpMethodMenuElem.value == "POST") {
	scepCsrOutFilPickerElem.ascii = false;
    }
    else {
	scepCsrOutFilPickerElem.ascii = true;
    }

    var signerCert = gSCEPGetCertUserCertPickerElem.getSelectedCert();
    SCEPClientWizard.logDebug("handleGetCertHttpMethodChange(): signerCert: " + signerCert + "");
    if (signerCert) {
	if (ev) {
	    scepClientGetCertFilePathElem.filepath = "";
	}
	initScepGetCertOutFile(signerCert);
    }

    validateGetCertPageAdvance();

    SCEPClientWizard.logTrace("handleGetCertHttpMethodChange():..........................End.");
}


function validateGetCertPageAdvance()
{
    SCEPClientWizard.logTrace("validateGetCertPageAdvance():..................Start.");

    var scepClientGetCertHashAlgMenuElem = document.getElementById("keymgr.scepclient.getcert.hashAlgName.menulist");
    updateHashAlgMenu(scepClientGetCertHashAlgMenuElem);
    var scepClientGetCertHttpMethodElem = document.getElementById("keymgr.scepclient.getcert.http.method");
    updateScepHttpMethodMenu(scepClientGetCertHttpMethodElem);

    gScepClientWizardElem.canAdvance = false;

    var issuerCert = gSCEPGetCertCACertPickerElem.getSelectedCert();
    if (!issuerCert) {
	return;
    }

    var recipientCert = gSCEPGetCertRecipientCertPickerElem.getSelectedCert();
    if (!recipientCert) {
	return;
    }

    var signerCert = gSCEPGetCertUserCertPickerElem.getSelectedCert();
    if (!signerCert) {
	return;
    }

    if (scepClientGetCertSerialNoElem.value == "") {
	return;
    }

    if ((!scepClientGetCertFilePathElem.file) || (scepClientGetCertFilePathElem.value == "")) {
	return;
    }

    gScepClientWizardElem.canAdvance = true;

    SCEPClientWizard.logTrace("validateGetCertPageAdvance():..................End.");
    return;
}


function getCertPageAdvanced()
{

    SCEPClientWizard.logTrace("getCertPageAdvanced():..................Start.");

    // var retVal = generateScepGetCertRequest();
    var retVal = generateScepGetCertRequestWithCerts(
			gSCEPGetCertUserCertPickerElem.selectedCert,
			gSCEPGetCertRecipientCertPickerElem.selectedCert
			);
    if (retVal == false) {
	return false;
    }

    var scepClientGetCertHttpMethodElem = document.getElementById("keymgr.scepclient.getcert.http.method");
    gScepClientWizardElem.scepReqHttpMethod = scepClientGetCertHttpMethodElem.value;

    SCEPClientWizard.logTrace("getCertPageAdvanced():..................End.");
    return true;
}

/*
function getCertReqPageShow()
{
    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;
    gScepClientWizardElem.canAdvance = false;

    SCEPClientWizard.logTrace("getCertReqPageShow():..................End.");
    return true;
}
function getCertReqPageAdvanced()
{
    SCEPClientWizard.logTrace("getCertReqPageAdvanced():..................End.");
    return true;
}
*/


function getCRLPageShow()
{
    SCEPClientWizard.logTrace("getCRLPageShow():..................Start.");

    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;
    gScepClientWizardElem.canAdvance = false;

    SCEPClientWizard.logTrace("getCRLPageShow():..................End.");
    return true;
}
function getCRLPageAdvanced()
{
    SCEPClientWizard.logTrace("getCRLPageAdvanced():..................Start.");
    SCEPClientWizard.logTrace("getCRLPageAdvanced():..................End.");
    return true;
}

/*
function getCRLReqPageShow()
{
    scepClientWizardButtonNextElem.label = scepClientWizardButtonNextOrigLabel;

    SCEPClientWizard.logTrace("getCRLReqPageShow():..................End.");
    return true;
}
function getCRLReqPageAdvanced()
{
    SCEPClientWizard.logTrace("getCRLReqPageAdvanced():..................End.");
    return true;
}
*/


function SCEPClient_trim (aStr) 
{
	return SCEPClientWizard.trim(aStr);
}

function invokeGetCACapabilitiesWithHttp(caServerURL, aGetCACapCB)
{
    SCEPClientWizard.logTrace("invokeGetCACapabilitiesWithHttp():...........................Start.");

    var httpMethod = "GET";
    var certType = "GetCACaps";

    var reqParamStr = "operation=" + certType;
    // TODO: Remove the following line after testing.
    reqParamStr += "&message=dummy";

    var serverURL = caServerURL + "?" + reqParamStr;
    SCEPClientWizard.logDebug("invokeGetCACapabilitiesWithHttp(): serverURL: " + serverURL + "");

    // function invokeSandboxedHttp(aRemoteURL, aHttpMethod, aReqParamStr, aHttpResponseCBFunc)
    invokeSandboxedHttp(caServerURL, httpMethod, reqParamStr, function(respDoc, httpChannel, aStatus) {
	if (aGetCACapCB) {
    	    aGetCACapCB(respDoc);
	}
    });

    SCEPClientWizard.logTrace("invokeGetCACapabilitiesWithHttp():...........................End.");
    return;
}

function initWithCACapabilities(aCACapStr)
{
    SCEPClientWizard.logTrace("initWithCACapabilities():...........................Start.");
    SCEPClientWizard.logDebug("initWithCACapabilities(): aCACapStr:\n" + aCACapStr + "");

    /*
    // var caCapabilitiesObj = new Object();
    var caCapabilitiesObj = {
	    srcDoc : null,
	    getNextCACert : false,
	    renewal : false,
	    postPKIOperation : false,
	    sha1 : false,
	    sha256 : false,
	    sha512 : false,
	    des3 : false
	    };
    */

    var caCapabilitiesObj = getDefaultCACapabilities();
    if (!aCACapStr) {
	gCACapabilities = caCapabilitiesObj;
	SCEPClientWizard.logTrace("initWithCACapabilities():...........................End(0).");
	return;
    }

    caCapabilitiesObj.srcDoc = aCACapStr;

    var caCapabilities = aCACapStr.split("\n");
    for (var i = 0; i < caCapabilities.length; i++) {
	var caCapability = caCapabilities[i];
	caCapability = SCEPClientWizard.trim(caCapability);
    	// SCEPClientWizard.logDebug("initWithCACapabilities(): caCapabilities[" + i + "] : " + caCapability + "");
	if (!caCapability) {
	    continue;
	}
	switch(caCapability) {
	    case "GetNextCACert" : 
		caCapabilitiesObj.getNextCACert = true;
		break;
	    case "Renewal" : 
		caCapabilitiesObj.renewal = true;
		break;
	    case "POSTPKIOperation" : 
		caCapabilitiesObj.postPKIOperation = true;
		break;
	    case "sha1" : 
	    case "SHA1" : 
	    case "sha-1" : 
	    case "SHA-1" : 
		caCapabilitiesObj.sha1 = true;
		break;
	    case "sha256" : 
	    case "SHA256" : 
	    case "sha-256" : 
	    case "SHA-256" : 
		caCapabilitiesObj.sha256 = true;
		break;
	    case "sha512" : 
	    case "SHA512" : 
	    case "sha-512" : 
	    case "SHA-512" : 
		caCapabilitiesObj.sha512 = true;
		break;
	    case "des3" : 
	    case "DES3" : 
		caCapabilitiesObj.des3 = true;
		break;
	    default:
    		SCEPClientWizard.logError("initWithCACapabilities(): UNKNOWN caCapabilities[" + i + "] : " + caCapability + "");
		break;
	}
    }

    SCEPClientWizard.logDebug("initWithCACapabilities(): caCapabilitiesObj: " + JSON.stringify(caCapabilitiesObj, null, '  ') + "");
    /*
    SCEPClientWizard.logDebug("initWithCACapabilities(): caCapabilitiesObj.postPKIOperation: " + caCapabilitiesObj.postPKIOperation + "");
    SCEPClientWizard.logDebug("initWithCACapabilities(): caCapabilitiesObj.sha1: " + caCapabilitiesObj.sha1 + "");
    */

    gCACapabilities = caCapabilitiesObj;

    SCEPClientWizard.logTrace("initWithCACapabilities():...........................End.");
}

function scepGetCACapResponse(scepServerURL, ev, aCACapabilitiesData)
{

    SCEPClientWizard.logTrace("scepGetCACapResponse():...........................Start.");

    var caCapabilitiesData = aCACapabilitiesData || "";
    if ((!aCACapabilitiesData) && gScepClientOverrideCACapEnabled) {
	caCapabilitiesData = gScepClientOverrideCACapValue;
    }
    SCEPClientWizard.logDebug("scepGetCACapResponse(): caCapabilitiesData:{\n" + caCapabilitiesData + "\n}");

    if (!caCapabilitiesData) {
	if (ev) {
    	    if (scepServerURL != "") {
	    	alert("CA Capabilties are not available from the SCEP server : " + scepServerURL);
	    }
	}
	SCEPClientWizard.logError("scepGetCACapResponse(): invokeGetCACapabilitiesWithHttp() failed for : " + scepServerURL + "");
    }
    else {
	if (ev) {
    	    if (scepServerURL != "") {
	    	alert("CA Capabilities: \n" + caCapabilitiesData);
	    }
	}
    }
    initWithCACapabilities(caCapabilitiesData);

    SCEPClientWizard.logTrace("scepGetCACapResponse():...........................End.");
}

function scepGetCACapabilities(aCAServerURLElemId, ev)
{
    SCEPClientWizard.logTrace("scepGetCACapabilities():...........................Start.");

    var scepClientScepCAServerURLElem = document.getElementById(aCAServerURLElemId);
    var scepServerURL = scepClientScepCAServerURLElem.value;

    var caCapabilitiesData = null;
    try {
    	if (scepServerURL != "") {
	    caCapabilitiesData = invokeGetCACapabilitiesWithHttp(scepServerURL, function(aCACapabilitiesData) {
    	    	SCEPClientWizard.logTrace("scepGetCACapabilities.cb():...........................Start.");
	    	scepGetCACapResponse(scepServerURL, ev, aCACapabilitiesData);
    	    	SCEPClientWizard.logTrace("scepGetCACapabilities.cb():...........................End.");
	    });
	}
    } catch (ex) {
	SCEPClientWizard.logError("scepGetCACapabilities(): invokeGetCACapabilitiesWithHttp() failed - ex: " + ex + "");
	caCapabilitiesData = null;
    }

    SCEPClientWizard.logTrace("scepGetCACapabilities():...........................End.");
}

function showGetCACapabilities(aCAServerURLElemId, ev)
{
    SCEPClientWizard.logTrace("showGetCACapabilities():...........................Start.");

    var scepClientScepCAServerURLElem = document.getElementById(aCAServerURLElemId);
    var scepServerURL = scepClientScepCAServerURLElem.value;

    try {
    	if (scepServerURL != "") {
	    invokeGetCACapabilitiesWithHttp(scepServerURL, function(aCACapabilitiesData) {
    	    	SCEPClientWizard.logTrace("showGetCACapabilities.cb():...........................Start.");
	    	scepGetCACapResponse(scepServerURL, ev, aCACapabilitiesData);

    		validateGetCACertParam();
    	    	SCEPClientWizard.logTrace("showGetCACapabilities.cb():...........................End.");
	    });
	}
    } catch (ex) {
	SCEPClientWizard.logError("showGetCACapabilities(): invokeGetCACapabilitiesWithHttp() failed - ex: " + ex + "");
    }
    SCEPClientWizard.logTrace("showGetCACapabilities():...........................End.");
}

function showGetCertInitialCACapabilities(aCAServerURLElemId, ev)
{
    SCEPClientWizard.logTrace("showGetCertInitialCACapabilities():...........................Start.");

    var scepClientScepCAServerURLElem = document.getElementById(aCAServerURLElemId);
    var scepServerURL = scepClientScepCAServerURLElem.value;

    try {
    	if (scepServerURL != "") {
	    invokeGetCACapabilitiesWithHttp(scepServerURL, function(aCACapabilitiesData) {
    	    	SCEPClientWizard.logTrace("showGetCertInitialCACapabilities.cb():...........................Start.");
	    	scepGetCACapResponse(scepServerURL, ev, aCACapabilitiesData);

    		getCertInitialPageValidate();
    	    	SCEPClientWizard.logTrace("showGetCertInitialCACapabilities.cb():...........................End.");
	    });
	}
    } catch (ex) {
	SCEPClientWizard.logError("showGetCertInitialCACapabilities(): invokeGetCACapabilitiesWithHttp() failed - ex: " + ex + "");
    }
    SCEPClientWizard.logTrace("showGetCertInitialCACapabilities():...........................End.");
}

function showGetCertCACapabilities(aCAServerURLElemId, ev)
{
    SCEPClientWizard.logTrace("showGetCertCACapabilities():...........................Start.");

    var scepClientScepCAServerURLElem = document.getElementById(aCAServerURLElemId);
    var scepServerURL = scepClientScepCAServerURLElem.value;

    try {
    	if (scepServerURL != "") {
	    invokeGetCACapabilitiesWithHttp(scepServerURL, function(aCACapabilitiesData) {
    	    	SCEPClientWizard.logTrace("showGetCertCACapabilities.cb():...........................Start.");
	    	scepGetCACapResponse(scepServerURL, ev, aCACapabilitiesData);

    		validateGetCertPageAdvance();

    	    	SCEPClientWizard.logTrace("showGetCertCACapabilities.cb():...........................End.");
	    });
	}
    } catch (ex) {
	SCEPClientWizard.logError("showGetCertCACapabilities(): invokeGetCACapabilitiesWithHttp() failed - ex: " + ex + "");
    }
    SCEPClientWizard.logTrace("showGetCertCACapabilities():...........................End.");
}

function scepInitCACapabilities(aCAServerURLElemId)
{
    SCEPClientWizard.logTrace("scepInitCACapabilities():...........................Start.");

    scepGetCACapabilities(aCAServerURLElemId);

    SCEPClientWizard.logTrace("scepInitCACapabilities():...........................End.");
}


function updateHashAlgMenu(aHashAlgMenuElem)
{
    SCEPClientWizard.logTrace("updateHashAlgMenu(" + aHashAlgMenuElem.id + "):...........................Start.");
    if (!gCACapabilities) {
	return;
    }

    var hashAlgValueDefault = null;
    if (SCEPClientWizard.mSignatureAlgDefault && (SCEPClientWizard.mSignatureAlgDefault != "")) {
    	hashAlgValueDefault = SCEPClientWizard.mSignatureAlgDefault;
    }

    var hashAlgValue = null;
    if (gCACapabilities.sha512) {
	aHashAlgMenuElem.removeAttribute("sha512disabled");
	if ("SHA512" == hashAlgValueDefault) {
	    hashAlgValue = "SHA512";
	}
    }
    else {
	aHashAlgMenuElem.setAttribute("sha512disabled", true);
    }
    if (gCACapabilities.sha256) {
	aHashAlgMenuElem.removeAttribute("sha256disabled");
	if ("SHA256" == hashAlgValueDefault) {
	    hashAlgValue = "SHA256";
	}
    }
    else {
	aHashAlgMenuElem.setAttribute("sha256disabled", true);
    }
    if (gCACapabilities.sha1) {
	aHashAlgMenuElem.removeAttribute("sha1disabled");
	if ("SHA1" == hashAlgValueDefault) {
	    hashAlgValue = "SHA1";
	}
    }
    else {
	aHashAlgMenuElem.setAttribute("sha1disabled", true);
    }
    SCEPClientWizard.logDebug("updateHashAlgMenu(): hashAlgValue: " + hashAlgValue + "");

    if (hashAlgValue) {
	aHashAlgMenuElem.value = hashAlgValue;
    }

    SCEPClientWizard.logTrace("updateHashAlgMenu(" + aHashAlgMenuElem.id + "):...........................End.");
}

function updateScepHttpMethodMenu(aScepHttpMethodElem)
{
    SCEPClientWizard.logTrace("updateScepHttpMethodMenu(" + aScepHttpMethodElem.id + "):...........................Start.");
    if (!gCACapabilities) {
	return;
    }

    var usePostFormMethod = gScepClientGetCACapFormPostEnabled; // TODO: Dynamically obtain the value from pereference.
    // var usePostFormMethod = getPrefStringValue(aScepHttpMethodElem.id);

    /*
    if (usePostFormMethod) {
    	aScepHttpMethodElem.setAttribute("postformdisabled", false);
    }
    else {
    	aScepHttpMethodElem.setAttribute("postformdisabled", true);
    }
    */
 

    var httpMethodValue = "GET";

    if (gCACapabilities.postPKIOperation) {
	aScepHttpMethodElem.setAttribute("postdisabled", false);

	if (usePostFormMethod) {
	    aScepHttpMethodElem.setAttribute("postformdisabled", false);
	}
	else {
	    aScepHttpMethodElem.setAttribute("postformdisabled", true);
	}

    	if (SCEPClientWizard.mHttpMethodDefault && (SCEPClientWizard.mHttpMethodDefault != "")) {
	    if (SCEPClientWizard.mHttpMethodDefault == "POST") {
		httpMethodValue = "POST";
	    }
	    else {
	    	if ((SCEPClientWizard.mHttpMethodDefault == "POST-FORM") && usePostFormMethod) {
	    	    httpMethodValue = "POST-FORM";
		}
	    }
    	}
    }
    else {
    	aScepHttpMethodElem.setAttribute("postdisabled", true);
	aScepHttpMethodElem.setAttribute("postformdisabled", true);
    }
    SCEPClientWizard.logDebug("updateScepHttpMethodMenu(): httpMethodValue: " + httpMethodValue + "");
    aScepHttpMethodElem.value = httpMethodValue;

    SCEPClientWizard.logTrace("updateScepHttpMethodMenu(" + aScepHttpMethodElem.id + "):...........................End.");
}

/*
function updateHttpMethodMenu(aHttpMethodMenuElem)
{
    SCEPClientWizard.logTrace("updateHttpMethodMenu(" + aHttpMethodMenuElem.id + "):...........................Start.");

    if (!gCACapabilities) {
	return;
    }

    var usePostFormMethod = false; // TODO: Dynamically obtain the value from pereference.
    // var usePostFormMethod = getPrefStringValue(aHttpMethodMenuElem.id);

    var pkcsCSRHttpMethodGetElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.scephttpmethod.get");
    var pkcsCSRHttpMethodPostElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.scephttpmethod.post");
    var pkcsCSRHttpMethodPostFormElem = document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.scephttpmethod.postform");

    var httpMethodValue = "GET";

    pkcsCSRHttpMethodPostElem.disabled = true;
    pkcsCSRHttpMethodPostFormElem.disabled = true;
    if (gCACapabilities.postPKIOperation) {
	if (usePostFormMethod) {
	    pkcsCSRHttpMethodPostFormElem.disabled = false;
	    httpMethodValue = "POST-FORM";
	}
	else {
	    pkcsCSRHttpMethodPostElem.disabled = false;
	    httpMethodValue = "POST";
	}
    }
    aHttpMethodMenuElem.value = httpMethodValue;

    SCEPClientWizard.logTrace("updateHttpMethodMenu(" + aHttpMethodMenuElem.id + "):...........................End.");
}
*/


var SCEPClientWizard = {


    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,

    mDialogParams		: null,
    mWizardInitalized		: false,

    mTestEnabled		: false,
    mGetCertInitialTestEnabled	: false,
    mLogEnabled			: false,

    mCARAServerURLDefault	: null,
    mHttpMethodFormPostEnabled	: false,
    mHttpMethodDefault		: null,
    mSignatureAlgDefault	: null,
    mCACapOverrideEnabled	: false,
    mCACapOverrideValue		: null,
    mAvDeviceProfileEnabled	: false,

    mTestMode 			: false,

    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > SCEPClientWizard.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    dump : function(msg)
    {
        SCEPClientWizard.log(1, msg);
    },
    logError : function(msg)
    {
        SCEPClientWizard.log(2, msg);
    },
    logTrace : function(msg)
    {
        SCEPClientWizard.log(4, msg);
    },
    logDebug : function(msg)
    {
        SCEPClientWizard.log(8, msg);
    },

    loginToInternalToken : function () 
    {
        SCEPClientWizard.logTrace("SCEPClientWizard.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = SCEPClientWizard.mTokenDB.getInternalKeyToken();
        } catch (ex) {}
	if (!token) {
            SCEPClientWizard.logTrace("SCEPClientWizard.loginToInternalToken():................End(0).");
	    return;
	}

	try {
            token.login(false);
            SCEPClientWizard.logTrace("SCEPClientWizard.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        SCEPClientWizard.logTrace("SCEPClientWizard.loginToInternalToken():................End.");
	return;
    },

    trim : function (aStr) 
    {
	if (!aStr) {
	    return aStr;
	}
	var sInString = aStr.replace( /^\s+/g, "" ); // strip leading whitespace
	return sInString.replace( /\s+$/g, "" ); // strip trailing whitespace
    },

    escapeSpace : function (aStr) 
    {
	if (!aStr) {
	    return aStr;
	}
	return aStr.replace( / /g, "\\ " ); 
    },

    textFieldAutoCompleteAction : function (aSrcTextBoxElem)
    {
        var formFieldKey = aSrcTextBoxElem.getAttribute("autocompletesearchparam");
	if (!formFieldKey) {
	    formFieldKey = aSrcTextBoxElem.id;
	}

        if (!formFieldKey || (formFieldKey == "")) {
	    return;
        }
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
    },

    handleTextboxChange : function (aTextboxElem, ev) 
    {
    	SCEPClientWizard.logTrace("SCEPClientWizard.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = this.trim(aTextboxElem.value);
	}
        var formFieldKey = aTextboxElem.getAttribute("autocompletesearchparam");
	if (formFieldKey) {
	    this.textFieldAutoCompleteAction(aTextboxElem);
	}

    	SCEPClientWizard.logTrace("SCEPClientWizard.handleTextboxChange():................End.");
    },


    initXPComServiceInfo : function ()
    {
        SCEPClientWizard.logTrace("SCEPClientWizard.initXPComServiceInfo():................Start.");

        try {
    	    SCEPClientWizard.mIOService = Components.classes["@mozilla.org/network/io-service;1"]
		    		.getService(Components.interfaces.nsIIOService);
	    SCEPClientWizard.mDirService = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties);
	    SCEPClientWizard.mX509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
	                        .getService(Components.interfaces.nsIX509CertDB);
            SCEPClientWizard.mTokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
                                .getService(Components.interfaces.nsIPK11TokenDB);
	    SCEPClientWizard.mKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
	                        .getService(Components.interfaces.alrIKeyManager);
	    /*
            SCEPClientWizard.mCRLManager = Components.classes["@avaya.com/pkm/alrcrlmanager;1"]
				.getService(Components.interfaces.alrICRLManager);
	     */
        } catch (ex) {
    	    alert("SCEPClientWizard.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    SCEPClientWizard.logError("SCEPClientWizard.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	SCEPClientWizard.loginToInternalToken();

	SCEPClientWizard.logTrace("SCEPClientWizard.initXPComServiceInfo():................End.");
    },


 
    getEnvironmentVariable : function (envVarName)
    {
	var envVarValue = null;
        try {
            var environment = Components.classes["@mozilla.org/process/environment;1"].
                		getService(Components.interfaces.nsIEnvironment);
            envVarValue = environment.get(envVarName);
        } catch(ex) { }
	return envVarValue;
    },

    initWithDefaultValues : function () 
    {
    	SCEPClientWizard.logTrace("SCEPClientWizard.initWithDefaultValues():................Start.");

	var scepOverrideCACap = {};
	do {
            try {
            var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);

                var prefBranchPrefixId = "";
                var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
                if (!prefsBranch) {
    		    SCEPClientWizard.logTrace("SCEPClientWizard.initWithDefaultValues():................20.");
    	            break;
                }

                var prefStringValue = null;
                var prefBoolValue = false;
                var prefIntValue = false;

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.test.enabled");
	            SCEPClientWizard.mTestEnabled = prefBoolValue;
		} catch (ex) {} 

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.gcitest.enabled");
	            SCEPClientWizard.mGetCertInitialTestEnabled = prefBoolValue;
		} catch (ex) {} 

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.log.enabled");
	            SCEPClientWizard.mLogEnabled = prefBoolValue;
		} catch (ex) {} 

                prefIntValue = -1;
		try {
		    prefIntValue = prefsBranch.getIntPref("extensions.avpki.scepclient.log.level");
		    if (prefIntValue > 0) {
    		    	// dump("SCEPClientWizard.initWithDefaultValues(): modifying log-level from " + SCEPClientWizard.mMaxLogLevel + " to " + prefIntValue + "\n");
	            	SCEPClientWizard.mMaxLogLevel = prefIntValue;
		    }
		} catch (ex) {} 

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.scepclient.serverurl.default");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    SCEPClientWizard.mCARAServerURLDefault = prefStringValue;
	        }

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.httpmethod.postform");
	            SCEPClientWizard.mHttpMethodFormPostEnabled = prefBoolValue;
		} catch (ex) {} 

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.scepclient.httpmethod.default");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    SCEPClientWizard.mHttpMethodDefault = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.scepclient.sigalg.default");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    SCEPClientWizard.mSignatureAlgDefault = prefStringValue;
	        }

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.capabilities.override");
	            SCEPClientWizard.mCACapOverrideEnabled = prefBoolValue;
		} catch (ex) {} 

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.scepclient.capabilities.value");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    // SCEPClientWizard.mCACapOverrideValue = prefStringValue;
		    SCEPClientWizard.mCACapOverrideValue = prefStringValue.replace(/ /g, "\n");
		    SCEPClientWizard.mCACapOverrideValue += "\n";
	        }

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.avdevprofile.enabled");
	            SCEPClientWizard.mAvDeviceProfileEnabled = prefBoolValue;
		} catch (ex) {} 

		/*
                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("xxxxx");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    SCEPClientWizard.mXXXXXXXX = prefStringValue;
	        }

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("log.enabled");
		} catch (ex) {} 
	        SCEPClientWizard.mXXXX = prefBoolValue;
		*/

            } catch (ex) {
	    	SCEPClientWizard.logDebug("SCEPClientWizard.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }
	    SCEPClientWizard.logTrace("SCEPClientWizard.initWithDefaultValues():................10.");
	} while (0);

    	SCEPClientWizard.logDebug("SCEPClientWizard.initWithDefaultValues(): SCEPClientWizard.mCACapOverrideEnabled: " + SCEPClientWizard.mCACapOverrideEnabled);
    	SCEPClientWizard.logDebug("SCEPClientWizard.initWithDefaultValues(): SCEPClientWizard.mCACapOverrideValue: " + SCEPClientWizard.mCACapOverrideValue);
    	SCEPClientWizard.logDebug("SCEPClientWizard.initWithDefaultValues(): SCEPClientWizard.mHttpMethodFormPostEnabled: " + SCEPClientWizard.mHttpMethodFormPostEnabled);

	gScepClientOverrideCACapEnabled = SCEPClientWizard.mCACapOverrideEnabled;
	gScepClientOverrideCACapValue = SCEPClientWizard.mCACapOverrideValue;
	gScepClientGetCACapFormPostEnabled = SCEPClientWizard.mHttpMethodFormPostEnabled;
	gScepClientGetCertInitialTestEnabled = SCEPClientWizard.mGetCertInitialTestEnabled;
	gScepClientAvDeviceProfileEnabled = SCEPClientWizard.mAvDeviceProfileEnabled;
	scepOverrideCACap = {
	    "caCapOverrideEnabled" : SCEPClientWizard.mCACapOverrideEnabled,
	    "caCapOverrideValue" : SCEPClientWizard.mCACapOverrideValue,
	    "httpMethodFormPostEnabled" : SCEPClientWizard.mHttpMethodFormPostEnabled,
	    "getCertInitialTestEnabled" : SCEPClientWizard.mGetCertInitialTestEnabled,
	    "avDeviceProfileEnabled" : SCEPClientWizard.mAvDeviceProfileEnabled
	};
    	// SCEPClientWizard.dump("SCEPClientWizard.initWithDefaultValues(): scepOverrideCACap: " + JSON.stringify(scepOverrideCACap, null, ' '));

    	SCEPClientWizard.logTrace("SCEPClientWizard.initWithDefaultValues():................End.");
	SCEPClientWizard.mMaxLogLevel = 2;
    },

    initWithDialogParams : function () 
    {
    	SCEPClientWizard.logTrace("SCEPClientWizard.initWithDialogParams():................Start.");
    	// SCEPClientWizard.logTrace("SCEPClientWizard.initWithDialogParams(): window.arguments: " + window.arguments);

	var dialogParams = null;
	if (typeof window.arguments == undefined) {
    	    SCEPClientWizard.logTrace("SCEPClientWizard.initWithDialogParams():................End(0).");
	    return;
	}
    	if ((!window.arguments) || (window.arguments.length == 0) || (!window.arguments[0])) {
    	    SCEPClientWizard.logTrace("SCEPClientWizard.initWithDialogParams():................End(1).");
	    return;
	}
        dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
        var pkiParams = null;
	try {
	    if (dialogParams) {
	    	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    }
	    if (pkiParams) {
		/*
	        var paramCert = pkiParams.getISupportAtIndex(1);
	        if (paramCert) {
		    SCEPClientWizard.logDebug("XPSignToolSignForm.initWithDialogParams(): paramCert: " + paramCert);
	            selectedCert = paramCRL.QueryInterface(Components.interfaces.alrIX509Cert);
	        }
		*/
	    }
	} catch (ex) {
    	    SCEPClientWizard.logError("SCEPClientWizard.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}

    	SCEPClientWizard.logTrace("SCEPClientWizard.initWithDialogParams():................End.");
    },

    initOnLoad : function () 
    {
    	SCEPClientWizard.logTrace("SCEPClientWizard.initOnLoad():................Start.");

    	// SCEPClientWizard.logTrace("SCEPClientWizard.initOnLoad(): window.arguments: " + window.arguments);

	if (typeof window.arguments != undefined) {
    	    if (window.arguments && (window.arguments.length > 0) && window.arguments[0]) {
                var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	        SCEPClientWizard.mDialogParams = dialogParams;
	    }
	}
    	SCEPClientWizard.logTrace("SCEPClientWizard.initOnLoad():...................10.");

	this.initXPComServiceInfo();

	this.initWithDefaultValues();
	this.initWithDialogParams();

    	SCEPClientWizard.logTrace("SCEPClientWizard.initOnLoad():................End.");
    },

    scepGetCACertChain : function (ev)
    {
    	SCEPClientWizard.logTrace("SCEPClientWizard.scepGetCACertChain():...................Start.");
	if (ev) {
	   ev.stopPropagation();
	}


    	var scepServerObj = {
    	    scepServerURL		: SCEPClientWizard.mScepServerURL,
	    scepServerHttpMethod	: "GET",
    	    scepServerURLDestIsRA	: SCEPClientWizard.mScepServerURLDestIsRA,
    	    scepServerCAId		: SCEPClientWizard.mScepServerCAId,
    	    scepServerCACert		: null,
    	    scepServerCert		: null,
    	    userCert			: null,
	    scepServerUserChallengePW 	: null,
    	    scepMsgType			: "GetCACert",
    	    scepMsgPKCS10CSR		: null,
	    scepMsgHashAlg		: "SHA1", // MD5, SHA1, SHA256, SHA512
    	    scepMsgTransactionId	: null,
    	    scepMsgReqPKCS7		: null,
    	    scepMsgRespPKCS7		: null,
    	    scepMsgRespStatus		: null,
    	    scepMsgRespOutFilePicker	: null,
    	    scepMsgRespOutFileBase64	: true,
    	    caSignedUserCert		: null,
    	    scepRespCBFunc		: null,
    	    };

    	var scepGetCACertMsgType = "GetCACert";
	if (SCEPClientWizard.mScepServerURLDestIsRA) {
    	    scepGetCACertMsgType = "GetCARACert";
	}
	scepServerObj.scepMsgType = scepGetCACertMsgType;
	scepServerObj.scepServerCAId = "XXXXX";
	scepServerObj.scepRespCBFunc = SCEPClientWizard_ScepRespCBFunc;

	window.setCursor('wait');
	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	jsSCEPClient.scepGetCACertChain();
	window.setCursor('auto');

    	SCEPClientWizard.logTrace("SCEPClientWizard.scepGetCACertChain():...................End.");
    },

    scepGetCACapabilities : function (ev)
    {
    	SCEPClientWizard.logTrace("SCEPClientWizard.scepGetCACapabilities():...................Start.");
	if (ev) {
	   ev.stopPropagation();
	}

    	var scepServerObj = {
    	    scepServerURL		: SCEPClientWizard.mScepServerURL,
	    scepServerHttpMethod	: "GET",
    	    scepServerCAId		: SCEPClientWizard.mScepServerCAId,
	    /*
    	    scepServerURLDestIsRA	: SCEPClientWizard.mScepServerURLDestIsRA,
    	    scepServerCACert		: null,
    	    scepServerCert		: null,
    	    userCert			: null,
	    scepServerUserChallengePW 	: null,
	    */
    	    scepMsgType			: "GetCACaps",
	    /*
    	    scepMsgPKCS10CSR		: null,
	    scepMsgHashAlg		: "SHA1", // MD5, SHA1, SHA256, SHA512
    	    scepMsgTransactionId	: null,
    	    scepMsgReqPKCS7		: null,
    	    scepMsgRespPKCS7		: null,
    	    scepMsgRespStatus		: null,
    	    scepMsgRespOutFilePicker	: null,
    	    scepMsgRespOutFileBase64	: true,
    	    caSignedUserCert		: null,
	    */
	    scepRespCBMethod		: null,
	    dummy			: null
    	    };
	scepServerObj.scepServerCAId = "XXXXX";

	if (ev) {
	    window.setCursor('wait');
	}
	try {
	    var jsSCEPClient = new JsSCEPClient(scepServerObj);
	    jsSCEPClient.scepGetCACapabilities(function(scepCACapabilities)  {
		if (ev) {
	            window.setCursor('auto');
		}

    	        SCEPClientWizard.logDebug("SCEPClientWizard.scepGetCACapabilities(): scepCACapabilities.srcDoc: " + scepCACapabilities.srcDoc);
	        alert("SCEP CA Capabilities:\n" + scepCACapabilities.srcDoc + "\n");
	    });
	} catch (ex) {
	    if (ev) {
	    	window.setCursor('auto');
	    }
	}

    	SCEPClientWizard.logTrace("SCEPClientWizard.scepGetCACapabilities():...................End.");
    },

    enrollUserCert : function ()
    {
    	SCEPClientWizard.logTrace("SCEPClientWizard.enrollUserCert():...................Start.");

    	var userCertPickerElem = document.getElementById("keymgr.scepclient.pkcsreq.user.certpicker");
        var selectedUserCert = userCertPickerElem.getSelectedCert();
        if (!selectedUserCert) {
	    SCEPClientWizard.logTrace("pkcsReqUserCertPageAdvanced():......End(0).");
	    return false;
        }

        var avDeviceProfileMenuElem = document.getElementById("keymgr.scepclient.pkcsreq.user.certreq.avdevprofiles");
        var pkcs9ChallengePassword = SCEPClientWizard.trim(pkcsReqUserChallengePWElem.value);
        SCEPClientWizard.logDebug("pkcsReqUserCertPageAdvanced(): pkcs9ChallengePassword: |" + pkcs9ChallengePassword + "|");
        var scepUserChallengePw = pkcs9ChallengePassword;
        if (pkcs9ChallengePassword != "") {
    	    scepUserChallengePw  = avDeviceProfileMenuElem.value + pkcs9ChallengePassword;
        }
        SCEPClientWizard.logDebug("pkcsReqUserCertPageAdvanced(): scepUserChallengePw: |" + scepUserChallengePw + "|");

        // generateCSR();
        generateCSRWithParam(selectedUserCert, scepUserChallengePw, outCSRFilePickerElem);

	
	var scepServerHttpMethod = this.mScepHttpMethodElem.value || "GET";
	var scepMsgHashAlg = this.mScepHashAlgNameElem.value || "SHA1";
    	SCEPClientWizard.logDebug("pkcsReqUserCertPageAdvanced(): scepServerHttpMethod: |" + scepServerHttpMethod + "|");
    	SCEPClientWizard.logDebug("pkcsReqUserCertPageAdvanced(): scepMsgHashAlg: |" + scepMsgHashAlg + "|");

    	var scepServerObj = {
    	    scepServerURL		: this.mScepServerURL,
	    scepServerHttpMethod	: scepServerHttpMethod,
    	    scepServerURLDestIsRA	: this.mScepServerURLDestIsRA,
    	    scepServerCACert		: this.mScepServerCACert,
    	    scepServerCert		: this.mScepServerRecipientCert,
    	    userCert			: selectedUserCert,
	    scepServerUserChallengePW 	: scepUserChallengePw,
    	    scepMsgType			: "PKCSReq",
    	    scepMsgPKCS10CSR		: null,
	    scepMsgHashAlg		: scepMsgHashAlg, // MD5, SHA1, SHA256, SHA512
    	    scepMsgTransactionId	: null,
    	    scepMsgReqPKCS7		: null,
    	    scepMsgRespPKCS7		: null,
    	    scepMsgRespStatus		: null,
    	    scepMsgRespOutFilePicker	: null,
    	    scepMsgRespOutFileBase64	: true,
    	    caSignedUserCert		: null,
    	    };
	scepServerObj.scepRespCBFunc = SCEPClientWizard.scepRespCBFunc;

    	// Force token login - on windows the popup window for password is not coming up
    	SCEPClientWizard.loginToCertToken(this.mUserCert);

	this.mWaitingForResponse = true;
	window.setCursor('wait');
	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	jsSCEPClient.enrollCert();
	window.setCursor('auto');

	var signedCert = scepServerObj.caSignedUserCert;

	if (signedCert) {
	    this.mCASignedCertItemElem.cert = signedCert;
	}
	SCEPClientWizard.logDebug("SCEPClientWizard.enrollUserCert(): signedCert : " + signedCert + "\n");

    	SCEPClientWizard.logTrace("SCEPClientWizard.enrollUserCert():...................End.");
	return signedCert;
    },

    scepRespCBFunc : function (aScepMsgType, aImportedX509Cert, aImportedCertType)
    {
    	SCEPClientWizard.logTrace("SCEPClientWizard.scepRespCBFunc():...................Start.");

	SCEPClientWizard.mWaitingForResponse = false;

	if (!aImportedX509Cert) {
    	    SCEPClientWizard.logTrace("SCEPClientWizard.scepRespCBFunc():...................End(0).");
	    return;
	}
	SCEPClientWizard.logDebug("SCEPClientWizard.scepRespCBFunc(): aScepMsgType: " + aScepMsgType);
	SCEPClientWizard.logDebug("SCEPClientWizard.scepRespCBFunc(): aImportedX509Cert: " + aImportedX509Cert.nickname);
	SCEPClientWizard.logDebug("SCEPClientWizard.scepRespCBFunc(): aImportedCertType: " + aImportedCertType);
        switch(aScepMsgType) {
	    case "PKCSReq" : 
		if (aImportedCertType == Components.interfaces.nsIX509Cert.USER_CERT) {
	    	    SCEPClientWizard.mCASignedCertItemElem.cert = aImportedX509Cert;
		}
	    	break;
	    case "GetCACert" : 
		if (aImportedCertType == Components.interfaces.nsIX509Cert.CA_CERT) {
		    // SCEPClientWizard.mScepClientPkcsReqParam.issuerX509Cert = aImportedX509Cert;
	    	    SCEPClientWizard.mScepServerCACertPickerElem.selectedCert = aImportedX509Cert;
	    	    this.handleSCEPServerCACertPickerChange(SCEPClientWizard.mScepServerCACertPickerElem);
		}
	    	break;
	    case "GetCARACert" : 
		if (aImportedCertType == Components.interfaces.nsIX509Cert.CA_CERT) {
	    	    SCEPClientWizard.mScepServerCACertPickerElem.selectedCert = aImportedX509Cert;
	    	    this.handleSCEPServerCACertPickerChange(SCEPClientWizard.mScepServerCACertPickerElem);
		    break;
		}
		if (aImportedCertType == Components.interfaces.nsIX509Cert.SERVER_CERT) {
	    	    SCEPClientWizard.mScepServerRecipientCertPickerElem.selectedCert = aImportedX509Cert;
    	    	    this.handleScepServerCertPickerChange(SCEPClientWizard.mScepServerRecipientCertPickerElem);
		}
	    	break;
	    default:
		SCEPClientWizard.logError("SCEPClientWizard.scepRespCBFunc(): INVALID aScepMsgType: " + aScepMsgType);
	    	break;
	}

    	SCEPClientWizard.logTrace("SCEPClientWizard.scepRespCBFunc():...................End.");
    },



    lastMethod : function () 
    {
    }
}

function SCEPClientWizard_ScepRespCBFunc (aScepMsgType, aImportedX509Cert, aImportedCertType)
{
    SCEPClientWizard.scepRespCBFunc(aScepMsgType, aImportedX509Cert, aImportedCertType);
}

