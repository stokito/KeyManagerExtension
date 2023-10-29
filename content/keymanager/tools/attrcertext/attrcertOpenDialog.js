
function AttrCertTool_OpenDialog(aAttrCertInFilePath, aAttrCertInFileBase64)
{
    var acSourceType = 1; // 0 ==> New, 1 ==> Load

    var attrCertInFilePath = aAttrCertInFilePath;
    var attrCertInFileBase64 = aAttrCertInFileBase64;
   

    var acDialogPKIParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
			.createInstance(Components.interfaces.nsIPKIParamBlock);
    var params = acDialogPKIParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);

    // Set the Load option 
    params.SetInt(0, acSourceType);
    // Set the input Attribute Cert file path and encoding options
    if (attrCertInFilePath && (attrCertInFilePath != "")) {
	params.SetString(0, attrCertInFilePath);
	if (attrCertInFileBase64) {
	    params.SetString(1, "base64");
	}
    }

    var attrCertDialogURL = "chrome://keymanager/content/tools/attrcertext/AttrCertForm.xul";
    window.openDialog(
		attrCertDialogURL,
		'_blank',
		'chrome,centerscreen,resizable,dialog=no,titlebar',
		acDialogPKIParams
		);
}

