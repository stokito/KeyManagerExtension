/* @(#) $Id: pkcsfilemgrToolbarOverlay.js,v 1.5 2012/01/26 02:49:37 subrata Exp $ */

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


if (typeof avpki == 'undefined') {
    avpki = {};
}
if (typeof avpki.keymanager == 'undefined') {
    avpki.keymanager = {};
}

avpki.keymanager.PKCSFileMgrToolbarOverlay = {

    checkBinaryComponents : function ()
    {
    	if (!avpki.keymanager.KeyManagerToolbarOverlay.checkKMBinaryComponents()) {
	    return false;
	}
	return true;
    },

    getTestDialogParams  : function ()
    {
    	var dialogCmd		= "browser"; //  [new | file | browser]
    	var osslAppType		= "globus"; // [custom | globus | openssl | curl]
    	var keyStoreBaseDirPath	= "/tmp/KeyManager/OSSL_APP/quasar"
    	var keyStoreType		= "PKCS12"; // [PRIVATE_KEY | PKCS12 | ENGINE]
    	var osslCredentialType 	= "host"; // [user|host|service|proxy|...]
    	var certNickName		= "DocSIgner2";
    	var certToBeExported	= null; 
    	var profileId		= "ZZZZZZ";
    	// var profileId		= certNickName;

    	if (profileId && (profileId != "")) {
    	var certdb = Components.classes["@mozilla.org/security/x509certdb;1"]
    			.getService(Components.interfaces.nsIX509CertDB);
        try {
	    certToBeExported = certdb.findCertByNickname(null, certNickName);
    	} catch (ex) {
            dump("OSSLKeyConfigurator.testInitWithDialogParams(): failed to find cert: " + profileId + " - ex: " + ex + "\n");
	}
    	}

    	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    				.createInstance(Components.interfaces.nsIPKIParamBlock);
    	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

    	pkiParams.setISupportAtIndex(1, null);
    	if (certToBeExported) {
	    pkiParams.setISupportAtIndex(1, certToBeExported);
    	}

    	dialogParams.SetString(0, dialogCmd);
    	if (osslAppType && (osslAppType != "")) {
    	    dialogParams.SetString(1, osslAppType);
    	}
    	if (keyStoreBaseDirPath && (keyStoreBaseDirPath != "")) {
    	    dialogParams.SetString(2, keyStoreBaseDirPath);
    	}
    	if (profileId && (profileId != "")) {
    	    dialogParams.SetString(3, profileId);
    	}
    	if (keyStoreType && (keyStoreType != "")) {
    	    dialogParams.SetString(4, keyStoreType);
    	}
    	if (osslCredentialType && (osslCredentialType != "")) {
    	    dialogParams.SetString(5, osslCredentialType);
    	}
    	return  dialogParams;
    },

    runOsslKeyConfig : function ()
    {
	if (!avpki.keymanager.PKCSFileMgrToolbarOverlay.checkBinaryComponents()) {
	    return;
	}

	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();

	//check for an existing OpenSSL Key Configurator window and focus it; it's not application modal
    	const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
    	var lastOsslKeyConf = kWindowMediator.getMostRecentWindow("avaya:osslkeyconf");
    	if (lastOsslKeyConf) {
            lastOsslKeyConf.focus();
	    return;
    	}
	var dialogParams = null;
	// dialogParams = avpki.keymanager.KeyManagerToolbarOverlay.getTestDialogParams();
        window.openDialog(
		'chrome://keymanager/content/tools/pkcsfilemgr/osslkeyconf.xul',
		"osslkeyconf",
                'chrome,centerscreen,resizable=yes,dialog=no,titlebar',
		dialogParams
		);
    },

    runOsslKeyCertSyncTool : function ()
    {
	if (!avpki.keymanager.PKCSFileMgrToolbarOverlay.checkBinaryComponents()) {
	    return;
	}

	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();

        //check for an existing OpenSSL Key Configurator window and focus it; it's not application modal
        const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
        var lastOsslKeyCertSyncTool = kWindowMediator.getMostRecentWindow("avaya:osslkeycertsynctool");
        if (lastOsslKeyCertSyncTool) {
            lastOsslKeyCertSyncTool.focus();
	    return;
        }
	// var dialogParams = null;
        window.open(
		'chrome://keymanager/content/tools/pkcsfilemgr/OsslKeyCertSyncTool.xul',
		"osslkeycertsynctool",
                'chrome,centerscreen,resizable=yes,dialog=yes,titlebar'
		);
    },

    openDeviceManager : function ()
    {
        //check for an existing deviceManger window and focus it; it's not application modal
        const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
        var lastCertManager = kWindowMediator.getMostRecentWindow("mozilla:devicemanager");
        if (lastCertManager) {
            lastCertManager.focus();
	    return;
        }
        window.open(
		'chrome://pippki/content/device_manager.xul',
		"devmgr",
		'chrome,centerscreen,resizable,modal,dialog=no'
		);
    }
}
