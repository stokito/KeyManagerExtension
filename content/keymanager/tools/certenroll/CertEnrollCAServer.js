/* @(#) $Id: CertEnrollCAServer.js,v 1.5 2011/02/04 18:54:55 subrata Exp $ */

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




var CertEnrollCAServer = {
    mFormCAServerType:		null,
    mCAServerCertSignURL:	null,
    mCAServerIssuerSubjectDN:	null,
    mCAServerIssuerAlias:	null,
    mUploadCSRAndSignCertResultIFrameId: "UploadCSRAndSignCertResultIFrame",
    mUploadFileFormId:		"UploadCSRAndSignCertForm",

    mPKCS10CAUploadFileFormId:	"UploadCSRAndSignCertForm",
    mMSCryptoCAUploadFileFormId: "MSCryptoUploadCSRAndSignCertForm",

    mUploadFormFileFieldId:	"Pkcs10CSRFile",

    mSentKeyToCAServer:		false,

    sendPKCS10CSRFileToCAByArgs: function (/* nsIFile */ localCSRFile, resultFrameId, reqFormId, reqFormFileItemId)
    {
	this.mUploadCSRAndSignCertResultIFrameId = resultFrameId;
	this.mUploadFileFormId = reqFormId;
	if (reqFormFileItemId != null) {
	    this.mUploadFormFileFieldId = reqFormFileItemId;
	}

	this.sendPKCS10CSRFileToCA(localCSRFile);
    },

    sendPKCS10CSRFileToCA: function (/* nsIFile */ csrInFile)
    {
	dump("CertEnrollCAServer.js(): sendPKCS10CSRFileToCA():........Start.\n");

	dump("CertEnrollCAServer.js(): mCAServerCertSignURL: " + this.mCAServerCertSignURL + "\n");

	this.uploadCSRFileUsingCAForm(
		csrInFile,
		this.mCAServerCertSignURL,
		this.mUploadCSRAndSignCertResultIFrameId
		);

	dump("CertEnrollCAServer.js(): sendPKCS10CSRFileToCA():...........End.\n");
    },

    uploadCSRFile: function (/* nsIFile */ csrInFile, /* String */ csrUploadURIStr)
    {
	dump("CertEnrollCAServer.js(): uploadCSRFile():...........Start.\n");

	this.uploadCSRFileUsingCAForm(
		csrInFile,
		csrUploadURIStr,
		    this.mUploadCSRAndSignCertResultIFrameId
		    );
	dump("CertEnrollCAServer.js(): uploadCSRFile():............End.\n");
    },

    uploadCSRFileUsingCAForm: function (/* nsIFile*/ aPkcs10CSRLocalFile,
				    /* String */ fileUploadURIStr,
				    /* String */ targetRespWindow
				    )
    {
	if (this.mFormCAServerType == "pkcs10CA") {
	    if (!this.mUploadFileFormId) {
	        this.mUploadFileFormId = this.mPKCS10CAUploadFileFormId;
	    }
	    this.uploadCSRFileUsingPKCS10Form(
		aPkcs10CSRLocalFile,
		fileUploadURIStr,
		targetRespWindow
		);
	}
	else if (this.mFormCAServerType == "simpleCA") {
	    if (!this.mUploadFileFormId) {
	        this.mUploadFileFormId = this.mPKCS10CAUploadFileFormId;
	    }
	    this.uploadCSRFileUsingPKCS10Form(
		aPkcs10CSRLocalFile,
		fileUploadURIStr,
		targetRespWindow
		);
	}
	else if (this.mFormCAServerType == "msCertService") {
	    if (!this.mUploadFileFormId) {
	        this.mUploadFileFormId = this.mMSCryptoCAUploadFileFormId;
	    }
	    this.uploadCSRFileUsingMsCryptoForm(
		aPkcs10CSRLocalFile,
		fileUploadURIStr,
		targetRespWindow
		);
	}
	else {
   	    alert("CA Services : " + this.mFormCAServerType + " is not supported yet.");
	}
    },


    uploadCSRFileUsingPKCS10Form: function (/* nsIFile*/ aPkcs10CSRLocalFile,
				    /* String */ fileUploadURIStr,
				    /* String */ targetRespWindow
				    )
    {
	dump("CertEnrollCAServer.js(): uploadCSRFileUsingPKCS10Form():............Start.\n");

	dump("uploadCSRFileUsingPKCS10Form(): aPkcs10CSRLocalFile: " + aPkcs10CSRLocalFile.path + "\n");
	dump("uploadCSRFileUsingPKCS10Form(): fileUploadURIStr: " + fileUploadURIStr + "\n");
	dump("uploadCSRFileUsingPKCS10Form(): targetRespWindow: " + targetRespWindow + "\n");
	dump("uploadCSRFileUsingPKCS10Form(): this.mUploadFileFormId: " + this.mUploadFileFormId + "\n");

	var targetRespWindowElem = document.getElementById(targetRespWindow);
	dump("uploadCSRFileUsingPKCS10Form(): targetRespWindowElem: " + targetRespWindowElem + "\n");

	// Get the Upload Form element
	var uploadFileFormElem = document.getElementById(this.mUploadFileFormId);
	if (!uploadFileFormElem) {
	    dump("CertEnrollCAServer.js(): uploadCSRFileUsingPKCS10Form(): " +  this.mUploadFileFormId + " form XUL element not found.\n");
	    alert(this.mUploadFileFormId + " CSR form XUL element not found.");
	    return;
	}
	dump("uploadCSRFileUsingPKCS10Form(): uploadFileFormElem: " + uploadFileFormElem + "\n");

	// Get the CSR file field element in the Upload Form 
	var formCSRFileFieldElem = document.getElementById(this.mUploadFormFileFieldId);
	if (formCSRFileFieldElem == null) {
	    alert(this.mUploadFileFormId + " field in CSR  XUL element not found.");
	    dump("CertEnrollCAServer.js(): uploadCSRFileUsingPKCS10Form(): " +  this.mUploadFileFormId + " form XUL element not found.");
	    return;
	}
	// Assign the signed cert file to the "file-type" input variable in the form
	formCSRFileFieldElem.value = aPkcs10CSRLocalFile.path;
	dump("uploadCSRFileUsingPKCS10Form(): formCSRFileFieldElem.value: " + formCSRFileFieldElem.value + "\n");
    /*
    mCAServerCertSignURL:	null,
    mCAServerIssuerSubjectDN:	null,
    mCAServerIssuerAlias:	null,
    */

	// uploadFileFormElem.Pkcs10CSRFile.value = aPkcs10CSRLocalFile.path;
	uploadFileFormElem.elements[this.mUploadFormFileFieldId].value = aPkcs10CSRLocalFile.path;
	uploadFileFormElem.issuerSubjectDN.value = this.mCAServerIssuerSubjectDN;
	uploadFileFormElem.issuerAlias.value = this.mCAServerIssuerAlias;

	// Assign the POST JSP for uploading the cert file. The JSP also
	// imports the file into the keystore for the proxy certifcate.
	uploadFileFormElem.action = fileUploadURIStr;
	if (targetRespWindow) {
	    uploadFileFormElem.target = targetRespWindow;
	}

	dump("uploadCSRFileUsingPKCS10Form(): uploadFileFormElem.enctype : " + uploadFileFormElem.enctype + "\n");
	dump("uploadCSRFileUsingPKCS10Form(): uploadFileFormElem.action : " + uploadFileFormElem.action + "\n");
	dump("uploadCSRFileUsingPKCS10Form(): uploadFileFormElem.length : " + uploadFileFormElem.length + "\n");
	for (var i = 0; i < uploadFileFormElem.length; i++) {
	var filedName = uploadFileFormElem[i].name;
	var filedValue = uploadFileFormElem[i].value;
	var filedType = uploadFileFormElem[i].type;
	    dump("uploadCSRFileUsingPKCS10Form(): uploadFileFormElem[" + i + "] : " +
			filedName + " = " + filedValue  + " (" + filedType + ")" + "\n"
			);
			
	}

	// send the form to the server
	uploadFileFormElem.submit();
	sentKeyToCAServer = true;

	// Save the URL in the form-history
	// caServerFieldAutoCompleteAction(caServerCertSignURLElem);

	dump("CertEnrollCAServer.js(): uploadCSRFileUsingPKCS10Form():............End.\n");
    },

    uploadCSRFileUsingSimplCAForm: function (/* nsIFile*/ aPkcs10CSRLocalFile,
				    /* String */ fileUploadURIStr,
				    /* String */ targetRespWindow
				    )
    {
	dump("CertEnrollCAServer.js(): uploadCSRFileUsingSimplCAForm():............Start.\n");

	dump("uploadCSRFileUsingSimplCAForm(): aPkcs10CSRLocalFile: " + aPkcs10CSRLocalFile.path + "\n");
	dump("uploadCSRFileUsingSimplCAForm(): fileUploadURIStr: " + fileUploadURIStr + "\n");
	dump("uploadCSRFileUsingSimplCAForm(): targetRespWindow: " + targetRespWindow + "\n");
	dump("uploadCSRFileUsingSimplCAForm(): this.mUploadFileFormId: " + this.mUploadFileFormId + "\n");

	var targetRespWindowElem = document.getElementById(targetRespWindow);
	dump("uploadCSRFileUsingSimplCAForm(): targetRespWindowElem: " + targetRespWindowElem + "\n");

	// Get the Upload Form element
	var uploadFileFormElem = document.getElementById(this.mUploadFileFormId);
	if (!uploadFileFormElem) {
	    dump("CertEnrollCAServer.js(): uploadCSRFileUsingSimplCAForm(): " +  this.mUploadFileFormId + " form XUL element not found.\n");
	    alert(this.mUploadFileFormId + " CSR form XUL element not found.");
	    return;
	}
	dump("uploadCSRFileUsingSimplCAForm(): uploadFileFormElem: " + uploadFileFormElem + "\n");

	// Get the CSR file field element in the Upload Form 
	var formCSRFileFieldElem = document.getElementById(this.mUploadFormFileFieldId);
	if (formCSRFileFieldElem == null) {
	    alert(this.mUploadFileFormId + " field in CSR  XUL element not found.");
	    dump("CertEnrollCAServer.js(): uploadCSRFileUsingSimplCAForm(): " +  this.mUploadFileFormId + " form XUL element not found.");
	    return;
	}
	// Assign the signed cert file to the "file-type" input variable in the form
	formCSRFileFieldElem.value = aPkcs10CSRLocalFile.path;
	dump("uploadCSRFileUsingSimplCAForm(): formCSRFileFieldElem.value: " + formCSRFileFieldElem.value + "\n");
    /*
    mCAServerCertSignURL:	null,
    mCAServerIssuerSubjectDN:	null,
    mCAServerIssuerAlias:	null,
    */

	// uploadFileFormElem.Pkcs10CSRFile.value = aPkcs10CSRLocalFile.path;
	uploadFileFormElem.elements[this.mUploadFormFileFieldId].value = aPkcs10CSRLocalFile.path;
	uploadFileFormElem.issuerSubjectDN.value = this.mCAServerIssuerSubjectDN;
	uploadFileFormElem.issuerAlias.value = this.mCAServerIssuerAlias;

	// Assign the POST JSP for uploading the cert file. The JSP also
	// imports the file into the keystore for the proxy certifcate.
	uploadFileFormElem.action = fileUploadURIStr;
	if (targetRespWindow) {
	    uploadFileFormElem.target = targetRespWindow;
	}

	dump("uploadCSRFileUsingSimplCAForm(): uploadFileFormElem.enctype : " + uploadFileFormElem.enctype + "\n");
	dump("uploadCSRFileUsingSimplCAForm(): uploadFileFormElem.action : " + uploadFileFormElem.action + "\n");
	dump("uploadCSRFileUsingSimplCAForm(): uploadFileFormElem.length : " + uploadFileFormElem.length + "\n");
	for (var i = 0; i < uploadFileFormElem.length; i++) {
	    var filedName = uploadFileFormElem[i].name;
	    var filedValue = uploadFileFormElem[i].value;
	    var filedType = uploadFileFormElem[i].type;
	    dump("uploadCSRFileUsingSimplCAForm(): uploadFileFormElem[" + i + "] : " +
			filedName + " = " + filedValue  + " (" + filedType + ")" + "\n"
			);
			
	}

	// send the form to the server
	uploadFileFormElem.submit();
	sentKeyToCAServer = true;

	// Save the URL in the form-history
	// caServerFieldAutoCompleteAction(caServerCertSignURLElem);

	dump("CertEnrollCAServer.js(): uploadCSRFileUsingSimplCAForm():............End.\n");
    },

    uploadCSRFileUsingMsCryptoForm: function (/* nsIFile*/ aPkcs10CSRLocalFile,
				    /* String */ fileUploadURIStr,
				    /* String */ targetRespWindow
				    )
    {

	dump("CertEnrollCAServer.js(): uploadCSRFileUsingMsCryptoForm():............Start.\n");

	dump("uploadCSRFileUsingMsCryptoForm(): aPkcs10CSRLocalFile: " + aPkcs10CSRLocalFile.path + "\n");
	dump("uploadCSRFileUsingMsCryptoForm(): fileUploadURIStr: " + fileUploadURIStr + "\n");
	dump("uploadCSRFileUsingMsCryptoForm(): targetRespWindow: " + targetRespWindow + "\n");


	var uploadFileFormElem = document.getElementById(this.mUploadFileFormId);
	if (uploadFileFormElem == null) {
	    alert(this.mUploadFileFormId + " form XUL element not found.");
	    return;
	}

	var L_SavedReqCert_Text="Saved-Request Certificate";

	// set request
	var pkcs10CSRData = readDataFromFile(aPkcs10CSRLocalFile);
	uploadFileFormElem.CertRequest.value	= pkcs10CSRData;

	// set defaults for values we need on install
	uploadFileFormElem.TargetStoreFlags.value	= 0; // 0=Use default (=user store), but ignored when saving cert.
	uploadFileFormElem.SaveCert.value		= "yes";
	uploadFileFormElem.Mode.value		= "newreq";
	uploadFileFormElem.FriendlyType.value	= L_SavedReqCert_Text;
	// append the local date to the type
	uploadFileFormElem.FriendlyType.value	+= " ("+(new Date()).toLocaleString()+")";
	//not created by xenroll, not supported
	uploadFileFormElem.ThumbPrint.value		= "";
	uploadFileFormElem.CertAttrib.value		= "\r\n";
	// uploadFileFormElem.CertAttrib.value	+= "UserAgent:Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.3) Gecko/20060426 Firefox/1.5.0.3\r\n";;

	// Assign the POST JSP for uploading the cert file. The JSP also
	// imports the file into the keystore for the proxy certifcate.
	uploadFileFormElem.action = fileUploadURIStr;
	if (targetRespWindow) {
	    uploadFileFormElem.target = targetRespWindow;
	}

	dump("uploadCSRFileUsingMsCryptoForm(): uploadFileFormElem.enctype : " + uploadFileFormElem.enctype + "\n");
	dump("uploadCSRFileUsingMsCryptoForm(): uploadFileFormElem.action : " + uploadFileFormElem.action + "\n");
	dump("uploadCSRFileUsingMsCryptoForm(): uploadFileFormElem.length : " + uploadFileFormElem.length + "\n");
	for (var i = 0; i < uploadFileFormElem.length; i++) {
	    dump("uploadCSRFileUsingMsCryptoForm(): uploadFileFormElem[" + i + "] : " +
		    uploadFileFormElem[i].name + " = " + uploadFileFormElem[i].value  +
				    " (" + uploadFileFormElem[i].type + ")" + "\n"
				    );
	}

	// send the form to the server
	uploadFileFormElem.submit();
	sentKeyToCAServer = true;

	// Save the URL in the form-history
	// caServerFieldAutoCompleteAction(caServerCertSignURLElem);

	dump("CertEnrollCAServer.js(): uploadCSRFileUsingMsCryptoForm():............End.\n");
    }

}

