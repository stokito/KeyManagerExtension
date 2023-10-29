/* @(#) $Id: keyManagerExtFF2.js,v 1.51 2011/02/04 18:54:51 subrata Exp $ */

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

var /* alrIKeyManager */ gKeyManager = null;
var userProxyTreeView = null;
var otherProxyTreeView = null;

var gSelectedProxyTree = null;
var gSelectedProxyTreeView = null;
var selected_proxy_certs = [];
var selected_proxy_cert_index = [];


var gUseOldVersion = false;
var gUseOldGenKeyCSRTool = false;

function keymanager_isSupportedOS()
{
    dump("keymanager_isSupportedOS(): userAgent: " + navigator.userAgent +"\n");

    var isWin = (navigator.userAgent.indexOf("Win") != -1);
    var isLinux = (navigator.userAgent.indexOf("Linux") != -1);
    var isMac = (navigator.userAgent.indexOf("Mac") != -1);
    if (!(isWin || isLinux || isMac)) {
    	alert("ERROR: WRONG BROWSER USER AGENT (" + navigator.userAgent + ")\n" + 
    		"This tool is currently supported only on Linux_x86-gcc3, Darwin_x86-gcc3, and Windows_x86-msvc platforms.");
    	return false;
    }

    // loginToInternalKeyToken(false);

    return true;
}

function LoadUserKeys(aCertcache)
{
    dump("keyManagerExt.LoadUserKeys():...........Start.\n");

    if (userKeyTreeView) {
    	return;
    }

    gUseOldVersion = getPrefBoolValue("keymgr.useOldVersion");
    // dump("keyManagerExt.LoadUserKeys(): gUseOldVersion: " + gUseOldVersion + "\n");
    gUseOldGenKeyCSRTool = getPrefBoolValue("keymgr.genkeycsr.useOldVersion");
    dump("keyManagerExt.LoadUserKeys(): gUseOldGenKeyCSRTool: " + gUseOldGenKeyCSRTool + "\n");

    keymanager_isSupportedOS();
    var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"]
			.getService(Components.interfaces.nsIX509CertDB);
    if (!xcertdb) {
    	alert("Failed to load nsIX509CertDB XPCOM implemnatation (@mozilla.org/security/x509certdb;1).\n");
    	dump("Failed to load nsIX509CertDB XPCOM implemnatation (@mozilla.org/security/x509certdb;1).\n");
    }
    gKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
		    .getService(Components.interfaces.alrIKeyManager);
    if (!gKeyManager) {
    	alert("Failed to load alrIKeyManager XPCOM implemnatation (@avaya.com/pkm/keymanager;1).\n");
    	dump("Failed to load alrIKeyManager XPCOM implemnatation (@avaya.com/pkm/keymanager;1).\n");
    }
    userKeyTreeView = userTreeView;
    /*
    userKeyTreeView = Components.classes[nsCertTree]
		      .createInstance(nsICertTree);
    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    }
    userKeyTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
     */
    document.getElementById('user-key-tree')
       .treeBoxObject.view = userKeyTreeView;
    var rowCnt = userKeyTreeView.rowCount;

    var enableBackupAllKeyButton=document.getElementById('mine_key_backupAllButton');
    if(rowCnt < 1) {
	enableBackupAllKeyButton.setAttribute("disabled",true);
    } else  {
	enableBackupAllKeyButton.setAttribute("enabled",true);
    }

    dump("keyManagerExt.LoadUserKeys():...........End.\n");
}

function ReloadUserKeys(aCertcache)
{
    dump("keyManagerExt.ReloadUserKeys():...........Start.\n");

    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    }

    userKeyTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
    userKeyTreeView.selection.clearSelection();

    processProxyCertInTree(userKeyTreeView, false);
    // ReloadOtherProxyCerts(certcache);

    var rowCnt = userKeyTreeView.rowCount;
    dump("ReloadUserKeys(): userKeyTreeView.rowCount: " + userKeyTreeView.rowCount + 
    				" userTreeView.rowCount: " + userTreeView.rowCount + "\n");

    // TODO: I do noy why the user-tree view is not getting updated,
    //       when I change the userTreeView from user-key-tree.
    //       So, I am resetting the user-tree view to refresh it.
    //       I am also not getting events related to userTreeView in 
    //       user-key-tree view unless I re-assign the userTreeView to 
    //       user-key-tree view.
    //       Maybe, I have do a separate TreeView for user-key-tree.
    //
    document.getElementById('user-tree')
     .treeBoxObject.view = userTreeView;
    document.getElementById('user-key-tree')
       .treeBoxObject.view = userKeyTreeView;

    dump("keyManagerExt.ReloadUserKeys():...........End.\n");
}

function ReloadNonUserCerts(aCertcache)
{
    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    }

    emailTreeView.loadCertsFromCache(certcache, nsIX509Cert.EMAIL_CERT);
    serverTreeView.loadCertsFromCache(certcache, nsIX509Cert.SERVER_CERT);
    // caTreeView.loadCertsFromCache(certcache, nsIX509Cert.CA_CERT);

    // ReloadProxyCerts(certcache);
}



function mine_key_enableButtons()
{

    // dump("keyManagerExt.mine_key_enableButtons():...........Start.\n");

    mine_enableButtons();

    var toggle="false";

    getSelectedCerts();

    var numcerts = selected_certs.length;
    if (!numcerts) {
	toggle="true";
    }

    var enableViewButton=document.getElementById('mine_key_viewButton');
    enableViewButton.setAttribute("disabled",toggle);
    var enableBackupButton=document.getElementById('mine_key_backupButton');
    enableBackupButton.setAttribute("disabled",toggle);
    var enableDeleteButton=document.getElementById('mine_key_deleteButton');
    enableDeleteButton.setAttribute("disabled",toggle);

    if (numcerts > 1) {
	toggle="true";
    }
    var enableTokenLoginButton=document.getElementById('mine_key_tokenLoginButton');
    enableTokenLoginButton.setAttribute("disabled",toggle);

    var enableExportButton=document.getElementById('mine_key_exportButton');
    enableExportButton.setAttribute("disabled",toggle);

    var enableScepClientButton=document.getElementById('mine_key_scepClientButton');
    enableScepClientButton.setAttribute("disabled",toggle);

    var enableSignCertButton=document.getElementById('mine_key_signProxyCertButton');
    enableSignCertButton.setAttribute("disabled",toggle);

    if (numcerts > 1) {
	toggle="true";
    }
    else {
	toggle="false";
    }
    var enableGenerateCSRButton=document.getElementById('mine_key_generateCSRButton');
    enableGenerateCSRButton.setAttribute("disabled",toggle);
    var enableGenerateSelfSignedButton=document.getElementById('mine_key_generateSelfSignButton');
    enableGenerateSelfSignedButton.setAttribute("disabled",toggle);
    // enableGenerateCSRButton.setAttribute("disabled","false");

    // dump("keyManagerExt.mine_key_enableButtons():...........End.\n");
}

function exportEndEntityCerts()
{
    getSelectedCerts();
    var numcerts = selected_certs.length;
    if (!numcerts) {
	return;
    }

    var selTab = document.getElementById('certMgrTabbox').selectedItem;
    var selTabID = selTab.getAttribute('id');

    var isUserCert = false;
    var isProxyUserCert = false;
    if ((selTabID == 'mine_tab') || (selTabID == "mine_key_tab")) {
    	isUserCert = true;
    }

    exportX509CertsToFile(selected_certs, isUserCert, isProxyUserCert);
}

function importUserCerts()
{
    var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
    var fp = Components.classes[nsFilePicker].createInstance(nsIFilePicker);
    fp.init(window,
	  "Select file containing signed User cert to import",
          nsIFilePicker.modeOpen);
    fp.appendFilter(bundle.GetStringFromName("file_browse_Certificate_spec"),
                  "*.crt; *.cert; *.cer; *.pem; *.der; *.pk7; *.p7");
    /*
    fp.appendFilter("X.509 Cert File (Base64)",
                  "*.crt; *.cert; *.cer; *.pem");
    fp.appendFilter("X.509 Cert File (DER)",
                  "*.crt; *.cert; *.cer; *.der");
    fp.appendFilter("PKCS#7 Cert File (base4)",
                  "*.crt; *.cert; *.cer; *.pem; *.pk7");
    fp.appendFilter("PKCS#7 Cert File (DER)",
                  "*.crt; *.cert; *.cer; *.der; *.pk7");
    fp.appendFilters(nsIFilePicker.filterAll);
    */
    if (fp.show() == nsIFilePicker.returnOK) {

	/*
        var fileBase64 = true;
        var x509CertType = true;
	// dump("fp.filterIndex: " + fp.filterIndex + "\n");
	switch(fp.filterIndex) {
	    case 0: 
	        break;
	    case 1: 
        	x509CertType = true;
        	fileBase64 = false;
	        break;
	    case 2: 
        	x509CertType = false;
        	fileBase64 = true;
	        break;
	    case 3: 
        	x509CertType = false;
        	fileBase64 = false;
	        break;
	    default:
	        break;
	}
	// dump("x509CertType: " + x509CertType + " fileBase64: " + fileBase64 + "\n");
	*/

        try {
	    /*
            if (x509CertType) {
    	        gKeyManager.importX509CertByFile(
			fp.file, fileBase64, "Pu,Pu,Pu", ""
			);
            }
            else {
    	        gKeyManager.importCertsFromPKCS7File(
			null, fp.file, fileBase64, nsIX509Cert.USER_CERT
			);
            }
	    */

    	    var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"]
			.getService(Components.interfaces.nsIX509CertDB);
	    var certData = readBinDataByFile(fp.file);
	    if (certData.length > 0) {
    		var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"]
			.getService(Components.interfaces.nsIX509CertDB);
		
		// Force login-to internal token
		loginToInternalKeyToken();

		// Note:
	        // If the imported file is Base64, then it must start with
	        // -----BEGIN CERTIFICATE-----
	        // and end with
	        // -----END CERTIFICATE-----
	        // lines, for both X.509 and PKCS#7 */
	        // PSM And NSS use CERT_CertPackageType() in  pkcs7/certread.c to read the
	        // file and expects those two lines for base64 data.

		xcertdb.importUserCertificate(certData, certData.length, null);

                var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
                certcache.cacheAllCerts();
                ReloadUserKeys(certcache);
    	    	caTreeView.loadCertsFromCache(certcache, nsIX509Cert.CA_CERT);
    	    	caTreeView.selection.clearSelection();
		/*
                if (!x509CertType) {
	        }
		*/
	    }
        } catch(ex) {
	    var msg = "Failed to import certs - ex: " + ex;
	    alert(msg);
	    dump(msg + "\n");
        }
    }
}

function generateSelfSignedCert()
{
    // dump("keyManagerExt.generateSelfSignedCert():...........Start.\n");

    // getSelectedCerts() initializes the selected_certs global variable.
    getSelectedCerts();

    var numcerts = selected_certs.length;
    if (numcerts > 1) {
    	alert("Select at most one certificate.");
    	return;
    }

    var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    			.createInstance(Components.interfaces.nsIPKIParamBlock);
    var params = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
    // params.SetNumberStrings(1);
    params.SetString(0, "generateSelfSignedCert");
    pkiParams.setISupportAtIndex(1, null);


    params.SetInt(0, numcerts);
    if (numcerts > 0) {
    	var cert = selected_certs[0];
	/*
	if (cert.issuerName != cert.subjectName) {
	    alert("Cannot issue a self-signed cert for cert signed by other parties.");
	    dump("Cannot issue a self-signed cert for cert signed by other parties.\n");
	    dump("    Cert Subject: " + cert.issuerName + "\n");
	    dump("    Issuer Subject: " + cert.subjectName + "\n");
	    return;
	}
	*/
    	params.SetInt(0, 1);  
    	params.SetString(1, cert.dbKey);  
    	pkiParams.setISupportAtIndex(1, cert);

	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].
    				getService(Components.interfaces.nsIPromptService);
	// Key-pair already exists ==> generate a CSR and
	// then generate Self-signed certificate 
    	params.SetInt(1, 0); 
	var genKeyCSRDialogURL = 'chrome://keymanager/content/tools/genkeycsr/generatePKCS10CSR.xul';
	if (gUseOldGenKeyCSRTool) {
	    genKeyCSRDialogURL = 'chrome://keymanager/content/generatePKCS10CSR.xul';
	}
    	window.openDialog(genKeyCSRDialogURL, "",
		    'chrome,centerscreen,resizable,modal', params);
    }
    else {
	// No certificate is present ==> create a new key-pair,
	// then CSR and then self-signed certificate
	var genKeyCSRDialogURL = 'chrome://keymanager/content/tools/genkeycsr/generatePKCS10CSR.xul';
	if (gUseOldGenKeyCSRTool) {
	    genKeyCSRDialogURL = 'chrome://keymanager/content/generateKeyPairCSR.xul';
	}
    	window.openDialog(genKeyCSRDialogURL, "",
		    'chrome,centerscreen,resizable,modal', params);
    }

    /*
    if (params.GetInt(0) == 0) { // Selected Cancel or failed.
    	dump("keyManagerExt.generateSelfSignedCert(): generatePKCS10CSR.xul failed.\n");
    	return;
    }
    */

    // dump("keyManagerExt.generateSelfSignedCert(): selected_cert_index([0]: " + selected_cert_index[0] + "\n");
    if (numcerts) {
	var retVal = params.GetInt(0);
	var keepCert = params.GetInt(1);
    	// dump("keyManagerExt.generateSelfSignedCert(): keepCert: " +  keepCert + "\n");
    	if ((retVal == 1) && (keepCert == false)) {
    	    var cert = selected_certs[0];
    	    dump("keyManagerExt.generateSelfSignedCert(): removing old cert: " +
	    	cert.nickname + "(" + cert.subjectName + "/" + cert.serialNumber + ")" + 
		" from display tree.\n"
		);
    	    userKeyTreeView.removeCert(selected_cert_index[0]);
    	    // userTreeView.removeCert(selected_cert_index[0]);
    	}
    }

    var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    certcache.cacheAllCerts();

    /*
    userTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
    userTreeView.selection.clearSelection();

    userKeyTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
    userKeyTreeView.selection.clearSelection();
    */

    ReloadUserKeys(certcache);

    // dump("keyManagerExt.generateSelfSignedCert():............End.\n");
}

function generateCSR()
{
    // getSelectedCerts initializes the selected_certs global variable.
    getSelectedCerts();

    var numcerts = selected_certs.length;
    if (numcerts > 1) {
    	alert("Select only one certificate.");
    	return;
    }
    /*
    if (!numcerts) {
    	alert("Select any one certificate.");
    	return;
    }
    */

    var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    			.createInstance(Components.interfaces.nsIPKIParamBlock);
    var params = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
    params.SetString(0, "generateCSR");
    pkiParams.setISupportAtIndex(1, null);

    params.SetInt(0, numcerts);
    if (numcerts > 0) {
    	var cert = selected_certs[0];
    	params.SetString(1, cert.dbKey);  
    	pkiParams.setISupportAtIndex(1, cert);

	// Key-pair already exists ==> generate a CSR 
	var genKeyCSRDialogURL = 'chrome://keymanager/content/tools/genkeycsr/generatePKCS10CSR.xul';
	if (gUseOldGenKeyCSRTool) {
	    genKeyCSRDialogURL = 'chrome://keymanager/content/generateCSR.xul';
	}
    	window.openDialog(genKeyCSRDialogURL, "",
		    'chrome,centerscreen,resizable,modal', params);
    }
    else {
	// No certificate is present ==> create a new key-pair,
	// then CSR and then self-signed certificate
	var genKeyCSRDialogURL = 'chrome://keymanager/content/tools/genkeycsr/generatePKCS10CSR.xul';
	if (gUseOldGenKeyCSRTool) {
	    genKeyCSRDialogURL = 'chrome://keymanager/content/generateKeyPairCSR.xul';
	}
    	window.openDialog(genKeyCSRDialogURL, "",
		    'chrome,centerscreen,resizable,modal', params);
    }


    /*
    if (params.GetInt(0) == 0) { // Selected Cancel or failed.
    	return;
    }
    */

    var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    certcache.cacheAllCerts();

    ReloadUserKeys(certcache);

    /*
    userKeyTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
    userKeyTreeView.selection.clearSelection();

    userTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
    userTreeView.selection.clearSelection();
    */
}

function refreshAllCertTrees()
{
    var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    certcache.cacheAllCerts();

    ReloadUserKeys(certcache);
    LoadProxyCerts(certcache);
}

function loginToKeyToken()
{
    getSelectedCerts();
    var numcerts = selected_certs.length;
    if (numcerts > 1) {
    	alert("Select at most one certificate.");
    	return;
    }
    var cert = selected_certs[0];
    loginToCertToken(cert, false);
}

function showScepClient()
{
    getSelectedCerts();
    var numcerts = selected_certs.length;
    if (numcerts > 1) {
    	alert("Select at most one certificate.");
    	return;
    }

    var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    			.createInstance(Components.interfaces.nsIPKIParamBlock);
    var params = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

    params.SetInt(0, numcerts);
    if (numcerts) {
    	var cert = selected_certs[0];
    	params.SetString(0, cert.dbKey);  
    	pkiParams.setISupportAtIndex(1, cert);
    	// params.SetString(2, cert.nickname);  
    	setPrefStringValue("keymgr.scep.client.form.user.cert.nickName.menulist", cert.nickname);
    	params.SetString(1, "PKCSReq");  
    }
    /*
    setPrefStringValue("keymgr.scep.client.form.scep.req.msgType.menuList",
    			"keymgr.scep.client.form.scep.req.msgType.PKCSReq");
    */
    window.openDialog('chrome://scepclient/content/scepClientWizard.xul',
    			'_blank',
			'chrome,centerscreen,resizable,modal,dialog=no,titlebar',
			params
			);
    /*
    if (params.GetInt(0) == 0) { // Selected Cancel or failed.
    	return;
    }
    */

    var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    certcache.cacheAllCerts();

    caTreeView.loadCertsFromCache(certcache, nsIX509Cert.CA_CERT);
    caTreeView.selection.clearSelection();

    /*
    userKeyTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
    userKeyTreeView.selection.clearSelection();

    userTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
    userTreeView.selection.clearSelection();
    */

    ReloadUserKeys(certcache);
}

function signProxyCert()
{

    getSelectedCerts();

    signProxyCertInternal(selected_certs);
}

function signProxyCertInternal(aSelectedCerts)
{
    // dump("keyManagerExt.signProxyCertInternal():............Start.\n");

    var numcerts = aSelectedCerts.length;

    if (numcerts > 1) {
    	alert("Select only one certificate.");
    	return;
    }
    if (!numcerts) {
    	alert("Select the certificate to be used for signing.");
    	return;
    }


    var selectedSignerCert = aSelectedCerts[0];

    var xkeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);

    var pcPathLengthConstraintStr = getProxyCertConstraintPathLength(selectedSignerCert);
    if (pcPathLengthConstraintStr && (pcPathLengthConstraintStr != "")) {
	var pcPathLengthConstraint = parseInt(pcPathLengthConstraintStr);
	// dump("pcPathLengthConstraint: " + pcPathLengthConstraint + "\n");
	if (pcPathLengthConstraint <= 0) {
	    alert(
		"Selected certificate is a proxy cert with constraint path length equal to zero.\n" + 
		"You cannot use a proxy cert with constraint length equal to zero to sign another proxy cert.\n" + 
	    	"Sorry! Selected certificate is not eligible to be either proxy cert issuer or public key cert issuer.\n" + 
	    	"Please select another cert.\n"
		);
    	    return;
	}
    }

    var isProxySignerCert = true;
    var isCACert = xkeyManager.isCACert(selectedSignerCert);
    if (isCACert) {
	var checkStateObj = new Object();
	checkStateObj.value = isProxySignerCert;
    	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService();
    	promptService = promptService.QueryInterface(Components.interfaces.nsIPromptService);
    	var dialogOk = promptService.confirmCheck(
			window,
		     	"Sign a (Proxy) Certificate",
		     	"Selected certificate is Root certificate. You can sign the certifictae as a CA or \nas a Proxy Cert Issuer. Press cancel to terminate this task.",
			"Yes, sign as a Proxy Issuer.",
			checkStateObj
		     	);
	if (!dialogOk) {
    	    return;
	}
    	isProxySignerCert = checkStateObj.value;
    }

    var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    			.createInstance(Components.interfaces.nsIPKIParamBlock);
    var params = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

    params.SetInt(0, numcerts);
    params.SetString(1, selectedSignerCert.dbKey);  
    pkiParams.setISupportAtIndex(1, selectedSignerCert);
    if (isProxySignerCert) {
    	params.SetInt(1, 1);
    	params.SetString(0, "signProxyCert");
	var signProxyCertDialogURL = 'chrome://signcerttool/content/nextgen/signProxyCertTool.xul';
	if (gUseOldGenKeyCSRTool) {
	    signProxyCertDialogURL = 'chrome://signcerttool/content/signProxyCertTool.xul';
	}
    	window.openDialog(signProxyCertDialogURL, "",
		    'chrome,centerscreen,resizable,modal,dialog=no,titlebar', pkiParams);
    }
    else {
	// dump("Opening chrome://keymanager/content/signCertByCATool.xul\n");
    	params.SetInt(1, 0);
    	params.SetString(0, "signCert");
	var signCertByCADialogURL = 'chrome://signcerttool/content/nextgen/signCertByCATool.xul';
	if (gUseOldGenKeyCSRTool) {
	    signCertByCADialogURL = 'chrome://signcerttool/content/signCertByCATool.xul';
	}
    	window.openDialog(signCertByCADialogURL, "",
		    'chrome,centerscreen,resizable,modal,dialog=no,titlebar', pkiParams);
    }
    // dump("keyManagerExt.signProxyCertInternal():............20.\n");

    if (params.GetInt(0) == 0) { // Selected Cancel or failed.
    	return;
    }
    // dump("keyManagerExt.signProxyCertInternal():............30.\n");

    var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    certcache.cacheAllCerts();
    if (isProxySignerCert) {
    	ReloadProxyCerts(certcache);
    }
    else {
    	ReloadUserKeys(certcache);
	ReloadNonUserCerts(certcache);
    }

    // dump("keyManagerExt.signProxyCertInternal():............End.\n");
}


function loginToToken(token, force)
{
    if (token == null) {
    	return;
    }
    var forceLogin = ((force == null) ? false : force);
    if (token.needsLogin() || !(token.needsUserInit)) {
    	token.login(forceLogin);
    }
    return;
}

function loginToCertToken(/* nsiX509Cert */ aCert, /* boolean */ force)
{
    var xTokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"].getService(Components.interfaces.nsIPK11TokenDB);
    var /* nsIPK11Token */ token = xTokendb.findTokenByName(aCert.tokenName);

    /*
    if (token == null) {
    	return;
    }
    var forceLogin = ((force == null) ? false : force);
    if (token.needsLogin() || !(token.needsUserInit)) {
    	token.login(forceLogin);
    }
    */
    loginToToken(token, force);
    return;
}

function loginToInternalKeyToken(force)
{
    var xTokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"].getService(Components.interfaces.nsIPK11TokenDB);
    var /* nsIPK11Token */ token = xTokendb.getInternalKeyToken();
    loginToToken(token, force);
}

function loginAllTokens(force)
{

    // dump("loginAllTokens("+ force + "):.............Start.\n");

    // var slotnames = new Array();

    var xTokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"].getService(Components.interfaces.nsIPK11TokenDB);
    var forceLogin = ((force == null) ? false : force);
    var tokenList = xTokendb.listTokens();
    try {
	for ( ; !tokenList.isDone(); tokenList.next()) {
	    var enumElement = tokenList.currentItem();
	    var /* nsIPK11Token */ token = enumElement.QueryInterface(Components.interfaces.nsIPK11Token);
	    if (token.needsLogin() || !(token.needsUserInit)) {
		// slotnames[slotnames.length] = token.tokenName;
   	        // dump("loginAllTokens(): login-to token: " + token.tokenName + "\n");
		token.login(forceLogin);
	    }
	}
    } catch(ex) {
	// dump("getTokenNameList(): failed to get Tokens - " + ex);
    }

    // dump("loginAllTokens("+ force + "):.............End.\n");
}


function getProxyCertConstraintPathLength(aProxyCert) 
{
    var xkeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);

    var /* nsIPersistentProperties */ certProps;
    certProps = Components.classes["@mozilla.org/persistent-properties;1"].
		    createInstance(Components.interfaces.nsIPersistentProperties);

    xkeyManager.exportX509v3CertExtnToProperties(aProxyCert, "proxyCertInfo", certProps);

    var pcPathLengthConstraintName = "proxyCertInfo-pcPathLengthConstraint";

    var pcPathLengthConstraintFlag = null;
    try {
	pcPathLengthConstraintFlag = certProps.getStringProperty(pcPathLengthConstraintName);
    } catch (ex) {}
    if (!pcPathLengthConstraintFlag) {
    	return null;
    }
    if (pcPathLengthConstraintFlag != "true") {
    	return null;
    }

    var pcPathLengthConstraintValueName = "proxyCertInfo-pcPathLengthConstraint-text";
    var pcPathLengthConstraintStr = null;
    try {
    	pcPathLengthConstraintStr = certProps.getStringProperty(pcPathLengthConstraintValueName);
    } catch (ex) {}
    if (!pcPathLengthConstraintStr) {
    	return null;
    }

    /*
    dump("proxySignerNickNameMenuListChanged(): nickName: " + aProxyCert.nickname + " " + 
    			"pcPathLengthConstraintFlag: " + pcPathLengthConstraintFlag + " " + 
    			"pcPathLengthConstraintStr: " + pcPathLengthConstraintStr + " " + 
			"\n");
    */
    if (pcPathLengthConstraintStr == "") {
    	return null;
    }
    return pcPathLengthConstraintStr;

}


function handleProxyCertTabSelection(aSelectedTab, ev)
{
    var certTreeView = null;
    if ("myproxy_tab" == aSelectedTab.id) {
    	certTreeView = LoadMyProxyCerts();
    }
    else if ("other_proxy_tab" == aSelectedTab.id) {
    	certTreeView = LoadOtherProxyCerts();
    }
    else {
    	return;
    }
    // aSelectedTab.certTree = certTreeView;
}

function LoadProxyCerts(aCertcache)
{
    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    }
    LoadMyProxyCerts(certcache);
    LoadOtherProxyCerts(certcache);
}

function ReloadProxyCerts(aCertcache)
{
    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    }
    ReloadMyProxyCerts(certcache);
    ReloadOtherProxyCerts(certcache);
}

function processProxyCertInTree(aCertTreeView, isProxyCertTree)
{
    // dump("keyManagerExt.processProxyCertInTree():...........Start.\n");

    var totProxyCnt = 0;
    var currTreeView = null;
    var rowCnt = 0;

    currTreeView = aCertTreeView;
    rowCnt = currTreeView.rowCount;
    totProxyCnt = 0;
    for (var i = rowCnt-1; i >= 0; i--) {
    	if (currTreeView.isContainer(i)) {
    	    // dump("keyManagerExt.processProxyCertInTree(): ignoring container row: "+ i + "\n");
	    continue;
	}
	var objCert = currTreeView.getCert(i);
	if (!objCert) {
    	    // dump("keyManagerExt.processProxyCertInTree(): ignoring row: "+ i + "\n");
	    continue;
	}
	var /* nsIX509Cert */ cert = objCert.QueryInterface(Components.interfaces.nsIX509Cert);
	if (!cert) {
    	    // dump("keyManagerExt.processProxyCertInTree(): ignoring row: "+ i + " elm: "+ cert + "\n");
	    continue;
	}
	var isProxyCert = gKeyManager.isProxyCert(cert);
	if (!isProxyCertTree && !isProxyCert) {
    	    // dump("keyManagerExt.processProxyCertInTree(): tree is not for proxy and cert is not proxy - keeping row: "+ i + "\n");
	    continue;
	}
	if (isProxyCertTree && isProxyCert) {
    	    // dump("keyManagerExt.processProxyCertInTree(): tree is for proxy and cert is proxy - keeping row: "+ i + "\n");
	    continue;
	}
	totProxyCnt++;
	currTreeView.removeCert(i);
    	// dump("keyManagerExt.processProxyCertInTree(): is a proxy - removed row: "+ i + "\n");
    }
    // dump("keyManagerExt.keyManagerExt.processProxyCertInTree(certTree, " +  isProxyCertTree + "): totProxyCnt: " + totProxyCnt + " certs are removed.\n");

    // dump("keyManagerExt.processProxyCertInTree():...........End.\n");
}

//class constructor
function ProxyTreeView(aCertTreeView) {
    this.certTreeView = aCertTreeView;
};

//class definition
ProxyTreeView.prototype = {

    certTreeView: null,

    // nsICertTree interface methods
    loadCerts: function(type){ this.certTreeView.loadCerts(type); },
    loadCertsFromCache: function(cache, type){ this.certTreeView.loadCerts(cache, type); },
    getCert: function(row){ return this.certTreeView.getCert(row); },
    removeCert: function(row){ return this.certTreeView.removeCert(row); },

    // nsITreeView interface methods
    get rowCount () { return this.certTreeView.rowCount; },
    get selection () {if (!this.certTreeView) {return null;}  return this.certTreeView.selection; },
    set selection (sel) {if (!this.certTreeView) {return;}  this.certTreeView.selection = sel; },

    getRowProperties: function(row,props){ return this.certTreeView.getRowProperties(row,props);},
    getCellProperties: function(row,col,props){ return this.certTreeView.getCellProperties(row,col,props);},
    getColumnProperties: function(col,props){ return this.certTreeView.getColumnProperties(col,props);},

    isContainer: function(row){ return this.certTreeView.isContainer(row); },
    isContainerOpen: function(row){ return this.certTreeView.isContainerOpen(row); },
    isContainerEmpty: function(row){ return this.certTreeView.isContainerEmpty(row); },
    isSeparator: function(row){ return this.certTreeView.isSeparator(row); },

    getParentIndex: function(row){ return this.certTreeView.getParentIndex(row); },
    hasNextSibling: function(row,afterIndex){ return this.certTreeView.hasNextSibling(row, afterIndex); },
    getLevel: function(row){ return this.certTreeView.getLevel(row); },
    getImageSrc: function(row,col){ return this.certTreeView.getImageSrc(row,col); },
    isSorted: function(){ return this.certTreeView.isSorted(); },
    getProgressMode: function(row,col){ return this.certTreeView.getProgressMode(row,col); },

    getCellValue: function(row,col){ return this.certTreeView.getCellValue(row,col); },
    getCellText : function(row,column){
	// dump("proxyTreeView(): getCellText(" + row + ", " + column.id + "): ..............10.\n");
	var columnId = column.id;

	if (! (("delegatecol" == column.id) || ("issuercol" == column.id))) {
    	    return this.certTreeView.getCellText(row, column);
	}
	var colText = "";
	var objCert = this.certTreeView.getCert(row);
	if (!objCert) {
	    return colText;
	}
	var /* nsIX509Cert */ cert = null;
	try {
	    cert = objCert.QueryInterface(Components.interfaces.nsIX509Cert);
	} catch (ex) {}
	if (!cert) {
	    return colText;
	}

	if ("delegatecol" == column.id) {
	    var proxySubjName = cert.subjectName;
	    // colText = cert.subjectName;
	    colText = cert.commonName;
	}
	else if ("issuercol" == column.id) {
	    var issuerCert = cert.issuer;
	    if (!issuerCert) {
	    	var issuerName = cert.issuerName;
	    	// dump("proxyTreeView(): getCellText(): issuerName: " + issuerName + "(" + cert.issuer + ")\n");

		try {
		issuerCert = gKeyManager.findX509CertBySubjectName(issuerName);
		} catch (ex) { }
		if (!issuerCert) {
	    	    colText = issuerName;
		}
	    }
	    if (issuerCert) {
	    	// dump("proxyTreeView(): getCellText(): issuerCert.commonName: " + issuerCert.commonName + "\n");
	    	colText = issuerCert.commonName;
	    }
	}
	return colText;
    },

    setTree: function(treebox){ this.certTreeView.setTree(treebox); },
    toggleOpenState: function(row){ return this.certTreeView.toggleOpenState(row); },
    cycleHeader: function(col){ this.certTreeView.cycleHeader(col); },
    cycleCell: function(row,col){ return this.certTreeView.cycleCell(row,col); },
    isEditable: function(row,col){ return this.certTreeView.isEditable(row,col); },

    performAction: function(action){ return this.certTreeView.performAction(action); },

    /*
    // method of nsISupports interface
    QueryInterface: function(aIID) {
	if (
	    !aIID.equals(nsICertTree) &&
	    !aIID.equals(nsITreeView) &&
	    !aIID.equals(nsISupports)
	    ) {
	    throw Components.results.NS_ERROR_NO_INTERFACE;
	}
	return this;
    }
    */
    dummy: function() {}
}

function LoadMyProxyCerts(aCertcache)
{
    // dump("keyManagerExt.LoadMyProxyCerts():...........Start.\n");

    if (userProxyTreeView) {
    	gSelectedProxyTreeView = userProxyTreeView;
    	return userProxyTreeView;
    }
    userProxyTreeView = Components.classes[nsCertTree]
		        .createInstance(nsICertTree);
    // userProxyTreeView = userProxyTreeView.QueryInterface(Components.interfaces.nsICertTree);
    ReloadMyProxyCerts(aCertcache);

    // document.getElementById('myProxy-tree').treeBoxObject.view = userProxyTreeView;
    var myProxyTree = document.getElementById('myProxy-tree');
    var pView = new ProxyTreeView(userProxyTreeView);
    myProxyTree.treeBoxObject.view = pView;

    // myProxyTree.treeBoxObject.view does not return pView, instead returns a nsITreeView.
    // So, we cache the userProxyTreeView object in the myProxyTree.
    myProxyTree.certTreeView = userProxyTreeView;
    /*
    dump("keyManagerExt.LoadMyProxyCerts(): userProxyTreeView: " + userProxyTreeView + "\n");
    dump("keyManagerExt.LoadMyProxyCerts(): myProxyTree.certTreeView: " + myProxyTree.certTreeView + "\n");
    */

    gSelectedProxyTreeView = userProxyTreeView;

    // dump("keyManagerExt.LoadMyProxyCerts():...........End.\n");

    return userProxyTreeView;
}

function ReloadMyProxyCerts(aCertcache)
{
    // dump("keyManagerExt.ReloadMyProxyCerts():...........Start.\n");

    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    }
    // userProxyTreeView.loadCertsFromCache(certcache, nsIX509Cert.EMAIL_CERT);
    userProxyTreeView.loadCertsFromCache(certcache, nsIX509Cert.SERVER_CERT);
    if (userProxyTreeView.selection) {
    	userProxyTreeView.selection.clearSelection();
    }
    processProxyCertInTree(userProxyTreeView, true);

    processProxyCertInTree(serverTreeView, false);

    // dump("keyManagerExt.ReloadMyProxyCerts():...........End.\n");
}

function myproxy_enableButtons(aCertTree, ev)
{
    // dump("keyManagerExt.myproxy_enableButtons():...........Start.\n");

    gSelectedProxyTree = aCertTree;
    // dump("keyManagerExt.myproxy_enableButtons(): gSelectedProxyTree: " + gSelectedProxyTree + "\n");
    var selTab = document.getElementById('certMgrTabbox').selectedItem;
    selTab.certTree = aCertTree; 

    var toggle="false";

    getSelectedProxyCerts();

    var numcerts = selected_proxy_certs.length;
    if (!numcerts) {
	toggle="true";
    }
    // dump("keyManagerExt.myproxy_enableButtons(): numcerts: " + numcerts + "\n");
    // dump("keyManagerExt.myproxy_enableButtons(): toggle: " + toggle + "\n");

    var enableViewButton=document.getElementById('myproxy_viewButton');
    enableViewButton.setAttribute("disabled",toggle);
    var enableEditButton=document.getElementById('myproxy_editButton');
    enableEditButton.setAttribute("disabled",toggle);
    var enableDeleteButton=document.getElementById('myproxy_deleteButton');
    enableDeleteButton.setAttribute("disabled",toggle);

    if (numcerts > 1) {
	toggle="true";
    }

    var enableExportButton=document.getElementById('myproxy_exportButton');
    enableExportButton.setAttribute("disabled",toggle);

    // dump("keyManagerExt.myproxy_enableButtons():...........End.\n");
}

function LoadOtherProxyCerts(aCertcache)
{
    // dump("keyManagerExt.LoadOtherProxyCerts():...........Start.\n");

    if (otherProxyTreeView) {
	gSelectedProxyTreeView = otherProxyTreeView;
    	return otherProxyTreeView;
    }
    otherProxyTreeView = Components.classes[nsCertTree]
		        .createInstance(nsICertTree);
    // otherProxyTreeView = otherProxyTreeView.QueryInterface(Components.interfaces.nsICertTree);
    ReloadOtherProxyCerts(aCertcache);

    var pView = new ProxyTreeView(otherProxyTreeView);
    // document.getElementById('otherProxy-tree').treeBoxObject.view = otherProxyTreeView;
    var otherProxyTree = document.getElementById('otherProxy-tree');
    otherProxyTree.treeBoxObject.view = pView;
    // myProxyTree.treeBoxObject.view does not return pView, instead returns a nsITreeView.
    // So, we cache the userProxyTreeView object in the myProxyTree.
    otherProxyTree.certTreeView = otherProxyTreeView;
    /*
    dump("keyManagerExt.LoadOtherProxyCerts(): otherProxyTree.certTreeView: " + otherProxyTree.certTreeView + "\n");
    dump("keyManagerExt.LoadOtherProxyCerts(): otherProxyTreeView: " + otherProxyTreeView + "\n");
    dump("keyManagerExt.LoadOtherProxyCerts(): serverTreeView: " + serverTreeView + "\n");
    */

    gSelectedProxyTreeView = otherProxyTreeView;

    // dump("keyManagerExt.LoadOtherProxyCerts():...........End.\n");
    return otherProxyTreeView;
}

function ReloadOtherProxyCerts(aCertcache)
{
    // dump("keyManagerExt.ReloadOtherProxyCerts():...........Start.\n");

    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    }
    otherProxyTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
    if (otherProxyTreeView.selection) {
    	otherProxyTreeView.selection.clearSelection();
    }
    processProxyCertInTree(otherProxyTreeView, true);

    processProxyCertInTree(userKeyTreeView, false);

    // dump("keyManagerExt.ReloadOtherProxyCerts():...........End.\n");
}

function refreshCertTree(aCertcache, certTreeView, certType)
{
    // dump("keyManagerExt.refreshCertTree():...........Start.\n");

    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    }
    certTreeView.loadCertsFromCache(certcache, certType);
    processProxyCertInTree(certTreeView, true);

    switch(certType) {
    	case nsIX509Cert.USER_CERT:
    	    processProxyCertInTree(userTreeView, false);
	    break;
    }

    // TODO: Incomplete ..........

    // dump("keyManagerExt.refreshCertTree():...........End.\n");
}


function other_proxy_enableButtons(aCertTree, ev)
{
    // dump("keyManagerExt.other_proxy_enableButtons(" + aCertTree.id + "):...........Start.\n");

    gSelectedProxyTree = aCertTree;

    var selTab = document.getElementById('certMgrTabbox').selectedItem;
    selTab.certTree = aCertTree; 

    var toggle="false";

    getSelectedProxyCerts();
    var numcerts = selected_proxy_certs.length;
    if (!numcerts) {
	toggle="true";
    }
    // dump("keyManagerExt.other_proxy_enableButtons(): numcerts: " + numcerts + "\n");
    // dump("keyManagerExt.other_proxy_enableButtons(): toggle: " + toggle + "\n");

    var enableViewButton=document.getElementById('other_proxy_viewButton');
    enableViewButton.setAttribute("disabled",toggle);
    var enableEditButton=document.getElementById('other_proxy_editButton');
    enableEditButton.setAttribute("disabled",toggle);
    var enableDeleteButton=document.getElementById('other_proxy_deleteButton');
    enableDeleteButton.setAttribute("disabled",toggle);

    if (numcerts > 1) {
	toggle="true";
    }

    var enableExportButton=document.getElementById('other_proxy_exportButton');
    enableExportButton.setAttribute("disabled",toggle);

    var enableSignCertButton=document.getElementById('other_proxy_signProxyCertButton');
    enableSignCertButton.setAttribute("disabled",toggle);

    // dump("keyManagerExt.other_proxy_enableButtons():...........End.\n");
}

function getSelectedProxyCerts()
{
    // dump("keyManagerExt.getSelectedProxyCerts():...........Start.\n");
    // getSelectedCertTreeView();

    selected_proxy_certs = [];

    var selTab = document.getElementById('certMgrTabbox').selectedItem;
    if (selTab.certTree) {
    	gSelectedProxyTree = selTab.certTree;
    }
    if (!gSelectedProxyTree) {
    	dump("keyManagerExt.getSelectedProxyCerts(): NULL gSelectedProxyTree.\n");
    	return;
    }

    var certTreeView = gSelectedProxyTree.certTreeView;
    var treeView = gSelectedProxyTree.treeBoxObject.view;
    // dump("keyManagerExt.getSelectedProxyCerts(): treeView: " + treeView + "\n");

    var items = treeView.selection;
    // dump("keyManagerExt.getSelectedProxyCerts(): items: " + items + "\n");


  var cert = null;
  var nr = 0;
  if (items != null) nr = items.getRangeCount();
  if (nr > 0) {
    for (var i=0; i<nr; i++) {
      var o1 = {};
      var o2 = {};
      items.getRangeAt(i, o1, o2);
      var min = o1.value;
      var max = o2.value;
      for (var j=min; j<=max; j++) {

	cert = certTreeView.getCert(j);
   	// dump("keyManagerExt.getSelectedProxyCerts(): j: " + j + " cert: " + cert + "\n");
	if (cert) {
	  var sc = selected_proxy_certs.length;
	  selected_proxy_certs[sc] = cert;
	  selected_proxy_cert_index[sc] = j;
	}
      }
    }
  }
   // dump("keyManagerExt.getSelectedProxyCerts():...........End.\n");
}


function viewProxyCerts()
{
    getSelectedProxyCerts();

    var numcerts = selected_proxy_certs.length;
    if (!numcerts)
	return;

    for (var t=0; t<numcerts; t++) {
	viewCertHelper(window, selected_proxy_certs[t]);
    }
}

function deleteProxyCerts()
{
    getSelectedProxyCerts();

    var numcerts = selected_proxy_certs.length;
    // dump("keyManagerExt.js:deleteProxyCerts(): numcerts: " + numcerts + "\n");
    if (!numcerts)
	return;

    var params = Components.classes[nsDialogParamBlock].createInstance(nsIDialogParamBlock);

    params.SetNumberStrings(numcerts+1);
  
    var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
    var selTab = document.getElementById('certMgrTabbox').selectedItem;
    var selTabID = selTab.getAttribute('id');

    var selectedCertTree = gSelectedProxyTree;
    if (selTab.certTree) {
	selectedCertTree = selTab.certTree;
    }
    // dump("keyManagerExt.js:deleteProxyCerts(): selTab: " + selTabID + "\n");
    // dump("keyManagerExt.js:deleteProxyCerts(): selectedCertTree: " + selectedCertTree + "(" + selectedCertTree.id + ")\n");
    var certTreeView = selectedCertTree.certTreeView;
    // certTreeView = certTreeView.QueryInterface(Components.interfaces.nsICertTree);
    // dump("keyManagerExt.js:deleteProxyCerts(): certTreeView: " + certTreeView + "\n");

    if (selTabID == 'myproxy_tab') {
	params.SetString(0,bundle.GetStringFromName("deleteSslCertFlag"));
	// params.SetString(0, "Delete your proxy cert delegated to other.");
    } 
    else if (selTabID == 'other_proxy_tab') {
	params.SetString(0,bundle.GetStringFromName("deleteUserCertFlag"));
	// params.SetString(0, "Delete cert delegated to you.");
    } 
    else {
	return;
    }

    var t;
    params.SetInt(0,numcerts);
    for (t=0; t<numcerts; t++) {
	var cert = selected_proxy_certs[t];
	// dump("keyManagerExt.js:deleteProxyCerts(): cert[" + t + "]: " + cert.nickname + "\n");
	params.SetString(t+1, cert.dbKey);  
    }
  
    // The dialog will modify the params.
    // Every param item where the corresponding cert could get deleted,
    // will still contain the db key.
    // Certs which could not get deleted, will have their corrensponding
    // param string erased.
    window.openDialog('chrome://pippki/content/deletecert.xul', "",
		    'chrome,centerscreen,modal', params);
   
    if (params.GetInt(1) == 1) {
	// user closed dialog with OK
	for (t=numcerts-1; t>=0; t--) {
	    var s = params.GetString(t+1);
      	    if (s.length) {
    		// dump("keyManagerExt.js:deleteProxyCerts(): certTreeView: " + certTreeView + "\n");
    		// dump("keyManagerExt.js:deleteProxyCerts(): t: " + t + " cert_index: " + selected_proxy_cert_index[t] + "\n");
	    	// This cert was deleted.
	    	certTreeView.removeCert(selected_proxy_cert_index[t]);
	    }
    	}
	var treeView = certTreeView.QueryInterface(Components.interfaces.nsITreeView);
	// var treeView = selectedCertTree.treeBoxObject.view;
	treeView.selection.clearSelection();
    }
}

function editProxyCerts()
{
    getSelectedProxyCerts();
    var numcerts = selected_proxy_certs.length;
    // dump("keyManagerExt.js:editProxyCerts(): numcerts: " + numcerts + "\n");
    if (!numcerts)
	return;
    for (var t=0; t<numcerts; t++) {
	var cert = selected_proxy_certs[t];
	// dump("keyManagerExt.js:editProxyCerts(): cert[" + t + "]: " + cert.nickname + "\n");
	var certkey = cert.dbKey;
	window.openDialog('chrome://pippki/content/editsslcert.xul', certkey,
		        'chrome,centerscreen,modal');
    }
}

function exportProxyCerts()
{
    dump("keyManagerExt.js:exportProxyCerts(): .............Start.\n");

    getSelectedProxyCerts();
    var numcerts = selected_proxy_certs.length;
    dump("keyManagerExt.js:exportProxyCerts(): numcerts: " + numcerts + "\n");
    if (!numcerts) {
	return;
    }

    var selTab = document.getElementById('certMgrTabbox').selectedItem;
    var selTabID = selTab.getAttribute('id');
    var isUserCert = false;
    var isProxyUserCert = true;
    if (selTabID == 'other_proxy_tab') {
    	isUserCert = true;
    }
    dump("keyManagerExt.js:exportProxyCerts(): .............10.\n");
    exportX509CertsToFile(selected_proxy_certs, isUserCert, isProxyUserCert);

    dump("keyManagerExt.js:exportProxyCerts(): .............End.\n");
}


function myproxy_addCert()
{
    addWebSiteCert();
    ReloadMyProxyCerts();
}


function other_proxy_addCert()
{
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].
    				getService(Components.interfaces.nsIPromptService);
    var certsOnly = promptService.confirm(window,
		     "Import Proxy Keys and/or X.509Cert chain (PKCS#12 or X.509/PKCS#7)",
		     "Do you want to import only certs (X,509/PKCS#7) for existing proxy key?\nCancel will import Keys/Certs in PKCS#12 format."
		     );
    if (certsOnly) {
    	importUserCerts();
    }
    else {
    	restoreCerts();
    }
    ReloadOtherProxyCerts();
}

function other_proxy_signProxyCert()
{

    getSelectedProxyCerts();

    signProxyCertInternal(selected_proxy_certs);
}


/* byte[] */
function readBinDataByStream(/* nsIInputStream */ inputStream)
{
        var biStream = Components.classes["@mozilla.org/binaryinputstream;1"]
		        .createInstance(Components.interfaces.nsIBinaryInputStream);
        biStream.setInputStream(inputStream);
        var binData = biStream.readByteArray(biStream.available());

        biStream.close();
        return binData;
}

/* byte[] */
function readBinDataByFile(/* nsIFile */ aInFile, /* Object */ aLengthObj) {
        if (aInFile.exists() == false ) {
    	    dump("readBinDataByFile(): File: " + aInFile.path + " does not exist.\n");
	    return null;
        }


        var /* nsIIOService */ ios = Components.classes["@mozilla.org/network/io-service;1"]
		        .getService(Components.interfaces.nsIIOService);
        var /* nsIFileProtocolHandler */ fileHandler = ios.getProtocolHandler("file")
		     .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
        var /* nsIURI */ localFileURL = fileHandler.getURLSpecFromFile(aInFile);
        var /* nsIURI */ localFileURL2 = ios.newFileURI(aInFile);

        var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
		        .createInstance(Components.interfaces.nsIFileInputStream);
        fiStream.init(aInFile, 1, 0, false);
        // fiStream.init(aInFile, 0x01, 00004, null);

	var binData = readBinDataByStream(fiStream);
	if (aLengthObj) {
	    aLengthObj.value = binData.length;
	}

	fiStream.close();

    	// LOG("ALRBase64Impl.readBinDataByFile().......................End.");
	return binData;
}

