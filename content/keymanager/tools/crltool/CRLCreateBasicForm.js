/* @(#) $Id: CRLCreateBasicForm.js,v 1.17 2012/10/07 17:20:17 subrata Exp $ */

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


var CRLCreateBasicForm = {


    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,

    mDialogParams			: null,
    mProfileDir				: null,

    mSelectedCRL			: null,
    mCACertPickerElem			: null,
    mCreateCRLBasicGridElem		: null,

    mLastUpdateDateModified		: false,
    mRevokedCertSerialNumsModified	: false,

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
	// this.mMaxLogLevel = 9;
	this.logTrace("CRLCreateBasicForm.loginToInternalToken():................Start.");

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

		/*
		var prefStringValue = prefsBranch.getCharPref("password");
		if (prefStringValue && (prefStringValue != "")) {
		    testPassword = prefStringValue;
		}
		*/
	    } catch (ex) {
		this.logDebug("CRLCreateBasicForm.loginToInternalToken():  unable to obtain preferences - ex: " + ex);
		break;
	    }

	} while (0);

	if (testOption && testPassword) {
	    /**********************************************/
	    /* TODO:  TEST CODE - remove after test phase */
	    /**********************************************/
	    this.mTestMode = testOption;
	    try {
		token.checkPassword(testPassword);
	    } catch (ex) {}
	}

	try {
	    token.login(false);
	    this.logTrace("CRLCreateBasicForm.loginToInternalToken(): successfully logged in to internal-token.");
	} catch (ex) {}

	this.logTrace("CRLCreateBasicForm.loginToInternalToken():................End.");
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


    initXPComServiceInfo : function ()
    {
	this.logTrace("CRLCreateBasicForm.initXPComServiceInfo():................Start.");

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

	    this.mProfileDir = this.mDirService.get("ProfD", Components.interfaces.nsIFile);

	} catch (ex) {
	    alert("CRLCreateBasicForm.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    this.logError("CRLCreateBasicForm.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
	}

	// this.loginToInternalToken();

	this.logTrace("CRLCreateBasicForm.initXPComServiceInfo():................End.");
    },


    initOnLoad : function () 
    {
	this.logTrace("CRLCreateBasicForm.initOnLoad():................Start.");

	if ((window.arguments) && (window.arguments.length > 0)) {
	    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    this.mDialogParams = dialogParams;
	}

	this.initXPComServiceInfo();

	this.initWithDefaultValues();
	this.initWithDialogParams();
	
	this.handleCACertPickerChange(this.mCACertPickerElem);

	this.logTrace("CRLCreateBasicForm.initOnLoad():................End.");
    },

    removeNonCACerts : function (aCACertPickerElem) 
    {
	// We have to  manually temove non-CA user cert becuase 
	// NSS considers all self-signed cert as Root cert which in turn is considered as CA cert.
	this.logTrace("CRLCreateBasicForm.removeNonCACerts():................Start.");

        var certListMenuElem = aCACertPickerElem.certListMenu;

	var /* NodeList */ menuItemNodeList = certListMenuElem.getElementsByTagName("xul:menuitem");
	if (menuItemNodeList.length <= 0) {
	    menuItemNodeList = certListMenuElem.getElementsByTagName("menuitem");
	}

	var foundCACert = false;
	for (var i = (menuItemNodeList.length -1); i >= 0; i--) {
	    var menuItem = menuItemNodeList.item(i);
	    var menuItemX509Cert = menuItem.certRef;
	    if (!menuItemX509Cert) {
		certListMenuElem.removeItemAt(i);
	    	continue;
	    }
	     this.logDebug("CRLCreateBasicForm.removeNonCACerts(): i: " + i + " nickName: " + menuItemX509Cert.nickname);

	    var /* nsIPersistentProperties */ certProps;
	    certProps = Components.classes["@mozilla.org/persistent-properties;1"]
				.createInstance(Components.interfaces.nsIPersistentProperties);
	    this.mKeyManager.exportX509v3CertExtnToProperties(menuItemX509Cert, "basicConstraints", certProps);

            var basicConstraintCA = false;
	    try {
		var basicConstraintActive = certProps.getStringProperty("basicConstraints");
		if (basicConstraintActive == "true") {
		    var basicConstraintCAStr = certProps.getStringProperty("basicConstraints-cA-radio");
		    if (basicConstraintCAStr == "true") {
		    	basicConstraintCA = true;
		    }
		}
	     } catch (ex) {}
	     this.logDebug("initCASignerCertProps(): removeNonCACerts: nickName: " + menuItemX509Cert.nickname + " basicConstraintCA: " + basicConstraintCA + "");
	     if (!basicConstraintCA) {
	     	if (certListMenuElem.selectedIndex == i) {
		    certListMenuElem.selectedIndex = -1;
		}
		certListMenuElem.removeItemAt(i);
	    	continue;
	     }
	     foundCACert = true;
    	}
	if (!foundCACert) {
	    certListMenuElem.selectedIndex = -1;
	}

	this.logTrace("CRLCreateBasicForm.removeNonCACerts():................End.");
    },

    initWithDefaultValues : function () 
    {
	this.logTrace("CRLCreateBasicForm.initWithDefaultValues():................Start.");

	this.mCreateCRLFormVBoxElem	= document.getElementById('keymgr.crltool.create.crl.basic.vbox');

	var certDateTimePickerElems = this.mCreateCRLFormVBoxElem.getElementsByTagName("certdatetimepicker"); 
	for (var i = 0; i < certDateTimePickerElems.length; i++) {
	    var certDateTimePickerElem = certDateTimePickerElems.item(i);
	    certDateTimePickerElem.refresh();
	}

	this.mCreateCRLBasicGridElem	= document.getElementById('keymgr.crltool.create.crl.basic.grid');

	this.mCACertPickerElem		= document.getElementById('keymgr.crltool.create.crl.ca.certpicker');
	this.mCACertItemElem		= document.getElementById('keymgr.crltool.create.crl.ca.certitem');
	this.mCRLTokenElem		= document.getElementById('keymgr.crltool.create.crl.token');
	this.mCRLSignatureAlgorithmElem	= document.getElementById('keymgr.crltool.create.crl.sigAlgName');
	this.mCRLLastUpdateDateElem	= document.getElementById('keymgr.crltool.create.crl.lastUpdateDate');
	this.mCRLNextUpdateDateElem	= document.getElementById('keymgr.crltool.create.crl.nextUpdateDate');
	this.mCRLNumberOptionsElem	= document.getElementById('keymgr.crltool.create.crl.crlNumber.group');
	this.mCRLNumberOptionInputElem	= document.getElementById('keymgr.crltool.create.crl.crlNumber.input');
	this.mCRLNumberValueElem	= document.getElementById('keymgr.crltool.create.crl.crlNumber.value');
	this.mCRLAuthKeyIdRowElem	= document.getElementById('keymgr.crltool.create.crl.authKeyId.row');
	this.mCRLAuthKeyIdElem		= document.getElementById('keymgr.crltool.create.crl.authKeyId');

	this.mRevokedCertsGridElem	= document.getElementById('keymgr.crltool.create.crlentry.grid');
	this.mCRLEntryListTreeElem	= document.getElementById('keymgr.crltool.create.crl.entrylist');


	this.mRevokedCertSerialNumsElem	= document.getElementById('keymgr.crltool.create.crl.revokedCertSerialNumbers');
	this.mCertRevocationDateElem	= document.getElementById('keymgr.crltool.create.crl.certRevocationDate');
	this.mCRLEntryReasonCodeElem	= document.getElementById('keymgr.crltool.create.crl.crlEntryReasonCode');
	this.mCRLEntryReasonCodeElem.refresh();
	this.mCRLEntryInvalidDateElem	= document.getElementById('keymgr.crltool.create.crl.crlEntryInvalidDate');

	this.removeNonCACerts(this.mCACertPickerElem);

	do {
	    var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
	    try {
		var prefBranchPrefixId = "extensions.avpki.crltool.";
		var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
		if (!prefsBranch) {
		    break;
		}

		var prefStringValue = null;
		var prefBoolValue = false;
                var prefIntValue = false;

                prefIntValue = false;
		try {
		    prefIntValue = prefsBranch.getIntPref("loglevel");
		    if (prefIntValue > 0) {
		    	this.mMaxLogLevel = prefIntValue;
		    }
		} catch (ex) {} 


		prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("issuer");
		} catch (ex) {} 
		if (prefStringValue && (prefStringValue != "")) {
		    this.mCACertPickerElem.value = prefStringValue;
		}

		prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("reasoncode");
		} catch (ex) {} 
		this.logDebug("CRLCreateBasicForm.initWithDefaultValues(): reasoncode: " + prefStringValue + "");
		if (prefStringValue && (prefStringValue != "")) {
		    this.mCRLEntryReasonCodeElem.value = prefStringValue;
		}

		prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("sigAlgName");
		} catch (ex) {} 
		if (prefStringValue && (prefStringValue != "")) {
		    this.mCRLSignatureAlgorithmElem.value = prefStringValue;
		}

		prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("useauthkeyid");
		} catch (ex) {} 
		this.mCRLAuthKeyIdElem.checked = prefBoolValue;

	    } catch (ex) {
		// this.logDebug("CRLCreateBasicForm.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);


	this.logTrace("CRLCreateBasicForm.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
	this.logTrace("CRLCreateBasicForm.initWithDialogParams():................Start.");

	if (!(window.arguments) || (window.arguments.length <= 0)) {
	    this.logTrace("CRLCreateBasicForm.initWithDialogParams():................End(0).");
	    return;
	}

	var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);

	var mode = dialogParams.GetString(0);
	if (!mode) {
	    mode = "create";
	}
	this.mMode = mode;
	this.logTrace("CRLCreateBasicForm.initWithDialogParams(): mode: " + mode);

	// CRL Info
	if (mode == "view") {
	    this.mCRLLastUpdateDateElem.setAttribute("readonly", true);
	    this.mCRLNextUpdateDateElem.setAttribute("readonly", true);
	    // this.mCRLNumberValueElem.setAttribute("readonly", true);
	    this.mCRLNumberValueElem.disabled = true;
	    this.mCRLNumberOptionsElem.hidden = true;
	}
	else if (mode == "edit") {
	    this.mCRLNumberOptionsElem.hidden = true;
	}

	// CRL Entry List 
	if (mode == "create") {
	    this.mCRLNextUpdateDateElem.value = "";
	    this.mCRLAuthKeyIdRowElem.hidden = false;

	    this.mRevokedCertsGridElem.hidden = false;
	    this.mCRLEntryInvalidDateElem.value = "";

	    this.mCRLEntryListTreeElem.hidden = true;
	}
	else {
	    this.mCRLAuthKeyIdRowElem.hidden = true;

	    this.mRevokedCertsGridElem.hidden = true;
	    this.mCRLEntryListTreeElem.hidden = false;
	    if (mode == "view") {
	    	this.mCRLEntryListTreeElem.setAttribute("readonly", true);
	    }
	    else {
	    	this.mCRLEntryListTreeElem.removeAttribute("readonly");
	    }
	}

	var certDateTimePickerElems = this.mCreateCRLFormVBoxElem.getElementsByTagName("certdatetimepicker"); 
	for (var i = 0; i < certDateTimePickerElems.length; i++) {
	    var certDateTimePickerElem = certDateTimePickerElems.item(i);
	    if (mode == "view") {
	    	certDateTimePickerElem.removeAttribute("valuehidden");
	    }
	    /*
	    else {
	    	certDateTimePickerElem.setAttribute("valuehidden", true);
	    }
	    */
	}

	if (mode == "create") {
	    this.logTrace("CRLCreateBasicForm.initWithDialogParams():................End(1).");
	    return;
	}

	var selectedCRL = null;
	var pkiParams = null;
	try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    if (pkiParams) {
		var paramCRL = pkiParams.getISupportAtIndex(1);
		if (paramCRL) {
		    this.logDebug("CRLCreateBasicForm.initWithDialogParams(): paramCRL: " + paramCRL);
		    selectedCRL = paramCRL.QueryInterface(Components.interfaces.alrICRL);
		}
	    }
	} catch (ex) {
    	    this.logError("CRLCreateBasicForm.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}
	this.logTrace("CRLCreateBasicForm.initWithDialogParams(): selectedCRL: " + selectedCRL);

	if (selectedCRL) {
	    this.initWithCRL(selectedCRL, mode);
	}

	this.logTrace("CRLCreateBasicForm.initWithDialogParams():................End.");
    },

    initWithCRL : function ( /* alrICRL */ aCRL, mode) 
    {
	this.logTrace("CRLCreateBasicForm.initWithCRL():................Start.");

	this.mSelectedCRL = aCRL;

	// this.removeNonCACerts(this.mCACertPickerElem);
	this.mCACertPickerElem.selectedCert = aCRL.issuer;
	this.mCACertPickerElem.setAttribute("certmenudisabled", true);
	this.mCACertPickerElem.setAttribute("hidden", true);

	this.mCACertItemElem.cert = aCRL.issuer;
	this.mCACertItemElem.removeAttribute("hidden");

	this.mCRLTokenElem.token = aCRL.token;
	this.mCRLTokenElem.disabled = true;

	this.mCRLSignatureAlgorithmElem.value = aCRL.signatureAlgorithm;
	this.mCRLSignatureAlgorithmElem.disabled = true;

	var lastUpdateDateInMicroSec = aCRL.lastUpdate; // PRTime is in micro-seconds - see .../mozilla/nsprpub/pr/include/nspr.h for more info.
	var lastUpdateDateInMiliSec = lastUpdateDateInMicroSec/1000;
	try {
	    var lastUpdateDateValue = new Date();
	    lastUpdateDateValue.setTime(lastUpdateDateInMiliSec);
	    this.mCRLLastUpdateDateElem.dateValue = lastUpdateDateValue;
	} catch (ex) {
	    this.logDebug("this.mCRLLastUpdateDateElem init failed - ex: " + ex);
	    this.mCRLLastUpdateDateElem.value = "";
	}


	/*
	this.mCRLNextUpdateDateElem.value = aCRL.nextUpdateLocale;
	*/
	var nextUpdateDateInMicroSec = aCRL.nextUpdate;
	if (nextUpdateDateInMicroSec > 0) {
	    var nextUpdateDateInMiliSec = nextUpdateDateInMicroSec/1000;
	    try {
	        var nextUpdateDateValue = new Date();
	        nextUpdateDateValue.setTime(nextUpdateDateInMiliSec);
	        this.mCRLNextUpdateDateElem.dateValue = nextUpdateDateValue;
	    } catch (ex) {
	        this.mCRLNextUpdateDateElem.value = "";
	    }
	}
	else {
	        this.mCRLNextUpdateDateElem.value = "";
	}

	this.mCRLNumberValueElem.value = aCRL.crlNumber;
	if (aCRL.crlNumber != "") {
	    this.mCRLNumberOptionsElem.selectedItem = this.mCRLNumberOptionInputElem;
	}

	this.mCRLEntryListTreeElem.initCRL(aCRL);

	// this.mCRLAuthKeyIdElem.checked = aCRL.hasAuthKeyId;

	this.logTrace("CRLCreateBasicForm.initWithCRL():................End.");
    },

    handleTextboxChange : function (aTextboxElem, ev) 
    {
	this.logTrace("CRLCreateBasicForm.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = this.trim(aTextboxElem.value);
	}

	/*
	if (ev) {
	    this.textFieldAutoCompleteAction(aTextboxElem);
	}
	*/

	this.getFormProps();

	this.logTrace("CRLCreateBasicForm.handleTextboxChange():................End.");
    },

    handleCACertPickerChange : function (aCACertPickerElem, ev) 
    {
	this.logTrace("CRLCreateBasicForm.handleCACertPickerChange():................Start.");

	this.mRevokedCertSerialNumsElem.reset();
	this.mRevokedCertSerialNumsModified = false;

	this.mRevokedCertSerialNumsElem.caX509Cert = aCACertPickerElem.selectedCert;


	this.logTrace("CRLCreateBasicForm.handleCACertPickerChange():................End.");
    },

    validateCRLFormData : function () 
    {
	this.logTrace("CRLCreateBasicForm.validateCRLFormData():................Start.");

	if (this.mMode == "view") {
	    // No need to check anything.
	    return true;
	}

	this.logDebug("CRLCreateBasicForm.validateCRLFormData(): this.mLastUpdateDateModified: " + this.mLastUpdateDateModified);
	this.logDebug("CRLCreateBasicForm.validateCRLFormData(): this.mRevokedCertSerialNumsModified: " + this.mRevokedCertSerialNumsModified);
	var formIsValid = false;
	if (this.mMode == "create") {
	    do {
	    	if (!this.mCACertPickerElem.selectedCert) {
		    break;
		}
	    	if (this.mCRLLastUpdateDateElem.value == "") {
		    break;
		}
		if ((this.mRevokedCertSerialNumsElem.value !== "") &&
		    (this.mCertRevocationDateElem.value === "")) {
		    break;
		}
		formIsValid = true;
	    } while (0);
	}
	else if (this.mMode == "edit") {
	    if (this.mLastUpdateDateModified && this.mRevokedCertSerialNumsModified) {
	    	formIsValid = true;
	    }
	}
	this.logDebug("CRLCreateBasicForm.validateCRLFormData(): formIsValid: " + formIsValid);

	this.logTrace("CRLCreateBasicForm.validateCRLFormData():................End.");
	return formIsValid;
    },

    handleLastUpdateDateChange : function (aLastUpdateDateElem, ev) 
    {
	this.logTrace("CRLCreateBasicForm.handleLastUpdateDateChange():................Start.");

	if (aLastUpdateDateElem.value != "") {
	    this.mLastUpdateDateModified = true;
	}
	else {
	    this.mLastUpdateDateModified = false;
	}
	this.logDebug("CRLCreateBasicForm.handleLastUpdateDateChange(): this.mLastUpdateDateModified: " + this.mLastUpdateDateModified);

	this.logTrace("CRLCreateBasicForm.handleLastUpdateDateChange():................End.");
    },

    handleNewCRLEntryChange : function (aNewCRLEntryGridElem, ev) 
    {
	this.logTrace("CRLCreateBasicForm.handleLastUpdateDateChange():................Start.");

	if (this.mRevokedCertSerialNumsElem.value !== "") {
	    this.mRevokedCertSerialNumsModified = true;
	}
	else {
	    this.mRevokedCertSerialNumsModified = false;
	}

	this.logTrace("CRLCreateBasicForm.handleLastUpdateDateChange():................End.");
    },

    handleAddCRLEntry : function (aCRLEntryListTreeElem, ev) 
    {
	this.logTrace("CRLCreateBasicForm.handleAddCRLEntry():................Start.");


	var revokedCertSerialNumsElem	= document.getElementById('keymgr.crltool.create.crl.revokedCertSerialNumbers');
	var /* alrIX509Cert */ caCert = revokedCertSerialNumsElem.caX509Cert;

	var crlEntryAddRemoveURL = "chrome://keymanager/content/tools/crltool/CRLEntryAddDialog.xul";

        var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    				.createInstance(Components.interfaces.nsIPKIParamBlock);
        var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

    	pkiParams.setISupportAtIndex(1, this.mCACertPickerElem.selectedCert);
        window.openDialog(crlEntryAddRemoveURL,
				"",
                      		"chrome,centerscreen,resizable,modal",
				dialogParams
				);
        var success = dialogParams.GetInt(0);
	if (success == 0) {
	    return;
	}
	    var revokedCertSerialNums	= dialogParams.GetString(0); 
	    var revocationDate		= dialogParams.GetString(1); 
	    var revocationReasonCode	= dialogParams.GetString(2); 
	    var certInvalidtyDate	= dialogParams.GetString(3); 
	    this.logTrace("CRLCreateBasicForm.handleAddCRLEntry():\n" + 
	    			"\trevokedCertSerialNums: "	+ revokedCertSerialNums + "\n" + 
	    			"\trevocationDate: "		+ revocationDate + "\n" + 
	    			"\trevocationReasonCode: "	+ revocationReasonCode + "\n" + 
	    			"\tcertInvalidtyDate: "		+ certInvalidtyDate + "\n" + 
				"");

	/*
  	void addRevokedCertCRLEntryList(
                in AString aRevokedCertSerialNumList,
                in AString aRevocationDate,
                in nsIPersistentProperties aCRLProps
                );
	*/

	var propKey = null;
	var propValue = null;
	var propOldValue = null;
	var trueValue = "true";

	var crlEntryProps = Components.classes["@mozilla.org/persistent-properties;1"]
				.createInstance(Components.interfaces.nsIPersistentProperties);

	propKey = "crlEntryReasonCode";
	if (revocationReasonCode == "unspecified") {
	    // Ignore 'unspecified' if it is selected.
	    crlEntryProps.setStringProperty(propKey, "false");
	}
	else {
	    crlEntryProps.setStringProperty(propKey, "true");
	    propKey = "crlEntryReasonCode-value";
	    crlEntryProps.setStringProperty(propKey, revocationReasonCode);
	}

	propKey = "crlEntryInvalidDate";
	var invalidDate = this.trim(certInvalidtyDate);
	if (invalidDate == "") {
	    crlEntryProps.setStringProperty(propKey, "false");
	}
	else {
	    crlEntryProps.setStringProperty(propKey, "true");
	    propKey = "crlEntryInvalidDate-value";
	    crlEntryProps.setStringProperty(propKey, invalidDate);
	}

	try {
	    // Do not save the modified CRL in the DB yet - when we close the
	    // window by pressing Modify button, the CRL will be saved in the DB.
	    var saveToDB = false;
	    this.mSelectedCRL.addRevokedCertCRLEntryList(
				revokedCertSerialNums,
				revocationDate,
				crlEntryProps,
				saveToDB
				);
	} catch (ex) {
	    alert("Failed to add new set of CRL entries - ex: " + ex);
	    return;
	}

	aCRLEntryListTreeElem.refreshCRLEntryTreeView();

	this.mRevokedCertSerialNumsModified = true;

	this.logTrace("CRLCreateBasicForm.handleAddCRLEntry():................End.");
    },

    handleRemoveCRLEntry : function (aCRLEntryListTreeElem, ev) 
    {
	this.logTrace("CRLCreateBasicForm.handleRemoveCRLEntry():................Start.");

	var /* alrICRLEntry */ selectedCRLEntry = aCRLEntryListTreeElem.selectedCRLEntry;

	/*
	alrICRL: 
   	void removeRevokedCertCRLEntryList(
                in AString aRevokedCertSerialNumList
                );
   	void removeRevokedCertCRLEntry(
                in AString aRevokedCertSerialNumber
                );
	*/

	try {
	    // Do not save the modified CRL in the DB yet - when we close the
	    // window by pressing Modify button, the CRL will be saved in the DB.
	    var saveToDB = false;
	    this.mSelectedCRL.removeRevokedCertCRLEntry(
				selectedCRLEntry.serialNumber,
				saveToDB
				);
	} catch (ex) {
	    alert("Failed to remove selected CRL entry - ex: " + ex);
	    return;
	}

	aCRLEntryListTreeElem.refreshCRLEntryTreeView();

	this.mRevokedCertSerialNumsModified = true;
	this.logTrace("CRLCreateBasicForm.handleRemoveCRLEntry():................End.");
    },

    handleAddRemoveCRLEntry : function (aCRLEntryListTreeElem, ev) 
    {
	this.logTrace("CRLCreateBasicForm.handleAddRemoveCRLEntry():................Start.");
	// Filter out all events other than clicks for Add/Remove buttons.
	if (ev.type != "command") {
	   return;
	}

	var origTarget = ev.originalTarget;
	if (origTarget.localName != "button") {
	   return;
	}
	
	if (ev.crlEntryCmd == "add") {
	    this.handleAddCRLEntry(aCRLEntryListTreeElem, ev);
	}
	else if (ev.crlEntryCmd == "remove") {
	    this.handleRemoveCRLEntry(aCRLEntryListTreeElem, ev);
	}
	else {
	    return;
	}
	// Show the 
	var modifyStatusElem	= document.getElementById('keymgr.crltool.create.crl.modify.status');
	modifyStatusElem.removeAttribute("hidden");

	this.logTrace("CRLCreateBasicForm.handleAddRemoveCRLEntry():................End.");
    },

    getFormProps : function () 
    {
	this.logTrace("CRLCreateBasicForm.getFormProps(): .......................Start.");

	var crlProps = Components.classes["@mozilla.org/persistent-properties;1"]
				.createInstance(Components.interfaces.nsIPersistentProperties);

	var propKey = null;
	var propValue = null;
	var propOldValue = null;
	var trueValue = "true";

	this.logDebug("CRLCreateBasicForm.getFormProps : {");
	var /* NodeList */ certExtnPropElemList = this.mCreateCRLFormVBoxElem.getElementsByAttribute("certPropName", "*");
	for (var i = 0; i < certExtnPropElemList.length; i++) {
	    var certPropElem = certExtnPropElemList.item(i);
	    if (certPropElem == null) {
		continue;
	    }
	    /*
	    this.logDebug("    " + i + " : <" + certPropElem.tagName +
		" anonid=\"" + certPropElem.getAttribute("anonid") + "\"/>");
	    */

	    if (certPropElem.hidden || certPropElem.disabled) {
		continue;
	    }
	    
	    var propKey = certPropElem.getAttribute("certPropName");
	    if ((propKey == null) || (propKey == "")) {
		continue;
	    }
	    // var certPropElemId = certPropElem.getAttribute("anonid");
	    // this.logDebug("    certPropName: " + certPropElemId + " propKey: " + propKey + "");
	    
	    propValue = "";
	    if ((certPropElem.tagName == "xul:checkbox") || (certPropElem.localName == "checkbox")) {
		if (certPropElem.checked) {
		    propValue = trueValue;
		}
	    }
	    else if ((certPropElem.tagName == "xul:textbox") || (certPropElem.localName == "textbox")) {
		propValue = certPropElem.value;
	    }
	    else if ((certPropElem.tagName == "xul:radiogroup") || (certPropElem.localName == "radiogroup")) {
		if (certPropElem.selectedItem) {
		    propValue = certPropElem.selectedItem.value;
		}
	    }
	    else if ((certPropElem.tagName == "xul:radio") || (certPropElem.localName == "radio")) {
		if (certPropElem.selected) {
		    // propValue = certPropElem.value;
		    propValue = trueValue;
		}
	    }
	    else if ((certPropElem.tagName == "xul:menulist") || (certPropElem.localName == "menulist")) {
		propValue = certPropElem.value;
	    }
	    else if ((certPropElem.tagName == "xul:label") || (certPropElem.localName == "label")) {
		 propValue = certPropElem.value;
	    }
	    else if (certPropElem.value) {
		 propValue = certPropElem.value;
	    }
	    if (propValue && (propValue != "")) {
		 propOldValue = crlProps.setStringProperty(propKey, propValue);
		 this.logDebug("    propKey: " + propKey + " propValue: " + propValue + "");
	    }
	}

	if (this.mCRLNumberOptionsElem.selectedItem.value != "") {
	    propKey = "crlNumber";
	    crlProps.setStringProperty(propKey, "true");
	    if (this.mCRLNumberOptionsElem.selectedItem.value == "auto") {
	    	propKey = "crlNumber-auto";
	    	crlProps.setStringProperty(propKey, "false");
	    	propKey = "crlNumber-input";
	    	crlProps.setStringProperty(propKey, "true");
		var crlNumber = (new Date()).getTime();
	    	propKey = "crlNumber-value";
		crlProps.setStringProperty(propKey, (""+crlNumber));
	    }
	}
	else {
	    	propKey = "crlNumber-value";
		crlProps.setStringProperty(propKey, "");
	}


	propKey = "crlEntryReasonCode";
	if (this.mCRLEntryReasonCodeElem.value == "unspecified") {
	    // Ignore 'unspecified' if it is selected.
	    crlProps.setStringProperty(propKey, "false");
	}
	else {
	    crlProps.setStringProperty(propKey, "true");
	}

	propKey = "crlEntryInvalidDate";
	var invalidDate = this.trim(this.mCRLEntryInvalidDateElem.value);
	if (invalidDate == "") {
	    crlProps.setStringProperty(propKey, "false");
	}
	else {
	    crlProps.setStringProperty(propKey, "true");
	}

	this.logDebug("}");
	this.logTrace("CRLCreateBasicForm.getFormProps(): .......................End.");
	this.logTrace("");

    	return crlProps;
    },

    getFormData : function () 
    {
	this.logTrace("CRLCreateBasicForm.getFormData(): .......................Start.");

	var crlFormObj = new Object();

	crlFormObj.token			= this.mCRLTokenElem.token;
	crlFormObj.issuerX509Cert		= this.mCACertPickerElem.selectedCert;
	crlFormObj.signatureAlgorithm		= this.mCRLSignatureAlgorithmElem.value;
	crlFormObj.lastUpdateDate		= this.mCRLLastUpdateDateElem.value;
	crlFormObj.nextUpdateDate		= this.mCRLNextUpdateDateElem.value;
	crlFormObj.crlNumberOption		= this.mCRLNumberValueElem.value;

	var crlLNumberOption = this.mCRLNumberOptionsElem.selectedItem.value;
	if (crlLNumberOption == "") {
	    crlFormObj.crlNumberValue	= "";
	}
	else if (crlLNumberOption == "auto") {
	    var currTime = "" + ((new Date()).getTime() / 1000);
	    var currTimeX = currTime.split(".");
	    crlFormObj.crlNumberValue	= ("" + currTimeX[0]);
	}
	else {
	    crlFormObj.crlNumberValue	= this.mCRLNumberValueElem.value;
	}

	crlFormObj.revokedCertSerialNumList = this.mRevokedCertSerialNumsElem.value;
	crlFormObj.certRevocationDate	= this.mCertRevocationDateElem.value;

	if (this.mMode != "create") {
	    crlFormObj.crlProps = Components.classes["@mozilla.org/persistent-properties;1"]
					.createInstance(Components.interfaces.nsIPersistentProperties);
	    return crlFormObj;
	}

	crlFormObj.crlProps		= this.getFormProps();

	// this.mCRLNumberValueElem	= document.getElementById('keymgr.crltool.create.crl.crlNumber.value');
	// this.mCRLAuthKeyIdElem		= document.getElementById('keymgr.crltool.create.crl.authKeyId');
	// this.mCreateCRLFormVBoxElem;

	this.logTrace("CRLCreateBasicForm.getFormData(): .......................End.");

	return crlFormObj;
    },


    lastMethod : function () 
    {
    }
}

