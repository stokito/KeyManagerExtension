/* @(#) $Id: ALRPKIMgmtSvcs.js,v 1.1 2013/05/23 22:42:48 subrata Exp $ */

/* ***** BEGIN LICENSE BLOCK *****
 * The Initial Developer of the Original Code is
 * Subrata Mazumdar, Avaya Labs Research, Avaya Inc.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Subrata Mazumdar (mazum@avaya.com)
 *
 * ***** END LICENSE BLOCK ***** */

/*
 *
 * XPCOM Implementation references:
 * 	https://developer.mozilla.org/en/XPCOMUtils.jsm  (For FF3+)
 * 	https://developer.mozilla.org/en/XPCOM/XPCOM_changes_in_Gecko_2.0 (FF4.0)
 *
 */

/*
 *  ATTENTION
 *
 *  Firefox is very very unforgiving to syntax errors in XPCOM Javascript
 *  files. If this file does not parse properly once, it might not be
 *  loaded again even if you restart Firefox. Watch the JavaScript
 *  Console for any error message (only logged the first time the file
 *  fails to parse).
 *
 *  You might have to uninstall the whole extension, restart Firefox, 
 *  reinstall the extension (with fixes), and then restart Firefox.
 */
 

let Cu = Components.utils;
let Ci = Components.interfaces;
let Cc = Components.classes;
let Cr = Components.results;

/* Load XPCOMUtils Javascript module */
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");


function ALRPKIMgmtSvcs_log(aMessage) {
    var _msg = "ALRPKIMgmtSvcs: " + aMessage + "\n";
    dump(_msg);
}



/*----------------------------------------------------------------------
 * The ALRPKIMgmtSvcs Component, implemented as a Javascript function.
 *----------------------------------------------------------------------
 */

//class constructor
function ALRPKIMgmtSvcs() {
    // ALRPKIMgmtSvcs_log("ALRPKIMgmtSvcs():..................Start.");
    /*
     *  This is a XPCOM-in-Javascript trick: Clients using an XPCOM
     *  implemented in Javascript can access its wrappedJSObject field
     *  and then from there, access its Javascript methods that are
     *  not declared in any of the IDL interfaces that it implements.
     *
     *  Being able to call directly the methods of a Javascript-based
     *  XPCOM allows clients to pass to it and receive from it
     *  objects of types not supported by IDL.
     */
    this.wrappedJSObject = this;
    
    this._initialized = false;

    // ALRPKIMgmtSvcs_log("ALRPKIMgmtSvcs():..................End.");
};

//class definition
ALRPKIMgmtSvcs.prototype = {

    /** 
     * .classID is required for generateNSGetFactory to work correctly.
     * Make sure this CID matches the "component" in your .manifest file.
     */
    classID : Components.ID("{3aea362d-0611-4524-ba51-03529ecbe74f}"),

    /**
     * .classDescription and .contractID are only used for
     * * backwards compatibility with Gecko 1.9.2 and
     * * XPCOMUtils.generateNSGetModule.
     */
    classDescription: "KeyManager Services Access  JS Impl", // any human-readable string
    contractID: "@avaya.com/avpki/js/avpkimgmtsvcs;1",

    /**
     * List all the interfaces your component supports.
     * @note nsISupports is generated automatically; you don't need to list it.
     */
    QueryInterface : XPCOMUtils.generateQI([
    			Ci.nsIDOMGlobalPropertyInitializer,
			Ci.nsISupports
			]),

    mVersion: "0.0.77",
    get version() { return this.mVersion; },

    init : function(aWindow) 
    {
     	// ALRPKIMgmtSvcs_log("ALRPKIMgmtSvcs.init():................Start.");

	this.window = XPCNativeWrapper.unwrap(aWindow);
	this.sandbox = Cu.Sandbox(this.window,
				{ sandboxPrototype: this.window, wantXrays: false });

	this.keyManagerSvcs = {};
	try {
	    var x509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"]
	                        .getService(Components.interfaces.nsIX509CertDB);
	    var keyManager = Components.classes["@avaya.com/pkm/keymanager;1"]
	                        .getService(Components.interfaces.alrIKeyManager);
	    var attrCertFactory = Components.classes["@avaya.com/pkm/attrcertfactory;1"]
				.getService(Components.interfaces.alrIAttributeCertFactory);
	    var xpSignTool = Components.classes["@avaya.com/pkm/xpsigntool;1"]
				.getService(Components.interfaces.alrIXPSignTool);
	    var crlManager = Components.classes["@avaya.com/pkm/alrcrlmanager;1"]
                                .getService(Components.interfaces.alrICRLManager);
	    this.keyManagerSvcs = {
		"attrCertFactory" : attrCertFactory,
		"xpSignTool" : xpSignTool,
		"crlManager" : crlManager,
		"keyManager" : keyManager,
		"__exposedProps__" : {
		    "attrCertFactory" : "r",
		    "xpSignTool" : "r",
		    "crlManager" : "r",
		    "keyManager" : "r"
		    }
		};
	} catch (ex) {
     	    ALRPKIMgmtSvcs_log("ALRPKIMgmtSvcs.init(): failed - ex: " + ex);
	}

     	// ALRPKIMgmtSvcs_log("ALRPKIMgmtSvcs.init():................End.");
	return this.keyManagerSvcs;
    },

    /*
	// TODO: test code: 
    */
    test1 : function()
    {
        alert(Components.classes["@avaya.com/avpki/js/avpkimgmtsvcs;1"].getService(Components.interfaces.nsISupports).wrappedJSObject.version);
	alert(window.avpkimgmtsvcs.keyManager);
    },

    lastMethod : function()
    {
    }
};

/**
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4).
 * XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 (Firefox 3.6).
 */

var NSGetFactory = XPCOMUtils.generateNSGetFactory([ALRPKIMgmtSvcs]);

