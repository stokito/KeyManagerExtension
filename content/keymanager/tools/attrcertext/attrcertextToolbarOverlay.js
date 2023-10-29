/* @(#) $Id: attrcertextToolbarOverlay.js,v 1.7 2013/05/23 22:42:55 subrata Exp $ */

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

avpki.keymanager.AttrCertExtToolbarOverlay =  {

    checkBinaryComponents : function ()
    {
    	if (!avpki.keymanager.KeyManagerToolbarOverlay.checkKMBinaryComponents()) {
	    return false;
	}
	return true;
    },

    getAttrCertTestDialogParams : function ()
    {
        var acSourceType = 0; // 0 ==> New, 1 ==> Load

        var acProfileType = "";
        var acProfileCustomPath = "";
        var holderNickName = "";
        var holderX509Cert = null;
        var issuerNickName = "";
        var issuerX509Cert = null;
        var outACFilePath = null;
        var outACFileBase64 = true;

        var acSourceFilePath = null;
        var acSourceFileBase64 = true;

        var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    			    .createInstance(Components.interfaces.nsIPKIParamBlock);
        var params = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

        acSourceType = 0;
        params.SetInt(0, acSourceType);
        if (acSourceType == 0) {
	    acProfileType = "demoprofile";
	    if (acProfileType && (acProfileType != "")) {
    	        params.SetString(0, acProfileType);
	    }
	    /*
	    outACFilePath = "/tmp/KeyManager/AttrCert/JohnDoe_RSATestUser1_attrcert_base64.acr";
	    outACFileBase64 = true;
	    */
	    if (outACFilePath && (outACFilePath != "")) {
    	        params.SetString(1, outACFilePath);
	        if (outACFileBase64) {
    	            params.SetString(2, "base64");
	        }
	    }
    
	    /*
    	    holderNickName = "Tiger";
    	    holderNickName = "John Doe";
	    */
    	    holderNickName = "TestUser1 XXXX";
    	    issuerNickName = "Elliot";
    
    	    var certdb = Components.classes["@mozilla.org/security/x509certdb;1"].
    			    getService(Components.interfaces.nsIX509CertDB);
	    try {
    	       holderX509Cert = certdb.findCertByNickname(null, holderNickName);
	    } catch (ex) {
    	        dump("avpki.keymanager.AttrCertExtToolbarOverlay.getAttrCertTestDialogParams(): failed to find holder cert: " + holderNickName + " - ex: " + ex + "\n");
	    }
	    try {
    	       issuerX509Cert = certdb.findCertByNickname(null, issuerNickName);
	    } catch (ex) {
    	        dump("avpki.keymanager.AttrCertExtToolbarOverlay.getAttrCertTestDialogParams(): failed to find issuer cert: " + issuerNickName + " - ex: " + ex + "\n");
	    }

    	    pkiParams.setISupportAtIndex(1, null);
	    if (holderX509Cert) {
    	        pkiParams.setISupportAtIndex(1, holderX509Cert);
	    }
	    if (issuerX509Cert) {
    	        pkiParams.setISupportAtIndex(2, issuerX509Cert);
	    }
    

	    /*
    	    dump("avpki.keymanager.AttrCertExtToolbarOverlay.getAttrCertTestDialogParams(): " + "\n" + 
    			"acProfileType: " + acProfileType + " " + 
    			"outACFilePath: " + outACFilePath + " " + 
    			"outACFileBase64: " + outACFileBase64 + "\n" + 
    			"holderNickName: " + holderNickName + " " + 
    			"holderX509Cert: " + holderX509Cert + "\n" + 
    			"issuerNickName: " + issuerNickName + " " + 
    			"issuerX509Cert: " + issuerX509Cert + " " + 
			"\n");
	    */
        }
        else {
	    /*
	    acSourceFilePath = "/tmp/KeyManager/AttrCert/JohnDoe_John_attrcert_der.acr";
	    acSourceFileBase64 = false;
	    */
	    acSourceFilePath = "/tmp/KeyManager/AttrCert/JohnDoe_RSATestUser1_attrcert_base64.acr";
	    acSourceFileBase64 = true;
	    if (acSourceFilePath && (acSourceFilePath != "")) {
    	        params.SetString(0, acSourceFilePath);
	        if (acSourceFileBase64) {
    	            params.SetString(1, "base64");
	        }
	    }
        }
        return pkiParams;
    },


    runAttrCertExtForm : function ()
    {
	if (!avpki.keymanager.AttrCertExtToolbarOverlay.checkBinaryComponents()) {
	    return;
	}

    	var /* alrIAttributeCertFactory */ attrCertFactory = null;
	try {
    	    attrCertFactory = Components.classes["@avaya.com/pkm/attrcertfactory;1"].
	                    getService(Components.interfaces.alrIAttributeCertFactory);
	} catch (ex) {
    	    dump("runAttrCertExtForm(): failed to find issuer cert: " + issuerNickName + " - ex: " + ex + "\n");
    	    alert("runAttrCertExtForm(): failed to find issuer cert: " + issuerNickName + " - ex: " + ex + "\n");
	    return;
	}
    	// dump("runAttrCertExtForm(): attrCertFactory: " + attrCertFactory + "\n");

	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();

        var attrCertDialogURL = "chrome://keymanager/content/tools/attrcertext/AttrCertForm.xul";
        var acDialogParams = null;

        // acDialogParams = avpki.keymanager.AttrCertExtToolbarOverlay.getAttrCertTestDialogParams();
        if (acDialogParams) {
    	    window.openDialog(
		    attrCertDialogURL,
		    '_blank',
		    'chrome,centerscreen,resizable,dialog=no,titlebar',
		    acDialogParams
		    );
	    // Test is over.
    	    return;
        }

        //check for an existing Attribute Cert manager window and focus it; it's not application modal
        const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
        var lastAttrCertSigner = kWindowMediator.getMostRecentWindow("avaya:attrcertsigner");
        if (lastAttrCertSigner) {
            lastAttrCertSigner.focus();
	    return;
        }
    	window.openDialog(attrCertDialogURL, 'attrcertsigner', 'chrome,centerscreen,resizable=yes,dialog=no,titlebar');
    	// window.openDialog(attrCertDialogURL, '_blank', 'chrome,centerscreen,resizable,dialog=no,titlebar');
    }

}
