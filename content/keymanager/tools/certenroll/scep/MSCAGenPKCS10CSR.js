/* @(#) $Id: MSCAGenPKCS10CSR.js,v 1.3 2012/10/07 17:20:10 subrata Exp $ */

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

if ((typeof avpki) == 'undefined') {
    var avpki = {};
    avpki.keymanager = {};
}
if ((typeof avpki.keymanager) == 'undefined') {
    avpki.keymanager = {};
}

avpki.keymanager.MSCAGenPKCS10CSR = {
    mLogEnabled : false,
    log : function(msg) 
    {
        if (!avpki.keymanager.MSCAGenPKCS10CSR.mLogEnabled) {
    	    return;
        }
        dump(msg + "\n");
    },

    trim : function (aStr) 
    {
	if (!aStr) {
	    return aStr;
	}
	var sInString = aStr.replace( /^\s+/g, "" ); // strip leading whitespace
	return sInString.replace( /\s+$/g, "" ); // strip trailing whitespace
    },

    viewX509Cert : function (/* nsIX509Cert */ aX509Cert)
    {
    	if (!aX509Cert) {
	    alert("null cert.");
	    return;
	}
    	// Un-comment the 'netscape.security....'  line if you are using this function in a dowloaded html/js file.
   	// Also, set  the 'signed.applets.codebase_principal_support' preferece to true (using about:config)

   	// show the cert using Certificate dialog
   	// For more info: http://mxr.mozilla.org/mozilla-central/source/security/manager/ssl/public/nsICertificateDialogs.idl
    	var cd = Components.classes["@mozilla.org/nsCertificateDialogs;1"]
                               .getService(Components.interfaces.nsICertificateDialogs);
   	cd.viewCert(window, aX509Cert);
    },

    findUserX509CertInBrowser : function(certISN)
    {
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.findUserX509CertInBrowser():.....................Start.");

	var userX509Cert = null;
	try {
	    avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.findUserX509CertInBrowser(): serialNumber: " + certISN.serialNumber + " issuerSubjectDN: " + certISN.issuerSubjectDN);
	    userX509Cert = avpki.keymanager.CertUtil.findUserCertByISNOrFingerprint(
				certISN.serialNumber,
				certISN.issuerSubjectDN,
				certISN.sha1FingerPrint,
				certISN.md5FingerPrint
				);
	} catch (ex) {
	}
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.findUserX509CertInBrowser(): userX509Cert: " + userX509Cert);

	// avpki.keymanager.MSCAGenPKCS10CSR.viewX509Cert(userX509Cert);

	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.findUserX509CertInBrowser():.....................End.");
	return userX509Cert;
    },

    getCertRequestFormElem : function(aPageBodyElem)
    {
    	var formElemList = aPageBodyElem.getElementsByTagName("form");
    	var formElem = formElemList[0];
	for (var i = 0; i < formElemList.length; i++) {
	    formElem = formElemList.item(i);
	    var formName = formElem.getAttribute("name");
	    avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.getCertRequestFormElem(): formElem[" + i + "].name: " + formElem.getAttribute("name"));
	}
    	formElem = formElemList.item(0);
	return formElem;
    },

    getViewCertTableElem : function(aPageBodyElem)
    {
    	var formElem = avpki.keymanager.MSCAGenPKCS10CSR.getViewCertTableElem(aPageBodyElem);
	if (!formElem) {
	    return null;
	}
    	var tableElem = formElem.getElementsByTagName("table")[0];
	return tableElem;
    },


    generatePKCS10CSR : function(ev)
    {
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.generatePKCS10CSR():.....................Start.");

        var genKeyCSRWizardURL = 'chrome://keymanager/content/tools/genkeycsr/GeneratePKCS10CSRWizard.xul';
        var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    				.createInstance(Components.interfaces.nsIPKIParamBlock);
        var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

	dialogParams.GetInt(0, 0);
        var genKeyCSRWizard = window.openDialog(
				genKeyCSRWizardURL,
  				'genpkcs10csr',
				'chrome,centerscreen,modal,resizable',
				dialogParams
				);
        var retVal = dialogParams.GetInt(0);
        if (retVal == 0) {
    	    return;
        }
        var base64PKCS10CSR = dialogParams.GetString(0);
	// avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.generatePKCS10CSR(): base64PKCS10CSR:\n" + base64PKCS10CSR + "\n");

	var locTaRequestElem = ev.target.ownerDocument.getElementById("locTaRequest");
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.generatePKCS10CSR(): locTaRequestElem: " + locTaRequestElem);
	locTaRequestElem.value =  base64PKCS10CSR;

	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.generatePKCS10CSR():.....................End.");
    },


    addCertOpButtons : function(aPageBodyElem)
    {
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.addCertOpButtons():.....................Start.");

	var certOpDivElem = null;
	var genCSRButtonElem = null;


	certOpDivElem = aPageBodyElem.ownerDocument.getElementById("certOpDiv");
	if (certOpDivElem) {
	    avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.addCertOpButtons():.....................End(0).");
	    return certOpDivElem;
	}

	/*
    	var certRequestFormElem = avpki.keymanager.MSCAGenPKCS10CSR.getCertRequestFormElem(aPageBodyElem);
	if (!certRequestFormElem) {
	    avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.addCertOpButtons():.....................End(1).");
	    return certOpDivElem;
	}
	*/

	// Insert before submit button
	// var parentNode = aPageBodyElem.ownerDocument.getElementById("locSubmitAlign");
	// var submitButtonElem = aPageBodyElem.ownerDocument.getElementById("btnSubmit");
	var locTaRequestElem = aPageBodyElem.ownerDocument.getElementById("locTaRequest");
	var parentNode = locTaRequestElem.parentNode;
	if (!parentNode) {
	    avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.addCertOpButtons():.....................End(2).");
	    return certOpDivElem;
	}

	certOpDivElem = aPageBodyElem.ownerDocument.createElement("div");
	certOpDivElem.setAttribute("id", "certOpDiv");
	// certOpDivElem = parentNode.appendChild(certOpDivElem);
	parentNode.insertBefore(certOpDivElem, locTaRequestElem.nextSibling);

	genCSRButtonElem = aPageBodyElem.ownerDocument.createElement("input");
	genCSRButtonElem.setAttribute("type", "button");
	genCSRButtonElem.setAttribute("id", "genPKCS10CSRButton");
	genCSRButtonElem.setAttribute("name", "genPKCS10CSRButton");
	genCSRButtonElem.setAttribute("value", "Generate PKCS#10 CSR");
	genCSRButtonElem.setAttribute("title", "Click this button to generate PKCS#10 CSR based on existing key-pair ot or new key-pair.");
	genCSRButtonElem = certOpDivElem.appendChild(genCSRButtonElem);
	genCSRButtonElem.addEventListener("click", function(ev) {
	    avpki.keymanager.MSCAGenPKCS10CSR.generatePKCS10CSR(ev);
	    if (ev) {
	    	ev.stopPropagation();
	    }
	    return false;
	}, false);


	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.addCertOpButtons():.....................End.");
	return certOpDivElem;
    },

    removeCertOpButtons : function(aPageBodyElem)
    {
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.removeCertOpButtons():.....................Start.");

	var certOpDivElem = aPageBodyElem.ownerDocument.getElementById("certOpDiv");
	if (!certOpDivElem) {
	    avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.removeCertOpButtons():.....................End.");
	    return;
	}
	var parentNode = certOpDivElem.parentNode;
	parentNode.removeChild(certOpDivElem);

	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.removeCertOpButtons():.....................End.");
    },

    displayGenCSRButton : function(aPageBodyElem)
    {
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.displayGenCSRButton():.....................Start.");
	var readyForCSRGen = false;

	var userX509Cert = null;
	do {
	    readyForCSRGen = true;
	    if (!readyForCSRGen) {
	    	break;
	    }
	    readyForCSRGen = true;
	} while (0);
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.displayGenCSRButton(): readyForCSRGen: " + readyForCSRGen);
	
	if (readyForCSRGen) {
	    avpki.keymanager.MSCAGenPKCS10CSR.addCertOpButtons(aPageBodyElem);
	}
	else {
	    avpki.keymanager.MSCAGenPKCS10CSR.removeCertOpButtons(aPageBodyElem);
	}

	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.displayGenCSRButton():.....................End.");
	return readyForCSRGen;
    },

    handlePageOnLoad : function(aPageBodyElem)
    {
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.handlePageOnLoad():.....................Start.");

	avpki.keymanager.MSCAGenPKCS10CSR.mPageBodyElem = aPageBodyElem;

	/*
    	var certRequestFormElem = avpki.keymanager.MSCAGenPKCS10CSR.getCertRequestFormElem(aPageBodyElem);
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.handlePageOnLoad(): certRequestFormElem: " + certRequestFormElem);
	avpki.keymanager.MSCAGenPKCS10CSR.mCertRequestFormElem = certRequestFormElem;
	*/

	var locTaRequestElem = aPageBodyElem.ownerDocument.getElementById("locTaRequest");
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.generatePKCS10CSR(): locTaRequestElem: " + locTaRequestElem);
	locTaRequestElem.value =  "";

	var readyForCSRGen = avpki.keymanager.MSCAGenPKCS10CSR.displayGenCSRButton(aPageBodyElem);

	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.handlePageOnLoad():.....................End.");
    },

    // initOnLoad : function(aWindowElem)
    initOnLoad : function(aPageBodyElem)
    {
	avpki.keymanager.MSCAGenPKCS10CSR.log("");
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.initOnLoad():.....................Start.");

	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.handlePageOnLoad(): aPageBodyElem: " + aPageBodyElem);
	var bodyElem = aPageBodyElem;
	/*
	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.handlePageOnLoad(): aWindowElem: " + aWindowElem);
	var bodyElem = aWindowElem.document.getElementsByTagName("body")[0];
	*/
	avpki.keymanager.MSCAGenPKCS10CSR.mPageBodyElem = bodyElem;

	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.handlePageOnLoad(): bodyElem: " + bodyElem);
	avpki.keymanager.MSCAGenPKCS10CSR.handlePageOnLoad(bodyElem);

	avpki.keymanager.MSCAGenPKCS10CSR.log("MSCAGenPKCS10CSR.initOnLoad():.....................End.");
    },

    lastMethod : function () 
    {
    }
};


