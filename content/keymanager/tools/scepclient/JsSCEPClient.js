function JsSCEPClient(aScepServerObj, aScepRespCBFunc)
{
    this.initXPComServiceInfo();
    this.mScepServerObj = aScepServerObj;
    this.mScepRespCBFunc = aScepRespCBFunc;

    /*
    var scepServerObj = {
    	scepServerURL		: null,
    	scepServerURLDestIsRA	: false,
    	scepServerCACert	: null,
    	scepServerCert		: null,
    	userCert		: null,
    };
    */
}

var gJsSCEPClient = null;

JsSCEPClient.prototype = {

    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,
    /* alrIScepClient	*/ mScepPkiClient : null,

    mScepRespCBFunc		: null,

    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > this.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    dump : function(msg)
    {
        this.log(1, msg);
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
        this.logTrace("JsSCEPClient.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = this.mTokenDB.getInternalKeyToken();
        } catch (ex) {}
	if (!token) {
            this.logTrace("JsSCEPClient.loginToInternalToken():................End(0).");
	    return;
	}

	try {
            token.login(false);
            this.logTrace("JsSCEPClient.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("JsSCEPClient.loginToInternalToken():................End.");
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


    getPrefType : function (prefId) 
    {
    	return this.mPrefRootBranch.getPrefType(prefId);
    },

    prefExists : function (prefId) 
    {
    	return (this.mPrefRootBranch.getPrefType(prefId) != this.mPrefRootBranch.PREF_INVALID);
    },

    getPreference : function (prefId, aDefaultVal) 
    {
	var prefValue = null;
	do {
	    try {
		var prefType = this.mPrefRootBranch.getPrefType(prefId);
		if (prefType == this.mPrefRootBranch.PREF_INVALID) {
		    break;
		}
		switch(prefType) {
		    case this.mPrefRootBranch.PREF_STRING : 
			var prefStringValue = this.mPrefRootBranch.getCharPref(prefId);
			this.logDebug("this.getPreference(): prefId: " + prefId + " prefStringValue: " + prefStringValue + " prefType: " + prefType + "");
			if (prefStringValue) {
			    prefValue = prefStringValue;
			}
		    	break;
		    case this.mPrefRootBranch.PREF_BOOL : 
		        var prefBoolValue = this.mPrefRootBranch.getBoolPref(prefId);
			/*
			if (prefBoolValue) {
			}
			*/
			    prefValue = prefBoolValue;
		    	break;
		    case this.mPrefRootBranch.PREF_INT : 
		        var prefIntValue = this.mPrefRootBranch.getIntPref(prefId);
			this.logDebug("AhaPhoneOptions.getPreference(): prefId: " + prefId + " prefIntValue: " + prefIntValue + " prefType: " + prefType + "");
			/*
			if (prefIntValue) {
			}
			*/
			    prefValue = prefIntValue;
		    	break;
		    default :
		    	break;
		}
	    } catch (ex) {
	    }
	} while (0);
	this.logDebug("AhaPhoneOptions.getPreference(): prefId: " + prefId + " prefValue: " + prefValue + " prefType: " + prefType + "");
	if (!prefValue) {
	    prefValue = aDefaultVal;
	}
	return prefValue;
    },

    initXPComServiceInfo : function ()
    {
        this.logTrace("JsSCEPClient.initXPComServiceInfo():................Start.");

        try {
	    this.mPrefService = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService);
	    this.mPrefRootBranch = this.mPrefService.getBranch("");

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
    	    this.mScepPkiClient = Components.classes["@avaya.com/pkm/sceppkiclient;1"]
                    		.getService(Components.interfaces.alrIScepPkiClient);
	    /*
            this.mCRLManager = Components.classes["@avaya.com/pkm/alrcrlmanager;1"]
				.getService(Components.interfaces.alrICRLManager);
	     */
        } catch (ex) {
    	    alert("JsSCEPClient.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("JsSCEPClient.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	// this.loginToInternalToken();

	this.logTrace("JsSCEPClient.initXPComServiceInfo():................End.");
    },

    convertCertSerialHexToNum : function (certSerialHex)
    {
        var certSerialHexItems = certSerialHex.split(":");
        var certSerialHexStr = "0x";
        for (var i = 0; i < certSerialHexItems.length; i++) {
	    certSerialHexStr += certSerialHexItems[i];
        }

        var certSerialNum = parseInt(certSerialHexStr, 16);
        var certSerialNumStr = "" + certSerialNum;
        var padLen = 16 - certSerialNumStr.length;
        for (var i = 0; i < padLen; i++) {
    	    certSerialNumStr = "0" + certSerialNumStr;
        }
        return certSerialNumStr;
    },


    enrollCert : function () 
    {
        this.logTrace("JsSCEPClient.enrollCert():................Start.");
	/*
    	var scepServerObj = {
    	    scepServerURL		: this.mScepServerURL,
	    scepServerHttpMethod	: "GET",
	    scepServerEncodeHttpParams	: true,
    	    scepServerURLDestIsRA	: this.mScepServerURLDestIsRA,
    	    scepServerCACert		: this.mScepServerCACert,
    	    scepServerCert		: this.mScepServerCert,
    	    userCert			: this.mUserCert,
	    scepServerChallengePW 	: null,
    	    scepMsgType			: "PKCSReq",
    	    scepMsgPKCS10CSR		: null,
	    scepMsgHashAlg		: "SHA-1",
    	    scepMsgTransactionId	: null,
    	    scepMsgSenderNonce		: null,
    	    scepMsgReqPKCS7		: null,
    	    scepMsgRespPKCS7		: null,
    	    scepMsgRespStatus		: null,
    	    scepMsgRespOutFilePicker	: null,
    	    scepMsgRespOutFileBase64	: true,
    	    caSignedUserCert		: null,
    	    };
	*/

	// Step 1. Get Base-64 PKCS#10 CSR using the user-cert

    	var certProps = null;
	var scepServerUserChallengePW =  this.mScepServerObj.scepServerUserChallengePW;
    	this.logDebug("JsSCEPClient.enrollCert(): scepServerUserChallengePW: |" + scepServerUserChallengePW + "|");
	if (scepServerUserChallengePW && (scepServerUserChallengePW != "")) {
	    certProps = Components.classes["@mozilla.org/persistent-properties;1"]
				.createInstance(Components.interfaces.nsIPersistentProperties);
    	    var propKey;
    	    var propValue;
    	    var propOldValue;
    	    propKey = "pkcs9ChallengePassword"; propValue = scepServerUserChallengePW;
    	    propOldValue = certProps.setStringProperty(propKey, propValue);
	}
	var userPKCS10CSRBase64 = this.mKeyManager.generatePKCS10CSRByX509Cert(this.mScepServerObj.userCert, certProps);
	this.mScepServerObj.scepMsgPKCS10CSR = userPKCS10CSRBase64;
	// this.logDebug("JsSCEPClient.enrollCert(): userPKCS10CSRBase64:\n" + userPKCS10CSRBase64);


	// Step 2. Create Base-64 PKCS#7 Request message
    	var scepMsgTransactionId = this.convertCertSerialHexToNum(this.mScepServerObj.userCert.serialNumber);
    	var now = new Date();
    	var scepMsgSenderNonce = "" + (Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000);
    	scepMsgSenderNonce = scepMsgSenderNonce + now.getTime() + scepMsgSenderNonce;
    	scepMsgSenderNonce = scepMsgSenderNonce.substring(0, 16);

    	try {
	    this.mScepServerObj.scepMsgTransactionId = scepMsgTransactionId;
	    this.mScepServerObj.scepMsgSenderNonce = scepMsgSenderNonce;

	    var receipientCert = this.mScepServerObj.scepServerCACert;
	    if (this.mScepServerObj.scepServerURLDestIsRA) {
	    	receipientCert = this.mScepServerObj.scepServerCert;
	    }
	    this.mScepMsgReceipientCert = receipientCert;
	    this.mScepServerObj.receipientCert = receipientCert;

	    this.logDebug("JsSCEPClient.enrollCert(): this.mScepServerObj.scepMsgPKCS10CSR:\n" + this.mScepServerObj.scepMsgPKCS10CSR);
	    this.logDebug("JsSCEPClient.enrollCert(): this.mScepServerObj.userCert: " + this.mScepServerObj.userCert);
	    this.logDebug("JsSCEPClient.enrollCert(): this.mScepMsgReceipientCert: " + this.mScepMsgReceipientCert);
	    this.logDebug("JsSCEPClient.enrollCert(): this.mScepServerObj.scepMsgTransactionId: " + this.mScepServerObj.scepMsgTransactionId);
	    this.logDebug("JsSCEPClient.enrollCert(): this.mScepServerObj.scepMsgHashAlg: " + this.mScepServerObj.scepMsgHashAlg);
	    this.logDebug("JsSCEPClient.enrollCert(): this.mScepServerObj.scepMsgSenderNonce: " + this.mScepServerObj.scepMsgSenderNonce);
    	    var scepMsgReqPKCS7 = this.mScepPkiClient.createScepPkcsReqMessageByCSRStr(
					this.mScepServerObj.scepMsgPKCS10CSR,
					this.mScepServerObj.userCert,
					this.mScepMsgReceipientCert,
					this.mScepServerObj.scepMsgTransactionId,
					this.mScepServerObj.scepMsgHashAlg,
					this.mScepServerObj.scepMsgSenderNonce
    					);
	    this.mScepServerObj.scepMsgReqPKCS7 = scepMsgReqPKCS7;
    	} catch (ex) {
	    alert("generateScepRequestWithCerts(): createScepPkcsReqMessageByCert() failed - scepCsrGenStatus: " + ex);
	    this.logError("generateScepRequestWithCerts(): createScepPkcsReqMessageByCert() failed - scepCsrGenStatus: " + ex);
	    throw ex;
    	}
	this.mScepServerObj.caSignedUserCert = null;

	// Step 3. Send request to SCEP server using HTTP
	var scepMsgRespPKCS7 = null;
    	var scepReqMsgType = this.mScepServerObj.scepMsgType;
    	var httpMethod = this.mScepServerObj.scepServerHttpMethod;
    	var encodeParam = true;

	var jsSCEPClient = this;
    	var retVal = this.sendScepPKIRequestWithHttpMethod(function (aResponseData, aHttpChannel, aStatus) {
	    jsSCEPClient.handleScepRespMsgCBFunc(aResponseData, aHttpChannel, aStatus);
	});
	
        this.logTrace("JsSCEPClient.enrollCert():................End.");
	return this.mScepServerObj.caSignedUserCert;
    },

    handleScepRespMsgCBFunc : function (aResponseData, aHttpChannel, aStatus)
    {
        this.logTrace("JsSCEPClient.handleScepRespMsgCBFunc():................Start.");

	this.mScepServerObj.caSignedUserCert = null;

        var contentType = null;
        try {
	    contentType = aHttpChannel.getResponseHeader("Content-Type");
        } catch (ex) { }

	if (!aResponseData) {
	    var msg = "(): ERROR: HTTP invocation failed - status: " + aStatus + "\n" +
		"Possibly reasons are : \n" + 
		"  - Bad URL, \n" + 
		"  - Using GET method with large SCEP data - make sure you test with POST also\n" + 
		"";
	    alert(msg);
	    if (this.mScepServerObj.scepRespCBFunc) {
	        this.mScepServerObj.scepRespCBFunc(this.mScepServerObj.scepMsgType, null, null);
	    }
	    this.logError("JsSCEPClient.handleScepRespMsgCBFunc():" + msg);
	    this.logTrace("JsSCEPClient.handleScepRespMsgCBFunc():..................End(0).");
	    return;
	}
	if (aResponseData.length <= 0) {
	    var msg = "Http invocation for SCEP failed - aResponseData.length: " + aResponseData.length;
	    alert(msg);
	    this.logTrace("JsSCEPClient.handleScepRespMsgCBFunc(): " + msg);
	    if (this.mScepServerObj.scepRespCBFunc) {
	        this.mScepServerObj.scepRespCBFunc(this.mScepServerObj.scepMsgType, null, null);
	    }
	    this.logTrace("JsSCEPClient.handleScepRespMsgCBFunc():..................End(1).");
	    return;
	}
	var responseDataType = (typeof aResponseData);
	this.logDebug("JsSCEPClient.handleScepRespMsgCBFunc(): responseDataType: " + responseDataType + "\n");

    	if (!contentType || (contentType.indexOf("text") > 0) || (contentType.indexOf("html") > 0)) {
	    this.logError("JsSCEPClient.handleScepRespMsgCBFunc(): ERROR: HTTP invocation failed - bad content type: " + contentType + " - must not be text or html ");
	    this.logError("JsSCEPClient.handleScepRespMsgCBFunc(): ERROR: HTTP invocation failed - status: " + aStatus + "");
	    this.logDebug("JsSCEPClient.handleScepRespMsgCBFunc(): aResponseData:\n" + aResponseData + "");

	    if (responseDataType == "string") {
	    	var errorWin = window.openDialog("about:blank", "SCEPResp", "centerscreen,resizable=yes,scrollbars=yes,alwaysRaised=yes,dialog=yes,height=225,width=500,modalx");
	    	errorWin.document.write(aResponseData);
		errorWin.focus();
	    }
	    else {
	    	alert("ERROR: HTTP invocation failed - bad content type: " + contentType + " - must not be text or html ");
	    }

	    // scepClientScepRespMsgFilePathElem.viewFile();
	    if (this.mScepServerObj.scepRespCBFunc) {
	        this.mScepServerObj.scepRespCBFunc(this.mScepServerObj.scepMsgType, null, null);
	    }
	    this.logTrace("JsSCEPClient.handleScepRespMsgCBFunc():..................End(2).");
	    return;
    	}
	var scepMsgRespPKCS7 = aResponseData;

	// this.logDebug("JsSCEPClient.handleScepRespMsgCBFunc(): aResponseData:\n" + aResponseData + "");
	var base64Svc = Components.classes["@avaya.com/pkm/base64;1"]
				    .getService(Components.interfaces.alrIBase64);
	var scepMsgRespPKCS7Base64 = base64Svc.encode(aResponseData, aResponseData.length);
        this.logDebug("JsSCEPClient.handleScepRespMsgCBFunc(): scepMsgRespPKCS7Base64:\n" + scepMsgRespPKCS7Base64);


	// Step 4. Parse PKCS#7 Response message
        var pkiStatusObj = new Object();
        var failureInfoObj = new Object();
        var signedCertPKCS7Base64;
        try {
	    this.logDebug("JsSCEPClient.handleScepRespMsgCBFunc(): this.mScepServerObj.userCert: " + this.mScepServerObj.userCert);
	    this.logDebug("JsSCEPClient.handleScepRespMsgCBFunc(): this.mScepServerObj.receipientCert: " + this.mScepServerObj.receipientCert);
	    this.logDebug("JsSCEPClient.handleScepRespMsgCBFunc(): this.mScepServerObj.scepMsgTransactionId: " + this.mScepServerObj.scepMsgTransactionId);
	    this.logDebug("JsSCEPClient.handleScepRespMsgCBFunc(): this.mScepServerObj.scepMsgSenderNonce: " + this.mScepServerObj.scepMsgSenderNonce);
    	    signedCertPKCS7Base64 = this.mScepPkiClient.readScepCertRespPKIMessageByCert(
					scepMsgRespPKCS7Base64,
					this.mScepServerObj.userCert,
					this.mScepServerObj.receipientCert,
					this.mScepServerObj.scepMsgTransactionId,
					this.mScepServerObj.scepMsgSenderNonce,
					pkiStatusObj, failureInfoObj
    					);
        } catch (ex) {
    	    var msg = ("Failed to parse PKCS#7 response - ex: " + ex);
    	    this.logError("this.mScepPkiClient.readScepCertRespPKIMessageByCert() : " + msg);
	    alert(msg);
	    if (this.mScepServerObj.scepRespCBFunc) {
	        this.mScepServerObj.scepRespCBFunc(this.mScepServerObj.scepMsgType, null, null);
	    }
	    return;
        }

        var pkiStatus = pkiStatusObj.value;
        var failureInfo = failureInfoObj.value;

	this.mScepServerObj.scepMsgRespStatus = pkiStatus;
	this.mScepServerObj.failureInfo = failureInfo;

        switch (pkiStatus) {
    	    case Components.interfaces.alrIScepPkiClient.PKIStatus_FAILURE: 
	        alert("SCEP request failed - failure-id: " + failureInfo);
	        return;
    	    case Components.interfaces.alrIScepPkiClient.PKIStatus_PENDING: 
	        // Save the SCEP Request info as preference for future query 
	        alert("SCEP request is Pending.");
	        return;
    	    case Components.interfaces.alrIScepPkiClient.PKIStatus_SUCCESS: 
		// fall thru for importing of cert
	        break;
    	    default:
	        var msg = ("Invalid PKI Status for SCEP response.");
    	    	this.logError("this.mScepPkiClient.readScepCertRespPKIMessageByCert() : " + msg);
		alert(msg);
	        return; 
        }

    	try {
	    this.mKeyManager.importCertsFromPKCS7Base64(
				null,
				signedCertPKCS7Base64,
				Components.interfaces.nsIX509Cert.USER_CERT
				);
    	} catch (ex) {
	    var msg = ("mKeyManager.importCertsFromPKCS7Base64() failed.");
	    alert(msg);
	    this.logError("JsSCEPClient.handleScepRespMsgCBFunc(): " + msg + " - ex: " + ex);
	    if (this.mScepServerObj.scepRespCBFunc) {
	        this.mScepServerObj.scepRespCBFunc(this.mScepServerObj.scepMsgType, null, null);
	    }
	    this.logTrace("JsSCEPClient.handleScepRespMsgCBFunc():..................End(3).");
	    return;
    	}
	dump("JsSCEPClient.handleScepRespMsgCBFunc(): successfully imported user cert.\n");

	var x059CertList = null;
	try {
	    x059CertList = this.mKeyManager.getX509CertsFromPKCS7Base64(signedCertPKCS7Base64);
    	} catch (ex) {
	    var msg = ("getX509CertsFromPKCS7Base64() failed - to parse the PKCS7 msg response.");
	    this.logError("JsSCEPClient.handleScepRespMsgCBFunc(): " + msg + " - ex: " + ex);
	    alert(msg);
	    return;
	} 
	this.logDebug("JsSCEPClient.handleScepRespMsgCBFunc(): x059CertList.length: " + x059CertList.length);

	var caSignedUserCert = null;
	var x059CertEnum = x059CertList.enumerate();
	for (var i = 0; x059CertEnum.hasMoreElements(); i++) {
	    var x509Cert = x059CertEnum.getNext();
	    if (!x509Cert) {
	    	continue;
	    }
	    var x509Cert2 = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert2);
	    var x509Cert3 = x509Cert.QueryInterface(Components.interfaces.nsIX509Cert3);
	    if (x509Cert3.isSelfSigned) {
	        continue;
	    }
	    if (x509Cert2.certType == Components.interfaces.nsIX509Cert.USER_CERT) {
	    	caSignedUserCert = x509Cert;
		break;
	    }
	}
        this.logDebug("JsSCEPClient.handleScepRespMsgCBFunc(): caSignedUserCert: " + caSignedUserCert);
	this.mScepServerObj.caSignedUserCert = caSignedUserCert;
	if (!caSignedUserCert) {
	    this.logError("JsSCEPClient.handleScepRespMsgCBFunc(): failed to find the imported signed cert.");
	}

	if (this.mScepServerObj.scepRespCBFunc) {
	    this.mScepServerObj.scepRespCBFunc(this.mScepServerObj.scepMsgType, caSignedUserCert, Components.interfaces.nsIX509Cert.USER_CERT);
	}
        this.logTrace("JsSCEPClient.handleScepRespMsgCBFunc():................End.");
    },


    sendScepPKIRequestWithHttpMethod : function (aSCEPResponseCBFunc)
    {
        this.logTrace("JsSCEPClient.sendScepPKIRequestWithHttpMethod():..................Start.");

        var retVal = false;
        try {
	    var httpMethod = this.mScepServerObj.scepServerHttpMethod;
            if ((httpMethod == "GET") || (httpMethod == "get")) {
    	        retVal = this.sendScepPKIRequestWithHttpParam(aSCEPResponseCBFunc);
            }
            else if ((httpMethod == "POST-FORM") || (httpMethod == "post-form")) {
    	        retVal = this.sendScepPKIRequestWithHttpParam(aSCEPResponseCBFunc);
            }
            else if ((httpMethod == "POST") || (httpMethod == "post")) {
    	        retVal = this.sendScepPKIRequestWithPostMethod(aSCEPResponseCBFunc);
	    }
            else {
	        this.logError("JsSCEPClient.sendScepPKIRequestWithHttpMethod(): invalid HTTP method: " + httpMethod + "");
	        retVal = false;
            }
        } catch (ex) {
    	    this.logError("JsSCEPClient.sendScepPKIRequestWithHttpMethod(): failed - ex: " + ex + "");
	    throw ex;
        }
    
        this.logTrace("JsSCEPClient.sendScepPKIRequestWithHttpMethod():..................End.");
        return retVal;
    },

    sendScepPKIRequestWithHttpParam : function (aSCEPResponseCBFunc)
    {
        this.logTrace("JsSCEPClient.sendScepPKIRequestWithHttpParam():..................Start.");

	var scepMsgType = this.mScepServerObj.scepMsgType;
        var scepServerURL = this.mScepServerObj.scepServerURL;
	var encodeParams = this.mScepServerObj.scepServerEncodeHttpParams;
        var httpMethod = this.mScepServerObj.scepServerHttpMethod;
	if (httpMethod != "GET") {
	    httpMethod = "POST";
	    encodeParams = false;
	}
	var scepReqMsgBase64Data = this.mScepServerObj.scepMsgReqPKCS7;
        this.logDebug("JsSCEPClient.sendScepPKIRequestWithHttpParam(): scepServerURL: " + scepServerURL + "");


        var scepReqParamStr = "operation=" + "PKIOperation";

	// TODO: Test code fragment - comment out after test.
        if ((scepServerURL.indexOf("localhost") >= 0) | (scepServerURL.indexOf("gemstar.usae") >= 0)) {
            // JUST for test
	    var caNickName = this.mScepServerObj.scepServerCert.nickname;
	    var userNickName = this.mScepServerObj.userCert.nickname;
            scepReqParamStr += "&" + "caAlias=" + encodeURIComponent(caNickName);
            scepReqParamStr += "&" + "userAlias=" + encodeURIComponent(userNickName);

            var pkiStatus = "pending";
            if ((scepMsgType != null) && (scepMsgType != "PKCSReq")) {
    	        pkiStatus = "success";
            }
            scepReqParamStr += "&" + "pkiStatus=" + pkiStatus;
        }
	// End Test code fragment 

        this.logDebug("JsSCEPClient.sendScepPKIRequestWithHttpParam(): scepReqParamStr: " + scepReqParamStr + "");

        if (encodeParams) {
    	    scepReqParamStr += "&" + "message=" + encodeURIComponent(scepReqMsgBase64Data);
        }
        else {
    	    scepReqParamStr += "&" + "message=" + scepReqMsgBase64Data;
        }

        invokeSandboxedHttp(scepServerURL, httpMethod, scepReqParamStr, aSCEPResponseCBFunc);

        this.logTrace("JsSCEPClient.sendScepPKIRequestWithHttpParam():..................End.");
        return true;
    },

    // sendScepPKIRequestWithPostMethod : function (responseCBFunc, aScepReqMsgType, aEncodeMsgParam)
    sendScepPKIRequestWithPostMethod : function (aSCEPResponseCBFunc)
    {
        this.logTrace("JsSCEPClient.sendScepPKIRequestWithPostMethod():..................Start.");

        var scepServerURL = this.mScepServerObj.scepServerURL;
        var httpMethod = this.mScepServerObj.scepServerHttpMethod;
	var encodeParams = this.mScepServerObj.scepServerEncodeHttpParams;
	var scepMsgType = this.mScepServerObj.scepMsgType;
	var scepReqMsgBase64Data = this.mScepServerObj.scepMsgReqPKCS7;
        this.logDebug("JsSCEPClient.sendScepPKIRequestWithPostMethod(): scepServerURL: " + scepServerURL + "");
    	// this.logDebug("JsSCEPClient.sendScepPKIRequestWithPostMethod(): scepReqMsgBase64Data: \n" + scepReqMsgBase64Data + "");

	var base64Svc = Components.classes["@avaya.com/pkm/base64;1"]
				    .getService(Components.interfaces.alrIBase64);
	var dataObj = new Object();
	var lengthObj = new Object();
	var scepReqMsgBinData = base64Svc.decode(scepReqMsgBase64Data, lengthObj, dataObj);
	// scepReqMsgBinData = dataObj.value;
	var scepReqMsgBinDataLen = lengthObj.value; 
        this.logDebug("JsSCEPClient.sendScepPKIRequestWithPostMethod(): scepReqMsgBinData.length: " + scepReqMsgBinData.length + "");
    
    
        var scepReqParamStr = "operation=" + "PKIOperation";
	// TODO: Test code fragment - comment out after test.
        if ((scepServerURL.indexOf("localhost") >= 0) | (scepServerURL.indexOf("gemstar.usae") >= 0)) {
            // JUST for test
	    var caNickName = this.mScepServerObj.scepServerCert.nickname;
	    var userNickName = this.mScepServerObj.userCert.nickname;
            scepReqParamStr += "&" + "caAlias=" + encodeURIComponent(caNickName);
            scepReqParamStr += "&" + "userAlias=" + encodeURIComponent(userNickName);

            var pkiStatus = "pending";
            if ((scepMsgType != null) && (scepMsgType != "PKCSReq")) {
    	        pkiStatus = "success";
            }
            scepReqParamStr += "&" + "pkiStatus=" + pkiStatus;
            scepReqParamStr += "&" + "userAlias=" + userNickName;
        }
	// End Test code fragment 
        this.logDebug("JsSCEPClient.sendScepPKIRequestWithPostMethod(): scepReqParamStr: " + scepReqParamStr + "");

        invokeSandboxedHttpPostWithBinaryData(scepServerURL, scepReqParamStr, scepReqMsgBinData, aSCEPResponseCBFunc);

        this.logTrace("JsSCEPClient.sendScepPKIRequestWithPostMethod():..................End.");
        return true;
    },


    parseCACapabilities : function (aCACapStr)
    {
        this.logTrace("JsSCEPClient.parseCACapabilities():...........................Start.");
        this.logDebug("JsSCEPClient.parseCACapabilities(): aCACapStr:\n" + aCACapStr + "");
    
        // var caCapabilitiesObj = new Object();
        var caCapabilitiesObj = {
	        srcDoc : null,
	        getNextCACert : false,
	        renewal : false,
	        postPKIOperation : false,
	        sha1 : false,
	        sha256 : false,
	        sha512 : false,
	        des3 : false
	        };
    
        if (!aCACapStr || (aCACapStr == "")) {
	    gCACapabilities = caCapabilitiesObj;
	    this.logTrace("JsSCEPClient.parseCACapabilities():...........................End(0).");
	    return caCapabilitiesObj;
        }

        caCapabilitiesObj.srcDoc = aCACapStr;
    
        var caCapabilities = aCACapStr.split(/\n|\s/);
	/*
	if ((caCapabilities.length == 1) && (caCapabilities[0] == aCACapStr)) {
	    caCapabilities = aCACapStr.split("");
	}
	*/
        this.logDebug("JsSCEPClient.parseCACapabilities(): caCapabilities.length: " + caCapabilities.length + "");

        for (var i = 0; i < caCapabilities.length; i++) {
	    var caCapability = caCapabilities[i];
	    caCapability = this.trim(caCapability);
            this.logDebug("JsSCEPClient.parseCACapabilities(): caCapability[" + i + "]: " + caCapability + "");
	    switch(caCapability) {
	        case "GetNextCACert" : 
		    caCapabilitiesObj.getNextCACert = true;
		    break;
	        case "Renewal" : 
		    caCapabilitiesObj.renewal = true;
		    break;
	        case "POSTPKIOperation" : 
		    caCapabilitiesObj.postPKIOperation = true;
		    break;
	        case "sha1" : 
	        case "SHA1" : 
	        case "sha-1" : 
	        case "SHA-1" : 
		    caCapabilitiesObj.sha1 = true;
		    break;
	        case "sha256" : 
	        case "SHA256" : 
	        case "sha-256" : 
	        case "SHA-256" : 
		    caCapabilitiesObj.sha256 = true;
		    break;
	        case "sha512" : 
	        case "SHA512" : 
	        case "sha-512" : 
	        case "SHA-512" : 
		    caCapabilitiesObj.sha512 = true;
		    break;
	        case "des3" : 
	        case "DES3" : 
		    caCapabilitiesObj.des3 = true;
		    break;
	        default:
		    break;
	    }
        }
        this.logDebug("JsSCEPClient.parseCACapabilities(): caCapabilitiesObj: " + caCapabilitiesObj + "");
    	this.logDebug("JsSCEPClient.parseCACapabilities(): caCapabilitiesObj: " + JSON.stringify(caCapabilitiesObj, null, '  ') + "");
	/*
        this.logDebug("JsSCEPClient.parseCACapabilities(): caCapabilitiesObj.postPKIOperation: " + caCapabilitiesObj.postPKIOperation + "");
        this.logDebug("JsSCEPClient.parseCACapabilities(): caCapabilitiesObj.sha1: " + caCapabilitiesObj.sha1 + "");
	*/
    
        this.logTrace("JsSCEPClient.parseCACapabilities():...........................End.");
	return caCapabilitiesObj;
    },

    getPrefCACapabilities : function ()
    {
        this.logTrace("JsSCEPClient.getPrefCACapabilities():...........................Start.");

	if (this.mPrefCACapabilities) {
            this.logTrace("JsSCEPClient.getPrefCACapabilities():...........................End(0).");
	    return this.mPrefCACapabilities;
	}

	var prefCACapabilities = {};

	try {
	    var httpMethodDefault = this.getPreference("extensions.avpki.scepclient.httpmethod.default", "GET");
	    var sigAlgDefault = this.getPreference("extensions.avpki.scepclient.sigalg.default", "");
	    var httpMethodPostFormEnabled  = this.getPreference("extensions.avpki.scepclient.httpmethod.postform", false);
	    var overrideCACapEnabled = this.getPreference("extensions.avpki.scepclient.capabilities.override", false);
	    var overrideCACapValue = this.getPreference("extensions.avpki.scepclient.capabilities.value", "");

	    if (overrideCACapEnabled) {
	        prefCACapabilities = this.parseCACapabilities(overrideCACapValue);
	    }
	    else {
	        prefCACapabilities = this.parseCACapabilities(null);
	    }
	    prefCACapabilities.overrideCACapEnabled = overrideCACapEnabled;
	    prefCACapabilities.httpMethodDefault = httpMethodDefault;
	    prefCACapabilities.httpMethodPostFormEnabled = httpMethodPostFormEnabled;
	    prefCACapabilities.sigAlgDefault = sigAlgDefault;
	} catch (ex) {
            this.logError("JsSCEPClient.getPrefCACapabilities(): failed - ex: " + ex + "");
	}
        this.logDebug("JsSCEPClient.getPrefCACapabilities(): prefCACapabilities.overrideCACapEnabled: " + prefCACapabilities.overrideCACapEnabled + "");
        this.logDebug("JsSCEPClient.getPrefCACapabilities(): prefCACapabilities.httpMethodDefault: " + prefCACapabilities.httpMethodDefault + "");
        this.logDebug("JsSCEPClient.getPrefCACapabilities(): prefCACapabilities.httpMethodPostFormEnabled: " + prefCACapabilities.httpMethodPostFormEnabled + "");
        // this.dump("JsSCEPClient.getPrefCACapabilities(): prefCACapabilities : " + JSON.stringify(prefCACapabilities, null, ' ') + "");

	this.mPrefCACapabilities = prefCACapabilities;

        this.logTrace("JsSCEPClient.getPrefCACapabilities():...........................End.");
	return prefCACapabilities;
    },

    scepGetCACapabilities : function (aScepGetCACapCB)
    {
        this.logTrace("JsSCEPClient.scepGetCACapabilities():...........................Start.");

	
	var scepCACapabilities = null;

	try {
	    var prefCACapabilities = this.getPrefCACapabilities();

            var scepServerURL = this.mScepServerObj.scepServerURL;
	    if (!scepServerURL) {
                this.logTrace("JsSCEPClient.scepGetCACapabilities():...........................End(0).");
		if (aScepGetCACapCB) {
    	            aScepGetCACapCB(prefCACapabilities);
		}
	        return;
	    }

            var httpMethod = "GET";
            var certType = "GetCACaps";
            var reqParamStr = "operation=" + certType;
            // TODO: Remove the following line after testing.
            reqParamStr += "&message=dummy";

            var serverURL = scepServerURL + "?" + reqParamStr;
            this.logDebug("JsSCEPClient.scepGetCACapabilities(): serverURL: " + serverURL + "");

            var respDoc = null;
	    var jsSCEPClient = this;
    	    invokeSandboxedHttp(scepServerURL, httpMethod, reqParamStr, function(respDoc, httpChannel, aStatus) {
                jsSCEPClient.logTrace("JsSCEPClient.scepGetCACapabilities.invokeSandboxedHttp.cb():...........................Start.");
                if (!respDoc) {
	            jsSCEPClient.logError("JsSCEPClient.scepGetCACapabilities(): invokeSandboxedHttp() failed for serverURL: " + serverURL + " httpMethod: " + httpMethod + "");
	            scepCACapabilities = prefCACapabilities;;
                }
	        else {
	            scepCACapabilities = jsSCEPClient.parseCACapabilities(respDoc);
	            if (prefCACapabilities.overrideCACapEnabled) {
	    	        for (var caCapItem in prefCACapabilities) {
		            if (caCapItem == "srcDoc") {
		    	        continue;
		            }
		            if (!prefCACapabilities[caCapItem]) {
		    	        continue;
		            }
		            if (!scepCACapabilities[caCapItem]) {
		    	        scepCACapabilities[caCapItem] = prefCACapabilities[caCapItem];
		            }
		        }
	            }
	            else {
	    	        scepCACapabilities.overrideCACapEnabled = prefCACapabilities.overrideCACapEnabled;
	    	        scepCACapabilities.httpMethodDefault = prefCACapabilities.httpMethodDefault;
	    	        scepCACapabilities.httpMethodPostFormEnabled = prefCACapabilities.httpMethodPostFormEnabled;
	    	        scepCACapabilities.sigAlgDefault = prefCACapabilities.sigAlgDefault;
	            }
	        }

		/*
                jsSCEPClient.logDebug("JsSCEPClient.scepGetCACapabilities(): scepCACapabilities.overrideCACapEnabled: " + scepCACapabilities.overrideCACapEnabled + "");
                jsSCEPClient.logDebug("JsSCEPClient.scepGetCACapabilities(): scepCACapabilities.httpMethodDefault: " + scepCACapabilities.httpMethodDefault + "");
                jsSCEPClient.logDebug("JsSCEPClient.scepGetCACapabilities(): scepCACapabilities.httpMethodPostFormEnabled: " + scepCACapabilities.httpMethodPostFormEnabled + "");
                jsSCEPClient.logDebug("JsSCEPClient.scepGetCACapabilities(): scepCACapabilities.postPKIOperation: " + scepCACapabilities.postPKIOperation + "");
                jsSCEPClient.logDebug("JsSCEPClient.scepGetCACapabilities(): scepCACapabilities.sha1: " + scepCACapabilities.sha1 + "");
		*/
		jsSCEPClient.logDebug("JsSCEPClient.scepGetCACapabilities(): scepCACapabilities: " + JSON.stringify(scepCACapabilities, null, '  '));
		if (aScepGetCACapCB) {
    	            aScepGetCACapCB(scepCACapabilities);
		}
                jsSCEPClient.logTrace("JsSCEPClient.scepGetCACapabilities.invokeSandboxedHttp.cb():...........................End.");
    	    });
	} catch (ex) {
            this.logError("JsSCEPClient.scepGetCACapabilities(): failed - ex: " + ex + "");
	    throw ex;
	}


        this.logTrace("JsSCEPClient.scepGetCACapabilities():...........................End.");
        return;
    },

    scepGetCACertChain : function (aScepServerURLElemId, aGetCACertConsoleFrameId)
    {
    	this.logTrace("JsSCEPClient.scepGetCACertChain():...................Start.");

        var scepServerURL = this.mScepServerObj.scepServerURL;
        // var httpMethod = this.mScepServerObj.scepServerHttpMethod;
	var encodeParams = this.mScepServerObj.scepServerEncodeHttpParams;
	var scepMsgType = this.mScepServerObj.scepMsgType;

    	var scepReqParamStr = "operation=" + scepMsgType;
    	var caId = this.mScepServerObj.scepServerCAId; // TODO: get it from preference
    	if (caId) {
	    scepReqParamStr += "&message=" + caId;
    	}
	this.logDebug("JsSCEPClient.scepGetCACertChain(): scepReqParamStr: " + scepReqParamStr);

    	var httpMethod = "GET";
	var jsSCEPClient = this;
    	invokeSandboxedHttp(scepServerURL, httpMethod, scepReqParamStr,
		function (aResponseData, /* nsIChannel */ aHttpChannel, aStatus) {
    		    jsSCEPClient.getCACertRespMsgCBFunc(aResponseData, aHttpChannel, aStatus);
		});

    	this.logTrace("JsSCEPClient.scepGetCACertChain():...................End.");
    },

    getCACertRespMsgCBFunc : function (aResponseData, /* nsIChannel */ aChannel, aStatus)
    {
        this.logTrace("JsSCEPClient.getCACertRespMsgCBFunc():..................Start.");

	var scepMsgType = this.mScepServerObj.scepMsgType;

        var contentType = null;
        try {
	    contentType = aChannel.getResponseHeader("Content-Type");
        } catch (ex) {
	    alert("getCACertRespMsgCBFunc(): HTTP invocation failed - status : " + aStatus + " - ex: " + ex);
	    return;
        }
        this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): " + "contentType: " + contentType + " " + "aStatus: " + aStatus + "");

        if (!aResponseData) {
	    alert("getCACertRespMsgCBFunc(): HTTP invocation failed - NULL aResponseData");
	    return;
        }
        this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): " + "aResponseData.length: " + aResponseData.length + "");

        if (aResponseData.length <= 0) {
	    alert("getCACertRespMsgCBFunc(): Http invocation failed - aResponseData.length: " + aResponseData.length);
	    return;
        }

        if (scepMsgType == "GetCACaps") {
	    alert("CA Capabilities:\n" + aResponseData);
	    this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): CA Capabilities:\n" + aResponseData + "");
	    return;
        }

        if (contentType.indexOf("application") < 0) {
	    alert("Unknown content type: " + contentType + "\n" + aResponseData);
	    this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): Unknown content type: " + contentType + "\n" + aResponseData + "");
	    return;
        }
	var base64Svc = Components.classes["@avaya.com/pkm/base64;1"]
				    .getService(Components.interfaces.alrIBase64);
	var caCertBase64Data = base64Svc.encode(aResponseData, aResponseData.length);
        this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): caCertBase64Data:\n" + caCertBase64Data);

	var importedX509Cert = null;
	var importedX509CertType = null;
        try {
	    // CA Certificates are not imported if the internal token is note already logged-in state.
	    // No idea why it is so may be because we try to add trust.
	    this.loginToInternalToken();

	    if (contentType.indexOf("x-x509-ca-cert") > 0) {
	        // this.mX509CertDB.importCertsFromFile(null, getCACertRespMsgFile, Components.interfaces.nsIX509Cert.CA_CERT);
        	this.logTrace("JsSCEPClient.getCACertRespMsgCBFunc():..................50.");
		try {
	            this.mX509CertDB.importCertificates(
				aResponseData,
				aResponseData.length,
				Components.interfaces.nsIX509Cert.CA_CERT,
				null
				);
		} catch (ex) {
	    	    this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): ERROR: CA certs are not imported - may be they are already present - ex: " + ex  + "");
		}
        	this.logTrace("JsSCEPClient.getCACertRespMsgCBFunc():..................52.");
		// caCertBase64Data = "-----BEGIN CERTIFICATE-----\n" + caCertBase64Data + "-----END CERTIFICATE-----\n";
        	// this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): caCertBase64Data:\n" + caCertBase64Data);
		try {
		    var caX509Cert = this.mKeyManager.createX509CertFromBase64(caCertBase64Data);
        	    this.logTrace("JsSCEPClient.getCACertRespMsgCBFunc():..................54.");
	            this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): CA cert(s) are successfully imported.");
		    importedX509Cert = caX509Cert;
		    importedX509CertType = Components.interfaces.nsIX509Cert.CA_CERT;
		} catch (ex) {
	    	    this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): ERROR: this.mX509CertDB.constructX509FromBase64() failed  - ex: " + ex  + "");
		    importedX509Cert = null;
		}
	    }
	    /*
	    else if (contentType.indexOf("x-x509-ca-ra-cert") > 0) {
	        // RA cert is a server cert signed by the CA.
	        try {
		    this.mX509CertDB.importCertsFromFile(null, getCACertRespMsgFile, Components.interfaces.nsIX509Cert.CA_CERT);
	        } catch (ex) {
		    this.mX509CertDB.importCertsFromFile(null, getCACertRespMsgFile, Components.interfaces.nsIX509Cert.SERVER_CERT);
	        }
	        alert("RA/CA certs are successfully imported.");
	        this.logDebug("getCACertRespMsgCBFunc(): RA/CA certs are successfully imported.");
	    }
	    */
	    else if ((contentType.indexOf("x-x509-ca-ra-cert-chain") > 0)
		    || (contentType.indexOf("x-x509-ca-ra-cert") > 0)) {
        	this.logTrace("JsSCEPClient.getCACertRespMsgCBFunc():..................60.");
		/*
	        var firstX509Cert = this.mKeyManager.importCARACertsFromPKCS7File(
				    null,
				    getCACertRespMsgFile,
				    false
				    );
		*/
	        var firstX509Cert = this.mKeyManager.importCARACertsFromPKCS7DERData(
				    null,
				    aResponseData,
				    aResponseData.length
				    );
	        var firstX509Cert2 = firstX509Cert.QueryInterface(Components.interfaces.nsIX509Cert2);
	        var certType = firstX509Cert2.certType;
	        var importCertType = "";
	        switch (certType) {
		    case Components.interfaces.nsIX509Cert.SERVER_CERT : 
		        importCertType = "SERVER_CERT";
			importedX509CertType = Components.interfaces.nsIX509Cert.SERVER_CERT;
		        break;
		    case Components.interfaces.nsIX509Cert.CA_CERT : 
		        importCertType = "CA_CERT";
			importedX509CertType = Components.interfaces.nsIX509Cert.SERVER_CERT;
		        break;
		    default:
		        // All other types are not possible.
			importedX509CertType = -1;
		        break;
	        }
		importedX509Cert = firstX509Cert;

	        /*
	        var isRAFirstCertElem = document.getElementById("extensions.avpki.scepclient.getcacert.israfirstcert");
	        if (isRAFirstCertElem.checked) {
		    this.mX509CertDB.importCertsFromFile(null, getCACertRespMsgFile, nsIX509Cert.SERVER_CERT);
		    importCertType = "SERVER_CERT";
	        }
	        else {
		    try {
		        this.mX509CertDB.importCertsFromFile(null, getCACertRespMsgFile, nsIX509Cert.CA_CERT);
		        importCertType = "CA_CERT";
		        this.logDebug("getCACertRespMsgCBFunc(): CA cert (chain) is successfully imported.");
		    } catch (ex) {
		        this.logDebug("getCACertRespMsgCBFunc(): failed to import CA cert (chain) - may be PKCS#7 file is for RA.");
		        // RA cert is a server cert signed by the CA.
		        // If the first cert in PKCS#7 is RA cert, then this.mX509CertDB.importCertsFromFile() will fail with 
		        // nsIX509Cert.CA_CERT option. So, now we try it as server cert.
		        this.mX509CertDB.importCertsFromFile(null, getCACertRespMsgFile, nsIX509Cert.SERVER_CERT);
		        importCertType = "SERVER_CERT";
		    }
	        }
	        */
	        if (importCertType == "SERVER_CERT") {
		    alert("RA cert (chain) is successfully imported.");
		    this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): RA cert (chain) is successfully imported.");
	        }
	        else {
		    alert("CA cert (chain) is successfully imported.");
		    this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): CA cert (chain) is successfully imported.");
	        }
	    }
	    else  {
	        alert("Unexpected content-type: " + contentType + " in the GetCACert response message.");
	        this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): Unexpected content-type: " + contentType + " in the GetCACert response message.");
	    }
        } catch (ex) {
	    // alert("Failed to import Certs in GetCACert response message - may be they are already present");
	    this.logDebug("JsSCEPClient.getCACertRespMsgCBFunc(): ERROR: certs are not imported - may be they are already present - ex: " + ex  + "");
	    return;
        }
	// if (this.mScepRespCBFunc) {
	if (this.mScepServerObj.scepRespCBFunc) {
	    if (importedX509Cert) {
	    	this.mScepServerObj.scepRespCBFunc(scepMsgType, importedX509Cert, importedX509CertType);
	    }
	}
        this.logTrace("JsSCEPClient.getCACertRespMsgCBFunc():..................End.");
    },


    lastMethod : function () 
    {
    }
}

function  handleScepRespMsgCBGlobalFunc (aResponseData, aHttpChannel, aStatus)
{
    dump("JsSCEPClient.handleScepRespMsgCBGlobalFunc():...................Start.\n");

    if (!gJsSCEPClient) {
    	return;
    }
    gJsSCEPClient.handleScepRespMsgCBFunc(aResponseData, aHttpChannel, aStatus);
    gJsSCEPClient = null;

    dump("JsSCEPClient.handleScepRespMsgCBGlobalFunc():...................End.\n");
}

