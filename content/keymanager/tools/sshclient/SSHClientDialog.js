/* @(#) $Id: SSHClientDialog.js,v 1.12 2012/10/07 17:21:11 subrata Exp $ */

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



var SSHClientDialog = {


    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,
    /* alrISoftTokenDBManager */ mSoftTokenDBManager : null,

    mDialogParams			: null,
    mProfileDir				: null,
    mShellCmdPath			: null,

    mTerminalCmdFileSelectorElem	: null,
    mTerminalCmdArgsElem		: null,
    mSSHCommandFileSelectorElem		: null,
    mSSHCommandArgsElem			: null,
    mUseTokenFlagElem			: null,
    mPK11TokenMenuElem			: null,
    mKeyCertPickerElem			: null,
    mRemoteHostNameElem			: null,
    mRemotePortIdElem			: null,
    mRemoteUserIdElem			: null,
    mTerminalExecCmdElem		: null,

    mSSHConnectButtonElem		: null,

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
        this.logTrace("SSHClientDialog.loginToInternalToken():................Start.");

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
	    	this.logDebug("SSHClientDialog.loginToInternalToken():  unable to obtain preferences - ex: " + ex);
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
            this.logTrace("SSHClientDialog.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("SSHClientDialog.loginToInternalToken():................End.");
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
        this.logTrace("SSHClientDialog.initXPComServiceInfo():................Start.");

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

  	    this.mProfileDir = this.mDirService.get("ProfD", Components.interfaces.nsIFile);

        } catch (ex) {
    	    alert("SSHClientDialog.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("SSHClientDialog.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	this.loginToInternalToken();

	this.logTrace("SSHClientDialog.initXPComServiceInfo():................End.");
    },


    initOnLoad : function () 
    {
    	this.logTrace("SSHClientDialog.initOnLoad():................Start.");

        if ((window.arguments) && (window.arguments.length > 0)) {
            var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    this.mDialogParams = dialogParams;
	}

	this.initXPComServiceInfo();

	this.initWithDefaultValues();
	this.initWithDialogParams();
	
	this.handleUseTokenFlagChange(this.mUseTokenFlagElem);
	this.updateTerminalExecCmd();

    	this.logTrace("SSHClientDialog.initOnLoad():................End.");
    },

    initWithDefaultValues : function () 
    {
    	this.logTrace("SSHClientDialog.initWithDefaultValues():................Start.");

	this.mShellCmdPath = "/bin/bash";

    	this.mTerminalCmdFileSelectorElem	= document.getElementById('keymgr.sshclient.terminal.filepath');
    	this.mTerminalCmdArgsElem		= document.getElementById('keymgr.sshclient.termargs');

    	this.mSSHCommandFileSelectorElem	= document.getElementById('keymgr.sshclient.sshcommand.filepath');
    	this.mSSHCommandArgsElem		= document.getElementById('keymgr.sshclient.sshargs');

    	this.mUseTokenFlagElem			= document.getElementById('keymgr.sshclient.usetoken');
    	this.mPK11TokenMenuElem			= document.getElementById('keymgr.sshclient.pk11token');
    	this.mKeyCertPickerElem			= document.getElementById('keymgr.sshclient.certpicker');

    	this.mRemoteHostNameElem		= document.getElementById('keymgr.sshclient.remote.hostname');
    	this.mRemotePortIdElem			= document.getElementById('keymgr.sshclient.remote.portid');
    	this.mRemoteUserIdElem			= document.getElementById('keymgr.sshclient.remote.userid');

    	this.mTerminalExecCmdElem		= document.getElementById('keymgr.sshclient.exec.cmd');

    	this.mSSHConnectButtonElem		= document.getElementById('keymgr.sshclient.cmd.connect');

	do {
            var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
            try {
                var prefBranchPrefixId = "extensions.avpki.sshclient.";
                var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
                if (!prefsBranch) {
    	            break;
                }

                var prefStringValue = null;
                var prefBoolValue = false;

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("shellcmdpath");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mShellCmdPath = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("terminal");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
	            this.mTerminalCmdFileSelectorElem.filepath = prefStringValue;
		    this.mTerminalCmdFileSelectorElem.refresh();
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("termargs");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
	            this.mTerminalCmdArgsElem.value = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("sshcommand");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
	            this.mSSHCommandFileSelectorElem.filepath = prefStringValue;
		    this.mSSHCommandFileSelectorElem.refresh();
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("sshargs");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
	            this.mSSHCommandArgsElem.value = prefStringValue;
	        }

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("usetoken");
		} catch (ex) {} 
	        this.mUseTokenFlagElem.checked = prefBoolValue;

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("pk11token");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
	            this.mPK11TokenMenuElem.value = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("certpicker");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
	            this.mKeyCertPickerElem.value = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("remoteHost");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
	            this.mRemoteHostNameElem.value = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("remotePort");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
	            this.mRemotePortIdElem.value = prefStringValue;
	        }

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("remoteUser");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
	            this.mRemoteUserIdElem.value = prefStringValue;
	        }

            } catch (ex) {
	    	this.logDebug("SSHClientDialog.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);


    	this.logTrace("SSHClientDialog.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	this.logTrace("SSHClientDialog.initWithDialogParams():................Start.");
        if (!(window.arguments) || (window.arguments.length <= 0)) {
    	    this.logTrace("SSHClientDialog.initWithDialogParams():................End(0).");
	    return;
	}
        var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);

	var selectedCert = null;
        var pkiParams = null;
	try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    if (pkiParams) {
	        var paramCert = pkiParams.getISupportAtIndex(1);
	        if (paramCert) {
	            selectedCert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	        }
	    }
	} catch (ex) { }

	if (selectedCert) {

	    this.mKeyCertPickerElem.selectedCert = selectedCert;
	    this.mKeyCertPickerElem.disabled = true;
	    this.handleKeyCertPickerChange(this.mKeyCertPickerElem);

	    // TODO: make sure openssh works with specific token.
	    //       Until then we do not use token-name.

	    // this.mUseTokenFlagElem.checked = true;
	    // this.mUseTokenFlagElem.disabled = true;

	    var selectedCertToken = this.mKeyCertPickerElem.getToken(selectedCert);
    	    this.logDebug("SSHClientDialog.initWithDialogParams(): selectedCertToken: " + selectedCertToken);

	    this.mPK11TokenMenuElem.tokenName = selectedCert.tokenName;
	    // this.mPK11TokenMenuElem.disabled = true;
	}


    	this.logTrace("SSHClientDialog.initWithDialogParams():................End.");
    },

    handleTextboxChange : function (aTextboxElem, ev) 
    {
    	this.logTrace("SSHClientDialog.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = this.trim(aTextboxElem.value);
	}

	/*
	if (ev) {
	    this.textFieldAutoCompleteAction(aTextboxElem);
	}
	*/

	this.updateTerminalExecCmd();

    	this.logTrace("SSHClientDialog.handleTextboxChange():................End.");
    },


    handleTerminalCmdPathChange : function (aTerminalCmdFileSelectorElem, ev) 
    {
    	this.logTrace("SSHClientDialog.handleTerminalCmdPathChange():................Start.");

	this.updateTerminalExecCmd();

    	this.logTrace("SSHClientDialog.handleTerminalCmdPathChange():................End.");
    },

    handleSSHCmdPathChange : function (aSSHCommandFileSelectorElem, ev) 
    {
    	this.logTrace("SSHClientDialog.handleSSHCmdPathChange():................Start.");

	this.updateTerminalExecCmd();

    	this.logTrace("SSHClientDialog.handleSSHCmdPathChange():................End.");
    },

    handleUseTokenFlagChange : function (aUseTokenFlagElem, ev) 
    {
	this.logTrace("SSHClientDialog.handleUseTokenFlagChange():................Start.");

	this.mPK11TokenMenuElem.hidden = !aUseTokenFlagElem.checked;

	this.updateTerminalExecCmd();

	this.logTrace("SSHClientDialog.handleUseTokenFlagChange():................End.");
    },

    handlePK11TokenMenuChange : function (aPK11TokenMenuElem, ev) 
    {
    	this.logTrace("SSHClientDialog.handleKeyCertPickerChange():................Start.");

	this.updateTerminalExecCmd();

    	this.logTrace("SSHClientDialog.handleKeyCertPickerChange():................End.");
    },

    handleKeyCertPickerChange : function (aKeyCertPickerElem, ev) 
    {
    	this.logTrace("SSHClientDialog.handleKeyCertPickerChange():................Start.");

	this.updateTerminalExecCmd();

    	this.logTrace("SSHClientDialog.handleKeyCertPickerChange():................End.");
    },

    handleRemoteHostNameChange : function (aRemoteHostNameElem, ev) 
    {
    	this.logTrace("SSHClientDialog.handleRemoteHostNameChange():................Start.");
	if (ev) {
	    if (aRemoteHostNameElem.value != "") {
	        aRemoteHostNameElem.value = this.trim(aRemoteHostNameElem.value);
	    }

	    this.textFieldAutoCompleteAction(aRemoteHostNameElem);
	}

	this.updateTerminalExecCmd();

    	this.logTrace("SSHClientDialog.handleRemoteHostNameChange():................End.");
    },

    handleRemotePortIdChange : function (aRemotePortIdElem, ev) 
    {
    	this.logTrace("SSHClientDialog.handleRemotePortIdChange():................Start.");
	if (ev) {
	    if (aRemotePortIdElem.value != "") {
	        aRemotePortIdElem.value = this.trim(aRemotePortIdElem.value);
	    }
	    this.textFieldAutoCompleteAction(aRemotePortIdElem);
	}

	this.updateTerminalExecCmd();

    	this.logTrace("SSHClientDialog.handleRemotePortIdChange():................End.");
    },

    handleRemoteUserIdChange : function (aRemoteUserIdElem, ev) 
    {
    	this.logTrace("SSHClientDialog.handleRemoteUserIdChange():................Start.");
	if (ev) {
	    if (aRemoteUserIdElem.value != "") {
	        aRemoteUserIdElem.value = this.trim(aRemoteUserIdElem.value);
	    }
	    this.textFieldAutoCompleteAction(aRemoteUserIdElem);
	}

	this.updateTerminalExecCmd();

    	this.logTrace("SSHClientDialog.handleRemoteUserIdChange():................End.");
    },

    updateTerminalExecCmd : function () 
    {
	var nssDBPath = this.escapeSpace(this.mProfileDir.path);
    	this.logDebug("SSHClientDialog.updateTerminalExecCmd(): nssDBPath: " + nssDBPath);

	var validCommand = true;

        var setenvCmd = "";


        var terminalExecCmd = "";
	do {

	    // check if the path for terminal-command is valid
	    if (!this.mTerminalCmdFileSelectorElem.file) {
		validCommand = false;
	    	break;
	    }
	    if (this.mTerminalCmdFileSelectorElem.filepath == "") {
		validCommand = false;
	    	break;
	    }

	    // check if the path for sopenssh-command is valid
	    if (!this.mSSHCommandFileSelectorElem.file) {
		validCommand = false;
	    	break;
	    }
	    if (this.mSSHCommandFileSelectorElem.filepath == "") {
		validCommand = false;
	    	break;
	    }

	    // check if the remote host name is provided
	    if (this.mRemoteHostNameElem.value == "") {
		validCommand = false;
	    	break;
	    }

	    var selectedCert = this.mKeyCertPickerElem.getSelectedCert();
	    /*
	    if (!selectedCert) {
		validCommand = false;
	    	break;
	    }
	    */

	    // Format the command string for NSS_DB_PATH environment variable 
	    // OpenSSH only accept the DB-dir path using NSS_DB_PATH env-var.
	    if (this.mShellCmdPath.indexOf("csh") < 0) {
		// For sh, bash, ksh etc.
	    	setenvCmd = "NSS_DB_PATH=" + nssDBPath + "; ";
	    	setenvCmd += "export NSS_DB_PATH; ";
	    }
	    else {
		// For csh, tcsh etc.
	    	setenvCmd = "setenv NSS_DB_PATH " + nssDBPath + "; ";
	    }
    	    this.logDebug("SSHClientDialog.updateTerminalExecCmd(): setenvCmd: " + setenvCmd);


	    // Format the terminal cmd with optional args
	    var terminalCmd = this.mTerminalCmdFileSelectorElem.value + " ";
	    if (this.mTerminalCmdArgsElem.value != "") {
	    	terminalCmd += " " + this.mTerminalCmdArgsElem.value + " ";
	    }
	    // Add the option for execute the remainder of the command line inside the terminal.
	    if (this.mTerminalCmdFileSelectorElem.value.indexOf("gnome-terminal") >= 0) {
	    	terminalCmd += " -x " ;
	    }
	    else if (this.mTerminalCmdFileSelectorElem.value.indexOf("xterm") >= 0) {
	    	terminalCmd += " -e " ;
	    }
	    else if (this.mTerminalCmdFileSelectorElem.value.indexOf("konsole") >= 0) {
	    	terminalCmd += " -e " ;
	    }
	    else {
	    	// Use the this.mTerminalCmdArgsElem.value to provide this
		// option. Must be the last option in the args.
	    }


	    // Format the openssh-2 cmd with optional args and mandatory NSS related args
	    var openSSHCommand = "";
	    openSSHCommand = this.mSSHCommandFileSelectorElem.value + " ";
	    openSSHCommand += " -2 " ; // mandatory use of OpenSSH2
	    if (this.mSSHCommandArgsElem.value != "") {
	    	openSSHCommand += " " + this.mSSHCommandArgsElem.value + " ";
	    }

	    // Mandatory option for usage for NSS-DB for keys
	    openSSHCommand += " -o 'usenss yes' ";

	    // NSS-enabled OpenSSH option for selected token
	    // TODO: This option does not yet work for me even from the command line.
	    //       OpenSSH fails to find the specific token.
	    if (this.mUseTokenFlagElem.checked) {
	    	var pk11TokenName = this.mPK11TokenMenuElem.tokenName;
		if (pk11TokenName != "") {
	    	    openSSHCommand += " -o 'nsstoken " + pk11TokenName + "' " ;
		}
	    }

	    // cert nickname - not yet supported in OpenSSH
	    // openSSHCommand += " -f " + selectedCert.nickname + " ";

	    // port: -p port-id
	    if (this.mRemotePortIdElem.value != "") {
	    	openSSHCommand += " -p " + this.mRemotePortIdElem.value + " ";
	    }

	    // user@host 
	    openSSHCommand += " ";
	    if (this.mRemoteUserIdElem.value != "") {
	    	openSSHCommand += this.mRemoteUserIdElem.value + "@";
	    }
	    openSSHCommand += this.mRemoteHostNameElem.value;

	    // Format the terminal command with env-var and openssh command as args
	    terminalExecCmd = terminalCmd + " ";
	    	terminalExecCmd += this.mShellCmdPath + " -c ";
		terminalExecCmd += "\"";
	    	    terminalExecCmd += "( ";
	    	    	terminalExecCmd += setenvCmd + " ";
	    	    	terminalExecCmd += openSSHCommand + " ";
	    	    terminalExecCmd += " )";
		terminalExecCmd += "\"";
	} while (0);

	if (!validCommand) {
	    this.mTerminalExecCmdElem.value = "";
	    this.mSSHConnectButtonElem.disabled = true;
	    return;
	}


	this.mTerminalExecCmdElem.value = terminalExecCmd;
	this.mSSHConnectButtonElem.disabled = false;

    },

    executeLinuxCommand : function (aCommand) 
    {
    	this.logTrace("SSHClientDialog.executeLinuxCommand():................Start.");
    	this.logDebug("SSHClientDialog.executeLinuxCommand(): aCommand: " + aCommand);

	var executableFilePath = this.mShellCmdPath;

	var executableFile = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
	executableFile.initWithPath(executableFilePath);
	if (!executableFile.exists()) {
	    return;
	}

	var blocking = false;
	var args = [];
	args[0] = "-c";
	args[1] = aCommand;

	var process = Components.classes["@mozilla.org/process/util;1"]
					.createInstance(Components.interfaces.nsIProcess);
	process.init(executableFile);
        var result = process.run(blocking, args, args.length);

    	this.logTrace("SSHClientDialog.executeLinuxCommand():................End.");
    },

    sshConnect : function () 
    {
	var terminalExecCmd = this.mTerminalExecCmdElem.value;

	this.executeLinuxCommand(terminalExecCmd);

    	window.close();
    },

    help : function () 
    {
    },

    cancel : function () 
    {
    	window.close();
    },

    lastMethod : function () 
    {
    }
}

