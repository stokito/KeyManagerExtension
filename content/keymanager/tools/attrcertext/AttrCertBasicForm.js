/* @(#) $Id: AttrCertBasicForm.js,v 1.18 2012/10/03 23:09:44 subrata Exp $ */

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




var gAttrCertFormGridElem;
var gAttrCertCertExtnUtilElem;

var gAttrCertHolderCertDeckElem;
var gAttrCertHolderCertPickerMenuElem;
var gAttrCertHolderCertItemHboxElem;
var gAttrCertHolderCertItemElem;
var gAttrCertHolderCertISNElem;
var gAttrCertHolderCertSubjNameElem;

var gAttrCertIssuerCertDeckElem;
var gAttrCertIssuerCertPickerMenuElem;
var gAttrCertIssuerCertItemHboxElem;
var gAttrCertIssuerCertItemElem;
var gAttrCertIssuerEntityNameElem;

var gAttrCertAliasAutoGenElem;
var gAttrCertAliasElem;
var gAttrCertSerialNumGroupHboxElem;
var gAttrCertSerialNumValueElem;
var gAttrCertSigAlgMenuListElem;
var gAttrCertValidityElem;

var gAttrCertAttributeInfoRowElem;

var AttrCertBasicForm = {
    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > AttrCertBasicForm.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    dump : function(msg)
    {
        AttrCertBasicForm.log(1, msg);
    },
    logError : function(msg)
    {
        AttrCertBasicForm.log(2, msg);
    },
    logTrace : function(msg)
    {
        AttrCertBasicForm.log(4, msg);
    },
    logDebug : function(msg)
    {
        AttrCertBasicForm.log(8, msg);
    },
    lastMethod : function () 
    {
    }
};

function AttrCertBasicForm_doOnloadInitParam(aSelectedSignerCert)
{

    /*
    gAttrCertHolderCertPickerMenuElem = document.getElementById("keymgr.attrcert.basic.holder.nickName.menulist");
    gAttrCertHolderCertItemElem	= document.getElementById("attrcertext.form.basic.holder.cert.item");

    gAttrCertIssuerCertPickerMenuElem = document.getElementById("keymgr.attrcert.form.basic.signer.nickName.menulist");
    gAttrCertIssuerCertItemElem = document.getElementById("attrcertext.form.basic.signer.cert.item");

    gAttrCertAliasAutoGenElem = document.getElementById("attrcertext.form.basic.certdetail.alias.autogen");
    gAttrCertAliasElem = document.getElementById("attrcertext.form.basic.certdetail.alias");

    gAttrCertSerialNumGroupHboxElem = document.getElementById("attrcertext.form.basic.certdetail.serialnumber.group.hbox");
    gAttrCertSerialNumValueElem = document.getElementById("attrcertext.form.basic.certdetail.serialnumber.value");
    */

    AttrCertBasicForm_initFormXULElems();

    if (aSelectedSignerCert) {
	gAttrCertIssuerCertPickerMenuElem.value = aSelectedSignerCert.nickname;
    	AttrCertBasicForm_SignerCertPickerMenuChanged(
		gAttrCertIssuerCertPickerMenuElem
		);
	// gAttrCertIssuerCertPickerMenuElem.disabled = true;
    }
}

function AttrCertBasicForm_initFormXULElems()
{

    AttrCertBasicForm.logTrace("AttrCertBasicForm_initFormXULElems():................Start.");

    gAttrCertFormGridElem	= document.getElementById("attrcertext.form.basic.grid");


    gAttrCertHolderCertDeckElem		= document.getElementById("attrcertext.form.basic.holder.cert.deck");
    gAttrCertHolderCertPickerMenuElem	= document.getElementById("keymgr.attrcert.form.basic.holder.nickName.menulist");
    gAttrCertHolderCertItemHboxElem	= document.getElementById("attrcertext.form.basic.holder.cert.item.hbox");
    gAttrCertHolderCertItemElem		= document.getElementById("attrcertext.form.basic.holder.cert.item");
    gAttrCertHolderCertISNElem		= document.getElementById("attrcertext.form.basic.holder.issuer.serial");
    gAttrCertHolderCertSubjNameElem	= document.getElementById("attrcertext.form.basic.holder.entity.name");

    gAttrCertIssuerCertDeckElem		= document.getElementById("attrcertext.form.basic.signer.cert.deck");
    gAttrCertIssuerCertPickerMenuElem	= document.getElementById("keymgr.attrcert.form.basic.signer.nickName.menulist");
    gAttrCertIssuerCertItemHboxElem	= document.getElementById("attrcertext.form.basic.signer.cert.item.hbox");
    gAttrCertIssuerCertItemElem		= document.getElementById("attrcertext.form.basic.signer.cert.item");
    gAttrCertIssuerEntityNameElem	= document.getElementById("attrcertext.form.basic.signer.entity.name"); 

    gAttrCertAliasAutoGenElem 		= document.getElementById("attrcertext.form.basic.certdetail.alias.autogen");
    gAttrCertAliasElem			= document.getElementById("attrcertext.form.basic.certdetail.alias");

    gAttrCertSerialNumGroupHboxElem	= document.getElementById("attrcertext.form.basic.certdetail.serialnumber.group.hbox");
    gAttrCertSerialNumValueElem		= document.getElementById("attrcertext.form.basic.certdetail.serialnumber.value");

    gAttrCertSigAlgMenuListElem		= document.getElementById('attrcertext.form.basic.certdetail.sigAlgName.menulist');

    gAttrCertAttributeInfoRowElem	= document.getElementById("attrcertext.form.basic.attribute.info.row"); 
    gAttrCertValidityElem		= document.getElementById("attrcertext.form.basic.certdetail.validity");

    gAttrCertCertExtnUtilElem = document.getElementById("attrcertext.form.basic.certextn.util");

    AttrCertBasicForm_removeCACertsFromIssuerMenu(gAttrCertIssuerCertPickerMenuElem);

    AttrCertBasicForm_deriveCertAlias();

    AttrCertBasicForm_handleSigAlgorithmChange(gAttrCertSigAlgMenuListElem);

    AttrCertBasicForm.logTrace("AttrCertBasicForm_initFormXULElems():................End.");
}

function AttrCertBasicForm_handleAttrCertSourceChange(aLoadACFile)
{
    // AttrCertBasicForm.logTrace("AttrCertBasicForm_handleAttrCertSourceChange(" + aLoadACFile + "):................Start.");

    // keyConfFilePickerElem.setAttribute("disabled", ("" + !enableKeySource));

    
    gAttrCertHolderCertISNElem.hidden = true;
    if (aLoadACFile) {
    	gAttrCertHolderCertDeckElem.selectedPanel = gAttrCertHolderCertItemHboxElem;
    	gAttrCertIssuerCertDeckElem.selectedPanel = gAttrCertIssuerCertItemHboxElem;
    }
    else {
    	gAttrCertHolderCertDeckElem.selectedPanel = gAttrCertHolderCertPickerMenuElem;
    	gAttrCertIssuerCertDeckElem.selectedPanel = gAttrCertIssuerCertPickerMenuElem;
    }

    gAttrCertAliasAutoGenElem.hidden = aLoadACFile;
    gAttrCertAttributeInfoRowElem.hidden = aLoadACFile;

    if (!aLoadACFile) { // create/copy AC file

        // Make sure that intial issuer cert does not have CA
	// set in the basicconstraints extension.
	AttrCertBasicForm_SignerCertPickerMenuChanged(
		gAttrCertIssuerCertPickerMenuElem
		);
    }

    // AttrCertBasicForm.logTrace("AttrCertBasicForm_handleAttrCertSourceChange(" + aLoadACFile + "):................End.");
}

function AttrCertBasicForm_setReadonly(readonly)
{
    // AttrCertBasicForm.logTrace("AttrCertBasicForm_setReadonly(readonly: " + readonly + ").....Start.");

    gAttrCertExtensionsElem.setReadonly(gAttrCertFormGridElem, readonly);
    gAttrCertSerialNumGroupHboxElem.hidden = readonly;

    gAttrCertValidityElem.readonly = readonly;

    // AttrCertBasicForm.logTrace("AttrCertBasicForm_setReadonly(readonly: " + readonly + ").....End.");
}


/*
function AttrCertBasicForm_CertPickerMenuChanged(menuListElem, selectedItemElem, certItemPrefix)
{
    AttrCertBasicForm.logTrace("AttrCertBasicForm_CertPickerMenuChanged():................Start.");

    AttrCertBasicForm.logTrace("AttrCertBasicForm_CertPickerMenuChanged():................End.");
}
*/


function AttrCertBasicForm_HolderCertPickerMenuChanged(aMenuListElem, ev)
{
    // var origTarget = ev.originalTraget;

    if (gAttrCertAliasAutoGenElem.checked) {
    	gAttrCertAliasElem.value = "";
    }
    AttrCertBasicForm_deriveCertAlias();
}

function AttrCertBasicForm_SignerCertPickerMenuChanged(aSignerCertPickerMenuElem, ev)
{
    // AttrCertBasicForm.logTrace("AttrCertBasicForm_SignerCertPickerMenuChanged():................Start.");

    if (gAttrCertAliasAutoGenElem.checked) {
    	gAttrCertAliasElem.value = "";
    }

    var /* alrIKeyManager */ xKeyManager;
    xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
	    		.getService(Components.interfaces.alrIKeyManager);
    if (!xKeyManager) {
    	AttrCertBasicForm_deriveCertAlias();
    	return;
    }

    // If the support for alrIKeyManager is available, check for CA in BasicConstraints.
    var selectedCert = aSignerCertPickerMenuElem.selectedCert;
    if (!selectedCert) {
    	return;
    }
    // AttrCertBasicForm.logTrace("AttrCertBasicForm_SignerCertPickerMenuChanged(): selectedCert.nickname: " + selectedCert.nickname + "");

    var /* nsIPersistentProperties */ signerCertProps;
    signerCertProps = Components.classes["@mozilla.org/persistent-properties;1"].
                    		createInstance(Components.interfaces.nsIPersistentProperties);
    xKeyManager.exportX509v3CertExtnToProperties(selectedCert, "basicConstraints", signerCertProps);
    // AttrCertBasicForm.logTrace("AttrCertBasicForm_SignerCertPickerMenuChanged():................20.");

    var bcIsCA = null;
    try {
    	bcIsCA = signerCertProps.getStringProperty("basicConstraints-cA-radio");
	// AttrCertBasicForm.logTrace("AttrCertBasicForm_SignerCertPickerMenuChanged(): bcIsCA: " + bcIsCA + "");
    } catch (ex) {}
    
    if (bcIsCA && bcIsCA == "true") {
	if (ev) {
    	    alert("You canot use a signer cert with CA-enabled basic constraint - please select another cert.");
    	    AttrCertBasicForm.logError("You canot use a signer cert with CA-enabled basic constraint - please select another cert.");
	}
	aSignerCertPickerMenuElem.nickNameMenu.removeItemAt(aSignerCertPickerMenuElem.selectedIndex);
	aSignerCertPickerMenuElem.selectedIndex = 0;
	AttrCertBasicForm_SignerCertPickerMenuChanged(aSignerCertPickerMenuElem);
	return;
    }
    // AttrCertBasicForm.logTrace("AttrCertBasicForm_SignerCertPickerMenuChanged():................30.");
    AttrCertBasicForm_deriveCertAlias();

    // AttrCertBasicForm.logTrace("AttrCertBasicForm_SignerCertPickerMenuChanged():................End.");
}

function AttrCertBasicForm_removeCACertsFromIssuerMenu(menuListElem)
{
}


function AttrCertBasicForm_deriveCertAlias()
{
    // AttrCertBasicForm.logTrace("AttrCertBasicForm_deriveCertAlias():................Start.");

    if (gAttrCertAliasElem.value != "") {
    	return;
    }

    var holderCert = gAttrCertHolderCertPickerMenuElem.selectedCert;
    var issuerCert = gAttrCertIssuerCertPickerMenuElem.selectedCert;
    if (!holderCert && !issuerCert) {
    	AttrCertBasicForm.logError("AttrCertBasicForm_deriveCertAlias(): NULL holder and issuer certs.");
    	return;
    }

    var holderNickName = null;
    if (holderCert) {
    	holderNickName = gAttrCertHolderCertPickerMenuElem.adaptNickName();
	if (!holderNickName) {
	    holderNickName = "holderX";
	}
    }

    var issuerNickName = null;
    if (issuerCert) {
    	issuerNickName = gAttrCertIssuerCertPickerMenuElem.adaptNickName();
	if (!issuerNickName) {
	    issuerNickName = "issuerX";
	}
    }
    if (!holderNickName && !issuerNickName) {
    	AttrCertBasicForm.logError("AttrCertBasicForm_deriveCertAlias(): NULL holder and issuer cert nick-names.");
    	return;
    }

    var newAlias = "";
    newAlias += (holderNickName?holderNickName:"Holder");
    newAlias += "_";
    newAlias += (issuerNickName?issuerNickName:"Issuer");
    // AttrCertBasicForm.logDebug("AttrCertBasicForm_deriveCertAlias(): newAlias: " + newAlias + "");

    gAttrCertAliasElem.value = newAlias;

    // AttrCertBasicForm.logTrace("AttrCertBasicForm_deriveCertAlias():................End.");
}


function AttrCertBasicForm_handleAliasChange(aAliasElem, ev)
{
}

function AttrCertBasicForm_handleSigAlgorithmChange(sigAlgMenuListElem, selectedItem)
{
}


function handleSerialnumberChange(modSerialNumberElem)
{
}

function handlex509VersionChange(x509VersionGroupElem, selectedX509VersionElem)
{
}

function handleValidityChange(validityGroupElem, selectedValidityElem)
{
}

function AttrCertBasicForm_getAlias()
{
    AttrCertBasicForm_deriveCertAlias();

    return gAttrCertAliasElem.value;
}

function AttrCertBasicForm_getSelectedHolderCert()
{
    var selectedCert = gAttrCertHolderCertPickerMenuElem.getSelectedCert();
    return selectedCert;
}

function AttrCertBasicForm_getSelectedHolderCertNickName()
{
    var selectedCert = gAttrCertHolderCertPickerMenuElem.getSelectedCert();
    if (selectedCert) {
    	return selectedCert.nickname;
    }
    return gAttrCertHolderCertPickerMenuElem.value;
}

function AttrCertBasicForm_getSelectedIssuerCert()
{
    var selectedCert = gAttrCertIssuerCertPickerMenuElem.getSelectedCert();
    return selectedCert;
}


function AttrCertBasicForm_getSelectedIssuerCertNickName()
{
    var selectedCert = gAttrCertIssuerCertPickerMenuElem.getSelectedCert();
    if (selectedCert) {
    	return selectedCert.nickname;
    }
    return gAttrCertIssuerCertPickerMenuElem.value;
}

function AttrCertBasicForm_getACHolderCert()
{
    var acHolderCert = gAttrCertHolderCertItemElem.cert;
    return acHolderCert;
}

function AttrCertBasicForm_getACIssuerCert()
{
    var acIssuerCert = gAttrCertIssuerCertItemElem.cert;
    return acIssuerCert;
}

function AttrCertBasicForm_reset()
{
    // gAttrCertIssuerCertPickerMenuElem.cert = null;
    // gAttrCertHolderCertPickerMenuElem.cert = null;

    gAttrCertIssuerCertItemElem.cert = null;
    gAttrCertHolderCertItemElem.cert = null;

    gAttrCertAliasElem.value = "";
    gAttrCertSigAlgMenuListElem.value = "SHA1";
    gAttrCertValidityElem.reset();

}


function AttrCertBasicForm_toCertProps(/* nsIPersistentProperties */ aCertProps)
{
    AttrCertBasicForm.logTrace("generateCSRCertAttrForm.js: getCertFormProperties(): ......Start.");

    gAttrCertCertExtnUtilElem.certExtnToProps(gAttrCertFormGridElem, aCertProps);
    gAttrCertValidityElem.toCertProps(aCertProps);

    // gAttrCertCertExtnUtilElem.dumpProperties(aCertProps, "Basic Form");

    return;
}

function AttrCertBasicForm_updateCertProps(/* nsIPersistentProperties */ aCertProps)
{
    AttrCertBasicForm.logTrace("AttrCertBasicForm_updateCertProps(): ..............Start.");

    // gAttrCertCertExtnUtilElem.dumpProperties(aCertProps, "AttrCertBasicForm_updateCertProps");

    gAttrCertCertExtnUtilElem.updateCertExtnProps(gAttrCertFormGridElem, aCertProps);
    gAttrCertValidityElem.updateCertProps(aCertProps);

    AttrCertBasicForm.logTrace("AttrCertBasicForm_updateCertProps(): ..............End.");
    return;
}


function AttrCertBasicForm_updateWithAttributeCert(/* Components.interfaces.alrIAttributeCert */ attributeCert)
{
    AttrCertBasicForm.logTrace("AttrCertBasicForm_updateWithAttributeCert(): ....................Start.");

    AttrCertBasicForm.logDebug("AttrCertBasicForm_updateWithAttributeCert(): attributeCert: " + attributeCert + "");

    try {
    	gAttrCertHolderCertItemElem.cert = attributeCert.holder;
    } catch (ex) {
    	AttrCertBasicForm.logError("AttrCertBasicForm_updateWithAttributeCert(): gAttrCertHolderCertItemElem.cert = attributeCert.holder failed - " + ex + "");
	gAttrCertHolderCertItemElem.cert = null;
    }
    AttrCertBasicForm.logTrace("AttrCertBasicForm_updateWithAttributeCert(): ....................10.");

    AttrCertBasicForm.logTrace("AttrCertBasicForm_updateWithAttributeCert(): ....................20.");

    try {
    	gAttrCertIssuerCertItemElem.cert = attributeCert.issuer;
    } catch (ex) {
    	AttrCertBasicForm.logError("AttrCertBasicForm_updateWithAttributeCert(): gAttrCertIssuerCertItemElem.cert = attributeCert.issuer failed - " + ex + "");
	gAttrCertIssuerCertItemElem.cert = null;
    }

    AttrCertBasicForm.logTrace("AttrCertBasicForm_updateWithAttributeCert(): ....................30.");

    var /* nsIPersistentProperties */ acBasicDataProps = null;
    acBasicDataProps = Components.classes["@mozilla.org/persistent-properties;1"]
    			.createInstance(Components.interfaces.nsIPersistentProperties);

    /* XPIDL: void alrIAttributeCert.exportBasicDataToProperties(in nsIPersistentProperties aCertProps); */
    try {
    	attributeCert.exportBasicDataToProperties(acBasicDataProps);
    } catch (ex) {
    	AttrCertBasicForm.logError("AttrCertAttributesForm_updateWithAttributeCert(): attributeCert.exportAttributesToProperties() failed - ex: " + ex + "");
	return;
    }
    AttrCertBasicForm_updateCertProps(acBasicDataProps);

    gAttrCertHolderCertISNElem.hidden = true; // This is a hack to reduce the height of the deck.
    if (!gAttrCertHolderCertItemElem.cert) {
	var holderSubjName = null;
	try {
	    acBasicDataProps.getStringProperty("holderCert.subjectName");
	} catch(ex) { }
	if (holderSubjName) {
    	    gAttrCertHolderCertDeckElem.selectedPanel = gAttrCertHolderCertSubjNameElem;
	}
	else {
	    gAttrCertHolderCertISNElem.hidden = false;
    	    gAttrCertHolderCertDeckElem.selectedPanel = gAttrCertHolderCertISNElem;
	}
    }
    if (!gAttrCertIssuerCertItemElem.cert) {
    	gAttrCertIssuerCertDeckElem.selectedPanel = gAttrCertIssuerEntityNameElem;
    }

    AttrCertBasicForm.logTrace("AttrCertBasicForm_updateWithAttributeCert():................End.");
}

