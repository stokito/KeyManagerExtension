/* @(#) $Id: exportFormatTypeDialog.js,v 1.13 2013/05/23 22:42:53 subrata Exp $ */

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


var X509CertExportFormatDialog = {

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
        var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);
        var certType = dialogParams.GetString(0);
        var numCerts = dialogParams.GetInt(0);

        var exportFormatTypeGroupElem = document.getElementById("keymgr.key.export.format.type");

        var exportFormatTypeOsslEPKElem = document.getElementById("keymgr.key.export.format.type.osslepk");
        var exportFormatTypePkcs8Elem = document.getElementById("keymgr.key.export.format.type.pkcs8");
        var exportFormatTypePkcs10Elem = document.getElementById("keymgr.key.export.format.type.pkcs10");
        var exportFormatTypePkcs12Elem = document.getElementById("keymgr.key.export.format.type.pkcs12");

        var exportFormatTypeX509Elem = document.getElementById("keymgr.key.export.format.type.x509");
        if (certType == "nonUserCerts") {
	    /*
            exportFormatTypeOsslEPKElem.hidden = true;
	    exportFormatTypePkcs8Elem.hidden = true;
	    exportFormatTypePkcs10Elem.hidden = true;
	    exportFormatTypePkcs12Elem.hidden = true;
	    */
	    var /* NodeList */ privateKeyOptionElemList = exportFormatTypeGroupElem.getElementsByAttribute("privatekeyonly", "true");
	    for (var i = 0; i < privateKeyOptionElemList.length; i++) {
	    	var privateKeyOptionElem = privateKeyOptionElemList.item(i);
		privateKeyOptionElem.hidden = true;
	    }
	    exportFormatTypeGroupElem.selectedItem = exportFormatTypeX509Elem;
	    // this.handleKeyExportFormatTypeChange(exportFormatTypeX509Elem);
        }
        this.handleKeyExportFormatTypeChange(exportFormatTypeGroupElem.selectedItem);
    },

    handleKeyExportFormatTypeGroupChange : function (aFormatTypeGroupElem, ev)
    {
        if (!aFormatTypeGroupElem.selectedItem) {
    	    return;
        }

        var exportFormatTypeGroupElem = document.getElementById("keymgr.key.export.format.type");
        var exportFormatEncodingGroupElem = document.getElementById("keymgr.key.export.format.encoding");

        // Default Encoding format is Base64
        var exportFormatEncodingItemId = exportFormatEncodingGroupElem.id + ".base64";

        // If PKCS#12 format is choosen then the output is always in DER format
        if (exportFormatTypeGroupElem.selectedItem.value == "pkcs12") {
	    exportFormatEncodingItemId = exportFormatEncodingGroupElem.id + ".der";
        }

        var exportFormatEncodingSelectedElem = document.getElementById(exportFormatEncodingItemId);
        if (exportFormatEncodingSelectedElem != null) {
    	    exportFormatEncodingGroupElem.selectedItem = exportFormatEncodingSelectedElem;
        }

        this.handleKeyExportFormatTypeChange(aFormatTypeGroupElem.selectedItem);
    },
    
    handleKeyExportFormatTypeChange : function (selectedFormatTypeElem)
    {
        var exportFormatTypeGroupElem = document.getElementById("keymgr.key.export.format.type");
        var exportFormatEncodingGroupElem = document.getElementById("keymgr.key.export.format.encoding");

        this.handleExportFormatEncodingChangeX(exportFormatEncodingGroupElem);

        // Disbale the choice for changing the format for following file types:
        // If PKCS#12 format is choosen then the output is always in DER format
        // If OSSLEPK, OpenSSH2 or PuttySSH2 format is choosen then the output is always in PEM format
        if (selectedFormatTypeElem.value == "pkcs12") {
    	    exportFormatEncodingGroupElem.disabled = true;
        }
        else if (selectedFormatTypeElem.value == "osslepk") {
    	    exportFormatEncodingGroupElem.disabled = true;
        }
        else if ((selectedFormatTypeElem.value == "openssh2")
    	    || (selectedFormatTypeElem.value == "openssh2pubk")
    	    || (selectedFormatTypeElem.value == "puttyssh2")) {
    	    exportFormatEncodingGroupElem.disabled = true;
        }
        else {
    	    exportFormatEncodingGroupElem.disabled = false;
    	    exportFormatEncodingGroupElem.removeAttribute("disabled");
        }

        var includeCertChainRowElem = document.getElementById("keymgr.key.export.cert.include.certchain.row");
        if ((selectedFormatTypeElem.value == "x509")
    	    || (selectedFormatTypeElem.value == "pkcs7")
    	    || (selectedFormatTypeElem.value == "osslepk")) {
    	    includeCertChainRowElem.hidden = false;
        }
        else {
	    if ((selectedFormatTypeElem.value == "pkcs8")
	        && (exportFormatEncodingGroupElem.selectedItem.value == "base64")) {
    	        includeCertChainRowElem.hidden = false;
	    }
	    else {
    	        includeCertChainRowElem.hidden = true;
	    }
        }

        var encryptionParamRowElem	= document.getElementById("keymgr.key.export.cert.enc.param.row");
        var osslEPKEncAlgMenuElem	= document.getElementById("keymgr.key.export.cert.enc.algname.osslepk.menuList");
        var pkcs8EncAlgMenuElem	= document.getElementById("keymgr.key.export.cert.enc.algname.pkcs8.menuList");
        if ((selectedFormatTypeElem.value == "osslepk")
    	    || (selectedFormatTypeElem.value == "pkcs8")) {
    	    encryptionParamRowElem.hidden = false;
	    if (selectedFormatTypeElem.value == "osslepk") {
	        pkcs8EncAlgMenuElem.hidden = true;
	        osslEPKEncAlgMenuElem.hidden = false;
	        this.handleOSSLEPKEncAlgMenuListChange(osslEPKEncAlgMenuElem);
	    }
	    else {
	        pkcs8EncAlgMenuElem.hidden = false;
	        osslEPKEncAlgMenuElem.hidden = true;
	        this.handlePKCS8EncAlgMenuListChange(pkcs8EncAlgMenuElem);
	    }
        }
        else {
    	    encryptionParamRowElem.hidden = true;
        }
    },

    handleExportFormatEncodingChangeX : function (aEncodingFormatGroupElem, ev)
    {
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
    },

    handleExportFormatEncodingChange : function (aEncodingFormatGroupElem, ev)
    {
        var exportFormatTypeGroupElem = document.getElementById("keymgr.key.export.format.type");
        this.handleKeyExportFormatTypeChange(exportFormatTypeGroupElem.selectedItem);
    },

    handleOSSLEPKEncAlgMenuListChange : function (aOsslEPKEncAlgMenuElem, ev)
    {
        var encAlgNameElem = document.getElementById("keymgr.key.export.cert.enc.algname");
        encAlgNameElem.value = aOsslEPKEncAlgMenuElem.value;
    },

    handlePKCS8EncAlgMenuListChange : function (aPKCS8EncAlgMenuElem, ev)
    {
        var encAlgNameElem = document.getElementById("keymgr.key.export.cert.enc.algname");
        encAlgNameElem.value = aPKCS8EncAlgMenuElem.value;
    },

    acceptExportFormat : function ()
    {
        var retParamCnt = 0;
        var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);

        var exportFormatTypeGroupElem	= document.getElementById("keymgr.key.export.format.type");
        var exportFormatEncodingGroupElem	= document.getElementById("keymgr.key.export.format.encoding");
        var includeCertChainElem		= document.getElementById("keymgr.key.export.cert.include.certchain");
        var iterationCntElem		= document.getElementById("keymgr.key.export.cert.enc.iteration");
        var encAlgNameElem			= document.getElementById("keymgr.key.export.cert.enc.algname");
        var fileViewElem			= document.getElementById("keymgr.key.export.file.view");

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

        if ((exportFormatTypeGroupElem.selectedItem.value == "pkcs8")
	    || (exportFormatTypeGroupElem.selectedItem.value == "osslepk")) {
	    dialogParams.SetString(4, iterationCntElem.value); retParamCnt++;
	    dialogParams.SetString(5, encAlgNameElem.value); retParamCnt++;
        }
        dialogParams.SetInt(0, retParamCnt);

        window.close(0);
    },

    cancelExportFormat : function ()
    {
        var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);
        dialogParams.SetInt(0, 0);

        window.close(0);
    },

    lastMethod : function () 
    {
    }

}


