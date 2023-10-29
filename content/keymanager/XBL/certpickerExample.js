/* @(#) $Id: certpickerExample.js,v 1.6 2008/12/22 06:16:28 subrata Exp $ */

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
 *     Avaya Labs Research, Avaya Inc.
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



var flag = 1;

function CertPicker_uninitWin(ev)
{
    dump("CertPicker_uninitWin(): flag: " + flag + "\n");
    if ((flag % 3) != 0) {
    	ev.stopPropagation();
        flag++;
    }
}

function CertPicker_initWin()
{
    var winElemId = "keymanager.certpicker.win";
    var winElem = document.getElementById(winElemId);
    winElem.addEventListener("unload", CertPicker_uninitWin, true); 


    var certPickerElemId = "keymanager.certpicker.1";
    var certPickerElem = document.getElementById(certPickerElemId);


    if (certPickerElem) {
    	handleCertPickerEvents(certPickerElem, certPickerElem.nickNameMenu.selectedItem);
    }

    var tokenMenuListElemId = "keymanager.tokenmenulist.1";
    var tokenMenuListElem = document.getElementById(tokenMenuListElemId);
    if (tokenMenuListElem) {
	onTokenMenuChange(tokenMenuListElem, tokenMenuListElem.tokenMenu.selectedItem);
    }
}

function importKeyFromKeyStore(certPickerElemId)
{
    var certPickerElem = document.getElementById(certPickerElemId);

    if (certPickerElem) {
    	certPickerElem.viewSelectedCert();
    }
}

function handleCertPickerEvents(certPickerElem, originalTargetElem)
{
    dump("certpickerExample.handleCertPickerEvents():..................Start.\n");
    var certItemElemId = "keymanager.certitem.1";
    var certItemElem = document.getElementById(certItemElemId);

    var certItem2ElemId = "keymanager.certitem.2";
    var certItem2Elem = document.getElementById(certItem2ElemId);

    if (!certItemElem || !certItem2Elem) {
    	return;
    }

    var nicknameMenuElem = certPickerElem.nickNameMenu;
    if ((nicknameMenuElem.selectedIndex < 0) || (nicknameMenuElem.selectedItem == null)) {
    	certItemElem.cert = null;
	return;
    }
    if (originalTargetElem == null) {
    	certItemElem.cert = null;
	return;
    }
    if (originalTargetElem.localName == "button") {
	return;
    }


    var certRef = nicknameMenuElem.selectedItem.certRef;
    dump("certpickerExample.handleCertPickerEvents():certRef: " + certRef + "\n");

    if (certItemElem.cert == null) {
    	certItemElem.cert = certRef;
    	certItem2Elem.cert = null;
    }
    else {
    	certItemElem.cert = null;
    	certItem2Elem.cert = certRef;
    }

    dump("certpickerExample.handleCertPickerEvents():..................End.\n");
}


function disableCertPicker(buttonElem, certPickerElemId)
{
    var certPickerElem = document.getElementById(certPickerElemId);
    certPickerElem.disabled = !certPickerElem.disabled;

    if (buttonElem.label == "Disable") {
    	buttonElem.label = "Enable"
    }
    else {
    	buttonElem.label = "Disable"
    }
}

function onTokenMenuChange(tokenMenuListElem, originalTargetElem)
{
    dump("onTokenMenuChange():..................Start.\n");

    dump("selectedToken name: " + tokenMenuListElem.value + "\n");
    dump("selectedToken: " + tokenMenuListElem.token.tokenName + "\n");

    dump("onTokenMenuChange():..................End.\n");
}

function handleCertUsageChangeX(certUsageElem, certUsageMenuItemElem)
{
    dump("certpickerExample.js:handleCertUsageChangeX():..................Start.\n");

    dump("certUsageElem: " + certUsageElem.id +
    		" certUsage: " + certUsageElem.certUsage +
		" menuItem: " + certUsageMenuItemElem.value +
		"\n");

    dump("certpickerExample.js:handleCertUsageChangeX():..................End.\n");
}

function handleCertificateUsageChange(certificateUsageElem, certUsageMenuItemElem)
{
    dump("handleCertUsageChange():..................Start.\n");

    dump("certUsageElem: " + certificateUsageElem.id +
    		" certUsage: " + certificateUsageElem.certusage +
		" menuItem: " + certUsageMenuItemElem.value +
		"\n");

    dump("handleCertUsageChange():..................End.\n");
}

