
if ((typeof avpki) == 'undefined') {
    var avpki = {};
    avpki.keymanager = {};
}
if ((typeof avpki.keymanager) == 'undefined') {
    avpki.keymanager = {};
}

avpki.keymanager.SCEPCertEnroll = {

    mLogEnabled : false,
    log : function(msg) 
    {
        if (!avpki.keymanager.SCEPCertEnroll.mLogEnabled) {
    	    return;
        }
        dump(msg + "\n");
    },

    mKeyManager : null,

    initXPComServiceInfo : function ()
    {
        try {
	    /*
    	    this.mIOService = Components.classes["@mozilla.org/network/io-service;1"]
		    		.getService(Components.interfaces.nsIIOService);
	    this.mDirService = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties);
	    */
	    this.mX509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
	                        .getService(Components.interfaces.nsIX509CertDB);
            this.mTokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
                                .getService(Components.interfaces.nsIPK11TokenDB);
	    this.mKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
	                        .getService(Components.interfaces.alrIKeyManager);
	    /*
            this.mCRLManager = Components.classes["@avaya.com/pkm/alrcrlmanager;1"]
				.getService(Components.interfaces.alrICRLManager);
	     */
        } catch (ex) {
    	    alert("avpki.keymanager.SCEPCertEnroll.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    dump("avpki.keymanager.SCEPCertEnroll.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "\n");
	    throw ex;
        }
    },
    initOnLoad : function ()
    {
	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.initOnLoad():............................Start.");

    	this.initXPComServiceInfo();

	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.initOnLoad():............................End.");
    },

    runCertEnrollWizard : function ()
    {
    	var certEnrollWizardURL = "chrome://keymanager/content/tools/certenroll/CertEnrollWizard.xul";

    	//check for an existing Cert Enroll tool window and focus it; it's not application modal
    	const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
    	var lastCertEnrollTool = kWindowMediator.getMostRecentWindow("avaya:certenroll");

    	if (lastCertEnrollTool) {
            lastCertEnrollTool.focus();
	    return;
    	}

    	window.openDialog(certEnrollWizardURL, 'certenroll', 'chrome,centerscreen,resizable=yes,dialog=no,titlebar');
    },
 
    runCertEnrollScepWizard : function (aScepClientParams)
    {
	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.runCertEnrollScepWizard():.................Start.");


    	var certEnrollWizardURL = "chrome://keymanager/content/tools/certenroll/scep/CertEnrollScepWizard.xul";

	/*
    	//check for an existing Cert Enroll tool window and focus it; it's not application modal
    	const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
    	var lastCertEnrollTool = kWindowMediator.getMostRecentWindow("avaya:scepcertenroll");

    	if (lastCertEnrollTool) {
            lastCertEnrollTool.focus();
	    return true;
    	}
	*/

	var scepClientParams = aScepClientParams;
	if (!aScepClientParams) {
	    scepClientParams = this.getDefaultScepClientParams();
	}

	var dialogParams = this.getScepDialogParams(scepClientParams);
    	window.openDialog(
			certEnrollWizardURL,
			'certenroll',
			'chrome,centerscreen,resizable=yes,dialog=no,titlebar,modal',
			dialogParams
			);
        var signedX509Cert = null;
        if (dialogParams.GetInt(0) == 0) {
	    return false;
	}
        if (dialogParams.GetInt(0) == 1) {
	    var pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    var x509Cert = null;
	    if (pkiParams) {
            	x509Cert = pkiParams.getISupportAtIndex(1);
	    	if (x509Cert) {
	    	    signedX509Cert = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert);
	    	}
	    }
        }
	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.runCertEnrollScepWizard(): signedX509Cert: " + signedX509Cert + "");
	if (signedX509Cert) {
	    avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.runCertEnrollScepWizard(): signedX509Cert.nickname: " + signedX509Cert.nickname + "");
	}

	scepClientParams.userX509CertSigned = signedX509Cert;

	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.runCertEnrollScepWizard():.................End.");
	return true;
    },

    getDefaultScepClientParams : function ()
    {
	/*
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
	if (!scepClientTestEnabled) {
	    return null;
	}
	*/

    	// var paramScepRecipientServerURL = "https://pdev19vm3.platform.avaya.com/ejbca/publicweb/apply/scep/pkiclient.exe";
    	var paramScepRecipientServerURL = "http://quasar.home.mazumdar.net:53080/deviceauth/scep/cgi-bin/pkiclient.exe";

    	// var paramScepRecipientIsRA = true;
    	var paramScepRecipientIsRA = false;

	// var paramIssuerCertAlias = null;
	var paramIssuerCertAlias = "DelgAlrSubCA - Avayalabs";
    	var paramScepIssuerID =  "DelgAlrSubCA";
    	var paramIssuerSubjectDN =  null;
	var paramIssuerCert = null;


    	// var paramScepRecipientCertAlias = "default - AVAYA";
    	// var paramScepRecipientCertAlias = "DelgAlrSubCA - Avayalabs";
    	var paramScepRecipientCertAlias = null;
    	var paramScepRecipientSubjectDN = "";
	var paramScepRecipientCert = null;

	var paramUserCertAlias = null;
	// var paramUserCertAlias = "TYATRFAFAF";
    	var paramUserSubjectDN = null;
    	// var paramUserSubjectDN = "cn=xxxx,ou=home,o=mazumdar";
	var paramUserCert = null;
    	var paramUserChallengePW = "abcd1234";

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
			dump("SCEPCertEnroll.getDefaultScepClientParams(): failed to find cert: " + paramIssuerCertAlias + " - ex: " + ex + "\n");
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
			dump("SCEPCertEnroll.getDefaultScepClientParams(): failed to find cert: " + paramScepRecipientCertAlias + " - ex: " + ex + "\n");
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
			dump("SCEPCertEnroll.getDefaultScepClientParams(): failed to find cert: " + paramUserCertAlias + " - ex: " + ex + "\n");
		    }
		    if (x509Cert) {
		    	paramUserCert = x509Cert;
			paramUserSubjectDN = paramUserCert.subjectName;
		    }
		}
	     } catch (ex) {
		dump("SCEPCertEnroll.getDefaultScepClientParams(): failed to find cert - ex: " + ex + "\n");
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

    findX509CertBySubjectDN : function (aSubjectDN)
    {
	var x509Cert = null;
    	try {
	    if (aSubjectDN && (aSubjectDN != "")) {
	    	x509Cert =  this.mKeyManager.findX509CertBySubjectName(aSubjectDN);
	    }
	} catch (ex) {
    	    dump("SCEPCertEnroll.findX509CertBySubjectDN(): this.mKeyManager.findX509CertBySubjectName() failed for " + aSubjectDN);
	    x509Cert = null;
	}
	return x509Cert;
    },

    convertScepClientSubjectParams : function (aScepClientParams)
    {
	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.convertScepClientSubjectParams():............................Start.");
	if (!aScepClientParams) {
	     avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.convertScepClientSubjectParams():............................End(0).");
	    return;
	}

	var scepClientPkcsReqParam = aScepClientParams;
	var paramSubjectDN = null;
	var x509Cert = null;

	x509Cert = null;
	paramSubjectDN = scepClientPkcsReqParam.issuerSubjectDN;
	if (paramSubjectDN && (paramSubjectDN == "")) {
	    x509Cert =  this.mKeyManager.findX509CertBySubjectName(paramSubjectDN);
	}
	scepClientPkcsReqParam.issuerX509Cert = x509Cert;
	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.convertScepClientSubjectParams(): issuerX509Cert: " + scepClientPkcsReqParam.issuerX509Cert + "(" + scepClientPkcsReqParam.issuerSubjectDN + ")" + "");

	x509Cert = null;
	paramSubjectDN = scepClientPkcsReqParam.scepRecipientSubjectDN;
	if (paramSubjectDN && (paramSubjectDN == "")) {
	    x509Cert =  this.mKeyManager.findX509CertBySubjectName(paramSubjectDN);
	}
	scepClientPkcsReqParam.scepRecipientX509Cert = x509Cert;
	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.convertScepClientSubjectParams(): scepRecipientX509Cert: " + scepClientPkcsReqParam.scepRecipientX509Cert + "(" + scepClientPkcsReqParam.scepRecipientSubjectDN + ")" + "");

	x509Cert = null;
	paramSubjectDN = scepClientPkcsReqParam.userSubjectDN;
	if (paramSubjectDN && (paramSubjectDN == "")) {
	    x509Cert =  this.mKeyManager.findX509CertBySubjectName(paramSubjectDN);
	}
	scepClientPkcsReqParam.userX509Cert = x509Cert;
	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.convertScepClientSubjectParams(): userX509Cert: " + scepClientPkcsReqParam.userX509Cert + "(" + scepClientPkcsReqParam.userSubjectDN + ")" + "");

	var signedX509Cert = null;
	if (scepClientPkcsReqParam.issuerX509Cert && scepClientPkcsReqParam.userX509Cert) {
	    try {
	    	signedX509Cert = this.mKeyManager.findCASignedX509CertByCertSPKI(
					scepClientPkcsReqParam.userX509Cert,
					scepClientPkcsReqParam.issuerX509Cert
					);
	    } catch (ex) {
    	    	dump("SCEPCertEnroll.findX509CertBySubjectDN(): this.mKeyManager.findX509CertBySubjectName() failed for " + aSubjectDN);
	    }
	}
	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.convertScepClientSubjectParams(): signedX509Cert: " + signedX509Cert + "");
	
	scepClientPkcsReqParam.userX509CertSigned = signedX509Cert;
	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.convertScepClientSubjectParams():............................End.");
    },

    getScepDialogParams : function (aScepClientParams)
    {
	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.getScepDialogParams():............................Start.");
	if (!aScepClientParams) {
	    avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.getScepDialogParams():............................End(0).");
	    return null;
	}

	var scepClientPkcsReqParam = aScepClientParams;

	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.getScepDialogParams(): {\n" + 
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
			"    userX509CertAlias: "	+ scepClientPkcsReqParam.userX509CertAlias + "\n" + 
			"    userSubjectAltNames: "	+ scepClientPkcsReqParam.userSubjectAltNames + "\n" + 
			"}");
			
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

	strIdx++;
	if (scepClientPkcsReqParam.userX509CertAlias) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.userX509CertAlias);
	}

	strIdx++;
	if (scepClientPkcsReqParam.userSubjectAltNames) {
	    dialogParams.SetString(strIdx, scepClientPkcsReqParam.userSubjectAltNames);
	}

	avpki.keymanager.SCEPCertEnroll.log("SCEPCertEnroll.getScepDialogParams():............................End.");
	return  dialogParams;
    }
}
