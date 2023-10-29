
let Cu = Components.utils;
let Ci = Components.interfaces;
let Cc = Components.classes;
let Cr = Components.results;


/* Load XPCOMUtils Javascript module */
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

function ALRFileUtilImpl_log(aMessage) {
    var _msg = "ALRFileUtilImpl: " + aMessage + "\n";
    dump(_msg);
}

function _ALRFileUtilImpl()
{
    // dump("ALRFileUtilImpl()..............Start.\n");

    // If you only need to access your component from Javascript, uncomment the following line:
    this.wrappedJSObject = this;

    try {
    	this.init();
    } catch (ex) {
    	dump("ALRFileUtilImpl.init(): this.init() failed - ex: " + ex + "\n");
    }

    // dump("ALRFileUtilImpl()..............End.\n");
}

_ALRFileUtilImpl.prototype = {
    /** 
     * .classID is required for generateNSGetFactory to work correctly.
     * Make sure this CID matches the "component" in your .manifest file.
     */
    classID :          Components.ID("{063fd8b4-fca6-49a6-8c8b-4baa316e9e48}"),
    /**
     * .classDescription and .contractID are only used for
     * * backwards compatibility with Gecko 1.9.2 and
     * * XPCOMUtils.generateNSGetModule.
     */
    classDescription : "XPCOM File Util - JavaScript Impl",
    contractID :	    "@avaya.com/avpki/js/fileutil;1",
    flags : (Components.interfaces.nsIClassInfo.DOM_OBJECT | Components.interfaces.nsIClassInfo.SINGLETON),
    implementationLanguage : Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT,
    getInterfaces: function(count) {
	var ifaces = new Array();
	ifaces.push(Components.interfaces.alrIFileUtil);
	ifaces.push(Components.interfaces.nsIClassInfo);
	ifaces.push(Components.interfaces.nsISupports);
	count.value = ifaces.length;
	return ifaces;
    },
    /*
    */
    getHelperForLanguage: function(language) {
	return null;
    },

    /**
     * List all the interfaces your component supports.
     * Cpmponent interfaces must be derived from nsISupports in IDL file.
     * @note nsISupports is generated automatically; you don't need to list it.
     */
    QueryInterface : XPCOMUtils.generateQI([
			Components.interfaces.alrIFileUtil,
			Components.interfaces.nsIClassInfo,
			Components.interfaces.nsISupports
			]),

    /*
    mXmlParser : Components.classes["@mozilla.org/xmlextras/domparser;1"]
			              .getService(Components.interfaces.nsIDOMParser),
    mXmlSerializer : Components.classes["@mozilla.org/xmlextras/xmlserializer;1"]
			              .getService(Components.interfaces.nsIDOMSerializer),
    */
    mIOService : Components.classes["@mozilla.org/network/io-service;1"]
			              .getService(Components.interfaces.nsIIOService),
    init : function()
    {
    	// this.logTrace( "ALRFileUtilImpl.init():................Start.");

    	// this.logTrace( "ALRFileUtilImpl.init():................End.");
    },

    logEnabled		: false,
    log : function(logLevel, msg)
    {
	if (!this.logEnabled) {
	    return;
	}
	dump(msg + "\n");
    },
    dump : function(msg)
    {
	this.log(1, msg);
    },
    logError : function(msg)
    {
	this.log(2, msg);
    },
    logTrace : function(msg)
    {
	this.log(4, msg);
    },
    logDebug : function(msg)
    {
	this.log(6, msg);
    },


    /* nsILocalFile */
    getLocalFile : function (/* AString */ filePath) {

	// this.logTrace("ALRFileUtilImpl.getLocalFile(" + filePath + ").......................Start.");
	if (!filePath) {
	    this.logTrace("ALRFileUtilImpl.getLocalFile(" + filePath + ").......................End(0).");
	    return null;
	}

	var /* nsIFile */ localFile = null;
	localFile = Components.classes["@mozilla.org/file/local;1"]
			     .createInstance(Components.interfaces.nsILocalFile);
	localFile.initWithPath(filePath);

	// this.logTrace("ALRFileUtilImpl.getLocalFile(" + localFile + ").......................End.");
	return localFile;
    },

    /* nsIFile */ getProfileDir : function (/* in AString */ aProfileID)
    {
	// First get the directory service and query interface it to
	// nsIProperties
	var dirService = Components.classes['@mozilla.org/file/directory_service;1']
			.getService(Components.interfaces.nsIProperties);

	// Next get the "ProfD" property of type nsIFile from the directory
	// service, FYI this constant is defined in
	// mozilla/xpcom/io/nsAppDirectoryServiceDefs.h
	
	var profileDir = dirService.get(profileID, Components.interfaces.nsIFile);
	return profileDir;
    },

    /* AString */ getProfileDirPath : function (/* in AString */  aProfileID)
    {
	var profileDir = getProfileDirObj(profileID);
	return profileDir.path;
    },

    /* nsIFile */ getTempDir : function ( /* in AString */ aSubDirRelativePath)
    {
	// To create a temporary file, use nsIFile.createUnique():
	// Source: http://kb.mozillazine.org/File_IO#Creating_temporary_files
	var /* nsIFile*/ tmpDirFile = null;
	tmpDirFile = Components.classes["@mozilla.org/file/directory_service;1"].
		getService(Components.interfaces.nsIProperties).
		get("TmpD", Components.interfaces.nsIFile);

	if (aSubDirRelativePath) {
	    var subDirItems = aSubDirRelativePath.split("/");
	    for (var i = 0; i < subDirItems.length; i++) {
		var subDirItem = subDirItems[i];
		if (subDirItem == "") {
		    continue;
		}
		tmpDirFile.append(subDirItem);
	    }
	}

	/*
	if (tmpDirFile.exists() == false) {
		tmpDirFile.create();
	}
	*/

	// dump("selected OUT TEMP DIR: " + tmpDirFile.path + "\n");
	return tmpDirFile;
    },
    /* nsIFile */ getTempFile : function ( /* in AString */ aFileRelativePath, /* in AString */ aFileMode)
    {
	// To create a temporary file, use nsIFile.createUnique():
	// Source: http://kb.mozillazine.org/File_IO#Creating_temporary_files

	var fileMode = aFileMode;
	if (!fileMode) {
	    fileMode = 0664;
	}

	var /* nsIFile*/ tmpLocalFile = null;
	tmpLocalFile = Components.classes["@mozilla.org/file/directory_service;1"].
		getService(Components.interfaces.nsIProperties).
		get("TmpD", Components.interfaces.nsIFile);

	if (aFileRelativePath) {
	    var subDirItems = aFileRelativePath.split("/");
	    for (var i = 0; i < subDirItems.length; i++) {
		var subDirItem = subDirItems[i];
		if (subDirItem == "") {
		    continue;
		}
		tmpLocalFile.append(subDirItem);
		if ((i < (subDirItems.length -1)) && !tmpLocalFile.exists()) {
		    tmpLocalFile.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
		}

	    }
	}
	tmpLocalFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, fileMode);

	// dump("selected OUT TEMP File: " + tmpLocalFile.path + "\n");

	return tmpLocalFile;
    },

    /* AString */ readDataFromURI : function (/* in nsIURI */ aDataURI)
    {
		var ioService = Components.classes["@mozilla.org/network/io-service;1"]
				  .getService(Components.interfaces.nsIIOService);
	    
		// get a channel for that nsIURI
		var channel = ioService.newChannelFromURI(aDataURI);
		if (!channel) {
		    this.logError("readDataFromURL(): ioService.newChannelFromURI() failed.");
		    return null;
		}
	    
		var channelIS = null;
		/*
		var jarChannel = channel.QueryInterface(Components.interfaces.nsIJARChannel);
		if (jarChannel) {
		    channelIS = jarChannel.open();
		}
		else {
		    channelIS = channel.open();
		}
		*/
		channelIS = channel.open();
		if (!channelIS) {
		    this.logError("ALRFileUtilImpl.readDataFromURI(): channel.open() failed.");
		    return null;
		}
	    
		var siStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
			.createInstance(Components.interfaces.nsIScriptableInputStream);
		siStream.init(channelIS);

		var dataCnt = 0;
		try {
		    dataCnt = siStream.available();
		} catch (ex) {
		    this.logError("readDataFromURL(): siStream.available() failed - ex: " + ex);
		    throw ex;
		}
		if (dataCnt == 0) {
		    this.logError("readDataFromURL(): siStream.available() failed.");
		    return null;
		}

		var urlDataStr = "";
		var str = siStream.read(-1);
		while (str.length > 0) {
		    urlDataStr += str;
		    str = siStream.read(-1);
		}
	    
		siStream.close();
		channelIS.close();
	    
		this.logTrace( "ALRFileUtilImpl.readDataFromURI():................End.");
		return urlDataStr;
    },
    /* AString */ readDataFromURIStr : function (/* in AString */ aDataURIStr)
    {
	this.logTrace("ALRFileUtilImpl.readDataFromURIStr(" + aDataURIStr + "):................Start.");

	var ioService = Components.classes["@mozilla.org/network/io-service;1"]
			              .getService(Components.interfaces.nsIIOService);
	// create an nsIURI
	var dataURI = ioService.newURI(aDataURIStr, null, null);

	var dataStr =  this.readDataFromURI(dataURI);
    
	this.logTrace("ALRFileUtilImpl.readDataFromURIStr(" + aDataURIStr + "):................End.");
	return dataStr;
    },


    /* AString */ readDataFromFile : function (/* in nsILocalFile */ aInFile)
    {
		var /* nsIFileURI */ inFileURI = this.mIOService.newFileURI(aInFile);
		this.logDebug("readDataFromFile(): inFileURI.spec: " + inFileURI.spec);

		var fileData = this.readDataFromURI(inFileURI);
		return fileData;
    },
    /* void */ saveDataToFile : function (/* in AString */ aFileData, /* in nsILocalFile */ aOutFile)
    {
		if (!aOutFile) {
		    alert("saveFile(): this.file == NULL");
		    return;
		}
		if (!aFileData) {
		    alert("saveFile(): aFileData == NULL");
		    return;
		}
		// dump("ALRFileUtilImpl.saveFile():\n" + aFileData + "\n");

		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
			    createInstance(Components.interfaces.nsIFileOutputStream);
		foStream.QueryInterface(Components.interfaces.nsIOutputStream);
		foStream.QueryInterface(Components.interfaces.nsISeekableStream);

		foStream.init(aOutFile, (0x02 | 0x08 | 0x20), 0664, 0); // write, create, truncate

		var count = foStream.write(aFileData, aFileData.length);

		foStream.flush();
		foStream.close();

		return;
    },

    /* AString */ readDataFromFilePath : function (/* in AString */ aInFilePath)
    {
	var inFile = this.getLocalFile(aInFilePath);
	if (!inFile) {
	    return null;
	}
	return this.readDataFromFile(inFile);
    },
    /* void */ saveDataToFilePath : function (/* in AString */ aFileData, /* in AString */ aOutFilePath)
    {
	var outFile = this.getLocalFile(aOutFilePath);
	if (!outFile) {
	    return;
	}
	this.saveDataToFile(aFileData, outFile);
	return;
    },
    /* void */ copyFile : function (/* in nsILocalFile */ aInFile, /* nsILocalFile */ aOutFile)
    {
	this.logTrace("ALRFileUtilImpl.copyFile():...............Start.");

	var fileData = this.readDataFromFile(aInFile);
	this.saveDataToFile(fileData, aOutFile);

	this.logTrace("ALRFileUtilImpl.copyFile():...............End.");
	return;
    },
    /* void */ copyFileByPath : function (/* in AString */ aInFilePath, /* AString */ aOutFilePath)
    {
	this.logTrace("ALRFileUtilImpl.copyFileByPath():...............Start.");

	var fileData = this.readDataFromFilePath(aInFilePath);
	this.saveDataToFilePath(fileData, aOutFilePath);

	this.logTrace("ALRFileUtilImpl.copyFileByPath():...............End.");
	return;
    },

    /* PRUint8[] */
    readBinDataByStream : function(/* nsIInputStream */ inputStream)
    {
	var biStream = Components.classes["@mozilla.org/binaryinputstream;1"]
			.createInstance(Components.interfaces.nsIBinaryInputStream);
	biStream.setInputStream(inputStream);
	var binData = biStream.readByteArray(biStream.available());

	biStream.close();
	return binData;
    },

    writeBinDataByStream : function(/* PRUint8[] */ binData, /* nsIOutputStream */ outputStream)
    {
	var boStream = Components.classes["@mozilla.org/binaryoutputstream;1"].
		createInstance(Components.interfaces.nsIBinaryOutputStream);
	boStream.setOutputStream(outputStream);
	boStream.writeByteArray(binData, binData.length);
	boStream.close();
	return;
    },

    readBinDataFromURI : function (/* nsIURI */ dataURI)
    {
	this.logTrace("ALRFileUtilImpl.readDataFromURI():................Start.");

	var ioService = Components.classes["@mozilla.org/network/io-service;1"]
			          .getService(Components.interfaces.nsIIOService);

	// get a channel for that nsIURI
	var /* nsIChannel */ channel = ioService.newChannelFromURI(dataURI);
	if (!channel) {
	    this.logError("readDataFromURI(): ioService.newChannelFromURI() failed.");
	    return null;
	}

	var /* nsIInputStream */ channelIS = null;
	var jarChannel = null;
	try {
	    jarChannel = channel.QueryInterface(Components.interfaces.nsIJARChannel);
	} catch (ex) {} 
	if (jarChannel) {
	    channelIS = jarChannel.open();
	}
	else {
	    channelIS = channel.open();
	}

	if (!channelIS) {
	    this.logError("readDataFromURL(): jarChannel.open() failed.");
	    return null;
	}

	var binData = this.readBinDataByStream(fiStream);

	channelIS.close();

	this.logTrace("ALRFileUtilImpl.readDataFromURI():................End.");
	return binData;
    },

    /* PRUint8[] */
    readBinDataFromFile : function(/* nsIFile */ aInFile, /* Object */ aLengthObj)
    {
	this.logTrace("ALRFileUtilImpl.readBinDataFromFile().......................Start.");
	if (aInFile.exists() == false ) {
	    this.logError("ALRFileUtilImpl.readBinDataFromFile(): File: " + aInFile.path + " does not exist.");
	    return null;
	}

	var /* nsIIOService */ ios = Components.classes["@mozilla.org/network/io-service;1"]
					.getService(Components.interfaces.nsIIOService);
	var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
					.createInstance(Components.interfaces.nsIFileInputStream);
	fiStream.init(aInFile, 1, 0, false);
	// fiStream.init(aInFile, 0x01, 00004, null);

	var binData = this.readBinDataByStream(fiStream);
	aLengthObj.value = binData.length;

	fiStream.close();

	this.logTrace("ALRFileUtilImpl.readBinDataFromFile().......................End.");
	return binData;
    },

    readBinDataFromFilePath : function(aInFilePath, /* Object */ aLengthObj)
    {
	this.logTrace("ALRFileUtilImplModule.readBinDataFromFilePath(" + filePath + ").......................Start.");
	var xfile = this.getLocalFile(aInFilePath);
	if (!xfile) {
	    return null;
	}

	var binData =  this.readBinDataFromFile(xfile, aLengthObj);
	// aLengthObj.value = binData.length;

	this.logTrace("ALRFileUtilImplModule.readBinDataFromFilePath().......................End.");
	return binData;
    },

    saveBinDataToFile : function(/* PRUint8[] */ aBytes, /* int */ aLength, /* nsIFile*/ aOutFile)
    {
	this.logTrace("ALRFileUtilImpl.saveBinDataToFile():..........Start.");

	// To create a temporary file, use nsIFile.createUnique():
	// Source: http://kb.mozillazine.org/File_IO#Creating_temporary_files

	if (aOutFile == null) {
	    alert("saveBinDataToFile(): outFile == NULL");
	    return;
	}
	if ((aBytes == null) || (aBytes.length <= 0)) {
	    alert("saveBinDataToFile(): aBytes == NULL");
	    return;
	}
	this.logTrace("XULFileUtil.js(): saveBinDataToFile():..........1.");
    
	var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
		    createInstance(Components.interfaces.nsIFileOutputStream);
	foStream.QueryInterface(Components.interfaces.nsIOutputStream);
	foStream.init(aOutFile, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate

	this.writeBinDataByStream(aBytes, foStream);

	this.logDebug("ALRFileUtilImpl.saveBinDataToFile(): " + aBytes.length + " baytes written to " + aOutFile.path + "");

	this.logTrace("ALRFileUtilImpl.saveBinDataToFile():..........End.");
    },

    saveBinDataToFilePath : function(/* PRUint8[] */ aBytes, /* int */ aLength, /* string*/ aOutFilePath)
    {
	this.logTrace("ALRFileUtilImplModule.saveBinDataToFilePath(" + aOutFilePath + ").......................Start.");

	var xfile = this.getLocalFile(aOutFilePath);
	if (!xfile) {
	    return null;
	}

	this.saveBinDataToFile(aBytes, aLength, xfile);

	this.logTrace("ALRFileUtilImplModule.saveBinDataToFilePath().......................End.");
    },

    /* void */ copyBinFile : function (/* in nsILocalFile */ aInFile, /* nsILocalFile */ aOutFile)
    {
	this.logTrace("ALRFileUtilImpl.copyBinFile():...............Start.");

	var fileData = this.readBinDataFromFile(aInFile);
	this.saveBinDataToFile(fileData, aOutFile);

	this.logTrace("ALRFileUtilImpl.copyBinFile():...............End.");
    },
    /* void */ copyBinFileByPath : function (/* in AString */ aInFilePath, /* AString */ aOutFilePath)
    {
	this.logTrace("ALRFileUtilImpl.copyBinFileByPath():...............Start.");

	var fileData = this.readBinDataFromFilePath(aInFilePath);
	this.saveBinDataToFilePath(fileData, aOutFilePath);

	this.logTrace("ALRFileUtilImpl.copyBinFileByPath():...............End.");
    },

    /* nsIDOMDocument */ readXMLDocFromURI : function (/* in nsIURI*/ aXmlDocURI)
    {
	this.logTrace("readXMLDocFromURI():................Start.");

	var xmlDataStr =  this.readDataFromURI(aXmlDocURI);
	if (!xmlDataStr) {
	    this.logTrace("readXMLDocFromURI():................End(1).");
	    return null;
	}
	var xmlDoc = this.readXMLDocFromString(xmlDataStr);

	this.logTrace("readXMLDocFromURI():................End.");
	return xmlDoc;
    },
    /* nsIDOMDocument */ readXMLDocFromURIStr : function (/* in AString*/ aXmlDocURIStr)
    {
	this.logDebug( "readXMLDocFromURIStr(): aXmlDocURIStr:\n" + aXmlDocURIStr + "");

	/*
	// create an nsIURI
	var ioService = Components.classes["@mozilla.org/network/io-service;1"]
			              .getService(Components.interfaces.nsIIOService);
	var xmlDocURI = ioService.newURI(aXmlDocURIStr, null, null);
	var xmlDoc = this.readXMLDocFromURI(xmlDocURI);
	*/

	var xmlDataStr = this.readDataFromURIStr(aXmlDocURIStr);
	if (!xmlDataStr) {
	    return null;
	}

	var xmlDoc = this.readXMLDocFromString(xmlDataStr);
	return xmlDoc;
    },
    /* nsIDOMDocument */ readXMLDocFromURIPath : function (/* in AString */ aDataURIStr)
    {
	this.logTrace("ALRFileUtilImpl.readXMLDocFromURIPath(" + aDataURIStr + "):................Start.");

	var xmlDoc = this.readXMLDocFromURIStr(aDataURIStr);

	this.logTrace("ALRFileUtilImpl.readXMLDocFromURIPath(" + aDataURIStr + "):................End.");
	return xmlDoc;
    },


    /* nsIDOMDocument */ readXMLDocFromString : function (/* in AString */ aXmlDocStr)
    {
		this.logTrace("ALRFileUtilImpl.readXMLDocFromString():................Start.");

		var xmlDoc = null;
		try {
		    if (!this.mXmlParser) {
    			this.mXmlParser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
			              		.getService(Components.interfaces.nsIDOMParser);
		    }
		    xmlDoc = this.mXmlParser.parseFromString(aXmlDocStr, "text/xml");
		} catch (ex) {
		    dump("ALRFileUtilImpl.readXMLDocFromString(): this.mXmlParser.parseFromString() failed - ex: " + ex + "\n");
		    return null;
		}

		var docElemTag = xmlDoc.documentElement;
		if ((docElemTag.tagName == "parserError")
		    || (docElemTag.namespaceURI == "http://www.mozilla.org/newlayout/xml/parsererror.xml")){
		    dump("ALRFileUtilImpl.readXMLDocFromString(): this.mXmlParser.parseFromString() failed - parserError" + "\n");
		    return null;
		}
		this.logTrace("ALRFileUtilImpl.readXMLDocFromString():................End.");
		return xmlDoc;
    },
    /* AString */ saveXMLDocToString : function (/* in nsIDOMNode */ aXmlDoc)
    {
		this.logTrace("ALRFileUtilImpl.saveXMLDocToString():................Start.");

		var xmlDocStr = null;
		if (!aXmlDoc) {
		    return xmlDocStr;
		}

		if (!this.mXmlSerializer) {
    		    this.mXmlSerializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"]
			              		.getService(Components.interfaces.nsIDOMSerializer);
		}

		xmlDocStr = this.mXmlSerializer.serializeToString(aXmlDoc);

		this.logTrace("ALRFileUtilImpl.saveXMLDocToString():................End.");
		return xmlDocStr;
    },

    /* nsIDOMDocument */ readXMLDocFromFile : function (/* in nsILocalFile */ aInXmlDocFile)
    {
		this.logTrace("ALRFileUtilImpl.readXMLDocFromFile():................Start.");

		if (!aInXmlDocFile) {
		    this.logError("readXMLDocFromFile(): NULL parameters.");
		    return null;
		}

		var /* nsIFileURI */ xmlDocFileURI = this.mIOService.newFileURI(aInXmlDocFile);
		this.logDebug("ALRFileUtilImpl.readXMLDocFromFile(): xmlDocFileURI.spec: " + xmlDocFileURI.spec);

		var xmlDoc = this.readXMLDocFromURI(xmlDocFileURI);

		this.logTrace("ALRFileUtilImpl.readXMLDocFromFile():................End.");
		return xmlDoc;
    },
    /* void */ saveXMLDocToFile : function (/* in nsIDOMNode */ aXmlDoc, /* in nsILocalFile */ aOutXmlDocFile)
    {
		this.logTrace("ALRFileUtilImpl.saveXMLDocToFile():................Start.");

		if (!aOutXmlDocFile) {
		    this.logError("ALRFileUtilImpl.saveXMLDocToFile(): NULL parameters.");
		    return;
		}

		var xmlDocStr = this.saveXMLDocToString(aXmlDoc);
		if (!xmlDocStr) {
		    this.logError("ALRFileUtilImpl.saveXMLDocToFile(): NULL data.");
		    return;
		}

		this.saveDataToFile(xmlDocStr, aOutXmlDocFile);

		this.logTrace("ALRFileUtilImpl.saveXMLDocToFile():................End.");
		return;
    },
    /* nsILocalFile */ saveXMLDocToTmpFile : function (/* in nsIDOMNode */ aXmlDoc, /* in AString */ aFilePathNameHint)
    {
		this.logTrace("ALRFileUtilImpl.saveXMLDocToTmpFile():................Start.");

		var filePathNameHint = aFilePathNameHint || "tmpXml/TmpXmlFile.xml";
		var outXMLDocFile = this.getTempFile(filePathNameHint);
		if (!outXMLDocFile) {
		    this.logError("saveXMLDocToTmpFile(): NULL parameters.");
		    return null;
		}

		var /* nsIFileURI */ xmlDocFileURI = this.mIOService.newFileURI(outXMLDocFile);
		// this.logDebug("ALRFileUtilImpl.saveXMLDocToTmpFile(): xmlDocFileURI.spec: " + xmlDocFileURI.spec);

		this.saveXMLDocToFile(aXmlDoc, outXMLDocFile);

		this.logTrace("ALRFileUtilImpl.saveXMLDocToTmpFile():................End.");
		return outXMLDocFile;
    },

    /* nsIDOMDocument */ readXMLDocFromFilePath : function (/* in AString */ aInXmlDocFilePath)
    {
		this.logTrace("ALRFileUtilImpl.readXMLDocFromFilePath(" + aInXmlDocFilePath + "):................Start.");
		if ((!aInXmlDocFilePath) || (aInXmlDocFilePath == "")) {
		    this.logError("readXMLDocFromFilePath(): NULL parameters.");
		    return null;
		}

		var /* nsIFile */ xmlDocFile = null;
		try {
		    xmlDocFile = Components.classes["@mozilla.org/file/local;1"]
				     .createInstance(Components.interfaces.nsILocalFile);
		    xmlDocFile.initWithPath(aInXmlDocFilePath);
		} catch (ex) {xmlDocFile = null;}
		if (!xmlDocFile) {
		    this.logError("ALRFileUtilImpl.readXMLDocFromFilePath(): xmlDocFile.initWithPath() failed.");
		    return null;
		}

		var xmlDoc = this.readXMLDocFromFile(xmlDocFile);

		this.logTrace("ALRFileUtilImpl.readXMLDocFromFilePath(" + aInXmlDocFilePath + "):................End.");
		return xmlDoc;
    },
    /* void */ saveXMLDocToFilePath : function (/* in nsIDOMNode */ aXmlDoc, /* in AString */ aOutXmlDocFilePath)
    {
		this.logTrace("ALRFileUtilImpl.saveXMLDocToFilePath(" + aOutXmlDocFilePath + "):................Start.");
		if ((!aOutXmlDocFilePath) || (aOutXmlDocFilePath == "")) {
		    this.logError("saveXMLDocToFilePath(): NULL parameters.");
		    return null;
		}

		var /* nsIFile */ outXMLDocFile = null;
		try {
		    outXMLDocFile = Components.classes["@mozilla.org/file/local;1"]
				     .createInstance(Components.interfaces.nsILocalFile);
		    outXMLDocFile.initWithPath(aOutXmlDocFilePath);
		} catch (ex) {xmlDocFile = null;}
		if (!outXMLDocFile) {
		    this.logError("ALRFileUtilImpl.saveXMLDocToFilePath(): xmlDocFile.initWithPath() failed.");
		    return null;
		}

		this.saveXMLDocToFile(aXmlDoc, outXMLDocFile);

		this.logTrace("ALRFileUtilImpl.saveXMLDocToFilePath(" + aOutXmlDocFilePath + "):................End.");
		return;
    },

    /* void */ copyXmlFile : function (/* in nsILocalFile */ aInFile, /* in nsILocalFile */ aOutFile)
    {
	this.logTrace("ALRFileUtilImpl.copyXmlFile():...............Start.");

	var xmlDoc = this.readXMLDocFromFile(aInFile);
	this.saveXMLDocToFile(xmlDoc, aOutFile);

	this.logTrace("ALRFileUtilImpl.copyXmlFile():...............End.");
	return;
    },

    /* void */ copyXmlFileByPath : function (/* in AString */ aInXmlFilePath, /* in AString */ aOutXmlFilePath)
    {
	this.logTrace("ALRFileUtilImpl.copyXmlFileByPath():...............Start.");

	var inXmlFile = this.getLocalFile(aInXmlFilePath);
	var outXmlFile = this.getLocalFile(aOutXmlFilePath);

	if (inXmlFile && outXmlFile) {
	    this.copyXmlFile(inXmlFile, outXmlFile);
	}

	this.logTrace("ALRFileUtilImpl.copyXmlFileByPath():...............End.");
    },

    /* AString */ removeBase64Envelope : function (/* in AString */ aBase64Data)
    {
		// var beginPattern = "^-+[ ]*BEGIN[ ]*.+[ ]*-+[ ]*";
		var beginPattern = "^-+[ ]*BEGIN[ ]*.+\n";

		// var endPattern = "^-+[ ]*END[ ]*.+[ ]*-+[ ]*";
		var endPattern = "-+[ ]*.+\n";

		var result = aBase64Data;
		var beginRegExp = new RegExp(beginPattern, "g");
		result = result.replace(beginRegExp, "");
		// alert("result: " + result + "(" + result.length + ") (pattern was: " + endPattern + ")");
    
		var endRegExp = new RegExp(endPattern, "g");
		result = result.replace(endRegExp, "");

		var regExp = new RegExp("\n");
		// result = result.replace("^[ ]*\n", "");

		// alert("result:\n" + result + "(" + result.length + ") (pattern was: " + endPattern + ")");
		return result;
    },
    /* AString */ readBase64DataFromFile : function (/* in nsILocalFile */ aBase64File, /* in bool */ keepBase64Envelope)
    {
		this.logTrace("ALRFileUtilImpl.readBase64Data():...............Start.");

		var base64EnvelopedData = this.readDataFromFile(aBase64File);
		if ((keepBase64Envelope == null) || (keepBase64Envelope == true)) {
		    return base64EnvelopedData;
		}

		var base64Data = this.removeBase64Envelope(base64EnvelopedData);
	    
		this.logTrace("ALRFileUtilImpl.readBase64Data():...............End.");
		return base64Data;
    },

    /* string */ utf16ToAscii : function (/* in AString */ utf16Data)
    {
    	return utf16Data;
    },

    /* nsIX509CertDB */ getX509CertDB : function()
    {
	var x509CertDB;
    	try {
	    x509CertDB = Components.classes["@mozilla.org/security/x509certdb;1"].
	    			getService(Components.interfaces.nsIX509CertDB);
	} catch (ex) {
	}
	// this.dump("ALRFileUtilImpl.getIX509CertDB(): x509CertDB: " + x509CertDB);
	return x509CertDB;
    },
    /* nsIDOMDocument */
    createEmptyXMLDoc : function(
                /* in string */ aDocNSURI,
                /* in string */ aDocRootElemTag
                ) {
        var xmlDoc = this.readXMLDocFromString("<doc/>");
        var emptyDoc = xmlDoc.implementation.createDocument(aDocNSURI, aDocRootElemTag, null);

	// this.dump("ALRFileUtilImpl.createEmptyXMLDoc(): emptyDoc: " + this.saveXMLDocToString(emptyDoc));
        return emptyDoc;
    },

    /*
        Components.classes["@avaya.com/avpki/js/fileutil;1"].getService(Components.interfaces.alrIFileUtil).test1();
    */
    test1 : function() {

	this.logTrace("ALRFileUtilImpl.test1():...............Start.");

	try {
	var inXmlFilePath = "/Users/subrata/XMLDOC/ATestDoc.xml";
	var outXmlFilePath = "/Users/subrata/XMLDOC/OUT_ATestDoc.xml";

	this.copyFileByPath(inXmlFilePath, outXmlFilePath);
	this.copyXmlFileByPath(inXmlFilePath, outXmlFilePath);


	var tempDir = this.getTempDir("XMLDSIGTool/xmldoc");
	var tempFile = this.getTempFile("XMLDSIGTool/xmldoc/abcd.xml");

	var xmlDoc = this.readXMLDocFromFilePath(inXmlFilePath);
	var xmlDocFile = this.saveXMLDocToTmpFile(xmlDoc, "XMLDSIGTool/xmldoc/abcd.xml");
	} catch (ex) {
	    this.logError("ALRFileUtilImpl.test1(): failed - ex: " + ex);
	}

	var emptyDoc = this.createEmptyXMLDoc("http://abc.com/xxx", "yyy");
	this.dump("ALRFileUtilImpl.test1(): emptyDoc: " + this.saveXMLDocToString(emptyDoc));

	this.logTrace("ALRFileUtilImpl.test1():...............End.");
	return;
    },

    lastMethod : function() {
    }

};
var components = [_ALRFileUtilImpl];

/**
* XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4).
* XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 (Firefox 3.6).
*/
if (XPCOMUtils.generateNSGetFactory)
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([_ALRFileUtilImpl]);
else
    var NSGetModule = XPCOMUtils.generateNSGetModule([_ALRFileUtilImpl]);
   

