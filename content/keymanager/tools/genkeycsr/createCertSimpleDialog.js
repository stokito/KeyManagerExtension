/* @(#) $Id: createCertSimpleDialog.js,v 1.6 2012/10/03 14:20:37 subrata Exp $ */

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



const nsIDialogParamBlock = Components.interfaces.nsIDialogParamBlock;
const nsDialogParamBlock = "@mozilla.org/embedcomp/dialogparam;1";



var CreateCertSimpleDialog = {

    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,

    mX509SubjectElem : null,

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
        this.logTrace("CreateCertSimpleDialog.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = this.mTokenDB.getInternalKeyToken();
        } catch (ex) {}
	if (!token) {
            this.logTrace("CreateCertSimpleDialog.loginToInternalToken():................End(0).");
	    return;
	}

	try {
            token.login(false);
            this.logTrace("CreateCertSimpleDialog.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("CreateCertSimpleDialog.loginToInternalToken():................End.");
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
        this.logTrace("CreateCertSimpleDialog.initXPComServiceInfo():................Start.");

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
    	    alert("CreateCertSimpleDialog.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("CreateCertSimpleDialog.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	// this.loginToInternalToken();

	this.logTrace("CreateCertSimpleDialog.initXPComServiceInfo():................End.");
    },

    initWithDefaultValues : function () 
    {
    	this.logTrace("CreateCertSimpleDialog.initWithDefaultValues():................Start.");

	this.mNewCertValidityDaysElem.value = 365;

    	this.logTrace("CreateCertSimpleDialog.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	this.logTrace("CreateCertSimpleDialog.initWithDialogParams():................Start.");
    	// this.logTrace("CreateCertSimpleDialog.initWithDialogParams(): window.arguments: " + window.arguments);

	if (typeof window.arguments == 'undefined') {
    	    this.logTrace("CreateCertSimpleDialog.initWithDialogParams():................End(0).");
	    return;
	}
        if (!(window.arguments) || (window.arguments.length <= 0)) {
    	    this.logTrace("CreateCertSimpleDialog.initWithDialogParams():................End(1).");
	    return;
	}
	var dialogParams = null;
        dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);

	var certAlias = null;
	var certCN = null;
	var certSubjectDN = null;
	var certKeyType = null;
	var certKeySize = null;
	var certValidityInDays = null;
	var certProfileType = null;
	try {
            var pkiParams = null;
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    if (pkiParams) {
		/*
		var paramCert = null;
		try {
	            paramCert = pkiParams.getISupportAtIndex(1);
		} catch (ex) {
		    this.logError("CreateCertSimpleDialog.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
		}
	        if (paramCert) {
		    this.logDebug("CreateCertSimpleDialog.initWithDialogParams(): paramCert: " + paramCert);
	            selectedCert = paramCert.QueryInterface(Components.interfaces.alrIX509Cert);
	        }
		*/
	    }
	    certSubjectDN = dialogParams.GetString(0);
	    certAlias = dialogParams.GetString(1);
	    certKeyType = dialogParams.GetString(2);
	    certKeySize = dialogParams.GetString(3);
	    certValidityInDays = dialogParams.GetString(4);
	    certProfileType = dialogParams.GetString(5);
	    var paramValue = null;
	} catch (ex) { }

	if (!certAlias) {
	    if (certCN) {
	    	certAlias = certCN;
	    }
	}
	if (certAlias) {
	    this.mNewCertAliasElem.value = certAlias;
	}

	if (!certSubjectDN) {
	    if (certCN) {
	    	certSubjectDN = "CN=" + certCN + "o=dummyorg";
	    }
	    else {
	        if (certAlias) {
	    	    certSubjectDN = "CN=" + certAlias + "o=dummyorg";
	        }
	    }
	}
	if (certSubjectDN) {
	    this.mNewCertSubjectDNElem.value = certSubjectDN;
	    this.handleCreateCertDNChange(this.mNewCertSubjectDNElem);
	}
	if (certKeyType) {
	    this.mNewCertKeyTypeElem.value = certKeyType;
	}
	if (certKeySize) {
	    this.mNewCertKeySizeElem.value = certKeySize;
	}
	if (certValidityInDays) {
	    this.mNewCertValidityDaysElem.value = certValidityInDays;
	    this.handleCreateCertValidityChange(this.mNewCertValidityDaysElem);
	}

    	this.logTrace("CreateCertSimpleDialog.initWithDialogParams():................End.");
    },

    initOnLoad : function ()
    {
    	this.logTrace("CreateCertSimpleDialog.initOnLoad():..................Start.");

    	this.mNewCertDialogElem		= document.getElementById('keymgr.genkeycsr.createcert.simple.dialog');

    	this.mNewCertAliasElem		= document.getElementById('keymgr.genkeycsr.createcert.simple.alias');
    	this.mNewCertSubjectDNElem	= document.getElementById('keymgr.genkeycsr.createcert.simple.subjectdn');
    	this.mNewCertKeyTypeElem	= document.getElementById('keymgr.genkeycsr.createcert.simple.keytype');
    	this.mNewCertKeySizeElem	= document.getElementById('keymgr.genkeycsr.createcert.simple.keysize');
    	this.mNewCertSigAlgElem		= document.getElementById('keymgr.genkeycsr.createcert.simple.sigalg');
    	this.mNewCertExpiresOnElem	= document.getElementById('keymgr.genkeycsr.createcert.simple.expireson');
    	this.mNewCertValidityDaysElem	= document.getElementById('keymgr.genkeycsr.createcert.simple.validitydays');

	this.initXPComServiceInfo();
	this.initWithDefaultValues();
	this.initWithDialogParams();

	this.handleCreateCertValidityChange(this.mNewCertValidityDaysElem);
    	this.logTrace("CreateCertSimpleDialog.initOnLoad():..................End.");
    },

    handleSubjectChange : function (aX509SubjectElem, ev)
    {
    	this.logDebug("CreateCertSimpleDialog.handleSubjectChange(): subjectDN: " + this.mX509SubjectElem.subjectDN);
    },

    createCertDialogValidate : function ()
    {
    	this.logTrace("CreateCertSimpleDialog.createCertDialogValidate():..................Start.");

	var okButtonElem = this.mNewCertDialogElem.getButton("accept");


	if ((this.mNewCertAliasElem.value == "") ||
		(this.mNewCertSubjectDNElem.value == "") ||
		(this.mNewCertValidityDaysElem.value == "0") ||
		(this.mNewCertValidityDaysElem.value == "")) {
	    this.mNewCertDialogElem.setAttribute("buttondisabledaccept", true);
	    return false;
	}
	this.mNewCertDialogElem.removeAttribute("buttondisabledaccept");


    	this.logTrace("CreateCertSimpleDialog.createCertDialogValidate():..................End.");
	return true;
    },

    handleCreateCertAliasChange : function (aNewCertAliasElem, ev)
    {
	aNewCertAliasElem.value = this.trim(aNewCertAliasElem.value);

	var alias = aNewCertAliasElem.value;
	if (alias == "") {
	    return;
	}

    	var tmpUserCert = null;
    	try {
    	    tmpUserCert = this.mX509CertDB.findCertByNickname(null, alias);
    	} catch (ex) {tmpUserCert=null;}
    	if (tmpUserCert) {
	    alert("CreateCertSimpleDialog.handleCreateCertAliasChange(): chosen alias already exists in the certificate  database.\n");
	    return null;
    	}
    	this.createCertDialogValidate();
    },

    handleCreateCertDNChange : function (aNewCertSubjectDNElem, ev)
    {
	aNewCertSubjectDNElem.value = this.trim(aNewCertSubjectDNElem.value);
    	this.createCertDialogValidate();
    },

    formatSubjectDN : function (aFormatSubjectButtonElem, ev)
    {
    	this.logTrace("CreateCertSimpleDialog.formatSubjectDN():..................Start.");

    	var dialogParams = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
				.createInstance(Components.interfaces.nsIDialogParamBlock);
    	dialogParams.SetInt(0, 0);
    	dialogParams.SetString(0, this.mNewCertSubjectDNElem.value);
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

	this.mNewCertSubjectDNElem.value = subjectDN;
	this.handleCreateCertDNChange(this.mNewCertSubjectDNElem);
	
    	this.logTrace("CreateCertSimpleDialog.formatSubjectDN():..................End.");
    },


    handleCreateCertKeySizeChange : function (aNewCertKeyTypeElem, ev)
    {
    	this.createCertDialogValidate();
    },

    handleCreateCertKeyTypeChange : function (aNewCertKeySizeElem, ev)
    {
    	this.createCertDialogValidate();
    },

    handleCreateCertSigAlgChange : function (aNewCertSigAlgElem, ev)
    {
    	this.createCertDialogValidate();
    },

    handleCreateCertValidityChange : function (aNewCertValidityDaysElem, ev)
    {
	aNewCertValidityDaysElem.value = this.trim(aNewCertValidityDaysElem.value);
	if (ev) {
	    var validityInDays = parseInt(aNewCertValidityDaysElem.value);
	    if (validityInDays > 0) {
		var now = new Date();
	    	this.mNewCertExpiresOnElem.dateValue = now;
	    	this.mNewCertExpiresOnElem.addDays(validityInDays);
	    }
	}
    	this.createCertDialogValidate();
    },

    handleCreateCertExpiresOnChange : function (aNewCertExpiresOnElem, ev)
    {
    	this.logTrace("CreateCertSimpleDialog.handleCreateCertExpiresOnChange():..................Start.");

	var expireDate = aNewCertExpiresOnElem.dateValue; 
	var now = new Date();
	var timeDiffInMillisecs = (expireDate.getTime() - now.getTime());
	if (timeDiffInMillisecs < 0) {
	    aNewCertExpiresOnElem.dateValue = now;
	    this.mNewCertValidityDaysElem.value = "0";
	    return;
	}

	var timeDiffInDays = (timeDiffInMillisecs / (1000 * (24 * 60 * 60)));
    	this.logDebug("CreateCertSimpleDialog.handleCreateCertExpiresOnChange(): timeDiffInDays: " + timeDiffInDays);
	// var timeDiffInDays = Math.round(timeDiffInDays);
	var timeDiffInDays = Math.ceil(timeDiffInDays);
    	this.logDebug("CreateCertSimpleDialog.handleCreateCertExpiresOnChange(): timeDiffInDays: " + timeDiffInDays);
    	this.logDebug("CreateCertSimpleDialog.handleCreateCertExpiresOnChange(): nssDate: " + aNewCertExpiresOnElem.getNSSDate());
	this.mNewCertValidityDaysElem.value = timeDiffInDays;

    	this.createCertDialogValidate();

    	this.logTrace("CreateCertSimpleDialog.handleCreateCertExpiresOnChange():..................End.");
    },

    dumpProperties : function (aCertProps, msg)
    {
        if (msg) {dump(msg + " ");}
	if (!aCertProps) {
                    dump("Properties {}\n");
		    return;
	}
	var propKeyList = [];
        var propEnum = aCertProps.enumerate();
        while (propEnum.hasMoreElements ()) {
            var propElem = propEnum.getNext ();
            var propItem = propElem.QueryInterface (Components.interfaces.nsIPropertyElement);
            var propKey = propItem.key;
	    propKeyList[propKeyList.length] = propKey;
        }
	if (propKeyList.length <= 0) {
	    dump("Properties {no elements.}\n");
	    return;
	}

	propKeyList = propKeyList.sort();
	dump("Properties {\n");
	for (var i = 0; i < propKeyList.length; i++) {
	    var propKey =  propKeyList[i];
            var propValue = null;
	    try {
	    	propValue = aCertProps.getStringProperty(propKey);
	    } catch(ex) {}
            dump("    " + propKey + " = " + propValue + "\n");
        }
        dump("}\n\n");
    },

    doGenerateNewSelfSignedCert : function ()
    {
    	dump("CreateCertSimpleDialog.doGenerateNewSelfSignedCert(): ........Start.\n");


    	if (!this.createCertDialogValidate()) {
	dump("CreateCertSimpleDialog.doGenerateNewSelfSignedCert(): missing fields : either alias, commonName, or subject.\n");
	alert("CreateCertSimpleDialog.doGenerateNewSelfSignedCert(): missing fields : either alias, commonName, or subject.\n");
    	return null;
    	}

    	var certProps = Components.classes["@mozilla.org/persistent-properties;1"]
				.createInstance(Components.interfaces.nsIPersistentProperties);
    	if (certProps == null) {
	    alert("CreateCertSimpleDialog.doGenerateNewSelfSignedCert(): generation of Self-Sign cert failed invalid form fields.\n");
	    return null;
        }

        var alias = this.mNewCertAliasElem.value;
        var subjectDN = this.mNewCertSubjectDNElem.value;
        try {
            alias = certProps.getStringProperty("nickName");
            subjectDN = certProps.getStringProperty("subject");
        } catch (ex) {}
        if ((!alias) || (!subjectDN)) {
	    alert("CreateCertSimpleDialog.doGenerateNewSelfSignedCert(): generation of Self-Sign cert failed - alias/subject field is not initialized.\n");
	    return null;
        }

        var propKey = null;
        var propValue = null;
        var propOldValue = null;
        var trueValue = "true";
	var certPropElemList = [
			this.mNewCertAliasElem,
			this.mNewCertSubjectDNElem,
			this.mNewCertKeyTypeElem,
			this.mNewCertKeySizeElem,
			this.mNewCertSigAlgElem,
			this.mNewCertValidityDaysElem
			];
	for (var i = 0; i < certPropElemList.length; i++) {
	    var certPropElem = certPropElemList[i];
	    propKey = certPropElem.getAttribute("certPropName"); propValue = certPropElem.value;
	    if (propKey) {
	    	propOldValue = certProps.setStringProperty(propKey, propValue);
	    }
	}
	propKey = "validity_days"; propValue = trueValue;
	propOldValue = certProps.setStringProperty(propKey, propValue);
	this.dumpProperties(certProps);

        var /* nsIX509 */ newCert = null;
        try {
	    newCert = this.mKeyManager.generateKeyAndImportSelfSignCertByForm(
				null,
				alias,
				subjectDN,
				certProps
				);
        } catch (ex) {
	    alert("CreateCertSimpleDialog.doGenerateNewSelfSignedCert(): generation of Self-Sign cert failed - " + ex);
	    dump("CreateCertSimpleDialog.doGenerateNewSelfSignedCert(): generation of Self-Sign cert failed - " + ex + "\n");
	    return null;
        }

        dump("CreateCertSimpleDialog.doGenerateNewSelfSignedCert():.................End.\n");
        return newCert;
    },

    createCert : function ()
    {
    	this.logTrace("CreateCertSimpleDialog.createCert():..................Start.");

	var newCert = this.doGenerateNewSelfSignedCert();
    	this.logTrace("CreateCertSimpleDialog.createCert():..................10.");

    	var pkiParams = null;
    	var dialogParams =  null;
    	if (window.arguments && (window.arguments.length > 0)) {
    	    dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	    try {
	        pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    	    } catch (ex) { }
    	}

	if (dialogParams) {
	    dialogParams.SetInt(0, 0);			// Failure ret-code
	    if (newCert) {
    	        pkiParams.setISupportAtIndex(1, newCert);	// newly created cert
    	        dialogParams.SetInt(0, 1);			// Success ret-code
    	    }
	}

        window.close(0);

    	this.logTrace("CreateCertSimpleDialog.createCert():..................End.");
    },

    cancel : function ()
    {
    	this.logTrace("CreateCertSimpleDialog.cancel():..................Start.");

        var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);

    	var pkiParams = null;
    	var dialogParams =  null;
    	if (window.arguments && (window.arguments.length > 0)) {
    	    dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	    try {
	        pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    	    } catch (ex) { }
    	}
	if (dialogParams) {
            dialogParams.SetInt(0, 0);
	}

        window.close(0);

    	this.logTrace("CreateCertSimpleDialog.cancel():..................End.");
    },

    lastMethod : function () 
    {
    }

}


