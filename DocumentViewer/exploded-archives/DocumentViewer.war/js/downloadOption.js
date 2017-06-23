
/*------------------- FOR DOWNLOAD MODAL --------------------*/
var downloadTimeoutCollection = [];
var isAnnotated;
var isRedactedAnnotated;
var zz = function() {
	var showDownloadModal 	= $('#showDownloadModal');
	var redactCheckBox 		= $('#dlRedactCheckBox');
	var annotateCheckBox 	= $('#dlAnnotationCheckBox');
	var downloadBtn 		= $('#downloadBtn');
	
	redactCheckBox.prop('disabled',true);
	redactCheckBox.prop('checked', false);
	annotateCheckBox.prop('disabled',true);
	annotateCheckBox.prop('checked', false);
	try
	{		
		var hasAnnotation = docHasAnnotation();
		var hasRedaction = docHasRedaction();
		window.setTimeout(function() {
			if(isSaved === true) {
				if (hasAnnotation && hasRedaction){
					if ($('#dlRedactCheckBox').is(':disabled') || $('#dlAnnotationCheckBox').is(':disabled')){
						$('#downloadNote').fadeIn('fast');	
					}
				} else if (!hasAnnotation && hasRedaction) {
					if ($('#dlRedactCheckBox').is(':disabled')){
						$('#downloadNote').fadeIn('fast');
					}
				} else if (hasAnnotation && !hasRedaction){
					if ($('#dlAnnotationCheckBox').is(':disabled')){
						$('#downloadNote').fadeIn('fast');
					}
				}
			}
		},5000);
		
		if(hasRedaction === true)
		{
			checkRedactedFileForDownload(1);			
		}

		if(hasAnnotation === true)
		{
			hasAnnotationFile();			
		}
		
		if(hasRedaction === true && hasAnnotation === true)
		{
			hasRedactionAnnotationFile();			
		}



	}
	catch(err)
	{
		console.log(err);
	}
	
	showDownloadModal.on('click', function() {
		//resetts states of the icons from on/off to mute and close the property panel
		$('#addLine, #addArrow, #addSquare, #addCircle, #addText, #highLightBtn, #highLightRedactBtn, #addRedact').removeClass('on off').addClass('mute');
		$('#closeRedact').click();
		$('#closeAnnotateBox').click();
		$('#textSelection').removeClass('active-state');
		$('.pageContent').removeClass('text-cursor');
		// --END of resetts states of the icons from on/off to mute and close the property panel
//		$('#closeRedact').click();
//		$('#closeAnnotateBox').click();
	});

	function iOSversion() {

		  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
		    if (!!window.indexedDB) { return 'iOS 8 and up'; }
		    if (!!window.SpeechSynthesisUtterance) { return 'iOS 7'; }
		    if (!!window.webkitAudioContext) { return 'iOS 6'; }
		    if (!!window.matchMedia) { return 'iOS 5'; }
		    if (!!window.history && 'pushState' in window.history) { return 'iOS 4'; }
		    return 'iOS 3 or earlier';
		  }

		  return 'Not an iOS device';
	}
	
	function isiOS8Up()
	{
		return iOSversion().indexOf('8')>-1;
	}
	
	downloadBtn.on('click', function() {
		
		var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		var baseUrl = documentViewer.domain + "/DocViewerWS/rest/document/";
		if ($('#dlRedactCheckBox').is(':checked') && $('#dlAnnotationCheckBox').is(':checked')){
			var url = baseUrl+"getRedactedAnnotatedPDF?markupPath=" + documentViewer.markupPath;
			
			if(iOS === true && isiOS8Up() === true)
			{
				window.open(url);				
			}
			else
			{
				window.location = url;
			}
			
			$('#cancelDownloadBtn').click();
			
			if (documentViewer.downloadCallback) {
				documentViewer.downloadCallback(true, true);
			}
		} else if (!$('#dlRedactCheckBox').is(':checked') && !$('#dlAnnotationCheckBox').is(':checked')) {
			var url = "";
			if(!getStoredMarkup().hasRotation)
				url = baseUrl+'originalFile?nativeFilePath=' + documentViewer.documentAbsPath;
			else
				url = baseUrl+'rotateFile?nativeFilePath=' + documentViewer.documentAbsPath + '&markupPath=' + documentViewer.markupPath;

			if(iOS === true && isiOS8Up() === true)
			{
				window.open(url);				
			}
			else
			{
				window.location = url;
			}
			
			$('#cancelDownloadBtn').click();

			if (documentViewer.downloadCallback) {
				documentViewer.downloadCallback(false, false);
			}
		} else if ($('#dlRedactCheckBox').is(':checked')) {
			
			if ($('#dlRedactCheckBox').is(':checked')) {
				var url = baseUrl+'redactedFile?markupPath=' + documentViewer.markupPath+breakCacheParameter();
				
				if(iOS === true && isiOS8Up() === true)
				{
					window.open(url);				
				}
				else
				{
					window.location = url;
				}
				
			}
			
			$('#cancelDownloadBtn').click();

			if (documentViewer.downloadCallback) {
				documentViewer.downloadCallback(false, true);
			}
		} else if ($('#dlAnnotationCheckBox').is(':checked')){
			var url = baseUrl+"getAnnotatedPDF?markupPath=" + documentViewer.markupPath;
			
			if(iOS === true && isiOS8Up() === true)
			{
				window.open(url);				
			}
			else
			{
				window.location = url;
			}
			
			$('#cancelDownloadBtn').click();
			
			if (documentViewer.downloadCallback) {
				documentViewer.downloadCallback(true,false);
			}
		}
		
		clearDownloadTimer();

		
	});
	
	$('#cancelDownloadBtn').on('click', function () {
		$('#downloadNote').hide();
		clearDownloadTimer();
	});
	
	$('.downloadDocument')[0].removeEventListener('mouseup',zz);

};
//document.getElementById('downloadOption').onshow =  zz;

function checkRedactedFileForDownload(attempt)
{
	if(!attempt)
		attempt = 1;
	var iterate = function()
	{
		checkRedactedFileForDownload(attempt+1);
	};
		
	//Optimization: remove call to service and just check the var from hasRedactedFile
	
	var onSuccess = function(req) {
			var hasRedacted = req.responseText;
			if(hasRedacted === "true") {
				hasRedactedFile = true;
				$('#dlRedactCheckBox').prop('disabled',false);
				$('#dlRedactCheckBox').prop('checked', true);
				$('#downloadNote').fadeOut('fast');
			}
			else
			{
				if(attempt<50)
					executeDownloadTimer(iterate,100);
			}
	};
	
	var request = 
	{
		markupPath : documentViewer.markupPath,
		onSuccess : onSuccess
	};
	WSRedactedFileStatus(request);
}

function executeDownloadTimer(method,delay)
{
	downloadTimeoutCollection.push(setTimeout(method, delay));
}

function clearDownloadTimer(){
	var len = downloadTimeoutCollection.length;
	for(var i = 0; i< len ;i++)
	{
		clearTimeout(downloadTimeoutCollection[i]);
	}
}

	$('.downloadDocument')[0].addEventListener('mouseup',zz);
/*------------------- FOR DOWNLOAD MODAL --------------------*/

//Check if it has any annotation file
function hasAnnotationFile(){
	if (processingAnnotation == true){
		$('#dlAnnotationCheckBox').prop('disabled',true);
		isAnnotated = false;
		return;
	} 
	
	$.ajax({
		url: documentViewer.domain + '/DocViewerWS/rest/document/annotatedFileExists?markupPath=' + documentViewer.markupPath+breakCacheParameter(),
		contentType: "text/plain",
		cache: false,
		success: function(data){
			var hasAnnotation = data;
			
			if (hasAnnotation == 'true'){
				$('#dlAnnotationCheckBox').prop('disabled',false);
				$('#downloadNote').fadeOut('fast');
				isAnnotated = true;
			} else {
				$('#dlAnnotationCheckBox').prop('disabled',true);
				isAnnotated = false;
			}
		}
	});
	
}

function hasRedactionAnnotationFile(){
	if (processingRedactionAnnotation == true){
		isRedactedAnnotated = false;
		return;
	} 
	
	$.ajax({
		url: documentViewer.domain + '/DocViewerWS/rest/document/redactedAnnotatedFileExists?markupPath=' + documentViewer.markupPath+breakCacheParameter(),
		contentType: "text/plain",
		cache: false,
		success: function(data){
			var hasRedactionAnnotation = data;
			
			if (hasRedactionAnnotation == 'true'){
				isRedactedAnnotated = true;
			} else {
				isRedactedAnnotated = false;
			}
		}
	});
}

function docHasAnnotation(){
	
	for (var x = 0; x < pageCollection.length; x++){
		if (pageCollection[x].hasAnnotations()){
			return true;
		}
	}
	
	return false;
}

function docHasRedaction(){
	for (var x = 0; x < pageCollection.length; x++){
		if (pageCollection[x].hasRedactions()){
			return true;
		}
	}
	
	return false;
}


