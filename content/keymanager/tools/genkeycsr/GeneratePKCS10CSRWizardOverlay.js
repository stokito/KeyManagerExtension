/* @(#) $Id: GeneratePKCS10CSRWizardOverlay.js,v 1.4 2011/08/16 15:07:42 subrata Exp $ */

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
 *     Subrata Mazumdar, Avaya Labs Research, Avaya Inc.
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



var GeneratePKCS10CSRWizardOverlay = {

    mWizardElem			: null,

    mInitialized		: false,
    initOnLoad : function () 
    {
    	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.initOnLoad():................Start.");

    	// GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.initOnLoad(): window.arguments: " + window.arguments);
        if (GeneratePKCS10CSRWizardOverlay.mInitialized) {
    	    GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.initOnLoad():................End(0).");
    	    return;
        }
	GeneratePKCS10CSRWizardOverlay.mInitialized = true;

	GeneratePKCS10CSRWizard.initOnLoad();

    	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.initOnLoad():................End.");
    },

    selectKeySourcePageShow : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.selectKeySourcePageShow():................Start.");

	GeneratePKCS10CSRWizardOverlay.initOnLoad();

	/*
	GeneratePKCS10CSRWizardOverlay.mWizardPageElem = aWizardPageElem;
	GeneratePKCS10CSRWizardOverlay.mWizardElem = aWizardPageElem.parentNode;
	*/

	GeneratePKCS10CSRWizard.mWizardElem.canAdvance = true;
	GeneratePKCS10CSRWizard.mWizardElem.userCert = null;

        var keySourceOptionsElem = document.getElementById("keymgr.genkeycsr.wizard.keysource.options");
	GeneratePKCS10CSRWizardOverlay.handleKeySourceOptionChange(keySourceOptionsElem);

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.selectKeySourcePageShow():................End.");
        return true;
    },

    handleKeySourceOptionChange : function (aKeySourceOptionsElem, ev) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleKeySourceOptionChange():................Start.");

    	if (ev) {
    	    ev.stopPropagation();
    	}

	var selectedKeySourceOptionElem = aKeySourceOptionsElem.selectedItem;
	var nextPageId = selectedKeySourceOptionElem.getAttribute("next");
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleKeySourceOptionChange(): nextPageId: " + nextPageId);

	/*
	GeneratePKCS10CSRWizardOverlay.mWizardPageElem.next = nextPageId;
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleKeySourceOptionChange():................End.");
    },

    selectKeySourcePageAdvanced : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.selectKeySourcePageAdvanced():................Start.");

        var keySourceOptionsElem = document.getElementById("keymgr.genkeycsr.wizard.keysource.options");
	var nextPageId = keySourceOptionsElem.selectedItem.getAttribute("next");
	aWizardPageElem.next = nextPageId;

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.selectKeySourcePageAdvanced():................End.");
        return true;
    },


    generateNewKeyPageShow : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeyPageShow():................Start.");
	/*
	GeneratePKCS10CSRWizardOverlay.mWizardPageElem = aWizardPageElem;
	GeneratePKCS10CSRWizardOverlay.mWizardElem = aWizardPageElem.parentNode;
	*/
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeyPageShow(): GeneratePKCS10CSRWizard.mWizardElem: " + GeneratePKCS10CSRWizard.mWizardElem);

	GeneratePKCS10CSRWizard.mWizardElem.userCert = null;
	GeneratePKCS10CSRWizard.mWizardElem.canAdvance = true;

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeyPageShow():................End.");
        return true;
    },

    handleNewKeyOptionChange : function (aNewKeyOptionsElem, ev) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleNewKeyOptionChange():................Start.");

	var nextPageOptionElem = aKeySourceOptionsElem.selectedItem;
	var nextPageId = nextPageOptionElem.getAttribute("next");
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleNewKeyOptionChange(): nextPageId: " + nextPageId);
	/*
	GeneratePKCS10CSRWizardOverlay.mWizardPageElem.next = nextPageId;
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleNewKeyOptionChange():................End.");
    },

    generateNewKeyPageAdvanced : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeyPageAdvanced():................Start.");

	/*
        var keySourceOptionsElem = document.getElementById("keymgr.genkeycsr.wizard.keysource");
	var nextPageId = keySourceOptionsElem.selectedItem.getAttribute("next");
	aWizardPageElem.next = nextPageId;
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeyPageAdvanced():................End.");
        return true;
    },

    generateNewKeySimplePageShow : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeySimplePageShow():................Start.");

	GeneratePKCS10CSRWizardOverlay.mWizardPageElem = aWizardPageElem;
	GeneratePKCS10CSRWizardOverlay.mWizardElem = aWizardPageElem.parentNode;

	GeneratePKCS10CSRWizard.mWizardElem.userCert = null;

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeySimplePageShow():................End.");
        return true;
    },

    handleNewKeySimpleOptionChange : function (aNewKeySimpleOptionsElem, ev) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleNewKeySimpleOptionChange():................Start.");

	var nextPageOptionElem = aKeySourceOptionsElem.selectedItem;
	var nextPageId = nextPageOptionElem.getAttribute("next");
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleNewKeySimpleOptionChange(): nextPageId: " + nextPageId);
	/*
	GeneratePKCS10CSRWizardOverlay.mWizardPageElem.next = nextPageId;
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleNewKeySimpleOptionChange():................End.");
    },

    handleUserCertCreate : function (aCreateCertButtonElem, ev) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleUserCertCreate():................Start.");

    	if (ev) {
    	    ev.stopPropagation();
    	}

    	var newX509Cert = aCreateCertButtonElem.newCert;
	if (!newX509Cert) {
	    GeneratePKCS10CSRWizard.mWizardElem.canAdvance = false;
	    return;
	}

	GeneratePKCS10CSRWizard.mWizardElem.canAdvance = true;
	GeneratePKCS10CSRWizard.mWizardElem.userCert = newX509Cert;

        var userCertPickerElem = document.getElementById("keymgr.genkeycsr.wizard.existingkey.browser.certpicker");
	userCertPickerElem.refresh();
	GeneratePKCS10CSRWizardOverlay.handleUserCertPickerChange(userCertPickerElem);
	userCertPickerElem.selectedCert = newX509Cert;

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleUserCertCreate():................End.");
    },

    generateNewKeySimplePageAdvanced : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeySimplePageAdvanced():................Start.");

	/*
        var keySourceOptionsElem = document.getElementById("keymgr.genkeycsr.wizard.keysource");
	var nextPageId = keySourceOptionsElem.selectedItem.getAttribute("next");
	aWizardPageElem.next = nextPageId;
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeySimplePageAdvanced():................End.");
        return true;
    },

    generateNewKeyAdvancedPageShow : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeyAdvancedPageShow():................Start.");

	GeneratePKCS10CSRWizard.mWizardElem.userCert = null;

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeyAdvancedPageShow():................End.");
        return true;
    },

    handleNewKeyAdvancedOptionChange : function (aNewKeyAdvancedOptionsElem, ev) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleNewKeyAdvancedOptionChange():................Start.");
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleNewKeyAdvancedOptionChange():................End.");
    },

    generateNewKeyAdvancedPageAdvanced : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeyAdvancedPageAdvanced():................Start.");
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.generateNewKeyAdvancedPageAdvanced():................End.");
        return true;
    },

    useExistingKeyPageShow : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExistingKeyPageShow():................Start.");

	GeneratePKCS10CSRWizard.mWizardElem.userCert = null;
	GeneratePKCS10CSRWizard.mWizardElem.canAdvance = true;

        var existingKeyOptionsElem = document.getElementById("keymgr.genkeycsr.wizard.existingkey.options");
	GeneratePKCS10CSRWizardOverlay.handleExistingKeyOptionChange(existingKeyOptionsElem);

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExistingKeyPageShow():................End.");
        return true;
    },

    handleExistingKeyOptionChange : function (aExistingKeyOptionsElem, ev) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleExistingKeyOptionChange():................Start.");

	var existingKeyOptionElem = aExistingKeyOptionsElem.selectedItem;
	var nextPageId = existingKeyOptionElem.getAttribute("next");
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleExistingKeyOptionChange(): nextPageId: " + nextPageId);
	/*
	GeneratePKCS10CSRWizardOverlay.mWizardPageElem.next = nextPageId;
	*/

	GeneratePKCS10CSRWizard.mWizardElem.canAdvance = true;

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleExistingKeyOptionChange():................End.");
    },

    useExistingKeyPageAdvanced : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExistingKeyPageAdvanced():................Start.");

        var existingKeyOptionsElem = document.getElementById("keymgr.genkeycsr.wizard.existingkey.options");
	var nextPageId = existingKeyOptionsElem.selectedItem.getAttribute("next");
	aWizardPageElem.next = nextPageId;

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExistingKeyPageAdvanced():................End.");
        return true;
    },

    useExistingKeyBrowserPageShow : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExistingKeyBrowserPageShow():................Start.");

	// GeneratePKCS10CSRWizard.mWizardElem.userCert = null;

        var userCertPickerElem = document.getElementById("keymgr.genkeycsr.wizard.existingkey.browser.certpicker");

	userCertPickerElem.refresh();
	GeneratePKCS10CSRWizardOverlay.handleUserCertPickerChange(userCertPickerElem);
	
	if (GeneratePKCS10CSRWizard.mWizardElem.userCert) {
	    userCertPickerElem.selectedCert = GeneratePKCS10CSRWizard.mWizardElem.userCert;
	}

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExistingKeyBrowserPageShow():................End.");
        return true;
    },

    handleUserCertPickerChange : function (aUserCertPickerElem, ev) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleUserCertPickerChange():................Start.");

    	if (ev) {
    	    ev.stopPropagation();
    	}

	if (!aUserCertPickerElem.selectedCert) {
	    GeneratePKCS10CSRWizard.mWizardElem.canAdvance = false;
	    return;
	}
	GeneratePKCS10CSRWizard.mWizardElem.canAdvance = true;

	GeneratePKCS10CSRWizard.mWizardElem.userCert = aUserCertPickerElem.selectedCert;

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleUserCertPickerChange():................End.");
    },

    useExistingKeyBrowserPageAdvanced : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExistingKeyBrowserPageAdvanced():................Start.");

        var userCertPickerElem = document.getElementById("keymgr.genkeycsr.wizard.existingkey.browser.certpicker");
	aWizardPageElem.parentNode.userCert = userCertPickerElem.selectedCert;
	/*
        var keySourceOptionsElem = document.getElementById("keymgr.genkeycsr.wizard.keysource");
	var nextPageId = keySourceOptionsElem.selectedItem.getAttribute("next");
	aWizardPageElem.next = nextPageId;
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExistingKeyBrowserPageAdvanced():................End.");
        return true;
    },

    useExistingKeyExternalPageShow : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExistingKeyExternalPageShow():................Start.");

        var softTokenElem = document.getElementById("keymgr.genkeycsr.wizard.existingkey.external.softtoken");
	softTokenElem.refresh();
	GeneratePKCS10CSRWizardOverlay.handleSoftTokenChange(softTokenElem);

	/*
        var softTokenMgrElem = document.getElementById("keymgr.genkeycsr.wizard.existingkey.external.softtokenmgr");
	softTokenMgrElem.refresh();
	GeneratePKCS10CSRWizardOverlay.handleSoftTokenChange(softTokenMgrElem);
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExistingKeyExternalPageShow():................End.");
        return true;
    },

    handleSoftTokenChange : function (aSoftTokenElem, ev) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleSoftTokenChange():................Start.");

    	if (ev) {
    	    ev.stopPropagation();
    	}

	try {
	    if (aSoftTokenElem.mounted) {
	    	aSoftTokenElem.unmountSoftToken();
	    }
	} catch (ex) {
	    GeneratePKCS10CSRWizard.mWizardElem.canAdvance = false;
            GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleSoftTokenChange(): ex: " + ex);
            GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleSoftTokenChange():................End(0).");
	    return;
	}

	if (!aSoftTokenElem.readytomount) {
	    GeneratePKCS10CSRWizard.mWizardElem.canAdvance = false;
            GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleSoftTokenChange():................End(1).");
	    return;
	}
	GeneratePKCS10CSRWizard.mWizardElem.canAdvance = true;

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleSoftTokenChange():................End.");
    },

    handleExistingKeyExternalOptionChange : function (aExistingKeyExternalOptionsElem, ev) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleExistingKeyExternalOptionChange():................Start.");

	var nextPageOptionElem = aKeySourceOptionsElem.selectedItem;
	var nextPageId = nextPageOptionElem.getAttribute("next");
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleExistingKeyExternalOptionChange(): nextPageId: " + nextPageId);
	/*
	GeneratePKCS10CSRWizardOverlay.mWizardPageElem.next = nextPageId;
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleExistingKeyExternalOptionChange():................End.");
    },

    selectCertFromList : function (aX509CertList)
    {
	var selectedCert = null;
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.selectCertFromList():................Start.");

	if (!aX509CertList || aX509CertList.length == 0) {
	    return null;
	}
	var x509CertList = aX509CertList;
    	GeneratePKCS10CSRWizard.logDebug("GeneratePKCS10CSRWizardOverlay.selectCertInSoftToken(): x509CertList.length: " + x509CertList.length); 

	var x509CertNicknameList = [];
	var x509CertInfoList = [];
	for (var i = 0; i < x509CertList.length; i++) {
	    var x509Cert = x509CertList[i];
	    var x509CertInfo = "" + 
	    		"Name             : " + x509Cert.commonName + "\n" + 
	    		"Subject          : " + x509Cert.subjectName + "\n" + 
	    		"Issuer           : " + x509Cert.issuerName + "\n" + 
	    		"SN               : " + x509Cert.serialNumber + "\n" + 
	    		"Token            : " + x509Cert.tokenName + "\n" + 
	    		"SHA1 Fingerprint : " + x509Cert.sha1Fingerprint + "\n" + 
	    		"Expires on       : " + x509Cert.validity.notAfterLocalTime + "\n" + 
			"";
	    x509CertNicknameList.push(x509Cert.nickname);
	    x509CertInfoList.push(x509CertInfo);
	}

	var x509CertNicknameList = [];
	var x509CertInfoList = [];
	for (var i = 0; i < x509CertList.length; i++) {
	    var x509Cert = x509CertList[i];
	    var nickName = x509Cert.nickname;
	    var x509CertInfo = "" + 
	    		"Name             : " + x509Cert.commonName + "\n" + 
	    		"Subject          : " + x509Cert.subjectName + "\n" + 
	    		"Issuer           : " + x509Cert.issuerName + "\n" + 
	    		"SN               : " + x509Cert.serialNumber + "\n" + 
	    		"Token            : " + x509Cert.tokenName + "\n" + 
	    		"SHA1 Fingerprint : " + x509Cert.sha1Fingerprint + "\n" + 
	    		"Expires on       : " + x509Cert.validity.notAfterLocalTime + "\n" + 
			"";
    	    // GeneratePKCS10CSRWizard.logDebug("x509CertInfo[" + i + "]: " + x509CertInfo); 
	    x509CertNicknameList.push(nickName);
	    x509CertInfoList.push(x509CertInfo);
	}

	var selectedNickName = null;
	var selectedIndex = -1;
	var canceled = true;

	var ctx = null;
	var selectedIndexObj = { value : 0};
	var canceledObj = {};

    	var cpDialog = Components.classes["@mozilla.org/nsCertPickDialogs;1"]
				.getService(Components.interfaces.nsICertPickDialogs);
	try {
	    cpDialog.PickCertificate(
			ctx,
			x509CertNicknameList,
			x509CertInfoList,
			x509CertNicknameList.length,
			selectedIndexObj,
			canceledObj
	    		);
	    selectedIndex = selectedIndexObj.value;
	    canceled = canceledObj.value;
	} catch (ex) {
	    GeneratePKCS10CSRWizard.logError("GeneratePKCS10CSRWizardOverlay.selectCertInSoftToken(): cpDialog.PickCertificate() failed - ex: " + ex);
	}
	/*
    	var dialogParams = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
				.createInstance(Components.interfaces.nsIDialogParamBlock);
	dialogParams.SetNumberStrings(1 + (x509CertList.length * 2))
	for (var i = 0; i < x509CertList.length; i++) {
	    var nickName = x509CertNicknameList[i];
	    var x509CertInfo = x509CertInfoList[i];
	    try {
	    	dialogParams.SetString(i, nickName);
	    	dialogParams.SetString((x509CertList.length + i), x509CertInfo);
	    } catch (ex) {
	        GeneratePKCS10CSRWizard.logError("GeneratePKCS10CSRWizardOverlay.selectCertInSoftToken(): dialogParams.SetString() failed - ex: " + ex);
		continue;
	    }
	}
        dialogParams.SetInt(0, x509CertList.length);

    	var certPikcerWin = window.openDialog('chrome://pippki/content/certpicker.xul', "",
                    				'chrome,centerscreen,modal', dialogParams);

    	var retVal = dialogParams.GetInt(0);
    	GeneratePKCS10CSRWizard.logDebug("GeneratePKCS10CSRWizardOverlay.selectCertInSoftToken(): retVal: " + retVal); 
	if (retVal == 0) {
	    canceled = true;
	}
	else {
	    canceled = false;
	}
    	selectedIndex = dialogParams.GetInt(1);
	selectedNickName = dialogParams.GetString(selectedIndex);
	*/
    	GeneratePKCS10CSRWizard.logDebug("GeneratePKCS10CSRWizardOverlay.selectCertInSoftToken(): canceled: " + canceled + " selectedIdx: " + selectedIndex); 
	if (canceled || (selectedIndex < 0)) {
	    return null;
	}

	selectedNickName = x509CertNicknameList[selectedIndex];
    	GeneratePKCS10CSRWizard.logDebug("GeneratePKCS10CSRWizardOverlay.selectCertInSoftToken(): selectedNickName: " + selectedNickName); 
	selectedCert = x509CertList[selectedIndex];

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.selectCertFromList():................End.");
	return selectedCert;
    },

    selectCertInSoftToken : function (token, certType)
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.selectCertInSoftToken():................Start.");

    	var certCntObj = new Object();
    	var certNameListObj = new Object();
	try {
    	    GeneratePKCS10CSRWizard.mX509CertDB.findCertNicknames(
	    			token,
				certType,
				certCntObj,
				certNameListObj
				);
	} catch (ex) {
	    return null;
	}
    	var certCnt = certCntObj.value;
    	var certNameList = certNameListObj.value;
	if (certCnt == 0) {
	    return null;
	}
    	GeneratePKCS10CSRWizard.logDebug("GeneratePKCS10CSRWizardOverlay.selectCertInSoftToken(): certCnt: " + certCnt + " certNameList.length: " + certNameList.length); 

	var x509CertList = [];
    	for (var k = 0; k < certNameList.length; k++) {
	    var delim = certNameList[k].substring(0, 1); 
	    var certNameItems = certNameList[k].split(delim);
	    /*
	    for (var l = 0; l < certNameItems.length; l++) {
	        GeneratePKCS10CSRWizard.logDebug("    [" + k + "," + l +  "]: " + certNameItems[l]); 
	    }
	    */
	    var nickName = certNameItems[certNameItems.length - 2];
	    // GeneratePKCS10CSRWizard.logDebug("nickName[" + k + "]: " + nickName); 
	    var dbKey = certNameItems[certNameItems.length - 1];

	    var x509Cert = null;
	    var x509CertTokenName = null;
	    try {
	    	x509Cert = GeneratePKCS10CSRWizard.mX509CertDB.findCertByDBKey(dbKey, token);
	    } catch (ex) {
	        GeneratePKCS10CSRWizard.logError("GeneratePKCS10CSRWizard.mX509CertDB.findCertByDBKey() failed for " + nickName + " - ex: " + ex);
	    	continue;
	    }
	    if (token) {
	    	if (x509Cert.tokenName != token.tokenName) {
	    	    continue;
	    	}
	    }
    	    // GeneratePKCS10CSRWizard.logDebug("x509Cert[" + k + "]: " + x509Cert); 
	    x509CertList.push(x509Cert);
        }
	selectedCert = GeneratePKCS10CSRWizardOverlay.selectCertFromList(x509CertList);

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.selectCertInSoftToken():................End.");
	return selectedCert;
    },


    useExistingKeyExternalPageAdvanced : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExistingKeyExternalPageAdvanced():................Start.");
        var softTokenElem = document.getElementById("keymgr.genkeycsr.wizard.existingkey.external.softtoken");

	if (!softTokenElem.readytomount) {
	    return false;
	}

	var extSoftTokenName = "ExtSoftToken";
	var useAutoPassword = true; // only applicable for PKCS#8 and OSSL-EPK files

	var mountedSlot = null;
	try {
	    mountedSlot = softTokenElem.mountSoftToken(extSoftTokenName, useAutoPassword);
	} catch (ex) {
	    var errMsg = "Failed to mount the external soft-token using the chosen key/cert files.";
	    alert(errMsg);
            GeneratePKCS10CSRWizard.logError("GeneratePKCS10CSRWizardOverlay.useExistingKeyExternalPageAdvanced(): " + errMsg);
	    return false;
	}

	var mountedToken = mountedSlot.getToken();
    	GeneratePKCS10CSRWizard.logDebug("GeneratePKCS10CSRWizardOverlay.useExistingKeyExternalPageAdvanced(): mountedToken: " + mountedToken); 
	GeneratePKCS10CSRWizard.mWizardElem.selectedToken = mountedToken;

	var userCertList = softTokenElem.getTokenUserCertList();
	if (userCertList.length == 0) {
	    var errMsg = "Found no keys in the external soft-token.";
	    alert(errMsg);
            GeneratePKCS10CSRWizard.logError("GeneratePKCS10CSRWizardOverlay.useExistingKeyExternalPageAdvanced(): " + errMsg);
	    return false;
	}

	var selectedCert = userCertList[0];
	if (userCertList.length > 1) {
	    try {
		/*
	    	selectedCert = GeneratePKCS10CSRWizardOverlay.selectCertInSoftToken(
	    			mountedToken,
				Components.interfaces.nsIX509Cert.USER_CERT
				);
		*/
	    	selectedCert = GeneratePKCS10CSRWizardOverlay.selectCertFromList(userCertList);
	    } catch (ex) {
	        GeneratePKCS10CSRWizard.logError("GeneratePKCS10CSRWizardOverlay.useExistingKeyExternalPageAdvanced(): GeneratePKCS10CSRWizardOverlay.selectCertInSoftToken() failed - ex: " + ex);
		selectedCert = null;
	    }
	}
	GeneratePKCS10CSRWizard.mWizardElem.userCert = selectedCert;
	if (!selectedCert) {
	    return false;
	}

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExistingKeyExternalPageAdvanced():................End.");
        return true;
    },

    useExternalSoftTokenPageShow : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExternalSoftTokenPageShow():................Start.");

	GeneratePKCS10CSRWizardOverlay.mWizardPageElem = aWizardPageElem;
	GeneratePKCS10CSRWizardOverlay.mWizardElem = aWizardPageElem.parentNode;

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExternalSoftTokenPageShow():................End.");
        return true;
    },

    handleExternalSoftTokenOptionChange : function (aExternalSoftTokenOptionsElem, ev) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleExternalSoftTokenOptionChange():................Start.");

	var nextPageOptionElem = aKeySourceOptionsElem.selectedItem;
	var nextPageId = nextPageOptionElem.getAttribute("next");
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleExternalSoftTokenOptionChange(): nextPageId: " + nextPageId);
	/*
	GeneratePKCS10CSRWizardOverlay.mWizardPageElem.next = nextPageId;
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleExternalSoftTokenOptionChange():................End.");
    },

    useExternalSoftTokenPageAdvanced : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExternalSoftTokenPageAdvanced():................Start.");

	/*
        var keySourceOptionsElem = document.getElementById("keymgr.genkeycsr.wizard.keysource");
	var nextPageId = keySourceOptionsElem.selectedItem.getAttribute("next");
	aWizardPageElem.next = nextPageId;
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExternalSoftTokenPageAdvanced():................End.");
        return true;
    },

    useExternalFileKeystorePageShow : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExternalFileKeystorePageShow():................Start.");

	GeneratePKCS10CSRWizardOverlay.mWizardPageElem = aWizardPageElem;
	GeneratePKCS10CSRWizardOverlay.mWizardElem = aWizardPageElem.parentNode;

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExternalFileKeystorePageShow():................End.");
        return true;
    },

    handleExternalFileKeystoreOptionChange : function (aExternalFileKeystoreOptionsElem, ev) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleExternalFileKeystoreOptionChange():................Start.");

	var nextPageOptionElem = aKeySourceOptionsElem.selectedItem;
	var nextPageId = nextPageOptionElem.getAttribute("next");
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleExternalFileKeystoreOptionChange(): nextPageId: " + nextPageId);
	/*
	GeneratePKCS10CSRWizardOverlay.mWizardPageElem.next = nextPageId;
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.handleExternalFileKeystoreOptionChange():................End.");
    },

    useExternalFileKeystorePageAdvanced : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExternalFileKeystorePageAdvanced():................Start.");
	/*
        var keySourceOptionsElem = document.getElementById("keymgr.genkeycsr.wizard.keysource");
	var nextPageId = keySourceOptionsElem.selectedItem.getAttribute("next");
	aWizardPageElem.next = nextPageId;
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.useExternalFileKeystorePageAdvanced():................End.");
        return true;
    },

    selectedKeyPageShow : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.selectedKeyPageShow():................Start.");

	/*
	GeneratePKCS10CSRWizardOverlay.mWizardPageElem = aWizardPageElem;
	GeneratePKCS10CSRWizardOverlay.mWizardElem = aWizardPageElem.parentNode;
	*/
        var selectedKeyCertItemElem = document.getElementById("keymgr.genkeycsr.wizard.selectedkey.cert");

	selectedKeyCertItemElem.cert = null;
	if (!GeneratePKCS10CSRWizard.mWizardElem.userCert) {
	    GeneratePKCS10CSRWizard.mWizardElem.canAdvance = false;
	}
	GeneratePKCS10CSRWizard.mWizardElem.canAdvance = true;

	selectedKeyCertItemElem.cert = GeneratePKCS10CSRWizard.mWizardElem.userCert;

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.selectedKeyPageShow():................End.");
        return true;
    },

    getUserChallengePassword : function (ev)
    {
        GeneratePKCS10CSRWizard.logTrace("SCEPClientWizard.getUserChallengePassword():...................Start.");

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
    	var getUserChallengePWDialog = window.openDialog(
    						getUserChallengePWDialogURL, "",
    						'chrome,centerscreen,resizable,modal',
    						pkiParams
    						);
        var retVal = dialogParams.GetInt(0);
        if (retVal == 0) {
    	    GeneratePKCS10CSRWizard.logError("SCEPClientWizard.getUserChallengePassword(): failed to retrive challlenge password.");
	    GeneratePKCS10CSRWizard.logTrace("SCEPClientWizard.getUserChallengePassword():...................End(0).");
    	    return;
        }
        var userChallengePW = dialogParams.GetString(0);
    
        var challengePWElem = document.getElementById("keymgr.genkeycsr.wizard.selectedkey.challengepw");
        challengePWElem.value = userChallengePW;
    
        GeneratePKCS10CSRWizard.logTrace("SCEPClientWizard.getUserChallengePassword():...................End.");
    },
    
    selectedKeyPageAdvanced : function (aWizardPageElem) 
    {
        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.selectedKeyPageAdvanced():................Start.");

	/*
        var keySourceOptionsElem = document.getElementById("keymgr.genkeycsr.wizard.keysource");
	var nextPageId = keySourceOptionsElem.selectedItem.getAttribute("next");
	aWizardPageElem.next = nextPageId;
	*/

        GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizardOverlay.selectedKeyPageAdvanced():................End.");
        return true;
    },

    lastMethod : function () 
    {
    }
}
