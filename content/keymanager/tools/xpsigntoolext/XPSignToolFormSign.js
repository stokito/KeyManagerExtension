/* @(#) $Id: XPSignToolFormSign.js,v 1.22 2012/10/03 14:20:47 subrata Exp $ */

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
   For more info on Signature verification: 
   	http://lxr.mozilla.org/mozilla/source/security/manager/ssl/public/nsIDataSignatureVerifier.idl 
   	http://lxr.mozilla.org/mozilla/source/toolkit/mozapps/extensions/src/nsExtensionManager.js.in
   	http://lxr.mozilla.org/mozilla/source/xpinstall/src/nsXPInstallManager.cpp
*/

const MODE_WRONLY   = 0x02;
const MODE_RDWR     = 0x04;
const MODE_CREATE   = 0x08;
const MODE_APPEND   = 0x10;
const MODE_TRUNCATE = 0x20;

const PERMS_FILE      = 0644;
const PERMS_DIRECTORY = 0755;

var gArcInputOptionsElem;
var gArcInputOptionFileElem;
var gArcInputOptionDirElem;
var gArcInputFilePickerElem;
var gArcInputDirHBoxElem;
var gArcInputDirRecursiveElem;
var gArcInputDirPickerElem;
var gArcTreeTempDirElem;

var gArcInputFileTypeOptionsElem;
var gArcInputFileTypeXPIElem;
var gArcInputFileTypeJSElem;
var gArcInputFileTypeGenericElem;

var gArcIncludeSignTimeElem;
var gArcSaveJSArchiveElem;
var gArcCompressionLevelElem;

var gArcFileSignerCertPickerElem;
var gArcBaseNameElem;
var gArcUseNickNameAsBaseNameElem;

var gArcScriptDirRowElem;
var gArcScriptDirPickerElem;

var gArcSignedOutFileRowElem;
var gArcSignedOutFilePickerElem;

var gCacheSize = 4;

function xpsigntoolext_doOnloadInitSignParam(aSelectedSignerCert)
{

    XPSignToolSignForm.logTrace("xpsigntoolext_doOnloadInitSignParam():................Start.");

    gArcFileSignerCertPickerElem = document.getElementById("xpsigntoolext.form.sign.signer.certpicker");

    xpsigntoolext_initBasicFormXULElems();

    if (aSelectedSignerCert) {
	// gArcFileSignerCertPickerElem.value = aSelectedSignerCert.nickname;
	gArcFileSignerCertPickerElem.cert = aSelectedSignerCert;
    	xpsigntoolext_SignerCertPickerChanged(gArcFileSignerCertPickerElem);
	// gArcFileSignerCertPickerElem.disabled = true;
    }


    XPSignToolSignForm.logTrace("xpsigntoolext_doOnloadInitSignParam():................End.");
}

/*
var archiveSigPropElemIds = [
	"xpsigntoolext.form.sign.signer.certpicker",
	"xpsigntoolext.form.sign.file.archive.recursive",
	"xpsigntoolext.form.sign.file.archive.type.xpi",
	"xpsigntoolext.form.sign.file.archive.type.javascript",
	"xpsigntoolext.form.sign.file.archive.sign.time",
	"xpsigntoolext.form.sign.file.archive.compression",
	"xpsigntoolext.form.sign.file.archive.scriptdir.path",
	"xpsigntoolext.form.sign.file.archive.installscript.path",
	"xpsigntoolext.form.sign.file.archive.metafile.path",
	"xpsigntoolext.form.sign.file.archive.base.name"
    ];
*/

function xpsigntoolext_initSignFormXULElems()
{

    XPSignToolSignForm.logTrace("xpsigntoolext_initSignFormXULElems():................Start.");

    gArcFileSignerCertPickerElem	= document.getElementById("xpsigntoolext.form.sign.signer.certpicker");

    gArcInputFileTypeOptionsElem	= document.getElementById("xpsigntoolext.form.sign.file.archive.type");
    gArcInputFileTypeXPIElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.type.xpi");
    gArcInputFileTypeJSElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.type.javascript");
    gArcInputFileTypeGenericElem	= document.getElementById("xpsigntoolext.form.sign.file.archive.type.generic");

    gArcInputOptionsElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.in.options");
    gArcInputOptionFileElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.in.option.file");
    gArcInputOptionDirElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.in.option.dir");
    gArcInputFilePickerElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.in.file.path");
    gArcInputDirHBoxElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.in.dir.hbox");
    gArcInputDirRecursiveElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.recursive");
    gArcInputDirPickerElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.in.dir.path");

    gArcIncludeSignTimeElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.sign.time");
    gArcOptimizeArchiveElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.optimize");
    gArcSaveJSArchiveElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.js.savearc");
    gArcCompressionLevelElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.compression");
    
    gArcBaseNameElem			= document.getElementById("xpsigntoolext.form.sign.file.archive.base.name");
    gArcUseNickNameAsBaseNameElem	= document.getElementById("xpsigntoolext.form.sign.file.archive.useNickName");

    gArcTreeTempDirElem			= document.getElementById("xpsigntoolext.form.sign.file.archive.tmp.path");

    gArcScriptDirRowElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.scriptdir");
    gArcScriptDirPickerElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.scriptdir.path");

    gArcSignedOutFileRowElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.out"); 
    gArcSignedOutFilePickerElem		= document.getElementById("xpsigntoolext.form.sign.file.archive.out.path"); 

    // XPSignToolSignForm.logTrace("xpsigntoolext_initSignFormXULElems():................10.");

    XPSignToolSignForm.initOnLoad();

    /*
    gArcIncludeSignTimeElem.checked = XPSignToolSignForm.mAddSigningTime;
    gArcOptimizeArchiveElem.checked = XPSignToolSignForm.mOptimizeArchive;
    gArcSaveJSArchiveElem.checked = XPSignToolSignForm.mSaveArchive;
    gArcCompressionLevelElem.value = "" + XPSignToolSignForm.mCompressionLevel;
    gArcUseNickNameAsBaseNameElem.checked = XPSignToolSignForm.mUseSignerAliasAsBaseName;
    */

    xpsigntoolext_handleInputFileTypeOptionChange(gArcInputFileTypeOptionsElem);

    xpsigntoolext_SignerCertPickerChanged(gArcFileSignerCertPickerElem);

    XPSignToolSignForm.logTrace("xpsigntoolext_initSignFormXULElems():................End.");
}

function xpsigntoolext_SignerCertPickerChanged(aSignerCertPickerElem, ev)
{
    xpsigntoolext_setBaseName(gArcUseNickNameAsBaseNameElem);
}

function xpsigntoolext_getSelectedSignerCert()
{
    var selectedCert = gArcFileSignerCertPickerElem.getSelectedCert();
    return selectedCert;
}

function xpsigntoolext_getSelectedSignerCertNickName()
{
    var selectedCert = gArcFileSignerCertPickerElem.getSelectedCert();
    if (selectedCert) {
    	return selectedCert.nickname;
    }
    return gArcFileSignerCertPickerElem.value;
}

function xpsigntoolext_handleInputFileTypeOptionChange(aArcInputFileTypeOptionsElem, ev)
{
    // XPSignToolSignForm.logTrace("xpsigntoolext_handleInputFileTypeOptionChange(): ...................Start.");

    var selectedArchiveTypeElem = aArcInputFileTypeOptionsElem.selectedItem;

    if (!selectedArchiveTypeElem) {
    	return;
    }

    gArcInputOptionsElem.disabled = false;

    gArcInputOptionFileElem.hidden = false;
    gArcInputFilePickerElem.hidden = false;

    gArcInputOptionDirElem.hidden = false;
    gArcInputDirRecursiveElem.checked = true;
    gArcInputDirHBoxElem.hidden = false;

    gArcSaveJSArchiveElem.hidden = true;

    gArcScriptDirRowElem.hidden = true;

    gArcSignedOutFileRowElem.hidden = false;

    // var addUpdateKeyRowElem = document.getElementById("xpsigntoolext.form.sign.update.key.add.row");
    var signUpdateRdfOptionElem = document.getElementById("xpsigntoolext.form.sign.update.rdf.sign.option");

    gArcInputFilePickerElem.filepath = "";
    gArcInputDirPickerElem.filepath = "";

    var fileTypeFilters = null;
    var fileTypeMsg = null;
    if (selectedArchiveTypeElem.value == "xpi") {
	if (gArcInputOptionsElem.selectedItem == null) {
    	    gArcInputOptionsElem.selectedItem = gArcInputOptionFileElem;
	}
	fileTypeFilters = gArcInputFilePickerElem.getAttribute("xpifileTypeFilters");
	if (!fileTypeFilters) {
	    fileTypeFilters = "*.xpi;";
	}
	fileTypeMsg = gArcInputFilePickerElem.getAttribute("xpifileTypeMsg");
	if (!fileTypeMsg) {
	    fileTypeMsg = "XPI Archive File";
	}
    	/*
	addUpdateKeyRowElem.hidden = false;
	xpsigntoolext_handleSignUpdateRdfOption(signUpdateRdfOptionElem);
	*/
    }
    else if (selectedArchiveTypeElem.value == "javascript") {
    	gArcInputOptionsElem.selectedItem = gArcInputOptionDirElem;
	/*
	if (gArcInputOptionsElem.selectedItem == null) {
	}
	*/
	// gArcInputOptionsElem.disabled = true;

	// gArcInputOptionFileElem.hidden = true;
	// gArcInputFilePickerElem.hidden = true;
	fileTypeFilters = gArcInputFilePickerElem.getAttribute("jsfileTypeFilters");
	if (!fileTypeFilters) {
	    fileTypeFilters = "*.html; *.htm;";
	}
	fileTypeMsg = gArcInputFilePickerElem.getAttribute("jsfileTypeMsg");
	if (!fileTypeMsg) {
	    fileTypeMsg = "HTML File";
	}

    	gArcInputDirRecursiveElem.checked = false;
	// gArcInputDirPickerElem.hidden = false;

	gArcSaveJSArchiveElem.hidden = false;
    	gArcScriptDirRowElem.hidden = false;
	gArcScriptDirPickerElem.value = "";

	// See signtool.c file for details
	gArcSignedOutFileRowElem.hidden = true;
    }
    else if (selectedArchiveTypeElem.value == "generic") {
	if (gArcInputOptionsElem.selectedItem == null) {
    	    gArcInputOptionsElem.selectedItem = gArcInputOptionDirElem;
	}
	// gArcInputOptionsElem.disabled = true;

	fileTypeFilters = gArcInputFilePickerElem.getAttribute("jarfileTypeFilters");
	if (!fileTypeFilters) {
	    fileTypeFilters = "*.jar; *.zip; *.war; *.ear;";
	}
	fileTypeMsg = gArcInputFilePickerElem.getAttribute("jarfileTypeMsg");
	if (!fileTypeMsg) {
	    fileTypeMsg = "Archive File";
	}
    }
    if (fileTypeFilters) {
	gArcInputFilePickerElem.setAttribute("fileTypeFilters", fileTypeFilters);
    }
    if (fileTypeMsg) {
	gArcInputFilePickerElem.setAttribute("fileTypeMsg", fileTypeMsg);
    }

    xpsigntoolext_handleInputFileOptionChange(gArcInputOptionsElem);

    // XPSignToolSignForm.logTrace("xpsigntoolext_handleInputFileTypeOptionChange(): ...................End.");
}

function xpsigntoolext_handleInputFileOptionChange(aArcInputOptionsElem, ev)
{
    // XPSignToolSignForm.logTrace("xpsigntoolext_handleInputFileOptionChange(): ...................Start.");

    var selectedInputElem = aArcInputOptionsElem.selectedItem;

    if (!selectedInputElem) {
    	return;
    }


    if (selectedInputElem.value == "file") {
    	gArcInputFilePickerElem.hidden = false;
    	gArcInputDirHBoxElem.hidden = true;
	xpsigntoolext_handleInputArchiveFilePickerChange(gArcInputFilePickerElem);
    }
    else if (selectedInputElem.value == "dir") {
    	gArcInputFilePickerElem.hidden = true;
    	gArcInputDirHBoxElem.hidden = false;
	xpsigntoolext_handleInputArchiveDirPickerChange(gArcInputFilePickerElem);
    }

    // XPSignToolSignForm.logTrace("xpsigntoolext_handleInputFileOptionChange(): ...................End.");
}

function xpsigntoolext_handleInputArchiveFilePickerChange(archiveFilePickerElem, ev)
{
    // XPSignToolSignForm.logTrace("xpsigntoolext_handleInputArchiveFilePickerChange(): ...................Start.");
    // XPSignToolSignForm.logDebug("xpsigntoolext_handleInputArchiveFilePickerChange(): archiveFilePickerElem.id: " + archiveFilePickerElem.id + "");
    if (ev) {
    	ev.stopPropagation();
    }

    gArcSignedOutFilePickerElem.value = "";

    if (!archiveFilePickerElem.file) {
    	return;
    }


    if (archiveFilePickerElem.file.fileSize == 0) {
    	alert("You have selected a zero-length file - please selected anothe file.");
	return;
    }

    var arcVerifySignerCertElem	 = document.getElementById("xpsigntoolext.form.verify.signer.cert.nickName");
    arcVerifySignerCertElem.cert = null;

    var arcVerifyTreeTempDirElem = document.getElementById("xpsigntoolext.form.verify.file.archive.tmp.path");
    arcVerifyTreeTempDirElem.filepath = "";

    var arcVerifyResultElem = document.getElementById("xpsigntoolext.form.verify.file.archive.result");
    arcVerifyResultElem.value = "";

    // XPSignToolSignForm.logTrace("xpsigntoolext_handleInputArchiveFilePickerChange(): ...................End.");
}

function xpsigntoolext_handleInputArchiveDirPickerChange(archiveDirPickerElem, ev)
{
    // XPSignToolSignForm.logTrace("xpsigntoolext_handleInputArchiveDirPickerChange(): ...................Start.");
    // XPSignToolSignForm.logDebug("xpsigntoolext_handleInputArchiveDirPickerChange(): archiveDirPickerElem.id: " + archiveDirPickerElem.id + "");

    gArcSignedOutFilePickerElem.value = "";

    // XPSignToolSignForm.logTrace("xpsigntoolext_handleInputArchiveDirPickerChange(): ...................End.");
}

function xpsigntoolext_handleOuputArchiveFilePickerChange(aOutArchiveFilePickerElem, ev)
{
    XPSignToolSignForm.logTrace("xpsigntoolext_handleOuputArchiveFilePickerChange(): ...................Start.");
    /*
    if (!aOutArchiveFilePickerElem.file) {
    	return;
    }
    */
    XPSignToolSignForm.logDebug("xpsigntoolext_handleOuputArchiveFilePickerChange(): aOutArchiveFilePickerElem.file: " +   aOutArchiveFilePickerElem.file + "");
    XPSignToolSignForm.logDebug("xpsigntoolext_handleOuputArchiveFilePickerChange(): aOutArchiveFilePickerElem.filepath: " +   aOutArchiveFilePickerElem.filepath + "");

    XPSignToolSignForm.logTrace("xpsigntoolext_handleOuputArchiveFilePickerChange(): ...................End.");
}

/* nsILocalFile */
function xpsigntoolext_autoSelectTmpArchiveDir(tempDirElem)
{
    var tmpArcDirNameRandSuffix = "" + (Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000);
    var tmpArcDirName = "XPIPkgDir_" + tmpArcDirNameRandSuffix;

    var tmpArcDirFile = null;
    try {
        tmpArcDirFile = tempDirElem.getTmpDir("XPSignTool/ExtractArchiveTopDir");
        tmpArcDirFile.append(tmpArcDirName);
	tmpArcDirFile.create(Components.interfaces.nsILocalFile.DIRECTORY_TYPE, PERMS_DIRECTORY);
    } catch (ex) {
    	XPSignToolSignForm.logError("xpsigntoolext_autoSelectTmpArchiveDir(): failed to temp archive directory - ex : " + ex + "");
	throw ex;
    }
    tempDirElem.value = tmpArcDirFile.path;
    return tempDirElem.file;
}

function xpsigntoolext_extractArchiveFileById(arcInputFilePickerElemId, arcTmpDirPickerElemId)
{
    XPSignToolSignForm.logTrace("xpsigntoolext_extractArchiveFileById():................Start.");

    var arcInputFilePickerElem = document.getElementById(arcInputFilePickerElemId);
    var arcInputFile = arcInputFilePickerElem.file;
    
    if ((arcInputFile == null) || !arcInputFile.exists()) {
    	XPSignToolSignForm.logError("xpsigntoolext_extractArchiveFileById(): Input Archive file does not exists.");
    	alert("xpsigntoolext_extractArchiveFileById(): Input Archive file does not exists.");
    	return;
    }

    var tmpInArcTopDirPathElem = document.getElementById(arcTmpDirPickerElemId);
    var tmpInArcTopDir = xpsigntoolext_autoSelectTmpArchiveDir(tmpInArcTopDirPathElem);
    if (tmpInArcTopDir == null) {
    	XPSignToolSignForm.logError("xpsigntoolext_extractArchiveFileById(): failed to create temporary archive directory file.");
    	alert("xpsigntoolext_extractArchiveFileById(): failed to create temporary archive directory file.");
	return;
    }

    try {
    	xpsigntoolext_extractArchiveFile(arcInputFile, tmpInArcTopDir);
    } catch (ex) {
    	XPSignToolSignForm.logError("xpsigntoolext_extractArchiveFileById(): failed to extract files from archive - ex : " + ex + "");
    	alert("xpsigntoolext_extractArchiveFileById(): failed to extract files from archive - ex : " + ex + "");
	throw ex;
    }

    alert("xpsigntoolext_extractArchiveFileById(): successfully extracted files from the archive.");
    XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFileById(): successfully extracted files from the archive.");

    XPSignToolSignForm.logTrace("xpsigntoolext_extractArchiveFileById():................End.");
}


function xpsigntoolext_NickNameMenuListChanged(menuListElem, selectedItemElem, certItemPrefix)
{
    /*
    XPSignToolSignForm.logTrace("xpsigntoolext_NickNameMenuListChanged():................Start.");
    XPSignToolSignForm.logTrace("xpsigntoolext_NickNameMenuListChanged():................End.");
    */
}


function xpsigntoolext_setBaseName(targetElem, event)
{
    var /* nsIX509Cert */ signerCert;
    signerCert = xpsigntoolext_getSelectedSignerCert();
    if (!signerCert) {
    	return;
    }
    var archiveBaseName =  gArcFileSignerCertPickerElem.adaptNickName(signerCert);
    if (targetElem.checked) {
    	gArcBaseNameElem.value = archiveBaseName;
    }
    else {
    	// Only reset the value if the base name is same as cert-nickname
    	if (gArcBaseNameElem.value == archiveBaseName) {
	    gArcBaseNameElem.value = "";
	}
    }
}

function xpsigntoolext_handleSigAlgorithmChange(sigAlgMenuListElem, selectedItem)
{
    var sigAlgElem = document.getElementById('xpsigntoolext.form.sign.certdetail.sigAlgName');
    sigAlgElem.value = sigAlgMenuListElem.value;
}


function xpsigntoolext_autoSelectOutSignedFile()
{
    var outSignedFileName = null;
    var arcInputFile = null;
    if (gArcInputOptionsElem.selectedItem.value == "file") {
    	arcInputFile = gArcInputFilePickerElem.file;
    	outSignedFileName = "Signed_" + arcInputFile.leafName;
    }
    else if (gArcInputOptionsElem.selectedItem.value == "dir") {
    	arcInputFile = gArcInputDirPickerElem.file;
    	outSignedFileName = "Signed_" + arcInputFile.leafName;
    	if (gArcInputFileTypeOptionsElem.selectedItem.value == "xpi") {
    	    outSignedFileName += ".xpi";
    	}
	else {
    	    outSignedFileName += ".jar";
	}
    }
    else {
    }

    if (!arcInputFile) {
    	return null;
    }

    var outSignedFile = null;
    try {
    	var tmpArcSignedDirFile = gArcSignedOutFilePickerElem.getTmpDir("XPSignTool/SignedArchiveDir");
    	if (!tmpArcSignedDirFile.exists()) {
	    tmpArcSignedDirFile.create(Components.interfaces.nsILocalFile.DIRECTORY_TYPE, PERMS_DIRECTORY);
    	}
    	outSignedFile = gArcSignedOutFilePickerElem.autoSelectFile(tmpArcSignedDirFile, outSignedFileName);
    	if (outSignedFile == null) {
    	    XPSignToolSignForm.logError("xpsigntoolext_autoSelectOutSignedFile(): failed to get outSignedFile.");
            return outSignedFile;
    	}
    } catch (ex) {
    	XPSignToolSignForm.logError("xpsigntoolext_autoSelectOutSignedFile(): failed to create outSignedFile - ex : " + ex + "");
	throw ex;
    }
    XPSignToolSignForm.logDebug("xpsigntoolext_autoSelectOutSignedFile(): outSignedFile: " + outSignedFile.path + "");
    return outSignedFile;
}

/**
 * Gets a zip reader for the file specified.
 * Source: .../mozilla/toolkit/mozapps/extensions/src/nsExtensionManager.js
 * @param   zipFile
 *          A ZIP archive to open with a nsIZipReader.
 * @return  A nsIZipReader for the file specified.
 */
function getZipReaderForFile( /* nsIFile */ zipFile) {
    var /* nsIZipReader */ zipReader = null;
    try {
        zipReader = Components.classes["@mozilla.org/libjar/zip-reader;1"]
                              .createInstance(Components.interfaces.nsIZipReader);
	if (zipReader.init) {
	    // FF2 and below
            zipReader.init(zipFile);
            zipReader.open();
	}
	else {
	    // FF3 
            zipReader.open(zipFile);
	}
    } catch (ex) {
    	XPSignToolSignForm.logError("getZipReaderForFile():  failed to open ZipReader - ex: " + ex + "");
        zipReader.close();
        throw ex;
    }
  return zipReader;
}

function getZipReaderForFileByCache(zipFile)
{
    var /* nsIZipReader */ zipReader = null;
    try {
        var /* nsIZipReaderCache */ zipReaderCache = null;
        zipReaderCache = Components.classes["@mozilla.org/libjar/zip-reader-cache;1"]
    			.createInstance(Components.interfaces.nsIZipReaderCache);
        if (zipReaderCache == null) {
    	    XPSignToolSignForm.logError("getZipReaderForFileByCache(): failed to get nsIZipReaderCache.");
            return null;
        }
        zipReaderCache.init(gCacheSize);

        zipReader = zipReaderCache.getZip(zipFile);
        XPSignToolSignForm.logDebug("getZipReaderForFileByCache(): zipReader: " + zipReader + "");
        if (zipReader == null) {
    	    XPSignToolSignForm.logError("getZipReaderForFileByCache(): failed to get zipReader.");
            return null;
        }
    } catch (ex) {
    	XPSignToolSignForm.logError("getZipReaderForFileByCache():  failed to open ZipReader - ex: " + ex + "");
        throw ex;
    }
    return zipReader;
}

function getZipWriterForFile( /* nsIFile */ zipFile) {
    var /* nsIZipWriter */ zipWriter = null;
    try {
        zipWriter = Components.classes["@mozilla.org/zipwriter;1"]
                              .createInstance(Components.interfaces.nsIZipWriter);
	zipFile.QueryInterface(Components.interfaces.nsIFile);
	// FF3 
        zipWriter.open(zipFile, MODE_RDWR);
    } catch (ex) {
    	XPSignToolSignForm.logError("getZipWriterForFile():  failed to open ZipWriter - ex: " + ex + "");
        throw ex;
    }
    return zipWriter;
}


function xpsigntoolext_getItemFilePath(/* nsIFile */ itemLocationDir, /* String */itemRelPath)
{
    var itemLocation = itemLocationDir.clone();
    var parts = itemRelPath.split("/");
    for (var i = 0; i < parts.length; ++i) {
        itemLocation.append(parts[i]);
    }
    return itemLocation.QueryInterface(Components.interfaces.nsILocalFile);
}

function xpsigntoolext_extractArchiveFileFF2(/* nsIZipReader */ zipReader, /* nsILocalFile*/ tmpInArcTopDir)
{
    XPSignToolSignForm.logTrace("xpsigntoolext_extractArchiveFileFF2():................Start.");

    // Create the directories first
    var /* nsISimpleEnumerator */ zipFileEnum = zipReader.findEntries("*/");
    for (var i = 0; zipFileEnum.hasMoreElements(); i++) {
	var zipFileItem = zipFileEnum.getNext();
	// XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFileFF2(): zipFileItem: " + zipFileItem + "");
	var /* nsIZipEntry */ zipEntry = zipFileItem.QueryInterface(Components.interfaces.nsIZipEntry);
	var /* nsILocalFile */ target = xpsigntoolext_getItemFilePath(tmpInArcTopDir, zipEntry.name);
	if (target.exists()) {
	    continue;
	}
    	// XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFileFF2(): zipEntry[" + i + "] : " + zipEntry.name + " ==> target: " + target.path + "(" + target + ")" + "");

	try {
	    target.create(Components.interfaces.nsILocalFile.DIRECTORY_TYPE, PERMS_DIRECTORY);
	} catch (ex) {
	    XPSignToolSignForm.logError("xpsigntoolext_extractArchiveFileFF2():  failed to create target directory for extraction " +
		    	" file = " + target.path + ", exception = " + ex + "");
	    throw ex;
	}
    }
    XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFileFF2(): ready to extract files now.");

    zipFileEnum = zipReader.findEntries("*");
    for (var i = 0; zipFileEnum.hasMoreElements(); i++) {
	var zipFileItem = zipFileEnum.getNext();
	// XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFileFF2(): zipFileItem: " + zipFileItem + "");
	var /* nsIZipEntry */ zipEntry = zipFileItem.QueryInterface(Components.interfaces.nsIZipEntry);
	var /* nsILocalFile */ target = xpsigntoolext_getItemFilePath(tmpInArcTopDir, zipEntry.name);
	if (!target.exists()) {
	    try {
		target.create(Components.interfaces.nsILocalFile.NORMAL_FILE_TYPE, PERMS_FILE);
	    } catch (ex) {
	        XPSignToolSignForm.logError("xpsigntoolext_extractArchiveFileFF2():  failed to create target file for extraction " +
			        " file = " + target.path + ", exception = " + ex + "");
		continue;
	    }
	}
	// XPSignToolSignForm.logDebug("target.isDirectory(" + target.path + "): " + target.isDirectory() + "");
	if (target.isDirectory()) {
	    continue;
	}
        try {
	    zipReader.extract(zipEntry.name, target);
        } catch (ex) {
	    XPSignToolSignForm.logError("xpsigntoolext_extractArchiveFileFF2():  failed to extract target file -  " +
			        " file = " + target.path + ", exception = " + ex + "");
	    throw ex;
        }
    }

    XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFileFF2(): successfully extracted files from Archive file.");
}

function xpsigntoolext_extractArchiveFileFF3(/* nsIZipReader */ zipReader, /* nsILocalFile*/ tmpInArcTopDir)
{
    XPSignToolSignForm.logTrace("xpsigntoolext_extractArchiveFileFF3():................Start.");

    // Create the directories first
    var /* nsIUTF8StringEnumerator */ zipFileEnum = zipReader.findEntries("*/");
    for (var i = 0; zipFileEnum.hasMore(); i++) {
	var zipFileItem = zipFileEnum.getNext();
	var zipEntryName = zipFileItem;
	// XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFileFF3(): zipEntryName: " + zipEntryName + "");
	var /* nsIZipEntry */ zipEntry = null;
	try {
	    zipEntry = zipReader.getEntry(zipEntryName);
	} catch (ex) {
	    XPSignToolSignForm.logError("xpsigntoolext_extractArchiveFileFF3(): zipReader.getEntry() failed for " + zipEntryName + "");
	    throw ex;
	}
	if (!zipEntry) {
	    XPSignToolSignForm.logError("xpsigntoolext_extractArchiveFileFF3(): zipReader.getEntry() failed for " + zipEntryName + "");
	    continue;
	}

	var /* nsILocalFile */ target = xpsigntoolext_getItemFilePath(tmpInArcTopDir, zipEntryName);
	if (target.exists()) {
	    continue;
	}
    	// XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFileFF3(): zipEntry[" + i + "] : " + zipEntryName + " ==> target: " + target.path + "(" + target + ")" + "");

	try {
	    target.create(Components.interfaces.nsILocalFile.DIRECTORY_TYPE, PERMS_DIRECTORY);
	} catch (ex) {
	    XPSignToolSignForm.logError("xpsigntoolext_extractArchiveFileFF3():  failed to create target directory for extraction " +
		    	" file = " + target.path + ", exception = " + ex + "");
	    throw ex;
	}
    }
    XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFileFF3(): ready to extract files now.");

    zipFileEnum = zipReader.findEntries("*");
    for (var i = 0; zipFileEnum.hasMore(); i++) {
	var zipFileItem = zipFileEnum.getNext();
	var zipEntryName = zipFileItem;
	// XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFileFF3(): zipEntryName: " + zipEntryName + "");

	var /* nsILocalFile */ target = xpsigntoolext_getItemFilePath(tmpInArcTopDir, zipEntryName);
	if (!target.exists()) {
	    try {
		target.create(Components.interfaces.nsILocalFile.NORMAL_FILE_TYPE, PERMS_FILE);
	    } catch (ex) {
	        XPSignToolSignForm.logError("xpsigntoolext_extractArchiveFileFF3():  failed to create target file for extraction " +
			        " file = " + target.path + ", exception = " + ex + "");
		throw ex;
	    }
	}

	// XPSignToolSignForm.logDebug("target.isDirectory(" + target.path + "): " + target.isDirectory() + "");
	if (target.isDirectory()) {
	    continue;
	}
    	// XPSignToolSignForm.logTrace("xpsigntoolext_extractArchiveFileFF3():................50.");

        try {
	    zipReader.extract(zipEntryName, target);
        } catch (ex) {
	    XPSignToolSignForm.logError("xpsigntoolext_extractArchiveFileFF3():  failed to extract target file -  " +
			        " file = " + target.path + ", exception = " + ex + "");
	    throw ex;
        }
    }

    XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFileFF3(): successfully extracted files from Archive file.");
    XPSignToolSignForm.logTrace("xpsigntoolext_extractArchiveFileFF3():................End.");
}

function xpsigntoolext_extractArchiveFile(/* nsILocalFile*/ arcInputFile, /* nsILocalFile*/ tmpInArcTopDir)
{
    XPSignToolSignForm.logTrace("xpsigntoolext_extractArchiveFile():................Start.");


    if (!arcInputFile) {
        return;
    }
    XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFile(): arcInputFile: " + arcInputFile.path + "");

    if (!tmpInArcTopDir) {
        return;
    }
    XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFile(): tmpInArcTopDir: " + tmpInArcTopDir.path + "");

    var /* nsIZipReader */ zipReader = null;
    try {
    	zipReader = getZipReaderForFile(arcInputFile);
    } catch (ex) {
    	XPSignToolSignForm.logError("xpsigntoolext_extractArchiveFile(): getZipReaderForFile() failed - ex : " + ex + "");
	throw ex;
    }
    XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFile(): zipReader: " + zipReader + "");

    if (zipReader.init) {
	// FF2 and below
    	xpsigntoolext_extractArchiveFileFF2(zipReader, tmpInArcTopDir);
    }
    else {
	// FF3 
    	xpsigntoolext_extractArchiveFileFF3(zipReader, tmpInArcTopDir);
    }

    zipReader.close();

    XPSignToolSignForm.logDebug("xpsigntoolext_extractArchiveFile(): successfully extracted files from Archive file.");
}

function xpsigntoolext_extractFileFromArchive(/* nsILocalFile*/ arcInputFile, aFileName, /* nsILocalFile*/ aTargetFile)
{
    // XPSignToolSignForm.logTrace("xpsigntoolext_extractFileFromArchive():................Start.");

    var targetFile = aTargetFile;
    if (!targetFile) {
	var outFileName = "XPSignTool/" + arcInputFile.leafName + "/" + aFileName; 
    	targetFile = pickTempOutFile(outFileName);
	if (!targetFile) {
	   throw ("Failed to create temporary file for " + aFileName);
	}
    }

    var /* nsIZipReader */ zipReader = null;
    try {
    	zipReader = getZipReaderForFile(arcInputFile);
    } catch (ex) {
    	XPSignToolSignForm.logError("xpsigntoolext_extractFileFromArchive(): getZipReaderForFile() failed - ex : " + ex + "");
	throw ex;
    }

    try {
      	zipReader.extract(aFileName, targetFile);
	zipReader.close();
    } catch (ex) {
    	XPSignToolSignForm.logError("xpsigntoolext_extractFileFromArchive(): zipReader.extract() failed - ex : " + ex + "");
	throw ex;
    }
    // Change the permission of the extracted file 
    targetFile.permissions = 0644;

    // XPSignToolSignForm.logTrace("xpsigntoolext_extractFileFromArchive():................End.");
    return targetFile;
}

function xpsigntoolext_insertFileToArchive(/* nsILocalFile*/ arcInputFile, /* nsILocalFile*/ aSourceFile, aTargetFileName)
{
    // XPSignToolSignForm.logTrace("xpsigntoolext_insertFileToArchive():................Start.");

    var targetFileName = aTargetFileName;
    if (!targetFileName) {
    	targetFileName = aSourceFile.leafName;
    }

    /*
    XPSignToolSignForm.logDebug("xpsigntoolext_insertFileToArchive(): arcInputFile: " + arcInputFile.path + "");
    XPSignToolSignForm.logDebug("xpsigntoolext_insertFileToArchive(): aSourceFile: " + aSourceFile.path + "");
    XPSignToolSignForm.logDebug("xpsigntoolext_insertFileToArchive(): targetFileName: " + targetFileName + "");
    */

    var /* nsIZipReader */ zipWriter = null;
    try {
    	zipWriter = getZipWriterForFile(arcInputFile);
    } catch (ex) {
    	XPSignToolSignForm.logError("xpsigntoolext_modifyUpdateKey(): getZipWriterForFile() failed - ex : " + ex + "");
	throw ex;
    }
    // XPSignToolSignForm.logDebug("xpsigntoolext_insertFileToArchive():................10.");

    try {
        if (zipWriter.hasEntry(targetFileName)) {
    	    zipWriter.removeEntry(targetFileName, false);
        }
        zipWriter.addEntryFile(
		targetFileName,
		Components.interfaces.nsIZipWriter.COMPRESSION_BEST,
		aSourceFile,
		false
		);
    } catch (ex) {
    	XPSignToolSignForm.logDebug("xpsigntoolext_modifyUpdateKey(): zipWriter.addEntryFile() failed - ex : " + ex + "");
    	zipWriter.close();
	throw ex;
    }
    zipWriter.close();

    // XPSignToolSignForm.logTrace("xpsigntoolext_insertFileToArchive():................End.");
}


/* nsIPersistentProperties */
function getSignatureFormProperties()
{
    var archiveSigProps = Components.classes["@mozilla.org/persistent-properties;1"].
                    createInstance(Components.interfaces.nsIPersistentProperties);

    var propKey;
    var propValue;
    var propOldValue;
    var trueValue = "true";

    // var gArcSignFormElem = document.getElementById("xpsigntoolext.form.tabpanel.sign");
    var arcSignFormElem = document.getElementById("xpsigntoolext.form.overlay.sign");

    var /* NodeList */ arcSignFormPropElemList = arcSignFormElem.getElementsByAttribute("sigParamName", "*");
    for (var i = 0; i < arcSignFormPropElemList.length; i++) {
	var archiveSigPropElem = arcSignFormPropElemList.item(i);
	// XPSignToolSignForm.logDebug("tagName: " + archiveSigPropElem.tagName + " id: " + archiveSigPropElem.id + "");

	if (archiveSigPropElem.hidden) {
	    continue;
	}
	var propKey = archiveSigPropElem.getAttribute("sigParamName");
	if ((propKey == null) || (propKey == "")) {
	    continue;
	}
	propValue = "";
	if (archiveSigPropElem.tagName == "checkbox") {
	    if (archiveSigPropElem.checked) {
	    	propValue = trueValue;
	    }
	}
	else if (archiveSigPropElem.tagName == "radio") {
	    if (archiveSigPropElem.selected) {
	    	// propValue = archiveSigPropElem.value;
	    	propValue = trueValue;
	    }
	}
	else if (archiveSigPropElem.value) {
	    propValue = archiveSigPropElem.value;
	}
	if (propValue != "") {
	    propOldValue = archiveSigProps.setStringProperty(propKey, propValue);
	}
	// XPSignToolSignForm.logDebug("id: " + archiveSigPropElem.id + " propKey: " + propKey + " = " + propValue + "");
    }
    dumpProperties(archiveSigProps, "archiveSignatureParams");
    return archiveSigProps;
}

function xpsigntoolext_signXPIArchiveDirTree(/* nsIX509Cert */ signerCert, /* nsILocalFile */ arcTreeTopDir, /* nsILocalFile */ outArcSignedFile)
{

    XPSignToolSignForm.logTrace("xpsigntoolext_signXPIArchiveDirTree():................Start.");

    var xpSignTool = null;
    try {
    	xpSignTool = Components.classes["@avaya.com/pkm/xpsigntool;1"]
    			.getService(Components.interfaces.alrIXPSignTool);
    } catch (ex) {
    	XPSignToolSignForm.logError("xpsigntoolext_signXPIArchiveDirTree(): failed to create instance of alrIXPSignTool - ex: " + ex + "");
	throw ex;
    }
    if (xpSignTool == null) {
    	XPSignToolSignForm.logError("xpsigntoolext_signXPIArchiveDirTree(): failed to create instance of alrIXPSignTool.");
    	return;
    }
    XPSignToolSignForm.logDebug("xpsigntoolext_signXPIArchiveDirTree(): successfully obtained reference to alrIXPSignTool : " + xpSignTool + "");

    var arcSignatureProps = null;
    try {
	/*
    	arcSignatureProps = Components.classes["@mozilla.org/persistent-properties;1"].
    			createInstance(Components.interfaces.nsIPersistentProperties);
    	xpSignTool.initDefaultSignatureProps(arcSignatureProps);
	*/
    	arcSignatureProps = getSignatureFormProperties();
    } catch (ex) {
    	XPSignToolSignForm.logError("xpsigntoolext_signXPIArchiveDirTree(): failed to create instance of nsIPersistentProperties - ex: " + ex + "");
	throw ex;
    }


    var signerNickName = signerCert.nickname;
    try {
    	// xpSignTool.signXPIFileByX509Cert(signerCert, arcTreeTopDir, arcSignatureProps, outArcSignedFile);
    	xpSignTool.signXPIArchiveDirByX509Cert(signerCert, arcTreeTopDir, arcSignatureProps, outArcSignedFile);
    } catch (ex) {
    	// XPSignToolSignForm.logError("xpsigntoolext_signXPIArchiveDirTree(): xpSignTool.signXPIFileByX509Cert() failed - ex : " + ex + "");
    	XPSignToolSignForm.logError("xpsigntoolext_signXPIArchiveDirTree(): xpSignTool.signXPIArchiveDirByX509Cert() failed - ex : " + ex + "");
	throw ex;
    }
    if (!outArcSignedFile.exists() || (outArcSignedFile.fileSize <= 0)) {
    	XPSignToolSignForm.logError("xpsigntoolext_signXPIArchiveDirTree(): failed to create Signed XPI Archive file.");
    	alert("xpsigntoolext_signXPIArchiveDirTree(): failed to create Signed XPI Archive file.");
    }

    XPSignToolSignForm.logTrace("xpsigntoolext_signXPIArchiveDirTree():................End.");
}

function xpsigntoolext_signArchiveDirTree(/* nsIX509Cert */ signerCert, /* nsILocalFile */ arcTreeTopDir, /* nsILocalFile */ outArcSignedFile)
{
    XPSignToolSignForm.logTrace("xpsigntoolext_signArchiveDirTree():................Start.");

    var /* alrIXPSignTool */ xpSignTool = null;
    try {
    	xpSignTool = Components.classes["@avaya.com/pkm/xpsigntool;1"]
    			.getService(Components.interfaces.alrIXPSignTool);
    } catch (ex) {
    	XPSignToolSignForm.logError("xpsigntoolext_signArchiveDirTree(): failed to create instance of alrIXPSignTool - ex: " + ex + "");
	throw ex;
    }
    if (xpSignTool == null) {
    	XPSignToolSignForm.logError("xpsigntoolext_signArchiveDirTree(): failed to create instance of alrIXPSignTool.");
    	return;
    }
    XPSignToolSignForm.logDebug("xpsigntoolext_signArchiveDirTree(): successfully obtained reference to alrIXPSignTool : " + xpSignTool + "");

    var arcSignatureProps = null;
    try {
    	arcSignatureProps = getSignatureFormProperties();
    } catch (ex) {
    	XPSignToolSignForm.logError("xpsigntoolext_signArchiveDirTree(): failed to create nsIPersistentProperties from form - ex: " + ex + "");
	throw ex;
    }


    var signerNickName = signerCert.nickname;
    try {
    	xpSignTool.signArchiveDirByX509CertWithProps(signerCert, arcTreeTopDir, arcSignatureProps, outArcSignedFile);
    } catch (ex) {
    	XPSignToolSignForm.logError("xpsigntoolext_signArchiveDirTree(): xpSignTool.signArchiveDirByX509CertWithProps() failed - ex : " + ex + "");
	throw ex;
    }
    if (!outArcSignedFile.exists() || (outArcSignedFile.fileSize <= 0)) {
    	XPSignToolSignForm.logError("xpsigntoolext_signArchiveDirTree(): failed to create Signed XPI Archive file.");
    	alert("xpsigntoolext_signArchiveDirTree(): failed to create Signed XPI Archive file.");
    }

    XPSignToolSignForm.logTrace("xpsigntoolext_signArchiveDirTree():................End.");
}

function xpsigntoolext_signArchiveFile()
{
    XPSignToolSignForm.logTrace("xpsigntoolext_signArchiveFile():................Start.");


    if (gArcInputOptionsElem.selectedItem.value == "file") {
    	if (!gArcInputFilePickerElem.file) {
    	    alert("xpsigntoolext_signArchiveFile(): no input archive file is provided - you must specify an input file.");
    	    XPSignToolSignForm.logError("xpsigntoolext_signArchiveFile(): no input archive file is provided - you must specify an input file.");
	    throw ("No Input Archive File");
	    // return false;
	}
    	if (gArcInputFilePickerElem.file.fileSize == 0) {
    	    alert("xpsigntoolext_signArchiveFile(): Zero-length archive file is provided - you must specify another file.");
    	    XPSignToolSignForm.logError("xpsigntoolext_signArchiveFile(): Zero-length archive file is provided - you must specify another file.");
	    throw ("Zero-length Archive File");
	}
    }
    else {
    	if (!gArcInputDirPickerElem.file) {
    	    alert("xpsigntoolext_signArchiveFile(): no input directory path is provided - you must specify an input file.");
    	    XPSignToolSignForm.logError("xpsigntoolext_signArchiveFile(): no input directory path is provided - you must specify an input file.");
	    throw ("No Input Directory.");
	    // return false;
	}
    }

    var /* nsIX509Cert */ signerCert;
    signerCert = xpsigntoolext_getSelectedSignerCert();
    if (signerCert == null) {
    	alert("xpsigntoolext_signArchiveFile(): null signerCert - you must choose a valid signing certificate.");
    	XPSignToolSignForm.logError("xpsigntoolext_signArchiveFile(): null signerCert - you must choose a valid signing certificate.");
	throw ("No signer certificate selected.");
    	// return false;
    }

    var /* nsILocalFile */ outArcSignedFile = null;
    if (gArcInputFileTypeOptionsElem.selectedItem.value == "javascript") {
    	// TODO:
    } 
    else {
        if (gArcSignedOutFilePickerElem.value == "") {
    	    xpsigntoolext_autoSelectOutSignedFile();
        }
    }
    outArcSignedFile = gArcSignedOutFilePickerElem.file;
    if (outArcSignedFile == null) {
    	XPSignToolSignForm.logError("xpsigntoolext_signArchiveFile(): failed to get output signed archive file path.");
    	alert("xpsigntoolext_signArchiveFile(): failed to get output signed archive file path.");
	throw ("Failed to select File path for signed archive.");
        // return false;
    }
    XPSignToolSignForm.logDebug("xpsigntoolext_signArchiveFile(): outArcSignedFile: " + outArcSignedFile.path + "");


    var signArcDirFile = null;
    var /* nsILocalFile */ tmpInArcTopDir = null;
    if (gArcInputOptionsElem.selectedItem.value == "file") {
	// Extract the input archive file into a temporary directory.

        tmpInArcTopDir = xpsigntoolext_autoSelectTmpArchiveDir(gArcTreeTempDirElem);
        if (tmpInArcTopDir == null) {
    	    XPSignToolSignForm.logError("xpsigntoolext_signArchiveFile(): failed to create temporary archive directory file.");
    	    alert("xpsigntoolext_signArchiveFile(): failed to create temporary archive directory file.");
    	    throw ("xpsigntoolext_signArchiveFile(): failed to create temporary archive directory file.");
	    // return;
        }

    	var /* nsILocalFile */ arcInputFile = gArcInputFilePickerElem.file;
	XPSignToolSignForm.logError("xpsigntoolext_signArchiveFile(): arcInputFile: "  + arcInputFile.path);
        try {
    	    xpsigntoolext_extractArchiveFile(arcInputFile, tmpInArcTopDir);
        } catch (ex) {
    	    alert("xpsigntoolext_signArchiveFile(): xpsigntoolext_extractArchiveFile() failed - ex : " + ex + "");
    	    XPSignToolSignForm.logError("xpsigntoolext_signArchiveFile(): xpsigntoolext_extractArchiveFile() failed - ex : " + ex + "");
    	    tmpInArcTopDir.remove(true);
	    throw ex;
        }
	var metaInfFile = tmpInArcTopDir.clone();
	metaInfFile.append("META-INF");
	XPSignToolSignForm.logError("xpsigntoolext_signArchiveFile(): metaInfFile: "  + metaInfFile.path);
	if (metaInfFile.exists()) {
	    metaInfFile.remove(true);
	}
	signArcDirFile = tmpInArcTopDir;
    }
    else {
	// Reuse the archive directory to create signed archive file
    	var /* nsILocalFile */ arcInputDir = gArcInputDirPickerElem.file;
        if (arcInputDir == null) {
    	    XPSignToolSignForm.logError("xpsigntoolext_signArchiveFile(): Invalid or missing input directory file.");
    	    alert("xpsigntoolext_signArchiveFile(): Invalid or missing input directory file.");
    	    throw("xpsigntoolext_signArchiveFile(): Invalid or missing input directory file.");
	    // return false;
        }
    	signArcDirFile = arcInputDir.clone();
    }
    XPSignToolSignForm.logDebug("xpsigntoolext_signArchiveFile(): signArcDirFile: " + signArcDirFile.path + "");

    /*
    var addUpdateKeyOptionElem = document.getElementById("xpsigntoolext.form.sign.update.key.add.option");
    if (gArcInputFileTypeOptionsElem.selectedItem.value == "xpi") {
    	if (addUpdateKeyOptionElem.checked) {
    	    var retVal = xpsigntoolext_InstallManifest_addUpdateKey(signArcDirFile, signerCert);
	}
    }
    */

    try {
    	// Force token login - on windows the popup window for password is not coming up
    	xpsigntoolext_loginToCertToken(signerCert);

    	if (gArcInputFileTypeOptionsElem.selectedItem.value == "xpi") {
    	    xpsigntoolext_signXPIArchiveDirTree(signerCert, signArcDirFile, outArcSignedFile);
	}
	else {
    	    xpsigntoolext_signArchiveDirTree(signerCert, signArcDirFile, outArcSignedFile);
	}
    } catch (ex) {
    	alert("xpsigntoolext_signArchiveFile(): failed to create signed archive file - ex : " + ex + "");
    	XPSignToolSignForm.logError("xpsigntoolext_signArchiveFile(): failed to create signed archive file - ex : " + ex + "");
    	// Delete the temporary dir for archive
	if (tmpInArcTopDir) {
    	    tmpInArcTopDir.remove(true);
	}
	throw ex;
    }

    /*
    var signUpdateRdfOptionElem = document.getElementById("xpsigntoolext.form.sign.update.rdf.sign.option");
    var computeHashOptionElem = document.getElementById("xpsigntoolext.form.sign.xpi.hash.compute.option");
    var updateRdfFilePickerElem = document.getElementById("xpsigntoolext.form.sign.update.rdf.filepicker");
    if (gArcInputFileTypeOptionsElem.selectedItem.value == "xpi") {
    	if (signUpdateRdfOptionElem.checked && updateRdfFilePickerElem.file) {
    	    var retVal = xpsigntoolext_UpdateRdf_addSignature(
	    			updateRdfFilePickerElem.file,
				signerCert,
				computeHashOptionElem.checked,
				outArcSignedFile
				);
	}
    }
    */


    // Delete the temporary dir for archive
    if (tmpInArcTopDir) {
    	tmpInArcTopDir.remove(true);
    }

    XPSignToolSignForm.logTrace("xpsigntoolext_signArchiveFile():................End.");
    return true;
}


function dumpProperties(/* nsIPersistentProperties */ aCertProps, msg)
{
    var propKey;
    var propValue;
    var propOldValue;

    if (msg) {
    	XPSignToolSignForm.logDebug(msg + " ");
    }
    if (!aCertProps) {
    	XPSignToolSignForm.logDebug("Properties {}");
	return;
    }

    var propKeyList = [];

    var propEnum = aCertProps.enumerate();
    while (propEnum.hasMoreElements ()) {
        var propElem = propEnum.getNext ();
        var propItem = propElem.QueryInterface (Components.interfaces.nsIPropertyElement);
        var propKey = propItem.key;
        // var propValue = propItem.value;
	// XPSignToolSignForm.logDebug("    " + propKey + " = " + propValue + "");
	propKeyList[propKeyList.length] = propKey;
    }

    if (propKeyList.length <= 0) {
	XPSignToolSignForm.logDebug("Properties {no elements.}");
	return;
    }

    propKeyList = propKeyList.sort();
    XPSignToolSignForm.logDebug("Properties {");
    for (var i = 0; i < propKeyList.length; i++) {
	var propKey =  propKeyList[i];
        var propValue = aCertProps.getStringProperty(propKey);
	XPSignToolSignForm.logDebug("    " + propKey + " = " + propValue + "");
     }
     XPSignToolSignForm.logDebug("}");
}

function xpsigntoolext_handleSignUpdateRdfOption(aSignUpdateRdfOptionElem, ev)
{
    var computeHashOptionElem = document.getElementById("xpsigntoolext.form.sign.xpi.hash.compute.option");
    var updateRdfFilePickerHboxElem = document.getElementById("xpsigntoolext.form.sign.update.rdf.filepicker.hbox");
    computeHashOptionElem.hidden = !aSignUpdateRdfOptionElem.checked;
    updateRdfFilePickerHboxElem.hidden = !aSignUpdateRdfOptionElem.checked;

}


var XPSignToolSignForm = {


    /* nsIIOService	*/ mIOService : null,
    /* nsIProperties	*/ mDirService : null,
    /* nsIX509CertDB	*/ mX509CertDB : null,
    /* nsIPK11TokenDB   */ mTokenDB	: null,
    /* alrIKeyManager	*/ mKeyManager : null,

    mDialogParams		: null,
    mWizardInitalized		: false,

    mLogEnabled : false,
    mAddSigningTime : false,
    mOptimizeArchive : false,
    mSaveArchive : false,
    mCompressionLevel : -1,
    mUseSignerAliasAsBaseName : false,
    // mBackupDuringSigningUpdateManifest : false,

    mTestMode 			: false,

    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > this.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    logError : function(msg)
    {
        this.log(2, msg);
    },
    logTrace : function(msg)
    {
        this.log(4, msg);
    },
    logDebug : function(msg)
    {
        this.log(8, msg);
    },

    loginToInternalToken : function () 
    {
        this.logTrace("XPSignToolSignForm.loginToInternalToken():................Start.");

	var token = null;
        try {
            token = this.mTokenDB.getInternalKeyToken();
        } catch (ex) {}
	if (!token) {
            this.logTrace("XPSignToolSignForm.loginToInternalToken():................End(0).");
	    return;
	}

	try {
            token.login(false);
            this.logTrace("XPSignToolSignForm.loginToInternalToken(): successfully logged in to internal-token.");
        } catch (ex) {}

        this.logTrace("XPSignToolSignForm.loginToInternalToken():................End.");
	return;
    },

    trim : function (aStr) 
    {
	if (!aStr) {
	    return aStr;
	}
	var sInString = aStr.replace( /^\s+/g, "" ); // strip leading whitespace
	return sInString.replace( /\s+$/g, "" ); // strip trailing whitespace
    },

    escapeSpace : function (aStr) 
    {
	if (!aStr) {
	    return aStr;
	}
	return aStr.replace( / /g, "\\ " ); 
    },

    textFieldAutoCompleteAction : function (aSrcTextBoxElem)
    {
        var formFieldKey = aSrcTextBoxElem.getAttribute("autocompletesearchparam");
	if (!formFieldKey) {
	    formFieldKey = aSrcTextBoxElem.id;
	}

        if (!formFieldKey || (formFieldKey == "")) {
	    return;
        }
        var formFieldValue = aSrcTextBoxElem.value;
        if (formFieldValue == "") {
	    return;
        }

        var formhistory = null;
        if ("nsIFormHistory" in Components.interfaces){
	    formhistory = Components.classes["@mozilla.org/satchel/form-history;1"].
				getService(Components.interfaces.nsIFormHistory);
        }
        else if ("nsIFormHistory2" in Components.interfaces){
	    formhistory = Components.classes["@mozilla.org/satchel/form-history;1"].
				getService(Components.interfaces.nsIFormHistory2);
        }
        if (!formhistory) {
	    return;
        }

        // use the same value for key as "autocompletesearchparam" in textbox:
        formhistory.addEntry(formFieldKey, formFieldValue);

        // do the rest of the things you need to do with query
    },

    handleTextboxChange : function (aTextboxElem, ev) 
    {
    	this.logTrace("XPSignToolSignForm.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = this.trim(aTextboxElem.value);
	}
        var formFieldKey = aTextboxElem.getAttribute("autocompletesearchparam");
	if (formFieldKey) {
	    this.textFieldAutoCompleteAction(aTextboxElem);
	}

    	this.logTrace("XPSignToolSignForm.handleTextboxChange():................End.");
    },


    initXPComServiceInfo : function ()
    {
        this.logTrace("XPSignToolSignForm.initXPComServiceInfo():................Start.");

        try {
    	    this.mIOService = Components.classes["@mozilla.org/network/io-service;1"]
		    		.getService(Components.interfaces.nsIIOService);
	    this.mDirService = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties);
	    this.mX509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
	                        .getService(Components.interfaces.nsIX509CertDB);
            this.mTokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
                                .getService(Components.interfaces.nsIPK11TokenDB);
	    this.mKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
	                        .getService(Components.interfaces.alrIKeyManager);
	    /*
            this.mCRLManager = Components.classes["@avaya.com/pkm/alrcrlmanager;1"]
				.getService(Components.interfaces.alrICRLManager);
	     */
        } catch (ex) {
    	    alert("XPSignToolSignForm.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
    	    this.logError("XPSignToolSignForm.initXPComServiceInfo(): failed to initialize one or more XPCOM based required services- ex: " + ex + "");
	    throw ex;
        }

	this.loginToInternalToken();

	this.logTrace("XPSignToolSignForm.initXPComServiceInfo():................End.");
    },


 
    getEnvironmentVariable : function (envVarName)
    {
	var envVarValue = null;
        try {
            var environment = Components.classes["@mozilla.org/process/environment;1"].
                		getService(Components.interfaces.nsIEnvironment);
            envVarValue = environment.get(envVarName);
        } catch(ex) { }
	return envVarValue;
    },
 

    initWithDefaultValues : function () 
    {
    	this.logTrace("XPSignToolSignForm.initWithDefaultValues():................Start.");

	do {
            var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
            try {
                var prefBranchPrefixId = "";
                var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
                if (!prefsBranch) {
    	            break;
                }

                var prefStringValue = null;
                var prefBoolValue = false;
                var prefIntValue = false;

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("keymgr.xpsigntool.log.enabled");
	            this.mLogEnabled = prefBoolValue;
		} catch (ex) {} 

                prefIntValue = -1;
		try {
		    prefIntValue = prefsBranch.getIntPref("keymgr.xpsigntool.log.level");
	            this.mMaxLogLevel = prefIntValue;
		} catch (ex) {} 

   
                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("keymgr.xpsigntool.sign.addSigningTime");
	            this.mAddSigningTime = prefBoolValue;
		} catch (ex) {} 

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("keymgr.xpsigntool.sign.optimizeArchive");
	            this.mOptimizeArchive = prefBoolValue;
		} catch (ex) {} 

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("keymgr.xpsigntool.sign.saveArchive");
	            this.mSaveArchive = prefBoolValue;
		} catch (ex) {} 

                prefIntValue = -1;
		try {
		    prefIntValue = prefsBranch.getIntPref("keymgr.xpsigntool.sign.compressionLevel");
	            this.mCompressionLevel = prefIntValue;
		} catch (ex) {} 

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("keymgr.xpsigntool.sign.useSignerAliasAsBaseName");
	            this.mUseSignerAliasAsBaseName = prefBoolValue;
		} catch (ex) {} 

		/*
                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("xxxxx");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mXXXXXXXX = prefStringValue;
	        }

                prefIntValue = false;
		try {
		    prefIntValue = prefsBranch.getIntPref("log.level");
	            this.mMaxLogLevel = prefIntValue;
		} catch (ex) {} 

                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("log.enabled");
		} catch (ex) {} 
	        this.mXXXX = prefBoolValue;
		*/

            } catch (ex) {
	    	this.logDebug("XPSignToolSignForm.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }
	} while (0);

    	this.logTrace("XPSignToolSignForm.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	this.logTrace("XPSignToolSignForm.initWithDialogParams():................Start.");
    	// this.logTrace("XPSignToolSignForm.initWithDialogParams(): window.arguments: " + window.arguments);

	var dialogParams = null;
	/*
	if (window.arguments != undefined) {
        if (!(window.arguments) || (window.arguments.length <= 0)) {
    	    this.logTrace("XPSignToolSignForm.initWithDialogParams():................End(0).");
	    return;
	}
	}
        dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	*/

        var pkiParams = null;
	try {
	    if (dialogParams) {
	    	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    }
	    if (pkiParams) {
		/*
	        var paramCert = pkiParams.getISupportAtIndex(1);
	        if (paramCert) {
		    this.logDebug("XPSignToolSignForm.initWithDialogParams(): paramCert: " + paramCert);
	            selectedCert = paramCRL.QueryInterface(Components.interfaces.alrIX509Cert);
	        }
		*/
	    }
	} catch (ex) {
    	    this.logError("XPSignToolSignForm.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}

    	this.logTrace("XPSignToolSignForm.initWithDialogParams():................End.");
    },

    initOnLoad : function () 
    {
    	this.logTrace("XPSignToolSignForm.initOnLoad():................Start.");

    	// this.logTrace("XPSignToolSignForm.initOnLoad(): window.arguments: " + window.arguments);

	/*
	if (window.arguments != 'undefined') {
        if ((window.arguments) && (window.arguments.length > 0)) {
            var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    this.mDialogParams = dialogParams;
	}
	}
	*/
    	this.logTrace("XPSignToolSignForm.initOnLoad():...................10.");


	this.initXPComServiceInfo();

	this.initWithDefaultValues();
	this.initWithDialogParams();

    	this.logTrace("XPSignToolSignForm.initOnLoad():................End.");
    },


    lastMethod : function () 
    {
    }
}

