// functions go here

if ((typeof avpki) == 'undefined') {
    var avpki = {};
    avpki.keymanager = {};
}
if ((typeof avpki.keymanager) == 'undefined') {
    avpki.keymanager = {};
}

avpki.keymanager.KeyManagerMainToolbarOverlay = {

    showKMPreferences : function ()
    {

	var keyManagerOptionsURL = "chrome://keymanager/content/keymanagerOptions.xul";
	window.openDialog(
		keyManagerOptionsURL,
		"keymgr_options",
		"chrome,toolbar,centerscreen,resizable=yes,titlebar"
		);
    },

    signTextDemo : function ()
    {
	var textToBeSigned = "Subrata Mazumdar";
    	var signedText = window.crypto.signText(textToBeSigned,"ask")
	// dump("signedText:\n" + signedText + "\n");
	// alert("signedText:\n" + signedText + "\n");
	if (signedText.indexOf("error:") >= 0) {
	    alert(signedText);
	    return;
	}

	var signerCert = null;
	try {
    	    var keyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
		    		.getService(Components.interfaces.alrIKeyManager);
            var cd = Components.classes["@mozilla.org/nsCertificateDialogs;1"]
    				.getService(Components.interfaces.nsICertificateDialogs);
    	    var signerCert = keyManager.getPKCS7SignedDataSignerCert(signedText);
            cd.viewCert(window, signerCert);
	} catch (ex) {
	}
    },

    runKeyManager : function ()
    {
	/*
	var xulRuntime = Components.classes["@mozilla.org/xre/app-info;1"]
	          		.getService(Components.interfaces.nsIXULRuntime);
	var os = Components.classes["@mozilla.org/xre/app-info;1"]
	          .getService(Components.interfaces.nsIXULRuntime).OS
	var abi = Components.classes["@mozilla.org/xre/app-info;1"]
	          .getService(Components.interfaces.nsIXULRuntime).XPCOMABI
	*/
	dump("KeyManagerMainToolbarOverlay.runKeyManager(): userAgent: " + navigator.userAgent +"\n");

    	if (!avpki.keymanager.KeyManagerToolbarOverlay.checkKMBinaryComponents()) {
	    alert("Failed to load/register binary components of KeyManager");
	    return;
	}

	avpki.keymanager.KeyManagerToolbarOverlay.loginToInternalKeyToken();
    
    
	// PSM is different for FF3 and FF2, so we are using different files 
	// in a single XPI package.
	var keyManagerURL = "chrome://keymanager/content/keyManagerFF3.xul";
	/*
	if (navigator.userAgent.match("rv:1.9.3")) {
	    keyManagerURL = "chrome://keymanager/content/tools/keymgr/keyManager.xul";
	}
	*/
	/*
	else if (!(navigator.userAgent.match("rv:1.9"))) {
	    keyManagerURL = "chrome://keymanager/content/keyManager.xul";
	}
	*/
	dump("KeyManagerMainToolbarOverlay.runKeyManager(): keyManagerURL: " + keyManagerURL +"\n");
    
	// check for an existing KeyManger window and focus it; it's not application modal
       const kWindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
	var lastKeyManager = kWindowMediator.getMostRecentWindow("avaya:keymanager");
	if (lastKeyManager) {
	    lastKeyManager.focus();
	    return;
	}
	window.open(keyManagerURL,  "keymgr",
		    'chrome,centerscreen,resizable=yes,dialog=no,titlebar');
    },
    
    getTestDialogParams : function ()
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
    },
    
    
    
    testJSXPcomImpl : function ()
    {
	try {
	    var base64Svc = Components.classes["@avaya.com/pkm/base64;1"]
	    			.getService(Components.interfaces.alrIBase64);
	    // dump("testJSXPcomImpl(): Components.interfaces.alrIBase64 implementation successfully tested.\n");
	} catch (ex) {
	    dump("testJSXPcomImpl(): getService(Components.interfaces.alrIBase64) failed. - ex: " + ex + "\n");
	}
    },

    displayKMUsageDocument : function ()
    {
	// avpki.keymanager.KeyManagerMainToolbarOverlay.testJSXPcomImpl();

	var kmUsageDocumentURL = "chrome://keymanager/content/firstrun/keymanagerInfo.html";
	avpki.keymanager.KeyManagerMainToolbarOverlay.displayDocument(kmUsageDocumentURL);
    },

    displayPeronalCADocument : function ()
    {
	var peronalCADocumentURL = "chrome://keymanager/content/firstrun/HOWTO_SETUP_PersonalCA.html";
	avpki.keymanager.KeyManagerMainToolbarOverlay.displayDocument(peronalCADocumentURL);
    },

    displayDocument : function (aDocURL)
    {
	var gBrowserExists = true;
	if(typeof(gBrowser) == 'undefined') {
	    gBrowserExists = false;
	}
    
	/*
	if (!gBrowserExists) {
		var tabmail = document.getElementById('tabmail');
	if (tabmail) {
	  	   avpki.keymanager.KM_tabTypesForTB.kmUsageTabType.kmUsagePageURL = aDocURL;
	   tabmail.registerTabType(avpki.keymanager.KM_tabTypesForTB.kmUsageTabType);
	   tabmail.openTab("kmUsage");
	}
	return;
	}
	*/
    
	if (gBrowserExists) {
	    // Source: http://developer.mozilla.org/en/Code_snippets/Tabbed_browser#Opening_a_URL_in_a_new_tab
	    // Add tab, then make active
	    gBrowser.selectedTab = gBrowser.addTab(aDocURL);
	}
	/*
	if(navigator.userAgent.search(/Thunderbird/gi) > -1){
	    var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance();
	    messenger = messenger.QueryInterface(Components.interfaces.nsIMessenger);
	    messenger.launchExternalURL("url");
	}
	*/
	else {
	    // Source: http://developer.mozilla.org/En/Opening_a_Link_in_the_Default_Browser
    
	    var extps = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
			  .getService(Components.interfaces.nsIExternalProtocolService);
    
	    // check whether an external handler for a scheme exist
	    if (extps.externalProtocolHandlerExists("chrome")) {
		// first construct an nsIURI object using the ioservice
		var ioservice = Components.classes["@mozilla.org/network/io-service;1"]
			      .getService(Components.interfaces.nsIIOService);
		var uriToOpen = ioservice.newURI(aDocURL, null, null);
    
		// now, open it!
		extps.loadURI(uriToOpen, null);
	    }
	    else {
		dump("displayDocument(): ExternalProtocolHandler does not exists for chorme.");
		window.open(aDocURL, "_blank", "resizable,toolbar=1,location=1,status=1,scrollbars=1,width=900,height=700");
	    }
	}
    }
}

avpki.keymanager.KM_tabTypesForTB = {
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
	      let startpage = Components.classes["@mozilla.org/toolkit/URLFormatterService;1"]
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

// alert("keymanagerMainToolbarOverlay.js: done loading.");

