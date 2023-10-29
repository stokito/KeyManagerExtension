25a26,28
>  *   Modified by: 
>  *   Subrata Mazumdar <mazum@avaya.com>
>  *
65a69
> var userKeyTreeView;
76a81
>   filterCertCacheForNonProxyCerts(certcache);
114a120,122
> 
>   LoadUserKeys(certcache);
>   LoadProxyCerts();
123a132
>   var mine_key_tab = document.getElementById("mine_key_tab");
134a144,145
>   } else if (mine_key_tab.selected) {
>     items = userKeyTreeView.selection;
135a147,151
> 
>   // TODO: Alternative to the above code to obtain items.
>   // var certTreeView = getSelectedCertTreeView();
>   // items = certTreeView.selection;
>   
157a174,175
>         } else if (mine_key_tab.selected) {
>           cert = userKeyTreeView.getCert(j);
175a194
>   var mine_key_tab = document.getElementById("mine_key_tab");
186a206,207
>   } else if (mine_key_tab.selected) {
>     items = userKeyTreeView.selection;
211a233,234
>         } else if (mine_key_tab.selected) {
>           tree_item = userKeyTreeView.getTreeItem(j);
426a450
>     filterCertCacheForNonProxyCerts(certcache);
481a506,509
>   else if (selTabID == 'mine_key_tab') 
>   {
>     params.SetString(0, 'mine_tab');
>   } 
520a549,551
>     } else if (selTabID == "mine_key_tab") {
>       // treeView = userKeyTreeView;
>       treeView = userTreeView;
568a600,601
>   filterCertCacheForNonProxyCerts(certcache);
> 
578a612,618
> 
>   /*
>   userKeyTreeView.loadCertsFromCache(certcache, nsIX509Cert.USER_CERT);
>   userKeyTreeView.selection.clearSelection();
>   */
>   LoadUserKeys(certcache);
>   LoadProxyCerts();
594a635
>     filterCertCacheForNonProxyCerts(certcache);
616a658
>     filterCertCacheForNonProxyCerts(certcache);
629a672
>   filterCertCacheForNonProxyCerts(certcache);
635a679,742
> function getSelectedCertTreeView()
> {
>     // SM: My own method 
>     // TODO: Mozilla-PSM should fix the naming of the 'tabs' elem.
>     //       We should name (id) the 'tabbox' elem as 'certMgrTabbox' not the  'tabs' element.
>     //       In addition, we should name the 'tabpanels', as well as define tabpanel with 
>     //       appropriate unique id. All the 'vbox' under 'tabpanels' should be replaced with 
>     //       enclosed within 'tabpanel' tag.
>     //       Labeling XUL elements with 'id' allows us to directly select them as well as 
>     //       add new elements using the 'overlay' before, after or inside the element.
> 
>     var certTabsElem = document.getElementById('certMgrTabbox');
>     var certTabboxElem = certTabsElem.parentNode;
>     // dump("getSelectedCertTree(): certTabboxElem: " + certTabboxElem + "\n");
>     // dump("getSelectedCertTree(): certTabboxElem.tagName: " + certTabboxElem.tagName + "\n");
>     // dump("getSelectedCertTree(): certTabboxElem.selectedIndex: " + certTabboxElem.selectedIndex + "\n");
> 
>     var selectedTabElem = certTabboxElem.selectedTab;
>     // dump("getSelectedCertTree(): selectedTabElem: " + selectedTabElem + "\n");
> 
>     var selectedTabpanelElem = certTabboxElem.selectedPanel;
>     dump("getSelectedCertTree(): selectedTabpanelElem: " + selectedTabpanelElem + "\n");
> 
>     /*
>     var tabpanelsElemList = certTabboxElem.getElementsByTagName("tabpanels");
>     var certTabpanelsElem = null;
>     if ((tabpanelsElemList) && (tabpanelsElemList.length > 0)) {
>     	certTabpanelsElem = tabpanelsElemList[0];
>     }
>     dump("getSelectedCertTree(): certTabpanelsElem: " + certTabpanelsElem + "\n");
>     if (!certTabpanelsElem) {
>     	return null;
>     }
>     selectedTabpanelElem = certTabpanelsElem.selectedPanel;
>     // dump("getSelectedCertTree(): selectedTabpanelElem: " + selectedTabpanelElem + "\n");
>     */
> 
>     if (!selectedTabpanelElem) {
>     	return null;
>     }
>     var certTreeElem = null;
>     var certTreeElemList = selectedTabpanelElem.getElementsByTagName("tree");
>     if ((certTreeElemList) && (certTreeElemList.length > 0)) {
>     	certTreeElem = certTreeElemList[0];
>     }
>     // dump("getSelectedCertTree(): certTreeElem: " + certTreeElem + "(" + certTreeElem.id + ")\n");
> 
>     var certTreeViewObj = certTreeElem.treeBoxObject.view
>     dump("getSelectedCertTree(): certTreeViewObj: " + certTreeViewObj + "\n");
> 
>     var /* nsICertTree */ certTreeView = null;
>     try {
>     	certTreeView = certTreeViewObj.QueryInterface(Components.interfaces.nsICertTree);
>     } catch (ex) {
>     	dump("getSelectedCertTree(): certTreeViewObj.QueryInterface() failed.\n");
>         certTreeView = certTreeViewObj.certTreeView;
> 	if (!certTreeView) {
> 	    certTreeView = certTreeElem.certTreeView;
> 	}
>     }
>     dump("getSelectedCertTree(): certTreeView: " + certTreeView + "\n");
>     return certTreeView;
> }
> 
