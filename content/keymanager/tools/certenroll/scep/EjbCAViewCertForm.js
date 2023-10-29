
if ((typeof avpki) == 'undefined') {
    var avpki = {};
    avpki.keymanager = {};
}
if ((typeof avpki.keymanager) == 'undefined') {
    avpki.keymanager = {};
}


avpki.keymanager.ViewCertForm = {
    mLogEnabled : false,
    log : function(msg) 
    {
        if (!avpki.keymanager.ViewCertForm.mLogEnabled) {
    	    return;
        }
        dump(msg + "\n");
    },

    trim : function (aStr) 
    {
	if (!aStr) {
	    return aStr;
	}
	var sInString = aStr.replace( /^\s+/g, "" ); // strip leading whitespace
	return sInString.replace( /\s+$/g, "" ); // strip trailing whitespace
    },

    viewX509Cert : function (/* nsIX509Cert */ aX509Cert)
    {
    	if (!aX509Cert) {
	    alert("null cert.");
	    return;
	}
    	// Un-comment the 'netscape.security....'  line if you are using this function in a dowloaded html/js file.
   	// Also, set  the 'signed.applets.codebase_principal_support' preferece to true (using about:config)

   	// show the cert using Certificate dialog
   	// For more info: http://mxr.mozilla.org/mozilla-central/source/security/manager/ssl/public/nsICertificateDialogs.idl
    	var cd = Components.classes["@mozilla.org/nsCertificateDialogs;1"]
                               .getService(Components.interfaces.nsICertificateDialogs);
   	cd.viewCert(window, aX509Cert);
    },

    findUserX509CertInBrowser : function(certISN)
    {
	avpki.keymanager.ViewCertForm.log("ViewCertForm.findUserX509CertInBrowser():.....................Start.");

	var userX509Cert = null;
	try {
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.findUserX509CertInBrowser(): serialNumber: " + certISN.serialNumber + " issuerSubjectDN: " + certISN.issuerSubjectDN);
	    userX509Cert = avpki.keymanager.CertUtil.findUserCertByISNOrFingerprint(
				certISN.serialNumber,
				certISN.issuerSubjectDN,
				certISN.sha1FingerPrint,
				certISN.md5FingerPrint
				);
	} catch (ex) {
	}
	avpki.keymanager.ViewCertForm.log("ViewCertForm.findUserX509CertInBrowser(): userX509Cert: " + userX509Cert);

	// avpki.keymanager.ViewCertForm.viewX509Cert(userX509Cert);

	avpki.keymanager.ViewCertForm.log("ViewCertForm.findUserX509CertInBrowser():.....................End.");
	return userX509Cert;
    },

    getViewCertFormElem : function(aPageBodyElem)
    {
    	var formElem = aPageBodyElem.getElementsByTagName("form")[0];
	return formElem;
    },

    getViewCertTableElem : function(aPageBodyElem)
    {
    	var formElem = avpki.keymanager.ViewCertForm.getViewCertTableElem(aPageBodyElem);
	if (!formElem) {
	    return null;
	}
    	var tableElem = formElem.getElementsByTagName("table")[0];
	return tableElem;
    },


    getURLQueryParams : function(aHref)
    {
	avpki.keymanager.ViewCertForm.log("ViewCertForm.getURLQueryParams():.....................Start.");
	var queryParamNVPList = {};

    	var href = aHref;

	var serachIdx = href.indexOf("?");
	if (serachIdx < 0) {
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.getURLQueryParams():.....................End(0).");
	    return queryParamNVPList;
	}
	var queryParams = href.substring((serachIdx + 1));

	var queryParamItemList = queryParams.split("&");
	if (queryParamItemList.length <= 0) {
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.getURLQueryParams():.....................End(0).");
	    return queryParamNVPList;
	}
	for (var i = 0; i < queryParamItemList.length; i++) {
	    var queryParamItem = queryParamItemList[i];
	    var queryParamName = queryParamItem;
	    var queryParamValue = "";
	    if (queryParamItem.indexOf("=") > 0) {
	    	var queryParamNVP = queryParamItem.split("=");
		queryParamName = queryParamNVP[0];
	    	var valIdx = queryParamItem.indexOf("=");
		if (valIdx) {
		    queryParamValue = queryParamItem.substring((valIdx+1))
		}
	    }
	    queryParamNVPList[queryParamName] = queryParamValue;
	}

	avpki.keymanager.ViewCertForm.log("ViewCertForm.getURLQueryParams():.....................End.");
	return queryParamNVPList;
    },

    getURLQueryParamValue : function (aURLSpec, aParamName)
    {
	var paramValue = null;
        var queryParams = avpki.keymanager.ViewCertForm.getURLQueryParams(aURLSpec);
        if (!queryParams) {
            return paramValue;
        }
        paramValue = queryParams[aParamName];
        // alert("getURLQueryParamValue(): paramValue: " + paramValue);
        return paramValue;
    },

    getDownloadCertLinkElem : function(aTableElem, aBrowserType)
    {
	var downloadCertLinkElem = null;

	avpki.keymanager.ViewCertForm.log("ViewCertForm.getDownloadCertLinkElem():.....................Start.");

    	var tableElem = aTableElem;
	if (!tableElem) {
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.getDownloadCertLinkElem():.....................End(0).");
	    return downloadCertLinkElem;
	}

	var anchorElemList = tableElem.getElementsByTagName("a"); 
	if (anchorElemList.length <= 0) {
	    return downloadCertLinkElem;
	}

	for (var i = 0; i < anchorElemList.length; i++) {
	    var anchorElem = anchorElemList.item(i);

	    var href = anchorElem.getAttribute("href");
	    if (!href) {
	    	continue;
	    }
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.getDownloadCertLinkElem(): href: " + href);
	    // href ex: adminweb/ca/endentitycert?cmd=iecert&certificatesn=3D6655D854479107&issuer=CN=default,OU=MGMT,O=AVAYA
	    var searchParamNVPList = avpki.keymanager.ViewCertForm.getURLQueryParams(href);
	    var browserType = searchParamNVPList["cmd"];
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.getDownloadCertLinkElem(): browserType: " + browserType);
	    var certSerailNum = searchParamNVPList["certificatesn"];
	    var certIssuer = searchParamNVPList["issuer"];

	    if (browserType == aBrowserType) {
	   	downloadCertLinkElem = anchorElem;
		break;
	    }
	}

	avpki.keymanager.ViewCertForm.log("ViewCertForm.getDownloadCertLinkElem():.....................End.");
	return downloadCertLinkElem;
    },

    getTableColLabelElem : function(aTableElem, aColLabel)
    {
	var tableColLabelElem = null;

	avpki.keymanager.ViewCertForm.log("ViewCertForm.getTableColLabelElem():.....................Start.");

    	var tableElem = aTableElem;
	if (!tableElem || !aColLabel) {
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.getTableColLabelElem():.....................End(0).");
	    return tableColLabelElem;
	}

	var tableTDElemList = tableElem.getElementsByTagName("td"); 
	if (tableTDElemList.length <= 0) {
	    return tableColLabelElem;
	}

	for (var i = 0; i < tableTDElemList.length; i++) {
	    var tdElem = tableTDElemList.item(i);
	    if (!tdElem.firstChild) {
	    	continue;
	    }
	    var colLabel = avpki.keymanager.ViewCertForm.trim(tdElem.firstChild.nodeValue);
	    if (colLabel == aColLabel) {
	    	tableColLabelElem = tdElem;
		break;
	    }
	}
	avpki.keymanager.ViewCertForm.log("ViewCertForm.getTableColLabelElem(): aColLabel: " + aColLabel + " tableColLabelElem: " + tableColLabelElem);

	avpki.keymanager.ViewCertForm.log("ViewCertForm.getTableColLabelElem():.....................End.");
	return tableColLabelElem;
    },

    getTableColValueElem : function(aTableElem, aColLabel)
    {
	avpki.keymanager.ViewCertForm.log("ViewCertForm.getTableColValueElem():.....................Start.");

	var tableColValueElem = null;

	var tableColLabelElem = avpki.keymanager.ViewCertForm.getTableColLabelElem(aTableElem, aColLabel);
	if (!tableColLabelElem) {
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.getTableColValueElem():.....................End(0).");
	    return tableColValueElem;
	}
	tableColValueElem = tableColLabelElem.nextElementSibling;

	avpki.keymanager.ViewCertForm.log("ViewCertForm.getTableColValueElem():.....................End.");
	return tableColValueElem;
    },

    getTableColValue : function(aTableElem, aColLabel)
    {
	var tableColValue = null;
	avpki.keymanager.ViewCertForm.log("ViewCertForm.getTableColValue():.....................Start.");

	var tableColValueElem = avpki.keymanager.ViewCertForm.getTableColValueElem(aTableElem, aColLabel);
	avpki.keymanager.ViewCertForm.log("ViewCertForm.getTableColValue(): aColLabel: " + aColLabel + " tableColValueElem: " + tableColValueElem);
	if (tableColValueElem && tableColValueElem.firstChild) {
	    tableColValue = avpki.keymanager.ViewCertForm.trim(tableColValueElem.firstChild.nodeValue);
	}
	avpki.keymanager.ViewCertForm.log("ViewCertForm.getTableColValue(): aColLabel: " + aColLabel + " tableColValue: " + tableColValue);

	avpki.keymanager.ViewCertForm.log("ViewCertForm.getTableColValue():.....................End.");
	return tableColValue;
    },

    geNSCertISNByLink : function(aTableElem, aBrowserType)
    {
	avpki.keymanager.ViewCertForm.log("ViewCertForm.geNSCertISNByLink():.....................Start.");

	var nsCertISN = {};

    	var downloadCertLinkElem = avpki.keymanager.ViewCertForm.getDownloadCertLinkElem(aTableElem, "nscert");
	if (!downloadCertLinkElem) {
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.geNSCertISNByLink():.....................End(0).");
	    return nsCertISN;
	}
	var href = downloadCertLinkElem.getAttribute("href");
	if (!href) {
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.geNSCertISNByLink():.....................End(1).");
	    return nsCertISN;
	}
	// href ex: adminweb/ca/endentitycert?cmd=iecert&certificatesn=3D6655D854479107&issuer=CN=default,OU=MGMT,O=AVAYA
	var searchParamNVPList = avpki.keymanager.ViewCertForm.getURLQueryParams(href);
	var browserType = searchParamNVPList["cmd"];
	var serialNumber = searchParamNVPList["certificatesn"];
	var issuerSubjectDN = searchParamNVPList["issuer"];

	avpki.keymanager.ViewCertForm.log("ViewCertForm.geNSCertISNByLink(): serialNumber: " + serialNumber + " issuerSubjectDN: " + issuerSubjectDN);
	
	nsCertISN.serialNumber = serialNumber;
	nsCertISN.issuerSubjectDN = issuerSubjectDN;

	avpki.keymanager.ViewCertForm.log("ViewCertForm.geNSCertISNByLink():.....................End.");
	return nsCertISN;
    },

    geNSCertISNByForm : function(aTableElem)
    {
	avpki.keymanager.ViewCertForm.log("ViewCertForm.geNSCertISNByForm():.....................Start.");

	var nsCertISN = {};


	const serialNumColLabel = "Certificate Serial Number";
	const issuerColLabel = "Issuer DN";
	const sha1FPColLabel = "Fingerprint SHA1";
	const md5FPColLabel = "Fingerprint MD5";

	if (!aTableElem) {
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.geNSCertISNByForm():.....................End(0).");
	    return nsCertISN;
	}
	var tableElem = null;
	tableElem = aTableElem;

	var serialNumber = avpki.keymanager.ViewCertForm.getTableColValue(tableElem, serialNumColLabel);
	var issuerSubjectDN = avpki.keymanager.ViewCertForm.getTableColValue(tableElem, issuerColLabel);
	var sha1FingerPrint = avpki.keymanager.ViewCertForm.getTableColValue(tableElem, sha1FPColLabel);
	var md5FingerPrint = avpki.keymanager.ViewCertForm.getTableColValue(tableElem, md5FPColLabel);
	avpki.keymanager.ViewCertForm.log("ViewCertForm.geNSCertISNByForm(): serialNumber: " + serialNumber + " issuerSubjectDN: " + issuerSubjectDN);
	avpki.keymanager.ViewCertForm.log("ViewCertForm.geNSCertISNByForm(): sha1FingerPrint: " + sha1FingerPrint + " md5FingerPrint: " + md5FingerPrint);

	nsCertISN.serialNumber = serialNumber;
	nsCertISN.issuerSubjectDN = issuerSubjectDN;
	nsCertISN.sha1FingerPrint = sha1FingerPrint;
	nsCertISN.md5FingerPrint = md5FingerPrint;

	/*
	nsCertISN.serialNumber = "0093FC4E47";
	nsCertISN.issuerSubjectDN = "UID=12345678,CN=subrata,OU=SDP,O=Avaya";
	nsCertISN.serialNumber = "009362E1D6";
	nsCertISN.issuerSubjectDN = "CN=FF31CA111,OU=CAOrgUnit11,O=CAOrg11,L=Lincroft,ST=NJ,C=US";
	*/

	nsCertISN.userX509Cert = avpki.keymanager.ViewCertForm.findUserX509CertInBrowser(nsCertISN);

	avpki.keymanager.ViewCertForm.log("ViewCertForm.geNSCertISNByForm():.....................End.");
	return nsCertISN;
    },

    tmViewUserCertInfoActionPath : "viewcertificate.jsp",

    viewUserCASignedCert : function(ev)
    {
	avpki.keymanager.ViewCertForm.log("ViewCertForm.viewUserCASignedCert():.....................Start.");

    	if (!avpki.keymanager.ViewCertForm.userX509Cert) {
	    alert("Couldn't find user cert in browser's cert-DB.");
	}
	avpki.keymanager.ViewCertForm.viewX509Cert(avpki.keymanager.ViewCertForm.userX509Cert);

	avpki.keymanager.ViewCertForm.log("ViewCertForm.viewUserCASignedCert():.....................End.");
    },

    exportUserCASignedCertAsPKCS12 : function(ev)
    {
	avpki.keymanager.ViewCertForm.log("ViewCertForm.exportUserCASignedCertAsPKCS12():.....................Start.");

    	if (!avpki.keymanager.ViewCertForm.userX509Cert) {
	    alert("Couldn't find user cert in browser's cert-DB.");
	}

	avpki.keymanager.CertUtil.exportX509CertAsPKCS12(ViewCertForm.userX509Cert);

	avpki.keymanager.ViewCertForm.log("exportUserCASignedCertAsPKCS12.viewUserCASignedCert():.....................End.");
    },

    addCertViewButton : function(aPageBodyElem)
    {
	avpki.keymanager.ViewCertForm.log("ViewCertForm.addCertViewButton():.....................Start.");

	var certOpDivElem = null;
	var viewCertButtonElem = null;
	var exportCertAsPKCS12ButtonElem = null;


	certOpDivElem = aPageBodyElem.ownerDocument.getElementById("certOpDiv");
	if (certOpDivElem) {
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.addCertViewButton():.....................End(0).");
	    return certOpDivElem;
	}

    	var viewCertTableElem = avpki.keymanager.ViewCertForm.getViewCertFormElem(aPageBodyElem);
	if (!viewCertTableElem) {
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.addCertViewButton():.....................End(1).");
	    return certOpDivElem;
	}

	// Insert after submit button
    	var downloadCertLinkElem = avpki.keymanager.ViewCertForm.getDownloadCertLinkElem(viewCertTableElem, "nscert");
	var parentNode = downloadCertLinkElem.parentNode;

	certOpDivElem = aPageBodyElem.ownerDocument.createElement("div");
	certOpDivElem.setAttribute("id", "certOpDiv");
	certOpDivElem = parentNode.appendChild(certOpDivElem);

	// certOpDivElem.appendChild(aPageBodyElem.ownerDocument.createElement("br"));
	var viewCertAnchorElem = aPageBodyElem.ownerDocument.createElement("a");
	viewCertAnchorElem.setAttribute("href", "#");
	viewCertAnchorElem.appendChild(aPageBodyElem.ownerDocument.createTextNode("View Cert in Browser"));
	viewCertAnchorElem = certOpDivElem.appendChild(viewCertAnchorElem);
	viewCertAnchorElem.addEventListener("click", function(ev) {
	    avpki.keymanager.ViewCertForm.viewUserCASignedCert(ev);
	    if (ev) {
	    	ev.stopPropagation();
	    }
	    return false;
	}, false);

	/*
	viewCertButtonElem = aPageBodyElem.ownerDocument.createElement("input");
	viewCertButtonElem.setAttribute("id", "viewcertbutton");
	viewCertButtonElem.setAttribute("name", "viewcertbutton");
	viewCertButtonElem.setAttribute("type", "button");
	viewCertButtonElem.setAttribute("value", "View Cert in Browser");
	// viewCertButtonElem.setAttribute("onclick", "avpki.keymanager.ViewCertForm.viewUserCASignedCert(event); return false;");
	viewCertButtonElem = certOpDivElem.appendChild(viewCertButtonElem);
	viewCertButtonElem.addEventListener("click", avpki.keymanager.ViewCertForm.viewUserCASignedCert, false);

	exportCertAsPKCS12ButtonElem = aPageBodyElem.ownerDocument.createElement("input");
	exportCertAsPKCS12ButtonElem.setAttribute("id", "exportcertaspkcs12button");
	exportCertAsPKCS12ButtonElem.setAttribute("name", "exportcertaspkcs12button");
	exportCertAsPKCS12ButtonElem.setAttribute("type", "button");
	exportCertAsPKCS12ButtonElem.setAttribute("value", "Export Cert as PKCS#12");
	// viewCertButtonElem.setAttribute("onclick", "avpki.keymanager.ViewCertForm.exportUserCASignedCertAsPKCS12(event); return false;");
	exportCertAsPKCS12ButtonElem = certOpDivElem.appendChild(exportCertAsPKCS12ButtonElem);
	exportCertAsPKCS12ButtonElem.addEventListener("click", avpki.keymanager.ViewCertForm.exportUserCASignedCertAsPKCS12, false);
	*/

	certOpDivElem.appendChild(aPageBodyElem.ownerDocument.createElement("br"));
	var exportPKCS12CertAnchorElem = aPageBodyElem.ownerDocument.createElement("a");
	exportPKCS12CertAnchorElem.setAttribute("href", "#");
	exportPKCS12CertAnchorElem.appendChild(aPageBodyElem.ownerDocument.createTextNode("Export Key/Cert as PKCS#12"));
	exportPKCS12CertAnchorElem = certOpDivElem.appendChild(exportPKCS12CertAnchorElem);
	exportPKCS12CertAnchorElem.addEventListener("click", function(ev) {
	    avpki.keymanager.ViewCertForm.exportUserCASignedCertAsPKCS12(ev);
	    if (ev) {
	    	ev.stopPropagation();
	    }
	    return false;
	}, false);

	avpki.keymanager.ViewCertForm.log("ViewCertForm.addCertViewButton():.....................End.");
	return certOpDivElem;
    },

    removeCertViewButton : function(aPageBodyElem)
    {
	avpki.keymanager.ViewCertForm.log("ViewCertForm.removeCertViewButton():.....................Start.");

	var certOpDivElem = aPageBodyElem.ownerDocument.getElementById("certOpDiv");
	if (!certOpDivElem) {
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.removeCertViewButton():.....................End.");
	    return;
	}
	var parentNode = certOpDivElem.parentNode;
	parentNode.removeChild(certOpDivElem);

	avpki.keymanager.ViewCertForm.log("ViewCertForm.removeCertViewButton():.....................End.");
    },

    displayCertViewButton : function(aPageBodyElem)
    {
	avpki.keymanager.ViewCertForm.log("ViewCertForm.displayCertViewButton():.....................Start.");
	var readyForCertView = false;

	var nsCertISN = avpki.keymanager.ViewCertForm.geNSCertISNByForm(aPageBodyElem);
	// nsCertISN = avpki.keymanager.ViewCertForm.geNSCertISNByLink(viewCertFormElem);
	avpki.keymanager.ViewCertForm.log("ViewCertForm.displayCertViewButton():.....................10.");
	
	var userX509Cert = null;
	do {
	    avpki.keymanager.ViewCertForm.nsCertISN = nsCertISN;
	    readyForCertView = (nsCertISN.serialNumber && nsCertISN.issuerSubjectDN);
	    if (!readyForCertView) {
	    	break;
	    }
	    userX509Cert = avpki.keymanager.ViewCertForm.findUserX509CertInBrowser(nsCertISN);
	    avpki.keymanager.ViewCertForm.log("ViewCertForm.displayCertViewButton(): userX509Cert: " + userX509Cert);
	    if (!userX509Cert) {
		readyForCertView = false;
	    	break;
	    }
	    avpki.keymanager.ViewCertForm.nsCertISN.cert = userX509Cert;
	    readyForCertView = true;
	} while (0);
	avpki.keymanager.ViewCertForm.log("ViewCertForm.displayCertViewButton(): readyForCertView: " + readyForCertView);
	
	if (readyForCertView) {
	    avpki.keymanager.ViewCertForm.addCertViewButton(aPageBodyElem);
	    avpki.keymanager.ViewCertForm.userX509Cert = userX509Cert;
	    // avpki.keymanager.ViewCertForm.viewX509Cert(avpki.keymanager.ViewCertForm.userX509Cert);
	}
	else {
	    avpki.keymanager.ViewCertForm.removeCertViewButton(aPageBodyElem);
	    avpki.keymanager.ViewCertForm.userX509Cert = null;
	}

	avpki.keymanager.ViewCertForm.log("ViewCertForm.displayCertViewButton():.....................End.");
	return readyForCertView;
    },

    handlePageOnLoad : function(aPageBodyElem)
    {
	avpki.keymanager.ViewCertForm.log("ViewCertForm.handlePageOnLoad():.....................Start.");

    	var viewCertFormElem = avpki.keymanager.ViewCertForm.getViewCertFormElem(aPageBodyElem);
    	var viewCertTableElem = avpki.keymanager.ViewCertForm.getViewCertFormElem(aPageBodyElem);
	avpki.keymanager.ViewCertForm.log("ViewCertForm.handlePageOnLoad(): viewCertFormElem: " + viewCertFormElem);
	avpki.keymanager.ViewCertForm.log("ViewCertForm.handlePageOnLoad(): viewCertTableElem: " + viewCertTableElem);

	avpki.keymanager.ViewCertForm.mViewCertForm = viewCertFormElem;


	var nsCertISN;
	// nsCertISN = avpki.keymanager.ViewCertForm.geNSCertISNByForm(viewCertFormElem);
	nsCertISN = avpki.keymanager.ViewCertForm.geNSCertISNByLink(viewCertFormElem);

	var readyForCertView = avpki.keymanager.ViewCertForm.displayCertViewButton(aPageBodyElem);

	avpki.keymanager.ViewCertForm.log("ViewCertForm.handlePageOnLoad():.....................End.");
    },

    initOnLoad : function(aPageBodyElem)
    {
	avpki.keymanager.ViewCertForm.log("");
	avpki.keymanager.ViewCertForm.log("ViewCertForm.initOnLoad():.....................Start.");
	/*
	avpki.keymanager.ViewCertForm.log("ViewCertForm.handlePageOnLoad(): aWindowElem: " + aWindowElem);
	var bodyElem = aWindowElem.document.getElementsByTagName("body")[0];
	*/
	avpki.keymanager.ViewCertForm.log("ViewCertForm.handlePageOnLoad(): aPageBodyElem: " + aPageBodyElem);
	// avpki.keymanager.ViewCertForm.handlePageOnLoad(aPageBodyElem);

	avpki.keymanager.ViewCertForm.log("ViewCertForm.initOnLoad():.....................End.");
    },

    lastMethod : function () 
    {
    }
};


