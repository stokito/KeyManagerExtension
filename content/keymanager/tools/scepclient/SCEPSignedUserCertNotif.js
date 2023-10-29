/* @(#) $Id: SCEPSignedUserCertNotif.js,v 1.2 2010/03/03 17:01:09 subrata Exp $ */

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


var SCEPSignedUserCertNotif = {


    mDialogParams		: null,

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

    initWithDialogParams : function () 
    {
    	this.logTrace("SCEPSignedUserCertNotif.initWithDialogParams():................Start.");

	if (typeof window.arguments == undefined) {
    	    this.logTrace("SCEPSignedUserCertNotif.initWithDialogParams():................End(0).");
	    return;
	}
        if (!window.arguments || (window.arguments.length <= 0) || !window.arguments[0]) {
    	    this.logTrace("SCEPSignedUserCertNotif.initWithDialogParams():................End(1).");
	    return;
	}


        var pkiParams = null;
	var dialogParams = null;
        dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	try {
	    if (dialogParams) {
	    	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    }
	} catch (ex) {
    	    this.logError("SCEPSignedUserCertNotif.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	    return;
	}
    	var numberOfCerts = dialogParams.GetInt(0);

	var paramUserCert = null;
	var x509Cert = null;
	try {
	    if (pkiParams) {

		x509Cert = null;
	        x509Cert = pkiParams.getISupportAtIndex(1);
	        if (x509Cert) {
	            paramUserCert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }

		x509Cert = null;
	        x509Cert = pkiParams.getISupportAtIndex(2);
	        if (x509Cert) {
	            paramIssuerCert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }

		/*
		x509Cert = null;
	        x509Cert = pkiParams.getISupportAtIndex(1);
	        if (x509Cert) {
	            paramScepRecipientCert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }

		*/
	    }
	} catch (ex) {
    	    this.logError("SCEPSignedUserCertNotif.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}
   	this.logDebug("SCEPSignedUserCertNotif.initWithDialogParams(): {\n" + 
			"    paramUserCert: "		+ paramUserCert + "\n" + 
			"    paramIssuerCert: "		+ paramIssuerCert + "\n" + 
			"}");

	if (paramUserCert) {
	    this.mUserSignedCertItemElem.cert = paramUserCert;
	}
	if (paramIssuerCert) {
	    this.mCACertItemElem.cert = paramIssuerCert;
	}

    	this.logTrace("SCEPSignedUserCertNotif.initWithDialogParams():................End.");
    },

    initOnLoad : function () 
    {
    	this.logTrace("SCEPSignedUserCertNotif.initOnLoad():................Start.");


	if (typeof window.arguments != 'undefined') {
    	    this.logDebug("SCEPSignedUserCertNotif.initOnLoad(): window.arguments: " + window.arguments);
            if (window.arguments && (window.arguments.length > 0) && window.arguments[0]) {
                var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	        this.mDialogParams = dialogParams;
	    }
	}
    	this.logTrace("SCEPSignedUserCertNotif.initOnLoad():...................10.");

    	this.mScepClientSignedCertDialog	= document.getElementById('keymgr.scepclient.signedcert.exists.dialog');
    	this.mUserSignedCertItemElem	= document.getElementById('keymgr.scepclient.signedcert.user.certitem');
    	this.mCACertItemElem		= document.getElementById('keymgr.scepclient.signedcert.ca.certitem');

	this.initWithDialogParams();

    	this.logTrace("SCEPSignedUserCertNotif.initOnLoad():................End.");
    },

    accept : function ()
    {
    	this.logTrace("SCEPSignedUserCertNotif.accept():..................Start.");

        // var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);
    	var pkiParams = null;
    	var dialogParams =  null;
    	if (window.arguments && (window.arguments.length > 0)) {
    	    dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	    try {
	        pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    	    } catch (ex) { }
    	}
	if (dialogParams) {
            dialogParams.SetInt(0, 1);
	}
	
        window.close(0);
    	this.logTrace("SCEPSignedUserCertNotif.accept():..................End.");
    },

    cancel : function ()
    {
    	this.logTrace("SCEPSignedUserCertNotif.cancel():..................Start.");

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

    	this.logTrace("SCEPSignedUserCertNotif.cancel():..................End.");
    },
    lastMethod : function () 
    {
    }
}



