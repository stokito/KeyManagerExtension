/* @(#) $Id: signcerttoolToolbarOverlay.js,v 1.9 2012/10/03 14:20:42 subrata Exp $ */

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


if (typeof avpki == 'undefined') {
    avpki = {};
}
if (typeof avpki.keymanager == 'undefined') {
    avpki.keymanager = {};
}

avpki.keymanager.SignCertToolToolbarOverlay = {

    checkBinaryComponents : function ()
    {
    	if (!avpki.keymanager.KeyManagerToolbarOverlay.checkKMBinaryComponents()) {
	    return false;
	}
	return true;
    },

    getSignProxyCertTestDialogParams : function ()
    {
    	var windowName      = "Sign Prxoy Cert with Param Test";
    	var csrTmpFilePath  = "/tmp/KeyManager/CSRTmp/Tiger_pkcs10_csr_base64.p10";
    	var isCSRAsciiStr   = "true";
    	var isCertAsciiStr  = "true";
    	// var includeIssuerCertChainStr  = "false";
    	var includeIssuerCertChainStr  = "true";
    	var signerNickName = "Barak";
    	var proxyCommonName = "P11";
    	// var signedCertOutFilePath = "/tmp/KeyManager/CertTmp/" + proxyCommonName + "_" + signerNickName + "_x509_base64.cer";
    	var signedCertOutFilePath = "/tmp/KeyManager/CertTmp/JoeBiden_pkcs10_csr_base64.p10";

    	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    				.createInstance(Components.interfaces.nsIPKIParamBlock);
    	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

    	var signerX509Cert = null;
    	if (signerNickName) {
    	    var certdb = Components.classes["@mozilla.org/security/x509certdb;1"]
    			.getService(Components.interfaces.nsIX509CertDB);
	    try {
		signerX509Cert = certdb.findCertByNickname(null, signerNickName);
	    } catch (ex) {
    	    dump("signcerttoolOverlay.xul::getSignProxyCertTestDialogParams(): failed to find signer cert: " + signerNickName + " - ex: " + ex + "\n");
	    }
    	}
	// signerX509Cert = null;

	/*
    	dump("signcerttoolOverlay.xul::getSignProxyCertTestDialogParams(): " + "\n" + 
    			"\t" + "windowName: "		+ windowName + "\n" + 
    			"\t" + "csrTmpFilePath: "	+ csrTmpFilePath + " " + 
    			"isCSRAsciiStr: "	+ isCSRAsciiStr + "\n" + 
    			"\t" + "proxyCommonName: "	+ proxyCommonName + " " + 
    			"signerNickName: "	+ signerNickName + " " + 
    			"signerX509Cert: "	+ signerX509Cert + "\n" + 
    			"\t" + "signedCertOutFilePath: "	+ signedCertOutFilePath + " " + 
    			"isCertAsciiStr: "	+ isCertAsciiStr + "\n" + 
    			"includeIssuerCertChainStr: "	+ includeIssuerCertChainStr + "\n" + 
			"\n");
	*/

    	var paramStrCnt = 0;
    	dialogParams.SetString(paramStrCnt, windowName); paramStrCnt++;
    	dialogParams.SetString(paramStrCnt, csrTmpFilePath); paramStrCnt++;
    	dialogParams.SetString(paramStrCnt, isCSRAsciiStr); paramStrCnt++;
    	dialogParams.SetString(paramStrCnt, proxyCommonName); paramStrCnt++;
    	dialogParams.SetString(paramStrCnt, signedCertOutFilePath); paramStrCnt++;
    	dialogParams.SetString(paramStrCnt, isCertAsciiStr); paramStrCnt++;
    	dialogParams.SetString(paramStrCnt, includeIssuerCertChainStr); paramStrCnt++;
    	// dialogParams.SetNumberStrings(paramStrCnt);
	
    	pkiParams.setISupportAtIndex(1, null); // Hack to avoid NULL pointer in the get phase
    	if (signerX509Cert) {
    	    // dialogParams.SetInt(0, numcerts);
    	    pkiParams.setISupportAtIndex(1, signerX509Cert);
    	}
    	return pkiParams;
    },

    runSignProxyCertTool : function ()
    {
	if (!avpki.keymanager.SignCertToolToolbarOverlay.checkBinaryComponents()) {
	    return;
	}

	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();

	var signProxyCertDialogParams = null;
    	// signProxyCertDialogParams = avpki.keymanager.SignCertToolToolbarOverlay.getSignProxyCertTestDialogParams();
        if (signProxyCertDialogParams) {
    	    var signProxyCertTestDialogURL = 'chrome://keymanager/content/tools/signcerttool/signProxyCertDialogTool.xul';
    	    window.openDialog(
    		    signProxyCertTestDialogURL,
		    '_blank',
		    'chrome,centerscreen,resizable,dialog=no,titlebar',
		    signProxyCertDialogParams
		    );
    	    return;
        }

        //check for an existing SignPrxoycert window and focus it; it's not application modal
        const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
        var lastSignProxtCert = kWindowMediator.getMostRecentWindow("avaya:signproxycert");
        if (lastSignProxtCert) {
            lastSignProxtCert.focus();
	    return;
        }

        var numcerts = 0;
        var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    			    .createInstance(Components.interfaces.nsIPKIParamBlock);
        var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

        dialogParams.SetInt(0, numcerts);
        dialogParams.SetString(0, "signProxyCert");
        pkiParams.setISupportAtIndex(1, null); // Hack to avoid NULL pointer in the get phase

        var signProxyCertDialogURL = "chrome://keymanager/content/tools/signcerttool/signProxyCertTool.xul";
	window.setCursor('wait');
        window.openDialog(
		signProxyCertDialogURL,
		'signproxycertwin',
		'chrome,centerscreen,resizable=yes,dialog=no,titlebar',
		dialogParams
		);
	window.setCursor('auto');
    },

    runSignCertAsCATool : function ()
    {
	if (!avpki.keymanager.SignCertToolToolbarOverlay.checkBinaryComponents()) {
	    return;
	}

	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();

        //check for an existing KeyManger window and focus it; it's not application modal
        const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
        var lastSignProxtCert = kWindowMediator.getMostRecentWindow("avaya:signcertasca");
        if (lastSignProxtCert) {
            lastSignProxtCert.focus();
	    return;
        }

        var numcerts = 0;
        var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    			.createInstance(Components.interfaces.nsIPKIParamBlock);
        var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

        dialogParams.SetInt(0, numcerts);
        dialogParams.SetString(0, "signCert");
        pkiParams.setISupportAtIndex(1, null); // Hack to avoid NULL pointer in the get phase

        var signCertAsCADialogURL = "chrome://keymanager/content/tools/signcerttool/signCertByCATool.xul";

        window.openDialog(
		signCertAsCADialogURL,
		'signascacertwin',
		'chrome,centerscreen,resizable=yes,dialog=no,titlebar',
		dialogParams
		);
    },

    openCRLManager : function () 
    {
	// dump("SignCertToolToolbarOverlay.openCRLManager():................Start.\n");

	/*
	if (!avpki.keymanager.SignCertToolToolbarOverlay.checkBinaryComponents()) {
	    return;
	}
	*/


        // check for an existing CRLMnager window and focus it; it's not application modal
        const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
        var lastCrlManager = kWindowMediator.getMostRecentWindow("mozilla:crlmanager");
        if (lastCrlManager) {
            lastCrlManager.focus();
	    return;
	}
        window.open(
		'chrome://pippki/content/crlManager.xul',
		"crlmgrwin",
		'chrome,centerscreen,resizable'
		);

	// dump("SignCertToolToolbarOverlay.openCRLManager():................End.\n");
    },

    lastMethod : function ()
    {
    }

}
