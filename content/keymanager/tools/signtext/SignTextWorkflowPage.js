/* @(#) $Id: SignTextWorkflowPage.js,v 1.4 2012/10/07 17:21:02 subrata Exp $ */

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
 *     Subrata Mazumdar, Avaya Labs Research, Avaya Inc.
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



var gTextDocWizardWorkFlowInitDone = false;
var gTextDocWorkFlowWizardElem;
var gTextDocSaveInFileElem;
var gButtonNextOrigLabel;

function updateWizardPageWorkFlowSequence() 
{
    // dump("updateWizardPageWorkFlowSequence():................Start.\n");

    var startingPageId = null;
    var prevPageId = null;
    var lastPageElem = null;

    var xmlDocWorkFlowStepsRowElem = document.getElementById("keymgr.signtext.doc.workflow.steps.row");
    var xmlDocWorkFlowStepsElems = xmlDocWorkFlowStepsRowElem.getElementsByTagName("checkbox");

    var totStepCnt = 0;
    var generateOutFile = false;
    for (var i = 0; i < xmlDocWorkFlowStepsElems.length; i++) {
    	var xmlDocWorkFlowStepElem = xmlDocWorkFlowStepsElems.item(i);
	if (!xmlDocWorkFlowStepElem.checked) {
	    continue;
	}
	var cmdPageId = xmlDocWorkFlowStepElem.getAttribute("cmdPageId");
	if (!cmdPageId) {
	    continue;
	}
	if (prevPageId) {
    	    var prevPageElem = gTextDocWorkFlowWizardElem.getPageById(prevPageId);
	    if (prevPageElem) {
	    	prevPageElem.next = cmdPageId;
    	    	// dump("updateWizardPageWorkFlowSequence(): " + prevPageId + " ==> " + cmdPageId + "\n");
	    }
	}

	prevPageId = cmdPageId;
	if (!startingPageId) {
	    startingPageId = cmdPageId;
	}
	if (xmlDocWorkFlowStepElem.getAttribute("genoutfile") == "true") {
	    generateOutFile = true;
	}
	totStepCnt++;
    }
    if (prevPageId) {
    	var lastPageElem = gTextDocWorkFlowWizardElem.getPageById(prevPageId);
	if (lastPageElem) {
    	    lastPageElem.next = "keymgr.signtext.doc.finish";
	    lastPageElem.lastStep = true;
    	    // dump("updateWizardPageWorkFlowSequence(): " + prevPageId + " ==> " + lastPageElem.next + "\n");
	}
    }
    if (startingPageId) {
    	setStartingWizardPage(startingPageId);
    }

    var xmlDocSaveInFileRowElem = document.getElementById('keymgr.signtext.doc.workflow.save.row');
    var xmlDocSaveInFileElem = document.getElementById('keymgr.signtext.doc.workflow.save');
    var finalOutFilePickerRowElem = document.getElementById("keymgr.signtext.doc.workflow.out.file.row");
    var finalOutFilePickerElem = document.getElementById("keymgr.signtext.doc.workflow.out.file");


    // dump("updateWizardPageWorkFlowSequence(): generateOutFile: " + generateOutFile + " totStepCnt: " + totStepCnt + "\n");
    gTextDocWorkFlowWizardElem.finalOutFilePickerElem = finalOutFilePickerElem;
    gTextDocWorkFlowWizardElem.generateOutFile = generateOutFile;

    if (generateOutFile) {
	if (totStepCnt > 1) {
    	    xmlDocSaveInFileRowElem.hidden = false;
	}
	else {
    	    xmlDocSaveInFileRowElem.hidden = true;
	}
	handleSaveWizardPageOutputChange(xmlDocSaveInFileElem);
    	// finalOutFilePickerRowElem.hidden = false;
    }
    else {
    	xmlDocSaveInFileRowElem.hidden = true;
    	finalOutFilePickerRowElem.hidden = true;
	if (!finalOutFilePickerElem.disabled) {
	    finalOutFilePickerElem.filepath = "";
	}
    }
    if (!finalOutFilePickerElem.disabled) {
    	handleFinalOutFileChange(finalOutFilePickerElem);
    }

    // dump("updateWizardPageWorkFlowSequence():................End.\n");
    return startingPageId;
}

function activateWizardPages(aWorkFlowPageNameList) 
{
    // dump("activateWizardPages():................Start.\n");

    var workFlowPageNames = aWorkFlowPageNameList.split(",");
    for (var i = 0; i < workFlowPageNames.length; i++) {
    	var workFlowPageName = workFlowPageNames[i];
	var workFlowPageActiveElemId = "keymgr.signtext.doc.workflow.steps." + workFlowPageName;
    	// dump("activateWizardPages(): workFlowPageActiveElemId: " + workFlowPageActiveElemId + "\n");
        var workFlowPageActiveElem = document.getElementById(workFlowPageActiveElemId);
	if (!workFlowPageActiveElem) {
	    continue;
	}
	workFlowPageActiveElem.checked = true;
    }

    updateWizardPageWorkFlowSequence();

    // dump("activateWizardPages():................End.\n");
    return true;
}

function handleXmlDocWorkFlowSeqChange(aXmlDocWorkFlowGroupElem, ev) 
{
    // dump("handleXmlDocWorkFlowSeqChange():................Start.\n");

    var xmlDocWorkFlowItemElem = aXmlDocWorkFlowGroupElem.selectedItem;
    var workFlowItemValue = xmlDocWorkFlowItemElem.value;

    var xmlDocWorkFlowStepsRowElem = document.getElementById("keymgr.signtext.doc.workflow.steps.row");
    var xmlDocWorkFlowStepsElems = xmlDocWorkFlowStepsRowElem.getElementsByTagName("checkbox");
    for (var i = 0; i < xmlDocWorkFlowStepsElems.length; i++) {
    	var xmlDocWorkFlowStepElem = xmlDocWorkFlowStepsElems.item(i);
	xmlDocWorkFlowStepElem.checked = false;
	if (workFlowItemValue == "custom") {
	    xmlDocWorkFlowStepElem.disabled = false;
	}
	else {
	    xmlDocWorkFlowStepElem.disabled = true;
	}
    }
    if (workFlowItemValue != "custom") {
    	activateWizardPages(workFlowItemValue);
    }

    // dump("handleXmlDocWorkFlowSeqChange():................End.\n");
}

function activateCustomWizardPages(aCustomWorkFlowSeq) 
{
    // dump("activateCustomWizardPages(" + aCustomWorkFlowSeq + "):................Start.\n");

    var workFlowSeqItemElem = null;
    var workFlowSeqGroupElem = document.getElementById("keymgr.signtext.doc.workflow.group");

    if (!aCustomWorkFlowSeq || (aCustomWorkFlowSeq == "")) {
    	// dump("activateCustomWizardPages(" + aCustomWorkFlowSeq + "):................10.\n");
	// TODO: Get the default actions from the preference.
    	workFlowSeqItemElem = document.getElementById("keymgr.signtext.doc.workflow.item01");
    	workFlowSeqGroupElem.selectedItem = workFlowSeqItemElem;
	handleXmlDocWorkFlowSeqChange(workFlowSeqGroupElem);
	return workFlowSeqItemElem;
    }

    var workFlowSeqItemElemList = workFlowSeqGroupElem.getElementsByAttribute("value", aCustomWorkFlowSeq);
    if (workFlowSeqItemElemList && (workFlowSeqItemElemList.length > 0)) {
    	// dump("activateCustomWizardPages(" + aCustomWorkFlowSeq + "):................20.\n");
	// Found an existing workflow seq item - so select that one and then update the workflow page sequence
    	workFlowSeqItemElem = workFlowSeqItemElemList.item(0);
	workFlowSeqGroupElem.selectedItem = workFlowSeqItemElem;
	handleXmlDocWorkFlowSeqChange(workFlowSeqGroupElem);
	return workFlowSeqItemElem;
    }
    // dump("activateCustomWizardPages(" + aCustomWorkFlowSeq + "):................30.\n");

    workFlowSeqItemElem = document.getElementById("keymgr.signtext.doc.workflow.custom");
    workFlowSeqGroupElem.selectedItem = workFlowSeqItemElem;
    handleXmlDocWorkFlowSeqChange(workFlowSeqGroupElem);
    // dump("activateCustomWizardPages(" + aCustomWorkFlowSeq + "):................40.\n");

    activateWizardPages(aCustomWorkFlowSeq);

    // dump("activateCustomWizardPages():................End.\n");
    return workFlowSeqItemElem;
}

function setStartingWizardPage(aStartingPageId) 
{

    gTextDocWorkFlowWizardElem.currentPage.next = aStartingPageId;
    // dump("setStartingWizardPage(): aStartingPageId: " + aStartingPageId + "\n");

    // Make the input file picker for the first step browsable/modifiable element.
    var nextPageElem = gTextDocWorkFlowWizardElem.getPageById(aStartingPageId);

    var nexPageInputFilePickerElemList = nextPageElem.getElementsByAttribute("fileMode", "open");
    if (nexPageInputFilePickerElemList.length > 0) {
	var nexPageInputFilePickerElem = nexPageInputFilePickerElemList.item(0);
	nexPageInputFilePickerElem.removeAttribute("readonly");
	nexPageInputFilePickerElem.removeAttribute("browsehidden");
    }
}

function handleXmlDocWorkFlowStepsChange(ev) 
{
    // dump("handleXmlDocWorkFlowStepsChange():................Start.\n");

    var targetElem = ev.targetElem;

    if (ev) {
    	ev.stopPropagation();
    }

    var startingPageId = updateWizardPageWorkFlowSequence();
    if (!startingPageId) {
    	gTextDocWorkFlowWizardElem.canAdvance = false;
    	return;
    }

    gTextDocWorkFlowWizardElem.canAdvance = true;

    // dump("handleXmlDocWorkFlowStepsChange():................End.\n");
}

function handleSaveWizardPageOutputChange(aSaveInFileElem, ev) 
{
    gTextDocWorkFlowWizardElem.saveInFile = aSaveInFileElem.checked;

    var finalOutFilePickerRowElem = document.getElementById("keymgr.signtext.doc.workflow.out.file.row");
    if (aSaveInFileElem.checked) {
    	finalOutFilePickerRowElem.hidden = true;
    }
    else {
    	finalOutFilePickerRowElem.hidden = false;
    }
}

function handleFinalOutFileChange(aFinalOutFilePickerElem, ev) 
{
    var finalOutFilePath = aFinalOutFilePickerElem.filepath;
    if (aFinalOutFilePickerElem.file) {
    	gTextDocWorkFlowWizardElem.outFilePath = aFinalOutFilePickerElem.filepath;
    }
    else {
    	gTextDocWorkFlowWizardElem.outFilePath = null;
    }
}

var SignTextWorkflowPage = {


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
        SignTextWorkflowPage.log(2, msg);
    },
    logTrace : function(msg)
    {
        SignTextWorkflowPage.log(4, msg);
    },
    logDebug : function(msg)
    {
        SignTextWorkflowPage.log(8, msg);
    },

    handleTextboxChange : function (aTextboxElem, ev) 
    {
    	SignTextWorkflowPage.logTrace("SignTextWorkflowPage.handleTextboxChange():................Start.");

	if (aTextboxElem.value != "") {
	    aTextboxElem.value = this.trim(aTextboxElem.value);
	}

    	SignTextWorkflowPage.logTrace("SignTextWorkflowPage.handleTextboxChange():................End.");
    },

    initWithDefaultValues : function () 
    {
    	SignTextWorkflowPage.logTrace("SignTextWorkflowPage.initWithDefaultValues():................Start.");

	do {
            var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
            try {
                var prefBranchPrefixId = "keymgr.jksmanagecert.";
                var prefsBranch = Prefs.getBranch(prefBranchPrefixId);
                if (!prefsBranch) {
    	            break;
                }

                var prefStringValue = null;
                var prefBoolValue = false;
                var prefIntValue = false;

                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("shellcmdpath");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mShellCmdPath = prefStringValue;
	        }

		/*
                prefStringValue = null;
		try {
		    prefStringValue = prefsBranch.getCharPref("genkeyoption");
		} catch (ex) {} 
	        if (prefStringValue && (prefStringValue != "")) {
		    this.mGenKeyOptionName = prefStringValue;
	        }
		*/

                prefIntValue = false;
		try {
		    prefIntValue = prefsBranch.getIntPref("loglevel");
	            this.mMaxLogLevel = prefIntValue;
		} catch (ex) {} 

		/*
                prefBoolValue = false;
		try {
		    prefBoolValue = prefsBranch.getBoolPref("loglevel");
		} catch (ex) {} 
	        this.mXXXX.checked = prefBoolValue;
		*/

            } catch (ex) {
	    	SignTextWorkflowPage.logDebug("SignTextWorkflowPage.initWithDefaultValues():  unable to obtain preferences - ex: " + ex);
	    }

	} while (0);

    	SignTextWorkflowPage.logTrace("SignTextWorkflowPage.initWithDefaultValues():................End.");
    },

    initWithDialogParams : function () 
    {
    	SignTextWorkflowPage.logTrace("SignTextWorkflowPage.initWithDialogParams():................Start.");

        if (!(window.arguments) || (window.arguments.length <= 0)) {
    	    SignTextWorkflowPage.logTrace("SignTextWorkflowPage.initWithDialogParams():................End(0).");
	    return;
	}

        var dialogParams = window.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);

        var pkiParams = null;
	try {
	    pkiParams = dialogParams.QueryInterface(Components.interfaces.nsIPKIParamBlock);
	    if (pkiParams) {
		/*
	        var paramCRL = pkiParams.getISupportAtIndex(1);
	        if (paramCRL) {
		    SignTextWorkflowPage.logDebug("SignTextWorkflowPage.initWithDialogParams(): paramCRL: " + paramCRL);
	            selectedCRL = paramCRL.QueryInterface(Components.interfaces.alrICRL);
	        }
		*/
	    }
	} catch (ex) {
    	    SignTextWorkflowPage.logError("SignTextWorkflowPage.initWithDialogParams() pkiParams.getISupportAtIndex() failed - ex: "+ ex);
	}

    	SignTextWorkflowPage.logTrace("SignTextWorkflowPage.initWithDialogParams():................End.");
    },


    initOnLoad : function (aWizardElem) 
    {
    	SignTextWorkflowPage.logTrace("SignTextWorkflowPage.initOnLoad():................Start.");

    	if (gTextDocWizardWorkFlowInitDone) {
    	    return;
    	}

	this.initWithDefaultValues();
	this.initWithDialogParams();

    	// dump("SamlSelfTokenCreateWorkFlowInit_initOnLoad():................Start.\n");
    	gTextDocWizardWorkFlowInitDone = true;


    	gTextDocWorkFlowWizardElem = aWizardElem;
    	var wizardButtonNextElem = gTextDocWorkFlowWizardElem.getButton("next");
    	gButtonNextOrigLabel = wizardButtonNextElem.label;


    	// gFinalFilePathItemElem = document.getElementById("keymgr.signtext.doc.finish.file.path");
    	gTextDocSaveInFileElem = document.getElementById('keymgr.signtext.doc.workflow.save');

    	// this.mWizardElem		= document.getElementById('keymgr.jksmanagecert.wizard');

    	SignTextWorkflowPage.logTrace("SignTextWorkflowPage.initOnLoad():................End.");
    },

    onPageShow : function (aWizardPageElem, ev) 
    {
    	SignTextWorkflowPage.logTrace("SignTextWorkflowPage.onPageShow():................Start.");

    	this.initOnLoad(aWizardPageElem.parentNode);
    	SignTextWizardOverlay.initOnLoad(aWizardPageElem.parentNode);

    	gTextDocWorkFlowWizardElem.canAdvance = false;

    	var wizardButtonNextElem = gTextDocWorkFlowWizardElem.getButton("next");
    	wizardButtonNextElem.label = gButtonNextOrigLabel;

    	var xmlDocWorkFlowGroupElem = document.getElementById("keymgr.signtext.doc.workflow.group");
    	handleXmlDocWorkFlowSeqChange(xmlDocWorkFlowGroupElem);

    	// xmldsigffext_initParamsOnLoad();

    	gTextDocWorkFlowWizardElem.canAdvance = true;

    	SignTextWorkflowPage.logTrace("SignTextWorkflowPage.onPageShow():................End.");
    },

    onPageAdvanced : function (aWizardPageElem, ev) 
    {
    	SignTextWorkflowPage.logTrace("SignTextWorkflowPage.onPageAdvanced():................Start.");

    	gTextDocWorkFlowWizardElem.saveInFile = gTextDocSaveInFileElem.checked;

    	var nextPageElem = gTextDocWorkFlowWizardElem.getPageById(aWizardPageElem.next);
    	if (gTextDocWorkFlowWizardElem.txtdoc) {
    	    nextPageElem.xmldoc = gTextDocWorkFlowWizardElem.txtdoc;
    	}

    	if (gTextDocWorkFlowWizardElem.inFilePath) {
    	    nextPageElem.filepath = gTextDocWorkFlowWizardElem.inFilePath;
    	}

    	gTextDocWorkFlowWizardElem.firstStep = true;

    	SignTextWorkflowPage.logTrace("SignTextWorkflowPage.onPageAdvanced():................End.");
    },

    lastMethod : function () 
    {
    }
}

