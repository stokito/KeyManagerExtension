/* @(#) $Id: AttrCertAttributeForm.js,v 1.9 2012/10/03 23:09:44 subrata Exp $ */

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




var gAttrCertAttributesElem;
var AttrCertAttributesForm = {
    mMaxLogLevel		: 2,
    log : function(level, msg)
    {
	if (level > AttrCertAttributesForm.mMaxLogLevel) {
            return;
        }
        dump(msg + "\n");
    },

    dump : function(msg)
    {
        AttrCertAttributesForm.log(1, msg);
    },
    logError : function(msg)
    {
        AttrCertAttributesForm.log(2, msg);
    },
    logTrace : function(msg)
    {
        AttrCertAttributesForm.log(4, msg);
    },
    logDebug : function(msg)
    {
        AttrCertAttributesForm.log(8, msg);
    },
    lastMethod : function () 
    {
    }
};


function AttrCertAttributesForm_initFormXULElems()
{
    // AttrCertAttributesForm.logTrace("AttrCertAttributesForm_initFormXULElems():................Start.");

    gAttrCertAttributesElem = document.getElementById("attrcertext.form.attributes");

    // AttrCertAttributesForm.logTrace("AttrCertAttributesForm_initFormXULElems():................End.");
}

function AttrCertAttributesForm_reset()
{
    gAttrCertAttributesElem.reset();
}

function AttrCertAttributesForm_getTotalActiveAttributes()
{
    return gAttrCertAttributesElem.totalActiveAttributes;
}

function AttrCertAttributesForm_setReadonly(readonly)
{
    // AttrCertAttributesForm.logTrace("AttrCertAttributesForm_setReadonly(readonly: " + readonly + ").....Start.");

    gAttrCertAttributesElem.readonly = readonly;

    // AttrCertAttributesForm.logTrace("AttrCertAttributesForm_setReadonly(readonly: " + readonly + ").....End.");
}


function AttrCertAttributesForm_toCertProps(/* nsIPersistentProperties */ aCertProps)
{
    // AttrCertAttributesForm.logTrace("AttrCertAttributesForm_toCertProps(): ......Start.");

    gAttrCertAttributesElem.toCertProps(aCertProps);

    // gAttrCertExtensionsElem.dumpProperties(aCertProps, "AttrCert Attributes");

    // AttrCertAttributesForm.logTrace("AttrCertAttributesForm_toCertProps(): ......End.");
    return;
}

function AttrCertAttributesForm_updateCertProps(/* nsIPersistentProperties */ aCertProps)
{
    // AttrCertAttributesForm.logTrace("AttrCertAttributesForm_updateCertProps(): ......Start.");

    // gAttrCertExtensionsElem.dumpProperties(aCertProps, "AttrCertAttributesForm_updateCertProps: AttrCert Attributes\n");
    gAttrCertAttributesElem.updateCertProps(aCertProps);

    // AttrCertAttributesForm.logTrace("AttrCertAttributesForm_updateCertProps(): ......End.");
    return;
}


function AttrCertAttributesForm_updateWithAttributeCert(/* Components.interfaces.alrIAttributeCert */ attributeCert)
{
    // AttrCertAttributesForm.logTrace("AttrCertAttributesForm_updateWithAttributeCert(): attributeCert: " + attributeCert + "");

    var /* nsIPersistentProperties */ acAttributeProps = null;
    acAttributeProps = Components.classes["@mozilla.org/persistent-properties;1"]
    			.createInstance(Components.interfaces.nsIPersistentProperties);

    /* XPIDL: void alrIAttributeCert.exportAttributesToProperties(in nsIPersistentProperties aCertProps); */
    try {
    	attributeCert.exportAttributesToProperties(acAttributeProps);
    } catch (ex) {
    	AttrCertAttributesForm.logError("AttrCertAttributesForm_updateWithAttributeCert(): attributeCert.exportAttributesToProperties() failed - ex: " + ex + "");
	return;
    }
    AttrCertAttributesForm_updateCertProps(acAttributeProps);

    // AttrCertAttributesForm.logTrace("AttrCertAttributesForm_updateWithAttributeCert():................End.");
}


