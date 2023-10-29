
function runKeyManager()
{
    keymanagerOverlay_loginToInternalKeyToken();

    dump("keymanagerOverlay.xul:runKeyManager(): userAgent: " + navigator.userAgent +"\n");

    // PSM is different for FF3 and FF2, so we are using different files 
    // in a single XPI package.
    var keyManagerURL = "chrome://keymanager/content/keyManagerFF3.xul";
    /*
    if (!(navigator.userAgent.match("rv:1.9"))) {
    	keyManagerURL = "chrome://keymanager/content/keyManager.xul";
    }
    */

    // getWindowMediator() is defined in keymanagerOverlay.xul which is container for this overlay.
    //check for an existing KeyManger window and focus it; it's not application modal
    var kWindowMediator = getWindowMediator();
    var lastKeyManager = kWindowMediator.getMostRecentWindow("avaya:keymanager");
    if (lastKeyManager) {
        lastKeyManager.focus();
    }
    else {
        window.open(keyManagerURL,  "keymgr",
                'chrome,centerscreen,resizable=yes,dialog=no,titlebar');
    	// window.openDialog(keyManagerURL, '_blank', 'chrome,centerscreen,resizable,dialog=no,titlebar');
    }

}

function getTestDialogParams ()
{
    var dialogCmd		= "browser"; //  [new | file | browser]
    var osslAppType		= "globus"; // [custom | globus | openssl | curl]
    var keyStoreBaseDirPath	= "/tmp/KeyManager/OSSL_APP/quasar"
    var keyStoreType		= "PKCS12"; // [PRIVATE_KEY | PKCS12 | ENGINE]
    var osslCredentialType 	= "host"; // [user|host|service|proxy|...]
    var certNickName		= "DocSIgner2";
    var certToBeExported	= null; 
    var profileId		= "ZZZZZZ";
    // var profileId		= certNickName;

    if (profileId && (profileId != "")) {
    	var certdb = Components.classes["@mozilla.org/security/x509certdb;1"]
    			.getService(Components.interfaces.nsIX509CertDB);
        try {
	    certToBeExported = certdb.findCertByNickname(null, certNickName);
    	} catch (ex) {
            dump("OSSLKeyConfigurator.testInitWithDialogParams(): failed to find cert: " + profileId + " - ex: " + ex + "\n");
	}
    }

    var pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
    			.createInstance(Components.interfaces.nsIPKIParamBlock);
    var dialogParams = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

    pkiParams.setISupportAtIndex(1, null);
    if (certToBeExported) {
	pkiParams.setISupportAtIndex(1, certToBeExported);
    }

    dialogParams.SetString(0, dialogCmd);
    if (osslAppType && (osslAppType != "")) {
    	dialogParams.SetString(1, osslAppType);
    }
    if (keyStoreBaseDirPath && (keyStoreBaseDirPath != "")) {
    	dialogParams.SetString(2, keyStoreBaseDirPath);
    }
    if (profileId && (profileId != "")) {
    	dialogParams.SetString(3, profileId);
    }
    if (keyStoreType && (keyStoreType != "")) {
    	dialogParams.SetString(4, keyStoreType);
    }
    if (osslCredentialType && (osslCredentialType != "")) {
    	dialogParams.SetString(5, osslCredentialType);
    }
    return  dialogParams;
}


var tabTypesForTB = {
 /**
   * A tab to show the "usage " page to the user.
   * Based on : http://mxr.mozilla.org/comm-central/source/mail/base/content/specialTabs.js
   */
  kmUsageTabType : {
    kmUsagePageURL : null,
    name: "kmUsage",
    XperTabPanel: "browser",
    perTabPanel: function (aTab) 
    {
        var tabPanel = document.createElementNS(
	                "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
			"browser"
			);
      	tabPanel.setAttribute("type", "content-primary");
      	tabPanel.setAttribute("disablehistory", "true");
	return tabPanel;
    },
    modes: {
      kmUsage : {
        type: "kmUsage",
        maxTabs: 1
      }
    },
    openTab: function onTabOpened (aTab) {
      if (!this.kmUsagePageURL) {
      let startpage =
        Components.classes["@mozilla.org/toolkit/URLFormatterService;1"]
                  .getService(Components.interfaces.nsIURLFormatter)
                  .formatURLPref("keymgr.usagepage.url");
      	this.kmUsagePageURL = startpage;
      }
      // aTab.panel.setAttribute("type", "content-primary");
      // aTab.panel.setAttribute("disablehistory", "true");
      aTab.panel.setAttribute("src", this.kmUsagePageURL);

      // let msgBundle = document.getElementById("bundle_messenger");
      // aTab.title = msgBundle.getString("whatsNew");
      aTab.title = "Mozilla/Firefox Add-on for Key Generation, Certificate Enrollment, CRL Signing and Identity and Authority Delegation";
    },
    closeTab: function onTabClosed (aTab) {
    },
    saveTabState: function onSaveTabState (aTab) {
    },
    showTab: function onShowTab (aTab) {
    }
  },
}


function displayKMUsageDocument()
{
    var kmUsageDocumentURL = "chrome://keymanager/content/firstrun/keymanagerInfo.html";

    var gBrowserExists = true;
    if(typeof(gBrowser) == 'undefined') {
        gBrowserExists = false;
    }

    /*
    if (!gBrowserExists) {
    	var tabmail = document.getElementById('tabmail');
	if (tabmail) {
      	   tabTypesForTB.kmUsageTabType.kmUsagePageURL = kmUsageDocumentURL;
	   tabmail.registerTabType(tabTypesForTB.kmUsageTabType);
	   tabmail.openTab("kmUsage");
	}
	return;
    }
    */

    if (gBrowserExists) {
    	// Source: http://developer.mozilla.org/en/Code_snippets/Tabbed_browser#Opening_a_URL_in_a_new_tab
    	// Add tab, then make active
    	gBrowser.selectedTab = gBrowser.addTab(kmUsageDocumentURL);
    }
    else {
	// Source: http://developer.mozilla.org/En/Opening_a_Link_in_the_Default_Browser

	var extps = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
                      .getService(Components.interfaces.nsIExternalProtocolService);

	// check whether an external handler for a scheme exist
	if (extps.externalProtocolHandlerExists("chrome")) {
	    // first construct an nsIURI object using the ioservice
	    var ioservice = Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);
	    var uriToOpen = ioservice.newURI(kmUsageDocumentURL, null, null);

	    // now, open it!
	    extps.loadURI(uriToOpen, null);
	}
	else {
	    dump("displayKMUsageDocument(): ExternalProtocolHandler does not exists for chorme.");
    	    window.open(kmUsageDocumentURL, "_blank", "resizable,toolbar=1,location=1,status=1,scrollbars=1,width=900,height=700");
	}
    }
}


