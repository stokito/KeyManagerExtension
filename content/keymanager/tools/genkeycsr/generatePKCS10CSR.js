/* @(#) $Id: generatePKCS10CSR.js,v 1.21 2012/10/03 14:20:37 subrata Exp $ */

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


const nsDialogParamBlock = "@mozilla.org/embedcomp/dialogparam;1";
const nsIDialogParamBlock = Components.interfaces.nsIDialogParamBlock;

var gGenCSRWindowElem = null;
var gGenKeySelfSignButtonElem = null;
var gGenKeyCRMFCSRButtonElem = null;
var gGenKeySPKACButtonElem = null;
var gGenKeyPkcs10CSRButtonElem = null;
var gGenCSRScepClientButtonElem = null;

var  GenPKCS10CSR = {
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
    lastMethod : function()
    {
    }
   
};

function initGenerateKeyPairCSR()
{
    initGenerateCSR();
}

function initGenerateCSR()
{
    // GenPKCS10CSR.logTrace("generatePKCS10CSR.js:initGenerateCSR().............Start.");

    // InitCertDB();


    var csrGenOption = "generateSelfSignedCert";
    var certProfileId = null;
    var numberOfCerts = 0;

    var pkiParams = null;
    var dialogParams = null;

    if ((window.arguments) && (window.arguments.length > 0)) {
        dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
        try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
        } catch (ex) { }

    	csrGenOption = dialogParams.GetString(0);
    	certProfileId = dialogParams.GetString(1);
    	numberOfCerts = dialogParams.GetInt(0);
    }

    var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"].
    			getService(Components.interfaces.nsIX509CertDB);

    var /* nsIX509Cert */ selectedCert = null;
    if (numberOfCerts > 0) {
        //  Get the cert from the cert database

	var paramCert = pkiParams.getISupportAtIndex(1);
	if (paramCert) {
	    selectedCert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	}
	if (!selectedCert) {
            var dbKey = dialogParams.GetString(1);
	    if (dbKey) {
            	selectedCert = xcertdb.findCertByDBKey(dbKey , null);
	    }
	}

	if (!selectedCert) {
            dialogParams.SetInt(0, 0);
	    window.close();
	}
    }

    gGenCSRWindowElem	= document.getElementById('keymgr.cert.csr.form.win');
    var genSelfCertOption = initGenerateCSRButtons(csrGenOption, numberOfCerts);


    var x509v3CertElem = document.getElementById('keymgr.cert.csr.form');
    if (numberOfCerts) {
        if (genSelfCertOption) {
    	    x509v3CertElem.initForRenewSelfSignedCert(selectedCert);
	}
	else {
    	    x509v3CertElem.initForPkcs10CSR(selectedCert);
	}
    }
    else {
	if (certProfileId) {
    	    x509v3CertElem.setAttribute("profile", certProfileId);
	    if (certProfileId == "custom") {
    		var customProfilePath = dialogParams.GetString(2);
		if (customProfilePath) {
    	    	    x509v3CertElem.setAttribute("customprofilepath", customProfilePath);
		}
	    }
	    else if (certProfileId == "certificate") {
    		// var profilecertDbKey = dialogParams.GetString(2);
	    	var profilecert = null;
		var paramCert = pkiParams.getISupportAtIndex(2);
		if (paramCert) {
	    	    profilecert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
		}
		if (profilecert) {
		    x509v3CertElem.profilecert = profilecert;
		}
	    }
	    else if (certProfileId == "xmldoc") {
	    	var xmlData = null;
    		var xmlData = dialogParams.GetString(2);
		if (xmlData) {
    		    // GenPKCS10CSR.logDebug("generatePKCS10CSR.js:initGenerateCSR(): xmlData: \n" + xmlData + "");
		    x509v3CertElem.profilexmldata = xmlData;
		}
	    }
	}

    	// x509v3CertElem = document.getElementById('keymgr.cert.selfsigned.generate.form');
        if (genSelfCertOption) {
    	    x509v3CertElem.initForNewSelfSignedCert();
	}
	else {
    	    x509v3CertElem.initForNewSelfSignedCert();
	}
    }

    // GenPKCS10CSR.logTrace("generatePKCS10CSR.js:initGenerateCSR().............End.");
}

function initGenerateCSRButtons(csrGenOption, numberOfCerts)
{
    /*
    GenPKCS10CSR.logDebug("generatePKCS10CSR.js:initGenerateCSRButtons(): csrGenOption: " + csrGenOption + " " +
					"numberOfCerts: " + numberOfCerts + "\n" 
    					);
    */

    gGenKeySelfSignButtonElem	= document.getElementById('keymgr.cert.csr.form.cmd.SelfSignCertButton');
    gGenKeyCRMFCSRButtonElem	= document.getElementById('keymgr.cert.csr.form.cmd.CRMFButton');
    gGenKeySPKACButtonElem	= document.getElementById('keymgr.cert.csr.form.cmd.SPKACButton');
    gGenKeyPkcs10CSRButtonElem	= document.getElementById('keymgr.cert.csr.form.cmd.PKCS10Button');
    // gGenCSRScepClientButtonElem	= document.getElementById('keymgr.cert.csr.form.cmd.ScepClientButton');

    var genSelfCert = false;
    if (csrGenOption == "generateCSR") {
	// Get and hide the SelfSignCertButton
        gGenKeySelfSignButtonElem.setAttribute("hidden", true);
	if (numberOfCerts > 0) {
	    // SPKACButton only works if the key does not already exist 
            gGenKeySPKACButtonElem.setAttribute("hidden", true);
            gGenKeyCRMFCSRButtonElem.setAttribute("hidden", true);
	}
	else {
            gGenKeySPKACButtonElem.setAttribute("hidden", false);
            gGenKeyCRMFCSRButtonElem.setAttribute("hidden", false);
	}
	// gGenCSRScepClientButtonElem.hidden = false;
    }
    else { // Generate Self-cert
	// Hide the PKCS10Button, SPKACBtton, and CRMFButton 
	genSelfCert = true;

        // gGenKeyPkcs10CSRButtonElem.setAttribute("disabled", true);
        gGenKeyPkcs10CSRButtonElem.setAttribute("hidden", true);

        gGenKeySPKACButtonElem.setAttribute("hidden", true);
        gGenKeyCRMFCSRButtonElem.setAttribute("hidden", true);
	// gGenCSRScepClientButtonElem.hidden = true;

    }
    return genSelfCert;
}


function onLoad()
{

}

function onClose()
{
    // GenPKCS10CSR.logTrace("generatePKCS10CSR.js:onClose() Start.");

    if (!window.arguments || (window.arguments.length <= 0)) {
    	return;
    }
    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIPKIParamBlock);
    dialogParams.SetInt(0, 0);

    // GenPKCS10CSR.logTrace("generatePKCS10CSR.js:onClose() End.");
}

function doGenerateScepCSR()
{
    var pkiParams = null;
    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    try {
	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    } catch (ex) { }


    var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"]
    			.getService(Components.interfaces.nsIX509CertDB);

    var numberOfCerts = dialogParams.GetInt(0);

    var selectedCert = null;
    if (numberOfCerts) {
	var paramCert = pkiParams.getISupportAtIndex(1);
	if (paramCert) {
	    selectedCert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	}
	if (!selectedCert) {
            var dbKey = dialogParams.GetString(1);
	    if (dbKey) {
            	selectedCert = xcertdb.findCertByDBKey(dbKey , null);
	    }
	}
    }

    if (!selectedCert) {
        var /* nsIX509 */ newCert = null;
        newCert = doGenerateNewSelfSignedCert();
        if (!newCert) {
            // dialogParams.SetInt(0, 0);
	    // window.close();
	    return;
        }
	selectedCert = newCert;
    }
    window.close();

    var scepPkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    			.createInstance(Components.interfaces.nsIPKIParamBlock);
    var scepDialogParams = scepPkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

    scepPkiParams.setISupportAtIndex(1, null);	// SCEP-recipient cert
    scepPkiParams.setISupportAtIndex(2, selectedCert);	// User-cert 
    scepPkiParams.setISupportAtIndex(3, null);	// CA-Cert
    scepDialogParams.SetInt(0, 1);		// number of certs

    scepDialogParams.SetString(0, ""); 		// SCEP-server URL
    scepDialogParams.SetInt(1, 0);		// Is SCEP-server RA?
    scepDialogParams.SetString(1, "PKCSReq");	// SCEP-messgage type

    window.setCursor('wait');
    window.openDialog('chrome://scepclient/content/scepClientWizard.xul',
    			'_blank',
			'chrome,centerscreen,modal,resizable,dialog=no,titlebar',
			scepPkiParams
			);
    window.setCursor('auto');

    if (scepPkiParams.GetInt(0) == 0) {
    	dialogParams.SetInt(0, 1);
    	pkiParams.setISupportAtIndex(1, selectedCert);
	return;
    }
    dialogParams.SetInt(0, 1);

    var scepCert = scepPkiParams.getISupportAtIndex(1);
    pkiParams.setISupportAtIndex(1, scepCert);
    dialogParams.SetString(0, scepCert.nickname);
    dialogParams.SetString(1, scepCert.subjectName);
}

function doGenerateSelfSignedCert()
{
    GenPKCS10CSR.logTrace("generatePKCS10CSR.js:doGenerateSelfSignedCert(): ........Start.");

    //  Get the cert from the cert database
    var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"]
    			.getService(Components.interfaces.nsIX509CertDB);

    var pkiParams = null;
    var dialogParams =  null;
    var numberOfCerts = 0;
    if (window.arguments && (window.arguments.length > 0)) {
    	dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    	} catch (ex) { }
    	numberOfCerts = dialogParams.GetInt(0);
    }


    var /* nsIX509 */ selectedCert = null;
    var /* nsIX509 */ newCert = null;
    if (numberOfCerts) {
        // var selectedCert = xcertdb.findCertByDBKey(dbKey , null);
	var paramCert = pkiParams.getISupportAtIndex(1);
	if (paramCert) {
	    selectedCert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	    dbKey = selectedCert.dbKey;
	}
	if (!selectedCert) {
            var dbKey = dialogParams.GetString(1);
	    if (dbKey) {
            	selectedCert = xcertdb.findCertByDBKey(dbKey , null);
	    }
	}

    	var keepCert = dialogParams.GetInt(1);
	var keepRefCert = true;
	if (selectedCert.subjectName == selectedCert.issuerName) {
	    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
    					.getService(Components.interfaces.nsIPromptService);
    	    var dialogOk = promptService.confirm(window,
		     "Renewing the self-signed certificate using existing cert.",
		     "Renewing the self-signed certificate using existing cert.\nDo you want to delete the selected cert after renewal?"
		     );
    	    keepRefCert = !dialogOk;
	}

    	// newCert = reissueSelfCertByCert(selectedCert, keepRefCert);
    	newCert = reissueSelfCertByDBKey(dbKey, keepRefCert);
	if (newCert) {
    	    dialogParams.SetInt(1, 0); // pass back the keep-cert value
            if (keepRefCert) {
    	        dialogParams.SetInt(1, 1);
            }
	}
	selectedCert = null;
    }
    else {
    	newCert = doGenerateNewSelfSignedCert();
    }

    if (!newCert) {
	// We wait for user action for close/cancel window.
	return;
    }


    if (dialogParams) {
    	dialogParams.SetInt(0, 1);			// Success ret-code
    	pkiParams.setISupportAtIndex(1, newCert);	// newly created cert
    	dialogParams.SetString(0, newCert.nickname);	// nickName of generated cert
    	dialogParams.SetString(1, newCert.dbKey);	// dbKey of generated cert
    }

    window.close();

    GenPKCS10CSR.logTrace("generatePKCS10CSR.js:doGenerateSelfSignedCert(): ........End.");
}

function doGeneratePKCS10CSR()
{
    var /* nsIX509 */ selectedCert = null;

    GenPKCS10CSR.logTrace("generatePKCS10CSR.js:doGeneratePKCS10CSR(): ........Start.");

    var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"].
    			getService(Components.interfaces.nsIX509CertDB);

    var pkiParams = null;
    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    try {
	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    } catch (ex) { }

    var numberOfCerts = dialogParams.GetInt(0);
    if (numberOfCerts) {
	var paramCert = pkiParams.getISupportAtIndex(1);
	if (paramCert) {
	    selectedCert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	}
	if (!selectedCert) {
            var dbKey = dialogParams.GetString(1);
	    if (dbKey) {
            	selectedCert = xcertdb.findCertByDBKey(dbKey , null);
	    }
	}
    }

    var xtokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"].
    			getService(Components.interfaces.nsIPK11TokenDB);
    var xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
                    getService(Components.interfaces.alrIKeyManager);
    if (xKeyManager == null) {
    	GenPKCS10CSR.logError("generatePKCS10CSR.js:doGeneratePKCS10CSR(): couldn't find KeyManager.");
	dialogParams.SetInt(0, 0);
    	window.close();
	return;
    }

    var x509v3CertElem = document.getElementById('keymgr.cert.csr.form');

    // retrieve the cert properties and extension of the selected cert
    var certProps = Components.classes["@mozilla.org/persistent-properties;1"].
			createInstance(Components.interfaces.nsIPersistentProperties);
    x509v3CertElem.toCertProps(certProps);
    if (certProps == null) {
        alert("generatePKCS10CSR.js:doGeneratePKCS10CSR(): CSR generation failed - internal processing error.");
        // dialogParams.SetInt(0, 0);
        // window.close();
	return;
    }
    // x509v3CertElem.dumpProperties(certProps, "doGeneratePKCS10CSR().certProps ");

    var subjectDN = null;
    var alias = null;
    try {
        alias = certProps.getStringProperty("nickName");
        subjectDN = certProps.getStringProperty("subject");
    } catch (ex) {}
    if ((!alias) || (!subjectDN)) {
	alert("generatePKCS10CSR.js:doGeneratePKCS10CSR(): generation of CSR failed - alias/subject field is not initialized.");
	return;
    }

    var selectedUserAlias = null;
    var pkcs10CSRData = null;
    try {
        if (selectedCert == null) {
	    if (!x509v3CertElem.validateParams()) {
	        GenPKCS10CSR.logError("generatePKCS10CSR.js:doGeneratePKCS10CSR(): missing fields : either alias, or commonName.");
	        // alert("generatePKCS10CSR.js:doGeneratePKCS10CSR(): missing fields : either alias, or commonName.");
	        // dialogParams.SetInt(0, 0);
    	        // window.close();
    	        return;
    	    }
    	    pkcs10CSRData = xKeyManager.generatePKCS10CSRByForm(
			null,
			alias,
			subjectDN,
			certProps
			);
	    selectedUserAlias = alias;
        }
        else {
    	    // Force token login - on windows the popup window for password is not coming up
	    var keyTokenName = "" + selectedCert.tokenName;
    	    var token = xtokendb.findTokenByName(keyTokenName);
	    if (token != null) {
    	    	token.login(false);
	    }
    	    // loginToCertToken(selectedCert);

    	    pkcs10CSRData = xKeyManager.generatePKCS10CSRByX509Cert(selectedCert, certProps);
	    selectedUserAlias = selectedCert.nickname;
        }
    } catch (ex) {
    	GenPKCS10CSR.logError("generatePKCS10CSR.js:doGeneratePKCS10CSR(): PKCS10 CSR generation failed - " + ex + "");
	pkcs10CSRData = null;
    }

    if (pkcs10CSRData == null) {
        GenPKCS10CSR.logError("generatePKCS10CSR.js:doGeneratePKCS10CSR(): PKCS10 CSR generation failed.");
	dialogParams.SetInt(0, 0);
    	window.close();
	return;
    }

    var retVal = 0;
    try {
    	retVal = showPKCS10CSRData(pkcs10CSRData, selectedUserAlias);
    } catch (ex) {
        GenPKCS10CSR.logError("generatePKCS10CSR.js:doGeneratePKCS10CSR(): showPKCS10CSRData() failed - " + ex + "");
	retVal = 0;
    }

    GenPKCS10CSR.logDebug("generatePKCS10CSR.js:doGeneratePKCS10CSR(): retVal: " + retVal + "");

    if (retVal == 0) {
    	dialogParams.SetInt(0, 0);
    	// window.close();
    	GenPKCS10CSR.logTrace("generatePKCS10CSR.js:doGeneratePKCS10CSR(): ........End(1).");
	return;
    }

    dialogParams.SetInt(0, 1);
    // pkiParams.setISupportAtIndex(1, newCert);
    window.close();

    GenPKCS10CSR.logTrace("generatePKCS10CSR.js:doGeneratePKCS10CSR(): ........End.");
    return;
}

function doGenerateSignedSPKAC()
{
    GenPKCS10CSR.logTrace("generatePKCS10CSR.js:doGenerateSignedSPKAC(): ........Start.");

    var pkiParams = null;
    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    try {
	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    } catch (ex) { }

    var x509v3CertElem = document.getElementById('keymgr.cert.csr.form');
    var certProps = Components.classes["@mozilla.org/persistent-properties;1"]
			.createInstance(Components.interfaces.nsIPersistentProperties);
    x509v3CertElem.toCertProps(certProps);
    if (certProps == null) {
        alert("generatePKCS10CSR.js:doGenerateSignedSPKAC(): CSR generation failed - internal processing error.");
	dialogParams.SetInt(0, 0);
    	window.close();
    }
    // x509v3CertElem.dumpProperties(certProps, "doGenerateSignedSPKAC().certProps");
    var subjectDN = null;
    var alias = null;
    try {
        alias = certProps.getStringProperty("nickName");
        subjectDN = certProps.getStringProperty("subject");
    } catch (ex) {}
    if ((!alias) || (!subjectDN)) {
	alert("generatePKCS10CSR.js:doGenerateSignedSPKAC(): generation of CSR failed - alias/subject field is not initialized.");
	return;
    }


    var keyType = null;
    var keyParams = null;
    var subject = null;
    var csrCertFormData = "";
    var propEnum = certProps.enumerate();
    while (propEnum.hasMoreElements ()) {
        var propElem = propEnum.getNext ();
        var propItem = propElem.QueryInterface (Components.interfaces.nsIPropertyElement);
        var propKey = propItem.key;
        var propValue = propItem.value;
	if (propKey == "keytype") {
	    keyType = propValue;
	}
	else if (propKey == "ecCurveName") {
	    keyParams = propValue;
	}
	else if (propKey == "subject") {
	    subject = propValue;
	}
	csrCertFormData += '    <input type=\"hidden\" name=\"' + propKey + '\" value=\'' + propValue + '\'/> \n';
    } 
    // GenPKCS10CSR.logDebug("generatePKCS10CSR.js:doGenerateSignedSPKAC(): csrCertFormData:\n" + csrCertFormData + "");

    var encodedCSRFormData = encodeURIComponent(csrCertFormData);
    // GenPKCS10CSR.logDebug("generatePKCS10CSR.js:doGenerateSignedSPKAC(): encodedCSRFormData:\n" + encodedCSRFormData + "");

    var retVal = doGenerateSignedSPKACByForm(encodedCSRFormData, keyType, keyParams);

    GenPKCS10CSR.logTrace("generatePKCS10CSR.js:doGenerateSignedSPKAC(): ......End.");
}


function doGenerateSignedSPKACByForm(csrFormData, keytype, keyparams)
{
    GenPKCS10CSR.logTrace("generatePKCS10CSR.js:doGenerateSignedSPKACByForm(): ......Start.");

    var pkiParams = null;
    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    try {
	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    } catch (ex) { }

    var argc = 0;
    var params = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
    			.createInstance(Components.interfaces.nsIDialogParamBlock);
    params.SetString(argc, csrFormData); argc++;
    if (keytype) {
    	params.SetString(argc, keytype); argc++;
    }
    if (keyparams) {
    	params.SetString(argc, keyparams); argc++;
    }

    params.SetInt(0, argc);
    window.setCursor('wait');
    window.openDialog('chrome://keymanager/content/tools/genkeycsr/genKeyAndEnrollCertWithSignedSPKAC.xul', "",
                    			'chrome,centerscreen,resizable,modal', params);
    window.setCursor('auto');

    var retVal = params.GetInt(0);
    GenPKCS10CSR.logDebug("generatePKCS10CSR.js: doGenerateSignedSPKACByForm(): retVal: " + retVal + "");

    if (retVal == 0) { // Selected Cancel or failed.
    	dialogParams.SetInt(0, 0);
    	// window.close();
    	return 0;
    }

    dialogParams.SetInt(0, 1);
    window.close();

    GenPKCS10CSR.logTrace("generatePKCS10CSR.js: doGenerateSignedSPKACByForm(): ......End.");
    return 1;
}

function doGenerateCRMFCSR()
{
    GenPKCS10CSR.logTrace("generatePKCS10CSR.js:doGenerateCRMFCSR(): ........Start.");

    var pkiParams = null;
    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    try {
	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    } catch (ex) { }

    var x509v3CertElem = document.getElementById('keymgr.cert.csr.form');
    var certProps = Components.classes["@mozilla.org/persistent-properties;1"]
			.createInstance(Components.interfaces.nsIPersistentProperties);
    x509v3CertElem.toCertProps(certProps);
    if (certProps == null) {
        alert("generatePKCS10CSR.js:doGenerateCRMFCSR(): CSR generation failed - internal processing error.");
	dialogParams.SetInt(0, 0);
    	window.close();
    }
    // x509v3CertElem.dumpProperties(certProps, "doGenerateCRMFCSR().certProps");
    var subjectDN = null;
    var alias = null;
    try {
        alias = certProps.getStringProperty("nickName");
        subjectDN = certProps.getStringProperty("subject");
    } catch (ex) {}
    if ((!alias) || (!subjectDN)) {
	alert("generatePKCS10CSR.js:doGenerateCRMFCSR(): generation of CSR failed - alias/subject field is not initialized.");
	return;
    }


    var subject = null;
    var keyType = null;
    var keyParams = "";
    var csrFormData = "";
    var propEnum = certProps.enumerate();
    while (propEnum.hasMoreElements ()) {
        var propElem = propEnum.getNext ();
        var propItem = propElem.QueryInterface (Components.interfaces.nsIPropertyElement);
        var propKey = propItem.key;
        var propValue = propItem.value;
	if (propKey == "keytype") {
	    keyType = propValue;
	}
	else if (propKey == "ecCurveName") {
	    keyParams = propValue;
	}
	else if ((propKey == "keysize") || (propKey == "keySize")) {
	    keyParams = propValue;
	}
	else if (propKey == "subject") {
	    subject = propValue;
	}
	csrFormData += '    <input type=\"hidden\" name=\"' + propKey + '\" value=\'' + propValue + '\'> \n';
    } 
    // GenPKCS10CSR.logDebug("generatePKCS10CSR.js:doGenerateCRMFCSR(): csrFormData:\n" + csrFormData + "");

    var encodedCSRFormData = encodeURIComponent(csrFormData);
    // GenPKCS10CSR.logDebug("generatePKCS10CSR.js:doGenerateCRMFCSR(): encodedCSRFormData:\n" + encodedCSRFormData + "");

    var retVal = doGenerateCRMFCSRByForm(subject, keyType, keyParams, encodedCSRFormData);

    GenPKCS10CSR.logTrace("generatePKCS10CSR.js:doGenerateCRMFCSR(): ......End.");
}


function doGenerateCRMFCSRByForm(aSubject, aKeyType, aKeyParams, aCSRFormData)
{
    GenPKCS10CSR.logTrace("generatePKCS10CSR.js:doGenerateCRMFCSRByForm(): ......Start.");

    var pkiParams = null;
    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    try {
	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    } catch (ex) { }

    var argc = 0;
    var params = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
    			.createInstance(Components.interfaces.nsIDialogParamBlock);

    params.SetString(argc, aSubject); argc++;
    params.SetString(argc, aKeyType); argc++;
    params.SetString(argc, aKeyParams); argc++;
    params.SetString(argc, aCSRFormData); argc++;

    params.SetInt(0, argc);

    window.setCursor('wait');
    window.openDialog('chrome://keymanager/content/tools/genkeycsr/genKeyAndEnrollCertWithCRMFCSR.xul', "",
                    			'chrome,centerscreen,resizable,modal', params);
    window.setCursor('auto');

    var retVal = params.GetInt(0);
    GenPKCS10CSR.logDebug("generatePKCS10CSR.js: doGenerateCRMFCSRByForm(): retVal: " + retVal + "");

    if (retVal == 0) { // Selected Cancel or failed.
    	dialogParams.SetInt(0, 0);
    	// window.close();
    	return 0;
    }

    dialogParams.SetInt(0, 1);
    window.close();

    GenPKCS10CSR.logTrace("generatePKCS10CSR.js: doGenerateCRMFCSRByForm(): ......End.");
    return 1;
}
