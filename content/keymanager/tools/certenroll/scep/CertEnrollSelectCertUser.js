/* @(#) $Id: CertEnrollSelectCertUser.js,v 1.7 2012/10/07 17:20:10 subrata Exp $ */

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

if ((typeof avpki) == 'undefined') {
    var avpki = {};
    avpki.keymanager = {};
}
if ((typeof avpki.keymanager) == 'undefined') {
    avpki.keymanager = {};
}


avpki.keymanager.CertEnrollSelectCertUser = {


    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,

    mDialogParams		: null,
    mWizardInitalized		: false,
    mScepClientPkcsReqParam	: {},

    mLogEnabled : false,


    mCARAServerURLDefault : null,
    mCACapOverrideEnabled : false,
    mCACapOverrideValue : null,
    mHttpMethodFormPostEnabled : false,
    mGetCertInitialTestEnabled : false,

    mTestMode 			: false,

    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > this.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    logError : function(msg)
    {
        this.log(2, msg);
    },
    logTrace : function(msg)
    {
        this.log(4, msg);
    },
    logDebug : function(msg)
    {
        this.log(8, msg);
    },

    loginToInternalToken : function () 
    {
        this.logTrace("CertEnrollSelectCertUser.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = this.mTokenDB.getInternalKeyToken();
        } catch (ex) {}
	if (!token) {
            this.logTrace("CertEnrollSelectCertUser.loginToInternalToken():................End(0).");
	    return;
	}

	try {
            token.login(false);
            this.logTrace("CertEnrollSelectCertUser.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("CertEnrollSelectCertUser.loginToInternalToken():................End.");
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
    	this.logTrace("CertEnrollSelectCertUser.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = this.trim(aTextboxElem.value);
	}
        var formFieldKey = aTextboxElem.getAttribute("autocompletesearchparam");
	if (formFieldKey) {
	    this.textFieldAutoCompleteAction(aTextboxElem);
	}

    	this.logTrace("CertEnrollSelectCertUser.handleTextboxChange():................End.");
    },


    initXPComServiceInfo : function ()
    {
        this.logTrace("CertEnrollSelectCertUser.initXPComServiceInfo():................Start.");

        try {
    	    this.mIOService = Components.classes["@mozilla.org/network/io-service;1"]
		    		.getService(Components.interfaces.nsIIOService);
	    this.mDirService = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties);
	    this.mX509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
	                        .getService(Components.interfaces.nsIX509CertDB);
            this.mTokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
                                .getService(Components.interfaces.nsIPK11TokenDB);
	    this.mKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
	                        .getService(Components.interfaces.alrIKeyManager);
	    /*
            this.mCRLManager = Components.classes["@avaya.com/pkm/alrcrlmanager;1"]
				.getService(Components.interfaces.alrICRLManager);
	     */
        } catch (ex) {
    	    alert("CertEnrollSelectCertUser.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("CertEnrollSelectCertUser.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	// this.loginToInternalToken();

	this.logTrace("CertEnrollSelectCertUser.initXPComServiceInfo():................End.");
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
    	this.logTrace("CertEnrollSelectCertUser.initWithDefaultValues():................Start.");

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
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.scepclient.serverurl.default");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mCARAServerURLDefault = prefStringValue;
	        }

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.log.enabled");
	            this.mLogEnabled = prefBoolValue;
		} catch (ex) {} 

                prefIntValue = -1;
		try {
		    prefIntValue = prefsBranch.getIntPref("extensions.avpki.scepclient.log.level");
	            // this.mMaxLogLevel = prefIntValue;
		} catch (ex) {} 
		*/

            } catch (ex) {
	    	this.logDebug("CertEnrollSelectCertUser.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);

    	this.logTrace("CertEnrollSelectCertUser.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	this.logTrace("CertEnrollSelectCertUser.initWithDialogParams():................Start.");

    	this.logTrace("CertEnrollSelectCertUser.initWithDialogParams():................End.");
    },

    setScepParamsInternal : function (aUserSubjectDN, aUserX509Cert, aUserChallengePW) 
    {
    	this.logTrace("CertEnrollSelectCertUser.setScepParamsInternal():................Start.");
    	this.logDebug("CertEnrollSelectCertUser.setScepParamsInternal():\n" + 
			"    aUserSubjectDN: "		+ aUserSubjectDN + "\n" + 
			"    aUserX509Cert.nickname: "	+ (aUserX509Cert ? aUserX509Cert.nickname : "null") + "\n" + 
			"    aUserChallengePW: "		+ aUserChallengePW + "\n" + 
			"");

	if (aUserSubjectDN) {
	    this.mUserSubjectDNElem.value = aUserSubjectDN;
	    this.handleUserSubjectDNChange(this.mUserSubjectDNElem);
	}
	else {
	    this.mUserCertPickerElem.selectedCert = null;
	}
	if (!aUserSubjectDN && aUserX509Cert) {
	    this.mUserCertPickerElem.selectedCert = aUserX509Cert;
	    this.handleUserCertPickerChange(this.mUserCertPickerElem);
	}

	if (aUserChallengePW) {
	    this.mSelectUserCertChallengePWElem.value = aUserChallengePW;
	}

    	this.logTrace("CertEnrollSelectCertUser.setScepParamsInternal():................End.");
    },

    setScepParams : function (aScepClientParams) 
    {
    	this.logTrace("CertEnrollSelectCertUser.setScepParams():................Start.");
    	this.logDebug("CertEnrollSelectCertUser.setScepParams():\n" + 
			"    userSubjectDN: "		+ aScepClientParams.userSubjectDN + "\n" + 
			"    userX509CertAlias: "	+ aScepClientParams.userX509CertAlias + "\n" + 
			"    userX509Cert: "		+ aScepClientParams.userX509Cert + "\n" + 
			"    userX509Cert.nickname: "	+ (aScepClientParams.userX509Cert ? aScepClientParams.userX509Cert.nickname : "null") + "\n" + 
			"    userChallengePW: "		+ aScepClientParams.userChallengePW + "\n" + 
			"");
	this.mScepClientParams = aScepClientParams;
	this.setScepParamsInternal(
		aScepClientParams.userSubjectDN,
		aScepClientParams.userX509Cert,
		aScepClientParams.userChallengePW
		);
	if (!aScepClientParams.userX509Cert && this.mUserCertPickerElem.selectedCert) {
	    aScepClientParams.userX509Cert = this.mUserCertPickerElem.selectedCert;
	}

    	this.logTrace("CertEnrollSelectCertUser.setScepParams():................End.");
    },

    getScepParams : function (aScepClientParams) 
    {
    	this.logTrace("CertEnrollSelectCertUser.getScepParams():................Start.");

	aScepClientParams.userChallengePW = this.mSelectUserCertChallengePWElem.value;

	if (this.mUserCertPickerElem.selectedCert) {
	    aScepClientParams.userX509Cert = this.mUserCertPickerElem.selectedCert;
	    aScepClientParams.userSubjectDN = aScepClientParams.userX509Cert.subjectName;
	}
	else {
	    if (this.mUserSubjectDNElem.value != "") {
	    	aScepClientParams.userSubjectDN = this.mUserSubjectDNElem.value;
	    }
	}

        var signedX509Cert = null;
        if (aScepClientParams.issuerX509Cert && aScepClientParams.userX509Cert) {
            try {
                signedX509Cert = this.mKeyManager.findCASignedX509CertByCertSPKI(
                                        aScepClientParams.userX509Cert,
                                        aScepClientParams.issuerX509Cert
                                        );
            } catch (ex) {
                this.logError("CertEnrollSelectCertUser.getScepParams(): this.mKeyManager.findCASignedX509CertByCertSPKI() failed for " + aScepClientParams.userX509Cert.subjectName);
            }
        }
        this.logDebug("CertEnrollSelectCertUser.getScepParams(): signedX509Cert: " + signedX509Cert + "");
	aScepClientParams.userX509CertSigned = signedX509Cert;

    	this.logTrace("CertEnrollSelectCertUser.getScepParams():................End.");
    },

    initOnLoad : function (aWizardElem) 
    {
    	this.logTrace("CertEnrollSelectCertUser.initOnLoad():................Start.");


	this.mWizardElem = aWizardElem;
    	this.mUserSubjectDNElem			= document.getElementById('keymgr.certenroll.scep.page.selectcert.user.subjectdn');
    	this.mUserCertPickerElem		= document.getElementById('keymgr.certenroll.scep.page.selectcert.user.certpicker');
    	this.mSelectUserCertChallengePWElem	= document.getElementById("keymgr.certenroll.scep.page.selectcert.user.challengepw");

	this.mUserCertPickerElem.refresh();
	// this.mCASignedCertItemElem.refresh();

	this.mUserCert			= null;

	this.initXPComServiceInfo();

	this.initWithDefaultValues();
	this.initWithDialogParams();

	this.handleUserCertPickerChange(this.mUserCertPickerElem);

    	this.logTrace("CertEnrollSelectCertUser.initOnLoad():................End.");
    },

    valdiateSCEPParams : function()
    {
    	this.logTrace("CertEnrollSelectCertUser.valdiateSCEPParams():................Start.");

	var pageIsValid = false;
	if (this.mUserCertPickerElem.selectedCert) {
	    pageIsValid = true;
	}
	this.mWizardElem.canAdvance = pageIsValid;

    	this.logTrace("CertEnrollSelectCertUser.valdiateSCEPParams():................End.");
	return pageIsValid;
    },

    formatSubjectDN : function (aTargetSubjectDNElemId, ev)
    {
    	this.logTrace("CertEnrollSelectCertUser.formatSubjectDN():..................Start.");

    	var targetSubjectDNElem = document.getElementById(aTargetSubjectDNElemId);

	window.setCursor('wait');
    	var dialogParams = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
				.createInstance(Components.interfaces.nsIDialogParamBlock);
    	dialogParams.SetInt(0, 0);
    	dialogParams.SetString(0, targetSubjectDNElem.value);
	var createSubjectDialogURL = 'chrome://keymanager/content/tools/genkeycsr/subjectDialog.xul';
    	window.openDialog(
			createSubjectDialogURL, // 'chrome://keymanager/content/tools/genkeycsr/subjectDialog.xul',
    			'_blank',
			'chrome,centerscreen,resizable,modal,dialog=no,titlebar',
			dialogParams
			);
	window.setCursor('auto');
    	if (dialogParams.GetInt(0) == 0) { // Selected Cancel or failed.
    	    return;
    	}
	var subjectDN = dialogParams.GetString(0);

	targetSubjectDNElem.value = subjectDN;
	
    	this.logTrace("CertEnrollSelectCertUser.formatSubjectDN():..................End.");
    },

    findX509CertBySubjectDN : function (aSubjectDN)
    {
	var x509Cert = null;
    	try {
	    if (aSubjectDN && (aSubjectDN != "")) {
	    	x509Cert =  this.mKeyManager.findX509CertBySubjectName(aSubjectDN);
	    }
	} catch (ex) {
	    x509Cert = null;
	}
    	this.logDebug("CertEnrollSelectCertUser.findX509CertBySubjectDN(): aSubjectDN: " + aSubjectDN + " ==> " + x509Cert + "");
	return x509Cert;
    },

    handleUserSubjectDNChange : function (aUserSubjectDNElem, ev)
    {
    	this.logTrace("CertEnrollSelectCertUser.handleUserSubjectDNChange():...................Start.");

	this.handleTextboxChange(aUserSubjectDNElem);

	// Initialize certpicker for CA with the correcponding X.609 cert for the subject.
    	var x509Cert = this.findX509CertBySubjectDN(aUserSubjectDNElem.value);
	this.mUserCertPickerElem.selectedCert = x509Cert;
	this.handleUserCertPickerChange(this.mUserCertPickerElem);


    	this.logTrace("CertEnrollSelectCertUser.handleUserSubjectDNChange():...................End.");
    },

    formatUserSubjectDN : function (aUserSubjectDNElem, ev)
    {
    	this.logTrace("CertEnrollSelectCertUser.formatUserSubjectDN():..................Start.");

	this.formatSubjectDN(aUserSubjectDNElem, ev);
	this.handleUserSubjectDNChange(this.mCASubjectDNElem);

    	this.logTrace("CertEnrollSelectCertUser.formatUserSubjectDN():..................End.");
    },

    handleUserCertPickerChange : function(aUserCertPickerElem, ev)
    {
    	this.logTrace("CertEnrollSelectCertUser.handleUserCertPickerChange():...................Start.");

	this.mUserCert		= aUserCertPickerElem.selectedCert;

    	this.logTrace("CertEnrollSelectCertUser.handleUserCertPickerChange():...................End.");
    },

    handleCreateUserCertSimple : function(ev)
    {
    	this.logTrace("CertEnrollSelectCertUser.handleCreateUserCertSimple():...................Start.");

	if (ev) {
	   ev.stopPropagation();
	}

	// TODO: Implement Self-signed cert generation 

	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
					.createInstance(Components.interfaces.nsIPKIParamBlock);
	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
	var strIdx = 0;
	if (this.mUserSubjectDNElem.value != "") {
	    dialogParams.SetString(0, this.mUserSubjectDNElem.value);
	}

	strIdx++;
	if (!this.mUserCertPickerElem.selectedCert && (this.mScepClientParams.userX509CertAlias != "")) {
	    dialogParams.SetString(strIdx, this.mScepClientParams.userX509CertAlias);
	}

	pkiParams.setISupportAtIndex(1, null);

	var createCertSimpleDialogURL = 'chrome://keymanager/content/tools/genkeycsr/createCertSimpleDialog.xul';
	window.setCursor('wait');
	var createCertSimpleDialog = window.openDialog(
						createCertSimpleDialogURL, "",
						'chrome,centerscreen,resizable,modal',
						pkiParams
						);
	window.setCursor('auto');

	var retVal = dialogParams.GetInt(0);
	if (retVal == 0) {
	    this.logError("CertEnrollSelectCertUser.handleCreateUserCertSimple(): failed to create self-signed cert.");
	    return;
	}

	var /* nsIX509Cert */ retX509Cert = null;
	var retCert = pkiParams.getISupportAtIndex(1);
	if (retCert) {
	    retX509Cert = retCert.QueryInterface(Components.interfaces.nsIX509Cert);
	}

	if (retX509Cert) {
	    this.mUserCertPickerElem.refresh();
	    this.mUserCertPickerElem.selectedCert = retX509Cert;
	    this.handleUserCertPickerChange(this.mUserCertPickerElem);
	    if (this.mUserCertPickerElem.selectedCert) {
	        this.mUserSubjectDNElem.value = this.mUserCertPickerElem.selectedCert.subjectName;
	    }
	}


    	this.logTrace("CertEnrollSelectCertUser.handleCreateUserCertSimple():...................End.");
    },

    handleCreateUserCertAdvanced : function(ev)
    {
    	this.logTrace("CertEnrollSelectCertUser.handleCreateUserCertAdvanced():...................Start.");
	if (ev) {
	   ev.stopPropagation();
	}

	// TODO: Implement Self-signed cert generation 
	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
					.createInstance(Components.interfaces.nsIPKIParamBlock);
	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
	dialogParams.SetString(0, "generateSelfSignedCert");
	pkiParams.setISupportAtIndex(1, null);

	var genKeyCSRDialogURL = 'chrome://keymanager/content/tools/genkeycsr/generatePKCS10CSR.xul';
	window.setCursor('wait');
	var genKeyCSRDialog = window.openDialog(
						genKeyCSRDialogURL, "",
						'chrome,centerscreen,resizable,modal',
						pkiParams
						);
	window.setCursor('auto');

	var retVal = dialogParams.GetInt(0);
	if (retVal == 0) {
	    this.logError("CertEnrollSelectCertUser.handleCreateUserCertAdvanced(): failed to create self-signed cert.");
	    return;
	}

	var /* nsIX509Cert */ retX509Cert = null;
	var retCert = pkiParams.getISupportAtIndex(1);
	if (retCert) {
	    retX509Cert = retCert.QueryInterface(Components.interfaces.nsIX509Cert);
	}

	if (retX509Cert) {
	    this.mUserCertPickerElem.refresh();
	    this.mUserCertPickerElem.selectedCert = retX509Cert;
	    this.handleUserCertPickerChange(this.mUserCertPickerElem);
	    if (this.mUserCertPickerElem.selectedCert) {
	        this.mUserSubjectDNElem.value = this.mUserCertPickerElem.selectedCert.subjectName;
	    }
	}

    	this.logTrace("CertEnrollSelectCertUser.handleCreateUserCertAdvanced():...................End.");
    },

    getUserChallengePassword : function(ev)
    {
    	this.logTrace("CertEnrollSelectCertUser.getUserChallengePassword():...................Start.");
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
	    this.logError("CertEnrollSelectCertUser.getUserChallengePassword(): failed to retrive challlenge password.");
    	    this.logTrace("CertEnrollSelectCertUser.getUserChallengePassword():...................End(0).");
	    return;
	}
	var userChallengePW = dialogParams.GetString(0);
	this.mSelectUserCertChallengePWElem.value = userChallengePW;

    	this.logTrace("CertEnrollSelectCertUser.getUserChallengePassword():...................End.");
    },

    lastMethod : function () 
    {
    }
}



