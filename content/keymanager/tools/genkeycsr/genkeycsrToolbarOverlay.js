/* @(#) $Id: genkeycsrToolbarOverlay.js,v 1.6 2012/01/26 02:49:34 subrata Exp $ */

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

if (typeof avpki == 'undefined') {
    avpki = {};
}
if (typeof avpki.keymanager == 'undefined') {
    avpki.keymanager = {};
}

avpki.keymanager.GenKeyCSRToolbarOverlay = {

    checkBinaryComponents : function ()
    {
    	if (!avpki.keymanager.KeyManagerToolbarOverlay.checkKMBinaryComponents()) {
	    return false;
	}
	return true;
    },

    runGenKeyAndCSR : function (aGenerateCSR)
    {
	if (!avpki.keymanager.GenKeyCSRToolbarOverlay.checkBinaryComponents()) {
	    return;
	}

        var genKeyCSRDialogURL = 'chrome://keymanager/content/tools/genkeycsr/generatePKCS10CSR.xul';


        var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    			.createInstance(Components.interfaces.nsIPKIParamBlock);
        var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);


        var numcerts = 0;

        dialogParams.SetInt(0, numcerts);
	if (aGenerateCSR) {
            dialogParams.SetString(0, "generateCSR");
	}
	else {
            dialogParams.SetString(0, "generateSelfSignedCert");
	}
        window.openDialog(
		genKeyCSRDialogURL,
  		'_blank',
		'chrome,centerscreen,resizable,modal',
		dialogParams
		);
	/*
	window.setCursor('wait'); 
	window.setCursor('auto')
	window.setAttribute("wait-cursor", true);
	window.removeAttribute("wait-cursor");
	*/
    },
 
    runGenPKCS10CSR : function ()
    {
    	avpki.keymanager.GenKeyCSRToolbarOverlay.runGenKeyAndCSR(true);
    },

    runGenSelfSignedCert : function ()
    {
    	avpki.keymanager.GenKeyCSRToolbarOverlay.runGenKeyAndCSR(false);
    },

    runGenPKCS10CSRWizard : function ()
    {
	if (!avpki.keymanager.GenKeyCSRToolbarOverlay.checkBinaryComponents()) {
	    return;
	}

        var genKeyCSRWizardURL = 'chrome://keymanager/content/tools/genkeycsr/GeneratePKCS10CSRWizard.xul';


        var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    				.createInstance(Components.interfaces.nsIPKIParamBlock);
        var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

        var genKeyCSRWizard = window.open(
				genKeyCSRWizardURL,
  				'_blank',
				'chrome,centerscreen,modal,resizable',
				dialogParams
				);
        var retVal = dialogParams.GetInt(0);
        if (retVal == 0) {
    	    return;
        }
        var base64PKCS10CSR = dialogParams.GetString(0);
	dump("runGenPKCS10CSRWizard(): base64PKCS10CSR:\n" + base64PKCS10CSR + "\n");
    }
 
}
