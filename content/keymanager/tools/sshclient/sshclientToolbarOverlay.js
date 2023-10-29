/* @(#) $Id: sshclientToolbarOverlay.js,v 1.7 2012/10/07 17:21:11 subrata Exp $ */

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

window.addEventListener(
  "load",
  function (e) {
    avpki.keymanager.SSHClientToolbarOverlay.activateTool(e);
  },
  false
);

avpki.keymanager.SSHClientToolbarOverlay = {

    checkBinaryComponents : function ()
    {
    	if (!avpki.keymanager.KeyManagerToolbarOverlay.checkKMBinaryComponents()) {
	    return false;
	}
	return true;
    },

    isToolEnabled : function () 
    {
	// dump("SSHClientToolbarOverlay.isToolEnabled():................Start.\n");

        var sshclientEnabled = false;
        do {
            try {
    	        var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			        .getService(Components.interfaces.nsIPrefService);

	        var prefBranchPrefixId = "";
	        var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
	        if (!prefsBranch) {
	    	    break;
	        }

                var prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.sshclient.enabled");
	        if (prefBoolValue) {
	    	    sshclientEnabled = true;
	        }
            } catch (ex) {
	        // dump("SSHClientToolbarOverlay.isToolEnabled():  unable to obtain preferences - ex: " + ex + "\n");
	    }
        } while (0);

        // dump("SSHClientToolbarOverlay.isToolEnabled():  sshclientEnabled: " + sshclientEnabled + "\n");

	// dump("SSHClientToolbarOverlay.isToolEnabled():................End.\n");
	return sshclientEnabled;
    },

    activateTool : function (ev) 
    {
	// dump("SSHClientToolbarOverlay.activateTool():................Start.\n");

        // Note:  
        // Enable SSH Client conditinally. 
        // SSH-client is enabled if the 'keymgr.sshclient.enabled' preference is
        // set to true.

	var sshclientEnabled = avpki.keymanager.SSHClientToolbarOverlay.isToolEnabled();

        var sshclientMenuItemIdList = [
    		"keymanager.sshclient.dialog.ff.menuitem",
    		"keymanager.cmd.toolbar.sshclient",
    		"keymanager.sshclient.dialog.moz.menuitem",
    		"keymanager.sshclient.dialog.sb.menuitem"
		];

        for (var i = 0; i < sshclientMenuItemIdList.length; i++) {
    	    var sshclientMenuItemId = sshclientMenuItemIdList[i];
	    var sshclientMenuItemElem = document.getElementById(sshclientMenuItemId);
	    if (!sshclientMenuItemElem) {
	        continue;
	    }
	    if (!sshclientEnabled) {
	        // sshclientMenuItemElem.setAttribute("hidden", true);
	        sshclientMenuItemElem.setAttribute("disabled", true);
	        continue;
	    }
	    // sshclientMenuItemElem.removeAttribute("hidden");
	    sshclientMenuItemElem.removeAttribute("disabled");
        }

	// dump("SSHClientToolbarOverlay.activateTool():................End.\n");
    },

    getTestDialogParams : function () 
    {
	// dump("SSHClientToolbarOverlay.getTestDialogParams():................Start.\n");

    	var keyCertNickName = "";
    	var keyX509Cert = null;

    	var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    				.createInstance(Components.interfaces.nsIPKIParamBlock);
    	var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

    	keyCertNickName = "TestUser1 XXXX";
    	keyCertNickName = "Pervez";
    	keyCertNickName = "Barak";

    	var certdb = Components.classes["@mozilla.org/security/x509certdb;1"]
    			.getService(Components.interfaces.nsIX509CertDB);
    	try {
    	    keyX509Cert = certdb.findCertByNickname(null, keyCertNickName);
    	} catch (ex) {
    	    dump("sshclientToolsOverlay.xul::getSSHClientTestDialogParams(): failed to find key cert: " + keyCertNickName + " - ex: " + ex + "\n");
	    // return null;
    	}

    	pkiParams.setISupportAtIndex(1, null);
    	if (keyX509Cert) {
    	    pkiParams.setISupportAtIndex(1, keyX509Cert);
    	}

	/*
    	dump("sshclientToolsOverlay.xul::getAttrCertTestDialogParams(): " + "\n" + 
    			"keyCertNickName: " + keyCertNickName + " " + 
    			"keyX509Cert: " + keyX509Cert + "\n" + 
			"\n");
	*/

	// dump("SSHClientToolbarOverlay.getTestDialogParams():................End.\n");
    	return pkiParams;
    },

    runSSHClientDialog : function () 
    {
	if (!avpki.keymanager.SSHClientToolbarOverlay.checkBinaryComponents()) {
	    return;
	}

	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();

    	var sshClientURL = "chrome://keymanager/content/tools/sshclient/SSHClientDialog.xul";
    	var sshclientDialogParams = null;

    	// sshclientDialogParams = avpki.keymanager.SSHClientToolbarOverlay.getTestDialogParams();
    	if (sshclientDialogParams) {
    	    window.openDialog(
		        sshClientURL,
		        '_blank',
		        'chrome,centerscreen,resizable,dialog=no,titlebar',
		        sshclientDialogParams
		        );
	    // Test is over.
    	    return;
    	}


    	const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);

    	// check for an existing SSH Client Dialog window and focus it; it's not application modal
    	var lastSSHClient = kWindowMediator.getMostRecentWindow("avaya:sshclient");
    	if (lastSSHClient) {
            lastSSHClient.focus();
	    return;
    	}
	window.openDialog(sshClientURL,  "sshclient",
                	'chrome,centerscreen,resizable=yes,dialog=no,titlebar');
    }
}

