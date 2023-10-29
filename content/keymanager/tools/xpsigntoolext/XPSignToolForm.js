/* @(#) $Id: XPSignToolForm.js,v 1.14 2012/10/03 14:20:47 subrata Exp $ */

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


var XPSignToolForm = {
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
    lastMethod : function()
    {
    }
   
};

function xpsigntoolext_initOnLoad()
{
    XPSignToolForm.logTrace("xpsigntoolext_initOnLoad():................Start.");

    try {
    	xpsigntoolext_initSignFormXULElems();

    	xpsigntoolext_initVerifyFormXULElems();

    	xpsigntoolext_initInstallUpdateManifestXULElems();

        var xpiSignToolTabboxElem = document.getElementById('xpsigntoolext.form.tabbox');
        var xpiSignToolSignTabElem = document.getElementById('xpsigntoolext.form.tab.sign');
        var xpiSignToolVerifyTabElem = document.getElementById('xpsigntoolext.form.tab.verify');
        var xpiSignToolSignUpdateRdfTabElem = document.getElementById('xpsigntoolext.form.tab.sign.update.rdf');
	if (xpiSignToolTabboxElem.selectedTab == xpiSignToolSignTabElem) {
    	    xpsigntoolext_showSignForm();
	}
	else if (xpiSignToolTabboxElem.selectedTab == xpiSignToolVerifyTabElem) {
	    xpsigntoolext_showVerifyForm();
	}
	else if (xpiSignToolTabboxElem.selectedTab == xpiSignToolSignUpdateRdfTabElem) {
	    xpsigntoolext_showSignUpdateRdfForm();
	}
	else  {
	    xpiSignToolTabboxElem.selectedTab = xpiSignToolSignTabElem;
    	    xpsigntoolext_showSignForm();
	}


    } catch (ex) {
    	XPSignToolForm.logError("xpsigntoolext_initOnLoad(): ex - " + ex + "");
    }


    XPSignToolForm.logTrace("xpsigntoolext_initOnLoad():................End.");
}


function xpsigntoolext_showSignForm()
{
    var signCmdButtonElem = document.getElementById('xpsigntoolext.cmd.sign');
    var verifyCmdButtonElem = document.getElementById('xpsigntoolext.cmd.verify');

    signCmdButtonElem.hidden = false;
    verifyCmdButtonElem.hidden = true;
}

function xpsigntoolext_showVerifyForm()
{
    var signCmdButtonElem = document.getElementById('xpsigntoolext.cmd.sign');
    var verifyCmdButtonElem = document.getElementById('xpsigntoolext.cmd.verify');

    signCmdButtonElem.hidden = true;
    verifyCmdButtonElem.hidden = false;
}
function xpsigntoolext_showSignUpdateRdfForm()
{
    var signCmdButtonElem = document.getElementById('xpsigntoolext.cmd.sign');
    var verifyCmdButtonElem = document.getElementById('xpsigntoolext.cmd.verify');

    signCmdButtonElem.hidden = true;
    verifyCmdButtonElem.hidden = true;

    var closeCmdButtonElem = document.getElementById('xpsigntoolext.cmd.close');
    var cancelCmdButtonElem = document.getElementById('xpsigntoolext.cmd.cancel');
    closeCmdButtonElem.hidden = false;
    cancelCmdButtonElem.hidden = true;
}

function xpsigntoolext_loginToInternalToken(force)
{
    xpsigntoolext_loginToCertToken(null, force);
}

function xpsigntoolext_loginToCertToken(aCert, force)
{
    var tokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
    			.getService(Components.interfaces.nsIPK11TokenDB);

    var /* nsIPK11Token */ token = null;
    if (aCert) {
    	var keyTokenName = "" + aCert.tokenName;
    	token = tokenDB.findTokenByName(keyTokenName);
    }
    else {
	token = tokenDB.getInternalKeyToken();
    }
    if (token == null) {
        return;
    }
    var forceLogin = ((force == null) ? false : force);
    token.login(forceLogin);
}


function xpsigntoolext_cmdVerify()
{
    XPSignToolForm.logTrace("xpsigntoolext_cmdVerify():..................Start.");

    xpsigntoolext_loginToInternalToken();

    var isPassed = false;
    try {
    	isPassed = xpsigntoolext_verifySignedArchiveFile();
    } catch (ex) {
    	XPSignToolForm.logError("xpsigntoolext_cmdVerify(): failed to verify signed archive file - ex : " + ex + "");
	isPassed = false;
    }
    if (isPassed) {
    	XPSignToolForm.logTrace("xpsigntoolext_cmdVerify(): Successfully verified the signed archive.");
    	alert("Successfully verified the signed archive!!");
    }
    else {
    	XPSignToolForm.logError("xpsigntoolext_cmdVerify(): ERROR: FAILED TO VERIFY SIGNED ARCHIVE FILE.");
    	alert("ERROR: FAILED TO VERIFY SIGNED ARCHIVE FILE.");
    }

    var closeCmdButtonElem = document.getElementById('xpsigntoolext.cmd.close');
    var cancelCmdButtonElem = document.getElementById('xpsigntoolext.cmd.cancel');

    closeCmdButtonElem.hidden = false;
    cancelCmdButtonElem.hidden = true;
    XPSignToolForm.logTrace("xpsigntoolext_cmdVerify():..................End.");
}

function xpsigntoolext_cmdSign()
{
    XPSignToolForm.logTrace("xpsigntoolext_cmdSign():..................Start.");

    xpsigntoolext_loginToInternalToken();

    var signResult = false;
    try {
    	signResult = xpsigntoolext_signArchiveFile();
    } catch (ex) {
    	XPSignToolForm.logError("xpsigntoolext_cmdSign(): failed to create signed archive file - ex : " + ex + "");
    	alert("ERROR: Failed to created the signed archive - ex: " + ex + "");
	return;
    }
    if (!signResult) {
    	XPSignToolForm.logError("xpsigntoolext_cmdSign(): failed to create signed archive file.");
    	alert("xpsigntoolext_cmdSign(): failed to create signed archive file.");
	return;
    }

    alert("Successfully created the signed archive.");

    var closeCmdButtonElem = document.getElementById('xpsigntoolext.cmd.close');
    var cancelCmdButtonElem = document.getElementById('xpsigntoolext.cmd.cancel');
    closeCmdButtonElem.hidden = false;
    cancelCmdButtonElem.hidden = true;

    XPSignToolForm.logTrace("xpsigntoolext_cmdSign():..................End.");
}

function xpsigntoolext_cmdClose()
{
    XPSignToolForm.logTrace("xpsigntoolext_cmdClose():..................Start.");
    window.close();
}

function xpsigntoolext_cmdCancel()
{
    XPSignToolForm.logTrace("xpsigntoolext_cmdCancel():..................Start.");
    window.close();
}

