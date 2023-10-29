/* @(#) $Id: httputil.js,v 1.20 2012/01/18 03:30:46 subrata Exp $ */

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



var HTTPUtil = {
    logEnabled : false,
    log : function (msg) 
    {
    	if (!HTTPUtil.logEnabled) {
	    return;
	}
	dump(msg + "\n");
    },

    lastMethod : function () 
    {
    }

};

function getFormParamAsQueryString(formElem)
{
    var reqParamsNVPList = "";
    for (var i = 0; i < formElem.elements.length; i++) {
	var formInputNvp = "";
	var formInputValue = "";
    	var formInputElem = formElem.elements[i];
	if (formInputElem == null) {
	    continue;
	}
	/*
    	HTTPUtil.log("getFormParamAsQueryString(): tagName: " + formInputElem.tagName + " " + 
			"name: " + formInputElem.name +  " " + 
			"type: " + formInputElem.type +  " " + 
			""
			);
	*/
	if ((formInputElem.type == "file")
	    || (formInputElem.type == "button")
	    || (formInputElem.type == "textarea")
	    || (formInputElem.type == "reset")
	    || (formInputElem.type == "submit")) {
	    continue;
	}
	if ((formInputElem.type == "text")
	    || (formInputElem.type == "hidden")) {
	    if (formInputElem.value == "") {
	        continue;
	    }
	    formInputValue = encodeURIComponent(formInputElem.value);
	}
	else if (formInputElem.type == "radio") {
	    if (!formInputElem.checked) {
	        continue;
	    }
	    formInputValue = formInputElem.value;
	    formInputNvp = formInputElem.name + "=" + formInputValue;
	}
	else if (formInputElem.type == "checkbox") {
	    formInputValue = "";
	    if (formInputElem.checked) {
	    	formInputValue = formInputElem.value;
	    }
	}
	else if (formInputElem.type == "select") {
	    formInputValue = formInputElem.options[formInputElem.selectedIndex].value;
	}
	formInputNvp = formInputElem.name + "=" + formInputValue;

	if (reqParamsNVPList != "") {
	    reqParamsNVPList += "&";
	}
	reqParamsNVPList += formInputNvp;
    	// HTTPUtil.log("getFormParamAsQueryString(): reqParamsNVPList: " + reqParamsNVPList + "");
    }

    // HTTPUtil.log("getFormParamAsQueryString(): reqParamsNVPList: " + reqParamsNVPList + "");
    return reqParamsNVPList;
}


// global channel
var /* nsIChannel */ gChannel;

// Source: https://developer.mozilla.org/en/XUL_School/Intercepting_Page_Loads

function StreamListener(aCallbackFunc, aChannel) {
    this.mCallbackFunc = aCallbackFunc;
    this.mChannel = aChannel;
    if (aChannel) {
  	gChannel = aChannel;
    }
}

StreamListener.prototype = {
    mData : null,
    mChannel : null,


    // nsIStreamListener
    onStartRequest: function (aRequest, aContext) {
    	this.mData = null;
    },

    onDataAvailable: function (aRequest, aContext, aStream, aSourceOffset, aLength) {

	// HTTPUtil.log("onDataAvailable():........................Start.");
      	// HTTPUtil.log("onDataAvailable(): aStream: " + aStream + " aSourceOffset: " + aSourceOffset + " aLength: " + aLength + "");
      	/*
    	*/
    	var httpChannel = this.mChannel.QueryInterface(Components.interfaces.nsIHttpChannel);
        var contentType = null;
        try {
	    contentType = httpChannel.getResponseHeader("Content-Type").toLowerCase();
        } catch (ex) { }
    	// HTTPUtil.log("onDataAvailable(): contentType: " + contentType + "");
    	// dump("onDataAvailable(): contentType: " + contentType + "\n");

    	if ((contentType.indexOf("text") >= 0) || (contentType.indexOf("html") >= 0)) {
      	    // HTTPUtil.log("onDataAvailable(): aStream: " + aStream + " aSourceOffset: " + aSourceOffset + " aLength: " + aLength + "");
	    /*
    	    var binaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"]
		        		.createInstance(Components.interfaces.nsIBinaryInputStream);
    	    binaryInputStream.setInputStream(aStream);
    	    this.mData = binaryInputStream.readByteArray(aLength);
    	    dump("onDataAvailable(): (typeof this.mData): " + (typeof this.mData) + " " + new String(this.mData) + "\n");
	    */

      	    var scriptableInputStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
        				.createInstance(Components.interfaces.nsIScriptableInputStream);
    	    scriptableInputStream.init(aStream);
    	    this.mData = scriptableInputStream.read(aLength);
    	    // dump("onDataAvailable(): (typeof this.mData): " + (typeof this.mData) + "\n");
    	}
    	else {
    	    var binaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"]
		        		.createInstance(Components.interfaces.nsIBinaryInputStream);
    	    binaryInputStream.setInputStream(aStream);
    	    this.mData = binaryInputStream.readByteArray(aLength);
	}
	// HTTPUtil.log("onDataAvailable():........................End.");
    },

    onStopRequest: function (aRequest, aContext, aStatus) {
    	var /* nsIHttpChannel */ httpChannel = this.mChannel.QueryInterface(Components.interfaces.nsIHttpChannel);
    	// HTTPUtil.log("onStopRequest:(): aStatus: " + aStatus + "");
    	if (Components.isSuccessCode(aStatus)) {
	    // request was successfull
      	    this.mCallbackFunc(this.mData, httpChannel, aStatus);
    	} else {
      	    // request failed
      	    this.mCallbackFunc(null, httpChannel, aStatus);
    	}
    	this.mChannel = null;
    },

    // nsIChannelEventSink
    onChannelRedirect: function (aOldChannel, aNewChannel, aFlags) {
    	// if redirecting, store the new channel
    	this.mChannel = aNewChannel;
    },

    // nsIInterfaceRequestor
    getInterface: function (aIID) {
    	try {
      	    return this.QueryInterface(aIID);
    	} catch (e) {
      	    throw Components.results.NS_NOINTERFACE;
    	}
    },

    // nsIProgressEventSink (not implementing will cause annoying exceptions)
    onProgress : function (aRequest, aContext, aProgress, aProgressMax) { },
    onStatus : function (aRequest, aContext, aStatus, aStatusArg) {
	/*
    	HTTPUtil.log("onStatus:(): aStatus: " + aStatus + "");
    	HTTPUtil.log("onStatus:(): aStatusArg: " + aStatusArg + "");
	*/
    },

    // nsIHttpEventSink (not implementing will cause annoying exceptions)
    onRedirect : function (aOldChannel, aNewChannel) { },

    // we are faking an XPCOM interface, so we need to implement QI
    QueryInterface : function(aIID) {
    	if (aIID.equals(Components.interfaces.nsISupports) ||
            aIID.equals(Components.interfaces.nsIInterfaceRequestor) ||
            aIID.equals(Components.interfaces.nsIChannelEventSink) || 
            aIID.equals(Components.interfaces.nsIProgressEventSink) ||
            aIID.equals(Components.interfaces.nsIHttpEventSink) ||
            aIID.equals(Components.interfaces.nsIStreamListener)) {
            return this;
	}
    	throw Components.results.NS_NOINTERFACE;
    }
};


function defaultHttpCbFunction (/* byte[] */ responseData, /* nsIChannel */ aChannel, aStatus)
{
    if (responseData == null) {
    	alert("Http invocation failed.");
	return;
    }
    alert("defaultHttpCbFunction(): responseData.length: " + responseData.length);
}


// Source:
//    http://developer.mozilla.org/en/docs/Creating_Sandboxed_HTTP_Connections
//    http://www.captain.at/ajax-file-upload.php (AJAX FILE UPLOAD - Uploading local files with AJAX/Javascript to a server)

function invokeSandboxedHttp(aRemoteURL, aHttpMethod, aReqParamStr, aHttpResponseCBFunc)
{
    HTTPUtil.log("invokeSandboxedHttp(): ...................Start.");
    HTTPUtil.log("invokeSandboxedHttp(): aRemoteURL: " + aRemoteURL + " aHttpMethod: " + aHttpMethod + " aReqParamStr: " + aReqParamStr + "");

    var reqParamStr = aReqParamStr || "";
    var httpMethod = aHttpMethod || "GET";
    HTTPUtil.log("invokeSandboxedHttp():reqParamStr: " + reqParamStr + "(" + reqParamStr.length + ")");

    // init the channel
    // the IO service
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                              .getService(Components.interfaces.nsIIOService);
    
    var httpURL = aRemoteURL;
    if ((httpMethod == "GET") || (httpMethod == "get")) {
	if ((reqParamStr != null) && (reqParamStr != "")) {
    	    httpURL += "?" + reqParamStr;
	}
    }

    // create an nsIURI
    var uri = ioService.newURI(httpURL, null, null);
    if (uri == null) {
        alert("invokeSandboxedHttp(): failed to get newURI().");
	return;
    }
    
    // get a channel for that nsIURI
    var channel = ioService.newChannelFromURI(uri);
    if (channel == null) {
        alert("invokeSandboxedHttp(): ioService.newChannelFromURI() failed.");
	return;
    }

    var /* nsIHttpChannel */ httpChannel = channel.QueryInterface(Components.interfaces.nsIHttpChannel);
    httpChannel.requestMethod = httpMethod;

    if ((httpMethod == "POST") || (httpMethod == "post")) {
        //  Creating HTTP POSTs
        var postData = reqParamStr;
        var inputStream = Components.classes["@mozilla.org/io/string-input-stream;1"]
                  .createInstance(Components.interfaces.nsIStringInputStream);
        inputStream.setData(postData, postData.length);


        var /* nsIUploadChannel */ uploadChannel = channel.QueryInterface(Components.interfaces.nsIUploadChannel);
        uploadChannel.setUploadStream(inputStream, "application/x-www-form-urlencoded", -1);

        /*
        // order important - setUploadStream resets httpChannel.requestMethod to PUT
        */
        httpChannel.requestMethod = "POST";
    }

    // get an listener
    var listener = new StreamListener(aHttpResponseCBFunc, channel);
    channel.asyncOpen(listener, null);
    
    HTTPUtil.log("invokeSandboxedHttp(): ...................End.");
}

function invokeSandboxedHttpPostWithBinaryData(aRemoteURL, aReqParamStr, aPostData, aHttpResponseCBFunc)
{
    HTTPUtil.log("invokeSandboxedHttpPostWithBinaryData(): ...................Start.");
    /*
    HTTPUtil.log("invokeSandboxedHttpPostWithBinaryData(): aRemoteURL: " + aRemoteURL + "");
    HTTPUtil.log("invokeSandboxedHttpPostWithBinaryData(): aReqParamStr: " + aReqParamStr + "");
    HTTPUtil.log("invokeSandboxedHttpPostWithBinaryData(): aPostData.length: " + aPostData.length + "");
    */

    
    // init the channel
    
    // the IO service
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                              .getService(Components.interfaces.nsIIOService);
    
    var httpURL = aRemoteURL;

    if ((aReqParamStr != null) && (aReqParamStr != "")) {
    	httpURL += "?" + aReqParamStr;
    }

    // create an nsIURI
    var uri = ioService.newURI(httpURL, null, null);
    if (uri == null) {
        alert("invokeSandboxedHttpPostWithBinaryData(): failed to get newURI() for " + httpURL);
	return;
    }
    
    // get a channel for that nsIURI
    var channel = ioService.newChannelFromURI(uri);
    if (channel == null) {
        alert("invokeSandboxedHttpPostWithBinaryData(): ioService.newChannelFromURI() failed.");
	return;
    }

    var /* nsIHttpChannel */ httpChannel = channel.QueryInterface(Components.interfaces.nsIHttpChannel);
    httpChannel.requestMethod = "POST";
    {
        //  Creating HTTP POSTs
        var postData = aPostData;
        var inputStream = Components.classes["@mozilla.org/io/string-input-stream;1"]
                  		.createInstance(Components.interfaces.nsIStringInputStream);
        inputStream.setData(postData, postData.length);


        var /* nsIUploadChannel */ uploadChannel = channel.QueryInterface(Components.interfaces.nsIUploadChannel);
	// uploadChannel.setRequestHeader("Content-Length", ("" + postData.length), false);
        uploadChannel.setUploadStream(inputStream, "application/binary", -1);
        // uploadChannel.setUploadStream(inputStream, "binary/octet-stream", -1);
	

	// TODO:
	// DO NOT REMOVE the following assigment.
        // order is important - setUploadStream() resets httpChannel.requestMethod to PUT
	// The documentation for nsIUploadChannel has further details.
        httpChannel.requestMethod = "POST";
    }

    // get an listener
    var listener = new StreamListener(aHttpResponseCBFunc, channel);
    channel.asyncOpen(listener, null);
    
    HTTPUtil.log("invokeSandboxedHttpPostWithBinaryData(): ...................End.");
}


/*
// create an nsIObserver implementor
var listener = {
  observe : function(aSubject, aTopic, aData) {
    // Make sure it is our connection first.
    if (aSubject == gChannel) {
      var httpChannel = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
      if (aTopic == "http-on-modify-request") {
         // ...
      } else if (aTopic == "http-on-examine-response") {
         // ...
      }
    }
  },

  QueryInterface : function(aIID) {
    if (aIID.equals(Components.interfaces.nsISupports) ||
        aIID.equals(Components.interfaces.nsIObserver))
      return this;
    throw Components.results.NS_NOINTERFACE;
  }
};

// get the observer service and register for the two coookie topics.
var observerService = Components.classes["@mozilla.org/observer-service;1"]
                                .getService(Components.interfaces.nsIObserverService);
observerService.addObserver(listener, "http-on-modify-request", false);
observerService.addObserver(listener, "http-on-examine-response", false);

*/


function invokeHttpFormLoginX(aLoginResultCB)
{
    var userName = "Xsubratam";
    var userPassword = "abcd1234";
    var protectedPageURL = "http://localhost:18080/certdemo/portal/SignedCertDemoPortalFrwd.jsp";

    invokeHttpFormLoginLoop(protectedPageURL, userName, userPassword, function(aLoginResult) {
	if (aLoginResultCB) {
    	    aLoginResultCB(aLoginResult);
	}
    });
}

function invokeHttpFormLogin(aProtectedPageURL, aLoginResultCB)
{
    return invokeHttpFormLoginLoop(aProtectedPageURL, null, null, function(aLoginResult) {
	if (aLoginResultCB) {
    	    aLoginResultCB(aLoginResult);
	}
    });
}

function invokeHttpFormLoginLoopInt(loopCnt, aProtectedPageURL, aUserName, aUserPassword, aLoginResultCB)
{
    HTTPUtil.log("invokeHttpFormLoginLoopInt():.........................Start.");
    HTTPUtil.log("invokeHttpFormLoginLoopInt(): loopCnt: " + loopCnt);
    /*
    if (loopCnt >= 4) {
    	aLoginResultCB(false);
	return;
    }
    */
    // WARNING: The invoking (referer) page  of login-URL must have same IP-address as the login-URL.
    var askForCredential = false;

    var tmpPassword = aUserPassword;
    var loginStatus = false;
    invokeHttpFormLoginStep(aProtectedPageURL, aUserName, tmpPassword, askForCredential, function(loginStatus) {
    	HTTPUtil.log("invokeHttpFormLoginLoopInt.invokeHttpFormLoginStep.cb():.........................End.");
	if (!aLoginResultCB) {
	    return;
	}
    	if (loginStatus) {
    	    HTTPUtil.log("invokeHttpFormLoginLoopInt.invokeHttpFormLoginStep.cb():.........................End(SUCCESS).");
	    aLoginResultCB(true);
	    return;
	}
	if (loopCnt >= 4) {
    	    dump("invokeHttpFormLoginLoopInt(): login-failed.\n");
	    aLoginResultCB(false);
    	    HTTPUtil.log("invokeHttpFormLoginLoopInt.invokeHttpFormLoginStep.cb():.........................End(Error).");
	    return;
	}
	loopCnt++;
	askForCredential = true;
	tmpPassword = null;
    	invokeHttpFormLoginLoopInt(loopCnt, aProtectedPageURL, aUserName, aUserPassword, aLoginResultCB);

    	HTTPUtil.log("invokeHttpFormLoginLoopInt.invokeHttpFormLoginStep.cb():.........................End.");
	return;
    });

    HTTPUtil.log("invokeHttpFormLoginLoopInt():.........................End.");
    return false;
}

function invokeHttpFormLoginLoop(aProtectedPageURL, aUserName, aUserPassword, aLoginResultCB)
{
    HTTPUtil.log("invokeHttpFormLoginLoop():.........................Start.");
    var loopCnt = 0;

    invokeHttpFormLoginLoopInt(loopCnt, aProtectedPageURL, aUserName, aUserPassword, aLoginResultCB);

    HTTPUtil.log("invokeHttpFormLoginLoop():.........................End.");
}

function invokeHttpFormLoginStep(aProtectedPageURL, aUserName, aUserPassword, askForCredential, aLoginResultCB)
{
    HTTPUtil.log("invokeHttpFormLoginStep():.........................Start.");

    invokeSandboxedHttp(aProtectedPageURL, "GET", "", function(respDoc) {
    	HTTPUtil.log("invokeHttpFormLoginStep.invokeSandboxedHttp.cb():.........................Start.");
        if (respDoc == null) {
	    aLoginResultCB(false);
    	    return;
        }
        if (respDoc.indexOf("j_username") < 0) {
    	    HTTPUtil.log("invokeHttpFormLoginStep(): Already logged-in.");
	    aLoginResultCB(true);
    	    return;
        }

        var userName = aUserName;
        var password = aUserPassword;
        if (askForCredential || (userName == null)) {
	    if (userName) {
    	    userName = prompt("Enter user name ", userName);
	    }
	    else {
    	    userName = prompt("Enter user name ");
	    }
	    if (userName == null) {
	    	aLoginResultCB(false);
    	    	return;
	    }
        }
        if (askForCredential || (password == null)) {
    	    password = prompt("Enter password ");
        }
        if (password == null) {
	    aLoginResultCB(false);
    	    return;
        }
    
        var reqParamsNVPList = "";
        reqParamsNVPList += "j_username=" + userName;
        reqParamsNVPList += "&" + "j_password=" + password;
        password = "";
    
        var ioService = Components.classes["@mozilla.org/network/io-service;1"] .getService(Components.interfaces.nsIIOService);
        var serverURI = ioService.newURI(aProtectedPageURL, null, null);
        var serverURL = serverURI.QueryInterface(Components.interfaces.nsIURL);
    
        var loginActionURLPath = "j_security_check";
        var loginActionURL = serverURI.prePath + serverURL.directory + loginActionURLPath;
        HTTPUtil.log("invokeHttpFormLoginStep(): loginActionURL: " + loginActionURL + "");
    
        invokeSandboxedHttp(loginActionURL, "POST", reqParamsNVPList, function(respDoc) {
    	    reqParamsNVPList = "";
	    aLoginResultCB(false);
	    return;
        });
	reqParamsNVPList = "";
    	HTTPUtil.log("invokeHttpFormLoginStep.invokeSandboxedHttp.cb():.........................End.");
    });

    HTTPUtil.log("invokeHttpFormLoginStep():.........................End.");
    return;
	loopCnt++;
}



function byteArrayToString(aByteArray)
{
    var ss = Components.classes["@mozilla.org/storagestream;1"]
    		.createInstance(Components.interfaces.nsIStorageStream);
    var totBytes = aByteArray.length;
    ss.init(1024, (totBytes * 2), null); 

    var os = ss.getOutputStream(0);
    var bos = Components.classes["@mozilla.org/binaryoutputstream;1"]
    		.createInstance(Components.interfaces.nsIBinaryOutputStream);
    bos.setOutputStream(os);
    bos.writeByteArray(aByteArray, aByteArray.length);
    bos.close();

    var is = ss.newInputStream(0);
    var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
    			.createInstance(Components.interfaces.nsIScriptableInputStream);
    sis.init(is);
    var dataStr = "";
    var str = sis.read(-1);
    while (str.length > 0) {
    	dataStr += str;
	str = sis.read(-1);
    }
    is.close();
    return dataStr;
}

