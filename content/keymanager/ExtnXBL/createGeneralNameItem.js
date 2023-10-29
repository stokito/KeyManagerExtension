/* @(#) $Id: createGeneralNameItem.js,v 1.3 2009/03/25 13:41:42 subrata Exp $ */

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



// const nsDialogParamBlock = "@mozilla.org/embedcomp/dialogparam;1";

function initGeneralNameItem()
{
    // dump("initGeneralNameItem()............................Start.\n");

    // dump("initGeneralNameItem()............................End.\n");
}


function setGeneralNameItem()
{
    var generalNameItemElem = document.getElementById("keymgr.create.generalName.item");

    var typedGeneralNameItemStr = generalNameItemElem.typedvalue;
    var orderedGeneralNameItemStr = generalNameItemElem.orderedvalue;
    // dump("setGeneralNameItem(): typedGeneralNameItemStr: " + typedGeneralNameItemStr + "\n");
    // dump("setGeneralNameItem(): orderedGeneralNameItemStr: " + orderedGeneralNameItemStr + "\n");

    var params = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    params.SetInt(0, 1);

    var argc = 0;
    params.SetString(0, typedGeneralNameItemStr); argc++;
    params.SetString(1, orderedGeneralNameItemStr); argc++;
    params.SetString(2, generalNameItemElem.type); argc++;
    params.SetString(3, generalNameItemElem.typenum); argc++;
    params.SetString(4, generalNameItemElem.value); argc++;
    if ((generalNameItemElem.type == "otherName")
    	|| (generalNameItemElem.type == "x400")) {
    	params.SetString(5, generalNameItemElem.binary); argc++;
    }
    if (generalNameItemElem.type == "otherName") {
    	params.SetString(6, generalNameItemElem.oid); argc++;
    }
    params.SetInt(0, argc);
    window.close();

    return true;
}

function cancelGeneralNameItem()
{
    var params = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    params.SetInt(0, 0);

    window.close();

    return true;
}

