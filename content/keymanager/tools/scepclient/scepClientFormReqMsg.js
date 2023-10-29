/* @(#) $Id: scepClientFormReqMsg.js,v 1.33 2012/10/07 17:20:54 subrata Exp $ */

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



var pkcsReqUserCertRenewElem;
var pkcsReqUserCertPickerElem;
var userSubjectDNElem;
var pkcsReqUserChallengePWElem;

var pkcsReqIssuerCertGroupElem;
var pkcsReqCACertPickerElem;
var issuerSubjectDNElem;

var scepClientCSRGroupElem;
var pkcsReqUserPKCS10CSRFilePickerElem;
// var scepClientCSRFileDataElem;

var pkcsReqScepServerURLElem;
var pkcsReqScepReqHashAlgNameElem;

var scepClientScepCsrGroupElem;
var scepClientScepCsrFilePickerElem;
var scepClientScepCsrFileDataElem;

var scepClientScepReqMsgGroupElem;
var scepClientScepReqMsgUserCertItemElem;
var scepClientScepReqMsgUserSubjectElem;
var scepClientScepReqMsgIssuerCertItemElem;
var scepClientScepReqMsgTransactionIdElem;
var scepClientScepReqMsgFilePickerElem;
var scepClientScepReqMsgServerUrlElem;
var scepClientScepReqMsgServerHttpMethodElem;
var scepClientScepReqMsgFileDataElem;

var scepClientScepRespMsgFilepickerElem;

var scepClientScepRespMsgGroupElem;
var scepClientScepRespCertFilePickerElem;
var scepClientScepRespMsgFileDataElem;

var scepClientScepRespImportCertGroupElem;
var scepClientScepRespImportCertFileDataElem;

var msgCount = 1;
const SCEP_CLIENT_TMP_DIR_NAME = "SCEPClient";

function testDataFromBase64File()
{
    var base64FilePath = "/tmp/KeyManager/CSRTmp/WACDDA_req_scep-91.p7";
    var /* nsILocalFile */ base64File = getLocalFile(base64FilePath);

    var base64Data = readDataFromBase64File(base64File, false);

    dump("base64Data:" + base64Data + "(" + base64Data.length + ")\n");
}

// testDataFromBase64File();

function initScepClientFormXULElems()
{

    // dump("initScepClientFormXULElems():...................Start.\n");

    pkcsReqUserCertRenewElem			= document.getElementById("keymgr.scepclient.pkcsreq.user.cert.renew");

    pkcsReqUserCertPickerElem		= document.getElementById("keymgr.scepclient.pkcsreq.user.certpicker");
    pkcsReqUserChallengePWElem		= document.getElementById("keymgr.scepclient.pkcsreq.user.certreq.challengepw");
    pkcsReqUserPKCS10CSRFilePickerElem	= document.getElementById("keymgr.scepclient.pkcsreq.user.certreq.filepicker");


    pkcsReqIssuerCertGroupElem		= document.getElementById("keymgr.scepclient.pkcsreq.issuer.inputparams");
    pkcsReqCACertPickerElem	= document.getElementById("keymgr.scepclient.pkcsreq.issuer.certpicker");

    pkcsReqScepServerURLElem 		= document.getElementById("keymgr.scepclient.pkcsreq.issuer.server.url");
    pkcsReqScepReqHashAlgNameElem	= document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.hashAlgName.menulist");

    scepClientCSRGroupElem		= document.getElementById("keymgr.scepclient.pkcsreq.csr.inputparams");
    // scepClientCSRFileDataElem		= document.getElementById("keymgr.scepclient.pkcsreq.csr.file.asciiData");

    scepClientScepCsrGroupElem		= document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams");
    scepClientScepCsrFilePickerElem	= document.getElementById("keymgr.scepclient.pkcsreq.scepcsrparams.file.path");

    scepClientScepReqMsgGroupElem		= document.getElementById("keymgr.scepclient.scepreqmsg.group");

    scepClientScepReqMsgUserCertItemElem	= document.getElementById("keymgr.scepclient.scepreqmsg.user.cert");
    scepClientScepReqMsgIssuerCertItemElem	= document.getElementById("keymgr.scepclient.scepreqmsg.recipient.cert");
    scepClientScepReqMsgTransactionIdElem	= document.getElementById("keymgr.scepclient.scepreqmsg.transactionId");

    scepClientScepReqMsgServerUrlElem	= document.getElementById("keymgr.scepclient.scepreqmsg.server.url");
    scepClientScepReqMsgServerHttpMethodElem	= document.getElementById("keymgr.scepclient.scepreqmsg.scephttpmethod");

    scepClientScepReqMsgFilePickerElem	= document.getElementById("keymgr.scepclient.scepreqmsg.file.path");
    scepClientScepReqMsgFileDataElem	= document.getElementById("keymgr.scepclient.scepreqmsg.file.asciiData");

    scepClientScepRespMsgFilepickerElem	= document.getElementById("keymgr.scepclient.scepreqmsg.resp.file.path");

    scepClientScepRespMsgGroupElem	= document.getElementById("keymgr.scepclient.pkcsreq.sceprespmsg");
    scepClientScepRespMsgFileDataElem	= document.getElementById("keymgr.scepclient.pkcsreq.sceprespmsg.file.asciiData");
    scepClientScepRespCertFilePickerElem	= document.getElementById("keymgr.scepclient.pkcsreq.sceprespmsg.cert.file.path");


    scepClientScepRespImportCertGroupElem	= document.getElementById("keymgr.scepclient.pkcsreq.importcert");
    scepClientScepRespImportCertFileDataElem	= document.getElementById("keymgr.scepclient.pkcsreq.importcert.file.asciiData");

    pkcsReqCACertPickerElem.refresh();

    pkcsReqUserCertPickerElem.refresh();
    // pkcsReqUserCertPickerElem.loginAllTokens(false);

    // dump("initScepClientFormXULElems():...................End.\n");
}



function doOnloadInitScepClientForm()
{
    initScepClientFormXULElems();

    initScepServerURL();


    try {
    	pkcsReqUserNickNameMenuListChanged(pkcsReqUserCertPickerElem);
    } catch(e) {
    	alert("doOnloadInitScepClientForm(): pkcsReqUserNickNameMenuListChanged() failed - " + e);
    }

    try {
    	pkcsReqCaNickNameMenuListChanged(pkcsReqCACertPickerElem);
    } catch(e) {
    	alert("doOnloadInitScepClientForm(): pkcsReqCaNickNameMenuListChanged() failed - " + e);
    }
}

function doOnloadInitScepClientWizard(renewCASignedCert, initParamUserCert)
{
    // dump("doOnloadInitScepClientWizard():...................Start.\n");

    // initScepClientFormXULElems();

    pkcsReqUserCertPickerElem = document.getElementById("keymgr.scepclient.pkcsreq.user.certpicker");
    // Force the selecton of default cert from preference
    if (initParamUserCert != null) {
    	pkcsReqUserCertPickerElem.value = "";
    }

    // pkcsReqCACertPickerElem.value = "";
    pkcsReqUserCertRenewElem		= document.getElementById("keymgr.scepclient.pkcsreq.user.cert.renew");
    pkcsReqUserCertRenewElem.checked = renewCASignedCert;


    // dump("doOnloadInitScepClientWizard():...................10.\n");


    initScepServerURL();

    try {
    	pkcsReqUserNickNameMenuListChanged(pkcsReqUserCertPickerElem);
    } catch(e) {
    	alert("pkcsReqUserNickNameMenuListChanged() failed - " + e);
    }

    try {
    	pkcsReqCaNickNameMenuListChanged(pkcsReqCACertPickerElem);
    } catch(e) {
    	alert("pkcsReqCaNickNameMenuListChanged() failed - " + e);
    }

    // dump("doOnloadInitScepClientWizard():...................End.\n");
}


function handleScepReqMsgTypeChange(aReqMsgTypeMenuListElem, reqMsgTypeSelectedMenuItem)
{
}

/*
function scepClientForm_certNickNameMenuListChanged(menuListElem, selectedItemElem, certItemPrefix)
{
    return;
}

function XXX_scepClientForm_certNickNameMenuListChanged(menuListElem, selectedItemElem, certItemPrefix)
{
    dump("scepClientForm_certNickNameMenuListChanged(" + menuListElem.id + "):......Start.\n");

    if (certItemPrefix != null) {
    	setCertAttribute((certItemPrefix + '.subjdn'), " ");
    	setCertAttribute((certItemPrefix + '.issuedby'), " ");
    	setCertAttribute((certItemPrefix + '.validityend'), " ");
    	setCertAttribute((certItemPrefix + '.serialnumber'), " ");
    }

    var selectedCert = menuListElem.getSelectedCert();
    if (selectedCert == null) {
	dump("scepClientForm_certNickNameMenuListChanged(): selectedCert == null.\n");
    	return;
    }

    if (certItemPrefix != null) {
    	// issuerSubjectDNElem.value = signerCert.subjectName;
    	setCertAttribute((certItemPrefix + '.subjdn'), selectedCert.subjectName);
    	setCertAttribute((certItemPrefix + '.issuedby'), selectedCert.issuerName);
    	setCertAttribute((certItemPrefix + '.validityend'), selectedCert.validity.notAfterLocalDay);
    	setCertAttribute((certItemPrefix + '.serialnumber'), selectedCert.serialNumber);
    }
    dump("scepClientForm_certNickNameMenuListChanged():......End.\n");
}

function setCertAttribute(nodeName, value)
{
    // alert("setCertAttribute(): nodeName: " + nodeName + " value: " + value);

    var node = document.getElementById(nodeName);
    if (node == null) {
	// dump("setCertAttribute() :  couldn't find node : " + nodeName + "\n");
        return;
    }
    if (value == null) {
	// dump("setCertAttribute() :  node " + nodeName + " has null value.\n");
        return;
    }
    node.setAttribute('value', value)
}

function viewSelectedCertMenuItem(aCertNickNameMenuListId)
{
    var certCertPickerElem = document.getElementById(aCertNickNameMenuListId);
    if (certCertPickerElem == null) {
    	return;
    }
    if (certCertPickerElem.selectedIndex < 0) {
    	return;
    }
    if (certCertPickerElem.selectedItem == null) {
    	return;
    }
    if (certCertPickerElem.selectedItem.label == null) {
    	return;
    }
    if (certCertPickerElem.selectedItem.value == null) {
    	return;
    }

    viewSelectedCertByDbKey(window, certCertPickerElem.selectedItem.value);

}

function viewSelectedCertDbKeyText(aCertDbKeyTextId)
{
    var aCertDbKeyTextElem = document.getElementById(aCertDbKeyTextId);
    if (aCertDbKeyTextElem == null) {
    	return;
    }
    
    var retVal = false;
    if (aCertDbKeyTextElem.certRef) {
    	retVal = viewSelectedCert(window, aCertDbKeyTextElem.certRef);
	if (retVal) {
	    return;
	}
	return;
    }
    viewSelectedCertByDbKey(window, aCertDbKeyTextElem.value);
}

function viewSelectedCertNickNameText(aCertNickNameTextId)
{
    var aCertNickNameTextElem = document.getElementById(aCertNickNameTextId);
    if (aCertNickNameTextElem == null) {
    	return;
    }

    var retVal = false;
    if (aCertNickNameTextElem.certRef) {
    	retVal = viewSelectedCert(window, aCertNickNameTextElem.certRef);
	if (retVal) {
	    return;
	}
    }
    if (aCertNickNameTextElem.dbKey) {
    	retVal = viewSelectedCertByDbKey(window, aCertNickNameTextElem.dbKey);
	if (retVal) {
	    return;
	}
    }
    viewSelectedCertByNickName(window, aCertNickNameTextElem.value);
}

function viewSelectedCertText(aCertNickNameTextId)
{
    viewSelectedCertNickNameText(aCertNickNameTextId);
}
*/

function handleReqCertRenew(certReqRenewElem)
{
    // dump("handleReqCertRenew():......Start.\n");
    if (certReqRenewElem.checked) {
    	pkcsReqUserCertPickerElem.certtype = "user_casigned";
    }
    else {
    	pkcsReqUserCertPickerElem.certtype = "user_selfsigned";
    }

    try {
    	pkcsReqUserNickNameMenuListChanged(pkcsReqUserCertPickerElem);
    } catch(e) {
    	// pkcsReqUserCertPickerElem.selectedIndex = -1;
    }
    // dump("handleReqCertRenew():......End.\n");
}

function initUserCSROutFile()
{
    // dump("initUserCSROutFile():..................Start.\n");

    var selectedCert = pkcsReqUserCertPickerElem.getSelectedCert();
    var csrFileNamePrefix = pkcsReqUserCertPickerElem.adaptNickName(selectedCert, true);

    var fileFormatStr = (pkcsReqUserPKCS10CSRFilePickerElem.ascii ? "base64" : "der");
    var csrFileName = csrFileNamePrefix + "_pkcs10_csr_" + fileFormatStr + ".p10";
    // dump("initUserCSROutFile(): csrFileName: " + csrFileName + "\n");

    var /* nsIFile */ tmpCsrOutFile = null;
    tmpCsrOutFile = pkcsReqUserPKCS10CSRFilePickerElem.file;
    if (tmpCsrOutFile == null) {
    	tmpCsrOutFile = pkcsReqUserPKCS10CSRFilePickerElem.autoSelectTempFile("KeyManager/CSRTmp", csrFileName);
    }

    // dump("initUserCSROutFile():..................End.\n");
}

function initScepReqOutFile()
{
    var fileFormatStr = (scepClientScepCsrFilePickerElem.ascii ? "base64" : "der");
    var selectedCert = pkcsReqUserCertPickerElem.getSelectedCert();

    var scepCsrFileNamePrefix = pkcsReqUserCertPickerElem.adaptNickName(selectedCert, true);
    var scepCsrFileName = scepCsrFileNamePrefix + "_scep_csr_" + fileFormatStr + ".p7m";
    // dump("initScepReqOutFile(): scepCsrFileName: " + scepCsrFileName + "\n");

    var /* nsIFile */ tmpCsrOutFile = null;
    tmpCsrOutFile = scepClientScepCsrFilePickerElem.file;
    if (tmpCsrOutFile == null) {
    	tmpCsrOutFile = scepClientScepCsrFilePickerElem.autoSelectTempFile(
    			"KeyManager/CSRTmp", scepCsrFileName
			);
    }
}

function initScepGetCertIntialOutFile(userCert)
{
    if (!userCert) {
    	return;
    }
    var /* nsIFile */ tmpCsrOutFile = null;
    tmpCsrOutFile = scepClientGetCertInitialFilePathElem.file;
    if (tmpCsrOutFile) {
    	return;
    }

    var fileFormatStr = (scepClientGetCertInitialFilePathElem.ascii ? "base64" : "der");
    var selectedCert = userCert;
    var gciFileNamePrefix = gSCEPGetCertUserCertPickerElem.adaptNickName(selectedCert, true);
    var gciFileName = gciFileNamePrefix + "_scep_gci_" + fileFormatStr + ".p7m";

    tmpCsrOutFile = scepClientGetCertInitialFilePathElem.autoSelectTempFile("KeyManager/CSRTmp", gciFileName);
}

function initScepGetCertOutFile(userCert)
{
    // dump("initScepGetCertOutFile():............................Start.\n");

    if (!userCert) {
    	return;
    }
    var /* nsIFile */ tmpCsrOutFile = null;
    tmpCsrOutFile = scepClientGetCertFilePathElem.file;
    if (tmpCsrOutFile) {
    	// dump("initScepGetCertOutFile():............................End(0).\n");
    	return;
    }

    var selectedCert = userCert;
    var gcFileNamePrefix = gSCEPGetCertUserCertPickerElem.adaptNickName(selectedCert, true);


    var fileFormatStr = (scepClientGetCertFilePathElem.ascii ? "base64" : "der");
    var gcFileName = gcFileNamePrefix + "_scep_getcert_" + fileFormatStr + ".p7m";

    tmpCsrOutFile = scepClientGetCertFilePathElem.autoSelectTempFile("KeyManager/CSRTmp", gcFileName);

    // dump("initScepGetCertOutFile(): scepClientGetCertFilePathElem.filepath: " + scepClientGetCertFilePathElem.filepath + "\n");
    // dump("initScepGetCertOutFile():............................End.\n");
}

function initScepGetCertOutFileWithName(aGCFileNamePrefix)
{
    var fileFormatStr = (scepClientGetCertFilePathElem.ascii ? "base64" : "der");
    var gcFileName = aGCFileNamePrefix + "_scep_getcert_" + fileFormatStr + ".p7m";
    tmpCsrOutFile = scepClientGetCertFilePathElem.autoSelectTempFile("KeyManager/CSRTmp", gcFileName);
}



function initScepRespOutFile()
{
    var fileFormatStr = (scepClientScepRespMsgFilepickerElem.ascii ? "base64" : "der");
    var selectedCert = scepClientScepReqMsgUserCertItemElem.cert;
    var scepResponseFileNamePrefix = pkcsReqUserCertPickerElem.adaptNickName(selectedCert, true);
    var scepResponseFileName = scepResponseFileNamePrefix + "_scep_resp_" + fileFormatStr + ".p7m";
    // dump("initScepRespOutFile(): scepResponseFileName: " + scepResponseFileName + "\n");

    var /* nsIFile */ tmpScepOutFile = null;
    tmpScepOutFile = scepClientScepRespMsgFilepickerElem.file;
    if (tmpScepOutFile == null) {
    	tmpScepOutFile = scepClientScepRespMsgFilepickerElem.autoSelectTempFile("KeyManager/CertTmp", scepResponseFileName);
    }
}

function initScepRespCertOutFile()
{
    var fileFormatStr = (scepClientScepRespCertFilePickerElem.ascii ? "base64" : "der");
    var selectedCert = scepClientScepReqMsgUserCertItemElem.cert;
    var scepResponseFileNamePrefix = pkcsReqUserCertPickerElem.adaptNickName(selectedCert, true);
    var scepResponseFileName = scepResponseFileNamePrefix + "_scep_cert_" + fileFormatStr + ".p7m";
    // dump("initScepRespCertOutFile(): scepResponseFileName: " + scepResponseFileName + "\n");

    var /* nsIFile */ tmpScepOutFile = null;
    tmpScepOutFile = scepClientScepRespCertFilePickerElem.file;
    if (tmpScepOutFile == null) {
    	tmpScepOutFile = scepClientScepRespCertFilePickerElem.autoSelectTempFile("KeyManager/CertTmp", scepResponseFileName);
    }
}

function displayAsciiFileItemData(isAsciiFile, filePathFieldId, asciiDataFieldId)
{
    /*
    dump("displayAsciiFileItemData(" + 
    		" isAsciiFile: " + isAsciiFile +
    		" filePathFieldId: " + filePathFieldId +
    		" asciiDataFieldId: " + asciiDataFieldId +
    		"):..................Start.\n");
    */

    if (isAsciiFile == false) {
    	return;
    }

    var asciiDataElem = document.getElementById(asciiDataFieldId);
    if (asciiDataElem == null) {
    	return;
    }
    asciiDataElem.hidden = true;

    var filePathElem = document.getElementById(filePathFieldId);
    if (filePathElem == null) {
	dump("displayAsciiFileItemData():  filePathElem: " + filePathFieldId + " is missing.\n");
    	return;
    }
    if (filePathElem.file == null) {
	dump("displayAsciiFileItemData(): filePathElem.file is null.\n");
    	return;
    }

    // var asciiData = readDataFromFilePath(filePathElem.value);
    var asciiData = filePathElem.readFile();
    if (asciiData == null) {
    	asciiData = "< File does not exists. >";
    }
    else if (asciiData.length == 0) {
    	asciiData = "< Zero-Length File. >";
    }
    asciiDataElem.value = asciiData;

    asciiDataElem.hidden = false;

    // dump("displayAsciiFileItemData():..................End.\n");
}

function pkcsReqUserNickNameMenuListChanged(aPKCSReqUserCertPickerElem, ev)
{
    // dump("scepClientForm.js:pkcsReqUserNickNameMenuListChanged():......Start.\n");

    pkcsReqUserPKCS10CSRFilePickerElem.value = "";
    initUserCSROutFile();

    scepClientScepCsrFilePickerElem.filepath = "";
    initScepReqOutFile();

    scepClientScepReqMsgFileDataElem.value = "";
    scepClientScepReqMsgFilePickerElem.file = null;

    scepClientScepRespMsgFilepickerElem.value = "";
    scepClientScepRespMsgFileDataElem.value = "";

    scepClientScepRespImportCertFileDataElem.value = "";

    // dump("scepClientForm.js:pkcsReqUserNickNameMenuListChanged():......End.\n");
}

function pkcsReqCaNickNameMenuListChanged(aSCEPRecipientCertPickerElem, ev)
{
    // scepClientScepReqMsgGroupElem.hidden = true;
    scepClientScepReqMsgFileDataElem.value = "";
}

function getSelectedUserCertNickName()
{
    var selectedCert = pkcsReqUserCertPickerElem.getSelectedCert();
    if (selectedCert == null) {
    	return null;
    }
    return selectedCert.nickname;
}


function selectPKCS10CSROutFile(filePathElemId)
{
    var fileFormat = "b64";
    // var userNickName = getSelectedUserCertNickName();
    var userNickName = pkcsReqUserCertPickerElem.adaptNickName();
    if  (userNickName == null) {
    	userNickName = "UnknownUser";
    }
    var csrFileName = userNickName + "_pkcs10.csr";
    var displayDir = pickTempDir("KeyManager/CSRTmp");

    var /* nsIFile */ tmpCsrOutFile = XULFileUtil_pickCSROutFile(
    		filePathElemId,
		"Choose PKCS#10 File for User Key",
    		displayDir, csrFileName
		);

}

function generateCSR()
{
    // dump("generateCSR():...................................Start.\n");

    var userCert = pkcsReqUserCertPickerElem.getSelectedCert();
    var pkcs9ChallengePassword = SCEPClient_trim(pkcsReqUserChallengePWElem.value);
    var outCSRFilePickerElem = pkcsReqUserPKCS10CSRFilePickerElem;

    generateCSRWithParam(userCert, pkcs9ChallengePassword, outCSRFilePickerElem);

    // dump("generateCSR():...................................End.\n");
}

function generateCSRWithParam(aUserX509Cert, aChallengePW, aOutCSRFilePickerElem)
{
    // dump("generateCSRWithParam():...................................Start.\n");

    if (aUserX509Cert == null) {
    	return false;
    }

    if (!aOutCSRFilePickerElem.file) {
    	return false;
    }
    
    // Force token login - on windows the popup window for password is not coming up
    loginToCertToken(aUserX509Cert);

    try {
    	var certProps = null;
    	// dump("generateCSRWithParam(): aChallengePW: |" + aChallengePW + "|\n");
	if (aChallengePW && (aChallengePW != "")) {
	    certProps = Components.classes["@mozilla.org/persistent-properties;1"]
				.createInstance(Components.interfaces.nsIPersistentProperties);
    	    var propKey;
    	    var propValue;
    	    var propOldValue;
    	    propKey = "pkcs9ChallengePassword"; propValue = aChallengePW;
    	    propOldValue = certProps.setStringProperty(propKey, propValue);
    	    // dump("generateCSRWithParam():...................................20.\n");
	}
    	keyManager.generatePKCS10CSRByX509CertToFile(
    					aUserX509Cert,
					certProps,
					aOutCSRFilePickerElem.ascii,
					aOutCSRFilePickerElem.file
					);
    } catch (ex) {
	alert("generateCSRWithParam(): keyManager.generatePKCS10CSRByX509CertToFile() failed - ex : " + ex);
    	return false;
    }
    // dump("generateCSRWithParam(): CSR for " + aUserX509Cert.nickname + " is exported to file: " + aOutCSRFilePickerElem.filepath + "\n");

    // scepClientCSRFileDataElem.hidden = true;


    scepClientScepReqMsgGroupElem.hidden = false;

    // dump("generateCSRWithParam():...................................End.\n");
    return true;
}

function selectScepGetCertIntialOutFile(filePathElemId)
{
    var fileFormat = "b64";
    // var userNickName = null; // getSelectedUserCertNickName();
    var userNickName = pkcsReqUserCertPickerElem.adaptNickName();
    if  (userNickName == null) {
    	userNickName = "UnknownUser";
    }
    var scepFileName = userNickName + "_" + "req" + "_scep.p7";

    var displayDir = pickTempDir("KeyManager/CSRTmp");
    var /* nsIFile */ tmpScepOutFile = XULFileUtil_pickPkcs7OutFile(
    		filePathElemId,
		"Choose PKCS7 File for GetCertIntial Message",
    		displayDir, scepFileName
		);
}

function selectScepGetCertOutFile(filePathElemId)
{
    var fileFormat = "b64";
    // var userNickName = null; // getSelectedUserCertNickName();
    var userNickName = pkcsReqUserCertPickerElem.adaptNickName();
    if  (userNickName == null) {
    	userNickName = "UnknownUser";
    }
    var scepFileName = userNickName + "_" + "req" + "_scep.p7";

    var displayDir = pickTempDir("KeyManager/CSRTmp");
    var /* nsIFile */ tmpScepOutFile = XULFileUtil_pickPkcs7OutFile(
    		filePathElemId,
		"Choose PKCS7 File for GetCert Message",
    		displayDir, scepFileName
		);

}

function selectScepReqOutFile(filePathElemId)
{
    var fileFormat = "b64";
    // var userNickName = getSelectedUserCertNickName();
    // var userNickName = scepClientScepReqMsgUserCertItemElem.value;
    var userNickName = scepClientScepReqMsgUserCertItemElem.adaptNickName();
    if  (userNickName == null) {
    	userNickName = "UnknownUser";
    }
    var scepFileName = userNickName + "_" + "req" + "_scep.p7";

    var displayDir = pickTempDir("KeyManager/CSRTmp");

    var /* nsIFile */ tmpScepOutFile = XULFileUtil_pickPkcs7OutFile(
    		filePathElemId,
		"Choose PKCS7 File for SCEP CSR Message",
    		displayDir, scepFileName
		);
}

function selectScepRespOutFile(filePathElemId)
{
    var fileFormat = "b64";
    // var userNickName = getSelectedUserCertNickName();
    // var userNickName = scepClientScepReqMsgUserCertItemElem.value;
    var userNickName = scepClientScepReqMsgUserCertItemElem.adaptNickName();
    if  (userNickName == null) {
    	userNickName = "UnknownUser";
    }
    var scepFileName = userNickName + "_" + "resp" + "_scep.p7";

    var displayDir = pickTempDir("KeyManager/CertTmp");
    var /* nsIFile */ tmpScepOutFile = XULFileUtil_pickPkcs7OutFile(
    		filePathElemId,
		"Choose PKCS7 File for SCEP Response Message",
    		displayDir, scepFileName
		);
}

function selectScepRespCertOutFile(filePathElemId)
{
    var fileFormat = "b64";
    // var userNickName = getSelectedUserCertNickName();
    // var userNickName = scepClientScepReqMsgUserCertItemElem.value;
    var userNickName = scepClientScepReqMsgUserCertItemElem.adaptNickName();
    if  (userNickName == null) {
    	userNickName = "UnknownUser";
    }
    var p7CertFileName = userNickName + "_p7.cer";

    var displayDir = pickTempDir("KeyManager/CertTmp");

    var /* nsIFile */ tmpScepOutFile = XULFileUtil_pickPkcs7OutFile(
    		filePathElemId,
		"Choose PKCS7 File for Cert in Response Message",
    		displayDir, p7CertFileName
		);
}

function convertCertSerialHexToNum(certSerialHex)
{
    var certSerialHexItems = certSerialHex.split(":");
    var certSerialHexStr = "0x";
    for (var i = 0; i < certSerialHexItems.length; i++) {
	certSerialHexStr += certSerialHexItems[i];
    }

    var certSerialNum = parseInt(certSerialHexStr, 16);
    var certSerialNumStr = "" + certSerialNum;
    var padLen = 16 - certSerialNumStr.length;
    for (var i = 0; i < padLen; i++) {
    	certSerialNumStr = "0" + certSerialNumStr;
    }
    return certSerialNumStr;
}


var gScepReqTransactionId = null;
var gScepReqSenderNonce = null;

function generateScepRequest()
{
    // dump("doGenerateScepReq():..........................Start.\n");

    var userCert = pkcsReqUserCertPickerElem.getSelectedCert();
    var caCert = pkcsReqCACertPickerElem.getSelectedCert();

    generateScepRequestWithCerts(userCert, caCert, false);

    // dump("doGenerateScepReq():..........................Start.\n");
}

function generateScepRequestWithCerts(aUserCert, aScepRecipientCert, aScepRecipientRA)
{
    // dump("generateScepRequestWithCerts():..........................Start.\n");

    var pkcs10CsrFile = pkcsReqUserPKCS10CSRFilePickerElem.file;
    if (pkcs10CsrFile == null) {
    	pkcs10CsrFile = getLocalFile(pkcsReqUserPKCS10CSRFilePickerElem.value);
    }
    var pkcs10CsrFileIsAscii = pkcsReqUserPKCS10CSRFilePickerElem.ascii;

    var scepCsrFile = scepClientScepCsrFilePickerElem.file;
    if (scepCsrFile == null) {
        scepCsrFile = getLocalFile(scepClientScepCsrFilePickerElem.value);
    }
    var scepCsrFileIsAscii = scepClientScepCsrFilePickerElem.ascii;
    if ((pkcs10CsrFile == null) || (scepCsrFile == null)) {
	alert("CSR file field is empty.");
    	return false;
    }
    if (!pkcs10CsrFile.exists) {
	alert("CSR file : " + pkcs10CsrFile.path + " does not exists.");
    	return false;
    }


    var userCert = aUserCert;

    if (userCert == null) {
	alert("Select an user certificate.");
    	return false;
    }

    var caCert = aScepRecipientCert;
    if (caCert == null) {
	alert("Select an issuer (CA) certificate.");
    	return false;
    }

    scepClientScepReqMsgUserCertItemElem.cert	= userCert;
    scepClientScepReqMsgIssuerCertItemElem.cert	= caCert;

    gScepReqTransactionId = convertCertSerialHexToNum(userCert.serialNumber);
    /*
    var scepReqTransactionIdHexStr = userCert.serialNumber;
    var scepReqTransactionIdHexItems = scepReqTransactionIdHexStr.split(":");
    scepReqTransactionIdHexStr = "0x";
    for (var i = 0; i < scepReqTransactionIdHexItems.length; i++) {
	scepReqTransactionIdHexStr += scepReqTransactionIdHexItems[i];
    }
    var scepReqTransactionNum = parseInt(scepReqTransactionIdHexStr, 16);
    gScepReqTransactionId = "" + scepReqTransactionNum;
    var padLen = 16 - gScepReqTransactionId.length;
    for (var i = 0; i < padLen; i++) {
    	gScepReqTransactionId = "0" + gScepReqTransactionId;
    }
    */

    var now = new Date();
    gScepReqSenderNonce = "" + (Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000);
    gScepReqSenderNonce = gScepReqSenderNonce + now.getTime() + gScepReqSenderNonce;
    gScepReqSenderNonce = gScepReqSenderNonce.substring(0, 16);
    // dump("generateScepRequestWithCerts():senderNonce: " + gScepReqSenderNonce + "(" + gScepReqSenderNonce.length + ")\n");

    var hashAlgName = pkcsReqScepReqHashAlgNameElem.value;

    /*
    dump("generateScepRequestWithCerts(): " + 
			"Invoking createScepPkcsReqMessageByCert() \n" + 
			"  userAlias: " + userCert.nickname + "\n" + 
			"  caAlias: " + caCert.nickname + "\n" + 
			"  gScepReqTransactionId: " + gScepReqTransactionId + "\n" + 
			"  hashAlgName: " + hashAlgName + "\n" + 
			"  gScepReqSenderNonce: " + gScepReqSenderNonce + "\n" + 
			"");
    */

    try {
    	scepPkiClient.createScepPkcsReqMessageByCert(
					pkcs10CsrFile, pkcs10CsrFileIsAscii,
					userCert, caCert,
					gScepReqTransactionId, hashAlgName, gScepReqSenderNonce,
					scepCsrFile, scepCsrFileIsAscii
    					);
    } catch (ex) {
	alert("generateScepRequestWithCerts(): createScepPkcsReqMessageByCert() failed - scepCsrGenStatus: " + ex);
    	return false;
    }

    scepClientScepReqMsgFilePickerElem.ascii		= scepClientScepCsrFilePickerElem.ascii;
    scepClientScepReqMsgFilePickerElem.file		= scepClientScepCsrFilePickerElem.file;

    scepClientScepReqMsgFileDataElem.hidden = true;
    if (scepClientScepReqMsgFilePickerElem.ascii) {
    	displayAsciiFileItemData(scepClientScepReqMsgFilePickerElem.ascii, 
    				"keymgr.scepclient.scepreqmsg.file.path",
				"keymgr.scepclient.scepreqmsg.file.asciiData"
				);
    	scepClientScepReqMsgFileDataElem.hidden = false;
    }

    scepClientScepReqMsgUserCertItemElem.cert	= userCert;
    scepClientScepReqMsgIssuerCertItemElem.cert	= caCert;

    scepClientScepReqMsgTransactionIdElem.value	= gScepReqTransactionId;
    scepClientScepReqMsgServerUrlElem.value	= pkcsReqScepServerURLElem.value;

    initScepRespOutFile();
    initScepRespCertOutFile();

    scepClientScepRespMsgGroupElem.hidden = false;

    // dump("generateScepRequestWithCerts():..........................End.\n");
    return true;
}

function generateFormScepRequest()
{
    generateScepRequest();
}


function initScepServerURL()
{
    // dump("initScepServerURL():..........................Start.\n");

    // Initialize CA Server URL 
    pkcsReqScepServerURLElem = document.getElementById("keymgr.scepclient.pkcsreq.issuer.server.url");
    var defaultScepServerURLList = [
	"http://localhost:18080/certdemo/scep/cgi-bin/pkiclient.exe"
	];
    for (var i = 0; i < defaultScepServerURLList.length; i++) {
    	var scepServerURL = defaultScepServerURLList[i];
	pkcsReqScepServerURLElem.value = scepServerURL;
	handleScepServerURLFieldChange(pkcsReqScepServerURLElem);
    }
    pkcsReqScepServerURLElem.value = "";

    handleScepServerURLFieldChange(pkcsReqScepServerURLElem);

    // dump("initScepServerURL():..........................End.\n");
}

function handleScepServerURLFieldChange(aSrcTextBoxElem)
{
    textboxAutoCompleteAction(aSrcTextBoxElem);
}

function textboxAutoCompleteAction(aSrcTextBoxElem)
{

    var formFieldKey = aSrcTextBoxElem.id;
    var formFieldValue = aSrcTextBoxElem.value;
    if (formFieldValue == "") {
    	return;
    }
    // alert("caServerFieldAutoCompleteAction(" + formFieldKey + " = " + formFieldValue + ")");

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

/*
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

function loginToCAServer()
{
    var caServerCertSignURL = pkcsReqScepServerURLElem.value;
    if (caServerCertSignURL == "") {
    	return false;
    }
    
    // var caServerType = caServerTypeElem.selectedItem.value;
    var caServerType = "pkcs10CA";
    var caServerURLObj = getCAServerLoginURL(
    				caServerCertSignURL,
				"form",
				caServerType
				);
    if (caServerURLObj == null) {
    	return false;
    }

    dump("caServerLoginURL: " + caServerURLObj.caServerLoginURL + "\n");
    dump("caServerURL: " + caServerURLObj.caServerURL + "\n");
    var retVal = loginToWebServer(caServerURLObj.caServerLoginURL, caServerURLObj.caServerURL);

    // setPrefValue((caServerTypeElem.id + ".default"), "String", caServerType);
    // setPrefValue((caServerCertSignURLElem.id + "." + caServerType), "String", caServerCertSignURLElem.value);

    return retVal;
}

function loginToWebServer(webServerLoginURL, webServerHomeURL)
{

    var params = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
    			.createInstance(Components.interfaces.nsIDialogParamBlock);
    params.SetInt(0, 2);
    params.SetString(0, webServerLoginURL);
    params.SetString(1, webServerHomeURL);
    var loginConsoleWin = window.openDialog('chrome://keymanager/content/generateCSRCAServerLoginConsole.xul', "",
                    			'chrome,centerscreen,resizable,modal', params);

    if (params.GetInt(0) == 0) { // Selected Cancel or failed.
    	return false;
    }
    return true;
}

function getCACertChain(caServerURLElemId, httpResponseTragetWindowId)
{
    var caServerURLElem = document.getElementById(caServerURLElemId);
    if (caServerURLElem == null) {
    	return false;
    }
    var caServerURLObj = getCAServerLoginURL(
    				caServerURLElem.value,
				"wizard",
				"pkcs10CA"
				);
    if (caServerURLObj == null) {
    	return false;
    }
    return getCACertChainByURL(caServerURLObj.caServerDownloadCertChainURL, httpResponseTragetWindowId);
}

var SCEP_CLIENT_WIZARD_GetCACertWindowId = "ScepClientWizardLoginConsoleIFrame";

function getCACertChainByURLElemId(caServerURLElemId, httpResponseTragetWindowId)
{
    var caServerURLElem = document.getElementById(caServerURLElemId);
    if (caServerURLElem == null) {
    	return false;
    }
    return getCACertChainByURL(caServerURLElem.value, httpResponseTragetWindowId);
}

function getCACertChainByURL(caServerURL, httpResponseTragetWindowId)
{
    var httpTargetWindowId = httpResponseTragetWindowId;
    if (!httpTargetWindowId) {
    	httpTargetWindowId = SCEP_CLIENT_WIZARD_GetCACertWindowId;
    }

    var scepClientWizardTargetWindowElem = document.getElementById(httpTargetWindowId);
    if (scepClientWizardTargetWindowElem == null) {
    	return false;
    }
    scepClientWizardTargetWindowElem.contentWindow.location = caServerURL;

    return true;
}
*/

function handleScepRespMsgCBFunc(responseData, /* nsIChannel */ aChannel, aStatus)
{
    // dump("handleScepRespMsgCBFunc():..................Start.\n");


    dump("handleScepRespMsgCBFunc(): contentType: " + aChannel.contentType + " aStatus: " + aStatus + "\n");

    // var scepRespMsgFilePath = handleScepRespMsgCBFunc.targetFilePath;
    handleScepRespMsgCBFunc.targetFilePath = null;

    if (responseData == null) {
    	alert("handleScepRespMsgCBFunc(): Http invocation failed - status: " + aStatus);
	return;
    }
    if (responseData.length <= 0) {
    	alert("handleScepRespMsgCBFunc(): Http invocation failed - responseData.length: " + responseData.length);
	return;
    }

    var scepRespMsgFile = scepClientScepRespMsgFilepickerElem.file;
    var scepRespMsgFilePath = scepClientScepRespMsgFilepickerElem.value;
    var scepRespMsgFileIsAscii = scepClientScepRespMsgFilepickerElem.ascii;

    // dump("handleScepRespMsgCBFunc(): targetFilePath: " + scepRespMsgFilePath + " responseData.length: " + responseData.length + "\n");

    scepClientScepRespMsgFilepickerElem.saveFile(responseData);

    // saveDataToFile(responseData, scepRespMsgFile);

    scepClientScepRespImportCertGroupElem.hidden = false;

    // dump("handleScepRespMsgCBFunc():..................30.\n");

    var userCert = scepClientScepReqMsgUserCertItemElem.cert;
    var userAlias = userCert.nickname;
    if  (userAlias == null) {
    	userAlias = "UnknownUser";
    }
    var caCert = scepClientScepReqMsgIssuerCertItemElem.cert;
    var caAlias = caCert.nickname;

    var /* nsIFile */ aOutPkcs7CertFile = scepClientScepRespCertFilePickerElem.file;
    if (aOutPkcs7CertFile == null) {
        aOutPkcs7CertFile = getLocalFile(scepClientScepRespCertFilePickerElem.value);
    }
    var aOutPkcs7CertFileIsAscii = scepClientScepRespCertFilePickerElem.ascii;

    var pkiStatusObj = new Object();
    var failureInfoObj = new Object();
    var scepCerReadStatus;
    try {
    	scepCerReadStatus = scepPkiClient.readScepCertRespPKIMessageByCertToFile(
					scepRespMsgFile, false,
					userCert, 
					caCert,
					gScepReqTransactionId, gScepReqSenderNonce,
					aOutPkcs7CertFile, aOutPkcs7CertFileIsAscii,
					pkiStatusObj, failureInfoObj
    					);
    } catch (ex) {
    	alert("scepPkiClient.readScepCertRespPKIMessageByCertToFile() failed to parse PKCS#7 response - " + ex);
	return;
    }
    var pkiStatus = pkiStatusObj.value;
    var failureInfo = failureInfoObj.value;
    // dump("handleScepRespMsgCBFunc():..................40.\n");
    switch (pkiStatus) {
    	case alrIScepPkiClient.PKIStatus_FAILURE: 
	    alert("SCEP request failed - failure-id: " + failureInfo);
	    return;
    	case alrIScepPkiClient.PKIStatus_PENDING: 
	    // Save the SCEP Request info as preference for future query 
	    alert("SCEP request is Pending.");
	    return;
    	case alrIScepPkiClient.PKIStatus_SUCCESS: 
	    break;
    	default:
	    alert("Invalid PKI Status for SCEP response.");
	    return;
    }

    scepClientScepRespImportCertFileDataElem.hidden = true;
    if (scepClientScepRespCertFilePickerElem.ascii) {
    	displayAsciiFileItemData(scepClientScepRespCertFilePickerElem.ascii, 
    				"keymgr.scepclient.pkcsreq.importcert.file.path",
				"keymgr.scepclient.pkcsreq.importcert.file.asciiData"
				);
    	scepClientScepRespImportCertFileDataElem.hidden = false;
    }

    // dump("handleScepRespMsgCBFunc():..................End.\n");
}


function sendScepCsrPkcs7()
{
    sendScepPKIRequest(null, null);
}

// function sendScepPKIRequest(responseCBFunc, pkiStatus)
function sendScepPKIRequest(responseCBFunc, aScepReqMsgType)
{
    var retVal = false;

    var httpMethod = "POST";
    httpMethod = scepClientScepReqMsgServerHttpMethodElem.selectedItem.value;

    retVal = sendScepPKIRequestWithHttpMethod(responseCBFunc, aScepReqMsgType, httpMethod, true);
    return retVal;
}

function sendScepPKIRequestWithHttpMethod(responseCBFunc, aScepReqMsgType, aHttpMethod, aEncodeMsgParam)
{
    /*
    dump("sendScepPKIRequestWithHttpMethod():..................Start.\n");
    dump("sendScepPKIRequestWithHttpMethod(): aScepReqMsgType: " + aScepReqMsgType + "\n");
    dump("sendScepPKIRequestWithHttpMethod(): aHttpMethod: " + aHttpMethod + "\n");
    dump("sendScepPKIRequestWithHttpMethod(): aEncodeMsgParam: " + aEncodeMsgParam + "\n");
    */

    var retVal = false;
    try {
        if ((aHttpMethod == "GET") || (aHttpMethod == "get")) {
    	    retVal = sendScepPKIRequestWithHttpParam(responseCBFunc, aScepReqMsgType, aHttpMethod, aEncodeMsgParam);
        }
        else if ((aHttpMethod == "POST-FORM") || (aHttpMethod == "post-form")) {
    	    retVal = sendScepPKIRequestWithHttpParam(responseCBFunc, aScepReqMsgType, "POST", aEncodeMsgParam);
        }
        else if ((aHttpMethod == "POST") || (aHttpMethod == "post")) {
    	    retVal = sendScepPKIRequestWithPostMethod(responseCBFunc, aScepReqMsgType, aEncodeMsgParam);
	}
        else {
	    dump("sendScepPKIRequestWithHttpMethod(): invalid HTTP method: " + aHttpMethod + "\n");
	    retVal = false;
        }
    } catch (ex) {
    	dump("sendScepPKIRequestWithHttpMethod(): failed - ex: " + ex + "\n");
	throw ex;
    }

    // dump("sendScepPKIRequestWithHttpMethod():..................End.\n");
    return retVal;
}

function sendScepPKIRequestWithHttpParam(responseCBFunc, aScepReqMsgType, aHttpMethod, aEncodeMsgParam)
{
    // dump("sendScepPKIRequestWithHttpParam():..................Start.\n");


    var /* nsILocalFile */ scepReqFile = scepClientScepReqMsgFilePickerElem.file;
    if (scepReqFile == null) {
        scepReqFile = getLocalFile(scepClientScepReqMsgFilePickerElem.value);
    }
    var scepReqFileIsAscii = scepClientScepReqMsgFilePickerElem.ascii;

    var scepReqMsgBase64Data = null;
    if (scepReqFileIsAscii) {
    	scepReqMsgBase64Data = scepClientScepReqMsgFilePickerElem.readBase64Data(false);
    }
    else {
    	var scepReqMsgBinData = scepClientScepReqMsgFilePickerElem.getBytes();

	var base64Svc = Components.classes["@avaya.com/pkm/base64;1"]
				.getService(Components.interfaces.alrIBase64);
	scepReqMsgBase64Data = base64Svc.encode(scepReqMsgBinData, scepReqMsgBinData.length);
    }
    // dump("sendScepPKIRequestWithHttpParam(): scepReqMsgBase64Data: \n" + scepReqMsgBase64Data + "\n");

    var userNickName = scepClientScepReqMsgUserCertItemElem.cert.nickname;
    if  (userNickName == null) {
    	userNickName = "UnknownUser";
    }
    var caNickName = scepClientScepReqMsgIssuerCertItemElem.cert.nickname;

    var aRemoteURL = scepClientScepReqMsgServerUrlElem.value;
    // dump("sendScepPKIRequestWithHttpParam(): aRemoteURL: " + aRemoteURL + "\n");

    var httpMethod = aHttpMethod;


    var aReqParamStr = "operation=" + "PKIOperation";

    // TODO: Just for Test 
    if ((aRemoteURL.indexOf("localhost") >= 0) ||
    		(aRemoteURL.indexOf("gemstar.research") >= 0) ||
    		(aRemoteURL.indexOf("quasar") >= 0)) {
        // JUST for test
        aReqParamStr += "&" + "caAlias=" + encodeURIComponent(caNickName);
	/*
	if (aEncodeMsgParam) {
            aReqParamStr += "&" + "caAlias=" + encodeURIComponent(caNickName);
	}
	else {
            aReqParamStr += "&" + "caAlias=" + caNickName;
	}
	*/
        var pkiStatus = "pending";
        if ((aScepReqMsgType != null) && (aScepReqMsgType != "PKCSReq")) {
    	    pkiStatus = "success";
        }
        aReqParamStr += "&" + "pkiStatus=" + pkiStatus;
        aReqParamStr += "&" + "userAlias=" + encodeURIComponent(userNickName);
    }
    // dump("sendScepPKIRequestWithHttpParam(): aReqParamStr: " + aReqParamStr + "\n");

    if (aEncodeMsgParam) {
    	aReqParamStr += "&" + "message=" + encodeURIComponent(scepReqMsgBase64Data);
    }
    else {
    	aReqParamStr += "&" + "message=" + scepReqMsgBase64Data;
    }


    var tmpResponseCBFunc = responseCBFunc;
    if (tmpResponseCBFunc == null) {
    	tmpResponseCBFunc = handleScepRespMsgCBFunc;
    }
    tmpResponseCBFunc.targetFilePath = scepClientScepRespMsgFilepickerElem.value;

    invokeSandboxedHttp(aRemoteURL, httpMethod, aReqParamStr, tmpResponseCBFunc);

    // dump("sendScepPKIRequestWithHttpParam():..................End.\n");
    return true;
}

function sendScepPKIRequestWithPostMethod(responseCBFunc, aScepReqMsgType, aEncodeMsgParam)
{
    // dump("sendScepPKIRequestWithPostMethod():..................Start.\n");


    var /* nsILocalFile */ scepReqFile = scepClientScepReqMsgFilePickerElem.file;
    if (scepReqFile == null) {
        scepReqFile = getLocalFile(scepClientScepReqMsgFilePickerElem.value);
    }

    var scepReqMsgBinData = null;
    var scepReqFileIsAscii = scepClientScepReqMsgFilePickerElem.ascii;
    // dump("sendScepPKIRequestWithPostMethod(): scepReqFileIsAscii: " + scepReqFileIsAscii + "\n");
    if (scepReqFileIsAscii) {
    	var scepReqMsgB64Data = scepClientScepReqMsgFilePickerElem.readBase64Data(false);
    	// dump("sendScepPKIRequestWithPostMethod(): scepReqMsgB64Data: \n" + scepReqMsgB64Data + "\n");
	var base64Svc = Components.classes["@avaya.com/pkm/base64;1"]
				.getService(Components.interfaces.alrIBase64);
	var dataObj = new Object();
	var lengthObj = new Object();
	scepReqMsgBinData = base64Svc.decode(scepReqMsgB64Data, lengthObj, dataObj);
	// scepReqMsgBinData = dataObj.value;
	var scepReqMsgBinDataLen = lengthObj.value; 
    }
    else {
    	scepReqMsgBinData = scepClientScepReqMsgFilePickerElem.getBytes();
    }
    // dump("sendScepPKIRequestWithPostMethod(): scepReqMsgBinData.length: " + scepReqMsgBinData.length + "\n");

    var userNickName = scepClientScepReqMsgUserCertItemElem.cert.nickname;
    if  (userNickName == null) {
    	userNickName = "UnknownUser";
    }
    var caNickName = scepClientScepReqMsgIssuerCertItemElem.cert.nickname;

    var aRemoteURL = scepClientScepReqMsgServerUrlElem.value;
    // dump("sendScepPKIRequestWithPostMethod(): aRemoteURL: " + aRemoteURL + "\n");

    var aReqParamStr = "operation=" + "PKIOperation";
    if ((aRemoteURL.indexOf("localhost") >= 0) | (aRemoteURL.indexOf("gemstar.usae") >= 0)) {
        // JUST for test
        aReqParamStr += "&" + "caAlias=" + encodeURIComponent(caNickName);
	/*
	if (aEncodeMsgParam) {
            aReqParamStr += "&" + "caAlias=" + encodeURIComponent(caNickName);
	}
	else {
            aReqParamStr += "&" + "caAlias=" + caNickName;
	}
	*/
        var pkiStatus = "pending";
        if ((aScepReqMsgType != null) && (aScepReqMsgType != "PKCSReq")) {
    	    pkiStatus = "success";
        }
        aReqParamStr += "&" + "pkiStatus=" + pkiStatus;
        aReqParamStr += "&" + "userAlias=" + encodeURIComponent(userNickName);
    }
    // dump("sendScepPKIRequestWithPostMethod(): aReqParamStr: " + aReqParamStr + "\n");

    var tmpResponseCBFunc = responseCBFunc;
    if (tmpResponseCBFunc == null) {
    	tmpResponseCBFunc = handleScepRespMsgCBFunc;
    }
    tmpResponseCBFunc.targetFilePath = scepClientScepRespMsgFilepickerElem.value;

    invokeSandboxedHttpPostWithBinaryData(aRemoteURL, aReqParamStr, scepReqMsgBinData, tmpResponseCBFunc);

    // dump("sendScepPKIRequestWithPostMethod():..................End.\n");
    return true;
}


function importScepResponse()
{

    var /* nsIFile */ pkcs7CertFile = scepClientScepRespCertFilePickerElem.file;
    if (pkcs7CertFile == null) {
        pkcs7CertFile = getLocalFile(scepClientScepRespCertFilePickerElem.value);
    }
    var pkcs7CertFileIsAscii = scepClientScepRespCertFilePickerElem.ascii;
    keyManager.importCertsFromPKCS7File(
				null,
				pkcs7CertFile, pkcs7CertFileIsAscii,
				Components.interfaces.nsIX509Cert.USER_CERT
    				);
    alert("Sucessfully imported certs from : " + scepClientScepRespCertFilePickerElem.value);
}


function loadGetInitialCertTestData()
{

    // dump("loadGetInitialCertTestData(): ...................Start.\n");

    resetScepGetInitialCertList();

    var prevCertObj = null;
    var caServerURL = "https://pdev19vm3.platform.avaya.com/ejbca/publicweb/apply/scep/pkiclient.exe";

    var userCerNickNameList = ["Test111", "Pervez"];
    // var recipientCerNickNameList = ["DelgAlrSubCA - Avayalabs", "MyRA111"];
    var recipientCerNickNameList = ["DelgAlrSubCA - Avayalabs", "default - AVAYA"];
    for (var i = 0; i < userCerNickNameList.length; i++) {
	var userCertNickName = userCerNickNameList[i];
	var recipientCerNickName = recipientCerNickNameList[i];

	var userX509Cert = null;
	try {
	    userX509Cert = certdb.findCertByNickname(null, userCertNickName);
	} catch (ex) {}
	if (!userX509Cert) {
	    continue;
	}
	var recipientX509Cert = null;
	try {
	    recipientX509Cert = certdb.findCertByNickname(null, recipientCerNickName);
	} catch (ex) {}
	if (!recipientX509Cert) {
	    continue;
	}

	var count = (i + 1);
	var transactionId = "" + ((1000 * count) + (100 * count) + (10 * count) + count);


	var reqIdMenuLabel = addScepGetInitialCertByRequest(
					userX509Cert,
					recipientX509Cert,
					transactionId,
					caServerURL
					);
	    /*
	    var scepGetInitialCertObj = createScepGetInitialCertObj();

	    scepGetInitialCertObj.userCertNickName = userX509Cert.nickname;
	    scepGetInitialCertObj.userCertSubject = userX509Cert.subjectName;

	    scepGetInitialCertObj.scepRecipientCertNickName = recipientCerNickName.nickname;
	    scepGetInitialCertObj.scepRecipientCertSubject = recipientCerNickName.subjectName;

	    scepGetInitialCertObj.transactionId = (1000 * i) + (100 * i) + (10 * i) + i;
	    scepGetInitialCertObj.caServerURL = "http://xxxx.com/scep.exe";
	    addScepGetInitialCert(scepGetInitialCertObj);
	    prevCertObj = scepGetInitialCertObj;
	    */
    }
    // dump("loadGetInitialCertTestData(): ...................End.\n");


    /*
    var scepGetInitialCertList = loadScepGetInitialCertList();
    for (var currCert = scepGetInitialCertList; currCert != null; currCert = currCert.next) {
    	removeScepGetInitialCert(currCert);
    }
    */
    // dump("loadGetInitialCertTestData(): ...................End.\n");
}

function initGetCertInitialList(aReqIdMenuListElem)
{

    var lastItemLabel = "";
    if (aReqIdMenuListElem.selectedItem) {
        if (aReqIdMenuListElem.selectedIndex >= 0) {
    	    lastItemLabel = aReqIdMenuListElem.selectedItem.label;
    	}
    }
    if (lastItemLabel == "") {
    	lastItemLabel = getPrefStringValue(aReqIdMenuListElem.id);
	if (lastItemLabel == null) {
	    lastItemLabel = "";
	}
    }
    // dump("initGetCertInitialList(): lastItemLabel: " + lastItemLabel + "\n");

    aReqIdMenuListElem.removeAllItems();
    aReqIdMenuListElem.selectedIndex = -1;
    aReqIdMenuListElem.value = "";

    var scepGetInitialCertList = loadScepGetInitialCertList();
    if (scepGetInitialCertList == null) {
    	return;
    }

    // aReqIdMenuListElem.appendItem("", "");
    var selectedIndex = -1;
    var /* Menuitem */ selectedItem = null;
    var /* Menuitem */ menuItemNode = null;
    var i = 0;
    for (var currCert = scepGetInitialCertList; currCert != null; currCert = currCert.next) {

        var menuItemLabel = currCert.userCertSubject + "|" + currCert.transactionId;
        var menuItemValue = currCert.itemStr;

	// dump("initGetCertInitialList(): i: " + i + " menuItemValue: " + menuItemValue + "\n");
	// menuItemNode = aReqIdMenuListElem.appendItem(menuItemLabel, menuItemValue);
	menuItemNode = aReqIdMenuListElem.appendItem(menuItemLabel, menuItemLabel);
	menuItemNode.pendingInitialCert = currCert;
	menuItemNode.pendingInitialCertStr = currCert.itemStr;
	/*
	if (i == 0) {
	    selectedIndex = i;
	    selectedItem = menuItemNode;
	}
	*/
	if (lastItemLabel == menuItemLabel) {
	    // dump("initGetCertInitialList(): i: " + i + " menuItemLabel: " + menuItemLabel + "\n");
	    selectedIndex = i;
	    selectedItem = menuItemNode;
	}
	i++;
    }
    if (selectedIndex >= 0) {
    	// aReqIdMenuListElem.value = selectedItem.value;
    	aReqIdMenuListElem.selectedIndex = selectedIndex;
    }
    // dump("initGetCertInitialList(): selectedIndex : " + selectedIndex + "(" + i + ")\n");
}


function resetScepGetInitialCertList()
{
    setPrefStringValue("extensions.avpki.scepclient.getInitialCert.list", "");
}

function createScepGetInitialCertObj(getIntialCertStr)
{
    // dump("createScepGetInitialCertObj():.........................Start.\n");

    if ((getIntialCertStr != null) && (getIntialCertStr.length == 0)) {
	return null;
    }

    var scepGetInitialCertObj = new Object();
    scepGetInitialCertObj.prev = null;
    scepGetInitialCertObj.next = null;

    scepGetInitialCertObj.itemStr = null;

    scepGetInitialCertObj.userCertNickName = null;
    scepGetInitialCertObj.userCertSubject = null;
    scepGetInitialCertObj.scepRecipientCertNickName = null;
    scepGetInitialCertObj.scepRecipientCertSubject = null;
    scepGetInitialCertObj.transactionId = null;
    scepGetInitialCertObj.caServerURL = null;

    scepGetInitialCertObj.userCertDbKey = null;
    scepGetInitialCertObj.userCert = null;
    scepGetInitialCertObj.scepRecipientCertDbKey = null;
    scepGetInitialCertObj.scepRecipientCert = null;

    if (getIntialCertStr == null) {
    	return scepGetInitialCertObj;
    }

    // dump("createScepGetInitialCertObj(): getIntialCertStr: " + getIntialCertStr + "\n");

    var scepGetInitialCertCompList = getIntialCertStr.split("|");
    if (scepGetInitialCertCompList.length == 0) {
    	return scepGetInitialCertObj;
    }
    // dump("createScepGetInitialCertObj(): scepGetInitialCertCompList.length: " + scepGetInitialCertCompList.length + "\n");

    scepGetInitialCertObj.itemStr = getIntialCertStr;
    for (var j = 0; j < scepGetInitialCertCompList.length; j++) {
        var scepGetInitialCertComp = scepGetInitialCertCompList[j];
	switch(j) {
	    case 0: 
	        scepGetInitialCertObj.userCertNickName = scepGetInitialCertComp;
	    	break;
	    case 1: 
	        scepGetInitialCertObj.userCertSubject = scepGetInitialCertComp;
	    	break;
	    case 2: 
	    	scepGetInitialCertObj.scepRecipientCertNickName = scepGetInitialCertComp;
		break;
	    case 3: 
	    	scepGetInitialCertObj.scepRecipientCertSubject = scepGetInitialCertComp;
		break;
	    case 4: 
	    	scepGetInitialCertObj.transactionId = scepGetInitialCertComp;
		break;
	    case 5: 
	    	scepGetInitialCertObj.caServerURL = scepGetInitialCertComp;
		break;
	    case 6: 
		if (scepGetInitialCertComp.length > 0) {
	        scepGetInitialCertObj.userCertDbKey = decodeURIComponent(scepGetInitialCertComp);
		}
	    	break;
	    case 7: 
		if (scepGetInitialCertComp.length > 0) {
	        scepGetInitialCertObj.scepRecipientCertDbKey = decodeURIComponent(scepGetInitialCertComp);
		}
	    	break;
	    default:
		break;
	}
    }

    scepGetInitialCertObj.userCert = null;

    var certRef = null;
    try {
    if (scepGetInitialCertObj.userCertDbKey != null) {
    	// dump("createScepGetInitialCertObj():.........................10.\n");
        certRef = certdb.findCertByDBKey(scepGetInitialCertObj.userCertDbKey , null);
    }
    else if (scepGetInitialCertObj.userCertNickName != null) {
    	// dump("createScepGetInitialCertObj():.........................12.\n");
	certRef = certdb.findCertByNickname(null, scepGetInitialCertObj.userCertNickName);
	scepGetInitialCertObj.userCertDbKey = certRef.dbKey;
    }
    else {
    	certRef = null;
    }
    } catch (ex) {
    	dump("createScepGetInitialCertObj(): failed to get user cert - ex: : " + ex + "\n");
    	certRef = null;
    }
    scepGetInitialCertObj.userCert = certRef;
    // dump("createScepGetInitialCertObj(): scepGetInitialCertObj.userCert: " + certRef +  "(" + scepGetInitialCertObj.userCertNickName + ")" + "\n");

    certRef = null;
    try {
    if (scepGetInitialCertObj.scepRecipientCertDbKey != null) {
        certRef = certdb.findCertByDBKey(scepGetInitialCertObj.scepRecipientCertDbKey , null);
    }
    else if (scepGetInitialCertObj.scepRecipientCertNickName != null) {
	certRef = certdb.findCertByNickname(null, scepGetInitialCertObj.scepRecipientCertNickName);
	scepGetInitialCertObj.scepRecipientCertDbKey = certRef.dbKey;
    }
    else {
    	certRef = null;
    }
    } catch (ex) {
    	certRef = null;
    	dump("createScepGetInitialCertObj(): failed to get issuer cert - ex: : " + ex + "\n");
    }
    scepGetInitialCertObj.scepRecipientCert = certRef;
    // dump("createScepGetInitialCertObj(): scepGetInitialCertObj.scepRecipientCert: " + certRef +  "(" + scepGetInitialCertObj.scepRecipientCertNickName + ")" + "\n");

    // dump("createScepGetInitialCertObj():.........................End.\n");

    return scepGetInitialCertObj;
}

function loadScepGetInitialCertList()
{
    // dump("loadScepGetInitialCertList(): ...................Start.\n");
    var scepGetInitialCertList = null;

    var scepGetInitialCertListStr = getPrefStringValue("extensions.avpki.scepclient.getInitialCert.list");
    if (scepGetInitialCertListStr == null) {
    	return scepGetInitialCertList;
    }
    // dump("loadScepGetInitialCertList(): scepGetInitialCertListStr: " + scepGetInitialCertListStr + "\n");
    if (scepGetInitialCertListStr.length == 0) {
    	return scepGetInitialCertList;
    }

    var scepGetInitialCertStrList = scepGetInitialCertListStr.split(";");
    var currScepGetInitialCert = null;
    for (var i = 0; i < scepGetInitialCertStrList.length; i++) {
    	var scepGetInitialCertItemStr = scepGetInitialCertStrList[i];
	var scepGetInitialCertObj = createScepGetInitialCertObj(scepGetInitialCertItemStr);
	if (scepGetInitialCertObj == null) {
	    continue;
	}


	if (currScepGetInitialCert != null) {
	    currScepGetInitialCert.next = scepGetInitialCertObj;
	    scepGetInitialCertObj.prev = currScepGetInitialCert;
	}
	else {
	    scepGetInitialCertList = scepGetInitialCertObj;
	}
	currScepGetInitialCert = scepGetInitialCertObj;
    }

    // dump("loadScepGetInitialCertList():certName: " + scepGetInitialCertList.userCertNickName + "\n");
    // dump("loadScepGetInitialCertList(): ...................End.\n");
    return scepGetInitialCertList;
}

function saveScepGetInitialCertList(scepGetInitialCertList)
{
    // dump("saveScepGetInitialCertList(): ...................Start.\n");
    if (scepGetInitialCertList == null) {
	resetScepGetInitialCertList();
	return;
    }
    // dump("saveScepGetInitialCertList():certName: " + scepGetInitialCertList.userCertNickName + "\n");

    var scepGetInitialCertListStr = "";
    for (var currCert = scepGetInitialCertList; currCert != null; currCert = currCert.next) {
    	var scepGetInitialCertStr = "";
	scepGetInitialCertStr += currCert.userCertNickName; scepGetInitialCertStr += "|";
	scepGetInitialCertStr += currCert.userCertSubject; scepGetInitialCertStr += "|";
	scepGetInitialCertStr += currCert.scepRecipientCertNickName; scepGetInitialCertStr += "|";
	scepGetInitialCertStr += currCert.scepRecipientCertSubject; scepGetInitialCertStr += "|";
	scepGetInitialCertStr += currCert.transactionId; scepGetInitialCertStr += "|";
	if (currCert.caServerURL != null) {
	    scepGetInitialCertStr += currCert.caServerURL; scepGetInitialCertStr += "|";
	}
	else {
	    scepGetInitialCertStr += ""; scepGetInitialCertStr += "|";
	}
	if (currCert.userCertDbKey) {
	    scepGetInitialCertStr += encodeURIComponent(currCert.userCertDbKey); scepGetInitialCertStr += "|";
	}
	else {
	    scepGetInitialCertStr += ""; scepGetInitialCertStr += "|";
	}
	if (currCert.scepRecipientCertDbKey) {
	    scepGetInitialCertStr += encodeURIComponent(currCert.scepRecipientCertDbKey); scepGetInitialCertStr += "|";
	}
	else {
	    scepGetInitialCertStr += ""; scepGetInitialCertStr += "|";
	}

	scepGetInitialCertListStr += scepGetInitialCertStr + ";";

	/*
	dump("saveScepGetInitialCertList(): scepGetInitialCertStr: " + scepGetInitialCertStr + "\n");
	*/

    }
    // dump("saveScepGetInitialCertList(): scepGetInitialCertListStr: " + scepGetInitialCertListStr + "\n");
    setPrefStringValue("extensions.avpki.scepclient.getInitialCert.list", scepGetInitialCertListStr);

    // dump("saveScepGetInitialCertList(): ...................End.\n");
    // dump("\n");
}

function removeScepGetInitialCert(scepGetInitialCertObj)
{
    // dump("removeScepGetInitialCert(): ...................Start.\n");
    var scepGetInitialCertList = loadScepGetInitialCertList();
    for (var currCert = scepGetInitialCertList; currCert != null; currCert = currCert.next) {
	    /*
    	    dump("    userCertNickName: " + currCert.userCertNickName + " == " + scepGetInitialCertObj.userCertNickName + "\n");
    	    dump("    userCertSubject: " + currCert.userCertSubject + " == " + scepGetInitialCertObj.userCertSubject + "\n");
    	    dump("    caCertNickName: " + currCert.scepRecipientCertNickName + " == " + scepGetInitialCertObj.scepRecipientCertNickName + "\n");
    	    dump("    caCertSubject: " + currCert.scepRecipientCertSubject + " == " + scepGetInitialCertObj.scepRecipientCertSubject + "\n");
    	    dump("    transactionId: " + currCert.transactionId + " == " + scepGetInitialCertObj.transactionId + "\n");
	    dump("\n");
	    */
    	if ((currCert.userCertNickName == scepGetInitialCertObj.userCertNickName)
    	    && (currCert.userCertSubject == scepGetInitialCertObj.userCertSubject)
    	    && (currCert.scepRecipientCertNickName == scepGetInitialCertObj.scepRecipientCertNickName)
    	    && (currCert.scepRecipientCertSubject == scepGetInitialCertObj.scepRecipientCertSubject)
    	    && (currCert.transactionId == scepGetInitialCertObj.transactionId)) {
	    deleteScepGetInitialCert(currCert);
    	    // dump("removeScepGetInitialCert(): ...................End.\n");
	    return;
	}
    }
    // dump("removeScepGetInitialCert(): ...................End(1).\n");
}

function deleteScepGetInitialCert(scepGetInitialCertObj)
{
    // dump("deleteScepGetInitialCert(): ...................Start.\n");
    // dump("deleteScepGetInitialCert():certName: " + scepGetInitialCertObj.userCertNickName + "\n");

    if (scepGetInitialCertObj == null) {
    	return;
    }
    var prev = scepGetInitialCertObj.prev;
    if (prev != null) {
    	prev.next = next;
    }

    var next = scepGetInitialCertObj.next;
    if (next != null) {
    	next.prev = prev;
    }

    var firstCert = null;
    if (prev == null) {
    	firstCert = next;
    }
    else {
    	for (var tempCert = prev; tempCert != null;  tempCert = tempCert.prev) {
	    firstCert = tempCert;
	}
    }
    // dump("deleteScepGetInitialCert(): firstCert: " + firstCert + "\n");
    saveScepGetInitialCertList(firstCert);

    // dump("deleteScepGetInitialCert(): ...................End.\n");
}


function addScepGetInitialCertByRequest(aUserCert, aSCEPRecipientCert, aTransactionId, aCaServerURL)
{
    // TODO: We should use Session store of FF2 insead of preferences to store the request info.
    // (http://developer.mozilla.org/en/docs/Session_store_API)

    // dump("addScepGetInitialCertByRequest(): ...................Start.\n");

    var scepGetInitialCertObj = createScepGetInitialCertObj();

    scepGetInitialCertObj.userCertNickName	= aUserCert.nickname;
    scepGetInitialCertObj.userCertDbKey		= aUserCert.dbKey;
    // dump("addScepGetInitialCertByRequest(): userCertDbKey: " + scepGetInitialCertObj.userCertDbKey + "\n");
    scepGetInitialCertObj.userCertSubject	= aUserCert.subjectName;
    scepGetInitialCertObj.userCert		= aUserCert;
    // dump("addScepGetInitialCertByRequest(): userCert: " + scepGetInitialCertObj.userCert + "\n");

    scepGetInitialCertObj.scepRecipientCertNickName	= aSCEPRecipientCert.nickname;
    scepGetInitialCertObj.scepRecipientCertDbKey		= aSCEPRecipientCert.dbKey;
    // dump("addScepGetInitialCertByRequest(): caCertDbKey: " + scepGetInitialCertObj.scepRecipientCertDbKey + "\n");
    scepGetInitialCertObj.scepRecipientCertSubject		= aSCEPRecipientCert.subjectName;
    scepGetInitialCertObj.scepRecipientCert		= aSCEPRecipientCert;
    // dump("addScepGetInitialCertByRequest(): caCert: " + scepGetInitialCertObj.scepRecipientCert + "\n");

    scepGetInitialCertObj.transactionId		= aTransactionId;

    scepGetInitialCertObj.caServerURL		= aCaServerURL;

    var reqIdMenuLabel = addScepGetInitialCert(scepGetInitialCertObj);

    // dump("addScepGetInitialCertByRequest(): ...................End.\n");
    return reqIdMenuLabel;
}

function addScepGetInitialCert(scepGetInitialCertObj)
{
    // dump("addScepGetInitialCert(): ...................Start.\n");
    // dump("addScepGetInitialCert():certName: " + scepGetInitialCertObj.userCertNickName + "\n");

    var scepGetInitialCertList = loadScepGetInitialCertList();

    var lastCert = null;
    for (var currCert = scepGetInitialCertList; currCert != null; currCert = currCert.next) {
    	lastCert = currCert;
    }

    if (lastCert != null) {
    	lastCert.next = scepGetInitialCertObj;
	scepGetInitialCertObj.prev = lastCert;
    }
    else {
    	scepGetInitialCertList = scepGetInitialCertObj;
    }
    saveScepGetInitialCertList(scepGetInitialCertList);

    var menuItemLabel = scepGetInitialCertObj.userCertSubject + "|" + scepGetInitialCertObj.transactionId;

    // dump("addScepGetInitialCert(): ...................End.\n");
    return menuItemLabel;
}

function generateScepGetCertInitialRequest(scepGetInitialCertObj)
{
    // dump("generateScepGetCertInitialRequest(): ...................Start.\n");

    if (scepGetInitialCertObj == null) {
    	return false;
    }


    var userAlias = scepGetInitialCertObj.userCertNickName;
    var userSubject = scepGetInitialCertObj.userCertSubject;
    var userCert = scepGetInitialCertObj.userCert;
    // dump("generateScepGetCertInitialRequest(): userCert: " + userCert + "\n");

    var scepReqFile = scepClientGetCertInitialFilePathElem.file;
    if (scepReqFile == null) {
    	// dump("generateScepGetCertInitialRequest(): scepClientGetCertInitialFilePathElem.value: " + scepClientGetCertInitialFilePathElem.value + "\n");
        scepReqFile = getLocalFile(scepClientGetCertInitialFilePathElem.value);
    }
    var scepReqFileIsAscii = scepClientGetCertInitialFilePathElem.ascii;

    var caAlias = scepGetInitialCertObj.scepRecipientCertNickName;
    var caSubject = scepGetInitialCertObj.scepRecipientCertSubject;
    var caCert = scepGetInitialCertObj.scepRecipientCert;
    // dump("generateScepGetCertInitialRequest(): caCert: " + caCert + "\n");

    gScepReqTransactionId = scepGetInitialCertObj.transactionId;

    var caServerURL = scepGetInitialCertObj.caServerURL;

    var now = new Date();
    gScepReqSenderNonce = "" + (Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000);
    gScepReqSenderNonce = gScepReqSenderNonce + now.getTime() + gScepReqSenderNonce;
    gScepReqSenderNonce = gScepReqSenderNonce.substring(0, 15);

    var hashAlgName = scepClientGetCertInitialHashAlgElem.value;

    try {
	/*
	*/
    	dump("generateScepGetCertInitialRequest(): " + 
			"Invoking createScepGetCertInitialMessageToFile() \n" + 
			"  userAlias: " + userAlias + "\n" + 
			"  userCert: " + userCert + "\n" + 
			"  caAlias: " + caAlias + "\n" + 
			"  caCert: " + caCert + "\n" + 
			"  gScepReqTransactionId: " + gScepReqTransactionId + "\n" + 
			"  hashAlgName: " + hashAlgName + "\n" + 
			"  gScepReqSenderNonce: " + gScepReqSenderNonce + "\n" + 
			"");
	/*
    	scepPkiClient.createScepGetCertInitialMessageToFile(
					userAlias, caAlias,
	*/
    	scepPkiClient.createScepGetCertInitialMessageByCertToFile(
					userCert, caCert,
					gScepReqTransactionId, hashAlgName, gScepReqSenderNonce,
					scepReqFile, scepReqFileIsAscii
    					);

    } catch (ex) {
	alert("generateScepGetCertInitialRequest(): createScepGetCertInitialMessageToFile() failed - scepCsrGenStatus: " + ex);
	dump("generateScepGetCertInitialRequest(): createScepGetCertInitialMessageToFile() failed - scepCsrGenStatus: " + ex + "\n");
    	return false;
    }

    scepClientScepReqMsgFilePickerElem.ascii		= scepClientGetCertInitialFilePathElem.ascii;
    scepClientScepReqMsgFilePickerElem.file		= scepClientGetCertInitialFilePathElem.file;

    scepClientScepReqMsgFileDataElem.hidden = true;
    if (scepClientScepReqMsgFilePickerElem.ascii) {
    	displayAsciiFileItemData(scepClientScepReqMsgFilePickerElem.ascii, 
    				"keymgr.scepclient.scepreqmsg.file.path",
				"keymgr.scepclient.scepreqmsg.file.asciiData"
				);
    	scepClientScepReqMsgFileDataElem.hidden = false;
    }

    scepClientScepReqMsgUserCertItemElem.cert	= scepGetInitialCertObj.userCert;
    scepClientScepReqMsgIssuerCertItemElem.cert	= scepGetInitialCertObj.scepRecipientCert;

    scepClientScepReqMsgTransactionIdElem.value	= gScepReqTransactionId;
    scepClientScepReqMsgServerUrlElem.value	= scepGetInitialCertObj.caServerURL;

    initScepRespOutFile();
    initScepRespCertOutFile();

    scepClientScepRespMsgGroupElem.hidden = false;

    // dump("generateScepGetCertInitialRequest(): ...................End.\n");
    return true;
}

function generateScepGetCertRequest()
{
    // dump("generateScepGetCertRequest():..........................Start.\n");

    var userCert = gSCEPGetCertUserCertPickerElem.getSelectedCert();
    var caCert = gSCEPGetCertCACertPickerElem.getSelectedCert();

    generateScepRequestWithCerts(userCert, caCert, false);

    // dump("generateScepGetCertRequest():..........................Start.\n");
}

function generateScepGetCertRequestWithCerts(aUserCert, aScepRecipientCert, aScepRecipientRA)
{
    // dump("generateScepGetCertRequest(): ...................Start.\n");

    var scepReqFile = scepClientGetCertFilePathElem.file;
    if (scepReqFile == null) {
        scepReqFile = getLocalFile(scepClientGetCertFilePathElem.value);
    }
    var scepReqFileIsAscii = scepClientGetCertFilePathElem.ascii;

    var targetCertSerialNo = scepClientGetCertSerialNoElem.value;


    var userCert = aUserCert;
    if (userCert == null) {
    	return false;
    }
    var userAlias = userCert.nickname;
    var userDbKey = userCert.dbKey;

    var caCert = aScepRecipientCert;
    if (caCert == null) {
    	return false;
    }
    var caDbKey = caCert.dbKey; 
    var caAlias = caCert.nickname; 
    var caSubject = caCert.subjectName;

    var caServerURL = scepClientGetCertCaServerURLElem.value;

    /*
    gScepReqTransactionId = "" + (Math.floor(Math.random() * (2000000 - 20000 + 1)) + 20000);
    gScepReqTransactionId = gScepReqTransactionId + now.getTime() + gScepReqTransactionId;
    gScepReqTransactionId = gScepReqTransactionId.substring(0, 15);
    */
    gScepReqTransactionId = convertCertSerialHexToNum(userCert.serialNumber);

    var now = new Date();
    gScepReqSenderNonce = "" + (Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000);
    gScepReqSenderNonce = gScepReqSenderNonce + now.getTime() + gScepReqSenderNonce;
    gScepReqSenderNonce = gScepReqSenderNonce.substring(0, 15);

    var hashAlgName = scepClientGetCertHashAlgElem.value;

    dump("generateScepGetCertRequest(): " + 
			"Invoking createScepGetCertMessageByCertToFile() \n" + 
			"  targetCertSerialNo: " + targetCertSerialNo + "\n" + 
			"  userAlias: " + userAlias + "\n" + 
			"  caAlias: " + caAlias + "\n" + 
			"  gScepReqTransactionId: " + gScepReqTransactionId + "\n" + 
			"  hashAlgName: " + hashAlgName + "\n" + 
			"  gScepReqSenderNonce: " + gScepReqSenderNonce + "\n" + 
			"");
    try {
    	scepPkiClient.createScepGetCertMessageByCertToFile(
					targetCertSerialNo,
					userCert, caCert,
					gScepReqTransactionId, hashAlgName, gScepReqSenderNonce,
					scepReqFile, scepReqFileIsAscii
    					);

    } catch (ex) {
	alert("generateScepGetCertRequest(): createScepGetCertMessageByCertToFile() failed - scepCsrGenStatus: " + ex);
    	return false;
    }
    // dump("generateScepGetCertRequest(): ...................10.\n");

    scepClientScepReqMsgFilePickerElem.ascii		= scepClientGetCertFilePathElem.ascii;
    scepClientScepReqMsgFilePickerElem.file		= scepClientGetCertFilePathElem.file;

    scepClientScepReqMsgFileDataElem.hidden = true;
    if (scepClientScepReqMsgFilePickerElem.ascii) {
    	displayAsciiFileItemData(scepClientScepReqMsgFilePickerElem.ascii, 
    				"keymgr.scepclient.scepreqmsg.file.path",
				"keymgr.scepclient.scepreqmsg.file.asciiData"
				);
    	scepClientScepReqMsgFileDataElem.hidden = false;
    }

    scepClientScepReqMsgUserCertItemElem.cert	= userCert;
    scepClientScepReqMsgIssuerCertItemElem.cert	= caCert;
    scepClientScepReqMsgTransactionIdElem.value	= gScepReqTransactionId;
    scepClientScepReqMsgServerUrlElem.value	= caServerURL;

    initScepRespOutFile();
    initScepRespCertOutFile();

    scepClientScepRespMsgGroupElem.hidden = false;

    // dump("generateScepGetCertRequest(): ...................End.\n");
    return true;
}

