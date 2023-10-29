/* @(#) $Id: AttrCertForm.js,v 1.21 2013/05/23 22:42:54 subrata Exp $ */

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


var gAttrCertSourceGroupElem;
var gAttrCertSourceNewElem;
var gAttrCertSourceFileElem;
var gAttrCertInFileRowElem;
var gAttrCertInFileFileHboxElem;
var gAttrCertFilePickerElem;
// var gAttrCertFileEditRowElem;
var gAttrCertFileEditElem;
var gAttrCertProfileRowElem;
var gAttrCertProfileElem;

var gAttrCertHolderCertPickerElem;
var gAttrCertIssuerCertPickerElem;

var gAttrCertOutFilePickerElem;
var gAttrCertOutFilePathRowElem;

var AttrCert = {
    mMaxLogLevel		: 9,
    log : function(level, msg)
    {
	if (level > AttrCert.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    dump : function(msg)
    {
        AttrCert.log(1, msg);
    },
    logError : function(msg)
    {
        AttrCert.log(2, msg);
    },
    logTrace : function(msg)
    {
        AttrCert.log(4, msg);
    },
    logDebug : function(msg)
    {
        AttrCert.log(8, msg);
    },
    lastMethod : function () 
    {
    }
};

function attrcert_initOnLoad()
{
    // AttrCert.logTrace("attrcert_initOnLoad():................Start.");

    var /* alrIAttributeCertFactory */ attrCertFactory = null;
    attrCertFactory = Components.classes["@avaya.com/pkm/attrcertfactory;1"].
	                    getService(Components.interfaces.alrIAttributeCertFactory);

    if (attrCertFactory == null) {
    	AttrCert.logError("attrcert_initOnLoad(): failed to get AttributeCertFactory.");
    	alert("Failed to initialize AttributeCertFactory - this tool will not function properly.");
    }

    try {
        AttrCertBasicForm_initFormXULElems();
        AttrCertExtensionsForm_initFormXULElems();
        AttrCertAttributesForm_initFormXULElems();
	attrcert_initCertSourceXULElems();
    } catch (ex) {
    	AttrCert.logError("attrcert_initOnLoad(): ex - " + ex + "");
    }

    attrcert_initParams();

    // AttrCert.logTrace("attrcert_initOnLoad():................End.");
}

function attrcert_initParams()
{
    // AttrCert.logTrace("attrcert_initParams():...........................Start.");

    if (!window.arguments || !window.arguments[0]) {
    	return;
    }

    var pkiParams = null;
    var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);
    try {
	pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
    } catch (ex) { }

    var paramCert = null;
    var certProfileType = null;
    var holderCert = null;
    var issuerCert = null;
    var outACFilePath = null;
    var outACFileFormat = null;

    var loadFilePath = null;
    var loadFileFormat = null;

    var loadFile = dialogParams.GetInt(0);
    if (loadFile) {
	gAttrCertSourceGroupElem.selectedItem = gAttrCertSourceFileElem;
    	loadFilePath = dialogParams.GetString(0);
	if (loadFilePath && (loadFilePath != "")) {
    	    loadFileFormat = dialogParams.GetString(1);
	}
    }
    else {
	gAttrCertSourceGroupElem.selectedItem = gAttrCertSourceNewElem;

    	certProfileType = dialogParams.GetString(0);

	if (pkiParams) {
	    paramCert = pkiParams.getISupportAtIndex(1);
	    if (paramCert) {
	        holderCert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	    }

	    paramCert = pkiParams.getISupportAtIndex(2);
	    if (paramCert) {
	        issuerCert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
	    }
	}

    	outACFilePath = dialogParams.GetString(1);
	if (outACFilePath && (outACFilePath != "")) {
    	    outACFileFormat = dialogParams.GetString(1);
	}
    }
    /*
    AttrCert.logDebug("AttrCertForm.js::attrcert_initParams(): " + "\n" + 
    			"\tloadFile: " + loadFile + " " + 
    			"loadFilePath: " + loadFilePath + " " + 
    			"loadFileFormat: " + loadFileFormat + "\n" + 
    			"\tcertProfileType: " + certProfileType + " " + 
    			"outACFilePath: " + outACFilePath + " " + 
    			"outACFileFormat: " + outACFileFormat + "\n" + 
    			"holderCert: " + holderCert + " " + 
    			"issuerCert: " + issuerCert + " " + 
			"\n");
    */

    attrcert_handleAttrCertSourceChange(gAttrCertSourceGroupElem);
    if (loadFile) {
	if (loadFilePath) {
	    gAttrCertFilePickerElem.filepath = loadFilePath;
	    if (loadFileFormat == "base64") {
	        gAttrCertFilePickerElem.ascii = true;
	    }
	    if (gAttrCertFilePickerElem.file) {
    	        attrcert_loadAttrCertFile(gAttrCertFilePickerElem);
	    }
	}
    }
    else {
	if (holderCert) {
	    gAttrCertHolderCertPickerElem.selectedCert = holderCert;
	    AttrCertBasicForm_HolderCertPickerMenuChanged(gAttrCertHolderCertPickerElem);
	}
	if (issuerCert) {
	    gAttrCertIssuerCertPickerElem.selectedCert = issuerCert;
	    AttrCertBasicForm_SignerCertPickerMenuChanged(gAttrCertIssuerCertPickerElem);
	}

	if (certProfileType) {
	    gAttrCertProfileElem.profile = certProfileType;
	    attrcert_ACProfileChanged(gAttrCertProfileElem);
	}

	gAttrCertOutFilePickerElem.filepath = "";
	if (outACFilePath) {
	    gAttrCertOutFilePickerElem.filepath = outACFilePath;
	    if (outACFileFormat == "base64") {
	        gAttrCertOutFilePickerElem.ascii = true;
	    }
	}
	else {
	    attrcert_handleAliasChange();
	}
    }

    // AttrCert.logTrace("attrcert_initParams():...........................End.");
}

function attrcert_initCertSourceXULElems()
{
    gAttrCertSourceGroupElem     = document.getElementById("attrcertext.form.basic.cert.source.group");
    gAttrCertSourceNewElem     	 = document.getElementById("attrcertext.form.basic.cert.source.new");
    gAttrCertSourceFileElem      = document.getElementById("attrcertext.form.basic.cert.source.file");
    
    // gAttrCertInFileFileHboxElem       = document.getElementById("attrcertext.form.basic.cert.source.file.hbox");
    gAttrCertInFileRowElem   = document.getElementById("attrcertext.form.basic.cert.source.file.row");
    gAttrCertFilePickerElem      = document.getElementById("attrcertext.form.basic.cert.source.file.path");
    // gAttrCertFileEditRowElem        = document.getElementById("attrcertext.form.basic.cert.source.file.edit.row");
    gAttrCertFileEditElem        = document.getElementById("attrcertext.form.basic.cert.source.file.edit");

    gAttrCertProfileRowElem		= document.getElementById("attrcertext.form.basic.acprofile.row");
    gAttrCertProfileElem		= document.getElementById("keymgr.attrcert.form.basic.acprofile");

    gAttrCertOutFilePathRowElem = document.getElementById("attrcertext.form.basic.certOut.file.path.row");
    gAttrCertOutFilePickerElem  = document.getElementById("attrcertext.form.basic.certOut.file.path");

    gAttrCertHolderCertPickerElem  = document.getElementById("keymgr.attrcert.form.basic.holder.nickName.menulist");
    gAttrCertIssuerCertPickerElem  = document.getElementById("keymgr.attrcert.form.basic.signer.nickName.menulist");

    attrcert_handleAttrCertSourceChange(gAttrCertSourceGroupElem);
}

function attrcert_enableFormForSignature(enableFlag)
{
    gAttrCertOutFilePathRowElem.hidden = !enableFlag;
    gAttrCertOutFilePickerElem.value = "";

    var signButtonElem = document.getElementById("attrcertext.cmd.sign");
    signButtonElem.hidden = !enableFlag;

    var loadButtonElem = document.getElementById("attrcertext.cmd.load");
    loadButtonElem.hidden = enableFlag;
}

function attrcert_handleAttrCertSourceChange(sourceGroupElem, ev)
{
    // AttrCert.logTrace("attrcert_handleAttrCertSourceChange():................Start.");

    var loadACFile = false;

    var selectedSourceElem = sourceGroupElem.selectedItem;
    if (!selectedSourceElem) {
    	return;
    }

    if (selectedSourceElem.value == "new") {
	loadACFile = false;
    }
    else {
	loadACFile = true;
    }

    // AttrCert.logDebug("attrcert_handleAttrCertSourceChange(loadACFile: " + loadACFile + ").....10.");

    // gAttrCertInFileFileHboxElem.hidden = !loadACFile;
    gAttrCertInFileRowElem.hidden = !loadACFile;
    gAttrCertFilePickerElem.attributeCert = null;
    // gAttrCertFileEditRowElem.hidden = true;
    gAttrCertFileEditElem.hidden = true;

    gAttrCertProfileRowElem.hidden = loadACFile;

    attrcert_enableFormForSignature(!loadACFile);

    try {
	attrcert_reset();
        if (!loadACFile) {
    	    gAttrCertProfileElem.reset();
    	    attrcert_ACProfileChanged(gAttrCertProfileElem);
	}
    	AttrCertBasicForm_handleAttrCertSourceChange(loadACFile);
	attrcert_setReadonly(loadACFile);

    } catch (ex) {
    	AttrCert.logError("attrcert_handleAttrCertSourceChange(): ex - " + ex + "");
    }

    if (!loadACFile) {
    	attrcert_handleAliasChange();
    }

    attrcert_showBasicForm();

    // AttrCert.logTrace("attrcert_handleAttrCertSourceChange():................End.");
}

function attrcert_ACProfileChanged(aACProfileElem, ev)
{
    // AttrCert.logTrace("attrcert_ACProfileChanged():................Start.");

    var acProfileDataProps = aACProfileElem.getProfileDataProps();
    if (!acProfileDataProps) {
    	return;
    }


    // Reset only if there are some properties.
    	AttrCertBasicForm_reset();
    	AttrCertAttributesForm_reset();
    	AttrCertExtensionsForm_reset();


    AttrCertBasicForm_updateCertProps(acProfileDataProps);
    AttrCertAttributesForm_updateCertProps(acProfileDataProps);
    AttrCertExtensionsForm_updateCertProps(acProfileDataProps);

    if (ev) {
    	ev.stopPropagation();
    }

    attrcert_handleAliasChange();

    // AttrCert.logTrace("attrcert_ACProfileChanged():................End.");
}

function attrcert_reset()
{
    // AttrCert.logTrace("attrcert_reset().....Start.");

    AttrCertBasicForm_reset();
    AttrCertAttributesForm_reset();
    AttrCertExtensionsForm_reset();

    // AttrCert.logTrace("attrcert_reset().....End.");
}

function attrcert_setReadonly(readonly)
{
    // AttrCert.logTrace("attrcert_setReadonly(readonly: " + readonly + ").....Start.");

    AttrCertBasicForm_setReadonly(readonly);
    AttrCertExtensionsForm_setReadonly(readonly);
    AttrCertAttributesForm_setReadonly(readonly);

    // AttrCert.logTrace("attrcert_setReadonly(readonly: " + readonly + ").....End.");
}

function attrcert_updateWithAttributeCert(attributeCert)
{
    AttrCert.logTrace("attrcert_updateWithAttributeCert().....Start.");

    AttrCertBasicForm_updateWithAttributeCert(attributeCert);
    AttrCertExtensionsForm_updateWithAttributeCert(attributeCert);
    AttrCertAttributesForm_updateWithAttributeCert(attributeCert);

    AttrCert.logTrace("attrcert_updateWithAttributeCert().....End.");
}


function attrcert_resignAttrCert(aResignAC, ev)
{
    // AttrCert.logTrace("attrcert_resignAttrCert().....................Start.");

    if (aResignAC.checked) {
    	attrcert_setReadonly(false);
    	attrcert_enableFormForSignature(true);
	return;
    }

    attrcert_loadAttrCertFile(null, "attrcertext.form.basic.cert.source.file.path");

    // AttrCert.logTrace("attrcert_resignAttrCert().....................End.");
}

function attrcert_loadAttrCertFile(aAttrCertFilePickerElem, ev)
{
    // AttrCert.logTrace("attrcert_loadAttrCertFile():................Start.");

    attrcert_reset();

    var attrCertFilePickerElem = aAttrCertFilePickerElem;

    var attrCertFile = attrCertFilePickerElem.file;
    if (!attrCertFile) {
	if (ev) {
	    alert("File path for the attribute cert is missing.");
	}
	attrCertFilePickerElem.focus();
        return;
    }

    if (attrCertFile.fileSize <= 0) {
	if (ev) {
	    alert("Zero length attribute cert file - select another one.");
	}
	attrCertFilePickerElem.focus();
        return;
    }

    var /* alrIAttributeCertFactory */ attrCertFactory = null;
    attrCertFactory = Components.classes["@avaya.com/pkm/attrcertfactory;1"].
	                    getService(Components.interfaces.alrIAttributeCertFactory);

    if (attrCertFactory == null) {
    	AttrCert.logError("attrcert_loadAttrCertFile(): failed to get AttributeCertFactory.");
    	return;
    }

    var /* alrIAttributeCert */ attributeCert = null;
    try {
    	attributeCert = attrCertFactory.loadAttributeCertificateFromFile(
			attrCertFilePickerElem.file,
			attrCertFilePickerElem.ascii
                	);
    } catch (ex) {
    	AttrCert.logError("attrcert_loadAttrCertFile(): attrCertFactory.loadAttributeCertificateFromFile() failed - " + ex + "");
	alert("attrcert_loadAttrCertFile(): attrCertFactory.loadAttributeCertificateFromFile() failed - " + ex);
	return;
    }
    AttrCert.logDebug("attrcert_loadAttrCertFile(): attributeCert: " + attributeCert + "");
    if (!attributeCert) {
	alert("attrcert_loadAttrCertFile(): failed to load the selected file - " + ex);
    	return;
    }
    attrCertFilePickerElem.attributeCert = attributeCert; // cache it for future use.

    var /* nsIPersistentProperties */ attrCertProps = null;
    attrcert_updateWithAttributeCert(attributeCert);

    // AttrCert.logTrace("attrcert_loadAttrCertFile():................50.");

    attrcert_setReadonly(true);

    // If both the issuer and holder X.509 certs are present in the browser's CertDB,
    // then show the re-sign checkbox.
    // TODO: Sign with textual data for holder ID, without the X.509 cert.
    var holderX509Cert = null;
    var issuerX509Cert = null;
    try {
    	holderX509Cert = attributeCert.holder;
    } catch (ex) {}
    try {
    	issuerX509Cert = attributeCert.issuer;
    } catch (ex) {}
    // AttrCert.logTrace("attrcert_loadAttrCertFile():................60.");

    if (issuerX509Cert && holderX509Cert) {
    	// gAttrCertFileEditRowElem.hidden = false;
    	gAttrCertFileEditElem.hidden = false;
    	gAttrCertFileEditElem.checked = false;
    }

    // AttrCert.logTrace("attrcert_loadAttrCertFile():................End.");
}

function attrcert_loadAttrCertFileX(ev, attrCertFilePickerElemId)
{
    var attrCertFilePickerElem = ev.originalTarget;
    attrcert_loadAttrCertFile(attrCertFilePickerElem, ev);
}

function attrcert_handleLoadAttrCertCmd(ev, attrCertFilePickerElemId)
{
    var attrCertFilePickerElem = document.getElementById(attrCertFilePickerElemId);
    attrcert_loadAttrCertFile(attrCertFilePickerElem, ev);
}


function attrcert_handleAliasChange()
{
    // AttrCert.logTrace("attrcert_handleAliasChange():................Start.");

    // AttrCert.logDebug("attrcert_handleAliasChange(): alias: " + aliasElem.value + ".");
    // AttrCert.logDebug("attrcert_handleAliasChange(): path: >" + gAttrCertOutFilePickerElem.value + "<.");
    // AttrCert.logDebug("attrcert_handleAliasChange(): file: " + gAttrCertOutFilePickerElem.file + "");

    var certAlias = AttrCertBasicForm_getAlias();
    if (certAlias == "") {
    	return;
    }

    // TODO: Allow user override 
    /*
    if (gAttrCertOutFilePickerElem.value != "") {
    	return;
    }
    */

    var fileFormat = "der";
    if (gAttrCertOutFilePickerElem.ascii) {
    	fileFormat = "base64";
    }
    var attrCertFileName = certAlias + "_attrcert_" + fileFormat + ".acr";
    // AttrCert.logDebug("attrcert_handleAliasChange(): attrCertFileName: " + attrCertFileName + ".");
    
    var attrCertFile = gAttrCertOutFilePickerElem.file;
    try {
    	var attrCertOutDirFile = gAttrCertOutFilePickerElem.getTmpDir("KeyManager/AttrCert");
	attrCertFile = gAttrCertOutFilePickerElem.autoSelectFile(attrCertOutDirFile, attrCertFileName);
    } catch (ex) {
    	AttrCert.logError("attrcert_handleAliasChange(): autoSelectFile() failed - ex: " + ex + "");
    }
    if (!attrCertFile) {
    	AttrCert.logTrace("attrcert_handleAliasChange():................End(1).");
	return;
    }
    // AttrCert.logDebug("attrcert_handleAliasChange(): newPath: >" + gAttrCertOutFilePickerElem.value + "<.");

    // AttrCert.logTrace("attrcert_handleAliasChange():................End.");
}



function attrcert_displayAdvancedTabs(/* boolean */ show)
{
    // AttrCert.logTrace("attrcert_displayAdvancedTabs():................Start.");

    var attrCertFormTabAttrElem = document.getElementById('attrcertext.form.tab.attribute');
    var attrCertFormTabExtElem = document.getElementById('attrcertext.form.tab.extension');

    if (show == false) {
	attrCertFormTabAttrElem.hidden = true;
	attrCertFormTabExtElem.hidden = true;
    }
    else {
	attrCertFormTabAttrElem.removeAttribute("hidden");
	// attrCertFormTabAttrElem.hidden = false;

	attrCertFormTabExtElem.removeAttribute("hidden");
	// attrCertFormTabExtElem.hidden = false;
    }

    // attrcert_selectBasicFormTab();

    // AttrCert.logTrace("attrcert_displayAdvancedTabs():................End.");
}

function attrcert_selectBasicFormTab()
{
    // Select the Basic tab
    var attrCertSignerTabboxElem = document.getElementById('attrcertext.form.tabbox');
    var attrCertBasicTabElem = document.getElementById('attrcertext.form.tab.basic');

    attrCertSignerTabboxElem.selectedTab = attrCertBasicTabElem;
}

function attrcert_selectAttributesFormTab()
{
    // Select the Attributes tab
    var attrCertSignerTabboxElem = document.getElementById('attrcertext.form.tabbox');
    var attrCertAttributesTabElem = document.getElementById('attrcertext.form.tab.attribute');

    attrCertSignerTabboxElem.selectedTab = attrCertAttributesTabElem;
}

function attrcert_showAdvancedTabs()
{
    attrcert_displayAdvancedTabs(true);
}

function attrcert_hideAdvancedTabs()
{
    attrcert_displayAdvancedTabs(false);
}


function attrcert_showBasicForm()
{
    // AttrCert.logTrace("attrcert_showBasicForm():..................Start.");

    // Hide the  cert related Tabs
    attrcert_hideAdvancedTabs();

    // Hide the Basic tab control
    var attrCertFormTabCmdBasicElem = document.getElementById('attrcertext.form.tab.cmd.basic');
    attrCertFormTabCmdBasicElem.hidden = true;

    // Show the Advanced tab control
    var attrCertFormTabCmdAdvancedElem = document.getElementById('attrcertext.form.tab.cmd.advanced');
    attrCertFormTabCmdAdvancedElem.hidden = false;

    attrcert_selectBasicFormTab();

    // AttrCert.logTrace("attrcert_showBasicForm():..................End.");
}

function attrcert_showAdvancedForm()
{
    // AttrCert.logTrace("attrcert_showAdvancedForm():..................Start.");

    // Show the basic tab control
    var attrCertFormTabCmdBasicElem = document.getElementById('attrcertext.form.tab.cmd.basic');
    attrCertFormTabCmdBasicElem.hidden = false;

    // Hide the Advanced tab control
    var attrCertFormTabCmdAdvancedElem = document.getElementById('attrcertext.form.tab.cmd.advanced');
    attrCertFormTabCmdAdvancedElem.hidden = true;

    // Show the cert related Tabs
    attrcert_showAdvancedTabs();

    // attrcert_selectBasicFormTab();
    attrcert_selectAttributesFormTab();

    // AttrCert.logTrace("attrcert_showAdvancedForm():..................End.");
}

function attrcert_cmdVerify()
{
    alert("Verify is not yet implemented.");

    AttrCert.logTrace("attrcert_cmdVerify():..................Start.");
    AttrCert.logError("Verify is not yet implemented.");
    AttrCert.logTrace("attrcert_cmdVerify():..................End.");
}

function attrcert_loginToCertToken(aCert, force)
{
    var tokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"]
    			.getService(Components.interfaces.nsIPK11TokenDB);
    var keyTokenName = "" + aCert.tokenName;
    var /* nsIPK11Token */ token = tokendb.findTokenByName(keyTokenName);
    if (token == null) {
        return;
    }
    var forceLogin = ((force == null) ? false : force);

    // token.checkPassword("abcd1234");

    token.login(forceLogin);
}

function attrcert_cmdSign()
{
    AttrCert.logTrace("attrcert_cmdSign():..................Start.");

    var attrCertAlias = AttrCertBasicForm_getAlias();
    if (!attrCertAlias || (attrCertAlias.length == 0)) {
    	alert("Alias for Attrbiute cert is missing.");
    	AttrCert.logError("Alias for Attrbiute cert is missing.");
	return;
    }
    if (AttrCertAttributesForm_getTotalActiveAttributes() <= 0) {
    	alert("There must be at least one active Attrbiute.");
    	AttrCert.logError("There must be at least one active Attrbiute.");
	attrcert_showAdvancedForm();
	return;
    }

    var attrCertOutFilePickerElem	= document.getElementById("attrcertext.form.basic.certOut.file.path"); 
    if (!attrCertOutFilePickerElem.file) {
    	alert("Output file path is missing.");
    	AttrCert.logError("Output file path is missing.");
	return;
    }

    var /* alrIAttributeCertFactory */ attrCertFactory = null;
    attrCertFactory = Components.classes["@avaya.com/pkm/attrcertfactory;1"].
	                    getService(Components.interfaces.alrIAttributeCertFactory);

    if (attrCertFactory == null) {
    	alert("attrcert_cmdSign(): failed to get AttributeCertFactory.");
    	AttrCert.logError("attrcert_cmdSign(): failed to get AttributeCertFactory.");
    	return;
    }

    var /* nsIX509Cert */ holderCert;
    var /* nsIX509Cert */ issuerCert;

    if (gAttrCertFileEditElem.checked) {
	var attributeCert = gAttrCertFilePickerElem.attributeCert;
    	holderCert = AttrCertBasicForm_getACHolderCert();
    	issuerCert = AttrCertBasicForm_getACIssuerCert();
    }
    else {
    	holderCert = AttrCertBasicForm_getSelectedHolderCert();
    	issuerCert = AttrCertBasicForm_getSelectedIssuerCert();
    }
    if (holderCert == null) {
    	AttrCert.logError("attrcert_cmdSign(): null holderCert.");
    	alert("attrcert_cmdSign(): null holderCert.");
    	return;
    }
    if (issuerCert == null) {
    	AttrCert.logError("attrcert_cmdSign(): null issuerCert.");
    	alert("attrcert_cmdSign(): null issuerCert.");
    	return;
    }

    var  serialNumber = 55555;
    var validityInMonths = 36;

    var /* nsIPersistentProperties */ attrCertBasicProps;
    attrCertBasicProps = Components.classes["@mozilla.org/persistent-properties;1"].
                    createInstance(Components.interfaces.nsIPersistentProperties);
    AttrCertBasicForm_toCertProps(attrCertBasicProps);
    // gAttrCertExtensionsElem.dumpProperties(attrCertBasicProps, "AttrCert Basic Props");

    var /* nsIPersistentProperties */ attrCertAttributeProps;
    attrCertAttributeProps = Components.classes["@mozilla.org/persistent-properties;1"].
                    createInstance(Components.interfaces.nsIPersistentProperties);
    AttrCertAttributesForm_toCertProps(attrCertAttributeProps);

    var /* nsIPersistentProperties */ attrCertExtensionProps;
    attrCertExtensionProps = Components.classes["@mozilla.org/persistent-properties;1"].
                    createInstance(Components.interfaces.nsIPersistentProperties);
    AttrCertExtensionsForm_toCertProps(attrCertExtensionProps);

    var /* alrIAttributeCert */ attributeCert = null;
    try {
	// Force token login - on windows the popup window for password is not coming up
	attrcert_loginToCertToken(issuerCert);

	/* alrIAttributeCert createAttributeCertificate (
	 * 		in nsIX509Cert aHolderCert,
	 * 		in nsIX509Cert aIssuerCert,
	 * 		in nsIPersistentProperties aCertProps,
	 * 		in nsIPersistentProperties aCertAttributes,
	 * 		in nsIPersistentProperties aCertExtensions);
	 */

    	attributeCert = attrCertFactory.createAttributeCertificate(
                	holderCert, issuerCert,
			attrCertBasicProps,
                	attrCertAttributeProps, attrCertExtensionProps
                	);
	/*
    	attributeCert = attrCertFactory.createAttributeCertificate2(
                	holderCert, issuerCert,
                	serialNumber, validityInMonths,
                	attrCertAttributeProps, attrCertExtensionProps
                	);
    	*/
    } catch (ex) {
    	AttrCert.logError("attrcert_cmdSign(): attrCertFactory.createAttributeCertificate() failed - " + ex + "");
	alert("attrcert_cmdSign(): attrCertFactory.createAttributeCertificate() failed - " + ex);
	return;
    }
    AttrCert.logDebug("attrcert_cmdSign(): attributeCert: " + attributeCert + "");

    var /* nsILocalFile */ attrCertFile = gAttrCertOutFilePickerElem.file;
    var attrCertFileIsAscii = gAttrCertOutFilePickerElem.ascii;
    try {
    	attributeCert.exportToFile(attrCertFile, attrCertFileIsAscii);
    	gAttrCertOutFilePickerElem.refresh();
    } catch (ex) {
    	AttrCert.logError("attrcert_cmdSign(): attributeCert.exportToFile() failed - " + ex + "");
	alert("attrcert_cmdSign(): attributeCert.exportToFile() failed - " + ex);
	return;
    }
    alert("Attribute certificate is successfully created.");
    AttrCert.logDebug("Attribute certificate is successfully created.");

    attrcert_selectBasicFormTab();

    AttrCert.logTrace("attrcert_cmdSign():..................End.\n");
}

function attrcert_cmdClose()
{
    AttrCert.logTrace("attrcert_cmdClose():..................Start.");
    window.close();
}

function attrcert_cmdCancel()
{
    AttrCert.logTrace("attrcert_cmdCancel():..................Start.");
    window.close();
}

