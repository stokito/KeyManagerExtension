/* @(#) $Id: GeneratePKCS10CSRWizard.js,v 1.6 2012/10/07 17:20:23 subrata Exp $ */

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


var GeneratePKCS10CSRWizard = {


    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,

    mDialogParams		: null,

    mWizardElem			: null,

    mTestMode			: false,

    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > GeneratePKCS10CSRWizard.mMaxLogLevel) {
	    return;
	}
	dump(msg + "\n");
    },

    logError : function(msg)
    {
	GeneratePKCS10CSRWizard.log(2, msg);
    },
    logTrace : function(msg)
    {
	GeneratePKCS10CSRWizard.log(4, msg);
    },
    logDebug : function(msg)
    {
	GeneratePKCS10CSRWizard.log(8, msg);
    },

    loginToInternalToken : function () 
    {
	// GeneratePKCS10CSRWizard.mMaxLogLevel = 9;
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.loginToInternalToken():................Start.");

	var token = null;
	try {
	    token = GeneratePKCS10CSRWizard.mTokenDB.getInternalKeyToken();
	} catch (ex) {}
	if (!token) {
	    return;
	}

	var testOption = false;
	var testPassword = null;
	do {
	    var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
	    try {
		var prefBranchPrefixId = "extensions.avpki.tools.test.";
		var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
		if (!prefsBranch) {
		    break;
		}

		var prefBoolValue = prefsBranch.getBoolPref("enabled");
		if (prefBoolValue) {
		    testOption = true;
		}
		if (!testOption) {
		    break;
		}

		var prefStringValue = prefsBranch.getCharPref("password");
		if (prefStringValue && (prefStringValue != "")) {
		    testPassword = prefStringValue;
		}
	    } catch (ex) {
		GeneratePKCS10CSRWizard.logDebug("GeneratePKCS10CSRWizard.loginToInternalToken():  unable to obtain preferences - ex: " + ex);
		break;
	    }

	} while (0);

	if (testOption && testPassword) {
	    /**********************************************/
	    /* TODO:  TEST CODE - remove after test phase */
	    /**********************************************/
	    GeneratePKCS10CSRWizard.mTestMode = testOption;
	    try {
		token.checkPassword(testPassword);
	    } catch (ex) {}
	}

	try {
	    token.login(false);
	    GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.loginToInternalToken(): successfully logged in to internal-token.");
	} catch (ex) {}

	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.loginToInternalToken():................End.");
	// GeneratePKCS10CSRWizard.mMaxLogLevel = 4;
	return;
    },

    loginToCertToken : function (aCert, force)
    {
	var keyTokenName = "" + aCert.tokenName;

	var /* nsIPK11Token */ token = this.mTokenDB.findTokenByName(keyTokenName);
	if (!token) {
	    return;
	}

	var forceLogin = ((force == null) ? false : force);
	token.login(forceLogin);

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
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = GeneratePKCS10CSRWizard.trim(aTextboxElem.value);
	}

	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.handleTextboxChange():................End.");
    },


    initXPComServiceInfo : function ()
    {
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initXPComServiceInfo():................Start.");

	try {
	    GeneratePKCS10CSRWizard.mIOService = Components.classes["@mozilla.org/network/io-service;1"]
				.getService(Components.interfaces.nsIIOService);
	    GeneratePKCS10CSRWizard.mDirService = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties);
	    GeneratePKCS10CSRWizard.mX509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
				.getService(Components.interfaces.nsIX509CertDB);
	    GeneratePKCS10CSRWizard.mTokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
				.getService(Components.interfaces.nsIPK11TokenDB);
	    GeneratePKCS10CSRWizard.mKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
				.getService(Components.interfaces.alrIKeyManager);
	    /*
	    GeneratePKCS10CSRWizard.mCRLManager = Components.classes["@avaya.com/pkm/alrcrlmanager;1"]
				.getService(Components.interfaces.alrICRLManager);
	     */
	} catch (ex) {
	    alert("GeneratePKCS10CSRWizard.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    GeneratePKCS10CSRWizard.logError("GeneratePKCS10CSRWizard.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
	}

	GeneratePKCS10CSRWizard.loginToInternalToken();

	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initXPComServiceInfo():................End.");
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
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initWithDefaultValues():................Start.");

	do {
	    var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
	    try {
		var prefBranchPrefixId = "";
		var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
		if (!prefsBranch) {
		    break;
		}

		var prefStringValue = null;
		var prefBoolValue = false;
		var prefIntValue = false;

		/*
		prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("genkeyoption");
		} catch (ex) {} 
		if (prefStringValue && (prefStringValue != "")) {
		    GeneratePKCS10CSRWizard.mGenKeyOptionName = prefStringValue;
		}
		*/

		prefIntValue = false;
		try {
		    prefIntValue = prefsBranch.getIntPref("extensions.avpki.genkeycsr.wizard.loglevel");
		    GeneratePKCS10CSRWizard.mMaxLogLevel = prefIntValue;
		} catch (ex) {} 

		/*
		prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("loglevel");
		} catch (ex) {} 
		GeneratePKCS10CSRWizard.mXXXX.checked = prefBoolValue;
		*/

	    } catch (ex) {
		GeneratePKCS10CSRWizard.logDebug("GeneratePKCS10CSRWizard.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);

	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initWithDialogParams():................Start.");
	// GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initWithDialogParams(): window.arguments: " + window.arguments);

	if (!(window.arguments) || (window.arguments.length <= 0)) {
	    GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initWithDialogParams():................End(0).");
	    return;
	}

	var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);

	var mode = dialogParams.GetString(0);

	var pkiParams = null;
	try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    if (pkiParams) {
		/*
		var paramCRL = pkiParams.getISupportAtIndex(1);
		if (paramCRL) {
		    GeneratePKCS10CSRWizard.logDebug("GeneratePKCS10CSRWizard.initWithDialogParams(): paramCRL: " + paramCRL);
		    selectedCRL = paramCRL.QueryInterface(Components.interfaces.alrICRL);
		}
		*/
	    }
	} catch (ex) {
	    GeneratePKCS10CSRWizard.logError("GeneratePKCS10CSRWizard.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}

	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initWithDialogParams():................End.");
    },

    mInitialized		: false,
    initOnLoad : function (aWizardElem, ev) 
    {
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initOnLoad():................Start.");

	if (GeneratePKCS10CSRWizard.mInitialized) {
	    GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initOnLoad():................End(0).");
	    return;
	}
	GeneratePKCS10CSRWizard.mInitialized = true;

	// GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initOnLoad(): window.arguments: " + window.arguments);

	if ((window.arguments) && (window.arguments.length > 0)) {
	    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    GeneratePKCS10CSRWizard.mDialogParams = dialogParams;
	}
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initOnLoad():...................10.");


	GeneratePKCS10CSRWizard.mWizardElem = document.getElementById("keymgr.genkeycsr.wizard");
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initOnLoad(): GeneratePKCS10CSRWizard.mWizardElem: " + GeneratePKCS10CSRWizard.mWizardElem);

	GeneratePKCS10CSRWizard.initXPComServiceInfo();

	GeneratePKCS10CSRWizard.initWithDefaultValues();
	GeneratePKCS10CSRWizard.initWithDialogParams();

	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.initOnLoad():................End.");
    },

    generateCSRWithParam : function (aUserX509Cert, aChallengePW)
    {
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.generateCSRWithParam():..................Start.");
    
	var base64PKCS10CSR =  null;
	if (aUserX509Cert == null) {
	    return base64PKCS10CSR;
	}
	// dump("generateCSRWithParam(): aChallengePW: |" + aChallengePW + "|\n");
    
	// Force token login - on windows the popup window for password is not coming up
	GeneratePKCS10CSRWizard.loginToCertToken(aUserX509Cert);
    
	try {
	    var certProps = null;
	    certProps = Components.classes["@mozilla.org/persistent-properties;1"]
				.createInstance(Components.interfaces.nsIPersistentProperties);
	    if (aChallengePW && (aChallengePW != "")) {
		var propKey;
		var propValue;
		var propOldValue;
		propKey = "pkcs9ChallengePassword"; propValue = aChallengePW;
		propOldValue = certProps.setStringProperty(propKey, propValue);
		// dump("generateCSRWithParam():...................................20.\n");
	    }
	    base64PKCS10CSR = GeneratePKCS10CSRWizard.mKeyManager.generatePKCS10CSRByX509Cert(
				aUserX509Cert,
				certProps
				);
	} catch (ex) {
	    GeneratePKCS10CSRWizard.logError("generateCSRWithParam(): keyManager.generatePKCS10CSRByX509Cert() failed - ex : " + ex);
	    return base64PKCS10CSR;
	}
	GeneratePKCS10CSRWizard.logDebug("GeneratePKCS10CSRWizard.generateCSRWithParam(): CSR for " + aUserX509Cert.nickname + " is exported.");
	// dump("base64PKCS10CSR:\n" + base64PKCS10CSR);
    
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.generateCSRWithParam():.................End.");
	return base64PKCS10CSR;
    },
    
    finishPageShow : function (aWizardPageElem)
    {
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.finishPageShow():................Start.");

	var csrSaveElem = document.getElementById("keymgr.genkeycsr.wizard.finish.csr.save");
	var csrDataElem = document.getElementById("keymgr.genkeycsr.wizard.finish.csr.data");
	csrDataElem.value = "";

	// GeneratePKCS10CSRWizard.mWizardElem.userCert
	var challengePWElem = document.getElementById("keymgr.genkeycsr.wizard.selectedkey.challengepw");

	var userX509Cert = GeneratePKCS10CSRWizard.mWizardElem.userCert;
	if (!userX509Cert) {
	    GeneratePKCS10CSRWizard.mWizardElem.canAdvance = false;
	    csrSaveElem.disabled = true;
	    return false;
	}
	var challengePW = challengePWElem.value;

	var base64PKCS10CSR =  GeneratePKCS10CSRWizard.generateCSRWithParam(userX509Cert, challengePW);
	if (!base64PKCS10CSR) {
	    GeneratePKCS10CSRWizard.mWizardElem.canAdvance = false;
	    csrSaveElem.disabled = true;
	    return false;
	}
	GeneratePKCS10CSRWizard.mWizardElem.base64PKCS10CSR = base64PKCS10CSR;

	csrDataElem.value = base64PKCS10CSR;
	csrSaveElem.disabled = false;

	GeneratePKCS10CSRWizard.mWizardElem.canAdvance = true;
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.finishPageShow():................End.");
    },

    saveCSRToFile : function (ev)
    {
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.saveCSRToFile():................Start.");

	var userX509Cert = GeneratePKCS10CSRWizard.mWizardElem.userCert;
	var certNickName = userX509Cert.nickname;
		certNickName = certNickName.replace(/\./g, "_");
		certNickName = certNickName.replace(/-/g, "_");
		certNickName = certNickName.replace(/:/g, "_");
		certNickName = certNickName.replace(/\W/g,"");

		certNickName = certNickName.replace(/__/g, "_");
		certNickName = certNickName.replace(/^_/, "");

	var csrFilePickerElem = document.getElementById("keymgr.genkeycsr.wizard.finish.csr.filepicker");
	var csrFileName = certNickName + "_pkcs10_base64.csr";

	var csrFile = csrFilePickerElem.selectFileByName(null, csrFileName);
	if(!csrFile) {
	    return false;
	}
	csrFilePickerElem.saveData(GeneratePKCS10CSRWizard.mWizardElem.base64PKCS10CSR);
	
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.saveCSRToFile():................End.");
	return true;
    },

    finishPageAdvanced : function (aWizardPageElem)
    {
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.finishPageAdvanced():................Start.");

	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.finishPageAdvanced():................End.");
	return true;
    },

    errorPageShow : function (aWizardPageElem) 
    {
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.errorPageShow():................Start.");

	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.errorPageShow():................End.");
	return true;
    },

    onFinish : function (aWizardElem)
    {
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.onFinish():................Start.");

	var pkiParams = null;
	var dialogParams =  null;
	if (window.arguments && (window.arguments.length > 0)) {
	    dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    try {
		pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    } catch (ex) { }
	}
	if (dialogParams) {
	    GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.onFinish():................10.");
	    dialogParams.SetInt(0, 0);
	    var base64PKCS10CSR = GeneratePKCS10CSRWizard.mWizardElem.base64PKCS10CSR;
	    if (base64PKCS10CSR != "") {
		GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.onFinish():................20.");
		dialogParams.SetString(0, base64PKCS10CSR);
		dialogParams.SetInt(0, 1);
	    }
	}
	
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.onFinish():................End.");
    },

    onCancel : function (aWizardElem)
    {
	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.onCancel():................Start.");

	var pkiParams = null;
	var dialogParams =  null;
	if (window.arguments && (window.arguments.length > 0)) {
	    dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    try {
		pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    } catch (ex) { }
	}
	if (dialogParams) {
	    dialogParams.SetInt(0, 0);
	}

	GeneratePKCS10CSRWizard.logTrace("GeneratePKCS10CSRWizard.onCancel():................End.");
    },

    lastMethod : function () 
    {
    }
}

