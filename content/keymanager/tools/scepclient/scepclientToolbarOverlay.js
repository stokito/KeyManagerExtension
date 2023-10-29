
if (typeof avpki == 'undefined') {
    var avpki = {};
}
if (typeof avpki.keymanager == 'undefined') {
    avpki.keymanager = {};
}

avpki.keymanager.SCEPClientToolbarOverlay = {

    checkBinaryComponents : function ()
    {
    	if (!avpki.keymanager.KeyManagerToolbarOverlay.checkKMBinaryComponents()) {
	    return false;
	}
	return true;
    },

    getDefaultScepClientParams : function ()
    {
	var scepClientTestEnabled = false;
	do {
            try {
            	var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService);

                var prefBranchPrefixId = "";
                var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
                if (!prefsBranch) {
    	            break;
                }

                var prefBoolValue = false;

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.scepclient.test.enabled");
	            scepClientTestEnabled = prefBoolValue;
		} catch (ex) {} 
	    } catch (ex) {}
	} while (0);
   	// dump("SCEPClientToolbarOverlay.getDefaultScepClientParams(): scepClientTestEnabled: " + scepClientTestEnabled + "\n"); 

	if (!scepClientTestEnabled) {
	    return null;
	}


    	// var paramScepRecipientServerURL = "https://pdev19vm3.platform.avaya.com/ejbca/publicweb/apply/scep/pkiclient.exe";
    	var paramScepRecipientServerURL = "http://quasar.home.mazumdar.net:53080/deviceauth/scep/cgi-bin/pkiclient.exe";

    	// var paramScepRecipientIsRA = true;
    	var paramScepRecipientIsRA = false;

    	var paramScepIssuerID =  "DelgAlrSubCA";
	var paramIssuerCertAlias = "DelgAlrSubCA - Avayalabs";
    	var paramIssuerSubjectDN =  null;
	var paramIssuerCert = null;


    	// var paramScepRecipientCertAlias = "default - AVAYA";
    	// var paramScepRecipientCertAlias = "DelgAlrSubCA - Avayalabs";
    	var paramScepRecipientCertAlias = null;
    	var paramScepRecipientSubjectDN = "";
	var paramScepRecipientCert = null;

	// var paramUserCertAlias = "";
	var paramUserCertAlias = "TYATRFAFAF";
	var paramUserCert = null;
    	var paramUserSubjectDN = null;
    	var paramUserChallengePW = null;

	try {
	    var certdb = Components.classes["@mozilla.org/security/x509certdb;1"]
				.getService(Components.interfaces.nsIX509CertDB);
	    var x509Cert = null;
	    try {
		x509Cert = null;
		if (paramIssuerCertAlias && (paramIssuerCertAlias != "")) {
		    try {
		    	x509Cert = certdb.findCertByNickname(null, paramIssuerCertAlias);
		    } catch (ex) {
			dump("SCEPClientToolbarOverlay.getDefaultScepClientParams(): failed to find cert: " + paramIssuerCertAlias + " - ex: " + ex + "\n");
		    }
		    if (x509Cert) {
		    	paramIssuerCert = x509Cert;
			paramIssuerSubjectDN = paramIssuerCert.subjectName;
		    }
		}
		if (!paramScepRecipientIsRA && !paramScepRecipientCertAlias ) {
		    paramScepRecipientCertAlias = paramIssuerCertAlias;
		    paramScepRecipientCert = paramIssuerCert;
		    paramScepRecipientSubjectDN = paramIssuerSubjectDN;
		}

		x509Cert = null;
		if (paramScepRecipientIsRA && paramScepRecipientCertAlias && (paramScepRecipientCertAlias != "")) {
		    try {
		    	x509Cert = certdb.findCertByNickname(null, paramScepRecipientCertAlias);
		    } catch (ex) {
			dump("SCEPClientToolbarOverlay.getDefaultScepClientParams(): failed to find cert: " + paramScepRecipientCertAlias + " - ex: " + ex + "\n");
		    }
		    if (x509Cert) {
		    	paramScepRecipientCert = x509Cert;
			paramScepRecipientSubjectDN = paramScepRecipientCert.subjectName;
		    }
		    /*
		    if (!paramIssuerCertAlias || (paramIssuerCertAlias == "")) {
		    	paramIssuerCertAlias = paramScepRecipientCertAlias;
		    	paramIssuerCert = paramScepRecipientCert;
		    	paramIssuerSubjectDN = paramScepRecipientSubjectDN;
		    }
		    */
		}

		x509Cert = null;
		if (paramUserCertAlias && (paramUserCertAlias != "")) {
		    try {
		    	x509Cert = certdb.findCertByNickname(null, paramUserCertAlias);
		    } catch (ex) {
			dump("SCEPClientToolbarOverlay.getDefaultScepClientParams(): failed to find cert: " + paramUserCertAlias + " - ex: " + ex + "\n");
		    }
		    if (x509Cert) {
		    	paramUserCert = x509Cert;
			paramUserSubjectDN = paramUserCert.subjectName;
		    }
		}
	     } catch (ex) {
		dump("SCEPClientToolbarOverlay.getDefaultScepClientParams(): failed to find cert - ex: " + ex + "\n");
	    }
	} catch (ex) { 
	}


	var scepClientPkcsReqParam = {
			scepRecipientServerURL	: paramScepRecipientServerURL,
			scepRecipientIsRA	: paramScepRecipientIsRA,
			scepMessageType		: "PKCSReq",

			scepIssuerID		: paramScepIssuerID,
			issuerSubjectDN		: paramIssuerSubjectDN,
			issuerX509Cert		: paramIssuerCert,

			scepRecipientSubjectDN	: (paramScepRecipientIsRA ? paramScepRecipientSubjectDN : null),
			scepRecipientX509Cert	: (paramScepRecipientIsRA ? paramScepRecipientCert : null),

			userSubjectDN		: paramUserSubjectDN,
			userX509Cert		: paramUserCert,
			userChallengePW		: paramUserChallengePW

			};

    	return scepClientPkcsReqParam;
    },

    getTestScepDialogParams : function (aScepClientParams)
    {
   	// dump("SCEPClientToolbarOverlay.getTestScepDialogParams(): aScepClientParams: " + aScepClientParams + "\n"); 

	if (!aScepClientParams) {
	    return null;
	}

	var scepClientPkcsReqParam = aScepClientParams;
	/*
   	dump("SCEPClientToolbarOverlay.getDefaultScepClientParams(): {\n" + 
			"    scepRecipientServerURL: "	+ scepClientPkcsReqParam.scepRecipientServerURL + "\n" + 
			"    scepRecipientIsRA: "	+ scepClientPkcsReqParam.scepRecipientIsRA + "\n" + 
			"    scepMessageType: "		+ scepClientPkcsReqParam.scepMessageType + "\n" + 

			"    scepIssuerID: "		+ scepClientPkcsReqParam.scepIssuerID + "\n" + 
			"    issuerSubjectDN: "		+ scepClientPkcsReqParam.issuerSubjectDN + "\n" + 
			"    issuerX509Cert: "		+ scepClientPkcsReqParam.issuerX509Cert + "\n" + 
			"    issuerX509Cert.nickname: "	+ (scepClientPkcsReqParam.issuerX509Cert ? scepClientPkcsReqParam.issuerX509Cert.nickname : "null") + "\n" + 

			"    scepRecipientSubjectDN: "	+ scepClientPkcsReqParam.scepRecipientSubjectDN + "\n" + 
			"    scepRecipientX509Cert: "	+ scepClientPkcsReqParam.scepRecipientX509Cert + "\n" + 

			"    userSubjectDN: "		+ scepClientPkcsReqParam.userSubjectDN + "\n" + 
			"    userX509Cert: "		+ scepClientPkcsReqParam.userX509Cert + "\n" + 
			"    userX509Cert.nickname: "	+ (scepClientPkcsReqParam.userX509Cert ? scepClientPkcsReqParam.userX509Cert.nickname : "null") + "\n" + 
			"    userChallengePW: "		+ scepClientPkcsReqParam.userChallengePW + "\n" + 
			"}\n");
	*/
			

	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
				.createInstance(Components.interfaces.nsIPKIParamBlock);
	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
    
	pkiParams.setISupportAtIndex(1, null);

	var certIdx = 1;
	if (scepClientPkcsReqParam.issuerX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.issuerX509Cert);
	}

	certIdx++;
	if (scepClientPkcsReqParam.scepRecipientX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.scepRecipientX509Cert);
	}
	else {
	    pkiParams.setISupportAtIndex(certIdx, null);
	}

	certIdx++;
	if (scepClientPkcsReqParam.userX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.userX509Cert);
	}
	else {
	    pkiParams.setISupportAtIndex(certIdx, null);
	}

	var strIdx = 0;
	if (scepClientPkcsReqParam.scepRecipientServerURL) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepRecipientServerURL);
	}

	dialogParams.SetInt(1, (scepClientPkcsReqParam.scepRecipientIsRA ? 1 : 0));

	strIdx++;
	if (scepClientPkcsReqParam.scepMessageType) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepMessageType);
	}

	strIdx++;
	if (scepClientPkcsReqParam.scepIssuerID) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepIssuerID);
	}

	strIdx++;
	if (scepClientPkcsReqParam.issuerSubjectDN) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.issuerSubjectDN);
	}

	strIdx++;
	if (scepClientPkcsReqParam.scepRecipientSubjectDN) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepRecipientSubjectDN);
	}

	strIdx++;
	if (scepClientPkcsReqParam.userSubjectDN) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.userSubjectDN);
	}

	strIdx++;
	if (scepClientPkcsReqParam.userChallengePW) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.userChallengePW);
	}
   	// dump("SCEPClientToolbarOverlay.getTestScepDialogParams(): strIdx: " + strIdx + "\n");

	return  dialogParams;
    },

    getTestScepWizardParams : function (aScepClientParams)
    {
   	// dump("SCEPClientToolbarOverlay.getTestScepWizardParams(): aScepClientParams: " + aScepClientParams + "\n"); 

	if (!aScepClientParams) {
	    return null;
	}

	var scepClientPkcsReqParam = aScepClientParams;

	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
				.createInstance(Components.interfaces.nsIPKIParamBlock);
	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
    
	pkiParams.setISupportAtIndex(1, null);

	var certIdx = 1;
	if (scepClientPkcsReqParam.userX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.userX509Cert);
	}
	else {
	    pkiParams.setISupportAtIndex(certIdx, null);
	}

	certIdx++;
	if (scepClientPkcsReqParam.issuerX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.issuerX509Cert);
	}

	certIdx++;
	if (scepClientPkcsReqParam.scepRecipientX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.scepRecipientX509Cert);
	}
	else {
	    pkiParams.setISupportAtIndex(certIdx, null);
	}


	var strIdx = 0;
	if (scepClientPkcsReqParam.scepRecipientServerURL) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepRecipientServerURL);
	}

	dialogParams.SetInt(1, (scepClientPkcsReqParam.scepRecipientIsRA ? 1 : 0));

	strIdx++;
	if (scepClientPkcsReqParam.scepMessageType) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepMessageType);
	}

	strIdx++;
	if (scepClientPkcsReqParam.scepIssuerID) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepIssuerID);
	}

	/*
	strIdx++;
	if (scepClientPkcsReqParam.issuerSubjectDN) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.issuerSubjectDN);
	}

	strIdx++;
	if (scepClientPkcsReqParam.scepRecipientSubjectDN) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.scepRecipientSubjectDN);
	}

	strIdx++;
	if (scepClientPkcsReqParam.userSubjectDN) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.userSubjectDN);
	}

	strIdx++;
	if (scepClientPkcsReqParam.userChallengePW) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.userChallengePW);
	}
	*/

   	// dump("SCEPClientToolbarOverlay.getTestScepWizardParams(): strIdx: " + strIdx + "\n");

	return  dialogParams;
    },

    runScepClientWizard : function ()
    {
	if (!avpki.keymanager.SCEPClientToolbarOverlay.checkBinaryComponents()) {
	    return;
	}

	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();

        var scepClientURL = "chrome://keymanager/content/tools/scepclient/scepClientWizard.xul";

        const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);

        //check for an existing SCEP Client Wizard window and focus it; it's not application modal
        var lastScepClient = kWindowMediator.getMostRecentWindow("avaya:scepclient");
        if (lastScepClient) {
            lastScepClient.focus();
	    return;
        }

	var dialogParams = null;
	var scepClientParams = avpki.keymanager.SCEPClientToolbarOverlay.getDefaultScepClientParams();
	dialogParams = avpki.keymanager.SCEPClientToolbarOverlay.getTestScepWizardParams(scepClientParams);

        window.openDialog(scepClientURL,  "scepclient",
                		'chrome,centerscreen,resizable=yes,dialog=no,titlebar',
				dialogParams
				);
    	// window.openDialog( scepClientURL, '_blank', 'chrome,centerscreen,resizable,dialog=no,titlebar');
    },

    runScepClientBasicTool : function ()
    {
	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();
        var scepClientBasicURL = "chrome://keymanager/content/tools/scepclient/SCEPClientBasicTool.xul";

	var scepClientParams = avpki.keymanager.SCEPClientToolbarOverlay.getDefaultScepClientParams();
	var dialogParams = avpki.keymanager.SCEPClientToolbarOverlay.getTestScepDialogParams(scepClientParams);

        window.openDialog(scepClientBasicURL,  "_blank",
                		'chrome,centerscreen,resizable=yes,dialog=no,titlebar',
				dialogParams
				);
    },

    runScepClientParamTool : function ()
    {
	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();
        var scepClientParamURL = "chrome://keymanager/content/tools/scepclient/SCEPClientParamTool.xul";

	var scepClientParams = avpki.keymanager.SCEPClientToolbarOverlay.getDefaultScepClientParams();
	var dialogParams = avpki.keymanager.SCEPClientToolbarOverlay.getTestScepDialogParams(scepClientParams);

        window.openDialog(scepClientParamURL,  "_blank",
                		'chrome,centerscreen,resizable=yes,dialog=no,titlebar',
				dialogParams
				);
    }

}
