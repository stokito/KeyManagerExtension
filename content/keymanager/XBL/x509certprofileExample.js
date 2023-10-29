
var X509CertProfileExample = {

    initOnload : function ()
    {
         dump("X509CertProfile_initWin():................Start.\n");

	 var createCertElem = null;
	 createCertElem = document.getElementById("keymanager.createcert.1");
	 createCertElem.refresh();
	 createCertElem = document.getElementById("keymanager.createcert.2");
	 createCertElem.refresh();
	 createCertElem = document.getElementById("keymanager.createcert.3");
	 createCertElem.refresh();
	 createCertElem = document.getElementById("keymanager.createcert.4");
	 createCertElem.refresh();

         dump("X509CertProfile_initWin():................End.\n");
    },
    
    uninitOnUnload : function (ev)
    {
         dump("X509CertProfile_uninitWin():................Start.\n");
    },
    
    handleX509CertProfileChange : function (aCertProfileElem, targetElem)
    {
	var targetElem = null;
	if (ev) {
	    targetElem = ev.originalTarget;
	}
        dump("handleX509CertProfileChange(): aCertProfileElem.id: " + aCertProfileElem.id + " targetElem: " + targetElem + "\n");
    
        var extnProps = aCertProfileElem.extnProfileProps;
        aCertProfileElem.dumpCertProperties(extnProps, "X509CertProfile");
    },
    
    handleFilePickerChange : function (aFilePickerElem, ev)
    {
         dump("FilePicker_oncommand(): aFilePickerElem.id: " + aFilePickerElem.id + "................Start.\n");
    },
    
    handleCreateSelfSignedCertEvent: function (aCreateCertElem, ev)
    {
        dump("handleCreateSelfSignedCertEvent(): aCreateCertElem.id: " + aCreateCertElem.id + "\n");
    },
    
    handleCreateCASignedCertEvent : function (aCreateCertElem, ev)
    {
        dump("handleCreateCASignedCertEvent(): aCreateCertElem.id: " + aCreateCertElem.id + "\n");
    
        dump("handleCreateCASignedCertEvent(): aCreateCertElem.newCert: " + aCreateCertElem.newCert + "\n");
        if (aCreateCertElem.newCert) {
        	aCreateCertElem.profileType = "certificate";
        	aCreateCertElem.profilecert = aCreateCertElem.newCert;
        	aCreateCertElem.certCommonName = "XXX555XXXX";
        }
    },
    
    handleCreateSelfProxyCertEvent : function (aCreateCertElem, ev)
    {
        dump("handleCreateSelfProxyCertEvent(): aCreateCertElem.id: " + aCreateCertElem.id + "\n");
    },
    
    handleCreateOTPKCertEvent : function (aCreateCertElem, ev)
    {
        dump("handleCreateOTPKCertEvent(): aCreateCertElem.id: " + aCreateCertElem.id + "\n");
    }
    
};
