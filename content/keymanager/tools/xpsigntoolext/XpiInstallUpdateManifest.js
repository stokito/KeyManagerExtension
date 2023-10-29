/* @(#) $Id: XpiInstallUpdateManifest.js,v 1.10 2012/10/03 14:20:48 subrata Exp $ */

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

/*
Source: Extension Versioning, Update and Compatibility (MDC): 
http://developer.mozilla.org/en/docs/Extension_Versioning%2C_Update_and_Compatibility

Also, http://lxr.mozilla.org/mozilla/source/toolkit/mozapps/extensions/src/nsExtensionManager.js.in#6797
contains verificcation code using updateKey, and,
http://lxr.mozilla.org/mozilla/source/toolkit/mozapps/update/src/nsUpdateService.js.in contains updateHash verification code.
*/
const EM_NS	= "http://www.mozilla.org/2004/em-rdf#";
const NC_NS	= "http://home.netscape.com/NC-rdf#";
const RDF_NS	= "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

function xpsigntoolext_initInstallUpdateManifestXULElems()
{
    // XPSignToolForm.logTrace("xpsigntoolext_initSignFormXULElems():................Start.\n");

    var installRdfDirFilePickerElem = document.getElementById("xpsigntoolext.form.install.rdf.dir.path");

    var installRdfXpiFilePickerHboxElem = document.getElementById("xpsigntoolext.form.install.rdf.xpi.hbox");
    if (Components.interfaces.nsIZipWriter) {
	// nsIZipWriter is only supported on FF3 
    	installRdfXpiFilePickerHboxElem.hidden = false;
    }

    /**********************************************/
    /* TODO:  TEST CODE - remove after test phase */
    /**********************************************/

    var testMode = false;
    if (testMode) {
    try {
    	if (Components.interfaces.nsIZipWriter) {
    	    installRdfXpiFilePickerHboxElem.hidden = false;
	}
        var tokenPassword = "abcd1234";
        var tokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"].
                            getService(Components.interfaces.nsIPK11TokenDB);
        var token = tokendb.getInternalKeyToken();
        if (token) {
            token.checkPassword(tokenPassword);
            token.login(false);
        }
    } catch (ex) {}
/*
    installRdfDirFilePickerElem.filepath = "/home/subrata/Projects/XUL/extensions/avpki/buildff3";
#ifdef XP_WIN
    installRdfDirFilePickerElem.filepath = "T:\\Projects\\XUL\\extensions\\avpki\\buildff3";
#endif
#ifdef XP_MACOSX
    installRdfDirFilePickerElem.filepath = "";
#endif
*/
    }

    var installRdfOptionsGroupElem = document.getElementById("xpsigntoolext.form.install.rdf.options");
    xpsigntoolext_handleInstallRdfFileOptionChange(installRdfOptionsGroupElem);

    // XPSignToolForm.logTrace("xpsigntoolext_initSignFormXULElems():................End.\n");
}


function xpsigntoolext_handleInstallRdfFileOptionChange(aInstallRdfFileOptionGroupElem, ev)
{
    if (ev) {
	if (ev.target.localName != "radio") {
	    return;
	}
    }

    // XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfFileOptionChange():....................Start.\n");


    var installRdfXpiFilePickerElem = document.getElementById("xpsigntoolext.form.install.rdf.xpi.path");
    var installRdfDirFilePickerElem = document.getElementById("xpsigntoolext.form.install.rdf.dir.path");
    var installRdfFilePickerElem = document.getElementById("xpsigntoolext.form.install.rdf.file.path");

    var selectedOption = aInstallRdfFileOptionGroupElem.selectedItem.value;

    // XPSignToolForm.logDebug("xpsigntoolext_handleInstallRdfFileOptionChange(): selectedOption: " + selectedOption + "\n");
    if (selectedOption == "file") {
	installRdfFilePickerElem.disabled = false;
	installRdfXpiFilePickerElem.disabled = true;
	installRdfDirFilePickerElem.disabled = true;

	xpsigntoolext_handleInstallRdfFilePickerChange(installRdfFilePickerElem);
	installRdfXpiFilePickerElem.filepath = "";
	installRdfDirFilePickerElem.filepath = "";
    }
    else if (selectedOption == "xpi") {
	installRdfFilePickerElem.disabled = true;
	installRdfXpiFilePickerElem.disabled = false;
	installRdfDirFilePickerElem.disabled = true;

	installRdfFilePickerElem.filepath = "";
	xpsigntoolext_handleInstallRdfXPIFilePickerChange(installRdfXpiFilePickerElem);
	installRdfDirFilePickerElem.filepath = "";
    }
    else if (selectedOption == "dir") {
	installRdfFilePickerElem.disabled = true;
	installRdfXpiFilePickerElem.disabled = true;
	installRdfDirFilePickerElem.disabled = false;

	installRdfFilePickerElem.filepath = "";
	installRdfXpiFilePickerElem.filepath = "";
	xpsigntoolext_handleInstallRdfDirFilePickerChange(installRdfDirFilePickerElem);
    }
    else {
	installRdfFilePickerElem.disabled = false;
	installRdfXpiFilePickerElem.disabled = true;
	installRdfXpiFilePickerElem.disabled = true;

	xpsigntoolext_handleInstallRdfFilePickerChange(installRdfFilePickerElem);
	installRdfXpiFilePickerElem.filepath = "";
	installRdfXpiFilePickerElem.filepath = "";
    }

    // XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfFileOptionChange():....................End.\n");
}

function xpsigntoolext_handleInstallRdfFilePickerChange(aInstallRdfFilePickerElem, ev)
{
    // XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfFilePickerChange():....................Start.\n");
    
    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		       .getService(Components.interfaces.nsIRDFService);

    if (aInstallRdfFilePickerElem.rdfDS) {
    	rdfService.UnregisterDataSource(aInstallRdfFilePickerElem.rdfDS);
	aInstallRdfFilePickerElem.rdfDS = null;
    }

    var updateURLRowElem = document.getElementById("xpsigntoolext.form.install.rdf.updateURL.row");
    var updateKeyCertRowElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.row");
    var updateURLElem = document.getElementById("xpsigntoolext.form.install.rdf.updateURL");
    var updateKeyElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.updateKey");

    updateURLElem.value = "";
    updateKeyElem.value = "";

    if (!aInstallRdfFilePickerElem.file) {
	updateURLRowElem.hidden = true;
	updateKeyCertRowElem.hidden = true;
	return;
    }
    updateURLRowElem.hidden = false;

    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService);
    var /* nsIFileURI */ installRdfFileURI = ioService.newFileURI(aInstallRdfFilePickerElem.file);


    var installRdfDS = rdfService.GetDataSourceBlocking(installRdfFileURI.spec);
    // var installRdfDS = rdfService.GetDataSource(installRdfFileURI.spec);

    aInstallRdfFilePickerElem.rdfDS = installRdfDS;

    var installManifestResource = rdfService.GetResource("urn:mozilla:install-manifest");
    if (!installManifestResource) {
	alert("Selected file is not an install.rdf - it does contain 'urn:mozilla:install-manifest' resource.");
    	return;
    }

    var addonId = xpsigntoolext_getRDFTarget(installRdfDS, installManifestResource, "id");
    // XPSignToolForm.logDebug("xpsigntoolext_handleInstallRdfFilePickerChange():addonId: " + addonId + "\n");
    if (!addonId) {
	alert("Selected file is not an install.rdf - it does contain id for 'urn:mozilla:install-manifest' resource.");
    	return;
    }

    var updateKey = xpsigntoolext_getRDFTarget(installRdfDS, installManifestResource, "updateKey");
    var updateURL = xpsigntoolext_getRDFTarget(installRdfDS, installManifestResource, "updateURL");
    /*
    XPSignToolForm.logDebug("xpsigntoolext_handleInstallRdfFilePickerChange():updateKey:\n" + updateKey + "\n");
    XPSignToolForm.logDebug("xpsigntoolext_handleInstallRdfFilePickerChange():updateURL: " + updateURL + "\n");
    */

    var isHttpUpdateURL = false;
    if (updateURL) {
	updateURLElem.value = updateURL;
	if (updateURL.indexOf("http://") == 0) {
	    isHttpUpdateURL = true;
	}
    }


    if (!updateURL) {
	alert("No updateURL element in install.rdf  - you do not need to add updateKey.");
	return;
    }
    if (!isHttpUpdateURL) {
	updateKeyCertRowElem.hidden = true;
	// addUpdateKeyElem.hidden = true;
	// modifyUpdateKeyElem.hidden = true;
	alert("Protocol handler of Update URL is not of type http - you do not need to add updateKey.");
	return;
    }
    updateKeyCertRowElem.hidden = false;

    var signUpdateRdfTabElem = document.getElementById("xpsigntoolext.form.update.signer.tab.signUpdateRdf");
    var updateKeyCertDeckElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.deck");
    var updateKeyCertPickerHboxElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.hbox");
    var updateKeyCertPickerElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.certpicker");
    var updateKeyCertItemHboxElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.item.hbox");
    var updateKeyCertItemElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.item");
    var updateKeyCertItemInfoElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.noprivkey");
    var updateKeyCertNoneElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.none");

    var modifyCertOptionElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.modify");
    var addUpdateKeyElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cmd.addUpdateKey");
    var modifyUpdateKeyElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cmd.modifyUpdateKey");

    var updateRdSignerCertPickerRowElem = document.getElementById("xpsigntoolext.form.update.rdf.signer.cert.row");
    // var updateRdfSignerCertPickerElem = document.getElementById("xpsigntoolext.form.update.rdf.signer.certpicker");
    var updateRdfSignerCertItemElem = document.getElementById("xpsigntoolext.form.update.rdf.signer.certpicker");
    var signButtonElem = document.getElementById("xpsigntoolext.form.update.rdf.cmd.sign");
    var verifyButtonElem = document.getElementById("xpsigntoolext.form.update.rdf.cmd.verify");

    if (!updateKey) {
	addUpdateKeyElem.hidden = false;
	modifyUpdateKeyElem.hidden = true;

	modifyCertOptionElem.checked = true;
    	xpsigntoolext_handleModifyCertOptionChange(modifyCertOptionElem);
	modifyCertOptionElem.disabled = true;
	
    	updateRdSignerCertPickerRowElem.hidden = false;
    	// updateRdfSignerCertPickerElem.disabled = false;
    	updateRdfSignerCertItemElem.disabled = false;
    	signButtonElem.hidden = false;

    	signUpdateRdfTabElem.hidden = true;

    	// XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfFilePickerChange():....................End(2).\n");
	return;
    }
    modifyCertOptionElem.disabled = false;

    updateKeyElem.value = updateKey;

    var /* alrIKeyManager */ xKeyManager = null;
    xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);

    var updateKeyCert = null;
    try {
    	updateKeyCert = xKeyManager.findX509CertBySPKI(updateKey);
    } catch(ex) { }
    // XPSignToolForm.logDebug("xpsigntoolext_handleInstallRdfFilePickerChange(): updateKeyCert: " + updateKeyCert + "\n");

    var signButtonElem = document.getElementById("xpsigntoolext.form.update.rdf.cmd.sign");
    var verifyButtonElem = document.getElementById("xpsigntoolext.form.update.rdf.cmd.verify");

    updateKeyCertItemElem.cert = updateKeyCert;
    if (updateKeyCert) {
	updateKeyCertDeckElem.selectedPanel = updateKeyCertItemElem;
	updateKeyCertItemElem.cert = updateKeyCert;
	if (xKeyManager.isUserCert(updateKeyCert)) {
	    updateKeyCertPickerElem.selectedCert = updateKeyCert;
	    updateKeyCertItemElem.userCert = true;
	    updateKeyCertItemInfoElem.hidden = true;
    	    signButtonElem.hidden = false;
	}
	else {
	    updateKeyCertItemElem.userCert = false;
	    updateKeyCertItemInfoElem.hidden = false;
    	    // updateRdSignerCertPickerRowElem.hidden = true;
    	    // signUpdateRdfTabElem.hidden = true;
    	    signButtonElem.hidden = true;
	}
    	signUpdateRdfTabElem.hidden = false;
    	updateRdSignerCertPickerRowElem.hidden = false;
    	// updateRdfSignerCertPickerElem.selectedCert = updateKeyCert;
    	// updateRdfSignerCertPickerElem.disabled = false;
    	updateRdfSignerCertItemElem.cert = updateKeyCert;
    	updateRdfSignerCertItemElem.disabled = false;
    }
    else {
	updateKeyCertDeckElem.selectedPanel = updateKeyCertNoneElem;

    	signUpdateRdfTabElem.hidden = true;
    	updateRdSignerCertPickerRowElem.hidden = true;
	updateRdfSignerCertItemElem.cert = null;
    }
    addUpdateKeyElem.hidden = true;
    modifyUpdateKeyElem.hidden = false;

    var modifyCertOptionElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.modify");
    modifyCertOptionElem.checked = false;
    xpsigntoolext_handleModifyCertOptionChange(modifyCertOptionElem);

    // XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfFilePickerChange():....................End.\n");
}

function xpsigntoolext_handleInstallRdfXPIFilePickerChange(aInstallRdfXPIFilePickerElem, ev)
{
    // XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfXPIFilePickerChange():....................Start.\n");
    var installRdfFilePickerElem = document.getElementById("xpsigntoolext.form.install.rdf.file.path");

    if (!aInstallRdfXPIFilePickerElem.file || !aInstallRdfXPIFilePickerElem.file.exists()) {
	installRdfFilePickerElem.filepath = "";
	xpsigntoolext_handleInstallRdfFilePickerChange(installRdfFilePickerElem);
	// XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfXPIFilePickerChange():....................End(1).\n");
	return;
    }
    // XPSignToolForm.logDebug("aInstallRdfXPIFilePickerElem.file: " + aInstallRdfXPIFilePickerElem.file + "\n");

    var installRdfFile = null;
    try {
	installRdfFile = installRdfFilePickerElem.getTempDir("XPSignTool/" + aInstallRdfXPIFilePickerElem.file.leafName);
	installRdfFile.append("install.rdf");
    	installRdfFile = xpsigntoolext_extractFileFromArchive(aInstallRdfXPIFilePickerElem.file, "install.rdf", installRdfFile);
    } catch (ex) {
	alert("xpsigntoolext_extractFileFromArchive() failed for install.rdf - ex: " + ex);
	XPSignToolForm.logError("xpsigntoolext_extractFileFromArchive() failed for install.rdf - ex: " + ex + "\n");
	throw ex;
    }
    if (!installRdfFile) {
	alert("xpsigntoolext_extractFileFromArchive() failed for install.rdf.");
	throw "Failed to extract install.rdf file";
    }
    // XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfXPIFilePickerChange():....................20.\n");

    installRdfFilePickerElem.filepath = installRdfFile.path;
    xpsigntoolext_handleInstallRdfFilePickerChange(installRdfFilePickerElem);
    // XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfXPIFilePickerChange():....................40.\n");

    
    // XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfXPIFilePickerChange():....................End.\n");
}

function xpsigntoolext_handleInstallRdfDirFilePickerChange(aInstallRdfDirFilePickerElem, ev)
{
    // XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfDirFilePickerChange():....................Start.\n");
    var installRdfFilePickerElem = document.getElementById("xpsigntoolext.form.install.rdf.file.path");

    if (!aInstallRdfDirFilePickerElem.file || !aInstallRdfDirFilePickerElem.file.exists()) {
    	installRdfFilePickerElem.filepath = "";
	xpsigntoolext_handleInstallRdfFilePickerChange(installRdfFilePickerElem);
	// XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfDirFilePickerChange():....................End(1).\n");
	return;
    }

    var installRdfFile = aInstallRdfDirFilePickerElem.file.clone();
    installRdfFile.append("install.rdf");
    if (!installRdfFile.exists()) {
	alert("No install.rdf file found in " +  aInstallRdfDirFilePickerElem.filepath + " directory.");
	XPSignToolForm.logError("No install.rdf file found in " +  aInstallRdfDirFilePickerElem.filepath + " directory.\n");
	// XPSignToolForm.logError("xpsigntoolext_handleInstallRdfDirFilePickerChange():....................End(2).\n");
    	installRdfFilePickerElem.filepath = "";
	xpsigntoolext_handleInstallRdfFilePickerChange(installRdfFilePickerElem);
	return;
    }
    // XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfDirFilePickerChange():....................10.\n");

    installRdfFilePickerElem.filepath = installRdfFile.path;
    xpsigntoolext_handleInstallRdfFilePickerChange(installRdfFilePickerElem);

    // xpsigntoolext_InstallManifest_browse(aInstallRdfDirFilePickerElem.file);
    // XPSignToolForm.logTrace("xpsigntoolext_handleInstallRdfDirFilePickerChange():....................End.\n");
}

function xpsigntoolext_handleModifyCertOptionChange(aModifyCertOptionElem, ev)
{
    var updateKeyCertDeckElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.deck");
    var updateKeyCertPickerHboxElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.hbox");
    var updateKeyCertPickerElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.certpicker");
    var updateKeyCertItemHboxElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.item.hbox");
    var updateKeyCertItemElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.item");
    var updateKeyCertNoneElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.none");
    var updateKeyCmdHboxElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cmd.hbox");

    if (aModifyCertOptionElem.checked) {
    	updateKeyCertDeckElem.selectedPanel = updateKeyCertPickerHboxElem;
	updateKeyCmdHboxElem.hidden = false;
    }
    else {
    	if (updateKeyCertItemElem.cert) {
    	    updateKeyCertDeckElem.selectedPanel = updateKeyCertItemHboxElem;
	}
	else {
    	    updateKeyCertDeckElem.selectedPanel = updateKeyCertNoneElem;
	}
	updateKeyCmdHboxElem.hidden = true;
    }
}

function xpsigntoolext_handleUpdateKeyCertPickerChange(aUpdateKeyCertPikerElem, ev)
{
    /*
    var xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
		    	.getService(Components.interfaces.alrIKeyManager);
    var updateKey = xKeyManager.exportX509CertSPKIToBase64(aUpdateKeyCertPikerElem.selectedCert);

    var updateKeyElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.updateKey");
    updateKeyElem.value = updateKey;

    var updateKeyCertItemElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.item");
    updateKeyCertItemElem.cert = aUpdateKeyCertPikerElem.selectedCert;
    updateKeyCertItemElem.userCert = true;
    */
}


function xpsigntoolext_addUpdateKey(ev)
{
    xpsigntoolext_modifyUpdateKey();
}

function xpsigntoolext_modifyUpdateKey(ev)
{
    // XPSignToolForm.logTrace("xpsigntoolext_modifyUpdateKey():....................Start.\n");

    var installRdfOptionsGroupElem = document.getElementById("xpsigntoolext.form.install.rdf.options");
    var installRdfFilePickerElem = document.getElementById("xpsigntoolext.form.install.rdf.file.path");
    var installRdfXpiFilePickerElem = document.getElementById("xpsigntoolext.form.install.rdf.xpi.path");

    var updateKeyCertPickerElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.certpicker");
    var updateKeyCertItemElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.item");

    if (!installRdfFilePickerElem.file || !updateKeyCertPickerElem.selectedCert) {
	alert("Missing install.rdf file or no cert for key is choosen.");
    	return;
    }

    // Backup the install.rdf/input XPI file
    var inputFileBackupElem = document.getElementById("xpsigntoolext.form.install.rdf.infile.backup");
    if (inputFileBackupElem.checked) {
    	var selectedOption = installRdfOptionsGroupElem.selectedItem.value;
	var inputFilePickerElem = installRdfFilePickerElem;
    	if (selectedOption == "xpi") {
	    inputFilePickerElem = installRdfXpiFilePickerElem;
	}
    	var backupFile = inputFilePickerElem.file.clone();
    	var backupFileName = inputFilePickerElem.file.leafName + ".bak";
    	backupFile.leafName = backupFileName;
	backupFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
	backupFileName = backupFile.leafName;
	backupFile.remove(false); // on some platform copyTo() fails if the file exists.
	// XPSignToolForm.logDebug("backupFileName: " + backupFileName + "\n");
	// XPSignToolForm.logDebug("inputFilePickerElem.filepath: " + inputFilePickerElem.filepath + "\n");
    	inputFilePickerElem.file.copyTo(null, backupFileName);
    }
    // XPSignToolForm.logTrace("xpsigntoolext_modifyUpdateKey():....................10.\n");


    var updateKey = null;
    if (installRdfFilePickerElem.rdfDS) {
    	updateKey = xpsigntoolext_InstallManifest_addUpdateKeyByDataSource(
			installRdfFilePickerElem.rdfDS,
			updateKeyCertPickerElem.selectedCert
    			);
    }
    else {
    	updateKey = xpsigntoolext_InstallManifest_addUpdateKeyByFile(
			installRdfFilePickerElem.file,
			updateKeyCertPickerElem.selectedCert
			);
    }
    if (!updateKey) {
	alert("Failed to add/modify the updateKey element of install.rdf");
    	return;
    }

    var updateKeyElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.updateKey");
    updateKeyElem.value = updateKey;
    updateKeyCertItemElem.cert = updateKeyCertPickerElem.selectedCert;
    updateKeyCertItemElem.userCert = true;

    var signUpdateRdfTabElem = document.getElementById("xpsigntoolext.form.update.signer.tab.signUpdateRdf");
    signUpdateRdfTabElem.hidden = false;

    var updateRdSignerCertPickerRowElem = document.getElementById("xpsigntoolext.form.update.rdf.signer.cert.row");
    updateRdSignerCertPickerRowElem.hidden = false;

    /*
    var updateRdfSignerCertPickerElem = document.getElementById("xpsigntoolext.form.update.rdf.signer.certpicker");
    updateRdfSignerCertPickerElem.selectedCert = updateKeyCertPickerElem.selectedCert;
    updateRdfSignerCertPickerElem.disabled = false;
    */
    var updateRdfSignerCertItemElem = document.getElementById("xpsigntoolext.form.update.rdf.signer.certpicker");
    updateRdfSignerCertItemElem.cert = updateKeyCertPickerElem.selectedCert;
    updateRdfSignerCertItemElem.disabled = false;

    var signButtonElem = document.getElementById("xpsigntoolext.form.update.rdf.cmd.sign");
    signButtonElem.hidden = false;

    var verifyButtonElem = document.getElementById("xpsigntoolext.form.update.rdf.cmd.verify");
    verifyButtonElem.hidden = true;

    // If the input option is XPI file, then repackage the XPI file with the 
    // updated install.rdf file. Otherwise, we are done with an warning for 
    // manual packaging of XPI file before signing.
    
    var installRdfOptionsGroupElem = document.getElementById("xpsigntoolext.form.install.rdf.options");
    switch (installRdfOptionsGroupElem.selectedItem.value) {
    	case "file" : 
    	case "dir" : 
    	    alert("If the update.rdf file (specified by the updateURL) has atleast one target-app with non-HTTPS updateLink, then you must repackage the XPI file with the updated install.rdf before signing the update.rdf file.");
	    break;
    	case "xpi" : 
    	default : 
    	    xpsigntoolext_insertFileToArchive(
	    		installRdfXpiFilePickerElem.file,
			installRdfFilePickerElem.file,
			"install.rdf"
			);
    	    alert("Input XPI file is re-archived with the modified install.rdf file which is updated with the modified updatKey.");
	    break;
    }
    xpsigntoolext_handleInstallRdfFileOptionChange(installRdfOptionsGroupElem);

    // XPSignToolForm.logTrace("xpsigntoolext_modifyUpdateKey():....................End.\n");
}


function xpsigntoolext_handleUpdateRdfFilePickerChange(aUpdateRDFFilePicker, ev)
{
    // XPSignToolForm.logTrace("xpsigntoolext_handleUpdateRdfFilePickerChange():....................Start.\n");

    if (!aUpdateRDFFilePicker.file) {
    	aUpdateRDFFilePicker.rdfDS = null;
	return;
    }

    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		       .getService(Components.interfaces.nsIRDFService);

    if (aUpdateRDFFilePicker.rdfDS) {
    	rdfService.UnregisterDataSource(aUpdateRDFFilePicker.rdfDS);
	aUpdateRDFFilePicker.rdfDS = null;
    }

    var updateRDFFileBackupElem = document.getElementById("xpsigntoolext.form.update.rdf.file.backup");
    xpsigntoolext_UpdateRdf_handleFileBackupChange(updateRDFFileBackupElem);

    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService);
    var /* nsIFileURI */ updateRdfFileURI = ioService.newFileURI(aUpdateRDFFilePicker.file);


    var updateRdfDS = rdfService.GetDataSourceBlocking(updateRdfFileURI.spec);

    aUpdateRDFFilePicker.rdfDS = updateRdfDS;


    const xulDocNsURI = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var targetAppListElem = document.getElementById("xpsigntoolext.form.update.rdf.target.apps");

    var targetAppResourceList = xpsigntoolext_UpdateRdf_getTargetAppResources(updateRdfDS);
    if (targetAppResourceList.length <= 0) {
    	alert("slected file may not be an update.rdf file - couldn't find any resource with 'updates' element.");
	return;
    }
    targetAppListElem.rdfDS = updateRdfDS;

    var needSignature = true;

    
    for (var i = (targetAppListElem.childNodes.length - 1); ((i >= 0) && targetAppListElem.hasChildNodes()); i--) {
	var targetAppElem = targetAppListElem.childNodes.item(i);
    	targetAppListElem.removeChild(targetAppElem);
    }

    for (var i = 0; i < targetAppResourceList.length; i++) {
    	var targetAppResource = targetAppResourceList[i];

	var targetAppElem = document.createElementNS(xulDocNsURI, "richlistitem");
	targetAppElem.setAttribute("class", "UpdateRdfTargetApp");
	targetAppElem.setAttribute("flex", "1");

	/*
	var updateLink = xpsigntoolext_getRDFTarget(updateRdfDS, targetAppResource, "updateLink");
	var updateHash = xpsigntoolext_getRDFTarget(updateRdfDS, targetAppResource, "updateHash");
	if (updateLink) {
	    targetAppElem.setAttribute("updateLink", updateLink);
	}
	if (updateHash) {
	    targetAppElem.setAttribute("updateHash", updateLink);
	}
	XPSignToolForm.logDebug("updateHash: " + updateHash + " updateLink: " + updateLink + "\n");
	*/

	targetAppElem = targetAppListElem.appendChild(targetAppElem);
	targetAppElem.setTargetAppResource(updateRdfDS, targetAppResource);

	// needSignature |= !targetAppElem.isUpdateLinkHttps;
    }
    // XPSignToolForm.logDebug("needSignature: " + needSignature + "\n");

    var updateKeyCertItemElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.cert.item");
    var updateKeyCertPickerElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.certpicker");

    var updateRdSignerCertPickerRowElem = document.getElementById("xpsigntoolext.form.update.rdf.signer.cert.row");
    // var updateRdfSignerCertPickerElem = document.getElementById("xpsigntoolext.form.update.rdf.signer.certpicker");
    var updateRdfSignerCertItemElem = document.getElementById("xpsigntoolext.form.update.rdf.signer.certpicker");
    var signatureRowElem = document.getElementById("xpsigntoolext.form.update.rdf.signature.row");
    var signatureElem = document.getElementById("xpsigntoolext.form.update.rdf.signature");
    var signVerifyRowElem = document.getElementById("xpsigntoolext.form.update.rdf.sign.verify.row");
    var signButtonElem = document.getElementById("xpsigntoolext.form.update.rdf.cmd.sign");
    var verifyButtonElem = document.getElementById("xpsigntoolext.form.update.rdf.cmd.verify");

    var addonUpdatesResource = xpsigntoolext_UpdateRdf_getAddOnUpdatesResource(updateRdfDS);
    var updateRdfSignature = xpsigntoolext_getRDFTarget(updateRdfDS, addonUpdatesResource, "signature");
    // XPSignToolForm.logDebug("updateRdfSignature: " + updateRdfSignature + "\n");


    if (updateRdfSignature) {
    	signatureElem.value = updateRdfSignature;
    }

    if (needSignature || updateRdfSignature) {
    	signatureRowElem.hidden = false;
    	signVerifyRowElem.hidden = false;
    }
    else {
    	signatureRowElem.hidden = true;
    	signVerifyRowElem.hidden = true;
    }

    // updateRdSignerCertPickerRowElem.hidden = !needSignature
    // if (!updateKeyCertItemElem.cert || !updateKeyCertItemElem.userCert) {
    if (!updateKeyCertItemElem.cert) {
    	updateRdSignerCertPickerRowElem.hidden = true;
    	signVerifyRowElem.hidden = true;
    	signButtonElem.hidden = true;
    	verifyButtonElem.hidden = true;
    }
    else {
    	updateRdSignerCertPickerRowElem.hidden = false;
    	// updateRdfSignerCertPickerElem.selectedCert = updateKeyCertItemElem.cert;
    	updateRdfSignerCertItemElem.cert = updateKeyCertItemElem.cert;
    	if (updateKeyCertItemElem.userCert) {
    	    signButtonElem.hidden = false;
	}
	else {
    	    signButtonElem.hidden = true;
	}
	if (updateRdfSignature) {
    	    verifyButtonElem.hidden = false;
	}
	else {
    	    verifyButtonElem.hidden = true;
	}
    }

    // XPSignToolForm.logTrace("xpsigntoolext_handleUpdateRdfFilePickerChange():....................End.\n");
}

function xpsigntoolext_handleUpdateRdfTargetAppChange(aUpdateRdTargetAppListElem, ev)
{
    // XPSignToolForm.logTrace("xpsigntoolext_handleUpdateRdfTargetAppChange():....................Start.\n");

    var buttonElem = ev.originalTarget;
    if (buttonElem.localName != "button") {
    	return;
    }
    var signatureElem = document.getElementById("xpsigntoolext.form.update.rdf.signature");
    signatureElem.value = "";

    var signButtonElem = document.getElementById("xpsigntoolext.form.update.rdf.cmd.sign");
    signButtonElem.hidden = false;

    var verifyButtonElem = document.getElementById("xpsigntoolext.form.update.rdf.cmd.verify");

    // XPSignToolForm.logTrace("xpsigntoolext_handleUpdateRdfTargetAppChange():....................End.\n");
}

function xpsigntoolext_handleUpdateRdfSignerCertPickerChange(aUpdateRdfSignerCertPikerElem, ev)
{
}


function xpsigntoolext_getRDFTarget(aRdfDS, aSubjectResource, aPredicateName)
{
    // XPSignToolForm.logTrace("xpsigntoolext_getRDFTarget():....................Start.\n");
    
    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		       .getService(Components.interfaces.nsIRDFService);
    
    var predicate = rdfService.GetResource("http://www.mozilla.org/2004/em-rdf#" + aPredicateName);
    var hasPredicate = aRdfDS.hasArcOut(aSubjectResource, predicate);
    var attributeNode = null;
    if (hasPredicate) {
	attributeNode = aRdfDS.GetTarget(aSubjectResource, predicate, true);
    }

    var attributeValue = null;
    if (attributeNode) {
	if (attributeNode instanceof Components.interfaces.nsIRDFLiteral) {
	    attributeValue = attributeNode.Value;
	}
    }
    // XPSignToolForm.logDebug("xpsigntoolext_getRDFTarget(): attributeValue: " + attributeValue + "\n");
    // XPSignToolForm.logTrace("xpsigntoolext_getRDFTarget():....................End.\n");
    return attributeValue;
}

function xpsigntoolext_setRDFTarget(aRdfDS, aSubjectResource, aPredicateName, aTargetValue)
{
    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		       .getService(Components.interfaces.nsIRDFService);
    // aRdfDS.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
    
    var predicate = rdfService.GetResource("http://www.mozilla.org/2004/em-rdf#" + aPredicateName);
    var hasPredicate = aRdfDS.hasArcOut(aSubjectResource, predicate);
    // XPSignToolForm.logDebug("xpsigntoolext_setRDFTarget(): hasPredicate (updateHash): " + hasPredicate + "\n");
    if (hasPredicate) {
	var oldName = aRdfDS.GetTarget(aSubjectResource, predicate, true);
	aRdfDS.Unassert(aSubjectResource, predicate, oldName, true);
    }
    if (!aTargetValue) {
    	return;
    }

    var name = rdfService.GetLiteral(aTargetValue);
    aRdfDS.Assert(aSubjectResource, predicate, name, true);

    // aInstallRdfDS.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
    // aRdfDS.Flush();
}


function xpsigntoolext_InstallManifest_browse(aXPITreeTopDirFile)
{
    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_browse():....................Start.\n");

    var installRdfFile = aXPITreeTopDirFile.clone();
    installRdfFile.append("install.rdf");
    if (!installRdfFile.exists()) {
	XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_browse():....................End(ERROR).\n");
	return false;
    }
    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_browse():....................10.\n");

    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService);
    var /* nsIFileURI */ dataFileURI = ioService.newFileURI(installRdfFile);


    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		       .getService(Components.interfaces.nsIRDFService);
    var installRdfDS = rdfService.GetDataSourceBlocking(dataFileURI.spec);

    var manifestResource = rdfService.GetResource("urn:mozilla:install-manifest");

    /*
    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_browse():....................20.\n");
    */

    var targets = installRdfDS.ArcLabelsOut(manifestResource);
    while (targets.hasMoreElements()){
	var predicate = targets.getNext();
	if (!(predicate instanceof Components.interfaces.nsIRDFResource)) {
	    continue;
	}
	// XPSignToolForm.logDebug("predicate is: " + predicate.Value + "\n");

	var target = installRdfDS.GetTarget(manifestResource, predicate, true);
	if (target instanceof Components.interfaces.nsIRDFResource){
	    XPSignToolForm.logDebug("Target Resource is: " + target.Value + "\n");
	}
	else if (target instanceof Components.interfaces.nsIRDFLiteral) {
	    XPSignToolForm.logDebug("predicate: " + predicate.Value + " = " + target.Value + " (nsIRDFLiteral)\n");
	}
	else {
	    XPSignToolForm.logDebug(predicate.Value + " = " + target + "\n");
	}
    }

    var updateURLResource = rdfService.GetResource("http://www.mozilla.org/2004/em-rdf#updateURL");
    var hasUpdateURL = installRdfDS.hasArcOut(manifestResource, updateURLResource);
    // XPSignToolForm.logDebug("hasUpdateURL: " + hasUpdateURL + "\n");
    var updateURL = installRdfDS.GetTarget(manifestResource, updateURLResource, true);
    // XPSignToolForm.logDebug("updateURL: " + updateURL.Value + "\n");

    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_browse():....................End.\n");
    return true;
}

function xpsigntoolext_InstallManifest_getUpdateKey(aInstallRdfFile)
{
    return xpsigntoolext_InstallManifest_getAttributeValue(aInstallRdfFile, "updateKey");
}

function xpsigntoolext_InstallManifest_getUpdateURL(aInstallRdfFile)
{
    return xpsigntoolext_InstallManifest_getAttributeValue(aInstallRdfFile, "updateURL");
}

function xpsigntoolext_InstallManifest_getAttributeValue(aInstallRdfFile, attributeName)
{
    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_getAttributeValue():....................Start.\n");

    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService);
    var /* nsIFileURI */ dataFileURI = ioService.newFileURI(aInstallRdfFile);

    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		       .getService(Components.interfaces.nsIRDFService);
    var installRdfDS = rdfService.GetDataSourceBlocking(dataFileURI.spec);
    var subject = rdfService.GetResource("urn:mozilla:install-manifest");

    var attributeValue = xpsigntoolext_getRDFTarget(installRdfDS, subject, attributeName);

    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_getAttributeValue():....................End.\n");
    return attributeValue;
}

function xpsigntoolext_InstallManifest_addUpdateKey(aXPITreeTopDirFile, aSelectedSignerCert)
{
    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_addUpdateKey():....................Start.\n");


    var installRdfFile = aXPITreeTopDirFile.clone();
    installRdfFile.append("install.rdf");
    if (!installRdfFile.exists()) {
	XPSignToolForm.logDebug("xpsigntoolext_InstallManifest_addUpdateKey():....................End(ERROR).\n");
	return false;
    }
    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_addUpdateKey():....................10.\n");
    var retVal = xpsigntoolext_InstallManifest_addUpdateKeyByFile(installRdfFile, aSelectedSignerCert);

    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_addUpdateKey():....................End.\n");
    return retVal;
}

function xpsigntoolext_InstallManifest_addUpdateKeyByDOM(aInstallRdfFilePickerElem, aSelectedSignerCert)
{
    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		       .getService(Components.interfaces.nsIRDFService);
    if (aInstallRdfFilePickerElem.rdfDS) {
    	// aInstallRdfFilePickerElem.rdfDS.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
    	// aInstallRdfFilePickerElem.rdfDS.Flush();
    	rdfService.UnregisterDataSource(aInstallRdfFilePickerElem.rdfDS);
	aInstallRdfFilePickerElem.rdfDS = null;
    }

    var updateKey = null;
    var xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
		    	.getService(Components.interfaces.alrIKeyManager);
    updateKey = xKeyManager.exportX509CertSPKIToBase64(updateKeyCertPickerElem.selectedCert);
    if (!updateKey) {
	alert("Failed to add/modify the updateKey element of install.rdf");
    	return null;
    }

    // Modify updateKey as DOM attribute/element
    var installRdfXmlDoc = aInstallRdfFilePickerElem.readXMLDoc();
    var rdfDescElemList = installRdfXmlDoc.getElementsByTagNameNS(
						RDF_NS,
						"Description"
    						);
    // XPSignToolForm.logDebug("xpsigntoolext_InstallManifest_addUpdateKeyByDOM(): rdfDescElemList.length: " + rdfDescElemList.length + "\n");
    var installManifestDescElem = null;
    for (var i = 0; i < rdfDescElemList.length; i++) {
    	var rdfDescElem = rdfDescElemList.item(i);
	var aboutAttrValue = rdfDescElem.getAttributeNS(RDF_NS, "about");
    	XPSignToolForm.logDebug("xpsigntoolext_InstallManifest_addUpdateKeyByDOM(): aboutAttrValue[" + i + "]: " + aboutAttrValue + "\n");
	if (!aboutAttrValue) {
	    continue;
	}
	if (aboutAttrValue != "urn:mozilla:install-manifest") {
	    continue;
	}
	installManifestDescElem = rdfDescElem;

	// If the updateKey already exists as an attribute, then replace it.
	var updateKeyAttrValue = installManifestDescElem.getAttributeNS(EM_NS, "updateKey");
    	// XPSignToolForm.logDebug("xpsigntoolext_InstallManifest_addUpdateKeyByDOM(): updateKeyAttrValue: " + updateKeyAttrValue + "\n");
	if (updateKeyAttrValue && (updateKeyAttrValue != "")) {
	    installManifestDescElem.setAttributeNS(EM_NS, "updateKey", updateKey);
	    break;
	}


	var updateKeyElem = null;
	var updateKeyElemList = installManifestDescElem.getElementsByTagNameNS(
					EM_NS,
					"updateKey"
					);
    	// XPSignToolForm.logDebug("xpsigntoolext_InstallManifest_addUpdateKeyByDOM(): updateKeyElemList.length: " + updateKeyElemList.length + "\n");
    	if (updateKeyElemList.length == 0) {
	    // If the updateKey does not exists as an attribute or an element, then if the updateURL is an attribute, then 
	    // add the updateKey as an attribute, otherwise add it as an element.
	    var updateURLAttrValue = installManifestDescElem.getAttributeNS(EM_NS, "updateURL");
    	    // XPSignToolForm.logDebug("xpsigntoolext_InstallManifest_addUpdateKeyByDOM(): updateURLAttrValue: " + updateURLAttrValue + "\n");
	    if (updateURLAttrValue && (updateURLAttrValue != "")) {
	        installManifestDescElem.setAttributeNS(EM_NS, "updateKey", updateKey);
	        break;
	    }

	    updateKeyElem = installManifestDescElem.ownerDocument.createElementNS(EM_NS, "updateKey");
	    var updateURLElemList = installManifestDescElem.getElementsByTagNameNS(
					EM_NS,
					"updateURL"
					);
	    if (updateURLElemList.length == 0) {
	    	updateKeyElem = installManifestDescElem.appendChild(updateKeyElem);
	    }
	    else {
		var updateURLElem = updateURLElemList.item(0);
		if (updateURLElem.nextSibling) {
	            updateKeyElem = installManifestDescElem.insertBefore(updateKeyElem, updateURLElem.nextSibling);
		}
		else {
	    	    updateKeyElem = installManifestDescElem.appendChild(updateKeyElem);
		}
	    }
	}
	else {
	    updateKeyElem = updateKeyElemList.item(0);
	}
	if (!updateKeyElem.firstChild) {
	    var textNode = installManifestDescElem.ownerDocument.createTextNode("");
	    textNode = updateKeyElem.appendChild(textNode);
	}
	updateKeyElem.firstChild.nodeValue = updateKey;
	break;
    }

    if (!installManifestDescElem) {
    	return null;
    }

    	var serializer = new XMLSerializer();
    	var installRdfXmlDocStr = serializer.serializeToString(installRdfXmlDoc);
	installRdfXmlDocStr = installRdfXmlDocStr.replace(/^<\?xml\s+version\s*=\s*(["'])[^\1]+\1[^?]*\?>/, "");
    	var prettyString = new XML(installRdfXmlDocStr).toXMLString();
	var xmlTagStr = "<?xml version=\"1.0\"?>\n\n";
    	// XPSignToolForm.logDebug("prettyString:\n" + prettyString + "\n");

	aInstallRdfFilePickerElem.refresh();
	aInstallRdfFilePickerElem.saveData((xmlTagStr + prettyString));

	/*
	var outInstallRDFFilePickerElem = document.getElementById("xpsigntoolext.form.install.rdf.outfile.path");
	outInstallRDFFilePickerElem.filepath = aInstallRdfFilePickerElem.filepath;
    	var outFileName = aInstallRdfFilePickerElem.file.leafName + ".out";
	outInstallRDFFilePickerElem.file.leafName = outFileName;
    	XPSignToolForm.logDebug("outInstallRDFFilePickerElem.filepath: " + outInstallRDFFilePickerElem.file.path + "\n");

	outInstallRDFFilePickerElem.saveData((xmlTagStr + prettyString));

	// outInstallRDFFilePickerElem.refresh();
    	XPSignToolForm.logDebug("outInstallRDFFilePickerElem.file.fileSize: " + outInstallRDFFilePickerElem.file.fileSize + "\n");
    	outInstallRDFFilePickerElem.file.copyTo(null, "install.rdf");
	*/

    return updateKey;
}

function xpsigntoolext_InstallManifest_addUpdateKeyByDataSource(aInstallRdfDS, aSelectedSignerCert)
{
    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_addUpdateKeyByDataSource():....................Start.\n");

    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		       .getService(Components.interfaces.nsIRDFService);

    var subject = rdfService.GetResource("urn:mozilla:install-manifest");

    var /* alrIKeyManager */ xKeyManager = null;
    xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);
    var x059CertSPKIBase64 = xKeyManager.exportX509CertSPKIToBase64(aSelectedSignerCert);

    xpsigntoolext_setRDFTarget(aInstallRdfDS, subject, "updateKey", x059CertSPKIBase64);

    aInstallRdfDS.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
    aInstallRdfDS.Flush();

    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_addUpdateKeyByDataSource():....................End.\n");
    return x059CertSPKIBase64;
}

function xpsigntoolext_InstallManifest_addUpdateKeyByFile(aInstallRdfFile, aSelectedSignerCert)
{
    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_addUpdateKeyByFile():....................Start.\n");

    if (!aInstallRdfFile || !aSelectedSignerCert) {
    	return null;
    }

    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService);
    var /* nsIFileURI */ dataFileURI = ioService.newFileURI(aInstallRdfFile);


    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		       .getService(Components.interfaces.nsIRDFService);
    var installRdfDS = rdfService.GetDataSourceBlocking(dataFileURI.spec);

    var retVal = xpsigntoolext_InstallManifest_addUpdateKeyByDataSource(installRdfDS, aSelectedSignerCert);

    rdfService.UnregisterDataSource(installRdfDS);

    // XPSignToolForm.logTrace("xpsigntoolext_InstallManifest_addUpdateKeyByFile():....................End.\n");
    return retVal;
}

function xpsigntoolext_InstallManifest_addUpdateKeyWithPath(aXPITreeTopDirPath, aSignerCertNickName)
{

    var /* nsIFile */ xpiTreeTopDirFile = Components.classes["@mozilla.org/file/local;1"]
		         .createInstance(Components.interfaces.nsILocalFile);
    xpiTreeTopDirFile.initWithPath(aXPITreeTopDirPath);

    var signerX509Cert = null;
    try {
	var xCertdb = Components.classes["@mozilla.org/security/x509certdb;1"]
			.getService(Components.interfaces.nsIX509CertDB);
	signerX509Cert  = xCertdb.findCertByNickname(null, aSignerCertNickName);
    } catch (ex) {signerX509Cert = null;}
    if (!signerX509Cert) {
	return false;
    }

    var retVal = xpsigntoolext_InstallManifest_addUpdateKey(xpiTreeTopDirFile, signerX509Cert);

    return retVal;
}

function xpsigntoolext_XPIFile_computeHash(aXpiFile)
{
    var xpiFileHash = null;

    return xpiFileHash;
}

function xpsigntoolext_UpdateRdf_handleFileBackupChange(aUpdateRDFBackupElem, ev)
{
    // XPSignToolForm.logTrace("xpsigntoolext_UpdateRdf_handleFileBackupChange():....................Start.\n");

    var updateRDFFilePickerElem = document.getElementById("xpsigntoolext.form.update.rdf.filepicker");
    if (aUpdateRDFBackupElem.checked) {
    	var backupFileName = updateRDFFilePickerElem.file.leafName + ".bak";
    	var backupFile = updateRDFFilePickerElem.file.clone();
    	backupFile.leafName = backupFileName;

	backupFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
	backupFileName = backupFile.leafName;
	backupFile.remove(false); // on some platform copyTo() fails if the file exists.

    	updateRDFFilePickerElem.file.copyTo(null, backupFileName);
    }

    // XPSignToolForm.logTrace("xpsigntoolext_UpdateRdf_handleFileBackupChange():....................End.\n");
}

function xpsigntoolext_UpdateRdf_getAddOnUpdatesResource(aUpdateRdfDS)
{
    // XPSignToolForm.logTrace("xpsigntoolext_UpdateRdf_getAddOnUpdatesResource(): ..............Start.\n");

    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		       .getService(Components.interfaces.nsIRDFService);

    var addonUpdatesResource = null;
    var updatesPredicate = rdfService.GetResource("http://www.mozilla.org/2004/em-rdf#updates");
    var resources = aUpdateRdfDS.GetAllResources(); 
    while (resources.hasMoreElements()) {
	var subject = resources.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
    	// XPSignToolForm.logDebug("xpsigntoolext_UpdateRdf_getAddOnUpdatesResource(): subject: " + subject.Value + "\n");
	var hasPredicate = aUpdateRdfDS.hasArcOut(subject, updatesPredicate);
	if (!hasPredicate) {
	    continue;
	}
	addonUpdatesResource = subject;
    }

    /*
    if (addonUpdatesResource) {
    XPSignToolForm.logDebug("xpsigntoolext_UpdateRdf_getAddOnUpdatesResource(): addonUpdatesResource: " + addonUpdatesResource.Value + "\n");
    }
    */

    return addonUpdatesResource;
}

function xpsigntoolext_UpdateRdf_getTargetAppResources(aUpdateRdfDS)
{
    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		       .getService(Components.interfaces.nsIRDFService);

    var addonUpdateLinkResources = [];
    var updateLinkPredicate = rdfService.GetResource("http://www.mozilla.org/2004/em-rdf#updateLink");
    var resources = aUpdateRdfDS.GetAllResources(); 
    // XPSignToolForm.logDebug("addonUpdateLinkResources: {\n");
    while (resources.hasMoreElements()) {
	var subject = resources.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
	var hasPredicate = aUpdateRdfDS.hasArcOut(subject, updateLinkPredicate);
	if (!hasPredicate) {
	    continue;
	}
	var updateLink = aUpdateRdfDS.GetTarget(subject, updateLinkPredicate, true);
	updateLink.QueryInterface(Components.interfaces.nsIRDFLiteral);
	// XPSignToolForm.logDebug("    {" + subject.Value + ", " + updateLink.Value + "}" + "\n");
	addonUpdateLinkResources[addonUpdateLinkResources.length] = subject;
    }
    // XPSignToolForm.logDebug("}\n");
    return addonUpdateLinkResources;
}

function xpsigntoolext_serializeRdfDS(aRdfDS)
{
    // XPSignToolForm.logTrace("xpsigntoolext_serializeRdfDS():........................Start.\n");

    var rdfData = null;
    if (!aRdfDS) {
	XPSignToolForm.logDebug("xpsigntoolext_serializeRdfDS(): NULL aRdfDS.");
    	return rdfData;
    }

    // XPSignToolForm.logTrace("xpsigntoolext_serializeRdfDS():........................10.\n");

    var outputStream = {
      data: "",
      close : function(){},
      flush : function(){},
      write : function (buffer,count){
	this.data += buffer;
	return count;
      },
      writeFrom : function (stream,count){},
      isNonBlocking: false
    }

    var rdfXMLSerializer = Components.classes["@mozilla.org/rdf/xml-serializer;1"]
		             .createInstance(Components.interfaces.nsIRDFXMLSerializer);
    rdfXMLSerializer.init(aRdfDS);
    rdfXMLSerializer.QueryInterface(Components.interfaces.nsIRDFXMLSource);
    rdfXMLSerializer.Serialize(outputStream);

    rdfData = outputStream.data;
    // XPSignToolForm.logDebug("xpsigntoolext_serializeRdfDS(): rdfData:-------\n" + rdfData + "--------------\n");

    // XPSignToolForm.logTrace("xpsigntoolext_serializeRdfDS():........................End.\n");
    return rdfData;
}

function xpsigntoolext_UpdateRdf_signUpdateRdfDoc(aUpdateRdfDS, aSignerCert)
{
    if (!aUpdateRdfDS || !aSignerCert) {
    	return null;
    }

    var updateRdfData = xpsigntoolext_serializeRdfDS(aUpdateRdfDS);
    if (!updateRdfData) {
    	return null;
    }

    // XPSignToolForm.logDebug("updateRdfData:\n" + updateRdfData + "\n");

    var /* alrIKeyManager */ xKeyManager = null;
    xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);

    var updateRdfSig = xKeyManager.signTextData(
			aSignerCert,
			updateRdfData,
			"SHA1",
			true
			);
    // XPSignToolForm.logDebug("xpsigntoolext_UpdateRdf_signUpdateRdfDoc(): updateRdfSig:\n" + updateRdfSig + "\n");
    return updateRdfSig;

}

function xpsigntoolext_UpdateRdf_signResourceData(aUpdateRdfDS, aResource, aSignerCert)
{
    if (!aUpdateRdfDS || !aResource || !aSignerCert) {
    	return null;
    }

    var serializer = new RDFSerializer();
    var updateRdfData = serializer.serializeResource(aUpdateRdfDS, aResource);
    // XPSignToolForm.logDebug("xpsigntoolext_UpdateRdf_signResourceData():updateRdfData:\n" + updateRdfData + "\n");
    if (!updateRdfData) {
    	return null;
    }


    var /* alrIKeyManager */ xKeyManager = null;
    xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);

    var updateRdfSig = xKeyManager.signTextData(
			aSignerCert,
			updateRdfData,
			"SHA1",
			true
			);
    // XPSignToolForm.logDebug("xpsigntoolext_UpdateRdf_signUpdateRdfDoc(): updateRdfSig:\n" + updateRdfSig + "\n");
    return updateRdfSig;

}


function xpsigntoolext_UpdateRdf_signDataSource(aUpdateRdfDS, aSignerCert)
{
    // XPSignToolForm.logTrace("xpsigntoolext_UpdateRdf_signDataSource():....................Start.\n");

    if (!aUpdateRdfDS || !aSignerCert) {
    	return null;
    }

    var addonUpdatesResource = xpsigntoolext_UpdateRdf_getAddOnUpdatesResource(aUpdateRdfDS);
    // XPSignToolForm.logDebug("xpsigntoolext_UpdateRdf_signDataSource(): addonUpdatesResource: " + addonUpdatesResource + "\n");

    // Remove existing signature, if present
    xpsigntoolext_setRDFTarget(aUpdateRdfDS, addonUpdatesResource, "signature", null);

    // Compute the signature of update.rdf
    // var updateRDFSignature = xpsigntoolext_UpdateRdf_signUpdateRdfDoc(aUpdateRdfDS, aSignerCert);
    var updateRDFSignature = xpsigntoolext_UpdateRdf_signResourceData(aUpdateRdfDS, addonUpdatesResource, aSignerCert);

    // Add new signature to updates resource for add-on in update.rdf
    xpsigntoolext_setRDFTarget(aUpdateRdfDS, addonUpdatesResource, "signature", updateRDFSignature);

    aUpdateRdfDS.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
    aUpdateRdfDS.Flush();

    // rdfService.UnregisterDataSource(aUpdateRdfDS);

    // XPSignToolForm.logTrace("xpsigntoolext_UpdateRdf_signDataSource():....................End.\n");
    return updateRDFSignature;
}

function xpsigntoolext_UpdateRdf_signFile(aUpdateRdfFile, aSignerCert)
{
    // XPSignToolForm.logTrace("xpsigntoolext_UpdateRdf_signFile():....................Start.\n");

    if (!aUpdateRdfFile) {
    	alert("Missing update.rdf file.");
	return null;
    }
    if (!aSignerCert) {
    	alert("Missing Signer Cert.");
	return null;
    }
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService);
    var /* nsIFileURI */ updateRdfFileURI = ioService.newFileURI(aUpdateRdfFile);


    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		       .getService(Components.interfaces.nsIRDFService);
    var updateRdfDS = rdfService.GetDataSourceBlocking(updateRdfFileURI.spec);
    // XPSignToolForm.logTrace("xpsigntoolext_UpdateRdf_signFile():....................10.\n");

    var retVal = xpsigntoolext_UpdateRdf_signDataSource(updateRdfDS, aSignerCert);

    // XPSignToolForm.logTrace("xpsigntoolext_UpdateRdf_signFile():....................End.\n");
    return retVal;
}


function xpsigntoolext_signUpdateRdfFile(ev)
{
    var updateRdfTargetAppListElem = document.getElementById("xpsigntoolext.form.update.rdf.target.apps");
    var /* NodeList */ updateRdfTargetAppElemList = null;
    updateRdfTargetAppElemList = updateRdfTargetAppListElem.getElementsByAttribute("class", "UpdateRdfTargetApp");
    var readyToSign = true;
    for (var i = 0; i < updateRdfTargetAppElemList.length; i++) {
    	var updateRdfTargetAppElem = updateRdfTargetAppElemList.item(i);
	if (updateRdfTargetAppElem.isUpdateLinkHttps) {
	    // We do not need updateHash for https-based updateLink.
	    continue;
	}
	var updateHash = updateRdfTargetAppElem.updateHash;
	var updateHashItems = updateHash.split(":");
	if (updateHashItems.length == 2 && (updateHashItems[1] != "")) {
	    continue;
	}
	readyToSign = (readyToSign && false);
	break;
    }
    if (!readyToSign) {
    	XPSignToolForm.logError("xpsigntoolext_signUpdateRdfFile(): updateHash value is missing for one or more targetApplication(s) with non-https URL.");
    	alert("updateHash value is missing for one or more targetApplication(s) with non-https URL - signing of update.rdf is aborted.");
	return;
    }


    var updateRdfFilePickerElem = document.getElementById("xpsigntoolext.form.update.rdf.filepicker");
    // var updateRdfSignerCertPickerElem = document.getElementById("xpsigntoolext.form.update.rdf.signer.certpicker");
    var updateRdfSignerCertItemElem = document.getElementById("xpsigntoolext.form.update.rdf.signer.certpicker");
    var signatureElem = document.getElementById("xpsigntoolext.form.update.rdf.signature");

    // var signingCert = updateRdfSignerCertPickerElem.selectedCert;
    var signingCert = updateRdfSignerCertItemElem.cert;

    var updateRdfSignature = null;
    if (updateRdfFilePickerElem.rdfDS) {
    	updateRdfSignature = xpsigntoolext_UpdateRdf_signDataSource(updateRdfFilePickerElem.rdfDS, signingCert);
    }
    else {
    	updateRdfSignature = xpsigntoolext_UpdateRdf_signFile(updateRdfFilePickerElem.file, signingCert);
    }
    // XPSignToolForm.logDebug("updateRdfSignature: " + updateRdfSignature + "\n");
    if (updateRdfSignature) {
    	signatureElem.value = updateRdfSignature;
	var msg = "Successfully added/updated the signature in update.rdf file.";
    	XPSignToolForm.logDebug(msg + "\n");
    	alert(msg);
    }
    else {
    	signatureElem.value = "";
	var msg = "Failed to add/update the signature in update.rdf file.";
    	XPSignToolForm.logDebug(msg + "\n");
    	alert(msg);
    }

    // updateRdfFilePickerElem.refresh();
    xpsigntoolext_handleUpdateRdfFilePickerChange(updateRdfFilePickerElem);
}



function xpsigntoolext_UpdateRdf_signDoc(aUpdateRdfFilePath, aSignerCertNickName, aXpiFilePath)
{
    // XPSignToolForm.logTrace("xpsigntoolext_UpdateRdf_signDoc():....................Start.\n");

    // XPSignToolForm.logDebug("xpsigntoolext_UpdateRdf_signDoc(): aUpdateRdfFilePath: " + aUpdateRdfFilePath + "\n");

    var /* nsIFile */ updateRdfFile = null;
    updateRdfFile = Components.classes["@mozilla.org/file/local;1"]
			.createInstance(Components.interfaces.nsILocalFile);
    updateRdfFile.initWithPath(aUpdateRdfFilePath);

    // XPSignToolForm.logDebug("xpsigntoolext_UpdateRdf_signDoc(): aSignerCertNickName: " + aSignerCertNickName + "\n");
    var signerX509Cert = null;
    try {
	var xCertdb = Components.classes["@mozilla.org/security/x509certdb;1"]
			.getService(Components.interfaces.nsIX509CertDB);
	signerX509Cert  = xCertdb.findCertByNickname(null, aSignerCertNickName);
    } catch (ex) {signerX509Cert = null; XPSignToolForm.logError("ex:" + ex + "\n");}
    if (!signerX509Cert) {
	XPSignToolForm.logError("xpsigntoolext_UpdateRdf_signDoc():....................End(1).\n");
	return false;
    }
    // XPSignToolForm.logTrace("xpsigntoolext_UpdateRdf_signDoc():....................10.\n");

    var /* nsIFile */ xpiFile = Components.classes["@mozilla.org/file/local;1"]
		         .createInstance(Components.interfaces.nsILocalFile);
    xpiFile.initWithPath(aXpiFilePath);

    // XPSignToolForm.logTrace("xpsigntoolext_UpdateRdf_signDoc():....................20.\n");

    var retVal = xpsigntoolext_UpdateRdf_signFile(updateRdfFile, signerX509Cert);

    // XPSignToolForm.logTrace("xpsigntoolext_UpdateRdf_signDoc():....................End.\n");
    return retVal;
}

function xpsigntoolext_verifyUpdateRdfSignature(ev) 
{
    var updateKeyElem = document.getElementById("xpsigntoolext.form.install.rdf.signer.updateKey");

    var updateKey = updateKeyElem.value;
    if (updateKey == "") {
    	alert("updateKey not found - install.rdf file is not loaded properly.");
	return false;
    }
    // XPSignToolForm.logDebug("updateKey:\n" + updateKey + "\n\n");

    var signatureElem = document.getElementById("xpsigntoolext.form.update.rdf.signature");
    var updateSignature = signatureElem.value;
    if (updateSignature == "") {
    	alert("signature not found - update.rdf file is not loaded properly.");
	return false;
    }
    // XPSignToolForm.logDebug("updateSignature:\n" + updateSignature + "\n\n");

    var updateRdfFilePickerElem = document.getElementById("xpsigntoolext.form.update.rdf.filepicker");
    var updateRdfDS = updateRdfFilePickerElem.rdfDS;
    if (!updateRdfDS) {
    	alert("DataSource is not initialized - update.rdf file is not loaded properly.");
	return false;
    }
    var addonUpdatesResource = xpsigntoolext_UpdateRdf_getAddOnUpdatesResource(updateRdfDS);

    // Remove signature element before verification
    xpsigntoolext_setRDFTarget(updateRdfDS, addonUpdatesResource, "signature", null);

    var serializer = new RDFSerializer();
    var updateRdfData = serializer.serializeResource(updateRdfDS, addonUpdatesResource);
    // var updateRdfData = xpsigntoolext_serializeRdfDS(updateRdfDS);
    // XPSignToolForm.logDebug("updateRdfData:\n" + updateRdfData + "\n\n");

    // unload the change and relaod the update.rdf
    updateRdfDS.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
    updateRdfDS.Refresh(true);
    if (!updateRdfData) {
    	return false;
    }




    var verifyResult = false;
    if (Components.interfaces.nsIDataSignatureVerifier) {
    	var verifier = Components.classes["@mozilla.org/security/datasignatureverifier;1"].
                             getService(Components.interfaces.nsIDataSignatureVerifier);
    	verifyResult = verifier.verifyData(
    				updateRdfData,
				updateSignature,
				updateKey
				);
    }
    else {
    	var /* alrIKeyManager */ xKeyManager = null;
    	xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
		    getService(Components.interfaces.alrIKeyManager);
    	verifyResult = xKeyManager.verifyBase64DetachedSignatureWithSPKI(
    				updateKey,
				updateRdfData,
				updateSignature
				);
    }

    if (verifyResult) {
    	alert("Successfully verified the signature in update.rdf file.");
    }
    else {
    	alert("Verification of the signature in update.rdf file has FAILED.");
    }
    return verifyResult;
}



