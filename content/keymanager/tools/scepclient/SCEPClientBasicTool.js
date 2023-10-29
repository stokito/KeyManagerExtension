/* @(#) $Id: SCEPClientBasicTool.js,v 1.7 2012/10/07 17:20:54 subrata Exp $ */

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

var SCEPClientBasicTool = {

    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > this.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    dump : function(msg)
    {
        this.log(1, msg);
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
    initOnLoad : function ()
    {
    	this.mScepClientToolWin		= document.getElementById('keymgr.scepclient.basic.win');
    	this.mEnrollCertButtonElem	= document.getElementById('keymgr.scepclient.basic.cmd.enroll');
    	this.mCloseButtonElem		= document.getElementById('keymgr.scepclient.basic.cmd.close');

	try {
            SCEPClientBasicForm.initOnLoad();
	} catch (ex) {
	    SCEPClientBasicTool.logError("SCEPClientBasicTool.initOnLoad(): SCEPClientBasicForm.initOnLoad() failed - ex: " + ex + "\n");
	    return;
	}
	this.valdiateSCEPParams();
    },

    valdiateSCEPParams : function ()
    {
        var validParams = SCEPClientBasicForm.valdiateSCEPParams();
	if (validParams) {
	    this.mEnrollCertButtonElem.disabled = false;
	}
	else {
	    this.mEnrollCertButtonElem.disabled = true;
	}
    },

    handleSCEPParamChange : function (aScepParmElem, ev)
    {
	SCEPClientBasicTool.logTrace("SCEPClientBasicTool.handleSCEPParamChange(): .......................Start.\n");

    	if (ev) {
	    ev.stopPropagation();
	}

	this.valdiateSCEPParams();

	SCEPClientBasicTool.logTrace("SCEPClientBasicTool.handleSCEPParamChange(): .......................End.\n");
    },

    clearTimeOut : function ()
    {
    	if (this.mToolButtonsReenableTimeOut) {
	    window.clearTimeout(this.mToolButtonsReenableTimeOut);
	}
	this.mToolButtonsReenableTimeOut = null;
    },

    enableToolButtons : function ()
    {
	SCEPClientBasicTool.logTrace("SCEPClientBasicTool.enableToolButtons(): .......................Start.\n");
	SCEPClientBasicTool.logDebug("SCEPClientBasicTool.enableToolButtons(): SCEPClientBasicForm.mWaitingForResponse: " + SCEPClientBasicForm.mWaitingForResponse + "\n");

	if (SCEPClientBasicForm.mWaitingForResponse) {
	    this.mToolButtonsReenableTimeOut = window.setTimeout(function() {
	    	SCEPClientBasicTool.enableToolButtons()
	    }, 2000);
	    SCEPClientBasicTool.logError("SCEPClientBasicTool.enableToolButtons(): .......................End(0).\n");
	    return;
	}
	this.mToolButtonsReenableTimeOut = null;


	var caSignedCert = SCEPClientBasicForm.getSignedUserX509Cert();
	SCEPClientBasicTool.logDebug("SCEPClientBasicTool.enableToolButtons(): caSignedCert : " + caSignedCert + "\n");

	if (!caSignedCert) {
	    alert("Failed to enroll certificate using SCEP.");
	    SCEPClientBasicTool.logError("Failed to enroll certificate using SCEP.\n");
	    this.mEnrollCertButtonElem.disabled = false;;
	    this.mCloseButtonElem.hidden = true;
	}
	else {
	    this.mCloseButtonElem.hidden = false;
	}

	SCEPClientBasicTool.logTrace("SCEPClientBasicTool.enableToolButtons(): .......................10.\n");

        var pkiParams = null;
	var dialogParams = null;
	if (window.arguments && window.arguments[0]) {
            dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
	    try {
	        if (dialogParams) {
	    	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	        }
	    } catch (ex) {
    	        this.logError("SCEPClientBasicForm.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	    }
	}

	if (pkiParams) {
	    pkiParams.setISupportAtIndex(1, caSignedCert);
	    if (caSignedCert) {
    	    	dialogParams.SetInt(0, 1);
	    }
	    else {
    	    	dialogParams.SetInt(0, 0);
	    }
	}

	SCEPClientBasicTool.logTrace("SCEPClientBasicTool.enableToolButtons(): .......................End.\n");
    },

    enrollUserCert : function ()
    {
        var caSignedCert = SCEPClientBasicForm.enrollUserCert();
	SCEPClientBasicTool.logDebug("SCEPClientBasicTool.enrollUserCert(): caSignedCert : " + caSignedCert + "\n");

	if (caSignedCert) {
	    this.mToolButtonsReenableTimeOut = window.setTimeout(function(){
	    	SCEPClientBasicTool.enableToolButtons();
	    }, 2000);
	}

	// this.mCloseButtonElem.hidden = true;
	// this.mEnrollCertButtonElem.hidden = true;;
	this.mEnrollCertButtonElem.disabled = true;;
    },

    help : function ()
    {
        window.close();
    },

    close : function ()
    {
	SCEPClientBasicTool.logTrace("SCEPClientBasicTool.close(): .......................Start.\n");

    	if (this.mToolButtonsReenableTimeOut) {
	    this.clearTimeOut();
	}

	var dialogParams = null;
	if (window.arguments && window.arguments[0]) {
            dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	    dialogParams.SetInt(0, 1);
	}
        window.close();

	SCEPClientBasicTool.logTrace("SCEPClientBasicTool.close(): .......................End.\n");
    },

    cancel : function ()
    {
	SCEPClientBasicTool.logTrace("SCEPClientBasicTool.cancel(): .......................Start.\n");

    	if (this.mToolButtonsReenableTimeOut) {
	    this.clearTimeOut();
	}

	var dialogParams = null;
	if (window.arguments && window.arguments[0]) {
            dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    	    dialogParams.SetInt(0, 0);
	}
        window.close();

	SCEPClientBasicTool.logTrace("SCEPClientBasicTool.cancel(): .......................End.\n");
    }
}
