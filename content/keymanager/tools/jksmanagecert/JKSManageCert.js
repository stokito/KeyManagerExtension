/* @(#) $Id: JKSManageCert.js,v 1.20 2012/10/07 17:20:30 subrata Exp $ */

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


var JKSManageCertWizard = {


    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,

    mDialogParams		: null,
    mWizardInitalized		: false,

    mShellCmdPath		: null,
    mShellCmdFile		: null,
    mShellCmdType		: "shell",

    mJavaHomeDirPath		: null,
    mKeyToolFilePath		: null,
    mKeyToolFile		: null,
    mJavaVersion		: "1.6", // for Java version > 1.6
    mGenKeyOptionName		: "-genkeypair",


    mWizardElem			: null,

    mTestMode 			: false,

    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > JKSManageCertWizard.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    logError : function(msg)
    {
        JKSManageCertWizard.log(2, msg);
    },
    logTrace : function(msg)
    {
        JKSManageCertWizard.log(4, msg);
    },
    logDebug : function(msg)
    {
        JKSManageCertWizard.log(8, msg);
    },

    loginToInternalToken : function () 
    {
	// JKSManageCertWizard.mMaxLogLevel = 9;
        JKSManageCertWizard.logTrace("JKSManageCertWizard.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = JKSManageCertWizard.mTokenDB.getInternalKeyToken();
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
	    	JKSManageCertWizard.logDebug("JKSManageCertWizard.loginToInternalToken():  unable to obtain preferences - ex: " + ex);
		break;
	    }

	} while (0);

	if (testOption && testPassword) {
            /**********************************************/
            /* TODO:  TEST CODE - remove after test phase */
            /**********************************************/
	    JKSManageCertWizard.mTestMode = testOption;
	    try {
	    	token.checkPassword(testPassword);
            } catch (ex) {}
	}

	try {
            token.login(false);
            JKSManageCertWizard.logTrace("JKSManageCertWizard.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        JKSManageCertWizard.logTrace("JKSManageCertWizard.loginToInternalToken():................End.");
	// JKSManageCertWizard.mMaxLogLevel = 4;
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
        JKSManageCertWizard.logTrace("JKSManageCertWizard.initXPComServiceInfo():................Start.");

        try {
    	    JKSManageCertWizard.mIOService = Components.classes["@mozilla.org/network/io-service;1"]
		    		.getService(Components.interfaces.nsIIOService);
	    JKSManageCertWizard.mDirService = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties);
	    JKSManageCertWizard.mX509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
	                        .getService(Components.interfaces.nsIX509CertDB);
            JKSManageCertWizard.mTokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
                                .getService(Components.interfaces.nsIPK11TokenDB);
	    JKSManageCertWizard.mKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
	                        .getService(Components.interfaces.alrIKeyManager);
	    /*
            JKSManageCertWizard.mCRLManager = Components.classes["@avaya.com/pkm/alrcrlmanager;1"]
				.getService(Components.interfaces.alrICRLManager);
	     */
        } catch (ex) {
    	    alert("JKSManageCertWizard.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    JKSManageCertWizard.logError("JKSManageCertWizard.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	JKSManageCertWizard.loginToInternalToken();

	JKSManageCertWizard.logTrace("JKSManageCertWizard.initXPComServiceInfo():................End.");
    },


    initOnLoad : function () 
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.initOnLoad():................Start.");

    	// JKSManageCertWizard.logTrace("JKSManageCertWizard.initOnLoad(): window.arguments: " + window.arguments);

        if ((window.arguments) && (window.arguments.length > 0)) {
            var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    JKSManageCertWizard.mDialogParams = dialogParams;
	}
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.initOnLoad():...................10.");


    	JKSManageCertWizard.mWizardElem		= document.getElementById('keymgr.jksmanagecert.wizard');

    	JKSManageCertWizard.mKeyStoreNewElem		= document.getElementById('keymgr.jksmanagecert.selectks.new');
    	JKSManageCertWizard.mKeyStoreFileDeckElem	= document.getElementById('keymgr.jksmanagecert.selectks.keystore.deck');
    	JKSManageCertWizard.mKeyStoreFilePickerElem	= document.getElementById('keymgr.jksmanagecert.selectks.keystore');
    	JKSManageCertWizard.mKeyStoreNewFilePickerElem	= document.getElementById('keymgr.jksmanagecert.selectks.keystore.new');
    	JKSManageCertWizard.mStoreTypeElem		= document.getElementById('keymgr.jksmanagecert.selectks.storetype');
    	JKSManageCertWizard.mStorePassElem		= document.getElementById('keymgr.jksmanagecert.selectks.storepass');
    	JKSManageCertWizard.mKSTaskTypeElem		= document.getElementById('keymgr.jksmanagecert.selectks.tasktype');
    	JKSManageCertWizard.mKSTaskTypeNewCertElem	= document.getElementById('keymgr.jksmanagecert.selectks.tasktype.new');
    	JKSManageCertWizard.mKSTaskTypeCreateCSRElem	= document.getElementById('keymgr.jksmanagecert.selectks.tasktype.alias');

    	JKSManageCertWizard.mNewCertAliasElem		= document.getElementById('keymgr.jksmanagecert.createcert.alias');
    	JKSManageCertWizard.mNewCertSubjectDNElem	= document.getElementById('keymgr.jksmanagecert.createcert.subjectdn');
    	JKSManageCertWizard.mNewCertKeyTypeElem	= document.getElementById('keymgr.jksmanagecert.createcert.keytype');
    	JKSManageCertWizard.mNewCertKeySizeElem	= document.getElementById('keymgr.jksmanagecert.createcert.keysize');
    	JKSManageCertWizard.mNewCertSigAlgElem		= document.getElementById('keymgr.jksmanagecert.createcert.sigalg');
    	JKSManageCertWizard.mNewCertExpiresOnElem	= document.getElementById('keymgr.jksmanagecert.createcert.expireson');
    	JKSManageCertWizard.mNewCertValidityDaysElem	= document.getElementById('keymgr.jksmanagecert.createcert.validitydays');


	JKSManageCertWizard.mAliasListTmpFilePickerElem	= document.getElementById("keymgr.jksmanagecert.selectks.listout");
	JKSManageCertWizard.mAliasMenuListElem		= document.getElementById("keymgr.jksmanagecert.createcsr.aliaslist");
	JKSManageCertWizard.mAliasCertInfoElem		= document.getElementById("keymgr.jksmanagecert.createcsr.alias.certinfo");
	JKSManageCertWizard.mCertReqFilePickerElem	= document.getElementById("keymgr.jksmanagecert.createcsr.certreq");

	JKSManageCertWizard.mSignCertCSRFileItemElem	= document.getElementById("keymgr.jksmanagecert.signcert.certreq");
	JKSManageCertWizard.mSignCertSignerCertPickerElem	= document.getElementById("keymgr.jksmanagecert.signcert.certpicker");
	JKSManageCertWizard.mSignCertSignedCertFilePickerElem	= document.getElementById("keymgr.jksmanagecert.signcert.certout");


	JKSManageCertWizard.mImportCertSourceTypeElem	= document.getElementById("keymgr.jksmanagecert.importcertparam.sourcetype");
	JKSManageCertWizard.mImportCertSourceDeckElem	= document.getElementById("keymgr.jksmanagecert.importcertparam.source.deck");
	JKSManageCertWizard.mImportCertPickerElem	= document.getElementById("keymgr.jksmanagecert.importcertparam.certpicker");
	JKSManageCertWizard.mImportFilePickerElem	= document.getElementById("keymgr.jksmanagecert.importcertparam.filepicker");
	JKSManageCertWizard.mImportCertIncludeChainElem	= document.getElementById("keymgr.jksmanagecert.importcertparam.includecertchain");

	JKSManageCertWizard.mImportCertGridElem		= document.getElementById("keymgr.jksmanagecert.importcert.grid");
	JKSManageCertWizard.mImportCertOutFilePickerElem = document.getElementById("keymgr.jksmanagecert.importcert.outfile");
	JKSManageCertWizard.mImportResultOutFilePickerElem = document.getElementById("keymgr.jksmanagecert.importcert.resultfile");
	JKSManageCertWizard.mImportResultDataElem	= document.getElementById("keymgr.jksmanagecert.final.result");
	JKSManageCertWizard.mImportCertAliaListElem	= document.getElementById("keymgr.jksmanagecert.final.aliaslist");
	JKSManageCertWizard.mImportCertAliasInfoElem	= document.getElementById("keymgr.jksmanagecert.final.alias.certinfo");

	/*
	JKSManageCertWizard.mSignedCertItemElem	= document.getElementById("keymgr.jksmanagecert.importcert.cert");
	JKSManageCertWizard.mSignedCertFileItemElem	= document.getElementById("keymgr.jksmanagecert.importcert.file");
	JKSManageCertWizard.mSignedCertAliasElem	= document.getElementById("keymgr.jksmanagecert.importcert.alias");
	*/

	JKSManageCertWizard.mNewCertExpiresOnElem.refresh();
	JKSManageCertWizard.mNewCertExpiresOnElem.addDays((365 * 3));

	JKSManageCertWizard.initXPComServiceInfo();

	JKSManageCertWizard.initWithDefaultValues();
	JKSManageCertWizard.initWithDialogParams();
	JKSManageCertWizard.handleCreateCertExpiresOnChange(JKSManageCertWizard.mNewCertExpiresOnElem);

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.initOnLoad():................End.");
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
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.initWithDefaultValues():................Start.");
	var isWin = (navigator.userAgent.indexOf("Win") != -1);

	if (!isWin) {
	    JKSManageCertWizard.mShellCmdPath = "/bin/bash";
	}

	JKSManageCertWizard.mJavaHomeDirPath = JKSManageCertWizard.getEnvironmentVariable("JAVA_HOME");
	if (!JKSManageCertWizard.mJavaHomeDirPath) {
	    JKSManageCertWizard.mJavaHomeDirPath = JKSManageCertWizard.getEnvironmentVariable("JDK_HOME");
	}
	JKSManageCertWizard.mJavaVersion = "1.6";
	JKSManageCertWizard.mGenKeyOptionName = "-genkeypair";

	do {
            var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
            try {
                var prefBranchPrefixId = "extensions.avpki.jksmanagecert.";
                var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
                if (!prefsBranch) {
    	            break;
                }

                var prefStringValue = null;
                var prefBoolValue = false;
                var prefIntValue = false;

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("shellcmdpath");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    JKSManageCertWizard.mShellCmdPath = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("javahome");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    JKSManageCertWizard.mJavaHomeDirPath = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("javaversion");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    JKSManageCertWizard.mJavaVersion = prefStringValue;
		    if (JKSManageCertWizard.mJavaVersion == "1.5") {
	    	        JKSManageCertWizard.mGenKeyOptionName = "-genkey"
		    }
		    else {
	    	        JKSManageCertWizard.mGenKeyOptionName = "-genkeypair"
		    }
	        }

		/*
                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("genkeyoption");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    JKSManageCertWizard.mGenKeyOptionName = prefStringValue;
	        }
		*/

                prefIntValue = 0;
		try {
		    prefIntValue = prefsBranch.getIntPref("log.level");
		    if (prefIntValue > 0) {
	            	JKSManageCertWizard.mMaxLogLevel = prefIntValue;
		    }
		} catch (ex) {} 

		/*
                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("log.enabled");
	            JKSManageCertWizard.mXXXX.checked = prefBoolValue;
		} catch (ex) {} 
		*/

            } catch (ex) {
	    	JKSManageCertWizard.logDebug("JKSManageCertWizard.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.initWithDefaultValues(): JKSManageCertWizard.mMaxLogLevel: " + JKSManageCertWizard.mMaxLogLevel);
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.initWithDefaultValues(): JKSManageCertWizard.mJavaVersion: " + JKSManageCertWizard.mJavaVersion);
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.initWithDefaultValues(): JKSManageCertWizard.mGenKeyOptionName: " + JKSManageCertWizard.mGenKeyOptionName);
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.initWithDefaultValues(): JKSManageCertWizard.mShellCmdPath: " + JKSManageCertWizard.mShellCmdPath);

	if (JKSManageCertWizard.mShellCmdPath) {
	  try {
	    var executableFilePath = JKSManageCertWizard.mShellCmdPath;
	    var executableFile = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
	    executableFile.initWithPath(JKSManageCertWizard.mShellCmdPath);
    	    JKSManageCertWizard.logDebug("JKSManageCertWizard.initWithDefaultValues(): mShellCmd: " +
	    				"exists: " + executableFile.exists() + " " + 
	    				"isFile: " + executableFile.isFile() + " " + 
	    				"isExecutable: " + executableFile.isExecutable() + " " + 
	    				"");
	    if (executableFile.exists() && executableFile.isFile() && executableFile.isExecutable()) {
	    	JKSManageCertWizard.mShellCmdFile = executableFile;
		var cmdFileName = JKSManageCertWizard.mShellCmdFile.leafName;
    	    	JKSManageCertWizard.logDebug("JKSManageCertWizard.initWithDefaultValues(): cmdFileName: " + cmdFileName); 
		if ((cmdFileName.indexOf("perl") == 0) || (cmdFileName.indexOf("Perl") == 0)) {
		    JKSManageCertWizard.mShellCmdType = "perl";
		}
		else {
		    JKSManageCertWizard.mShellCmdType = "shell";
		}
	    } 
	    else {
    	        JKSManageCertWizard.logError("JKSManageCertWizard.initWithDefaultValues(): couldn't find shell cmd file: " + executableFilePath);
	    }
	  } catch (ex) {
	  }
	}
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.initWithDefaultValues(): JKSManageCertWizard.mShellCmdPath: " + JKSManageCertWizard.mShellCmdPath);

	if (JKSManageCertWizard.mJavaHomeDirPath) {
	    var keytoolFile = null;
	    try {
	    	keytoolFile = Components.classes['@mozilla.org/file/local;1']
		                     .createInstance(Components.interfaces.nsILocalFile);
	    	// JKSManageCertWizard.mKeyToolPath = JKSManageCertWizard.mJavaHomeDirPath + "/" + "bin" + "/" + "keytool";
		keytoolFile.initWithPath(JKSManageCertWizard.mJavaHomeDirPath);
		keytoolFile.append("bin");
		if (isWin) {
		    keytoolFile.append("keytool.exe");
		}
		else {
		    keytoolFile.append("keytool");
		}
		if (keytoolFile.exists()) {
		    JKSManageCertWizard.mKeyToolFile = keytoolFile;
		    JKSManageCertWizard.mKeyToolFilePath = keytoolFile.path;
		    var isWin = (navigator.userAgent.indexOf("Win") != -1);
		    if (isWin) {
	    	    	JKSManageCertWizard.mKeyToolFilePath = "'" + JKSManageCertWizard.mKeyToolFilePath + "'";
		    }
		}
	    } catch(ex) {}
	}
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.initWithDefaultValues(): JKSManageCertWizard.mJavaHomeDirPath: " + JKSManageCertWizard.mJavaHomeDirPath);
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.initWithDefaultValues(): JKSManageCertWizard.mKeyToolFilePath: " + JKSManageCertWizard.mKeyToolFilePath);

	// JKSManageCertWizard.handleCRLFileSaveOptionChange(JKSManageCertWizard.mCRLFileSaveOptionElem);

	if (!JKSManageCertWizard.mShellCmdFile || !JKSManageCertWizard.mShellCmdFile.exists()) {
	    alert("Couldn't validate shell-cmd file path - either it is not specified or it does not exist. Use Preferences/Options to modify it.");
	    // throw "Couldn't validate shell cmd path";
	    return;
	}
	if (!JKSManageCertWizard.mKeyToolFile || !JKSManageCertWizard.mKeyToolFile.exists()) {
	    alert("Couldn't validate keytool file path - either it is not specified or it does not exist. Use Preferences/Options to modify it.");
	    return;
	}
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.initWithDialogParams():................Start.");
    	// JKSManageCertWizard.logTrace("JKSManageCertWizard.initWithDialogParams(): window.arguments: " + window.arguments);

        if (!(window.arguments) || (window.arguments.length <= 0)) {
    	    JKSManageCertWizard.logTrace("JKSManageCertWizard.initWithDialogParams():................End(0).");
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
		    JKSManageCertWizard.logDebug("JKSManageCertWizard.initWithDialogParams(): paramCRL: " + paramCRL);
	            selectedCRL = paramCRL.QueryInterface(Components.interfaces.alrICRL);
	        }
		*/
	    }
	} catch (ex) {
    	    JKSManageCertWizard.logError("JKSManageCertWizard.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.initWithDialogParams():................End.");
    },

    handleTextboxChange : function (aTextboxElem, ev) 
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = JKSManageCertWizard.trim(aTextboxElem.value);
	}

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleTextboxChange():................End.");
    },

    executeCmdLineShellCommand : function (aKeytoolCommand) 
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.executeCmdLineShellCommand():................Start.");
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.executeCmdLineShellCommand(): aKeytoolCommand: " + aKeytoolCommand + "\n");

	if (!JKSManageCertWizard.mShellCmdFile || !JKSManageCertWizard.mShellCmdFile.exists()) {
    	    JKSManageCertWizard.logError("JKSManageCertWizard.executeCmdLineShellCommand(): couldn't find shell cmd file: " + JKSManageCertWizard.mShellCmdPath);
	    alert("Couldn't validate shell cmd path - either it is not specified or exits. Use Preferences/Options to modify it.");
	    return -1;
	}

	// var blocking = false;
	var blocking = true;
	var args = [];
	args[0] = "-c";
	args[1] = aKeytoolCommand;

	window.setCursor('wait');
	var process = Components.classes["@mozilla.org/process/util;1"]
				.createInstance(Components.interfaces.nsIProcess);
	process.init(JKSManageCertWizard.mShellCmdFile);
        var result = process.run(blocking, args, args.length);

	window.setCursor('auto');

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.executeCmdLineShellCommand():................End.");
	return result;
    },

    executePerlCommand : function (aKeytoolCommand) 
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.executePerlCommand():................Start.");

	if (!JKSManageCertWizard.mShellCmdFile || !JKSManageCertWizard.mShellCmdFile.exists()) {
    	    JKSManageCertWizard.logError("JKSManageCertWizard.executePerlCommand(): couldn't find shell cmd file: " + JKSManageCertWizard.mShellCmdPath);
	    return -1;
	}

	var isWin = (navigator.userAgent.indexOf("Win") != -1);

	var keytoolCmd = aKeytoolCommand;
	// var blocking = false;
	var blocking = true;
	var args = [];
	args[0] = "-e";
	if (isWin) {
	    keytoolCmd = aKeytoolCommand.replace(/'/g, "\\\'");
	    keytoolCmd = aKeytoolCommand.replace(/'/g, "\"");
	    args[1] = "$command = '" + keytoolCmd + "'; system $command;";
	} 
	else {
	    args[1] = "$command = \"" + keytoolCmd + "\"; system $command;";
	}
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.executePerlCommand():\n" + JKSManageCertWizard.mShellCmdPath + " " + args[0] + " " + args[1] + "\n");

	window.setCursor('wait');
	var process = Components.classes["@mozilla.org/process/util;1"]
				.createInstance(Components.interfaces.nsIProcess);
	process.init(JKSManageCertWizard.mShellCmdFile);
	var result = 0;
	try {
            process.run(blocking, args, args.length);
	} catch (ex) {
    	    JKSManageCertWizard.logError("JKSManageCertWizard.executePerlCommand(): failed to execute keytool command:\n" + keytoolCmd + "\n - ex: " + ex);
	    result = -1;
	}
	result = process.exitValue;
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.executePerlCommand(): result: " + result);

	window.setCursor('auto');

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.executePerlCommand():................End.");
	return result;
    },

    executeJavaKeytoolCommand : function (aKeytoolCommand) 
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.executeJavaKeytoolCommand():................Start.");
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.executeJavaKeytoolCommand(): aKeytoolCommand:\n" + aKeytoolCommand + "\n");

	var result = -1;
	if (!JKSManageCertWizard.mShellCmdFile || !JKSManageCertWizard.mShellCmdFile.exists()) {
    	    JKSManageCertWizard.logError("JKSManageCertWizard.executeJavaKeytoolCommand(): couldn't find shell cmd file: " + JKSManageCertWizard.mShellCmdPath);
	    return result;
	}
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.executeJavaKeytoolCommand(): JKSManageCertWizard.mShellCmdType: " + JKSManageCertWizard.mShellCmdType);

	if (JKSManageCertWizard.mShellCmdType == "perl") {
	    result = JKSManageCertWizard.executePerlCommand(aKeytoolCommand);
	}
	else {
	    result = JKSManageCertWizard.executeCmdLineShellCommand(aKeytoolCommand);
	}

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.executeJavaKeytoolCommand():................End.");
	return result;
    },

    selectKeyStorePageShow : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.selectKeyStorePageShow():..................Start.");


	if (!JKSManageCertWizard.mWizardInitalized) {
	    JKSManageCertWizard.initOnLoad();
	    JKSManageCertWizard.mWizardInitalized = true;
	}
        JKSManageCertWizard.mWizardElem.canAdvance = false;

	JKSManageCertWizard.mAliasListTmpFilePickerElem.autoSelectTempFile("KeyManager/Keytool/Result", "keytool_list_result.txt");

	JKSManageCertWizard.handleKeyStoreNewChange(JKSManageCertWizard.mKeyStoreNewElem);
	// JKSManageCertWizard.selectKeyStorePageValidate();

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.selectKeyStorePageShow():..................End.");
    },

    selectKeyStorePageValidate : function ()
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.selectKeyStorePageValidate():..................Start.");
	if (!JKSManageCertWizard.mShellCmdFile || !JKSManageCertWizard.mShellCmdFile.exists()) {
	    // alert("Couldn't validate shell-cmd file path - either it is not specified or it does not exist. Use Preferences/Options to modify it.");
            JKSManageCertWizard.mWizardElem.canAdvance = false;
	    return false;
	}
	if (!JKSManageCertWizard.mKeyToolFile || !JKSManageCertWizard.mKeyToolFile.exists()) {
	    // alert("Couldn't validate keytool file path - either it is not specified or it does not exist. Use Preferences/Options to modify it.");
            JKSManageCertWizard.mWizardElem.canAdvance = false;
	    return false;
	}
	

	if (!JKSManageCertWizard.mKeyStoreFilePickerElem.file ||
		(JKSManageCertWizard.mStoreTypeElem.selectedIndex < 0) ||
		(JKSManageCertWizard.mStorePassElem.value == "")) {
            JKSManageCertWizard.mWizardElem.canAdvance = false;
	    return false;
	}

        JKSManageCertWizard.mWizardElem.canAdvance = true;

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.selectKeyStorePageValidate():..................End.");
	return true;
    },

    handleKeyStoreNewChange : function (aKeyStoreNewElem, ev)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleKeyStoreNewChange():..................Start.");

	JKSManageCertWizard.mKSTaskTypeCreateCSRElem.disabled = aKeyStoreNewElem.checked;
	if (aKeyStoreNewElem.checked) {
	    if (JKSManageCertWizard.mKSTaskTypeElem.selectedItem == JKSManageCertWizard.mKSTaskTypeCreateCSRElem) {
	    	JKSManageCertWizard.mKSTaskTypeElem.selectedItem = JKSManageCertWizard.mKSTaskTypeNewCertElem;
	    }

	    JKSManageCertWizard.mKeyStoreFileDeckElem.selectedPanel = JKSManageCertWizard.mKeyStoreNewFilePickerElem;
	    JKSManageCertWizard.handleKeyStoreNewFilePickerChange(JKSManageCertWizard.mKeyStoreNewFilePickerElem);
	}
	else {
	    JKSManageCertWizard.mKeyStoreFileDeckElem.selectedPanel = JKSManageCertWizard.mKeyStoreFilePickerElem;
	    JKSManageCertWizard.mKeyStoreFilePickerElem.filepath = "";
	    JKSManageCertWizard.handleKeyStoreFilePickerChange(JKSManageCertWizard.mKeyStoreFilePickerElem);
	}

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleKeyStoreNewChange():..................End.");
    },

    handleKeyStoreFilePickerChange : function (aKeyStoreFilePickerElem, ev)
    {
    	JKSManageCertWizard.selectKeyStorePageValidate();
    },

    handleKeyStoreNewFilePickerChange : function (aKeyStoreNewFilePickerElem, ev)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleKeyStoreNewFilePickerChange():..................Start.");

	JKSManageCertWizard.mKeyStoreFilePickerElem.file = aKeyStoreNewFilePickerElem.file;
	// JKSManageCertWizard.mStorePassElem.value = "";

	JKSManageCertWizard.handleKeyStoreFilePickerChange(JKSManageCertWizard.mKeyStoreFilePickerElem);
    	// JKSManageCertWizard.selectKeyStorePageValidate();

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleKeyStoreNewFilePickerChange():..................End.");
    },

    handleStorePassChange : function (aStorePassElem, ev)
    {
    	JKSManageCertWizard.selectKeyStorePageValidate();
    },

    handleInputCertTypeChange : function (aCertTypeElem, ev)
    {
    	JKSManageCertWizard.selectKeyStorePageValidate();
    },

    selectKeyStorePageAdvanced : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.selectKeyStorePageAdvanced():..................Start.");

	if (JKSManageCertWizard.mKSTaskTypeElem.selectedItem.value == "newcert") {
	    aWizardPageElem.next = "keymgr.jksmanagecert.createcert.wizardpage";
	}
	else if (JKSManageCertWizard.mKSTaskTypeElem.selectedItem.value == "alias") {
	    aWizardPageElem.next = "keymgr.jksmanagecert.createcsr.wizardpage";
	}
	else if (JKSManageCertWizard.mKSTaskTypeElem.selectedItem.value == "importcert") {
	    aWizardPageElem.next = "keymgr.jksmanagecert.importcertparam.wizardpage";
	}
	else {
	    return false;
	}

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.selectKeyStorePageAdvanced():..................End.");
	return true;
    }, 

    createCertPageShow : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.createCertPageShow():..................Start.");

	JKSManageCertWizard.createCertPageValidate();

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.createCertPageShow():..................End.");
    },

    createCertPageValidate : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.createCertPageValidate():..................Start.");

	if ((JKSManageCertWizard.mNewCertAliasElem.value == "") ||
		(JKSManageCertWizard.mNewCertSubjectDNElem.value == "") ||
		(JKSManageCertWizard.mNewCertValidityDaysElem.value == "0") ||
		(JKSManageCertWizard.mNewCertValidityDaysElem.value == "")) {
            JKSManageCertWizard.mWizardElem.canAdvance = false;
	    return false;
	}

        JKSManageCertWizard.mWizardElem.canAdvance = true;

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.createCertPageValidate():..................End.");
	return true;
    },

    handleCreateCertAliasChange : function (aNewCertAliasElem, ev)
    {
	aNewCertAliasElem.value = JKSManageCertWizard.trim(aNewCertAliasElem.value);
    	JKSManageCertWizard.createCertPageValidate();
    },

    handleCreateCertDNChange : function (aNewCertSubjectDNElem, ev)
    {
	aNewCertSubjectDNElem.value = JKSManageCertWizard.trim(aNewCertSubjectDNElem.value);
    	JKSManageCertWizard.createCertPageValidate();
    },

    formatSubjectDN : function (aFormatSubjectButtonElem, ev)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.formatSubjectDN():..................Start.");

    	var dialogParams = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
				.createInstance(Components.interfaces.nsIDialogParamBlock);
    	dialogParams.SetInt(0, 0);
    	dialogParams.SetString(0, JKSManageCertWizard.mNewCertSubjectDNElem.value);
	var createSubjectDialogURL = 'chrome://keymanager/content/tools/genkeycsr/subjectDialog.xul';
	window.setCursor('wait');
    	window.openDialog(
			createSubjectDialogURL, // 'chrome://keymanager/content/tools/jksmanagecert/subjectDialog.xul',
    			'_blank',
			'chrome,centerscreen,resizable,modal,dialog=no,titlebar',
			dialogParams
			);
	window.setCursor('auto');
    	if (dialogParams.GetInt(0) == 0) { // Selected Cancel or failed.
    	    JKSManageCertWizard.createCertPageValidate();
    	    return;
    	}
	var subjectDN = dialogParams.GetString(0);

	JKSManageCertWizard.mNewCertSubjectDNElem.value = subjectDN;
	JKSManageCertWizard.handleCreateCertDNChange(JKSManageCertWizard.mNewCertSubjectDNElem);
	
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.formatSubjectDN():..................End.");
    },


    handleCreateCertKeySizeChange : function (aNewCertKeyTypeElem, ev)
    {
    	JKSManageCertWizard.createCertPageValidate();
    },

    handleCreateCertKeyTypeChange : function (aNewCertKeySizeElem, ev)
    {
    	JKSManageCertWizard.createCertPageValidate();
    },

    handleCreateCertSigAlgChange : function (aNewCertSigAlgElem, ev)
    {
    	JKSManageCertWizard.createCertPageValidate();
    },

    handleCreateCertValidityChange : function (aNewCertValidityDaysElem, ev)
    {
	aNewCertValidityDaysElem.value = JKSManageCertWizard.trim(aNewCertValidityDaysElem.value);
	if (ev) {
	    var validityInDays = parseInt(aNewCertValidityDaysElem.value);
	    if (validityInDays > 0) {
		var now = new Date();
	    	JKSManageCertWizard.mNewCertExpiresOnElem.dateValue = now;
	    	JKSManageCertWizard.mNewCertExpiresOnElem.addDays(validityInDays);
	    }
	}
    	JKSManageCertWizard.createCertPageValidate();
    },

    handleCreateCertExpiresOnChange : function (aNewCertExpiresOnElem, ev)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleCreateCertExpiresOnChange():..................Start.");

	var expireDate = aNewCertExpiresOnElem.dateValue; 
	var now = new Date();
	var timeDiffInMillisecs = (expireDate.getTime() - now.getTime());
	if (timeDiffInMillisecs < 0) {
	    aNewCertExpiresOnElem.dateValue = now;
	    JKSManageCertWizard.mNewCertValidityDaysElem.value = "0";
	    return;
	}

	var timeDiffInDays = (timeDiffInMillisecs / (1000 * (24 * 60 * 60)));
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.handleCreateCertExpiresOnChange(): timeDiffInDays: " + timeDiffInDays);
	// var timeDiffInDays = Math.round(timeDiffInDays);
	var timeDiffInDays = Math.ceil(timeDiffInDays);
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.handleCreateCertExpiresOnChange(): timeDiffInDays: " + timeDiffInDays);
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.handleCreateCertExpiresOnChange(): nssDate: " + aNewCertExpiresOnElem.getNSSDate());
	JKSManageCertWizard.mNewCertValidityDaysElem.value = timeDiffInDays;

    	JKSManageCertWizard.createCertPageValidate();

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleCreateCertExpiresOnChange():..................End.");
    },

    createCertPageAdvanced : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.createCertPageAdvanced():..................Start.");

	// var keytoolCmd = "keytool";
	var isWin = (navigator.userAgent.indexOf("Win") != -1);
	var keytoolCmd = JKSManageCertWizard.mKeyToolFilePath;
	if (!keytoolCmd) {
	    if (isWin) {
	    	keytoolCmd = "keytool.exe";
	    }
	    else {
	    	keytoolCmd = "keytool";
	    }
	}
	keytoolCmd += " ";
	keytoolCmd += "-keystore '"	+ JKSManageCertWizard.mKeyStoreFilePickerElem.filepath + "' ";
	keytoolCmd += "-storetype "	+ JKSManageCertWizard.mStoreTypeElem.value + " ";
	keytoolCmd += "-storepass '"	+ JKSManageCertWizard.mStorePassElem.value + "' ";
	keytoolCmd += "-keypass '"	+ JKSManageCertWizard.mStorePassElem.value + "' ";
	keytoolCmd += "-alias '"	+ JKSManageCertWizard.mNewCertAliasElem.value + "' ";
	keytoolCmd += "-dname '"	+ JKSManageCertWizard.mNewCertSubjectDNElem.value + "' ";
	keytoolCmd += "-keyalg "	+ JKSManageCertWizard.mNewCertKeyTypeElem.value + " ";
	keytoolCmd += "-keysize "	+ JKSManageCertWizard.mNewCertKeySizeElem.value + " ";
	keytoolCmd += "-sigalg "	+ JKSManageCertWizard.mNewCertSigAlgElem.value + "with" + JKSManageCertWizard.mNewCertKeyTypeElem.value + " ";
	keytoolCmd += "-validity "	+ JKSManageCertWizard.mNewCertValidityDaysElem.value + " ";
	// keytoolCmd += "-genkeypair"	+ " ";
	keytoolCmd += JKSManageCertWizard.mGenKeyOptionName	+ " ";
	JKSManageCertWizard.logDebug("keytoolCmd: " + keytoolCmd);

	var result = JKSManageCertWizard.executeJavaKeytoolCommand(keytoolCmd);
	JKSManageCertWizard.logDebug("JKSManageCertWizard.createCertPageAdvanced(): result: " + result);
	/*
	if (result != 0) {
	    return false;
	}
	*/

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.createCertPageAdvanced():..................End.");
	return true;
    },

    getCertAliasList : function (aKeyCertOnly)
    {
	var certAliasList = [];
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.getCertAliasList():..................Start.");

	JKSManageCertWizard.mAliasListTmpFilePickerElem.autoSelectTempFile("KeyManager/Keytool/Result", "keytool_list_result.txt");
	var aliasListTmpFilePath = JKSManageCertWizard.mAliasListTmpFilePickerElem.filepath;

	// var keytoolCmd = "keytool";
	var keytoolCmd = JKSManageCertWizard.mKeyToolFilePath;
	var isWin = (navigator.userAgent.indexOf("Win") != -1);
	if (!keytoolCmd) {
	    if (isWin) {
	    	keytoolCmd = "keytool.exe";
	    }
	    else {
	    	keytoolCmd = "keytool";
	    }
	}
	keytoolCmd += " ";
	keytoolCmd += "-keystore '"	+ JKSManageCertWizard.mKeyStoreFilePickerElem.filepath + "' ";
	keytoolCmd += "-storetype '"	+ JKSManageCertWizard.mStoreTypeElem.value + "' ";
	keytoolCmd += "-storepass '"	+ JKSManageCertWizard.mStorePassElem.value + "' ";
	keytoolCmd += "-list" + " ";
	// keytoolCmd += " | grep Entry | awk -F, '{print $1}' " + " ";
	// keytoolCmd += " | grep PrivateKeyEntry | awk -F, '{print $1}' " + " ";
	// keytoolCmd += " | grep PrivateKeyEntry " + " ";
	keytoolCmd += "> " + aliasListTmpFilePath;
	JKSManageCertWizard.logDebug("keytoolCmd: " + keytoolCmd);

	/*
	var keytoolArgs = [];
	keytoolArgs[keytoolArgs.length] = "-keystore"; keytoolArgs[keytoolArgs.length] = JKSManageCertWizard.mKeyStoreFilePickerElem.filepath;
	keytoolArgs[keytoolArgs.length] = "-storetype"; keytoolArgs[keytoolArgs.length] = JKSManageCertWizard.mStoreTypeElem.value;
	keytoolArgs[keytoolArgs.length] = "-storepass"; keytoolArgs[keytoolArgs.length] = JKSManageCertWizard.mStorePassElem.value;
	keytoolArgs[keytoolArgs.length] = "-list";
	JKSManageCertWizard.logDebug("JKSManageCertWizard.getCertAliasList(): keytoolArgs.length: " + keytoolArgs.length);
	*/

	var result = JKSManageCertWizard.executeJavaKeytoolCommand(keytoolCmd);
	JKSManageCertWizard.logDebug("JKSManageCertWizard.getCertAliasList(): result: " + result);
	/*
	if (result != 0) {
	    return;
	}
	*/

	JKSManageCertWizard.mAliasListTmpFilePickerElem.refresh();
	if (!JKSManageCertWizard.mAliasListTmpFilePickerElem.file.exists()) {
	    return certAliasList;
	}

	var aliasListStr = JKSManageCertWizard.mAliasListTmpFilePickerElem.readData();

	var ksCertDataLineArray = aliasListStr.split("\n");
	JKSManageCertWizard.logDebug("ksCertDataLineArray.length: " + ksCertDataLineArray.length);

	var certAliasLineArray = [];
	for (var i = 0; i < ksCertDataLineArray.length; i++) {
	    var aliasLine = ksCertDataLineArray[i];
	    if (aliasLine.indexOf("PrivateKeyEntry") <= -1) {
	        if (aliasLine.indexOf("keyEntry") <= -1) {
	    	    if (!aKeyCertOnly) {
	        	if (aliasLine.indexOf("trustedCertEntry") <= -1) {
		    	    continue;
			}
		    }
		    else {
		    	continue;
		    }
	        }
	    }
	    certAliasLineArray[certAliasLineArray.length] = aliasLine;
	}
	JKSManageCertWizard.logDebug("certAliasLineArray.length: " + certAliasLineArray.length);

	for (var i = 0; i < certAliasLineArray.length; i++) {
	    var aliasLine = certAliasLineArray[i];
	    var aliasLineItems = aliasLine.split(",");
	    var alias = aliasLineItems[0];
	    if (alias == "") {
	    	continue;
	    }
	    JKSManageCertWizard.logDebug("certAliasLineArray[" + i + "]: " +  alias);
	    certAliasList[certAliasList.length] = alias;
	}

	if (JKSManageCertWizard.mAliasListTmpFilePickerElem.file) {
	    JKSManageCertWizard.mAliasListTmpFilePickerElem.file.remove(false);
	}

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.getCertAliasList():..................End.");
	return certAliasList;
    },

    createCSRPageInit : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.createCSRPageInit():..................Start.");

	JKSManageCertWizard.mAliasMenuListElem.removeAllItems();
	JKSManageCertWizard.mAliasMenuListElem.value = "";
	JKSManageCertWizard.mAliasMenuListElem.selectedIndex = -1;
	var keyCertAliasList = JKSManageCertWizard.getCertAliasList(true);
	for (var i = 0; i < keyCertAliasList.length; i++) {
	    var alias = keyCertAliasList[i];
	    var menuItemNode = JKSManageCertWizard.mAliasMenuListElem.appendItem(alias, alias);
	}

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.createCSRPageInit():..................End.");
	return true;
    },



    createCSRPageShow : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.createCSRPageShow():..................Start.");

	var aliasListSuccess = JKSManageCertWizard.createCSRPageInit();
	if (!aliasListSuccess) {
	    JKSManageCertWizard.mWizardElem.canAdvance = false;
    	    JKSManageCertWizard.logTrace("JKSManageCertWizard.createCSRPageShow():..................End(0).");
	    return;
	}

	if (JKSManageCertWizard.mKSTaskTypeElem.selectedItem.value == "newcert") {
	    JKSManageCertWizard.mAliasMenuListElem.value = JKSManageCertWizard.mNewCertAliasElem.value;
	}
	else {
	    if (JKSManageCertWizard.mAliasMenuListElem.selectedIndex < 0) {
	    	JKSManageCertWizard.mAliasMenuListElem.selectedIndex = 0;
	    }
	}


	JKSManageCertWizard.handleAliasListChange(JKSManageCertWizard.mAliasMenuListElem);

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.createCSRPageShow():..................End.");
    },

    getAliasCertInfo : function (aCertAlias)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.getAliasCertInfo():..................Start.");
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.getAliasCertInfo(): aCertAlias: " + aCertAlias);

	JKSManageCertWizard.mAliasListTmpFilePickerElem.autoSelectTempFile("KeyManager/Keytool/Result", "keytool_" + aCertAlias + "_list_result.txt");
	var aliasListTmpFilePath = JKSManageCertWizard.mAliasListTmpFilePickerElem.filepath;

	// var keytoolCmd = "keytool";
	var keytoolCmd = JKSManageCertWizard.mKeyToolFilePath;
	var isWin = (navigator.userAgent.indexOf("Win") != -1);
	if (!keytoolCmd) {
	    if (isWin) {
	    	keytoolCmd = "keytool.exe";
	    }
	    else {
	    	keytoolCmd = "keytool";
	    }
	}
	keytoolCmd += " ";
	keytoolCmd += "-keystore '"	+ JKSManageCertWizard.mKeyStoreFilePickerElem.filepath + "' ";
	keytoolCmd += "-storetype '"	+ JKSManageCertWizard.mStoreTypeElem.value + "' ";
	keytoolCmd += "-storepass '"	+ JKSManageCertWizard.mStorePassElem.value + "' ";
	keytoolCmd += "-alias '" + aCertAlias + "' ";
	keytoolCmd += "-list " + " ";
	keytoolCmd += "-v " + " ";
	keytoolCmd += "> " + aliasListTmpFilePath;
	JKSManageCertWizard.logDebug("keytoolCmd: " + keytoolCmd);

	var result = JKSManageCertWizard.executeJavaKeytoolCommand(keytoolCmd);
	JKSManageCertWizard.logDebug("JKSManageCertWizard.createCSRPageInit(): result: " + result);

	JKSManageCertWizard.mAliasListTmpFilePickerElem.refresh();
	if (!JKSManageCertWizard.mAliasListTmpFilePickerElem.file.exists()) {
    	    JKSManageCertWizard.logTrace("JKSManageCertWizard.getAliasCertInfo():..................End(1).");
	    return "";
	}

	var aliasListStr = JKSManageCertWizard.mAliasListTmpFilePickerElem.readData();

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.getAliasCertInfo():..................End.");
	return aliasListStr;
    },

    handleAliasListChange : function (aAliasMenuListElem, ev)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleAliasListChange():..................End.");

	if (aAliasMenuListElem.selectedIndex < 0) {
	    JKSManageCertWizard.mCertReqFilePickerElem.filepath = "";
	    JKSManageCertWizard.mWizardElem.canAdvance = false;
	    return;
	}
	JKSManageCertWizard.mWizardElem.canAdvance = true;


	JKSManageCertWizard.mAliasCertInfoElem.value = "";
	var aliasCertInfo = JKSManageCertWizard.getAliasCertInfo(aAliasMenuListElem.value);
	JKSManageCertWizard.mAliasCertInfoElem.value = aliasCertInfo;

	var csrFileName = aAliasMenuListElem.value + "_pkcs10_b64.csr";
	JKSManageCertWizard.mCertReqFilePickerElem.autoSelectTempFile("KeyManager/Keytool/CSR", csrFileName);

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleAliasListChange():..................End.");
    },

    createCSRPageAdvanced : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.createCSRPageAdvanced():..................Start.");

	// var keytoolCmd = "keytool";
	var keytoolCmd = JKSManageCertWizard.mKeyToolFilePath;
	var isWin = (navigator.userAgent.indexOf("Win") != -1);
	if (!keytoolCmd) {
	    if (isWin) {
	    	keytoolCmd = "keytool.exe";
	    }
	    else {
	    	keytoolCmd = "keytool";
	    }
	}
	keytoolCmd += " ";
	keytoolCmd += "-keystore '"	+ JKSManageCertWizard.mKeyStoreFilePickerElem.filepath + "' ";
	keytoolCmd += "-storetype '"	+ JKSManageCertWizard.mStoreTypeElem.value + "' ";
	keytoolCmd += "-storepass '"	+ JKSManageCertWizard.mStorePassElem.value + "' ";
	keytoolCmd += "-alias '" + JKSManageCertWizard.mAliasMenuListElem.value + "' ";
	keytoolCmd += "-file '" + JKSManageCertWizard.mCertReqFilePickerElem.filepath + "' ";
	keytoolCmd += "-certreq" + " ";
	JKSManageCertWizard.logDebug("keytoolCmd: " + keytoolCmd);

	var result = JKSManageCertWizard.executeJavaKeytoolCommand(keytoolCmd);
	JKSManageCertWizard.logDebug("JKSManageCertWizard.createCSRPageAdvanced(): result: " + result);
	/*
	if (result != 0) {
	    return false;
	}
	*/

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.createCSRPageAdvanced():..................End.");
	return true;
    },

    removeNonCACerts : function (aCACertPickerElem) 
    {
	// We have to  manually temove non-CA user cert becuase 
	// NSS considers all self-signed cert as Root cert which in turn is considered as CA cert.
	JKSManageCertWizard.logTrace("JKSManageCertWizard.removeNonCACerts():................Start.");

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
	     JKSManageCertWizard.logDebug("JKSManageCertWizard.removeNonCACerts(): i: " + i + " nickName: " + menuItemX509Cert.nickname);

	    var userCACert = false;
	    do {
	    	var isProxyCert = JKSManageCertWizard.mKeyManager.isProxyCert(menuItemX509Cert);
		if (isProxyCert) {
		    break;
		}

	        var menuItemX509Cert3 = menuItemX509Cert.QueryInterface(Components.interfaces.nsIX509Cert3);
	        if (menuItemX509Cert3.isSelfSigned) {
	     	    userCACert = true;
	            JKSManageCertWizard.logDebug("initCASignerCertProps(): removeNonCACerts: nickName: " + menuItemX509Cert.nickname + "(SelfSignedCert)");
		    break;
	        }

	    	var /* nsIPersistentProperties */ certProps;
	        certProps = Components.classes["@mozilla.org/persistent-properties;1"]
				.createInstance(Components.interfaces.nsIPersistentProperties);
	        JKSManageCertWizard.mKeyManager.exportX509v3CertExtnToProperties(menuItemX509Cert, "basicConstraints", certProps);
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
	         JKSManageCertWizard.logDebug("initCASignerCertProps(): removeNonCACerts: nickName: " + menuItemX509Cert.nickname + " basicConstraintCA: " + basicConstraintCA + "");
	         if (basicConstraintCA) {
	     	    userCACert = true;
		    break;
	         }
	    } while (0);
	    if (userCACert) {
	     	foundCACert = true;
		continue;
	    }
	    if (certListMenuElem.selectedIndex == i) {
	     	certListMenuElem.selectedIndex = -1;
	    }
	    certListMenuElem.removeItemAt(i);
    	}

	if (!foundCACert) {
	    certListMenuElem.selectedIndex = -1;
	}

	JKSManageCertWizard.logTrace("JKSManageCertWizard.removeNonCACerts():................End.");
    },

    signCertPageShow : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.signCertPageShow():..................Start.");

	JKSManageCertWizard.mSignCertCSRFileItemElem.file = JKSManageCertWizard.mCertReqFilePickerElem.file;
	JKSManageCertWizard.mSignCertCSRFileItemElem.ascii = JKSManageCertWizard.mCertReqFilePickerElem.ascii;

	if (!JKSManageCertWizard.mSignCertSignedCertFilePickerElem.file) {
	    var certFileName = JKSManageCertWizard.mAliasMenuListElem.value + "_x509_b64.cer";
	    JKSManageCertWizard.mSignCertSignedCertFilePickerElem.autoSelectTempFile("KeyManager/Keytool/Cert", certFileName);
	    JKSManageCertWizard.mSignCertSignedCertFilePickerElem.ascii = true;
	}

	// JKSManageCertWizard.handleSignerCertPickerChange(JKSManageCertWizard.mSignCertSignerCertPickerElem);
	JKSManageCertWizard.removeNonCACerts(JKSManageCertWizard.mSignCertSignerCertPickerElem);

	JKSManageCertWizard.handleSignCertFilePickerChange(JKSManageCertWizard.mSignCertSignedCertFilePickerElem);

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.signCertPageShow():..................End.");
    },

    signCertPageValidate : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.signCertPageValidate():..................Start.");

	if (!JKSManageCertWizard.mSignCertCSRFileItemElem.file) {
            JKSManageCertWizard.mWizardElem.canAdvance = false;
    	    JKSManageCertWizard.logTrace("JKSManageCertWizard.signCertPageValidate():..................End(0).");
	    return;
	}
	if (!JKSManageCertWizard.mSignCertCSRFileItemElem.file.exists()) {
            JKSManageCertWizard.mWizardElem.canAdvance = false;
    	    JKSManageCertWizard.logTrace("JKSManageCertWizard.signCertPageValidate():..................End(1).");
	    return;
	}
	if (!JKSManageCertWizard.mSignCertSignerCertPickerElem.selectedCert) {
            JKSManageCertWizard.mWizardElem.canAdvance = false;
    	    JKSManageCertWizard.logTrace("JKSManageCertWizard.signCertPageValidate():..................End(2).");
	    return;
	}

	if (!JKSManageCertWizard.mSignCertSignedCertFilePickerElem.file) {
            JKSManageCertWizard.mWizardElem.canAdvance = false;
    	    JKSManageCertWizard.logTrace("JKSManageCertWizard.signCertPageValidate():..................End(3).");
	    return;
	}

        JKSManageCertWizard.mWizardElem.canAdvance = true;

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.signCertPageValidate():..................End.");
	return true;
    },

    handleSignerCertPickerChange : function (aSignerCertPickerElem, ev)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleSignerCertPickerChange():..................Start.");

	JKSManageCertWizard.signCertPageValidate();

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleSignerCertPickerChange():..................End.");
    },

    handleSignCertFilePickerChange : function (aSignerCertPickerElem, ev)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleSignCertFilePickerChange():..................Start.");

	JKSManageCertWizard.signCertPageValidate();

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleSignCertFilePickerChange():..................End.");
    },

    signCertPageAdvanced : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.signCertPageAdvanced():..................Start.");

    	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    				.createInstance(Components.interfaces.nsIPKIParamBlock);
    	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

	var windowName = "signCert";
	dialogParams.SetString(0, windowName);
	dialogParams.SetString(1, JKSManageCertWizard.mSignCertCSRFileItemElem.filepath);
	dialogParams.SetString(2, ("" + JKSManageCertWizard.mSignCertCSRFileItemElem.ascii));
	dialogParams.SetString(3, JKSManageCertWizard.mSignCertSignedCertFilePickerElem.filepath);
	dialogParams.SetString(4, ("" + JKSManageCertWizard.mSignCertSignedCertFilePickerElem.ascii));
	dialogParams.SetString(5, ("" + false));
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.signCertPageAdvanced():..................10.");

	var selectedSignerCert = null;
	pkiParams.setISupportAtIndex(1, selectedSignerCert);
	selectedSignerCert = JKSManageCertWizard.mSignCertSignerCertPickerElem.selectedCert;
	if (selectedSignerCert) {
    	    pkiParams.setISupportAtIndex(1, selectedSignerCert);
    	    // JKSManageCertWizard.loginToCertToken(selectedSignerCert, false);
	}
	/*
	else {
	}
	*/
	JKSManageCertWizard.loginToInternalToken();
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.signCertPageAdvanced():..................20.");

	var signCertByCADialogURL = 'chrome://keymanager/content/tools/signcerttool/signCertByCAToolDialog.xul';
	window.setCursor('wait');
    	window.openDialog(
			signCertByCADialogURL,
			"",
			'chrome,centerscreen,resizable,modal,dialog=no,titlebar',
			dialogParams
			);
	window.setCursor('auto');

	if (dialogParams.GetInt(0) == 0) {
	    alert("Certificate Signing operation failed or cacelled.\n");
	    return false;
	}
	if (JKSManageCertWizard.mSignCertCSRFileItemElem.file) {
	    JKSManageCertWizard.mSignCertCSRFileItemElem.file.remove(false);
	}


	var signedCert = pkiParams.getISupportAtIndex(1);
	if (!signedCert) {
	    return false;
	}
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.importCertParamPageAdvanced(): signedCert.dbKey: " + signedCert.dbKey);

	JKSManageCertWizard.mImportCertSourceDeckElem.selectedPanel = JKSManageCertWizard.mImportCertPickerElem;
	JKSManageCertWizard.mImportCertSourceTypeElem.disabled = true;

	JKSManageCertWizard.mImportCertPickerElem.refresh(); // reload the certpicker with signed ceret
	JKSManageCertWizard.mImportCertPickerElem.selectedCert = signedCert;
	JKSManageCertWizard.mImportCertPickerElem.disabled = true;

	JKSManageCertWizard.mWizardElem.certAlias	= JKSManageCertWizard.mAliasMenuListElem.value;
	JKSManageCertWizard.mWizardElem.selectedCert	= signedCert;
	JKSManageCertWizard.mWizardElem.certFile	= JKSManageCertWizard.mSignCertSignedCertFilePickerElem.file;
	JKSManageCertWizard.mWizardElem.certFileIsAscii = JKSManageCertWizard.mSignCertSignedCertFilePickerElem.ascii;

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.signCertPageAdvanced():..................End.");
	return true;
    },

    importCertParamPageShow : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertParamPageShow():..................Start.");

	if (JKSManageCertWizard.mKSTaskTypeElem.selectedItem.value == "importcert") {
	    JKSManageCertWizard.mImportCertSourceTypeElem.disabled = false;
	    JKSManageCertWizard.mWizardElem.certAlias = null;
	    JKSManageCertWizard.mWizardElem.selectedCert = null;
	    JKSManageCertWizard.mWizardElem.certFile = null;
	}
	JKSManageCertWizard.handleImportCertSourceTypeChange(JKSManageCertWizard.mImportCertSourceTypeElem);

	var selectedCert = JKSManageCertWizard.mImportCertPickerElem.selectedCert;
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.importCertParamPageShow(): selectedCert: " + selectedCert.dbKey);

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertParamPageShow():..................End.");
    },

    handleImportCertSourceTypeChange : function (aCertSourceTypeElem, ev)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleImportCertSourceTypeChange():..................Start.");

	if (aCertSourceTypeElem.selectedItem.value == "certpicker") {
	    JKSManageCertWizard.mImportCertSourceDeckElem.selectedPanel = JKSManageCertWizard.mImportCertPickerElem;
	    JKSManageCertWizard.handleImportCertPickerChange(JKSManageCertWizard.mImportCertPickerElem);
	}
	else {
	    JKSManageCertWizard.mImportCertSourceDeckElem.selectedPanel = JKSManageCertWizard.mImportFilePickerElem;
	    JKSManageCertWizard.mImportCertIncludeChainElem.checked = false;
	    JKSManageCertWizard.mImportCertIncludeChainElem.disabled = false;
	    JKSManageCertWizard.handleImportCertFilePickerChange(JKSManageCertWizard.mImportFilePickerElem);
	}

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleImportCertSourceTypeChange():..................End.");
    },

    handleImportCertPickerChange : function (aImportCertPickerElem, ev)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleImportCertPickerChange():..................Start.");

	var selectedCert = JKSManageCertWizard.mImportCertPickerElem.selectedCert;
	if (!selectedCert ||
		(selectedCert.QueryInterface(Components.interfaces.nsIX509Cert3).isSelfSigned)) { 
	    JKSManageCertWizard.mImportCertIncludeChainElem.checked = false;
	    JKSManageCertWizard.mImportCertIncludeChainElem.disabled = true;
	}
	else {
	    JKSManageCertWizard.mImportCertIncludeChainElem.disabled = false;
	}

	JKSManageCertWizard.importCertParamPageValidate();

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleImportCertPickerChange():..................End.");
    },

    handleImportCertFilePickerChange : function (aImportFilePickerElem, ev)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleImportCertFilePickerChange():..................Start.");

	JKSManageCertWizard.importCertParamPageValidate();

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleImportCertFilePickerChange():..................End.");
    },

    importCertParamPageValidate : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertPageValidate():..................Start.");

	if (JKSManageCertWizard.mImportCertSourceTypeElem.selectedItem.value == "certpicker")  {
	    if (!JKSManageCertWizard.mImportCertPickerElem.selectedCert) {
            	JKSManageCertWizard.mWizardElem.canAdvance = false;
		return;
	    }
	}
	else {
	    if (!JKSManageCertWizard.mImportFilePickerElem.file) {
            	JKSManageCertWizard.mWizardElem.canAdvance = false;
		return;
	    }
	}

        JKSManageCertWizard.mWizardElem.canAdvance = true;

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertPageValidate():..................End.");
	return true;
    },


    importCertParamPageAdvanced : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertParamPageAdvanced():..................Start.");

	if (JKSManageCertWizard.mImportCertSourceTypeElem.selectedItem.value == "certpicker")  {
	    JKSManageCertWizard.mWizardElem.selectedCert = JKSManageCertWizard.mImportCertPickerElem.selectedCert;
	    if (!JKSManageCertWizard.mWizardElem.certAlias) {
	    	JKSManageCertWizard.mWizardElem.certAlias = JKSManageCertWizard.mImportCertPickerElem.adaptNickName().toLowerCase();
	    }
	    JKSManageCertWizard.mWizardElem.certFile = null;
	}
	else {
	    JKSManageCertWizard.mWizardElem.certAlias	= null;
	    JKSManageCertWizard.mWizardElem.selectedCert = null;
	    JKSManageCertWizard.mWizardElem.certFile	= JKSManageCertWizard.mImportFilePickerElem.file;
	    JKSManageCertWizard.mWizardElem.certFileIsAscii = JKSManageCertWizard.mImportFilePickerElem.ascii;
	}

    	JKSManageCertWizard.logDebug("JKSManageCertWizard.importCertParamPageAdvanced(): JKSManageCertWizard.mWizardElem.certFile: " + JKSManageCertWizard.mWizardElem.certFile);
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.importCertParamPageAdvanced(): JKSManageCertWizard.mWizardElem.selectedCert: " + JKSManageCertWizard.mWizardElem.selectedCert);
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertParamPageAdvanced():..................End.");
	return true;
    },

    importCertPageShow : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertPageShow():..................Start.");

    	JKSManageCertWizard.logDebug("JKSManageCertWizard.importCertParamPageAdvanced(): JKSManageCertWizard.mWizardElem.certFile: " + JKSManageCertWizard.mWizardElem.certFile);
    	JKSManageCertWizard.logDebug("JKSManageCertWizard.importCertParamPageAdvanced(): JKSManageCertWizard.mWizardElem.selectedCert: " + JKSManageCertWizard.mWizardElem.selectedCert);
	if (!JKSManageCertWizard.mWizardElem.certFile && !JKSManageCertWizard.mWizardElem.selectedCert) {
            JKSManageCertWizard.mWizardElem.canAdvance = false;
    	     JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertPageShow():..................End(0).");
	    return;
	}
	if (!JKSManageCertWizard.mWizardElem.selectedCert) {
	    var tmpX509Cert = null;
	    try {
	    	tmpX509Cert = JKSManageCertWizard.mKeyManager.createX509CertFromFile(
	    				JKSManageCertWizard.mWizardElem.certFile,
					JKSManageCertWizard.mWizardElem.certFileIsAscii
					);
	    } catch (ex) { }
	    if (!tmpX509Cert) {
		alert("Couldn't load cert from file : " + JKSManageCertWizard.mWizardElem.certFile.path + " (" + (JKSManageCertWizard.mWizardElem.certFileIsAscii? "Base64" : "DER") + ")");
            	JKSManageCertWizard.mWizardElem.canAdvance = false;
	    	return;
	    }
	    JKSManageCertWizard.mWizardElem.selectedCert = tmpX509Cert;
	    var certAlias = JKSManageCertWizard.mImportCertPickerElem.adaptNickName(tmpX509Cert).toLowerCase();
	    JKSManageCertWizard.mWizardElem.certAlias = certAlias;
	}

	JKSManageCertWizard.mImportCertGridElem.reset();
	JKSManageCertWizard.mImportCertGridElem.initBaseCert(
			JKSManageCertWizard.mWizardElem.selectedCert,
			JKSManageCertWizard.mWizardElem.certAlias,
			JKSManageCertWizard.mImportCertIncludeChainElem.checked
			);

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertPageShow():..................End.");
    },

    importCertPageValidate : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertPageValidate():..................Start.");

        JKSManageCertWizard.mWizardElem.canAdvance = true;

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertPageValidate():..................End.");
	return true;
    },

    importCertToJKS : function (aX509Cert, aCertAlias)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertToJKS():..................Start.");
	JKSManageCertWizard.logDebug("JKSManageCertWizard.importCertToJKS(): aCertAlias: " + aCertAlias);
	if (!aX509Cert) {
	    return false;
	}
	var certAlias = aCertAlias;
	if (!certAlias || (certAlias == "")) {
	    certAlias = JKSManageCertWizard.mImportCertPickerElem.adaptNickName(aX509Cert).toLowerCase();
	}

	var certFileName = aCertAlias + "_x509_base64.cer";
	JKSManageCertWizard.mImportCertOutFilePickerElem.autoSelectTempFile("KeyManager/Keytool/Cert", certFileName);

	var alrX509Cert = JKSManageCertWizard.mKeyManager.getALRX509Cert(aX509Cert);
	alrX509Cert.exportToFile(JKSManageCertWizard.mImportCertOutFilePickerElem.file, true, true);
	
	var certFilePath = JKSManageCertWizard.mImportCertOutFilePickerElem.filepath;
	JKSManageCertWizard.logDebug("JKSManageCertWizard.importCertToJKS(): certFilePath: " + certFilePath);
	var importResultFilePath = JKSManageCertWizard.mImportResultOutFilePickerElem.filepath;


	// var keytoolCmd = "keytool";
	var keytoolCmd = JKSManageCertWizard.mKeyToolFilePath;
	var isWin = (navigator.userAgent.indexOf("Win") != -1);
	if (!keytoolCmd) {
	    if (isWin) {
	    	keytoolCmd = "keytool.exe";
	    }
	    else {
	    	keytoolCmd = "keytool";
	    }
	}
	keytoolCmd += " ";
	keytoolCmd += "-keystore '"	+ JKSManageCertWizard.mKeyStoreFilePickerElem.filepath + "' ";
	keytoolCmd += "-storetype '"	+ JKSManageCertWizard.mStoreTypeElem.value + "' ";
	keytoolCmd += "-storepass '"	+ JKSManageCertWizard.mStorePassElem.value + "' ";
	keytoolCmd += "-noprompt" + " ";
	if (alrX509Cert.isCACert()) {
	    keytoolCmd += "-trustcacerts" + " ";
	}
	keytoolCmd += "-alias '" + aCertAlias + "' ";
	keytoolCmd += "-file '" + certFilePath + "' ";
	keytoolCmd += "-import" + " ";
	keytoolCmd += "> " + importResultFilePath;
	JKSManageCertWizard.logDebug("keytoolCmd: " + keytoolCmd);

	var result = JKSManageCertWizard.executeJavaKeytoolCommand(keytoolCmd);
	JKSManageCertWizard.logDebug("JKSManageCertWizard.importCertToJKS(): result: " + result);

	if (JKSManageCertWizard.mImportCertOutFilePickerElem.file) {
	    JKSManageCertWizard.mImportCertOutFilePickerElem.file.remove(false);
	}

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertToJKS():..................End.");
	return true;
    },

    importCertPageAdvanced : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertPageAdvanced():..................Start.");

	/*
	if (!JKSManageCertWizard.mSignedCertFileItemElem.file) {
	    return false;
	}
	*/

	var jksCertItemList = JKSManageCertWizard.mImportCertGridElem.getJKSCertItemList();
	if (jksCertItemList.length <= 0) {
	    alert("No Cert is selected for importing.");
	    return false;
	}

	var firstCertItem = jksCertItemList.item(0);
	var firstCertAlias = firstCertItem.certalias.toLowerCase();
	dump("firstCertAlias: " + firstCertAlias + "\n");
	if (!JKSManageCertWizard.mWizardElem.certAlias) {
	    JKSManageCertWizard.mWizardElem.certAlias = firstCertAlias;
	}

	var importResultFileName = firstCertAlias + "_cert_import_result.txt";
	JKSManageCertWizard.mImportResultOutFilePickerElem.autoSelectTempFile("KeyManager/Keytool/Result", importResultFileName);

	var importCertResultData = "";
	for (var i = (jksCertItemList.length -1); (i >= 0); i--) {
	    var jksCertItem = jksCertItemList.item(i);
	    var jksX509Cert = jksCertItem.cert;
	    var jksCertAlias = jksCertItem.certalias.toLowerCase();
	    JKSManageCertWizard.importCertToJKS(jksX509Cert, jksCertAlias);

	    JKSManageCertWizard.mImportResultOutFilePickerElem.refresh();
	    if (JKSManageCertWizard.mImportResultOutFilePickerElem.file.exists()) {
	        var tmpImportCertResultData = JKSManageCertWizard.mImportResultOutFilePickerElem.readData();
		importCertResultData += tmpImportCertResultData;
	    }
	}
	JKSManageCertWizard.mWizardElem.importCertResultData = importCertResultData;
	JKSManageCertWizard.mImportResultOutFilePickerElem.refresh();
	JKSManageCertWizard.logDebug("JKSManageCertWizard.importCertToJKS(): importResultFilePath: " + JKSManageCertWizard.mImportResultOutFilePickerElem.filepath);

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.importCertPageAdvanced():..................End.");
	return true;
    },

    finalPageShow : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.finalPageShow():..................Start.");

	/*
	var importCertResultData = "";
	JKSManageCertWizard.mImportResultOutFilePickerElem.refresh();
	if (JKSManageCertWizard.mImportResultOutFilePickerElem.file.exists()) {
	    importCertResultData = JKSManageCertWizard.mImportResultOutFilePickerElem.readData();
	}
	JKSManageCertWizard.mImportResultDataElem.value = importCertResultData;
	*/

	JKSManageCertWizard.mImportResultDataElem.value = JKSManageCertWizard.mWizardElem.importCertResultData;

	JKSManageCertWizard.mImportCertAliaListElem.removeAllItems();
	JKSManageCertWizard.mImportCertAliaListElem.value = "";
	JKSManageCertWizard.mImportCertAliaListElem.selectedIndex = -1;
	var certAliasList = JKSManageCertWizard.getCertAliasList(false);
	for (var i = 0; i < certAliasList.length; i++) {
	    var alias = certAliasList[i];
	    var menuItemNode = JKSManageCertWizard.mImportCertAliaListElem.appendItem(alias, alias);
	}
	if (JKSManageCertWizard.mImportCertAliaListElem.selectedIndex < 0) {
	    JKSManageCertWizard.mImportCertAliaListElem.selectedIndex = 0;
	}

	dump("JKSManageCertWizard.mWizardElem.certAlias: " + JKSManageCertWizard.mWizardElem.certAlias + "\n");
	if (JKSManageCertWizard.mWizardElem.certAlias != "") {
	    JKSManageCertWizard.mImportCertAliaListElem.value = JKSManageCertWizard.mWizardElem.certAlias;
	}
	JKSManageCertWizard.handleKSCertAliasChange(JKSManageCertWizard.mImportCertAliaListElem);

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.finalPageShow():..................End.");
    },

    handleKSCertAliasChange : function (aAliasMenuListElem, ev)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleKSCertAliasChange():..................End.");

	JKSManageCertWizard.mImportCertAliasInfoElem.value = "";
	if (aAliasMenuListElem.selectedIndex < 0) {
	    return;
	}
	var aliasCertInfo = JKSManageCertWizard.getAliasCertInfo(aAliasMenuListElem.value);
	JKSManageCertWizard.mImportCertAliasInfoElem.value = aliasCertInfo;

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.handleKSCertAliasChange():..................End.");
    },


    finalPageAdvanced : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.finalPageAdvanced():..................Start.");
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.finalPageAdvanced():..................End.");
	return true;
    },

    errorPageShow : function (aWizardPageElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.errorPageShow():..................Start.");
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.errorPageShow():..................End.");
    },

    finishWizard : function (aWizardElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.finishWizard():..................Start.");

    	if (!window.arguments || !window.arguments[0]) {
            return;
    	}
    	var pkiParams = null;
    	var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    	} catch (ex) { }
    	dialogParams.SetInt(0, 1);

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.finishWizard():..................End.");
	return true;
    },

    cancelWizard : function (aWizardElem)
    {
    	JKSManageCertWizard.logTrace("JKSManageCertWizard.cancelWizard():..................Start.");

    	if (!window.arguments || !window.arguments[0]) {
            return;
    	}

    	var pkiParams = null;
    	var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    	} catch (ex) { }

    	dialogParams.SetInt(0, 0);

    	JKSManageCertWizard.logTrace("JKSManageCertWizard.cancelWizard():..................End.");
    },

    lastMethod : function () 
    {
    }
}

