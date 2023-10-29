/* @(#) $Id: jksmanagecertToolbarOverlay.js,v 1.7 2012/10/07 17:20:30 subrata Exp $ */

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


window.addEventListener(
  "load",
  function (e) {
    avpki.keymanager.JKSManageCertToolbarOverlay.activateTool(e);
  },
  false
);

if (typeof avpki == 'undefined') {
    avpki = {};
}
if (typeof avpki.keymanager == 'undefined') {
    avpki.keymanager = {};
}

avpki.keymanager.JKSManageCertToolbarOverlay = {

    checkBinaryComponents : function ()
    {
    	if (!avpki.keymanager.KeyManagerToolbarOverlay.checkKMBinaryComponents()) {
	    return false;
	}
	return true;
    },

    isToolEnabled : function () 
    {
	// dump("avpki.keymanager.JKSManageCertToolbarOverlay.isToolEnabled():................Start.\n");

        var jksmanagecertEnabled = false;
        do {
	    /*
    	    var isLinux = (navigator.userAgent.indexOf("Linux") != -1);
    	    var isMac = (navigator.userAgent.indexOf("Mac") != -1);
    	    var isWin = (navigator.userAgent.indexOf("Win") != -1);
	    if (isWin) {
		// JKSManageCert tool is not yet supported for Windows OS.
	    	break;
	    }
	    */

            try {
    	        var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			        .getService(Components.interfaces.nsIPrefService);

	        var prefBranchPrefixId = "";
	        var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
	        if (!prefsBranch) {
	    	    break;
	        }

                var prefBoolValue = prefsBranch.getBoolPref("extensions.avpki.jksmanagecert.enabled");
	        if (prefBoolValue) {
	    	    jksmanagecertEnabled = true;
	        }
            } catch (ex) {
	        // dump("avpki.keymanager.JKSManageCertToolbarOverlay.isToolEnabled():  unable to obtain preferences - ex: " + ex + "\n");
	    }
        } while (0);
        // dump("avpki.keymanager.JKSManageCertToolbarOverlay.isToolEnabled():  jksmanagecertEnabled: " + jksmanagecertEnabled + "\n");

	// dump("avpki.keymanager.JKSManageCertToolbarOverlay.isToolEnabled():................End.\n");
	return jksmanagecertEnabled;
    },

    activateTool : function (ev) 
    {
	// dump("avpki.keymanager.JKSManageCertToolbarOverlay.activateTool():................Start.\n");

        // Note:  
        // Enable JKSManageCertTool conditinally. 
        // JKSManageCertTool is enabled if the 'keymgr.jksmanagecert.enabled' preference is
        // set to true.

	var jksmanagecertEnabled = avpki.keymanager.JKSManageCertToolbarOverlay.isToolEnabled();

        var jksmanagecertMenuItemIdList = [
    		"keymanager.jksmanagecert.dialog.ff.menuitem",
    		"keymanager.cmd.toolbar.jksmanagecert",
    		"keymanager.jksmanagecert.dialog.moz.menuitem",
    		"keymanager.jksmanagecert.dialog.sb.menuitem"
		];

        for (var i = 0; i < jksmanagecertMenuItemIdList.length; i++) {
    	    var jksmanagecertMenuItemId = jksmanagecertMenuItemIdList[i];
	    var jksmanagecertMenuItemElem = document.getElementById(jksmanagecertMenuItemId);
	    if (!jksmanagecertMenuItemElem) {
	        continue;
	    }
	    if (!jksmanagecertEnabled) {
	        jksmanagecertMenuItemElem.setAttribute("hidden", true);
	        continue;
	    }
	    jksmanagecertMenuItemElem.removeAttribute("hidden");
        }

	// dump("avpki.keymanager.JKSManageCertToolbarOverlay.activateTool():................End.\n");
    },

    getTestDialogParams : function () 
    {
	// dump("avpki.keymanager.JKSManageCertToolbarOverlay.getTestDialogParams():................Start.\n");

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
    	    dump("jksmanagecertToolsOverlay.xul::getJKSManageCertTestDialogParams(): failed to find key cert: " + keyCertNickName + " - ex: " + ex + "\n");
	    // return null;
    	}

    	pkiParams.setISupportAtIndex(1, null);
    	if (keyX509Cert) {
    	    pkiParams.setISupportAtIndex(1, keyX509Cert);
    	}

	/*
    	dump("jksmanagecertToolsOverlay.xul::getAttrCertTestDialogParams(): " + "\n" + 
    			"keyCertNickName: " + keyCertNickName + " " + 
    			"keyX509Cert: " + keyX509Cert + "\n" + 
			"\n");
	*/

	// dump("avpki.keymanager.JKSManageCertToolbarOverlay.getTestDialogParams():................End.\n");
    	return pkiParams;
    },

    runJKSManageCertDialog : function () 
    {
	// dump("avpki.keymanager.JKSManageCertToolbarOverlay.runJKSManageCertDialog():................Start.\n");
	if (!avpki.keymanager.JKSManageCertToolbarOverlay.checkBinaryComponents()) {
	    return;
	}

	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();

    	var jksManageCertURL = "chrome://keymanager/content/tools/jksmanagecert/JKSManageCert.xul";
    	var jksmanagecertDialogParams = null;

    	// jksmanagecertDialogParams = avpki.keymanager.JKSManageCertToolbarOverlay.getTestDialogParams();
    	if (jksmanagecertDialogParams) {
    	    window.openDialog(
		        jksManageCertURL,
		        '_blank',
		        'chrome,centerscreen,resizable,dialog=no,titlebar',
		        jksmanagecertDialogParams
		        );
	    // Test is over.
    	    return;
    	}


    	// getWindowMediator() is defined in keymanagerOverlay.xul which is container for this overlay.
        const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);

    	// check for an existing JKSManageCert Tool window and focus it; it's not application modal
    	var lastJKSManageCert = kWindowMediator.getMostRecentWindow("avaya:jksmanagecert");
    	if (lastJKSManageCert) {
            lastJKSManageCert.focus();
    	}
    	else {
	    window.openDialog(jksManageCertURL,  "jksmanagecert",
                	'chrome,centerscreen,resizable=yes,dialog=no,titlebar');
    	}
	// dump("avpki.keymanager.JKSManageCertToolbarOverlay.runJKSManageCertDialog():................End.\n");
    }
}

