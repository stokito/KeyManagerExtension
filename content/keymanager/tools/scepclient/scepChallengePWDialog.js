/* @(#) $Id: scepChallengePWDialog.js,v 1.6 2012/10/03 14:20:41 subrata Exp $ */

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



var ScepChallengePWDialog = {

    /* nsILoginManager	*/ mLoginManager : null,
    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,

    mMaxLogLevel : 2,
    log : function(level, msg)
    {
	if (level > ScepChallengePWDialog.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    logError : function(msg)
    {
        ScepChallengePWDialog.log(2, msg);
    },
    logTrace : function(msg)
    {
        ScepChallengePWDialog.log(4, msg);
    },
    logDebug : function(msg)
    {
        ScepChallengePWDialog.log(8, msg);
    },

    loginToInternalToken : function () 
    {
        ScepChallengePWDialog.logTrace("ScepChallengePWDialog.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = ScepChallengePWDialog.mTokenDB.getInternalKeyToken();
        } catch (ex) {}
	if (!token) {
            ScepChallengePWDialog.logTrace("ScepChallengePWDialog.loginToInternalToken():................End(0).");
	    return;
	}

	try {
            token.login(false);
            ScepChallengePWDialog.logTrace("ScepChallengePWDialog.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        ScepChallengePWDialog.logTrace("ScepChallengePWDialog.loginToInternalToken():................End.");
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
    	ScepChallengePWDialog.logTrace("SCEPClientBasicForm.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = ScepChallengePWDialog.trim(aTextboxElem.value);
	}
        var formFieldKey = aTextboxElem.getAttribute("autocompletesearchparam");
	if (formFieldKey) {
	    ScepChallengePWDialog.textFieldAutoCompleteAction(aTextboxElem);
	}

    	ScepChallengePWDialog.logTrace("SCEPClientBasicForm.handleTextboxChange():................End.");
    },

    initXPComServiceInfo : function ()
    {
        ScepChallengePWDialog.logTrace("ScepChallengePWDialog.initXPComServiceInfo():................Start.");

        try {
   	    ScepChallengePWDialog.mLoginManager = Components.classes["@mozilla.org/login-manager;1"]
		         	.getService(Components.interfaces.nsILoginManager);
    	    ScepChallengePWDialog.mIOService = Components.classes["@mozilla.org/network/io-service;1"]
		    		.getService(Components.interfaces.nsIIOService);
	    ScepChallengePWDialog.mDirService = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties);
	    ScepChallengePWDialog.mX509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
	                        .getService(Components.interfaces.nsIX509CertDB);
            ScepChallengePWDialog.mTokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
                                .getService(Components.interfaces.nsIPK11TokenDB);
	    ScepChallengePWDialog.mKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
	                        .getService(Components.interfaces.alrIKeyManager);
	    /*
            ScepChallengePWDialog.mCRLManager = Components.classes["@avaya.com/pkm/alrcrlmanager;1"]
				.getService(Components.interfaces.alrICRLManager);
	     */
        } catch (ex) {
    	    alert("ScepChallengePWDialog.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    ScepChallengePWDialog.logError("ScepChallengePWDialog.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	// ScepChallengePWDialog.loginToInternalToken();

	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.initXPComServiceInfo():................End.");
    },

    onLoad : function ()
    {
    	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.onLoad():..................Start.");

    	ScepChallengePWDialog.mScepChallengePWDialogElem		= document.getElementById('keymgr.scepclient.challengepw.dialog');

	ScepChallengePWDialog.mScepAdminServerURLElem		= document.getElementById("keymgr.scepclient.challengepw.url");
	ScepChallengePWDialog.mScepAdminServerAuthTypeElem	= document.getElementById("keymgr.scepclient.challengepw.authtype");
	// ScepChallengePWDialog.mScepAdminServerLoginURLElem	= document.getElementById("av1xssdkwb.login.1xpClientLoginURL");
	ScepChallengePWDialog.mScepAdminServerUserNameRowElem	= document.getElementById("keymgr.scepclient.challengepw.username.row");
	ScepChallengePWDialog.mScepAdminServerUserNameElem	= document.getElementById("keymgr.scepclient.challengepw.username");
	ScepChallengePWDialog.mScepAdminServerUserPasswdRowElem	= document.getElementById("keymgr.scepclient.challengepw.userpassword.row");
	ScepChallengePWDialog.mScepAdminServerUserPasswdElem	= document.getElementById("keymgr.scepclient.challengepw.userpassword");
	ScepChallengePWDialog.mScepAdminServerUserPasswdSaveElem	= document.getElementById("keymgr.scepclient.challengepw.userpassword.save");

	ScepChallengePWDialog.mScepAdminServerLoginCmdElem	= document.getElementById("keymgr.scepclient.challengepw.cmd.login");
	ScepChallengePWDialog.mScepChallengePasswdElem		= document.getElementById("keymgr.scepclient.challengepw.value");
	// ScepChallengePWDialog.mScepAdminServerLogoutCmdElem	= document.getElementById("av1xssdkwb.cmd.logout");


	ScepChallengePWDialog.initXPComServiceInfo();

	ScepChallengePWDialog.handleChallengePWAuthTypeChange(ScepChallengePWDialog.mScepAdminServerAuthTypeElem);
	ScepChallengePWDialog.handleServerURLChange(ScepChallengePWDialog.mScepAdminServerURLElem);

    	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.onLoad():..................End.");
    },

    getPassword : function (servrURLSpec, formSubmitURLSpec, userName) {
	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.getPassword():................Start.");

	// Source: https://developer.mozilla.org/en/Using_nsILoginManager

	var serverURI = ScepChallengePWDialog.mIOService.newURI(servrURLSpec, null, null);

	var hostname = serverURI.prePath;
	var formSubmitURL = ""; // 'http://www.example.com';  // not http://www.example.com/foo/auth.cgi
	var httprealm = null;
	var username = userName;
	var password = null;
	
	try {
   	    // Find users for the given parameters
   	    var logins = ScepChallengePWDialog.mLoginManager.findLogins({}, hostname, formSubmitURL, httprealm);
	    // dump("logins.length: " + logins.length + "\n");
      
   	    // Find user from returned array of nsILoginInfo objects
   	    for (var i = 0; i < logins.length; i++) {
		// dump("logins[" + i + "]: " + logins[i].username +  " " + "username: " + username + "\n");
      	        if (logins[i].username == username) {
	 	    password = logins[i].password;
	 	    break;
      	        }
   	    }
	}
	catch(ex) {
   	    // This will only happen if there is no nsILoginManager component class
	    ScepChallengePWDialog.logError("ScepChallengePWDialog.getPassowrd(): ScepChallengePWDialog.mLoginManager.findLogins() failed -  ex: " + ex + "");
	    throw ex;
	}

	ScepChallengePWDialog.logDebug("ScepChallengePWDialog.getPassowrd(): password: " + password);
	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.getPassword():................End.");
	return password;
    },

    savePassword : function (servrURLSpec, formSubmitURLSpec, userName, userPassword) {
	// Source: https://developer.mozilla.org/en/Using_nsILoginManager
	// Example: var formLoginInfo = new nsLoginInfo('http://www.example.com', 'http://login.example.com', null, 'joe', 'SeCrEt123', 'uname', 'pword');
	//      ===>
	//  <form action="http://login.example.com/foo/authenticate.cgi">   Please log in.   Username: <input type="text"     name="uname">   Password: <input type="password" name="pword">   </form> 
	
	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.savePassword():................Start.");

	var serverURI = ScepChallengePWDialog.mIOService.newURI(servrURLSpec, null, null);
	var hostname = serverURI.prePath;
	var formSubmitURL = ""; // 'http://www.example.com';  // not http://www.example.com/foo/auth.cgi
	var httprealm = null;
	var username = userName;
	var password = userPassword;
	var usernameField = "";
	var passwordField = "";

	var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
							Components.interfaces.nsILoginInfo, "init");
	var loginInfo = new nsLoginInfo(hostname, formSubmitURL, httprealm, username, password, usernameField, passwordField);

	try {
	    ScepChallengePWDialog.mLoginManager.addLogin(loginInfo);
	} catch (ex) {
	    ScepChallengePWDialog.logError("ScepChallengePWDialog.savePassowrd(): ScepChallengePWDialog.mLoginManager.addLogin() failed -  ex: " + ex + "");
	    throw ex;
	}

	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.savePassword():................End.");
    },

    validateLoginParam : function ()
    {
	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.validateLoginParam():................Start.");

	var validParams = false;
	if (ScepChallengePWDialog.mScepAdminServerAuthType == "none") {
	    if (ScepChallengePWDialog.mScepAdminServerURLElem.value != "") {
	    	validParams = true;
	    }
	    ScepChallengePWDialog.logTrace("ScepChallengePWDialog.validateLoginParam():................End(0).");
	    return validParams;
	}

	if (ScepChallengePWDialog.mScepAdminServerUserPasswdElem.value.length == 0) {
	    if ((ScepChallengePWDialog.mScepAdminServerUserNameElem.value != "") && (ScepChallengePWDialog.mScepAdminServerURLElem.value != "")) {
	    	var password = null;
		try {
		    password = ScepChallengePWDialog.getPassword(ScepChallengePWDialog.mScepAdminServerURLElem.value, "", ScepChallengePWDialog.mScepAdminServerUserNameElem.value);
		} catch (ex) {}
		ScepChallengePWDialog.logDebug("ScepChallengePWDialog.validateLoginParam(): password: " + password);
		if (password) {
		    ScepChallengePWDialog.mScepAdminServerUserPasswdElem.value = password;
		}
	    }
	}

	if ((ScepChallengePWDialog.mScepAdminServerURLElem.value != "") && 
	    (ScepChallengePWDialog.mScepAdminServerUserNameElem.value != "") && 
	    (ScepChallengePWDialog.mScepAdminServerUserPasswdElem.value != "")) {
	    validParams = true;
	}
	ScepChallengePWDialog.mScepAdminServerLoginCmdElem.disabled = !validParams;

	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.validateLoginParam():................End.");
	return validParams;
    },

    handleServerURLChange : function (aServerURLElem, ev)
    {
	ScepChallengePWDialog.handleTextboxChange(aServerURLElem, ev);
	ScepChallengePWDialog.validateLoginParam();

	ScepChallengePWDialog.mScepAdminServerURL = aServerURLElem.value;
    },

    handleChallengePWAuthTypeChange : function (aScepAdminServerAuthTypeElem, ev)
    {
	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.handleChallengePWAuthTypeChange():................Start.");

	ScepChallengePWDialog.mScepAdminServerAuthType = aScepAdminServerAuthTypeElem.selectedItem.value;

	if (ScepChallengePWDialog.mScepAdminServerAuthType == "none") {
	    ScepChallengePWDialog.mScepAdminServerUserNameRowElem.hidden = true;
	    ScepChallengePWDialog.mScepAdminServerUserPasswdRowElem.hidden = true;
	}
	else {
	    ScepChallengePWDialog.mScepAdminServerUserNameRowElem.hidden = false;
	    ScepChallengePWDialog.mScepAdminServerUserPasswdRowElem.hidden = false;
	}

	ScepChallengePWDialog.validateLoginParam();

	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.handleChallengePWAuthTypeChange():................End.");
    },

    handleUserNameChange : function (aUserNameElem, ev)
    {
	ScepChallengePWDialog.handleTextboxChange(aUserNameElem, ev);
	// ScepChallengePWDialog.textFieldAutoCompleteAction(aUserNameElem);
	ScepChallengePWDialog.validateLoginParam();
    },

    handleUserPasswordChange : function (aUserPasswordElem, ev)
    {
	ScepChallengePWDialog.handleTextboxChange(aUserPasswordElem, ev);
	ScepChallengePWDialog.validateLoginParam();
    },


    loginToPortal : function (aLoginRespCB)
    {
	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.loginToPortal():................Start.");

	if (!ScepChallengePWDialog.validateLoginParam()) {
	    ScepChallengePWDialog.logTrace("ScepChallengePWDialog.loginToPortal():................End(0).");
	    return;
	}

	var scepAdminServerURL		= ScepChallengePWDialog.mScepAdminServerURLElem.value;
	// var scepAdminServerLoginURL	= ScepChallengePWDialog.mScepAdminServerLoginURLElem.value;
	var scepAdminServerUserName	= ScepChallengePWDialog.mScepAdminServerUserNameElem.value;
	var scepAdminServerUserPassword	= ScepChallengePWDialog.mScepAdminServerUserPasswdElem.value;

	var me = this;
	try {
	    window.setCursor('wait');
	    invokeHttpFormLoginLoop(scepAdminServerURL, scepAdminServerUserName, scepAdminServerUserPassword, function(aLoginResult) {
		ScepChallengePWDialog.logTrace("ScepChallengePWDialog.loginToPortal.cb():................Start.");
	        ScepChallengePWDialog.logTrace("ScepChallengePWDialog.loginToPortal(): aLoginResult: " + aLoginResult);
	        window.setCursor('auto');
	        if (aLoginResult) {
	            ScepChallengePWDialog.mScepAdminServerURL = ScepChallengePWDialog.mScepAdminServerURLElem.value;

	            if (ScepChallengePWDialog.mScepAdminServerUserPasswdSaveElem.checked) {
			try {
	    	            ScepChallengePWDialog.savePassword(
				ScepChallengePWDialog.mScepAdminServerURLElem.value,
				'',
				ScepChallengePWDialog.mScepAdminServerUserNameElem.value,
				ScepChallengePWDialog.mScepAdminServerUserPasswdElem.value
				);
			} catch (ex) {
			}
	            }
	        }
		aLoginRespCB(aLoginResult);
		ScepChallengePWDialog.logTrace("ScepChallengePWDialog.loginToPortal.cb():................End.");
	    });
	} catch (ex) {
	    window.setCursor('auto');
	}

	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.loginToPortal():................End.");
    },

    getChallengePW : function (ev)
    {
	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.getChallengePW():................Start.");

	if (!ScepChallengePWDialog.validateLoginParam()) {
	    ScepChallengePWDialog.logTrace("ScepChallengePWDialog.getChallengePW():................End(0).");
	    return;
	}

	ScepChallengePWDialog.mScepChallengePasswdElem.value = "";

	var challengePWURL = ScepChallengePWDialog.mScepAdminServerURL;
	if (ScepChallengePWDialog.mScepAdminServerAuthType == "form") {
	    ScepChallengePWDialog.loginToPortal(function(aLoginResult) {
		ScepChallengePWDialog.logTrace("ScepChallengePWDialog.getChallengePW.loginToPortal.cb():................Start.");
		if (aLoginResult) {
    		    invokeSandboxedHttp(challengePWURL, "GET", null, function(aChallengePW) {
	    	        ScepChallengePWDialog.logDebug("ScepChallengePWDialog.getChallengePW.loginToPortal.cb.cb(): aChallengePW: " + aChallengePW);
	    	        var challengePW = aChallengePW || "";
	    	        ScepChallengePWDialog.mScepChallengePasswdElem.value = ScepChallengePWDialog.trim(challengePW);
			return;
		    });
		}
		ScepChallengePWDialog.logTrace("ScepChallengePWDialog.getChallengePW.loginToPortal.cb():................End.");
		return;
	    });
	    ScepChallengePWDialog.logTrace("ScepChallengePWDialog.getChallengePW():................End(1).");
	    return;
	}
	if (ScepChallengePWDialog.mScepAdminServerAuthType == "basic") {
	    // build the URL as follows: http://weblcsipspu1:abcd1234@quasar.home.mazumdar.net:53080
	    var serverURI = ScepChallengePWDialog.mIOService.newURI(challengePWURL, null, null);
	    var scepAdminServerUserName	= ScepChallengePWDialog.mScepAdminServerUserNameElem.value;
	    var scepAdminServerUserPassword	= ScepChallengePWDialog.mScepAdminServerUserPasswdElem.value;
	    serverURI.username = scepAdminServerUserName;
	    serverURI.password = scepAdminServerUserPassword;
	    challengePWURL = serverURI.spec;
	}
	ScepChallengePWDialog.logDebug("ScepChallengePWDialog.getChallengePW(): challengePWURL: " + challengePWURL);

    	invokeSandboxedHttp(challengePWURL, "GET", null, function(aChallengePW) {
	    ScepChallengePWDialog.logDebug("ScepChallengePWDialog.getChallengePW(): aChallengePW: " + aChallengePW);
	    var challengePW = aChallengePW || "";
	    ScepChallengePWDialog.mScepChallengePasswdElem.value = ScepChallengePWDialog.trim(challengePW);
	});

	ScepChallengePWDialog.logTrace("ScepChallengePWDialog.getChallengePW():................End.");
    },

    acceptChallengePW : function ()
    {
    	ScepChallengePWDialog.logTrace("CreateCertSimpleDialog.acceptChallengePW():..................Start.");

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
            dialogParams.SetInt(0, 0);
	}
	
	var challengePW = ScepChallengePWDialog.mScepChallengePasswdElem.value;
	if (challengePW != "") {
            dialogParams.SetString(0, challengePW);
            dialogParams.SetInt(0, 1);
	}

        window.close(0);
    	ScepChallengePWDialog.logTrace("CreateCertSimpleDialog.acceptChallengePW():..................End.");
    },

    cancel : function ()
    {
    	ScepChallengePWDialog.logTrace("CreateCertSimpleDialog.cancel():..................Start.");

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
            dialogParams.SetInt(0, 0);
	}

        window.close(0);

    	ScepChallengePWDialog.logTrace("CreateCertSimpleDialog.cancel():..................End.");
    },

    lastMethod : function () 
    {
    }

}


