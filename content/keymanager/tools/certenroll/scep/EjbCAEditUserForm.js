
if ((typeof avpki) == 'undefined') {
    var avpki = {};
    avpki.keymanager = {};
}
if ((typeof avpki.keymanager) == 'undefined') {
    avpki.keymanager = {};
}

avpki.keymanager.EditUserForm = {
    mLogEnabled : false,
    log : function(msg) 
    {
        if (!avpki.keymanager.EditUserForm.mLogEnabled) {
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
    	// Un-comment the 'netscape.security....'  line if you are using this function in a dowloaded html/js file.
   	// Also, set  the 'signed.applets.codebase_principal_support' preferece to true (using about:config)

   	// show the cert using Certificate dialog
   	// For more info: http://mxr.mozilla.org/mozilla-central/source/security/manager/ssl/public/nsICertificateDialogs.idl
    	var cd = Components.classes["@mozilla.org/nsCertificateDialogs;1"]
                               .getService(Components.interfaces.nsICertificateDialogs);
   	cd.viewCert(window, aX509Cert);
    },

    mPageNamedElemList : [],
    getAllNamedElements : function()
    {
	/*
	avpki.keymanager.EditUserForm.log("EditUserForm.getAllNamedElements():.....................Start.");
	avpki.keymanager.EditUserForm.log("EditUserForm.getAllNamedElements(): EditUserForm.mPageBodyElem: " + EditUserForm.mPageBodyElem);
	avpki.keymanager.EditUserForm.log("EditUserForm.getAllNamedElements(): EditUserForm.mPageNamedElemList.length: " + EditUserForm.mPageNamedElemList.length);
	*/
	if (avpki.keymanager.EditUserForm.mPageNamedElemList.length > 0) {
	    // avpki.keymanager.EditUserForm.log("EditUserForm.getAllNamedElements():.....................End(0).");
	    return avpki.keymanager.EditUserForm.mPageNamedElemList;
	}

	var namedElemList = [];
	var childElemList = avpki.keymanager.EditUserForm.mPageBodyElem.getElementsByTagName("*");
	for (var i = 0; i < childElemList.length; i++) {
	   var docElem = childElemList.item(i);
	   if (!docElem.hasAttribute("name")) {
	       continue;
	   }
	   namedElemList.push(docElem);
	}
	avpki.keymanager.EditUserForm.mPageNamedElemList = namedElemList;

	// avpki.keymanager.EditUserForm.log("EditUserForm.getAllNamedElements():.....................End.");
	return namedElemList;
    },

    getElementsByNameX : function(aItemName)
    {
	// avpki.keymanager.EditUserForm.log("EditUserForm.getElementsByName(): aItemName: " + aItemName);

	var childElemList = avpki.keymanager.EditUserForm.mPageBodyElem.getElementsByTagName("*");
	// avpki.keymanager.EditUserForm.log("EditUserForm.getElementsByName(): childElemList.length: " + childElemList.length);
	var namedElemList = [];
	for (var i = 0; i < childElemList.length; i++) {
	   var docElem = childElemList.item(i);
	   if (!docElem.hasAttribute("name")) {
	       continue;
	   }
	   var docElemName = docElem.getAttribute("name");
	   // avpki.keymanager.EditUserForm.log("EditUserForm.getElementsByName(): docElemName: " + docElemName);
	   if (docElemName == aItemName) {
	       namedElemList.push(docElem);
	   }
	}

	return namedElemList;
    },

    getElementsByName : function(aItemName)
    {
	// avpki.keymanager.EditUserForm.log("EditUserForm.getElementsByName():.....................Start.");
	// avpki.keymanager.EditUserForm.log("EditUserForm.getElementsByName(): aItemName: " + aItemName);

	var matchedNamedElemList = [];
	var namedElemList = avpki.keymanager.EditUserForm.getAllNamedElements();
	// avpki.keymanager.EditUserForm.log("EditUserForm.getElementsByName(): namedElemList.length: " + namedElemList.length);
	for (var i = 0; i < namedElemList.length; i++) {
	    var namedElem = namedElemList[i];
	    if (!namedElem.hasAttribute("name")) {
	    	continue;
	    }
	    var namedElemName = namedElem.getAttribute("name");
	    // avpki.keymanager.EditUserForm.log("EditUserForm.getElementsByName(): namedElemName: " + namedElemName);
	    if (namedElemName == aItemName) {
	    	matchedNamedElemList.push(namedElem);
	    }
	}
	// avpki.keymanager.EditUserForm.log("EditUserForm.getElementsByName():.....................End.");
	return matchedNamedElemList;
    },

    getElementByName : function(aItemName)
    {
	var namedItemElemList = avpki.keymanager.EditUserForm.getElementsByName(aItemName);
	return ((namedItemElemList.length <= 0) ? null : namedItemElemList[0]);
    },

    getNamedItemValue : function(aItemName)
    {
	// avpki.keymanager.EditUserForm.log("EditUserForm.getNamedItemValue():.....................Start.");
        var namedItemElem = avpki.keymanager.EditUserForm.getElementByName(aItemName);
	// avpki.keymanager.EditUserForm.log("EditUserForm.getNamedItemValue(): namedItemElem: " + namedItemElem);
	var namedItemValue = null;
	if (namedItemElem) {
	    namedItemValue = namedItemElem.value;
	}
	avpki.keymanager.EditUserForm.log("EditUserForm.getNamedItemValue(): aItemName: " + aItemName + " namedItemValue: " + namedItemValue);
	// avpki.keymanager.EditUserForm.log("EditUserForm.getNamedItemValue():.....................End.");
	return namedItemValue;
    },

    mScepClientPkcsReqParam : null,
    viewSignedUserCert : function ()
    {
    	if (!avpki.keymanager.EditUserForm.mScepClientPkcsReqParam.userX509CertSigned) {
	    return;
	}
	avpki.keymanager.EditUserForm.viewX509Cert(avpki.keymanager.EditUserForm.mScepClientPkcsReqParam.userX509CertSigned);
    },

    mSubjectAltNames : "",
    get subjectAltNames()  {
    	return avpki.keymanager.EditUserForm.mSubjectAltNames;
    },
    computeSubjAltNames : function () 
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.computeSubjAltNames():.....................Start.");

	var subjectAltNames = "";

	/*
	if (!checkallfields()) {
	    avpki.keymanager.EditUserForm.log("EditUserForm.computeSubjAltNames():.....................End(0).");
	    avpki.keymanager.EditUserForm.mSubjectAltNames = subjectAltNames;
	    return subjectAltNames;
	}
	*/

	var dnAltSubjName2FieldNameMap = {
	    	"rfc822Name" : "textfieldsubjectaltname1",
	    	"uri" : "textfieldsubjectaltname2",
	    	"msGUID" : "textfieldsubjectaltname3",
	    	"dnsName" : "textfieldsubjectaltname4",
	    	"directoryName" : "textfieldsubjectaltname5",
	    	"ipAddress" : "textfieldsubjectaltname6",
	    	"regID" : "",
	    	"ediPartyName" : "",
	    	"x400" : "",
		};
	var subjAltNameNVPList= {};
	var msUPN = "";
	var upnnamne0 = avpki.keymanager.EditUserForm.trim(avpki.keymanager.EditUserForm.getNamedItemValue("textfieldupnnamne0"));
	var subjectaltname0 = avpki.keymanager.EditUserForm.trim(avpki.keymanager.EditUserForm.getNamedItemValue("textfieldsubjectaltname0"));
	if (upnnamne0 && subjectaltname0) {
	    msUPN = (upnnamne0 + "@" + subjectaltname0);
	}
	avpki.keymanager.EditUserForm.log("EditUserForm.computeSubjectDN(): msUPN: " + msUPN);
	if (msUPN) {
	    subjAltNameNVPList["msUPN"] = msUPN;
	}

	for (var attrName in dnAltSubjName2FieldNameMap) {
	    var formFieldName = dnAltSubjName2FieldNameMap[attrName];
	    if (!formFieldName) {
	    	continue;
	    }
	    // avpki.keymanager.EditUserForm.log("EditUserForm.computeSubjAltNames(): dnAttrName2FieldNameMap[" + attrName +  "] : " + formFieldName);
	    var formFieldElem = avpki.keymanager.EditUserForm.getElementByName(formFieldName);
	    if (!formFieldElem) {
	    	continue;
	    }
	    var attrValue = avpki.keymanager.EditUserForm.trim(formFieldElem.value);
	    // avpki.keymanager.EditUserForm.log("EditUserForm.computeSubjAltNames(): dnAttrName2FieldNameMap[" + attrName +  "] : " + attrValue);
	    if (!attrValue) {
	    	continue;
	    }
	    subjAltNameNVPList[attrName] = attrValue;
	}

	for (var attrName in subjAltNameNVPList) {
	    var attrValue = subjAltNameNVPList[attrName];
	    if (!attrValue) {
	    	continue;
	    }
	    if (subjectAltNames) {
	    	subjectAltNames += "|";
	    }
	    subjectAltNames += attrName + ":" + attrValue;
	}
	avpki.keymanager.EditUserForm.mSubjectAltNames = subjectAltNames;
	avpki.keymanager.EditUserForm.log("EditUserForm.computeSubjAltNames(): subjectAltNames: " + subjectAltNames);

	avpki.keymanager.EditUserForm.log("EditUserForm.computeSubjAltNames():.....................End.");
	return subjectAltNames;
    },

    mSubjectDN : "",
    get subjectDN()  {
    	return avpki.keymanager.EditUserForm.mSubjectDN;
    },
    computeSubjectDN : function () 
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.computeSubjectDN():.....................Start.");

	var subjectDN = "";

	/*
	if (!checkallfields()) {
	    avpki.keymanager.EditUserForm.mSubjectDN = subjectDN;
	    return subjectDN;
	}
	*/

	var dnAttrName2FieldNameMap = {
	    	"UID" : "textfieldsubjectdn1",
	    	"CN" : "textfieldsubjectdn2",
		/*
	    	"serialNumber" : "textfieldsubjectdn3",
	    	"givenName" : "textfieldsubjectdn4",
	    	"initials" : "textfieldsubjectdn5",
	    	"surName" : "textfieldsubjectdn6",
	    	"Title" : "textfieldsubjectdn7",
		*/
	    	"OU" : "textfieldsubjectdn8",
	    	"O" : "textfieldsubjectdn9",
	    	"L" : "textfieldsubjectdn10",
	    	"ST" : "textfieldsubjectdn11",
	    	"C" : "textfieldsubjectdn13",
	    	"DC" : "textfieldsubjectdn12"
		};
	var subjDNAttrNVPList= {};

	var email = "";
	var emailElem = avpki.keymanager.EditUserForm.getElementByName("textfieldemail");
	var emailDomainElem = avpki.keymanager.EditUserForm.getElementByName("textfieldemaildomain");

	if (emailElem && emailDomainElem) {
	    /*
	    email = (avpki.keymanager.EditUserForm.trim(avpki.keymanager.EditUserForm.getNamedItemValue("textfieldemail")) +
	    		"@" +
			avpki.keymanager.EditUserForm.trim(avpki.keymanager.EditUserForm.getNamedItemValue("textfieldemaildomain"))
			);
	    */
	    email = (emailElem.value + "@" + emailDomainElem.value);
	}
	avpki.keymanager.EditUserForm.log("EditUserForm.computeSubjectDN(): email: " + email);
	var subjUseEmailElem = avpki.keymanager.EditUserForm.getElementByName("checkboxsubjectdn0");
	if (subjUseEmailElem.checked) {
	    subjDNAttrNVPList["email"] = email;
	}


	for (var attrName in dnAttrName2FieldNameMap) {
	    var formFieldName = dnAttrName2FieldNameMap[attrName];
	    if (!formFieldName) {
	    	continue;
	    }
	    // avpki.keymanager.EditUserForm.log("avpki.keymanager.EditUserForm.computeSubjectDN(): dnAttrName2FieldNameMap[" + attrName +  "] : " + formFieldName);
	    var formFieldElem = avpki.keymanager.EditUserForm.getElementByName(formFieldName);
	    if (!formFieldElem) {
	    	continue;
	    }
	    var attrValue = avpki.keymanager.EditUserForm.trim(formFieldElem.value);
	    // avpki.keymanager.EditUserForm.log("avpki.keymanager.EditUserForm.computeSubjectDN(): dnAttrName2FieldNameMap[" + attrName +  "] : " + attrValue);
	    if (!attrValue) {
	    	continue;
	    }
	    subjDNAttrNVPList[attrName] = attrValue;
	}

	var commonName = avpki.keymanager.EditUserForm.trim(avpki.keymanager.EditUserForm.getNamedItemValue("textfieldsubjectdn2"));
	if (commonName == "") {
	   var givenName = avpki.keymanager.EditUserForm.trim(avpki.keymanager.EditUserForm.getNamedItemValue("textfieldsubjectdn4"));
	   var initials = avpki.keymanager.EditUserForm.trim(avpki.keymanager.EditUserForm.getNamedItemValue("textfieldsubjectdn5"));
	   var familyName = avpki.keymanager.EditUserForm.trim(avpki.keymanager.EditUserForm.getNamedItemValue("textfieldsubjectdn6"));
	   if (givenName) {
	   	commonName += givenName; 
	   }
	   if (initials) {
		if (commonName != "") {
	   	    commonName += " "; 
		}
	   	commonName += initials; 
	   }
	   if (familyName) {
		if (commonName != "") {
	   	    commonName += " "; 
		}
	   	commonName += familyName; 
	   }
	   if (commonName) {
	    	subjDNAttrNVPList["CN"] = commonName;
	   }
	}
	avpki.keymanager.EditUserForm.log("EditUserForm.computeSubjectDN(): commonName: " + commonName);

	for (var attrName in dnAttrName2FieldNameMap) { // use the order for attrName defined in dnAttrName2FieldNameMap
	    var attrValue = subjDNAttrNVPList[attrName];
	    if (!attrValue) {
	    	continue;
	    }
	    if (subjectDN) {
	    	subjectDN += ",";
	    }
	    subjectDN += attrName.toLowerCase() + "=" + attrValue;
	}
	avpki.keymanager.EditUserForm.mSubjectDN = subjectDN;
	avpki.keymanager.EditUserForm.log("EditUserForm.computeSubjectDN(): subjectDN: " + subjectDN);

	avpki.keymanager.EditUserForm.log("EditUserForm.computeSubjectDN():.....................End.");
	return subjectDN;
    },

    handleFormChange : function(ev)
    {
	avpki.keymanager.EditUserForm.log("");
	avpki.keymanager.EditUserForm.log("EditUserForm.handleFormChange():.....................Start.");

    	var evTarget = ev.target;
	var targetTagName = evTarget.tagName.toLowerCase();

	avpki.keymanager.EditUserForm.displayCertEnrollButton();

	avpki.keymanager.EditUserForm.log("EditUserForm.handleFormChange(): targetTagName: " + targetTagName);
	if (targetTagName != "input") {
	    avpki.keymanager.EditUserForm.log("EditUserForm.handleFormChange():.....................End(0).");
	    return;
	}


	var targetInputType = evTarget.type.toLowerCase();
	avpki.keymanager.EditUserForm.log("EditUserForm.handleFormChange(): targetInputType: " + targetInputType);
	if (targetInputType == "password") {
	    return;
	}

	/*
	if (!checkallfields()) {
	    return;
	}
	*/

	var subjDNFieldModified = false;
	switch(targetInputType) {
	    case 'text' :
	    case 'checkbox' :
		subjDNFieldModified = true;
	    	break;
	    default:
		subjDNFieldModified = false;
	    	break;
	}
	if (!subjDNFieldModified) {
	    return;
	}

	if (evTarget.name.indexOf("subjectdn") >= 0) {
	    avpki.keymanager.EditUserForm.computeSubjectDN();
	}

	if (evTarget.name.indexOf("subjectaltname") >= 0) {
	    avpki.keymanager.EditUserForm.computeSubjAltNames();
	}

	avpki.keymanager.EditUserForm.log("EditUserForm.handleFormChange():.....................End.");
    },

    getCertEnrollParams : function()
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.getCertEnrollParams():.....................Start.");

    	var certEnrollParams = {};
	var subjectDN = avpki.keymanager.EditUserForm.computeSubjectDN();
	avpki.keymanager.EditUserForm.log("EditUserForm.getCertEnrollParams(): subjectDN: " + subjectDN);
	if (!subjectDN) {
	    return certEnrollParams;
	}
	certEnrollParams.subjectDN = subjectDN;

	var subjAltNames = avpki.keymanager.EditUserForm.computeSubjAltNames();
	avpki.keymanager.EditUserForm.log("EditUserForm.getCertEnrollParams(): subjAltNames: " + subjAltNames);
	if (subjAltNames) {
	    certEnrollParams.subjAltNames = subjAltNames;
	}

	var certAlias = avpki.keymanager.EditUserForm.trim(avpki.keymanager.EditUserForm.getNamedItemValue("username"));
	avpki.keymanager.EditUserForm.log("avpki.keymanager.EditUserForm.getCertEnrollParams(): certAlias: " + certAlias);
	if (certAlias) {
	    certEnrollParams.certAlias = certAlias;
	}

	var csrChallengePassword = avpki.keymanager.EditUserForm.getNamedItemValue("textfieldpassword");
	avpki.keymanager.EditUserForm.log("EditUserForm.getCertEnrollParams(): csrChallengePassword: " + csrChallengePassword);
	if (csrChallengePassword) {
	    certEnrollParams.csrChallengePassword = csrChallengePassword;
	}

    	certEnrollParams.userStatus = avpki.keymanager.EditUserForm.getNamedItemValue("selectchangestatus");

	var selectTokenElem = avpki.keymanager.EditUserForm.getElementByName("selecttoken");
	var tokenTypeId = selectTokenElem.options.selectedIndex;
	certEnrollParams.tokenType = ((tokenTypeId >= 0) ? selectTokenElem.value : ""); 

	var selectCAIdElem = avpki.keymanager.EditUserForm.getElementByName("selectca");
	var caIdIdx = selectCAIdElem.options.selectedIndex;
	certEnrollParams.caId = ((caIdIdx >= 0) ? selectCAIdElem.options[caIdIdx].firstChild.nodeValue : ""); 
	certEnrollParams.certProfile = avpki.keymanager.EditUserForm.getNamedItemValue("selectcertificateprofile"); 

	avpki.keymanager.EditUserForm.log("EditUserForm.getCertEnrollParams():.....................End.");
    	return certEnrollParams;
    },

    tmDownloadUserCertActionPath : "/ejbca/adminweb/ca/endentitycert",
    tmViewUserCertInfoActionPath : "/ejbca/adminweb/viewcertificate.jsp",
    tmSCEPServerPath : "/ejbca/publicweb/apply/scep/pkiclient.exe",

    getDownloadCertQueryParams : function ()
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.getDownloadCertQueryParams():.....................Start.");

	const paramCmdName = "cmd";
	const paramCertSerilaNoName = "certificatesn";
	const paramCertIssuerDNName = "issuer";

	const paramCmd = "nscert"; // iecert | cert | nscert

    	var userCertSerialNoElem = document.getElementById("usercertserialno");
	var paramCertSerilaNo = userCertSerialNoElem.value;

	var userCertIssuerDNElem = document.getElementById("usercertissuerdn");
	var paramCertIssuerDN = userCertIssuerDNElem.value;

	var queryParam = "" +
		paramCmdName + "=" + paramCmd + "&" +
		paramCertSerilaNoName + "=" + encodeURIComponent(paramCertSerilaNo) + "&" +
		paramCertIssuerDNName + "=" + encodeURIComponent(paramCertIssuerDN) +
		"";

	avpki.keymanager.EditUserForm.log("EditUserForm.getDownloadCertQueryParams():.....................End.");
    },

    tmUserActionResultWindowName : "resultWindow",
    downloadEndEntityCert : function ()
    {
	var pageDocWin = gBrowser.selectedBrowser.contentWindow;
        // var tmBaseURL = (window.location.protocol + "//" + window.location.host); // "https://pdev19vm2.platform.avaya.com";
        var tmBaseURL = (pageDocWin.location.protocol + "//" + pageDocWin.location.host);

    	var tmDownloadUserCertActionURL = tmBaseURL + avpki.keymanager.EditUserForm.tmDownloadUserCertActionPath;
	var downloadCertQueryParms = avpki.keymanager.EditUserForm.getDownloadCertQueryParams();
	tmDownloadUserCertActionURL += "?" + gDownloadCertQueryParm;

	window.open(tmDownloadUserCertActionURL, tmUserActionResultWindowName);
    },

    viewEndEntityCertInfo : function ()
    {
	var pageDocWin = gBrowser.selectedBrowser.contentWindow;
        // var tmBaseURL = (window.location.protocol + "//" + window.location.host); // "https://pdev19vm2.platform.avaya.com";
        var tmBaseURL = (pageDocWin.location.protocol + "//" + pageDocWin.location.host);
    	var tmViewUserCertInfoActionURL = tmBaseURL + tmViewUserCertInfoActionPath;

	var viewUserFormElem = document.getElementById("viewusercertinfo");
	viewUserFormElem.setAttribute("action", tmViewUserCertInfoActionURL);
	viewUserFormElem.setAttribute("target", tmUserActionResultWindowName);
	viewUserFormElem.submit();
    },

    initScepClientPkcsReqParam : function ()
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.initScepClientPkcsReqParam():.....................Start.");

	var pageDocWin = gBrowser.selectedBrowser.contentWindow;
        // var tmBaseURL = (window.location.protocol + "//" + window.location.host); // "https://pdev19vm2.platform.avaya.com";
        var tmBaseURL = (pageDocWin.location.protocol + "//" + pageDocWin.location.host);
	var tmSCEPServerURL = tmBaseURL + avpki.keymanager.EditUserForm.tmSCEPServerPath;

	var paramIssuerSubjectDN = "";

	var certEnrollParams = avpki.keymanager.EditUserForm.getCertEnrollParams();
	if (!certEnrollParams.subjectDN) {
	    avpki.keymanager.EditUserForm.mScepClientPkcsReqParam = {};
	    return;
	}
	var scepClientPkcsReqParam = {
			scepRecipientServerURL	: tmSCEPServerURL,
			scepRecipientIsRA	: false,
			scepMessageType		: "PKCSReq",

			scepIssuerID		: certEnrollParams.caId,
			issuerSubjectDN		: paramIssuerSubjectDN,
			issuerX509Cert		: null,

			scepRecipientSubjectDN	: null,
			scepRecipientX509Cert	: null,

			userSubjectDN		: certEnrollParams.subjectDN,
			userSubjectAltNames	: certEnrollParams.subjAltNames,
			userX509CertAlias	: certEnrollParams.certAlias,
			userChallengePW		: certEnrollParams.csrChallengePassword,
			userX509Cert		: null,
			userX509CertSigned	: null
			};
    	avpki.keymanager.EditUserForm.mScepClientPkcsReqParam = scepClientPkcsReqParam;

	avpki.keymanager.EditUserForm.log("EditUserForm.initScepClientPkcsReqParam():.....................End.");
    },


    createAndEnrollDeviceKey : function ()
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.createAndEnrollDeviceKey():..........................Start.");

	var pageDocWin = gBrowser.selectedBrowser.contentWindow;

	avpki.keymanager.EditUserForm.initScepClientPkcsReqParam();

	if (!avpki.keymanager.EditUserForm.mScepClientPkcsReqParam.userSubjectDN) {
	   alert("Couldn't format subject DN based on user data.");
	   avpki.keymanager.EditUserForm.log("EditUserForm.createAndEnrollDeviceKey():..........................End(0).");
	   return;
	}

    	var retVal = SCEPCertEnroll.runCertEnrollScepWizard(avpki.keymanager.EditUserForm.mScepClientPkcsReqParam);
	avpki.keymanager.EditUserForm.log("EditUserForm.createAndEnrollDeviceKey(): EditUserForm.mScepClientPkcsReqParam.userX509CertSigned: " + avpki.keymanager.EditUserForm.mScepClientPkcsReqParam.userX509CertSigned + "");

	if (retVal) {
	    pageDocWin.location.reload(true);
	}

	/*
	if (avpki.keymanager.EditUserForm.mScepClientPkcsReqParam.userX509CertSigned) {
	    this.mUserSignedX509CertAliasElem.value = avpki.keymanager.EditUserForm.mScepClientPkcsReqParam.userX509CertSigned.nickname;
	}

	if (!avpki.keymanager.EditUserForm.mScepClientPkcsReqParam.userX509CertSigned) {
	    this.mCreateAndEnrollKeyButtonElem.style.visibility = 'visible';
	    this.mViewSignedUserCertButtonElem.style.visibility = 'hidden';
	}
	else {
	    this.mCreateAndEnrollKeyButtonElem.style.visibility = 'hidden';
	    this.mViewSignedUserCertButtonElem.style.visibility = 'visible';
	}
	*/

	avpki.keymanager.EditUserForm.log("EditUserForm.createAndEnrollDeviceKey():..........................End.");
    },

    enrollCert : function(ev)
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.enrollCert():.....................Start.");

	avpki.keymanager.EditUserForm.createAndEnrollDeviceKey();

	// alert("enrollCert");

	avpki.keymanager.EditUserForm.log("EditUserForm.enrollCert():.....................End.");
    },

    addCertEnrollButton : function()
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.addCertEnrollButton():.....................Start.");

	var certEnrollButtonElem = avpki.keymanager.EditUserForm.getElementByName("buttonenrollcert");
	if (certEnrollButtonElem) {
	    avpki.keymanager.EditUserForm.log("EditUserForm.addCertEnrollButton():.....................End(0).");
	    return certEnrollButtonElem;
	}

	var certEnrollButtonElem = avpki.keymanager.EditUserForm.mEditUserForm.ownerDocument.createElement("input");
	certEnrollButtonElem.setAttribute("type", "button");
	certEnrollButtonElem.setAttribute("name", "buttonenrollcert");
	certEnrollButtonElem.setAttribute("value", "Enroll");


	// Insert after submit button
	var submitButtonElem = avpki.keymanager.EditUserForm.getElementByName("buttonedituser");
	var parentNode = submitButtonElem.parentNode;
	certEnrollButtonElem = parentNode.insertBefore(certEnrollButtonElem, submitButtonElem.nextSibling);
	certEnrollButtonElem.addEventListener("click", avpki.keymanager.EditUserForm.enrollCert, false);

	avpki.keymanager.EditUserForm.mPageNamedElemList = [];

	avpki.keymanager.EditUserForm.log("EditUserForm.addCertEnrollButton():.....................End.");
	return certEnrollButtonElem;
    },

    removeCertEnrollButton : function()
    {
	var enrollCertButtonElem = avpki.keymanager.EditUserForm.getElementByName("buttonenrollcert");
	if (!enrollCertButtonElem) {
	    return;
	}
	certEnrollButtonElem.removeEventListener("click", avpki.keymanager.EditUserForm.enrollCert, false);
	var parentNode = enrollCertButtonElem.parentNode;
	parentNode.removeChild(enrollCertButtonElem);

	avpki.keymanager.EditUserForm.mPageNamedElemList = [];
    },

    displayCertEnrollButton : function()
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.displayCertEnrollButton():.....................Start.");

	try {
    	var userStatus = avpki.keymanager.EditUserForm.getNamedItemValue("selectchangestatus");
	var tokenType = avpki.keymanager.EditUserForm.getNamedItemValue("selecttoken"); 
	var caId = avpki.keymanager.EditUserForm.getNamedItemValue("selectca"); 
	var certProfile = avpki.keymanager.EditUserForm.getNamedItemValue("selectcertificateprofile"); 

	avpki.keymanager.EditUserForm.log("EditUserForm.displayCertEnrollButton(): userStatus: " + userStatus + " tokenType: " + tokenType);
	avpki.keymanager.EditUserForm.log("EditUserForm.displayCertEnrollButton(): caId: " + caId + " certProfile: " + certProfile);

	var readyForCertEnroll = false;
	do {
	    switch (userStatus) {
	        case "10" : 
		    readyForCertEnroll = true;
	    	    break;
	        default:
	    	    break;
	    }
	    avpki.keymanager.EditUserForm.log("EditUserForm.displayCertEnrollButton(): userStatus: " + userStatus + " readyForCertEnroll: " + readyForCertEnroll);
	    if (!readyForCertEnroll) {
	    	break;
	    }
	    switch (tokenType) {
	        case "1" : 
		    readyForCertEnroll = (readyForCertEnroll && true);
	    	    break;
	        default:
		    readyForCertEnroll = (readyForCertEnroll && false);
	    	    break;
	    }
	    avpki.keymanager.EditUserForm.log("EditUserForm.displayCertEnrollButton(): tokenType: " + tokenType + " readyForCertEnroll: " + readyForCertEnroll);
	} while (0);


	if (readyForCertEnroll) {
	    var enrollCertButtonElem = avpki.keymanager.EditUserForm.getElementByName("buttonenrollcert");
	    avpki.keymanager.EditUserForm.log("EditUserForm.displayCertEnrollButton(): enrollCertButtonElem: " + enrollCertButtonElem);
	    if (!enrollCertButtonElem) {
	        enrollCertButtonElem = avpki.keymanager.EditUserForm.addCertEnrollButton();
	    }
	    enrollCertButtonElem.style.visibility = "visible";
	}
	else {
	    // enrollCertButtonElem.style.visibility = "hidden";
	    avpki.keymanager.EditUserForm.removeCertEnrollButton();
	}

	} catch (ex) {
	    readyForCertEnroll = false;
	    avpki.keymanager.EditUserForm.log("EditUserForm.displayCertEnrollButton(): failed - ex: " + ex);
	}

	avpki.keymanager.EditUserForm.log("EditUserForm.displayCertEnrollButton():.....................End.");
	return readyForCertEnroll;
    },

    handlePageOnLoad : function(aPageBodyElem)
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.handlePageOnLoad():.....................Start.");

	avpki.keymanager.EditUserForm.mPageBodyElem = aPageBodyElem;
	avpki.keymanager.EditUserForm.log("EditUserForm.handlePageOnLoad(): EditUserForm.mPageBodyElem: " + avpki.keymanager.EditUserForm.mPageBodyElem);

	var formElemList = aPageBodyElem.getElementsByTagName("form");
	if (formElemList.length <= 0) {
	    avpki.keymanager.EditUserForm.mEditUserForm = null;
	    avpki.keymanager.EditUserForm.log("EditUserForm.initOnLoad():.....................End(0).");
	    return;
	}
	var formElem = formElemList.item(0);
	avpki.keymanager.EditUserForm.log("EditUserForm.handlePageOnLoad(): formElem: " + formElem);
	avpki.keymanager.EditUserForm.mEditUserForm = formElem;

	if (!avpki.keymanager.EditUserForm.mEditUserForm) {
	    avpki.keymanager.EditUserForm.log("EditUserForm.handlePageOnLoad():.....................End(0).");
	    return;
	}

	var readyForCertEnroll = avpki.keymanager.EditUserForm.displayCertEnrollButton();
	/*
	if (readyForCertEnroll) {
	    var subjectDN = avpki.keymanager.EditUserForm.computeSubjectDN();
	    var subjAltNames = avpki.keymanager.EditUserForm.computeSubjAltNames();
	    avpki.keymanager.EditUserForm.initScepClientPkcsReqParam();
	}
	*/

	var hasHandleFormChange = (aPageBodyElem.getAttribute("hasHandleFormChange") == "true");
	avpki.keymanager.EditUserForm.log("EditUserForm.handlePageOnLoad(): hasHandleFormChange: " + hasHandleFormChange);
	if (!hasHandleFormChange) {
            aPageBodyElem.addEventListener('change', avpki.keymanager.EditUserForm.handleFormChange, false);
	    aPageBodyElem.setAttribute("hasHandleFormChange", "true");
	}

	avpki.keymanager.EditUserForm.log("EditUserForm.handlePageOnLoad():.....................End.");
    },

    handlePageOnUnload : function(aPageBodyElem)
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.handlePageOnUnload():.....................Start.");

	var hasHandleFormChange = (aPageBodyElem.getAttribute("hasHandleFormChange") == "true");
	avpki.keymanager.EditUserForm.log("EditUserForm.handlePageOnUnload(): hasHandleFormChange: " + hasHandleFormChange);
	if (hasHandleFormChange) {
            aPageBodyElem.removeEventListener('change', avpki.keymanager.EditUserForm.handleFormChange, false);
	}

	avpki.keymanager.EditUserForm.log("EditUserForm.handlePageOnUnload():.....................End.");
    },


    initOnLoad : function(aPageBodyElem)
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.initOnLoad():.....................Start.");

	avpki.keymanager.EditUserForm.mPageBodyElem = aPageBodyElem;

	var formElemList = aPageBodyElem.getElementsByTagName("form");
	if (formElemList.length <= 0) {
	    avpki.keymanager.EditUserForm.log("EditUserForm.initOnLoad():.....................End(0).");
	    return;
	}
	var formElem = formElemList.item(0);
	avpki.keymanager.EditUserForm.log("EditUserForm.initOnLoad(): formElem: " + formElem);
	avpki.keymanager.EditUserForm.mEditUserForm = formElem;

	avpki.keymanager.EditUserForm.log("EditUserForm.initOnLoad():.....................End.");
    },

    initOnUnload : function(aPageBodyElem)
    {
	avpki.keymanager.EditUserForm.log("EditUserForm.initOnUnload():.....................Start.");

	avpki.keymanager.EditUserForm.handlePageOnUnload(aPageBodyElem);

	avpki.keymanager.EditUserForm.mEditUserForm = null;

	avpki.keymanager.EditUserForm.log("EditUserForm.initOnUnload():.....................End.");
    },

    lastMethod : function () 
    {
    }
};


