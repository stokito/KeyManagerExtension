/* @(#) $Id: certutil.js,v 1.19 2011/02/04 18:54:51 subrata Exp $ */

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


/*
// Source: http://www.mozilla.org/projects/security/components/jssec.html#privs-list
Privileges 			Targets
----------                      --------------------------------------------

UniversalBrowserRead 		Reading of sensitive browser data.
				This allows the script to pass the same origin
				check when reading from any document.

UniversalBrowserWrite		Modification of sensitive browser data.
				This allows the script to pass the same origin
				check when writing to any document.

UniversalBrowserAccess		Allows both reading and modification of privileged data
				from the browser.
				This allows the script to pass the same origin
				check for any document.

UniversalXPConnect 		Unrestricted access to browser APIs using XPConnect

UniversalPreferencesRead 	Read preferences using the navigator.preference method.

UniversalPreferencesWrite	Set preferences using the navigator.preference method.

UniversalFileRead 		Access to file:// URLs.

*/

const alrIScepPkiClient = Components.interfaces.alrIScepPkiClient;
const alrScepPkiClient = "@avaya.com/pkm/sceppkiclient;1";

const alrIKeyManager = Components.interfaces.alrIKeyManager;
const alrKeyManager = "@avaya.com/pkm/keymanager;1";

const nsIPKCS11Slot = Components.interfaces.nsIPKCS11Slot;

const nsIPKCS11Module = Components.interfaces.nsIPKCS11Module;
const nsPKCS11ModuleDB = "@mozilla.org/security/pkcs11moduledb;1";
const nsIPKCS11ModuleDB = Components.interfaces.nsIPKCS11ModuleDB;

const nsIPK11Token = Components.interfaces.nsIPK11Token;
const nsPK11TokenDB = "@mozilla.org/security/pk11tokendb;1";
const nsIPK11TokenDB = Components.interfaces.nsIPK11TokenDB;

const nsIX509Cert = Components.interfaces.nsIX509Cert;
const nsX509CertDB = "@mozilla.org/security/x509certdb;1";
const nsIX509CertDB = Components.interfaces.nsIX509CertDB;

const nsINSSCertCache = Components.interfaces.nsINSSCertCache;
const nsNSSCertCache = "@mozilla.org/security/nsscertcache;1";

const nsICertTree = Components.interfaces.nsICertTree;
const nsCertTree = "@mozilla.org/security/nsCertTree;1";

/*
 *  Gloabl Variables
 */
var /* nsPKCS11ModuleDB */ secmoddb = null;
var /* nsIPK11TokenDB */ tokendb = null;
var /* nsIX509CertDB */ certdb = null;
var /* alrIKeyManager */ keyManager = null;
var /* alrIScepClient */ scepPkiClient = null;

function InitCertDB()
{

    if (keyManager == null) {

    	tokendb = Components.classes["@mozilla.org/security/pk11tokendb;1"]
			.getService(Components.interfaces.nsIPK11TokenDB);
    	certdb = Components.classes["@mozilla.org/security/x509certdb;1"]
			.getService(Components.interfaces.nsIX509CertDB);
    	secmoddb = Components.classes["@mozilla.org/security/pkcs11moduledb;1"]
			.getService(Components.interfaces.nsIPKCS11ModuleDB);

	try {
    	    keyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
                    		.getService(Components.interfaces.alrIKeyManager);
	} catch (ex) {}
	try {
    	    scepPkiClient = Components.classes["@avaya.com/pkm/sceppkiclient;1"]
	    			.getService(Components.interfaces.alrIScepPkiClient);
	} catch (ex) {}
    }
}


function getCertNickNameListByIssuer(certType, issuerSubjectDN, includeSelfSigned)
{


    var certNickNameKeyMap = new Array();

    var certCntObj = new Object();
    var certNameListObj = new Object();
    certdb.findCertNicknames(null, certType, certCntObj, certNameListObj);

    var certCnt = certCntObj.value;
    var certNameList = certNameListObj.value;

    if (certNameList.length <= 0) {
    	return certNickNameKeyMap;
    }

    // dump("certNameList.length: " + certNameList.length + "\n");
    var j = 0;
    for (var k = 0; k < certNameList.length; k++) {
        // dump("certNameList[" + k + "]: " + certNameList[k] + "\n");

	if (certNameList[k] == null) {
	    continue;
	}
	// Each item in certNameList is in the following format :
	//   <delim-1-char><token-name><delim-1-char><nick-name><delim-1-char><db-key>
	// Extract the delimiter  character first, then use it 
	// split the indexed item into three (four) parts: 
	//   <delim>[token-name]<delim>nickname<delim>dbKey
	if (certNameList[k].length < 1) {
	   continue;
	}
        var delim = certNameList[k].substring(0, 1);

        var certNameItems = certNameList[k].split(delim);
	/*
        for (var l = 0; l < certNameItems.length; l++) {
            alert("    [" + k + "," + l +  "]: " + certNameItems[l]);
        }
	*/
        // dump("delim: " + delim + " certNameItems.length: " + certNameItems.length + "\n");
	if (certNameItems.length <= 1) {
	   continue;
	}
        var nickName = certNameItems[certNameItems.length - 2];
	if (certNameItems.length > 3) {
	    nickName = certNameItems[1] + ":" + nickName;
	}
        var dbKey = certNameItems[certNameItems.length - 1];
	if (dbKey == null) {
	   continue;
	}
	// Get the Reference to the cert using the DbKey
        var certRef = certdb.findCertByDBKey(dbKey , null);
	if (certRef == null) {
	   continue;
	}
	if (certType == nsIX509Cert.USER_CERT) {
	  if (issuerSubjectDN && (issuerSubjectDN != "") && (issuerSubjectDN != certRef.issuerName)) {
	   if (certRef.subjectName != certRef.issuerName) {
	       /*
	       dump("Discarding\n" + 
	       		"  issuerSubjectDN:   \t" + issuerSubjectDN + "\n" + 
			"  certRef.issuerName:\t" + certRef.issuerName + "\n" + 
	       		"  certRef.subjectName:\t" + certRef.subjectName + "\n"
			);
	       */
	       continue;
	   }
	   // if ((includeSelfSigned != null) && !includeSelfSigned) {
	   if (!includeSelfSigned) {
	       /*
	       dump("Discarding\n" + 
	       		"  issuerSubjectDN:   \t" + issuerSubjectDN + "\n" + 
			"  certRef.issuerName:\t" + certRef.issuerName + "\n" + 
	       		"  certRef.subjectName:\t" + certRef.subjectName + "\n"
			);
	       */
	       continue;
	   }
	  }
	  if (issuerSubjectDN == null) {
	    if (includeSelfSigned != null) {
	    	if (includeSelfSigned) {
	   	    if (certRef.subjectName != certRef.issuerName) {
		        continue;
		    }
	        }
	        else {
	   	    if (certRef.subjectName == certRef.issuerName) {
		        continue;
		    }
	        }
	    }
	  }
	}
	// var subjectName = certRef.subjectName;
        // alert("subjectName: " + certRef.subjectName);

        // dump("nickName: " + nickName + " dbKey: " + dbKey + "\n");

	var certNickNameKeyItem = new Object();
	certNickNameKeyItem.nickName	= certRef.nickname;
	certNickNameKeyItem.dbKey	= dbKey;
	certNickNameKeyItem.cert	= certRef;
	var certSubjName = certRef.subjectName;
	if (certSubjName) {
	    var menuItemTooltip = "";
            menuItemTooltip += "Subject: " + certSubjName;
            menuItemTooltip += " | " + "Issuer: " + certRef.issuerName;
            menuItemTooltip += " | " + "SN: " + certRef.serialNumber;
            menuItemTooltip += " | " + "Token: " + certRef.tokenName;
	    certNickNameKeyItem.tooltip = menuItemTooltip;
	}

	certNickNameKeyMap[j] = certNickNameKeyItem; j++;
    }

    // dump("getCertNickNameList(" + certType + "):....................End.\n");
    return certNickNameKeyMap;
}

function getCertNickNameList(certType)
{
    return getCertNickNameListByIssuer(certType, null, null);
}

function getUserCertNickNameList()
{
    return getCertNickNameList(nsIX509Cert.USER_CERT);
}

function getCaCertNickNameList()
{
    return getCertNickNameList(nsIX509Cert.CA_CERT);
}

function loginToCertToken(aCert, force)
{
    var keyTokenName = "" + aCert.tokenName;
    var /* nsIPK11Token */ token = tokendb.findTokenByName(keyTokenName);
    if (token == null) {
        return;
    }
    var forceLogin = ((force == null) ? false : force);
    token.login(forceLogin);
}

function viewSelectedCert(parent, cert)
{
    if (!cert) {
    	return false;
    }

    var cd = Components.classes["@mozilla.org/nsCertificateDialogs;1"].
    				getService(Components.interfaces.nsICertificateDialogs);
    cd.viewCert(parent, cert);
    return true;
}

function viewSelectedCertByDbKey(parent, aCertDbKey)
{
    // dump("viewSelectedCertByDbKey():....................Start.\n");

    var certRef = null;
    try {
        certRef = certdb.findCertByDBKey(aCertDbKey , null);
    } catch (ex) {
    	certRef = null;
    }
    if (certRef == null) {
    	dump("viewSelectedCertByDbKey(): certdb.findCertByDBKey() failed for " + aCertDbKey + "\n");
        return false;
    }

    viewSelectedCert(parent, certRef);

    // dump("viewSelectedCertByDbKey():....................End.\n");
    return true;
}

function viewSelectedCertByNickName(parent, aCertNickName)
{
    // dump("viewSelectedCertByNickName(" + aCertNickName + "):....................Start.\n");

    var certRef = null;
    try {
	certRef = certdb.findCertByNickname(null, aCertNickName);
    } catch (ex) {
    	certRef = null;
    }
    if (certRef == null) {
    	dump("viewSelectedCertByNickName(): certdb.findCertByNickname() failed for " + aCertNickName + "\n");
        return false;
    }
    viewSelectedCert(parent, certRef);

    // dump("viewSelectedCertByNickName(" + aCertNickName + "):....................End.\n");
    return true;
}



function checkForHardToken()
{

    var /* nsIPK11Token */ tokenDB = null;
    tokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
    			.getService(Components.interfaces.nsIPK11TokenDB);

    var foundHardToken = false;
    var tokenList = tokenDB.listTokens();
    try {
	for ( ; !tokenList.isDone(); tokenList.next()) {
	    var tokenItem = tokenList.currentItem();
	    var /* nsIPK11Token */ token = tokenItem.QueryInterface(Components.interfaces.nsIPK11Token);
	    if (token.needsLogin() || !(token.needsUserInit)) {
		if (token.isHardwareToken()) {
		    foundHardToken = true;
		    break;
		}
	    }
	}
    } catch(ex) {
    }
    return foundHardToken;
}

function isCertInHardToken(/* nsIX509Cert*/ aX509Cert)
{
    if (!aX509Cert) {
    	false;
    }
    var tokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
                            .getService(Components.interfaces.nsIPK11TokenDB);
    var /* nsIPK11Token */ token = tokenDB.findTokenByName(aX509Cert.tokenName);
    if (!token) {
    	return false;
    }
    return token.isHardwareToken();
}

