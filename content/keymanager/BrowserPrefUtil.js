/* @(#) $Id: BrowserPrefUtil.js,v 1.10 2011/02/04 18:54:51 subrata Exp $ */

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



// const nsISupportsString = Components.interfaces.nsISupportsString;
// var rootPrefBranch = null;
// var prefService = null;

function getRootPrefBranch()
{
    // Get the root branch
    var rootPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefBranch);
    return rootPrefBranch;
}

function /* nsIPrefService */ getPrefService()
{
    var prefService = Components.classes["@mozilla.org/preferences-service;1"].
                        getService(Components.interfaces.nsIPrefService);
    return prefService;
}

function getPrefBranch(prefBranchName)
{

    // Get the "extensions.myext." branch
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                        getService(Components.interfaces.nsIPrefService);
    if (prefs == null) {
    	return null;
    }

    var prefBranch = null;
    prefBranch = prefs.getBranch(prefBranchName);

    return prefBranch;
}

function splitPrefNamePath(prefNamePath)
{
    var prefNamePathItemList = prefNamePath.split(".");

    var prefName= prefNamePathItemList[prefNamePathItemList.length -1];

    var prefBranch = "";
    for (var i = 0; i < (prefNamePathItemList.length -1); i++) {
    	prefBranch += prefNamePathItemList[i];
    	prefBranch += ".";
    }
    // alert("prefBranchName: " + prefBranch + " " + " prefName: " + prefName);

    var prefScopedName = new Array(2);
    prefScopedName[0] = prefBranch;
    prefScopedName[1] = prefName;

   
    return prefScopedName;
}

function getPrefBoolValue(prefName)
{
    var boolVal = getPrefValue(prefName, "boolean");
    if (boolVal == null) {
    	return false;
    }
    return boolVal;
}

function getPrefStringValue(prefName)
{
    return getPrefValue(prefName, "String");
}

function getPrefIntValue(prefName)
{
    return getPrefValue(prefName, "int");
}


function getPrefValue(prefName, valType)
{
    // alert("getPrefValue(" + prefName + "):...............Start.");

    var prefItemList = splitPrefNamePath(prefName);

    var prefBranchNodeNames = prefItemList[0];
    var prefLeafNodeName = prefItemList[1];

    var prefValue = getPrefValueByBranch(prefItemList[0], prefItemList[1], valType);

    // alert("getPrefValue(" + prefName + "):...............End.");
    return prefValue;
}

function getPrefValueByBranch(prefBranchName, prefName, valType)
{
    /*
    alert("prefBranchName: " + prefBranchName + " " + 
    		" prefName: " + prefName + " " + 
		" valType: " + valType);
    */
    var prefBranchNode = getPrefBranch(prefBranchName);
    if (prefBranchNode == null) {
    	return null;
    }

    var prefValue = null;
    switch(valType) {
	case "String" :
	    try {
    	    prefValue = prefBranchNode.getCharPref(prefName);
	    } catch (ex) {}
	    break;
	case "boolean" :
	    try {
    	    prefValue = prefBranchNode.getBoolPref(prefName);
	    } catch (ex) {prefValue = false;}
	    break;
	case "int" :
	    try {
    	    prefValue = prefBranchNode.getIntPref(prefName);
	    } catch (ex) {prefValue = 0;}
	    break;
    }

    // alert("getPrefValue(" + prefName + "): " + prefValue);

    return prefValue;
}

function togglePrefBoolValue(prefName)
{
    var prefValue = getPrefBoolValue(prefName);
    if (prefValue == null) {
	// Absent => false
    	prefValue = false;
    }
    prefValue = !prefValue;
    setPrefValue(prefName, "boolean", prefValue);
}

function enablePrefBoolValue(prefName)
{
    // alert("enablePrefBoolValue(" + prefName + "):...............Start.");

    setPrefValue(prefName, "boolean", true);
}

function setPrefBoolValue(prefName, prefValue)
{
    setPrefValue(prefName, "boolean", prefValue);
}

function setPrefStringValue(prefName, prefValue)
{
    setPrefValue(prefName, "String", prefValue);
}

function setPrefValue(prefName, valType, prefValue)
{

    // alert("setPrefValue(" + prefName + "):...............Start.");
    var prefItemList = splitPrefNamePath(prefName);

    var prefBranchNodeNames = prefItemList[0];
    var prefLeafNodeName = prefItemList[1];

    setPrefValueByBranch(prefItemList[0], prefItemList[1], valType, prefValue);

    // alert("setPrefValue(" + prefName + "):...............End.");
}

function setPrefValueByBranch(prefBranchName, prefName, valType, prefValue)
{
    // alert("setPrefValue(" + prefName + "):...............Start.");

    var tmpPrefBranchNode = "";
    var tmpPrefName = prefBranchName + "." + prefName;

    var prefBranchNode = getPrefBranch(prefBranchName);
    // var prefBranchNode = getPrefBranch(tmpPrefBranchNode);
    if (prefBranchNode == null) {
	alert("setPrefValueByBranch(): couldn't find prefBranchName: " + prefBranchName);
    	return;
    }

    // alert("setPrefValue(" + prefName + "):...............1.");

    switch (valType) {
	case "String" :
	    try {
    	    prefBranchNode.setCharPref(prefName, prefValue);
    	    // prefBranchNode.setCharPref(tmpPrefName, prefValue);
	    } catch (ex) {alert("prefBranchNode.setCharPref() failed.");}
	    break;
	case "boolean" :
	    try {
    	    prefBranchNode.setBoolPref(prefName, prefValue);
    	    // prefBranchNode.setBoolPref(tmpPrefName, prefValue);
	    } catch (ex) {alert("prefBranchNode.setCharPref() failed.");}
	    break;
    	default:
	    alert("Unknown preference value type: " + valType);
	    break;
    }

    // alert("setPrefValue(" + prefName + "):...............End.");
}


// Source: http://kb.mozillazine.org/Dev_:_Using_preferences#Complex_types
function setPrefComplexValue(/* String */ prefBranchName, /* String */ prefName, /* Object */ prefValue)
{
    var prefBranchNode = getPrefBranch(prefBranchName);
    if (prefBranchNode == null) {
    	return;
    }

    return;
}

