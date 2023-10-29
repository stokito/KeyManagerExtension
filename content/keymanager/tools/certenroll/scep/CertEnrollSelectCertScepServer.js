/* @(#) $Id: CertEnrollSelectCertScepServer.js,v 1.7 2012/10/07 17:20:10 subrata Exp $ */

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


var CertEnrollSelectCertScepServer = {


    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,

    mDialogParams		: null,

    mCARAServerURLDefault : null,
    mCACapOverrideEnabled : false,
    mCACapOverrideValue : null,
    mHttpMethodFormPostEnabled : false,

    mScepServerCAId : null,
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
        this.logTrace("CertEnrollSelectCertScepServer.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = this.mTokenDB.getInternalKeyToken();
        } catch (ex) {}
	if (!token) {
            this.logTrace("CertEnrollSelectCertScepServer.loginToInternalToken():................End(0).");
	    return;
	}

	try {
            token.login(false);
            this.logTrace("CertEnrollSelectCertScepServer.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("CertEnrollSelectCertScepServer.loginToInternalToken():................End.");
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
    	this.logTrace("CertEnrollSelectCertScepServer.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = this.trim(aTextboxElem.value);
	}
        var formFieldKey = aTextboxElem.getAttribute("autocompletesearchparam");
	if (formFieldKey) {
	    this.textFieldAutoCompleteAction(aTextboxElem);
	}

    	this.logTrace("CertEnrollSelectCertScepServer.handleTextboxChange():................End.");
    },


    initXPComServiceInfo : function ()
    {
        this.logTrace("CertEnrollSelectCertScepServer.initXPComServiceInfo():................Start.");

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
    	    alert("CertEnrollSelectCertScepServer.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("CertEnrollSelectCertScepServer.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	// this.loginToInternalToken();

	this.logTrace("CertEnrollSelectCertScepServer.initXPComServiceInfo():................End.");
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
    	this.logTrace("CertEnrollSelectCertScepServer.initWithDefaultValues():................Start.");

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
	    	this.logDebug("CertEnrollSelectCertScepServer.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);

	/*
	gScepClientOverrideCACapEnabled = this.mCACapOverrideEnabled;
	gScepClientOverrideCACapValue = this.mCACapOverrideValue;
	gScepClientGetCACapFormPostEnabled = this.mHttpMethodFormPostEnabled;
	gScepClientGetCertInitialTestEnabled = this.mGetCertInitialTestEnabled;
	*/

    	this.logTrace("CertEnrollSelectCertScepServer.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	this.logTrace("CertEnrollSelectCertScepServer.initWithDialogParams():................Start.");
    	this.logTrace("CertEnrollSelectCertScepServer.initWithDialogParams():................End.");
    },

    setScepParamsInternal : function (aScepServerIsRA, aScepServerURL, aScepServerCAId, aScepServerCASubjectDN, aScepServerCACert, aScepServerRecipientSubjectDN, aScepServerRecipientCert) 
    {
    	this.logTrace("CertEnrollSelectCertScepServer.setScepParamsInternal():................Start.");

	this.mScepServerIsRAElem.checked = aScepServerIsRA;
	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);

	if (aScepServerURL) {
	    this.mScepServerURLElem.value = aScepServerURL;
	    this.handleScepServerURLChange(this.mScepServerURLElem);
	}
	if (aScepServerCAId) {
	    this.mScepServerCAIdElem.value = aScepServerCAId;
	    this.handleGetCACertCAIdChange(this.mScepServerCAIdElem);
	}

	if (aScepServerCASubjectDN) {
	    this.mScepServerCASubjectDNElem.value = aScepServerCASubjectDN;
	    this.handleCASubjectDNChange(this.mScepServerCASubjectDNElem);
	}
	    this.mScepServerCACertPickerElem.selectedCert = aScepServerCACert;
	    this.handleSCEPServerCACertPickerChange(this.mScepServerCACertPickerElem);
	/*
	if (aScepServerCACert) {
	}
	*/

	if (aScepServerRecipientSubjectDN) {
	    this.mScepServerRecipientSubjectDNElem.value = aScepServerRecipientSubjectDN;
	    this.handleSCEPRecipientSubjectDNChange(this.mScepServerRecipientSubjectDNElem);
	}

	    this.mScepServerRecipientCertPickerElem.selectedCert = aScepServerRecipientCert;
	    this.handleSCEPServerCACertPickerChange(this.mScepServerRecipientCertPickerElem);
	/*
	if (aScepServerRecipientCert) {
	}
	*/

    	this.logTrace("CertEnrollSelectCertScepServer.setScepParamsInternal():................End.");
    },

    setScepParams : function (aScepClientParams) 
    {
    	this.logTrace("CertEnrollSelectCertScepServer.setScepParams():................Start.");
    	this.logDebug("CertEnrollSelectCertScepServer.setScepParams():\n" + 
			"    scepRecipientServerURL: "	+ aScepClientParams.scepRecipientServerURL + "\n" + 
			"    scepRecipientIsRA: "	+ aScepClientParams.scepRecipientIsRA + "\n" + 
			"    scepServerCAId: "		+ aScepClientParams.scepServerCAId + "\n" + 
			"    scepRecipientSubjectDN: "	+ aScepClientParams.scepRecipientSubjectDN + "\n" + 
			"    scepRecipientX509Cert: "	+ aScepClientParams.scepRecipientX509Cert + "\n" + 
			"    issuerSubjectDN: "		+ aScepClientParams.issuerSubjectDN + "\n" + 
			"    issuerX509Cert: "		+ aScepClientParams.issuerX509Cert + "\n" + 
			"    issuerX509Cert.nickname: "	+ (aScepClientParams.issuerX509Cert ? aScepClientParams.issuerX509Cert.nickname : "null") + "\n" + 
			"");
	this.setScepParamsInternal(
			aScepClientParams.scepRecipientIsRA,
			aScepClientParams.scepRecipientServerURL,
			aScepClientParams.scepServerCAId,
			aScepClientParams.issuerSubjectDN,
			aScepClientParams.issuerX509Cert,
			aScepClientParams.scepRecipientSubjectDN,
			aScepClientParams.scepRecipientX509Cert
			);

    	this.logTrace("CertEnrollSelectCertScepServer.setScepParams():................End.");
    },

    getScepParams : function (aScepClientParams) 
    {
    	this.logTrace("CertEnrollSelectCertScepServer.getScepParams():................Start.");

	aScepClientParams.scepRecipientIsRA = this.mScepServerIsRAElem.checked;
	aScepClientParams.scepRecipientServerURL = this.mScepServerURLElem.value;
	aScepClientParams.scepServerCAId = this.mScepServerCAIdElem.value;

	if (this.mScepServerCACertPickerElem.selectedCert) {
	    aScepClientParams.issuerX509Cert = this.mScepServerCACertPickerElem.selectedCert;
	    aScepClientParams.issuerSubjectDN = aScepClientParams.issuerX509Cert.subjectName;
	}
	else {
	    aScepClientParams.issuerSubjectDN = this.mScepServerCASubjectDNElem.value;
	}

	if (this.mScepServerIsRAElem.checked) {
	    if (this.mScepServerRecipientCertPickerElem.selectedCert) {
	        aScepClientParams.scepRecipientX509Cert = this.mScepServerRecipientCertPickerElem.selectedCert;
	        aScepClientParams.scepRecipientSubjectDN = aScepClientParams.scepRecipientX509Cert.subjectName;
	    }
	    else {
	        aScepClientParams.scepRecipientSubjectDN = this.mScepServerRecipientSubjectDNElem.value;
	    }
	}
	else {
	    aScepClientParams.scepRecipientX509Cert = this.mScepServerCACertPickerElem.selectedCert;
	    if (aScepClientParams.scepRecipientX509Cert) {
	    	aScepClientParams.scepRecipientSubjectDN = aScepClientParams.scepRecipientX509Cert.subjectName;
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
                this.logError("CertEnrollSelectCertScepServer.getScepParams(): this.mKeyManager.findCASignedX509CertByCertSPKI() failed for " + aScepClientParams.userX509Cert.subjectName);
            }
        }
        this.logDebug("CertEnrollSelectCertScepServer.getScepParams(): signedX509Cert: " + signedX509Cert + "");
	aScepClientParams.userX509CertSigned = signedX509Cert;

    	this.logTrace("CertEnrollSelectCertScepServer.getScepParams():................End.");
    },

    initOnLoad : function (aWizardElem) 
    {
    	this.logTrace("CertEnrollSelectCertScepServer.initOnLoad():................Start.");

	this.mWizardElem = aWizardElem;

	if (window.arguments != 'undefined') {
    	this.logDebug("CertEnrollSelectCertScepServer.initOnLoad(): window.arguments: " + window.arguments);
        if (window.arguments && (window.arguments.length > 0) && window.arguments[0]) {
            var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    this.mDialogParams = dialogParams;
	}
	}
    	this.logTrace("CertEnrollSelectCertScepServer.initOnLoad():...................10.");

    	this.mScepServerIsRAElem		= document.getElementById('keymgr.certenroll.scep.page.selectcert.scepserver.isra');
    	this.mScepServerURLElem			= document.getElementById('keymgr.certenroll.scep.page.selectcert.scepserver.url');
    	this.mScepServerCAIdElem		= document.getElementById('keymgr.certenroll.scep.page.selectcert.scepserver.caid');

    	this.mScepServerCASubjectDNElem		= document.getElementById('keymgr.certenroll.scep.page.selectcert.scepserver.ca.subjectdn');
    	this.mScepServerCACertPickerElem	= document.getElementById('keymgr.certenroll.scep.page.selectcert.scepserver.ca.certpicker');

    	this.mScepServerRecipientCertRowElem	= document.getElementById('keymgr.certenroll.scep.page.selectcert.scepserver.recipient.cert.row');
    	this.mScepServerCertFilterWithCAElem	= document.getElementById('keymgr.certenroll.scep.page.selectcert.scepserver.recipient.filterwithca');
    	this.mScepServerRecipientSubjectDNElem	= document.getElementById('keymgr.certenroll.scep.page.selectcert.scepserver.recipient.subjectdn');
    	this.mScepServerRecipientCertPickerElem	= document.getElementById('keymgr.certenroll.scep.page.selectcert.scepserver.recipient.certpicker');

	this.mScepServerCACertPickerElem.refresh();
	this.mScepServerRecipientCertPickerElem.refresh();

	this.mScepServerURL		= null;
	this.mScepServerRecipientIsRA	= false;
	this.mScepServerCACert		= null;
	this.mScepServerRecipientCert		= null;

	this.initXPComServiceInfo();

	this.initWithDefaultValues();
	this.initWithDialogParams();

	this.handleScepServerURLChange(this.mScepServerURLElem);
	this.handleGetCACertCAIdChange(this.mScepServerCAIdElem);
	this.handleSCEPServerCACertPickerChange(this.mScepServerCACertPickerElem);
	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);

    	this.logTrace("CertEnrollSelectCertScepServer.initOnLoad():................End.");
    },

    valdiateSCEPParams : function()
    {
    	this.logTrace("CertEnrollSelectCertScepServer.valdiateSCEPParams():................Start.");

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

	    pageIsValid = true;
	} while (0);
	this.mWizardElem.canAdvance = pageIsValid;
    	this.logTrace("CertEnrollSelectCertScepServer.valdiateSCEPParams():................End.");
	return pageIsValid;
    },


    handleScepServerURLChange : function (aScepServerURLElem, ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.handleScepServerURLChange():...................Start.");

	this.handleTextboxChange(aScepServerURLElem);

	// create an nsIURI
	var scepServerURL = aScepServerURLElem.value;
	if (scepServerURL != "") {
	    var uri = null;
	    try {
	        uri = this.mIOService.newURI(scepServerURL, null, null);
	        this.mScepServerURL = scepServerURL;
	    } catch (ex) {
	        alert("Badly formatted URL: " + scepServerURL + " - ex:" + ex);
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

    	this.logTrace("CertEnrollSelectCertScepServer.handleScepServerURLChange():...................End.");
    },

    handleScepServerIsRAChange : function(aScepServerIsRAElem, ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.handleScepServerIsRAChange():...................Start.");

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

    	this.logDebug("CertEnrollSelectCertScepServer.handleScepServerIsRAChange(): certType: " + certType + " certUsage: " + certUsage + " cadn: " + cadn + "");
    	this.mScepServerRecipientCertPickerElem.initWithParams(certType, certUsage, cadn, selectedCert);
    	this.handleScepServerRecipientCertPickerChange(this.mScepServerRecipientCertPickerElem);

    	this.logTrace("CertEnrollSelectCertScepServer.handleScepServerIsRAChange():...................End.");
    },

    handleGetCACertCAIdChange : function (aScepServerCAIdElem, ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.handleGetCACertCAIdChange():...................Start.");

	this.handleTextboxChange(aScepServerCAIdElem);
	this.mScepServerCAId = aScepServerCAIdElem.value;
	if (this.mScepServerCAId == "") {
	    this.mScepServerCAId = "DummyCA";
	}

	this.valdiateSCEPParams();

    	this.logTrace("CertEnrollSelectCertScepServer.handleGetCACertCAIdChange():...................End.");
    },

    scepGetCARACert : function (aScepGetCACertMsgType)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.scepGetCARACert():...................Start.");

    	var scepGetCACertMsgType = "GetCACert";
	if (aScepGetCACertMsgType) {
	    scepGetCACertMsgType = aScepGetCACertMsgType;
	}
	var scepServerCAId = this.mScepServerCAId;
	if (!scepServerCAId) {
	    scepServerCAId = "XXXXX";
	}

    	var scepServerObj = {
    	    scepServerURL		: this.mScepServerURL,
    	    scepServerURLDestIsRA	: this.mScepServerRecipientIsRA,
    	    scepServerCAId		: scepServerCAId,
    	    scepServerCACert		: null,
    	    scepServerCert		: null,
    	    userCert			: null,
	    scepServerUserChallengePW 	: null,
    	    scepMsgType			: scepGetCACertMsgType,
    	    scepMsgPKCS10CSR		: null,
	    scepServerHttpMethod	: "GET",
	    scepMsgHashAlg		: "SHA1", // MD5, SHA1, SHA256, SHA512
    	    scepMsgTransactionId	: null,
    	    scepMsgReqPKCS7		: null,
    	    scepMsgRespPKCS7		: null,
    	    scepMsgRespStatus		: null,
    	    scepMsgRespOutFilePicker	: null,
    	    scepMsgRespOutFileBase64	: true,
    	    caSignedUserCert		: null,
    	    };

	/*
	if (this.mScepServerRecipientIsRA) {
    	    scepGetCACertMsgType = "GetCARACert";
	}
	*/
	scepServerObj.scepMsgType = scepGetCACertMsgType;

	if (!scepServerObj.scepServerCAId) {
	    scepServerObj.scepServerCAId = "XXXXX";
	}

	window.setCursor('wait');

	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	jsSCEPClient.scepGetCACertChain();
	scepServerObj.scepRespCBFunc = CertEnrollScepRespCBFunc;

	window.setCursor('auto');

    	this.logDebug("CertEnrollSelectCertScepServer.scepGetCARACert(): scepServerCACert: " + (scepServerObj.scepServerCACert?scepServerObj.scepServerCACert.nickname:'null'));
    	this.logDebug("CertEnrollSelectCertScepServer.scepGetCARACert(): scepServerCert: " + (scepServerObj.scepServerCert?scepServerObj.scepServerCert.nickname:'null'));

    	this.logTrace("CertEnrollSelectCertScepServer.scepGetCARACert():...................End.");
    },

    scepGetCACert : function (ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.scepGetCACert():...................Start.");

    	var scepGetCACertMsgType = "GetCACert";
	this.scepGetCARACert(scepGetCACertMsgType);

    	this.logTrace("CertEnrollSelectCertScepServer.scepGetCACert():...................End.");
    },

    scepGetRACert : function (ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.scepGetCACert():...................Start.");

    	var scepGetCACertMsgType = "GetCARACert";
	this.scepGetCARACert(scepGetCACertMsgType);

    	this.logTrace("CertEnrollSelectCertScepServer.scepGetCACert():...................End.");
    },

    scepGetCACertChain : function (ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.scepGetCACertChain():...................Start.");

	if (ev) {
	   ev.stopPropagation();
	}

    	var scepGetCACertMsgType = "GetCACert";
	if (this.mScepServerRecipientIsRA) {
    	    scepGetCACertMsgType = "GetCARACert";
	}
	this.scepGetCARACert(scepGetCACertMsgType);
    },

    scepGetCACapabilities : function (ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.scepGetCACapabilities():...................Start.");
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

	window.setCursor('wait');
	var jsSCEPClient = new JsSCEPClient(scepServerObj);
	var scepCACapabilities = jsSCEPClient.scepGetCACapabilities();
	window.setCursor('auto');

	if (!scepCACapabilities) {
	    alert("Failed to get Capabilities.\n");
	    return;
	}
	if (scepCACapabilities.srcDoc) {
    	    this.logDebug("CertEnrollSelectCertScepServer.scepGetCACapabilities(): scepCACapabilities.srcDoc: " + scepCACapabilities.srcDoc);
	    alert("SCEP CA Capabilities:\n" + scepCACapabilities.srcDoc + "\n");
	}


    	this.logTrace("CertEnrollSelectCertScepServer.scepGetCACapabilities():...................End.");
    },

    formatSubjectDN : function (aTargetSubjectDNElemId, ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.formatSubjectDN():..................Start.");

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
	
    	this.logTrace("CertEnrollSelectCertScepServer.formatSubjectDN():..................End.");
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
    	this.logTrace("CertEnrollSelectCertScepServer.handleCASubjectDNChange():...................Start.");

	this.handleTextboxChange(aCASubjectDNElem);

	// Initialize certpicker for CA with the correcponding X.609 cert for the subject.
    	var x509Cert = this.findX509CertBySubjectDN(aCASubjectDNElem.value);
	this.mScepServerCACertPickerElem.selectedCert = x509Cert;
	this.handleSCEPServerCACertPickerChange(this.mScepServerCACertPickerElem);

    	this.logTrace("CertEnrollSelectCertScepServer.handleCASubjectDNChange():...................End.");
    },

    formatCASubjectDN : function (ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.formatCASubjectDN():..................Start.");

    	var targetSubjectDNElemId = 'keymgr.certenroll.scep.page.selectcert.scepserver.ca.subjectdn';

    	var targetSubjectDNElem = document.getElementById(targetSubjectDNElemId);
	this.formatSubjectDN(targetSubjectDNElemId, ev);
	this.handleCASubjectDNChange(this.mCASubjectDNElem);

    	this.logTrace("CertEnrollSelectCertScepServer.formatCASubjectDN():..................End.");
    },

    handleSCEPServerCACertPickerChange : function(aScepServerCACertPickerElem, ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.handleSCEPServerCACertPickerChange():...................Start.");

    	if (!aScepServerCACertPickerElem.selectedCert) {
	    this.mScepServerRecipientCertPickerElem.selectedCert = null;
	    return;
	}

	this.mScepServerCACert		= this.mScepServerCACertPickerElem.selectedCert;

	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);

    	this.logTrace("CertEnrollSelectCertScepServer.handleSCEPServerCACertPickerChange():...................End.");
    },

    handleScepServerCertFilterWithCAChange : function(aScepServerIsRAElem, ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.handleScepServerCertFilterWithCAChange():...................Start.");

	this.handleScepServerIsRAChange(this.mScepServerIsRAElem);

    	this.logTrace("CertEnrollSelectCertScepServer.handleScepServerCertFilterWithCAChange():...................End.");
    },

    handleSCEPRecipientSubjectDNChange : function (aSCEPRecipientSubjectDNElem, ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.handleSCEPRecipientSubjectDNChange():...................Start.");

	this.handleTextboxChange(aSCEPRecipientSubjectDNElem);

	// Initialize certpicker for CA with the correcponding X.609 cert for the subject.
    	var x509Cert = this.findX509CertBySubjectDN(aSCEPRecipientSubjectDNElem.value);
	this.mScepServerRecipientCertPickerElem.selectedCert = x509Cert;
	this.handleScepServerRecipientCertPickerChange(this.mScepServerRecipientCertPickerElem);

    	this.logTrace("CertEnrollSelectCertScepServer.handleSCEPRecipientSubjectDNChange():...................End.");
    },

    formatSCEPRecipientSubjectDN : function (ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.formatSCEPRecipientSubjectDN():..................Start.");

    	var targetSubjectDNElemId = 'keymgr.certenroll.scep.page.selectcert.scepserver.recipient.subjectdn';
    	var targetSubjectDNElem = document.getElementById(targetSubjectDNElemId);
	this.formatSubjectDN(targetSubjectDNElemId, ev);
	this.handleSCEPRecipientSubjectDNChange(this.mCASubjectDNElem);


    	this.logTrace("CertEnrollSelectCertScepServer.formatSCEPRecipientSubjectDN():..................End.");
    },

    handleScepServerRecipientCertPickerChange : function(aScepServerCertPickerElem, ev)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.handleScepServerRecipientCertPickerChange():...................Start.");

	this.mScepServerRecipientCert		= this.mScepServerRecipientCertPickerElem.selectedCert;

	this.valdiateSCEPParams();

    	this.logTrace("CertEnrollSelectCertScepServer.handleScepServerRecipientCertPickerChange():...................End.");
    },

    scepRespCBFunc : function (aScepMsgType, aImportedX509Cert, aImportedCertType)
    {
    	this.logTrace("CertEnrollSelectCertScepServer.scepRespCBFunc():...................Start.");

	if (!aImportedX509Cert) {
    	    this.logTrace("CertEnrollSelectCertScepServer.scepRespCBFunc():...................End(0).");
	    return;
	}
	this.logDebug("CertEnrollSelectCertScepServer.scepRespCBFunc(): aScepMsgType: " + aScepMsgType);
	this.logDebug("CertEnrollSelectCertScepServer.scepRespCBFunc(): aImportedX509Cert: " + aImportedX509Cert.nickname);
	this.logDebug("CertEnrollSelectCertScepServer.scepRespCBFunc(): aImportedCertType: " + aImportedCertType);
        switch(aScepMsgType) {
	    case "PKCSReq" : 
		if (aImportedCertType == Components.interfaces.nsIX509Cert.USER_CERT) {
	    	    this.mCASignedCertItemElem.cert = aImportedX509Cert;
		}
	    	break;
	    case "GetCACert" : 
		if (aImportedCertType == Components.interfaces.nsIX509Cert.CA_CERT) {
	    	    this.mScepServerCACertPickerElem.selectedCert = aImportedX509Cert;
	    	    this.handleSCEPServerCACertPickerChange(this.mScepServerCACertPickerElem);
		}
	    	break;
	    case "GetCARACert" : 
		if (aImportedCertType == Components.interfaces.nsIX509Cert.CA_CERT) {
	    	    this.mScepServerCACertPickerElem.selectedCert = aImportedX509Cert;
	    	    this.handleSCEPServerCACertPickerChange(this.mScepServerCACertPickerElem);
		    break;
		}
		if (aImportedCertType == Components.interfaces.nsIX509Cert.SERVER_CERT) {
	    	    this.mScepServerRecipientCertPickerElem.selectedCert = aImportedX509Cert;
    	    	    this.handleScepServerRecipientCertPickerChange(this.mScepServerRecipientCertPickerElem);
		    break;
		}
	    	break;
	    default:
		this.logError("CertEnrollSelectCertScepServer.scepRespCBFunc(): INVALID aScepMsgType: " + aScepMsgType);
	    	break;
	}

    	this.logTrace("CertEnrollSelectCertScepServer.scepRespCBFunc():...................End.");
    },

    lastMethod : function () 
    {
    }
}


function CertEnrollScepRespCBFunc (aScepMsgType, aImportedX509Cert, aImportedCertType)
{
    CertEnrollSelectCertScepServer.scepRespCBFunc(aScepMsgType, aImportedX509Cert, aImportedCertType);
}

