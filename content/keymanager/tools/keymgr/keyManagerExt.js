/* @(#) $Id: keyManagerExt.js,v 1.3 2011/08/16 15:07:43 subrata Exp $ */

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
var selected_proxy_certs = [];
var gSelected_proxy_cert_index = [];
var selected_proxy_tree_items = [];
var gSelected_proxy_index = [];


var gKeyManagerDialogElem = null;

/*

    TODO:  Implement LogService using Error Console

__logService : null, // Console logging service, used for debugging.
    get _logService() {
        if (!this.__logService)
            this.__logService = Cc["@mozilla.org/consoleservice;1"].
                                getService(Ci.nsIConsoleService);
        return this.__logService;
    },

    log : function (message) {
        if (!this._debug)
            return;
        dump("Login Manager: " + message + "\n");
        this._logService.logStringMessage("Login Manager: " + message);
    },

*/


function keymanager_isSupportedOS()
{
    dump("keymanager_isSupportedOS(): userAgent: " + navigator.userAgent +"\n");

    /*
    var isWin = (navigator.userAgent.indexOf("Win") != -1);
    var isLinux = (navigator.userAgent.indexOf("Linux") != -1);
    var isMac = (navigator.userAgent.indexOf("Mac") != -1);
    if (!(isWin || isLinux || isMac)) {
    	alert("ERROR: WRONG BROWSER USER AGENT (" + navigator.userAgent + ")\n" + 
    		"This tool is currently supported only on Linux_x86-gcc3 and Windows_x86-msvc platforms.");
    	return false;
    }
    */

    return true;
}

function keymanager_initCertDBHandler()
{
    dump("keyManagerExtFF3.keymanager_initCertDBHandler():...........Start.\n");

    keymanager_isSupportedOS();

    var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"]
			.getService(Components.interfaces.nsIX509CertDB);
    if (!xcertdb) {
    	alert("Failed to load XPCOM implemnatation (@mozilla.org/security/x509certdb;1) of nsIX509CertDB interface.\n");
    	dump("Failed to load XPCOM implemnatation (@mozilla.org/security/x509certdb;1) of nsIX509CertDB interface.\n");
	return;
    }

    if (!Components.classes["@avaya.com/pkm/keymanager;1"]) {
    	alert("Failed to load XPCOM implemnatation (@avaya.com/pkm/keymanager;1) of alrIKeyManager interface.\n");
    	dump("Failed to load XPCOM implemnatation (@avaya.com/pkm/keymanager;1) of alrIKeyManager interface.\n");
	return;
    }
    gKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
		    .getService(Components.interfaces.alrIKeyManager);
    if (!gKeyManager) {
    	alert("Failed to load XPCOM implemnatation (@avaya.com/pkm/keymanager;1) of alrIKeyManager interface.\n");
    	dump("Failed to load XPCOM implemnatation (@avaya.com/pkm/keymanager;1) of alrIKeyManager interface.\n");
	return;
    }

    /*
    loginToInternalKeyToken(false);
    */

    gKeyManagerDialogElem = document.getElementById('keymanager');

    dump("keyManagerExtFF3.keymanager_initCertDBHandler():...........End.\n");
}


function LoadUserKeys(aCertcache)
{
    // dump("keyManagerExtFF3.LoadUserKeys():...........Start.\n");

    if (userKeyTreeView) {
    	return;
    }

    keymanager_initCertDBHandler();

    userKeyTreeView = userTreeView;

    /*
    userKeyTreeView = Components.classes[nsCertTree]
		      .createInstance(nsICertTree);
    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    	filterCertCacheForNonProxyCerts(certcache);
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

    // dump("keyManagerExtFF3.LoadUserKeys():...........End.\n");
}

function ReloadUserKeys(aCertcache)
{
    // dump("keyManagerExtFF3.ReloadUserKeys():...........Start.\n");

    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    }
    filterCertCacheForNonProxyCerts(certcache);

    userKeyTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
    userKeyTreeView.selection.clearSelection();

    // ReloadOtherToUserProxyCerts(certcache);

    var rowCnt = userKeyTreeView.rowCount;
    /*
    dump("ReloadUserKeys(): userKeyTreeView.rowCount: " + userKeyTreeView.rowCount + 
    				" userTreeView.rowCount: " + userTreeView.rowCount + "\n");
    */

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

    // dump("keyManagerExtFF3.ReloadUserKeys():...........End.\n");
}

function ReloadNonUserCerts(aCertcache)
{
    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    }
    filterCertCacheForNonProxyCerts(certcache);

    emailTreeView.loadCertsFromCache(certcache, nsIX509Cert.EMAIL_CERT);
    serverTreeView.loadCertsFromCache(certcache, nsIX509Cert.SERVER_CERT);
    // caTreeView.loadCertsFromCache(certcache, nsIX509Cert.CA_CERT);

    // ReloadProxyCerts(certcache);
}



function mine_key_enableButtons()
{

    // dump("keyManagerExtFF3.mine_key_enableButtons():...........Start.\n");

    mine_enableButtons();

    var toggle="false";

    getSelectedCerts();

    var numcerts = selected_certs.length;
    if (!numcerts) {
	toggle="true";
    }
    /*
    if (numcerts > 0) {
    	var selectedCert = selected_certs[0];
	testALRX509Cert(selectedCert);
    }
    */


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

    // dump("keyManagerExtFF3.mine_key_enableButtons():...........End.\n");
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
    		filterCertCacheForNonProxyCerts(certcache);
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
    dump("keyManagerExtFF3.generateSelfSignedCert():...........Start.\n");

    if (!Components.interfaces.alrIKeyManager) {
    	alert("Failed to load XPCOM implemnatation of alrIKeyManager (@avaya.com/pkm/keymanager;1).\n");
	return;
    }

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


    params.SetInt(0, numcerts);
    if (numcerts > 0) {
    	var cert = selected_certs[0];

    	loginToCertToken(cert, false);

    	params.SetInt(0, 1);  
    	params.SetString(1, cert.dbKey);  
    	pkiParams.setISupportAtIndex(1, cert);

	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].
    				getService(Components.interfaces.nsIPromptService);
	
	// Key-pair already exists ==> generate a CSR and
	// then generate Self-signed certificate 
    	params.SetInt(1, 0); 
	var genKeyCSRDialogURL = 'chrome://keymanager/content/tools/genkeycsr/generatePKCS10CSR.xul';
	window.setCursor('wait');
    	window.openDialog(genKeyCSRDialogURL, "",
		    'chrome,centerscreen,resizable,modal', params);
	window.setCursor('auto');
    }
    else {
    	loginToInternalKeyToken(false);

	// No certificate is present ==> create a new key-pair,
	// then CSR and then self-signed certificate
	var genKeyCSRDialogURL = 'chrome://keymanager/content/tools/genkeycsr/generatePKCS10CSR.xul';
	window.setCursor('wait');
    	window.openDialog(genKeyCSRDialogURL, "",
		    'chrome,centerscreen,resizable,modal', params);
	window.setCursor('auto');
    }

    /*
    if (params.GetInt(0) == 0) { // Selected Cancel or failed.
    	dump("keyManagerExtFF3.generateSelfSignedCert(): generateCSR.xul failed.\n");
    	return;
    }
    */

    // dump("keyManagerExtFF3.generateSelfSignedCert(): selected_cert_index([0]: " + selected_cert_index[0] + "\n");
    if (numcerts) {
	var retVal = params.GetInt(0);
	var keepCert = params.GetInt(1);
    	// dump("keyManagerExtFF3.generateSelfSignedCert(): keepCert: " +  keepCert + "\n");
    	if ((retVal == 1) && (keepCert == false)) {
    	    var cert = selected_certs[0];
    	    dump("keyManagerExtFF3.generateSelfSignedCert(): removing old cert: " +
	    	cert.nickname + "(" + cert.subjectName + "/" + cert.serialNumber + ")" + 
		" from display tree.\n"
		);
    	    userKeyTreeView.deleteEntryObject(cert);
    	    // userKeyTreeView.deleteEntryObject(selected_cert_index[0]);
    	    // userTreeView.removeCert(selected_cert_index[0]);
    	}
    }

    var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    certcache.cacheAllCerts();
    ReloadUserKeys(certcache);

    dump("keyManagerExtFF3.generateSelfSignedCert():............End.\n");
}

function generateCSR()
{
    dump("keyManagerExtFF3.generateCSR():............Start.\n");

    if (!Components.interfaces.alrIKeyManager) {
    	alert("Failed to load XPCOM implemnatation of alrIKeyManager (@avaya.com/pkm/keymanager;1).\n");
	return;
    }

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

    params.SetInt(0, numcerts);
    if (numcerts > 0) {
    	var cert = selected_certs[0];
    	params.SetString(1, cert.dbKey);  
    	pkiParams.setISupportAtIndex(1, cert);

    	loginToCertToken(cert, false);

	// Key-pair already exists ==> generate a CSR 
	var genKeyCSRDialogURL = 'chrome://keymanager/content/tools/genkeycsr/generatePKCS10CSR.xul';
	window.setCursor('wait');
    	window.openDialog(
			genKeyCSRDialogURL,
			"",
			'chrome,centerscreen,resizable,modal',
			params
			);
	window.setCursor('auto');
    }
    else {
	// No certificate is present ==> create a new key-pair,
	// then CSR and then self-signed certificate

    	loginToInternalKeyToken(false);

	var genKeyCSRDialogURL = 'chrome://keymanager/content/tools/genkeycsr/generatePKCS10CSR.xul';
	window.setCursor('wait');
    	window.openDialog(
			genKeyCSRDialogURL,
			"",
			'chrome,centerscreen,resizable,modal',
			params
			);
	window.setCursor('auto');
    }


    /*
    if (params.GetInt(0) == 0) { // Selected Cancel or failed.
    	return;
    }
    */

    var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    certcache.cacheAllCerts();
    ReloadUserKeys(certcache);

    dump("keyManagerExtFF3.generateCSR():............End.\n");
}


function filterCertCacheByType(aCertCache, aExcludeProxyCert, aExcludeNonProxyCert, aCertType)
{
    // dump("keyManagerExtFF3.filterCertCacheByType():..............Start.\n");
    // dump("aExcludeProxyCert: " + aExcludeProxyCert + " aExcludeNonProxyCert: " + aExcludeNonProxyCert + " aCertType: " + aCertType + "\n");


    var keyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
		    .getService(Components.interfaces.alrIKeyManager);

    var /* nsIX509CertList */ cachedCerts = aCertCache.getX509CachedCerts();
    var /* nsISimpleEnumerator */ cachedCertsEnum = cachedCerts.getEnumerator();

    var certCnt = 0;
    var toBeDeletedCerts = [];
    while (cachedCertsEnum.hasMoreElements ()) {
        var cachedCertObj = cachedCertsEnum.getNext ();
	certCnt++;
	if (!cachedCertObj) {
	    continue;
	}
	var cachedCert = cachedCertObj.QueryInterface (Components.interfaces.nsIX509Cert);
	if (!cachedCert) {
	    continue;
	}

	var isProxyCert = keyManager.isProxyCert(cachedCert);

	if (aExcludeProxyCert && isProxyCert) {
	    toBeDeletedCerts[toBeDeletedCerts.length] = cachedCert;
	    continue;
	}
	if (aExcludeNonProxyCert && !isProxyCert) {
	    toBeDeletedCerts[toBeDeletedCerts.length] = cachedCert;
	    continue;
	}
	/*
	// TODO:  Remove overriden certs that are not proxy-certs
	if (aExcludeNonProxyCert && isProxyCert) {
	    var certName = "";
	    try {
	    	certName = cachedCert->commonName;
	    } catch (ex) {} 
	    if (certCommonName == "(Not Stored)") {
	    	toBeDeletedCerts[toBeDeletedCerts.length] = cachedCert;
	    	continue;
	    }
	}
	*/
    }
    // dump("keyManagerExtFF3.filterCertCacheByType(): certCnt: " + certCnt + "\n");
    // dump("keyManagerExtFF3.filterCertCacheByType(): toBeDeletedCerts.length: " + toBeDeletedCerts.length + "\n");

    for (var i = 0; i < toBeDeletedCerts.length; i++) {
    	var cert = toBeDeletedCerts[i];
	cachedCerts.deleteCert(cert);
    }
    aCertCache.cacheCertList(cachedCerts);

    // dump("keyManagerExtFF3.filterCertCacheByType():..............End.\n");
}

function filterCertCacheForProxyCerts(aCertCache)
{
    filterCertCacheByType(aCertCache, false, true);
}

function filterCertCacheForNonProxyCerts(aCertCache)
{
    filterCertCacheByType(aCertCache, true, false);
}


function refreshAllCertTrees()
{
    dump("keyManagerExtFF3.refreshAllCertTrees():............End.\n");

    var certcache = Components.classes[nsNSSCertCache]
    			.createInstance(nsINSSCertCache);

    certcache.cacheAllCerts();
    filterCertCacheForNonProxyCerts(certcache);
    ReloadUserKeys(certcache);

    certcache.cacheAllCerts();
    filterCertCacheForProxyCerts(certcache);
    ReloadProxyCerts(certcache);

    dump("keyManagerExtFF3.refreshAllCertTrees():............End.\n");
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
    var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

    var cert = null;
    dialogParams.SetInt(0, numcerts);
    if (numcerts) {
    	cert = selected_certs[0];
    	setPrefStringValue("keymgr.scep.client.form.user.cert.nickName.menulist", cert.nickname);

    	// dialogParams.SetString(0, cert.dbKey);  
    	pkiParams.setISupportAtIndex(1, cert);	// User-cert 
    	pkiParams.setISupportAtIndex(2, null);	// CA-Cert
    	pkiParams.setISupportAtIndex(3, null);	// SCEP-recipient cert
	dialogParams.SetInt(0, 1);		// number of certs

    	dialogParams.SetString(0, ""); 		// SCEP-server URL
    	dialogParams.SetString(1, "PKCSReq");		// SCEP-messgage type
    	dialogParams.SetInt(1, 0);		// Is SCEP-server RA?
    }
    loginToCertToken(cert, false);

    /*
    setPrefStringValue("keymgr.scep.client.form.scep.req.msgType.menuList",
    			"keymgr.scep.client.form.scep.req.msgType.PKCSReq");
    */

    /*
    //check for an existing SCEP Client Wizard window and focus it; it's not application modal
    const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
    var lastScepClient = kWindowMediator.getMostRecentWindow("avaya:scepclient");
    if (lastScepClient) {
        lastScepClient.focus();
    }
    else {
    }
    */
    window.setCursor('wait');
    window.openDialog('chrome://keymanager/content/tools/scepclient/scepClientWizard.xul',
    			'_blank',
			'chrome,centerscreen,resizable,modal,dialog=no,titlebar',
			dialogParams
			);
    window.setCursor('auto');

    /*
    if (dialogParams.GetInt(0) == 0) { // Selected Cancel or failed.
    	return;
    }
    */

    var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    certcache.cacheAllCerts();
    filterCertCacheForNonProxyCerts(certcache);

    caTreeView.loadCertsFromCache(certcache, nsIX509Cert.CA_CERT);
    caTreeView.selection.clearSelection();

    ReloadUserKeys(certcache);
}

function signProxyCert()
{

    getSelectedCerts();

    signProxyCertInternal(selected_certs);
}

function signProxyCertInternal(aSelectedCerts)
{
    // dump("keyManagerExtFF3.signProxyCertInternal():............Start.\n");

    var numcerts = aSelectedCerts.length;

    if (numcerts > 1) {
    	alert("Select only one certificate.");
    	return;
    }
    if (!numcerts) {
    	alert("Select the certificate to be used for signing.");
    	return;
    }

    var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    			.createInstance(Components.interfaces.nsIPKIParamBlock);
    var params = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

    var selectedSignerCert = aSelectedCerts[0];

    var xkeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
    			.getService(Components.interfaces.alrIKeyManager);
    var isCACert = xkeyManager.isCACert(selectedSignerCert);
    var bcIsCA = getCertBasicConstraintsIsCA(selectedSignerCert);
    var selfSignedCert = selectedSignerCert.QueryInterface(Components.interfaces.nsIX509Cert3).isSelfSigned; 
    var selfSignedCACert = (bcIsCA && selfSignedCert);

    var isProxySignerCert = true; 
    if (selfSignedCert) {
	var checkStateObj = new Object();
	checkStateObj.value = !bcIsCA; // By default, if the cert has CA-bits on, then it is for signing non-proxy cert
    	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService();
    	promptService = promptService.QueryInterface(Components.interfaces.nsIPromptService);
    	var dialogOk = promptService.confirmCheck(
			window,
		     	"Sign a (Proxy) Certificate",
		     	"Selected certificate is Root certificate. You can use this certifictae as a CA or \nas a Proxy Cert Issuer to sign another certificate. Press cancel to terminate this task.",
			"Yes, sign as a Proxy Issuer.",
			checkStateObj
		     	);
	if (!dialogOk) {
    	    return;
	}
    	isProxySignerCert = checkStateObj.value;
    }
    else {
	if (bcIsCA) {
    	    isProxySignerCert = false; // non-self-signed CA Certs cannot be used for signing proxy cert 
	}
    }
    // dump("isCACert: " + isCACert + " bcIsCA: " + bcIsCA + " selfSignedCert: " + selfSignedCert + " selfSignedCACert: " + selfSignedCACert + " isProxySignerCert: " + isProxySignerCert + "\n");

    if (isProxySignerCert) {
    	var pcPathLengthConstraintStr = getProxyCertConstraintPathLength(selectedSignerCert);
    	if (pcPathLengthConstraintStr && (pcPathLengthConstraintStr != "")) {
	    var pcPathLengthConstraint = parseInt(pcPathLengthConstraintStr);
	    // dump("pcPathLengthConstraint: " + pcPathLengthConstraint + "\n");
	    if (pcPathLengthConstraint <= 0) {
	        alert(
		    "Selected certificate is a proxy cert with constraint path length equal to zero.\n" + 
		    "You cannot use a proxy cert with constraint length equal to zero to sign another proxy cert.\n" + 
	    	    "Sorry! Selected certificate is not eligible to be either proxy cert issuer.\n" + 
	    	    "Please select another cert.\n"
		    );
    	        return;
	    }
        }
    }

    params.SetInt(0, numcerts);
    params.SetString(1, selectedSignerCert.dbKey);  
    pkiParams.setISupportAtIndex(1, selectedSignerCert);
    loginToCertToken(selectedSignerCert, false);

    if (isProxySignerCert) {
    	params.SetInt(1, 1);
    	params.SetString(0, "signProxyCert");
	var signProxyCertDialogURL = 'chrome://keymanager/content/tools/signcerttool/signProxyCertTool.xul';

	window.setCursor('wait');
    	window.openDialog(
			signProxyCertDialogURL,
			"",
			'chrome,centerscreen,resizable,modal,dialog=no,titlebar',
			params
			);
	window.setCursor('auto');
    }
    else {
    	params.SetInt(1, 0);
    	params.SetString(0, "signCert");
	var signCertByCADialogURL = 'chrome://keymanager/content/tools/signcerttool/signCertByCATool.xul';

	window.setCursor('wait');
    	window.openDialog(
			signCertByCADialogURL,
			"",
			'chrome,centerscreen,resizable,modal,dialog=no,titlebar',
			params
			);
	window.setCursor('auto');
    }

    if (params.GetInt(0) == 0) { // Selected Cancel or failed.
    	return;
    }
    // dump("keyManagerExtFF3.signProxyCertInternal():............30.\n");

    var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    certcache.cacheAllCerts();

    if (isProxySignerCert) {
    	filterCertCacheForProxyCerts(certcache);
    	ReloadProxyCerts(certcache);
    }
    else {
    	filterCertCacheForNonProxyCerts(certcache);
    	ReloadUserKeys(certcache);
	ReloadNonUserCerts(certcache);
    }

    // dump("keyManagerExtFF3.signProxyCertInternal():............End.\n");
}

function getProxyCertConstraintPathLength(aProxyCert) 
{
    var xkeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);

    var /* nsIPersistentProperties */ certProps;
    certProps = Components.classes["@mozilla.org/persistent-properties;1"].
		    createInstance(Components.interfaces.nsIPersistentProperties);

    try {
    	xkeyManager.exportX509v3CertExtnToProperties(aProxyCert, "proxyCertInfo", certProps);
    } catch (ex) {
    	return null;
    }

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

function getCertBasicConstraintsIsCA(aX509Cert) 
{
    // dump("keyManagerExtFF3.getCertBasicConstraintsIsCA():..............Start.\n");

    var xkeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);

    var /* nsIPersistentProperties */ certProps;
    certProps = Components.classes["@mozilla.org/persistent-properties;1"].
		    createInstance(Components.interfaces.nsIPersistentProperties);


    var bcExtensionName = "basicConstraints";
    var bcActiveName = "basicConstraints";
    var bcIsCAName = "basicConstraints-cA-radio";

    try {
    	xkeyManager.exportX509v3CertExtnToProperties(aX509Cert, bcExtensionName, certProps);
    } catch (ex) {
    	return false;
    }

    var bcActive = false;
    var propValue = null;
    try {
	propValue = certProps.getStringProperty(bcActiveName);
    } catch (ex) {}
    if (propValue && (propValue == "true")) {
    	bcActive = true;
    }
    // dump("getCertBasicConstraintsIsCA(): cert: " + aX509Cert.nickname + " bcActive: " + bcActive + "\n");
    if (!bcActive) {
    	return false;
    }

    var bcIsCA = false;
    propValue = null;
    try {
    	propValue = certProps.getStringProperty(bcIsCAName);
    } catch (ex) {}
    if (propValue && (propValue == "true")) {
    	bcIsCA = true;
    }
    // dump("getCertBasicConstraintsIsCA(): cert: " + aX509Cert.nickname + " bcIsCA: " + bcIsCA + "\n");
    if (!bcIsCA) {
    	return false;
    }

    // dump("keyManagerExtFF3.getCertBasicConstraintsIsCA():..............End.\n");
    return bcIsCA;
}


function handleProxyCertTabSelection(aSelectedTab, ev)
{
    var certTreeView = null;
    if ("me2other_proxy_tab" == aSelectedTab.id) {
    	certTreeView = LoadUserToOtherProxyCerts();
    }
    else if ("other2me_proxy_tab" == aSelectedTab.id) {
    	certTreeView = LoadOtherToUserProxyCerts();
    }
    else {
    	return;
    }
    // aSelectedTab.certTree = certTreeView;
}

function LoadProxyCerts(aCertcache)
{
    // dump("keyManagerExtFF3.LoadProxyCerts():..............Start.\n");

    var certcache = aCertcache;
    certcache = null;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    }
    filterCertCacheForProxyCerts(certcache);

    LoadUserToOtherProxyCerts(certcache);
    LoadOtherToUserProxyCerts(certcache);

    // dump("keyManagerExtFF3.LoadProxyCerts():..............End.\n");
}

function ReloadProxyCerts(aCertcache)
{
    var certcache = aCertcache;

    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    }
    filterCertCacheForProxyCerts(certcache);

    ReloadUserToOtherProxyCerts(certcache);
    ReloadOtherToUserProxyCerts(certcache);
}

/*
function processProxyCertInTree(aCertTreeView, isProxyCertTree, aProxyTreeViewObj)
{
    dump("\n");
    dump("keyManagerExtFF3.processProxyCertInTree(" + aCertTreeView + ", " + isProxyCertTree + " aProxyTreeViewObj: " + aProxyTreeViewObj + "):...........Start.\n");

    var totProxyCnt = 0;
    var currTreeView = null;
    var currCertTree = null;
    var rowCnt = 0;

    // currTreeView = aCertTreeView;
    currCertTree  = aCertTreeView.QueryInterface(Components.interfaces.nsICertTree);
    currTreeView  = aCertTreeView.QueryInterface(Components.interfaces.nsITreeView);
    rowCnt = currTreeView.rowCount;
    dump("keyManagerExtFF3.processProxyCertInTree(): rowCnt: " + rowCnt + "\n");
    if (aProxyTreeViewObj) {
    	dump("keyManagerExtFF3.processProxyCertInTree(): hideCount: " + aProxyTreeViewObj.hideCount + "\n");
    }


    totProxyCnt = 0;
    for (var i = rowCnt-1; i >= 0; i--) {
    	if (currTreeView.isContainer(i)) {
    	    // dump("keyManagerExtFF3.processProxyCertInTree(): ignoring container row: "+ i + "\n");
	    continue;
	}
	var objCert = currTreeView.getCert(i);
	if (!objCert) {
    	    // dump("keyManagerExtFF3.processProxyCertInTree(): ignoring row: "+ i + "\n");
	    continue;
	}
	var cert = objCert.QueryInterface(Components.interfaces.nsIX509Cert);
	if (!cert) {
    	    dump("keyManagerExtFF3.processProxyCertInTree(): ignoring row: "+ i + " elm: "+ cert + "\n");
	    continue;
	}
	var isProxyCert = gKeyManager.isProxyCert(cert);
	if (!isProxyCertTree && !isProxyCert) {
    	    dump("keyManagerExtFF3.processProxyCertInTree(): tree is not for proxy and cert is not proxy - keeping row: "+ i + "\n");
	    continue;
	}
	if (isProxyCertTree && isProxyCert) {
    	    dump("keyManagerExtFF3.processProxyCertInTree(): tree is for proxy and cert is proxy - keeping row: "+ i + "\n");
	    continue;
	}
	totProxyCnt++;
	currTreeView.deleteEntryObject(i);
    	// dump("keyManagerExtFF3.processProxyCertInTree(): is a proxy - removed row: "+ i + "\n");
    }
    // dump("keyManagerExtFF3.processProxyCertInTree(certTree, " +  isProxyCertTree + "): totProxyCnt: " + totProxyCnt + " certs are removed.\n");

    dump("keyManagerExtFF3.processProxyCertInTree():...........End.\n");
}
*/

//class constructor
function ProxyTreeView(aCertTreeView) {
    this.certTreeView = aCertTreeView;
};

//class definition
ProxyTreeView.prototype = {

    certTreeView: null,

    // nsICertTree interface methods
    loadCerts:		function(type){ this.certTreeView.loadCerts(type); },
    loadCertsFromCache:	function(cache, type){ this.certTreeView.loadCerts(cache, type); },
    getCert:		function(row){ return this.certTreeView.getCert(row); },
    getTreeItem:	function(row){ return this.certTreeView.getTreeItem(row); },
    isHostPortOverride:	function(row){ return this.certTreeView.isHostPortOverride(row); },
    deleteEntryObject:	function(row){ return this.certTreeView.deleteEntryObject(row); },

    // nsITreeView interface methods
    get rowCount ()	{ return this.certTreeView.rowCount; },

    get selection ()	{if (!this.certTreeView) {return null;}  return this.certTreeView.selection; },
    set selection (aSelection) {if (!this.certTreeView) {return;}  this.certTreeView.selection = aSelection; },

    getRowProperties:	function(row,props){ return this.certTreeView.getRowProperties(row,props);},
    getCellProperties:	function(row,column,props){ return this.certTreeView.getCellProperties(row,column,props);},
    getColumnProperties:function(column,columnElement,props){ return this.certTreeView.getColumnProperties(column,columnElement,props);},

    isContainer:	function(row){ return this.certTreeView.isContainer(row); },
    isContainerOpen:	function(row){ return this.certTreeView.isContainerOpen(row); },
    isContainerEmpty:	function(row){ return this.certTreeView.isContainerEmpty(row); },

    isSeparator:	function(row){ return this.certTreeView.isSeparator(row); },

    isSorted:		function(){ return this.certTreeView.isSorted(); },

    canDrop:		function(row,orientation){ return this.certTreeView.canDrop(row, orientation); },
    drop:		function(row,orientation){ return this.certTreeView.drop(row, orientation); },

    getParentIndex:	function(row){ return this.certTreeView.getParentIndex(row); },
    hasNextSibling:	function(row,afterIndex){ return this.certTreeView.hasNextSibling(row, afterIndex); },
    getLevel:		function(row){ return this.certTreeView.getLevel(row); },
    getImageSrc:	function(row,column){ return this.certTreeView.getImageSrc(row,column); },
    getProgressMode:	function(row,column){ return this.certTreeView.getProgressMode(row,column); },

    getCellValue:	function(row,column){ return this.certTreeView.getCellValue(row,column); },
    getCellText :	function(row,column){
	// dump("proxyTreeView(): getCellText(" + row + ", " + column.id + "): ..............10.\n");
	var columnId = column.id;

	
	// Reuse already implemented columns.
	// Only implement proxy-cert related columns: delegatecol, issuercol
	if (! (("delegatecol" == column.id) || ("issuercol" == column.id))) {
    	    var cellText = null;
	    try {
	    	cellText = this.certTreeView.getCellText(row, column);
	    } catch (ex) { }
	    return cellText;
	}

	var colText = "";
	var objCert = this.certTreeView.getCert(row);
	if (!objCert) {
	    return colText;
	}
	var /* nsIX509Cert */ cert = objCert.QueryInterface(Components.interfaces.nsIX509Cert);
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

    setTree:		function(treebox){ this.certTreeView.setTree(treebox); },

    toggleOpenState:	function(row){ return this.certTreeView.toggleOpenState(row); },
    cycleHeader:	function(column){ this.certTreeView.cycleHeader(column); },
    selectionChanged:	function(treebox){ this.certTreeView.selectionChanged(); },
    cycleCell:		function(row,column){ return this.certTreeView.cycleCell(row,column); },
    isEditable:		function(row,column){ return this.certTreeView.isEditable(row,column); },
    isSelectable:	function(row,column){ return this.certTreeView.isSelectable(row,column); },

    setCellValue:	function(row,column,value){ return this.certTreeView.setCellValue(row,column,value); },
    setCellText:	function(row,column,value){ return this.certTreeView.setCellText(row,column,value); },

    performAction:	function(action){ return this.certTreeView.performAction(action); },
    performActionOnRow:	function(action, row){ return this.certTreeView.performActionOnRow(action, row); },
    performActionOnCell: function(action, row, column){ return this.certTreeView.performActionOnRow(action, row, column); },

    // method of nsISupports interface
    QueryInterface: function(aIID) {
	if (
	    !aIID.equals(Components.interfaces.nsICertTree) &&
	    !aIID.equals(Components.interfaces.nsITreeView) &&
	    !aIID.equals(Components.interfaces.nsISupports)
	    ) {
	    throw Components.results.NS_ERROR_NO_INTERFACE;
	}
	return this;
    }
}

function LoadUserToOtherProxyCerts(aCertcache)
{
    // dump("keyManagerExtFF3.LoadUserToOtherProxyCerts():...........Start.\n");

    if (userProxyTreeView) {
    	return userProxyTreeView;
    }


    userProxyTreeView = Components.classes[nsCertTree]
		        .createInstance(nsICertTree);
    var pView = new ProxyTreeView(userProxyTreeView);

    ReloadUserToOtherProxyCerts(aCertcache);


    // document.getElementById('myProxy-tree').treeBoxObject.view = userProxyTreeView;
    var myProxyTree = document.getElementById('myProxy-tree');
    myProxyTree.treeBoxObject.view = pView;

    // myProxyTree.treeBoxObject.view does not return pView, instead returns a nsITreeView.
    // So, we cache the userProxyTreeView object in the myProxyTree.
    myProxyTree.certTreeView = userProxyTreeView;

    // 
    // userProxyTreeView = pView;
    //


    /*
    dump("keyManagerExtFF3.LoadUserToOtherProxyCerts(): userProxyTreeView: " + userProxyTreeView + "\n");
    dump("keyManagerExtFF3.LoadUserToOtherProxyCerts(): myProxyTree.certTreeView: " + myProxyTree.certTreeView + "\n");
    */

    // dump("keyManagerExtFF3.LoadUserToOtherProxyCerts():...........End.\n");

    return userProxyTreeView;
}

function ReloadUserToOtherProxyCerts(aCertcache)
{
    // dump("keyManagerExtFF3.ReloadUserToOtherProxyCerts():...........Start.\n");

    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    	filterCertCacheForProxyCerts(certcache);
    }

    // userProxyTreeView.loadCertsFromCache(certcache, nsIX509Cert.EMAIL_CERT);
    userProxyTreeView.loadCertsFromCache(certcache, nsIX509Cert.SERVER_CERT);
    if (userProxyTreeView.selection) {
    	userProxyTreeView.selection.clearSelection();
    }

    // dump("keyManagerExtFF3.ReloadUserToOtherProxyCerts():...........End.\n");
}

function myproxy_enableButtons(aCertTree, ev)
{
    // dump("keyManagerExtFF3.myproxy_enableButtons():...........Start.\n");

    gSelectedProxyTree = aCertTree;
    // dump("keyManagerExtFF3.myproxy_enableButtons(): gSelectedProxyTree: " + gSelectedProxyTree + "\n");
    var selTab = document.getElementById('certMgrTabbox').selectedItem;
    selTab.certTree = aCertTree; 

    var toggle="false";

    getSelectedProxyCerts();

    var numcerts = selected_proxy_certs.length;
    if (!numcerts) {
	toggle="true";
    }
    // dump("keyManagerExtFF3.myproxy_enableButtons(): numcerts: " + numcerts + "\n");
    // dump("keyManagerExtFF3.myproxy_enableButtons(): toggle: " + toggle + "\n");

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

    // dump("keyManagerExtFF3.myproxy_enableButtons():...........End.\n");
}

function LoadOtherToUserProxyCerts(aCertcache)
{
    // dump("keyManagerExtFF3.LoadOtherToUserProxyCerts():...........Start.\n");

    if (otherProxyTreeView) {
    	return otherProxyTreeView;
    }
    otherProxyTreeView = Components.classes[nsCertTree]
		        .createInstance(nsICertTree);

    var pView = new ProxyTreeView(otherProxyTreeView);

    // otherProxyTreeView = otherProxyTreeView.QueryInterface(Components.interfaces.nsICertTree);
    ReloadOtherToUserProxyCerts(aCertcache);

    // document.getElementById('otherProxy-tree').treeBoxObject.view = otherProxyTreeView;
    var otherProxyTree = document.getElementById('otherProxy-tree');

    otherProxyTree.treeBoxObject.view = pView;


    // otherProxyTree.treeBoxObject.view does not return pView, instead returns a nsITreeView.
    // So, we cache the otherProxyTreeView object in the myProxyTree.
    otherProxyTree.certTreeView = otherProxyTreeView;

    //
    // otherProxyTreeView = pView;
    //


    /*
    dump("keyManagerExtFF3.LoadOtherToUserProxyCerts(): otherProxyTree.certTreeView: " + otherProxyTree.certTreeView + "\n");
    dump("keyManagerExtFF3.LoadOtherToUserProxyCerts(): otherProxyTreeView: " + otherProxyTreeView + "\n");
    dump("keyManagerExtFF3.LoadOtherToUserProxyCerts(): serverTreeView: " + serverTreeView + "\n");
    */


    // dump("keyManagerExtFF3.LoadOtherToUserProxyCerts():...........End.\n");
    return otherProxyTreeView;
}

function ReloadOtherToUserProxyCerts(aCertcache)
{
    // dump("keyManagerExtFF3.ReloadOtherToUserProxyCerts():...........Start.\n");

    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    	filterCertCacheForProxyCerts(certcache);
    }

    otherProxyTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
    if (otherProxyTreeView.selection) {
    	otherProxyTreeView.selection.clearSelection();
    }

    // dump("keyManagerExtFF3.ReloadOtherToUserProxyCerts():...........End.\n");
}

/*
function refreshCertTree(aCertcache, certTreeView, certType)
{
    // dump("keyManagerExtFF3.refreshCertTree():...........Start.\n");

    var certcache = aCertcache;
    if (!certcache) {
    	certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    	certcache.cacheAllCerts();
    	filterCertCacheForNonProxyCerts(certcache);
    }
    certTreeView.loadCertsFromCache(certcache, certType);

    switch(certType) {
    	case nsIX509Cert.USER_CERT:
	    break;
    }

    // TODO: Incomplete ..........

    // dump("keyManagerExtFF3.refreshCertTree():...........End.\n");
}
*/


function other_proxy_enableButtons(aCertTree, ev)
{
    // dump("keyManagerExtFF3.other_proxy_enableButtons():...........Start.\n");

    gSelectedProxyTree = aCertTree;

    var selTab = document.getElementById('certMgrTabbox').selectedItem;
    selTab.certTree = aCertTree; 

    var toggle="false";

    getSelectedProxyCerts();
    var numcerts = selected_proxy_certs.length;
    if (!numcerts) {
	toggle="true";
    }
    // dump("keyManagerExtFF3.other_proxy_enableButtons(): numcerts: " + numcerts + "\n");
    // dump("keyManagerExtFF3.other_proxy_enableButtons(): toggle: " + toggle + "\n");

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

    // dump("keyManagerExtFF3.other_proxy_enableButtons():...........End.\n");
}

function getSelectedProxyCerts()
{
    // dump("keyManagerExtFF3.getSelectedProxyCerts():...........Start.\n");

    getSelectedProxyTreeItems();

    // dump("keyManagerExtFF3.getSelectedProxyCerts():...........End.\n");
}

function getSelectedProxyTreeItems()
{
    // dump("keyManagerExtFF3.getSelectedProxyTreeItems():...........Start.\n");

    // getSelectedCertTreeView();
   

    var selTab = document.getElementById('certMgrTabbox').selectedItem;
    if (selTab.certTree) {
    	gSelectedProxyTree = selTab.certTree;
    }
    if (!gSelectedProxyTree) {
    	dump("keyManagerExtFF3.getSelectedProxyTreeItems(): NULL gSelectedProxyTree.\n");
    	return;
    }
    /*
    items = gSelectedProxyTree.selection;
    if (ca_tab.selected) {
        items = caTreeView.selection;
    } else if (mine_tab.selected) {
        items = userTreeView.selection;
    }
    else {
    }
    */

    var treeView = gSelectedProxyTree.treeBoxObject.view;
    // dump("keyManagerExtFF3.getSelectedProxyTreeItems(): treeView: " + treeView + "\n");

    var items = treeView.selection;
    // dump("keyManagerExtFF3.getSelectedProxyTreeItems(): items: " + items + "\n");


    var certTreeView = gSelectedProxyTree.certTreeView;

  selected_proxy_certs = [];
  selected_proxy_tree_items = [];
  gSelected_proxy_cert_index = [];
  gSelected_proxy_index = [];

  var tree_item = null;
  var cert = null;
  var nr = 0;
  if (items != null) nr = items.getRangeCount();
  // dump("keyManagerExtFF3.js:getSelectedProxyTreeItems(): nr: " + nr + "\n");
  if (nr > 0) {
    for (var i=0; i<nr; i++) {
      var o1 = {};
      var o2 = {};
      items.getRangeAt(i, o1, o2);
      var min = o1.value;
      var max = o2.value;
      for (var j=min; j<=max; j++) {

        tree_item = certTreeView.getTreeItem(j);
   	// dump("keyManagerExtFF3.getSelectedProxyTreeItems(): row: " + j + " tree_item: " + tree_item + "\n");
	if (tree_item) {
          var sc = selected_proxy_tree_items.length;
          selected_proxy_tree_items[sc] = tree_item;
          gSelected_proxy_index[sc] = j;
	}
	cert = certTreeView.getCert(j);
   	// dump("keyManagerExtFF3.getSelectedProxyTreeItems(): row: " + j + " cert: " + cert + "\n");
	if (cert) {
	  var sc = selected_proxy_certs.length;
	  selected_proxy_certs[sc] = cert;
	  gSelected_proxy_cert_index[sc] = j;
	}
      }
    }
  }

    /*
    dump("keyManagerExtFF3.js:getSelectedProxyTreeItems(): selected_proxy_tree_items.length: " + selected_proxy_tree_items.length + "\n");
    dump("keyManagerExtFF3.js:getSelectedProxyTreeItems(): selected_proxy_certs.length: " + selected_proxy_certs.length + "\n");
    dump("keyManagerExtFF3.js:getSelectedProxyTreeItems(): gSelected_proxy_index.length: " + gSelected_proxy_index.length + "\n");
    dump("keyManagerExtFF3.js:getSelectedProxyTreeItems(): gSelected_proxy_cert_index.length: " + gSelected_proxy_cert_index.length + "\n");
    */

    /*
    if (selected_proxy_certs.length > 0) {
    	var selectedCert = selected_proxy_certs[0];
	testALRX509Cert(selectedCert);
    }
    */

    // dump("keyManagerExtFF3.getSelectedProxyTreeItems():...........End.\n");
}

function testALRX509Cert(aX509Cert)
{
	try {
	    var alrX509Cert = gKeyManager.getALRX509Cert(aX509Cert);
	    alrX509Cert.test1();
	} catch (ex) {
	    dump("gKeyManager.getALRX509Cert() failed - ex: " + ex + "\n");
	}
}

function viewProxyCerts()
{
    // getSelectedProxyTreeItems();
    getSelectedProxyCerts();

    var numcerts = selected_proxy_certs.length;
    // dump("keyManagerExtFF3.js:viewProxyCerts(): numcerts: " + numcerts + "\n");
    if (!numcerts) {
	return;
    }

    for (var t=0; t<numcerts; t++) {
	viewCertHelper(window, selected_proxy_certs[t]);
    }
}

function deleteProxyCerts()
{
    // dump("keyManagerExtFF3.deleteProxyCerts():......................Start.\n");

    getSelectedProxyTreeItems();

    // var numcerts = selected_proxy_certs.length;
    var numcerts = selected_proxy_tree_items.length;
    // dump("keyManagerExtFF3.js:deleteProxyCerts(): numcerts: " + numcerts + "\n");
    if (!numcerts) {
	alert("No cert is selected for deletion.");
	return;
    }

  
    var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
    var selTab = document.getElementById('certMgrTabbox').selectedItem;
    var selTabID = selTab.getAttribute('id');

    /*
    dump("keyManagerExtFF3.js:deleteProxyCerts(): selTab: " + selTabID + "\n");
    // dump("keyManagerExtFF3.js:deleteProxyCerts(): selectedCertTree: " + selectedCertTree + "(" + selectedCertTree.id + ")\n");
    // certTreeView = certTreeView.QueryInterface(Components.interfaces.nsICertTree);
    // dump("keyManagerExtFF3.js:deleteProxyCerts(): certTreeView: " + certTreeView + "\n");
    */

    var certTypeFlag = null;
    if (selTabID == 'me2other_proxy_tab') {
    	// params.SetString(0, selTabID);
    	certTypeFlag = 'websites_tab';
    } 
    else if (selTabID == 'other2me_proxy_tab') {
    	// params.SetString(0, selTabID);
    	certTypeFlag = 'mine_tab';
    } 
    if (!certTypeFlag) {
	return;
    }

    var params = Components.classes[nsDialogParamBlock].createInstance(nsIDialogParamBlock);
    params.SetNumberStrings(numcerts+1);
    params.SetString(0, certTypeFlag);
    params.SetInt(0, numcerts);

    var t;
    for (t=0; t<numcerts; t++) {
	/*
	var cert = selected_proxy_certs[t];
	dump("keyManagerExtFF3.js:deleteProxyCerts(): cert[" + t + "]: " + cert.nickname + "\n");
	params.SetString(t+1, cert.dbKey);  
	*/

	var row = gSelected_proxy_index[t];
    	// dump("keyManagerExtFF3.js:deleteProxyCerts(): t: " + t + " row: " + row + "\n");

        var tree_item = selected_proxy_tree_items[t];
        var c = tree_item.cert;
        if (!c) {
          params.SetString(t+1, tree_item.hostPort);
        }
        else {
          params.SetString(t+1, c.commonName);
          // dump("keyManagerExtFF3.js:deleteProxyCerts(): commonName: " + c.commonName + "\n");
        }
    }
  
    // The dialog will modify the params.
    // Every param item where the corresponding cert could get deleted,
    // will still contain the db key.
    // Certs which could not get deleted, will have their corrensponding
    // param string erased.
    window.openDialog('chrome://pippki/content/deletecert.xul', "",
		    'chrome,centerscreen,modal', params);
   
    var selectedCertTree = gSelectedProxyTree;
    if (selTab.certTree) {
	selectedCertTree = selTab.certTree;
    }
    var certTreeView = selectedCertTree.certTreeView;
    var treeView = certTreeView.QueryInterface(Components.interfaces.nsITreeView);
    // dump("keyManagerExtFF3.js:deleteProxyCerts(): certTreeView: " + certTreeView + "\n");

    var retVal = params.GetInt(1);
    // dump("keyManagerExtFF3.js:deleteProxyCerts(): retVal: " + retVal + "\n");
    if (retVal == 1) {
	// user closed dialog with OK
	var rowsDeleted = [];
	for (t=numcerts-1; t>=0; t--) {
	    var s = params.GetString(t+1);
    	    // dump("keyManagerExtFF3.js:deleteProxyCerts(): t: " + t + " s: " + s + "\n");
      	    if (s.length) {
	    	// This cert was deleted.
		var row = gSelected_proxy_index[t];
    		// dump("keyManagerExtFF3.js:deleteProxyCerts(): deleted_cert: t: " + t + " row: " + row + "\n");
		rowsDeleted[rowsDeleted.length] = row;
	    }
    	}
	for (var i = 0; i < rowsDeleted.length; i++) {
	    var row = rowsDeleted[i];
    	    // dump("keyManagerExtFF3.js:deleteProxyCerts(): deleted_row: " + row + "\n");
	    certTreeView.deleteEntryObject(row);
	}

        selected_proxy_tree_items = [];
        gSelected_proxy_index = [];

	treeView.selection.clearSelection();
	// refreshAllCertTrees();

	/*
    	dump("keyManagerExtFF3.js:deleteProxyCerts(): selTab: " + selTabID + "\n");
        if (selTabID == 'me2other_proxy_tab') {
	    ReloadUserToOtherProxyCerts();
	}
        else if (selTabID == 'other2me_proxy_tab') {
	    ReloadOtherToUserProxyCerts();
	}
	*/

    }
    // dump("keyManagerExtFF3.deleteProxyCerts():......................End.\n");
}

function editProxyCerts()
{
    dump("keyManagerExtFF3.js:editProxyCerts(): .............Start.\n");

    getSelectedProxyCerts();

    var numcerts = selected_proxy_certs.length;
    // dump("keyManagerExtFF3.js:editProxyCerts(): numcerts: " + numcerts + "\n");
    if (!numcerts) {
	return;
    }

    var selTab = document.getElementById('certMgrTabbox').selectedItem;
    var selTabID = selTab.getAttribute('id');

    for (var t=0; t<numcerts; t++) {
	var cert = selected_proxy_certs[t];
	// dump("keyManagerExtFF3.js:editProxyCerts(): cert[" + t + "]: " + cert.nickname + "\n");
	var certkey = cert.dbKey;
    	if (selTabID == 'me2other_proxy_tab') {
	    window.openDialog('chrome://pippki/content/editsslcert.xul', certkey,
		        'chrome,centerscreen,modal');
	}
    	else if (selTabID == 'other2me_proxy_tab') {
	    window.openDialog('chrome://pippki/content/editsslcert.xul', certkey,
		        'chrome,centerscreen,modal');
	}
    }
    dump("keyManagerExtFF3.js:editProxyCerts(): .............End.\n");
}

function exportProxyCerts()
{
    dump("keyManagerExtFF3.js:exportProxyCerts(): .............Start.\n");

    getSelectedProxyCerts();
    var numcerts = selected_proxy_certs.length;
    // dump("keyManagerExtFF3.js:exportProxyCerts(): numcerts: " + numcerts + "\n");
    if (!numcerts) {
	return;
    }

    var selTab = document.getElementById('certMgrTabbox').selectedItem;
    var selTabID = selTab.getAttribute('id');

    var isProxyUserCert = true;
    var isUserCert = false;
    if (selTabID == 'other2me_proxy_tab') {
    	isUserCert = true;
    }
    // dump("keyManagerExtFF3.js:exportProxyCerts(): .............10.\n");
    exportX509CertsToFile(selected_proxy_certs, isUserCert, isProxyUserCert);

    dump("keyManagerExtFF3.js:exportProxyCerts(): .............End.\n");
}


function myproxy_addCert()
{
    addWebSiteCert();
    ReloadUserToOtherProxyCerts();
}


function other_proxy_addCert()
{
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].
    				getService(Components.interfaces.nsIPromptService);
    var certsOnly = promptService.confirm(window,
		     "Import private key and/or X.509Cert chain (PKCS#12 or X.509/PKCS#7) for proxy",
		     "Do you want to import only signed certs (X,509/PKCS#7) for existing private key?\nCancel will import Keys/Certs in PKCS#12 format."
		     );
    if (certsOnly) {
    	importUserCerts();
    }
    else {
    	restoreCerts();
    }
    ReloadOtherToUserProxyCerts();
}

function other_proxy_signProxyCert()
{

    getSelectedProxyCerts();

    signProxyCertInternal(selected_proxy_certs);
}


function loginToToken(aToken, force)
{
    var /* nsIPK11Token */ token = null;
    
    token = aToken;
    if (!token) {
    	var xTokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"].getService(Components.interfaces.nsIPK11TokenDB);
    	token = xTokendb.getInternalKeyToken();
    }

    var forceLogin = ((force == null) ? false : force);
    if (token.needsLogin() || !(token.needsUserInit)) {
	try {
    	    token.login(forceLogin);
	} catch (ex) {}
    }
    return;
}

function loginToInternalKeyToken(force)
{
    var xTokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"].getService(Components.interfaces.nsIPK11TokenDB);
    var /* nsIPK11Token */ token = xTokendb.getInternalKeyToken();
    loginToToken(token, force);
}

function loginToCertToken(/* nsiX509Cert */ aCert, /* boolean */ force)
{
    var xTokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"].getService(Components.interfaces.nsIPK11TokenDB);
    var /* nsIPK11Token */ token = null;
    if (aCert) {
    	token = xTokendb.findTokenByName(aCert.tokenName);
    }
    else {
    	token = xTokendb.getInternalKeyToken();
    }
    loginToToken(token, force);
    return;
}

function loginAllTokens(force)
{

    // dump("loginAllTokens("+ force + "):.............Start.\n");

    // var slotnames = new Array();

    var xTokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"]
    			.getService(Components.interfaces.nsIPK11TokenDB);
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

	return binData;
}

function getWindowMediator()
{
    const kWindowMediatorContractID = "@mozilla.org/appshell/window-mediator;1";
    const kWindowMediatorIID = Components.interfaces.nsIWindowMediator;
    const kWindowMediator = Components.classes[kWindowMediatorContractID].getService(kWindowMediatorIID);
    return kWindowMediator;
}


function openDeviceManager()
{
    // check for an existing deviceManger window and focus it; it's not application modal
    const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
    var lastCertManager = kWindowMediator.getMostRecentWindow("mozilla:devicemanager");
    if (lastCertManager) {
        lastCertManager.focus();
    }
    else {
        window.open('chrome://pippki/content/device_manager.xul',  "devmgr",
                'chrome,centerscreen,resizable,modal,dialog=no');
    }
  refreshAllCertTrees();
}

