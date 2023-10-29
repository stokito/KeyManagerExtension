/* @(#) $Id: CRLCreateForm.js,v 1.11 2012/10/07 17:20:17 subrata Exp $ */

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


var CRLCreateForm = {


    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,
    mCRLManager : null,

    mDialogParams			: null,

    mMode  			: false,
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
	// this.mMaxLogLevel = 9;
        this.logTrace("CRLCreateForm.loginToInternalToken():................Start.");

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
	    	this.logDebug("CRLCreateForm.loginToInternalToken():  unable to obtain preferences - ex: " + ex);
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
            this.logTrace("CRLCreateForm.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("CRLCreateForm.loginToInternalToken():................End.");
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
        this.logTrace("CRLCreateForm.initXPComServiceInfo():................Start.");

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

            this.mCRLManager = Components.classes["@avaya.com/pkm/alrcrlmanager;1"]
				.getService(Components.interfaces.alrICRLManager);

        } catch (ex) {
    	    alert("CRLCreateForm.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("CRLCreateForm.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	this.loginToInternalToken();

	this.logTrace("CRLCreateForm.initXPComServiceInfo():................End.");
    },


    initOnLoad : function () 
    {
    	this.logTrace("CRLCreateForm.initOnLoad():................Start.");

    	this.logTrace("CRLCreateForm.initOnLoad(): window.arguments: " + window.arguments);

        if ((window.arguments) && (window.arguments.length > 0)) {
            var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    this.mDialogParams = dialogParams;
	}
    	this.logTrace("CRLCreateForm.initOnLoad():...................10.");

	this.initXPComServiceInfo();

	this.initWithDefaultValues();
	this.initWithDialogParams();

	CRLCreateBasicForm.initOnLoad();
	
	this.validateFormData();

    	this.logTrace("CRLCreateForm.initOnLoad():................End.");
    },

    initWithDefaultValues : function () 
    {
    	this.logTrace("CRLCreateForm.initWithDefaultValues():................Start.");

    	this.mCRLFormElem	= document.getElementById('keymgr.crltool.create.crl.basic.vbox');

	/*
    	this.mOutCRLFileGridElem	= document.getElementById('keymgr.crltool.create.crl.outfile.grid');
    	this.mCRLFileSaveOptionElem	= document.getElementById('keymgr.crltool.create.crl.save');
    	this.mOutCRLFilePickerRowElem	= document.getElementById('keymgr.crltool.create.crl.outfile.row');
    	this.mOutCRLFilePickerElem	= document.getElementById('keymgr.crltool.create.crl.outfile.path');
	*/

    	this.mCmdCreateElem	= document.getElementById('keymgr.crltool.create.crl.cmd.create');
    	this.mCmdModifyElem	= document.getElementById('keymgr.crltool.create.crl.cmd.modify');
    	this.mCmdCloseElem	= document.getElementById('keymgr.crltool.create.crl.cmd.close');
    	this.mCmdCancelElem	= document.getElementById('keymgr.crltool.create.crl.cmd.cancel');
    	this.mCmdHelpElem	= document.getElementById('keymgr.crltool.create.crl.cmd.help');


	do {
            var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
            try {
                var prefBranchPrefixId = "extensions.avpki.crltool.create.";
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

		/*

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("xxxxx");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mXXXXX = prefStringValue;
	        }


                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("xxxxx");
		} catch (ex) {} 
	        this.mXXXX.checked = prefBoolValue;
		*/

            } catch (ex) {
	    	this.logDebug("CRLCreateForm.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);

	// this.handleCRLFileSaveOptionChange(this.mCRLFileSaveOptionElem);


    	this.logTrace("CRLCreateForm.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	this.logTrace("CRLCreateForm.initWithDialogParams():................Start.");
    	this.logTrace("CRLCreateForm.initWithDialogParams(): window.arguments: " + window.arguments);

        if (!(window.arguments) || (window.arguments.length <= 0)) {
    	    this.logTrace("CRLCreateForm.initWithDialogParams():................End(0).");
	    return;
	}

        var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);

	var mode = dialogParams.GetString(0);
	if (!mode) {
	    mode = "create";
	}
	this.mMode = mode;
    	this.logDebug("CRLCreateForm.initWithDialogParams(): mode: " + mode);

	if (mode == "view") {
	    this.mCmdCreateElem.hidden = true;
	    this.mCmdModifyElem.hidden = true;
	    this.mCmdCloseElem.hidden = false;
	    this.mCmdCancelElem.hidden = true;
	    // this.mOutCRLFileGridElem.hidden = true;
	}
	else if (mode == "edit") {
	    this.mCmdCreateElem.hidden = true;
	    this.mCmdModifyElem.hidden = false;
	    this.mCmdCloseElem.hidden = true;
	    this.mCmdCancelElem.hidden = false;
	    // this.mOutCRLFileGridElem.hidden = true;
	}
	else {
	    this.mCmdCreateElem.hidden = false;
	    this.mCmdModifyElem.hidden = true;
	    this.mCmdCloseElem.hidden = true;
	    this.mCmdCancelElem.hidden = false;
	    // this.mOutCRLFileGridElem.hidden = false;
	}

	var selectedCRL = null;
        var pkiParams = null;
	try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    if (pkiParams) {
	        var paramCRL = pkiParams.getISupportAtIndex(1);
	        if (paramCRL) {
		    this.logDebug("CRLCreateForm.initWithDialogParams(): paramCRL: " + paramCRL);
	            selectedCRL = paramCRL.QueryInterface(Components.interfaces.alrICRL);
	        }
	    }
	} catch (ex) {
    	    this.logError("CRLCreateForm.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}
	this.mSelectedCRL = selectedCRL;

    	this.logTrace("CRLCreateForm.initWithDialogParams():................End.");
    },

    handleTextboxChange : function (aTextboxElem, ev) 
    {
    	this.logTrace("CRLCreateForm.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = this.trim(aTextboxElem.value);
	}

    	this.logTrace("CRLCreateForm.handleTextboxChange():................End.");
    },

    validateFormData : function (aFormVBoxElem, ev) 
    {
    	this.logTrace("CRLCreateForm.validateFormData():................Start.");

	if (this.mMode == "view") {
	    return;
	}

	var formValidation = CRLCreateBasicForm.validateCRLFormData();
	if (this.mMode == "edit") {
    	    this.mCmdModifyElem.disabled = !formValidation;
	}
	else if (this.mMode == "create") {
    	    this.mCmdCreateElem.disabled = !formValidation;
	}

    	this.logTrace("CRLCreateForm.validateFormData():................End.");
    },


    handleCRLFileSaveOptionChange : function (aCRLFileSaveOptionElem, ev) 
    {
    	this.logTrace("CRLCreateForm.handleTextboxChange():................Start.");

	// this.mOutCRLFilePickerRowElem.hidden = !aCRLFileSaveOptionElem.checked;

    	this.logTrace("CRLCreateForm.handleTextboxChange():................End.");
    },

    createCRL : function () 
    {
    	this.logTrace("CRLCreateForm.createCRL():................Start.");

    	var crlFormObj = CRLCreateBasicForm.getFormData();
	/*
  	alrICRL createCRL(
                in nsISupports aToken,
                in nsIX509Cert aIssuerX509Cert,
                in AString aSignatureAlgName,
                in AString aLastUpdateDate,
                in AString aNextUpdateDate,
                in AString aCRLNumber,
                in AString aRevokedCertSerialNumList,
                in AString aCertRevocationDate,
                in nsIPersistentProperties aCRLProps
                );
	*/

	var crl = null;
	try {
	    crl = this.mCRLManager.createCRL(
				crlFormObj.token,
				crlFormObj.issuerX509Cert,
				crlFormObj.signatureAlgorithm,
				crlFormObj.lastUpdateDate,
				crlFormObj.nextUpdateDate,
				// crlFormObj.crlNumberOption,
				crlFormObj.crlNumberValue,
				crlFormObj.revokedCertSerialNumList,
				crlFormObj.certRevocationDate,
				crlFormObj.crlProps
				);
	} catch (ex) {
    	    this.logError("CRLCreateForm.createCRL(): this.mCRLManager.createCRL() failed - ex: " + ex);
	    alert("this.mCRLManager.createCRL() failed - ex: " + ex);
	    return;
	}

	if (this.mDialogParams) {
	    this.mDialogParams.SetInt(0, 1); // 1 ==> Success
            var pkiParams = null;
	    try {
	        pkiParams = this.mDialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	        if (pkiParams) {
	            pkiParams.setISupportAtIndex(1, crl);
	    	}
	    } catch (ex) {
    	        this.logError("CRLCreateForm.createCRL() pkiParams.setISupportAtIndex() failed - ex: "+ ex);
	    }
	}

	window.close();
    	this.logTrace("CRLCreateForm.createCRL():................End.");
    },

    modifyCRL : function () 
    {
    	this.logTrace("CRLCreateForm.modifyCRL():................Start.");

    	var crlFormObj = CRLCreateBasicForm.getFormData();


	try {
	    if (crlFormObj.crlNumberValue == "") {
    	    	this.mSelectedCRL.saveCRLToDB(
                        	crlFormObj.lastUpdateDate,
                        	crlFormObj.nextUpdateDate
				);
	    }
	    else {
		var revokedCertSerialNumList = "";
		var certRevocationDate = "";
		var sigAlg = "";
    	    	this.mSelectedCRL.modifyCRLSimple(
                        	crlFormObj.lastUpdateDate,
                        	crlFormObj.nextUpdateDate,
                        	crlFormObj.crlNumberValue,
                        	revokedCertSerialNumList,
                        	certRevocationDate,
                        	sigAlg,
                        	crlFormObj.crlProps
                        	);
	    }
	} catch (ex) {
    	    this.logError("CRLCreateForm.modifyCRL(): this.mCRLManager.modifyCRLSimple() failed - ex: " + ex);
	    alert("this.mCRLManager.modifyCRLSimple() failed - ex: " + ex);
	    return;
	}

	if (this.mDialogParams) {
	    this.mDialogParams.SetInt(0, 1); // 1 ==> Success
	}

	window.close();
    	this.logTrace("CRLCreateForm.modifyCRL():................End.");
    },

    cmdHelp : function () 
    {
    },

    cmdCancel : function () 
    {
	if (this.mDialogParams) {
	    this.mDialogParams.SetInt(0, 0);
	}
    	window.close();
    },

    cmdClose : function () 
    {
	if (this.mDialogParams) {
	    this.mDialogParams.SetInt(0, 0);
	}
    	window.close();
    },

    lastMethod : function () 
    {
    }
}

