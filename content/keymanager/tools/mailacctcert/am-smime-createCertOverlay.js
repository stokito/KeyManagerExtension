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



var AMSMIMECreateCert = {

    mFullName	: "",
    mFirstName	: "",
    mLastName	: "",
    mOrg	: "",
    mEmail	: "",
    mCertAlias	: "",
    mCertProfileType	: "",
    mCertCustomProfileData	: null,
    mCertCustomProfilFile	: null,

    mCreateSigningCertElem : null,
    mCreateEncryptionCertElem : null,

    mMaxLogLevel : 2,
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

    initOnload : function ()
    {
	this.logTrace("AMSMIMECreateCert.initOnload():................Start.");

	this.initSMIMEId();

	/*
        var baseProfileType = "digitalsig";
        if (aIsEncryptionCert) {
	    baseProfileType="dataencipherment";
        }
        else {
    	    baseProfileType="digitalsig";
        }
	*/

	this.mCreateSigningCertElem = document.getElementById("keymgr.smime.create.cert.signing");
	this.mCreateSigningCertElem.refresh();
        this.mCreateSigningCertElem.certCommonName = this.mFullName;

        this.mCreateSigningCertElem.setAttribute("profileType", "xmldoc");
        this.mCreateSigningCertElem.profileType = "xmldoc";
	var smimeSignProfileXMLData = this.getSMIMEProfileXMLData(false);
        this.mCreateSigningCertElem.profiledata = smimeSignProfileXMLData;
	this.logDebug("AMSMIMECreateCert.initOnload(): smimeSignProfileXMLData:\n" + smimeSignProfileXMLData + "");

	this.mCreateEncryptionCertElem = document.getElementById("keymgr.smime.create.cert.encryption");
	this.mCreateEncryptionCertElem.refresh();
        this.mCreateEncryptionCertElem.certCommonName = this.mFullName;

        this.mCreateEncryptionCertElem.setAttribute("profileType", "xmldoc");
        this.mCreateEncryptionCertElem.profileType = "xmldoc";
	var smimeEncProfileXMLData = this.getSMIMEProfileXMLData(true);
        this.mCreateEncryptionCertElem.profiledata = smimeEncProfileXMLData;

	// this.logDebug("AMSMIMECreateCert.initOnload(): smimeEncProfileXMLData:\n" + smimeEncProfileXMLData + "");

        this.logTrace("AMSMIMECreateCert.initOnload():................End.");
    },

    initSMIMEId : function ()
    {
        this.logTrace("AMSMIMECreateCert.initSMIMEId():................Start.");

        var fullName = "";
        var org = "";
        var email = "";

        if (gIdentity) { // gIdentity is defined in chrome://messenger/content/am-smime.js file
    	    fullName = this.trimString(gIdentity.fullName);
	    if (!fullName) {
	        fullName = "";
	    }
    	    org = this.trimString(gIdentity.organization);
	    if (!org) {
	        org = "";
	    }
    	    email = this.trimString(gIdentity.email);
	    if (!email) {
	        email = "";
	    }
        }
        certAlias = fullName;
	this.logDebug("AMSMIMECreateCert.initSMIMEId(): certAlias: " + certAlias + "");

	var firstName = "";
	var lastName = "";
	var nameItems = fullName.split(" ");

	firstName = nameItems[0];
	if (nameItems.length > 1) {
	    lastName = fullName.substring(firstName.length + 1);
	}

	this.mFirstName = firstName;
	this.mLastName = lastName;
	this.mFullName = fullName;
	this.mOrg = org;
	this.mEmail = email;
	this.mCertAlias = certAlias;
    
	this.logDebug("AMSMIMECreateCert.initSMIMEId(): this.mFirstName: " + this.mFirstName + "");
	this.logDebug("AMSMIMECreateCert.initSMIMEId(): this.mLastName: " + this.mLastName + "");
	this.logDebug("AMSMIMECreateCert.initSMIMEId(): this.mFullName: " + this.mFullName + "");
	this.logDebug("AMSMIMECreateCert.initSMIMEId(): this.mOrg: " + this.mOrg + "");
	this.logDebug("AMSMIMECreateCert.initSMIMEId(): this.mEmail: " + this.mEmail + "");
	this.logDebug("AMSMIMECreateCert.initSMIMEId(): this.mCertAlias: " + this.mCertAlias + "");

        this.logTrace("AMSMIMECreateCert.initSMIMEId():................End.");
    },
    

    trimString : function (aStr)
    {
        if (!aStr) {
    	    return aStr;
        }
        var sInString = aStr.replace( /^\s+/g, "" ); // strip leading whitespace
        return sInString.replace( /\s+$/g, "" ); // strip trailing whitespace
    },

    /* nsIFile */
    pickTempOutFile : function (fileNamePattern)
    {
    	// To create a temporary file, use nsIFile.createUnique():
    	// Source: http://kb.mozillazine.org/File_IO#Creating_temporary_files

    	var /* nsIFile*/ tmpLocalFile = null;
    	tmpLocalFile = Components.classes["@mozilla.org/file/directory_service;1"].
			getService(Components.interfaces.nsIProperties).
			get("TmpD", Components.interfaces.nsIFile);

    	if (fileNamePattern != null) {
	    var subDirItems = fileNamePattern.split("/");
	    for (var i = 0; i < subDirItems.length; i++) {
	        var subDirItem = subDirItems[i];
	        if (subDirItem == "") {
	    	    continue;
	        }
    	        tmpLocalFile.append(subDirItem);
		if ((i < (subDirItems.length -1)) && !tmpLocalFile.exists()) {
                    tmpLocalFile.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
		}
	    }
    	}
    	tmpLocalFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);

    	// this.logDebug("selected OUT TEMP File: " + tmpLocalFile.path + "");

    	return tmpLocalFile;
    },

    saveDataToFile : function (/* String */ fileData, /* nsIFile*/ outFile)
    {
        this.logTrace("AMSMIMECreateCert.saveDataToFile():..........Start.");

        if (!outFile) {
	    throw "saveDataToFile(): outFile == NULL";
        }
        if ((fileData == null) || (fileData.length <= 0)) {
    	    return;
        }
        // this.logTrace("XULFileUtil.js(): saveDataToFile():..........1.");

        // this.logDebug("XULFileUtil.js(): outFilePath:" + outFile.path + "");

        // this.logDebug("XULFileUtil.js():Writing File Data to " + outFile.path + "");

        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
		        createInstance(Components.interfaces.nsIFileOutputStream);
        foStream.QueryInterface(Components.interfaces.nsIOutputStream);
        foStream.QueryInterface(Components.interfaces.nsISeekableStream);

        foStream.init(outFile, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate

        var count = foStream.write(fileData, fileData.length);
        foStream.close();

        this.logTrace("AMSMIMECreateCert.saveDataToFile():..........End.");
    },

    saveDataToTempFile : function (/* String */ fileData, /* String*/ tmpFilePathSuffix)
    {
        this.logTrace("AMSMIMECreateCert.saveDataToTempFile():..........Start.");

        var tmpFile = this.pickTempOutFile(tmpFilePathSuffix);
        if (!tmpFile) {
            throw "Failed create temp file for profile data.";
        }
        this.saveDataToFile(fileData, tmpFile);

        this.logTrace("AMSMIMECreateCert.saveDataToTempFile():..........End.");
        return tmpFile;
    },

    getBaseProfileType : function (aIsEncryptionCert)
    {
        this.logTrace("AMSMIMECreateCert.getBaseProfileType():..........Start.");

	var createCertSignEncAlsoElem = document.getElementById("keymgr.smime.create.cert.signing.encalso");
	var createCertEncryptionSignAlsoElem = document.getElementById("keymgr.smime.create.cert.encryption.signalso");

        var baseProfileType = "sig_dataencipherment";
        if (aIsEncryptionCert) {
	    if (createCertEncryptionSignAlsoElem.checked) {
	    	baseProfileType="sig_dataencipherment";
	    }
	    else {
	    	baseProfileType="dataencipherment";
	    }
        }
        else {
	    if (createCertSignEncAlsoElem.checked) {
    	    	baseProfileType="sig_dataencipherment";
	    }
	    else {
    	    	baseProfileType="digitalsig";
	    }
        }

        this.logTrace("AMSMIMECreateCert.getBaseProfileType(): baseProfileType: " + baseProfileType);

        this.logTrace("AMSMIMECreateCert.getBaseProfileType():..........End.");
	return baseProfileType;
    },

    getSMIMEProfileXMLData : function (aIsEncryptionCert)
    {
        this.logTrace("AMSMIMECreateCert.getSMIMEProfileXMLData():..........Start.");

        if (!gIdentity) {
	    return null;
	}

	this.initSMIMEId();

	/*
        var baseProfileType = "digitalsig";
        if (aIsEncryptionCert) {
	    baseProfileType="dataencipherment";
        }
        else {
    	    baseProfileType="digitalsig";
        }
	*/
	var baseProfileType = this.getBaseProfileType(aIsEncryptionCert);

	var certCustomProfileData = 
"<CertProfile \n" +
"    baseProfileType=\"" + baseProfileType + "\"\n" + 
"    > \n" +
(			 "    <profileItem name=\"org_unit\"	value=\"" + "" + "\"/>\n") + 
(			 "    <profileItem name=\"locality\"	value=\"" + "" + "\"/>\n") + 
(			 "    <profileItem name=\"state\"	value=\"" + "" + "\"/>\n") + 
(			 "    <profileItem name=\"country\"	value=\"" + "" + "\"/>\n") + 
(			 "    <profileItem name=\"org\"		value=\"" + this.mOrg + "\"/>\n") + 
((this.mFirstName != "")?"    <profileItem name=\"firstName\"	value=\"" + this.mFirstName + "\"/>\n":"") + 
((this.mLastName != "")	?"    <profileItem name=\"lastName\"	value=\"" + this.mLastName + "\"/>\n":"") + 
((this.mFullName != "")	?"    <profileItem name=\"name\"	value=\"" + this.mFullName + "\"/>\n":"") + 
((this.mCertAlias !="")	?"    <profileItem name=\"nickName\"	value=\"" + this.mCertAlias + "\"/>\n":"")  + 
((this.mEmail !="")	?"    <profileItem name=\"rfc822Name\"	value=\"" + this.mEmail + "\"/>\n":"")  + 
"</CertProfile>\n" + 
"\n";

	this.logDebug("AMSMIMECreateCert.getSMIMEProfileXMLData(): certCustomProfileData:\n" + certCustomProfileData + "");

        this.logTrace("AMSMIMECreateCert.getSMIMEProfileXMLData():..........End.");
	return certCustomProfileData;
    },

    smimeCreateCert : function (aSmimeSelectedCertId, aIsEncryptionCert)
    {
        this.logTrace("AMSMIMECreateCert.smimeCreateCert():....................Start.");

        var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    			    .createInstance(Components.interfaces.nsIPKIParamBlock);
        var params = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
        params.SetString(0, "generateSelfSignedCert");
        pkiParams.setISupportAtIndex(1, null);

        var certProfileType = "custom";
        var tmpProfileFile = null;

	var baseProfileType = this.getBaseProfileType(aIsEncryptionCert);

        if (gIdentity) {
	    var certCustomProfileData = this.getSMIMEProfileXMLData(aIsEncryptionCert);
    	    tmpProfileFile = this.saveDataToTempFile(
    			certCustomProfileData,
			("KeyManager/MailAccount/mail_" + baseProfileType + ".xml")
			);
            if (tmpProfileFile) {
    	        certProfileType = "custom";
    	        params.SetString(2, tmpProfileFile.path);
            }
            else {
    	        certProfileType = "xmldoc";
    	        params.SetString(2, certCustomProfileData);
            }
        }
        else {
    	    certProfileType = baseProfileType;
        }
        params.SetString(1, certProfileType);

        // params.SetInt(0, 0);

        var genKeyCSRDialogURL = 'chrome://keymanager/content/tools/genkeycsr/generatePKCS10CSR.xul';
        var genKeyCSRDialog = window.openDialog(
				genKeyCSRDialogURL,
				"",
		    		'chrome,centerscreen,resizable,modal',
				params
				);

        // Remove the temporary file for cert profile data 
        if (tmpProfileFile) {
    	    tmpProfileFile.remove(false);
        }

        var retVal = params.GetInt(0);
        if (retVal == 0) {
    	    this.logError("smimeCreateCert(): failed to create self-signed cert.");
	    return;
        }

        var /* nsIX509Cert */ newX509Cert = null;
        var paramCert = pkiParams.getISupportAtIndex(1);
        if (paramCert) {
	    newX509Cert = paramCert.QueryInterface(Components.interfaces.nsIX509Cert);
        }
        else {
            var newCertNickName = params.GetString(0);
            var newCertDbKey = params.GetString(1);
            this.logDebug("AMSMIMECreateCert.smimeCreateCert(): newCertNickName: " + newCertNickName + "");
    
            var xcertdb = Components.classes["@mozilla.org/security/x509certdb;1"].
    			        getService(Components.interfaces.nsIX509CertDB);
            newX509Cert = xcertdb.findCertByDBKey(newCertDbKey , null);
        }

        var certInfoElem = document.getElementById(aSmimeSelectedCertId); 
        if (certInfoElem.value == "") {
    	    certInfoElem.value = newX509Cert.nickname;
    	    smimeSelectCert(aSmimeSelectedCertId);
        }
    
        this.logTrace("AMSMIMECreateCert.smimeCreateCert():....................End.");
    },

    smimeCreateSigningCert : function (aSmimeSelectedCertId, ev)
    {
        this.logTrace("AMSMIMECreateCert.smimeCreateSigningCert():....................Start.");

        this.smimeCreateCert(aSmimeSelectedCertId, false);
    
        this.logTrace("AMSMIMECreateCert.smimeCreateSigningCert():....................End.");
    },

    smimeCreateEncryptionCert : function (aSmimeSelectedCertId, ev)
    {
        this.logTrace("AMSMIMECreateCert.smimeCreateEncryptionCert():....................Start.");

        this.smimeCreateCert(aSmimeSelectedCertId, true);

        this.logTrace("AMSMIMECreateCert.smimeCreateEncryptionCert():....................End.");
    },
    
    handleCreateSMIMECert : function (aCreateCertElem, aSmimeSelectedCertId, ev)
    {
        this.logTrace("AMSMIMECreateCert.handleCreateSMIMECert():....................Start.");

	var newCert = aCreateCertElem.newCert;
	this.logDebug("AMSMIMECreateCert.handleCreateSMIMECert(): aCreateCertElem.newCert: " + aCreateCertElem.newCert + "");

        var certInfoElem = document.getElementById(aSmimeSelectedCertId); 
        if (newCert && (certInfoElem.value == "")) {
    	    certInfoElem.value = newCert.nickname;
    	    smimeSelectCert(aSmimeSelectedCertId);
        }

        this.logTrace("AMSMIMECreateCert.handleCreateSMIMECert():....................End.");
    },

    handleCreateSigningCertIncludeEnc : function (aCreateCertElem, aSmimeSelectedCertId, ev)
    {
        this.logTrace("AMSMIMECreateCert.handleCreateSigningCertIncludeEnc():....................Start.");

	var smimeSignProfileXMLData = this.getSMIMEProfileXMLData(false);
        this.mCreateSigningCertElem.profiledata = smimeSignProfileXMLData;

        this.logTrace("AMSMIMECreateCert.handleCreateSigningCertIncludeEnc():....................End.");
    },

    handleCreateSigningCert : function (aCreateCertElem, aSmimeSelectedCertId, ev)
    {
        this.logTrace("AMSMIMECreateCert.handleCreateSigningCert():....................Start.");

    	this.handleCreateSMIMECert(aCreateCertElem, aSmimeSelectedCertId, ev);

        this.logTrace("AMSMIMECreateCert.handleCreateSigningCert():....................End.");
    },

    handleCreateEncryptionCertIncludeSign : function (aCreateCertElem, ev)
    {
        this.logTrace("AMSMIMECreateCert.handleCreateEncryptionCertIncludeSign():....................Start.");

	var smimeEncProfileXMLData = this.getSMIMEProfileXMLData(true);
        this.mCreateEncryptionCertElem.profiledata = smimeEncProfileXMLData;

        this.logTrace("AMSMIMECreateCert.handleCreateEncryptionCertIncludeSign():....................End.");
    },

    handleCreateEncryptionCert : function (aCreateCertElem, aSmimeSelectedCertId, ev)
    {
        this.logTrace("AMSMIMECreateCert.handleCreateEncryptionCert():....................Start.");

    	this.handleCreateSMIMECert(aCreateCertElem, aSmimeSelectedCertId, ev);

        this.logTrace("AMSMIMECreateCert.handleCreateEncryptionCert():....................End.");
    },


    lastMethod: function() 
    {
    }

}

window.addEventListener(
  "load",
  function (e) {
	AMSMIMECreateCert.initOnload();
  },
  false
);

