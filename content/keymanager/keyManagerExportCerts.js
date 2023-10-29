/* @(#) $Id: keyManagerExportCerts.js,v 1.18 2013/05/23 22:42:53 subrata Exp $ */

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


function exportX509CertsToFile(aSelectedCerts, isUserCert, isProxyUserCert)
{
    var numcerts = aSelectedCerts.length;

    var params = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
			.createInstance(Components.interfaces.nsIDialogParamBlock);
    params.SetInt(0, numcerts);

    if (isUserCert) {
	params.SetString(0, "userCerts");
    }
    else {
	params.SetString(0, "nonUserCerts");
    }
    var exportFormatTypeDialogURL = "chrome://keymanager/content/exportFormatTypeDialog.xul";
    window.openDialog(
    		exportFormatTypeDialogURL,
		"",
		'chrome,centerscreen,resizable,modal,dialog=no,titlebar',
		params
		);
    if (params.GetInt(0) == 0) { // Selected Cancel or failed.
	return;
    }

    var exportFormatType = params.GetString(0);
    var exportEncodingType = params.GetString(1);
    var includeCertChainStr = params.GetString(2);
    var viewBase64FileStr = params.GetString(3);
    var encIterationCntStr = params.GetString(4);
    var encAlgorithmName = params.GetString(5);

    var base64Encoding = ((exportEncodingType == "base64") ? true : false);
    var includeCertChain = ((includeCertChainStr == "true") ? true : false);
    var viewBase64File = ((viewBase64FileStr == "true") ? true : false);
    /*
    dump("exportX509CertsToFile(): " + 
    		"exportFormatType: " + exportFormatType + " " +
    		"exportEncodingType: " + exportEncodingType + " " +
    		"includeCertChainStr: " + includeCertChainStr + " " +
    		"viewBase64FileStr: " + viewBase64FileStr + " " +
    		"base64Encoding: " + base64Encoding + " " +
    		"includeCertChain: " + includeCertChain + " " +
    		"viewBase64File: " + viewBase64File + " " +
    		"encIterationCntStr: " + encIterationCntStr + " " +
    		"encAlgorithmName: " + encAlgorithmName + " " +
		"\n");
    */

    if (exportFormatType == "osslepk") {
	exportKeyAsOpenSSLEPK(aSelectedCerts, encIterationCntStr, encAlgorithmName, includeCertChain, viewBase64File);
	return;
    }
    if (exportFormatType == "openssh2pubk") {
	exportPublicKeyAsOpenSSH2(aSelectedCerts);
	return;
    }
    if (exportFormatType == "openssh2") {
	exportKeyPairAsOpenSSH2(aSelectedCerts, encIterationCntStr, encAlgorithmName, viewBase64File);
	return;
    }
    if (exportFormatType == "puttyssh2") {
	exportKeyPairAsPuttySSH2(aSelectedCerts, encIterationCntStr, encAlgorithmName, viewBase64File);
	return;
    }
    if (exportFormatType == "pkcs8") {
	exportKeyAsPKCS8(aSelectedCerts, encIterationCntStr, encAlgorithmName, includeCertChain, exportEncodingType, viewBase64File);
	return;
    }
    if (exportFormatType == "pkcs12") {
	/*
	var anyCert = selected_proxy_certs[0];
	var isProxyCert = false;
	if (anyCert) {
	    isProxyCert = gKeyManager.isProxyCert(anyCert);
	}
	*/
	if (isProxyUserCert) {
	    backupProxyCerts();
	}
	else {
	    backupCerts();
	}
	return;
    }
    if (exportFormatType == "pkcs10") {
	exportCertAsPkcs10CSR(aSelectedCerts, exportEncodingType, viewBase64File);
	return;
    }

    if (exportFormatType == "x509") {
	exportCertAsX509(aSelectedCerts, exportEncodingType, includeCertChain, viewBase64File);
    }
    else if (exportFormatType == "pkcs7") {
	exportCertAsPKCS7(aSelectedCerts, exportEncodingType, includeCertChain, viewBase64File);
    }
}

function backupProxyCerts()
{
  // Exact copy of backupCerts() except the getSelectedCerts() 
  // is replaced by getSelectedProxyCerts();
  
  getSelectedProxyCerts();

  var numcerts = selected_proxy_certs.length;
  if (!numcerts)
    return;
  var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
  var fp = Components.classes[nsFilePicker].createInstance(nsIFilePicker);
  fp.init(window,
          bundle.GetStringFromName("chooseP12BackupFileDialog"),
          nsIFilePicker.modeSave);
  fp.appendFilter(bundle.GetStringFromName("file_browse_PKCS12_spec"),
                  "*.p12");
  fp.appendFilters(nsIFilePicker.filterAll);
  var rv = fp.show();
  if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
    certdb.exportPKCS12File(null, fp.file, 
                            selected_proxy_certs.length, selected_proxy_certs);
  }
}

function viewFile(/* nsIFile */ aFile, aDialogWin) 
{
    // dump("keyManagerExportCerts.js:viewFile(): ......................................Start.\n");

    // dump("keyManagerExportCerts.js:viewFile(): aFile: " + aFile + "\n");
    if (!aFile) {
    	return;
    }

    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
		    	.getService(Components.interfaces.nsIIOService);
    var /* nsIFileURL */ fileURL = ioService.newFileURI(aFile);
    var fileURLStr = fileURL.spec;
    // dump("keyManagerExportCerts.js:viewFile(): fileURLStr: " + fileURLStr + "\n");
    if (aDialogWin) {
    	window.openDialog(fileURLStr, "_blank", "resizable,scrollbars=1,width=500,height=200");
    }
    else {
    	window.open(fileURLStr, "_blank", "resizable,toolbar=1,location=1,status=1,scrollbars=1,width=700,height=400");
    }

    // dump("viewFile(): ......................................End.\n");
}

function exportKeyAsOpenSSLEPK(aSelectedCerts, aEncIterationCntStr, aEncAlgorithmName, aIncludeCertChain, aViewBase64File)
{
    if (aSelectedCerts.length > 1) {
      alert("More than one certficates are selected - select only one cert for OpenSSL EPK export.");
      return;
    }

    var selected_cert = aSelectedCerts[0];

    var iterationCnt = 1;
    if (aEncIterationCntStr != "") {
    	iterationCnt = parseInt(aEncIterationCntStr);
    }
    var encAlgorithmName = aEncAlgorithmName;

    // var base64Encoding = ((aEncodingType == "base64") ? true : false);
    // var viewBase64File = ((aViewBase64File == "true") ? true : false);
    var viewBase64File = aViewBase64File;
    /*
    dump("exportKeyAsOpenSSLEPK(): " + 
    		"aViewBase64File: " + aViewBase64File + " " +
    		"viewBase64File: " + viewBase64File + " " +
		"\n");
    */

    var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");

    var encodingType = "pem";
    var fileDialogMsg = "Choose OpenSSL Encrypted Private Key File"
    var fileTypeMsg = "OpenSSL Private Key PEM File";
    var fileTypeFilters = "*.pem;*.key";
    /*
    if (base64Encoding) {
  	fileTypeFilters += ";*.pem";
    }
    */

    var fp = Components.classes["@mozilla.org/filepicker;1"]
		.createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window,
	  fileDialogMsg, // bundle.GetStringFromName("chooseP12BackupFileDialog"),
	  Components.interfaces.nsIFilePicker.modeSave
	  );
    fp.appendFilter(
  	 fileTypeMsg, // bundle.GetStringFromName("file_browse_X509_spec"),
	 fileTypeFilters
	 );
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);

    // var exportFileNamePrefix = selected_cert.nickname;
    var exportFileNamePrefix = adaptNickName(selected_cert);
    if (exportFileNamePrefix) {
	fp.defaultString = exportFileNamePrefix + "_osslepk_key" + ".pem";
    }

    var rv = fp.show();
    if (rv == Components.interfaces.nsIFilePicker.returnOK || rv == Components.interfaces.nsIFilePicker.returnReplace) {
	var /* alrIKeyManager */ xKeyManager = null;
	xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
		    	.getService(Components.interfaces.alrIKeyManager);


	try {
	    if (aIncludeCertChain) {
	        /*
    	        void exportOpenSSLEPKWithCertToFileByX509Cert(
                        in nsIX509Cert aX509Cert,
		        in unsigned long aIterationCnt, in string aEncAlgorithmName,
                        in boolean aIncludeIssuerCertChain,
                        in boolean aKeyAsFirstItem,
                        in boolean aTagCertItemWithDN,
                        in nsILocalFile outPrivKeyPEMFile
                        );
	        */
	        var includeIssuerCertChain = aIncludeCertChain;
	        var keyAsFirstItem = false;
	        var tagCertItemWithDN = false;
	        xKeyManager.exportOpenSSLEPKWithCertToFileByX509Cert(
			aSelectedCerts[0],
			iterationCnt, encAlgorithmName,
			includeIssuerCertChain,
			keyAsFirstItem,
			tagCertItemWithDN,
			fp.file
			);
	    }
	    else {
	        xKeyManager.exportOpenSSLEPKToFileByX509Cert(
	    		aSelectedCerts[0],
			iterationCnt, encAlgorithmName,
			fp.file
			);
	    }
	} catch (ex) {
	    var msg = "Failed to export private key as OpenSSL Encrypted private key - ex: " + ex;
	    dump(msg + "\n");
	    alert(msg);
	    return;
	}
	/*
	if (aViewBase64File) {
	    viewFile(fp.file);
	}
	*/
    }
}

function exportKeyAsPKCS8(aSelectedCerts, aEncIterationCntStr, aEncAlgorithmName, aIncludeCertChain, aEncodingType, aViewBase64File)
{
    if (aSelectedCerts.length > 1) {
      alert("More than one certficates are selected - select only one cert for PKCS8 export.");
      return;
    }

    var selected_cert = aSelectedCerts[0];
    var iterationCnt = 1;
    if (aEncIterationCntStr != "") {
    	iterationCnt = parseInt(aEncIterationCntStr);
    }
    var encAlgorithmName = aEncAlgorithmName;
    var base64Encoding = ((aEncodingType == "base64") ? true : false);
    // var viewBase64File = ((aViewBase64File == "true") ? true : false);
    var viewBase64File = aViewBase64File;

    var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");

    var fileDialogMsg = "Choose PKCS#8 Key File for Private Key"
    var fileTypeMsg = "Private Key File";
    var fileTypeFilters = "*.pk8;*.key;";
    if (base64Encoding) {
  	fileTypeFilters += "*.pem;";
    }
    else {
  	fileTypeFilters += "*.der;";
    }

    var fp = Components.classes["@mozilla.org/filepicker;1"]
		.createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window,
	  fileDialogMsg, // bundle.GetStringFromName("chooseP12BackupFileDialog"),
	  Components.interfaces.nsIFilePicker.modeSave
	  );
    fp.appendFilter(
  	 fileTypeMsg, // bundle.GetStringFromName("file_browse_X509_spec"),
	 fileTypeFilters
	 );
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);

    // var exportFileNamePrefix = selected_cert.nickname;
    var exportFileNamePrefix = adaptNickName(selected_cert);
    if (exportFileNamePrefix) {
	fp.defaultString = exportFileNamePrefix + "_privkey_"+ aEncodingType + ".pk8";
    }

    var rv = fp.show();
    if (rv == Components.interfaces.nsIFilePicker.returnOK || rv == Components.interfaces.nsIFilePicker.returnReplace) {
	var /* alrIKeyManager */ xKeyManager = null;
	xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);

	/*
    	void exportPKCS8KeyWithCertToFileByX509Cert(
                in nsIX509Cert aX509Cert,
                in unsigned long aIterationCnt, in string aEncAlgorithmName,
                in boolean aIncludeIssuerCertChain,
                in boolean aKeyAsFirstItem,
                in boolean aTagCertItemWithDN,
                in nsILocalFile outPkcs8KeyCertFile
                );
	*/
	try {
	    if (base64Encoding && aIncludeCertChain) {
	        var includeIssuerCertChain = aIncludeCertChain;
	        var keyAsFirstItem = false;
	        var tagCertItemWithDN = false;
	        xKeyManager.exportPKCS8KeyWithCertToFileByX509Cert(
			aSelectedCerts[0],
			iterationCnt, encAlgorithmName,
			aIncludeCertChain,
			keyAsFirstItem,
			tagCertItemWithDN,
			fp.file
			);
	    }
	    else {
	        xKeyManager.exportPKCS8KeyToFileByX509Cert(
			aSelectedCerts[0],
			iterationCnt, encAlgorithmName,
			base64Encoding, fp.file
			);
	    }
	} catch (ex) {
	    var msg = "Failed to export private key as PKCS8 - ex: " + ex;
	    dump(msg + "\n");
	    alert(msg);
	    return;
	}
	if (aViewBase64File) {
	    viewFile(fp.file);
	}
    }
}

function exportCertAsPkcs10CSR(aSelectedCerts, aEncodingType, aViewBase64File)
{
    if (aSelectedCerts.length > 1) {
      alert("More than one certficates are selected - select only one cert for PKCS10 CSR generation.");
      return;
    }

    var selected_cert = aSelectedCerts[0];
    var base64Encoding = ((aEncodingType == "base64") ? true : false);
    // var viewBase64File = ((aViewBase64File == "true") ? true : false);
    var viewBase64File = aViewBase64File;

    var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");

    var fileDialogMsg="Choose PKCS#10 CSR File";
    var fileTypeMsg="PKCS#10 CSR File";
    var fileTypeFilters="*.csr;*.p10;";
    if (base64Encoding) {
  	fileTypeFilters += "*.pem;";
    }
    else {
  	fileTypeFilters += "*.der;";
    }

    var fp = Components.classes["@mozilla.org/filepicker;1"]
		.createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window,
	  fileDialogMsg, // bundle.GetStringFromName("chooseP12BackupFileDialog"),
	  Components.interfaces.nsIFilePicker.modeSave
	  );
    fp.appendFilter(
  	 fileTypeMsg, // bundle.GetStringFromName("file_browse_X509_spec"),
	 fileTypeFilters
	 );
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);

    var exportFileNamePrefix = adaptNickName(selected_cert);
    if (exportFileNamePrefix) {
	fp.defaultString = exportFileNamePrefix + "_pkcs10_csr_"+ aEncodingType + ".p10";
    }

    var rv = fp.show();
    if (rv == Components.interfaces.nsIFilePicker.returnOK || rv == Components.interfaces.nsIFilePicker.returnReplace) {
	var /* alrIKeyManager */ xKeyManager = null;
	xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);
	var pkcs10CSR = null;
	try {
	    pkcs10CSR = xKeyManager.createPKCS10CSRByX509Cert(aSelectedCerts[0]);
	} catch (ex) { }
	if (!pkcs10CSR) {
	    alert("Failed to create CSR from cert");
	    return;
	}
	pkcs10CSR.exportToFile(fp.file, base64Encoding);
	if (aViewBase64File) {
	    viewFile(fp.file);
	}
    }
}

function exportCertAsX509(aSelectedCerts, aEncodingType, aIncludeIssuerCertChain, aViewBase64File)
{
    var base64Encoding = ((aEncodingType == "base64") ? true : false);

    if (!base64Encoding && (aSelectedCerts.length > 1)) {
	alert("You can't save more than one X.509 certificate in DER format into a single file.");
	return;
    }

    var includeIssuerCertChain = aIncludeIssuerCertChain;
    /*
    if (aSelectedCerts.length > 1) {
	includeIssuerCertChain = false;
    }
    */

    var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");

    var fileDialogMsg = "File name to export X509 Cert"
    var fileTypeMsg = "X509 Cert File"; // bundle.GetStringFromName("file_browse_X509_spec")
    var fileTypeFilters = "*.cer;*.crt;";
    if (base64Encoding) {
  	fileTypeFilters += "*.pem;";
    }
    else {
  	fileTypeFilters += "*.der;";
    }

    var fp = Components.classes["@mozilla.org/filepicker;1"]
		.createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window,
	  fileDialogMsg,
	  Components.interfaces.nsIFilePicker.modeSave
	  );
    fp.appendFilter(
  	 fileTypeMsg, 
	 fileTypeFilters
	 );
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);

    if (aSelectedCerts.length == 1) {
	var selected_cert = aSelectedCerts[0];
	var exportFileNamePrefix = adaptNickName(selected_cert);
	if (exportFileNamePrefix) {
	    if (includeIssuerCertChain) {
	    	fp.defaultString = exportFileNamePrefix + "_x509_certchain_"+ aEncodingType + ".cer";
	    }
	    else {
	    	fp.defaultString = exportFileNamePrefix + "_x509_cert_"+ aEncodingType + ".cer";
	    }
	}
    }

    var rv = fp.show();
    if (rv == Components.interfaces.nsIFilePicker.returnOK || rv == Components.interfaces.nsIFilePicker.returnReplace) {
	var /* alrIKeyManager */ xKeyManager = null;
	xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);
	try {
	    if (aSelectedCerts.length == 1) {
	        xKeyManager.exportCertWithIssuerToFileByX509Cert(
				aSelectedCerts[0],
				includeIssuerCertChain,
				base64Encoding,
				fp.file
				);
	    }
	    else {
	        xKeyManager.exportCertListToFile(
				aSelectedCerts.length,
				aSelectedCerts,
				includeIssuerCertChain,
				fp.file
				);
	    }
	} catch (ex) {
	   dump("Failed to export X.509 cert.\n");
	   alert("Failed to export X.509 cert.");
	   return;
	}
	if (aViewBase64File) {
	    viewFile(fp.file);
	}
    }
}

function exportCertAsPKCS7(aSelectedCerts, aEncodingType, aIncludeIssuerCertChain, aViewBase64File)
{
    if (aSelectedCerts.length > 1) {
	alert("More than one certficates are selected - select only one cert for PKCS7 export.");
	return;
    }
  
    var selected_cert = aSelectedCerts[0];
    var base64Encoding = ((aEncodingType == "base64") ? true : false);
  
    var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
    var fp = Components.classes["@mozilla.org/filepicker;1"]
		.createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window,
		"File name to export PKCS7 Cert", // bundle.GetStringFromName("chooseP12BackupFileDialog"),
		Components.interfaces.nsIFilePicker.modeSave);
    fp.appendFilter(
		"PKCS7 Cert File", // bundle.GetStringFromName("file_browse_X509_spec"),
		"*.p7b;*.p7m;*.p7c;*.pk7");
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);

    var exportFileNamePrefix = adaptNickName(selected_cert);
    if (exportFileNamePrefix) {
	var fileName = exportFileNamePrefix + "_cert";
	if (aIncludeIssuerCertChain) {
	    fileName += "_chain";
	}
	fileName += "_"+ aEncodingType + ".pk7";
	fp.defaultString = fileName;
    }
  
    var rv = fp.show();
    if ((rv == Components.interfaces.nsIFilePicker.returnOK)
    	|| (rv == Components.interfaces.nsIFilePicker.returnReplace)) {
	var /* alrIKeyManager */ xKeyManager = null;
	xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
		      .getService(Components.interfaces.alrIKeyManager);
	try {
	    xKeyManager.exportPKCS7CertWithIssuerToFileByX509Cert(
				selected_cert,
				aIncludeIssuerCertChain,
				base64Encoding,
				fp.file
				);
	} catch (ex) {
	   dump("Failed to export X.509 cert as PKCS#7 data.");
	   alert("Failed to export X.509 cert as PKCS#7 data.");
	   return;
	}
	if (aViewBase64File) {
	    viewFile(fp.file);
	}
    }
}

function exportPublicKeyAsOpenSSH2(aSelectedCerts)
{
    if (aSelectedCerts.length <= 0) {
    	return;
    }

    var /* alrIKeyManager */ xKeyManager = null;
    xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
				.getService(Components.interfaces.alrIKeyManager);

    var openSSH2PublicKeyList = "";
    for (var i = 0; i < aSelectedCerts.length; i++) {
	var selectedCert = aSelectedCerts[i]; 
	try {
	    /*
	    string exportOpenSSHPublicKeyByX509Cert(in nsIX509Cert aX509Cert, in string aKeyComment);
	    */
	    var keyComment = null;
	    var openSSH2PublicKey = xKeyManager.exportOpenSSHPublicKeyByX509Cert(
					selectedCert,
					keyComment
					);
	    openSSH2PublicKeyList += openSSH2PublicKey;
	} catch (ex) {
	   alert("Failed to export Public Key of cert : " + selectedCert.nickname + " in OpenSSH2 format - ex: " + ex);
	   dump("Failed to export Public Key of cert : " + selectedCert.nickname + " in OpenSSH2 format - ex: " + ex + "\n");
	   continue;
	}
    }
    // dump("openSSH2PublicKeyList:\n" + openSSH2PublicKeyList);
    if (openSSH2PublicKeyList == "") {
    	alert("Failed to export public key in OpenSSH format.");
    	return;
    }

    var /* nsIFile */ publicKeyListOutTmpFile = pickTempOutFile("KeyManager/OpenSSH2/pubkeys.txt");
    if (!publicKeyListOutTmpFile) {
    	alert("Failed to create temporary file for the key list for viewing");
	return;
    }

    saveDataToFile(openSSH2PublicKeyList, publicKeyListOutTmpFile);
    viewFile(publicKeyListOutTmpFile, true);
    publicKeyListOutTmpFile.remove();
}

function exportKeyPairAsOpenSSH2(aSelectedCerts, aEncIterationCntStr, aEncAlgorithmName, aViewBase64File)
{
    if (aSelectedCerts.length > 1) {
      alert("More than one certficates are selected - select only one cert for exporting keys for OpenSSH format.");
      return;
    }

    var selected_cert = aSelectedCerts[0];

    // var base64Encoding = ((aEncodingType == "base64") ? true : false);
    // var viewBase64File = ((aViewBase64File == "true") ? true : false);

    var iterationCnt = 2048;
    if (aEncIterationCntStr != "") {
    	iterationCnt = parseInt(aEncIterationCntStr);
    }
    var encAlgorithmName = aEncAlgorithmName;
    var viewBase64File = aViewBase64File;

    var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");

    var fileDialogMsg="Choose directory for files for private and public keys in OpenSSH format";
    var fileTypeMsg="OpenSSH Directory";
    var fileTypeFilters="id_rsa;id_dsa;*.pem;*.pub";

    var fp = Components.classes["@mozilla.org/filepicker;1"]
		.createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window,
	  fileDialogMsg,
	  Components.interfaces.nsIFilePicker.modeGetFolder
	  );
    fp.appendFilter(
  	 fileTypeMsg, // bundle.GetStringFromName("file_browse_X509_spec"),
	 fileTypeFilters
	 );
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);

    var sshDir = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("Home", Components.interfaces.nsIFile);
    if (sshDir) {
    	sshDir.append(".ssh");
	if (!sshDir.exists()) {
	    try {
	    	sshDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, fileMode);
	    	fp.displayDirectory = sshDir;
	    } catch (ex) {}
	}
	else {
	    fp.displayDirectory = sshDir;
	}
    }


    var rv = fp.show();
    if (rv == Components.interfaces.nsIFilePicker.returnOK || rv == Components.interfaces.nsIFilePicker.returnReplace) {
	var /* alrIKeyManager */ xKeyManager = null;
	xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
				.getService(Components.interfaces.alrIKeyManager);
	try {
	    /*
	    void exportOpenSSHKeyPairToFileByX509Cert (in nsIX509Cert aX509Cert, in unsigned long aIterationCnt, in string aEncAlgorithmName, in string aKeyComment, in nsILocalFile aSSHKeyCertDir);
	    */
	      
	    // exportOpenSSHKeyPairToFileByX509Cert() ignores the values of aIterationCnt and aEncAlgorithmName args.
	    // OpenSSH2 expects iteration count with value 2048 and PBE_SHA1_CBC encryption algorithm.

	    var keyComment = null;
	    var sshKeyPairDir = fp.file;
	    xKeyManager.exportOpenSSHKeyPairToFileByX509Cert(
				selected_cert,
				iterationCnt, encAlgorithmName,
				keyComment,
				sshKeyPairDir
				);
	} catch (ex) {
	   dump("Failed to export Key-pair in OpenSSH2 format.\n");
	   alert("Failed to export Key-pair in OpenSSH2 format.");
	   return;
	}
	/*
	if (aViewBase64File) {
	    viewFile(fp.file);
	}
	*/
    }
}

function exportKeyPairAsPuttySSH2(aSelectedCerts, aEncIterationCntStr, aEncAlgorithmName, aViewBase64File)
{
    if (aSelectedCerts.length > 1) {
      alert("More than one certficates are selected - select only one cert for exporting keys for Putty-SSH2 format.");
      return;
    }

    var selected_cert = aSelectedCerts[0];

    // var base64Encoding = ((aEncodingType == "base64") ? true : false);
    // var viewBase64File = ((aViewBase64File == "true") ? true : false);

    var iterationCnt = 2048;
    if (aEncIterationCntStr != "") {
    	iterationCnt = parseInt(aEncIterationCntStr);
    }
    var encAlgorithmName = aEncAlgorithmName;
    var viewBase64File = aViewBase64File;

    var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");

    var fileDialogMsg="Choose directory for files for private and public keys in Putty-SSH2 format";
    var fileTypeMsg="Putty Key Directory";
    var fileTypeFilters="*.pem;*.ppk;";

    var fp = Components.classes["@mozilla.org/filepicker;1"]
		.createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window,
	  fileDialogMsg,
	  Components.interfaces.nsIFilePicker.modeGetFolder
	  );
    fp.appendFilter(
  	 fileTypeMsg, // bundle.GetStringFromName("file_browse_X509_spec"),
	 fileTypeFilters
	 );
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);

    /*
    var sshDir = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("Home", Components.interfaces.nsIFile);
    if (sshDir) {
    	sshDir.append(".ssh");
	if (!sshDir.exists()) {
	    try {
	    	sshDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, fileMode);
    	    	fp.displayDirectory = sshDir;
	    } catch (ex) {}
	}
    }
    */


    var rv = fp.show();
    if (rv == Components.interfaces.nsIFilePicker.returnOK || rv == Components.interfaces.nsIFilePicker.returnReplace) {
	var /* alrIKeyManager */ xKeyManager = null;
	xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
				.getService(Components.interfaces.alrIKeyManager);
	try {
	    /*
	    void exportPuttySSH2KeyPairToFileByX509Cert (in nsIX509Cert aX509Cert, in unsigned long aIterationCnt, in string aEncAlgorithmName, in string aKeyComment, in nsILocalFile aPuttySSH2KeyDir);

	    */
	      
	    // exportOpenSSHKeyPairToFileByX509Cert() ignores the values of aIterationCnt and aEncAlgorithmName args.
	    // OpenSSH2 expects iteration count with value 2048 and PBE_SHA1_CBC encryption algorithm.

	    var keyComment = null;
	    var sshKeyPairDir = fp.file;
	    xKeyManager.exportPuttySSH2KeyPairToFileByX509Cert(
				selected_cert,
				iterationCnt, encAlgorithmName,
				keyComment,
				sshKeyPairDir
				);
	} catch (ex) {
	   dump("Failed to export Key-pair in Putty-SSH2 format.\n");
	   alert("Failed to export Key-pair in Putty-SSH2 format.");
	   return;
	}
	/*
	if (aViewBase64File) {
	    viewFile(fp.file);
	}
	*/
    }
}


function adaptNickName(aCert, keepTokenName, nameSuffix) 
{
    var tmpCert = aCert;
    if (!tmpCert) {
	return null;
    }

    var tmpStrList = null; 
    var newNickName = tmpCert.nickname;
    if (!newNickName || ((newNickName == "") || (newNickName == "(no nickname)"))) {
	newNickName = tmpCert.commonName;
	if (newNickName == "") {
		return null;
	}
    }

    if (!keepTokenName) {
	if (newNickName.indexOf(":") >= 0) {
	    tmpStrList = tmpCert.nickname.split(":");
	    if (tmpStrList.length > 1) {
		newNickName = tmpStrList[1];
	    }
	}
    }
    if (newNickName.indexOf("=") >= 0) {
	newNickName = tmpCert.commonName;
	tmpStrList = newNickName.split(" ");
	newNickName = tmpStrList[0];
    }

    // TODO:  xxxx
    newNickName = newNickName.replace(/\(/g, "");
    newNickName = newNickName.replace(/\)/g, "");
    newNickName = newNickName.replace(/\*/g, "X");
    newNickName = newNickName.replace(/\./g, "_");
    newNickName = newNickName.replace(/-/g, "_");
    newNickName = newNickName.replace(/:/g, "_");
    newNickName = newNickName.replace(/\W/g,"");

    newNickName = newNickName.replace(/__/g, "_");
    newNickName = newNickName.replace(/^_/, "");

    // dump("adaptCertNickName(): newNickName: " + newNickName + "\n");


    if (nameSuffix && (nameSuffix.length > 0)) {
	newNickName += "_" + nameSuffix;
    }

    // dump("keyManagerExt.js:adaptCertNickName(): newNickName: " + newNickName + "\n");

    return newNickName;
}

/* nsIFile */
function pickTempOutFile(fileNamePattern)
{
    // To create a temporary file, use nsIFile.createUnique():
    // Source: http://kb.mozillazine.org/File_IO#Creating_temporary_files

    var /* nsIFile*/ tmpLocalFile = null;
    tmpLocalFile = Components.classes["@mozilla.org/file/directory_service;1"].
	getService(Components.interfaces.nsIProperties).
	get("TmpD", Components.interfaces.nsIFile);

    if (fileNamePattern != null) {
	var subDirItems = fileNamePattern.split("/");
	for (var i = 0; i < subDirItems.length; i++) {
	    var subDirItem = subDirItems[i];
	    if (subDirItem == "") {
	    	continue;
	    }
    	    tmpLocalFile.append(subDirItem);
	}
    }
    tmpLocalFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);

    // dump("selected OUT TEMP File: " + tmpLocalFile.path + "\n");

    return tmpLocalFile;
}

function saveDataToFile(/* String */ fileData, /* nsIFile*/ outFile)
{
    // dump("XULFileUtil.js(): saveDataToFile():..........Start.\n");
    
    if (!outFile) {
	dump("keyManagerExportCerts.js:saveDataToFile(): outFile == NULL\n");
	return;
    }
    if (!fileData || (fileData.length <= 0)) {
	dump("keyManagerExportCerts.js:saveDataToFile(): fileData == NULL\n");
	return;
    }

    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
			.createInstance(Components.interfaces.nsIFileOutputStream);
    foStream.QueryInterface(Components.interfaces.nsIOutputStream);
    foStream.QueryInterface(Components.interfaces.nsISeekableStream);

    foStream.init(outFile, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate

    var count = foStream.write(fileData, fileData.length);
    foStream.close();

    // dump("saveDataToFile(): " + count + " baytes written to " + outFile.path + "\n");
    // dump("keyManagerExportCerts.js:saveDataToFile():............End.\n");
}

