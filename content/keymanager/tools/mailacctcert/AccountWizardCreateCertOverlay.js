
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


// alert("AccountWizardCertCertOverlay.js:.......................Start.\n");
// document.addEventListener("load", AccountWizard_onLoad, false);
// alert("AccountWizardCertCertOverlay.js:.......................10.\n");

AccountWizardCreateCertOverlay_onLoad();

function AccountWizardCreateCertOverlay_onLoad(ev)
{
    // acctTypePageUnload() function re-initializes the flow of the pages in AccountWizard.
    // So, we need to insert the 'createcert' page after the intialization is complete.
    
    var accounttypePageElem = document.getElementById("accounttype");
    accounttypePageElem.setAttribute("onpageadvanced", "return (acctTypePageUnload() && initCreateCertPage());");
}


function initCreateCertPage()
{
    // alert("initCreateCert():...............Start.\n");
    //
    var wizardElem = document.getElementById("AccountWizard");

    var identityPageElem = document.getElementById("identitypage");
    var createCertPageElem = document.getElementById("ispPage16");
 
    /*
    // In case we cannot re-use the existing ispPage16, then we would create a new 
    // wizard page with id, createcert.

    var xulns = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var newWizardPageElem = document.createElementNS(xulns, "wizardpage");
    newWizardPageElem.id = "createcert";
   
    var createCertPageElem;
    if (identityPageElem.nextSibling) {
    	createCertPageElem = wizardElem.insertBefore(newWizardPageElem, identityPageElem.nextSibling);
    }
    else {
    	createCertPageElem = wizardElem.appendChild(newWizardPageElem);
    }
    createCertPageElem.pageid = "createcert";
    */

    // Insert the createcert page after identitypage.
    var identityPageNext = identityPageElem.next;
    identityPageElem.next = "createcert";
    createCertPageElem.next = identityPageNext;

    // alert("initCreateCert():...............End.\n");
}

function createCertProfileData()
{
    var fullNameElem = document.getElementById("fullName");
    var emailElem = document.getElementById("email");

    var certCommonName = fullNameElem.value;
    var nameList = certCommonName.split(" ");
    var firstName = nameList[0];
    var lastName = certCommonName.substr(firstName.length +1);
    var certAlias = nameList[0];
    var email = emailElem.value;

    // Intialize the profle data here by obtaining info 
    // from previous wizard pages or from this wizard page.

    var mailProfileBaseType = null;
    mailProfileBaseType = getPrefStringValue("extensions.avpki.mailacctcert.baseProfileType");
    if (!mailProfileBaseType) {
	mailProfileBaseType = "basicconstraints";
    }

    var baseProfileAttribute = "";
    	baseProfileAttribute += "    baseProfileType=\"" + mailProfileBaseType + "\"\n";

    if (mailProfileBaseType == "custom") {
        var mailProfileCustomFilePath = null;
    	mailProfileCustomFilePath = getPrefStringValue("extensions.avpki.mailacctcert.baseProfileFilePath");
	if (mailProfileCustomFilePath) {
    	    baseProfileAttribute += "    baseProfileFilePath=\"" + mailProfileCustomFilePath + "\"\n";
	}
    }
    else if (mailProfileBaseType == "customuri") {
        var mailProfileCustomFileURI = null;
    	mailProfileCustomFileURI = getPrefStringValue("extensions.avpki.mailacctcert.baseProfileURI");
	if (mailProfileCustomFileURI) {
    	    baseProfileAttribute += "    baseProfileURI=\"" + mailProfileCustomFileURI + "\"\n";
	}
    }

    var certProfileDataStr = 
"<CertProfile \n" + 
baseProfileAttribute + 
"    > \n" + 
"    <profileItem name=\"name\" value=\""	+ certCommonName + "\"/>\n" + 
"    <profileItem name=\"firstName\" value=\""	+ firstName + "\"/>\n" + 
"    <profileItem name=\"lastName\" value=\""	+ lastName + "\"/>\n" + 
"    <profileItem name=\"nickName\" value=\""	+ certAlias + "\"/>\n" + 
"    <profileItem name=\"rfc822Name\" value=\""	+ email + "\"/>\n" + 
"    <!--\n" + 
"    <profileItem name=\"org_unit\" value=\""	+ "Avaya Labs" + "\"/>\n" +
"    <profileItem name=\"org\" value=\""	+ "Avaya" + "\"/>\n" +
"    <profileItem name=\"locality\" value=\""	+ "Lincroft" + "\"/>\n" +
"    <profileItem name=\"state\" value=\""	+ "NJ" + "\"/>\n" +
"    <profileItem name=\"country\" value=\""	+ "US" + "\"/>\n" +
"    <profileItem name=\"email\" value=\""	+ email + "\"/>\n" + 
"    -->\n" + 
"    \n" + 
"    <!--\n" + 
"    <profileItem name=\"basicConstraints\" value=\"" + "true\"/>\n" + 
"    <profileItem name=\"basicConstraints-crit\" value=\"" + "true\"/>\n" + 
"    -->\n" + 
"</CertProfile>\n" + 
"\n";

     // Save the data to a file with aCustomProfilePath
    var customProfileFileElem = document.getElementById("keymgr.demo.wizard.csutom.profile.file");
    customProfileFileElem.saveData(certProfileDataStr);
    customProfileFileElem.refresh();
}

function createCertPageShow(aWizardPageElem, ev)
{
    var wizardElem = document.getElementById("AccountWizard");
    wizardElem.canAdvance = false;

    var customProfileFileElem = document.getElementById("keymgr.demo.wizard.csutom.profile.file");
    // var customProfilePath =  "/tmp/KeyManager/CustomProfilePath.xml";
    var customProfileFile = customProfileFileElem.autoSelectTempFile("KeyManager/demo", "CustomMailCertProfile.xml");
    createCertProfileData();
    var customProfilePath = customProfileFileElem.filepath;
 
    // Set the custom profile with profile file path 
    var pkcs10CsrFormElem = document.getElementById("keymgr.demo.wizard.csr.form");
    // pkcs10CsrFormElem.setAttribute("profile", "custom");
    pkcs10CsrFormElem.setAttribute("customprofilepath", customProfilePath);
    pkcs10CsrFormElem.initForNewSelfSignedCert();
   
    return true;
}

function doGenerateSelfSignedCert()
{
    dump("doGenerateSelfSignedCert():...............Start.\n");

    var aCertProps = Components.classes["@mozilla.org/persistent-properties;1"].
	                createInstance(Components.interfaces.nsIPersistentProperties);
    if (aCertProps == null) {
	alert("generateSelfSignedCert(): generation of Self-Sign cert failed - invalid form fields.\n");
	return null;
    }

    var pkcs10CsrFormElem = document.getElementById("keymgr.demo.wizard.csr.form");
    pkcs10CsrFormElem.toCertProps(aCertProps);
    pkcs10CsrFormElem.dumpProperties(aCertProps, "GenerateNewSelfSignedCert");

    // Make sure that alias and subjectDN is present 
    var alias = null;
    var subjectDN = null;
    try {
	alias = aCertProps.getStringProperty("nickName");
	subjectDN = aCertProps.getStringProperty("subject");
    } catch (ex) {}
    if ((!alias) || (!subjectDN)) {
	alert("generateSelfSignedCert(): generation of Self-Sign cert failed - alias/subject field is not initialized.\n");
	return null;
    }

    // Obtain the reference to KeyManager object
    var gKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"].
                    getService(Components.interfaces.alrIKeyManager);

    // Create the Self-signed Cert 
    var /* nsIX509Cert */ newX509Cert = null;
    var /* nsIPK11Token */ selectedToken = null;
    try {
	newX509Cert = gKeyManager.generateKeyAndImportSelfSignCertByForm(
	                        selectedToken,
	                        alias,
	                        subjectDN,
	                        aCertProps
	                        );
    } catch (ex) {
	alert("generateSelfSignedCert(): generation of Self-Sign cert failed - " + ex);
	return null;
    }



    var signedCertItemElem = document.getElementById("keymgr.cert.csr.form.selfsigned.cert");
    signedCertItemElem.cert = newX509Cert;

    var genCertButtonElem = document.getElementById("keymgr.cert.csr.form.cmd.SelfSignCertButton");
    var genCSRButtonElem = document.getElementById("keymgr.cert.csr.form.cmd.PKCS10Button");
    var scepClienrButtonElem = document.getElementById("keymgr.cert.csr.form.cmd.ScepClientButton");

    genCertButtonElem.disabled = true;
    genCSRButtonElem.disabled = false;
    scepClienrButtonElem.disabled = false;

    var wizardElem = document.getElementById("AccountWizard");
    wizardElem.canAdvance = true;

    alert("doGenerateSelfSignedCert(): Created New X.509 Cert: " + newX509Cert.nickname + "\n");

    dump("doGenerateSelfSignedCert():...............End.\n");
    return newX509Cert; 
}

function doGeneratePKCS10CSR()
{
}

function doGenerateScepCSR()
{
}

function createCertPageUnload(aWizardPageElem, ev)
{
    dump("createCertPageUnload():...............Start.\n");

    dump("createCertPageUnload():...............End.\n");
    return true;
}

