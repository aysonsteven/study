//Property declarations
var XHRList = {},
	timeOutCollection = [];


function cancelALLAJAXRequests()
{
	var xhrList = XHRList,
	length = xhrList.length;
	for(var xhr in xhrList)
	{
		xhrList[xhr].abort();
	}
	XHRList = [];
}

function executeTimeout(method,delay)
{
	timeOutCollection.push(setTimeout(method, delay));
}

function clearTimeoutCollection()
{
	var len = timeOutCollection.length;
	for(var i = 0; i< len ;i++)
	{
		clearTimeout(timeOutCollection[i]);
	}
}

function createAJAXRequestNew(request)
{
	var type = request.type,
	url = request.url,
	onSuccess = request.onSuccess,
	onFail = request.onFail,
	data = request.data,
	mimeType = request.mimeType,
	responseType = request.responseType,
	ajaxRequest = new XMLHttpRequest(),
	timeKey = new Date().getTime();
	ajaxRequest.id = timeKey;
	ajaxRequest.open(type, encodeURI(url), true);
	
	if(responseType !== undefined && responseType !== null && responseType.length >0)
	{
		ajaxRequest.responseType = responseType;		
	}

	if(mimeType !== undefined && mimeType !== null && mimeType.length >0)
	{
		ajaxRequest.setRequestHeader("Content-type", mimeType);
	}

	if(type === 'POST' && data !== undefined && data !== null)
	{
		ajaxRequest.send(data);	
	}
	else
	{
		ajaxRequest.send();	
	}
	
	ajaxRequest.onreadystatechange = function()
	{
		if (this.readyState==4 && this.status==200) {
			if(onSuccess)
				onSuccess(this);
			delete XHRList[timeKey];
		}
		else
		{
			if(onFail)
				onFail(this);
		}
	};
	XHRList[timeKey]=ajaxRequest;
}

function createAJAXRequest(type,url,onSuccess,onFail,data,mimeType)
{
	var ajaxRequest = new XMLHttpRequest(),
	timeKey = new Date().getTime();
	ajaxRequest.id = timeKey;
	ajaxRequest.open(type, encodeURI(url), true);
	
	if(mimeType !== undefined && mimeType !== null && mimeType.length >0)
	{
		ajaxRequest.setRequestHeader("Content-type", mimeType);
	}

	if(type === 'POST' && data !== undefined && data !== null)
	{
		ajaxRequest.send(data);	
	}
	else
	{
		ajaxRequest.send();	
	}
	
	ajaxRequest.onreadystatechange = function()
	{
		if (this.readyState==4 && this.status==200) {
			if(onSuccess)
				onSuccess(this);
			delete XHRList[timeKey];
		}
		else
		{
			if(onFail)
				onFail(this);
		}
	};
	XHRList[timeKey]=ajaxRequest;
}

function createDocumentServiceRequest(request)
{
	request.url = documentViewer.domain+'/DocViewerWS/rest/document/'+request.url;
	createAJAXRequestNew(request)
}

function createConvertServiceRequest(request)
{
	request.url = documentViewer.domain+'/DocViewerWS/rest/convert/'+request.url;
	createAJAXRequestNew(request)
}

function createSearchServiceRequest(request)
{
	request.url = documentViewer.domain+'/DocViewerWS/rest/search/'+request.url;
	createAJAXRequestNew(request)
}

function WSLogFileStatus(request)
{
	var newRequest = {
			type : 'GET',
			url : 'logFileStatus?nativeFilePath=' + request.nativeFilePath+breakCacheParameter(),
			onSuccess : request.onSuccess
	}
	createDocumentServiceRequest(newRequest);
}

function WSRedactedFileStatus(request)
{
	var newRequest = {
			type : 'GET',
			url : 'redactedFileExists?markupPath=' + request.markupPath+breakCacheParameter(),
			onSuccess : request.onSuccess
	}
	createDocumentServiceRequest(newRequest);
}

function WSOpenMarkupFile(request,isTemp)
{
	var service = isTemp === true ? 'openTempMarkup' : 'openMarkup';
	var newRequest = {
			type : 'GET',
			url : service+'?path=' + request.path+breakCacheParameter(),
			onSuccess : request.onSuccess
	}
	createConvertServiceRequest(newRequest);
}

function WSConvertDocument(request)
{
	var newRequest = {
			type : 'POST',
			url : 'tosvg?nativeFilePath=' + request.nativeFilePath+'&timezone='+request.timezone,
			onSuccess : request.onSuccess
	}
	createConvertServiceRequest(newRequest);
}

function WSGetViewerFileStatus(request)
{
	var newRequest = {
			type : 'GET',
			url : 'svg?nativeFilePath=' + request.nativeFilePath+'&pgn='+request.pageNumber+'&logFileStatus='+request.logFileStatus+breakCacheParameter(),
			onSuccess : request.onSuccess
	}
	createDocumentServiceRequest(newRequest);
}

function WSGetGZViewerFile(request)
{
	var newRequest = {
			type : 'GET',
			url : 'getGZippedContent?gzPath=' + request.gzPath+breakCacheParameter(),
			onSuccess : request.onSuccess
	}
	createDocumentServiceRequest(newRequest);
}


function WSImageData(request)
{
	var newRequest = {
			type : 'GET',
			url : 'getDataUri?uriFilePath=' + request.uriFilePath+breakCacheParameter(),
			onSuccess : request.onSuccess
	}
	createDocumentServiceRequest(newRequest);
}