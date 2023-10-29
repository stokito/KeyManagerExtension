
if ((typeof avpki) == 'undefined') {
    var avpki = {};
    avpki.keymanager = {};
}
if ((typeof avpki.keymanager) == 'undefined') {
    avpki.keymanager = {};
}

avpki.keymanager.EjbCACertEnrollOverlay = {
    mLogEnabled : false,
    log : function(msg) 
    {
        if (!avpki.keymanager.EjbCACertEnrollOverlay.mLogEnabled) {
    	    return;
        }

        dump(msg + "\n");
	if (avpki.keymanager.EjbCACertEnrollOverlay.mConsoleService) {
	    avpki.keymanager.EjbCACertEnrollOverlay.mConsoleService.logStringMessage(msg);
	}
    },

    trim : function (aStr) 
    {
	if (!aStr) {
	    return aStr;
	}
	var sInString = aStr.replace( /^\s+/g, "" ); // strip leading whitespace
	return sInString.replace( /\s+$/g, "" ); // strip trailing whitespace
    },

    getPrefType : function (prefId) 
    {
    	return avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch.getPrefType(prefId);
    },

    prefExists : function (prefId) 
    {
    	return (avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch.getPrefType(prefId) != avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch.PREF_INVALID);
    },

    getPreference : function (prefId, aDefaultVal) 
    {
	var prefValue = null;
	do {
	    try {
		var prefType = avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch.getPrefType(prefId);
		if (prefType == avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch.PREF_INVALID) {
		    break;
		}
		switch(prefType) {
		    case avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch.PREF_STRING : 
			var prefStringValue = avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch.getCharPref(prefId);
			if (prefStringValue) {
			    prefValue = prefStringValue;
			}
		    	break;
		    case avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch.PREF_BOOL : 
		        prefValue = avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch.getBoolPref(prefId);
		    	break;
		    case avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch.PREF_INT : 
		        prefValue = avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch.getIntPref(prefId);
		    	break;
		    default :
		    	break;
		}
	    	// avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.getPreference(): prefId: " + prefId + " prefValue: " + prefValue + " prefType: " + prefType + "");
	    } catch (ex) {
	    	dump("EjbCACertEnrollOverlay.getPreference(): failed for prefId: " + prefId + " - ex: " + ex);
	    }
	} while (0);
	if (!prefValue) {
	    return aDefaultVal;
	}
	return prefValue;
    },

    ejbCACertEnrollEnabled : false,

    kEjbCAEditEntryURLFile : "editendentity.jsp",
    kEjbCAViewCertURLFile : "viewcertificate.jsp",
    kMSCACertRqxtFile : "certrqxt.asp",
    kWatchedHtmlPages : [],

    handlePageLoad : function (ev)  
    {
        avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad():..........................Start.");

        // Getting document of currently selected tab
        var pageDoc = gBrowser.selectedBrowser.contentDocument;
	var pageDocWin = gBrowser.selectedBrowser.contentWindow;

	do {
            if (!avpki.keymanager.EjbCACertEnrollOverlay.ejbCACertEnrollEnabled) {
                avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handleBrowserTabSelect():..........................11.");
	        break;
	    }

	    var pageContentType = pageDoc.contentType.toLowerCase();
    	    avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad(): pageContentType: " + pageContentType);
	    if (!((pageContentType == "text/html") || (pageContentType == "text/plain"))) {
                avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad():..........................12.");
	        break;
	    }

	    var pageLocScheme = null;
	    try { 
	        pageLocScheme = pageDocWin.location.protocol;
	    } catch (ex) { }
    	    avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad(): pageLocScheme: " + pageLocScheme);
	    if (!pageLocScheme || (pageLocScheme.indexOf("http") < 0)) {
                avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad():..........................13.");
	        break;
	    }

	    var pageLocPath = null;
	    try { 
	    	pageLocPath = pageDocWin.location.pathname;
	    } catch (ex) { }
    	    avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad(): pageLocPath: " + pageLocPath);
	    if (!pageLocPath) {
                avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad():..........................14.");
	        break;
	    }
	    if ((pageLocPath.search(avpki.keymanager.EjbCACertEnrollOverlay.kEjbCAEditEntryURLFile) <= 0) &&
	    	(pageLocPath.search(avpki.keymanager.EjbCACertEnrollOverlay.kEjbCAViewCertURLFile) <= 0) &&
	    	(pageLocPath.search(avpki.keymanager.EjbCACertEnrollOverlay.kMSCACertRqxtFile) <= 0)) {
                avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad():..........................14.");
	        break;
	    }

	    // ToDo: Add 'onchange' listener to page body for adding the enroll/download/view cert buttons
	    
	    var pageBodyElem = pageDoc.getElementsByTagName("body")[0];
    	    avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad(): pageBodyElem: " + pageBodyElem);
	    if (!pageBodyElem) {
                avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad():..........................16.");
	        break;
	    }

	    if (pageLocPath.search(avpki.keymanager.EjbCACertEnrollOverlay.kEjbCAEditEntryURLFile) > 0) {
	        try {
	            avpki.keymanager.EditUserForm.initOnLoad(pageBodyElem);
	            avpki.keymanager.EditUserForm.handlePageOnLoad(pageBodyElem);
                    avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad():..........................20.");
	        } catch (ex) {
            	    dump("EjbCACertEnrollOverlay.handlePageLoad(): failed - ex: " + ex + "\n");
	    	    break;
	        }
	    }
	    if (pageLocPath.search(avpki.keymanager.EjbCACertEnrollOverlay.kEjbCAViewCertURLFile) > 0) {
	        try {
	            avpki.keymanager.ViewCertForm.initOnLoad(pageBodyElem);
	            avpki.keymanager.ViewCertForm.handlePageOnLoad(pageBodyElem);
                    avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad():..........................20.");
	        } catch (ex) {
            	    dump("EjbCACertEnrollOverlay.handlePageLoad(): failed - ex: " + ex + "\n");
	    	    break;
	        }
	    }
	    if (pageLocPath.search(avpki.keymanager.EjbCACertEnrollOverlay.kMSCACertRqxtFile) > 0) {
	        try {
	            avpki.keymanager.MSCAGenPKCS10CSR.initOnLoad(pageBodyElem);
	            // avpki.keymanager.MSCAGenPKCS10CSR.handlePageOnLoad(pageBodyElem);
		    avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad():..........................20.");
	        } catch (ex) {
            	    dump("EjbCACertEnrollOverlay.handlePageLoad(): failed - ex: " + ex + "\n");
	    	    break;
	        }
	    }
	} while (0);
        avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageLoad():..........................End.");
    },

    handlePageUnload : function (ev)  
    {
        avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageUnload():..........................Start.");

        avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handlePageUnload():..........................End.");
    },

    handleBrowserTabSelect : function (ev)  
    {
	// avpki.keymanager.EjbCACertEnrollOverlay.log("");
        avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handleBrowserTabSelect():..........................Start.");
	/*
	if (!avpki.keymanager.EjbCACertEnrollOverlay.mInitialized) {
	    avpki.keymanager.EjbCACertEnrollOverlay.initOnLoad();
            avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handleBrowserTabSelect():.....................End(0).");
	    return;
	}
	*/

        // Getting document of currently selected tab
        var pageDoc = gBrowser.selectedBrowser.contentDocument;
	var pageDocWin = gBrowser.selectedBrowser.contentWindow;

	do {
	    try {
	    if (!avpki.keymanager.EjbCACertEnrollOverlay.mInitialized) {
                avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handleBrowserTabSelect():..........................10.");
	        break;
	    }

            if (!avpki.keymanager.EjbCACertEnrollOverlay.ejbCACertEnrollEnabled) {
                avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handleBrowserTabSelect():..........................11.");
	        break;
	    }

	    avpki.keymanager.EjbCACertEnrollOverlay.handlePageLoad();

	    } catch (ex) {
            	dump("EjbCACertEnrollOverlay.handleBrowserTabSelect(): failed - ex: " + ex + "\n");
	    	break;
	    }
	} while (0);

        avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.handleBrowserTabSelect():..........................End.");
    },


    mInitialized : false,
    initOnLoad : function (ev)
    {
	var pageDocWin = gBrowser.selectedBrowser.contentWindow;
	// avpki.keymanager.EjbCACertEnrollOverlay.log("");
	avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.initOnLoad():................Start.");
    	// avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.initOnLoad(): pageDocWin.location: " + pageDocWin.location.href);


	if (avpki.keymanager.EjbCACertEnrollOverlay.mInitialized) {
	    if (avpki.keymanager.EjbCACertEnrollOverlay.ejbCACertEnrollEnabled) {
	    	avpki.keymanager.EjbCACertEnrollOverlay.handlePageLoad();
	    }
	    avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.initOnLoad():................End(1).");
	    return;
	}
	avpki.keymanager.EjbCACertEnrollOverlay.mInitialized = true;

	avpki.keymanager.EjbCACertEnrollOverlay.mPrefService = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService);
	avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch = avpki.keymanager.EjbCACertEnrollOverlay.mPrefService.getBranch("");
	avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch.QueryInterface(Components.interfaces.nsIPrefBranch2);

	var ejbCACertEnrollEnabled = avpki.keymanager.EjbCACertEnrollOverlay.getPreference("extensions.avpki.scepclient.enroll.ejbca.enabled", false);
    	avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.initOnLoad(): ejbCACertEnrollEnabled: " + ejbCACertEnrollEnabled);

	avpki.keymanager.EjbCACertEnrollOverlay.ejbCACertEnrollEnabled = ejbCACertEnrollEnabled;

	var ejbCACertEnrollLogEnabled = avpki.keymanager.EjbCACertEnrollOverlay.getPreference("extensions.avpki.scepclient.enroll.ejbca.log.enabled", false);
    	avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.initOnLoad(): ejbCACertEnrollLogEnabled: " + ejbCACertEnrollLogEnabled);
	avpki.keymanager.EjbCACertEnrollOverlay.mLogEnabled = ejbCACertEnrollLogEnabled;
	avpki.keymanager.EditUserForm.mLogEnabled = ejbCACertEnrollLogEnabled;
	avpki.keymanager.ViewCertForm.mLogEnabled = ejbCACertEnrollLogEnabled;

	if (!ejbCACertEnrollEnabled) {
	    avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.initOnLoad():................End(0).");
	    return;
	}

	/*
        var pageDoc = gBrowser.selectedBrowser.contentDocument;
	var pageBodyElem = pageDoc.getElementsByTagName("body")[0];
	avpki.keymanager.EditUserForm.initOnLoad(pageDoc);
	avpki.keymanager.EditUserForm.initOnLoad(pageBodyElem);
	*/

	avpki.keymanager.EjbCACertEnrollOverlay.handlePageLoad();

	avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.initOnLoad():................End.");
    },

    initOnUnload : function () 
    {
	// avpki.keymanager.EjbCACertEnrollOverlay.mLogEnabled = true;
	avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.initOnUnload():................Start.");
	var pageDocWin = gBrowser.selectedBrowser.contentWindow;
    	avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.initOnUnload(): pageDocWin.location: " + pageDocWin.location.href);

        var pageDoc = gBrowser.selectedBrowser.contentDocument;
	var pageBodyElem = pageDoc.getElementsByTagName("body")[0];
	if (pageBodyElem) {
	    avpki.keymanager.EditUserForm.initOnUnload(pageBodyElem);
	}

	avpki.keymanager.EjbCACertEnrollOverlay.handlePageUnload();

	avpki.keymanager.EjbCACertEnrollOverlay.mInitialized = false;

	avpki.keymanager.EjbCACertEnrollOverlay.mPrefRootBranch = null;
	avpki.keymanager.EjbCACertEnrollOverlay.mPrefService = null;

	avpki.keymanager.EjbCACertEnrollOverlay.log("EjbCACertEnrollOverlay.initOnUnload():................End.");
	avpki.keymanager.EjbCACertEnrollOverlay.log("");
	// avpki.keymanager.EjbCACertEnrollOverlay.mLogEnabled = false;
    },

    lastMethod : function ()
    {
    }
};

