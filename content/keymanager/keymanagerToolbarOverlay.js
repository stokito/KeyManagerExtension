if (typeof avpki == 'undefined') {
    var avpki = {};
}
if (typeof avpki.keymanager == 'undefined') {
    avpki.keymanager = {};
}

avpki.keymanager.KeyManagerToolbarOverlay = {

    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > avpki.keymanager.KeyManagerToolbarOverlay.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    logError : function(msg)
    {
        avpki.keymanager.KeyManagerToolbarOverlay.log(2, msg);
    },
    logTrace : function(msg)
    {
        avpki.keymanager.KeyManagerToolbarOverlay.log(4, msg);
    },
    logDebug : function(msg)
    {
        avpki.keymanager.KeyManagerToolbarOverlay.log(8, msg);
    },
    dump : function(msg)
    {
        avpki.keymanager.KeyManagerToolbarOverlay.log(1, msg);
    },

    checkXPCOMBinaryComponent : function (interfaceId, classId)
    {
    	if (!Components.interfaces[interfaceId] || !Components.classes[classId]) {
	    var msg = "Failed to load XPCOM implementation (" + classId + ") of " + interfaceId + " interface.";
    	    alert(msg);
    	    dump(msg + "\n");
	    return false;
	}

	try {
	    var svcObj = Components.classes[classId].getService(Components.interfaces[interfaceId]);
	} catch (ex) {
	    var msg = "Failed to create instance of XPCOM implementation (" + classId + ") of " + interfaceId + " interface.";
    	    alert(msg);
    	    dump(msg + "\n");
	    return false;
	}
	// avpki.keymanager.KeyManagerToolbarOverlay.dump("KeyManagerToolbarOverlay.checkXPCOMBinaryComponent(): successfully loaded XPCOM implementation (" + classId + ") of " + interfaceId + " interface.");
	return true;
    },

    checkKMBinaryComponents : function ()
    {
	const x509CertDBCID = "@mozilla.org/security/x509certdb;1";
	const x509CertDBIID = "nsIX509CertDB";
	if (!avpki.keymanager.KeyManagerToolbarOverlay.checkXPCOMBinaryComponent(x509CertDBIID, x509CertDBCID)) {
	    return false;
	}

	const keyManagerCID = "@avaya.com/pkm/keymanager;1";
	const keyManagerIID = "alrIKeyManager";
	if (!avpki.keymanager.KeyManagerToolbarOverlay.checkXPCOMBinaryComponent(keyManagerIID, keyManagerCID)) {
	    return false;
	}

	const pkiMgmtSvcsCID = "@avaya.com/avpki/js/avpkimgmtsvcs;1";
	const pkiMgmtSvcsIID = "nsISupports";
	if (!avpki.keymanager.KeyManagerToolbarOverlay.checkXPCOMBinaryComponent(pkiMgmtSvcsIID, pkiMgmtSvcsCID)) {
	    return false;
	}

    	var keyManager = null;
	try {
	    keyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
		    		.getService(Components.interfaces.alrIKeyManager);
	} catch (ex) { }
    	if (!keyManager) {
    	    alert("Failed to load XPCOM implemnatation (@avaya.com/pkm/keymanager;1) of alrIKeyManager interface.\n");
    	    dump("Failed to load XPCOM implemnatation (@avaya.com/pkm/keymanager;1) of alrIKeyManager interface.\n");
	    return false;
    	}


	return true;
    },

    initTokenTestPassword : function ()
    {
	avpki.keymanager.KeyManagerToolbarOverlay.logTrace("KeyManagerToolbarOverlay.initTokenTestPassword()...................Start.");
    
	var testOption = false;
	var testPassword = null;
	do {
	    try {
		var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
    
		var prefBranchPrefixId = "extensions.avpki.tools.test.";
		var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
		if (!prefsBranch) {
		   avpki.keymanager.KeyManagerToolbarOverlay.logDebug("KeyManagerToolbarOverlay.initTokenTestPassword(): no extensions.avpki.tools.test. prefrence branch.");
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
	    } catch (e) { }
	} while (0);
    
	avpki.keymanager.KeyManagerToolbarOverlay.logDebug("KeyManagerToolbarOverlay.initTokenTestPassword(): testOption: " + testOption + " testPassword: " + testPassword + "");
	if (!testOption || !testPassword) {
	    avpki.keymanager.KeyManagerToolbarOverlay.logTrace("KeyManagerToolbarOverlay.initTokenTestPassword()...................End(1).");
	    return;
	}
    
	try {
	    var tokenPassword = testPassword;
	    var tokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"].
				    getService(Components.interfaces.nsIPK11TokenDB);
	    var token = tokendb.getInternalKeyToken();
	    if (token) {
		token.checkPassword(tokenPassword);
		token.login(false);
		avpki.keymanager.KeyManagerToolbarOverlay.logDebug("KeyManagerToolbarOverlay.initTokenTestPassword(): Successfully logged-in using test password.");
	    }
	} catch (ex) {}
    
	avpki.keymanager.KeyManagerToolbarOverlay.logTrace("KeyManagerToolbarOverlay.initTokenTestPassword()...................End.");
    },
    
    loginToInternalKeyToken : function ()
    {
	avpki.keymanager.KeyManagerToolbarOverlay.logTrace("KeyManagerToolbarOverlay.loginToInternalKeyToken()...................Start.");

	var /* nsIPK11Token */ token = null;
	try {
	    var xTokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"]
				.getService(Components.interfaces.nsIPK11TokenDB);
	    token = xTokendb.getInternalKeyToken();
	} catch(ex) {}
	if (!token) {
	    avpki.keymanager.KeyManagerToolbarOverlay.logTrace("KeyManagerToolbarOverlay.loginToInternalKeyToken()...................End(0).");
	    return;
	}
    
	avpki.keymanager.KeyManagerToolbarOverlay.initTokenTestPassword();
    
	try {
	    token.login(false);
	} catch (ex) {}

	avpki.keymanager.KeyManagerToolbarOverlay.logTrace("KeyManagerToolbarOverlay.loginToInternalKeyToken()...................End.");
    },
    
    getWindowMediator : function ()
    {
	const kWindowMediatorContractID = "@mozilla.org/appshell/window-mediator;1";
	const kWindowMediatorIID = Components.interfaces.nsIWindowMediator;
	const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
	return kWindowMediator;
    }
}

// alert("keymanagerToolbarOverlay.js: done loading.");

