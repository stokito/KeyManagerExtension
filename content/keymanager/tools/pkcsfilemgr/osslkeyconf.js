/* @(#) $Id: osslkeyconf.js,v 1.36 2012/10/07 17:20:50 subrata Exp $ */

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

/*
const MODE_WRONLY   = 0x02;
const MODE_CREATE   = 0x08;
const MODE_APPEND   = 0x10;
const MODE_TRUNCATE = 0x20;
*/

const PERMS_FILE      = 0644;
const PERMS_DIRECTORY = 0700;

var OSSLKeyConfigurator = {

    mTestMode 			: false,
    mDialogParamCmd		: null,

    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB	*/ mPK11TokenDB : null,
    /* alrIKeyManager	*/ mKeyManager : null,
    /* alrIKeyManager	*/ mSoftTokenDBManager : null,

    mPKCS11ModuleObjList : null,

    mKeySourceOptionsGroupElem		: null,
    mKeySourceOptionsNewElem		: null,
    mKeySourceOptionsFileElem		: null,
    mKeySourceOptionsBrowserElem	: null,

    mKeySourceFileHboxElem		: null,
    mKeySourceFilePickerElem		: null,
    mKeySourceFileLoadElem		: null,
    mKeySourceBrowserHboxElem		: null,
    mKeySourceBrowserCertPickerElem 	: null,
    mKeySourceBrowserExportElem		: null,

    mAppTypeMenuListElem		: null,
    mAppBaseDirPickerElem		: null,

    mKeyTypeMenuListElem		: null,
    mKeyTypeEmbeddedElem		: null,
    mKeyTypePrivateKeyElem		: null,
    mKeyTypePkcs12Elem			: null,
    mKeyTypeEngineElem			: null,

    mCaCertsGBoxElem			: null,
    mCaCertsFilePickerElem		: null,
    mCaCertsDirPickerElem		: null,

    mAppKeyProfileIdUseNickNameElem 	: null,
    mAppKeyProfileIdElem		: null,
    mAppKeyCredTypeHBoxElem		: null,
    mAppKeyCredTypeMenuElem		: null,
    mAppKeyBaseDirPickerElem		: null,

    mKeyStoreTabboxElem			: null,
    mKeyStoreTabEmbeddedElem		: null,
    mKeyStoreTabPrivateKeyElem		: null,
    mKeyStoreTabPKCS12Elem		: null,
    mKeyStoreTabEngineElem		: null,

    mKeyStorePrivateKeyIncludeCertElem	: null,
    mKeyStorePrivateKeyFilePickerElem		: null,
    mKeyStorePkcs8PrivateKeyFilePickerElem	: null,
    mKeyStorePrivateKeyPasswordFilePickerElem	: null,
    mKeyStorePrivateKeyCertFilePickerElem	: null,

    mKeyStorePkcs12FileFilePickerElem		: null,
    mKeyStorePkcs12PasswordFilePickerElem	: null,

    mKeyStoreEngineIdElem		: null,
    mKeyStoreEngineKeyIdElem		: null,
    mKeyStoreEngineSOFilePickerElem		: null,
    mKeyStoreEngineModuleFilePickerElem	: null,
    mKeyStoreEngineCertFilePickerElem		: null,
    mKeyStoreEnginePasswordFilePickerElem	: null,

    mKeyConfCmdSaveElem			: null,
    mKeyConfCmdExportElem		: null,
    mKeyConfCmdSaveAsElem		: null,
    mKeyConfCmdResetElem		: null,
    mKeyConfSaveAsFilePickerElem	: null,
    mKeyConfCmdCancelElem		: null,
    mKeyConfCmdCloseElem		: null,

    mOsslAppBaseDir			: null,

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
        this.logTrace("OSSLKeyConfigurator.loginToInternalToken():................Start.");

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
	    	this.logDebug("OSSLKeyConfigurator.loginToInternalToken():  ex: " + ex);
		break;
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
            this.logTrace("OSSLKeyConfigurator.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("OSSLKeyConfigurator.loginToInternalToken():................End.");
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


    loginToCertToken : function (aCert, force)
    {
        var /* nsIPK11Token */ token = null;
	try {
	    if (aCert) {
                var certTokenName = "" + aCert.tokenName;
	        token = this.mPK11TokenDB.findTokenByName(certTokenName);
	    }
	    else {
                token = this.mTokenDB.getInternalKeyToken();
	    }
	} catch (ex) {}

        if (!token) {
            return;
        }

        var forceLogin = ((force == null) ? false : force);
        token.login(forceLogin);
    },

    initXPComServiceInfo : function ()
    {
        this.logTrace("OSSLKeyConfigurator.initXPComServiceInfo():................Start.");

        try {
    	    this.mIOService = Components.classes["@mozilla.org/network/io-service;1"]
		    		.getService(Components.interfaces.nsIIOService);
	    this.mDirService = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties);
	    this.mX509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
	                        .getService(Components.interfaces.nsIX509CertDB);
            this.mPK11TokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
                                .getService(Components.interfaces.nsIPK11TokenDB);
	    this.mKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
	                        .getService(Components.interfaces.alrIKeyManager);
	    this.mSoftTokenDBManager = Components.classes["@avaya.com/pkm/softtokendbmanager;1"]
	                        .getService(Components.interfaces.alrISoftTokenDBManager);
        } catch (ex) {
    	    alert("OSSLKeyConfigurator.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("OSSLKeyConfigurator.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	this.logTrace("OSSLKeyConfigurator.initXPComServiceInfo():................End.");
    },

    initXULElems : function ()
    {
        this.logTrace("OSSLKeyConfigurator.initXULElems():................Start.");

	this.mKeySourceOptionsGroupElem = document.getElementById("keymgr.ossl.keyconf.source.options.group");
	this.mKeySourceOptionsNewElem = document.getElementById("keymgr.ossl.keyconf.source.options.new");
	this.mKeySourceOptionsFileElem = document.getElementById("keymgr.ossl.keyconf.source.options.file");
	this.mKeySourceOptionsBrowserElem = document.getElementById("keymgr.ossl.keyconf.source.options.browser");

	this.mKeySourceFileHboxElem = document.getElementById("keymgr.ossl.keyconf.source.file.hbox");
	this.mKeySourceFilePickerElem = document.getElementById("keymgr.ossl.keyconf.source.file.path");
	this.mKeySourceFileLoadElem = document.getElementById("keymgr.ossl.keyconf.source.file.load");

	this.mKeySourceBrowserHboxElem = document.getElementById("keymgr.ossl.keyconf.source.browser.cert.hbox");
	this.mKeySourceBrowserCertPickerElem = document.getElementById("keymgr.ossl.keyconf.source.browser.certpicker");
	this.mKeySourceBrowserExportElem = document.getElementById("keymgr.ossl.keyconf.source.browser.export");


	this.mAppTypeMenuListElem = document.getElementById("keymgr.ossl.keyconf.app.type.menuList");
	this.mAppBaseDirPickerElem = document.getElementById("keymgr.ossl.keyconf.app.target.dir.path");

	this.mKeyTypeMenuListElem = document.getElementById("keymgr.ossl.keyconf.app.keystore.type.menuList");
	this.mKeyTypeEmbeddedElem = document.getElementById("keymgr.ossl.keyconf.app.keystore.type.embedded");
	this.mKeyTypePrivateKeyElem = document.getElementById("keymgr.ossl.keyconf.app.keystore.type.privateKey");
	this.mKeyTypePkcs12Elem = document.getElementById("keymgr.ossl.keyconf.app.keystore.type.pkcs12");
	this.mKeyTypeEngineElem = document.getElementById("keymgr.ossl.keyconf.app.keystore.type.engine");

	this.mCaCertsGBoxElem = document.getElementById("keymgr.ossl.keyconf.ca.certs.gbox");
	this.mCaCertsFilePickerElem = document.getElementById("keymgr.ossl.keyconf.ca.certs.file.path");
	this.mCaCertsDirPickerElem = document.getElementById("keymgr.ossl.keyconf.ca.certs.dir.path");

	this.mAppKeyProfileIdUseNickNameElem = document.getElementById("keymgr.ossl.keyconf.keystore.profileId.usenickname");
	this.mAppKeyProfileIdElem = document.getElementById("keymgr.ossl.keyconf.keystore.profileId");
	this.mAppKeyCredTypeHBoxElem = document.getElementById("keymgr.ossl.keyconf.keystore.globus.credtype.hbox");
	this.mAppKeyCredTypeMenuElem = document.getElementById("keymgr.ossl.keyconf.keystore.globus.credtype.menuList");
	this.mAppKeyBaseDirPickerElem = document.getElementById("keymgr.ossl.keyconf.keystore.dir.path");

	this.mKeyStoreTabboxElem = document.getElementById("keymgr.ossl.keyconf.keystore.tabbox");

	this.mKeyStoreTabEmbeddedElem = document.getElementById("keymgr.ossl.keyconf.keystore.embedded.tab");

	this.mKeyStoreTabPrivateKeyElem = document.getElementById("keymgr.ossl.keyconf.keystore.privatekey.tab");
	this.mKeyStoreTabPKCS12Elem = document.getElementById("keymgr.ossl.keyconf.keystore.pkcs12.tab");
	this.mKeyStoreTabEngineElem = document.getElementById("keymgr.ossl.keyconf.keystore.engine.tab");
	// this.mKeyStoreTabboxElem.selectedTab = this.mKeyStoreTabEmbeddedElem;

	this.mKeyStorePrivateKeyIncludeCertElem = document.getElementById("keymgr.ossl.keyconf.key.privateKey.include.certchain");
	this.mKeyStorePrivateKeyFilePickerElem = document.getElementById("keymgr.ossl.keyconf.key.privateKey.file.path");
	this.mKeyStorePkcs8PrivateKeyFilePickerElem = document.getElementById("keymgr.ossl.keyconf.key.pkcs8.file.path");
	this.mKeyStorePrivateKeyPasswordFilePickerElem = document.getElementById("keymgr.ossl.keyconf.key.privateKey.password.file.path");
	this.mKeyStorePrivateKeyCertFilePickerElem = document.getElementById("keymgr.ossl.keyconf.key.privateKey.cert.file.path");

	this.mKeyStorePkcs12FileFilePickerElem = document.getElementById("keymgr.ossl.keyconf.key.pkcs12.file.path");
	this.mKeyStorePkcs12PasswordFilePickerElem = document.getElementById("keymgr.ossl.keyconf.key.pkcs12.password.file.path");

	this.mKeyStoreEngineIdElem = document.getElementById("keymgr.ossl.keyconf.key.engine.engineid");
	this.mKeyStoreEngineKeyIdElem = document.getElementById("keymgr.ossl.keyconf.key.engine.keyid");
	this.mKeyStoreEngineSOFilePickerElem = document.getElementById("keymgr.ossl.keyconf.key.engine.so.module.file.path");
	this.mKeyStoreEngineModuleFilePickerElem = document.getElementById("keymgr.ossl.keyconf.key.engine.pkcs11.module.file.path");
	this.mKeyStoreEngineCertFilePickerElem = document.getElementById("keymgr.ossl.keyconf.key.engine.cert.file.path");
	this.mKeyStoreEnginePasswordFilePickerElem = document.getElementById("keymgr.ossl.keyconf.key.engine.password.file.path");

	this.mKeyConfSaveAsFilePickerElem = document.getElementById("keymgr.ossl.keyconf.file.saveas.path");

	this.mKeyConfCmdExportElem = document.getElementById("keymgr.ossl.keyconf.command.export");
	this.mKeyConfCmdSaveElem = document.getElementById("keymgr.ossl.keyconf.command.save");
	this.mKeyConfCmdSaveAsElem = document.getElementById("keymgr.ossl.keyconf.command.saveas");
	this.mKeyConfCmdResetElem = document.getElementById("keymgr.ossl.keyconf.command.reset");
	this.mKeyConfCmdCancelElem = document.getElementById("keymgr.ossl.keyconf.command.cancel");
	this.mKeyConfCmdCloseElem = document.getElementById("keymgr.ossl.keyconf.command.close");

	this.mKeySourceBrowserCertPickerElem.refresh();

	this.getOSSLAppBaseDir();
	this.getGlobusBaseDir();

	this.mAppTypeMenuListElem.prevAppType = this.mAppTypeMenuListElem.value;
	this.mAppBaseDirPickerElem.refresh();
	if (!this.mAppBaseDirPickerElem.file) {
	    var appBaseDir = this.getOSSLAppBaseDir();
	    if (appBaseDir) {
	        this.mAppBaseDirPickerElem.initWithFile(appBaseDir);
	    }
	}

	this.mAppKeyCredTypeMenuElem.refresh();


	this.logTrace("OSSLKeyConfigurator.initXULElems():................End.");
    },

    initOnLoad : function ()
    {
	// this.mMaxLogLevel = 9;
        this.logTrace("OSSLKeyConfigurator.initOnLoad():................Start.");

    	try {
	   this.initXPComServiceInfo();
    	   this.getPKCS11ModuleList(false);

	   this.initXULElems();

	    // this.testInitWithDialogParams();
	    this.initWithDialogParams();

	    this.handleKeyConfSourceOptionChange(this.mKeySourceOptionsGroupElem);
    	} catch (ex) {
	    this.logError("osslkeyconf_doOnload(): failed - ex: " + ex + "");
	    return;
    	}

    	this.logTrace("OSSLKeyConfigurator.initOnLoad():................End.");
    },

    initWithDialogParams : function ()
    {
	// this.mMaxLogLevel = 9;
        this.logTrace("OSSLKeyConfigurator.initWithDialogParams(): ................Start.");

        var pkiParams = null;
        var dialogParams = null;
        if (window.arguments && window.arguments[0]) {
    	    dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
        }
        if (!dialogParams) {
    	    return;
        }
        try {
    	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
        } catch (ex) { }

        var /* nsIX509Cert */ certToBeExported = null;
        if (pkiParams) {
	    var paramCert = pkiParams.getISupportAtIndex(1);
    	    if (paramCert) {
	        certToBeExported = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
    	    }
        }

        var dialogCmd		= dialogParams.GetString(0); //  [new | file | browser]
        var osslAppType		= dialogParams.GetString(1); // [custom | globus | openssl | curl]
        var keyStoreBaseDirPath	= dialogParams.GetString(2);
        var profileId		= dialogParams.GetString(3);
        var keyStoreType	= dialogParams.GetString(4); // [PRIVATE_KEY | PKCS12 | ENGINE]
        var osslCredentialType 	= dialogParams.GetString(5); // [user|host|service|proxy|...]
    
        this.initXULForm(
    		    dialogCmd,
		    certToBeExported,
		    osslAppType,
		    keyStoreBaseDirPath,
		    profileId,
		    keyStoreType,
		    osslCredentialType
		    );
	this.mDialogParamCmd = dialogCmd;
    	if (this.mDialogParamCmd == "browser") {
    	    this.mKeyConfCmdSaveAsElem.hidden = true;
    	}

	this.mAppTypeMenuListElem.prevAppType = null;
        this.logTrace("OSSLKeyConfigurator.initWithDialogParams(): ................End.");
	// this.mMaxLogLevel = 4;
    },

    initXULForm : function (aDialogCmd, aCertToBeExported, aOsslAppType, aKeyStoreBaseDirPath, aProfileId, aKeyStoreType, aOsslCredentialType)
    {
        this.logTrace("OSSLKeyConfigurator.initXULForm(): ................Start.");

        this.logDebug("OSSLKeyConfigurator.initXULForm(): " + 
    		"aDialogCmd : " + aDialogCmd + " " + 
    		"aCertToBeExported : " + aCertToBeExported + " " + 
    		"aOsslAppType : " + aOsslAppType + " " + 
    		"aKeyStoreBaseDirPath : " + aKeyStoreBaseDirPath + " " + 
    		"aProfileId : " + aProfileId + " " + 
    		"aKeyStoreType : " + aKeyStoreType + " " + 
    		"aOsslCredentialType : " + aOsslCredentialType + " " + 
		"");

        if (aDialogCmd == "new") {
    	    this.mKeySourceOptionsGroupElem.selectedItem = this.mKeySourceOptionsNewElem;
    	    this.mKeySourceOptionsGroupElem.disabled = true;
        }
        else if (aDialogCmd == "file") {
    	    this.mKeySourceOptionsGroupElem.selectedItem = this.mKeySourceOptionsFileElem;
    	    this.mKeySourceOptionsGroupElem.disabled = true;
        }
        else if (aDialogCmd == "browser") {
    	    this.mKeySourceOptionsGroupElem.selectedItem = this.mKeySourceOptionsBrowserElem;
    	    this.mKeySourceOptionsGroupElem.disabled = true;
	    // We do not need the CACerts fields when we are just exporting the key 
    	    this.mCaCertsGBoxElem.hidden = true;
        }

        if (aCertToBeExported) {
    	    this.mKeySourceBrowserCertPickerElem.selectedCert = aCertToBeExported;
	    this.mKeySourceBrowserCertPickerElem.disabled = true;
        }

        if (aOsslAppType && (aOsslAppType != "")) {
    	    this.mAppTypeMenuListElem.value = aOsslAppType;
	    this.mAppTypeMenuListElem.disabled = true;
        }
        if (aKeyStoreBaseDirPath && (aKeyStoreBaseDirPath != "")) {
    	    this.mAppBaseDirPickerElem.filepath = aKeyStoreBaseDirPath;
	    this.mAppBaseDirPickerElem.disabled = true;
	    this.mAppTypeMenuListElem.disabled = true;
	    if (this.mAppBaseDirPickerElem.file) {
	        if (this.mAppTypeMenuListElem.value == "globus") {
	    	    this.mAppBaseDirPickerElem.globusBaseDir = this.mAppBaseDirPickerElem.file;
	        }
	        else if (this.mAppTypeMenuListElem.value == "custom") {
	            this.mAppBaseDirPickerElem.osslAppBaseDir = this.mAppBaseDirPickerElem.file;
	        }
	        else {
	            this.mAppBaseDirPickerElem.osslAppBaseDir = this.mAppBaseDirPickerElem.file;
	        }
	    }
        }

        if (aProfileId && (aProfileId != "")) {
    	    this.mAppKeyProfileIdElem.value = aProfileId;
	    this.mAppKeyProfileIdElem.disabled = true;
	    this.mAppKeyProfileIdUseNickNameElem.disabled = true;
	    this.mAppKeyProfileIdUseNickNameElem.hidden = true;
        }
        if (aKeyStoreType && (aKeyStoreType != "")) {
    	    this.mKeyTypeMenuListElem.value = aKeyStoreType;
            this.logDebug("OSSLKeyConfigurator.initXULForm(): this.mKeyTypeMenuListElem.selectedItem : " + this.mKeyTypeMenuListElem.selectedItem.value);
	    this.mKeyTypeMenuListElem.disabled = true;
        }
        if (aOsslCredentialType && (aOsslCredentialType != "")) {
    	    this.mAppKeyCredTypeMenuElem.value = aOsslCredentialType;
	    this.mAppKeyCredTypeMenuElem.disabled = true;
        }

        this.logTrace("OSSLKeyConfigurator.initXULForm(): ................End.");
    },

    testInitWithDialogParams : function ()
    {
    this.logTrace("OSSLKeyConfigurator.testInitWithDialogParams(): ................Start.");

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
        try {
	    certToBeExported = this.mX509CertDB.findCertByNickname(null, profileId);
    	} catch (ex) {
            this.logError("OSSLKeyConfigurator.testInitWithDialogParams(): failed to find cert: " + profileId + " - ex: " + ex + "");
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

    this.initXULForm(
    		dialogCmd,
		certToBeExported,
		osslAppType,
		keyStoreBaseDirPath,
		profileId,
		keyStoreType,
		osslCredentialType
		);
    this.logTrace("OSSLKeyConfigurator.testInitWithDialogParams(): ................End.");
    },


    resetAllTabs : function ()
    {

        this.mAppBaseDirPickerElem.reset();
        this.mCaCertsFilePickerElem.reset();
        this.mCaCertsDirPickerElem.reset();
        this.mAppKeyBaseDirPickerElem.reset();


        this.resetPrivateKeyTab();
        this.resetPKCS12Tab();
        this.resetSmartCardTab();

        if (this.mAppTypeMenuListElem.value == "globus") {
	    this.mAppBaseDirPickerElem.initWithFile(this.mAppBaseDirPickerElem.globusBaseDir);
        }
        else {
	    this.mAppBaseDirPickerElem.initWithFile(this.mAppBaseDirPickerElem.osslAppBaseDir);
        }

    },

    resetPrivateKeyTab : function ()
    {
        this.mKeyStorePrivateKeyFilePickerElem.reset();
        this.mKeyStorePkcs8PrivateKeyFilePickerElem.reset();
        this.mKeyStorePrivateKeyCertFilePickerElem.reset();
        this.mKeyStorePrivateKeyPasswordFilePickerElem.reset();
    },

    resetPKCS12Tab : function ()
    {
        this.mKeyStorePkcs12FileFilePickerElem.reset();
        this.mKeyStorePkcs12PasswordFilePickerElem.reset();
    },

    resetSmartCardTab : function ()
    {
        this.mKeyStoreEngineIdElem.value = "pkcs11";
        this.mKeyStoreEngineKeyIdElem.value = "";

        this.mKeyStoreEngineSOFilePickerElem.reset();
        this.mKeyStoreEngineModuleFilePickerElem.reset();
        this.mKeyStoreEngineCertFilePickerElem.reset();
        this.mKeyStoreEnginePasswordFilePickerElem.reset();
    },

    handleKeyconfFormFieldChange : function (aSrcTextBoxElem)
    {
        this.keyconfFormFieldAutoCompleteAction(aSrcTextBoxElem);
    },

    keyconfFormFieldAutoCompleteAction : function (aSrcTextBoxElem)
    {
        var formFieldKey = aSrcTextBoxElem.id;
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

    handleKeyConfSourceOptionChange : function (aKeySourceOptionsGroupElem, ev)
    {
        var selectedSourceElem = aKeySourceOptionsGroupElem.selectedItem;

        this.handleFileSourceChange(false);
        this.handleBrowserSourceChange(false);

        var tokenKeyTypeElemList = this.mKeyTypeMenuListElem.getElementsByTagName("menuitem");
        for (var i = 0; i < tokenKeyTypeElemList.length; i++) {
	    var tokenKeyTypeElem = tokenKeyTypeElemList.item(i);
	    tokenKeyTypeElem.removeAttribute("disabled");
        }

        this.resetAllTabs();

        this.mKeyConfCmdExportElem.hidden = true;
        this.mKeyConfCmdSaveAsElem.disabled = false;

        this.mAppKeyCredTypeMenuElem.disabled = false;
        this.mAppKeyCredTypeMenuElem.selectedIndex = 0;
        if (selectedSourceElem.value == "new") {
	    this.mKeyConfCmdSaveElem.hidden = true;
            if (this.mAppTypeMenuListElem.value == "custom") {
	        this.mAppKeyProfileIdElem.value = "MyOsslKeys";
            }
	    else {
	        this.mAppKeyProfileIdElem.value = "";
	    }
	    this.handleOsslAppTypeMenuListChange(this.mAppTypeMenuListElem);
        }
        else if (selectedSourceElem.value == "file") {
	    this.mKeyConfCmdSaveElem.hidden = false;
	    this.handleFileSourceChange(true);
        }
        else if (selectedSourceElem.value == "browser") {
	    this.mKeyConfCmdExportElem.hidden = false;
	    this.mKeyConfCmdSaveElem.hidden = true;
	    this.mKeyConfCmdSaveAsElem.disabled = true;
	    this.handleBrowserSourceChange(true);
        }
    },

    handleFileSourceChangeInternal : function (enableKeySource)
    {
        this.mKeySourceFileHboxElem.hidden = !enableKeySource;
        // this.mKeySourceFilePickerElem.disabled = !enableKeySource;
        // this.mKeySourceFileLoadElem.disabled = !enableKeySource;
    },

    handleFileSourceChange : function (enableKeySource)
    {
        // this.mKeySourceFilePickerElem.disabled = !enableKeySource;
        // this.mKeySourceFileLoadElem.disabled = !enableKeySource;
        this.handleFileSourceChangeInternal(enableKeySource);

        if (enableKeySource) {
	    this.mAppTypeMenuListElem.value = "custom";
	    this.handleOsslAppTypeMenuListChange(this.mAppTypeMenuListElem);
        }
    },

    handleBrowserSourceChangeInternal : function (enableKeySource)
    {
        this.mKeySourceBrowserHboxElem.hidden = !enableKeySource;
        this.mAppKeyProfileIdUseNickNameElem.hidden = !enableKeySource;

    },

    handleBrowserSourceChange : function (enableKeySource)
    {
        this.logTrace("OSSLKeyConfigurator.handleBrowserSourceChange():..................Start.");

        this.handleBrowserSourceChangeInternal(enableKeySource);

        if (enableKeySource) {
	    this.mKeySourceBrowserCertPickerElem.refresh();
	    this.handleKeySourceCertPickerChange(this.mKeySourceBrowserCertPickerElem);
	    this.handleOsslAppTypeMenuListChange(this.mAppTypeMenuListElem);
	    this.initProfileIdWithNickName(this.mKeySourceBrowserCertPickerElem);
        }

        this.logTrace("OSSLKeyConfigurator.handleBrowserSourceChange():..................End.");
    },

    initKeyCertFilePathFromKeyStore : function (aCertPickerElem)
    {
        this.logTrace("OSSLKeyConfigurator.initKeyCertFilePathFromKeyStore():..................Start.");
    
        if (!aCertPickerElem) {
	    return;
        }

        var selectedCert = aCertPickerElem.selectedCert;
        if (!selectedCert) {
	    return;
        }

        // var hardwareToken = true;
        var hardwareToken = false;
        var keyTokenName = selectedCert.tokenName;
        var /* nsIPK11Token */ keyToken = this.mPK11TokenDB.findTokenByName(keyTokenName);
        if ((keyToken != null) && (keyToken.isHardwareToken() == true)) {
	    hardwareToken = true;
        }
        this.logDebug("OSSLKeyConfigurator.initKeyCertFilePathFromKeyStore(): hardwareToken: " + hardwareToken + "");

        var keyFileNamePrefix = aCertPickerElem.adaptNickName(selectedCert, true); // selectedCert.nickname;
        if (!keyFileNamePrefix) {
	    if (this.mAppKeyProfileIdElem.value != "") {
	        keyFileNamePrefix = this.mAppKeyProfileIdElem.value;
	    }
	    else {
	        keyFileNamePrefix = "MyOsslKeys";
	    }
        }

        // this.mAppKeyProfileIdElem.value = keyFileNamePrefix;

        // Initialize the default Directory for key, cert and password files for auto-select 
        var keyCertOutDirFile = this.getOSSLAppKeyBaseDir();

        var formatType = "b64";
        if (hardwareToken) {

	    if (this.mKeyStoreEngineIdElem.value == "") {
	        this.mKeyStoreEngineIdElem.value = "pkcs11";
	    }
	    formatType = "b64";
	    var certFileName = keyFileNamePrefix + "_ht_x509_" + formatType + ".cer";
	    this.mKeyStoreEngineCertFilePickerElem.defaultFileName = certFileName;
	    var certFile = this.mKeyStoreEngineCertFilePickerElem.file;
	    if (!certFile) {
	        var displayDirFile = this.mKeyStoreEngineCertFilePickerElem.fileDisplayDirFile;
	        if (!displayDirFile) {
		    displayDirFile = keyCertOutDirFile;
	        }
	        certFile = this.mKeyStoreEngineCertFilePickerElem.autoSelectFile(displayDirFile, certFileName);
	    }

	    var enginePasswdFileName = keyFileNamePrefix + "_ht_passwd.dat";
	    this.mKeyStoreEnginePasswordFilePickerElem.defaultFileName = enginePasswdFileName;

	    var enginePasswordFile = this.mKeyStoreEnginePasswordFilePickerElem.file;
	    if (!enginePasswordFile) {
	        var displayDirFile = this.mKeyStoreEnginePasswordFilePickerElem.fileDisplayDirFile;
	        if (!displayDirFile) {
		    displayDirFile = keyCertOutDirFile;
	        }
	        enginePasswordFile = this.mKeyStoreEnginePasswordFilePickerElem.autoSelectFile(displayDirFile, enginePasswdFileName);
	    }
	    this.mKeyTypeMenuListElem.selectedItem = this.mKeyTypeEngineElem;
        }
        else {
	    var osslEPKFileName = keyFileNamePrefix + "_ossl_epk" + ".pem";
	    this.mKeyStorePrivateKeyFilePickerElem.defaultFileName = osslEPKFileName;
	    var osslEPKFile = this.mKeyStorePrivateKeyFilePickerElem.file;
	    if (!osslEPKFile) {
	        var displayDirFile = this.mKeyStorePrivateKeyFilePickerElem.fileDisplayDirFile;
	        if (!displayDirFile) {
		    displayDirFile = keyCertOutDirFile;
	        }
	        osslEPKFile = this.mKeyStorePrivateKeyFilePickerElem.autoSelectFile(displayDirFile, osslEPKFileName);
	    }
    
	    formatType = "b64";
	    if (!this.mKeyStorePkcs8PrivateKeyFilePickerElem.ascii) {
	        formatType = "der";
	    }
	    var pkcs8FileName = keyFileNamePrefix + "_priv_key_" + formatType + ".pk8";

	    this.mKeyStorePkcs8PrivateKeyFilePickerElem.defaultFileName = pkcs8FileName;
	    var pkcs8File = this.mKeyStorePkcs8PrivateKeyFilePickerElem.file;
	    if (!pkcs8File) {
	        var displayDirFile = this.mKeyStorePkcs8PrivateKeyFilePickerElem.fileDisplayDirFile;
	        if (!displayDirFile) {
		    displayDirFile = keyCertOutDirFile;
	        }
	        pkcs8File = this.mKeyStorePkcs8PrivateKeyFilePickerElem.autoSelectFile(displayDirFile, pkcs8FileName);
	    }

	    var privKeyPasswdFileName = keyFileNamePrefix + "_priv_key_passwd.dat";
	    this.mKeyStorePrivateKeyPasswordFilePickerElem.defaultFileName = privKeyPasswdFileName;
	    var privKeyPasswdFile = this.mKeyStorePrivateKeyPasswordFilePickerElem.file;
	    if (!privKeyPasswdFile) {
	        var displayDirFile = this.mKeyStorePrivateKeyPasswordFilePickerElem.fileDisplayDirFile;
	        if (!displayDirFile) {
		    displayDirFile = keyCertOutDirFile;
	        }
	        privKeyPasswdFile = this.mKeyStorePrivateKeyPasswordFilePickerElem.autoSelectFile(displayDirFile, privKeyPasswdFileName);
	    }

	    // var pkcs12File = selectPKCS12File('keymgr.ossl.keyconf.key.pkcs12.file.path');
	    var pkcs12FileName = keyFileNamePrefix + "_key_der.p12";
	    this.mKeyStorePkcs12FileFilePickerElem.defaultFileName = pkcs12FileName;
	    // var pkcs12File = this.mKeyStorePkcs12FileFilePickerElem.browse();
	    var pkcs12File = this.mKeyStorePkcs12FileFilePickerElem.file;
	    if (!pkcs12File) {
	        var displayDirFile = this.mKeyStorePkcs12FileFilePickerElem.fileDisplayDirFile;
	        if (!displayDirFile) {
		    displayDirFile = keyCertOutDirFile;
	        }
	        pkcs12File = this.mKeyStorePkcs12FileFilePickerElem.autoSelectFile(displayDirFile, pkcs12FileName);
	    }

	    var pkcs12PasswdFileName = keyFileNamePrefix + "_p12_passwd.dat";
	    this.mKeyStorePkcs12PasswordFilePickerElem.defaultFileName = privKeyPasswdFileName;
	    var pkcs12PasswdFile = this.mKeyStorePkcs12PasswordFilePickerElem.file;
	    if (!pkcs12PasswdFile) {
	        var displayDirFile = this.mKeyStorePkcs12PasswordFilePickerElem.fileDisplayDirFile;
	        if (!displayDirFile) {
		    displayDirFile = keyCertOutDirFile;
	        }
	        pkcs12PasswdFile = this.mKeyStorePkcs12PasswordFilePickerElem.autoSelectFile(displayDirFile, pkcs12PasswdFileName);
	    }

	    formatType = "b64";
	    if (!this.mKeyStorePrivateKeyCertFilePickerElem.ascii) {
	        formatType = "der";
	    }
	    var certFileName = keyFileNamePrefix + "_st_x509_" + formatType + ".cer";
	    this.mKeyStorePrivateKeyCertFilePickerElem.defaultFileName = certFileName;
	    // var certFile = this.mKeyStorePrivateKeyCertFilePickerElem.browse();
	    var certFile = this.mKeyStorePrivateKeyCertFilePickerElem.file;
	    if (!certFile) {
	        var displayDirFile = this.mKeyStorePrivateKeyCertFilePickerElem.fileDisplayDirFile;
	        if (!displayDirFile) {
		    displayDirFile = keyCertOutDirFile;
	        }
	        certFile = this.mKeyStorePrivateKeyCertFilePickerElem.autoSelectFile(displayDirFile, certFileName);
	    }
        }
        this.handleKeyTypeMenuListChange(this.mKeyTypeMenuListElem);

        this.logTrace("OSSLKeyConfigurator.initKeyCertFilePathFromKeyStore():..................End.");
    },

    handleKeySourceCertPickerChange : function (aCertPickerElem, ev)
    {
        this.logTrace("OSSLKeyConfigurator.handleKeySourceCertPickerChange():..................Start.");

        var originalTargetElem = aCertPickerElem.selectedItem;
        if (ev) {
    	    originalTargetElem = ev.target;
        }
        if (!originalTargetElem) {
	    return;
        }
        if (originalTargetElem.localName == "button") {
	    return;
        }


        if (!aCertPickerElem.selectedCert) {
	    return;
        }

        var isSelectedCertHWToken = aCertPickerElem.isHardwareToken(aCertPickerElem.selectedCert);
    

        var prevSelectedMenuItem = this.mKeyTypeMenuListElem.selectedItem;
        var selectedMenuItem = null;
        this.logTrace("OSSLKeyConfigurator.handleKeySourceCertPickerChange(): prevSelectedMenuItem.value: " + prevSelectedMenuItem.value);

        var tokenKeyTypeElemList = this.mKeyTypeMenuListElem.getElementsByTagName("menuitem");
        for (var i = 0; i < tokenKeyTypeElemList.length; i++) {
	    var tokenKeyTypeElem = tokenKeyTypeElemList.item(i);
	    var isKeyTypeMenuItemHWToken = tokenKeyTypeElem.getAttribute("hwtoken");
    	    if (isSelectedCertHWToken) {
	        if (isKeyTypeMenuItemHWToken) {
	    	    tokenKeyTypeElem.removeAttribute("disabled");
		    selectedMenuItem = tokenKeyTypeElem;
	        }
	        else {
	    	    tokenKeyTypeElem.setAttribute("disabled", true);
	        }
    	    }
    	    else {
        	this.logDebug("OSSLKeyConfigurator.handleKeySourceCertPickerChange(): isKeyTypeMenuItemHWToken: " + isKeyTypeMenuItemHWToken);
        	this.logDebug("OSSLKeyConfigurator.handleKeySourceCertPickerChange(): tokenKeyTypeElem.value: " + tokenKeyTypeElem.value);
	        if (isKeyTypeMenuItemHWToken) {
	    	    tokenKeyTypeElem.setAttribute("disabled", true);
	        }
	        else {
	    	    tokenKeyTypeElem.removeAttribute("disabled");
		    if (tokenKeyTypeElem.value == prevSelectedMenuItem.value) {
		    	selectedMenuItem = prevSelectedMenuItem;
		    }
		    else {
		    	if (!selectedMenuItem) {
		    	    selectedMenuItem = tokenKeyTypeElem;
		    	}
		    }
	        }
    	    }
        }

        if (selectedMenuItem) {
    	    this.mKeyTypeMenuListElem.selectedItem = selectedMenuItem;
            this.logTrace("OSSLKeyConfigurator.handleKeySourceCertPickerChange(): selectedMenuItem.value: " + selectedMenuItem.value);
            this.logTrace("OSSLKeyConfigurator.handleKeySourceCertPickerChange(): this.mKeyTypeMenuListElem.value: " + this.mKeyTypeMenuListElem.value);
        }

        this.resetAllTabs();

        if (this.mAppTypeMenuListElem.value == "globus") {
	    this.initGlobusCredentialType(aCertPickerElem);
        }

        this.initProfileIdWithNickName(aCertPickerElem);

        // this.mKeyConfCmdSaveAsElem will be enabled in the export method.
        this.mKeyConfCmdSaveAsElem.disabled = true;
    
        this.logTrace("OSSLKeyConfigurator.handleKeySourceCertPickerChange():..................End.");
    },


    initGlobusCredentialType : function (aCertPickerElem)
    {
        this.logTrace("OSSLKeyConfigurator.initGlobusCredentialType():..................Start.");

        var isProxyCert = this.mKeyManager.isProxyCert(aCertPickerElem.selectedCert);

        this.logDebug("OSSLKeyConfigurator.initGlobusCredentialType(): isProxyCert: " + isProxyCert + "");

        if (isProxyCert) {
	    this.mAppKeyCredTypeMenuElem.value = "proxy";
	    // this.handleCredTypeMenuListChange(this.mAppKeyCredTypeMenuElem);
	    this.mAppKeyCredTypeMenuElem.disabled = true;
        }
        else {
	    if (this.mAppKeyCredTypeMenuElem.value == "proxy") {
	       this.mAppKeyCredTypeMenuElem.value = "user";
	    }
	    this.mAppKeyCredTypeMenuElem.disabled = false;
        }
        this.handleCredTypeMenuListChange(this.mAppKeyCredTypeMenuElem);
    
        this.logTrace("OSSLKeyConfigurator.initGlobusCredentialType():..................End.");
    },

    initProfileIdWithNickName : function (aCertPickerElem)
    {
        this.logTrace("OSSLKeyConfigurator.initProfileIdWithNickName():..................Start.");

        var profileId = "";
        if (this.mAppKeyProfileIdUseNickNameElem.checked) {
            var selectedCert = aCertPickerElem.selectedCert;
            if (selectedCert) {
	         profileId = aCertPickerElem.adaptNickName(selectedCert, true);
    	         if (!profileId) {
	     	    profileId = "";
    	         }
            }
        }
        else {
	    if (this.mAppKeyProfileIdElem.disabled) {
    	        profileId = this.mAppKeyProfileIdElem.value;
	    }
        }
        this.logDebug("OSSLKeyConfigurator.initProfileIdWithNickName(): profileId: " + profileId + "");

        /*
        if (this.mAppTypeMenuListElem.value == "globus") {
	    appKeyBaseDir = initGlobusKeyBaseDir();
        }
        else {
	    appKeyBaseDir = this.initOSSLAppKeyBaseDir();
        }
        */
        this.mAppKeyProfileIdElem.value = profileId;
        this.handleAppKeyProfileIdChange(this.mAppKeyProfileIdElem);

        this.logTrace("OSSLKeyConfigurator.initProfileIdWithNickName():..................End.");
    },

    handleOsslAppTypeMenuListChange : function (aOsslAppTypeMenuListElem, ev)
    {
        this.logTrace("OSSLKeyConfigurator.handleOsslAppTypeMenuListChange():..................Start.");

        // var selectedItemElem = ev.originalTarget;
        var selectedItemElem = aOsslAppTypeMenuListElem.selectedItem;
        if (!selectedItemElem) {
	    return;
        }

        // Save the previous base-dir value
        if (aOsslAppTypeMenuListElem.prevAppType && this.mAppBaseDirPickerElem.file) {
	    if (aOsslAppTypeMenuListElem.prevAppType == "globus") {
	        this.mAppBaseDirPickerElem.globusBaseDir = this.mAppBaseDirPickerElem.file;
	    }
	    else {
	        this.mAppBaseDirPickerElem.osslAppBaseDir = this.mAppBaseDirPickerElem.file;
	    }
        }

        this.logDebug("OSSLKeyConfigurator.handleOsslAppTypeMenuListChange(): " + 
		"aOsslAppTypeMenuListElem.prevAppType: " + aOsslAppTypeMenuListElem.prevAppType + " " +
		"appType: " + selectedItemElem.value +
		"");

        if (this.mKeySourceOptionsGroupElem.selectedItem.value == "file") {
	    this.mAppBaseDirPickerElem.initWithFile(this.mAppBaseDirPickerElem.osslAppBaseDir);
	    aOsslAppTypeMenuListElem.prevAppType = selectedItemElem.value;
	    return;
        }

        if (aOsslAppTypeMenuListElem.prevAppType) {
	    if ((aOsslAppTypeMenuListElem.prevAppType != "globus") && (selectedItemElem.value == "globus")) {
	        this.mKeyTypeMenuListElem.value = "PRIVATE_KEY";
	    }
	    else if ((aOsslAppTypeMenuListElem.prevAppType == "globus") && (selectedItemElem.value != "globus")) {
	        this.mKeyTypeMenuListElem.value = "PKCS12";
	    }
        }

        if (selectedItemElem.value == "globus") {
	    this.initGlobusCredentialType(this.mKeySourceBrowserCertPickerElem);
	    this.mAppBaseDirPickerElem.initWithFile(this.mAppBaseDirPickerElem.globusBaseDir);
	    this.mAppKeyCredTypeHBoxElem.hidden = false;
        }
        else {
	    this.mAppBaseDirPickerElem.initWithFile(this.mAppBaseDirPickerElem.osslAppBaseDir);
	    this.mAppKeyCredTypeHBoxElem.hidden = true;
        }
        this.handleAppBaseDirPathChange(this.mAppBaseDirPickerElem);

        /*
        if (this.mKeySourceOptionsGroupElem.selectedItem.value == "browser") {
	    this.handleKeySourceCertPickerChange(xxxx);
        }
        else {
        }
        */
    
        aOsslAppTypeMenuListElem.prevAppType = selectedItemElem.value;

        this.logTrace("OSSLKeyConfigurator.handleOsslAppTypeMenuListChange():..................End.");
    },

    handleAppBaseDirPathChange : function (aAppBaseDirPickerElem, ev)
    {
        this.logTrace("OSSLKeyConfigurator.handleAppBaseDirPathChange():.........................Start.");

        var appBaseDir = aAppBaseDirPickerElem.file;
        this.logDebug("OSSLKeyConfigurator.handleAppBaseDirPathChange(): aAppBaseDirPickerElem.id: " + aAppBaseDirPickerElem.id + 
		" aAppBaseDirPickerElem.value: " + aAppBaseDirPickerElem.value + 
		" appBaseDir.path: " + appBaseDir.path + 
		" this.mAppTypeMenuListElem.value: " + this.mAppTypeMenuListElem.value + 
		"");

        this.initOsslAppForCACerts(appBaseDir);
        this.logTrace("OSSLKeyConfigurator.handleAppBaseDirPathChange():.........................10.");

        // Re-initilize the Key-Base-Dir
        this.mAppKeyBaseDirPickerElem.value = "";
        if (this.mAppTypeMenuListElem.value == "globus") {
	    aAppBaseDirPickerElem.globusBaseDir = appBaseDir;
        }
        else {
	    aAppBaseDirPickerElem.osslAppBaseDir = appBaseDir;
	    /*
	    // var osslAppKeyBaseDir = this.getOSSLAppKeyBaseDir();
	    var appKeyBaseDir = this.initOSSLAppKeyBaseDir();
	    this.initOsslAppForSoftToken(osslAppKeyBaseDir);
	    this.initOsslAppForHardToken(osslAppKeyBaseDir);
	    */
        }
        this.logDebug("OSSLKeyConfigurator.AppType: " + this.mAppTypeMenuListElem.value + "\n\t" +
		"appBaseDir: " + appBaseDir.path + "\n\t" +  
		((aAppBaseDirPickerElem.globusBaseDir)?
			("aAppBaseDirPickerElem.globusBaseDir: " + aAppBaseDirPickerElem.globusBaseDir.path + "\n\t")
			: "NULL") + 
		((aAppBaseDirPickerElem.osslAppBaseDir)?
			("aAppBaseDirPickerElem.osslAppBaseDir: " + aAppBaseDirPickerElem.osslAppBaseDir.path + " ")
			: "NULL") + 
		"");

        this.handleAppKeyBaseDirPathChange(this.mAppKeyBaseDirPickerElem);

        /*
        if (this.mKeySourceOptionsGroupElem.selectedItem.value == "browser") {
	    this.initKeyCertFilePathFromKeyStore(this.mKeySourceBrowserCertPickerElem);
        }
        */
        this.handleKeyTypeMenuListChange(this.mKeyTypeMenuListElem);

        if (!this.mKeyConfSaveAsFilePickerElem.fileDisplayDirFile) {
	    this.mKeyConfSaveAsFilePickerElem.fileDisplayDirFile = appBaseDir;
        } 
    
        this.logTrace("OSSLKeyConfigurator.handleAppBaseDirPathChange():.........................End.");
    },



    handleKeyTypeMenuListChange : function (aKeyTypeMenuListElem, ev)
    {
    	this.logTrace("OSSLKeyConfigurator.handleKeyTypeMenuListChange():.........................Start.");

        var selectedItemElem = aKeyTypeMenuListElem.selectedItem;

        if (selectedItemElem.value == "PRIVATE_KEY") {
	    this.mKeyStoreTabboxElem.selectedTab = this.mKeyStoreTabPrivateKeyElem;
        }
        else if (selectedItemElem.value == "PKCS12") {
	    this.mKeyStoreTabboxElem.selectedTab = this.mKeyStoreTabPKCS12Elem;
        }
        else if (selectedItemElem.value == "ENGINE") {
	    this.mKeyStoreTabboxElem.selectedTab = this.mKeyStoreTabEngineElem;
        }
        /*
        else if (selectedItemElem.value == "EMBEDDED") {
	    this.mKeyStoreTabboxElem.selectedTab = this.mKeyStoreTabEmbeddedElem;
        }
        */

    	this.logTrace("OSSLKeyConfigurator.handleKeyTypeMenuListChange():.........................End.");
    },

    handleUseNickNameAsProfileIdChange : function (aProfileIdUseNickNameElem, ev) 
    {
	this.logTrace("OSSLKeyConfigurator.handleUseNickNameAsProfileIdChange():......................Start.");

        if (ev) {
	    ev.stopPropagation();
        }

        this.initProfileIdWithNickName(this.mKeySourceBrowserCertPickerElem);

        this.logTrace("OSSLKeyConfigurator.handleUseNickNameAsProfileIdChange():......................End.");
    },

    handleAppKeyProfileIdChange : function (aAppKeyProfileIdElem, ev) 
    {
        this.logTrace("OSSLKeyConfigurator.handleAppKeyProfileIdChange():......................Start.");
        if (ev) {
	    ev.stopPropagation();
        }
        this.keyconfFormFieldAutoCompleteAction(aAppKeyProfileIdElem);

        var appKeyBaseDir = null;
        if (this.mAppTypeMenuListElem.value == "globus") {
	    appKeyBaseDir = this.initGlobusKeyBaseDir();
        }
        else {
	    appKeyBaseDir = this.initOSSLAppKeyBaseDir();
        }

        if (aAppKeyProfileIdElem.value != "") {
	    this.mKeyConfSaveAsFilePickerElem.defaultFileName = aAppKeyProfileIdElem.value + "_ossl_key_conf.cnf";
        }
        else {
    	    this.mKeyConfSaveAsFilePickerElem.defaultFileName = "";
        }

        this.handleAppKeyBaseDirPathChange(this.mAppKeyBaseDirPickerElem);
    
        this.logTrace("OSSLKeyConfigurator.handleAppKeyProfileIdChange():......................End.");
    },

    handleCredTypeMenuListChange : function (aAppKeyCredTypeMenuElem, ev) 
    {
        this.logTrace("OSSLKeyConfigurator.handleCredTypeMenuListChange():......................Start.");
        if (ev) {
	    ev.stopPropagation();
        }

        this.handleAppKeyBaseDirPathChange(this.mAppKeyBaseDirPickerElem);

        this.logTrace("OSSLKeyConfigurator.handleCredTypeMenuListChange():......................End.");
    },

    handleAppKeyBaseDirPathChange : function (aAppKeyBaseDirPickerElem, ev) 
    {
        this.logTrace("OSSLKeyConfigurator.handleAppKeyBaseDirPathChange():......................Start.");
        if (ev) {
	    ev.stopPropagation();
        }

        if (this.mAppTypeMenuListElem.value == "globus") {
	    this.initGlobusKeyBaseDir();
	    this.initGlobusForSoftToken();
	    this.initGlobusForHardToken();
        }
        else {
	    var osslAppKeyBaseDir = this.initOSSLAppKeyBaseDir();
	    this.initOsslAppForSoftToken(osslAppKeyBaseDir);
	    this.initOsslAppForHardToken(osslAppKeyBaseDir);
        }
        this.logTrace("OSSLKeyConfigurator.handleAppKeyBaseDirPathChange():......................50.");

        if (this.mKeySourceOptionsGroupElem.selectedItem.value == "browser") {
	    this.initKeyCertFilePathFromKeyStore(this.mKeySourceBrowserCertPickerElem);
        }

        this.logTrace("OSSLKeyConfigurator.handleAppKeyBaseDirPathChange():......................End.");
    },

    loadKeyConfFile : function (confFileFilePickerElemId, ev)
    {
        this.logTrace("OSSLKeyConfigurator.loadKeyConfFile():......................Start.");
        if (ev) {
	    ev.stopPropagation();
        }

        this.resetAllTabs();

        this.logDebug("OSSLKeyConfigurator.loadKeyConfFile(): confFileFilePickerElemId: " + confFileFilePickerElemId + "");

        var confFileFilePickerElem = document.getElementById(confFileFilePickerElemId);
        var confFile = confFileFilePickerElem.file;
        if (confFile == null) {
	    confFile = confFileFilePickerElem.selectFile();
        }
        if (confFile == null) {
	    return;
        }

        this.initOpenSSLKeyConfigFile(confFileFilePickerElem);

        this.handleKeyTypeMenuListChange(this.mKeyTypeMenuListElem);

        keyConfSaveAsFilePickerElem.fileDisplayDirFile = confFile.parent;

        this.logTrace("OSSLKeyConfigurator.loadKeyConfFile():......................End.");
    },

    createModifyPasswordFile : function (passwordFilePickerElemId)
    {
        var passwordFilePickerElem = document.getElementById(passwordFilePickerElemId);

        var passwordFile = passwordFilePickerElem.file;
        if (passwordFile == null) {
	    passwordFilePickerElem.browse();
        }
        passwordFile =  passwordFilePickerElem.file;
        if (passwordFile == null) {
	    return;
        }
        var checkStateMsg = null;
        var checkStateObj = new Object();
        checkStateObj.value = null;
        var passwordObj = new Object();
        passwordObj.value = null;

        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService();
        promptService = promptService.QueryInterface(Components.interfaces.nsIPromptService);
        var dialogOk = promptService.promptPassword(
			window,
		     	"Enter password",
		     	"Enter password",
			passwordObj,
			checkStateMsg,
			checkStateObj
		     	);
        if (!dialogOk) {
	    return;
        }
        // var passwordText = prompt("Enter Password: ")
        var passwordText = passwordObj.value;
        if (passwordText) {
	    passwordFilePickerElem.saveFile(passwordText);
	    passwordFilePickerElem.refresh();
        }
    },

    saveAsConfig : function ()
    {
        this.logTrace("OSSLKeyConfigurator.saveAsConfig():......................Start.");

        var fileFilePickerElemId = "keymgr.ossl.keyconf.file.saveas.path";
        var confFilePickerElem = document.getElementById(fileFilePickerElemId);
        var confFile = confFilePickerElem.browse()
        if (confFile == null) {
	    return;
        }

        var retVal = this.saveConfFileData(confFilePickerElem);
        if (!retVal) {
	    return;
        }
        this.logTrace("OSSLKeyConfigurator.saveAsConfig():......................10.");

        this.mKeySourceFilePickerElem.value = confFilePickerElem.value;
        if (this.mKeySourceOptionsGroupElem.selectedItem.value != "file") {
	    this.mKeySourceOptionsGroupElem.selectedItem = this.mKeySourceOptionsFileElem;
	    this.handleBrowserSourceChange(false);
	    this.handleFileSourceChangeInternal(true);
        }
        this.mKeySourceFilePickerElem.focus();

    	// this.mKeyConfCmdCancelElem.hidden = true;
    	this.mKeyConfCmdCloseElem.hidden = false;

        this.logTrace("OSSLKeyConfigurator.saveAsConfig():......................End.");
    },

    saveConfig : function ()
    {
        if ((this.mKeySourceFilePickerElem.value == "") || (this.mKeySourceFilePickerElem.file == null)) {
	    this.saveAsConfig();
	    return;
        }

        this.saveConfFileData(this.mKeySourceFilePickerElem);


        return;
    },

    saveConfFileData : function (confFilePickerElem)
    {

        var configData = "";

        configData +=
"\r\n";

        configData +=
"TARGET_APP\t\t= " + this.mAppTypeMenuListElem.value + "\r\n";
        configData +=
"APP_BASE_DIR_PATH\t\t= " + this.mAppBaseDirPickerElem.value + "\r\n";
    configData +=
"\r\n";

        configData +=
"# CA certificates related paths" + "\r\n";
        configData +=
"CA_FILE_PATH\t\t= " + this.mCaCertsFilePickerElem.value + "\r\n";
        configData +=
"CA_FILE_FORMAT\t\t= " + (this.mCaCertsFilePickerElem.ascii ? "PEM" : "") + "\r\n";
        configData +=
"CA_DIR_PATH\t\t= " + this.mCaCertsDirPickerElem.value + "\r\n";
        configData +=
"PROFILE_ID\t\t= " + this.mAppKeyProfileIdElem.value + "\r\n";
        configData +=
"APP_KEY_BASE_DIR\t\t= " + this.mAppKeyBaseDirPickerElem.value + "\r\n";
        configData +=
"\r\n";

        configData +=
"# Choose from one of following: EMBEDDED | PRIV_KEY | PKCS12 | ENGINE" + "\r\n";
        configData +=
"KEY_FILE_TYPE\t\t= "  + this.mKeyTypeMenuListElem.selectedItem.value + "\r\n";
        configData +=
"\r\n";

        configData +=
"# OPENSSL Privatekey/Cert Parameters" + "\r\n";
        configData +=
"PRIVATE_KEY_PASSWORD_FILE_PATH\t= " + this.mKeyStorePrivateKeyPasswordFilePickerElem.value + "\r\n";
        configData +=
"PRIVATE_KEY_FILE_PATH\t= " + this.mKeyStorePrivateKeyFilePickerElem.value + "\r\n";
        configData +=
"PKCS8_KEY_FILE_PATH\t= " + this.mKeyStorePkcs8PrivateKeyFilePickerElem.value + "\r\n";
        configData +=
"PKCS8_KEY_FILE_FORMAT\t= " + (this.mKeyStorePrivateKeyCertFilePickerElem.ascii ? "PEM" : "") + "\r\n";
        configData +=
"PUBLIC_KEY_CERT_PATH\t= " + this.mKeyStorePrivateKeyCertFilePickerElem.value + "\r\n";
        configData +=
"PUBLIC_KEY_FILE_FORMAT\t= " + (this.mKeyStorePrivateKeyCertFilePickerElem.ascii ? "PEM" : "") + "\r\n";
        configData +=
"\r\n";

        configData +=
"# PKCS#12 Related Parameters" + "\r\n";
        configData +=
"PKCS12_FILE_PATH\t= " + this.mKeyStorePkcs12FileFilePickerElem.value + "\r\n";
        configData +=
"PKCS12_PASSWORD_FILE_PATH\t= " + this.mKeyStorePkcs12PasswordFilePickerElem.value + "\r\n";
        configData +=
"\r\n";

        configData +=
"# PKCS#11 Engine related parameters" + "\r\n";
        configData +=
"PKCS11_ENGINE_ID\t= " + this.mKeyStoreEngineIdElem.value + "\r\n";
        configData +=
"PKCS11_SO_PATH\t\t= " + this.mKeyStoreEngineSOFilePickerElem.value + "\r\n";
        configData +=
"PKCS11_MODULE_PATH\t= " + this.mKeyStoreEngineModuleFilePickerElem.value + "\r\n";
        configData +=
"PKCS11_KEY_ID\t\t= " + this.mKeyStoreEngineKeyIdElem.value + "\r\n";
        configData +=
"# Off Card Public key certificate for the private key in the smart card.\r\n";
        configData +=
"PKCS11_PUBLIC_KEY_CERT_PATH\t= " + this.mKeyStoreEngineCertFilePickerElem.value + "\r\n";
        configData +=
"ENGINE_PASSWORD_FILE_PATH\t= " + this.mKeyStoreEnginePasswordFilePickerElem.value + "\r\n";
        configData +=
"\r\n";


        this.logDebug(configData);
        try {
	    confFilePickerElem.saveFile(configData);
        } catch (ex) {
	    alert("Falied to save configuration data - ex: "  + ex);
	    return false;
        }
        return true;
    },

    reset : function ()
    {
        this.resetAllTabs();
    },

    cancel : function ()
    {
        window.close();
    },

    close : function ()
    {
        window.close();
    },


    exportFromBrowserKeyStore : function (aCertPickerElemId)
    {
    this.logTrace("OSSLKeyConfigurator.exportFromBrowserKeyStore():......................Start.");

    var certPickerElem = document.getElementById(aCertPickerElemId);
    if (!certPickerElem) {
	return;
    }

    var selectedCert = certPickerElem.selectedCert;
    if (selectedCert == null) {
	return;
    }
    this.logDebug("OSSLKeyConfigurator.exportFromBrowserKeyStore(): selectedCert: " + selectedCert + "");
    this.loginToCertToken(selectedCert);


    /*
    // var hardwareToken = true;
    var hardwareToken = false;
    var keyTokenName = selectedCert.tokenName;
    var keyToken = this.mPK11TokenDB.findTokenByName(keyTokenName);
    if ((keyToken != null) && (keyToken.isHardwareToken() == true)) {
	hardwareToken = true;
    }
    */
    var hardwareToken = certPickerElem.isHardwareToken(selectedCert);

    var keyFileNamePrefix = certPickerElem.adaptNickName(selectedCert, true); // selectedCert.nickname;
    if (!keyFileNamePrefix) {
	keyFileNamePrefix = "dummyUser";
    }

    // Initialize the default Directory for key, cert and password files for auto-select 
    var keyCertOutDirFile = this.getOSSLAppBaseDir();

    var selected_certs = [];
    var formatType = "b64";

    var keyStoreType = this.mKeyTypeMenuListElem.selectedItem.value;
    // if (hardwareToken) {
    if (keyStoreType == "ENGINE") {
	if (this.mKeyStoreEngineIdElem.value == "") {
	    this.mKeyStoreEngineIdElem.value = "pkcs11";
	}
	formatType = "b64";
	var certFileName = keyFileNamePrefix + "_ht_x509_" + formatType + ".cer";
	this.mKeyStoreEngineCertFilePickerElem.defaultFileName = certFileName;
	var certFile = this.mKeyStoreEngineCertFilePickerElem.file;
	if (!certFile) {
	    var displayDirFile = this.mKeyStoreEngineCertFilePickerElem.fileDisplayDirFile;
	    if (!displayDirFile) {
		displayDirFile = keyCertOutDirFile;
	    }
	    certFile = this.mKeyStoreEngineCertFilePickerElem.autoSelectFile(displayDirFile, certFileName);
	}
	if (certFile) {
	    var asciiFormat = this.mKeyStoreEngineCertFilePickerElem.ascii;
	    var includeIssuerCertChain = false;
	    selected_certs[0] = selectedCert;

	    this.mKeyManager.exportCertListToFile(
			selected_certs.length,
			selected_certs,
			includeIssuerCertChain,
			certFile
			);
	    // Reinitialize the file attribute of this.mKeyStoreEngineCertFilePickerElem.
	    this.mKeyStoreEngineCertFilePickerElem.refresh();
	}
	else {
	   this.logError("OSSLKeyConfigurator.exportFromBrowserKeyStore(): this.mKeyStoreEngineCertFilePickerElem.browse() failed.");
	}

	var enginePasswdFileName = keyFileNamePrefix + "_ht_passwd.dat";
	this.mKeyStoreEnginePasswordFilePickerElem.defaultFileName = enginePasswdFileName;

	var enginePasswordFile = this.mKeyStoreEnginePasswordFilePickerElem.file;
	if (!enginePasswordFile) {
	    var displayDirFile = this.mKeyStoreEnginePasswordFilePickerElem.fileDisplayDirFile;
	    if (!displayDirFile) {
		displayDirFile = keyCertOutDirFile;
	    }
	    enginePasswordFile = this.mKeyStoreEnginePasswordFilePickerElem.autoSelectFile(displayDirFile, enginePasswdFileName);
	}

	var keyId = this.mKeyManager.getKeyIDForPrivateKey(selectedCert);
	this.logDebug("OSSLKeyConfigurator.exportFromBrowserKeyStore(): keyId: " + keyId + "");

	// var certTokenInfo = this.getCertTokenInfo(selectedCert);
	var certTokenInfo = certPickerElem.nickNameMenu.selectedItem.tokenInfo;
	if (certTokenInfo == null) {
	    certTokenInfo = certPickerElem.getCertTokenInfo(selectedCert);
	}
	certTokenInfo.keyId = keyId;

	if (certTokenInfo) {
	    // Format for OpenSSL Engine keyId : [<slotID>:]<KeyID>
	    var slotIdStr = "";
	    if (certTokenInfo.slotId <= 1) {
		   slotIdStr = "0" + certTokenInfo.slotId;
	    }
	    else {
		   slotIdStr = "" + certTokenInfo.slotId;
	    }
	    this.mKeyStoreEngineKeyIdElem.value = slotIdStr + ":" + certTokenInfo.keyId;
	    var moduleLibPath = certTokenInfo.module.libName;
	    if (moduleLibPath) {
		    this.mKeyStoreEngineModuleFilePickerElem.value = moduleLibPath;
	    }
	    else {
		    this.mKeyStoreEngineModuleFilePickerElem.value = "";
	    }
	}
	else {
	    this.logError("OSSLKeyConfigurator.exportFromBrowserKeyStore(): getCertTokenInfo() failed.");
	}
	this.mKeyTypeMenuListElem.selectedItem = this.mKeyTypeEngineElem;
    }
    else if (keyStoreType == "PRIVATE_KEY") {
	var osslEPKFileName = keyFileNamePrefix + "_ossl_epk" + ".pem";
	this.mKeyStorePrivateKeyFilePickerElem.defaultFileName = osslEPKFileName;
	var osslEPKFile = this.mKeyStorePrivateKeyFilePickerElem.file;
	if (!osslEPKFile) {
	    var displayDirFile = this.mKeyStorePrivateKeyFilePickerElem.fileDisplayDirFile;
	    if (!displayDirFile) {
		displayDirFile = keyCertOutDirFile;
	    }
	    osslEPKFile = this.mKeyStorePrivateKeyFilePickerElem.autoSelectFile(displayDirFile, osslEPKFileName);
	}
	this.logDebug("OSSLKeyConfigurator.exportFromBrowserKeyStore(): osslEPKFile: " + osslEPKFile + "");
	if (osslEPKFile) {
	    var includeCertChain = this.mKeyStorePrivateKeyIncludeCertElem.checked;
	    this.logDebug("OSSLKeyConfigurator.exportFromBrowserKeyStore(): includeCertChain: " + includeCertChain + "");
	    try {
	    	if (includeCertChain) {
	    	    var keyAsFirstItem = false;
	    	    var tagCertItemWithDN = false;
	    	    this.mKeyManager.exportOpenSSLEPKWithCertToFileByX509Cert(
				selectedCert,
				1, null,
				includeCertChain,
				keyAsFirstItem,
				tagCertItemWithDN,
				osslEPKFile
				);
	    	}
	    	else {
		    this.mKeyManager.exportOpenSSLEPKToFileByX509Cert(
				selectedCert,
				1, null,
				osslEPKFile
				);
	    	}
	    	this.mKeyStorePrivateKeyFilePickerElem.refresh();
	    } catch (ex) {
	    	this.logError("OSSLKeyConfigurator.exportFromBrowserKeyStore(): xKeyManager.exportOpenSSLEPKToFileByX509Cert() failed - ex: " + ex + "");
	    }
	}

	formatType = "b64";
	if (!this.mKeyStorePkcs8PrivateKeyFilePickerElem.ascii) {
	    formatType = "der";
	}
	var pkcs8FileName = keyFileNamePrefix + "_priv_key_" + formatType + ".pk8";

	this.mKeyStorePkcs8PrivateKeyFilePickerElem.defaultFileName = pkcs8FileName;
	var pkcs8File = this.mKeyStorePkcs8PrivateKeyFilePickerElem.file;
	if (!pkcs8File) {
	    // pkcs8File = this.mKeyStorePkcs8PrivateKeyFilePickerElem.browse();
	    var displayDirFile = this.mKeyStorePkcs8PrivateKeyFilePickerElem.fileDisplayDirFile;
	    if (!displayDirFile) {
		displayDirFile = keyCertOutDirFile;
	    }
	    pkcs8File = this.mKeyStorePkcs8PrivateKeyFilePickerElem.autoSelectFile(displayDirFile, pkcs8FileName);
	}
	this.logDebug("OSSLKeyConfigurator.exportFromBrowserKeyStore(): pkcs8File: " + pkcs8File + "");
	if (pkcs8File) {
	    this.mKeyManager.exportPKCS8KeyToFileByX509Cert(
	    			selectedCert,
				1, null,
				this.mKeyStorePkcs8PrivateKeyFilePickerElem.ascii, pkcs8File
				);
	    this.mKeyTypeMenuListElem.selectedItem = this.mKeyTypePrivateKeyElem;
	    this.mKeyStorePkcs8PrivateKeyFilePickerElem.refresh();
	}

	var privKeyPasswdFileName = keyFileNamePrefix + "_priv_key_passwd.dat";
	this.mKeyStorePrivateKeyPasswordFilePickerElem.defaultFileName = privKeyPasswdFileName;
	var privKeyPasswdFile = this.mKeyStorePrivateKeyPasswordFilePickerElem.file;
	if (!privKeyPasswdFile) {
	    var displayDirFile = this.mKeyStorePrivateKeyPasswordFilePickerElem.fileDisplayDirFile;
	    if (!displayDirFile) {
		displayDirFile = keyCertOutDirFile;
	    }
	    privKeyPasswdFile = this.mKeyStorePrivateKeyPasswordFilePickerElem.autoSelectFile(displayDirFile, privKeyPasswdFileName);
	}

	formatType = "b64";
	if (!this.mKeyStorePrivateKeyCertFilePickerElem.ascii) {
	    formatType = "der";
	}
	var certFileName = keyFileNamePrefix + "_st_x509_" + formatType + ".cer";
	this.mKeyStorePrivateKeyCertFilePickerElem.defaultFileName = certFileName;
	// var certFile = this.mKeyStorePrivateKeyCertFilePickerElem.browse();
	var certFile = this.mKeyStorePrivateKeyCertFilePickerElem.file;
	if (!certFile) {
	    var displayDirFile = this.mKeyStorePrivateKeyCertFilePickerElem.fileDisplayDirFile;
	    if (!displayDirFile) {
		displayDirFile = keyCertOutDirFile;
	    }
	    certFile = this.mKeyStorePrivateKeyCertFilePickerElem.autoSelectFile(displayDirFile, certFileName);
	}
	this.logDebug("OSSLKeyConfigurator.exportFromBrowserKeyStore(): certFile: " + certFile + "");
	if (certFile) {
	    var asciiFormat = this.mKeyStorePrivateKeyCertFilePickerElem.ascii;
	    var includeIssuerCertChain = false;
	    if (includeIssuerCertChain) {
	    	selected_certs[0] = selectedCert;
		this.mKeyManager.exportCertListToFile(
			selected_certs.length,
			selected_certs,
			includeIssuerCertChain,
			certFile
			);
	    }
	    else {
		this.mKeyManager.exportCertToFileByX509Cert(
			selectedCert,
			asciiFormat,
			certFile
			);
	    }
	    // Reinitialize the file attribute of this.mKeyStorePrivateKeyCertFilePickerElem.
	    this.mKeyStorePrivateKeyCertFilePickerElem.refresh();
	}
    }
    else if (keyStoreType == "PKCS12") {
	var pkcs12FileName = keyFileNamePrefix + "_key_der.p12";
	this.mKeyStorePkcs12FileFilePickerElem.defaultFileName = pkcs12FileName;
	var pkcs12File = this.mKeyStorePkcs12FileFilePickerElem.file;
	if (!pkcs12File) {
	    var displayDirFile = this.mKeyStorePkcs12FileFilePickerElem.fileDisplayDirFile;
	    if (!displayDirFile) {
		displayDirFile = keyCertOutDirFile;
	    }
	    pkcs12File = this.mKeyStorePkcs12FileFilePickerElem.autoSelectFile(displayDirFile, pkcs12FileName);
	}
	selected_certs[0] = selectedCert;
	if (pkcs12File) {
	    this.mX509CertDB.exportPKCS12File(
			null,
			pkcs12File,
			selected_certs.length,
			selected_certs
			);
	    this.mKeyTypeMenuListElem.selectedItem = this.mKeyTypePkcs12Elem;

	}
	var pkcs12PasswdFileName = keyFileNamePrefix + "_p12_passwd.dat";
	this.mKeyStorePkcs12PasswordFilePickerElem.defaultFileName = privKeyPasswdFileName;
	var pkcs12PasswdFile = this.mKeyStorePkcs12PasswordFilePickerElem.file;
	if (!pkcs12PasswdFile) {
	    var displayDirFile = this.mKeyStorePkcs12PasswordFilePickerElem.fileDisplayDirFile;
	    if (!displayDirFile) {
		displayDirFile = keyCertOutDirFile;
	    }
	    pkcs12PasswdFile = this.mKeyStorePkcs12PasswordFilePickerElem.autoSelectFile(displayDirFile, pkcs12PasswdFileName);
	}

    }
    else {
    	throw ("Invalid Keystore type: " + keyStoreType);
    }
    this.handleKeyTypeMenuListChange(this.mKeyTypeMenuListElem);

    this.mKeyConfCmdSaveAsElem.disabled = false;
    // this.mKeyConfCmdExportElem.hidden = true;

    if (this.mDialogParamCmd == "browser") {
    	this.mKeyConfCmdCancelElem.hidden = true;
    	this.mKeyConfCmdCloseElem.hidden = false;
    }

    this.logTrace("OSSLKeyConfigurator.exportFromBrowserKeyStore():......................End.");
    },


    createModuleObject : function (/* nsIPKCS11Module */ moduleRef, /* nsIPKCS11Slot[] */ slotRefList)
    {
        var moduleObj = new Object();
        moduleObj.module = moduleRef;
        moduleObj.slotList = slotRefList;

        return moduleObj;
    },

    getCertTokenInfo : function (aCert)
    {
        this.logTrace("OSSLKeyConfigurator.getCertTokenInfo(" + aCert.nickname + "): .....................Start.");

        var tokenInfoObj = null;
        if (aCert == null) {
	    this.logError("OSSLKeyConfigurator.getCertTokenInfo(): null aCert.");
	    return null;
        }

        var /* nsIPKCS11Module */ moduleRef;
        var /* nsIPKCS11Slot */ slotRef;
        var /* nsIPK11Token */ tokenRef;

        var pkcs11ModuleList = this.getPKCS11ModuleList(false);

        this.logDebug("OSSLKeyConfigurator.getCertTokenInfo(): pkcs11ModuleList.length: " + pkcs11ModuleList.length + "");

        for (var i = 0; i < pkcs11ModuleList.length; i++) {
	    var moduleObj = pkcs11ModuleList[i];
	    moduleRef = moduleObj.module;
	    var slotList = moduleObj.slotList;
	    if (slotList == null) {
	        continue;
	    }
	    for (var slotId = 0; slotId < slotList.length; slotId++) {
	        slotRef = slotList[slotId];
	        if (slotRef == null) {
		    continue;
	        }
	        tokenRef = slotRef.getToken();
	        if (tokenRef == null) {
		    continue;
	        }
	        if (!tokenRef.needsLogin()) {
		    continue;
	        }

	        this.logDebug("OSSLKeyConfigurator.getCertTokenInfo(): " + 
			"    module: " + moduleRef.name + "\n" + 
			"    moduleLib: " + moduleRef.libName + "\n" + 
			"    slotId: " + slotId + " " + 
			"    slot: " + slotRef.name + "\n" + 
			"    token: " + tokenRef.tokenName + "\n" + 
			"    aCert.tokenName: " + aCert.tokenName + "" + 
			"");
	        if (tokenRef.tokenName != aCert.tokenName) {
		    continue;
	        }

	        var keyId = this.mKeyManager.getKeyIDForPrivateKey(aCert);;
	        tokenInfoObj = new Object();
	        tokenInfoObj.module = moduleRef;
	        tokenInfoObj.slotId = slotId;
	        tokenInfoObj.slot = slotRef;
	        tokenInfoObj.token = tokenRef;
	        tokenInfoObj.keyId = keyId;

	        return tokenInfoObj;
	    }
        }

        this.logTrace("OSSLKeyConfigurator.getCertTokenInfo(): .....................End.");
        return tokenInfoObj;
    },

    getPKCS11ModuleList : function (reload)
    {
        if (!reload && this.mPKCS11ModuleObjList) {
	    return this.mPKCS11ModuleObjList;
        }
        this.mPKCS11ModuleObjList = [];
        this.browseCryptoDeviceList();

        return this.mPKCS11ModuleObjList;
    },


    AddModule : function (/* nsIPKCS11Module */ moduleRef, /* nsIPKCS11Slot[] */ slotRefList)
    {
        this.mPKCS11ModuleObjList[this.mPKCS11ModuleObjList.length] = this.createModuleObject(moduleRef, slotRefList);
    },

    // Copied from .../mozilla/security/manager/pki/resources/content/device_manager.js
    browseCryptoDeviceList : function ()
    {
        this.logTrace("OSSLKeyConfigurator.browseCryptoDeviceList(): ...............Start.");

        var /* nsIPKCS11ModuleDB */ xsecmoddb;
        xsecmoddb = Components.classes["@mozilla.org/security/pkcs11moduledb;1"].
			getService(Components.interfaces.nsIPKCS11ModuleDB);

        var /* nsIEnumerator */ modules = xsecmoddb.listModules();
        var done = false;
    
        try {
          modules.isDone();
        } catch (e) { done = true; }
        while (!done) {
          var /* nsIPKCS11Module */ module = modules.currentItem().QueryInterface(Components.interfaces.nsIPKCS11Module);
          if (module) {
	    var slotnames = [];
	    var slotRefList = [];
	    var /* nsIEnumerator */ slots = module.listSlots();
	    var slots_done = false;
	    // this.logDebug("OSSLKeyConfigurator.browseCryptoDeviceList(): " + "module: " + module.name + "");
	    try {
	      slots.isDone();
	    } catch (e) { slots_done = true; }
	    while (!slots_done) {
	      var /* nsIPKCS11Slot */ slot = null;
   	    try {
	        slot = slots.currentItem().QueryInterface(nsIPKCS11Slot);
	      } catch (e) { slot = null; }
	      // in the ongoing discussion of whether slot names or token names
	      // are to be shown, I've gone with token names because NSS will
	      // prefer lookup by token name.  However, the token may not be
	      // present, so maybe slot names should be listed, while token names
	      // are "remembered" for lookup?
  	    slotRefList[slotRefList.length] = slot;
  	    if (slot != null) {
	        if (slot.tokenName)
	          slotnames[slotnames.length] = slot.tokenName;
	        else
	          slotnames[slotnames.length] = slot.name;
    
	        // this.logDebug("OSSLKeyConfigurator.browseCryptoDeviceList(): " + "    slot: " + slot.name + "");
  	    }
	      try {
	        slots.next();
	      } catch (e) { slots_done = true; }
	    }
	    this.AddModule(module, slotRefList);
          }
          try {
	    modules.next();
          } catch (e) { done = true; }
        }
        this.logTrace("OSSLKeyConfigurator.browseCryptoDeviceList(): ...............End.");
    },


    initOpenSSLKeyConfigFile : function (confFileFilePickerElem)
    {
        this.resetAllTabs();

        // var confFileData = readDataFromFile(confFile);
        var /* String */ confFileData = confFileFilePickerElem.readFile();
    
        this.initOpenSSLKeyConfigFileData(confFileData);
    },

    initOpenSSLKeyConfigFileData : function (confFileData)
    {
        this.logTrace("OSSLKeyConfigurator.initOpenSSLKeyConfigFileData():...............Start.");

        var nvpList = [];
        var confFileDataLines = confFileData.split(/\s*\r*\n/);
        for (var i = 0; i < confFileDataLines.length; i++) {
	    var confFileDataLine = "" + confFileDataLines[i];
	    var commentPattern = "^\s*#";
	    var isComment = confFileDataLine.match(commentPattern);
	    if (isComment) {
	        // this.logDebug("OSSLKeyConfigurator.Line " + i + ": Comment");
	        continue;
	    }
	    var blankLinePattern = "^\s*$";
	    var isBlankLine = confFileDataLine.match(blankLinePattern);
	    if (isBlankLine) {
	        // this.logDebug("OSSLKeyConfigurator.Line " + i + ": Blank Line");
	        continue;
	    }
	    // this.logDebug("OSSLKeyConfigurator.Line " + i + ": |" + confFileDataLine + "|");

	    var re = /\s*=\s*/;
	    var nvpItem = confFileDataLine.split(re);
	    if (nvpItem.length <= 0) {
	        continue;
	    }
	    if ((nvpItem.length == 1) && (nvpItem[0].length == 0)) {
	        continue;
	    }
	    var nvp = new Object();
	    // this.logDebug("OSSLKeyConfigurator.Line " + i + ": nvpItem.length: " + nvpItem.length + "");
	    switch(nvpItem.length) {
	        case 1: 
		    nvp.name = nvpItem[0];
		    nvp.value = "";
		    break;
	        default:
		    nvp.name = nvpItem[0];
		    nvp.value = nvpItem[1];
		    break;
	    }
	    // this.logDebug("OSSLKeyConfigurator.Line " + i + ": " + "name: |" + nvp.name + "| value: |" + nvp.value + "|");
	    nvpList[nvpList.length] = nvp;
        }
        this.initOpenSSLKeyConfigNVPList(nvpList);

        this.logTrace("OSSLKeyConfigurator.initOpenSSLKeyConfigFileData():...............End.");
    },

    initOpenSSLKeyConfigNVPList : function (nvpList)
    {
        this.mAppTypeMenuListElem.value = "custom";

        for (var i = 0; i < nvpList.length; i++) {
	    var nvp = nvpList[i];
	    this.OpenSSLKeyConfig_initNVP(nvp);
        }
    },

    OpenSSLKeyConfig_initNVP : function (nvp)
    {
        if (nvp == null) {
	    return;
        }
        if ((nvp.name == null) || (nvp.value == null)) {
	    return;
        }

        if (nvp.name == "TARGET_APP") {
	    this.mAppTypeMenuListElem.value = nvp.value;
	    return;
        }
        if (nvp.name == "APP_BASE_DIR_PATH") {
	    this.mAppBaseDirPickerElem.value = nvp.value;
	    return;
        }
        if (nvp.name == "CA_DIR_PATH") {
	    this.mCaCertsDirPickerElem.value = nvp.value;
	    return;
        }
    
        if (nvp.name == "CA_FILE_PATH") {
	    this.mCaCertsFilePickerElem.value = nvp.value;
	    return;
        }

        if (nvp.name == "PROFILE_ID") {
	    this.mAppKeyProfileIdElem.value = nvp.value;
	    return;
        }

        if (nvp.name == "APP_KEY_BASE_DIR") {
	    this.mAppKeyBaseDirPickerElem.value = nvp.value;
	    return;
        }


        if (nvp.name == "CA_FILE_FORMAT") {
	    if (nvp.value == "PEM") {
	       this.mCaCertsFilePickerElem.ascii = true;
	    }
	    else {
	       this.mCaCertsFilePickerElem.ascii = false;
	    }
	    return;
        }

        if (nvp.name == "KEY_FILE_TYPE") {
	    this.mKeyTypeMenuListElem.selectedItem = this.mKeyTypeEmbeddedElem;
	    if (nvp.value == "EMBEDDED") {
	        this.mKeyTypeMenuListElem.selectedItem = this.mKeyTypeEmbeddedElem;
	    }
	    else if (nvp.value == "PRIV_KEY") {
	        this.mKeyTypeMenuListElem.selectedItem = this.mKeyTypePrivateKeyElem;
	    }
	    else if (nvp.value == "PKCS12") {
	        this.mKeyTypeMenuListElem.selectedItem = this.mKeyTypePkcs12Elem;
	    }
	    else if (nvp.value == "ENGINE") {
	        this.mKeyTypeMenuListElem.selectedItem = this.mKeyTypeEngineElem;
	    }
	    return;
        }

        if (nvp.name == "PRIVATE_KEY_FILE_PATH") {
	    this.mKeyStorePrivateKeyFilePickerElem.value = nvp.value;
	    return;
        }
        if (nvp.name == "PKCS8_KEY_FILE_PATH") {
	    this.mKeyStorePkcs8PrivateKeyFilePickerElem.value = nvp.value;
	    return;
        }
        if (nvp.name == "PKCS8_KEY_FILE_FORMAT") {
	    if (nvp.value == "PEM") {
	       this.mKeyStorePkcs8PrivateKeyFilePickerElem.ascii = true;
	    }
	    else {
	       this.mKeyStorePkcs8PrivateKeyFilePickerElem.ascii = false;
	    }
	    return;
        }

        if (nvp.name == "PUBLIC_KEY_CERT_PATH") {
	    this.mKeyStorePrivateKeyCertFilePickerElem.value = nvp.value;
	    return;
        }
        if (nvp.name == "PUBLIC_KEY_FILE_FORMAT") {
	    if (nvp.value == "PEM") {
	       this.mKeyStorePrivateKeyCertFilePickerElem.ascii = true;
	    }
	    else {
	       this.mKeyStorePrivateKeyCertFilePickerElem.ascii = false;
	    }
	    return;
        }
        if (nvp.name == "PRIVATE_KEY_PASSWORD_FILE_PATH") {
	    this.mKeyStorePrivateKeyPasswordFilePickerElem.value = nvp.value;
	    return;
        }

        if (nvp.name == "PKCS12_FILE_PATH") {
	    this.mKeyStorePkcs12FileFilePickerElem.value = nvp.value;
	    return;
        }
        if (nvp.name == "PKCS12_FILE_FORMAT") {
	    if (nvp.value == "PEM") {
	    }
	    else {
	    }
	    return;
        }
        if (nvp.name == "PKCS12_PASSWORD_FILE_PATH") {
	    this.mKeyStorePkcs12PasswordFilePickerElem.value = nvp.value;
	    return;
        }

        if (nvp.name == "PKCS11_ENGINE_ID") {
	    this.mKeyStoreEngineIdElem.value = nvp.value;
	    return;
        }
        if (nvp.name == "PKCS11_SO_PATH") {
	    this.mKeyStoreEngineSOFilePickerElem.value = nvp.value;
	    return;
        }
        if (nvp.name == "PKCS11_MODULE_PATH") {
	    this.mKeyStoreEngineModuleFilePickerElem.value = nvp.value;
	    return;
        }
        if (nvp.name == "PKCS11_KEY_ID") {
	    this.mKeyStoreEngineKeyIdElem.value = nvp.value;
	    return;
        }
        if (nvp.name == "PKCS11_PUBLIC_KEY_CERT_PATH") {
	    this.mKeyStoreEngineCertFilePickerElem.value = nvp.value;
	    return;
        }
        if (nvp.name == "ENGINE_PASSWORD_FILE_PATH") {
	    this.mKeyStoreEnginePasswordFilePickerElem.value = nvp.value;
	    return;
        }
    },


    /* nsIFile */
    getProfileDir : function (profileId)
    {
        var profileDir = this.mDirService.get(profileId, Components.interfaces.nsIFile);
        return profileDir;
    },

    getHomeDir : function ()
    {
        return this.getProfileDir("Home");
    },

    getOSSLAppBaseDir : function ()
    {
        if (this.mAppBaseDirPickerElem.osslAppBaseDir) {
	    return this.mAppBaseDirPickerElem.osslAppBaseDir;
        }
        /*
        var keyCertOutDirFile = Components.classes["@mozilla.org/file/directory_service;1"].
		getService(Components.interfaces.nsIProperties).
		get("TmpD", Components.interfaces.nsIFile);
        */
        var osslAppBaseDir =  this.getProfileDir("TmpD");
        osslAppBaseDir.append("KeyManager");
        osslAppBaseDir.append("OSSL_APP");

        this.mAppBaseDirPickerElem.osslAppBaseDir = osslAppBaseDir;
        return osslAppBaseDir;
    },

    /* nsIFile */
    getOSSLAppKeyBaseDir : function ()
    {
        var osslAppKeyBaseDir = this.mAppKeyBaseDirPickerElem.file;

        if (!osslAppKeyBaseDir) {
	    osslAppKeyBaseDir = this.initOSSLAppKeyBaseDir();
        }
        return osslAppKeyBaseDir;
    },

    /* nsIFile */
    initOSSLAppKeyBaseDir : function ()
    {
        this.logTrace("OSSLKeyConfigurator.initOSSLAppKeyBaseDir():......................Start.");

        var osslAppBaseDir = this.getOSSLAppBaseDir();
        if (!osslAppBaseDir) {
	    return null;
        }

        var userProfileId = this.mAppKeyProfileIdElem.value;
        /*
        if (!userProfileId || (userProfileId == "")) {
	    userProfileId = "MyOsslKey";
        }
        */
        this.logDebug("OSSLKeyConfigurator.initOSSLAppKeyBaseDir(): userProfileId: " + userProfileId + "");

        var osslAppKeyBaseDir = osslAppBaseDir.clone();
        if (userProfileId && (userProfileId.length > 0)) {
	    osslAppKeyBaseDir.append(userProfileId);
        }
        if (!osslAppKeyBaseDir.exists()) {
	    osslAppKeyBaseDir.create(Components.interfaces.nsILocalFile.DIRECTORY_TYPE, PERMS_DIRECTORY);
        }
        this.mAppKeyBaseDirPickerElem.initWithFile(osslAppKeyBaseDir);

        this.logTrace("OSSLKeyConfigurator.initOSSLAppKeyBaseDir():......................End.");
        return osslAppKeyBaseDir;
    },

    initOsslAppForCACerts : function (appBaseDir)
    {
        if (!appBaseDir) {
	    return;
        }

        var caCertsFile = appBaseDir.clone();
        caCertsFile.append("ossl_cacerts_pem.cer");
        this.mCaCertsFilePickerElem.initWithFile(caCertsFile);

        var caCertsDir = appBaseDir.clone();
        caCertsDir.append("CADir");
        if (!caCertsDir.exists()) {
	    // globusDir.create(Components.interfaces.nsILocalFile.NORMAL_FILE_TYPE, PERMS_FILE);
	    caCertsDir.create(Components.interfaces.nsILocalFile.DIRECTORY_TYPE, PERMS_DIRECTORY);
        }
        this.mCaCertsDirPickerElem.initWithFile(caCertsDir);
    },


    initOsslAppForSoftToken : function (osslAppBaseDir)
    {
        this.logTrace("OSSLKeyConfigurator.initOsslAppForSoftToken():......................Start.");

        // var osslAppBaseDir = this.getOSSLAppBaseDir();
        if (!osslAppBaseDir) {
    	    this.logTrace("OSSLKeyConfigurator.initOsslAppForSoftToken():......................End(1).");
	    return;
        }

        this.mKeyStorePrivateKeyIncludeCertElem.checked = false;
        this.mKeyStorePrivateKeyFilePickerElem.value = "";
        this.mKeyStorePrivateKeyFilePickerElem.fileDisplayDirFile = osslAppBaseDir;
        this.mKeyStorePkcs8PrivateKeyFilePickerElem.value = "";
        this.mKeyStorePkcs8PrivateKeyFilePickerElem.fileDisplayDirFile = osslAppBaseDir;
        this.mKeyStorePrivateKeyPasswordFilePickerElem.value = "";
        this.mKeyStorePrivateKeyPasswordFilePickerElem.fileDisplayDirFile = osslAppBaseDir;
        this.mKeyStorePrivateKeyCertFilePickerElem.value = "";
        this.mKeyStorePrivateKeyCertFilePickerElem.fileDisplayDirFile = osslAppBaseDir;

        this.mKeyStorePkcs12FileFilePickerElem.value = "";
        this.mKeyStorePkcs12FileFilePickerElem.fileDisplayDirFile = osslAppBaseDir;
        this.mKeyStorePkcs12PasswordFilePickerElem.value = "";
        this.mKeyStorePkcs12PasswordFilePickerElem.fileDisplayDirFile = osslAppBaseDir;

        this.logTrace("OSSLKeyConfigurator.initOsslAppForSoftToken():......................End.");
    },

    initOsslAppForHardToken : function (osslAppBaseDir)
    {
        this.logTrace("OSSLKeyConfigurator.initOsslAppForHardToken():......................Start.");

        // var osslAppBaseDir = this.getOSSLAppBaseDir();
        if (!osslAppBaseDir) {
    	    this.logTrace("OSSLKeyConfigurator.initOsslAppForHardToken():......................End(1).");
	    return;
        }

        this.mKeyStoreEngineCertFilePickerElem.value = "";
        this.mKeyStoreEngineCertFilePickerElem.fileDisplayDirFile = osslAppBaseDir;

        this.logTrace("OSSLKeyConfigurator.initOsslAppForHardToken():......................End.");
    },

    /* nsIFile */
    getGlobusBaseDir : function ()
    {
        var globusBaseDir = null;
        /*
        globusBaseDir = this.mAppBaseDirPickerElem.file;
        */
        if (this.mAppBaseDirPickerElem.globusBaseDir) {
	    return this.mAppBaseDirPickerElem.globusBaseDir;
        }

        globusBaseDir = this.getHomeDir();
        if (!globusBaseDir) {
	    return null;
        }
        globusBaseDir.append(".globus");
        if (!globusBaseDir.exists()) {
	    // globusDir.create(Components.interfaces.nsILocalFile.NORMAL_FILE_TYPE, PERMS_FILE);
	    globusBaseDir.create(Components.interfaces.nsILocalFile.DIRECTORY_TYPE, PERMS_DIRECTORY);
        }
        this.mAppBaseDirPickerElem.globusBaseDir = globusBaseDir;
        return globusBaseDir;
    },

    /* nsIFile */
    initGlobusKeyBaseDir : function ()
    {
        this.logTrace("OSSLKeyConfigurator.initGlobusKeyBaseDir(): ...............Start.");

        var globusBaseDir = this.getGlobusBaseDir();
        if (!globusBaseDir) {
	    return null;
        }

        var userProfileId = this.mAppKeyProfileIdElem.value;
        /*
        if (!userProfileId || (userProfileId.length == 0)) {
	    userProfileId = "MyOsslKey";
        }
        */
        this.logDebug("OSSLKeyConfigurator.initGlobusKeyBaseDir(): userProfileId: " + userProfileId + "");

        var globusKeyBaseDir = globusBaseDir.clone();
        if (userProfileId && (userProfileId.length > 0)) {
	    globusKeyBaseDir.append(userProfileId);
        }
        if (!globusKeyBaseDir.exists()) {
	    globusKeyBaseDir.create(Components.interfaces.nsILocalFile.DIRECTORY_TYPE, PERMS_DIRECTORY);
        }
        this.mAppKeyBaseDirPickerElem.initWithFile(globusKeyBaseDir);

        this.logTrace("OSSLKeyConfigurator.initGlobusKeyBaseDir(): ...............End.");
        return globusKeyBaseDir;
    },

    /* nsIFile */
    getGlobusKeyBaseDir : function ()
    {
        var globusKeyBaseDir = this.mAppKeyBaseDirPickerElem.file;
        if (!globusKeyBaseDir) {
	    globusKeyBaseDir = this.initGlobusKeyBaseDir();
        }
        return globusKeyBaseDir;
    },

    /* nsIFile */
    getGlobusUserKeyFile : function ()
    {
        var globusKeyBaseDir = this.getGlobusKeyBaseDir();
        if (!globusKeyBaseDir) {
	    return null;
        }
        var globusUserKeyFile = globusKeyBaseDir.clone();

        // globusUserKeyFile.append("userkey.pem");
        // globusUserKeyFile.append("userkey.pk8");

        var globusCredType = this.mAppKeyCredTypeMenuElem.value;
        var keyFileName = globusCredType + "key.pem";
        globusUserKeyFile.append(keyFileName);

        return globusUserKeyFile;
    },

    /* nsIFile */
    getGlobusUserPkcs8KeyFile : function ()
    {
        var globusKeyBaseDir = this.getGlobusKeyBaseDir();
        if (!globusKeyBaseDir) {
	    return null;
        }
        var globusUserKeyFile = globusKeyBaseDir.clone();

        // globusUserKeyFile.append("userkey.pem");
        // globusUserKeyFile.append("userkey.pk8");

        var globusCredType = this.mAppKeyCredTypeMenuElem.value;
        var keyFileName = globusCredType + "key.pk8";
        globusUserKeyFile.append(keyFileName);

        return globusUserKeyFile;
    },

    /* nsIFile */
    getGlobusUserCertFile : function ()
    {
        var globusKeyBaseDir = this.getGlobusKeyBaseDir();
        if (!globusKeyBaseDir) {
	    return null;
        }
        var globusUserCertFile = globusKeyBaseDir.clone();

        var globusCredType = this.mAppKeyCredTypeMenuElem.value;
        var certFileName = globusCredType + "cert.pem";
        globusUserCertFile.append(certFileName);

        return globusUserCertFile;
    },

    /* nsIFile */
    getGlobusUserPKCS12File : function (certNickName)
    {
        var globusKeyBaseDir = this.getGlobusKeyBaseDir();
        if (!globusKeyBaseDir) {
	    return null;
        }
        var globusUserPKCS12File = globusKeyBaseDir.clone();

        // var pkcs12Filename = "usercred.p12";
        var globusCredType = this.mAppKeyCredTypeMenuElem.value;
        var pkcs12Filename = globusCredType + "cred.p12";
        globusUserPKCS12File.append(pkcs12Filename);
        return globusUserPKCS12File;
    },

    initGlobusForSoftToken : function ()
    {
        var globusDir = this.getGlobusBaseDir();
        if (!globusDir) {
	    return;
        }

        var userKeyFile = this.getGlobusUserKeyFile();
        if (userKeyFile) {
	    this.mKeyStorePrivateKeyIncludeCertElem.checked = false;
	    this.mKeyStorePrivateKeyFilePickerElem.initWithFile(userKeyFile);
	    this.mKeyStorePrivateKeyPasswordFilePickerElem.fileDisplayDirFile = userKeyFile.parent;
        }

        var userPkcs8KeyFile = this.getGlobusUserPkcs8KeyFile();
        if (userPkcs8KeyFile) {
	    this.mKeyStorePkcs8PrivateKeyFilePickerElem.ascii = true;
	    this.mKeyStorePkcs8PrivateKeyFilePickerElem.initWithFile(userPkcs8KeyFile);
	    this.mKeyStorePrivateKeyPasswordFilePickerElem.fileDisplayDirFile = userPkcs8KeyFile.parent;
        }

        var userCertFile = this.getGlobusUserCertFile();
        if (userCertFile) {
	    this.mKeyStorePrivateKeyCertFilePickerElem.ascii = true;
	    this.mKeyStorePrivateKeyCertFilePickerElem.initWithFile(userCertFile);
        }

        var userKeyPKCS12File = this.getGlobusUserPKCS12File();
        if (userKeyPKCS12File) {
	    this.mKeyStorePkcs12FileFilePickerElem.initWithFile(userKeyPKCS12File);
	    this.mKeyStorePkcs12PasswordFilePickerElem.fileDisplayDirFile = userKeyPKCS12File.parent;
        }
    },

    initGlobusForHardToken : function ()
    {
        var userCertFile = this.getGlobusUserCertFile();
        if (userCertFile) {
	    this.mKeyStoreEngineCertFilePickerElem.ascii = true;
	    this.mKeyStoreEngineCertFilePickerElem.initWithFile(userCertFile);
        }
    },

    lastMethod : function () 
    {
    }
}



