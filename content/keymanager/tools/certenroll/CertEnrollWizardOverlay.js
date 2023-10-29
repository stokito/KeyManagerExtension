/* @(#) $Id: CertEnrollWizardOverlay.js,v 1.20 2012/10/07 17:20:03 subrata Exp $ */

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

// const wzUploadCSRAndSignCertResultIFrameId = "WizardUploadCSRAndSignCertResultIFrame";
const wzUploadFileFormId = "WizardUploadCSRAndSignCertForm";
const wzUploadFormFileItemId = "Pkcs10CSRFile";

//class constructor
function avpki.keymanager.CAServerEnrollmentInfo(aServerType, aCertEnrollPrefPrefixId) {
    this.mServerType = aServerType;

    this.loadCAServerURL(aCertEnrollPrefPrefixId);

};

//class definition
avpki.keymanager.CAServerEnrollmentInfo.prototype = {

    mMaxLogLevel : 2,
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

    mDefaultPrefBranchPrefixId: "extensions.avpki.certenroll.",
    mPrefBranchPrefixId: "extensions.avpki.certenroll.",
    mServerType: null,
    mServerEnrollURL: null,
    mNeedsLogin: false,
    mServerLoginURL: null,
    mCASubjectDN: null,
    mCAX509Cert: null,
    mDownloadCertChainURL: null,
    mDownloadSignedCertURL: null,

    loadCAServerURL : function (aPrefBranchPrefixId)
    {
        this.logTrace("CAServerEnrollmentInfo.loadCAServerURL()...................Start.");

        if (!this.mServerType) {
    	    return;
        }

	if (aPrefBranchPrefixId) {
	    this.mPrefBranchPrefixId = aPrefBranchPrefixId;
	}
	else {
	    this.mPrefBranchPrefixId = this.mDefaultPrefBranchPrefixId;
	}
        var prefBranchPrefixId = this.mPrefBranchPrefixId + "ca.server." + this.mServerType + ".";
	this.logDebug("CAServerEnrollmentInfo.loadCAServerURL(): prefBranchPrefixId: " + prefBranchPrefixId + "");

        var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
        var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
        if (!prefsBranch) {
            this.logTrace("CAServerEnrollmentInfo.loadCAServerURL()...................End(1).");
    	    return;
        }

        var prefStrValue = null;
        var prefBoolValue = false;
        try {
            prefStrValue = prefsBranch.getCharPref("enrollURL");
	    if (prefStrValue && (prefStrValue != "")) {
	        this.mServerEnrollURL = prefStrValue;
	    }
        } catch (e) {
    	    // nothing
        }
        try {
            prefStrValue = prefsBranch.getCharPref("subject");
	    if (prefStrValue && (prefStrValue != "")) {
	        this.mCASubjectDN = prefStrValue;
	    }
        } catch (e) {
    	    // nothing
        }

        try {
            prefBoolValue = prefsBranch.getBoolPref("login");
	    if (prefBoolValue) {
	        this.mNeedsLogin = true;
	    }
        } catch (e) {
	    this.mNeedsLogin = true;
	}

        try {
            prefStrValue = prefsBranch.getCharPref("loginURL");
	    if (prefStrValue && (prefStrValue != "")) {
	        this.mServerLoginURL = prefStrValue;
	    }
        } catch (e) {
        }
        try {
            prefStrValue = prefsBranch.getCharPref("dnldCertChainURL");
	    if (prefStrValue && (prefStrValue != "")) {
	        this.mDownloadCertChainURL = prefStrValue;
	    }
        } catch (e) {
    	    // nothing
        }
        try {
            prefStrValue = prefsBranch.getCharPref("dnldSignedCertURL");
	    if (prefStrValue && (prefStrValue != "")) {
	        this.mDownloadSignedCertURL = prefStrValue;
	    }
        } catch (e) {
    	    // nothing
        }
	this.dumpCertEnrolInfo();

    	this.initCAServerLoginURL("wizard");
	// this.dumpCertEnrolInfo();

        this.logTrace("CAServerEnrollmentInfo.loadCAServerURL()...................End.");
    },

    initCAServerLoginURL : function (aReqSrcType)
    {
        this.logTrace("CAServerEnrollmentInfo.initCAServerLoginURL()...................Start.");
        if (!this.mServerEnrollURL || (this.mServerEnrollURL == "")) {
	    alert("mServerEnrollURL  is missing.");
    	    return null;
        }

        var urlItems = this.mServerEnrollURL.split("/"); 
        var caServerHomeURL = urlItems[0] + "//" + urlItems[2] + "/" + urlItems[3];

        if (this.mServerType == "pkcs10CA") {
            if (urlItems.length < 4) {
	        alert("Badly formatted caServer CertSign URL.");
	        return null;
            }

	    var caServerLoginURL = this.mServerLoginURL;
	    if (!caServerLoginURL) {
    	    	caServerLoginURL = caServerHomeURL + "/login/";
	    }
            if (aReqSrcType != null) {
    	        caServerLoginURL += "?reqSrcType=" + aReqSrcType;
            }
	    this.mServerLoginURL = caServerLoginURL;

	    /*
	    if (!this.mDownloadCertChainURL) {
	    }
	    */
            this.mDownloadCertChainURL = caServerHomeURL + "/pki/pkcs10/getCACertChain.jsp";

	    if (!this.mDownloadSignedCertURL) {
	    	this.mDownloadSignedCertURL = caServerHomeURL;
	    }
        }
        else if (this.mServerType == "msCertService") {
            var caServerBaseURL = caServerHomeURL;
            for (var i = 4; i < (urlItems.length -1); i++) {
    	        caServerBaseURL += "/" + urlItems[i];
            }
	    if (!this.mServerLoginURL) {
            	this.mServerLoginURL = caServerBaseURL + "/certrqxt.asp";
	    }
	    if (!this.mDownloadCertChainURL) {
            	this.mDownloadCertChainURL = caServerBaseURL + "/certcarc.asp";
	    }
	    if (!this.mDownloadSignedCertURL) {
	    	this.mDownloadSignedCertURL = caServerBaseURL + "/certckpn.asp";
	    }
        }
        else if (this.mServerType == "simpleCA") {
	}
        else {
   	    alert("CA Services : " + this.mServerType + " is not supported yet.");
	    return null;
        }
	this.dumpCertEnrolInfo();
        this.logTrace("CAServerEnrollmentInfo.initCAServerLoginURL()...................End.");
    },

    dumpCertEnrolInfo : function ()
    {
	dump( "CertEnrolInfo:\n" + 
		"\tmServerType: "	+ this.mServerType + "\n" + 
		"\tmServerEnrollURL: "	+ this.mServerEnrollURL + "\n" + 
		"\tmCASubjectDN: "	+ this.mCASubjectDN + "\n" + 
		"\tmNeedsLogin: "	+ this.mNeedsLogin + "\n" + 
		"\tmServerLoginURL: "	+ this.mServerLoginURL + "\n" + 
		"\tmDownloadCertChainURL: " + this.mDownloadCertChainURL + "\n" + 
		"\tmDownloadSignedCertURL: " + this.mDownloadSignedCertURL + "\n" + 
		"");
    }
}

avpki.keymanager.CertEnrollWizardOverlay = {

    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* alrIKeyManager	*/ mKeyManager : null,
    /* alrIKeyManager	*/ mSoftTokenDBManager : null,

    mMaxLogLevel : 2,
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
	// this.mMaxLogLevel = 9;
        this.logTrace("CertEnrollWizardOverlay.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = this.mTokenDB.getInternalKeyToken();
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
	    	this.logDebug("CertEnrollWizardOverlay.loginToInternalToken():  ex: " + ex);
	    }

	} while (0);

	if (testOption && testPassword) {
	    this.mTestMode = testOption;
            /**********************************************/
            /* TODO:  TEST CODE - remove after test phase */
            /**********************************************/
            if (this.mTestMode) {
        	var tokenPassword = testPassword;
		try {
                    token.checkPassword(tokenPassword);
		} catch (ex) {}
	    }
	}

	try {
            token.login(false);
            this.logTrace("CertEnrollWizardOverlay.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("CertEnrollWizardOverlay.loginToInternalToken():................End.");
	// this.mMaxLogLevel = 4;
	return;
    },

    loginToCertToken : function (aCert, force)
    {
    	var keyTokenName = "" + aCert.tokenName;
    	var xTokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"].
    			getService(Components.interfaces.nsIPK11TokenDB);
    	var /* nsIPK11Token */ token = xTokendb.findTokenByName(keyTokenName);
    	if (token == null) {
	    return;
    	}
    	var forceLogin = ((force == null) ? false : force);
    	token.login(forceLogin);
    },


    initXPComServiceInfo : function ()
    {
        this.logTrace("CertEnrollWizardOverlay.initXPComServiceInfo():................Start.");

        try {
    	    this.mIOService = Components.classes["@mozilla.org/network/io-service;1"]
		    		.getService(Components.interfaces.nsIIOService);
	    this.mDirService = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties);
	    this.mX509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
	                        .getService(Components.interfaces.nsIX509CertDB);
	    this.mKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
	                        .getService(Components.interfaces.alrIKeyManager);
	    this.mSoftTokenDBManager = Components.classes["@avaya.com/pkm/softtokendbmanager;1"]
	                        .getService(Components.interfaces.alrISoftTokenDBManager);
        } catch (ex) {
    	    alert("CertEnrollWizardOverlay.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("CertEnrollWizardOverlay.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	this.logTrace("CertEnrollWizardOverlay.initXPComServiceInfo():................End.");
    },


    mPageInitialized: false,

    mCAServerDefaultType: null,

    initDefaultCertEnrollInfo  : function (aCertEnrollPrefPrefixId)
    {
	if (this.mPageInitialized) {
	    return;
	}
	this.mPageInitialized = true;

        this.logTrace("CertEnrollWizardOverlay.initDefaultCertEnrollInfo()...................Start.");

	this.initXPComServiceInfo();

        var prefBranchPrefixId = aCertEnrollPrefPrefixId;
	if (!prefBranchPrefixId) {
	    prefBranchPrefixId = "extensions.avpki.certenroll.";
	}
	prefBranchPrefixId += "ca.server.";  
	this.logDebug("CertEnrollWizardOverlay.initDefaultCertEnrollInfo(): prefBranchPrefixId: " + prefBranchPrefixId + "");

	var formCAServerDefaultType = null;
        var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
        var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
        if (prefsBranch) {
            try {
                var prefStrValue = prefsBranch.getCharPref("type");
	        if (prefStrValue && (prefStrValue != "")) {
	            formCAServerDefaultType = prefStrValue;
	        }
            } catch (e) { }
	}
	this.logDebug("CertEnrollWizardOverlay.initDefaultCertEnrollInfo(): formCAServerDefaultType: " + formCAServerDefaultType + "");
        if (!formCAServerDefaultType) {
    	    formCAServerDefaultType = "pkcs10CA";
        }
	this.mCAServerDefaultType = formCAServerDefaultType;

        this.logTrace("CertEnrollWizardOverlay.initDefaultCertEnrollInfo()...................End.");
    },


    generateSelfSignedCertPageShow : function (aWizardPageElem)
    {
        this.logTrace("CertEnrollWizardOverlay.generateSelfSignedCertPageShow():...................Start.");

	this.mWizardPageElem = aWizardPageElem;
	this.mWizardElem = aWizardPageElem.parentNode;

	var certEnrollPrefPrefixId = this.mWizardElem.getAttribute("certEnrollPrefPrefixId");
	this.initDefaultCertEnrollInfo(certEnrollPrefPrefixId);

        var certProfileFilePickerElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.outfile.path");
        this.logDebug("CertEnrollWizardOverlay.generateSelfSignedCertPageShow(): profileType: " + this.mWizardElem.profileType + "");

        var pkcs10CsrFormElem = document.getElementById("keymgr.certenroll.wizard.csr.form");

	if (this.mWizardElem.profileType) {
            pkcs10CsrFormElem.setAttribute("profile", this.mWizardElem.profileType);
	}

	if (this.mWizardElem.profileType == "certificate") {
	    if (this.mWizardElem.profileX509Cert) {
	    	pkcs10CsrFormElem.profilecert = this.mWizardElem.profileX509Cert;
		pkcs10CsrFormElem.setAttribute("profilecertsubject", true);
		pkcs10CsrFormElem.setAttribute("profilecertspki", true);
		pkcs10CsrFormElem.setAttribute("profilecertx509v3extns", false);
	    }
	}
	else if (this.mWizardElem.profileType == "xmldoc") {
	    if (this.mWizardElem.profileXmlData) {
	    	pkcs10CsrFormElem.profilexmldata = this.mWizardElem.profileXmlData;
	    }
	}
	else if (this.mWizardElem.profileType == "custom") {
            this.logDebug("CertEnrollWizardOverlay.generateSelfSignedCertPageShow(): certProfileFilePath: " + certProfileFilePickerElem.filepath + "");
            this.logDebug("CertEnrollWizardOverlay.generateSelfSignedCertPageShow(): certProfileFile: " + certProfileFilePickerElem.file + "");
	    if (certProfileFilePickerElem.file) {
                pkcs10CsrFormElem.customProfilePath = certProfileFilePickerElem.filepath;
	    }
	}
	if (this.mWizardElem.profileType) {
	    pkcs10CsrFormElem.profile = this.mWizardElem.profileType;
	}

        pkcs10CsrFormElem.initForNewSelfSignedCert();
        this.logDebug("CertEnrollWizardOverlay.generateSelfSignedCertPageShow(): this.mWizardElem.certCommonName: " + this.mWizardElem.certCommonName + "");
	if (this.mWizardElem.profileType == "certificate") {
	    if (this.mWizardElem.certCommonName) {
	    	var certProps = Components.classes["@mozilla.org/persistent-properties;1"]
			.createInstance(Components.interfaces.nsIPersistentProperties);
	    	certProps.setStringProperty("name", this.mWizardElem.certCommonName);
		var certNameItems = this.mWizardElem.certCommonName.split(" ");
		var certNickName = certNameItems[0];
	    	certProps.setStringProperty("nickName", certNickName);
		pkcs10CsrFormElem.updateX509v1CertParam(certProps);
	    }
	}
    

        this.mWizardElem.canAdvance = true;

        this.logTrace("CertEnrollWizardOverlay.generateSelfSignedCertPageShow():...................End.");
    },

    generateSelfSignedCert : function ()
    {
        this.logTrace("CertEnrollWizardOverlay.generateSelfSignedCert().........Start.");

        var pkcs10CsrFormElem = document.getElementById("keymgr.certenroll.wizard.csr.form");

        var aCertProps = Components.classes["@mozilla.org/persistent-properties;1"].
	                createInstance(Components.interfaces.nsIPersistentProperties);
        if (aCertProps == null) {
	    alert("generateSelfSignedCert(): generation of Self-Sign cert failed - invalid form fields.");
	    return null;
        }
        pkcs10CsrFormElem.toCertProps(aCertProps);
        pkcs10CsrFormElem.dumpProperties(aCertProps, "GenerateNewSelfSignedCert");

        var tokenMenuListElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.tokenMenuList");
        var /* nsIPK11Token */ seletedToken = tokenMenuListElem.token;
        if (seletedToken == null) {
	    alert("No Security device is selected.");
    	    return null;
        }
        seletedToken.login(false);

        this.logTrace("CertEnrollWizardOverlay.generateSelfSignedCert(): ........1.");

        var alias = null;
        var subjectDN = null;
        try {
	    alias = aCertProps.getStringProperty("nickName");
	    subjectDN = aCertProps.getStringProperty("subject");
        } catch (ex) {}
        if ((!alias) || (!subjectDN)) {
	    alert("generateSelfSignedCert(): generation of Self-Sign cert failed - alias/subject field is not initialized.");
	    return null;
        }

        var x509Cert = null;
        try {
	    x509Cert = this.mKeyManager.findCertBySubject(subjectDN);
        } catch (ex) {x509Cert = null;}

        if (x509Cert) {
	    alert("generateSelfSignedCert(): chosen alias/subject: " + alias + "/" + subjectDN + " already exists in the certificate  database.");
	    return null;
        }

        var /* nsIX509 */ newCert = null;
        try {
	    newCert = this.mKeyManager.generateKeyAndImportSelfSignCertByForm(
	                        seletedToken,
	                        alias,
	                        subjectDN,
	                        aCertProps
	                        );
        } catch (ex) {
	    alert("generateSelfSignedCert(): generation of Self-Sign cert failed - " + ex);
	    this.logTrace("CertEnrollWizardOverlay.generateSelfSignedCert(): generation of Self-Sign cert failed - " + ex + "");
	    return null;
        }
        this.logTrace("CertEnrollWizardOverlay.generateSelfSignedCert(): newCert: " + newCert + "");

        this.logTrace("CertEnrollWizardOverlay.generateSelfSignedCert():.........End.");
        return newCert;
    },

    generateSelfSignedCertPageAdvanced : function (aWizardPageElem)
    {
        this.logTrace("CertEnrollWizardOverlay.generateSelfSignedCertPageAdvanced():.........Start.");

        var x509Cert = this.generateSelfSignedCert();
        this.logDebug("CertEnrollWizardOverlay.generateSelfSignedCertPageAdvanced(): x509Cert: " + x509Cert + "");

        var x509CertItemElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.usercert");
        x509CertItemElem.cert = x509Cert;
        if (!x509Cert) {
    	    this.logError("CertEnrollWizardOverlay.generateSelfSignedCertPageAdvanced(): generateSelfSignedCert() failed.");
    	    return false;
        }

        // aWizardPageElem.parentNode.canAdvance = true;

        this.logTrace("CertEnrollWizardOverlay.generateSelfSignedCertPageAdvanced():.........End.");
        return true;
    },

    textboxAutoCompleteAction : function (aSrcTextBoxElem, ev)
    {
        var formFieldKey = aSrcTextBoxElem.id;
	if (!formFieldKey) {
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
    },

    caServerFieldAutoCompleteAction : function (aSrcTextBoxElem, ev)
    {
        this.textboxAutoCompleteAction(aSrcTextBoxElem, ev);
    },

    setFormCAServerInfo : function (caServerType, caServerURL)
    {
        this.logTrace("CertEnrollWizardOverlay.setFormCAServerInfo().......................Start.");

        // alert("setFormCAServerInfo(" + caServerType + ", " + caServerURL + ")");
	//
        var formCAServerTypeElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.type");

	var formCAServerTypeItemId = formCAServerTypeElem.id + "." + caServerType;
        var formCAServerTypeSelectedItemElem = document.getElementById(formCAServerTypeItemId);
        if (!formCAServerTypeSelectedItemElem) {
    	    this.logError("CertEnrollWizardOverlay.setFormCAServerInfo(): couldn't find element : " + formCAServerTypeItemId + "");
	    return;
        }
	formCAServerTypeElem.selectedItem = formCAServerTypeSelectedItemElem;

        var caServerCertSignURLElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.serverURL");
        caServerCertSignURLElem.value = caServerURL;

	this.handleCAServerURLChange(caServerCertSignURLElem);
        this.logTrace("CertEnrollWizardOverlay.setFormCAServerInfo().......................End.");
    },

    loginToCAServerPageShow : function (aWizardPageElem)
    {
        this.logTrace("CertEnrollWizardOverlay.loginToCAServerPageShow().......................Start.");

	this.mWizardPageElem = aWizardPageElem;
	this.mWizardElem = aWizardPageElem.parentNode;
        this.mWizardElem.canAdvance = false;

	var certEnrollPrefPrefixId = this.mWizardElem.getAttribute("certEnrollPrefPrefixId");
	this.initDefaultCertEnrollInfo(certEnrollPrefPrefixId);

	if (this.mWizardElem.certEnrollType) {
	    this.mCAServerDefaultType = this.mWizardElem.certEnrollType;
	}

        var x509CertItemElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.usercert");
        var x509Cert = x509CertItemElem.cert;

        if (!x509Cert) {
    	    this.logError("CertEnrollWizardOverlay.loginToCAServerPageShow(): NULL x509Cert.");
    	    return false;
        }
        var nickName = x509Cert.nickname;

        var prodCertCSRFilePickerElem	= document.getElementById("keymgr.certenroll.form.csrFile.path"); 

	var encodingType = "der";
	if (prodCertCSRFilePickerElem.ascii) {
	    encodingType = "base64";
	}

	var prodCertCSRFileFileName = null;
    	var csrFileNamePrefix = this.adaptNickName(x509Cert);
	if (csrFileNamePrefix) {
	    prodCertCSRFileFileName = csrFileNamePrefix + "_pkcs10_csr_" + encodingType + ".p10";
	}
    	this.logDebug("CertEnrollWizardOverlay.loginToCAServerPageShow(): prodCertCSRFileFileName: " + prodCertCSRFileFileName + "");
        prodCertCSRFilePickerElem.autoSelectTempFile("KeyManager/CertEnroll", prodCertCSRFileFileName);

        var csrOutFile = prodCertCSRFilePickerElem.file;
        if (!csrOutFile) {
    	    this.logError("CertEnrollWizardOverlay.loginToCAServerPageShow(): autoSelectTempFile() failed.");
    	    return false;
        }

        try {
    	    // Force token login - on windows the popup window for password is not coming up
    	    this.loginToCertToken(x509Cert);
	    var csrReqGenStatus = this.mKeyManager.generatePKCS10CSRByX509CertToFile(
	                                x509Cert,
	                                null,
	                                prodCertCSRFilePickerElem.ascii,
	                                csrOutFile
	                                );
	    prodCertCSRFilePickerElem.refresh();

        } catch (ex) {
	    alert("loginToCAServerPageShow(): keyManager.generatePKCS10CSRByX509CertToFile() failed - ex : " + ex);
	    return false;
        }
        this.logDebug("CertEnrollWizardOverlay.loginToCAServerPageShow(): CSR for " + nickName + " is exported to file: " + csrOutFile.path + "");
        // Initialize CA Server Type 
        var wizardCAServerTypeElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.type");
	var wizardCAServerDefaultType = this.mCAServerDefaultType;
        this.logDebug("CertEnrollWizardOverlay.loginToCAServerPageShow(): wizardCAServerDefaultType: " + wizardCAServerDefaultType + "");
        if (wizardCAServerDefaultType) {
	    var wizardCAServerTypeSelectedItemId = wizardCAServerTypeElem.id + "."  + wizardCAServerDefaultType;
    	    var wizardCAServerTypeSelectedItemElem = document.getElementById(wizardCAServerTypeSelectedItemId);
	    if (wizardCAServerTypeSelectedItemElem != null) {
	        wizardCAServerTypeElem.selectedItem = wizardCAServerTypeSelectedItemElem;
	    }
	    else {
    	    	this.logError("CertEnrollWizardOverlay.loginToCAServerPageShow(): couldn't find element : " + wizardCAServerTypeSelectedItemId + "");
	    }
        }
	this.handleIssuerTypeChange(wizardCAServerTypeElem);


        this.logTrace("CertEnrollWizardOverlay.loginToCAServerPageShow().......................End.");
    }, 

    handleIssuerTypeChange : function (aIssuerTypeElem, ev)
    {
        this.logTrace("CertEnrollWizardOverlay.handleIssuerTypeChange(): ........................Start.");

        var wizardCAServerRowElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.row");
        var issuerResponseElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.response");

        var wizardCAServerType = aIssuerTypeElem.selectedItem.value;
        this.logDebug("CertEnrollWizardOverlay.handleIssuerTypeChange(): wizardCAServerType : " + wizardCAServerType + "");

        if (wizardCAServerType == "scep") {
            this.mWizardElem.canAdvance = true;
	    wizardCAServerRowElem.hidden = true;
	    issuerResponseElem.hidden = true;
            this.logTrace("CertEnrollWizardOverlay.handleIssuerTypeChange(): ........................End(1).");
	    return;
        }

        this.mWizardElem.canAdvance = false;
        wizardCAServerRowElem.hidden = false;
        issuerResponseElem.hidden = false;

	var certEnrollPrefPrefixId = this.mWizardElem.getAttribute("certEnrollPrefPrefixId");

        var certEnrollmentInfo = new avpki.keymanager.CAServerEnrollmentInfo(wizardCAServerType, certEnrollPrefPrefixId);
        this.mWizardElem.caServerEnrollmentInfo = certEnrollmentInfo;

        var wizardCAServerURLElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.serverURL");
        wizardCAServerURLElem.value = "";
        
    	this.logDebug("CertEnrollWizardOverlay.handleIssuerTypeChange(): mServerEnrollURL: " + this.mWizardElem.caServerEnrollmentInfo.mServerEnrollURL + "");
        if (this.mWizardElem.caServerEnrollmentInfo.mServerEnrollURL) {
            wizardCAServerURLElem.value = this.mWizardElem.caServerEnrollmentInfo.mServerEnrollURL;
	    // this.handleCAServerURLChange(wizardCAServerURLElem);
        }

    	this.logDebug("CertEnrollWizardOverlay.handleIssuerTypeChange(): mNeedsLogin: " + this.mWizardElem.caServerEnrollmentInfo.mNeedsLogin + "");
        var loginButtonElem	= document.getElementById("keymgr.certenroll.wizard.issuer.page.server.login"); 
	if (this.mWizardElem.caServerEnrollmentInfo.mNeedsLogin) {
	    loginButtonElem.hidden = false;
            // this.mWizardElem.canAdvance = false;
            this.mWizardElem.canAdvance = true;
	}
	else {
            this.logTrace("CertEnrollWizardOverlay.handleIssuerTypeChange().......................90.");
            this.mWizardElem.canAdvance = true;
	    loginButtonElem.hidden = true;
	}

        var caCertPickerElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.certpicker");
        if (this.mWizardElem.caServerEnrollmentInfo.mCASubjectDN) {
            var caCert = null;
	    var subjectDN = this.mWizardElem.caServerEnrollmentInfo.mCASubjectDN;
            try {
                this.logDebug("CertEnrollWizardOverlay.handleIssuerTypeChange(): subjectDN: " + subjectDN + "");
    	        caCert = this.mKeyManager.findCertBySubject(subjectDN);
            } catch (ex) {
                this.logError("CertEnrollWizardOverlay.handleIssuerTypeChange(): this.mKeyManager.findCertBySubject(" + subjectDN + ") failed - ex: " + ex + "");
	        caCert = null;
	    }
            this.logDebug("CertEnrollWizardOverlay.handleIssuerTypeChange(): caCert: " + caCert + "");
	    if (caCert) {
	    	caCertPickerElem.selectedCert = caCert;
		this.mWizardElem.caServerEnrollmentInfo.mCAX509Cert = caCert;
		// this.handleCACertPickerChange(caCertPickerElem);
	    }
        }

	var caServerLoginConsole = document.getElementById("AvProdCAServerLoginConsoleIFrame");
        if (caServerLoginConsole) {
            caServerLoginConsole.contentWindow.location = "about:blank";
        }
        this.logTrace("CertEnrollWizardOverlay.handleIssuerTypeChange(): ........................End.");
    },

    handleCAServerURLChange : function (aCAServerURLElem, ev)
    {
        this.logTrace("CertEnrollWizardOverlay.handleCAServerURLChange(): ........................Start.");

    	this.caServerFieldAutoCompleteAction(aCAServerURLElem);

        this.mWizardElem.caServerEnrollmentInfo.mServerEnrollURL = aCAServerURLElem.value;
	this.mWizardElem.caServerEnrollmentInfo.mServerLoginURL = null;

    	this.mWizardElem.caServerEnrollmentInfo.initCAServerLoginURL("wizard");

        this.logTrace("CertEnrollWizardOverlay.handleCAServerURLChange(): ........................End.");
    },

    handleCASubjectDNChange : function (aCASubjectDNElem)
    {
    	this.caServerFieldAutoCompleteAction(aSrcTextBoxElem);
        this.mWizardElem.caServerEnrollmentInfo.mSubjectDN = aCAServerURLElem.value;
    },

    loginToWizardCAServer : function (aCAServerLoginConsoleID)
    {
        this.logTrace("CertEnrollWizardOverlay.loginToWizardCAServer(): ........................Start.");

        var wizardCAServerURLElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.serverURL");
        if (wizardCAServerURLElem.value == "") {
    	    alert("CA Server URL Is missing.");
	    return false;
        }


        var wizardCAServerTypeElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.type");
        var wizardCAServerType = wizardCAServerTypeElem.selectedItem.value;

	var caServerLoginConsole = document.getElementById(aCAServerLoginConsoleID);
        if (caServerLoginConsole) {
            caServerLoginConsole.contentWindow.location = "about:blank";
        }

	var caServerLoginURL = this.mWizardElem.caServerEnrollmentInfo.mServerLoginURL;
	if (wizardCAServerType == "pkcs10CA") {
    	    caServerLoginURL += "&wizardElemId=" + this.mWizardElem.id; 
	}
        this.logDebug("CertEnrollWizardOverlay.loginToWizardCAServer(): caServerLoginURL: " + caServerLoginURL + "");
        caServerLoginConsole.contentWindow.location = caServerLoginURL; 

	/*
        // this.mWizardElem.canAdvance = caServerLoginStatus;
        var wizardCAServerTypeElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.type");
        setPrefValue((gWizardCAServerTypeElem.id + ".default"), "String", wizardCAServerType);

        var wizardCAServerURLElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.serverURL");
        // setPrefValue((wizardCAServerURLElem.id + ".default"), "String", wizardCAServerURLElem.value);
        setPrefValue((wizardCAServerURLElem.id + "." + wizardCAServerType), "String", wizardCAServerURLElem.value);
	*/

        if ((wizardCAServerType == "msCertService") || (wizardCAServerType == "scep")) {
    	    this.mWizardElem.canAdvance = true;
        }

        this.logTrace("CertEnrollWizardOverlay.loginToWizardCAServer(): ........................End.");
        return true;
    },

    getCACertChain : function (aCAServerLoginConsoleID)
    {
        this.logTrace("CertEnrollWizardOverlay.getCACertChain().........Start.");

	var caServerLoginConsole = document.getElementById(aCAServerLoginConsoleID);
        if (!caServerLoginConsole) {
            this.logTrace("CertEnrollWizardOverlay.getCACertChain()................End(0).");
	    return;
        }
        caServerLoginConsole.contentWindow.location = "about:blank";

	if (!this.mWizardPageElem) {
            this.logTrace("CertEnrollWizardOverlay.getCACertChain()................End(1).");
    	    return false;
	}
	if (!this.mWizardElem.caServerEnrollmentInfo) {
            this.logTrace("CertEnrollWizardOverlay.getCACertChain()................End(2).");
    	    return false;
	}

	var caServerDownloadCertChainURL = this.mWizardElem.caServerEnrollmentInfo.mDownloadCertChainURL;
	if (!caServerDownloadCertChainURL) {
            this.logTrace("CertEnrollWizardOverlay.getCACertChain()................End(3).");
    	    return false;
	}

        this.logDebug("CertEnrollWizardOverlay.getCACertChain(): caServerDownloadCertChainURL: " + caServerDownloadCertChainURL + "");
        caServerLoginConsole.contentWindow.location = caServerDownloadCertChainURL;
    
        this.logTrace("CertEnrollWizardOverlay.getCACertChain()................End.");
        return true;
    },

    handleCACertPickerChange : function (aCACertPickerElem, ev)
    {
        this.logTrace("CertEnrollWizardOverlay.handleCASignedCertListChange().........Start.");

        // this.mWizardElem.canAdvance = true;

        if (!aCACertPickerElem.selectedCert) {
    	    // this.mWizardElem.canAdvance = false;
    	    return;
        }
	this.mWizardElem.caServerEnrollmentInfo.mCAX509Cert = aCACertPickerElem.selectedCert;
	this.mWizardElem.caServerEnrollmentInfo.mCASubjectDN = aCACertPickerElem.selectedCert.subjectName;

        this.logTrace("CertEnrollWizardOverlay.handleCASignedCertListChange().........End.");
    },


    uploadPKCS10CSR : function ()
    {
        this.logTrace("CertEnrollWizardOverlay.uploadPKCS10CSR()...................Start.");

        var x509CertItemElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.usercert");
        var x509Cert = x509CertItemElem.cert;
        if (!x509Cert) {
	    alert("Couldn't find the generated self-signed cert.");
    	    return false;
        }

        var wizardCAServerTypeElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.type");
        var wizardCAServerType = wizardCAServerTypeElem.selectedItem.value;
        if (wizardCAServerType == "scep") {
	    var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
				.createInstance(Components.interfaces.nsIPKIParamBlock);
	    var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

    	    pkiParams.setISupportAtIndex(1, null);	// SCEP-recipient cert
    	    pkiParams.setISupportAtIndex(2, x509Cert);	// User-cert 
    	    pkiParams.setISupportAtIndex(3, null);	// CA-Cert
	    dialogParams.SetInt(0, 1);			// number of certs

    	    dialogParams.SetString(0, ""); 		// SCEP-server URL
    	    dialogParams.SetInt(1, 0);			// Is SCEP-server RA?
    	    dialogParams.SetString(1, "PKCSReq");	// SCEP-messgage type

	    /*
	    var msgParam = "";
	    msgParam += "certDbKey=" + encodeURIComponent(x509Cert.dbKey);
	    msgParam += "&" + "msgType=PKCSReq";
	    this.logDebug("CertEnrollWizardOverlay.SCEP msgParam: " + msgParam + "");
	    */

            var scepClientURL = "chrome://keymanager/content/tools/scepclient/scepClientWizard.xul";
	    window.openDialog(scepClientURL,
		                        '_blank',
					'chrome,centerscreen,resizable,modal,dialog=no,titlebar',
					dialogParams
					);
	    var signedX509Cert = null; 
	    if (dialogParams.GetInt(0) == 1) {
	    }
	    /*
	    if (dialogParams.GetInt(0) == 0) { // Selected Cancel or failed.
    	    	// this.mWizardElem.canAdvance = true;
	        return false;
	    }
	    */

	    this.mWizardPageElem.next = "keymgr.certenroll.wizard.page.viewcert";
    	    // this.mWizardElem.canAdvance = true;
	    return true;
        }

        var prodCertCSRFilePathElem	= document.getElementById("keymgr.certenroll.form.csrFile.path"); 
        prodCertCSRFilePathElem.refresh();
        this.logDebug("CertEnrollWizardOverlay.uploadPKCS10CSR(): prodCertCSRFilePathElem.path: " + prodCertCSRFilePathElem.value + "");
    
        var wizardCAServerURLElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.serverURL");
        var caCertPickerElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.certpicker");

    	CertEnrollCAServer.mFormCAServerType = wizardCAServerType;
    	CertEnrollCAServer.mCAServerCertSignURL = wizardCAServerURLElem.value;
	if (caCertPickerElem.selectedCert) {
    	    CertEnrollCAServer.mCAServerIssuerSubjectDN = caCertPickerElem.selectedCert.subjectName;
    	    CertEnrollCAServer.mCAServerIssuerAlias = caCertPickerElem.selectedCert.nickname;
	}

    	CertEnrollCAServer.mUploadCSRAndSignCertResultIFrameId = "UploadCSRAndSignCertResultIFrame";
        if (wizardCAServerType == "pkcs10CA") {
    	    CertEnrollCAServer.mUploadFileFormId = "UploadCSRAndSignCertForm";
	}
        else if (wizardCAServerType == "simpleCA") {
    	    CertEnrollCAServer.mUploadFileFormId = "SimpleCAUploadCSRAndSignCertForm";
    	    CertEnrollCAServer.mUploadFormFileFieldId = "CSRFile";
	}
        else if (wizardCAServerType == "msCertService") {
    	    CertEnrollCAServer.mUploadFileFormId = "MSCryptoUploadCSRAndSignCertForm";
	}
	else {
	    return false;
	}

        CertEnrollCAServer.sendPKCS10CSRFileToCAByArgs(
    			    prodCertCSRFilePathElem.file,
			    CertEnrollCAServer.mUploadCSRAndSignCertResultIFrameId,
			    CertEnrollCAServer.mUploadFileFormId
			    );

        this.logTrace("CertEnrollWizardOverlay.uploadPKCS10CSR()...................End.");
        return true;
    },

    loginToCAServerPageAdvanced : function (aWizardPageElem)
    {
        this.logTrace("CertEnrollWizardOverlay.loginToCAServerPageAdvanced()...................Start.");


        // this.mWizardElem.canAdvance = false;

	var retVal = true;
        // var retVal = this.uploadPKCS10CSR();

	// this.mWizardElem.canAdvance = retVal;
        this.logTrace("CertEnrollWizardOverlay.loginToCAServerPageAdvanced()...................End.");
        return retVal;
    }, 

    generateCSRAndUploadPageShow : function (aWizardPageElem)
    {
        this.logTrace("CertEnrollWizardOverlay.generateCSRAndUploadPageShow().........Start.");
	this.mWizardPageElem = aWizardPageElem;
	this.mWizardElem = aWizardPageElem.parentNode;

        this.mWizardElem.canAdvance = true;

    },

    generateCSRAndUploadPageAdvanced : function (aWizardPageElem)
    {
        this.logTrace("CertEnrollWizardOverlay.generateCSRAndUploadPageAdvanced().........Start.");

        var retVal = this.uploadPKCS10CSR();

        this.logTrace("CertEnrollWizardOverlay.generateCSRAndUploadPageAdvanced().........End.");
        return retVal;
    },

    downloadSignedCertPageShow : function (aWizardPageElem)
    {
        this.logTrace("CertEnrollWizardOverlay.downloadSignedCertPageShow().........Start.");

	this.mWizardPageElem = aWizardPageElem;
	this.mWizardElem = aWizardPageElem.parentNode;
        this.mWizardElem.canAdvance = false;

        var retVal = this.uploadPKCS10CSR();
	// this.mWizardElem.canAdvance = retVal;

        this.logTrace("CertEnrollWizardOverlay.downloadSignedCertPageShow().........End.");
        return retVal;
    },

    downloadSignedCert : function ()
    {
        this.logTrace("CertEnrollWizardOverlay.downloadSignedCert().........Start.");
        return true;
    },

    handleCASignedCertImportEvent : function (aTargetElem, ev)
    {
        this.logTrace("CertEnrollWizardOverlay.handleCASignedCertImportEvent():.........Start.");
        this.logDebug("CertEnrollWizardOverlay.handleCASignedCertImportEvent(): " + 
			"ev.type: " + ev.type + " " + 
			"aTargetElem: " + (aTargetElem? aTargetElem.tagName :"") + " " + 
			"originalTarget: " + (ev.target? ev.target.tagName :"") + " " + 
			"originalTarget: " + (ev.originalTarget? ev.originalTarget.tagName :"") + " " + 
			"");

	if (!this.mWizardElem) {
	    return;
	}
        this.mWizardElem.canAdvance = true;

        this.logTrace("CertEnrollWizardOverlay.handleCASignedCertImportEvent():.........End.");
    },

    downloadSignedCertPageAdvanced : function (aWizardPageElem)
    {
        this.logTrace("CertEnrollWizardOverlay.downloadSignedCertPageAdvanced().........Start.");

        var wizardCAServerURLElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.serverURL");
        var wizardCAServerTypeElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.type");
        if (wizardCAServerTypeElem.selectedItem.value == "msCertService") {
	    var caServerURL = this.mWizardElem.caServerEnrollmentInfo.mServerEnrollURL;
	    var caServerLoginConsole = document.getElementById("UploadCSRAndSignCertResultIFrame");
            if (caServerLoginConsole) {
                caServerLoginConsole.contentWindow.location = caServerURL;
            }
	    // window.open(caServerURL, "UploadCSRAndSignCertResultIFrame");
	    return true;
        }
        this.logTrace("CertEnrollWizardOverlay.downloadSignedCertPageAdvanced().........End.");
        return true;
    },


    viewCASignedCertPageShow : function (aWizardPageElem)
    {
        this.logTrace("CertEnrollWizardOverlay.viewCASignedCertPageShow()..................Start.");

	this.mWizardPageElem = aWizardPageElem;
	this.mWizardElem = aWizardPageElem.parentNode;

        var caCertSubjectDN = CertEnrollCAServer.mCAServerIssuerSubjectDN;
        var caCertMenuElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.certpicker");
        var caCert = null;
        try {
    	    caCert = caCertMenuElem.selectedCert;
        } catch (ex) {caCert = null;}
        if (caCert) {
	    caCertSubjectDN = caCert.subjectName;
        }
        this.logDebug("CertEnrollWizardOverlay.viewCASignedCertPageShow(): caCertSubjectDN: " + caCertSubjectDN + "");

        /*
        var certSubjectDNElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.subjectDN"); 
        var subjectDN = certSubjectDNElem.value;
        */

        var x509CertItemElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.usercert");
        var selfSignedCert = x509CertItemElem.cert;
        var selfCertSubjectDN = selfSignedCert.subjectName;
        this.logDebug("CertEnrollWizardOverlay.viewCASignedCertPageShow(): selfCertSubjectDN: " + selfCertSubjectDN + "");

	var caSignedCert = null;
	try {
	    caSignedCert = this.mKeyManager.findCASignedX509CertByCertSPKI(selfSignedCert, caCert);
	} catch (ex) {
	    alert("couldn't find CA signed cert in the certDB.");
    	    return false;
	}
        this.logDebug("CertEnrollWizardOverlay.viewCASignedCertPageShow(): caSignedCert.subject: " + caSignedCert.subjectName + "");
        this.logDebug("CertEnrollWizardOverlay.viewCASignedCertPageShow(): caSignedCert.issuer: " + caSignedCert.issuerName + "");

        var caSignedCertPickerElem = document.getElementById("keymgr.certenroll.wizard.page.viewcert.menulist"); 
        caSignedCertPickerElem.refresh();
        caSignedCertPickerElem.cadn = caCertSubjectDN;
        caSignedCertPickerElem.selectedCert = caSignedCert;

        // caSignedCertPickerElem.refresh();
        var selectedCert = caSignedCertPickerElem.selectedCert;
        if (!selectedCert) {
	    alert("couldn't find cert with subjectDN: " + selfCertSubjectDN + " in the certpicker menu-list.");
    	    return false;
        }
	if (selectedCert.subjectName !== caSignedCert.subjectName) {
	    alert("couldn't find cert with subjectDN: " + selfCertSubjectDN + " in the certpicker menu-list.");
    	    return false;
	}

	if (!selectedCert.issuer 
		|| ( selectedCert.subjectName == selectedCert.issuer.subjectName)) {
	    alert("couldn't find cert with subjectDN: " + selfCertSubjectDN + " signed by " + caCertSubjectDN + " in the certDB.");
	    this.logError("CertEnrollWizardOverlay.viewCASignedCertPageShow(): couldn't find cert with subjectDN: " + selfCertSubjectDN + " signed by " + caCertSubjectDN + " in the certDB.");
    	    return false;
	}

	this.mWizardElem.enrolledCert = selectedCert;
        this.logDebug("CertEnrollWizardOverlay.viewCASignedCertPageShow(): selectedCert.subject: " + selectedCert.subjectName + "");
        this.logDebug("CertEnrollWizardOverlay.viewCASignedCertPageShow(): selectedCert.issuer: " + selectedCert.issuerName + "");

        this.logTrace("CertEnrollWizardOverlay.viewCASignedCertPageShow()..................End.");
        return true;
    },


    handleCASignedCertListChange : function (aCertMenuListEle, ev)
    {
        this.logTrace("CertEnrollWizardOverlay.handleCASignedCertListChange().........Start.");
    },

    viewCASignedCertPageAdvanced : function (aWizardPageElem)
    {
    },

    adaptNickName : function (aCert, keepTokenName, nameSuffix) 
    {
    var tmpCert = aCert;
    if (!tmpCert) {
	return null;
    }

    var tmpStrList = null; 
    var newNickName = tmpCert.nickname;
    if (!newNickName || ((newNickName == "") || (newNickName == "(no nickname)"))) {
	newNickName = tmpCert.commonName;
    	if (newNickName == "") {
	    return null;
	}
    }

    if (!keepTokenName) {
	if (newNickName.indexOf(":") >= 0) {
	    tmpStrList = tmpCert.nickname.split(":");
	    if (tmpStrList.length > 1) {
		newNickName = tmpStrList[1];
	    }
	}
    }
    if (newNickName.indexOf("=") >= 0) {
	newNickName = tmpCert.commonName;
	tmpStrList = newNickName.split(" ");
	newNickName = tmpStrList[0];
    }

    // TODO:  xxxx
    newNickName = newNickName.replace(/\(/g, "");
    newNickName = newNickName.replace(/\)/g, "");
    newNickName = newNickName.replace(/\*/g, "X");
    newNickName = newNickName.replace(/\./g, "_");
    newNickName = newNickName.replace(/-/g, "_");
    newNickName = newNickName.replace(/:/g, "_");
    newNickName = newNickName.replace(/\W/g,"");

    newNickName = newNickName.replace(/__/g, "_");
    newNickName = newNickName.replace(/^_/, "");

    // dump("adaptCertNickName(): newNickName: " + newNickName + "");


    if (nameSuffix && (nameSuffix.length > 0)) {
	newNickName += "_" + nameSuffix;
    }

    // dump("keyManagerExt.js:adaptCertNickName(): newNickName: " + newNickName + "");

    return newNickName;
    }

}

