/* @(#) $Id: CertEnrollInitProfileOverlay.js,v 1.16 2012/10/07 17:20:03 subrata Exp $ */

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

const gSubjDNSuffix = "OU=Avaya Labs,O=Avaya,L=Lincroft,ST=NJ,C=US";

avpki.keymanager.CertEnrollInitProfileOverlay = {

    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,
    /* alrIKeyManager	*/ mSoftTokenDBManager : null,

    mPageInitialized		: false,
    mSubjDNSuffix		: "",
    mDefaultPrefBranchPrefixId	: "extensions.avpki.certenroll.",
    mPrefBranchPrefixId		: "extensions.avpki.certenroll.",
    mCertBaseProfileType	: null,
    mCertProfileData		: null,
    mCertEnrollType		: null,
    mTestMode			: false,


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
        this.logTrace("CertEnrollInitProfileOverlay.loginToInternalToken():................Start.");

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
        	var prefBranchPrefixId = this.mPrefBranchPrefixId + "cert.test.";  
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
	    	this.logDebug("CertEnrollInitProfileOverlay.loginToInternalToken():  ex: " + ex);
	    }

	} while (0);

	if (testOption && testPassword) {
            /**********************************************/
            /* TODO:  TEST CODE - remove after test phase */
            /**********************************************/
	    this.mTestMode = testOption;
	    token.checkPassword(testPassword);
	}

	try {
            token.login(false);
            this.logTrace("CertEnrollInitProfileOverlay.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("CertEnrollInitProfileOverlay.loginToInternalToken():................End.");
	// this.mMaxLogLevel = 4;
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


    initXPComServiceInfo : function ()
    {
        this.logTrace("CertEnrollInitProfileOverlay.initXPComServiceInfo():................Start.");

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
	    this.mSoftTokenDBManager = Components.classes["@avaya.com/pkm/softtokendbmanager;1"]
	                        .getService(Components.interfaces.alrISoftTokenDBManager);
        } catch (ex) {
    	    alert("CertEnrollInitProfileOverlay.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("CertEnrollInitProfileOverlay.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	this.logTrace("CertEnrollInitProfileOverlay.initXPComServiceInfo():................End.");
    },

    initCertProfileXULElems : function ()
    {
	if (this.mPageInitialized) {
	    return;
	}

        this.logTrace("CertEnrollInitProfileOverlay.initCertProfileXULElems()...................Start.");


	this.mPageInitialized = true;

	this.initXPComServiceInfo();

        var tokenMenuListElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.tokenMenuList");
    	tokenMenuListElem.refresh();
    	this.onTokenMenuChange(tokenMenuListElem);

        var certProfileTypeElem	 = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.type");
	this.handleCertProfileTypeChange(certProfileTypeElem);

	this.loginToInternalToken();

        this.logTrace("CertEnrollInitProfileOverlay.initCertProfileXULElems()...................End.");
    },


    loadDefaultCertProfile : function (aPrefBranchPrefixId)
    {
        this.logTrace("CertEnrollInitProfileOverlay.loadDefaultCertProfile()...................Start.");

        var prefStrValue = null;
    
	if (aPrefBranchPrefixId) {
	    this.mPrefBranchPrefixId = aPrefBranchPrefixId;
	}
	else {
	    this.mPrefBranchPrefixId = this.mDefaultPrefBranchPrefixId;
	}
        var prefBranchPrefixId = this.mPrefBranchPrefixId + "cert.";  
	this.logDebug("CertEnrollInitProfileOverlay.loadDefaultCertProfile(): prefBranchPrefixId: " + prefBranchPrefixId + "");

        var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
        var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
        if (!prefsBranch) {
            this.logTrace("CertEnrollInitProfileOverlay.loadDefaultCertProfile()...................End(1).");
    	    return;
        }

        var prodCertProfileBaseType = null;
        try {
            prefStrValue = prefsBranch.getCharPref("baseProfileType");
	    if (prefStrValue && (prefStrValue != "")) {
	        prodCertProfileBaseType = prefStrValue;
	    }
        } catch (e) {
	}


        if (!prodCertProfileBaseType) {
            prodCertProfileBaseType = "basicconstraints";
        }
	this.mCertBaseProfileType = prodCertProfileBaseType; 

	/*
        var prefBoolValue = false;
        try {
            prefBoolValue = prefsBranch.getBoolPref("test");
	    if (prefBoolValue) {
	        this.mTestMode = true;
	    }
        } catch (e) { }
	*/

	var certOrgUnit = null;
        try {
            prefStrValue = prefsBranch.getCharPref("orgUnit");
	    if (prefStrValue && (prefStrValue != "")) {
	        certOrgUnit = prefStrValue;
	    }
        } catch (e) { }

	var certOrg = null;
        try {
            prefStrValue = prefsBranch.getCharPref("org");
	    if (prefStrValue && (prefStrValue != "")) {
	        certOrg = prefStrValue;
	    }
        } catch (e) { }

	var certLocality = null;
        try {
            prefStrValue = prefsBranch.getCharPref("locality");
	    if (prefStrValue && (prefStrValue != "")) {
	        certLocality = prefStrValue;
	    }
        } catch (e) { }

	var certState = null;
        try {
            prefStrValue = prefsBranch.getCharPref("state");
	    if (prefStrValue && (prefStrValue != "")) {
	        certState = prefStrValue;
	    }
        } catch (e) { }

	var certCountry = null;
        try {
            prefStrValue = prefsBranch.getCharPref("country");
	    if (prefStrValue && (prefStrValue != "")) {
	        certCountry = prefStrValue;
	    }
        } catch (e) { }

	var subjDNSuffix = "";
        var certProfileDataStr = "";

	if (certOrgUnit && (certOrgUnit != "")) {
	    if (subjDNSuffix != "") {
	    	subjDNSuffix += ",";
	    }
	    subjDNSuffix += "OU=" + certOrgUnit;
	}
	if (certOrg && (certOrg != "")) {
	    if (subjDNSuffix != "") {
	    	subjDNSuffix += ",";
	    }
	    subjDNSuffix += "O=" + certOrg;
	}
	if (certLocality && (certLocality != "")) {
	    if (subjDNSuffix != "") {
	    	subjDNSuffix += ",";
	    }
	    subjDNSuffix += "L=" + certLocality;
	}
	if (certState && (certState != "")) {
	    if (subjDNSuffix != "") {
	    	subjDNSuffix += ",";
	    }
	    subjDNSuffix += "ST=" + certState;
	}
	if (certCountry && (certCountry != "")) {
	    if (subjDNSuffix != "") {
	    	subjDNSuffix += ",";
	    }
	    subjDNSuffix += "C=" + certCountry;
	}
	this.mSubjDNSuffix = subjDNSuffix;

        if (certOrgUnit) {
	    certProfileDataStr += 
"    <profileItem name=\"org_unit\" value=\"" + certOrgUnit + "\"/>\n" ;
        }

        if (certOrg) {
	    certProfileDataStr += 
"    <profileItem name=\"org\" value=\"" + certOrg + "\"/>\n" ;
        }

        if (certLocality) {
	    certProfileDataStr += 
"    <profileItem name=\"locality\" value=\"" + certLocality + "\"/>\n" ;
        }

        if (certState) {
	    certProfileDataStr += 
"    <profileItem name=\"state\" value=\"" + certState + "\"/>\n" ;
        }

        if (certCountry) {
	    certProfileDataStr += 
"    <profileItem name=\"country\" value=\"" + certCountry + "\"/>\n" ;
        }

	this.mCertProfileData = certProfileDataStr;

        this.logTrace("CertEnrollInitProfileOverlay.loadDefaultCertProfile()...................End.");
    },

    loadWindowParams : function ()
    {
        if (!window.arguments || !window.arguments[0]) {
	    return;
	}


        this.logTrace("CertEnrollInitProfileOverlay.loadWindowParams():...................Start.");

        var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
        var pkiParams = null;
        try {
    	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
        } catch (ex) {
	    this.logError("CertEnrollInitProfileOverlay.loadWindowParams(): dialogParams.QueryInterface() failed - ex: " + ex + "");
	}
        this.logDebug("CertEnrollInitProfileOverlay.loadWindowParams(): dialogParams: " + dialogParams + "");
        this.logDebug("CertEnrollInitProfileOverlay.loadWindowParams(): pkiParams: " + pkiParams + "");

    	var parmUserCertProfileType	= dialogParams.GetString(0);
        this.logDebug("CertEnrollInitProfileOverlay.loadWindowParams(): parmUserCertProfileType: " + parmUserCertProfileType + "");
	if (parmUserCertProfileType) {
	    this.mCertBaseProfileType = parmUserCertProfileType;
	    this.mWizardElem.profileType = parmUserCertProfileType;
	}

    	var paramCertEnrollType		= dialogParams.GetString(1);
        this.logDebug("CertEnrollInitProfileOverlay.loadWindowParams(): paramCertEnrollType: " + paramCertEnrollType + "");
	if (parmUserCertProfileType) {
	    this.mCertEnrollType = paramCertEnrollType;
	    this.mWizardElem.certEnrollType = paramCertEnrollType;
	}

	var paramProfileX509Cert = null;
	var paramUserX509Cert = null;
	var paramSignerX509Cert = null;
        if (pkiParams) {
	    var paramCert = null;

	    paramCert = pkiParams.getISupportAtIndex(1);
	    if (paramCert) {
	        paramProfileX509Cert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	    }

	    paramCert = pkiParams.getISupportAtIndex(2);
	    if (paramCert) {
	        paramUserX509Cert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	    }

	    paramCert = pkiParams.getISupportAtIndex(3);
	    if (paramCert) {
	        paramSignerX509Cert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	    }
            this.logDebug("CertEnrollInitProfileOverlay.loadWindowParams(): paramProfileX509Cert: " + paramProfileX509Cert + "");
            this.logDebug("CertEnrollInitProfileOverlay.loadWindowParams(): paramUserX509Cert: " + paramUserX509Cert + "");
            this.logDebug("CertEnrollInitProfileOverlay.loadWindowParams(): paramSignerX509Cert: " + paramSignerX509Cert + "");
        }
        this.logTrace("CertEnrollInitProfileOverlay.loadWindowParams():...................20.");

    	var userCommonName	= null;
    	var userSubjectName	= null;
    	var userNickName	= null;

	if (paramSignerX509Cert) {
	    this.mWizardElem.signerCert = paramSignerX509Cert;
	}
	if (paramUserX509Cert) {
	    this.mWizardElem.userX509Cert = paramSignerX509Cert;
            this.logTrace("CertEnrollInitProfileOverlay.loadWindowParams():...................End(1).");
	    return;
	}

        this.logDebug("CertEnrollInitProfileOverlay.loadWindowParams(): parmUserCertProfileType: " + parmUserCertProfileType + "");
	if (parmUserCertProfileType == "certificate") {
            this.logTrace("CertEnrollInitProfileOverlay.loadWindowParams():...................30.");
	    this.mWizardElem.profileX509Cert = paramProfileX509Cert;
    	    userCommonName	= dialogParams.GetString(2);
	}
	else if (parmUserCertProfileType == "xmldoc") {
            this.logTrace("CertEnrollInitProfileOverlay.loadWindowParams():...................32.");
    	    userCommonName	= dialogParams.GetString(2);
    	    var xmlProfileData	= dialogParams.GetString(3);
            this.logDebug("CertEnrollInitProfileOverlay.loadWindowParams(): xmlProfileData:\n" + xmlProfileData + "");
	    if (xmlProfileData) {
	    	this.mWizardElem.xmlProfileData = xmlProfileData;
	    }
	}
	else {
            this.logTrace("CertEnrollInitProfileOverlay.loadWindowParams():...................34.");
    	    userCommonName	= dialogParams.GetString(2);
    	    /*
	    userSubjectName	= dialogParams.GetString(3);
    	    userNickName	= dialogParams.GetString(4);
            var certNickNameElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.nickName"); 
            var certSubjectDNElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.subjectDN"); 
	    if (userNickName) {
	    	certNickNameElem.value = userNickName;
	    }
	    if (userSubjectName) {
	    	certSubjectDNElem.value = userSubjectName;
	    }
	    */
	}

	if (userCommonName) {
	    this.mWizardElem.certCommonName = userCommonName;
	}

        this.logTrace("CertEnrollInitProfileOverlay.loadWindowParams():...................End.");

    },

    selectCertProfilePageShow : function (aWizardPageElem)
    {
        this.logTrace("CertEnrollInitProfileOverlay.selectCertProfilePageShow()...................Start.");


        var certProfilePageElem = aWizardPageElem;
        this.mWizardPageElem = aWizardPageElem;
	this.mWizardElem = aWizardPageElem.parentNode;

        this.mWizardElem.canAdvance = false;

	var certEnrollPrefPrefixId = this.mWizardElem.getAttribute("certEnrollPrefPrefixId");
        this.logDebug("CertEnrollInitProfileOverlay.selectCertProfilePageShow(): certEnrollPrefPrefixId: " + certEnrollPrefPrefixId + "");
    	this.loadDefaultCertProfile(certEnrollPrefPrefixId);

    	this.loadWindowParams();

    	this.initCertProfileXULElems();

        var firstNameElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.firstName"); 
        var lastNameElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.lastName"); 
        var certCommonNameElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.commonName"); 

	var certCommonName = null;
	if (this.mWizardElem.userX509Cert) {
	    certCommonName = this.mWizardElem.userX509Cert.commonName;
	    certCommonNameElem.value = commonName;
	    this.mWizardElem.certCommonName = commonName;
	    this.handleProdCertChange(this.mWizardElem.userX509Cert);
            this.logTrace("CertEnrollInitProfileOverlay.selectCertProfilePageShow()...................End(0).");
	    return true;
	}

        var certProfileTypeElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.type"); 
	certProfileTypeElem.value = this.mCertBaseProfileType;


	var certFirstName = null;
	var certLastName = null;
	var certCommonName = this.mWizardElem.certCommonName;
        this.logDebug("CertEnrollInitProfileOverlay.selectCertProfilePageShow(): certCommonName: " + certCommonName + "");
	if (!certCommonName) {
	    // certFirstName = "CertEnrollTest";
	    certFirstName = "";
	    certCommonName = certFirstName;
	    this.mWizardElem.certCommonName = certCommonName;
	}
	else {
	    var certCommonNameList = certCommonName.split(" ");
	    certFirstName = certCommonNameList[0];
	    if (certCommonNameList.length > 1) {
	    	certLastName = certCommonName.substring(certFirstName.length + 1)
	    }
	}
        this.logDebug("CertEnrollInitProfileOverlay.selectCertProfilePageShow(): certFirstName: " + certFirstName + "");
        this.logDebug("CertEnrollInitProfileOverlay.selectCertProfilePageShow(): certLastName: " + certLastName + "");

	if (certLastName && (certLastName != "")) {
	    lastNameElem.value = certLastName;
            this.logDebug("CertEnrollInitProfileOverlay.selectCertProfilePageShow(): lastNameElem.value: " + lastNameElem.value + "");
	}
	if (certFirstName && (certFirstName != "")) {
	    firstNameElem.value = certFirstName;
            this.logDebug("CertEnrollInitProfileOverlay.selectCertProfilePageShow(): firstNameElem.value: " + firstNameElem.value + "");
	}
	this.handleProdCertFirstNameChange(firstNameElem);

	certCommonNameElem.value = certCommonName;
	if (!certCommonName || certCommonName == "") {
	    return false;
	}
        this.handleProdCertCommonNameChange(certCommonNameElem);


        var currCertElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.currCert"); 
        var currX509Cert = currCertElem.cert;

	if (!currX509Cert) {
            var certAliasElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.nickName"); 
            var certSubjectDNElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.subjectDN"); 
	}

        this.mWizardElem.canAdvance = true;

        this.logDebug("CertEnrollInitProfileOverlay.selectCertProfilePageShow((): this.mWizardElem.profileType: " + this.mWizardElem.profileType);

        this.logTrace("CertEnrollInitProfileOverlay.selectCertProfilePageShow()...................End.");
	return true;
    },

    onTokenMenuChange : function (aTokenMenuListElem, ev)
    {
        this.logTrace("CertEnrollInitProfileOverlay.onTokenMenuChange() ........Start.");

        // get the selected token
        var tokenName = aTokenMenuListElem.value;

        var token = aTokenMenuListElem.token;
        if (token == null) {
	    alert("Couldn't find token: " + tokenName);
    	    return;
        }

	/*
	try {
            token.login(false);
	} catch (ex) { }
	*/

        this.logTrace("CertEnrollInitProfileOverlay.onTokenMenuChange() ........End.");
    },

    textboxAutoCompleteAction : function (aSrcTextBoxElem, ev)
    {
        this.logTrace("CertEnrollInitProfileOverlay.textboxAutoCompleteAction() ........Start.");

	if (aSrcTextBoxElem.getAttribute("type") != "autocomplete") {
	    return;
	}

        var formFieldKey = aSrcTextBoxElem.id;
	if (!formFieldKey) {
	    return;
	}
        var formFieldValue = aSrcTextBoxElem.value;
        if (formFieldValue == "") {
    	    return;
        }

        /*
        var formhistory = Components.classes["@mozilla.org/satchel/form-history;1"].
	    getService(Components.interfaces.nsIFormHistory);
        */
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

        this.logTrace("CertEnrollInitProfileOverlay.textboxAutoCompleteAction() ........End.");
    },

    certFormFieldAutoCompleteAction : function (aSrcTextBoxElem, ev)
    {
	if (aSrcTextBoxElem.getAttribute("type") != "autocomplete") {
	    return;
	}
        this.textboxAutoCompleteAction(aSrcTextBoxElem, ev);
    },

    handleCertProfileTypeChange : function (aCertProfileTypeElem, ev)
    {
        this.logTrace("CertEnrollInitProfileOverlay.handleCertProfileTypeChange():...................Start.");

        var certNickNameElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.nickName"); 
        var certProfileOutFileRowElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.outfile.row"); 
        var certProfileFilePickerElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.outfile.path");

        this.logDebug("CertEnrollInitProfileOverlay.handleCertProfileTypeChange:((): aCertProfileTypeElem.profileType: " + aCertProfileTypeElem.profileType);

	if ((aCertProfileTypeElem.profileType == "certificate")
	    || (aCertProfileTypeElem.profileType == "xmldoc")) {
	    certProfileOutFileRowElem.hidden = true;
	}
	else {
	    var profileFileName = certNickNameElem.value;
	    if (profileFileName == "") {
	        profileFileName = "Dummy";
	    }
	    profileFileName += "_CertProfile.xml";

            certProfileFilePickerElem.autoSelectTempFile("KeyManager/CertEnroll", profileFileName);
	    certProfileOutFileRowElem.hidden = false;
	}

        this.logTrace("CertEnrollInitProfileOverlay.handleCertProfileTypeChange():...................End.");
    },

    handleProdCertFirstNameChange : function (firstNameElem, ev)
    {
        this.logTrace("CertEnrollInitProfileOverlay.handleProdCertFirstNameChange():...................Start.");
	if (ev) {
	    firstNameElem.value = this.trim(firstNameElem.value);
	}

	var commonName = "";
	if (firstNameElem.value != "") {
	    commonName = firstNameElem.value;
	}
        this.logDebug("CertEnrollInitProfileOverlay.handleProdCertFirstNameChange(): commonName: " + commonName + "");

        var lastNameElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.lastName"); 
	if (lastNameElem.value !=  "") {
	    if (commonName != "") {
	    	commonName += " ";
	    }
	    commonName += lastNameElem.value;
	}
        this.logDebug("CertEnrollInitProfileOverlay.handleProdCertFirstNameChange(): commonName: " + commonName + "");

        var commonNameElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.commonName"); 
	if (commonName != "") {
	    commonNameElem.value = commonName;
	    this.handleProdCertCommonNameChange(commonNameElem);
	}
        this.logTrace("CertEnrollInitProfileOverlay.handleProdCertFirstNameChange():...................End.");
    },

    handleProdCertLastNameChange : function (lastNameElem, ev)
    {
        this.logTrace("CertEnrollInitProfileOverlay.handleProdCertLastNameChange():...................Start.");
	if (ev) {
	    lastNameElem.value = this.trim(lastNameElem.value);
	}

        var firstNameElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.firstName"); 
	this.handleProdCertFirstNameChange(firstNameElem);

        this.logTrace("CertEnrollInitProfileOverlay.handleProdCertLastNameChange():...................End.");
    },

    handleProdCertCommonNameChange : function (commonNameElem, ev)
    {
        this.logTrace("CertEnrollInitProfileOverlay.handleProdCertCommonNameChange():...................Start.");
	if (ev) {
	    commonNameElem.value = this.trim(commonNameElem.value);
	}

        this.mWizardElem.canAdvance = false;

        var firstNameElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.firstName"); 
        var lastNameElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.lastName"); 
        var certNickNameElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.nickName"); 
        var certSubjectDNElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.subjectDN"); 

	var nickName = firstNameElem.value;
	if (nickName == "") {
	    nickName = lastNameElem.value;
	}
	if (nickName != "") {
            certNickNameElem.value = nickName;
	}


        var newCommonName = commonNameElem.value;
        this.logDebug("CertEnrollInitProfileOverlay.handleProdCertCommonNameChange(): newCommonName: " + newCommonName + "");

	var subjectDN = "";
	if (newCommonName != "") {
            subjectDN = "CN=" + newCommonName + "," +  this.mSubjDNSuffix;
	}
        this.logDebug("CertEnrollInitProfileOverlay.handleProdCertCommonNameChange(): subjectDN: " + subjectDN + "");
        certSubjectDNElem.value = subjectDN;

	if (newCommonName == "") {
	     return;
	}


        // Determine and Initialize existing cert info
        var currCert = null;
        try {
    	    currCert = this.mKeyManager.findCertBySubject(subjectDN);
        } catch (ex) {
            // this.logError("handleProdCertCommonNameChange(): this.mKeyManager.findCertBySubject() failed - ex: " + ex + "");
	    currCert = null;
	}
        this.logDebug("CertEnrollInitProfileOverlay.handleProdCertCommonNameChange(): currCert: " + currCert + "");

	this.handleProdCertChange(currCert);

        this.logTrace("CertEnrollInitProfileOverlay.handleProdCertChange():...................End.");
    },

    handleProdCertSubjectChange : function (subjectNameElem, ev)
    {
        this.logTrace("CertEnrollInitProfileOverlay.handleProdCertSubjectChange():...................Start.");
        this.logTrace("CertEnrollInitProfileOverlay.handleProdCertSubjectChange():...................End.");
    },

    handleProdCertChange : function (aX509Cert)
    {
        this.logTrace("CertEnrollInitProfileOverlay.handleProdCertChange():...................Start.");
        var certNickNameElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.nickName"); 
        var certSubjectDNElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.subjectDN"); 

	var currCert = aX509Cert;

        var currCertElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.currCert"); 
        currCertElem.cert = currCert;

        var currCertRowElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.currCert.row");

        var prodNewKeyRowElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.newKey.row");
        var prodNewKeyGenElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.newKey.generate"); 
        var certTokenRowElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.token.row"); 
        var certNickNameRowElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.alias.row"); 
        var certSubjectRowElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.subject.row"); 
        var certProfileTypeRowElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.type.row"); 
        var certProfileOutFileRowElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.outfile.row"); 

        if (aX509Cert) {
	    currCertRowElem.collapsed = false;
	    prodNewKeyGenElem.disabled = false;
	    prodNewKeyGenElem.checked = false;

    	    certTokenRowElem.collapsed = true;
    	    certNickNameRowElem.collapsed = true;
    	    certSubjectRowElem.collapsed = true;
    	    certProfileTypeRowElem.collapsed = true;
    	    certProfileOutFileRowElem.collapsed = true;
        }
        else {
	    currCertRowElem.collapsed = true;
	    prodNewKeyGenElem.disabled = true;
	    prodNewKeyGenElem.checked = true;

    	    certTokenRowElem.collapsed = false;
    	    certNickNameRowElem.collapsed = false;
    	    certSubjectRowElem.collapsed = false;
    	    certProfileTypeRowElem.collapsed = false;
    	    certProfileOutFileRowElem.collapsed = false;

            var certProfileTypeElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.type"); 
	    this.handleCertProfileTypeChange(certProfileTypeElem);
        }

        var iscertSelfSigned = false;
        if (aX509Cert && (!aX509Cert.issuer || (aX509Cert.subjectName == aX509Cert.issuer.subjectName))) {
	    iscertSelfSigned = true;
        }
        this.logDebug("CertEnrollInitProfileOverlay.handleProdCertCommonNameChange(): iscertSelfSigned: " + iscertSelfSigned + "");

    	var caCertPickerElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.certpicker");
	caCertPickerElem.selectedCert = this.mWizardElem.signerCert;
        if (aX509Cert) {
    	    var x509CertItemElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.usercert");
    	    x509CertItemElem.cert = aX509Cert;
    	    if (iscertSelfSigned) {
	        this.mWizardPageElem.next = "keymgr.certenroll.wizard.page.issuer";
	    }
	    else {
	        this.mWizardPageElem.next = "keymgr.certenroll.wizard.page.viewcert";
	    }
    	    this.mWizardElem.canAdvance = true;
	    return true;
        }
        this.mWizardPageElem.next = "keymgr.certenroll.wizard.page.csr";

        this.mWizardElem.canAdvance = true;
        this.logTrace("CertEnrollInitProfileOverlay.handleProdCertChange():...................End.");
    },

    selectCertProfilePageAdvanced : function ()
    {
        this.logTrace("CertEnrollInitProfileOverlay.selectCertProfilePageAdvanced():...................Start.");

        var currCertElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.currCert"); 
	var currCert = currCertElem.cert;

        var iscertSelfSigned = false;
        if (currCert && (!currCert.issuer || (currCert.subjectName == currCert.issuer.subjectName))) {
	    iscertSelfSigned = true;
        }

	if (currCert) {
	    /*
    	    var x509CertItemElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.usercert");
    	    x509CertItemElem.cert = currCert;
	    this.mWizardElem.userX509Cert = currCert;
	    this.mWizardElem.signerCert = currCert.issuer;

    	    if (iscertSelfSigned) {
	        this.mWizardPageElem.next = "keymgr.certenroll.wizard.page.issuer";
	    }
	    else {
	        this.mWizardPageElem.next = "keymgr.certenroll.wizard.page.viewcert";
    	        var caCertPickerElem = document.getElementById("keymgr.certenroll.wizard.page.issuer.certpicker");
		if (currCert.issuer) {
	            caCertPickerElem.selectedCert = currCert.issuer;
		}
	    }
	    */
            this.logTrace("CertEnrollInitProfileOverlay.selectCertProfilePageAdvanced():...................End(1).");
    	    return true;
	}

        this.logDebug("CertEnrollInitProfileOverlay.selectCertProfilePageAdvanced(): this.mWizardElem.profileType: " + this.mWizardElem.profileType);
	if (this.mWizardElem.profileType == "certificate") {
            this.logTrace("CertEnrollInitProfileOverlay.selectCertProfilePageAdvanced():...................End(2).");
	    return true;
	}

        var certProfileDataStr = "";
	if (this.mWizardElem.profileType == "xmldoc") {
            this.logTrace("CertEnrollInitProfileOverlay.selectCertProfilePageAdvanced():...................10.");
	    certProfileDataStr = this.mWizardElem.xmlProfileData;
	}
	else {
            this.logTrace("CertEnrollInitProfileOverlay.selectCertProfilePageAdvanced():...................20.");
            var certFirstNameElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.firstName"); 
            var certLastNameElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.lastName"); 
            var certCommonNameElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.commonName"); 
            var certAliasElem		= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.nickName"); 
            var certProfileTypeElem	= document.getElementById("keymgr.certenroll.wizard.page.cert.profile.type"); 

	    var profileUserType = certProfileTypeElem.profileusertype;

            certProfileDataStr = 
"<CertProfile \n" +
"    baseProfileType=\"" + certProfileTypeElem.value + "\"\n" + 
"    > \n" +
"    <profileItem name=\"firstName\" value=\"" + certFirstNameElem.value + "\"/>\n" + 
"    <profileItem name=\"lastName\" value=\"" + certLastNameElem.value + "\"/>\n" + 
"    <profileItem name=\"name\" value=\"" + certCommonNameElem.value + "\"/>\n" + 
"    <profileItem name=\"nickName\" value=\"" + certAliasElem.value + "\"/>\n"  + 
"";
            certProfileDataStr += this.mCertProfileData;
	    if (profileUserType == "server") {
		var serverAddress = certFirstNameElem.value;
		var isIpAddress = false;
		if (serverAddress.search(/\d\.\d\.\d\.\d/) >= 0) {
		    isIpAddress = true;
		}
		
		/*
    		<profileItem name="SubAltName-text" value="admin@mydomain.com - 2|192.168.2.1 - 8|myserver.mydomain.com - 3"/>
    		<profileItem name="SubAltName-display-text" value="rfc822Name:admin@mydomain.com|ipAddress:192.168.2.1|dnsName:myserver.mydomain.com"/>
		*/
	    	var subjAltNameText = "";
	    	var subjAltNameDisplayText = "";
		if (isIpAddress) {
	    	    subjAltNameText = serverAddress + " - 8";
	    	    subjAltNameDisplayText = "ipAddress:" + serverAddress;
		}
		else {
	    	    subjAltNameText = serverAddress + " - 3";
	    	    subjAltNameDisplayText = "dnsName:" + serverAddress;
		}


            	certProfileDataStr += 
"    <profileItem name=\"SubAltName\" value=\"" + "true" + "\"/>\n"  + 
"    <profileItem name=\"SubAltName-crit\" value=\"" + "true" + "\"/>\n"  + 
"    <profileItem name=\"SubAltName-display-text\" value=\"" + subjAltNameDisplayText + "\"/>\n"  + 
"    <profileItem name=\"SubAltName-text\" value=\"" + subjAltNameText + "\"/>\n"  + 
"";
		if (isIpAddress) {
            	certProfileDataStr += 
"    <profileItem name=\"ipAddress\" value=\"" + serverAddress + "\"/>\n"  + 
"";
		}
		else {
            	certProfileDataStr += 
"    <profileItem name=\"dnsName\" value=\"" + serverAddress + "\"/>\n"  + 
"";
		}
	    }

            certProfileDataStr += 
"</CertProfile>\n" + 
"\n";
	}
        dump("CertEnrollInitProfileOverlay.selectCertProfilePageAdvanced(): certProfileDataStr:\n"); dump(certProfileDataStr);

	// this.mWizardElem.profileType = "xmldoc";
	// this.mWizardElem.profileXmlData = certProfileDataStr;

	this.mWizardElem.profileType = "custom";

        var certProfileFilePickerElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.outfile.path");
	if (!certProfileFilePickerElem.file) {
	    var profileFileName = certAliasElem.value;
	    if (profileFileName == "") {
	        profileFileName = "Dummy";
	    }
	    profileFileName += "_CertProfile.xml";
            certProfileFilePickerElem.autoSelectTempFile("KeyManager/CertEnroll", profileFileName);
	}
        try {
    	    certProfileFilePickerElem.saveData(certProfileDataStr);
        } catch (ex) {
	    alert("Falied to save profile data - ex: "  + ex);
    	    return false;
        }
        certProfileFilePickerElem.refresh();
        this.logDebug("CertEnrollInitProfileOverlay.selectCertProfilePageAdvanced(): profileFilePath: " + certProfileFilePickerElem.filepath + "");

        var tokenMenuListElem = document.getElementById("keymgr.certenroll.wizard.page.cert.profile.tokenMenuList");
        var token = tokenMenuListElem.token;
	try {
	    if (token) {
            	token.login(false);
	    }
	} catch (ex) { }

        this.logTrace("CertEnrollInitProfileOverlay.selectCertProfilePageAdvanced():...................End.");
        return true;
    }
}

