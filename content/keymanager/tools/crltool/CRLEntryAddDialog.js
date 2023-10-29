/* @(#) $Id: CRLEntryAddDialog.js,v 1.5 2012/10/03 14:20:36 subrata Exp $ */

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


var CRLEntryAddDialog = {


    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,

    mDialogParams			: null,
    mPKIParams				: null,
    mCertPickerElem			: null,

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
	this.logTrace("CRLEntryAddDialog.loginToInternalToken():................Start.");

	var token = null;
	try {
	    token = this.mTokenDB.getInternalKeyToken();
	} catch (ex) {}
	if (!token) {
	    return;
	}
	try {
	    token.login(false);
	    this.logTrace("CRLEntryAddDialog.loginToInternalToken(): successfully logged in to internal-token.");
	} catch (ex) {}

	this.logTrace("CRLEntryAddDialog.loginToInternalToken():................End.");
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
	this.logTrace("CRLEntryAddDialog.initXPComServiceInfo():................Start.");

	// this.loginToInternalToken();

	this.logTrace("CRLEntryAddDialog.initXPComServiceInfo():................End.");
    },


    initOnLoad : function () 
    {
	this.logTrace("CRLEntryAddDialog.initOnLoad():................Start.");

	if ((window.arguments) && (window.arguments.length > 0)) {
	    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    this.mDialogParams = dialogParams;
	}

	this.initXPComServiceInfo();

	this.initWithDefaultValues();
	this.initWithDialogParams();
	
	this.logTrace("CRLEntryAddDialog.initOnLoad():................End.");
    },

    initWithDefaultValues : function () 
    {
	this.logTrace("CRLEntryAddDialog.initWithDefaultValues():................Start.");

	this.mRevokedCertSerialNumsElem	= document.getElementById('keymgr.crltool.create.crl.revokedCertSerialNumbers');
	this.mCertRevocationDateElem	= document.getElementById('keymgr.crltool.create.crl.certRevocationDate');
	this.mCRLEntryReasonCodeElem	= document.getElementById('keymgr.crltool.create.crl.crlEntryReasonCode');
	this.mCRLEntryReasonCodeElem.refresh();
	this.mCRLEntryInvalidDateElem	= document.getElementById('keymgr.crltool.create.crl.crlEntryInvalidDate');

	this.mCRLEntryAddDialogGridElem	= document.getElementById('keymgr.crltool.create.crlentry.grid');
	var certDateTimePickerElems = this.mCRLEntryAddDialogGridElem.getElementsByTagName("certdatetimepicker"); 
	for (var i = 0; i < certDateTimePickerElems.length; i++) {
	    var certDateTimePickerElem = certDateTimePickerElems.item(i);
	    certDateTimePickerElem.refresh();
	}
	this.logTrace("CRLEntryAddDialog.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
	this.logTrace("CRLEntryAddDialog.initWithDialogParams():................Start.");

	if (!(window.arguments) || (window.arguments.length <= 0)) {
	    this.logTrace("CRLEntryAddDialog.initWithDialogParams():................End(0).");
	    return;
	}

	var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);

	var mode = dialogParams.GetString(0);
	if (!mode) {
	    mode = "create";
	}
	this.logTrace("CRLEntryAddDialog.initWithDialogParams(): mode: " + mode);

	var paramCAX509Cert = null;
	var pkiParams = null;
	try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    this.mPKIParams = pkiParams;
	    if (pkiParams) {
		var x509Cert = pkiParams.getISupportAtIndex(1);
		if (x509Cert) {
		    this.logDebug("CRLEntryAddDialog.initWithDialogParams(): x509Cert: " + x509Cert);
		    paramCAX509Cert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
		}
	    }
	} catch (ex) {
    	    this.logError("CRLEntryAddDialog.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}
	this.logTrace("CRLEntryAddDialog.initWithDialogParams(): paramCAX509Cert: " + paramCAX509Cert);

	if (paramCAX509Cert) {
	    this.mRevokedCertSerialNumsElem.caX509Cert = paramCAX509Cert;;
	}

	this.logTrace("CRLEntryAddDialog.initWithDialogParams():................End.");
    },

    doOK : function () 
    {
	if (this.mPKIParams) {
	    this.mDialogParams.SetInt(0, 1);
	    this.mDialogParams.SetString(0, this.mRevokedCertSerialNumsElem.value);
	    this.mDialogParams.SetString(1, this.mCertRevocationDateElem.value);
	    this.mDialogParams.SetString(2, this.mCRLEntryReasonCodeElem.value);
	    this.mDialogParams.SetString(3, this.mCRLEntryInvalidDateElem.value);
	}
	window.close();
    },

    doCancel : function () 
    {
	if (this.mPKIParams) {
	    this.mDialogParams.SetInt(0, 0);
	}
	window.close();
    },

    lastMethod : function () 
    {
    }
}

