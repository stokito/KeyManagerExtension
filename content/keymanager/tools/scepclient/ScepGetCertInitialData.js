
var ScepGetCertInitialData = {

loadGetInitialCertTestData : function ()
{

    dump("loadGetInitialCertTestData(): ...................Start.\n");

    resetScepGetInitialCertList();

    var prevCertObj = null;
    var caServerURL = "https://pdev19vm3.platform.avaya.com/ejbca/publicweb/apply/scep/pkiclient.exe";

    var userCerNickNameList = ["Test111", "Pervez"];
    // var recipientCerNickNameList = ["DelgAlrSubCA - Avayalabs", "MyRA111"];
    var recipientCerNickNameList = ["DelgAlrSubCA - Avayalabs", "default - AVAYA"];
    for (var i = 0; i < userCerNickNameList.length; i++) {
	var userCertNickName = userCerNickNameList[i];
	var recipientCerNickName = recipientCerNickNameList[i];

	var userX509Cert = null;
	try {
	    userX509Cert = certdb.findCertByNickname(null, userCertNickName);
	} catch (ex) {}
	if (!userX509Cert) {
	    continue;
	}
	var recipientX509Cert = null;
	try {
	    recipientX509Cert = certdb.findCertByNickname(null, recipientCerNickName);
	} catch (ex) {}
	if (!recipientX509Cert) {
	    continue;
	}

	var count = (i + 1);
	var transactionId = "" + ((1000 * count) + (100 * count) + (10 * count) + count);


	var reqIdMenuLabel = addScepGetInitialCertByRequest(
					userX509Cert,
					recipientX509Cert,
					transactionId,
					caServerURL
					);
	    /*
	    var scepGetInitialCertObj = createScepGetInitialCertObj();

	    scepGetInitialCertObj.userCertNickName = userX509Cert.nickname;
	    scepGetInitialCertObj.userCertSubject = userX509Cert.subjectName;

	    scepGetInitialCertObj.scepRecipientCertNickName = recipientCerNickName.nickname;
	    scepGetInitialCertObj.scepRecipientCertSubject = recipientCerNickName.subjectName;

	    scepGetInitialCertObj.transactionId = (1000 * i) + (100 * i) + (10 * i) + i;
	    scepGetInitialCertObj.caServerURL = "http://xxxx.com/scep.exe";
	    addScepGetInitialCert(scepGetInitialCertObj);
	    prevCertObj = scepGetInitialCertObj;
	    */
    }
    // dump("loadGetInitialCertTestData(): ...................End.\n");


    /*
    var scepGetInitialCertList = loadScepGetInitialCertList();
    for (var currCert = scepGetInitialCertList; currCert != null; currCert = currCert.next) {
    	removeScepGetInitialCert(currCert);
    }
    */
    dump("loadGetInitialCertTestData(): ...................End.\n");
},


initGetCertInitialList : function (aReqIdMenuListElem)
{

    var lastItemLabel = "";
    if (aReqIdMenuListElem.selectedItem) {
        if (aReqIdMenuListElem.selectedIndex >= 0) {
    	    lastItemLabel = aReqIdMenuListElem.selectedItem.label;
    	}
    }
    if (lastItemLabel == "") {
    	lastItemLabel = getPrefStringValue(aReqIdMenuListElem.id);
	if (lastItemLabel == null) {
	    lastItemLabel = "";
	}
    }
    // dump("initGetCertInitialList(): lastItemLabel: " + lastItemLabel + "\n");

    aReqIdMenuListElem.removeAllItems();
    aReqIdMenuListElem.selectedIndex = -1;
    aReqIdMenuListElem.value = "";

    var scepGetInitialCertList = loadScepGetInitialCertList();
    if (scepGetInitialCertList == null) {
    	return;
    }

    // aReqIdMenuListElem.appendItem("", "");
    var selectedIndex = -1;
    var /* Menuitem */ selectedItem = null;
    var /* Menuitem */ menuItemNode = null;
    var i = 0;
    for (var currCert = scepGetInitialCertList; currCert != null; currCert = currCert.next) {

        var menuItemLabel = currCert.userCertSubject + "|" + currCert.transactionId;
        var menuItemValue = currCert.itemStr;

	// dump("initGetCertInitialList(): i: " + i + " menuItemValue: " + menuItemValue + "\n");
	// menuItemNode = aReqIdMenuListElem.appendItem(menuItemLabel, menuItemValue);
	menuItemNode = aReqIdMenuListElem.appendItem(menuItemLabel, menuItemLabel);
	menuItemNode.pendingInitialCert = currCert;
	menuItemNode.pendingInitialCertStr = currCert.itemStr;
	/*
	if (i == 0) {
	    selectedIndex = i;
	    selectedItem = menuItemNode;
	}
	*/
	if (lastItemLabel == menuItemLabel) {
	    // dump("initGetCertInitialList(): i: " + i + " menuItemLabel: " + menuItemLabel + "\n");
	    selectedIndex = i;
	    selectedItem = menuItemNode;
	}
	i++;
    }
    if (selectedIndex >= 0) {
    	// aReqIdMenuListElem.value = selectedItem.value;
    	aReqIdMenuListElem.selectedIndex = selectedIndex;
    }
    // dump("initGetCertInitialList(): selectedIndex : " + selectedIndex + "(" + i + ")\n");
},



resetScepGetInitialCertList : function ()
{
    setPrefStringValue("extensions.avpki.scepclient.getInitialCert.list", "");
},

createScepGetInitialCertObj : function (getIntialCertStr)
{
    // dump("createScepGetInitialCertObj():.........................Start.\n");

    if ((getIntialCertStr != null) && (getIntialCertStr.length == 0)) {
	return null;
    }

    var scepGetInitialCertObj = new Object();
    scepGetInitialCertObj.prev = null;
    scepGetInitialCertObj.next = null;

    scepGetInitialCertObj.itemStr = null;

    scepGetInitialCertObj.userCertNickName = null;
    scepGetInitialCertObj.userCertSubject = null;
    scepGetInitialCertObj.scepRecipientCertNickName = null;
    scepGetInitialCertObj.scepRecipientCertSubject = null;
    scepGetInitialCertObj.transactionId = null;
    scepGetInitialCertObj.caServerURL = null;

    scepGetInitialCertObj.userCertDbKey = null;
    scepGetInitialCertObj.userCert = null;
    scepGetInitialCertObj.scepRecipientCertDbKey = null;
    scepGetInitialCertObj.scepRecipientCert = null;

    if (getIntialCertStr == null) {
    	return scepGetInitialCertObj;
    }

    // dump("createScepGetInitialCertObj(): getIntialCertStr: " + getIntialCertStr + "\n");

    var scepGetInitialCertCompList = getIntialCertStr.split("|");
    if (scepGetInitialCertCompList.length == 0) {
    	return scepGetInitialCertObj;
    }
    // dump("createScepGetInitialCertObj(): scepGetInitialCertCompList.length: " + scepGetInitialCertCompList.length + "\n");

    scepGetInitialCertObj.itemStr = getIntialCertStr;
    for (var j = 0; j < scepGetInitialCertCompList.length; j++) {
        var scepGetInitialCertComp = scepGetInitialCertCompList[j];
	switch(j) {
	    case 0: 
	        scepGetInitialCertObj.userCertNickName = scepGetInitialCertComp;
	    	break;
	    case 1: 
	        scepGetInitialCertObj.userCertSubject = scepGetInitialCertComp;
	    	break;
	    case 2: 
	    	scepGetInitialCertObj.scepRecipientCertNickName = scepGetInitialCertComp;
		break;
	    case 3: 
	    	scepGetInitialCertObj.scepRecipientCertSubject = scepGetInitialCertComp;
		break;
	    case 4: 
	    	scepGetInitialCertObj.transactionId = scepGetInitialCertComp;
		break;
	    case 5: 
	    	scepGetInitialCertObj.caServerURL = scepGetInitialCertComp;
		break;
	    case 6: 
		if (scepGetInitialCertComp.length > 0) {
	        scepGetInitialCertObj.userCertDbKey = decodeURIComponent(scepGetInitialCertComp);
		}
	    	break;
	    case 7: 
		if (scepGetInitialCertComp.length > 0) {
	        scepGetInitialCertObj.scepRecipientCertDbKey = decodeURIComponent(scepGetInitialCertComp);
		}
	    	break;
	    default:
		break;
	}
    }

    scepGetInitialCertObj.userCert = null;

    var certRef = null;
    try {
    if (scepGetInitialCertObj.userCertDbKey != null) {
    	// dump("createScepGetInitialCertObj():.........................10.\n");
        certRef = certdb.findCertByDBKey(scepGetInitialCertObj.userCertDbKey , null);
    }
    else if (scepGetInitialCertObj.userCertNickName != null) {
    	// dump("createScepGetInitialCertObj():.........................12.\n");
	certRef = certdb.findCertByNickname(null, scepGetInitialCertObj.userCertNickName);
	scepGetInitialCertObj.userCertDbKey = certRef.dbKey;
    }
    else {
    	certRef = null;
    }
    } catch (ex) {
    	dump("createScepGetInitialCertObj(): failed to get user cert - ex: : " + ex + "\n");
    	certRef = null;
    }
    scepGetInitialCertObj.userCert = certRef;
    // dump("createScepGetInitialCertObj(): scepGetInitialCertObj.userCert: " + certRef +  "(" + scepGetInitialCertObj.userCertNickName + ")" + "\n");

    certRef = null;
    try {
    if (scepGetInitialCertObj.scepRecipientCertDbKey != null) {
        certRef = certdb.findCertByDBKey(scepGetInitialCertObj.scepRecipientCertDbKey , null);
    }
    else if (scepGetInitialCertObj.scepRecipientCertNickName != null) {
	certRef = certdb.findCertByNickname(null, scepGetInitialCertObj.scepRecipientCertNickName);
	scepGetInitialCertObj.scepRecipientCertDbKey = certRef.dbKey;
    }
    else {
    	certRef = null;
    }
    } catch (ex) {
    	certRef = null;
    	dump("createScepGetInitialCertObj(): failed to get issuer cert - ex: : " + ex + "\n");
    }
    scepGetInitialCertObj.scepRecipientCert = certRef;
    // dump("createScepGetInitialCertObj(): scepGetInitialCertObj.scepRecipientCert: " + certRef +  "(" + scepGetInitialCertObj.scepRecipientCertNickName + ")" + "\n");

    // dump("createScepGetInitialCertObj():.........................End.\n");

    return scepGetInitialCertObj;
},


loadScepGetInitialCertList : function ()
{
    // dump("loadScepGetInitialCertList(): ...................Start.\n");
    var scepGetInitialCertList = null;

    var scepGetInitialCertListStr = getPrefStringValue("extensions.avpki.scepclient.getInitialCert.list");
    if (scepGetInitialCertListStr == null) {
    	return scepGetInitialCertList;
    }
    // dump("loadScepGetInitialCertList(): scepGetInitialCertListStr: " + scepGetInitialCertListStr + "\n");
    if (scepGetInitialCertListStr.length == 0) {
    	return scepGetInitialCertList;
    }

    var scepGetInitialCertStrList = scepGetInitialCertListStr.split(";");
    var currScepGetInitialCert = null;
    for (var i = 0; i < scepGetInitialCertStrList.length; i++) {
    	var scepGetInitialCertItemStr = scepGetInitialCertStrList[i];
	var scepGetInitialCertObj = createScepGetInitialCertObj(scepGetInitialCertItemStr);
	if (scepGetInitialCertObj == null) {
	    continue;
	}


	if (currScepGetInitialCert != null) {
	    currScepGetInitialCert.next = scepGetInitialCertObj;
	    scepGetInitialCertObj.prev = currScepGetInitialCert;
	}
	else {
	    scepGetInitialCertList = scepGetInitialCertObj;
	}
	currScepGetInitialCert = scepGetInitialCertObj;
    }

    // dump("loadScepGetInitialCertList():certName: " + scepGetInitialCertList.userCertNickName + "\n");
    // dump("loadScepGetInitialCertList(): ...................End.\n");
    return scepGetInitialCertList;
},

saveScepGetInitialCertList : function (scepGetInitialCertList)
{
    // dump("saveScepGetInitialCertList(): ...................Start.\n");
    if (scepGetInitialCertList == null) {
	resetScepGetInitialCertList();
	return;
    }
    // dump("saveScepGetInitialCertList():certName: " + scepGetInitialCertList.userCertNickName + "\n");

    var scepGetInitialCertListStr = "";
    for (var currCert = scepGetInitialCertList; currCert != null; currCert = currCert.next) {
    	var scepGetInitialCertStr = "";
	scepGetInitialCertStr += currCert.userCertNickName; scepGetInitialCertStr += "|";
	scepGetInitialCertStr += currCert.userCertSubject; scepGetInitialCertStr += "|";
	scepGetInitialCertStr += currCert.scepRecipientCertNickName; scepGetInitialCertStr += "|";
	scepGetInitialCertStr += currCert.scepRecipientCertSubject; scepGetInitialCertStr += "|";
	scepGetInitialCertStr += currCert.transactionId; scepGetInitialCertStr += "|";
	if (currCert.caServerURL != null) {
	    scepGetInitialCertStr += currCert.caServerURL; scepGetInitialCertStr += "|";
	}
	else {
	    scepGetInitialCertStr += ""; scepGetInitialCertStr += "|";
	}
	if (currCert.userCertDbKey) {
	    scepGetInitialCertStr += encodeURIComponent(currCert.userCertDbKey); scepGetInitialCertStr += "|";
	}
	else {
	    scepGetInitialCertStr += ""; scepGetInitialCertStr += "|";
	}
	if (currCert.scepRecipientCertDbKey) {
	    scepGetInitialCertStr += encodeURIComponent(currCert.scepRecipientCertDbKey); scepGetInitialCertStr += "|";
	}
	else {
	    scepGetInitialCertStr += ""; scepGetInitialCertStr += "|";
	}

	scepGetInitialCertListStr += scepGetInitialCertStr + ";";

	/*
	dump("saveScepGetInitialCertList(): scepGetInitialCertStr: " + scepGetInitialCertStr + "\n");
	*/

    }
    // dump("saveScepGetInitialCertList(): scepGetInitialCertListStr: " + scepGetInitialCertListStr + "\n");
    setPrefStringValue("extensions.avpki.scepclient.getInitialCert.list", scepGetInitialCertListStr);

    // dump("saveScepGetInitialCertList(): ...................End.\n");
    // dump("\n");
},


removeScepGetInitialCert : function (scepGetInitialCertObj)
{
    // dump("removeScepGetInitialCert(): ...................Start.\n");
    var scepGetInitialCertList = loadScepGetInitialCertList();
    for (var currCert = scepGetInitialCertList; currCert != null; currCert = currCert.next) {
	    /*
    	    dump("    userCertNickName: " + currCert.userCertNickName + " == " + scepGetInitialCertObj.userCertNickName + "\n");
    	    dump("    userCertSubject: " + currCert.userCertSubject + " == " + scepGetInitialCertObj.userCertSubject + "\n");
    	    dump("    caCertNickName: " + currCert.scepRecipientCertNickName + " == " + scepGetInitialCertObj.scepRecipientCertNickName + "\n");
    	    dump("    caCertSubject: " + currCert.scepRecipientCertSubject + " == " + scepGetInitialCertObj.scepRecipientCertSubject + "\n");
    	    dump("    transactionId: " + currCert.transactionId + " == " + scepGetInitialCertObj.transactionId + "\n");
	    dump("\n");
	    */
    	if ((currCert.userCertNickName == scepGetInitialCertObj.userCertNickName)
    	    && (currCert.userCertSubject == scepGetInitialCertObj.userCertSubject)
    	    && (currCert.scepRecipientCertNickName == scepGetInitialCertObj.scepRecipientCertNickName)
    	    && (currCert.scepRecipientCertSubject == scepGetInitialCertObj.scepRecipientCertSubject)
    	    && (currCert.transactionId == scepGetInitialCertObj.transactionId)) {
	    deleteScepGetInitialCert(currCert);
    	    // dump("removeScepGetInitialCert(): ...................End.\n");
	    return;
	}
    }
    // dump("removeScepGetInitialCert(): ...................End(1).\n");
},


deleteScepGetInitialCert : function (scepGetInitialCertObj)
{
    // dump("deleteScepGetInitialCert(): ...................Start.\n");
    // dump("deleteScepGetInitialCert():certName: " + scepGetInitialCertObj.userCertNickName + "\n");

    if (scepGetInitialCertObj == null) {
    	return;
    }
    var prev = scepGetInitialCertObj.prev;
    if (prev != null) {
    	prev.next = next;
    }

    var next = scepGetInitialCertObj.next;
    if (next != null) {
    	next.prev = prev;
    }

    var firstCert = null;
    if (prev == null) {
    	firstCert = next;
    }
    else {
    	for (var tempCert = prev; tempCert != null;  tempCert = tempCert.prev) {
	    firstCert = tempCert;
	}
    }
    // dump("deleteScepGetInitialCert(): firstCert: " + firstCert + "\n");
    saveScepGetInitialCertList(firstCert);

    // dump("deleteScepGetInitialCert(): ...................End.\n");
},


addScepGetInitialCertByRequest : function (aUserCert, aSCEPRecipientCert, aTransactionId, aCaServerURL)
{
    // TODO: We should use Session store of FF2 insead of preferences to store the request info.
    // (http://developer.mozilla.org/en/docs/Session_store_API)

    // dump("addScepGetInitialCertByRequest(): ...................Start.\n");

    var scepGetInitialCertObj = createScepGetInitialCertObj();

    scepGetInitialCertObj.userCertNickName	= aUserCert.nickname;
    scepGetInitialCertObj.userCertDbKey		= aUserCert.dbKey;
    // dump("addScepGetInitialCertByRequest(): userCertDbKey: " + scepGetInitialCertObj.userCertDbKey + "\n");
    scepGetInitialCertObj.userCertSubject	= aUserCert.subjectName;
    scepGetInitialCertObj.userCert		= aUserCert;
    // dump("addScepGetInitialCertByRequest(): userCert: " + scepGetInitialCertObj.userCert + "\n");

    scepGetInitialCertObj.scepRecipientCertNickName	= aSCEPRecipientCert.nickname;
    scepGetInitialCertObj.scepRecipientCertDbKey		= aSCEPRecipientCert.dbKey;
    // dump("addScepGetInitialCertByRequest(): caCertDbKey: " + scepGetInitialCertObj.scepRecipientCertDbKey + "\n");
    scepGetInitialCertObj.scepRecipientCertSubject		= aSCEPRecipientCert.subjectName;
    scepGetInitialCertObj.scepRecipientCert		= aSCEPRecipientCert;
    // dump("addScepGetInitialCertByRequest(): caCert: " + scepGetInitialCertObj.scepRecipientCert + "\n");

    scepGetInitialCertObj.transactionId		= aTransactionId;

    scepGetInitialCertObj.caServerURL		= aCaServerURL;

    var reqIdMenuLabel = addScepGetInitialCert(scepGetInitialCertObj);

    // dump("addScepGetInitialCertByRequest(): ...................End.\n");
    return reqIdMenuLabel;
},

addScepGetInitialCert : function (scepGetInitialCertObj)
{
    // dump("addScepGetInitialCert(): ...................Start.\n");
    // dump("addScepGetInitialCert():certName: " + scepGetInitialCertObj.userCertNickName + "\n");

    var scepGetInitialCertList = loadScepGetInitialCertList();

    var lastCert = null;
    for (var currCert = scepGetInitialCertList; currCert != null; currCert = currCert.next) {
    	lastCert = currCert;
    }

    if (lastCert != null) {
    	lastCert.next = scepGetInitialCertObj;
	scepGetInitialCertObj.prev = lastCert;
    }
    else {
    	scepGetInitialCertList = scepGetInitialCertObj;
    }
    saveScepGetInitialCertList(scepGetInitialCertList);

    var menuItemLabel = scepGetInitialCertObj.userCertSubject + "|" + scepGetInitialCertObj.transactionId;

    // dump("addScepGetInitialCert(): ...................End.\n");
    return menuItemLabel;
},

generateScepGetCertInitialRequest : function (scepGetInitialCertObj)
{
    // dump("generateScepGetCertInitialRequest(): ...................Start.\n");

    if (scepGetInitialCertObj == null) {
    	return false;
    }

    var userAlias = scepGetInitialCertObj.userCertNickName;
    var userSubject = scepGetInitialCertObj.userCertSubject;
    var userCert = scepGetInitialCertObj.userCert;
    // dump("generateScepGetCertInitialRequest(): userCert: " + userCert + "\n");

    var scepReqFile = scepClientGetCertInitialFilePathElem.file;
    if (scepReqFile == null) {
    	// dump("generateScepGetCertInitialRequest(): scepClientGetCertInitialFilePathElem.value: " + scepClientGetCertInitialFilePathElem.value + "\n");
        scepReqFile = getLocalFile(scepClientGetCertInitialFilePathElem.value);
    }
    var scepReqFileIsAscii = scepClientGetCertInitialFilePathElem.ascii;

    var caAlias = scepGetInitialCertObj.scepRecipientCertNickName;
    var caSubject = scepGetInitialCertObj.scepRecipientCertSubject;
    var caCert = scepGetInitialCertObj.scepRecipientCert;
    // dump("generateScepGetCertInitialRequest(): caCert: " + caCert + "\n");

    gScepReqTransactionId = scepGetInitialCertObj.transactionId;

    var caServerURL = scepGetInitialCertObj.caServerURL;

    var now = new Date();
    gScepReqSenderNonce = "" + (Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000);
    gScepReqSenderNonce = gScepReqSenderNonce + now.getTime() + gScepReqSenderNonce;
    gScepReqSenderNonce = gScepReqSenderNonce.substring(0, 15);

    var hashAlgName = scepClientGetCertInitialHashAlgElem.value;

    try {
	/*
	*/
    	dump("generateScepGetCertInitialRequest(): " + 
			"Invoking createScepGetCertInitialMessageToFile() \n" + 
			"  userAlias: " + userAlias + "\n" + 
			"  userCert: " + userCert + "\n" + 
			"  caAlias: " + caAlias + "\n" + 
			"  caCert: " + caCert + "\n" + 
			"  gScepReqTransactionId: " + gScepReqTransactionId + "\n" + 
			"  hashAlgName: " + hashAlgName + "\n" + 
			"  gScepReqSenderNonce: " + gScepReqSenderNonce + "\n" + 
			"");
	/*
    	scepPkiClient.createScepGetCertInitialMessageToFile(
					userAlias, caAlias,
	*/
    	scepPkiClient.createScepGetCertInitialMessageByCertToFile(
					userCert, caCert,
					gScepReqTransactionId, hashAlgName, gScepReqSenderNonce,
					scepReqFile, scepReqFileIsAscii
    					);

    } catch (ex) {
	alert("generateScepGetCertInitialRequest(): createScepGetCertInitialMessageToFile() failed - scepCsrGenStatus: " + ex);
	dump("generateScepGetCertInitialRequest(): createScepGetCertInitialMessageToFile() failed - scepCsrGenStatus: " + ex + "\n");
    	return false;
    }

    scepClientScepReqMsgFilePickerElem.ascii		= scepClientGetCertInitialFilePathElem.ascii;
    scepClientScepReqMsgFilePickerElem.file		= scepClientGetCertInitialFilePathElem.file;

    scepClientScepReqMsgFileDataElem.hidden = true;
    if (scepClientScepReqMsgFilePickerElem.ascii) {
    	displayAsciiFileItemData(scepClientScepReqMsgFilePickerElem.ascii, 
    				"keymgr.scepclient.scepreqmsg.file.path",
				"keymgr.scepclient.scepreqmsg.file.asciiData"
				);
    	scepClientScepReqMsgFileDataElem.hidden = false;
    }

    scepClientScepReqMsgUserCertItemElem.cert	= scepGetInitialCertObj.userCert;
    scepClientScepReqMsgIssuerCertItemElem.cert	= scepGetInitialCertObj.scepRecipientCert;

    scepClientScepReqMsgTransactionIdElem.value	= gScepReqTransactionId;
    scepClientScepReqMsgServerUrlElem.value	= scepGetInitialCertObj.caServerURL;

    initScepRespOutFile();
    initScepRespCertOutFile();

    scepClientScepRespMsgGroupElem.hidden = false;

    // dump("generateScepGetCertInitialRequest(): ...................End.\n");
    return true;
},

    lastMethod : function ()
    {
    }

}
