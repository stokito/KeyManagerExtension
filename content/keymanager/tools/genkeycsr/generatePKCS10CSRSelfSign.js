/* @(#) $Id: generatePKCS10CSRSelfSign.js,v 1.16 2012/10/03 14:20:37 subrata Exp $ */

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



var  PKCS10CSRSelfSign = {
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
    lastMethod : function()
    {
    }
   
};

function doGenerateNewSelfSignedCert()
{
    PKCS10CSRSelfSign.logTrace("doGenerateNewSelfSignedCert(): ........Start.");


    var x509v3CertElem = document.getElementById('keymgr.cert.csr.form');
    if (!x509v3CertElem.validateParams()) {
	PKCS10CSRSelfSign.logError("generateCSRSelfSign.js:doGenerateNewSelfSignedCert(): missing fields : either alias, commonName, or subject.");
	alert("generateCSRSelfSign.js:doGenerateNewSelfSignedCert(): missing fields : either alias, commonName, or subject.");
    	return null;
    }

    var xtokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"]
    			.getService(Components.interfaces.nsIPK11TokenDB);
    var xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
                    	.getService(Components.interfaces.alrIKeyManager);

    var certProps = Components.classes["@mozilla.org/persistent-properties;1"]
			.createInstance(Components.interfaces.nsIPersistentProperties);
    if (certProps == null) {
	alert("generateCSRSelfSign.js:doGenerateNewSelfSignedCert(): generation of Self-Sign cert failed invalid form fields.");
	return null;
    }
    x509v3CertElem.toCertProps(certProps);
    // x509v3CertElem.dumpProperties(certProps, "doGenerateNewSelfSignedCert().certProps");
    PKCS10CSRSelfSign.logTrace("doGenerateNewSelfSignedCert(): .................10.");

    var alias = null;
    var subjectDN = null;
    try {
        alias = certProps.getStringProperty("nickName");
        subjectDN = certProps.getStringProperty("subject");
    } catch (ex) {}
    if ((!alias) || (!subjectDN)) {
	alert("generateCSRSelfSign.js:doGenerateNewSelfSignedCert(): generation of Self-Sign cert failed - alias/subject field is not initialized.");
	return null;
    }

    var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"]
    			.getService(Components.interfaces.nsIX509CertDB);
    var tmpUserCert = null;
    try {
    	tmpUserCert = xcertdb.findCertByNickname(null, alias);
    } catch (ex) {tmpUserCert=null;}
    if (tmpUserCert) {
	alert("generateCSRSelfSign.js:doGenerateNewSelfSignedCert(): chosen alias already exists in the certificate  database.");
	return null;
    }

    var /* nsIX509 */ newCert = null;
    try {
	newCert = xKeyManager.generateKeyAndImportSelfSignCertByForm(
				null,
				alias,
				subjectDN,
				certProps
				);
    } catch (ex) {
	alert("generateCSRSelfSign.js: generation of Self-Sign cert failed - " + ex);
	PKCS10CSRSelfSign.logError("generateCSRSelfSign.js: generation of Self-Sign cert failed - " + ex + "");
	return null;
    }

    PKCS10CSRSelfSign.logTrace("generateCSRSelfSign.js:doGenerateNewSelfSignedCert():.................End.");
    return newCert;
}

function reissueSelfCertByCert(/* nsIX509Cert */ aSelectedCert, /* boolean */ keepRefCert)
{
    PKCS10CSRSelfSign.logTrace("reissueSelfCertByCert(): ........Start.");

    var oldNickName = aSelectedCert.nickname;

    var x509v3CertElem = document.getElementById('keymgr.cert.csr.form');

    // retrieve the cert properties and extension of the selected cert
    var certProps = Components.classes["@mozilla.org/persistent-properties;1"]
			.createInstance(Components.interfaces.nsIPersistentProperties);
    if (certProps == null) {
        alert("Reissuing of Self-Signed cert for :" + oldNickName + " failed - invalid form fields.");
	return null;
    }
    x509v3CertElem.toCertProps(certProps);
    // x509v3CertElem.dumpProperties(certProps, "reissueSelfCertByCert().certProps");


    var xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
                    	.getService(Components.interfaces.alrIKeyManager);

    var newCert;
    try {
	newCert = xKeyManager.reissueSelfCert(aSelectedCert, certProps, keepRefCert);
    } catch (ex) {
        PKCS10CSRSelfSign.logError("reissueSelfCertByCert(): xKeyManager.reissueSelfCert() failed for : " + oldNickName + " - " + ex + "");
        alert("Reissuing of Self-Signed cert for :" + oldNickName + " failed - " + ex);
        return null;
    }

    alert("Reissued Self-Signed cert with nick name: " + newCert.nickname + " for " + oldNickName);
    PKCS10CSRSelfSign.logDebug("Reissued Self-Signed cert with nick name: " + newCert.nickname + " for " + oldNickName + ".");
    PKCS10CSRSelfSign.logTrace("reissueSelfCertByCert(): ........End.");

    return newCert;
}

function reissueSelfCertByDBKey(aSelectedDbKey, /* boolean */ keepRefCert)
{
    PKCS10CSRSelfSign.logTrace("reissueSelfCertByDBKey(): ........Start.");

    var x509v3CertElem = document.getElementById('keymgr.cert.csr.form');

    // retrieve the cert properties and extension of the selected cert
    var certProps = Components.classes["@mozilla.org/persistent-properties;1"]
			.createInstance(Components.interfaces.nsIPersistentProperties);
    if (certProps == null) {
        alert("Reissuing of Self-Signed cert for failed - invalid form fields.");
	return null;
    }
    x509v3CertElem.toCertProps(certProps);
    // x509v3CertElem.dumpProperties(certProps, "reissueSelfCertByDBKey().certProps");

    // TODO: Force auto-generate the serila until we implement the 
    //       form based modificaton.
    // propKey = "serial-auto"; propOldValue = certProps.setStringProperty(propKey, trueValue);

    var xKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
                    	.getService(Components.interfaces.alrIKeyManager);

    var newCert;
    try {
	newCert = xKeyManager.reissueSelfCertByDBKey(aSelectedDbKey, certProps, keepRefCert);
    } catch (ex) {
        PKCS10CSRSelfSign.logError("reissueSelfCertByDBKey(): xKeyManager.reissueSelfCert() failed - " + ex + "");
        alert("Reissuing of Self-Signed cert failed - " + ex);
        return null;
    }

    alert("Reissued Self-Signed cert with nick name: " + newCert.nickname);
    PKCS10CSRSelfSign.logDebug("Reissued Self-Signed cert with nick name: " + newCert.nickname + "");
    PKCS10CSRSelfSign.logTrace("reissueSelfCertByDBKey(): ........End.");

    return newCert;
}




function showPKCS10CSRData(pkcs10CSRData, selectedUserAlias)
{
    // PKCS10CSRSelfSign.logTrace("generateCSRSelfSign.js: showPKCS10CSRData(): .............Start.");

    // PKCS10CSRSelfSign.logDebug("generateCSRSelfSign.js: showPKCS10CSRData():pkcs10CSRData:\n" + pkcs10CSRData + "");
    // PKCS10CSRSelfSign.logDebug("generateCSRSelfSign.js: showPKCS10CSRData():selectedUserAlias:" + selectedUserAlias + "");
    
    var argc = 0;
    var dialogParams = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
    			.createInstance(Components.interfaces.nsIDialogParamBlock);
    dialogParams.SetString(argc, pkcs10CSRData); argc++;
    dialogParams.SetString(argc, selectedUserAlias); argc++;

    dialogParams.SetInt(0, argc);

    window.setCursor('wait');
    window.openDialog('chrome://keymanager/content/tools/genkeycsr/viewPKCS10CSR.xul', "",
                    			'chrome,centerscreen,resizable,modal', dialogParams);
    window.setCursor('auto');

    var retVal = dialogParams.GetInt(0);
    // PKCS10CSRSelfSign.logDebug("generateCSRSelfSign.js: showPKCS10CSRData(): retVal: " + retVal + "");

    if (retVal == 0) { // Selected Cancel or failed.
    	return 0;
    }

    // PKCS10CSRSelfSign.logTrace("generateCSRSelfSign.js: showPKCS10CSRData(): .............End.");
    return 1;
}

