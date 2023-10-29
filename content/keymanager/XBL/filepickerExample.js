/* @(#) $Id: filepickerExample.js,v 1.3 2008/10/13 14:28:01 subrata Exp $ */

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



function FilePicker_initWin(target)
{

    var pickModes = ["open", "save", "folder"];
    for (var i = 0; i < pickModes.length; i++){
        var filePickerElemId = "keymanager.filepicker." + pickModes[i];
        var filePickerElem = document.getElementById(filePickerElemId);
	if (filePickerElem == null) {
	    continue;
	}
    }

    var filePickerElemId = "keymanager.fileselector.example.open";
    document.getElementById(filePickerElemId).setAttribute("disabled", "true");
}

function FilePicker_oncommand(filePickerElem)
{
    dump("FilePicker_oncommand(): filePicker: " + filePickerElem.id + "  .........Start.\n");

    // filePickerElem.setAttribute("disabled", "true");
    filePickerElem.disabled = true;
    filePickerElem.browse();

    var filePickerElemId = "keymanager.fileselector.example.save";
    document.getElementById(filePickerElemId).disabled = false;

    var fileItemElemId = "keymanager.fileselector.example.reopen";
    var fileItemElem = document.getElementById(fileItemElemId);
    fileItemElem.ascii = filePickerElem.ascii;
    fileItemElem.file = filePickerElem.file;

    filePickerElem.value = "/home/subrata/Santoo.txt";

    dump("FilePicker_oncommand(): filePicker: " + filePickerElem.id + "  .........End.\n");
}

function FilePicker_oncommand2(filePickerElem)
{
    dump("FilePicker_oncommand2(): filePicker: " + filePickerElem.id + "  .........Start.\n");

    // filePickerElem.setAttribute("disabled", "true");
    filePickerElem.disabled = true;

    var filePickerElemId = "keymanager.fileselector.example.open";
    document.getElementById(filePickerElemId).disabled = false;

    var fileItemElemId = "keymanager.fileselector.example.reopen";
    var fileItemElem = document.getElementById(fileItemElemId);
    fileItemElem.file = filePickerElem.file;
    dump("FilePicker_oncommand2(): filePicker: " + filePickerElem.id + "  .........50.\n");
    fileItemElem.ascii = filePickerElem.ascii;

    dump("FilePicker_oncommand2(): filePicker: " + filePickerElem.id + "  .........End.\n");
}

function FilePicker_oncommandX(filePickerElem)
{
    /*
    dump("FilePicker_oncommand(): filePicker: " + filePickerElem.id +
    		" file: " + ((filePickerElem.file != null) ? filePickerElem.file : "NULL") +
    		" filePickMode: " + ((filePickerElem.filePickMode != null) ? filePickerElem.filePickMode : "NULL") +
		' value: ' + filePickerElem.getAttribute("value") + 
		"\n"
		);
    dump("FilePicker_oncommand(): filePicker: " + filePickerElem.id +
    		" file: " + ((filePickerElem.file != null) ? filePickerElem.file : "NULL") +
    		" filePickMode: " + ((filePickerElem.filePickMode != null) ? filePickerElem.filePickMode : "NULL") +
		' value: ' + filePickerElem.value + 
		"\n"
		);
    */

    // dump(filePickerElem.readFile() + "\n");

    /*
    filePickerElem.browse();
    filePickerElem.autoSelectFile("XYXYXY/JJJJJ", "xcxcfxf.txt");

    dump("FilePicker_oncommand(): " +  "\n" + 
    			"  filePickMode: " + filePickerElem.filePickMode  + "\n" + 
    			"  fileDialogMsg: " + filePickerElem.fileDialogMsg  + "\n" + 
    			"  fileTypeMsg: " + filePickerElem.fileTypeMsg  + "\n" + 
    			"  fileTypeFilters: " + filePickerElem.fileTypeFilters  + "\n" + 
    			"  fileDisplayDirPath: " + filePickerElem.fileDisplayDirPath  +
			".\n");
    */
}

