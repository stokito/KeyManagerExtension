

var gX509CertFormElem = null;
var gX509CertStdExtenionsElem = null;
var gX509CertNSExtenionsElem = null;
var gNameListElem = null;

var gX509CertPickerElem;
var gSelectedX509Cert;
var gSubjectElem;
var gSubjCertProps;

var /* alrIKeyManager */ gKeyManager;

function certextn_initWin()
{
    gX509CertFormElem = document.getElementById('keymgr.cert.csr.form');
    gX509CertPickerElem = document.getElementById('keymgr.cert.csr.form.certpicker');
    gNameListElem = document.getElementById('x509cert.extensions.std.generalnamelist');

    gX509CertPickerElem = document.getElementById('keymanager.certextns.examples.subject.certpicker');
    gSubjectElem = document.getElementById('keymanager.certextns.examples.subject');

    gKeyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
			.getService(Components.interfaces.alrIKeyManager);

    handleCertPickerChange(gX509CertPickerElem);
}

function handleCertPickerChange(aCertPickerElem, ev)
{
    dump("handleCertPickerChange():....................Start.\n");
    if (!aCertPickerElem) {
    	return;
    }

    gSelectedX509Cert = aCertPickerElem.selectedCert;
    gSubjCertProps = Components.classes["@mozilla.org/persistent-properties;1"]
			.createInstance(Components.interfaces.nsIPersistentProperties);

    if (!gSelectedX509Cert) {
    	return;
    }
    gKeyManager.exportX509CertSubjectNameToProperties(gSelectedX509Cert, gSubjCertProps);
    gSubjectElem.dumpProperties(gSubjCertProps, "gSubjCertProps");

    dump("handleCertPickerChange():....................End.\n");
}

function refreshCertSubject()
{
    dump("refreshCertSubject():....................Start.\n");

    gSubjectElem.refresh();

    dump("refreshCertSubject():....................End.\n");
}

function resetCertSubject()
{
    dump("resetCertSubject():....................Start.\n");

    gSubjectElem.reset();

    dump("resetCertSubject():....................End.\n");
}

function setSubjectReadonly()
{
    dump("setSubjectReadonly():....................Start.\n");

    var readonly = gSubjectElem.getAttribute("readonly");

    gSubjectElem.readonly = !readonly;

    dump("setSubjectReadonly():....................End.\n");
}


function mergeCertSubject()
{
    dump("mergeCertSubject():....................Start.\n");

    gSubjectElem.mergeCertProps(gSubjCertProps);

    dump("mergeCertSubject():....................End.\n");
}

function updateCertSubject()
{
    dump("updateCertSubject():....................Start.\n");

    gSubjectElem.updateCertProps(gSubjCertProps);

    dump("updateCertSubject():....................End.\n");
}

function certNickNameMenuListChanged(aCertPickerElem, ev)
{
}

function doSelfSignCert()
{
    gX509CertFormElem.initForNewSelfSignedCert();
}

function doRenewCert()
{
    var userCert = gX509CertPickerElem.selectedCert;
    if (!userCert) {
    	return;
    }
    gX509CertFormElem.initForRenewSelfSignedCert(userCert);
}

function doGeneratePKCS10CSR()
{
    var csrCert = gX509CertPickerElem.selectedCert;
    if (!csrCert) {
    	return;
    }
    gX509CertFormElem.initForPkcs10CSR(csrCert);
}


function doGenerateCASignedCert()
{
    var signerCert = gX509CertPickerElem.selectedCert;
    if (!signerCert) {
    	return;
    }
    gX509CertFormElem.initForCASignedCert(signerCert);
}

function doGenerateSignedProxyCert()
{
    var signerCert = gX509CertPickerElem.selectedCert;
    if (!signerCert) {
    	return;
    }
    gX509CertFormElem.initForSignedProxyCert(signerCert);
}

function doGenerateSignedProxyCertDialog()
{
    var signerCert = gX509CertPickerElem.selectedCert;
    if (!signerCert) {
    	return;
    }
    var params = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
    			.createInstance(Components.interfaces.nsIDialogParamBlock);

    var windowName		= "Proxy Cert Dialog";
    var pkcs10CsrInFilePath	= "/tmp/KeyManager/CSRTmp/SubrataXYZ_ZZ_EC_15_pkcs10_base64-3.csr";
    var isCSRFileBase64		= "true";
    var proxyCommonName		= "My Proxy";
    var certOutFilePath		= "/tmp/KeyManager/CertTmp/WWWWWWWW_GGGGGGGGG_x509_b64.cer";
    var isCertFileBase64	= "true";

    var argc = 0;
    params.SetString(argc, windowName); argc++;
    params.SetString(argc, pkcs10CsrInFilePath); argc++;
    params.SetString(argc, isCSRFileBase64); argc++;
    params.SetString(argc, proxyCommonName); argc++;
    params.SetString(argc, certOutFilePath); argc++;
    params.SetString(argc, isCertFileBase64); argc++;
    params.SetString(argc, signerCert.dbKey); argc++;

    var signProxyCertDialogURL = 'chrome://signcerttool/content/nextgen/signProxyCertDialogTool.xul';
    window.openDialog(signProxyCertDialogURL, "",
		    'chrome,centerscreen,resizable,modal', params);
}


function updateCertDisplay(aCertPickerElemId)
{
    dump("updateCertDisplay():....................Start.\n");

    var selectedCert = gX509CertPickerElem.selectedCert;
    if (!selectedCert) {
    	return;
    }

    gX509CertFormElem.updateCert(selectedCert);

    doDumpCertExtensions();

    dump("updateCertDisplay():....................End.\n");
}

function doDumpCertExtensions()
{
    gX509CertFormElem.doDumpCertExtensions();
}

function doResetCertExtensions()
{
    gX509CertFormElem.doResetCertExtensions();
}

function doToggleReadonly()
{
    gX509CertFormElem.doToggleReadonly();
}

function doResetNameList()
{
    gNameListElem.reset();
}

function doAddName()
{
    var typedName = "rfc822Name:mazum@avaya.com";
    var typedName2 = "dnsName:www.avaya.com";

    gNameListElem.addTypedNameItemToAltNameList(typedName);
}

function doAddNameList()
{
    var typedName1 = "rfc822Name:mazum@avaya.com";
    var typedName2 = "dnsName:www.avaya.com";

    var orderedName1 = "mazum@avaya.com - 2";
    var orderedName2 = "www.avaya.com - 3";

    var typedNameList = typedName1 + "|" + typedName2;
    var orderedNameList = orderedName1 + "|" + orderedName2;

    gNameListElem.addTypedNamesToAltNameList(typedNameList);
    dump("gNameListElem.typedvalue: " + gNameListElem.typedvalue + "\n");
    dump("gNameListElem.orderedvalue: " + gNameListElem.orderedvalue + "\n");
}
function doShowNameListControl()
{
    gNameListElem.readonly = false;
}

function doHideNameListControl()
{
    gNameListElem.readonly = true;
}

