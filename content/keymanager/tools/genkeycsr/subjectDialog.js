/* @(#) $Id: subjectDialog.js,v 1.3 2012/10/03 14:20:37 subrata Exp $ */

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


var SubjectDialog = {

    mX509SubjectElem : null,

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

    initWithDialogParams : function () 
    {
    	this.logTrace("SubjectDialog.initWithDialogParams():................Start.");

	if (window.arguments == undefined) {
    	    this.logTrace("SubjectDialog.initWithDialogParams():................End(0).");
	    return;
	}
        if (!window.arguments || (window.arguments.length <= 0) || !window.arguments[0]) {
    	    this.logTrace("SubjectDialog.initWithDialogParams():................End(1).");
	    return;
	}

        var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);

        var paramSubjectDN = null;
	if (dialogParams) {
	    paramSubjectDN = dialogParams.GetString(0);
	}
	if (paramSubjectDN) {
	    this.mX509SubjectElem.subject = paramSubjectDN;
	    this.handleSubjectChange(this.mX509SubjectElem);
	}

    	this.logTrace("SubjectDialog.initWithDialogParams():................End.");
    },

    onLoad : function ()
    {
    	this.logTrace("SubjectDialog.onLoad():..................Start.");

        this.mX509SubjectElem = document.getElementById("keymgr.genkeycsr.format.subject");
	this.mX509SubjectElem.refresh();

	this.initWithDialogParams();

    	this.logTrace("SubjectDialog.onLoad():..................End.");
    },

    handleSubjectChange : function (aX509SubjectElem, ev)
    {
    	this.logDebug("handleSubjectChange(): subjectDN: " + this.mX509SubjectElem.subjectDN);
    },

    acceptSubjectDN : function ()
    {
    	this.logTrace("SubjectDialog.acceptSubjectDN():..................Start.");

	var subjectDN = this.mX509SubjectElem.subjectDN;
    	this.logDebug("acceptSubjectDN(): subjectDN: " + subjectDN);

        var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);

	var retParamCnt = 0;
        dialogParams.SetString(0, subjectDN); retParamCnt++;
        dialogParams.SetInt(0, retParamCnt);

        window.close(0);

    	this.logTrace("SubjectDialog.acceptSubjectDN():..................End.");
    },

    cancelSubjectDN : function ()
    {
    	this.logTrace("SubjectDialog.cancelSubjectDN():..................Start.");

        var dialogParams = window.arguments[0].QueryInterface(nsIDialogParamBlock);
        dialogParams.SetInt(0, 0);

        window.close(0);

    	this.logTrace("SubjectDialog.cancelSubjectDN():..................End.");
    },

    lastMethod : function () 
    {
    }

}


