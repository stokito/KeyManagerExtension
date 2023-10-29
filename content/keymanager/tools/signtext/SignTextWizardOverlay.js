/* @(#) $Id: SignTextWizardOverlay.js,v 1.4 2010/12/24 20:04:36 subrata Exp $ */

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
 *     Subrata Mazumdar, Avaya Labs Research, Avaya Inc.
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



var SignTextWizardOverlay = {

    mWizardInitalized		: false,

    mWizardElem			: null,
    mWizardInitDone		: false,
    mWizardButtonNextElem	: null,
    mWizardButtonNextOrigElem	: null,

    mTestMode 			: false,

    handleTextboxChange : function (aTextboxElem, ev) 
    {
    	SignTextWizard.logTrace("SignTextWizardOverlay.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = SignTextWizard.trim(aTextboxElem.value);
	}

    	SignTextWizard.logTrace("SignTextWizardOverlay.handleTextboxChange():................End.");
    },

    initOnLoad : function (aWizardElem) 
    {
    	SignTextWizard.logTrace("SignTextWizardOverlay.initOnLoad():................Start.");

        if (SignTextWizardOverlay.mWizardInitDone) {
    	    return;
        }
        SignTextWizardOverlay.mWizardInitDone = true;

        SignTextWizard.mWizardElem = aWizardElem;
        SignTextWizardOverlay.mWizardButtonNextElem = SignTextWizard.mWizardElem.getButton("next");
        SignTextWizardOverlay.mWizardButtonNextOrigElem = SignTextWizardOverlay.mWizardButtonNextElem.label;

    	SignTextWizard.logTrace("SignTextWizardOverlay.initOnLoad():................End.");
    },

    signPageShow : function (aWizardPageElem) 
    {
        SignTextWizard.logTrace("signPageShow():................Start.");

        // SignTextWizard.mWizardElem.canAdvance = false;

        // var pageUserNextElem = document.getElementById("keymgr.signtext.doc.sign.next");
        // SignTextWizardOverlay.mWizardButtonNextElem.label = pageUserNextElem.value;
        var nextLabel = aWizardPageElem.getAttribute("nextlabel");
        if (nextLabel) {
    	    SignTextWizardOverlay.mWizardButtonNextElem.label = nextLabel;
        }

        if (SignTextWizard.mWizardElem.firstStep) {
    	    aWizardPageElem.firstStep = true;
        }

        var inTxtFilePickerElem = document.getElementById('keymgr.signtext.doc.unsigned.file.path');
        inTxtFilePickerElem.txtdoc = null;

        var inTxtFilePickerRowElem = document.getElementById('keymgr.signtext.doc.unsigned.file.row');
        if (!SignTextWizard.mWizardElem.firstStep && !SignTextWizard.mWizardElem.saveInFile) {
	    inTxtFilePickerRowElem.hidden = true;
        }
        else {
            if (aWizardPageElem.filepath) {
                inTxtFilePickerElem.filepath = aWizardPageElem.filepath;
            }
	    inTxtFilePickerRowElem.hidden = false;
        }
        if (SignTextWizard.mWizardElem.firstStep) {
    	    inTxtFilePickerElem.removeAttribute("browsehidden");
    	    inTxtFilePickerElem.removeAttribute("readonly");
        }
        else {
    	    inTxtFilePickerElem.setAttribute("browsehidden", true);
    	    inTxtFilePickerElem.setAttribute("readonly", true);
        }

        if (aWizardPageElem.txtdoc) {
    	    inTxtFilePickerElem.txtdoc = aWizardPageElem.txtdoc;
        }

        var outTxtFilePickerRowElem = document.getElementById("keymgr.signtext.doc.signed.file.row");
        // if (SignTextWizard.mWizardElem.saveInFile || aWizardPageElem.lastStep) {
        if (SignTextWizard.mWizardElem.saveInFile) {
    	    outTxtFilePickerRowElem.hidden = false;
        }
        else {
	    outTxtFilePickerRowElem.hidden = true;
        }

        SignTextWizardOverlay.handleSignInTxtFilePathChange(inTxtFilePickerElem);

        SignTextWizard.mWizardElem.firstStep = false;
        SignTextWizard.logTrace("signPageShow():................End.");
        return true;
    },


    handleSignInTxtFilePathChange : function (aFilePickerElem, ev) 
    {
        SignTextWizard.logTrace("handleSignInTxtFilePathChange():................Start.");

        // SignTextWizard.logTrace("handleSignInTxtFilePathChange(): ev: " + ev + "");
        if (ev) {
	    aFilePickerElem.txtdoc = null; // Force the parsing of newly choosen XML file 
            if ((aFilePickerElem.value == "") || !aFilePickerElem.file) {
    	        SignTextWizard.logTrace("handleSignInTxtFilePathChange():................10.");
    	        SignTextWizard.mWizardElem.canAdvance = false;
    	        return false;
            }
        }

        var unsignedTxtDoc = aFilePickerElem.txtdoc;
        SignTextWizard.logTrace("handleSignInTxtFilePathChange(): unsignedTxtDoc: " + unsignedTxtDoc + "");
        if (!unsignedTxtDoc) {
	    if (!aFilePickerElem.file) {
    	        SignTextWizard.mWizardElem.canAdvance = false;
	        return false;
	    }

    	    unsignedTxtDoc = aFilePickerElem.readData();
    	    if (!unsignedTxtDoc) {
    	        SignTextWizard.logTrace("handleSignInTxtFilePathChange(): aFilePickerElem.readData() failed.");
    	        SignTextWizard.mWizardElem.canAdvance = false;
	        return false;
    	    }
        }

        if (ev) {
    	    SignTextWizard.mWizardElem.currentPage.txtdoc = unsignedTxtDoc;
    	    SignTextWizard.mWizardElem.currentPage.filepath = aFilePickerElem.filepath;
        }

        var outTxtFilePickerElem = document.getElementById("keymgr.signtext.doc.signed.file.path");
        // if (!SignTextWizard.mWizardElem.saveInFile && !SignTextWizard.mWizardElem.currentPage.lastStep) {
        if (!SignTextWizard.mWizardElem.saveInFile) {
    	    SignTextWizard.mWizardElem.canAdvance = true;
	    outTxtFilePickerElem.hidden = true;
    	    return true;
        }
        outTxtFilePickerElem.hidden = false;

        if ((outTxtFilePickerElem.value != "") && outTxtFilePickerElem.file) {
    	    SignTextWizard.mWizardElem.canAdvance = true;
    	    // SignTextWizard.logTrace("handleSignInTxtFilePathChange():................20.");
    	    return true;
        }
    
        var inTxtFile = aFilePickerElem.file;
        var outTxtFileName = "Signed_" + inTxtFile.leafName;
        // SignTextWizard.logTrace("handleSignInTxtFilePathChange(): outTxtFileName: " + outTxtFileName + "");
    
        var outTxtFileDir = inTxtFile.parent; 
        outTxtFilePickerElem.autoSelectFile(outTxtFileDir, outTxtFileName);
    
        SignTextWizardOverlay.handleSignOutTxtFilePathChange(outTxtFilePickerElem);
    
        // SignTextWizard.logTrace("handleSignInTxtFilePathChange(): outTxtFilePath: " + outTxtFilePickerElem.value + "");
    
    
        SignTextWizard.logTrace("handleSignInTxtFilePathChange():................End.");
        return true;
    },

    handleSignerCACertFilterOptionChange : function (aSignerCACertFilterOptionElem, ev) 
    {
        SignTextWizard.logTrace("handleSignerCACertFilterOptionChange():................Start.");

        var signerCACertPickerElem = document.getElementById("keymgr.signtext.doc.unsigned.signer.cacertpicker");
	signerCACertPickerElem.hidden = !aSignerCACertFilterOptionElem.checked;

        SignTextWizard.logTrace("handleSignerCACertFilterOptionChange():................End.");
    },

    handleSignerCACertPickerChange : function (aSignerCACertPickerElem, ev) 
    {
        SignTextWizard.logTrace("handleSignerCACertPickerChange():................Start.");
	var selectedCert = aSignerCACertPickerElem.selectedCert;
	if (selectedCert) {
            SignTextWizard.logDebug("handleSignerCACertPickerChange(): selectedCert.nickname: " + selectedCert);
	}

        SignTextWizard.logTrace("handleSignerCACertPickerChange():................End.");
    },


        // SignTextWizard.logTrace("handleSignInTxtFilePathChange(): ev: " + ev + "");
    handleUnsignedTxtDocChange : function (ev) 
    {
        var signedFilePickerElem = ev.target;
        SignTextWizard.logTrace("handleSignInTxtDocChange(): signedFilePickerElem: " + signedFilePickerElem + "");
        SignTextWizardOverlay.handleSignInTxtFilePathChange(signedFilePickerElem, ev);
    },

    handleSignOutTxtFilePathChange : function (aFilePickerElem, ev) 
    {
        if ((aFilePickerElem.value != "") && aFilePickerElem.file) {
    	    SignTextWizard.mWizardElem.canAdvance = true;
        }
        else {
    	    SignTextWizard.mWizardElem.canAdvance = false;
        }
    },

    handleSignedTxtDocChange : function (ev) 
    {
        var filePickerElem = ev.target;
        SignTextWizardOverlay.handleSignOutTxtFilePathChange(filePickerElem, ev);
    },

    signPageAdvanced : function (aWizardPageElem) 
    {
        SignTextWizard.logTrace("signPageAdvanced():................Start.");

	// var unsignedTxtDoc = inTxtFilePickerElem.readData();
	var unsignedTxtDoc = SignTextWizard.mWizardElem.currentPage.txtdoc;

        var signerCACertFilterElem = document.getElementById("keymgr.signtext.doc.unsigned.signer.cafilter");
        var signerCACertPickerElem = document.getElementById("keymgr.signtext.doc.unsigned.signer.cacertpicker");

	var caSubjectName = null;
	if (signerCACertFilterElem.checked) {
	    var signerCASelectedCert = signerCACertPickerElem.selectedCert;
	    if (signerCASelectedCert) {
	    	caSubjectName = signerCASelectedCert.subjectName;
	    }
	}
        SignTextWizard.logDebug("signPageAdvanced(): caSubjectName: |" + caSubjectName + "|");

	var signedTxtDoc = null;
	try {
	    if (caSubjectName) {
	    	signedTxtDoc = window.crypto.signText(unsignedTxtDoc, "ask", caSubjectName);  
	    } 
	    else {
	    	signedTxtDoc = window.crypto.signText(unsignedTxtDoc, "ask");  
	    }
	} catch (ex) {
            SignTextWizard.logError("signPageAdvanced(): window.crypto.signText() failed - ex: " + ex);
            alert("window.crypto.signText() failed. - ex: " + ex);
            SignTextWizard.logTrace("signPageAdvanced():................End(0).");
	    return false;
	}
	if (signedTxtDoc.indexOf("error:") >= 0) {
            SignTextWizard.logError("signPageAdvanced(): window.crypto.signText() failed - ex: " + signedTxtDoc);
            alert("window.crypto.signText() failed. - ex: " + signedTxtDoc);
            SignTextWizard.logTrace("signPageAdvanced():................End(1).");
	    return false;
	}
        SignTextWizard.logDebug("signPageAdvanced(): signedTxtDoc:\n" + signedTxtDoc);

        var nextPageElem = SignTextWizard.mWizardElem.getPageById(aWizardPageElem.next);
        nextPageElem.txtdoc = signedTxtDoc;

        try {
    	    // if (SignTextWizard.mWizardElem.saveInFile || aWizardPageElem.lastStep) {
    	    if (SignTextWizard.mWizardElem.saveInFile) {
    	        var outTxtFilePickerElem = document.getElementById('keymgr.signtext.doc.signed.file.path');
    	        var /*nsIFile*/ signOutTxtDocFile  = outTxtFilePickerElem.file;
		outTxtFilePickerElem.saveData(signedTxtDoc);
    	        outTxtFilePickerElem.txtdoc = signedTxtDoc;
    	        nextPageElem.filepath = outTxtFilePickerElem.filepath;
	    }
        } catch (ex) {
    	    SignTextWizard.logError("signPageAdvanced(): outTxtFilePickerElem.saveData() failed - ex: " + ex + "");
    	    return false;
        }

        SignTextWizardOverlay.mWizardButtonNextElem.label = SignTextWizardOverlay.mWizardButtonNextOrigElem;

        SignTextWizard.logTrace("signPageAdvanced():................End.");
        return true;
    },

    verifyPageShow : function (aWizardPageElem) 
    {
        SignTextWizard.logTrace("verifyPageShow():................Start.");
        SignTextWizard.mWizardElem.canAdvance = false;

        // var pageUserNextElem = document.getElementById("keymgr.signtext.doc.verify.next");
        // SignTextWizardOverlay.mWizardButtonNextElem.label = pageUserNextElem.value;
        var nextLabel = aWizardPageElem.getAttribute("nextlabel");
        if (nextLabel) {
    	    SignTextWizardOverlay.mWizardButtonNextElem.label = nextLabel;
        }

        var inTxtFileGridElem = document.getElementById('keymgr.signtext.doc.verify.file.grid');
        var inTxtFilePickerElem = document.getElementById('keymgr.signtext.doc.verify.file.path');
        inTxtFilePickerElem.txtdoc = null;

        // var inTxtFilePickerRowElem = document.getElementById('keymgr.signtext.doc.verify.file.row');
        if (!SignTextWizard.mWizardElem.firstStep && !SignTextWizard.mWizardElem.saveInFile) {
	    inTxtFileGridElem.hidden = true;
	    // inTxtFilePickerElem.hidden = true;
        }
        else {
            if (aWizardPageElem.filepath) {
                inTxtFilePickerElem.filepath = aWizardPageElem.filepath;
            }
	    // inTxtFilePickerElem.hidden = false;
	    inTxtFileGridElem.hidden = false;
        }
        if (SignTextWizard.mWizardElem.firstStep) {
    	    inTxtFilePickerElem.removeAttribute("browsehidden");
    	    inTxtFilePickerElem.removeAttribute("readonly");
        }
        else {
    	    inTxtFilePickerElem.setAttribute("browsehidden", true);
    	    inTxtFilePickerElem.setAttribute("readonly", true);
        }


        if (aWizardPageElem.txtdoc) {
    	    inTxtFilePickerElem.txtdoc = aWizardPageElem.txtdoc;
        }
        SignTextWizardOverlay.handleVerifyInTxtFilePathChange(inTxtFilePickerElem);

        SignTextWizard.mWizardElem.firstStep = false;

        SignTextWizard.logTrace("verifyPageShow():................End.");
        return true;
    },

    handleVerifyInTxtFilePathChange : function (aFilePickerElem, ev) 
    {
        SignTextWizard.logTrace("handleVerifyInTxtFilePathChange():................Start.");

        if (ev) {
	    aFilePickerElem.txtdoc = null;
            if ((aFilePickerElem.value == "") || !aFilePickerElem.file) {
    	        SignTextWizard.logTrace("handleSignInTxtFilePathChange(): NULL signed XML file is selected.");
    	        SignTextWizard.mWizardElem.canAdvance = false;
    	        return false;
            }
        }

        var signedTxtDoc = aFilePickerElem.txtdoc;
        if (!signedTxtDoc) {
    	    signedTxtDoc = aFilePickerElem.readData();
    	    if (!signedTxtDoc) {
    	        SignTextWizard.logError("handleVerifyInTxtFilePathChange(): aFilePickerElem.readData() failed.");
    	        SignTextWizard.mWizardElem.canAdvance = false;
    	        return false;
            }
        }

        var signerCertItemElem = document.getElementById("keymgr.signtext.doc.verify.signer.certitem");

	var signerCert = null;
    	var /* nsICMSMessage */ cmsMessage = null;
	try {
    	    signerCert = SignTextWizard.mKeyManager.getPKCS7SignedDataSignerCert(signedTxtDoc);
	    cmsMessage = SignTextWizard.mKeyManager.decodePKCS7DataToCmsMsgByBase64(signedTxtDoc);
	    /*
	    var cmsMessageObj = new Object();
	    SignTextWizard.mKeyManager.decodePKCS7DataToCmsMsgByBase64(signedTxtDoc, cmsMessageObj);
	    cmsMessage = cmsMessageObj.value;
	    */
	} catch (ex) {
    	    SignTextWizard.logError("handleVerifyInTxtFilePathChange(): SignTextWizard.mKeyManager.decodePKCS7DataToCmsMsgByBase64() failed - ex: " + ex);
	    signerCertItemElem.cert = null;
    	    SignTextWizard.mWizardElem.canAdvance = false;
    	    return false;
	}
        SignTextWizard.logTrace("handleVerifyInTxtFilePathChange():................30.");

	var signerCertObj = new Object();
	try {
	    if (cmsMessage) {
	    	signerCert = null;
	    	cmsMessage.getSignerCert(signerCertObj, null);
	    	signerCert = signerCertObj.value;
	    }
	} catch (ex) {
    	    SignTextWizard.logError("handleVerifyInTxtFilePathChange(): cmsMessage.getSignerCert() failed - ex: " + ex);
	    signerCertItemElem.cert = null;
    	    SignTextWizard.mWizardElem.canAdvance = false;
    	    return false;
	}
	signerCertItemElem.cert = signerCert;
	/*
        var cd = Components.classes["@mozilla.org/nsCertificateDialogs;1"]
    				.getService(Components.interfaces.nsICertificateDialogs);
        cd.viewCert(window, signerCert);
	*/

        if (ev) {
    	    SignTextWizard.mWizardElem.currentPage.txtdoc = signedTxtDoc;
    	    SignTextWizard.mWizardElem.currentPage.filepath = aFilePickerElem.filepath;
        }
    
        SignTextWizard.mWizardElem.canAdvance = true;
    
        SignTextWizard.logTrace("handleVerifyInTxtFilePathChange():................End.");
        return true;
    },

    handleVerifyTxtDocChange : function (ev) 
    {
        var signedFilePickerElem = ev.target;
        SignTextWizardOverlay.handleVerifyInTxtFilePathChange(signedFilePickerElem, ev);
    },

    verifyPageAdvanced : function (aWizardPageElem) 
    {
        SignTextWizard.logTrace("verifyPageAdvanced():................Start.");
        SignTextWizardOverlay.mWizardButtonNextElem.label = SignTextWizardOverlay.mWizardButtonNextOrigElem;

        var signerCertItemElem = document.getElementById("keymgr.signtext.doc.verify.signer.certitem");

	var unsignedTxtDoc = null;
	var signedTxtDoc = SignTextWizard.mWizardElem.currentPage.txtdoc;
	var signerCert = signerCertItemElem.cert;

	var isVerified = false;
	try {
    	    isVerified = SignTextWizard.mKeyManager.verifyPKCS7SignedTextData(
				unsignedTxtDoc,
	    			signedTxtDoc,
				signerCert
				);
	} catch (ex) {
    	    SignTextWizard.logError("handleVerifyInTxtFilePathChange(): SignTextWizard.mKeyManager.verifyPKCS7SignedTextData() failed - ex: " + ex);
	    isVerified = false;
	}
        if (!isVerified) {
    	    SignTextWizard.mWizardElem.canAdvance = false;
    	    alert("Failed to verify the signature in the signed XML document.");
            SignTextWizard.logTrace("verifyPageAdvanced():................End(1).");
	    return false;
        }
        alert("Successfully verified signtaure in the signed XML document.");
    
        /*
        var inTxtFilePickerElem = document.getElementById('keymgr.signtext.doc.verify.file.path');
        if (!inTxtFilePickerElem.file) {
	    return false;
        }
        */

        var nextPageElem = SignTextWizard.mWizardElem.getPageById(aWizardPageElem.next);
        nextPageElem.txtdoc = aWizardPageElem.txtdoc;

        var inTxtFilePickerElem = document.getElementById('keymgr.signtext.doc.verify.file.path');
        // if (SignTextWizard.mWizardElem.saveInFile || aWizardPageElem.lastStep) {
        if (SignTextWizard.mWizardElem.saveInFile) {
    	    nextPageElem.filepath = inTxtFilePickerElem.filepath;
        }
    
        SignTextWizard.logTrace("verifyPageAdvanced():................End.");
        return isVerified;
    },


    xmldsigffext_SignEnc_doOnloadInitEncParam : function (
	/* nsIX509 */ aKekEncryptX509Cert,
	/* String */ aKekEncryptMethodAlg,
	/* String */ aSymEncryptMethodAlg
	)
    {
        SignTextWizard.logTrace("xmldsigffext_SignEnc_doOnloadInitEncParam():................Start.");

        SignTextWizard.logTrace("\taKekEncryptX509Cert: " + (aKekEncryptX509Cert?aKekEncryptX509Cert.nickname:"") + "\n\t" + 
    		"aKekEncryptMethodAlg: " + aKekEncryptMethodAlg + "\n\t" + 
    		"aSymEncryptMethodAlg: " + aSymEncryptMethodAlg + "\n\t" + 
		"\n"
		);
        if (aSymEncryptMethodAlg && (aSymEncryptMethodAlg != "")) {
    	    var symEncryptMethodElem = document.getElementById("keymgr.signtext.doc.encrypt.symkey.enc.method");
    	    symEncryptMethodElem.Algorithm = aSymEncryptMethodAlg;
        }

        if (aKekEncryptMethodAlg && (aSymEncryptMethodAlg != "")) {
    	    var kekEncryptMethodElem = document.getElementById("keymgr.signtext.doc.encrypt.kek.enc.method");
    	    kekEncryptMethodElem.Algorithm = aKekEncryptMethodAlg;
        }
    
        if (aKekEncryptX509Cert) {
    	    var kekX509CertPickerElem = document.getElementById("keymgr.signtext.doc.encrypt.kek.certpicker");
    	    kekX509CertPickerElem.initWithCert(aKekEncryptX509Cert);
        }

        SignTextWizard.logTrace("xmldsigffext_SignEnc_doOnloadInitEncParam():................End.");
    },

    handleEncryptInTxtFilePathChange : function (aFilePickerElem, ev) 
    {
        SignTextWizard.logTrace("handleEncryptInTxtFilePathChange():................Start.");

        if (ev) {
	aFilePickerElem.txtdoc = null;
            if ((aFilePickerElem.value == "") || !aFilePickerElem.file) {
        	    // SignTextWizard.logTrace("handleEncryptInTxtFilePathChange():................10.");
        	    SignTextWizard.mWizardElem.canAdvance = false;
        	    return false;
        	}
        }

        var plainTxtDoc = aFilePickerElem.txtdoc;
	/*
        if (!plainTxtDoc) {
        	plainTxtDoc = xmldsigffext_SignEnc_xmlDocParseTxtFile(aFilePickerElem);
        	if (!plainTxtDoc) {
        	    SignTextWizard.mWizardElem.canAdvance = false;
        	    return false;
        	}
        }
	*/

        if (ev) {
        	SignTextWizard.mWizardElem.currentPage.txtdoc = plainTxtDoc;
        	SignTextWizard.mWizardElem.currentPage.filepath = aFilePickerElem.filepath;
        }

        var outTxtFilePickerElem = document.getElementById("keymgr.signtext.doc.encrypt.out.file.path");
        // if (!SignTextWizard.mWizardElem.saveInFile && !SignTextWizard.mWizardElem.currentPage.lastStep) {
        if (!SignTextWizard.mWizardElem.saveInFile) {
        	SignTextWizard.mWizardElem.canAdvance = true;
	outTxtFilePickerElem.hidden = true;
        	return true;
        }

        outTxtFilePickerElem.hidden = false;

        if ((outTxtFilePickerElem.value != "") && outTxtFilePickerElem.file) {
        	SignTextWizard.mWizardElem.canAdvance = true;
        	// SignTextWizard.logTrace("handleEncryptInTxtFilePathChange():................20.");
        	return true;
        }
        // SignTextWizard.logTrace("handleEncryptInTxtFilePathChange():................30.");

        var inTxtFile = aFilePickerElem.file;
        var outTxtFileName = "Encrypted_" + inTxtFile.leafName;

        var outTxtFileDir = inTxtFile.parent; 
        outTxtFilePickerElem.autoSelectFile(outTxtFileDir, outTxtFileName);

        handleEncryptOutTxtFilePathChange(outTxtFilePickerElem);

        SignTextWizard.logTrace("handleEncryptInTxtFilePathChange():................End.");
        return false;
    },

    handlePlainTxtDocChange : function (ev) 
    {
        var signedFilePickerElem = ev.target;
        SignTextWizardOverlay.handleEncryptInTxtFilePathChange(signedFilePickerElem, ev);
    },


    handleEncryptOutTxtFilePathChange : function (aFilePickerElem, ev) 
    {
        SignTextWizard.logTrace("handleEncryptOutTxtFilePathChange():................Start.");

        if ((aFilePickerElem.value != "") && aFilePickerElem.file) {
    	    SignTextWizard.mWizardElem.canAdvance = true;
        }
        else {
    	    SignTextWizard.mWizardElem.canAdvance = false;
        }

        SignTextWizard.logTrace("handleEncryptOutTxtFilePathChange():................End.");
    },
    
    handleEncryptedTxtDocChange : function (ev) 
    {
    	SignTextWizard.logTrace("handleEncryptedTxtDocChange():................Start.");
        var encyptedFilePickerElem = ev.target;
        SignTextWizardOverlay.handleEncryptOutTxtFilePathChange(encyptedFilePickerElem, ev);
    },

    handleTxtDocEncryptCertChange : function (aKekCertPickerElem, ev) 
    {
        SignTextWizard.logTrace("handleTxtDocEncryptCertChange():................Start.");
        SignTextWizard.logTrace("handleTxtDocEncryptCertChange():................End.");
    },


    handleDecryptInTxtFilePathChange : function (aFilePickerElem, ev) 
    {
        SignTextWizard.logTrace("handleDecryptInTxtFilePathChange():................Start.");

        if (ev) {
	    aFilePickerElem.txtdoc = null;
	    if ((aFilePickerElem.value == "") || !aFilePickerElem.file) {
        	    SignTextWizard.mWizardElem.canAdvance = false;
        	    SignTextWizard.logTrace("handleDecryptInTxtFilePathChange(): no input XML file.");
        	    return false;
            }
        }

        var encryptedTxtDoc = aFilePickerElem.txtdoc;
	/*
        if (!encryptedTxtDoc) {
        	encryptedTxtDoc = xmldsigffext_SignEnc_xmlDocParseTxtFile(aFilePickerElem);
        	if (!encryptedTxtDoc) {
        	    SignTextWizard.mWizardElem.canAdvance = false;
        	    return false;
        	}
        }
	*/

        if (ev) {
        	SignTextWizard.mWizardElem.currentPage.txtdoc = encryptedTxtDoc;
        	SignTextWizard.mWizardElem.currentPage.filepath = aFilePickerElem.filepath;
        }

        /*
        var xulEncXmlElemList = encryptedTxtDoc.getElementsByTagName("EncryptedData");
        var xulEncXmlElem = null;
        if (xulEncXmlElemList && (xulEncXmlElemList.length > 0)) {
        	xulEncXmlElem = xulEncXmlElemList.item(0);
        }
        */

	/*
        var encryptedDataBoxElem = document.getElementById("keymgr.signtext.doc.decrypt.encryptedDataBox");
        encryptedDataBoxElem.displayTxtDoc(encryptedTxtDoc);

        var kekX509Cert = encryptedDataBoxElem.kekX509Cert;
        // SignTextWizard.logTrace("handleDecryptInTxtFilePathChange(): kekX509Cert: " + kekX509Cert + "");
        if (!kekX509Cert) {
	var msg = "Will not be able to decrypt the XML doc - couldn't decode the KEK from keyinfo.";
	dump(msg + "");
	alert(msg);
        	SignTextWizard.mWizardElem.canAdvance = false;
        	return false;
        }

        // SignTextWizard.logTrace("handleDecryptInTxtFilePathChange(): kekX509Cert: " + kekX509Cert.nickname + "");
        if (!SignTextWizard.mKeyManager.isUserCert(kekX509Cert)) {
	var msg = "Will not be able to decrypt the XML doc - No private key associate with the KEK cert for " + kekX509Cert.nickname + " in the Certificate DB."
	dump(msg + "");
	alert(msg);
        	SignTextWizard.mWizardElem.canAdvance = false;
        	return false;
        }
        SignTextWizard.mWizardElem.canAdvance = true;

        var outTxtFilePickerElem = document.getElementById("keymgr.signtext.doc.decrypt.out.file.path");
        // if (!SignTextWizard.mWizardElem.saveInFile && !SignTextWizard.mWizardElem.currentPage.lastStep) {
        if (!SignTextWizard.mWizardElem.saveInFile) {
        	SignTextWizard.mWizardElem.canAdvance = true;
        	return true;
        }

        if ((outTxtFilePickerElem.value != "") && outTxtFilePickerElem.file) {
        	SignTextWizard.mWizardElem.canAdvance = true;
        	return true;
        }
        // SignTextWizard.logTrace("handleDecryptInTxtFilePathChange(): no output XML file.");

        var inTxtFile = aFilePickerElem.file;
        var outTxtFileName = "Plain_" + inTxtFile.leafName;
        // SignTextWizard.logTrace("handleDecryptInTxtFilePathChange(): outTxtFileName: " + outTxtFileName + "");

        var outTxtFileDir = inTxtFile.parent; 
        outTxtFilePickerElem.autoSelectFile(outTxtFileDir, outTxtFileName);
        handleDecryptedOutTxtFilePathChange(outTxtFilePickerElem);
        // SignTextWizard.logTrace("handleDecryptInTxtFilePathChange(): outTxtFilePath: " + outTxtFilePickerElem.value + "");
	*/

        SignTextWizard.logTrace("handleDecryptInTxtFilePathChange():................End.");
        return true;
    },

    handleDecryptInTxtDocChange : function (ev) 
    {
        var decyptInFilePickerElem = ev.target;
        // handleDecryptInTxtFilePathChange(decyptInFilePickerElem, ev);
        SignTextWizardOverlay.handleDecryptInTxtFilePathChange(decyptInFilePickerElem);
    },

    handleDecryptedOutTxtFilePathChange : function (aTargetElem, ev) 
    {
        SignTextWizard.logTrace("handleDecryptedOutTxtFilePathChange():................Start.");
        if ((aTargetElem.value != "") && aTargetElem.file) {
    	    SignTextWizard.mWizardElem.canAdvance = true;
        }
        SignTextWizard.logTrace("handleDecryptedOutTxtFilePathChange():................End.");
    },

    handleDecryptedTxtDocChange : function (ev) 
    {
        var decyptedFilePickerElem = ev.target;
        SignTextWizardOverlay.handleDecryptedTxtFilePathChange(decyptedFilePickerElem, ev);
    },

    lastMethod : function () 
    {
    }
}
