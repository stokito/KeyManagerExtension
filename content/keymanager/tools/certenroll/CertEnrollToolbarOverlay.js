
if ((typeof avpki) == 'undefined') {
    var avpki = {};
    avpki.keymanager = {};
}
if ((typeof avpki.keymanager) == 'undefined') {
    avpki.keymanager = {};
}

window.addEventListener(
  "load",
  function (e) {
    avpki.keymanager.CertEnrollToolbarOverlay.activateTool(e);
  },
  false
);

avpki.keymanager.CertEnrollToolbarOverlay = {

    mCertEnrollEnabled  : false,

    activateTool : function ()
    {
    	// Note:  
    	// Enable Cert enrollment conditinally. 
    	// Cert enrollment wizard is enabled if the 'keymgr.certenroll.enabled' preference is
    	// set to true.

    	var  certEnrollEnabled = false;
	do {
            var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
            try {
                var prefBranchPrefixId = "";
                var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
                if (!prefsBranch) {
    	            break;
                }

                var prefStringValue = null;
                var prefBoolValue = false;
                var prefIntValue = false;

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.certenroll.enabled");
	            certEnrollEnabled = prefBoolValue;
		} catch (ex) {} 

            } catch (ex) { }

	} while (0);
	this.mCertEnrollEnabled = certEnrollEnabled;

	// dump("CertEnrollToolbarOverlay.activateTool(): certEnrollEnabled: " + certEnrollEnabled + "\n");

    	var certEnrollMenuItemIdList = [
    		"keymanager.certenroll.wizard.ff.menuitem",
    		"keymanager.cmd.toolbar.certenroll",
    		"keymanager.cmd.toolbar.certenroll.scep"
		];

	/*
    	const  disabledTooltiptext = "Wizard for cert enrollment with CA is not supported by default. You can override this poilcy by setting 'keymgr.certenroll.enabled' preference to 'true'.";
	*/

    	for (var i = 0; i < certEnrollMenuItemIdList.length; i++) {
    	    var certEnrollMenuItemId = certEnrollMenuItemIdList[i];
	    var certEnrollMenuItemElem = document.getElementById(certEnrollMenuItemId);
	    if (!certEnrollMenuItemElem) {
	        continue;
	    }
	    if (!certEnrollEnabled) {
	        certEnrollMenuItemElem.setAttribute("hidden", true);
	        continue;
	    }
	    certEnrollMenuItemElem.removeAttribute("hidden");
    	}
    },

    runCertEnrollWizard : function ()
    {
	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();

    	var certEnrollWizardURL = "chrome://keymanager/content/tools/certenroll/CertEnrollWizard.xul";

    	//check for an existing Cert Enroll tool window and focus it; it's not application modal
    	const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
    	var lastCertEnrollTool = kWindowMediator.getMostRecentWindow("avaya:certenroll");

    	if (lastCertEnrollTool) {
            lastCertEnrollTool.focus();
	    return;
    	}

    	window.openDialog(
		certEnrollWizardURL,
		'certenroll',
		'chrome,centerscreen,resizable=yes,dialog=no,titlebar'
		);
    },
 
    runCertEnrollScepWizard : function ()
    {
	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();

    	var certEnrollWizardURL = "chrome://keymanager/content/tools/certenroll/scep/CertEnrollScepWizard.xul";

    	//check for an existing Cert Enroll tool window and focus it; it's not application modal
    	const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
    	var lastCertEnrollTool = kWindowMediator.getMostRecentWindow("avaya:scepcertenroll");

    	if (lastCertEnrollTool) {
            lastCertEnrollTool.focus();
	    return;
    	}

	var scepClientParams = this.getDefaultScepClientParams();
	var dialogParams = this.getTestScepDialogParams(scepClientParams);
    	window.openDialog(
			certEnrollWizardURL,
			'certenroll',
			'chrome,centerscreen,resizable=yes,dialog=no,titlebar',
			dialogParams
			);
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
		    prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.certenroll.test.enabled");
	            scepClientTestEnabled = prefBoolValue;
		} catch (ex) {} 
	    } catch (ex) {}
	} while (0);

	if (!scepClientTestEnabled) {
	    return null;
	}

    	// var paramScepRecipientServerURL = "https://pdev19vm3.platform.avaya.com/ejbca/publicweb/apply/scep/pkiclient.exe";
    	var paramScepRecipientServerURL = "http://quasar.home.mazumdar.net:53080/deviceauth/scep/cgi-bin/pkiclient.exe";

    	// var paramScepRecipientIsRA = true;
    	var paramScepRecipientIsRA = false;

	// var paramIssuerCertAlias = null;
	// var paramIssuerCertAlias = "DelgAlrSubCA - Avayalabs";
    	var paramIssuerCertAlias = "default - AVAYA";
    	var paramScepIssuerID =  "DelgAlrSubCA";
    	var paramIssuerSubjectDN = null;
	var paramIssuerCert = null;


    	// var paramScepRecipientCertAlias = "DelgAlrSubCA - Avayalabs";
    	// var paramScepRecipientCertAlias = "default - AVAYA";
    	var paramScepRecipientCertAlias = null;
    	var paramScepRecipientSubjectDN = "";
	var paramScepRecipientCert = null;

	var paramUserCertAlias = null;
	// var paramUserCertAlias = "TYATRFAFAF";
    	// var paramUserSubjectDN = null;
    	var paramUserSubjectDN = "cn=xxxx,ou=home,o=mazumdar";
	var paramUserCert = null;
    	var paramUserChallengePW = "abcd1234";

	try {
	    var certdb = Components.classes["@mozilla.org/security/x509certdb;1"]
				.getService(Components.interfaces.nsIX509CertDB);
	    var x509Cert = null;
		x509Cert = null;
		if (paramIssuerCertAlias && (paramIssuerCertAlias != "")) {
		    try {
		    	x509Cert = certdb.findCertByNickname(null, paramIssuerCertAlias);
		    } catch (ex) {
			dump("CertEnrollToolbarOverlay.getDefaultScepClientParams(): failed to find cert: " + paramIssuerCertAlias + " - ex: " + ex + "\n");
		    }
		    if (x509Cert) {
		    	paramIssuerCert = x509Cert;
			paramIssuerSubjectDN = paramIssuerCert.subjectName;
		    }
		}
		if (!paramScepRecipientIsRA) {
		    paramScepRecipientCertAlias = paramIssuerCertAlias;
		    paramScepRecipientCert = paramIssuerCert;
		    paramScepRecipientSubjectDN = paramIssuerSubjectDN;
		}

		x509Cert = null;
		if (paramScepRecipientIsRA && paramScepRecipientCertAlias && (paramScepRecipientCertAlias != "")) {
		    try {
		    	x509Cert = certdb.findCertByNickname(null, paramScepRecipientCertAlias);
		    } catch (ex) {
			dump("CertEnrollToolbarOverlay.getDefaultScepClientParams(): failed to find cert: " + paramScepRecipientCertAlias + " - ex: " + ex + "\n");
		    }
		    if (x509Cert) {
		    	paramScepRecipientCert = x509Cert;
			paramScepRecipientSubjectDN = paramScepRecipientCert.subjectName;
		    }
		    if (!paramIssuerCertAlias || (paramIssuerCertAlias == "")) {
		    	paramIssuerCertAlias = paramScepRecipientCertAlias;
		    	paramIssuerCert = paramScepRecipientCert;
		    	paramIssuerSubjectDN = paramScepRecipientSubjectDN;
		    }
		}

		x509Cert = null;
		if (paramUserCertAlias && (paramUserCertAlias != "")) {
		    try {
		    	x509Cert = certdb.findCertByNickname(null, paramUserCertAlias);
		    } catch (ex) {
			dump("CertEnrollToolbarOverlay.getDefaultScepClientParams(): failed to find cert: " + paramUserCertAlias + " - ex: " + ex + "\n");
		    }
		    if (x509Cert) {
		    	paramUserCert = x509Cert;
			paramUserSubjectDN = paramUserCert.subjectName;
		    }
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
	if (!aScepClientParams) {
	    return null;
	}
	var scepClientPkcsReqParam = aScepClientParams;
	/*
   	dump("CertEnrollToolbarOverlay.getTestScepDialogParams(): {\n" + 
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


	/*
	var certIdx = 1;
	if (scepClientPkcsReqParam.issuerX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.issuerX509Cert);
	}

	certIdx++;
	if (scepClientPkcsReqParam.scepRecipientX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.scepRecipientX509Cert);
	}

	certIdx++;
	if (scepClientPkcsReqParam.userX509Cert) {
	    pkiParams.setISupportAtIndex(certIdx, scepClientPkcsReqParam.userX509Cert);
	}
	else {
	    pkiParams.setISupportAtIndex(certIdx, null);
	}

	*/

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

	return  dialogParams;
    }
}
