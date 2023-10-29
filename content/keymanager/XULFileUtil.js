/* @(#) $Id: XULFileUtil.js,v 1.28 2012/10/03 23:09:40 subrata Exp $ */

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


const nsIDirectoryService = Components.interfaces.nsIDirectoryService;
const nsDirectoryService = "@mozilla.org/file/directory_service;1";

const nsIFilePicker = Components.interfaces.nsIFilePicker;
const nsFilePicker = "@mozilla.org/filepicker;1";

// get the Browser profile directory
// For more info: (http://kb.mozillazine.org/File_IO#Getting_special_files)

// http://kb.mozillazine.org/File_IO

/*
String		Meaning
------		--------
ProfD 	 	profile directory
DefProfRt 	user (e.g., /root/.mozilla)
UChrm 		%profile%/chrome
DefRt 		%installation%/defaults
PrfDef 		%installation%/defaults/pref
ProfDefNoLoc 	%installation%/defaults/profile
APlugns 	%installation%/plugins
AChrom 		%installation%/chrome
ComsD 		%installation%/components
CurProcD 	installation (usually)
Home 		OS root (e.g., /root)
TmpD 		OS tmp (e.g., /tmp) 
*/

const NS_APP_USER_PROFILE_50_DIR = "ProfD";
const NS_APP_INSTALLATION_50_DIR = "CurProcD";
const NS_APP_CHROME_50_DIR = "AChrom";


/*  ------------    Utility functions below   ------------- */

var userPrefObj = null;
function getUserPrefObj()
{
    if (userPrefObj != null) {
    	return prefObj;
    }
    userPrefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    return prefObj;
}

/* nsIFile */
function getProfileDirObj(profileID)
{

  // First get the directory service and query interface it to
  // nsIProperties
  var dirService = Components.classes['@mozilla.org/file/directory_service;1']
  			.getService(Components.interfaces.nsIProperties);

  // Next get the "ProfD" property of type nsIFile from the directory
  // service, FYI this constant is defined in
  // mozilla/xpcom/io/nsAppDirectoryServiceDefs.h

  var profileDir = dirService.get(profileID, Components.interfaces.nsIFile);
  return profileDir;
}

/* String */
function getProfileDirPath(profileID)
{
  var profileDir = getProfileDirObj(profileID);


  // profileDir.QueryInterface(Components.interfaces.nsIFile);
  return profileDir.path;
}

function getProfileDirURL(profileID)
{
  var /* nsIFile */ profileDir = getProfileDirObj(profileID);

  // Now that we have it we can show it's path. See nsIFile for the
  // other things you that can be done with profileDir


  var io_service =
	Components.classes["@mozilla.org/network/io-service;1"].
	getService(Components.interfaces.nsIIOService);
   
  var url = io_service.newFileURI(profileDir)
     .QueryInterface(Components.interfaces.nsIFileURL);
   
  return url.spec;
}

var userProfileDir = null;
var /* String */ userProfileDirPath = null;

function getUserProfileDirPath()
{
  if (userProfileDirPath != null) {
    return userProfileDirPath;
  }

  userProfileDirPath = getProfileDirPath(NS_APP_USER_PROFILE_50_DIR);

  return userProfileDirPath;
}

var userProfileDirURL = null;
function getUserProfileDirURL ()
{
  if (userProfileDirURL != null) {
    return userProfileDirURL;
  }
  userProfileDirURL = getProfileDirURL(NS_APP_USER_PROFILE_50_DIR);
  return userProfileDirURL;
}

var browserInstallDir = null;
var /* String */ browserInstallDirPath = null;

function getBrowserInstallDirPath()
{
  if (browserInstallDirPath != null) {
    return browserInstallDirPath;
  }
  browserInstallDirPath = getProfileDirPath(NS_APP_INSTALLATION_50_DIR);

  return browserInstallDirPath;
}



function getMyCertExtDirPath() 
{
    return ("keymanager");
}

function getMyCertExtLibDirPath() 
{
    return getExtensionLibDirPath("keymanager");
}

function getMyCertExtChromeDirPath() 
{
    return getExtensionChromeDirPath("keymanager");
}

function getExtensionLibDirPath(pExtName) 
{
    var extDir = getExtensionDirPath(pExtName);
    var extChromeDir = extDir + "/lib";
    return extChromeDir;
}

function getExtensionChromeDirPath(pExtName) 
{
    var extDir = getExtensionDirPath(pExtName);
    var extChromeDir = extDir + "/chrome";
    return extChromeDir;
}

function getExtensionDirPath(pExtName) 
{
    // dump("XULFileUtil.js(): getExtensionDirPath(" + pExtName + ") ......Start." + "\n");

    var extId = "";
    try {
    	extId = getExtensionIdByName(pExtName);
    } catch (ex) {
    	dump("XULFileUtil.js(): getExtensionDirPath(" + pExtName + ") failed - "  +  ex + "\n");
    }

    var extDirPath = getUserProfileDirPath();

    if (extId != "") {
    	extDirPath = extDirPath + "/extensions/" + extId;
    }

    return extDirPath;
}

function getExtensionIdByName(pExtName) 
{
    // dump("XULFileUtil.js(): getExtensionIdByName(" + pExtName + "): .........Start." + "\n");


    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
              .getService(Components.interfaces.nsIRDFService);
    var rdfContainer = Components.classes["@mozilla.org/rdf/container;1"]
              .getService(Components.interfaces.nsIRDFContainer);

    
    var aTarget = "Extension";
    var root = rdfService
                .GetResource("urn:mozilla:"+aTarget.toLowerCase()+":root");
    var manifestRoot = rdfService
    		.GetResource("urn:mozilla:install-manifest");
    var idArc = rdfService
                .GetResource("http://www.mozilla.org/2004/em-rdf#id");
    var nameArc = rdfService
                .GetResource("http://www.mozilla.org/2004/em-rdf#name");
    var versionArc = rdfService
                .GetResource("http://www.mozilla.org/2004/em-rdf#version");
    var disabledArc = rdfService
                .GetResource("http://www.mozilla.org/2004/em-rdf#disabled");
    var appArc = rdfService
                .GetResource("http://www.mozilla.org/2004/em-rdf#targetApplication");

    var extensionDS = Components.classes["@mozilla.org/extensions/manager;1"]
   		.getService(Components.interfaces.nsIExtensionManager).datasource;



    // root = manifestRoot;
    // var elements = extensionDS.GetTargets(root, appArc, true);
    // dump("elements: " + elements + "\n");

    rdfContainer.Init(extensionDS, root);
    var elements = rdfContainer.GetElements();

    while(elements.hasMoreElements()) {

        var extId = "";
        var name = "";
        var version = "";
        var disabled = "";
        var target = null;

	// dump();

        var element = elements.getNext();
        var targetApp = element.QueryInterface(Components.interfaces.nsIRDFResource);

        extId = targetApp
                 .QueryInterface(Components.interfaces.nsIRDFResource).Value;
	if ((extId != null) && (extId.length > 0)) {
	    var extIdList = extId.split(":");
	    if (extIdList.length > 0) {
	    	extId = extIdList[extIdList.length-1];
	    }
	    else {
	    	extId = "";
	    }
	}
	/*
	target = extensionDS.GetTarget(element, idArc ,true);
        if (target) {
            extId = target
                 .QueryInterface(Components.interfaces.nsIRDFResource).Value;
	}
	*/

	// dump("extId: " + extId + "\n");
	if (extId == null) {
	    continue;
	}

    	// dump("XULFileUtil.js(): getExtensionIdByName(" + pExtName + "): " + "\n");
	target = extensionDS.GetTarget(element, nameArc ,true);
        if (target) {
            name = target
                 .QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
    	    // dump(" name: "  + name + "\n");
	}

	/*
        target=extensionDS.GetTarget(element, versionArc ,true);
        if (target) {
            version = target
            	.QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
    	    dump(" version: "  + version);
	}

        target=extensionDS.GetTarget(element, disabledArc ,true);
        if (target) {
            disabled = target
                 .QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
    	    dump(" disabled: "  + disabled + "\n");
	}
	*/
	// dump();

	if (name == pExtName) {
	    return extId;
	}
    }
    // dump("XULFileUtil.js(): getExtensionIdByName(" + pExtName + "): .........End." + "\n");
    return "";
}

var xUserHomeDir = null;
var /* String */ xUserHomeDirPath = null;
function getUserHomeDirPath()
{
  if (xUserHomeDirPath != null) {
    return xUserHomeDirPath;
  }


  xUserHomeDirPath = getProfileDirPath("Home");
  return xUserHomeDirPath;
}


var xTmpDir = null;
var /* String */ xTmpDirPath = null;
function getTmpDirPath()
{
  if (xTmpDirPath != null) {
    return xTmpDirPath;
  }
  xTmpDirPath = getProfileDirPath("TmpD");
  return xTmpDirPath;
}


function /* String */ getLocalFileContentsXPCOM(/* nsIFile */ localFile)
{

    var /* nsIIOService */ ios = Components.classes["@mozilla.org/network/io-service;1"]
		    .getService(Components.interfaces.nsIIOService);
    var /* nsIFileProtocolHandler */ fileHandler = ios.getProtocolHandler("file")
		     .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
    var /* nsIURI */ localFileURL = fileHandler.getURLSpecFromFile(localFile);

    if (localFile.exists() == false ) {
    	alert("getLocalFileContentsXPCOM(): File: " + localFile.path + " does not exist.");
	return null;
    }
    var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
		        .createInstance(Components.interfaces.nsIFileInputStream);
    fiStream.init(localFile, 1, 0, false);
    // fiStream.init(localFile, 0x01, 00004, null);

    var siStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
		        .createInstance(Components.interfaces.nsIScriptableInputStream);
    /*
    var biStream = Components.classes["@mozilla.org/binaryinputstream;1"]
		        .createInstance(Components.interfaces.nsIBinaryInputStream);
    biStream.setInputStream(fiStream);
    var output = biStream.readBytes(biStream.available());
    */


    // fiStream.init(localFile, PR_RDONLY, 0, false);
    siStream.init(fiStream);

    var dataCnt = siStream.available();

    var fileDataStr = "";
    var str = siStream.read(-1);
    while (str.length > 0) {
	fileDataStr += str;
	str = siStream.read(-1);
    }

    siStream.close();
    fiStream.close();

    return fileDataStr;
}

function /* String */ readDataFromFile_Old(/* nsIFile */ localFile)
{
    return getLocalFileContentsXPCOM(localFile);
}

function /* nsILocalFile */ getLocalFile(filePath)
{
    var /* nsIFile */ localFile = Components.classes["@mozilla.org/file/local;1"]
		         .createInstance(Components.interfaces.nsILocalFile);
    localFile.initWithPath(filePath);
    return localFile;
}

function /* String */ getFileContentsXPCOM(filePath)
{

    var /* nsIFile */ localFile = Components.classes["@mozilla.org/file/local;1"]
		         .createInstance(Components.interfaces.nsILocalFile);
    localFile.initWithPath(filePath);

    return getLocalFileContentsXPCOM(localFile);
}

function /* String */ readDataFromFilePath(/* String */ filePath)
{
    return getFileContentsXPCOM(filePath);
}

function /* String */ readFileDataByPath(/* String */ filePath)
{
    return readDataFromFilePath(filePath);
}


function saveDataToFile(/* String */ fileData, /* nsIFile*/ outFile)
{
    // dump("XULFileUtil.js(): saveDataToFile():..........Start.\n");

    if (outFile == null) {
	alert("saveDataToFile(): outFile == NULL");
	return;
    }
    if ((fileData == null) || (fileData.length <= 0)) {
	alert("saveDataToFile(): fileData == NULL");
	return;
    }
    // dump("XULFileUtil.js(): saveDataToFile():..........1.\n");


    // dump("XULFileUtil.js(): outFilePath:" + outFile.path + "\n");

    // dump("XULFileUtil.js():Writing File Data to " + outFile.path + "\n");

    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
		createInstance(Components.interfaces.nsIFileOutputStream);
    foStream.QueryInterface(Components.interfaces.nsIOutputStream);
    foStream.QueryInterface(Components.interfaces.nsISeekableStream);

    foStream.init(outFile, 0x02 | 0x08 | 0x20, 0x0664, 0); // write, create, truncate

    var count = foStream.write(fileData, fileData.length);
    foStream.close();

    dump("XULFileUtil.js(): " + count + " baytes written to " + outFile.path + "\n");

    // dump("XULFileUtil.js(): saveDataToFile():............End.\n");
}

function saveDataToFilePath(/* String */ fileData, /* String*/ filePath)
{

    var /* nsIFile */ localFile = Components.classes["@mozilla.org/file/local;1"]
		         .createInstance(Components.interfaces.nsILocalFile);
    localFile.initWithPath(filePath);

    return saveDataToFile(fileData, localFile);
}


function saveBinDataToFile(/* array */ fileData, /* nsIFile*/ outFile)
{
    // dump("XULFileUtil.js(): saveBinDataToFile():..........Start.\n");

    // To create a temporary file, use nsIFile.createUnique():
    // Source: http://kb.mozillazine.org/File_IO#Creating_temporary_files

    if (outFile == null) {
	alert("saveDataToFile(): outFile == NULL");
	return;
    }
    if ((fileData == null) || (fileData.length <= 0)) {
	alert("saveDataToFile(): fileData == NULL");
	return;
    }
    // dump("XULFileUtil.js(): saveBinDataToFile():..........1.\n");


    // dump("saveBinDataToFile(): outFilePath:" + outFile.path + "\n");

    // dump("saveBinDataToFile():Writing File Data to " + outFile.path + "\n");

    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
		createInstance(Components.interfaces.nsIFileOutputStream);
    foStream.QueryInterface(Components.interfaces.nsIOutputStream);
    foStream.init(outFile, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate

    var boStream = Components.classes["@mozilla.org/binaryoutputstream;1"].
		createInstance(Components.interfaces.nsIBinaryOutputStream);
    boStream.setOutputStream(foStream);
    // boStream.QueryInterface(Components.interfaces.nsIOutputStream);
    // boStream.QueryInterface(Components.interfaces.nsISeekableStream);


    boStream.writeByteArray(fileData, fileData.length);
    boStream.close();

    dump("saveBinDataToFile(): " + fileData.length + " baytes written to " + outFile.path + "\n");

    // dump("XULFileUtil.js:saveBinDataToFile():..........End.\n");
}

function saveBinDataToFilePath(/* String */ fileData, /* String*/ filePath)
{

    var /* nsIFile */ localFile = Components.classes["@mozilla.org/file/local;1"]
		         .createInstance(Components.interfaces.nsILocalFile);
    localFile.initWithPath(filePath);

    return saveBinDataToFile(fileData, localFile);
}


/* nsIFile */
function pickInFile(dialogMsg, fileTypeMsg, fileTypeFilters, /* nsILocalFile */ displayDir, /* String */ defaultFileName, fileMode)
{
    var filePickMode = fileMode;
    if (filePickMode == null) {
    	filePickMode = nsIFilePicker.modeOpen;
    }
    return pickLocalFile(dialogMsg, fileTypeMsg, fileTypeFilters, filePickMode, displayDir, defaultFileName);
}

/* nsIFile */
function pickOutFile(dialogMsg, fileTypeMsg, fileTypeFilters, /* nsILocalFile */ displayDir, /* String */ defaultFileName, fileMode)
{
    var filePickMode = fileMode;
    if (filePickMode == null) {
    	filePickMode = nsIFilePicker.modeSave;
    }
    return pickLocalFile(dialogMsg, fileTypeMsg, fileTypeFilters, filePickMode, displayDir, defaultFileName);
}

/* nsIFile */
function pickLocalFile(dialogMsg, fileTypeMsg, fileTypeFilters, fileMode, /* nsILocalFile */ displayDir, /* String */ defaultFileName)
{

    // var bundle = srGetStrBundle("chrome://keymanager/locale/keyManager.properties");
    var fp = Components.classes[nsFilePicker].createInstance(nsIFilePicker);
    fp.init(window,
	  dialogMsg, // bundle.GetStringFromName(dialogMsg),
	  fileMode
	  );
    if (displayDir != null) {
    	fp.displayDirectory = displayDir;
    }
    if (defaultFileName != null) {
    	fp.defaultString = defaultFileName;
    }
    // Example: fp.appendFilter("Audio Files", "*.wav; *.mp3");
    fp.appendFilter(
		fileTypeMsg, // bundle.GetStringFromName(fileTypeMsg),
		fileTypeFilters
		);
    fp.appendFilters(nsIFilePicker.filterAll);

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
	return fp.file;
    }

    return null;
}


/* nsIFile */
function pickTempDir(subDirPath)
{

    // To create a temporary file, use nsIFile.createUnique():
    // Source: http://kb.mozillazine.org/File_IO#Creating_temporary_files
    var /* nsIFile*/ tmpDirFile = null;
    tmpDirFile = Components.classes["@mozilla.org/file/directory_service;1"].
	getService(Components.interfaces.nsIProperties).
	get("TmpD", Components.interfaces.nsIFile);

    if (subDirPath != null) {
	var subDirItems = subDirPath.split("/");
	for (var i = 0; i < subDirItems.length; i++) {
	    var subDirItem = subDirItems[i];
	    if (subDirItem == "") {
	    	continue;
	    }
    	    tmpDirFile.append(subDirItem);
	}
    }
    /*
    if (tmpDirFile.exists() == false) {
    	tmpDirFile.create();
    }
    */
    // dump("selected OUT TEMP DIR: " + tmpDirFile.path + "\n");
    return tmpDirFile;
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

/* nsILocalFile */
function pickCSRInputFile(aDisplayDir, aDefaultFileName)
{

    var tmpSubDirPath = "KeyManager/CSRTmp";
    var /* nsILocalFile */ displayDir = null;
    if (aDisplayDir != null) {
    	displayDir = aDisplayDir;
    }
    else {
    	displayDir = pickTempDir(tmpSubDirPath);
    }
    var csrTmpInFile = pickInFile("Choose CSR File", "CSR File", "*.csr", displayDir, aDefaultFileName);
    return csrTmpInFile;
}

/* nsIFile */
function pickX509CertInputFile(aDisplayDir, aDefaultFileName)
{

    var tmpSubDirPath = "KeyManager/CertTmp";
    var /* nsILocalFile */ displayDir = null;
    if (aDisplayDir != null) {
    	displayDir = aDisplayDir;
    }
    else {
    	displayDir = pickTempDir(tmpSubDirPath);
    }
    var certTmpInputFile = pickInFile("Choose X509 File", "Cert File", "*.cer", displayDir, aDefaultFileName);
    return certTmpInputFile;
}

function pickPkcs7CertInputFile(aDisplayDir, aDefaultFileName)
{
    var tmpSubDirPath = "KeyManager/CertTmp";
    var /* nsILocalFile */ displayDir = null;
    if (aDisplayDir != null) {
    	displayDir = aDisplayDir;
    }
    else {
    	displayDir = pickTempDir(tmpSubDirPath);
    }
    var certTmpInputFile = pickInFile("Choose PKCS7 File", "PKCS7 File", "*.p7", displayDir, aDefaultFileName);
    return certTmpInputFile;
}

/* nsILocalFile */
function pickCertTmpFile(fileName)
{
    return pickCertOutTmpFile(fileName);
}

/* nsILocalFile */
function pickCertOutTmpFile(fileName)
{
    return pickCertOutTempFile(fileName);
}

/* nsILocalFile */
function pickCertOutTempFile(fileName)
{
    var certTmpDir = "KeyManager/CertTmp";

    var certTmpFileName = fileName;
    if (certTmpFileName == null) {
	certTmpFileName = "userX509Cert.cer";
    }
    var certTmpOutFile = pickTempOutFile(certTmpDir + "/" + certTmpFileName);
    if (certTmpOutFile == null) {
    	return null;
    }

    // certOutFile = certTmpOutFile;
    // certOutFilePathElem.value = certOutFile.path;

    return certTmpOutFile;
}

/* nsIFile */
function pickCSROutTempFile(fileName)
{
    var csrTmpDir = "KeyManager/CSRTmp";

    var csrTmpFileName = fileName;
    if (csrTmpFileName == null) {
	csrTmpFileName = "pkcs10CSR.csr";
    }
    var csrTmpOutFile = pickTempOutFile(csrTmpDir + "/" + csrTmpFileName);
    if (csrTmpOutFile == null) {
    	return null;
    }

    return csrTmpOutFile;
}

/* nsIFile */
function XULFileUtil_pickCSROutFile(filePathElemId, msg, aDisplayDir, aDefaultFileName)
{

    var tmpSubDirPath = "KeyManager/CSRTmp";
    var /* nsILocalFile */ tmpDisplayDir = null;
    if (aDisplayDir != null) {
    	tmpDisplayDir = aDisplayDir;
    }
    else {
    	tmpDisplayDir = pickTempDir(tmpSubDirPath);
    }

    var csrTmpOutFile = selectOutputFile(
    		filePathElemId,
    		"Choose PKCS#10 CSR File",
		"PKCS#10 CSR File",
		"*.csr; *.p10",
    		tmpDisplayDir, aDefaultFileName
		);
    if (csrTmpOutFile == null) {
    	return null;
    }
    return csrTmpOutFile;
}

/* nsIFile */
function pickCSROutFile(aDisplayDir, aDefaultFileName)
{

    var tmpSubDirPath = "KeyManager/CSRTmp";
    var /* nsILocalFile */ displayDir = null;
    if (aDisplayDir != null) {
    	displayDir = aDisplayDir;
    }
    else {
    	displayDir = pickTempDir(tmpSubDirPath);
    }
    var csrTmpOutFile = pickOutFile("Choose CSR File", "CSR File", "*.csr", displayDir, aDefaultFileName);
    if (csrTmpOutFile == null) {
    	return null;
    }
    return csrTmpOutFile;
}

/* nsIFile */
function pickX509CertOutFile(aDisplayDir, aDefaultFileName)
{

    var tmpSubDirPath = "KeyManager/CertTmp";
    var /* nsILocalFile */ displayDir = null;
    if (aDisplayDir != null) {
    	displayDir = aDisplayDir;
    }
    else {
    	displayDir = pickTempDir(tmpSubDirPath);
    }
    var certTmpOutFile = pickOutFile("Choose X509 File", "Cert File", "*.cer", displayDir, aDefaultFileName);
    if (certTmpOutFile == null) {
    	return null;
    }
    return certTmpOutFile;
}

function XULFileUtil_pickPkcs7OutFile(filePathElemId, msg, aDisplayDir, aDefaultFileName)
{
    var tmpSubDirPath = "KeyManager/CertTmp";
    var /* nsILocalFile */ tmpDisplayDir = null;
    if (aDisplayDir != null) {
    	tmpDisplayDir = aDisplayDir;
    }
    else {
    	tmpDisplayDir = pickTempDir(tmpSubDirPath);
    }
    var /* nsIFile */ pkcs7OutFile = selectOutputFile(
    		filePathElemId,
		msg,
		"PKCS7 File",
		"*.p7; *.pk7; *.pc7",
    		tmpDisplayDir, aDefaultFileName
		);
    return pkcs7OutFile;
}

function pickPkcs7CertOutFile(aDisplayDir, aDefaultFileName)
{
    var tmpSubDirPath = "KeyManager/CertTmp";
    var /* nsILocalFile */ displayDir = null;
    if (aDisplayDir != null) {
    	displayDir = aDisplayDir;
    }
    else {
    	displayDir = pickTempDir(tmpSubDirPath);
    }
    var certTmpOutFile = pickOutFile("Choose PKCS7 File", "PKCS7 File", "*.p7", displayDir, aDefaultFileName);
    if (certTmpOutFile == null) {
    	return null;
    }
    return certTmpOutFile;
}


function removeBase64Envelope(target)
{
    // var beginPattern = "^-+[ ]*BEGIN[ ]*.+[ ]*-+[ ]*";
    var beginPattern = "^-+[ ]*BEGIN[ ]*.+\n";

    // var endPattern = "^-+[ ]*END[ ]*.+[ ]*-+[ ]*";
    var endPattern = "-+[ ]*.+\n";

    /*
    alert("target: " + target + "(" + target.length + ") (pattern was: " + pattern + ")");
    var result = target.match(pattern);
    if (result) {
    	alert("result: " + result[0] + "(" + result[0].length + ")");
    }
    */

    var result = target;
    var beginRegExp = new RegExp(beginPattern, "g");
    result = result.replace(beginRegExp, "");
    // alert("result: " + result + "(" + result.length + ") (pattern was: " + endPattern + ")");
    
    var endRegExp = new RegExp(endPattern, "g");
    result = result.replace(endRegExp, "");

    var regExp = new RegExp("\n");
    // result = result.replace("^[ ]*\n", "");

    // alert("result:\n" + result + "(" + result.length + ") (pattern was: " + endPattern + ")");
    return result;
}

function readDataFromBase64File(/* nsIFile*/ base64File, /* boolean */keepBase64Envelope)
{
    var base64EnvelopedData = readDataFromFile(base64File);
    if (keepBase64Envelope) {
    	return base64EnvelopedData;
    }

    var base64Data = removeBase64Envelope(base64EnvelopedData);

    return base64Data;
}

/* nsIFile */
function selectInputDir(filePathElemId, dialogMsg, fileTypeMsg, fileTypeFilters, /* nsILocalFile */ displayDir, /* String */ defaultFileName)
{
    return selectInputFile(
		filePathElemId,
		dialogMsg, fileTypeMsg, fileTypeFilters,
		displayDir, defaultFileName, nsIFilePicker.modeGetFolder
		);
}

/* nsIFile */
function selectInputFile(filePathElemId, dialogMsg, fileTypeMsg, fileTypeFilters, /* nsILocalFile */ displayDir, /* String */ defaultFileName, fileMode)
{
    var filePathElem = document.getElementById(filePathElemId);

    var filePickMode = fileMode;
    if (filePickMode == null) {
    	filePickMode = nsIFilePicker.modeOpen;
    }

    var /* nsIFile */ inputFile = null;
    inputFile = pickInFile(
		dialogMsg, fileTypeMsg, fileTypeFilters,
		displayDir, defaultFileName, filePickMode
		);
    if (inputFile == null) {
    	return null;
    }


    filePathElem.value = inputFile.path;
    filePathElem.file = inputFile;

    return inputFile;
}


/* nsIFile */
function selectOutputDir(filePathElemId, dialogMsg, fileTypeMsg, fileTypeFilters, /* nsILocalFile */ displayDir, /* String */ defaultFileName)
{
    return selectOutputFile(
		dialogMsg, fileTypeMsg, fileTypeFilters,
		displayDir, defaultFileName, nsIFilePicker.modeGetFolder
		);
}

/* nsIFile */
function selectOutputFile(filePathElemId, dialogMsg, fileTypeMsg, fileTypeFilters, /* nsILocalFile */ displayDir, /* String */ defaultFileName, fileMode)
{
    var filePathElem = document.getElementById(filePathElemId);

    var /* nsIFile */ outFile = null;
    outFile = pickOutFile(
		dialogMsg, fileTypeMsg, fileTypeFilters,
		displayDir, defaultFileName, fileMode
		);
    if (outFile == null) {
    	return null;
    }


    filePathElem.value = outFile.path;
    filePathElem.file = outFile;

    return outFile;
}

/* nsIFile */
function selectCertInFile(filePathElemId, msg)
{
    return selectInputFile(
    		filePathElemId,
    		(msg ? msg : "Choose X509 CERT File"),
		"X509 Cert File",
		"*.cer; *.pem; *.crt",
		null, null
		);
}

/* nsIFile */
function selectCertOutFile(filePathElemId, msg)
{
    return selectOutputFile(
		filePathElemId,
    		(msg ? msg : "Choose X509 CERT File"),
		"X509 Cert File",
		"*.cer; *.pem; *.crt",
		null, null
		);
}


function getExtensionDirFile(extID)
{
    var /* nsIFile */ extDir = null;
    extDir = Components.classes["@mozilla.org/extensions/manager;1"]
			.getService(Components.interfaces.nsIExtensionManager)
			.getInstallLocation(extID)
			.getItemLocation(extID); 

    var /* nsIFile */ extItemDir = null;
    extItemDir = Components.classes["@mozilla.org/extensions/manager;1"]
			.getService(Components.interfaces.nsIExtensionManager)
			.getInstallLocation(extID)
			.getItemFile(extID, "chrome/xultestffext.jar"); 

    dump("getExtensionDirFile(): extItemDir: " + extItemDir.path + "\n");
    return extDir;
}

function getExtensionChromeJarURL(extID, relativePath)
{
    var extDir = getExtensionDirFile(extID);

    var chromeItemFile = extDir.clone();
    chromeItemFile.append("chrome");

    // chromeItemFile.append(relativePath);

    var chromeURLPrefix = "jar:file://" + chromeItemFile.path + "/" + relativePath;
    return chromeURLPrefix;
}

function readDataFromURI(/* nsIURI */ dataURI)
{
    // dump("readDataFromURI():................Start.\n");

    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                                  .getService(Components.interfaces.nsIIOService);

    // get a channel for that nsIURI
    var channel = ioService.newChannelFromURI(dataURI);
    if (!channel) {
    	dump("readDataFromURL(): ioService.newChannelFromURI() failed.\n");
    	return null;
    }

    var channelIS = null;
    var jarChannel = null;
    try {
    	jarChannel = channel.QueryInterface(Components.interfaces.nsIJARChannel);
    } catch (ex) { }
    if (jarChannel) {
    	channelIS = jarChannel.open();
    }
    else {
    	channelIS = channel.open();
    }
    if (!channelIS) {
    	dump("readDataFromURL(): channel.open() failed.\n");
    	return null;
    }

    var siStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
		        .createInstance(Components.interfaces.nsIScriptableInputStream);
    siStream.init(channelIS);

    var dataCnt = 0;
    try {
    	// dataCnt = jarChannelIS.available();
    	dataCnt = siStream.available();
    } catch (ex) {
    }
    if (dataCnt == 0) {
    	dump("readDataFromURL(): siStream.available() failed.\n");
    	return null;
    }

    var urlDataStr = "";
    var str = siStream.read(-1);
    while (str.length > 0) {
	urlDataStr += str;
	str = siStream.read(-1);
    }

    siStream.close();
    channelIS.close();

    // dump("readDataFromURI():................End.\n");
    return urlDataStr;
}

function readDataFromURIStr(dataURIStr)
{
    // dump("readDataFromURIStr(" + dataURIStr + "):................Start.\n");


    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                                  .getService(Components.interfaces.nsIIOService);
    // create an nsIURI
    var dataURI = ioService.newURI(dataURIStr, null, null);

    var dataStr =  readDataFromURI(dataURI);

    // dump("readDataFromURIStr(" + dataURIStr + "):................End.\n");
    return dataStr;
}

function readDataFromFile(aDataFile)
{

    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                                  .getService(Components.interfaces.nsIIOService);
    var /* nsIFileURI */ dataFileURI = ioService.newFileURI(aDataFile);
    var dataStr =  readDataFromURI(dataFileURI);
    return dataStr;
}

function readDataFromExtJarURL(extID, relativePath)
{
    var extFileJarURLStr = getExtensionChromeJarURL(extID, relativePath);

    return readDataFromURIStr(extFileJarURLStr);
}

function getCurrentProfileName()
{
    // Source: .../xulrunner-1.9.linux.sdk/idl/nsIProfile.idl
    //         https://developer.mozilla.org/en/XPConnect/nsIProfile
    var profileManager = Components.classes["@mozilla.org/profile/manager;1"]
    				.getService(Components.interfaces.nsIProfile);
    var profileName = profileManager.currentProfile;

    return profileName;
}

