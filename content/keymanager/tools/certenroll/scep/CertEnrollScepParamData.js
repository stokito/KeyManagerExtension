/* @(#) $Id: CertEnrollScepParamData.js,v 1.7 2012/10/07 17:20:10 subrata Exp $ */

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

var CertEnrollScepParamData = {


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
        this.logTrace("CertEnrollScepParamData.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = this.mTokenDB.getInternalKeyToken();
        } catch (ex) {}
	if (!token) {
            this.logTrace("CertEnrollScepParamData.loginToInternalToken():................End(0).");
	    return;
	}

	try {
            token.login(false);
            this.logTrace("CertEnrollScepParamData.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("CertEnrollScepParamData.loginToInternalToken():................End.");
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
    	this.logTrace("CertEnrollScepParamData.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = this.trim(aTextboxElem.value);
	}
        var formFieldKey = aTextboxElem.getAttribute("autocompletesearchparam");
	if (formFieldKey) {
	    this.textFieldAutoCompleteAction(aTextboxElem);
	}

    	this.logTrace("CertEnrollScepParamData.handleTextboxChange():................End.");
    },


    initXPComServiceInfo : function ()
    {
        this.logTrace("CertEnrollScepParamData.initXPComServiceInfo():................Start.");

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
    	    alert("CertEnrollScepParamData.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("CertEnrollScepParamData.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	// this.loginToInternalToken();

	this.logTrace("CertEnrollScepParamData.initXPComServiceInfo():................End.");
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
    	this.logTrace("CertEnrollScepParamData.initWithDefaultValues():................Start.");

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

   
                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.httpmethod.postform");
	            this.mHttpMethodFormPostEnabled = prefBoolValue;
		} catch (ex) {} 

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.capabilities.override");
	            this.mCACapOverrideEnabled = prefBoolValue;
		} catch (ex) {} 

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.scepclient.capabilities.value");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mCACapOverrideValue = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.scepclient.serverurl.default");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mScepServerURLElem = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.scepclient.serverurl.last");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mScepServerURLElem = prefStringValue;
	        }

		/*
                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.gcitest.enabled");
	            this.mGetCertInitialTestEnabled = prefBoolValue;
		} catch (ex) {} 

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("xxxxx");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mXXXXXXXX = prefStringValue;
	        }

                prefIntValue = false;
		try {
		    prefIntValue = prefsBranch.getIntPref("log.level");
	            this.mMaxLogLevel = prefIntValue;
		} catch (ex) {} 

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("log.enabled");
		} catch (ex) {} 
	        this.mXXXX = prefBoolValue;
		*/

            } catch (ex) {
	    	this.logDebug("CertEnrollScepParamData.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);

	/*
	gScepClientOverrideCACapEnabled = this.mCACapOverrideEnabled;
	gScepClientOverrideCACapValue = this.mCACapOverrideValue;
	gScepClientGetCACapFormPostEnabled = this.mHttpMethodFormPostEnabled;
	gScepClientGetCertInitialTestEnabled = this.mGetCertInitialTestEnabled;
	*/

    	this.logTrace("CertEnrollScepParamData.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	this.logTrace("CertEnrollScepParamData.initWithDialogParams():................Start.");
    	// this.logTrace("CertEnrollScepParamData.initWithDialogParams(): window.arguments: " + window.arguments);

	this.mScepClientPkcsReqParam = {
			scepRecipientServerURL	: null,
			scepRecipientIsRA	: null,
			scepServerCAId		: null,
			scepMessageType		: null,

			scepRecipientSubjectDN	: null,
			scepRecipientX509Cert	: null,

			userSubjectDN		: null,
			userX509Cert		: null,
			userChallengePW		: null,

			issuerSubjectDN		: null,
			issuerX509Cert		: null
			};


	if (window.arguments == undefined) {
    	    this.logTrace("CertEnrollScepParamData.initWithDialogParams():................End(0).");
	    return;
	}
        if (!window.arguments || (window.arguments.length <= 0) || !window.arguments[0]) {
    	    this.logTrace("CertEnrollScepParamData.initWithDialogParams():................End(1).");
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
    	    this.logError("CertEnrollScepParamData.initWithDialogParams() dialogParams.QueryInterface() failed - ex: " + ex);
	}

	var paramScepRecipientCert = null;
	var paramUserCert = null;
	var paramIssuerCert = null;
	var x509Cert = null;
	/*
	try {
	    if (pkiParams) {
		x509Cert = null;
	        x509Cert = pkiParams.getISupportAtIndex(1);
	        if (x509Cert) {
	            paramScepRecipientCert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }

		x509Cert = null;
	        x509Cert = pkiParams.getISupportAtIndex(2);
	        if (x509Cert) {
	            paramUserCert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }

		x509Cert = null;
	        x509Cert = pkiParams.getISupportAtIndex(3);
	        if (x509Cert) {
	            paramIssuerCert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }
	    }
	} catch (ex) {
    	    this.logError("CertEnrollScepParamData.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}
   	this.logDebug("CertEnrollScepParamData.initWithDialogParams(): {\n" + 
			"    paramScepRecipientCert: "	+ paramScepRecipientCert + "\n" + 
			"    paramUserCert: "		+ paramUserCert + "\n" + 
			"    paramIssuerCert: "		+ paramIssuerCert + "\n" + 
			"}");

	*/
    	var paramScepRecipientServerURL = null;
    	var paramScepRecipientIsRA = false;

    	var paramScepMessageType = null;

    	var paramScepIssuerID =  null;
    	var paramIssuerSubjectDN =  null;
    	var paramScepRecipientSubjectDN = null;

    	var paramUserSubjectDN = null;
    	var paramUserChallengePW = null;
    	var paramUserX509CertAlias = null;
    	var paramUserSubjectAltNames = null;

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
   	this.logDebug("CertEnrollScepParamData.initWithDialogParams(): strIdx: " + strIdx + " paramScepRecipientServerURL: " + paramScepRecipientServerURL); 

	strIdx++;
	try {
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramScepMessageType = paramString;
	    }
	} catch (ex) {}
   	this.logDebug("CertEnrollScepParamData.initWithDialogParams(): strIdx: " + strIdx + " paramScepMessageType: " + paramScepMessageType); 

	strIdx++;
	try {
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramScepIssuerID = paramString;
	    }
	} catch (ex) {}
   	this.logDebug("CertEnrollScepParamData.initWithDialogParams(): strIdx: " + strIdx + " paramScepIssuerID: " + paramScepIssuerID); 

	strIdx++;
	try {
	    x509Cert = null;
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramIssuerSubjectDN = paramString;
	    }
	    /*
	    if (!paramScepRecipientIsRA && paramIssuerSubjectDN && !paramScepRecipientSubjectDN) {
	    	paramScepRecipientSubjectDN = paramIssuerSubjectDN;
	    }
	    */
	} catch (ex) {}
   	this.logDebug("CertEnrollScepParamData.initWithDialogParams(): strIdx: " + strIdx + " paramIssuerSubjectDN: " + paramIssuerSubjectDN); 

	strIdx++;
	try {
	    x509Cert = null;
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramScepRecipientSubjectDN = paramString;
	    }
	    if (!paramScepRecipientIsRA && paramScepRecipientSubjectDN && !paramIssuerSubjectDN) {
	    	paramIssuerSubjectDN = paramScepRecipientSubjectDN;
	    }
	} catch (ex) {}
   	this.logDebug("CertEnrollScepParamData.initWithDialogParams(): strIdx: " + strIdx + " paramScepRecipientSubjectDN: " + paramScepRecipientSubjectDN); 

	strIdx++;
	try {
	    x509Cert = null;
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramUserSubjectDN = paramString;
	    }
	    /*
	    if (paramUserSubjectDN && (paramUserSubjectDN != "")) {
	    	x509Cert =  this.mKeyManager.findX509CertBySubjectName(paramUserSubjectDN);
	    }
	    if (x509Cert) {
	    	paramUserCert = x509Cert;
	    }
	    */
	} catch (ex) {}
   	this.logDebug("CertEnrollScepParamData.initWithDialogParams(): strIdx: " + strIdx + " paramUserSubjectDN: " + paramUserSubjectDN); 

	strIdx++;
	try {
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramUserChallengePW = paramString;
	    }
	} catch (ex) {}
   	this.logDebug("CertEnrollScepParamData.initWithDialogParams(): strIdx: " + strIdx + " paramUserChallengePW: " + paramUserChallengePW); 

	strIdx++;
	try {
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramUserX509CertAlias = paramString;
	    }
	} catch (ex) {}
   	this.logDebug("CertEnrollScepParamData.initWithDialogParams(): strIdx: " + strIdx + " paramUserX509CertAlias: " + paramUserX509CertAlias); 

	strIdx++;
	try {
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramUserSubjectAltNames = paramString;
	    }
	} catch (ex) {}
   	this.logDebug("CertEnrollScepParamData.initWithDialogParams(): strIdx: " + strIdx + " paramUserSubjectAltNames: " + paramUserSubjectAltNames); 

	/*
   	this.logDebug("CertEnrollScepParamData.initWithDialogParams(): {\n" + 
			"    paramScepRecipientServerURL: "	+ paramScepRecipientServerURL + "\n" + 
			"    paramScepRecipientSubjectDN: "	+ paramScepRecipientSubjectDN + "\n" + 
			"    paramScepRecipientSubjectDN: "	+ paramScepRecipientSubjectDN + "\n" + 
			"    paramScepRecipientCert: "	+ paramScepRecipientCert + "\n" + 
			"    paramUserSubjectDN: "	+ paramUserSubjectDN + "\n" + 
			"    paramUserCert: "		+ paramUserCert + "\n" + 
			"    paramIssuerSubjectDN: "	+ paramIssuerSubjectDN + "\n" + 
			"    paramIssuerCert: "		+ paramIssuerCert + "\n" + 
			"}");
	*/

	this.mScepClientPkcsReqParam = {
			scepRecipientServerURL	: paramScepRecipientServerURL,
			scepRecipientIsRA	: paramScepRecipientIsRA,
			scepMessageType		: paramScepMessageType,

			scepServerCAId		: paramScepIssuerID,
			issuerSubjectDN		: paramIssuerSubjectDN,
			issuerX509Cert		: paramIssuerCert,

			scepRecipientSubjectDN	: paramScepRecipientSubjectDN,
			scepRecipientX509Cert	: paramScepRecipientCert,

			userSubjectDN		: paramUserSubjectDN,
			userX509Cert		: paramUserCert,
			userChallengePW		: paramUserChallengePW,
			userX509CertAlias	: paramUserX509CertAlias,
			userSubjectAltNames	: paramUserSubjectAltNames
			};
   	this.logDebug("CertEnrollScepParamData.initWithDialogParams(): {\n" + 
			"    scepRecipientServerURL: "	+ this.mScepClientPkcsReqParam.scepRecipientServerURL + "\n" + 
			"    scepRecipientIsRA: "	+ this.mScepClientPkcsReqParam.scepRecipientIsRA + "\n" + 

			"    scepServerCAId: "		+ this.mScepClientPkcsReqParam.scepServerCAId + "\n" + 
			"    issuerSubjectDN: "		+ this.mScepClientPkcsReqParam.issuerSubjectDN + "\n" + 
			"    issuerX509Cert: "		+ this.mScepClientPkcsReqParam.issuerX509Cert + "\n" + 
			"    issuerX509Cert.nickname: "	+ (this.mScepClientPkcsReqParam.issuerX509Cert ? this.mScepClientPkcsReqParam.issuerX509Cert.nickname : "null") + "\n" + 

			"    scepRecipientSubjectDN: "	+ this.mScepClientPkcsReqParam.scepRecipientSubjectDN + "\n" + 
			"    scepRecipientX509Cert: "	+ this.mScepClientPkcsReqParam.scepRecipientX509Cert + "\n" + 

			"    userSubjectDN: "		+ this.mScepClientPkcsReqParam.userSubjectDN + "\n" + 
			"    userX509Cert: "		+ this.mScepClientPkcsReqParam.userX509Cert + "\n" + 
			"    userX509Cert.nickname: "	+ (this.mScepClientPkcsReqParam.userX509Cert ? this.mScepClientPkcsReqParam.userX509Cert.nickname : "null") + "\n" + 
			"    userChallengePW: "		+ this.mScepClientPkcsReqParam.userChallengePW + "\n" + 
			"    userX509CertAlias: "	+ this.mScepClientPkcsReqParam.userX509CertAlias + "\n" + 
			"    userSubjectAltNames: "	+ this.mScepClientPkcsReqParam.userSubjectAltNames + "\n" + 
			"}\n");
			
	if (this.mScepClientPkcsReqParam.scepRecipientServerURL && (this.mScepClientPkcsReqParam.scepRecipientServerURL != "")) {
	    this.mScepServerURLElem.value = this.mScepClientPkcsReqParam.scepRecipientServerURL;
	    this.handleScepServerURLChange(this.mScepServerURLElem);
	}

	this.mScepServerIsRAElem.checked = this.mScepClientPkcsReqParam.scepRecipientIsRA;
	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);

	if (this.mScepClientPkcsReqParam.scepServerCAId && (this.mScepClientPkcsReqParam.scepServerCAId != "")) {
	    this.mScepServerCAIdElem.value = this.mScepClientPkcsReqParam.scepServerCAId;
	    this.handleGetCACertCAIdChange(this.mScepServerCAIdElem);
	}

	/*
	if (this.mScepClientPkcsReqParam.scepRecipientIsRA) {
	    this.mScepServerURLDestOptionsElem.selectedItem = this.mScepServerURLDestRAElem;
	}
	else {
	    this.mScepServerURLDestOptionsElem.selectedItem = this.mScepServerURLDestCAElem;
	}
	this.handleScepServerURLDestOptionChange(this.mScepServerURLDestOptionsElem);
	*/

	/*
	if (this.mScepClientPkcsReqParam.issuerX509Cert ) {
	    this.mScepServerCACertPickerElem.selectedCert = this.mScepClientPkcsReqParam.issuerX509Cert;
	    this.handleSCEPServerCACertPickerChange(this.mScepServerCACertPickerElem);
	}

	if (this.mScepClientPkcsReqParam.scepRecipientX509Cert) {
	    this.mScepServerRecipientCertPickerElem.selectedCert = this.mScepClientPkcsReqParam.scepRecipientX509Cert;
    	    this.handleScepServerRecipientCertPickerChange(this.mScepServerRecipientCertPickerElem);
	}

	if (this.mScepClientPkcsReqParam.userX509Cert) {
	    this.mUserCertPickerElem.selectedCert = this.mScepClientPkcsReqParam.userX509Cert;
	    this.handleUserCertPickerChange(this.mUserCertPickerElem);
	}
	*/

	if (this.mScepClientPkcsReqParam.issuerSubjectDN && (this.mScepClientPkcsReqParam.issuerSubjectDN != "")) {
	    this.mScepServerCASubjectDNElem.value = this.mScepClientPkcsReqParam.issuerSubjectDN;
	}
	this.handleCASubjectDNChange(this.mScepServerCASubjectDNElem);

	if (this.mScepClientPkcsReqParam.scepRecipientSubjectDN && (this.mScepClientPkcsReqParam.scepRecipientSubjectDN != "")) {
	    this.mScepServerRecipientSubjectDNElem.value = this.mScepClientPkcsReqParam.scepRecipientSubjectDN;
	}
	this.handleSCEPRecipientSubjectDNChange(this.mScepServerRecipientSubjectDNElem);


	if (this.mScepClientPkcsReqParam.userSubjectDN && (this.mScepClientPkcsReqParam.userSubjectDN != "")) {
	    this.mUserSubjectDNElem.value = this.mScepClientPkcsReqParam.userSubjectDN;
	}
	this.handleUserSubjectDNChange(this.mUserSubjectDNElem);

	if (this.mScepClientPkcsReqParam.userChallengePW && (this.mScepClientPkcsReqParam.userChallengePW != "")) {
	    this.mScepServerUserChallengePWElem.value = this.mScepClientPkcsReqParam.userChallengePW;
	}


    	this.logTrace("CertEnrollScepParamData.initWithDialogParams():................End.");
    },

    getScepParams : function () 
    {
    	this.logTrace("CertEnrollScepParamData.getScepParams():................Start.");

        var signedX509Cert = null;
        if (this.mScepClientPkcsReqParam.issuerX509Cert && this.mScepClientPkcsReqParam.userX509Cert) {
            try {
                signedX509Cert = this.mKeyManager.findCASignedX509CertByCertSPKI(
                                        this.mScepClientPkcsReqParam.userX509Cert,
                                        this.mScepClientPkcsReqParam.issuerX509Cert
                                        );
            } catch (ex) {
                this.logError("CertEnrollScepParamData.getScepParams(): this.mKeyManager.findCASignedX509CertByCertSPKI() failed for " + this.mScepClientPkcsReqParam.userX509Cert.subjectName);
            }
        }
        this.logDebug("CertEnrollScepParamData.getScepParams(): signedX509Cert: " + signedX509Cert + "");
	this.mScepClientPkcsReqParam.userX509CertSigned = signedX509Cert;

    	this.logTrace("CertEnrollScepParamData.getScepParams():................End.");
	return this.mScepClientPkcsReqParam;
    },

    initOnLoad : function (aWizardElem) 
    {
    	this.logTrace("CertEnrollScepParamData.initOnLoad():................Start.");


	this.mWizardElem = aWizardElem;

	if (window.arguments != 'undefined') {
    	this.logDebug("CertEnrollScepParamData.initOnLoad(): window.arguments: " + window.arguments);
        if (window.arguments && (window.arguments.length > 0) && window.arguments[0]) {
            var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    this.mDialogParams = dialogParams;
	}
	}
    	this.logTrace("CertEnrollScepParamData.initOnLoad():...................10.");

	/*
    	this.mScepClientToolWin			= document.getElementById('keymgr.certenroll.scep.param.data.win');
    	this.mScepServerURLDestOptionsElem	= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.dest.options');
    	this.mScepServerURLDestCAElem	= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.dest.ca');
    	this.mScepServerURLDestRAElem	= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.dest.ra');
	*/

    	this.mScepServerIsRAElem		= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.isra');
    	this.mScepServerURLElem			= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.url');
    	this.mScepServerCAIdElem		= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.caid');

	/*
    	this.mDownloadCertButtonElem		= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.downloadcert');
    	this.mGetCACapsButtonElem		= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.getcaps');
	*/
    	this.mScepServerCASubjectDNElem		= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.ca.subjectdn');
    	this.mScepServerCACertPickerElem	= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.ca.certpicker');

    	this.mScepServerRecipientCertRowElem	= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.recipient.cert.row');
    	this.mScepServerCertFilterWithCAElem	= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.recipient.filterwithca');
    	this.mScepServerRecipientSubjectDNElem		= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.recipient.subjectdn');
    	this.mScepServerRecipientCertPickerElem		= document.getElementById('keymgr.certenroll.scep.param.data.scepserver.recipient.certpicker');

    	this.mUserSubjectDNElem			= document.getElementById('keymgr.certenroll.scep.param.data.user.subjectdn');
    	this.mUserCertPickerElem		= document.getElementById('keymgr.certenroll.scep.param.data.user.certpicker');
    	this.mScepServerUserChallengePWElem	= document.getElementById("keymgr.certenroll.scep.param.data.user.challengepw");

    	// this.mCASignedCertItemElem		= document.getElementById('keymgr.certenroll.scep.param.data.user.signedcert.certitem');

	this.mScepServerCACertPickerElem.refresh();
	this.mScepServerRecipientCertPickerElem.refresh();
	this.mUserCertPickerElem.refresh();
	// this.mCASignedCertItemElem.refresh();

	this.mScepServerURL		= null;
	this.mScepServerRecipientIsRA	= false;
	this.mScepServerCACert		= null;
	this.mScepServerRecipientCert		= null;
	this.mUserCert			= null;

	this.initXPComServiceInfo();

	this.mScepServerCACertPickerElem.selectedCert = null;
	this.mScepServerRecipientCertPickerElem.selectedCert = null;
	this.mUserCertPickerElem.selectedCert = null;

	this.initWithDefaultValues();
	this.initWithDialogParams();

	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);
	this.handleScepServerURLChange(this.mScepServerURLElem);
	this.handleGetCACertCAIdChange(this.mScepServerCAIdElem);
	this.handleSCEPServerCACertPickerChange(this.mScepServerCACertPickerElem);


	this.handleUserCertPickerChange(this.mUserCertPickerElem);

    	this.logTrace("CertEnrollScepParamData.initOnLoad():................End.");
    },

    valdiateSCEPParams : function()
    {
    	this.logTrace("CertEnrollScepParamData.valdiateSCEPParams():................Start.");

	var pageIsValid = true;

	do {
	    if (!this.mScepServerURL || (this.mScepServerURL == "")) {
	        pageIsValid = false;
		break;
	    }

            var issuerCert = this.mScepServerCACertPickerElem.getSelectedCert();
            if (!issuerCert) {
	        pageIsValid = false;
		break;
            }

            var recipientCert = this.mScepServerRecipientCertPickerElem.getSelectedCert();
            if (this.mScepServerIsRAElem.checked && !recipientCert) {
	        pageIsValid = false;
		break;
            }

            var userCert = this.mUserCertPickerElem.getSelectedCert();
            if (!this.mUserSubjectDNElem.value && !userCert) {
	        pageIsValid = false;
		break;
            }

	    /*
	    if (!this.mScepServerCACert || !this.mScepServerRecipientCert || !this.mUserCert) {
    	        this.logTrace("CertEnrollScepParamData.valdiateSCEPParams():................End(0).");
	        pageIsValid = false;
		break;
	    }
	    */
	    pageIsValid = true;
	} while (0);
	this.mWizardElem.canAdvance = pageIsValid;

    	this.logTrace("CertEnrollScepParamData.valdiateSCEPParams():................End.");
	return pageIsValid;
    },
    /*
    handleScepServerURLDestOptionChange : function (aScepServerURLDestOptionsElem, ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleScepServerURLDestOptionChange():...................Start.");

	if (aScepServerURLDestOptionsElem.selectedItem.value == "ca") {
	    this.mScepServerIsRAElem.checked = false;
	}
	else {
	    this.mScepServerIsRAElem.checked = true;
	}

	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);

    	this.logTrace("CertEnrollScepParamData.handleScepServerURLDestOptionChange():...................End.");
    },
    */

    handleScepServerURLChange : function (aScepServerURLElem, ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleScepServerURLChange():...................Start.");

	this.handleTextboxChange(aScepServerURLElem);

	// create an nsIURI
	if (aScepServerURLElem.value != "") {
	    var uri = null;
	    try {
	        uri = this.mIOService.newURI(aScepServerURLElem.value, null, null);
	        this.mScepServerURL = aScepServerURLElem.value;
	    } catch (ex) {
	        alert("Badly formatted URL: " + this.mScepServerURL);
	        this.mScepServerURL = "";
	    }
	}
	else {
	    this.mScepServerURL = "";
	}
	CertEnrollScepParamData.valdiateSCEPParams();
	
	/*
	if (this.mScepServerURL != "") {
	    this.mDownloadCertButtonElem.disabled = false;
	    this.mGetCACapsButtonElem.disabled = false;
	}
	else {
	    this.mDownloadCertButtonElem.disabled = true;
	    this.mGetCACapsButtonElem.disabled = true;
	}
	*/

	this.valdiateSCEPParams();

    	this.logTrace("CertEnrollScepParamData.handleScepServerURLChange():...................End.");
    },

    handleScepServerIsRAChange : function(aScepServerIsRAElem, ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleScepServerIsRAChange():...................Start.");

	this.mScepServerRecipientIsRA = aScepServerIsRAElem.checked;


	if (this.mScepServerRecipientIsRA) {
	    this.mScepServerRecipientCertRowElem.hidden = false;
	}
	else {
	    this.mScepServerRecipientCertRowElem.hidden = true;
	}

    	var certType = "";
    	var certUsage = new String("");
    	var cadn = new String("");
    	var selectedCert = null;
    	if (this.mScepServerRecipientIsRA) {
	    certType = "server";
	    /*
	    certUsage = "SSLServer";
	    certUsage = new String("");
	    */
	    certUsage = "EmailRecipient";
	    if (this.mScepServerCertFilterWithCAElem.checked) {
	    	cadn = this.mScepServerCACertPickerElem.selectedCert.subjectName;
	    }
	    else {
	    	cadn = new String("");
	    }
	    selectedCert = null;
	    selectedCert = this.mScepServerRecipientCertPickerElem.selectedCert;

	    this.mScepServerRecipientCertPickerElem.disabled = false;
	    // gSCEPReqRecipientCertPickerElem.setAttribute("certusagedisabled", true);
    	}
    	else {
	    certType = "ca";
	    certUsage = "VerifyCA";
	    cadn = new String("");
	    selectedCert = this.mScepServerCACertPickerElem.selectedCert;

	    this.mScepServerRecipientCertPickerElem.disabled = true;
	    // gSCEPReqRecipientCertPickerElem.setAttribute("certusagedisabled", true);
    	}
    	this.mScepServerRecipientCertPickerElem.setAttribute("certtypedisabled", true);

    	this.logDebug("CertEnrollScepParamData.handleScepServerIsRAChange(): certType: " + certType + " certUsage: " + certUsage + " cadn: " + cadn + "");
    	this.mScepServerRecipientCertPickerElem.initWithParams(certType, certUsage, cadn, selectedCert);
    	this.handleScepServerRecipientCertPickerChange(this.mScepServerRecipientCertPickerElem);

	CertEnrollScepParamData.valdiateSCEPParams();

    	this.logTrace("CertEnrollScepParamData.handleScepServerIsRAChange():...................End.");
    },

    handleGetCACertCAIdChange : function (aScepServerCAIdElem, ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleGetCACertCAIdChange():...................Start.");

	this.handleTextboxChange(aScepServerCAIdElem);
	this.mScepServerCAId = aScepServerCAIdElem.value;
	if (this.mScepServerCAId == "") {
	    this.mScepServerCAId = "DummyCA";
	}

    	this.logTrace("CertEnrollScepParamData.handleGetCACertCAIdChange():...................End.");
    },

    /*
    scepGetCACertChain : function (ev)
    {
    	this.logTrace("CertEnrollScepParamData.scepGetCACertChain():...................Start.");
	if (ev) {
	   ev.stopPropagation();
	}


    	var scepServerObj = {
    	    scepServerURL		: this.mScepServerURL,
	    scepServerHttpMethod	: "GET",
    	    scepServerURLDestIsRA	: this.mScepServerRecipientIsRA,
    	    scepServerCAId		: this.mScepServerCAId,
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
    	    };

    	var scepGetCACertMsgType = "GetCACert";
	if (this.mScepServerRecipientIsRA) {
    	    scepGetCACertMsgType = "GetCARACert";
	}
	scepServerObj.scepMsgType = scepGetCACertMsgType;
	scepServerObj.scepServerCAId = "XXXXX";

	window.setCursor('wait');

	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	jsSCEPClient.scepGetCACertChain();

	window.setCursor('auto');

    	this.logTrace("CertEnrollScepParamData.scepGetCACertChain():...................End.");
    },
    */

    scepGetCACapabilities : function (ev)
    {
    	this.logTrace("CertEnrollScepParamData.scepGetCACapabilities():...................Start.");
	if (ev) {
	   ev.stopPropagation();
	}


    	var scepServerObj = {
    	    scepServerURL		: this.mScepServerURL,
	    scepServerHttpMethod	: "GET",
    	    scepServerCAId		: this.mScepServerCAId,
	    /*
    	    scepServerURLDestIsRA	: this.mScepServerRecipientIsRA,
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

	/*
	scepServerObj.scepServerCAId = "XXXXX";

	window.setCursor('wait');
	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	var scepCACapabilities = jsSCEPClient.scepGetCACapabilities();
	window.setCursor('auto');

    	this.logDebug("CertEnrollScepParamData.scepGetCACapabilities(): scepCACapabilities.srcDoc: " + scepCACapabilities.srcDoc);
	alert("SCEP CA Capabilities:\n" + scepCACapabilities.srcDoc + "\n");
	*/

    	this.logTrace("CertEnrollScepParamData.scepGetCACapabilities():...................End.");
    },

    formatSubjectDN : function (aTargetSubjectDNElemId, ev)
    {
    	this.logTrace("CertEnrollScepParamData.formatSubjectDN():..................Start.");

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
	
    	this.logTrace("CertEnrollScepParamData.formatSubjectDN():..................End.");
    },

    findX509CertBySubjectDN : function (aSubjectDN)
    {
	var x509Cert = null;
    	try {
	    if (aSubjectDN && (aSubjectDN != "")) {
	    	x509Cert =  this.mKeyManager.findX509CertBySubjectName(aSubjectDN);
	    }
	} catch (ex) {
    	    this.logError("CertEnrollScepParamData.findX509CertBySubjectDN(): this.mKeyManager.findX509CertBySubjectName() failed for " + aSubjectDN);
	    x509Cert = null;
	}
	return x509Cert;
    },

    handleCASubjectDNChange : function (aCASubjectDNElem, ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleCASubjectDNChange():...................Start.");

	this.handleTextboxChange(aCASubjectDNElem);

	// Initialize certpicker for CA with the correcponding X.609 cert for the subject.
    	var x509Cert = null;
	if (aCASubjectDNElem.value != "") {
    	    x509Cert = this.findX509CertBySubjectDN(aCASubjectDNElem.value);
	}

	this.mScepServerCACertPickerElem.selectedCert = x509Cert;
	this.handleSCEPServerCACertPickerChange(this.mScepServerCACertPickerElem);

    	this.logTrace("CertEnrollScepParamData.handleCASubjectDNChange():...................End.");
    },

    formatCASubjectDN : function (ev)
    {
    	this.logTrace("CertEnrollScepParamData.formatCASubjectDN():..................Start.");

    	var targetSubjectDNElemId = 'keymgr.certenroll.scep.param.data.scepserver.ca.subjectdn';

    	var targetSubjectDNElem = document.getElementById(targetSubjectDNElemId);
	this.formatSubjectDN(targetSubjectDNElemId, ev);
	this.handleCASubjectDNChange(targetSubjectDNElem);

    	this.logTrace("CertEnrollScepParamData.formatCASubjectDN():..................End.");
    },

    handleSCEPServerCACertPickerChange : function(aScepServerCACertPickerElem, ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleSCEPServerCACertPickerChange():...................Start.");

	this.mScepServerCACert		= this.mScepServerCACertPickerElem.selectedCert;

    	if (!aScepServerCACertPickerElem.selectedCert) {
	    this.mScepServerRecipientCertPickerElem.selectedCert = null;
    	    this.logTrace("CertEnrollScepParamData.handleSCEPServerCACertPickerChange():...................End(0).");
	    return;
	}

	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);
	CertEnrollScepParamData.valdiateSCEPParams();

    	this.logTrace("CertEnrollScepParamData.handleSCEPServerCACertPickerChange():...................End.");
    },

    handleScepServerCertFilterWithCAChange : function(aScepServerIsRAElem, ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleScepServerCertFilterWithCAChange():...................Start.");

	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);

    	this.logTrace("CertEnrollScepParamData.handleScepServerCertFilterWithCAChange():...................End.");
    },

    handleSCEPRecipientSubjectDNChange : function (aSCEPRecipientSubjectDNElem, ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleSCEPRecipientSubjectDNChange():...................Start.");

	this.handleTextboxChange(aSCEPRecipientSubjectDNElem);

	// Initialize certpicker for CA with the correcponding X.609 cert for the subject.
    	var x509Cert = null;
	if (aSCEPRecipientSubjectDNElem.value != "") {
    	    x509Cert = this.findX509CertBySubjectDN(aSCEPRecipientSubjectDNElem.value);
	}
	this.mScepServerRecipientCertPickerElem.selectedCert = x509Cert;
	this.handleScepServerRecipientCertPickerChange(this.mScepServerRecipientCertPickerElem);

	CertEnrollScepParamData.valdiateSCEPParams();

    	this.logTrace("CertEnrollScepParamData.handleSCEPRecipientSubjectDNChange():...................End.");
    },

    formatSCEPRecipientSubjectDN : function (ev)
    {
    	this.logTrace("CertEnrollScepParamData.formatSCEPRecipientSubjectDN():..................Start.");

    	var targetSubjectDNElemId = 'keymgr.certenroll.scep.param.data.scepserver.recipient.subjectdn';
    	var targetSubjectDNElem = document.getElementById(targetSubjectDNElemId);
	this.formatSubjectDN(targetSubjectDNElemId, ev);
	this.handleSCEPRecipientSubjectDNChange(targetSubjectDNElem);


    	this.logTrace("CertEnrollScepParamData.formatSCEPRecipientSubjectDN():..................End.");
    },

    handleScepServerRecipientCertPickerChange : function(aScepServerCertPickerElem, ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleScepServerRecipientCertPickerChange():...................Start.");

	this.mScepServerRecipientCert		= this.mScepServerRecipientCertPickerElem.selectedCert;

    	this.logTrace("CertEnrollScepParamData.handleScepServerRecipientCertPickerChange():...................End.");
    },

    handleUserSubjectDNChange : function (aUserSubjectDNElem, ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleUserSubjectDNChange():...................Start.");

	this.handleTextboxChange(aUserSubjectDNElem);
	this.mScepClientPkcsReqParam.userSubjectDN = aUserSubjectDNElem.value;

	// Initialize certpicker for CA with the correcponding X.609 cert for the subject.
    	var x509Cert = null;
	if (aUserSubjectDNElem.value != "") {
	    x509Cert = this.findX509CertBySubjectDN(aUserSubjectDNElem.value);
	}
	this.mUserCertPickerElem.selectedCert = x509Cert;
	this.handleUserCertPickerChange(this.mUserCertPickerElem);

	CertEnrollScepParamData.valdiateSCEPParams();

    	this.logTrace("CertEnrollScepParamData.handleUserSubjectDNChange():...................End.");
    },

    formatUserSubjectDN : function (ev)
    {
    	this.logTrace("CertEnrollScepParamData.formatUserSubjectDN():..................Start.");

    	var targetSubjectDNElemId = 'keymgr.certenroll.scep.param.data.user.subjectdn';
    	var targetSubjectDNElem = document.getElementById(targetSubjectDNElemId);
	this.formatSubjectDN(targetSubjectDNElemId, ev);

	this.handleUserSubjectDNChange(targetSubjectDNElem);

    	this.logTrace("CertEnrollScepParamData.formatUserSubjectDN():..................End.");
    },

    handleUserCertPickerChange : function(aUserCertPickerElem, ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleUserCertPickerChange():...................Start.");

	this.mUserCert		= aUserCertPickerElem.selectedCert;
	this.mScepClientPkcsReqParam.userX509Cert = aUserCertPickerElem.selectedCert;

	CertEnrollScepParamData.valdiateSCEPParams();

    	this.logTrace("CertEnrollScepParamData.handleUserCertPickerChange():...................End.");
    },
    handleUserChallengePWChange : function(aUserChallengePWElem, ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleUserChallengePWChange():...................Start.");

	this.mScepClientPkcsReqParam.userChallengePW = aUserChallengePWElem.value;

    	this.logTrace("CertEnrollScepParamData.handleUserChallengePWChange():...................End.");
    },

    handleCreateUserCertSimple : function(ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleCreateUserCertSimple():...................Start.");

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
	    this.logError("CertEnrollScepParamData.handleCreateUserCertSimple(): failed to create self-signed cert.");
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
	}


    	this.logTrace("CertEnrollScepParamData.handleCreateUserCertSimple():...................End.");
    },

    handleCreateUserCertAdvanced : function(ev)
    {
    	this.logTrace("CertEnrollScepParamData.handleCreateUserCertAdvanced():...................Start.");
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
	    this.logError("CertEnrollScepParamData.handleCreateUserCertAdvanced(): failed to create self-signed cert.");
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
	}

    	this.logTrace("CertEnrollScepParamData.handleCreateUserCertAdvanced():...................End.");
    },

    getUserChallengePassword : function(ev)
    {
    	this.logTrace("CertEnrollScepParamData.getUserChallengePassword():...................Start.");
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
	    this.logError("CertEnrollScepParamData.getUserChallengePassword(): failed to retrive challlenge password.");
    	    this.logTrace("CertEnrollScepParamData.getUserChallengePassword():...................End(0).");
	    return;
	}
	var userChallengePW = dialogParams.GetString(0);
	this.mScepServerUserChallengePWElem.value = userChallengePW;

    	this.logTrace("CertEnrollScepParamData.getUserChallengePassword():...................End.");
    },


    enrollUserCert : function ()
    {
    	var scepServerObj = {
    	    scepServerURL		: this.mScepServerURL,
	    scepServerHttpMethod	: "GET",
    	    scepServerURLDestIsRA	: this.mScepServerRecipientIsRA,
    	    scepServerCACert		: this.mScepServerCACert,
    	    scepServerCert		: this.mScepServerRecipientCert,
    	    userCert			: this.mUserCert,
	    scepServerUserChallengePW 	: this.mScepServerUserChallengePWElem.value,
    	    scepMsgType			: "PKCSReq",
    	    scepMsgPKCS10CSR		: null,
	    scepMsgHashAlg		: "SHA1", // MD5, SHA1, SHA256, SHA512
    	    scepMsgTransactionId	: null,
    	    scepMsgReqPKCS7		: null,
    	    scepMsgRespPKCS7		: null,
    	    scepMsgRespStatus		: null,
    	    scepMsgRespOutFilePicker	: null,
    	    scepMsgRespOutFileBase64	: true,
    	    caSignedUserCert		: null,
    	    };

	window.setCursor('wait');

    	// Force token login - on windows the popup window for password is not coming up
    	this.loginToCertToken(this.mUserCert);

	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	jsSCEPClient.enrollCert();

	window.setCursor('auto');

	var signedCert = scepServerObj.caSignedUserCert;

	if (signedCert) {
	    this.mCASignedCertItemElem.cert = signedCert;
	}
	return signedCert;
    },


    lastMethod : function () 
    {
    }
}



