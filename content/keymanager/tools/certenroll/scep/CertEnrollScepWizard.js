/* @(#) $Id: CertEnrollScepWizard.js,v 1.7 2012/10/07 17:20:10 subrata Exp $ */

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


avpki.keymanager.CertEnrollScepWizard = {

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
        this.logTrace("CertEnrollScepWizard.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = this.mTokenDB.getInternalKeyToken();
        } catch (ex) {}
	if (!token) {
            this.logTrace("CertEnrollScepWizard.loginToInternalToken():................End(0).");
	    return;
	}

	try {
            token.login(false);
            this.logTrace("CertEnrollScepWizard.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("CertEnrollScepWizard.loginToInternalToken():................End.");
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
    	this.logTrace("CertEnrollScepWizard.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = this.trim(aTextboxElem.value);
	}
        var formFieldKey = aTextboxElem.getAttribute("autocompletesearchparam");
	if (formFieldKey) {
	    this.textFieldAutoCompleteAction(aTextboxElem);
	}

    	this.logTrace("CertEnrollScepWizard.handleTextboxChange():................End.");
    },


    initXPComServiceInfo : function ()
    {
        this.logTrace("CertEnrollScepWizard.initXPComServiceInfo():................Start.");

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
    	    alert("CertEnrollScepWizard.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("CertEnrollScepWizard.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	// this.loginToInternalToken();

	this.logTrace("CertEnrollScepWizard.initXPComServiceInfo():................End.");
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
    	this.logTrace("CertEnrollScepWizard.initWithDefaultValues():................Start.");

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
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.certenroll.scepclient.serverurl.default");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mCARAServerURLDefault = prefStringValue;
	        }

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.certenroll.scepclient.log.enabled");
	            this.mLogEnabled = prefBoolValue;
		} catch (ex) {} 

                prefIntValue = -1;
		try {
		    prefIntValue = prefsBranch.getIntPref("extensions.avpki.certenroll.scepclient.log.level");
	            // this.mMaxLogLevel = prefIntValue;
		} catch (ex) {} 

   
                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.certenroll.scepclient.httpmethod.postform");
	            this.mHttpMethodFormPostEnabled = prefBoolValue;
		} catch (ex) {} 

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.certenroll.scepclient.capabilities.override");
	            this.mCACapOverrideEnabled = prefBoolValue;
		} catch (ex) {} 

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.certenroll.scepclient.capabilities.value");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mCACapOverrideValue = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.certenroll.scepclient.serverurl.default");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mScepServerURLElem = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("extensions.avpki.certenroll.scepclient.serverurl.last");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mScepServerURLElem = prefStringValue;
	        }

		/*
                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.certenroll.scepclient.gcitest.enabled");
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
	    	this.logDebug("CertEnrollScepWizard.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);

	/*
	gScepClientOverrideCACapEnabled = this.mCACapOverrideEnabled;
	gScepClientOverrideCACapValue = this.mCACapOverrideValue;
	gScepClientGetCACapFormPostEnabled = this.mHttpMethodFormPostEnabled;
	gScepClientGetCertInitialTestEnabled = this.mGetCertInitialTestEnabled;
	*/

    	this.logTrace("CertEnrollScepWizard.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	this.logTrace("CertEnrollScepWizard.initWithDialogParams():................Start.");
    	this.logTrace("CertEnrollScepWizard.initWithDialogParams():................End.");
    },

    initXULElements : function () 
    {
    	this.mCertEnrollScepWizardElem = document.getElementById('keymgr.certenroll.scep.wizard');
    },

    initOnLoad : function () 
    {
    	this.logTrace("CertEnrollScepWizard.initOnLoad():................Start.");


	if (window.arguments != 'undefined') {
    	    this.logDebug("CertEnrollScepWizard.initOnLoad(): window.arguments: " + window.arguments);
            if (window.arguments && (window.arguments.length > 0) && window.arguments[0]) {
                var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	        this.mDialogParams = dialogParams;
	    }
	}
    	this.logTrace("CertEnrollScepWizard.initOnLoad():...................10.");


	this.initXULElements();

	this.initXPComServiceInfo();

	this.initWithDefaultValues();
	this.initWithDialogParams();

	CertEnrollScepParamData.initOnLoad(this.mCertEnrollScepWizardElem);
	CertEnrollSelectCertUser.initOnLoad(this.mCertEnrollScepWizardElem);
	CertEnrollSelectCertScepServer.initOnLoad(this.mCertEnrollScepWizardElem);
	CertEnrollViewSignedCert.initOnLoad(this.mCertEnrollScepWizardElem);

    	this.logTrace("CertEnrollScepWizard.initOnLoad():................End.");
    },


    scepParamDataPageShow : function (aWizardPageElem, ev)
    {
    	this.logTrace("CertEnrollScepWizard.scepParamDataPageShow():................Start.");

	this.mEnrolledCert = null;

    	if (!this.mWizardInitalized) {
	    this.initOnLoad();
    	    this.mWizardInitalized = true;
    	}

    	this.logTrace("CertEnrollScepWizard.scepParamDataPageShow():................End.");
    },

    scepParamDataPageAdvanced : function (aWizardPageElem, ev)
    {
    	this.logTrace("CertEnrollScepWizard.scepParamDataPageAdvanced():................Start.");

	this.mScepClientParams = CertEnrollScepParamData.getScepParams();

	if (this.mScepClientParams.userX509CertSigned) {
	    this.mEnrolledCert = this.mScepClientParams.userX509CertSigned;
	    aWizardPageElem.next = "keymgr.certenroll.scep.page.casignedcert.view";
	}

    	this.logTrace("CertEnrollScepWizard.scepParamDataPageAdvanced():................End.");
    },

    selectCertUserPageShow : function (aWizardPageElem, ev)
    {
    	this.logTrace("CertEnrollScepWizard.selectCertUserPageShow():................Start.");

	CertEnrollSelectCertUser.setScepParams(this.mScepClientParams);

	if ((this.mScepClientParams.userSubjectDN && (this.mScepClientParams.userSubjectDN != "")) &&
		(!this.mScepClientParams.userX509Cert)
		) {
	    CertEnrollSelectCertUser.handleCreateUserCertSimple();
	}

	CertEnrollSelectCertUser.valdiateSCEPParams(this.mCertEnrollScepWizardElem);

    	this.logTrace("CertEnrollScepWizard.selectCertUserPageShow():................End.");
    },

    selectCertUserPageAdvanced : function (aWizardPageElem, ev)
    {
    	this.logTrace("CertEnrollScepWizard.selectCertUserPageAdvanced():................Start.");

	CertEnrollSelectCertUser.getScepParams(this.mScepClientParams);

	if (this.mScepClientParams.userX509CertSigned) {
	    this.mEnrolledCert = this.mScepClientParams.userX509CertSigned;
	    aWizardPageElem.next = "keymgr.certenroll.scep.page.casignedcert.view";
	}

    	this.logTrace("CertEnrollScepWizard.selectCertUserPageAdvanced():................End.");
    },

    selectCertScepServerPageShow : function (aWizardPageElem, ev)
    {
    	this.logTrace("CertEnrollScepWizard.selectCertScepServerPageShow():................Start.");

	CertEnrollSelectCertScepServer.setScepParams(this.mScepClientParams);

	if ((this.mScepClientParams.scepRecipientServerURL && (this.mScepClientParams.scepRecipientServerURL != "")) &&
		/*
		(this.mScepClientParams.scepServerCAId && (this.mScepClientParams.scepServerCAId != "")) &&
		*/
		(!this.mScepClientParams.issuerX509Cert)
		) {
	    CertEnrollSelectCertScepServer.scepGetCACert();
	    if (this.mScepClientParams.scepRecipientIsRA) {
	    	CertEnrollSelectCertScepServer.scepGetRACert();
	    }
	    CertEnrollSelectCertScepServer.getScepParams(this.mScepClientParams);
	}
    	this.logTrace("CertEnrollScepWizard.selectCertScepServerPageShow():................End.");
    },

    selectCertScepServerPageAdvanced : function (aWizardPageElem, ev)
    {
    	this.logTrace("CertEnrollScepWizard.selectCertScepServerPageAdvanced():................Start.");

	CertEnrollSelectCertScepServer.getScepParams(this.mScepClientParams);
	if (this.mScepClientParams.userX509CertSigned) {
	    this.mEnrolledCert = this.mScepClientParams.userX509CertSigned;
	    aWizardPageElem.next = "keymgr.certenroll.scep.page.casignedcert.view";
	}

    	this.logTrace("CertEnrollScepWizard.selectCertScepServerPageAdvanced():................End.");
	return true;
    },

    getScepClientDialogParams : function (scepClientPkcsReqParam)
    {
    	this.logTrace("CertEnrollScepWizard.getScepClientDialogParams():................Start.");

	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
				.createInstance(Components.interfaces.nsIPKIParamBlock);
	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
    
	pkiParams.setISupportAtIndex(1, null);

	var certIdx = 1;

	if (scepClientPkcsReqParam.issuerX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.issuerX509Cert);
	}

	certIdx++;
	if (scepClientPkcsReqParam.scepRecipientX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.scepRecipientX509Cert);
	}
	else {
	    pkiParams.setISupportAtIndex(certIdx, null);
	}


	certIdx++;
	if (scepClientPkcsReqParam.userX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.userX509Cert);
	}
	else {
	    pkiParams.setISupportAtIndex(certIdx, null);
	}
    
	var strIdx = 0;
	if (scepClientPkcsReqParam.scepRecipientServerURL) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepRecipientServerURL);
	}

	dialogParams.SetInt(1, (scepClientPkcsReqParam.scepRecipientIsRA ? 1 : 0));

	strIdx++;
	if (scepClientPkcsReqParam.scepMessageType) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepMessageType);
	}

	strIdx++;
	if (scepClientPkcsReqParam.scepServerCAId) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepServerCAId);
	}

	strIdx++;
	if (scepClientPkcsReqParam.issuerSubjectDN) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.issuerSubjectDN);
	}

	strIdx++;
	if (scepClientPkcsReqParam.scepRecipientSubjectDN) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepRecipientSubjectDN);
	}

	strIdx++;
	if (scepClientPkcsReqParam.userSubjectDN) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.userSubjectDN);
	}

	strIdx++;
	if (scepClientPkcsReqParam.userChallengePW) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.userChallengePW);
	}

	strIdx++;
	if (scepClientPkcsReqParam.userX509CertAlias) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.userX509CertAlias);
	}

    	this.logTrace("CertEnrollScepWizard.getScepClientDialogParams():................End.");
	return  dialogParams;
    },

    getScepWizardParams : function (aScepClientParams)
    {
   	dump("CertEnrollScepWizard.getScepWizardParams(): aScepClientParams: " + aScepClientParams + "\n"); 

	if (!aScepClientParams) {
	    return null;
	}

	var scepClientPkcsReqParam = aScepClientParams;

	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
				.createInstance(Components.interfaces.nsIPKIParamBlock);
	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
    
	pkiParams.setISupportAtIndex(1, null);

	var certIdx = 1;
	if (scepClientPkcsReqParam.userX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.userX509Cert);
	}
	else {
	    pkiParams.setISupportAtIndex(certIdx, null);
	}

	certIdx++;
	if (scepClientPkcsReqParam.issuerX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.issuerX509Cert);
	}

	certIdx++;
	if (scepClientPkcsReqParam.scepRecipientX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.scepRecipientX509Cert);
	}
	else {
	    pkiParams.setISupportAtIndex(certIdx, null);
	}


	var strIdx = 0;
	if (scepClientPkcsReqParam.scepRecipientServerURL) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepRecipientServerURL);
	}

	dialogParams.SetInt(1, (scepClientPkcsReqParam.scepRecipientIsRA ? 1 : 0));

	strIdx++;
	if (scepClientPkcsReqParam.scepMessageType) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepMessageType);
	}

	strIdx++;
	if (scepClientPkcsReqParam.scepServerCAId) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepServerCAId);
	}

	/*
	strIdx++;
	if (scepClientPkcsReqParam.issuerSubjectDN) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.issuerSubjectDN);
	}

	strIdx++;
	if (scepClientPkcsReqParam.scepRecipientSubjectDN) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepRecipientSubjectDN);
	}

	strIdx++;
	if (scepClientPkcsReqParam.userSubjectDN) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.userSubjectDN);
	}

	strIdx++;
	if (scepClientPkcsReqParam.userChallengePW) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.userChallengePW);
	}
	*/

   	dump("CertEnrollScepWizard.getScepWizardParams(): strIdx: " + strIdx + "\n");

	return  dialogParams;
    },

    runScepClientBasicTool : function ()
    {
    	this.logTrace("CertEnrollScepWizard.runScepClientBasicTool():................Start.");

        var scepClientBasicURL = "chrome://keymanager/content/tools/scepclient/SCEPClientBasicTool.xul";

	var dialogParams = this.getScepClientDialogParams(this.mScepClientParams);
        window.openDialog(scepClientBasicURL,  "_blank",
                		'chrome,centerscreen,resizable=yes,dialog=no,titlebar,modal',
				dialogParams
				);

	var signedX509Cert = null;
	if (dialogParams.GetInt(0) == 1) {
	    var pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
            var x509Cert = null;
            if (pkiParams) {
                x509Cert = pkiParams.getISupportAtIndex(1);
                if (x509Cert) {
                    signedX509Cert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
                }
            }
	}

    	this.logDebug("CertEnrollScepWizard.runScepClientBasicTool(): signedX509Cert: " + signedX509Cert);
    	this.logTrace("CertEnrollScepWizard.runScepClientBasicTool():................End.");
	return signedX509Cert;
    },

    scepClientPageShow : function (aWizardPageElem, ev)
    {
    	this.logTrace("CertEnrollScepWizard.scepClientPageShow():................Start.");

	this.mEnrolledCert = null;
	var signedX509Cert = this.runScepClientBasicTool();

	this.mScepClientParams.userX509CertSigned = signedX509Cert;
	this.mEnrolledCert = signedX509Cert;

    	this.logTrace("CertEnrollScepWizard.scepClientPageShow():................End.");
    },

    scepClientPageAdvanced : function (aWizardPageElem, ev)
    {
    	this.logTrace("CertEnrollScepWizard.scepClientPageAdvanced():................Start.");
    	this.logTrace("CertEnrollScepWizard.scepClientPageAdvanced():................End.");
	return true;
    },

    caSignedCertViewPageShow : function (aWizardPageElem, ev)
    {
    	this.logTrace("CertEnrollScepWizard.caSignedCertViewPageShow():................Start.");

	CertEnrollViewSignedCert.setCASignedCert(this.mEnrolledCert);

    	this.logTrace("CertEnrollScepWizard.caSignedCertViewPageShow():................End.");
    },

    caSignedCertViewPageAdvanced : function (aWizardPageElem, ev)
    {
    	this.logTrace("CertEnrollScepWizard.caSignedCertViewPageAdvanced():................Start.");


    	this.logTrace("CertEnrollScepWizard.caSignedCertViewPageAdvanced():................End.");
	return true;
    },

    handleWizardFinish : function (aWizardElem)
    {
        this.logTrace("CertEnrollScepWizard.handleWizardFinish():...................Start.");

        if (!window.arguments || !window.arguments[0]) {
            this.logTrace("CertEnrollScepWizard.handleWizardFinish():...................End(0).");
	    return;
	}

        var pkiParams = null;
        var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
        try {
    	    pkiParams = window.arguments[0].QueryInterface(Components.interfaces.nsIPKIParamBlock);
        } catch (ex) { }
	if (this.mEnrolledCert) {
    	    pkiParams.setISupportAtIndex(1, this.mEnrolledCert);
    	    dialogParams.SetInt(0, 1); // Sucess
	}
	else {
    	    pkiParams.setISupportAtIndex(1, null);
    	    dialogParams.SetInt(0, 0); // Failure
	}

        this.logTrace("CertEnrollScepWizard.handleWizardFinish():...................End.");
        return true;
    },

    handleWizardCancel : function (aWizardElem)
    {
        this.logTrace("CertEnrollScepWizard.handleWizardCancel():...................Start.");

        if (!window.arguments || !window.arguments[0]) {
            this.logTrace("CertEnrollScepWizard.handleWizardCancel():...................End(0).");
	    return;
	}

        var dialogParams = null;
        dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	dialogParams.SetInt(0, 0); // Failure

        this.logTrace("CertEnrollScepWizard.handleWizardCancel():...................End.");
        return true;
    }

}

// CertEnrollScepWizard.init();

