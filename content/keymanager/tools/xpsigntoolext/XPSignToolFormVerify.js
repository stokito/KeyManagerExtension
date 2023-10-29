/* @(#) $Id: XPSignToolFormVerify.js,v 1.9 2012/10/03 14:20:48 subrata Exp $ */

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


var gArcVerifyInputFilePickerElem;
var gArcVerifySignerCertElem;
var gArcVerifyTreeTempDirElem;
var gArcVerifyResultElem;

function xpsigntoolext_initVerifyFormXULElems()
{

    // XPSignToolForm.logTrace("xpsigntoolext_initVerifyFormXULElems():................Start.");

    gArcVerifyInputFilePickerElem	= document.getElementById("xpsigntoolext.form.verify.file.archive.in.file.path");
    gArcVerifySignerCertElem		= document.getElementById("xpsigntoolext.form.verify.signer.cert.nickName");
    gArcVerifyTreeTempDirElem		= document.getElementById("xpsigntoolext.form.verify.file.archive.tmp.path");
    gArcVerifyResultElem		= document.getElementById("xpsigntoolext.form.verify.file.archive.result");

    xpsigntoolext_loginToInternalToken();

    // XPSignToolForm.logTrace("xpsigntoolext_initVerifyFormXULElems():................End.");
}

function xpsigntoolext_verifySignedArchiveFile()
{
    XPSignToolForm.logTrace("xpsigntoolext_verifySignedArchiveFile():................Start.");

    var signedZipFile = gArcVerifyInputFilePickerElem.file;
    if (signedZipFile == null) {
    	XPSignToolForm.logError("xpsigntoolext_verifySignedArchiveFile(): signed archive file name is missing.");
    	alert("xpsigntoolext_verifySignedArchiveFile(): signed archive file name is missing.");
    	return false;
    }

    var xpSignTool = null;
    try {
    	xpSignTool = Components.classes["@avaya.com/pkm/xpsigntool;1"]
    			.getService(Components.interfaces.alrIXPSignTool);
    } catch (ex) {
    	XPSignToolForm.logError("xpsigntoolext_verifySignedArchiveFile(): failed to create instance of alrIXPSignTool - ex: " + ex + "");
    	gArcVerifyResultElem.value = "failed to create instance of alrIXPSignTool - ex: " + ex;
	throw ex;
    }
    if (xpSignTool == null) {
    	XPSignToolForm.logError("xpsigntoolext_verifySignedArchiveFile(): failed to create instance of alrIXPSignTool.");
    	gArcVerifyResultElem.value = "failed to create instance of alrIXPSignTool.\n";
    	return false;
    }
    XPSignToolForm.logTrace("xpsigntoolext_verifySignedArchiveFile(): successfully obtained reference to alrIXPSignTool : " + xpSignTool + "");

    var signerCertObj = new Object();
    var resultStrObj = new Object();
    var errStrObj = new Object();
    var verificationResultObj = new Object();
    var isPassed = false;
    try {
    	isPassed = xpSignTool.verifySignedArchive(
                        signedZipFile,
			signerCertObj,
                        resultStrObj,
			errStrObj,
                        verificationResultObj
                        );
    } catch (ex) {
    	XPSignToolForm.logError("xpsigntoolext_signArchiveFile(): failed to verify signed archive file - ex : " + ex + "");
    	alert("xpsigntoolext_signArchiveFile(): failed to verify signed archive file - ex : " + ex + "");
	throw ex;
    }

    if (!isPassed) {
	var resultMsg = "";
	if (resultStrObj.value) {
	    resultMsg += resultStrObj.value;
	}
	if (errStrObj.value) {
	    resultMsg += "\n\n";
	    resultMsg += errStrObj.value;
	}
	
    	gArcVerifyResultElem.value = resultMsg;
	if (signerCertObj.value) {
    	    gArcVerifySignerCertElem.cert = signerCertObj.value;
	}
    	XPSignToolForm.logError("xpsigntoolext_verifySignedArchiveFile():................End(FAILED).");
	return false;
    }

    gArcVerifySignerCertElem.cert = signerCertObj.value;
    gArcVerifyResultElem.value = resultStrObj.value;

    XPSignToolForm.logTrace("xpsigntoolext_verifySignedArchiveFile():................End.");
    return true;
}

