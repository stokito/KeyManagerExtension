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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bob Lord <lord@netscape.com>
 *   Ian McGreer <mcgreer@netscape.com>
 * 
 * Modified By:
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

const nsIFilePicker = Components.interfaces.nsIFilePicker;
const nsFilePicker = "@mozilla.org/filepicker;1";
const nsIX509CertDB = Components.interfaces.nsIX509CertDB;
const nsX509CertDB = "@mozilla.org/security/x509certdb;1";
const nsIX509Cert = Components.interfaces.nsIX509Cert;
const nsICertTree = Components.interfaces.nsICertTree;
const nsCertTree = "@mozilla.org/security/nsCertTree;1";
const nsIDialogParamBlock = Components.interfaces.nsIDialogParamBlock;
const nsDialogParamBlock = "@mozilla.org/embedcomp/dialogparam;1";
const nsIPKIParamBlock    = Components.interfaces.nsIPKIParamBlock;
const nsPKIParamBlock    = "@mozilla.org/security/pkiparamblock;1";
const nsINSSCertCache = Components.interfaces.nsINSSCertCache;
const nsNSSCertCache = "@mozilla.org/security/nsscertcache;1";

var key;

var selected_certs = [];
var selected_cert_index = [];
var certdb;

var caTreeView;
var serverTreeView;
var emailTreeView;
var userTreeView;
var userKeyTreeView;

function LoadCerts()
{
  window.crypto.enableSmartCardEvents = true;
  document.addEventListener("smartcard-insert", onSmartCardChange, false);
  document.addEventListener("smartcard-remove", onSmartCardChange, false);

  certdb = Components.classes[nsX509CertDB].getService(nsIX509CertDB);
  var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
  
  certcache.cacheAllCerts();

  caTreeView = Components.classes[nsCertTree]
                    .createInstance(nsICertTree);
  caTreeView.loadCertsFromCache(certcache, nsIX509Cert.CA_CERT);
  document.getElementById('ca-tree')
   .treeBoxObject.view = caTreeView;

  serverTreeView = Components.classes[nsCertTree]
                        .createInstance(nsICertTree);
  serverTreeView.loadCertsFromCache(certcache, nsIX509Cert.SERVER_CERT);
  document.getElementById('server-tree')
   .treeBoxObject.view = serverTreeView;

  emailTreeView = Components.classes[nsCertTree]
                       .createInstance(nsICertTree);
  emailTreeView.loadCertsFromCache(certcache, nsIX509Cert.EMAIL_CERT);
  document.getElementById('email-tree')
   .treeBoxObject.view = emailTreeView; 

  userTreeView = Components.classes[nsCertTree]
                      .createInstance(nsICertTree);
  userTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
  document.getElementById('user-tree')
   .treeBoxObject.view = userTreeView;

  var rowCnt = userTreeView.rowCount;
  var enableBackupAllButton=document.getElementById('mine_backupAllButton');
  if(rowCnt < 1) {
    enableBackupAllButton.setAttribute("disabled",true);
  } else  {
    enableBackupAllButton.setAttribute("enabled",true);
  }

  if (certdb.isOcspOn) {
    document.getElementById('ocsp_info').removeAttribute("hidden");
  }

  LoadUserKeys(certcache);
  // initCertExportOverlay();
  LoadProxyCerts(certcache);

}

function getSelectedTab()
{
  // TODO: Add the key element as attribute to the corresponding XUL
  //       'tab' elem in the XUL file.
  //       There is one-to-one associateion between the tab elem 
  //       and the key value.
  //       We can retrive the key ass follows: 
  //  var key = selTab.getAttribute("keyId");

  var selTab = document.getElementById('certMgrTabbox').selectedItem;
  var selTabID = selTab.getAttribute('id');
  if (selTabID == 'mine_tab') {
    key = "my_certs";
  } else if (selTabID == "mine_key_tab") {
    key = "my_keys";
  } else if (selTabID == "others_tab") {
    key = "others_certs";
  } else if (selTabID == "websites_tab") {
    key = "web_certs";
  } else if (selTabID == "ca_tab") {
    key = "ca_certs";
  }  
  return key;
}


function doHelpButton() {
   var uri = getSelectedTab();
   openHelp(uri);
}


function getSelectedCertTreeView()
{
    // TODO: Mozilla-PSM should fix the naming of the 'tabs' elem.
    //       We should name (id) the 'tabbox' elem as 'certMgrTabbox' not the  tabs elem.
    //       In addition, we should name the 'tabpanels', as well as define tabpanel with 
    //       appropriate unique id. All the 'vbox' under 'tabpanels' should be replaced with 
    //       'tabpanel' tag.
    //       Labeling XUL elements with 'id' allow us to directly select them as well as 
    //       add new elements using the 'overlay' before, after or inside the element.

    var certTabsElem = document.getElementById('certMgrTabbox');
    var certTabboxElem = certTabsElem.parentNode;
    // dump("getSelectedCertTree(): certTabboxElem: " + certTabboxElem + "\n");
    // dump("getSelectedCertTree(): certTabboxElem.tagName: " + certTabboxElem.tagName + "\n");
    // dump("getSelectedCertTree(): certTabboxElem.selectedIndex: " + certTabboxElem.selectedIndex + "\n");

    var selectedTabElem = certTabboxElem.selectedTab;
    // dump("getSelectedCertTree(): selectedTabElem: " + selectedTabElem + "\n");

    var selectedTabpanelElem = certTabboxElem.selectedPanel;
    dump("getSelectedCertTree(): selectedTabpanelElem: " + selectedTabpanelElem + "\n");

    /*
    var tabpanelsElemList = certTabboxElem.getElementsByTagName("tabpanels");
    var certTabpanelsElem = null;
    if ((tabpanelsElemList) && (tabpanelsElemList.length > 0)) {
    	certTabpanelsElem = tabpanelsElemList[0];
    }
    dump("getSelectedCertTree(): certTabpanelsElem: " + certTabpanelsElem + "\n");
    if (!certTabpanelsElem) {
    	return null;
    }
    selectedTabpanelElem = certTabpanelsElem.selectedPanel;
    // dump("getSelectedCertTree(): selectedTabpanelElem: " + selectedTabpanelElem + "\n");
    */

    if (!selectedTabpanelElem) {
    	return null;
    }
    var certTreeElem = null;
    var certTreeElemList = selectedTabpanelElem.getElementsByTagName("tree");
    if ((certTreeElemList) && (certTreeElemList.length > 0)) {
    	certTreeElem = certTreeElemList[0];
    }
    // dump("getSelectedCertTree(): certTreeElem: " + certTreeElem + "(" + certTreeElem.id + ")\n");

    var certTreeViewObj = certTreeElem.treeBoxObject.view
    dump("getSelectedCertTree(): certTreeViewObj: " + certTreeViewObj + "\n");

    var /* nsICertTree */ certTreeView = null;
    try {
    	certTreeView = certTreeViewObj.QueryInterface(Components.interfaces.nsICertTree);
    } catch (ex) {
    	dump("getSelectedCertTree(): certTreeViewObj.QueryInterface() failed.\n");
        certTreeView = certTreeViewObj.certTreeView;
	if (!certTreeView) {
	    certTreeView = certTreeElem.certTreeView;
	}
    }
    dump("getSelectedCertTree(): certTreeView: " + certTreeView + "\n");
    return certTreeView;
}

function getSelectedCerts()
{
  var ca_tab = document.getElementById("ca_tab");
  var mine_key_tab = document.getElementById("mine_key_tab");
  var mine_tab = document.getElementById("mine_tab");
  var others_tab = document.getElementById("others_tab");
  var websites_tab = document.getElementById("websites_tab");
  var items = null;
  if (ca_tab.selected) {
    items = caTreeView.selection;
  } else if (mine_tab.selected) {
    items = userTreeView.selection;
  } else if (others_tab.selected) {
    items = emailTreeView.selection;
  } else if (websites_tab.selected) {
    items = serverTreeView.selection;
  } else if (mine_key_tab.selected) {
    items = userKeyTreeView.selection;
  }
  // var certTreeView = getSelectedCertTreeView();
  // items = certTreeView.selection;

  selected_certs = [];
  var cert = null;
  var nr = 0;
  if (items != null) nr = items.getRangeCount();
  if (nr > 0) {
    for (var i=0; i<nr; i++) {
      var o1 = {};
      var o2 = {};
      items.getRangeAt(i, o1, o2);
      var min = o1.value;
      var max = o2.value;
      for (var j=min; j<=max; j++) {
        if (ca_tab.selected) {
          cert = caTreeView.getCert(j);
        } else if (mine_tab.selected) {
          cert = userTreeView.getCert(j);
        } else if (others_tab.selected) {
          cert = emailTreeView.getCert(j);
        } else if (websites_tab.selected) {
          cert = serverTreeView.getCert(j);
        } else if (mine_key_tab.selected) {
          cert = userKeyTreeView.getCert(j);
        }
        if (cert) {
          var sc = selected_certs.length;
          selected_certs[sc] = cert;
          selected_cert_index[sc] = j;
        }
      }
    }
  }
}

function ca_enableButtons()
{
  var items = caTreeView.selection;
  var nr = items.getRangeCount();
  var toggle="false";
  if (nr == 0) {
    toggle="true";
  }
  var edit_toggle=toggle;
/*
  var edit_toggle="true";
  if (nr > 0) {
    for (var i=0; i<nr; i++) {
      var o1 = {};
      var o2 = {};
      items.getRangeAt(i, o1, o2);
      var min = o1.value;
      var max = o2.value;
      var stop = false;
      for (var j=min; j<=max; j++) {
        var tokenName = items.tree.view.getCellText(j, "tokencol");
	if (tokenName == "Builtin Object Token") { stop = true; } break;
      }
      if (stop) break;
    }
    if (i == nr) {
      edit_toggle="false";
    }
  }
*/
  var enableViewButton=document.getElementById('ca_viewButton');
  enableViewButton.setAttribute("disabled",toggle);
  var enableEditButton=document.getElementById('ca_editButton');
  enableEditButton.setAttribute("disabled",edit_toggle);
  var enableExportButton=document.getElementById('ca_exportButton');
  enableExportButton.setAttribute("disabled",edit_toggle);
  var enableDeleteButton=document.getElementById('ca_deleteButton');
  enableDeleteButton.setAttribute("disabled",toggle);
}

function mine_enableButtons()
{
  var items = userTreeView.selection;
  var toggle="false";
  if (items.getRangeCount() == 0) {
    toggle="true";
  }

  var enableViewButton=document.getElementById('mine_viewButton');
  enableViewButton.setAttribute("disabled",toggle);
  var enableBackupButton=document.getElementById('mine_backupButton');
  enableBackupButton.setAttribute("disabled",toggle);
  var enableDeleteButton=document.getElementById('mine_deleteButton');
  enableDeleteButton.setAttribute("disabled",toggle);

}

function websites_enableButtons()
{
  var items = serverTreeView.selection;
  var toggle="false";
  if (items.getRangeCount() == 0) {
    toggle="true";
  }
  var enableViewButton=document.getElementById('websites_viewButton');
  enableViewButton.setAttribute("disabled",toggle);
  var enableEditButton=document.getElementById('websites_editButton');
  enableEditButton.setAttribute("disabled",toggle);
  var enableExportButton=document.getElementById('websites_exportButton');
  enableExportButton.setAttribute("disabled",toggle);
  var enableDeleteButton=document.getElementById('websites_deleteButton');
  enableDeleteButton.setAttribute("disabled",toggle);
}

function email_enableButtons()
{
  var items = emailTreeView.selection;
  var toggle="false";
  if (items.getRangeCount() == 0) {
    toggle="true";
  }
  var enableViewButton=document.getElementById('email_viewButton');
  enableViewButton.setAttribute("disabled",toggle);
  var enableEditButton=document.getElementById('email_editButton');
  enableEditButton.setAttribute("disabled",toggle);
  var enableEexportButton=document.getElementById('email_exportButton');
  enableEexportButton.setAttribute("disabled",toggle);
  var enableDeleteButton=document.getElementById('email_deleteButton');
  enableDeleteButton.setAttribute("disabled",toggle);
}

function backupCerts()
{
  getSelectedCerts();
  var numcerts = selected_certs.length;
  if (!numcerts)
    return;
  var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
  var fp = Components.classes[nsFilePicker].createInstance(nsIFilePicker);
  fp.init(window,
          bundle.GetStringFromName("chooseP12BackupFileDialog"),
          nsIFilePicker.modeSave);
  fp.appendFilter(bundle.GetStringFromName("file_browse_PKCS12_spec"),
                  "*.p12");
  fp.appendFilters(nsIFilePicker.filterAll);
  var rv = fp.show();
  if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
    certdb.exportPKCS12File(null, fp.file, 
                            selected_certs.length, selected_certs);
  }
}

function backupAllCerts()
{
  // Select all rows, then call doBackup()
  var items = userTreeView.selection.selectAll();
  backupCerts();
}

function editCerts()
{
  getSelectedCerts();
  var numcerts = selected_certs.length;
  if (!numcerts)
    return;
  for (var t=0; t<numcerts; t++) {
    var cert = selected_certs[t];
    var certkey = cert.dbKey;
    var ca_tab = document.getElementById("ca_tab");
    var others_tab = document.getElementById("others_tab");
    if (ca_tab.selected) {
      window.openDialog('chrome://pippki/content/editcacert.xul', certkey,
                        'chrome,centerscreen,modal');
    } else if (others_tab.selected) {
      window.openDialog('chrome://pippki/content/editemailcert.xul', certkey,
                        'chrome,centerscreen,modal');
    } else {
      window.openDialog('chrome://pippki/content/editsslcert.xul', certkey,
                        'chrome,centerscreen,modal');
    }
  }
}

function restoreCerts()
{
  var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
  var fp = Components.classes[nsFilePicker].createInstance(nsIFilePicker);
  fp.init(window,
          bundle.GetStringFromName("chooseP12RestoreFileDialog"),
          nsIFilePicker.modeOpen);
  fp.appendFilter(bundle.GetStringFromName("file_browse_PKCS12_spec"),
                  "*.p12; *.pfx");
  fp.appendFilters(nsIFilePicker.filterAll);
  if (fp.show() == nsIFilePicker.returnOK) {
    certdb.importPKCS12File(null, fp.file);

    var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    certcache.cacheAllCerts();
    userTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
    userTreeView.selection.clearSelection();
    caTreeView.loadCertsFromCache(certcache, nsIX509Cert.CA_CERT);
    caTreeView.selection.clearSelection();
  }
}

function deleteCerts()
{
  getSelectedCerts();
  var numcerts = selected_certs.length;
  if (!numcerts)
    return;

  var params = Components.classes[nsDialogParamBlock].createInstance(nsIDialogParamBlock);
  
  var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
  var selTab = document.getElementById('certMgrTabbox').selectedItem;
  var selTabID = selTab.getAttribute('id');
  var t;

  params.SetNumberStrings(numcerts+1);

  if (selTabID == 'mine_tab') 
  {
    params.SetString(0,bundle.GetStringFromName("deleteUserCertFlag"));
  } 
  else if (selTabID == 'mine_key_tab') 
  {
    params.SetString(0,bundle.GetStringFromName("deleteUserCertFlag"));
  } 
  else if (selTabID == "websites_tab") 
  {
    params.SetString(0,bundle.GetStringFromName("deleteSslCertFlag"));
  } 
  else if (selTabID == "ca_tab") 
  {
    params.SetString(0,bundle.GetStringFromName("deleteCaCertFlag"));
  }
  else if (selTabID == "others_tab") 
  {
    params.SetString(0,bundle.GetStringFromName("deleteEmailCertFlag"));
  }
  else
  {
    return;
  }

  params.SetInt(0,numcerts);
  for (t=0; t<numcerts; t++) 
  {
    var cert = selected_certs[t];
    params.SetString(t+1, cert.dbKey);  
  }
  
  // The dialog will modify the params.
  // Every param item where the corresponding cert could get deleted,
  // will still contain the db key.
  // Certs which could not get deleted, will have their corrensponding
  // param string erased.
  window.openDialog('chrome://pippki/content/deletecert.xul', "",
                    'chrome,centerscreen,modal', params);
 
  if (params.GetInt(1) == 1) {
    // user closed dialog with OK
    var treeView = null;
    var loadParam = null;

    selTab = document.getElementById('certMgrTabbox').selectedItem;
    selTabID = selTab.getAttribute('id');
    if (selTabID == 'mine_tab') {
      treeView = userTreeView;
      loadParam = nsIX509Cert.USER_CERT;
    } else if (selTabID == "others_tab") {
      treeView = emailTreeView;
      loadParam = nsIX509Cert.EMAIL_CERT;
    } else if (selTabID == "websites_tab") {
      treeView = serverTreeView;
      loadParam = nsIX509Cert.SERVER_CERT;
    } else if (selTabID == "ca_tab") {
      treeView = caTreeView;
      loadParam = nsIX509Cert.CA_CERT;
    } else if (selTabID == 'mine_key_tab') {
      treeView = userTreeView;
      loadParam = nsIX509Cert.USER_CERT;
    }

    for (t=numcerts-1; t>=0; t--)
    {
      var s = params.GetString(t+1);
      if (s.length) {
        // This cert was deleted.
        treeView.removeCert(selected_cert_index[t]);
      }
    }

    treeView.selection.clearSelection();
  }
}

function viewCerts()
{
  getSelectedCerts();
  var numcerts = selected_certs.length;
  if (!numcerts)
    return;

  for (var t=0; t<numcerts; t++) {
    viewCertHelper(window, selected_certs[t]);
  }
}

function addCACerts()
{
  var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
  var fp = Components.classes[nsFilePicker].createInstance(nsIFilePicker);
  fp.init(window,
          bundle.GetStringFromName("importCACertsPrompt"),
          nsIFilePicker.modeOpen);
  fp.appendFilter(bundle.GetStringFromName("file_browse_Certificate_spec"),
                  "*.crt; *.cert; *.cer; *.pem; *.der");
  fp.appendFilters(nsIFilePicker.filterAll);
  if (fp.show() == nsIFilePicker.returnOK) {
    certdb.importCertsFromFile(null, fp.file, nsIX509Cert.CA_CERT);
    caTreeView.loadCerts(nsIX509Cert.CA_CERT);
    caTreeView.selection.clearSelection();
  }
}

function onSmartCardChange()
{
  var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
  // We've change the state of the smart cards inserted or removed
  // that means the available certs may have changed. Update the display
  certcache.cacheAllCerts();
  /*
  userKeyTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
  userKeyTreeView.selection.clearSelection();
  */
  userTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
  userTreeView.selection.clearSelection();
  caTreeView.loadCertsFromCache(certcache, nsIX509Cert.CA_CERT);
  caTreeView.selection.clearSelection();
  serverTreeView.loadCertsFromCache(certcache, nsIX509Cert.SERVER_CERT);
  serverTreeView.selection.clearSelection();
  emailTreeView.loadCertsFromCache(certcache, nsIX509Cert.EMAIL_CERT);
  emailTreeView.selection.clearSelection();

}

function addEmailCert()
{
  var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
  var fp = Components.classes[nsFilePicker].createInstance(nsIFilePicker);
  fp.init(window,
          bundle.GetStringFromName("importEmailCertPrompt"),
          nsIFilePicker.modeOpen);
  fp.appendFilter(bundle.GetStringFromName("file_browse_Certificate_spec"),
                  "*.crt; *.cert; *.cer; *.pem; *.der");
  fp.appendFilters(nsIFilePicker.filterAll);
  if (fp.show() == nsIFilePicker.returnOK) {
    certdb.importCertsFromFile(null, fp.file, nsIX509Cert.EMAIL_CERT);
    var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    certcache.cacheAllCerts();
    emailTreeView.loadCertsFromCache(certcache, nsIX509Cert.EMAIL_CERT);
    emailTreeView.selection.clearSelection();
    caTreeView.loadCertsFromCache(certcache, nsIX509Cert.CA_CERT);
    caTreeView.selection.clearSelection();
  }
}

function addWebSiteCert()
{
  var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
  var fp = Components.classes[nsFilePicker].createInstance(nsIFilePicker);
  fp.init(window,
          bundle.GetStringFromName("importWebSiteCertPrompt"),
          nsIFilePicker.modeOpen);
  fp.appendFilter(bundle.GetStringFromName("file_browse_Certificate_spec"),
                  "*.crt; *.cert; *.cer; *.pem; *.der");
  fp.appendFilters(nsIFilePicker.filterAll);
  if (fp.show() == nsIFilePicker.returnOK) {
    certdb.importCertsFromFile(null, fp.file, nsIX509Cert.SERVER_CERT);

    var certcache = Components.classes[nsNSSCertCache].createInstance(nsINSSCertCache);
    certcache.cacheAllCerts();
    serverTreeView.loadCertsFromCache(certcache, nsIX509Cert.SERVER_CERT);
    serverTreeView.selection.clearSelection();
    caTreeView.loadCertsFromCache(certcache, nsIX509Cert.CA_CERT);
    caTreeView.selection.clearSelection();
  }
}
