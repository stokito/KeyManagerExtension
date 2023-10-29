/* @(#) $Id: SCEPClientParamData.js,v 1.7 2012/10/07 17:20:54 subrata Exp $ */

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


var SCEPClientParamData = {


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
        this.logTrace("SCEPClientParamData.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = this.mTokenDB.getInternalKeyToken();
        } catch (ex) {}
	if (!token) {
            this.logTrace("SCEPClientParamData.loginToInternalToken():................End(0).");
	    return;
	}

	try {
            token.login(false);
            this.logTrace("SCEPClientParamData.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("SCEPClientParamData.loginToInternalToken():................End.");
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
    	this.logTrace("SCEPClientParamData.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = this.trim(aTextboxElem.value);
	}
        var formFieldKey = aTextboxElem.getAttribute("autocompletesearchparam");
	if (formFieldKey) {
	    this.textFieldAutoCompleteAction(aTextboxElem);
	}

    	this.logTrace("SCEPClientParamData.handleTextboxChange():................End.");
    },


    initXPComServiceInfo : function ()
    {
        this.logTrace("SCEPClientParamData.initXPComServiceInfo():................Start.");

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
    	    alert("SCEPClientParamData.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("SCEPClientParamData.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	// this.loginToInternalToken();

	this.logTrace("SCEPClientParamData.initXPComServiceInfo():................End.");
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
    	this.logTrace("SCEPClientParamData.initWithDefaultValues():................Start.");

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
		    this.mCACapOverrideValue = prefStringValue.replace(/ /g, "\n");
		    this.mCACapOverrideValue += "\n";
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
	    	this.logDebug("SCEPClientParamData.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);

	/*
	gScepClientOverrideCACapEnabled = this.mCACapOverrideEnabled;
	gScepClientOverrideCACapValue = this.mCACapOverrideValue;
	gScepClientGetCACapFormPostEnabled = this.mHttpMethodFormPostEnabled;
	gScepClientGetCertInitialTestEnabled = this.mGetCertInitialTestEnabled;
	*/

    	this.logTrace("SCEPClientParamData.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	this.logTrace("SCEPClientParamData.initWithDialogParams():................Start.");
    	// this.logTrace("SCEPClientParamData.initWithDialogParams(): window.arguments: " + window.arguments);

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
    	    this.logTrace("SCEPClientParamData.initWithDialogParams():................End(0).");
	    return;
	}
        if (!window.arguments || (window.arguments.length <= 0) || !window.arguments[0]) {
    	    this.logTrace("SCEPClientParamData.initWithDialogParams():................End(1).");
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
    	    this.logError("SCEPClientParamData.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	    return;
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
    	    this.logError("SCEPClientParamData.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}
   	this.logDebug("SCEPClientParamData.initWithDialogParams(): {\n" + 
			"    paramScepRecipientCert: "	+ paramScepRecipientCert + "\n" + 
			"    paramUserCert: "		+ paramUserCert + "\n" + 
			"    paramIssuerCert: "		+ paramIssuerCert + "\n" + 
			"}");

	*/
    	var paramScepRecipientServerURL = null;
    	var paramScepRecipientIsRA = false;
    	var paramScepServerCAId =  null;
    	var paramScepMessageType = null;

    	var paramScepRecipientSubjectDN = null;
    	var paramUserSubjectDN = null;
    	var paramUserChallengePW = null;
    	var paramIssuerSubjectDN =  null;

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
   	this.logDebug("SCEPClientParamData.initWithDialogParams(): strIdx: " + strIdx + " paramScepRecipientServerURL: " + paramScepRecipientServerURL); 

	strIdx++;
	try {
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramScepMessageType = paramString;
	    }
	} catch (ex) {}
   	this.logDebug("SCEPClientParamData.initWithDialogParams(): strIdx: " + strIdx + " paramScepMessageType: " + paramScepMessageType); 

	strIdx++;
	try {
	    x509Cert = null;
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramScepRecipientSubjectDN = paramString;
	    }
	    /*
	    if (paramScepRecipientSubjectDN && (paramScepRecipientSubjectDN != "")) {
	    	x509Cert =  this.mKeyManager.findX509CertBySubjectName(paramScepRecipientSubjectDN);
	    }
	    if (x509Cert) {
	    	paramScepRecipientCert = x509Cert;
	    }
	    */
	    if (!paramScepRecipientIsRA && paramScepRecipientSubjectDN) {
	    	paramIssuerSubjectDN = paramScepRecipientSubjectDN;
		// paramIssuerCert = paramScepRecipientCert;
	    }
	} catch (ex) {}
   	this.logDebug("SCEPClientParamData.initWithDialogParams(): strIdx: " + strIdx + " paramScepRecipientSubjectDN: " + paramScepRecipientSubjectDN); 

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
   	this.logDebug("SCEPClientParamData.initWithDialogParams(): strIdx: " + strIdx + " paramUserSubjectDN: " + paramUserSubjectDN); 

	strIdx++;
	try {
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramUserChallengePW = paramString;
	    }
	} catch (ex) {}

	strIdx++;
	try {
	    x509Cert = null;
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramIssuerSubjectDN = paramString;
	    }
	    if (!paramScepRecipientIsRA && paramIssuerSubjectDN && !paramScepRecipientSubjectDN) {
	    	paramScepRecipientSubjectDN = paramIssuerSubjectDN;
	    }
	    /*
	    if (paramIssuerSubjectDN && (paramIssuerSubjectDN != "")) {
	    	x509Cert =  this.mKeyManager.findX509CertBySubjectName(paramIssuerSubjectDN);
	    }
	    if (x509Cert) {
	    	paramIssuerCert = x509Cert;
	    }
	    */
	} catch (ex) {}
   	this.logDebug("SCEPClientParamData.initWithDialogParams(): strIdx: " + strIdx + " paramIssuerSubjectDN: " + paramIssuerSubjectDN); 

	strIdx++;
	try {
	    x509Cert = null;
    	    paramString = dialogParams.GetString(strIdx);
	    if (paramString && (paramString != "")) {
	    	paramScepServerCAId = paramString;
	    }
	} catch (ex) {}
   	this.logDebug("SCEPClientParamData.initWithDialogParams(): strIdx: " + strIdx + " paramScepServerCAId: " + paramScepServerCAId); 

   	this.logDebug("SCEPClientParamData.initWithDialogParams(): {\n" + 
			"    paramScepServerCAId: "	+ paramScepServerCAId + "\n" + 
			"    paramScepRecipientSubjectDN: "	+ paramScepRecipientSubjectDN + "\n" + 
			"    paramScepRecipientCert: "	+ paramScepRecipientCert + "\n" + 
			"    paramUserSubjectDN: "	+ paramUserSubjectDN + "\n" + 
			"    paramUserCert: "		+ paramUserCert + "\n" + 
			"    paramIssuerSubjectDN: "	+ paramIssuerSubjectDN + "\n" + 
			"    paramIssuerCert: "		+ paramIssuerCert + "\n" + 
			"}");

	this.mScepClientPkcsReqParam = {
			scepRecipientServerURL	: paramScepRecipientServerURL,
			scepRecipientIsRA	: paramScepRecipientIsRA,
			scepServerCAId		: paramScepServerCAId,
			scepMessageType		: paramScepMessageType,

			scepRecipientSubjectDN	: paramScepRecipientSubjectDN,
			scepRecipientX509Cert	: paramScepRecipientCert,

			userSubjectDN		: paramUserSubjectDN,
			userX509Cert		: paramUserCert,
			userChallengePW		: paramUserChallengePW,

			issuerSubjectDN		: paramIssuerSubjectDN,
			issuerX509Cert		: paramIssuerCert
			};
   	this.logDebug("SCEPClientParamData.initWithDialogParams(): {\n" + 
			"    scepRecipientServerURL: "	+ this.mScepClientPkcsReqParam.scepRecipientServerURL + "\n" + 
			"    scepRecipientIsRA: "	+ this.mScepClientPkcsReqParam.scepRecipientIsRA + "\n" + 
			"    scepServerCAId: "		+ this.mScepClientPkcsReqParam.scepServerCAId + "\n" + 
			"    scepRecipientSubjectDN: "	+ this.mScepClientPkcsReqParam.scepRecipientSubjectDN + "\n" + 
			"    scepRecipientX509Cert: "	+ this.mScepClientPkcsReqParam.scepRecipientX509Cert + "\n" + 
			"    userSubjectDN: "		+ this.mScepClientPkcsReqParam.userSubjectDN + "\n" + 
			"    userX509Cert: "		+ this.mScepClientPkcsReqParam.userX509Cert + "\n" + 
			"    userX509Cert.nickname: "	+ (this.mScepClientPkcsReqParam.userX509Cert ? this.mScepClientPkcsReqParam.userX509Cert.nickname : "null") + "\n" + 
			"    userChallengePW: "		+ this.mScepClientPkcsReqParam.userChallengePW + "\n" + 
			"    issuerSubjectDN: "		+ this.mScepClientPkcsReqParam.issuerSubjectDN + "\n" + 
			"    issuerX509Cert: "		+ this.mScepClientPkcsReqParam.issuerX509Cert + "\n" + 
			"    issuerX509Cert.nickname: "	+ (this.mScepClientPkcsReqParam.issuerX509Cert ? this.mScepClientPkcsReqParam.issuerX509Cert.nickname : "null") + "\n" + 
			"}\n");
			
	if (this.mScepClientPkcsReqParam.scepRecipientServerURL && (this.mScepClientPkcsReqParam.scepRecipientServerURL != "")) {
	    this.mScepServerURLElem.value = this.mScepClientPkcsReqParam.scepRecipientServerURL;
	    this.handleScepServerURLChange(this.mScepServerURLElem);
	}

	if (this.mScepClientPkcsReqParam.scepServerCAId && (this.mScepClientPkcsReqParam.scepServerCAId != "")) {
	    this.mScepServerURLElem.value = this.mScepClientPkcsReqParam.scepServerCAId;
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
    	    this.handleScepServerCertPickerChange(this.mScepServerRecipientCertPickerElem);
	}

	if (this.mScepClientPkcsReqParam.userX509Cert) {
	    this.mUserCertPickerElem.selectedCert = this.mScepClientPkcsReqParam.userX509Cert;
	    this.handleUserCertPickerChange(this.mUserCertPickerElem);
	}
	*/

	if (this.mScepClientPkcsReqParam.issuerSubjectDN && (this.mScepClientPkcsReqParam.issuerSubjectDN != "")) {
	    this.mScepServerCASubjectDNElem.value = this.mScepClientPkcsReqParam.issuerSubjectDN;
	    this.handleCASubjectDNChange(this.mScepServerCASubjectDNElem);
	}

	if (this.mScepClientPkcsReqParam.scepRecipientSubjectDN && (this.mScepClientPkcsReqParam.scepRecipientSubjectDN != "")) {
	    this.mScepServerRecipientSubjectDNElem.value = this.mScepClientPkcsReqParam.scepRecipientSubjectDN;
	    this.handleSCEPRecipientSubjectDNChange(this.mScepServerRecipientSubjectDNElem);
	}

	if (this.mScepClientPkcsReqParam.userSubjectDN && (this.mScepClientPkcsReqParam.userSubjectDN != "")) {
	    this.mUserSubjectDNElem.value = this.mScepClientPkcsReqParam.userSubjectDN;
	    this.handleUserSubjectDNChange(this.mUserSubjectDNElem);
	}
	if (this.mScepClientPkcsReqParam.userChallengePW && (this.mScepClientPkcsReqParam.userChallengePW != "")) {
	    this.mScepServerUserChallengePWElem.value = this.mScepClientPkcsReqParam.userChallengePW;
	}

	this.mScepServerIsRAElem.checked = this.mScepClientPkcsReqParam.scepRecipientIsRA;
	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);

    	this.logTrace("SCEPClientParamData.initWithDialogParams():................End.");
    },

    initOnLoad : function () 
    {
    	this.logTrace("SCEPClientParamData.initOnLoad():................Start.");


	if (window.arguments != 'undefined') {
    	this.logDebug("SCEPClientParamData.initOnLoad(): window.arguments: " + window.arguments);
        if (window.arguments && (window.arguments.length > 0) && window.arguments[0]) {
            var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    this.mDialogParams = dialogParams;
	}
	}
    	this.logTrace("SCEPClientParamData.initOnLoad():...................10.");

    	this.mScepClientToolWin			= document.getElementById('keymgr.scepclient.param.win');
	/*
    	this.mScepServerURLDestOptionsElem	= document.getElementById('keymgr.scepclient.param.scepserver.dest.options');
    	this.mScepServerURLDestCAElem	= document.getElementById('keymgr.scepclient.param.scepserver.dest.ca');
    	this.mScepServerURLDestRAElem	= document.getElementById('keymgr.scepclient.param.scepserver.dest.ra');
	*/

    	this.mScepServerIsRAElem		= document.getElementById('keymgr.scepclient.param.scepserver.isra');
    	this.mScepServerURLElem			= document.getElementById('keymgr.scepclient.param.scepserver.url');
    	this.mScepServerCAIdElem		= document.getElementById('keymgr.scepclient.param.scepserver.caid');

	/*
    	this.mDownloadCertButtonElem		= document.getElementById('keymgr.scepclient.param.scepserver.downloadcert');
    	this.mGetCACapsButtonElem		= document.getElementById('keymgr.scepclient.param.scepserver.getcaps');
	*/
    	this.mScepServerCASubjectDNElem		= document.getElementById('keymgr.scepclient.param.scepserver.ca.subjectdn');
    	this.mScepServerCACertPickerElem	= document.getElementById('keymgr.scepclient.param.scepserver.ca.certpicker');

    	this.mScepServerRecipientCertRowElem	= document.getElementById('keymgr.scepclient.param.scepserver.recipient.cert.row');
    	this.mScepServerCertFilterWithCAElem	= document.getElementById('keymgr.scepclient.param.scepserver.recipient.filterwithca');
    	this.mScepServerRecipientSubjectDNElem		= document.getElementById('keymgr.scepclient.param.scepserver.recipient.subjectdn');
    	this.mScepServerRecipientCertPickerElem		= document.getElementById('keymgr.scepclient.param.scepserver.recipient.certpicker');

    	this.mUserSubjectDNElem			= document.getElementById('keymgr.scepclient.param.user.subjectdn');
    	this.mUserCertPickerElem		= document.getElementById('keymgr.scepclient.param.user.certpicker');
    	this.mScepServerUserChallengePWElem	= document.getElementById("keymgr.scepclient.param.user.challengepw");

    	// this.mCASignedCertItemElem		= document.getElementById('keymgr.scepclient.param.user.signedcert.certitem');

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

	this.initWithDefaultValues();
	this.initWithDialogParams();

	this.handleScepServerURLChange(this.mScepServerURLElem);
	this.handleGetCACertCAIdChange(this.mScepServerCAIdElem);
	this.handleSCEPServerCACertPickerChange(this.mScepServerCACertPickerElem);

	this.handleUserCertPickerChange(this.mUserCertPickerElem);
	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);

    	this.logTrace("SCEPClientParamData.initOnLoad():................End.");
    },

    valdiateSCEPParams : function()
    {
    	this.logTrace("SCEPClientParamData.valdiateSCEPParams():................Start.");
	/*
        var issuerCert = this.mScepServerCACertPickerElem.getSelectedCert();
        if (!issuerCert) {
	    return false;
        }

        var recipientCert = this.mScepServerRecipientCertPickerElem.getSelectedCert();
        if (!recipientCert) {
	    return false;
        }

        var userCert = this.mUserCertPickerElem.getSelectedCert();
        if (!userCert) {
	    return false;
        }
	*/

	if (!this.mScepServerURL || (this.mScepServerURL == "")) {
    	    this.logTrace("SCEPClientParamData.valdiateSCEPParams():................End(1).");
	    return false;
	}
	if (!this.mScepServerCACert || !this.mScepServerRecipientCert || !this.mUserCert) {
    	    this.logTrace("SCEPClientParamData.valdiateSCEPParams():................End(0).");
	    return false;
	}

    	this.logTrace("SCEPClientParamData.valdiateSCEPParams():................End.");
	return true;
    },
    /*
    handleScepServerURLDestOptionChange : function (aScepServerURLDestOptionsElem, ev)
    {
    	this.logTrace("SCEPClientParamData.handleScepServerURLDestOptionChange():...................Start.");

	if (aScepServerURLDestOptionsElem.selectedItem.value == "ca") {
	    this.mScepServerIsRAElem.checked = false;
	}
	else {
	    this.mScepServerIsRAElem.checked = true;
	}

	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);

    	this.logTrace("SCEPClientParamData.handleScepServerURLDestOptionChange():...................End.");
    },
    */

    handleScepServerURLChange : function (aScepServerURLElem, ev)
    {
    	this.logTrace("SCEPClientParamData.handleScepServerURLChange():...................Start.");

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

    	this.logTrace("SCEPClientParamData.handleScepServerURLChange():...................End.");
    },

    handleScepServerIsRAChange : function(aScepServerIsRAElem, ev)
    {
    	this.logTrace("SCEPClientParamData.handleScepServerIsRAChange():...................Start.");

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

    	this.logDebug("SCEPClientParamData.handleScepServerIsRAChange(): certType: " + certType + " certUsage: " + certUsage + " cadn: " + cadn + "");
    	this.mScepServerRecipientCertPickerElem.initWithParams(certType, certUsage, cadn, selectedCert);
    	this.handleScepServerCertPickerChange(this.mScepServerRecipientCertPickerElem);

    	this.logTrace("SCEPClientParamData.handleScepServerIsRAChange():...................End.");
    },

    handleGetCACertCAIdChange : function (aScepServerCAIdElem, ev)
    {
    	this.logTrace("SCEPClientParamData.handleGetCACertCAIdChange():...................Start.");

	this.handleTextboxChange(aScepServerCAIdElem);
	this.mScepServerCAId = aScepServerCAIdElem.value;
	if (this.mScepServerCAId == "") {
	    this.mScepServerCAId = "DummyCA";
	}

    	this.logTrace("SCEPClientParamData.handleGetCACertCAIdChange():...................End.");
    },

    scepGetCACertChain : function (ev)
    {
    	this.logTrace("SCEPClientParamData.scepGetCACertChain():...................Start.");
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

	if (ev) {
	    window.setCursor('wait');
	}

	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	jsSCEPClient.scepGetCACertChain();

	if (ev) {
	    window.setCursor('auto');
	}

    	this.logTrace("SCEPClientParamData.scepGetCACertChain():...................End.");
    },

    scepGetCACapabilities : function (ev)
    {
    	this.logTrace("SCEPClientParamData.scepGetCACapabilities():...................Start.");
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
	scepServerObj.scepServerCAId = "XXXXX";

	if (ev) {
	window.setCursor('wait');
	}
	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	var scepCACapabilities = jsSCEPClient.scepGetCACapabilities();
	if (ev) {
	window.setCursor('auto');
	}

    	this.logDebug("SCEPClientParamData.scepGetCACapabilities(): scepCACapabilities.srcDoc: " + scepCACapabilities.srcDoc);
	alert("SCEP CA Capabilities:\n" + scepCACapabilities.srcDoc + "\n");


    	this.logTrace("SCEPClientParamData.scepGetCACapabilities():...................End.");
    },

    formatSubjectDN : function (aTargetSubjectDNElemId, ev)
    {
    	this.logTrace("SCEPClientParamData.formatSubjectDN():..................Start.");

    	var targetSubjectDNElem = document.getElementById(aTargetSubjectDNElemId);

    	var dialogParams = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
				.createInstance(Components.interfaces.nsIDialogParamBlock);
    	dialogParams.SetInt(0, 0);
    	dialogParams.SetString(0, targetSubjectDNElem.value);
	var createSubjectDialogURL = 'chrome://keymanager/content/tools/genkeycsr/subjectDialog.xul';

	window.setCursor('wait');
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
	
    	this.logTrace("SCEPClientParamData.formatSubjectDN():..................End.");
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
	return x509Cert;
    },

    handleCASubjectDNChange : function (aCASubjectDNElem, ev)
    {
    	this.logTrace("SCEPClientParamData.handleCASubjectDNChange():...................Start.");

	this.handleTextboxChange(aCASubjectDNElem);

	// Initialize certpicker for CA with the correcponding X.609 cert for the subject.
    	var x509Cert = this.findX509CertBySubjectDN(aCASubjectDNElem.value);
	this.mScepServerCACertPickerElem.selectedCert = x509Cert;
	this.handleSCEPServerCACertPickerChange(this.mScepServerCACertPickerElem);

    	this.logTrace("SCEPClientParamData.handleCASubjectDNChange():...................End.");
    },

    formatCASubjectDN : function (ev)
    {
    	this.logTrace("SCEPClientParamData.formatCASubjectDN():..................Start.");

    	var targetSubjectDNElemId = 'keymgr.scepclient.param.scepserver.ca.subjectdn';

    	var targetSubjectDNElem = document.getElementById(targetSubjectDNElemId);
	this.formatSubjectDN(targetSubjectDNElemId, ev);
	this.handleCASubjectDNChange(this.mCASubjectDNElem);

    	this.logTrace("SCEPClientParamData.formatCASubjectDN():..................End.");
    },

    handleSCEPServerCACertPickerChange : function(aScepServerCACertPickerElem, ev)
    {
    	this.logTrace("SCEPClientParamData.handleSCEPServerCACertPickerChange():...................Start.");

    	if (!aScepServerCACertPickerElem.selectedCert) {
	    this.mScepServerRecipientCertPickerElem.selectedCert = null;
	    return;
	}

	this.mScepServerCACert		= this.mScepServerCACertPickerElem.selectedCert;

	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);

    	this.logTrace("SCEPClientParamData.handleSCEPServerCACertPickerChange():...................End.");
    },

    handleScepServerCertFilterWithCAChange : function(aScepServerIsRAElem, ev)
    {
    	this.logTrace("SCEPClientParamData.handleScepServerCertFilterWithCAChange():...................Start.");

	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);

    	this.logTrace("SCEPClientParamData.handleScepServerCertFilterWithCAChange():...................End.");
    },

    handleSCEPRecipientSubjectDNChange : function (aSCEPRecipientSubjectDNElem, ev)
    {
    	this.logTrace("SCEPClientParamData.handleSCEPRecipientSubjectDNChange():...................Start.");

	this.handleTextboxChange(aSCEPRecipientSubjectDNElem);

	// Initialize certpicker for CA with the correcponding X.609 cert for the subject.
    	var x509Cert = this.findX509CertBySubjectDN(aSCEPRecipientSubjectDNElem.value);
	this.mScepServerRecipientCertPickerElem.selectedCert = x509Cert;
	this.handleScepServerCertPickerChange(this.mScepServerRecipientCertPickerElem);

    	this.logTrace("SCEPClientParamData.handleSCEPRecipientSubjectDNChange():...................End.");
    },

    formatSCEPRecipientSubjectDN : function (ev)
    {
    	this.logTrace("SCEPClientParamData.formatSCEPRecipientSubjectDN():..................Start.");

    	var targetSubjectDNElemId = 'keymgr.scepclient.param.scepserver.recipient.subjectdn';
    	var targetSubjectDNElem = document.getElementById(targetSubjectDNElemId);
	this.formatSubjectDN(targetSubjectDNElemId, ev);
	this.handleSCEPRecipientSubjectDNChange(this.mCASubjectDNElem);


    	this.logTrace("SCEPClientParamData.formatSCEPRecipientSubjectDN():..................End.");
    },

    handleScepServerCertPickerChange : function(aScepServerCertPickerElem, ev)
    {
    	this.logTrace("SCEPClientParamData.handleScepServerCertPickerChange():...................Start.");

	this.mScepServerRecipientCert		= this.mScepServerRecipientCertPickerElem.selectedCert;

    	this.logTrace("SCEPClientParamData.handleScepServerCertPickerChange():...................End.");
    },

    handleUserSubjectDNChange : function (aUserSubjectDNElem, ev)
    {
    	this.logTrace("SCEPClientParamData.handleUserSubjectDNChange():...................Start.");

	this.handleTextboxChange(aUserSubjectDNElem);

	// Initialize certpicker for CA with the correcponding X.609 cert for the subject.
    	var x509Cert = this.findX509CertBySubjectDN(aUserSubjectDNElem.value);
	this.mUserCertPickerElem.selectedCert = x509Cert;
	this.handleUserCertPickerChange(this.mUserCertPickerElem);


    	this.logTrace("SCEPClientParamData.handleUserSubjectDNChange():...................End.");
    },

    formatUserSubjectDN : function (ev)
    {
    	this.logTrace("SCEPClientParamData.formatUserSubjectDN():..................Start.");

    	var targetSubjectDNElemId = 'keymgr.scepclient.param.user.subjectdn';
    	var targetSubjectDNElem = document.getElementById(targetSubjectDNElemId);
	this.formatSubjectDN(targetSubjectDNElemId, ev);
	this.handleUserSubjectDNChange(this.mCASubjectDNElem);

    	this.logTrace("SCEPClientParamData.formatUserSubjectDN():..................End.");
    },

    handleUserCertPickerChange : function(aUserCertPickerElem, ev)
    {
    	this.logTrace("SCEPClientParamData.handleUserCertPickerChange():...................Start.");

	this.mUserCert		= aUserCertPickerElem.selectedCert;

    	this.logTrace("SCEPClientParamData.handleUserCertPickerChange():...................End.");
    },

    handleCreateUserCertSimple : function(ev)
    {
    	this.logTrace("SCEPClientParamData.handleCreateUserCertSimple():...................Start.");

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
	    this.logError("SCEPClientParamData.handleCreateUserCertSimple(): failed to create self-signed cert.");
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


    	this.logTrace("SCEPClientParamData.handleCreateUserCertSimple():...................End.");
    },

    handleCreateUserCertAdvanced : function(ev)
    {
    	this.logTrace("SCEPClientParamData.handleCreateUserCertAdvanced():...................Start.");
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
	    this.logError("SCEPClientParamData.handleCreateUserCertAdvanced(): failed to create self-signed cert.");
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

    	this.logTrace("SCEPClientParamData.handleCreateUserCertAdvanced():...................End.");
    },

    getUserChallengePassword : function(ev)
    {
    	this.logTrace("SCEPClientParamData.getUserChallengePassword():...................Start.");
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
	    this.logError("SCEPClientParamData.getUserChallengePassword(): failed to retrive challlenge password.");
    	    this.logTrace("SCEPClientParamData.getUserChallengePassword():...................End(0).");
	    return;
	}
	var userChallengePW = dialogParams.GetString(0);
	this.mScepServerUserChallengePWElem.value = userChallengePW;

    	this.logTrace("SCEPClientParamData.getUserChallengePassword():...................End.");
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

    	// Force token login - on windows the popup window for password is not coming up
    	this.loginToCertToken(this.mUserCert);

	window.setCursor('wait');
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



