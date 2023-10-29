/* @(#) $Id: signProxyCertTool.js,v 1.12 2011/02/04 18:55:02 subrata Exp $ */

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

var gX509v3CertElem;

function onLoadInitSignProxyCertForm()
{
    // dump("signProxyCertTool.js::onLoadInitSignProxyCertForm(): ................Start.\n");

    gX509v3CertElem = document.getElementById('keymgr.signProxyCert.form.param');
    initSignCertForm(true);

    // dump("signProxyCertTool.js::onLoadInitSignProxyCertForm(): ................End.\n");
}

function onLoadInitSignCertByCAForm()
{
    // dump("signProxyCertTool.js::onLoadInitSignCertByCAForm(): ................Start.\n");

    gX509v3CertElem = document.getElementById('keymgr.signCert.ca.form');
    initSignCertForm(false);

    // dump("signProxyCertTool.js::onLoadInitSignCertByCAForm(): ................End.\n");
}

function initSignCertForm(aIsProxySigner)
{
    // dump("signProxyCertTool.js::initSignCertForm(): ................Start.\n");

    var pkiParams = null;
    var dialogParams = null;
    if (window.arguments && window.arguments[0]) {
    	dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    	} catch (ex) { }
    }

    var paramCert = null;
    var numberOfCerts = dialogParams.GetInt(0);
    var isProxyCert = dialogParams.GetInt(1);
    var signingType = dialogParams.GetString(0);

    /*
    dump("signProxyCertTool.js::initSignCertForm(): " + 
    			" signingType: " + signingType +
    			" aIsProxySigner: " + aIsProxySigner +
    			" numberOfCerts: " + numberOfCerts +
			".\n");
    */

    var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"].
    			getService(Components.interfaces.nsIX509CertDB);
    var /* nsIX509Cert */ selectedSignerCert = null;
    if (numberOfCerts) {
        // var dbKey = dialogParams.GetString(1);
        // selectedSignerCert = xcertdb.findCertByDBKey(dbKey, null);

	paramCert = null;
	if (pkiParams) {
	    paramCert = pkiParams.getISupportAtIndex(1);
	}

	if (paramCert) {
	    selectedSignerCert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	}
	// If the X.509 vert is not provided, then look for the dbKey for the cert.
	if (!selectedSignerCert) {
            var dbKey = dialogParams.GetString(1);
	    if (dbKey) {
            	selectedSignerCert = xcertdb.findCertByDBKey(dbKey , null);
	    }
	}
	/*
	if (selectedSignerCert) {
    	    dump("signProxyCertTool.js::initSignCertForm(): selectedSignerCert: " + selectedSignerCert.nickname + "\n");
	}
	*/
    }
    // dump("signProxyCertTool.js::initSignCertForm(): ................10.\n");

    var csrDataSourceObj = null;
    if (pkiParams) {
    	csrDataSourceObj = pkiParams.getISupportAtIndex(2);
    }
    
    // dump("signProxyCertTool.js::initSignCertForm(): csrDataSourceObj: " + csrDataSourceObj + "\n");

    if (aIsProxySigner) {
    	gX509v3CertElem.initForSignedProxyCert(selectedSignerCert, csrDataSourceObj);
    }
    else {
    	gX509v3CertElem.initForCASignedCert(selectedSignerCert, csrDataSourceObj);
    }

    // dump("signProxyCertTool.js::initSignCertForm(): ................End.\n");
}

function onLoadInitCASignedCertDialogWithParam()
{

    dump("signProxyCertTool.js::onLoadInitCASignedCertDialogWithParam(): ................Start.\n");
    dump("signProxyCertTool.js:: NOTE: *** This method should be INVOKED FROM signCertByCAToolDialog.xul only *****\n");

    gX509v3CertElem = document.getElementById('keymgr.signCert.ca.form.dialog');

    if (!window.arguments && window.arguments[0]) {
    	// dump("signProxyCertTool.js::onLoadInitCASignedCertDialogWithParam(): ................End(0).\n");
    	return;
    }

    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    if (!dialogParams) {
    	return;
    }

    var pkiParams = null;
    try {
    	pkiParams = window.arguments[0].QueryInterface(Components.interfaces.nsIPKIParamBlock);
    } catch (ex) { }

    var windowName	= dialogParams.GetString(0);
    var csrTmpFilePath	= dialogParams.GetString(1);
    var isCSRAsciiStr	= dialogParams.GetString(2);
    var certTmpFilePath	= dialogParams.GetString(3);
    var isCertAsciiStr	= dialogParams.GetString(4);
    var includeIssuerCertChainStr	= dialogParams.GetString(5);

    var signerX509Cert = null;
    if (pkiParams) {
    	dump("signProxyCertTool.js::onLoadInitCASignedCertDialogWithParam(): ................10.\n");
	var paramCert = pkiParams.getISupportAtIndex(1);
	if (paramCert) {
	    signerX509Cert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	}
    }
    dump("signProxyCertTool.js::onLoadInitCASignedCertDialogWithParam(): signerX509Cert: " + signerX509Cert + "\n");

    var isCSRAscii = false;
    if (isCSRAsciiStr && (isCSRAsciiStr == "true")) {
    	isCSRAscii = true;
    }
    var isCertAscii = false;
    if (isCertAsciiStr && (isCertAsciiStr == "true")) {
    	isCertAscii = true;
    }
    var includeIssuerCertChain = false;
    if (includeIssuerCertChainStr && (includeIssuerCertChainStr == "true")) {
    	includeIssuerCertChain = true;
    }
    dump("signProxyCertTool.js::onLoadInitCASignedCertDialogWithParam(): ................20.\n");

    var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"]
    			.getService(Components.interfaces.nsIX509CertDB);
    var signerCert = signerX509Cert;
    /*
    if (!signerX509Cert && signerCertDbKey) {
        signerX509Cert = xcertdb.findCertByDBKey(signerCertDbKey, null);
    }
    */
    dump("onLoadInitCASignedCertDialogWithParam():" + 
    				"    windowName: " + windowName + " " + "\n" + 
    				"    csrTmpFilePath: " + csrTmpFilePath + " " +"\n" +  
    				"    isCSRAsciiStr: " + isCSRAsciiStr + " " + "\n" + 
    				"    isCSRAscii: " + isCSRAscii + " " + "\n" + 
    				"    certTmpFilePath: " + certTmpFilePath + " " + "\n" + 
    				"    isCertAsciiStr: " + isCertAsciiStr + " " + "\n" + 
    				"    isCertAscii: " + isCertAscii + " " + "\n" + 
    				"    includeIssuerCertChain: " + includeIssuerCertChain + " " + "\n" + 
    				"    signerX509Cert: " + ((signerX509Cert)?signerX509Cert.nickname:"") + " " + "\n" + 
				"\n");
    /*
    */
    dump("signProxyCertTool.js::onLoadInitCASignedCertDialogWithParam(): ................30.\n");

    gX509v3CertElem.initForCASignedCertWithCSRFile(
    		signerX509Cert,
		csrTmpFilePath, isCSRAscii,
		certTmpFilePath, isCertAscii, includeIssuerCertChain
		);
    // var signOtherCertParamsElem = gX509v3CertElem.signCertParams;
    // signOtherCertParamsElem.saveSignedCert = true;
    // signOtherCertParamsElem.includeIssuerCertChain = includeIssuerCertChain;

    dump("signProxyCertTool.js::onLoadInitCASignedCertDialogWithParam(): ................End.\n");
}


function initSignProxyCSRWithData()
{
    initSignProxyCSRFormDialogWithParam();
}

function initSignProxyCSRFormDialogWithParam()
{

    dump("signProxyCertTool.js::initSignProxyCSRFormDialogWithParam(): ................Start.\n");
    dump("signProxyCertTool.js:: NOTE: *** This method should be INVOKED FROM signProxyCertDialogTool.xul only *****\n");

    gX509v3CertElem = document.getElementById('keymgr.signProxyCert.proxy.form.dialog.param');

    if (!window.arguments && window.arguments[0]) {
    	// dump("signProxyCertTool.js::initSignProxyCSRFormDialogWithParam(): ................End(0).\n");
    	return;
    }

    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    var pkiParams = null;
    try {
    	pkiParams = window.arguments[0].QueryInterface(Components.interfaces.nsIPKIParamBlock);
    } catch (ex) { }

    var windowName	= dialogParams.GetString(0);
    var csrTmpFilePath	= dialogParams.GetString(1);
    var isCSRAsciiStr	= dialogParams.GetString(2);
    var proxyCommonName	= dialogParams.GetString(3);
    var certTmpFilePath	= dialogParams.GetString(4);
    var isCertAsciiStr	= dialogParams.GetString(5);
    var includeIssuerCertChainStr	= dialogParams.GetString(6);
    var signerX509Cert = null;
    if (pkiParams) {
    	dump("signProxyCertTool.js::initSignProxyCSRFormDialogWithParam(): ................10.\n");
	var paramCert = pkiParams.getISupportAtIndex(1);
	if (paramCert) {
	    signerX509Cert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	}
    }
    // dump("signProxyCertTool.js::initSignProxyCSRFormDialogWithParam(): signerX509Cert: " + signerX509Cert + "\n");

    var isCSRAscii = false;
    if (isCSRAsciiStr && (isCSRAsciiStr == "true")) {
    	isCSRAscii = true;
    }
    var isCertAscii = false;
    if (isCertAsciiStr && (isCertAsciiStr == "true")) {
    	isCertAscii = true;
    }
    var includeIssuerCertChain = false;
    if (includeIssuerCertChainStr && (includeIssuerCertChainStr == "true")) {
    	includeIssuerCertChain = true;
    }

    if (proxyCommonName == null) {
    	proxyCommonName = "";
    }
    var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"]
    			.getService(Components.interfaces.nsIX509CertDB);
    var signerCert = signerX509Cert;
    /*
    if (!signerX509Cert && signerCertDbKey) {
        signerX509Cert = xcertdb.findCertByDBKey(signerCertDbKey, null);
    }
    */
    /*
    dump("initSignProxyCSRFormDialogWithParam():" + 
    				"    windowName: " + windowName + " " + "\n" + 
    				"    csrTmpFilePath: " + csrTmpFilePath + " " +"\n" +  
    				"    isCSRAsciiStr: " + isCSRAsciiStr + " " + "\n" + 
    				"    isCSRAscii: " + isCSRAscii + " " + "\n" + 
    				"    proxyCommonName: " + proxyCommonName + " " + "\n" + 
    				"    certTmpFilePath: " + certTmpFilePath + " " + "\n" + 
    				"    isCertAsciiStr: " + isCertAsciiStr + " " + "\n" + 
    				"    isCertAscii: " + isCertAscii + " " + "\n" + 
    				"    includeIssuerCertChain: " + includeIssuerCertChain + " " + "\n" + 
    				"    signerX509Cert: " + ((signerX509Cert)?signerX509Cert.nickname:"") + " " + "\n" + 
				"\n");
    */
    // dump("signProxyCertTool.js::initSignProxyCSRFormDialogWithParam(): ................20.\n");

    gX509v3CertElem.initForSignedProxyCertWithCSRFile(
    		signerX509Cert,
		csrTmpFilePath, isCSRAscii,
		proxyCommonName,
		certTmpFilePath, isCertAscii, includeIssuerCertChain
		);
    // var signOtherCertParamsElem = gX509v3CertElem.signCertParams;
    // signOtherCertParamsElem.saveSignedCert = true;
    // signOtherCertParamsElem.includeIssuerCertChain = includeIssuerCertChain;

    dump("signProxyCertTool.js::initSignProxyCSRFormDialogWithParam(): ................End.\n");
}

function onLoad()
{

}

function onClose()
{
}

function signCertUsingCSR()
{
    dump("signProxyCertTool.js.signCertUsingCSR(): .............Start.\n");

    var signOtherCertParamsElem = gX509v3CertElem.signCertParams;

    var selectedPkcs10CSR = signOtherCertParamsElem.pkcs10CSR;
    if (!selectedPkcs10CSR) {
    	alert("NO PKCS#10 CSR data is avaialble.\n");
    	dump("signProxyCertTool.js.signCertUsingCSR(): NO PKCS#10 CSR data is avaialble.\n");
    	return;
    }


    var selectedSignerCert = signOtherCertParamsElem.signerCert;
    if (!selectedSignerCert) {
    	alert("NO Signer Cert is selected.\n");
    	dump("signProxyCertTool.js.signCertUsingCSR(): NO Signer Cert is selected.\n");
    	return;
    }

    if (signOtherCertParamsElem.isproxysigning) {
    	var commonName = signOtherCertParamsElem.proxyCommonName;
	if (commonName == "") {
	    alert("Common name for proxy cert is missing - it must be provided.");
	    dump("signProxyCertTool.js.signCertUsingCSR(): Common name for proxy cert is missing - you must provide one.\n");
	    return;
	}
    }

    var pkiParams = null;
    var dialogParams = null;
    if (window.arguments && window.arguments[0]) {
        dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
        try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
        } catch (ex) { }
    }

    var propKey;
    var propValue;
    var propOldValue;
    var trueValue = "true";
    // retrieve the cert properties and extension of the selected cert
    var aCertProps = Components.classes["@mozilla.org/persistent-properties;1"].
			createInstance(Components.interfaces.nsIPersistentProperties);
    gX509v3CertElem.toCertProps(aCertProps);
    // gX509v3CertElem.dumpProperties(aCertProps, "signProxyCertTool.js.signCertUsingCSR.aCertProps");


    var isImportSignedCert = signOtherCertParamsElem.importSignedCert;
    // if (proxyImportSignedCertElem.checked) {
    if (isImportSignedCert) {
    	propKey = "importCert"; propOldValue = aCertProps.setStringProperty(propKey, trueValue);
	if (signOtherCertParamsElem.isproxysigning) {
	    // User's proxy-certs are always valid and trusted peer
	    var certTrusts = "P,P,P";
	    propValue = certTrusts;
    	    propKey = "trustArgs"; propOldValue = aCertProps.setStringProperty(propKey, propValue);
	}
    }

    var keyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);
    var /* nsIX509Cert */ signedDbCert = null;
    try {
        signedDbCert = keyManager.signCertByCertReq(
				selectedPkcs10CSR,
				selectedSignerCert,
				aCertProps
				);
	// dump("signProxyCertTool.js.signCertUsingCSR(): signedDbCert: " + signedDbCert + "\n");
	signOtherCertParamsElem.signedCert = signedDbCert;

	/*
	dump("signProxyCertTool.js.signCertUsingCSR(): " + 
			"outcertfile: " + signOtherCertParamsElem.outcertfile + " " + 
			"outcertfilepath: " + signOtherCertParamsElem.outcertfilepath + " " + 
			"outcertfilebase64: " + signOtherCertParamsElem.outcertfilebase64 + " " + 
			"includeIssuerCertChain: " + signOtherCertParamsElem.includeIssuerCertChain + " " + 
			"\n");
	 */
	if (signOtherCertParamsElem.saveSignedCert) {
	if (signOtherCertParamsElem.includeIssuerCertChain) {
	    if (signOtherCertParamsElem.outcertfilebase64) {
    		// dump("signProxyCertTool.js.signCertUsingCSR(): ....................70.\n");
	    	keyManager.exportCertWithIssuerToFileByX509Cert(
				signedDbCert,
				true,
				signOtherCertParamsElem.outcertfilebase64,
				signOtherCertParamsElem.outcertfile.file
				);
	    }
	    else {
    		// dump("signProxyCertTool.js.signCertUsingCSR(): ....................72.\n");
		keyManager.exportPKCS7CertWithIssuerToFileByX509Cert(
				signedDbCert,
				true,
				signOtherCertParamsElem.outcertfilebase64,
				signOtherCertParamsElem.outcertfile.file
				);
	    }
	}
	else {
    	    // dump("signProxyCertTool.js.signCertUsingCSR(): ....................76.\n");
            keyManager.exportCertToFileByX509Cert(
				signedDbCert,
				signOtherCertParamsElem.outcertfilebase64,
				signOtherCertParamsElem.outcertfile.file
				);
	}
        signOtherCertParamsElem.outcertfile.refresh();
	}
    } catch (ex) {
    	dump("signProxyCertTool.js.signCertUsingCSR(): " + ex + "\n");
	alert("signProxyCertTool.js.signCertUsingCSR() failed - " + ex);

	if (dialogParams) {
    	    dialogParams.SetInt(0, 0);
	}
    	// window.close();
	return;
    }

    if (signOtherCertParamsElem.saveSignedCert) {
	var certOutFile = signOtherCertParamsElem.outcertfile.file;
    	// dump("Signed Cert is exported to file: " + certOutFile.path + " size: " + certOutFile.fileSize + "\n");
    	var certOutBase64Data = "";
    	if (signOtherCertParamsElem.outcertfile.ascii) {
            certOutBase64Data = signOtherCertParamsElem.outcertfile.readFile();
    	}
    	signOtherCertParamsElem.signedcertbase64data = certOutBase64Data;
    }

    // Display the close button  and hide the sign/cancel button
    var signCSRButton = document.getElementById("SignCSRButton");
    var closeCSRButton = document.getElementById("CloseCSRButton");
    var cancelButton = document.getElementById("CancelButton");
    signCSRButton.hidden = true;
    cancelButton.hidden = true;
    closeCSRButton.hidden = false;
    
    // we are done - disable all the input controls.
    signOtherCertParamsElem.readonly = true;

    gX509v3CertElem.showBasicCSRForm();


    dump("signProxyCertTool.js.signCertUsingCSR(): ................End.\n");
}

function cancelSignCSR()
{
    if (window.arguments && window.arguments[0]) {
        var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	dialogParams.SetInt(0, 0);
    }
    window.close();
}

function closeCSR()
{
    var signCSRButton = document.getElementById("SignCSRButton");
    var closeCSRButton = document.getElementById("CloseCSRButton");
    var cancelButton = document.getElementById("CancelButton");

    signCSRButton.hidden = false;
    cancelButton.hidden = false;
    closeCSRButton.hidden = true;

    if (window.arguments && window.arguments[0]) {
        var pkiParams = null;
        var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
        try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
        } catch (ex) { }

        dialogParams.SetInt(0, 1);

    	var signOtherCertParamsElem = gX509v3CertElem.signCertParams;
	var signedCert = signOtherCertParamsElem.signedCert;
        // dump("signProxyCertTool.js.signCertUsingCSR(): signedCert: " + signedCert + "\n");
        if (signedCert) {
    	    dialogParams.SetInt(1, 1);
	    if (pkiParams) {
    	        pkiParams.setISupportAtIndex(1, signedCert);
	    }
        }
    }
    window.close();
}

