/* @(#) $Id: AttrCertExtensionForm.js,v 1.9 2012/10/03 23:09:44 subrata Exp $ */

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




var gAttrCertExtensionsElem;

var AttrCertExtensionsForm = {
    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > AttrCertExtensionsForm.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    dump : function(msg)
    {
        AttrCertExtensionsForm.log(1, msg);
    },
    logError : function(msg)
    {
        AttrCertExtensionsForm.log(2, msg);
    },
    logTrace : function(msg)
    {
        AttrCertExtensionsForm.log(4, msg);
    },
    logDebug : function(msg)
    {
        AttrCertExtensionsForm.log(8, msg);
    },
    lastMethod : function () 
    {
    }
};


function AttrCertExtensionsForm_initFormXULElems()
{
    AttrCertExtensionsForm.logTrace("AttrCertExtensionsForm_initFormXULElems():................Start.");

    gAttrCertExtensionsElem = document.getElementById("attrcertext.form.extensions");

    AttrCertExtensionsForm.logTrace("AttrCertExtensionsForm_initFormXULElems():................End.");
}

function AttrCertExtensionsForm_reset()
{
    gAttrCertExtensionsElem.reset();
}

function AttrCertExtensionsForm_setReadonly(readonly)
{
    gAttrCertExtensionsElem.readonly = readonly;
}

function AttrCertExtensionsForm_toCertProps(/* nsIPersistentProperties */ aCertProps)
{
    AttrCertExtensionsForm.logTrace("AttrCertExtensionsForm_toCertProps(): ......Start.");

    gAttrCertExtensionsElem.toCertProps(aCertProps);

    // gAttrCertExtensionsElem.dumpProperties(aCertProps, "AttrCert Extensions");

    AttrCertExtensionsForm.logTrace("AttrCertExtensionsForm_toCertProps(): ......End.");
    return;
}

function AttrCertExtensionsForm_updateCertProps(/* nsIPersistentProperties */ aCertProps)
{
    AttrCertExtensionsForm.logTrace("AttrCertExtensionsForm_updateCertProps(): ......Start.");

    // gAttrCertExtensionsElem.dumpProperties(aCertProps, "AttrCertExtensionsForm_updateCertProps");

    gAttrCertExtensionsElem.updateCertProps(aCertProps);

    AttrCertExtensionsForm.logTrace("AttrCertExtensionsForm_updateCertProps(): ......End.");
    return;
}


function AttrCertExtensionsForm_updateWithAttributeCert(attributeCert)
{
    gAttrCertExtensionsElem.updateCert(attributeCert);
}

function AttrCertExtensionsForm_updateWithAttributeCertX(attributeCert)
{
    AttrCertExtensionsForm.logTrace("AttrCertExtensionsForm_updateWithAttributeCert(): attributeCert: " + attributeCert + "");

    var /* nsIPersistentProperties */ acExtensionProps = null;
    acExtensionProps = Components.classes["@mozilla.org/persistent-properties;1"]
    		.createInstance(Components.interfaces.nsIPersistentProperties);

    /* void exportExtensionsToProperties(in nsIPersistentProperties aCertProps); */
    try {
    	attributeCert.exportExtensionsToProperties(acExtensionProps);
    } catch (ex) {
    	AttrCertExtensionsForm.logError("AttrCertAttributesForm_updateWithAttributeCert(): attributeCert.exportAttributesToProperties() failed - ex: " + ex + "");
	return;
    }

    AttrCertExtensionsForm_updateCertProps(acExtensionProps);


    AttrCertExtensionsForm.logTrace("AttrCertExtensionsForm_updateWithAttributeCert():................End.");
}


