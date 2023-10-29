/* @(#) $Id: CertEnrollWizard.js,v 1.7 2012/10/07 17:20:03 subrata Exp $ */

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


if ((typeof avpki) == 'undefined') {
    var avpki = {};
    avpki.keymanager = {};
}
if ((typeof avpki.keymanager) == 'undefined') {
    avpki.keymanager = {};
}


avpki.keymanager.CertEnrollWizard = {

    init : function()
    {
        dump("CertEnrollWizard.init():...................Start.\n");
        dump("CertEnrollWizard.init():...................End.\n");
    },

    wizardFinish : function (aWizardElem)
    {
        dump("CertEnrollWizard.wizardFinish():...................Start.\n");

        if (window.arguments && window.arguments[0]) {
            var pkiParams = null;
            var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
            try {
    	        pkiParams = window.arguments[0].QueryInterface(Components.interfaces.nsIPKIParamBlock);
            } catch (ex) { }
	    if (aWizardElem.enrolledCert) {
    	        pkiParams.setISupportAtIndex(1, aWizardElem.enrolledCert);
    	        dialogParams.SetInt(0, 1);
	    }
	    else {
    	        pkiParams.setISupportAtIndex(1, null);
    	    	dialogParams.SetInt(0, 0);
	    }
	}

        dump("CertEnrollWizard.wizardFinish():...................End.\n");
        return true;
    },

    wizardCancel : function (aWizardElem)
    {
        dump("CertEnrollWizard.wizardCancel():...................Start.\n");

        var dialogParams = null;
        if (window.arguments && window.arguments[0]) {
            dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	    dialogParams.SetInt(0, 0);
	}

        dump("CertEnrollWizard.wizardCancel():...................End.\n");
        return true;
    }

}

CertEnrollWizard.init();
