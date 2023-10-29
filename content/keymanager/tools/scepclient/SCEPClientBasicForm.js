/* @(#) $Id: SCEPClientBasicForm.js,v 1.17 2012/10/07 17:20:54 subrata Exp $ */

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


var SCEPClientBasicForm = {


    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,

    mDialogParams		: null,
    mWizardInitalized		: false,
    mScepClientPkcsReqParam	: {},
    mScepServerObj		: {},

    mLogEnabled : true,


    mCARAServerURLDefault : null,
    mCACapOverrideEnabled : false,
    mCACapOverrideValue : null,
    mHttpMethodFormPostEnabled : false,
    mGetCertInitialTestEnabled : false,
    mAvDeviceProfileEnabled	: false,

    mTestMode 			: false,

    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > SCEPClientBasicForm.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    logError : function(msg)
    {
        SCEPClientBasicForm.log(2, msg);
    },
    logTrace : function(msg)
    {
        SCEPClientBasicForm.log(4, msg);
    },
    logDebug : function(msg)
    {
        SCEPClientBasicForm.log(8, msg);
    },

    loginToInternalToken : function () 
    {
        SCEPClientBasicForm.logTrace("SCEPClientBasicForm.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = SCEPClientBasicForm.mTokenDB.getInternalKeyToken();
        } catch (ex) {}
	if (!token) {
            SCEPClientBasicForm.logTrace("SCEPClientBasicForm.loginToInternalToken():................End(0).");
	    return;
	}

	try {
            token.login(false);
            SCEPClientBasicForm.logTrace("SCEPClientBasicForm.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        SCEPClientBasicForm.logTrace("SCEPClientBasicForm.loginToInternalToken():................End.");
	return;
    },

    loginToCertToken : function (aCert, force)
    {
        var keyTokenName = "" + aCert.tokenName;

        var /* nsIPK11Token */ token = SCEPClientBasicForm.mTokenDB.findTokenByName(keyTokenName);
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
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = SCEPClientBasicForm.trim(aTextboxElem.value);
	}
        var formFieldKey = aTextboxElem.getAttribute("autocompletesearchparam");
	if (formFieldKey) {
	    SCEPClientBasicForm.textFieldAutoCompleteAction(aTextboxElem);
	}

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleTextboxChange():................End.");
    },


    initXPComServiceInfo : function ()
    {
        SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initXPComServiceInfo():................Start.");

        try {
    	    SCEPClientBasicForm.mIOService = Components.classes["@mozilla.org/network/io-service;1"]
		    		.getService(Components.interfaces.nsIIOService);
	    SCEPClientBasicForm.mDirService = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties);
	    SCEPClientBasicForm.mX509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
	                        .getService(Components.interfaces.nsIX509CertDB);
            SCEPClientBasicForm.mTokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
                                .getService(Components.interfaces.nsIPK11TokenDB);
	    SCEPClientBasicForm.mKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
	                        .getService(Components.interfaces.alrIKeyManager);
	    /*
            SCEPClientBasicForm.mCRLManager = Components.classes["@avaya.com/pkm/alrcrlmanager;1"]
				.getService(Components.interfaces.alrICRLManager);
	     */
        } catch (ex) {
    	    alert("SCEPClientBasicForm.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    SCEPClientBasicForm.logError("SCEPClientBasicForm.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	// SCEPClientBasicForm.loginToInternalToken();

	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initXPComServiceInfo():................End.");
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
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initWithDefaultValues():................Start.");

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

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.log.enabled");
	            SCEPClientBasicForm.mLogEnabled = prefBoolValue;
		} catch (ex) {} 

                prefIntValue = -1;
		try {
		    prefIntValue = prefsBranch.getIntPref("extensions.avpki.scepclient.log.level");
	            // SCEPClientBasicForm.mMaxLogLevel = prefIntValue;
		} catch (ex) {} 

   
                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.scepclient.serverurl.default");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    SCEPClientBasicForm.mCARAServerURLDefault = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.scepclient.serverurl.last");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    SCEPClientBasicForm.mScepServerURLElem = prefStringValue;
	        }

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.httpmethod.postform");
	            SCEPClientBasicForm.mHttpMethodFormPostEnabled = prefBoolValue;
		} catch (ex) {} 

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.capabilities.override");
	            SCEPClientBasicForm.mCACapOverrideEnabled = prefBoolValue;
		} catch (ex) {} 

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.scepclient.capabilities.value");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    SCEPClientBasicForm.mCACapOverrideValue = prefStringValue.replace(/ /g, "\n");
		    SCEPClientBasicForm.mCACapOverrideValue += "\n";
	        }

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.avdevprofile.enabled");
	            SCEPClientBasicForm.mAvDeviceProfileEnabled = prefBoolValue;
		} catch (ex) {} 

		/*
                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.gcitest.enabled");
	            SCEPClientBasicForm.mGetCertInitialTestEnabled = prefBoolValue;
		} catch (ex) {} 

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("xxxxx");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    SCEPClientBasicForm.mXXXXXXXX = prefStringValue;
	        }

                prefIntValue = false;
		try {
		    prefIntValue = prefsBranch.getIntPref("log.level");
	            SCEPClientBasicForm.mMaxLogLevel = prefIntValue;
		} catch (ex) {} 

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("log.enabled");
		} catch (ex) {} 
	        SCEPClientBasicForm.mXXXX = prefBoolValue;
		*/

            } catch (ex) {
	    	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initWithDefaultValues(): SCEPClientBasicForm.mCACapOverrideValue: " + SCEPClientBasicForm.mCACapOverrideValue);
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initWithDefaultValues(): SCEPClientBasicForm.mAvDeviceProfileEnabled: " + SCEPClientBasicForm.mAvDeviceProfileEnabled);

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initWithDialogParams():................Start.");
    	// SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initWithDialogParams(): window.arguments: " + window.arguments);

	if (window.arguments == undefined) {
    	    SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initWithDialogParams():................End(0).");
	    return;
	}
        if (!window.arguments || (window.arguments.length <= 0) || !window.arguments[0]) {
    	    SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initWithDialogParams():................End(1).");
	    return;
	}


        var pkiParams = null;
	var dialogParams = null;
        dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	var numberOfCerts = dialogParams.GetInt(0);
	try {
	    if (dialogParams) {
	    	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    }
	} catch (ex) {
    	    SCEPClientBasicForm.logError("SCEPClientBasicForm.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}

	var paramScepRecipientCert = null;
	var paramUserCert = null;
	var paramIssuerCert = null;
	var x509Cert = null;
	try {
	    if (pkiParams) {
	    	x509Cert = null;

	        x509Cert = pkiParams.getISupportAtIndex(1);
	        if (x509Cert) {
	            paramIssuerCert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }

	    	x509Cert = null;
	        x509Cert = pkiParams.getISupportAtIndex(2);
	        if (x509Cert) {
	            paramScepRecipientCert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }

	    	x509Cert = null;
	        x509Cert = pkiParams.getISupportAtIndex(3);
	        if (x509Cert) {
	            paramUserCert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }
	    }
	} catch (ex) {
    	    SCEPClientBasicForm.logError("SCEPClientBasicForm.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}
   	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.initWithDialogParams(): {\n" + 
			"    paramScepRecipientCert: "	+ paramScepRecipientCert + "\n" + 
			"    paramUserCert: "		+ paramUserCert + "\n" + 
			"    paramIssuerCert: "		+ paramIssuerCert + "\n" + 
			"}");

    	var paramScepRecipientServerURL = null;
    	var paramScepRecipientIsRA = false;
    	var paramScepMessageType = null;

    	var paramScepIssuerID = null;
    	var paramIssuerSubjectDN =  null;
    	var paramScepRecipientSubjectDN = null;

    	var paramUserSubjectDN = null;
    	var paramUserChallengePW = null;


	try {
	    var paramInt = 0;
    	    paramInt = dialogParams.GetInt(1);
	    paramScepRecipientIsRA = (paramInt == 0) ? false : true;
	} catch (ex) {}
	
	var paramString = null;
	var strIdx = 0;
	try {
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramScepRecipientServerURL = paramString;
	    }
	} catch (ex) {}
   	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.initWithDialogParams(): strIdx: " + strIdx + " paramScepRecipientServerURL: " + paramScepRecipientServerURL); 

	strIdx++;
	try {
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramScepMessageType = paramString;
	    }
	} catch (ex) {}
   	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.initWithDialogParams(): strIdx: " + strIdx + " paramScepMessageType: " + paramScepMessageType); 

	strIdx++;
	try {
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramScepIssuerID = paramString;
	    }
	} catch (ex) {}
   	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.initWithDialogParams(): strIdx: " + strIdx + " paramScepIssuerID: " + paramScepIssuerID); 

	strIdx++;
	try {
	    x509Cert = null;
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramIssuerSubjectDN = paramString;
	    }
	    if (paramIssuerSubjectDN && (paramIssuerSubjectDN != "")) {
	    	x509Cert =  SCEPClientBasicForm.mKeyManager.findX509CertBySubjectName(paramIssuerSubjectDN);
	    }
	    if (x509Cert) {
	    	paramIssuerCert = x509Cert;
	    }
	    if (!paramScepRecipientIsRA) {
	    	paramScepRecipientSubjectDN = paramIssuerSubjectDN;
		paramScepRecipientCert = paramIssuerCert;
	    }
	} catch (ex) {}
   	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.initWithDialogParams(): strIdx: " + strIdx + " paramIssuerSubjectDN: " + paramIssuerSubjectDN); 

	strIdx++;
	try {
	    x509Cert = null;
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramScepRecipientSubjectDN = paramString;
	    }
	    if (paramScepRecipientSubjectDN && (paramScepRecipientSubjectDN != "")) {
	    	x509Cert =  SCEPClientBasicForm.mKeyManager.findX509CertBySubjectName(paramScepRecipientSubjectDN);
	    }
	    if (x509Cert) {
	    	paramScepRecipientCert = x509Cert;
	    }
	} catch (ex) {}
   	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.initWithDialogParams(): strIdx: " + strIdx + " paramScepRecipientSubjectDN: " + paramScepRecipientSubjectDN); 

	strIdx++;
	try {
	    x509Cert = null;
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramUserSubjectDN = paramString;
	    }
	    if (paramUserSubjectDN && (paramUserSubjectDN != "")) {
	    	x509Cert =  SCEPClientBasicForm.mKeyManager.findX509CertBySubjectName(paramUserSubjectDN);
	    }
	    if (x509Cert) {
	    	paramUserCert = x509Cert;
	    }
	} catch (ex) {}
   	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.initWithDialogParams(): strIdx: " + strIdx + " paramUserSubjectDN: " + paramUserSubjectDN); 

	strIdx++;
	try {
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramUserChallengePW = paramString;
	    }
	} catch (ex) {}
   	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.initWithDialogParams(): strIdx: " + strIdx + " paramUserChallengePW: " + paramUserChallengePW); 

	/*
   	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.initWithDialogParams(): {\n" + 
			"    paramScepRecipientCert: "	+ paramScepRecipientCert + "\n" + 
			"    paramUserSubjectDN: "	+ paramUserSubjectDN + "\n" + 
			"    paramUserCert: "		+ paramUserCert + "\n" + 
			"    paramIssuerSubjectDN: "	+ paramIssuerSubjectDN + "\n" + 
			"    paramIssuerCert: "		+ paramIssuerCert + "\n" + 
			"}");
	*/

	SCEPClientBasicForm.mScepClientPkcsReqParam = {
			scepRecipientServerURL	: paramScepRecipientServerURL,
			scepRecipientIsRA	: paramScepRecipientIsRA,
			scepMessageType		: paramScepMessageType,

			scepIssuerID		: paramScepIssuerID,
			issuerSubjectDN		: paramIssuerSubjectDN,
			issuerX509Cert		: paramIssuerCert,

			scepRecipientSubjectDN	: paramScepRecipientSubjectDN,
			scepRecipientX509Cert	: paramScepRecipientCert,

			userSubjectDN		: paramUserSubjectDN,
			userChallengePW		: paramUserChallengePW,
			userX509Cert		: paramUserCert

			};
   	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.initWithDialogParams(): {\n" + 
			"    scepRecipientServerURL: "	+ SCEPClientBasicForm.mScepClientPkcsReqParam.scepRecipientServerURL + "\n" + 
			"    scepRecipientIsRA: "	+ SCEPClientBasicForm.mScepClientPkcsReqParam.scepRecipientIsRA + "\n" + 
			"    scepMessageType: "		+ SCEPClientBasicForm.mScepClientPkcsReqParam.scepMessageType + "\n" + 

			"    scepIssuerID: "		+ SCEPClientBasicForm.mScepClientPkcsReqParam.scepIssuerID + "\n" + 
			"    issuerSubjectDN: "		+ SCEPClientBasicForm.mScepClientPkcsReqParam.issuerSubjectDN + "\n" + 
			"    issuerX509Cert: "		+ SCEPClientBasicForm.mScepClientPkcsReqParam.issuerX509Cert + "\n" + 
			"    issuerX509Cert.nickname: "	+ (SCEPClientBasicForm.mScepClientPkcsReqParam.issuerX509Cert ? SCEPClientBasicForm.mScepClientPkcsReqParam.issuerX509Cert.nickname : "null") + "\n" + 

			"    scepRecipientSubjectDN: "	+ SCEPClientBasicForm.mScepClientPkcsReqParam.scepRecipientSubjectDN + "\n" + 
			"    scepRecipientX509Cert: "	+ SCEPClientBasicForm.mScepClientPkcsReqParam.scepRecipientX509Cert + "\n" + 

			"    userSubjectDN: "		+ SCEPClientBasicForm.mScepClientPkcsReqParam.userSubjectDN + "\n" + 
			"    userX509Cert: "		+ SCEPClientBasicForm.mScepClientPkcsReqParam.userX509Cert + "\n" + 
			"    userX509Cert.nickname: "	+ (SCEPClientBasicForm.mScepClientPkcsReqParam.userX509Cert ? SCEPClientBasicForm.mScepClientPkcsReqParam.userX509Cert.nickname : "null") + "\n" + 
			"    userChallengePW: "		+ SCEPClientBasicForm.mScepClientPkcsReqParam.userChallengePW + "\n" + 
			"}\n");
			
	if (SCEPClientBasicForm.mScepClientPkcsReqParam.scepRecipientServerURL && (SCEPClientBasicForm.mScepClientPkcsReqParam.scepRecipientServerURL != "")) {
	    SCEPClientBasicForm.mScepServerURLElem.value = SCEPClientBasicForm.mScepClientPkcsReqParam.scepRecipientServerURL;-
	    SCEPClientBasicForm.handleScepServerURLChange(SCEPClientBasicForm.mScepServerURLElem);
	    // SCEPClientBasicForm.mScepServerURLElem.readonly = true;
	}

	if (SCEPClientBasicForm.mScepClientPkcsReqParam.scepRecipientIsRA) {
	    SCEPClientBasicForm.mScepServerURLDestOptionsElem.selectedItem = SCEPClientBasicForm.mScepServerURLDestRAElem;
	}
	else {
	    SCEPClientBasicForm.mScepServerURLDestOptionsElem.selectedItem = SCEPClientBasicForm.mScepServerURLDestCAElem;
	}
	SCEPClientBasicForm.handleScepServerURLDestOptionChange(SCEPClientBasicForm.mScepServerURLDestOptionsElem);

	if (SCEPClientBasicForm.mScepClientPkcsReqParam.scepIssuerID && (SCEPClientBasicForm.mScepClientPkcsReqParam.scepIssuerID != "")) {
	    SCEPClientBasicForm.mScepServerCAIdElem.value = SCEPClientBasicForm.mScepClientPkcsReqParam.scepIssuerID;
	    SCEPClientBasicForm.handleGetCACertCAIdChange(SCEPClientBasicForm.mScepServerCAIdElem);
	    // SCEPClientBasicForm.mScepServerCAIdElem.readonly = true;
	}

	if (SCEPClientBasicForm.mScepClientPkcsReqParam.issuerX509Cert ) {
	    SCEPClientBasicForm.mScepServerCACertPickerElem.selectedCert = SCEPClientBasicForm.mScepClientPkcsReqParam.issuerX509Cert;
	    SCEPClientBasicForm.handleSCEPServerCACertPickerChange(SCEPClientBasicForm.mScepServerCACertPickerElem);
	    // SCEPClientBasicForm.mScepServerCACertPickerElem.disabled = true;
	}

	if (SCEPClientBasicForm.mScepClientPkcsReqParam.scepRecipientX509Cert) {
	    SCEPClientBasicForm.mScepServerRecipientCertPickerElem.selectedCert = SCEPClientBasicForm.mScepClientPkcsReqParam.scepRecipientX509Cert;
    	    SCEPClientBasicForm.handleScepServerCertPickerChange(SCEPClientBasicForm.mScepServerRecipientCertPickerElem);
	    // SCEPClientBasicForm.mScepServerRecipientCertPickerElem.disabled = true;
	}

	if (SCEPClientBasicForm.mScepClientPkcsReqParam.userX509Cert) {
	    SCEPClientBasicForm.mUserCertPickerElem.selectedCert = SCEPClientBasicForm.mScepClientPkcsReqParam.userX509Cert;
	    SCEPClientBasicForm.handleUserCertPickerChange(SCEPClientBasicForm.mUserCertPickerElem);
	    // SCEPClientBasicForm.mUserCertPickerElem.disabled = true;
	}
	if (SCEPClientBasicForm.mScepClientPkcsReqParam.userChallengePW && (SCEPClientBasicForm.mScepClientPkcsReqParam.userChallengePW != "")) {
	    SCEPClientBasicForm.mScepServerUserChallengePWElem.value = SCEPClientBasicForm.mScepClientPkcsReqParam.userChallengePW;
	    // SCEPClientBasicForm.mScepServerUserChallengePWElem.readonly = true;
	}

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initWithDialogParams():................End.");
    },

    initOnLoad : function () 
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initOnLoad():................Start.");


	if (window.arguments != 'undefined') {
    	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.initOnLoad(): window.arguments: " + window.arguments);
        if (window.arguments && (window.arguments.length > 0) && window.arguments[0]) {
            var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    SCEPClientBasicForm.mDialogParams = dialogParams;
	}
	}
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initOnLoad():...................10.");

    	SCEPClientBasicForm.mScepClientToolWin			= document.getElementById('keymgr.scepclient.basic.win');
    	SCEPClientBasicForm.mScepServerURLDestOptionsElem	= document.getElementById('keymgr.scepclient.basic.scepserver.dest.options');
    	SCEPClientBasicForm.mScepServerURLDestCAElem	= document.getElementById('keymgr.scepclient.basic.scepserver.dest.ca');
    	SCEPClientBasicForm.mScepServerURLDestRAElem	= document.getElementById('keymgr.scepclient.basic.scepserver.dest.ra');

    	SCEPClientBasicForm.mScepServerURLElem			= document.getElementById('keymgr.scepclient.basic.scepserver.url');
    	SCEPClientBasicForm.mScepServerCAIdElem		= document.getElementById('keymgr.scepclient.basic.scepserver.caid');
    	SCEPClientBasicForm.mDownloadCertButtonElem		= document.getElementById('keymgr.scepclient.basic.scepserver.downloadcert');
    	SCEPClientBasicForm.mGetCACapsButtonElem		= document.getElementById('keymgr.scepclient.basic.scepserver.getcaps');
    	SCEPClientBasicForm.mScepServerCACertPickerElem	= document.getElementById('keymgr.scepclient.basic.scepserver.ca.certpicker');
    	SCEPClientBasicForm.mScepServerIsRAElem		= document.getElementById('keymgr.scepclient.basic.scepserver.isra');
    	SCEPClientBasicForm.mScepServerRecipientCertRowElem	= document.getElementById('keymgr.scepclient.basic.scepserver.recipient.cert.row');
    	SCEPClientBasicForm.mScepServerCertFilterWithCAElem	= document.getElementById('keymgr.scepclient.basic.scepserver.recipient.filterwithca');
    	SCEPClientBasicForm.mScepServerRecipientCertPickerElem		= document.getElementById('keymgr.scepclient.basic.scepserver.recipient.certpicker');
    	SCEPClientBasicForm.mScepHashAlgNameElem		= document.getElementById('keymgr.scepclient.basic.hashAlgName.menulist');
    	SCEPClientBasicForm.mScepHttpMethodElem		= document.getElementById('keymgr.scepclient.basic.scephttpmethod');

    	SCEPClientBasicForm.mUserCertPickerElem		= document.getElementById('keymgr.scepclient.basic.user.certpicker');
    	SCEPClientBasicForm.mScepServerUserChallengePWElem	= document.getElementById("keymgr.scepclient.basic.user.challengepw");
    	SCEPClientBasicForm.mAvDeviceProfileMenuElem		= document.getElementById("keymgr.scepclient.basic.user.avdevprofiles");
    	SCEPClientBasicForm.mCASignedCertItemElem		= document.getElementById('keymgr.scepclient.basic.user.signedcert.certitem');

	// Initializes the required XPCOM services 
	SCEPClientBasicForm.initXPComServiceInfo();

	// Default Initialization of the GUI elements
	SCEPClientBasicForm.mScepServerURL		= null;
	SCEPClientBasicForm.mScepServerURLDestIsRA	= false;

	SCEPClientBasicForm.mScepServerCACertPickerElem.refresh();
	SCEPClientBasicForm.mScepServerCACert		= null;

	SCEPClientBasicForm.mScepServerRecipientCertPickerElem.refresh();
	SCEPClientBasicForm.mScepServerRecipientCert		= null;

	SCEPClientBasicForm.mUserCertPickerElem.refresh();
	SCEPClientBasicForm.mUserCertPickerElem.selectedCert = null; // force user to pick a cert
	SCEPClientBasicForm.mUserCert			= null;

	SCEPClientBasicForm.mCASignedCertItemElem.refresh();

	SCEPClientBasicForm.initWithDefaultValues();
	SCEPClientBasicForm.initWithDialogParams();

	// Avaya specific hack
	if (SCEPClientBasicForm.mAvDeviceProfileEnabled) {
	    SCEPClientBasicForm.mAvDeviceProfileMenuElem.hidden = false;
	}
	else {
	    SCEPClientBasicForm.mAvDeviceProfileMenuElem.hidden = true;
	}

	SCEPClientBasicForm.handleGetCACertCAIdChange(SCEPClientBasicForm.mScepServerCAIdElem);
	SCEPClientBasicForm.handleScepServerURLChange(SCEPClientBasicForm.mScepServerURLElem);
	SCEPClientBasicForm.handleSCEPServerCACertPickerChange(SCEPClientBasicForm.mScepServerCACertPickerElem);
	// SCEPClientBasicForm.handleScepServerURLDestOptionChange(SCEPClientBasicForm.mScepServerURLDestOptionsElem);
	SCEPClientBasicForm.handleUserCertPickerChange(SCEPClientBasicForm.mUserCertPickerElem);

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.initOnLoad():................End.");
    },

    updateHashAlgMenu : function (aHashAlgMenuElem)
    {
        SCEPClientBasicForm.logTrace("SCEPClientBasicForm.updateHashAlgMenu(" + aHashAlgMenuElem.id + "):...........................Start.");
        if (!SCEPClientBasicForm.mScepCACapabilities) {
	    return;
        }

        var hashAlgValueDefault = null;
        if (SCEPClientBasicForm.mScepCACapabilities.sigAlgDefault && (SCEPClientBasicForm.mScepCACapabilities.sigAlgDefault != "")) {
    	    hashAlgValueDefault = SCEPClientBasicForm.mScepCACapabilities.sigAlgDefault;
        }

        var hashAlgValue = "MD5";
        if (SCEPClientBasicForm.mScepCACapabilities.sha512) {
	    aHashAlgMenuElem.removeAttribute("sha512disabled");
	    if ("SHA512" == hashAlgValueDefault) {
	        hashAlgValue = "SHA512";
	    }
        }
        else {
	    aHashAlgMenuElem.setAttribute("sha512disabled", true);
        }
        if (SCEPClientBasicForm.mScepCACapabilities.sha256) {
	    aHashAlgMenuElem.removeAttribute("sha256disabled");
	    if ("SHA256" == hashAlgValueDefault) {
	        hashAlgValue = "SHA256";
	    }
        }
        else {
	    aHashAlgMenuElem.setAttribute("sha256disabled", true);
        }
        if (SCEPClientBasicForm.mScepCACapabilities.sha1) {
	    aHashAlgMenuElem.removeAttribute("sha1disabled");
	    if ("SHA1" == hashAlgValueDefault) {
	        hashAlgValue = "SHA1";
	    }
        }
        else {
	    aHashAlgMenuElem.setAttribute("sha1disabled", true);
        }
        SCEPClientBasicForm.logDebug("SCEPClientBasicForm.updateHashAlgMenu(): hashAlgValue: " + hashAlgValue + "");

        if (hashAlgValue) {
	    aHashAlgMenuElem.value = hashAlgValue;
        }
    
        SCEPClientBasicForm.logTrace("SCEPClientBasicForm.updateHashAlgMenu(" + aHashAlgMenuElem.id + "):...........................End.");
    },

    updateScepHttpMethodMenu : function (aScepHttpMethodElem)
    {
        SCEPClientBasicForm.logTrace("SCEPClientBasicForm.updateScepHttpMethodMenu(" + aScepHttpMethodElem.id + "):...........................Start.");
        if (!SCEPClientBasicForm.mScepCACapabilities) {
	    return;
        }
    
        var httpMethodValue = aScepHttpMethodElem.value || "GET";

        var usePostFormMethod = SCEPClientBasicForm.mScepCACapabilities.httpMethodPostFormEnabled; 
        if (SCEPClientBasicForm.mScepCACapabilities.postPKIOperation) {
	    aScepHttpMethodElem.setAttribute("postdisabled", false);
	    if (usePostFormMethod) {
	        aScepHttpMethodElem.setAttribute("postformdisabled", false);
	    }
	    else {
	        aScepHttpMethodElem.setAttribute("postformdisabled", true);
	    }

    	    if (SCEPClientBasicForm.mScepCACapabilities.httpMethodDefault && (SCEPClientBasicForm.mScepCACapabilities.httpMethodDefault != "")) {
	        if (SCEPClientBasicForm.mScepCACapabilities.httpMethodDefault == "POST") {
		    httpMethodValue = "POST";
	        }
	        else {
	    	    if ((SCEPClientBasicForm.mScepCACapabilities.httpMethodDefault == "POST-FORM") && usePostFormMethod) {
	    	        httpMethodValue = "POST-FORM";
		    }
	        }
    	    }
        }
        else {
    	    aScepHttpMethodElem.setAttribute("postdisabled", true);
	    aScepHttpMethodElem.setAttribute("postformdisabled", true);
        }
        SCEPClientBasicForm.logDebug("SCEPClientBasicForm.updateScepHttpMethodMenu(): httpMethodValue: " + httpMethodValue + "");
        aScepHttpMethodElem.value = httpMethodValue;

        SCEPClientBasicForm.logTrace("SCEPClientBasicForm.updateScepHttpMethodMenu(" + aScepHttpMethodElem.id + "):...........................End.");
    },

    valdiateSCEPParams : function()
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.valdiateSCEPParams():................Start.");
	/*
        var issuerCert = SCEPClientBasicForm.mScepServerCACertPickerElem.getSelectedCert();
        if (!issuerCert) {
	    return false;
        }

        var recipientCert = SCEPClientBasicForm.mScepServerRecipientCertPickerElem.getSelectedCert();
        if (!recipientCert) {
	    return false;
        }

        var userCert = SCEPClientBasicForm.mUserCertPickerElem.getSelectedCert();
        if (!userCert) {
	    return false;
        }
	*/
    	var pkcs9ChallengePassword = SCEPClientBasicForm.mScepServerUserChallengePWElem.value;
	var scepServerHttpMethod = SCEPClientBasicForm.mScepHttpMethodElem.value;
	var scepMsgHashAlg = SCEPClientBasicForm.mScepHashAlgNameElem.value;

    	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.valdiateSCEPParams(): pkcs9ChallengePassword: |" + pkcs9ChallengePassword + "|");
    	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.valdiateSCEPParams(): scepServerHttpMethod: |" + scepServerHttpMethod + "|");
    	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.valdiateSCEPParams(): scepMsgHashAlg: |" + scepMsgHashAlg + "|");

	if (!SCEPClientBasicForm.mScepServerURL || (SCEPClientBasicForm.mScepServerURL == "")) {
    	    SCEPClientBasicForm.logTrace("SCEPClientBasicForm.valdiateSCEPParams():................End(1).");
	    return false;
	}

	if (!SCEPClientBasicForm.mScepServerCACert || !SCEPClientBasicForm.mScepServerRecipientCert || !SCEPClientBasicForm.mUserCert) {
    	    SCEPClientBasicForm.logTrace("SCEPClientBasicForm.valdiateSCEPParams():................End(0).");
	    return false;
	}

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.valdiateSCEPParams():................End.");
	return true;
    },
    handleScepServerURLDestOptionChange : function (aScepServerURLDestOptionsElem, ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepServerURLDestOptionChange():...................Start.");

	if (aScepServerURLDestOptionsElem.selectedItem.value == "ca") {
	    SCEPClientBasicForm.mScepServerIsRAElem.checked = false;
	}
	else {
	    SCEPClientBasicForm.mScepServerIsRAElem.checked = true;
	}

	SCEPClientBasicForm.handleScepServerIsRAChange(SCEPClientBasicForm.mScepServerIsRAElem);

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepServerURLDestOptionChange():...................End.");
    },

    handleScepServerURLChange : function (aScepServerURLElem, ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepServerURLChange():...................Start.");

	SCEPClientBasicForm.handleTextboxChange(aScepServerURLElem);

	// create an nsIURI
	if (aScepServerURLElem.value != "") {
	    var uri = null;
	    try {
	        uri = SCEPClientBasicForm.mIOService.newURI(aScepServerURLElem.value, null, null);
	        SCEPClientBasicForm.mScepServerURL = aScepServerURLElem.value;
	    } catch (ex) {
	        alert("Badly formatted URL: " + SCEPClientBasicForm.mScepServerURL);
	        SCEPClientBasicForm.mScepServerURL = "";
	    }
	}
	else {
	    SCEPClientBasicForm.mScepServerURL = "";
	}

	
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepServerURLChange():...................40.");
	if (SCEPClientBasicForm.mScepServerURL != "") {
	    SCEPClientBasicForm.mDownloadCertButtonElem.disabled = false;
	    SCEPClientBasicForm.mGetCACapsButtonElem.disabled = false;
	    SCEPClientBasicForm.scepGetCACapabilities();
	}
	else {
	    SCEPClientBasicForm.mDownloadCertButtonElem.disabled = true;
	    SCEPClientBasicForm.mGetCACapsButtonElem.disabled = true;
	}

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepServerURLChange():...................End.");
    },

    handleGetCACertCAIdChange : function (aScepServerCAIdElem, ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleGetCACertCAIdChange():...................Start.");

	SCEPClientBasicForm.handleTextboxChange(aScepServerCAIdElem);
	SCEPClientBasicForm.mScepServerCAId = aScepServerCAIdElem.value;
	if (SCEPClientBasicForm.mScepServerCAId == "") {
	    SCEPClientBasicForm.mScepServerCAId = "DummyCA";
	}

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleGetCACertCAIdChange():...................End.");
    },

    scepGetCACertChain : function (ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.scepGetCACertChain():...................Start.");
	if (ev) {
	   ev.stopPropagation();
	}


    	var scepServerObj = {
    	    scepServerURL		: SCEPClientBasicForm.mScepServerURL,
	    scepServerHttpMethod	: "GET",
    	    scepServerURLDestIsRA	: SCEPClientBasicForm.mScepServerURLDestIsRA,
    	    scepServerCAId		: SCEPClientBasicForm.mScepServerCAId,
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
	if (SCEPClientBasicForm.mScepServerURLDestIsRA) {
    	    scepGetCACertMsgType = "GetCARACert";
	}
	scepServerObj.scepMsgType = scepGetCACertMsgType;
	scepServerObj.scepServerCAId = "XXXXX";
	scepServerObj.scepRespCBFunc = globalScepRespCBFunc;

	window.setCursor('wait');
	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	jsSCEPClient.scepGetCACertChain();
	window.setCursor('auto');

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.scepGetCACertChain():...................End.");
    },

    scepGetCACapabilities : function (ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.scepGetCACapabilities():...................Start.");

	if (ev) {
	   ev.stopPropagation();
	}

	/*
	if (!SCEPClientBasicForm.mScepServerURL) {
	    alert("SCEP Server URL is missing.");
    	    SCEPClientBasicForm.logTrace("SCEPClientBasicForm.scepGetCACapabilities():...................End(0).");
	    return;
	}
	*/

    	var scepServerObj = {
    	    scepServerURL		: SCEPClientBasicForm.mScepServerURL,
	    scepServerHttpMethod	: "GET",
    	    scepServerCAId		: SCEPClientBasicForm.mScepServerCAId,
	    /*
    	    scepServerURLDestIsRA	: SCEPClientBasicForm.mScepServerURLDestIsRA,
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
	    dummy			: null
    	    };
	scepServerObj.scepServerCAId = "XXXXX";

	if (ev) {
	    window.setCursor('wait');
	}

	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	try {
	    jsSCEPClient.scepGetCACapabilities(function(scepCACapabilities) {
    		SCEPClientBasicForm.logTrace("SCEPClientBasicForm.scepGetCACapabilities.cb():...................Start.");
	    	SCEPClientBasicForm.mScepCACapabilities = scepCACapabilities || {};
		if (ev) {
	    	    window.setCursor('auto');
		}

	        if (SCEPClientBasicForm.mScepCACapabilities.srcDoc) {
	            if (ev) {
    	                if (scepServerObj.scepServerURL != "") {
    		            SCEPClientBasicForm.logDebug("SCEPClientBasicForm.scepGetCACapabilities(): SCEPClientBasicForm.mScepCACapabilities.srcDoc: " + SCEPClientBasicForm.mScepCACapabilities.srcDoc);
		            alert("SCEP CA Capabilities:\n" + SCEPClientBasicForm.mScepCACapabilities.srcDoc + "\n");
	                }
	            }
	        }
	        else {
	            if (ev) {
    	                if (scepServerObj.scepServerURL != "") {
	    	            alert("CA Capabilties are not available from the SCEP server : " + scepServerURL);
	                }
	            }
	        }
    	        SCEPClientBasicForm.updateHashAlgMenu(SCEPClientBasicForm.mScepHashAlgNameElem);
    	        SCEPClientBasicForm.updateScepHttpMethodMenu(SCEPClientBasicForm.mScepHttpMethodElem);

    		SCEPClientBasicForm.logTrace("SCEPClientBasicForm.scepGetCACapabilities.cb():...................End.");
	    });
	} catch (ex) {
	    if (ev) {
	    	window.setCursor('auto');
	    }
    	    SCEPClientBasicForm.logDebug("SCEPClientBasicForm.scepGetCACapabilities(): jsSCEPClient.scepGetCACapabilities() failed - ex: " + ex);
	    SCEPClientBasicForm.mScepCACapabilities = {};
	}
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.scepGetCACapabilities():...................End.");
	return;
    },

    handleSCEPServerCACertPickerChange : function(aScepServerCACertPickerElem, ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleSCEPServerCACertPickerChange():...................Start.");

    	if (!aScepServerCACertPickerElem.selectedCert) {
	    SCEPClientBasicForm.mScepServerRecipientCertPickerElem.selectedCert = null;
	    return;
	}

	SCEPClientBasicForm.mScepServerCACert		= SCEPClientBasicForm.mScepServerCACertPickerElem.selectedCert;

	SCEPClientBasicForm.handleScepServerIsRAChange(SCEPClientBasicForm.mScepServerIsRAElem);

	SCEPClientBasicForm.checkForSigedUserCert();

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleSCEPServerCACertPickerChange():...................End.");
    },

    handleScepServerIsRAChange : function(aScepServerIsRAElem, ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepServerIsRAChange():...................Start.");

	SCEPClientBasicForm.mScepServerURLDestIsRA = aScepServerIsRAElem.checked;


	if (SCEPClientBasicForm.mScepServerURLDestIsRA) {
	    SCEPClientBasicForm.mScepServerRecipientCertRowElem.hidden = false;
	}
	else {
	    SCEPClientBasicForm.mScepServerRecipientCertRowElem.hidden = true;
	}

    	var certType = "";
    	var certUsage = new String("");
    	var cadn = new String("");
    	var selectedCert = null;
    	if (SCEPClientBasicForm.mScepServerURLDestIsRA) {
	    certType = "server";
	    /*
	    certUsage = "SSLServer";
	    certUsage = new String("");
	    */
	    certUsage = "EmailRecipient";
	    if (SCEPClientBasicForm.mScepServerCertFilterWithCAElem.checked) {
	    	cadn = SCEPClientBasicForm.mScepServerCACertPickerElem.selectedCert.subjectName;
	    }
	    else {
	    	cadn = new String("");
	    }
	    selectedCert = null;

	    SCEPClientBasicForm.mScepServerRecipientCertPickerElem.disabled = false;
	    // gSCEPReqRecipientCertPickerElem.setAttribute("certusagedisabled", true);
    	}
    	else {
	    certType = "ca";
	    certUsage = "VerifyCA";
	    cadn = new String("");
	    selectedCert = SCEPClientBasicForm.mScepServerCACertPickerElem.selectedCert;

	    SCEPClientBasicForm.mScepServerRecipientCertPickerElem.disabled = true;
	    // gSCEPReqRecipientCertPickerElem.setAttribute("certusagedisabled", true);
    	}
    	SCEPClientBasicForm.mScepServerRecipientCertPickerElem.setAttribute("certtypedisabled", true);

    	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.handleScepServerIsRAChange(): certType: " + certType + " certUsage: " + certUsage + " cadn: " + cadn + "");
    	SCEPClientBasicForm.mScepServerRecipientCertPickerElem.initWithParams(certType, certUsage, cadn, selectedCert);
    	SCEPClientBasicForm.handleScepServerCertPickerChange(SCEPClientBasicForm.mScepServerRecipientCertPickerElem);

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepServerIsRAChange():...................End.");
    },

    handleScepServerCertFilterWithCAChange : function(aScepServerIsRAElem, ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepServerCertFilterWithCAChange():...................Start.");

	SCEPClientBasicForm.handleScepServerIsRAChange(SCEPClientBasicForm.mScepServerIsRAElem);

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepServerCertFilterWithCAChange():...................End.");
    },

    handleScepServerCertPickerChange : function(aScepServerCertPickerElem, ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepServerCertPickerChange():...................Start.");

	SCEPClientBasicForm.mScepServerRecipientCert		= SCEPClientBasicForm.mScepServerRecipientCertPickerElem.selectedCert;

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepServerCertPickerChange():...................End.");
    },

    handleHashAlgMenuNameChange : function (aHashAlgMenuElem)
    {
        SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleHashAlgMenuNameChange():...........................Start.");

        SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleHashAlgMenuNameChange():...........................End.");
    },

    handleScepHttpMethodChange : function (aScepHttpMethodElem)
    {
        SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepHttpMethodChange():...........................Start.");

        SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleScepHttpMethodChange():...........................End.");
    },

    handleUserCertPickerChange : function(aUserCertPickerElem, ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleUserCertPickerChange():...................Start.");

	SCEPClientBasicForm.mUserCert		= aUserCertPickerElem.selectedCert;

	SCEPClientBasicForm.checkForSigedUserCert();

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleUserCertPickerChange():...................End.");
    },

    handleCreateUserCertSimple : function(ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleCreateUserCertSimple():...................Start.");

	if (ev) {
	   ev.stopPropagation();
	}

	// TODO: Implement Self-signed cert generation 

	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
					.createInstance(Components.interfaces.nsIPKIParamBlock);
	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
	pkiParams.setISupportAtIndex(1, null);

	// var createCertSimpleDialogURL = 'createCertSimpleDialog.xul';
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
	    SCEPClientBasicForm.logError("SCEPClientBasicForm.handleCreateUserCertSimple(): failed to create self-signed cert.");
	    return;
	}

	var /* nsIX509Cert */ retX509Cert = null;
	var retCert = pkiParams.getISupportAtIndex(1);
	if (retCert) {
	    retX509Cert = retCert.QueryInterface(Components.interfaces.nsIX509Cert);
	}

	if (retX509Cert) {
	    SCEPClientBasicForm.mUserCertPickerElem.refresh();
	    SCEPClientBasicForm.mUserCertPickerElem.selectedCert = retX509Cert;
	    SCEPClientBasicForm.handleUserCertPickerChange(SCEPClientBasicForm.mUserCertPickerElem);
	}


    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleCreateUserCertSimple():...................End.");
    },

    handleCreateUserCertAdvanced : function(ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleCreateUserCertAdvanced():...................Start.");
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
	    SCEPClientBasicForm.logError("SCEPClientBasicForm.handleCreateUserCertAdvanced(): failed to create self-signed cert.");
	    return;
	}

	var /* nsIX509Cert */ retX509Cert = null;
	var retCert = pkiParams.getISupportAtIndex(1);
	if (retCert) {
	    retX509Cert = retCert.QueryInterface(Components.interfaces.nsIX509Cert);
	}

	if (retX509Cert) {
	    SCEPClientBasicForm.mUserCertPickerElem.refresh();
	    SCEPClientBasicForm.mUserCertPickerElem.selectedCert = retX509Cert;
	    SCEPClientBasicForm.handleUserCertPickerChange(SCEPClientBasicForm.mUserCertPickerElem);
	}

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.handleCreateUserCertAdvanced():...................End.");
    },

    getUserChallengePassword : function(ev)
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.getUserChallengePassword():...................Start.");
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
	    SCEPClientBasicForm.logError("SCEPClientBasicForm.getUserChallengePassword(): failed to retrive challlenge password.");
    	    SCEPClientBasicForm.logTrace("SCEPClientBasicForm.getUserChallengePassword():...................End(0).");
	    return;
	}
	var userChallengePW = dialogParams.GetString(0);
	SCEPClientBasicForm.mScepServerUserChallengePWElem.value = userChallengePW;

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.getUserChallengePassword():...................End.");
    },


    checkForSigedUserCert : function ()
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.checkForSigedUserCert():...................Start.");

	SCEPClientBasicForm.mCASignedCertItemElem.cert = null;

	if (!SCEPClientBasicForm.mUserCert || !SCEPClientBasicForm.mScepServerCACert) {
    	    SCEPClientBasicForm.logTrace("SCEPClientBasicForm.checkForSigedUserCert():...................End(0).");
	    return;
	}
	var signedUserCert = null;
        try {
            signedUserCert = SCEPClientBasicForm.mKeyManager.findCASignedX509CertByCertSPKI(
                                        SCEPClientBasicForm.mUserCert,
                                        SCEPClientBasicForm.mScepServerCACert
                                        );
        } catch (ex) { }
	// signedUserCert = SCEPClientBasicForm.mUserCert; // For test only

	if (!signedUserCert) {
    	    SCEPClientBasicForm.logTrace("SCEPClientBasicForm.checkForSigedUserCert():...................End(1).");
	    return;
	}
	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
				.createInstance(Components.interfaces.nsIPKIParamBlock);
	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
    
	pkiParams.setISupportAtIndex(1, null);
	var certIdx = 1;
	pkiParams.setISupportAtIndex(certIdx, signedUserCert);

	certIdx++;
	pkiParams.setISupportAtIndex(certIdx, SCEPClientBasicForm.mScepServerCACert);

        var signedCertNotifDialogURL = "chrome://keymanager/content/tools/scepclient/SCEPSignedUserCertNotif.xul";

	window.setCursor('wait');
        window.openDialog(signedCertNotifDialogURL,  "_blank",
                		'chrome,centerscreen,resizable=yes,titlebar,modal',
				dialogParams
				);
	window.setCursor('auto');

	var retVal = dialogParams.GetInt(0);
	if (retVal == 1) {
	    SCEPClientBasicForm.mCASignedCertItemElem.cert = signedUserCert;
    	    SCEPClientBasicForm.logTrace("SCEPClientBasicForm.checkForSigedUserCert():...................End(2).");
	    return;
	}

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.checkForSigedUserCert():...................End.");
    },

    enrollUserCert : function ()
    {
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.enrollUserCert():...................Start.");

    	var pkcs9ChallengePassword = SCEPClientBasicForm.mScepServerUserChallengePWElem.value;
    	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.enrollUserCert(): pkcs9ChallengePassword: |" + pkcs9ChallengePassword + "|");

    	var scepUserChallengePw = pkcs9ChallengePassword;
    	if (pkcs9ChallengePassword != "") {
    	    scepUserChallengePw  = SCEPClientBasicForm.mAvDeviceProfileMenuElem.value + pkcs9ChallengePassword;
    	}
    	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.enrollUserCert(): scepUserChallengePw: |" + scepUserChallengePw + "|");

	
	var scepServerHttpMethod = SCEPClientBasicForm.mScepHttpMethodElem.value || "GET";
	var scepMsgHashAlg = SCEPClientBasicForm.mScepHashAlgNameElem.value || "MD5";
    	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.enrollUserCert(): scepServerHttpMethod: |" + scepServerHttpMethod + "|");
    	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.enrollUserCert(): scepMsgHashAlg: |" + scepMsgHashAlg + "|");

    	var scepServerObj = {
    	    scepServerURL		: SCEPClientBasicForm.mScepServerURL,
	    scepServerHttpMethod	: scepServerHttpMethod,
    	    scepServerURLDestIsRA	: SCEPClientBasicForm.mScepServerURLDestIsRA,
    	    scepServerCACert		: SCEPClientBasicForm.mScepServerCACert,
    	    scepServerCert		: SCEPClientBasicForm.mScepServerRecipientCert,
    	    userCert			: SCEPClientBasicForm.mUserCert,
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
	scepServerObj.scepRespCBFunc = globalScepRespCBFunc;

    	// Force token login - on windows the popup window for password is not coming up
    	SCEPClientBasicForm.loginToCertToken(SCEPClientBasicForm.mUserCert);

	SCEPClientBasicForm.mWaitingForResponse = true;
	window.setCursor('wait');
	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	try {
	    jsSCEPClient.enrollCert();
	} catch (ex) {
	    SCEPClientBasicForm.mWaitingForResponse = false;
	}
	window.setCursor('auto');

	var signedCert = scepServerObj.caSignedUserCert;

	if (signedCert) {
	    SCEPClientBasicForm.mCASignedCertItemElem.cert = signedCert;
	}
	else {
	    SCEPClientBasicForm.mWaitingForResponse = false;
	}
	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.enrollUserCert(): signedCert : " + signedCert + "\n");

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.enrollUserCert():...................End.");
	return signedCert;
    },

    getSignedUserX509Cert : function()
    {
    	return SCEPClientBasicForm.mCASignedCertItemElem.cert;
    },

    scepRespCBFunc : function (aScepMsgType, aImportedX509Cert, aImportedCertType)
    {
	// SCEPClientBasicForm.mMaxLogLevel = 9;
    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.scepRespCBFunc():...................Start.");

	SCEPClientBasicForm.mWaitingForResponse = false;

	if (!aImportedX509Cert) {
    	    SCEPClientBasicForm.logTrace("SCEPClientBasicForm.scepRespCBFunc():...................End(0).");
	    // SCEPClientBasicForm.mMaxLogLevel = 2;
	    return;
	}
	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.scepRespCBFunc(): aScepMsgType: " + aScepMsgType);
	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.scepRespCBFunc(): aImportedX509Cert: " + aImportedX509Cert.nickname);
	SCEPClientBasicForm.logDebug("SCEPClientBasicForm.scepRespCBFunc(): aImportedCertType: " + aImportedCertType);
        switch(aScepMsgType) {
	    case "PKCSReq" : 
		if (aImportedCertType == Components.interfaces.nsIX509Cert.USER_CERT) {
	    	    SCEPClientBasicForm.mCASignedCertItemElem.cert = aImportedX509Cert;
		}
	    	break;
	    case "GetCACert" : 
		if (aImportedCertType == Components.interfaces.nsIX509Cert.CA_CERT) {
		    // SCEPClientBasicForm.mScepClientPkcsReqParam.issuerX509Cert = aImportedX509Cert;
	    	    SCEPClientBasicForm.mScepServerCACertPickerElem.selectedCert = aImportedX509Cert;
	    	    SCEPClientBasicForm.handleSCEPServerCACertPickerChange(SCEPClientBasicForm.mScepServerCACertPickerElem);
		}
	    	break;
	    case "GetCARACert" : 
		if (aImportedCertType == Components.interfaces.nsIX509Cert.CA_CERT) {
	    	    SCEPClientBasicForm.mScepServerCACertPickerElem.selectedCert = aImportedX509Cert;
	    	    SCEPClientBasicForm.handleSCEPServerCACertPickerChange(SCEPClientBasicForm.mScepServerCACertPickerElem);
		    break;
		}
		if (aImportedCertType == Components.interfaces.nsIX509Cert.SERVER_CERT) {
	    	    SCEPClientBasicForm.mScepServerRecipientCertPickerElem.selectedCert = aImportedX509Cert;
    	    	    SCEPClientBasicForm.handleScepServerCertPickerChange(SCEPClientBasicForm.mScepServerRecipientCertPickerElem);
		}
	    	break;
	    default:
		SCEPClientBasicForm.logError("SCEPClientBasicForm.scepRespCBFunc(): INVALID aScepMsgType: " + aScepMsgType);
	    	break;
	}

    	SCEPClientBasicForm.logTrace("SCEPClientBasicForm.scepRespCBFunc():...................End.");
	// SCEPClientBasicForm.mMaxLogLevel = 2;
    },

    lastMethod : function () 
    {
    }
}


function globalScepRespCBFunc (aScepMsgType, aImportedX509Cert, aImportedCertType)
{
    SCEPClientBasicForm.scepRespCBFunc(aScepMsgType, aImportedX509Cert, aImportedCertType);
}
