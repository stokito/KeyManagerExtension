/* @(#) $Id: SignTextWizard.js,v 1.6 2012/10/07 17:21:02 subrata Exp $ */

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
 *     Subrata Mazumdar, Avaya Labs Research, Avaya Inc.
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



var gParams = null;
var gPkiParams = null;

var gWizardButtonNextElem;
var gWizardButtonFinishElem;
var gWizardButtonExtra1Elem;

var SignTextWizard = {


    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,

    mDialogParams		: null,
    mWizardInitalized		: false,
    mShellCmdPath		: null,

    mWizardElem			: null,

    mTestMode 			: false,

    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > SignTextWizard.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    logError : function(msg)
    {
        SignTextWizard.log(2, msg);
    },
    logTrace : function(msg)
    {
        SignTextWizard.log(4, msg);
    },
    logDebug : function(msg)
    {
        SignTextWizard.log(8, msg);
    },

    loginToInternalToken : function () 
    {
	// SignTextWizard.mMaxLogLevel = 9;
        SignTextWizard.logTrace("SignTextWizard.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = SignTextWizard.mTokenDB.getInternalKeyToken();
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
	    	SignTextWizard.logDebug("SignTextWizard.loginToInternalToken():  unable to obtain preferences - ex: " + ex);
		break;
	    }

	} while (0);

	if (testOption && testPassword) {
            /**********************************************/
            /* TODO:  TEST CODE - remove after test phase */
            /**********************************************/
	    SignTextWizard.mTestMode = testOption;
	    try {
	    	token.checkPassword(testPassword);
            } catch (ex) {}
	}

	try {
            token.login(false);
            SignTextWizard.logTrace("SignTextWizard.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        SignTextWizard.logTrace("SignTextWizard.loginToInternalToken():................End.");
	// SignTextWizard.mMaxLogLevel = 4;
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
    	SignTextWizard.logTrace("SignTextWizard.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = SignTextWizard.trim(aTextboxElem.value);
	}

    	SignTextWizard.logTrace("SignTextWizard.handleTextboxChange():................End.");
    },


    initXPComServiceInfo : function ()
    {
        SignTextWizard.logTrace("SignTextWizard.initXPComServiceInfo():................Start.");

        try {
    	    SignTextWizard.mIOService = Components.classes["@mozilla.org/network/io-service;1"]
		    		.getService(Components.interfaces.nsIIOService);
	    SignTextWizard.mDirService = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties);
	    SignTextWizard.mX509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
	                        .getService(Components.interfaces.nsIX509CertDB);
            SignTextWizard.mTokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
                                .getService(Components.interfaces.nsIPK11TokenDB);
	    SignTextWizard.mKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
	                        .getService(Components.interfaces.alrIKeyManager);
	    /*
            SignTextWizard.mCRLManager = Components.classes["@avaya.com/pkm/alrcrlmanager;1"]
				.getService(Components.interfaces.alrICRLManager);
	     */
        } catch (ex) {
    	    alert("SignTextWizard.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    SignTextWizard.logError("SignTextWizard.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	SignTextWizard.loginToInternalToken();

	SignTextWizard.logTrace("SignTextWizard.initXPComServiceInfo():................End.");
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
    	SignTextWizard.logTrace("SignTextWizard.initWithDefaultValues():................Start.");

	do {
            var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
            try {
                var prefBranchPrefixId = "keymgr.signtext.";
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
		    prefStringValue = prefsBranch.getCharPref("ca");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    SignTextWizard.mShellCmdPath = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("genkeyoption");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    SignTextWizard.mGenKeyOptionName = prefStringValue;
	        }
		*/

                prefIntValue = false;
		try {
		    prefIntValue = prefsBranch.getIntPref("loglevel");
	            SignTextWizard.mMaxLogLevel = prefIntValue;
		} catch (ex) {} 

		/*
                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("loglevel");
		} catch (ex) {} 
	        SignTextWizard.mXXXX.checked = prefBoolValue;
		*/

            } catch (ex) {
	    	SignTextWizard.logDebug("SignTextWizard.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);

    	SignTextWizard.logTrace("SignTextWizard.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	SignTextWizard.logTrace("SignTextWizard.initWithDialogParams():................Start.");
    	// SignTextWizard.logTrace("SignTextWizard.initWithDialogParams(): window.arguments: " + window.arguments);

        if (!(window.arguments) || (window.arguments.length <= 0)) {
    	    SignTextWizard.logTrace("SignTextWizard.initWithDialogParams():................End(0).");
	    return;
	}

        var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);

	var mode = dialogParams.GetString(0);

        var pkiParams = null;
	try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    if (pkiParams) {
		/*
	        var paramCRL = pkiParams.getISupportAtIndex(1);
	        if (paramCRL) {
		    SignTextWizard.logDebug("SignTextWizard.initWithDialogParams(): paramCRL: " + paramCRL);
	            selectedCRL = paramCRL.QueryInterface(Components.interfaces.alrICRL);
	        }
		*/
	    }
	} catch (ex) {
    	    SignTextWizard.logError("SignTextWizard.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}

    	SignTextWizard.logTrace("SignTextWizard.initWithDialogParams():................End.");
    },

    initOnLoad : function () 
    {
    	SignTextWizard.logTrace("SignTextWizard.initOnLoad():................Start.");

    	// SignTextWizard.logTrace("SignTextWizard.initOnLoad(): window.arguments: " + window.arguments);

        if ((window.arguments) && (window.arguments.length > 0)) {
            var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    SignTextWizard.mDialogParams = dialogParams;
	}
    	SignTextWizard.logTrace("SignTextWizard.initOnLoad():...................10.");


    	SignTextWizard.mWizardElem = document.getElementById('keymgr.signtext.wizard');

	SignTextWizard.initXPComServiceInfo();

	SignTextWizard.initWithDefaultValues();
	SignTextWizard.initWithDialogParams();

    	SignTextWizard.logTrace("SignTextWizard.initOnLoad():................End.");
    },

    finishPageShow : function (aWizardPageElem)
    {
    	SignTextWizard.logTrace("SignTextWizard.finishPageShow():................Start.");
    	SignTextWizard.logTrace("SignTextWizard.finishPageShow():................Start.");
    },

    finishPageAdvanced : function (aWizardPageElem)
    {
    	SignTextWizard.logTrace("SignTextWizard.finishPageAdvanced():................Start.");
    	SignTextWizard.logTrace("SignTextWizard.finishPageAdvanced():................Start.");
    },

    errorPageShow : function (aWizardPageElem) 
    {
        return true;
    },

    onFinish : function (aSignTextWizardElem)
    {
    	SignTextWizard.logTrace("SignTextWizard.onFinish():................Start.");
    	SignTextWizard.logTrace("SignTextWizard.onFinish():................Start.");
    },

    onCancel : function (aSignTextWizardElem)
    {
    	SignTextWizard.logTrace("SignTextWizard.onCancel():................Start.");
    	SignTextWizard.logTrace("SignTextWizard.onCancel():................Start.");
    },

    lastMethod : function () 
    {
    }
}

