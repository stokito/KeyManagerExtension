/* @(#) $Id: exportFormatTypeDialog.js,v 1.2 2012/10/03 14:20:36 subrata Exp $ */

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



const nsIDialogParamBlock = Components.interfaces.nsIDialogParamBlock;
const nsDialogParamBlock = "@mozilla.org/embedcomp/dialogparam;1";


var X509CRLExportFormatDialog = {

    mMaxLogLevel : 2,
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

    trim : function (aStr) 
    {
	if (!aStr) {
	    return aStr;
	}
	var sInString = aStr.replace( /^\s+/g, "" ); // strip leading whitespace
	return sInString.replace( /\s+$/g, "" ); // strip trailing whitespace
    },

    onLoad : function ()
    {
	this.logTrace("X509CRLExportFormatDialog.onLoad():...........................Start.");

        var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);

        var exportFormatTypeGroupElem = document.getElementById("keymgr.key.export.format.type");
        var exportFormatTypeX509Elem = document.getElementById("keymgr.key.export.format.type.x509crl");

        this.handleKeyExportFormatTypeChange(exportFormatTypeGroupElem.selectedItem);

	this.logTrace("X509CRLExportFormatDialog.onLoad():...........................End.");
    },

    handleKeyExportFormatTypeChange : function (selectedFormatTypeElem)
    {
	this.logTrace("X509CRLExportFormatDialog.handleKeyExportFormatTypeChange():...........................Start.");

        var exportFormatTypeGroupElem = document.getElementById("keymgr.key.export.format.type");
        var exportFormatEncodingGroupElem = document.getElementById("keymgr.key.export.format.encoding");

        this.handleExportFormatEncodingChangeX(exportFormatEncodingGroupElem);

        var includeCertChainRowElem = document.getElementById("keymgr.key.export.cert.include.certchain.row");
	/*
        if ((selectedFormatTypeElem.value == "x509crl")
    	    || (selectedFormatTypeElem.value == "pkcs7")) {
	*/
        if (selectedFormatTypeElem.value == "pkcs7") {
    	    includeCertChainRowElem.hidden = false;
        }
	else {
    	    includeCertChainRowElem.hidden = true;
	}
	this.logTrace("X509CRLExportFormatDialog.handleKeyExportFormatTypeChange():...........................End.");
    },

    handleKeyExportFormatTypeGroupChange : function (aFormatTypeGroupElem, ev)
    {
	this.logTrace("X509CRLExportFormatDialog.handleKeyExportFormatTypeGroupChange():...........................Start.");

        if (!aFormatTypeGroupElem.selectedItem) {
	    this.logTrace("X509CRLExportFormatDialog.handleKeyExportFormatTypeGroupChange():...........................End(0).");
    	    return;
        }

        var exportFormatTypeGroupElem = document.getElementById("keymgr.key.export.format.type");
        var exportFormatEncodingGroupElem = document.getElementById("keymgr.key.export.format.encoding");

        // Default Encoding format is Base64
        var exportFormatEncodingItemId = exportFormatEncodingGroupElem.id + ".base64";

        var exportFormatEncodingSelectedElem = document.getElementById(exportFormatEncodingItemId);
        if (exportFormatEncodingSelectedElem != null) {
    	    exportFormatEncodingGroupElem.selectedItem = exportFormatEncodingSelectedElem;
        }

        this.handleKeyExportFormatTypeChange(aFormatTypeGroupElem.selectedItem);

	this.logTrace("X509CRLExportFormatDialog.handleKeyExportFormatTypeGroupChange():...........................End.");
    },
    
    handleExportFormatEncodingChangeX : function (aEncodingFormatGroupElem, ev)
    {
	this.logTrace("X509CRLExportFormatDialog.handleExportFormatEncodingChangeX():...........................Start.");

        var encodingFormatElem = aEncodingFormatGroupElem.selectedItem;

        var exportFormatTypeGroupElem = document.getElementById("keymgr.key.export.format.type");
        var fileViewRowElem = document.getElementById("keymgr.key.export.file.view.row");

        var exportFormatType = exportFormatTypeGroupElem.selectedItem.value;

        fileViewRowElem.hidden = true;
        /*
        if (encodingFormatElem.value == "base64") {
	    if ((exportFormatType == "pkcs8") || (exportFormatType == "pkcs10")) {
    	        fileViewRowElem.hidden = false;
	    }
        }
        */
	this.logTrace("X509CRLExportFormatDialog.handleExportFormatEncodingChangeX():...........................End.");
    },

    handleExportFormatEncodingChange : function (aEncodingFormatGroupElem, ev)
    {
        var exportFormatTypeGroupElem = document.getElementById("keymgr.key.export.format.type");
        this.handleKeyExportFormatTypeChange(exportFormatTypeGroupElem.selectedItem);
    },

    acceptExportFormat : function ()
    {
	this.logTrace("X509CRLExportFormatDialog.acceptExportFormat():...........................Start.");

        var retParamCnt = 0;
        var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);

        var exportFormatTypeGroupElem	= document.getElementById("keymgr.key.export.format.type");
        var exportFormatEncodingGroupElem	= document.getElementById("keymgr.key.export.format.encoding");
        var includeCertChainElem		= document.getElementById("keymgr.key.export.cert.include.certchain");
        var iterationCntElem		= document.getElementById("keymgr.key.export.cert.enc.iteration");
        var encAlgNameElem		= document.getElementById("keymgr.key.export.cert.enc.algname");
        var fileViewElem		= document.getElementById("keymgr.key.export.file.view");

        dialogParams.SetString(0, exportFormatTypeGroupElem.selectedItem.value); retParamCnt++;
        dialogParams.SetString(1, exportFormatEncodingGroupElem.selectedItem.value); retParamCnt++;

        if (includeCertChainElem.checked) {
            dialogParams.SetString(2, "true"); retParamCnt++;
        }
        else {
	    dialogParams.SetString(2, "false"); retParamCnt++;
        }
        if (fileViewElem.checked) {
	    dialogParams.SetString(3, ("" + fileViewElem.checked)); retParamCnt++;
        }

        dialogParams.SetInt(0, retParamCnt);

        window.close(0);

	this.logTrace("X509CRLExportFormatDialog.acceptExportFormat():...........................End.");
    },

    cancelExportFormat : function ()
    {
	this.logTrace("X509CRLExportFormatDialog.cancelExportFormat():...........................Start.");

        var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);
        dialogParams.SetInt(0, 0);

        window.close(0);

	this.logTrace("X509CRLExportFormatDialog.cancelExportFormat():...........................End.");
    },

    lastMethod : function () 
    {
    }

}


