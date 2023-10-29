/* @(#) $Id: OsslKeyCertSyncTool.js,v 1.11 2012/10/07 17:20:50 subrata Exp $ */

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


var OsslKeyCertSyncTool = {

    mTestMode 			: false,

    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,
    /* alrISoftTokenDBManager */ mSoftTokenDBManager : null,

    mSoftTokenMgrElem	: null,

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
        this.logTrace("OsslKeyCertSyncTool.loginToInternalToken():................Start.");

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
	    	this.logDebug("OsslKeyCertSyncTool.loginToInternalToken():  unable to obtain preferences - ex: " + ex);
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
            this.logTrace("OsslKeyCertSyncTool.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("OsslKeyCertSyncTool.loginToInternalToken():................End.");
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
        this.logTrace("OsslKeyCertSyncTool.initXPComServiceInfo():................Start.");

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
    	    alert("OsslKeyCertSyncTool.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("OsslKeyCertSyncTool.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	this.loginToInternalToken();

	this.logTrace("OsslKeyCertSyncTool.initXPComServiceInfo():................End.");
    },

    initOnLoad : function ()
    {
	// this.mMaxLogLevel = 9;
        this.logTrace("OsslKeyCertSyncTool.initOnLoad():................Start.");

	this.initXPComServiceInfo();

    	this.mSoftTokenMgrElem = document.getElementById("keymgr.pkcsfilemgr.osslkeycert.synctool.softtokenmgr");

	this.mSoftTokenMgrElem.refresh();

    	this.logTrace("OsslKeyCertSyncTool.initOnLoad():................End.");
    },

    handleSoftTokenMgrChange : function (aSoftTokenMgrElem, ev) 
    {
    	this.logTrace("OsslKeyCertSyncTool.handleSoftTokenMgrChange():................Start.");
	if (ev) {
    	    this.logDebug("OsslKeyCertSyncTool.handleSoftTokenMgrChange(): ev.type: " + ev.type);
	}

    	this.logTrace("OsslKeyCertSyncTool.handleSoftTokenMgrChange():................End.");
    },



    close : function () 
    {
    	window.close();
    },

    lastMethod : function () 
    {
    }

}
