/* @(#) $Id: CertUtil.js,v 1.3 2012/10/07 17:20:10 subrata Exp $ */

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

if ((typeof avpki) == 'undefined') {
    var avpki = {};
    avpki.keymanager = {};
}
if ((typeof avpki.keymanager) == 'undefined') {
    avpki.keymanager = {};
}


avpki.keymanager.CertUtil = {
/*
 *  Gloabl Variables
 */
    mPK11TokenDB : null,
    mX509CertDB : null, 

    InitCertDB : function ()
    {
	if (avpki.keymanager.CertUtil.mX509CertDB) {
    	    return;
    	}

    	try {
    	    avpki.keymanager.CertUtil.mPK11TokenDB = Components.classes["@mozilla.org/security/pk11tokendb;1"]
			.getService(Components.interfaces.nsIPK11TokenDB);
    	    avpki.keymanager.CertUtil.mX509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
			.getService(Components.interfaces.nsIX509CertDB);
	} catch (ex) {
            dump("Failed to obtain refernces to XPCOM objects - ex: " + ex + "\n");
     	}
    },

    getCertNickNameList : function (certType)
    {
        return getCertNickNameListByIssuer(certType, null, null);
    },

    getCertNickNameListByIssuer : function (certType, issuerSubjectDN, includeSelfSigned)
    {


        var certNickNameKeyMap = new Array();

        var certCntObj = new Object();
        var certNameListObj = new Object();
        avpki.keymanager.CertUtil.mX509CertDB.findCertNicknames(null, certType, certCntObj, certNameListObj);

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
            var certRef = avpki.keymanager.CertUtil.mX509CertDB.findCertByDBKey(dbKey , null);
	    if (certRef == null) {
	       continue;
	    }
	    if (certType == Components.interfaces.nsIX509Cert.USER_CERT) {
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
    
	    certNickNameKeyMap[j] = certNickNameKeyItem; j++;
        }
    
        // dump("getCertNickNameList(" + certType + "):....................End.\n");
        return certNickNameKeyMap;
    },

    getUserCertNickNameList : function ()
    {
        return getCertNickNameList(Components.interfaces.nsIX509Cert.USER_CERT);
    },

    getCaCertNickNameList : function ()
    {
        return getCertNickNameList(Components.interfaces.nsIX509Cert.CA_CERT);
    },

    loginToCertToken : function (aCert, force)
    {
        var keyTokenName = "" + aCert.tokenName;
        var /* nsIPK11Token */ token = avpki.keymanager.CertUtil.mPK11TokenDB.findTokenByName(keyTokenName);
        if (token == null) {
            return;
        }
        var forceLogin = ((force == null) ? false : force);
        token.login(forceLogin);
    },

    viewSelectedCert : function (win, cert)
    {
        if (!cert) {
    	    return false;
        }
    
        var cd = Components.classes["@mozilla.org/nsCertificateDialogs;1"].
    				    getService(Components.interfaces.nsICertificateDialogs);
        cd.viewCert(win, cert);
        return true;
    },

    viewSelectedCertByDbKey : function (win, aCertDbKey)
    {
        // dump("viewSelectedCertByDbKey():....................Start.\n");
    
        var certRef = null;
        try {
            certRef = avpki.keymanager.CertUtil.mX509CertDB.findCertByDBKey(aCertDbKey , null);
        } catch (ex) {
    	    certRef = null;
        }
        if (certRef == null) {
    	    dump("viewSelectedCertByDbKey(): mX509CertDB.findCertByDBKey() failed for " + aCertDbKey + "\n");
            return false;
        }
    
        viewSelectedCert(win, certRef);

        // dump("viewSelectedCertByDbKey():....................End.\n");
        return true;
    },

    viewSelectedCertByNickName : function (win, aCertNickName)
    {
        // dump("viewSelectedCertByNickName(" + aCertNickName + "):....................Start.\n");
    
        var certRef = null;
        try {
	    certRef = avpki.keymanager.CertUtil.mX509CertDB.findCertByNickname(null, aCertNickName);
        } catch (ex) {
    	    certRef = null;
        }
        if (certRef == null) {
    	    dump("viewSelectedCertByNickName(): avpki.keymanager.CertUtil.mX509CertDB.findCertByNickname() failed for " + aCertNickName + "\n");
            return false;
        }
        viewSelectedCert(win, certRef);
    
        // dump("viewSelectedCertByNickName(" + aCertNickName + "):....................End.\n");
        return true;
    },

    viewCert : function (cert)
    {
        viewSelectedCert(window, cert);
    },

    findCertByISNOrFingerprint : function (certType, aSerailNo, aIssuerDN, aSHA1FP, aMD5FP)
    {
	/*
        dump("findCertByISNOrFingerprint(): " +
	    		"aSerailNo: " + aSerailNo + "\n" + 
			"aIssuerDN: " + aIssuerDN + "\n" +
			"aSHA1FP: " + aSHA1FP + "\n" + 
			"aMD5FP: " + aMD5FP + "\n" +
			"");
	*/

	avpki.keymanager.CertUtil.InitCertDB();

        var certCntObj = new Object();
        var certNameListObj = new Object();
        avpki.keymanager.CertUtil.mX509CertDB.findCertNicknames(null, certType, certCntObj, certNameListObj);

        var certCnt = certCntObj.value;
        var certNameList = certNameListObj.value;

        if (certNameList.length <= 0) {
    	    return null;
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
            var certRef = avpki.keymanager.CertUtil.mX509CertDB.findCertByDBKey(dbKey , null);
	    if (certRef == null) {
	       continue;
	    }
	    // aSHA1FP, aMD5FP
	
	    if (aSHA1FP) {
	        var certSHA1FP = certRef.sha1Fingerprint;
  	        certSHA1FP = certSHA1FP.replace (/:/g, "");
	        // alert("certSHA1FP: " + certSHA1FP + " aSHA1FP: " + aSHA1FP);
	        if (certSHA1FP == aSHA1FP) {
	    	    return certRef;
	        }
	    }
    
	    if (aMD5FP) {
	        var certMD5FP = certRef.md5Fingerprint;
  	        certMD5FP = certSHA1FP.replace (/:/g, "");
	        // alert("certMD5FP: " + certMD5FP + " aMD5FP: " + aMD5FP);
	        if (certMD5FP == aMD5FP) {
	    	    return certRef;
	        }
	    }


	    if (aSerailNo && aIssuerDN) {
	        var certSerialNo = certRef.serialNumber;
  	        certSerialNo = certSerialNo.replace (/:/g, "");
	        var certIssuerDN = certRef.issuerName;
	        /*
                alert("certSerialNo: " + certSerialNo + " aSerailNo: " + aSerailNo + "\n" +
			"certIssuerDN: " + certIssuerDN +  " aIssuerDN: " + aIssuerDN
			);
	        */
                if ((certSerialNo == aSerailNo) && (certIssuerDN == aIssuerDN)) {
	            return certRef;
	        }
	    }
        }

        // dump("getCertNickNameList(" + certType + "):....................End.\n");
        return null;
    },
    
    findUserCertByISNOrFingerprint : function (aSerailNo, aIssuerDN, aSHA1FP, aMD5FP)
    {
        return avpki.keymanager.CertUtil.findCertByISNOrFingerprint(Components.interfaces.nsIX509Cert.USER_CERT, aSerailNo, aIssuerDN, aSHA1FP, aMD5FP);
    },

    findCertByISN : function (certType, aSerailNo, aIssuerDN)
    {
        avpki.keymanager.CertUtil.findCertByISNOrFingerprint(certType, aSerailNo, aIssuerDN, null, null); 
    },
    
    findUserCertByISN : function (aSerailNo, aIssuerDN)
    {
        return avpki.keymanager.CertUtil.findCertByISN(Components.interfaces.nsIX509Cert.USER_CERT, aSerailNo, aIssuerDN);
    },

    findCACertByISN : function (aSerailNo, aIssuerDN)
    {
        return avpki.keymanager.CertUtil.findCertByISN(Components.interfaces.nsIX509Cert.CA_CERT, aSerailNo, aIssuerDN);
    },

    findCertBySHA1Fingerprint : function (certType, aSHA1FP)
    {
        avpki.keymanager.CertUtil.findCertByISNOrFingerprint(certType, null, null, aSHA1FP, null); 
    },

    findUserCertBySHA1Fingerprint : function (aSHA1FP)
    {
        avpki.keymanager.CertUtil.findCertBySHA1Fingerprint(Components.interfaces.nsIX509Cert.USER_CERT, aSHA1FP); 
    },

    findCACertBySHA1Fingerprint : function (aSHA1FP)
    {
        avpki.keymanager.CertUtil.findCertBySHA1Fingerprint(Components.interfaces.nsIX509Cert.CA_CERT, aSHA1FP); 
    },

    findCertByMD5Fingerprint : function (certType, aMD5FP)
    {
        avpki.keymanager.CertUtil.findCertByISNOrFingerprint(certType, null, null, null, aMD5FP); 
    },

    findUserCertByMD5Fingerprint : function (aMD5FP)
    {
        avpki.keymanager.CertUtil.findCertByMD5Fingerprint(Components.interfaces.nsIX509Cert.USER_CERT, aMD5FP); 
    },

    findCACertByMD5Fingerprint : function (aMD5FP)
    {
        avpki.keymanager.CertUtil.findCertByMD5Fingerprint(Components.interfaces.nsIX509Cert.CA_CERT, aMD5FP); 
    },

    exportX509CertAsPKCS12 : function (aX509Cert)
    {
	avpki.keymanager.CertUtil.InitCertDB();

	if (!aX509Cert) {
	    return;
	}
	aX509Cert.QueryInterface(Components.interfaces.nsIX509Cert2);
	aX509Cert.QueryInterface(Components.interfaces.nsIX509Cert3);

	if (aX509Cert.certType != Components.interfaces.nsIX509Cert.USER_CERT) {
	    alert("Cert to be exorted does not have private key in the browsewr's cert DB.");
	    return;
	}

	const fileDialogMsg="Choose PKCS#12 File";
	const fileTypeMsg="PKCS#12 File";
	const fileTypeFilters="*.p12; *.pfx";

    	var fp = Components.classes["@mozilla.org/filepicker;1"]
			.createInstance(Components.interfaces.nsIFilePicker);
	fp.init(window, fileDialogMsg, Components.interfaces.nsIFilePicker.modeSave);
	fp.appendFilter(fileTypeMsg, fileTypeFilters);
	fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);
	var rv = fp.show();
	if ((rv == Components.interfaces.nsIFilePicker.returnOK) || (rv == Components.interfaces.nsIFilePicker.returnReplace)) {
	    var x509Certs = [aX509Cert];
	    avpki.keymanager.CertUtil.mX509CertDB.exportPKCS12File(null, fp.file, x509Certs.length, x509Certs);
	}
    },

    exportX509Cert : function (aX509Cert)
    {
	if (!aX509Cert) {
	    return;
	}
	aX509Cert.QueryInterface(Components.interfaces.nsIX509Cert2);
	aX509Cert.QueryInterface(Components.interfaces.nsIX509Cert3);

    	var isUserCert = (aX509Cert.certType != Components.interfaces.nsIX509Cert.USER_CERT);

	var isProxyUserCert = false;
	var x500Certs = [aX509Cert];
	// exportX509CertsToFile(x500Certs, isUserCert, isProxyUserCert);
    },

    lastMethod : function ()
    {
    }

};

