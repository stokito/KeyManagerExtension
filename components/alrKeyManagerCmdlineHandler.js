/* @(#) $Id: alrKeyManagerCmdlineHandler.js,v 1.5 2010/08/27 00:31:53 subrata Exp $ */

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
 * Based on the code from here xulmine:
 *     http://www.mozdev.org/source/browse/xulmine/install/Attic/xulmine-service.js?rev=1.1&content-type=text/x-cvsweb-markup
 * 
 * XPCOM Implementation references:
 * 	https://developer.mozilla.org/en/XPCOMUtils.jsm  (For FF3+)
 *
 */

/* components defined in this file */
const KEYMANAGER_CMDLINE_CONTRACTID	= "@mozilla.org/commandlinehandler/general-startup;1?type=keymanager";
const KEYMANAGER_CMDLINE_CID		= Components.ID("{284d1a61-32f1-4e1b-9ba5-630da0272451}");

const CATMAN_CONTRACTID			= "@mozilla.org/categorymanager;1";
const WINDOW_MANAGER_CONTRACTID		= "@mozilla.org/appshell/window-mediator;1";

/*
component 284d1a61-32f1-4e1b-9ba5-630da0272451 alrKeyManagerCmdlineHandler.js
contract  @mozilla.org/commandlinehandler/general-startup;1?type=keymanager 284d1a61-32f1-4e1b-9ba5-630da0272451
*/


Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

/* Command Line handler service */
function KeyManagerCmdLineHandler() {}

KeyManagerCmdLineHandler.prototype = {
    /** 
     * .classID is required for generateNSGetFactory to work correctly.
     * Make sure this CID matches the "component" in your .manifest file.
     */
    classID : Components.ID("{284d1a61-32f1-4e1b-9ba5-630da0272451}"),

    /**
     * .classDescription and .contractID are only used for
     * * backwards compatibility with Gecko 1.9.2 and
     * * XPCOMUtils.generateNSGetModule.
     */
    classDescription: "KeyManager Cmd Line Handler Component", // any human-readable string

    contractID: "@mozilla.org/commandlinehandler/general-startup;1?type=keymanager",

    /**
     * List all the interfaces your component supports.
     * @note nsISupports is generated automatically; you don't need to list it.
     */
    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsICmdLineHandler, Components.interfaces.nsICommandLineHandler]),

  commandLineArgument	: "-keymanager",
  prefNameForStartup	: "general.startup.keymanager",
  chromeUrlForTask	: "chrome://keymanager/content/keyManager.xul",

  get X_chromeUrlForTask() {
    var windowManager = Components.classes[WINDOW_MANAGER_CONTRACTID]
                                  .getService(Components.interfaces.nsIWindowMediator);
    var keymanagerWindow = windowManager.getMostRecentWindow('keymanager');
    if (keymanagerWindow)
      keymanagerWindow.setTimeout(function() { keymanagerWindow.close(); }, 0);
    return "chrome://keymanager/content/keyManager.xul";
  },

  helpText		: "Start with KeyManager.",
  handlesArgs		: true,
  defaultArgs		: "",
  openWindowWithArgs	: true,

  /* Components.interfaces.nsICommandLineHandler */
  handle : function handler_handle(cmdLine)
  {
    var args = Components.classes["@mozilla.org/supports-string;1"].
        createInstance(Components.interfaces.nsISupportsString);

    dump("KeyManagerCmdLineHandler.handle():...................10.\n");
    try {
      var uristr = cmdLine.handleFlagWithParam("keymanager", false);
      if (uristr == null) return;

      try {
        args.data = cmdLine.resolveURI(uristr).spec;
      } catch (e) {
        return;
      }
    } catch (e) {
      cmdLine.handleFlag("keymanager", true);
    }

    dump("KeyManagerCmdLineHandler.handle():...................30.\n");

    var wwatch = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].
        getService(Components.interfaces.nsIWindowWatcher);
    wwatch.openWindow(null, "chrome://keymanager/content/", "_blank",
        "chrome,dialog=no,all", null);
    cmdLine.preventDefault = true;

    dump("KeyManagerCmdLineHandler.handle():...................End.\n");
  },

  helpInfo: "Start with KeyManager",

  /*
  QueryInterface: function QueryInterface(aIID) {
    if (aIID.equals(Components.interfaces.nsISupports) ||
        (Components.interfaces.nsICmdLineHandler &&
         aIID.equals(Components.interfaces.nsICmdLineHandler)) ||
        (Components.interfaces.nsICommandLineHandler &&
         aIID.equals(Components.interfaces.nsICommandLineHandler))) {
      return this;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },
  */
    lastMethod : function()
    {
    }
}

/*
// factory for command line handler service (KeyManagerCmdLineHandler) 
var KeyManagerCmdLineFactory = {

  createInstance: function createInstance(outer, iid) {
    dump("KeyManagerCmdLineFactory.createInstance():...................Start.\n");
    if (outer != null) {
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    }
    dump("KeyManagerCmdLineFactory.createInstance():...................End.\n");
    return new KeyManagerCmdLineHandler().QueryInterface(iid);
  }
}

var KeyManagerCmdLineModule = {

  registerSelf: function registerSelf(compMgr, fileSpec, location, type) {
    // dump("KeyManagerCmdLineModule.registerSelf():...................Start.\n");
    compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar)
           .registerFactoryLocation(KEYMANAGER_CMDLINE_CID,
                                    "KeyManager command line handler",
                                    KEYMANAGER_CMDLINE_CONTRACTID,
                                    fileSpec,
                                    location,
                                    type);
  
    var catman = Components.classes[CATMAN_CONTRACTID]
              .getService(Components.interfaces.nsICategoryManager)
    catman.addCategoryEntry("command-line-argument-handlers",
                                  "KeyManager command line handler",
                                  KEYMANAGER_CMDLINE_CONTRACTID, true, true);
    catman.addCategoryEntry("command-line-handlers", "m-keymanager",
                                  KEYMANAGER_CMDLINE_CONTRACTID, true, true);
    // dump("KeyManagerCmdLineModule.registerSelf():...................End.\n");
  },

  unregisterSelf: function unregisterSelf(compMgr, fileSpec, location) {
    compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar)
           .unregisterFactoryLocation(KEYMANAGER_CMDLINE_CID, fileSpec);
  
    var catman = Components.classes[CATMAN_CONTRACTID]
              .getService(Components.interfaces.nsICategoryManager)
    catman.deleteCategoryEntry("command-line-argument-handlers", "KeyManager command line handler", true);
    catman.deleteCategoryEntry("command-line-handlers", "m-keymanager", true);
  },

  getClassObject: function getClassObject(compMgr, cid, iid) {
    if (cid.equals(KEYMANAGER_CMDLINE_CID))
      return KeyManagerCmdLineFactory;
  
    if (!iid.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
  
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function canUnload(compMgr) {
    return true;
  }
}

// entrypoint
function NSGetModule(compMgr, fileSpec) {
  return KeyManagerCmdLineModule;
}
*/


/**
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4).
 * XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 (Firefox 3.6).
 */

if (XPCOMUtils.generateNSGetFactory)
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([KeyManagerCmdLineHandler]);
else
    var NSGetModule = XPCOMUtils.generateNSGetModule([KeyManagerCmdLineHandler]);

