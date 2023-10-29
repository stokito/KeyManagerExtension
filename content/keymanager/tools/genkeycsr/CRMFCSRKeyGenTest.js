/* @(#) $Id: CRMFCSRKeyGenTest.js,v 1.4 2012/10/07 17:20:23 subrata Exp $ */

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


var CRMFCSRKeyGenTest = {


    mWindowElem				: null,
    mCertSubjectElem			: null,
    mCRMFReqElem			: null,
    mRecoveryCACertPickerElem		: null,

    mTestMode 				: false,

    mKeyType				: "rsa",
    mKeySize				: 1024,
    mCRMFObject				: null,
    mRecoveryCACert			: null,
    mRecoveredCertItemElem		: null,

    /* nsIIOService	*/ mIOService	: null,
    /* nsIProperties	*/ mDirService	: null,
    /* nsIX509CertDB	*/ mX509CertDB	: null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager	: null,

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
        this.logTrace("CRMFCSRKeyGenTest.loginToInternalToken():................Start.");

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
	    	this.logDebug("CRMFCSRKeyGenTest.loginToInternalToken():  unable to obtain preferences - ex: " + ex);
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
            this.logTrace("CRMFCSRKeyGenTest.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("CRMFCSRKeyGenTest.loginToInternalToken():................End.");
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


    initXPComServiceInfo : function ()
    {
        this.logTrace("CRMFCSRKeyGenTest.initXPComServiceInfo():................Start.");

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
        } catch (ex) {
    	    alert("CRMFCSRKeyGenTest.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("CRMFCSRKeyGenTest.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	this.loginToInternalToken();

	this.logTrace("CRMFCSRKeyGenTest.initXPComServiceInfo():................End.");
    },


    initOnLoad : function ()
    {
	this.logTrace("CRMFCSRKeyGenTest.initOnLoad():................Start.");

	this.initXPComServiceInfo();


    	this.mWindowElem		= document.getElementById('CRMFCSRKeyGenTestWin');
	this.mCertSubjectElem		= document.getElementById("cert.subject");
	this.mRecoveryCACertPickerElem	= document.getElementById("cert.recoveryca.certpicker");
	this.mCRMFReqElem		= document.getElementById("cert.crmfreq");
	this.mCertSPKIElem		= document.getElementById("cert.spki");
	this.mRecoveredCertItemElem	= document.getElementById("cert.recovered.certitem");


    	var dialogParams = null;
	if (window.arguments && window.arguments[0]) {
	    dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);
	}

    	var encodedCSRFormData = null;
    	var keyType = null;
	var keySize = "1024";
    	var keyParamsArg = null;

	if (dialogParams) {
    	    encodedCSRFormData = dialogParams.GetString(0);
    	    keyType = dialogParams.GetString(1);
    	    keyParamsArg = dialogParams.GetString(2);
	}

    	if (!keyType) {
    	    keyType = "rsa";
    	}

    	// this.logDebug("uploadCRMFCSRForm.js:encodedCSRFormData:\n" + encodedCSRFormData + "");

    	// For nore info: https://developer.mozilla.org/En/HTML/HTML_Extensions/KEYGEN_Tag 

    	var keyChallenge = "abcd1234";
    	var keyparams = "";
    	var moz_type = "_moz-type";
    	var keygenvalue = "-mozilla-keygen";
    	if (keyType == "dsa") {
	    keyparams = keyParamsArg;
	    if (!keyparams) {
    	        keyparams = "MIIBHwKBgQDMQJZuHRQA8pm1Lt4PUiQa8BmeV997t8FhSobt9JrJAuaZXGh0NArRN6fnHLiQlprSagw/MN8uc8NzEzoR8P+aqKtd1otL5gUufssJ/31zpiNclVcdLtdRZ7QXHKNX0Wb3NfwjELIGFeKYmk5ukgNvUaZb3rmVPAvcW7BlnpFLZQIVAIiakC49yfeFCj++EWI7cIAiZOTzAoGBAKD375z6E8j1FrE2IrzsXrUxQwXQby0Nw1FLrs4BW7QRgt1df8D3ykPoxHZQ9zdNfr1bszcAd0gtzsOVPNQmd6/g63Lgq48zp/2aGFem7EqsqBPzygFIBNghjhZsz/K/mh4K4Ba56On8UDCaUb0je42K0atssBj6oj1dk89CwFUq";
	    }
    	}
    	else if (keyType == "ec") {
	    keyparams = keyParamsArg;
	    if (!keyparams) {
    	        keyparams = "secp256r1";
	    }
    	}




	var certSubject = "";
	certSubject = this.trim(this.mCertSubjectElem.value);
	if (certSubject == "") {
	    certSubject = "cn=xxx,o=abc.com";
	    this.mCertSubjectElem.value = certSubject;
	}

	this.mCertSubject = certSubject;
	this.mKeyType = keyType;
	this.mKeySize = parseInt(keySize);

	if (!this.mRecoveryCACert) {
	    this.generateRecoveryCACert();
	}

	this.doGenerateSelfSignedCertByCRMF();


	this.logTrace("CRMFCSRKeyGenTest.initOnLoad():................End.");
    },

    handleRecoveryCACertPickerChange : function (aRecoveryCACertPickerElem, ev)
    {
	this.logTrace("CRMFCSRKeyGenTest.handleRecoveryCACertPickerChange():................Start.");

	this.mRecoveryCACert = aRecoveryCACertPickerElem.selectedCert;

	this.logTrace("CRMFCSRKeyGenTest.handleRecoveryCACertPickerChange():................End.");
    },

    initDefaultKeyCertProps : function (/* nsIPersistentProperties */ aCertProps)
    {
    var keyGenAlg = "rsa";
    var keySize = "1024";
    var sigAlgorithm = "SHA1"; 
    var validityInMonths = "60"; 

    /*  Make a default serial number from the current time.  */
    var aCertSerialNo = "0"; 
    var aTrustArgs = "Pu,Pu,Pu"; 

    var propKey;
    var propValue;
    var propOldValue;
    var trueValue = "true";

    /*
    propKey = "nickName"; propOldValue = aCertProps.setStringProperty(propKey, aNickName);
    propKey = "subject"; propOldValue = aCertProps.setStringProperty(propKey, aSubjectDN);
    */
    propKey = "keysize"; propOldValue = aCertProps.setStringProperty(propKey, keySize);
    propKey = "keytype"; propOldValue = aCertProps.setStringProperty(propKey, keyGenAlg);
    propKey = "sigAlgorithm"; propOldValue = aCertProps.setStringProperty(propKey, sigAlgorithm);

    propKey = "serial"; propOldValue = aCertProps.setStringProperty(propKey, "auto");
    propKey = "serial-auto"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);

    propKey = "validity_auto"; propOldValue = aCertProps.setStringProperty(propKey, "");
    propKey = "validity_months"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
    propKey = "validityDuration"; propOldValue = aCertProps.setStringProperty(propKey, validityInMonths);

    // propKey = "trustArgs"; propOldValue = aCertProps.setStringProperty(propKey, aTrustArgs);

    // Extension related properties 
    propKey = "basicConstraints"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "basicConstraints-crit"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);

    propKey = "keyUsage"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "keyUsage-crit"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "keyUsage-digitalSignature"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "keyUsage-dataEncipherment"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
    /*
    propKey = "extKeyUsage"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "extKeyUsage-crit"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "extKeyUsage-serverAuth"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "extKeyUsage-clientAuth"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "extKeyUsage-codeSign"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "extKeyUsage-emailProtect"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
    */
    propKey = "netscape-cert-type"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "netscape-cert-type-crit"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      /*
      propKey = "netscape-cert-type-ssl-client"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "netscape-cert-type-ssl-server"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "netscape-cert-type-object-signing"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      propKey = "netscape-cert-type-smime"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
      */
    },

    generateRecoveryCACert : function ()
    {
	this.logTrace("CRMFCSRKeyGenTest.generateRecoveryCACert():................Start.");

	var generateCACert = true;

    	var propKey;
    	var propValue;
    	var propOldValue;
    	var trueValue = "true";

    	var caCertProps = Components.classes["@mozilla.org/persistent-properties;1"]
                    		.createInstance(Components.interfaces.nsIPersistentProperties);
    	this.initDefaultKeyCertProps(caCertProps);

	if (generateCACert) {
	}

	var recoveryCACert = null;
	var recoveryCACertNickName = "CRMFRecoveryCACert";
	var recoveryCACertSubject = "cn=" + recoveryCACertNickName + "," + "o=RecoveryCAOrg";
    	var tmpUserCert = null;
    	try {
	    recoveryCACert = this.mX509CertDB.findCertByNickname(null, recoveryCACertNickName);
    	} catch (ex) {
	    recoveryCACert = null;
	}

	if (!recoveryCACert) {
	    // CA-related properties
      	    propKey = "basicConstraints-cA-radio"; propOldValue = caCertProps.setStringProperty(propKey, trueValue);
      	    propKey = "netscape-cert-type-object-signing"; propOldValue = caCertProps.setStringProperty(propKey, trueValue);
      	    propKey = "netscape-cert-type-object-signing-ca"; propOldValue = caCertProps.setStringProperty(propKey, trueValue);
      	    propKey = "netscape-cert-type-smime-ca"; propOldValue = caCertProps.setStringProperty(propKey, trueValue);
      	    propKey = "netscape-cert-type-ssl-ca"; propOldValue = caCertProps.setStringProperty(propKey, trueValue);

      	    propKey = "subject"; propOldValue = caCertProps.setStringProperty(propKey, recoveryCACertSubject);
      	    propKey = "alias"; propOldValue = caCertProps.setStringProperty(propKey, recoveryCACertNickName);

	    try {
    	        recoveryCACert = this.mKeyManager.generateKeyAndImportSelfSignCertByForm(
	    				null,
					recoveryCACertNickName,
					recoveryCACertSubject,
					caCertProps
					);
	    } catch (ex) {
	    	this.logError("CRMFCSRKeyGenTest.generateRecoveryCACert(): this.mKeyManager.generateKeyAndImportSelfSignCertByForm() failed - ex: " + ex);
	    	throw ex;
	    }
	}
	if (!recoveryCACert) {
	    this.logTrace("CRMFCSRKeyGenTest.generateRecoveryCACert():................End(0).");
	    return;
	}

	this.mRecoveryCACertPickerElem.selectedCert = recoveryCACert;
	this.handleRecoveryCACertPickerChange(this.mRecoveryCACertPickerElem);

	this.logTrace("CRMFCSRKeyGenTest.generateRecoveryCACert():................End.");
    },

    doGenerateCRMFRequestCB : function ()
    {
    	this.logTrace("CRMFCSRKeyGenTest.doGenerateCRMFRequestCB(): ......Start.");

	/*
	var crmfReqElem = document.getElementById("cert.crmfreq");
    	if (typeof(this.mCRMFObject) != "undefined") {
    	    this.logDebug("CRMFCSRKeyGenTest.doGenerateCRMFRequestCB(): this.mCRMFObject.request:\n" + this.mCRMFObject.request + "");
	    crmfReqElem.value = this.mCRMFObject.request;
    	}
	*/
    	this.logTrace("CRMFCSRKeyGenTest.doGenerateCRMFRequestCB(): ......End.");
    },

    doGenerateCRMFRequest : function (/* String */ subject, /* String */ keyType, /* int */ keySize)
    {
    	// For more info: https://developer.mozilla.org/En/JavaScript_crypto/GenerateCRMFRequest

    	this.logTrace("CRMFCSRKeyGenTest.doGenerateCRMFRequest(): ......Start.");

    	var reqDN = subject;		// argv[0]
    	var regTokenArg = null;		// argv[1]
    	var authenticatorArg = null;	// argv[2]
    	var escrowCertArg = null; 		// argv[3]
    	var jsCallbackFuncArg = "CRMFCSRKeyGenTest.doGenerateCRMFRequestCB();"; // argv[4]
    	// var keySize = 1024;		// argv[5]
    	var keyParams = null;		// argv[6]
    	var keyGenAlg = null;		// argv[7]

    	if (keyType == "rsa") {
    	    keyGenAlg = "rsa-dual-use"; // "rsa-ex" | "rsa-sign"
    	    keyParams = null;
    	}
    	else if (keyType == "dsa") {
    	    keyGenAlg = "dsa-sign-nonrepudiation";
    	    keyParams = null;
    	}
    	if (keyType == "ec") {
	    keyGenAlg = "ec-dual-use"; // ec-sign-nonrepudiation | ec-sign | ec-nonrepudiation | ec-ex
    	    // keyParams = "curve=secp256r1";
    	}
    	this.logDebug("CRMFCSRKeyGenTest.doGenerateCRMFRequest(): " + 
    					"subject: " + subject + " " + 
    					"keySize: " + keySize + " " + 
    					"keyType: " + keyType + " " + 
    					"keyGenAlg: " + keyGenAlg + " " + 
					"keyParams: " + keyParams + " " + 
					"");

    	try {
    	    this.mCRMFObject = window.crypto.generateCRMFRequest(
			subject, 
			regTokenArg,
			authenticatorArg,
			escrowCertArg,
			jsCallbackFuncArg,
			keySize, // must be of integer type
			keyParams,
			keyGenAlg
			);
			// - we can add as many triplet {keySize, keyParams, keyGenAlg} 
			//   as we want to the argument list. 
			// - keySize must be of integer type.
    	} catch (ex) {
    	    this.logError("CRMFCSRKeyGenTest.doGenerateCRMFRequest(): window.crypto.generateCRMFRequest() failed for keyType: " + keyType + " - ex:\n" + ex + "");
	    return;
    	}
    	this.logDebug("CRMFCSRKeyGenTest.doGenerateCRMFRequest(): this.mCRMFObject.request:\n" + this.mCRMFObject.request + "");

    	this.logTrace("CRMFCSRKeyGenTest.doGenerateCRMFRequest(): ......End.");
    },

    doGenerateSelfSignedCertByCRMF : function ()
    {
	this.logTrace("CRMFCSRKeyGenTest.doGenerateSelfSignedCertByCRMF():................Start.");

	try {
    	    this.doGenerateCRMFRequest(this.mCertSubject, this.mKeyType, this.mKeySize);
	} catch (ex) {
	    throw ex;
	}

	this.mCRMFReqElem.value = this.mCRMFObject.request;
	if (!this.mRecoveryCACert) {
	    this.logTrace("CRMFCSRKeyGenTest.doGenerateSelfSignedCertByCRMF():................End(0).");
	    return;
	}

    	try {
	    var certSPKIBase64 = this.mKeyManager.getSPKIfromCRMFReqMessages(
					this.mCRMFObject.request
					);
	    this.mCertSPKIElem.value = certSPKIBase64;
	} catch (ex) {
    	    this.logError("CRMFCSRKeyGenTest.doGenerateCRMFRequest(): this.mKeyManager.getSPKIfromCRMFReqMessages() failed - ex:\n" + ex + "");
	    throw ex;
    	}

    	try {
    	    var propKey;
    	    var propValue;
    	    var propOldValue;
    	    var trueValue = "true";

	    var signedCertAlias = "recovered_" + (new Date()).getTime();
	    var signedCertSubject = "cn=" + signedCertAlias + "," + "o=RecoveredCertOrg";

    	    var certProps = Components.classes["@mozilla.org/persistent-properties;1"]
                    		.createInstance(Components.interfaces.nsIPersistentProperties);
      	    propKey = "subject"; propOldValue = certProps.setStringProperty(propKey, signedCertSubject);
      	    propKey = "alias"; propOldValue = certProps.setStringProperty(propKey, signedCertAlias);
      	    propKey = "importCert"; propOldValue = certProps.setStringProperty(propKey, trueValue);
	    var signedCert = this.mKeyManager.signCertByCRMReqMessages(
					this.mCRMFObject.request,
					this.mRecoveryCACert,
					certProps
	    				);
	    this.mRecoveredCertItemElem.cert = signedCert;

	} catch (ex) {
    	    this.logError("CRMFCSRKeyGenTest.doGenerateCRMFRequest(): this.mKeyManager.signCertByCRMReqMessages() failed - ex:\n" + ex + "");
	    throw ex;
    	}

	this.logTrace("CRMFCSRKeyGenTest.doGenerateSelfSignedCertByCRMF():................End.");
    },

    onCancel : function ()
    {
    	var dialogParams = null;
	if (window.arguments && window.arguments[0]) {
	    dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);
	}
	if (dialogParams) {
    	    dialogParams.SetInt(0, 0);
	}
    	window.close();
    },

    onClose : function ()
    {
    },
}
