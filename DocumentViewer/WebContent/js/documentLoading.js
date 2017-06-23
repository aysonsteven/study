/**
 * documentLoading.js
 * JS file handling load features of UDV:
 * -Initial load of a document
 * -Loading of markup 
 * -Loading of rotations
 * -Loading of <div> pages for SVG retrieval 
 */

var pccId = 1;

function loadDocument(filePath,markupPath,hasRotations,hasAnnotations,rotationMarkupPath) {
	if((documentViewer.documentAbsPath === undefined && filePath != undefined) || (filePath != documentViewer.documentAbsPath))
	{
		clearAlert();
		documentViewer.isViewable = false;  
		documentViewer.documentAbsPath = filePath;
		documentViewer.markupPath = markupPath;
		cleanUpViewerDocWrapper();
		if(!markupPath) 
			markupPath = '';
		
		 if(typeof hasRotations === 'undefined'){
			 hasRotations = true;
		 }

		 if(typeof hasAnnotations === 'undefined'){
			 hasAnnotations = true;
		 }
		 
		 if(!markupPath || markupPath==='' || typeof markupPath === 'undefined')
		 {
			hasAnnotations = false; 
		 }
		 
		 if(documentViewer.allowRotation)
			 hasRotations = true;
		 else
			 hasRotations = false;
		 if(hasRotations && rotationMarkupPath)
			 documentViewer.rotationMarkupPath = rotationMarkupPath;
		 var allowAutoGenerate = documentViewer.autoGeneration;
		initializeDoc(filePath,markupPath,true,1,1,hasRotations,hasAnnotations,allowAutoGenerate);
	}

}

function cleanUpViewerDocWrapper() {
	clearSearch();
	cancelALLAJAXRequests();
	var printModal = document.getElementById('DV-PrintModal');
	if(printModal.style.display === 'block')
		hidePrintModal();
	//disable FTW
	var fitToWidthButton = $(getElement('fitToWidth'));
	var classes = fitToWidthButton.attr('class');
	var indexOfState = classes.indexOf('active-state');
	if(isFitContent)
	{
		classes = classes.substring(0,indexOfState);
		fitToWidthButton.attr('class',classes);
		isFitContent = false;
		originalScaleFactor = -1;
	}
	isResizing = false;
	isPrintingCancelled = false;
	isSaved = false;
	clearTimeoutCollection();
	clearDownloadTimer();
	/*declaration.js*/
	logFileStatus = null;
	selectedObject={pageIndex : -1,markupIndex : -1};
	selectedObjectCollection = [];
	currentSelectedMarkup;
	scaleFactor = parseFloat(documentViewer.scaleFactor); // pantry-955 --///////comment this if zoom factor needs to be cached 
	//documentAbsPath = "";
	/*constants.js*/
	pageCollection = [];
	handleCollection = [];
	markUpCollection = {};
//	selectedObjectCollection = []; duplicate in constants.js
	/*annotationDraw.js*/
	annotationObject = null;
	drawnObject = null;
	tempId = 0;
	readyToDraw = false;
	lastDrawnDivReason = false;
	lastSelectedDivReason = null;
	hasRedactedFile = false;
	var vdw = document.getElementById("viewer-document-wrapper");
	clearChildren(vdw);
	$(vdw).removeClass('cursorCrosshair');
	$(vdw).removeClass('text-cursor');
	$(vdw).css('cursor','default');
	//setZoomLabel("100%"); //comment this if zoom factor needs to be cached
	setZoomLabel(parseFloat((scaleFactor * 100)).toFixed(0) + "%"); // pantry-955
	$('.current-page').val(0);
	$('.pages').text(0);
	$(getElement('cancelDownloadBtn')).trigger('click');
	$(getElement('cancelfpRedactionBtn')).trigger('click');
	$(getElement('cancelPattern')).trigger('click');
	$(getElement('closeRedact')).trigger('click');
	$(getElement('closeAnnotateBox')).trigger('click');
	$('#clearSearchBox').click();
	$('.tab-menu #pageTab').trigger('click');
	$(getElement('DV-Notif')).css({'top' : '0','display' : 'none','visibility' : 'hidden'});
	displayReviewTools(false);
	var visibilityR = $('.selected-visibility-redaction'),
		visibilityRholder = visibilityR.children('.visibility-holder-redaction'),
		showRimgSrc = visibilityR.siblings('.visibility-available-container').children()[0].getAttribute('src'); 
	visibilityRholder.attr('src',showRimgSrc);
	visibilityRholder.attr('data-visibility',"Show Redaction");
	visibilityRholder.attr('title',"Change Redaction Visibility to Semi-Transparent");
	var visibilityA = $('.selected-visibility-annotation'),
		visibilityAholder = visibilityA.children('.visibility-holder-annotation'),
		showAimgSrc = visibilityA.siblings('.visibility-available-container').children()[0].getAttribute('src'); 
	visibilityAholder.attr('src',showAimgSrc);
	visibilityAholder.attr('data-visibility',"Show Annotation");
	visibilityAholder.attr('title',"Change Annotation Visibility to Semi-Transparent");
	document.removeEventListener("mousedown", initStartPosition, false);
	checkNavigation();
	disableHandTool();
	markupId = 0;
	pccId = 1;
	//Reset Printing Options
	document.getElementById('w_redaction').checked = true;
	document.getElementById('w_annotation').checked = false;
	document.getElementById('orient_auto').checked = true;
	document.getElementById('orient_port').checked = false;
	document.getElementById('orient_land').checked = false;
	document.getElementById('printAll').checked = true;
	document.getElementById('printCurrent').checked = false;
	deactivateAnnotation();
	//Reset annotation/redaction tab
	resetToolsState();
}

/**
 * Hides all buttons regardless of selected tab
 */
function resetToolsState(){
	var contents = $("#viewer-menu-content .on, .off");
	$(contents).each(function(key, value){
		$(value).removeClass("on").removeClass("off").addClass("mute");
	});
}

function initializeDoc(fileAbsPath,markupPath,isFirstRequest,GenerateViewerAttempts, ConvertingToPDFAttempts,hasRotations,hasAnnotations, isGenerate) {
	documentAbsPath = fileAbsPath;

	var onSuccess = function(req)
	{
		logFileStatus = req.responseText;
		var iterate = function()
		{
			initializeDoc(fileAbsPath,markupPath,false,1,ConvertingToPDFAttempts+1,hasRotations,hasAnnotations);
		};
		
		var iterateGenerateViewer = function()
		{
			initializeDoc(fileAbsPath,markupPath,false,GenerateViewerAttempts+1,1,hasRotations,hasAnnotations);
		};
		
		
		if(documentViewer.isMobile === true)
		{
			//showAlert('Warning: Review tools are disabled on mobile',"warning");
			getElement('mobile-warning').display='block';
			$('.downloadDocument').hide();
		}
		else if(documentViewer.redactTab === false)
		{
			$('.downloadDocument').hide();
		}

		switch (logFileStatus){
			case "FileNotFound":
				displayReviewTools(false);
				showAlert('Error: Source file not found!',"error");
				break;
			case "RegenerateSVG":	
			case "GenerateViewer":
				if (isFirstRequest && isGenerate){
					//call to converter
					var request = 
					{
						nativeFilePath : fileAbsPath,
						timezone : documentViewer.timezone,
					};
					
					WSConvertDocument(request);
				}
				else if(isFirstRequest && !isGenerate)
				{
					showAlert('Error: Viewer is not configured to generate files on-the-fly!',"error");
				}
				
				if (GenerateViewerAttempts === 15) {
					showAlert('Generation of viewer files in progress...', "warning");
				}
				
				if (GenerateViewerAttempts === 200) {
					showAlert('Generation of viewer files still in progress...', "warning");
				}
				
				if (GenerateViewerAttempts === 400) {
					showAlert('Generation of viewer files still in progress...', "warning");
				}
				
				executeTimeout(iterateGenerateViewer, 200);

				break;
				
			case "Queued":
			case "ConvertingToPDF":
				if(ConvertingToPDFAttempts<=2)
				{
					displayReviewTools(false);
				}

				if(ConvertingToPDFAttempts <= 25) {
					if(ConvertingToPDFAttempts === 15) {
						showAlert('Conversion to PDF Files in progress...',"warning"); 
					}
					executeTimeout(iterate, 200); // execution time within 5 seconds
				} else if (ConvertingToPDFAttempts <= 55){
					executeTimeout(iterate, 2000); //if status is still CTP, re-try until 1min
				} else if (ConvertingToPDFAttempts <= 175){
					if(ConvertingToPDFAttempts === 56) {
						showAlert('Conversion still in progress...',"warning"); //if status is still CTP, show warning and re-try up to max 4mins
					}
					executeTimeout(iterate, 2000);
				} else {
					showAlert('Document is not ready for viewing. Refresh the page after few minutes.',"warning"); //if status is still CTP, show new warning
				}
				break;
				
			case "Timeout":
			case "ConversionError":
			case "PasswordProtected":
			case "Unsupported":
			case "Encrypted":
			case "Corrupted":
				displayReviewTools(false);
				displayErrorPlaceHolder();
				break;
				
			case "ConvertingToSVG":
				logFileStatusChecker();
			case "Completed":
				documentViewer.isViewable = true;  
				if(documentViewer.viewerLoaded)
					documentViewer.viewerLoaded(true);
				hideNotification();
				completed(fileAbsPath,markupPath,hasRotations,hasAnnotations);

		}
	};
	
	var request = 
	{
		nativeFilePath : fileAbsPath,
		onSuccess : onSuccess
	};
	WSLogFileStatus(request);
}

function completed(fileAbsPath,markupPath,hasRotations,hasAnnotations){
	var onSuccess = function(req)
	{
		var logJSON = JSON.parse(req.responseText);
		displayReviewTools(true);
		getPageAttributes(logJSON);
		if(documentViewer.rotationMarkupPath && hasRotations)
		{
			loadRotationBeforeMarkups(hasAnnotations,hasRotations,markupPath,documentViewer.rotationMarkupPath);
		}
		else
		{
			getXMLFromServer(hasAnnotations,hasRotations,markupPath);
		}
		if(documentViewer.loadCallback){
			documentViewer.loadCallback();
		}
		
		if(documentViewer.isMobile === true)
		{
			$(getElement('textSelection')).css('display','none');
		}
		
		if(documentViewer.libUdvSearchQuery != ""){
			documentViewer.defaultTab = "search";
		}
		selectTab(documentViewer.defaultTab);
		
		if(documentViewer.libUdvSearchQuery != ""){
			var pattern = "qxzzxq",
		    re = new RegExp(pattern, "g");
			documentViewer.libUdvSearchQuery = documentViewer.libUdvSearchQuery.replace(re, '"');
			search(documentViewer.libUdvSearchQuery);
		}
	};
	
	var request = 
	{
		type : 'GET',
		url :  documentViewer.domain+'/DocViewerWS/rest/document/pageAttributes?nativeFilePath=' + fileAbsPath+breakCacheParameter(),
		onSuccess : onSuccess
	};
	createAJAXRequestNew(request);
}

function loadRotationBeforeMarkups(hasAnnotations,hasRotations,markupPath,rotationPath)
{
	var onSuccess = function(httpRequest)
	{
		var dom = parseXMLToDom(httpRequest.responseText),
		f,
		version;

		if(f)
		{
			f = dom.getElementsByTagName('documentAnnotations')[0];
			version = f.getAttribute('version');	
		}

		var pages = dom.getElementsByTagName('page');
		var pageLength = pages.length;
		if(pageLength > 0)
		{
			for(var o=0;o<pageLength;o++)
			{
				var pageAnnotation = pages[o];
				var index = parseInt(pageAnnotation.getAttribute('pageIndex'));
				var udvPageForProcessing = pageCollection[index];
				if(udvPageForProcessing)
				{
					if(pageAnnotation)
					{
						var rotateDeg = pageAnnotation.getAttribute('rotateDegrees') ? pageAnnotation.getAttribute('rotateDegrees') : 0;
						var rotateX = pageAnnotation.getAttribute('rotateX') ? pageAnnotation.getAttribute('rotateX') : 0;
						var rotateY = pageAnnotation.getAttribute('rotateY') ? pageAnnotation.getAttribute('rotateY') : 0;
						udvPageForProcessing.attributes.rotateDegrees = parseInt(rotateDeg);
						udvPageForProcessing.attributes.rotateX = parseInt(rotateX);
						udvPageForProcessing.attributes.rotateY = parseInt(rotateY);							
					}
				}
			}
		}
		getXMLFromServer(hasAnnotations,false,markupPath);
	};
	
	var request = 
	{
		path : rotationPath,
		onSuccess : onSuccess
	};
	WSOpenMarkupFile(request);
}

function logFileStatusChecker() {
	var onSuccess = function(req)
	{
		logFileStatus = req.responseText;
		if(logFileStatus !== "Completed") {
			executeTimeout(logFileStatusChecker, 200);
		} else {
			displayDocCompletedTools();
		}	
	};
	
	var request = 
	{
		nativeFilePath : documentAbsPath,
		onSuccess : onSuccess
	};
	WSLogFileStatus(request);
}

/**
 * Creates <div> pages to be loaded with SVGs later on. 
 * 
 * @param responseJSON - page attributes retrieved from UDV log file
 */
function getPageAttributes(responseJSON) {
	var pageCounter = $('.pages'), 
	docTotalPages = parseInt(responseJSON.pageCount); 
	pagesLength = parseInt(responseJSON.pages.length);
	if (pageCounter) {
		
		// Set doc total pages and starting pageNo
		pageCounter.text(docTotalPages);
		$('.current-page').val(1);

		if (docTotalPages == pagesLength) {
			
			// Create UDVPage instances equal to doc total pages
			for (var i = 0; i < pagesLength; i++) {
				var pageId = responseJSON.pages[i].id,
				pageWidth = responseJSON.pages[i].width,
				pageHeight = responseJSON.pages[i].height;
				
				var annotationG = createSVGElement("g");
				annotationG.setAttribute("data-isi", "markups-"+pageId);
				var highlightG = createSVGElement("g");
				highlightG.setAttribute("data-isi", "highlights-"+pageId);
				var groupDragG = createSVGElement("g"); 
				groupDragG.setAttribute("id", "groupDrag-"+pageId);
				
				var udvPage = new UDVPage(pageId, i, pageHeight, pageWidth, annotationG,highlightG,groupDragG); // Declare UDVPage object
				pageCollection.push(udvPage); // add to global (document) pageCollection
			}
		}
	}
	var nextPage = $(getElement('nextPage')),
		lastPage = $(getElement('lastPage'));

	if(docTotalPages > 1){
		$('#nextPage > i, #lastPage > i').css({
			'opacity':'1',
			'cursor':'pointer'
		});
		
		nextPage.css("cursor","pointer").data("enable",true);
		lastPage.css("cursor","pointer").data("enable",true);
	}else if(docTotalPages == 1) {
		$(getElement('firstBtn')).css({'cursor':'not-allowed','opacity':'0.5'});
		$(getElement('prevBtn')).css({'cursor':'not-allowed','opacity':'0.5'});
		$(getElement('lastBtn')).css({'cursor':'not-allowed','opacity':'0.5'});
		$(getElement('nextBtn')).css({'cursor':'not-allowed','opacity':'0.5'});
	}
	else if(docTotalPages == 0) {
		$(getElement('firstBtn')).css({'cursor':'not-allowed','opacity':'0.5'});
		$(getElement('prevBtn')).css({'cursor':'not-allowed','opacity':'0.5'});
		$(getElement('lastBtn')).css({'cursor':'not-allowed','opacity':'0.5'});
		$(getElement('nextBtn')).css({'cursor':'not-allowed','opacity':'0.5'});
	}
	
	if(documentViewer.allPagesReady)
		documentViewer.allPagesReady();
}


function clearAllDocumentMarkup()
{
	for(var i=0; i<pageCollection.length;i++)
	{
		pageCollection[i].removeAllAnnotations();
	}
}

function loadAnnotations(path,isNewPath)
{
	clearAllDocumentMarkup();
	loadMarkup(true,true,path,false);
	if(isNewPath)
		documentViewer.markupPath = path;
	resetDefaultVisibilityMode();
	checkRedactedFile();
}

/**
 * Loads markupObjects only from given path. Excluding rotations.
 * @param path
 * @param isNewPath
 */
function loadAnnotationsNoRotation(path,isNewPath)
{
	clearAllDocumentMarkup();
	if(isNewPath)
		documentViewer.markupPath = path;
	loadMarkup(true,false,path,false);
	resetDefaultVisibilityMode();
	checkRedactedFile();
}

function loadRotations(path)
{
	clearAllDocumentMarkup();
	loadMarkup(true,false,path,true);
	resetDefaultVisibilityMode();
}

function loadRotationsClean(path,isNewPath)
{
	loadMarkup(false,true,path,false);
	if(isNewPath)
		documentViewer.markupPath = path;
	checkRedactedFile();
}

function loadMarkup(hasAnnotation, hasRotation,path,temp)
{
	
	var onSuccess = function(httpRequest)
	{
		var dom = parseXMLToDom(httpRequest.responseText),
		f,
		version;

		if(f)
		{
			f = dom.getElementsByTagName('documentAnnotations')[0];
			version = f.getAttribute('version');	
		}

		var pages = dom.getElementsByTagName('page');
		var pageLength = pages.length;

		if(pageLength > 0)
		{
				for(var o=0;o<pageLength;o++)
				{					
					var pageAnnotation = pages[o];
					var index = parseInt(pageAnnotation.getAttribute('pageIndex'));
					var udvPageForProcessing = pageCollection[index];
					if(udvPageForProcessing)
					{
						if(pageAnnotation)
						{
							if(hasRotation)
							{
								var rotateDeg = pageAnnotation.getAttribute('rotateDegrees') ? pageAnnotation.getAttribute('rotateDegrees') : udvPageForProcessing.rotateDegrees;
								var rotateX = pageAnnotation.getAttribute('rotateX') ? pageAnnotation.getAttribute('rotateX') : udvPageForProcessing.attributes.rotateX;
								var rotateY = pageAnnotation.getAttribute('rotateY') ? pageAnnotation.getAttribute('rotateY') : udvPageForProcessing.attributes.rotateY;
								udvPageForProcessing.attributes.rotateDegrees = parseInt(rotateDeg) ? parseInt(rotateDeg) : 0;
								udvPageForProcessing.attributes.rotateX = parseInt(rotateX) ? parseInt(rotateDeg) : 0;
								udvPageForProcessing.attributes.rotateY = parseInt(rotateY) ? parseInt(rotateDeg) : 0;
							}
							
							if(hasAnnotation)
							{
								var annotationObjects = pageAnnotation.childNodes; //pageAnnotation.children; --> not working in Safari and IE
								var markupLength = annotationObjects.length;
								if (markupLength > 0)
								{
									var svgMarkupGroup = createSVGElement("g");
									svgMarkupGroup.setAttribute("data-isi", "markups-"+ (index+1));	//markups-<pageNo>
									
									for(var i=0; i<markupLength; i++)
									{
										var annotationNode = annotationObjects[i];
										if(annotationNode.nodeName === "#text")
										{
											continue;	
										}
										
										if(annotationNode.attributes && annotationNode.attributes.nodeId)
										{
											annotationNode.attributes = createMarkupAttributes(annotationNode);
										}
										
										var markupObject = processAnnotationXMLNode(annotationNode, udvPageForProcessing);
										if(markupObject)
										{
											udvPageForProcessing.addMarkupObject(markupObject); //populate pageCollection.markups

											//initializePreDrawProcess(markupObject.markupType,markupObject,pageCollection[o].svgMarkupGroup,markupObject.attributes.text);
//											var snapAnnotationGroup = new Snap(markupObject.shapes.group);
//											snapAnnotationGroup.drag();
//											snapAnnotationGroup.drag(function(){
//												//move of drag
//											},function(){
//												//start of drag
//								        		var viewerWrapper = $(getElement('viewer-document-wrapper')); 
//								        		var	handTool = $(getElement('page-handtool'));
//								        		var	handToolJS = document.getElementById('page-handtool');
//								        		handToolJS.setAttributeNS(null, 'data-drag', 'unable');
//								        		handTool.data('drag','unable').removeClass('selected-tool');
//								        		viewerWrapper.removeDragScroll();
//											},function(){
//												//end of drag
//												var handTool = $(getElement('page-handtool'));
//												var handToolJS = document.getElementById('page-handtool');
//												handToolJS.setAttributeNS(null, 'data-drag', 'enable');
//												if(handTool.data('drag') === 'unable')
//												handTool.trigger("mouseup");
//											});
										}
									}
								}
							}
						}
						//assign to global var markupId for next annotation id
						//markupId = iniMarkupId; markupId value is based on greatest id from markup
						if(hasRotation) {
							rotatePageOnLoad(index,udvPageForProcessing.attributes.rotateDegrees);
						} else {
							udvPageForProcessing.rotateTextMarkups(udvPageForProcessing.attributes.rotateDegrees);
						}
					}
				}
			}
	};
	var request = 
	{
		path : path,
		onSuccess : onSuccess
	};
	WSOpenMarkupFile(request,temp);
}

function getXMLFromServer(hasAnnotation, hasRotation,path)
{
	var onSuccess = function(httpRequest)
	{
		var dom = parseXMLToDom(httpRequest.responseText),
		f,
		version;

		if(f)
		{
			f = dom.getElementsByTagName('documentAnnotations')[0];
			version = f.getAttribute('version');	
		}
		var pages = dom.getElementsByTagName('page');
		var pageLength = pages.length;
		if(pageLength > 0)
		{
			//if (pageCollection.length == pageLength)
			{
				for(var o=0;o<pageLength;o++)
				{					
					var pageAnnotation = pages[o];
					var pgId = pageAnnotation.getAttribute('pageIndex') ? pageAnnotation.getAttribute('pageIndex') : (parseInt(pageAnnotation.getAttribute('id'))-1);

					var index = parseInt(pgId);
					var udvPageForProcessing = pageCollection[index];
					if(udvPageForProcessing)
					{
						if(pageAnnotation)
						{
							if(hasRotation)
							{
								var rotateDeg = pageAnnotation.getAttribute('rotateDegrees') ? pageAnnotation.getAttribute('rotateDegrees') : 0;
								var rotateX = pageAnnotation.getAttribute('rotateX') ? pageAnnotation.getAttribute('rotateX') : 0;
								var rotateY = pageAnnotation.getAttribute('rotateY') ? pageAnnotation.getAttribute('rotateY') : 0;
								udvPageForProcessing.attributes.rotateDegrees = parseInt(rotateDeg);
								udvPageForProcessing.attributes.rotateX = parseInt(rotateX);
								udvPageForProcessing.attributes.rotateY = parseInt(rotateY);							
							}
							if(hasAnnotation)
							{
								var annotationObjects = pageAnnotation.childNodes; //pageAnnotation.children; --> not working in Safari and IE
								var markupLength = annotationObjects.length;
								if (markupLength > 0)
								{
									var svgMarkupGroup = createSVGElement("g");
									svgMarkupGroup.setAttribute("data-isi", "markups-"+ (index+1));	//markups-<pageNo>
									udvPageForProcessing.svgMarkupGroup = svgMarkupGroup;
									for(var i=0; i<markupLength; i++)
									{
										var annotationNode = annotationObjects[i];
										if(annotationNode.nodeName === "#text")
										{
											continue;	
										}
										if(annotationNode.attributes && annotationNode.attributes.nodeId)
										{
											//FOR PCC PROCESSING ONLY
											annotationNode.attributes = createMarkupAttributes(annotationNode);
										}
										var markupObject = processAnnotationXMLNode(annotationNode, udvPageForProcessing);
										if(markupObject)
										{
											udvPageForProcessing.addMarkupObject(markupObject); //populate pageCollection.markups
											//update lastHighlightIndex upon load
											if(markupObject.markupType == markupTypes.TextHighLight || markupObject.markupType == markupTypes.TextRedactHighlight 
													|| markupObject.markupType == markupTypes.StrikeThrough || markupObject.markupType == markupTypes.CollabHighlight){
												udvPageForProcessing.setLastHighlightIndex(markupObject.attributes.layerIndex);
											}
//											var markupGrp = createSVGElement("g"); //create markupgroup <g>
//											markupGrp.setAttribute('style', 'display: block');
//											//initializePreDrawProcess(markupObject.markupType,markupObject,svgMarkupGroup,markupObject.attributes.text);
//											
//											var snapAnnotationGroup = new Snap(markupGrp);
//											snapAnnotationGroup.drag();
//											snapAnnotationGroup.drag(function(){
//												//move of drag
//											},function(){
//												//start of drag
//								        		var viewerWrapper = $(getElement('viewer-document-wrapper')); 
//								        		var	handTool = $(getElement('page-handtool'));
//								        		var	handToolJS = document.getElementById('page-handtool');
//								        		handToolJS.setAttributeNS(null, 'data-drag', 'unable');
//								        		handTool.data('drag','unable').removeClass('selected-tool');
//								        		viewerWrapper.removeDragScroll();
//											},function(){
//												//end of drag
//												var handTool = $(getElement('page-handtool'));
//												var handToolJS = document.getElementById('page-handtool');
//												handToolJS.setAttributeNS(null, 'data-drag', 'enable');
//												if(handTool.data('drag') === 'unable')
//												handTool.trigger("mouseup");
//											});
											//svgMarkupGroup.appendChild(markupGrp); //populate pageCollection.svgMarkupGroup
											//markupObject.processWrapping();
										}
										//markupObject.rotateTextObject(pageCollection[o].attributes.rotateDegrees);
									}
									//add to pageCollection.svgMarkupGroup all markupObjects created
									udvPageForProcessing.svgMarkupGroup = svgMarkupGroup;
									
									reloadAnnotationLayers(udvPageForProcessing.markups,svgMarkupGroup)
								}
							}
						}
						//assign to global var markupId for next annotation id
						//markupId = iniMarkupId; markupId value is based on greatest id from markup
					}
				}
			}
			}
		
			computeMarkupsForNavigation();
			countTotalMarkupsForNavigation();

			loadDivPages();
			loadSvgOnViewablePage();
			if(documentViewer.fitOnLoad != undefined && documentViewer.fitOnLoad === true)
			{
				//Enable fit to width
				isFitContent = true;
				$(getElement('fitToWidth')).toggleClass('active-state');
				fitToWidthViewablePages();
				if(!isFitContent)
				{
					transferTextAreaValuetoDiv(lastSelectedDivReason);
					zoomAllPages(scaleFactor);
				}
			}
			
			//rotateAllTextObjects();
			if(documentViewer.loadAnnotationsCallback)
			{
				documentViewer.loadAnnotationsCallback();
			}
			
			if(documentViewer.isMobile === true)
				displayVisibilityToolsForAvailableObjects();
			
			$("#textSelection").trigger('click');
			
			
	};
	
	var request = 
	{
		path : path,
		onSuccess : onSuccess
	};
	
	WSOpenMarkupFile(request);
}

function parseXMLToDom(xmlStr)
{
	var xmlToDomParser;
	if (window.DOMParser) {
		xmlToDomParser = function(xmlStr) {
			return (new window.DOMParser())
					.parseFromString(xmlStr,
							"text/xml");
		};
	} else if (typeof window.ActiveXObject !== "undefined"
			&& new window.ActiveXObject(
					"Microsoft.XMLDOM")) {
		xmlToDomParser = function(xmlStr) {
			var xmlDoc = new window.ActiveXObject(
					"Microsoft.XMLDOM");
			xmlDoc.async = "false";
			xmlDoc.loadXML(xmlStr);
			return xmlDoc;
		};
	} else {
		xmlToDomParser = function() {
			return null;
		};
	}

	return xmlToDomParser(xmlStr);
}


function createAttributes(node, udvPage)
{
	var drawnObjectAttributes = {};
	var attributes = node.attributes;
	var attrLength = node.attributes.length;
	var attributeName = "";
	for(var i=0;i<attrLength;i++)
	{
		attributeName = attributes[i].nodeName;
		if(attributeName === 'type'){
			drawnObjectAttributes[attributeName] = parseInt(attributes[i].nodeValue);
		}
		else if(attributeName === 'rx' || attributeName === 'ry' || attributeName === 'cx' || attributeName === 'cy' || attributeName === 'x' || attributeName === 'y' || attributeName === 'height' || attributeName === 'width' || attributeName === 'id'){
			
//			if(drawnObjectAttributes.type === markupTypes.StickyNote && (attributeName === 'x' || attributeName === 'y')){
//				var noteHeight = 150,
//				noteWidth = 170;
//				pageHeight = udvPage.attributes.pageHeight,
//				pageWidth = udvPage.attributes.pageWidth,
//				padding = 20;
//				switch(attributes[i].nodeValue){
//					case "left" :
//						attributes[i].nodeValue = 20;
//						break;
//					case "right" :
//						attributes[i].nodeValue = parseInt(pageWidth) - noteWidth - padding; 
//						break;
//					case "top" :
//						attributes[i].nodeValue = 20;
//						break;
//					case "bottom" :
//						attributes[i].nodeValue = parseInt(pageHeight) - noteHeight - padding; 
//						break;				
//				}
//			}
			
			drawnObjectAttributes[attributeName] = parseFloat(attributes[i].nodeValue);
		}
		else{
			drawnObjectAttributes[attributeName] = attributes[i].nodeValue;
		}
		
		if(attributes[i].nodeName === 'id')
		{
			if(markupId<drawnObjectAttributes[attributeName])
			{
				markupId = drawnObjectAttributes[attributeName];
			}
		}
	}
	
	if(drawnObjectAttributes.type === markupTypes.Text || drawnObjectAttributes.type === markupTypes.StickyNote)
	{

		if(!node.attributes.nodeId)
		{
			var textCollection = node.childNodes;
			var len = textCollection.length;

			var textForAttribute = [];
			for(var p=0; p<len; p++)
			{
				textForAttribute.push(textCollection[p].textContent);
			}
			drawnObjectAttributes.text = textForAttribute;
		}
		else
		{
			attributes.text = attributes.text.nodeValue;
			var textForAttribute = [];
			textForAttribute.push(attributes.text);
			drawnObjectAttributes.text = textForAttribute;
		}

	}
	
	if(drawnObjectAttributes.type === markupTypes.RectangleRedaction)
	{
		var temp = drawnObjectAttributes.text;
		drawnObjectAttributes.text = [];
		drawnObjectAttributes.text.push(temp);
	}
	
	return drawnObjectAttributes;
}

/**
 * 
 * For PCC processing of markups
 * DEPRECATED
 */
function createMarkupAttributes(annotationNode)
{
	var attributes = {};
	var attributesXML = annotationNode.attributes;
	
	var length = attributesXML.length,type;
	
	for(var i=0;i<length;i++)
	{
		attributes[attributesXML[i].name] = attributesXML[i].value;
	}
	
	function longToRGB(color)
	{
		var red = parseInt(color >> 16);
		var green = parseInt(color >> 8 & 0xFF);
		var blue = parseInt(color & 0xff);
		return 'rgb('+red+','+green+','+blue+')';
	}
	
	function hexToRgb(hex) {
	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    
	    return '('+parseInt(result[1], 16)+','+parseInt(result[2], 16)+','+parseInt(result[3], 16)+')';
	}
	
	if(isNaN(attributes.drawType))
	{
		switch(attributes.drawType)
		{
			case markupSaveType.Circle :
			case markupSaveType.CircleFilled :
				attributes.cx = (parseInt(attributes.x)) + (parseInt(attributes.width)/2);
				attributes.cy = (parseInt(attributes.y)) + (parseInt(attributes.height)/2);
				attributes.rx = parseInt(attributes.width)/2;
				attributes.ry = parseInt(attributes.height)/2;
				annotationNode.setAttribute('cx',(parseInt(attributes.x)) + (parseInt(attributes.width)/2));
				annotationNode.setAttribute('cy',(parseInt(attributes.y)) + (parseInt(attributes.height)/2));
				annotationNode.setAttribute('rx',parseInt(attributes.width)/2);
				annotationNode.setAttribute('ry',parseInt(attributes.height)/2);
				delete attributes.x;
				delete attributes.y;
				break;
			case markupSaveType.Text:
			case markupSaveType.RectangleRedaction :
				if(attributes.drawType === markupSaveType.Text)
				{
					if (window.DOMParser)
					  {
						try
						{
							var parser;
						    parser=new DOMParser();
						    var xmlDoc;
						    xmlDoc=parser.parseFromString(annotationNode.childNodes[0].data,"text/xml");
						    var textAttributes = getAllNodes(xmlDoc);
						    attributes.fontColor = textAttributes.FONT[2].nodeValue;
						    attributes.fontFamily = textAttributes.FONT[0].nodeValue;
						    attributes.fontSize = parseInt(textAttributes.FONT[1].nodeValue);
						    attributes.boldStlye = textAttributes.B ? true : false;
						    attributes.italicStyle = textAttributes.I ? true : false;
						    attributes.underLineStrikeStyle = textAttributes.U ? true : false;
						    attributes.horizontalAlign = textAttributes.P[0].nodeValue.toLowerCase();
							
							attributes.text = textAttributes.text;
							annotationNode.setAttribute('text',textAttributes.text);			
							
						    annotationNode.setAttribute('fontColor',textAttributes.FONT[2].nodeValue);
						    annotationNode.setAttribute('fontFamily',textAttributes.FONT[0].nodeValue);
						    annotationNode.setAttribute('fontSize',parseInt(textAttributes.FONT[1].nodeValue));
						    annotationNode.setAttribute('boldStlye',textAttributes.B ? true : false);
						    annotationNode.setAttribute('italicStyle',textAttributes.I ? true : false);
						    annotationNode.setAttribute('underLineStrikeStyle',textAttributes.U ? true : false);
						    annotationNode.setAttribute('horizontalAlign',textAttributes.P[0].nodeValue.toLowerCase());
						}
						catch(err)
						{
							
						}
					  }
				}
				else
				{
					attributes.text = attributes.meta;
					annotationNode.setAttribute('text',attributes.meta);					
				}
			case markupSaveType.Rectangle :
			case markupSaveType.RectangleFilled :
				attributes.x = (parseInt(attributes.x)) + (parseInt(attributes.width));
				attributes.y = (parseInt(attributes.y)) + (parseInt(attributes.height));
				attributes.width = parseInt(attributes.width);
				attributes.height = parseInt(attributes.height);
				annotationNode.setAttribute('x',(parseInt(attributes.x)) + (parseInt(attributes.width)));
				annotationNode.setAttribute('y',(parseInt(attributes.y)) + (parseInt(attributes.height)));
				annotationNode.setAttribute('width',parseInt(attributes.width));
				annotationNode.setAttribute('height',parseInt(attributes.height));
				break;
			case markupSaveType.Arrow : 
			case markupSaveType.Line :
				attributes.x1 = parseInt(attributes.x);
				attributes.y1 = parseInt(attributes.y);
				attributes.x2 = (parseInt(attributes.x)) + (parseInt(attributes.width));
				attributes.y2 = (parseInt(attributes.y)) + (parseInt(attributes.height));
				attributes.borderWeight = attributes.lineWidth*6;
				annotationNode.setAttribute('x1',parseInt(attributes.x));
				annotationNode.setAttribute('y1',parseInt(attributes.y));
				annotationNode.setAttribute('x2',(parseInt(attributes.x)) + (parseInt(attributes.width)));
				annotationNode.setAttribute('y2',(parseInt(attributes.y)) + (parseInt(attributes.height)));
				annotationNode.setAttribute('borderWeight',attributes.lineWidth*6);
				delete attributes.x;
				delete attributes.y;
				break;
		}
		
		switch(attributes.drawType)
		{
			case markupSaveType.Circle :
    		case markupSaveType.Rectangle : 
    			attributes.fillColor = 'rgba(255,255,255,0)';
    			attributes.borderColor = longToRGB(attributes.lineColor);
    			annotationNode.setAttribute('fillColor','rgba(255,255,255,0)');
    			annotationNode.setAttribute('borderColor',longToRGB(attributes.lineColor));
    			break;
			case markupSaveType.CircleFilled :
    		case markupSaveType.RectangleFilled : 
    			attributes.borderColor = 'rgba(255,255,255,0)';
    			attributes.fillColor = longToRGB(attributes.fillColor);
    			annotationNode.setAttribute('fillColor','rgba(255,255,255,0)');
    			annotationNode.setAttribute('borderColor',longToRGB(attributes.fillColor));
    			break;
			case markupSaveType.Text:
				attributes.fontColor = hexToRgb(attributes.fontColor);
    			attributes.fillColor = longToRGB(attributes.fillColor);
    			attributes.borderColor = longToRGB(attributes.lineColor);
    			attributes.borderWeight = attributes.lineWidth;
    			annotationNode.setAttribute('fontColor',attributes.fontColor);
    			annotationNode.setAttribute('fillColor',longToRGB(attributes.fillColor));
    			annotationNode.setAttribute('borderColor',longToRGB(attributes.lineColor));
    			annotationNode.setAttribute('borderWeight',attributes.lineWidth);
				break;
    		default:
    			attributes.fillColor = longToRGB(attributes.fillColor);
    			attributes.borderColor = longToRGB(attributes.lineColor);
    			annotationNode.setAttribute('fillColor',longToRGB(attributes.fillColor));
    			annotationNode.setAttribute('lineColor',longToRGB(attributes.lineColor));
    			break;
		}
		
		if(!attributes.opacity)
		{
			attributes.opacity = 1;
			annotationNode.setAttribute('opacity',1);
		}
		
	}
	
	annotationNode.setAttribute('id',pccId);
	attributes.id = pccId++;
	
	switch(attributes.drawType)
	{
		case markupSaveType.Circle: 
		case markupSaveType.CircleFilled: 
			annotationNode.setAttribute('type',markupTypes.Circle);
			attributes.type = markupTypes.Circle;
			break;
		case markupSaveType.Rectangle:
		case markupSaveType.RectangleFilled:
			annotationNode.setAttribute('type',markupTypes.Rectangle);
			attributes.type = markupTypes.Rectangle;
			break;
		case markupSaveType.Line:
			annotationNode.setAttribute('type',markupTypes.Line);
			attributes.type = markupTypes.Line;
			break;
		case markupSaveType.Arrow:
			annotationNode.setAttribute('type',markupTypes.Arrow);
			attributes.type = markupTypes.Arrow;
			break;
		case markupSaveType.Text:
			annotationNode.setAttribute('type',markupTypes.Text);
			attributes.type = markupTypes.Text;
			break;
		case markupSaveType.RectangleRedaction:
			annotationNode.setAttribute('type',markupTypes.RectangleRedaction);
			attributes.type = markupTypes.RectangleRedaction;
			break;
	}
	return attributes;
}

function createMarkupDrawnObject(annotationNode, udvPage)
{
	var drawnObject = {},type;
	type = annotationNode.getAttribute('type');
	switch (parseInt(type)){
		case markupTypes.TextHighLight:
		case markupTypes.CollabHighlight:
		case markupTypes.TextRedactHighlight:
			//get children
			//create top g
			//create markupObjectHolder
			var parentGroup;
			var len = annotationNode.childNodes.length;
			var highlightCollection = [];
			var commentForAttribute = [];
			for (var i = 0; i < len; i++){
				if(annotationNode.childNodes[i].nodeName!="comment")
				{
					var hlBox = {};
					hlBox.attributes = createAttributes(annotationNode.childNodes[i]);
					hlBox.id = hlBox.attributes.id;
					hlBox.shapes = createShapeObject(parseInt(type),null,parentGroup);
					if (parentGroup == undefined || parentGroup == null){
						parentGroup = hlBox.shapes.group;
					}
					hlBox.toString = function()
					{
						var str ='';
						
						for(var i in this.attributes)
						{
							str+='('+i+','+this.attributes[i]+')';
						}
						return str;
					};
					hlBox.markupType = parseInt(type);
					attachShapeFunctions(hlBox);
					highlightCollection.push(hlBox);
					if (type == markupTypes.TextRedactHighlight){
						attachDrawFinishFunction(hlBox);
					}
				}else
				{
					commentForAttribute.push(annotationNode.childNodes[i].textContent);
				}
				
			}
			
			drawnObject.drawnObjectCollection = highlightCollection;
			drawnObject.attributes = highlightCollection[0].attributes;
			drawnObject.attributes.comment = commentForAttribute;
			drawnObject.markupType = parseInt(type);
			drawnObject.id = drawnObject.attributes.id;
			drawnObject.shapes = highlightCollection[0].shapes;
			break;
		case markupTypes.StrikeThrough:
			//get children
			//create top g
			//create markupObjectHolder
			var parentGroup;
			var len = annotationNode.childNodes.length;
			var highlightCollection = [];
			var commentForAttribute = [];
			for (var i = 0; i < len; i++){
				if(annotationNode.childNodes[i].nodeName!="comment")
				{
					var hlBox = {};
					hlBox.attributes = createAttributes(annotationNode.childNodes[i]);
					hlBox.id = hlBox.attributes.id;
					hlBox.shapes = createShapeObject(parseInt(type),null,parentGroup);
					if (parentGroup == undefined || parentGroup == null){
						parentGroup = hlBox.shapes.group;
					}
					hlBox.toString = function()
					{
						var str ='';
						
						for(var i in this.attributes)
						{
							str+='('+i+','+this.attributes[i]+')';
						}
						return str;
					};
					hlBox.markupType = parseInt(type);
					attachShapeFunctions(hlBox);
					highlightCollection.push(hlBox);
				}else
				{
					commentForAttribute.push(annotationNode.childNodes[i].textContent);					
				}
			}
			
			drawnObject.drawnObjectCollection = highlightCollection;
			drawnObject.attributes = highlightCollection[0].attributes;
			drawnObject.attributes.comment = commentForAttribute;
			drawnObject.markupType = parseInt(type);
			drawnObject.id = drawnObject.attributes.id;
			drawnObject.shapes = highlightCollection[0].shapes;
			break;
		default:
			drawnObject.attributes = createAttributes(annotationNode, udvPage);
			type = drawnObject.attributes.type;
		
			drawnObject.id = drawnObject.attributes.id;
			drawnObject.shapes = createShapeObject(type);
			drawnObject.toString = function()
			{
				var str ='';
			
				for(var i in this.attributes)
				{
					str+='('+i+','+this.attributes[i]+')';
				}
				return str;
			};
		
			drawnObject.markupType = type;
			attachShapeFunctions(drawnObject);
			attachSnapToDrag(drawnObject.shapes.group);
			attachDrawFinishFunction(drawnObject);
			break;	
	}
	//TODO: DELETE comment v
//	if (type == markupTypes.TextHighLight){
//		
//	} else if (type == markupTypes.TextRedactHighlight){
//		
//	} else {
//		
//	}
	
	return drawnObject;
	
}

function getAllNodes(node)
{
	var obj = {};
	var n;
	while(node.firstChild)
	{
		n = node.firstChild;
		if(!n.firstChild)
		{
			obj.text = n.data;
		}
		if(n.nodeName==='#text')
		{
			node.removeChild(n);
		}
		else if(n)
		{
			obj = getAllNodes(n);
			obj[n.tagName] = n.attributes;
			node.removeChild(n);
		}
	}
	return obj;
}

function initializeAnnotationObject(drawnObject,isIEX)
{
	var previousIE = JSON.parse(JSON.stringify(isIE));
	if(isIEX != undefined)
	{
		isIE = isIEX;
	}
	var attributes = drawnObject.attributes;
	switch(attributes.type)
	{
		case markupTypes.Circle:
				drawnObject.setCX(attributes.cx);
				drawnObject.setCY(attributes.cy);
				drawnObject.setRX(attributes.rx);
				drawnObject.setRY(attributes.ry);
				drawnObject.setFillColor(attributes.fillColor);
				drawnObject.setBorderColor(attributes.borderColor);
				drawnObject.setBorderWeight(attributes.borderWeight);
				drawnObject.setOpacity(attributes.opacity);
				drawnObject.setId(attributes.id);
			break;

		case markupTypes.Rectangle:
				drawnObject.setX(attributes.x);
				drawnObject.setY(attributes.y);
				drawnObject.setWidth(attributes.width);
				drawnObject.setHeight(attributes.height);
				drawnObject.setFillColor(attributes.fillColor);
				drawnObject.setBorderColor(attributes.borderColor);
				drawnObject.setBorderWeight(attributes.borderWeight);
				drawnObject.setOpacity(attributes.opacity);
				drawnObject.setId(attributes.id);
			break;
		case markupTypes.TextHighLight:
		case markupTypes.CollabHighlight: 
				drawnObject.setX(attributes.x);
				drawnObject.setY(attributes.y);
				drawnObject.setWidth(attributes.width);
				drawnObject.setHeight(attributes.height);
				drawnObject.setFillColor(attributes.fillColor);
				drawnObject.setOpacity(attributes.opacity);
				drawnObject.setId(attributes.id);
			break;
		case markupTypes.Arrow:
				drawnObject.shapes.SVGLine.setAttributeNS(null, 'marker-end', 'url(#arrowhead-'+attributes.id+')');
				appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGArrowHead);
				appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGLine);
				
				drawnObject.setCircMaskCX(attributes.x2);
				drawnObject.setCircMaskCY(attributes.y2);
				drawnObject.setCircMaskRX(12);
				drawnObject.setCircMaskRY(12);
		case markupTypes.Line:
				drawnObject.setX1(attributes.x1);
				drawnObject.setY1(attributes.y1);
				drawnObject.setX2(attributes.x2);
				drawnObject.setY2(attributes.y2);
				
				drawnObject.setFillColor(attributes.fillColor);
				drawnObject.setBorderWeight(attributes.borderWeight);
				drawnObject.setOpacity(attributes.opacity);
				drawnObject.setId(attributes.id);
			break;
		case markupTypes.StrikeThrough:
				drawnObject.setX1(attributes.x1);
				drawnObject.setX2(attributes.x2);
				drawnObject.setY(attributes.y1);
				drawnObject.setRectY(attributes.y1-(attributes.height/2));
				drawnObject.setWidth(attributes.width);
				drawnObject.setHeight(attributes.height);
			
				drawnObject.setFillColor(attributes.fillColor);
				drawnObject.setBorderWeight(attributes.borderWeight);
				drawnObject.setId(attributes.id);
			break;
		case markupTypes.Stamp:
				drawnObject.setOpacity(attributes.opacity);
				drawnObject.setFontColor(attributes.fontColor);
				drawnObject.setFontFamily(attributes.fontFamily);
				drawnObject.setFontSize(attributes.fontSize);
				drawnObject.setBoldStyle(attributes.boldStyle);
				drawnObject.setItalicStyle(attributes.italicStyle);
				drawnObject.setUnderlineStrikeStyle(attributes.underLineStrikeStyle);
				drawnObject.setStampText(attributes.stampText);
				drawnObject.setX(attributes.x);
				drawnObject.setY(attributes.y);
				drawnObject.setWidth(attributes.width);
				drawnObject.setHeight(attributes.height);
			break;
		case markupTypes.Image:
				drawnObject.setX(attributes.x);
				drawnObject.setY(attributes.y);
				drawnObject.setWidth(attributes.width);
				drawnObject.setHeight(attributes.height);
				drawnObject.setImageData(attributes.href);
				drawnObject.setId(attributes.id);
			break;
		case markupTypes.StickyNote:	
		case markupTypes.Text:
				drawnObject.shapes.SVGRectangle.setAttributeNS(null, 'style', 'z-index:-1;position:absolute;');
				drawnObject.setX(attributes.x);
				drawnObject.setY(attributes.y);
				drawnObject.setWidth(attributes.width);
				drawnObject.setHeight(attributes.height);
				drawnObject.setFillColor(attributes.fillColor);
				drawnObject.setBorderColor(attributes.borderColor);
				drawnObject.setBorderWeight(attributes.borderWeight);
				drawnObject.setOpacity(attributes.opacity);
				drawnObject.setId(attributes.id);
				
				drawnObject.setFontColor(attributes.fontColor);
				drawnObject.setFontFamily(attributes.fontFamily);
				drawnObject.setFontSize(attributes.fontSize);
				drawnObject.setBoldStyle(attributes.boldStyle);
				drawnObject.setItalicStyle(attributes.italicStyle);
				drawnObject.setUnderlineStrikeStyle(attributes.underLineStrikeStyle);
				drawnObject.setHorizontalAlign(attributes.horizontalAlign);
				drawnObject.setVerticalAlign(attributes.verticalAlign);
				
				if(isIE){
					var horizontalAlignString = null, valueX = 0;
					switch(attributes.horizontalAlign){
					case 'left':
						valueX = 5;
						horizontalAlignString = "start";
						break;
					case 'center':
						valueX = parseInt(attributes.width/2);
						horizontalAlignString = "middle";
						break;
					case 'right':
						valueX = parseInt(attributes.width-5);
						horizontalAlignString = "end";
						break;
					}

					drawnObject.shapes.SVGGWrapper.setAttributeNS(null, 'transform', 'matrix(1 0 0 1 '+attributes.x+' '+attributes.y+')');
					drawnObject.setSVGTextValueX(valueX);
					drawnObject.setTextAnchor(horizontalAlignString);
				}
				insertTextValuetoDiv(drawnObject,drawnObject.getText());
			break;

		case markupTypes.RectangleRedaction:
		case markupTypes.TextRedactHighlight:
				drawnObject.shapes.group.setAttributeNS(null, 'data-isi','redaction-'+(markupId));
				drawnObject.setX(attributes.x);
				drawnObject.setY(attributes.y);
				drawnObject.setWidth(attributes.width);
				drawnObject.setHeight(attributes.height);
				drawnObject.setFontColor('rgb(255, 255, 255)');
				drawnObject.visibilityMode = visibilityMode.Shown;
				drawnObject.setId(attributes.id);
				drawnObject.setOpacity(1);
				if(isIE)
				{
//					drawnObject.shapes.SVGGWrapper.setAttributeNS(null,'transform','matrix(1,0,0,1,'+x+','+y+')');
//					clearChildren(drawnObject.shapes.SVGText);
//					processWrapping(drawnObject.shapes.SVGText,attributes.text,15,width,markupId,(width/2));
				}
				else
				{
					drawnObject.setFillColor('rgba(0, 0, 0, 1)');
					drawnObject.setText(attributes.text);
				}
			break;
			
	}
	if(previousIE != isIE)
		isIE = previousIE;
}

function createMarkupSVGObjects(type)
{
	var shapes = {};
	
	switch(type)
	{
		case markupTypes.StickyNote: 
		case markupTypes.Text : 
		case markupTypes.RectangleRedaction :
			if(isIE)
			{
				
			}
			else
			{
				
			}
		case markupTypes.Rectangle :
			shapes.SVGRectangle = createSVGElement('rect');
			shapes.retrieveOriginCoordinates = function()
			{
				transformed = getObjectMatrix(this.SVGRectangle.parentNode);
				return transformed;
			};
			shapes.retrieveShapeForCalculation = function()
			{
				return this.SVGRectangle;
			};
			break;
		case markupTypes.Arrow :
			shapes.SVGArrowHead = createSVGElement('marker');
		case markupTypes.Line :
			shapes.SVGLine = createSVGElement('line');
			shapes.retrieveOriginCoordinates = function()
			{
				transformed = getObjectMatrix(this.SVGLine.parentNode);
				return transformed;
			};
			break;
		case markupTypes.Circle :
			shapes.SVGEllipse = createSVGElement('ellipse');
			shapes.retrieveOriginCoordinates = function()
			{
				transformed = getObjectMatrix(this.SVGEllipse.parentNode);
				return transformed;
			};
			break;
	}
	return shapes;
}

function processAnnotationXMLNode(annotationNode, udvPage)
{
//	for PCC v
//	var annotationType = annotationNode.getAttribute('drawType');
	var annotationType = annotationNode.getAttribute('type');
	var markup = {};
	markup = createMarkupDrawnObject(annotationNode, udvPage);
	annotationType = markup.markupType;
	if(annotationType == markupTypes.TextHighLight || annotationType == markupTypes.TextRedactHighlight 
			|| annotationType == markupTypes.StrikeThrough || annotationType == markupTypes.CollabHighlight){
		var hlBoxLen = markup.drawnObjectCollection.length;
		for (var i = 0; i < hlBoxLen; i++){
			var singleRect = markup.drawnObjectCollection[i];
			initializePreDrawProcess(singleRect.markupType,singleRect,udvPage.svgMarkupGroup);
			initializeAnnotationObject(singleRect);
		}
	} else {
		initializePreDrawProcess(markup.markupType,markup,udvPage.svgMarkupGroup,markup.attributes.text);
		initializeAnnotationObject(markup);
	}
	if(!markup.id)
		markup = null;
	return markup;
}


//Get Scroll Height Percentage
var curPage,
curscrollPercentage,
scrollHeightPercentage,
lastCurScrollPer,
DoctotalPages,
scrollDiff;

function loadDivPages()
{
	var viewerDocWrapper = $(getElement('viewer-document-wrapper')),
	pageLength = pageCollection.length, pageDiv,
	pageWidth, pageHeight, rotateDeg;
	
	if(pageLength > 0) {
		for(var i=0; i<pageLength; i++) {
			pageId = pageCollection[i].attributes.id;
			pageWidth = pageCollection[i].attributes.pageWidth,
			pageHeight = pageCollection[i].attributes.pageHeight;
			rotateDeg = pageCollection[i].attributes.rotateDegrees;
			
			pageWidth = pageWidth * scaleFactor; //uncomment if zoom needs to be cached
			pageHeight = pageHeight * scaleFactor; //uncomment if zoom needs to be cached
			
			// Set page div tag
			pageDiv = $(document.createElement("div"));
			pageDiv.attr('id', pageId);
			pageDiv.addClass("pageContent");			
			
			if(rotateDeg == 90 || rotateDeg == 270) {
				pageDiv.css("width", pageHeight);
				pageDiv.css("height", pageWidth);	
			} else {
				pageDiv.css("width", pageWidth);
				pageDiv.css("height", pageHeight);							
			}
			viewerDocWrapper.append(pageDiv);
			
			if (i == 0 && viewerDocWrapper.first()) {
				pageDiv.addClass("currentView"); //assume currentView always starts with first page
			}			
		}
		documentViewer.refresh();
		currentView = $('.currentView');
	}
	
	curPage = $('.current-page').val();
	
	
	getScrollHeightPercentage(pageCollection.length);

	//Enable Hand Tool when there is horizontal scrollbar
	HScrollBarChecker();

}


//get the scroll percentage per page
function getScrollHeightPercentage(totalPages){
	var viewerContainer = $(getElement('viewerContainer'));
	DoctotalPages = totalPages;
	scrollDiff = (viewerContainer[0].scrollHeight - viewerContainer[0].clientHeight),
	scrollHeightPerPage = scrollDiff / totalPages,
	scrollHeightPercentage = (scrollHeightPerPage / scrollDiff) * 100; // Holder of Scroll Percentage per page
}

function currentScrollVal(curscrollPercentage,scrollDiff){
	var decimal = curscrollPercentage / 100;
	return Math.round(decimal * scrollDiff);
}

//Horizontal ScrollBar Checker
function HScrollBarChecker(){
	var viewerContainer = $(getElement('viewerContainer')),
		viewerWrapper = $(getElement('viewer-document-wrapper')),
		handTool = $(getElement('page-handtool'));
		handToolJS = document.getElementById('page-handtool');
		
	if (Number(viewerContainer[0].scrollWidth + 10) > viewerContainer.innerWidth()) {
		//start of drag
		handToolJS.setAttributeNS(null, 'data-drag', 'enable');
		if(handTool.data('drag') === 'unable')
		handTool.trigger("mouseup");
	}else if(handTool.data('drag') === 'unable'){
		//end of drag
		handToolJS.setAttributeNS(null, 'data-drag', 'unable');
		handTool.data('drag','unable').removeClass('selected-tool');
		viewerWrapper.removeDragScroll();
	}
};

function disableHandTool() {
	var handTool = $(getElement('page-handtool'));
	handTool.data("drag", "unable").removeClass('selected-tool');
	handTool.data('laststate',false);
	viewerWrapper.removeDragScroll();
}

var $window = $(window);
var documentHeight = $(document).height();
var windowHeight = $window.height();
var scrollTop = $window.scrollTop();
var pageNavScroll = false;
var zoomScroll = false;
var preZoomPageNo;

function getCompCurPage(){
	var quotient = curscrollPercentage / scrollHeightPercentage;
	var tmpCurPage = Math.ceil(quotient);
	tmpCurPage = (tmpCurPage===0 || isNaN(tmpCurPage)) ? 1 : tmpCurPage;
	tmpCurPage = (tmpCurPage>DoctotalPages) ? DoctotalPages : tmpCurPage;
	return tmpCurPage;
}

function scrollFn(){
	var viewerContainer = $(getElement('viewerContainer')),
	currentCount = $('.current-page');
	
	transferTextAreaValuetoDiv(lastSelectedDivReason);
	if (currentView.length <= 0) {
		return false;
	}
	
	curscrollPercentage = ((viewerContainer.scrollTop() / scrollDiff) * 100);
	if(pageNavScroll) {
		viewerWrapper.children().eq(currentCount.val()-1).addClass("currentView").siblings().removeClass("currentView");
		pageNavScroll = false;
		
	} else if(zoomScroll) {
		zoomScroll = false;
		var tmpCurPage = getCompCurPage();
		if(preZoomPageNo != tmpCurPage) {
			jumpPage(preZoomPageNo);
		} else {
			viewerWrapper.children().eq(tmpCurPage-1).addClass("currentView").siblings().removeClass("currentView");
			currentCount.val(tmpCurPage);			
		}
	} else {
		var tmpCurPage = getCompCurPage();
		viewerWrapper.children().eq(tmpCurPage-1).addClass("currentView").siblings().removeClass("currentView");
		currentCount.val(tmpCurPage);
	}
	
	//Display viewable svg
	var _currentView = getElement('viewer-document-wrapper').getElementsByClassName("currentView");
	var viewerChild = getElement('viewer-document-wrapper').getElementsByClassName("pageContent");
	var pageId = _currentView[0].getAttribute("id");
	var index = pageId.substring(pageId.indexOf('_page_')+6,pageId.length) - 1;
	 
	if (!hasChildren($(viewerChild[index]))){
		loadSVGHelper($(viewerChild[index]), index);
	}
	setTimeout(loadPreviousPages(viewerChild, index, displayViewableSvg), 100);
	setTimeout(loadNextPages(viewerChild, index, displayViewableSvg), 100);
	
	checkNavigation();
}

function loadSvgOnViewablePage() 
{
	var _currentView = getElement('viewer-document-wrapper').getElementsByClassName("currentView");
	var viewerChild = getElement('viewer-document-wrapper').getElementsByClassName("pageContent");
	var pageId = _currentView[0].getAttribute("id");
	var index = pageId.substring(pageId.indexOf('_page_')+6,pageId.length) - 1;
	
	loadSVGHelper($(viewerChild[index]), index);
	setTimeout(loadPreviousPages(viewerChild, index, loadSVGHelper), 0);
	setTimeout(loadNextPages(viewerChild, index, loadSVGHelper), 0);
}

function loadSVGHelper(object, i) {
	if (isPageViewable(object)){
		var udvPage = pageCollection[i];
		// If viewable, load svg file of page
		loadSVG(object);
		udvPage.isPageRequested = true;
		return true;
	} else {
		return false;
	}
}

function loadPreviousPages(list, startPage, fn){
	for (var i = startPage - 1; i >= 0; i--){
		if (!fn($(list[i]), i)){
			break;
		} 
	}
}

function loadNextPages(list, startPage, fn){
	for (var i = startPage + 1; i < list.length; i++){
		if (!fn($(list[i]), i)){
			break;
		} 
	}
}

function displayErrorPlaceHolder()
{
	$('.pages').text(1);
	$('.current-page').val(1);
	var pageId = 1,
	pageIndex = 0;
	
	var udvPage = new UDVPage(pageId, pageIndex, erroredPage.height, erroredPage.width, null, null,null);//arvin
	udvPage.isErroredPage = true;
	pageCollection.push(udvPage);	
	
	var viewerDocWrapper = $(getElement('viewer-document-wrapper')),
	pageDiv = $(document.createElement("div"));
	pageDiv.addClass("pageContent");
	pageDiv.addClass("currentView");
	pageDiv.css("width", erroredPage.width);
	pageDiv.css("height", erroredPage.height);
	viewerDocWrapper.append(pageDiv);
	currentView = $('.currentView');
	
	loadSVG($(pageDiv));
}

function displayReviewTools(display) {
	displayReviewTabs(display);
	if(display === true)
		displayVisibilityTools(documentViewer.annotateTab,documentViewer.redactTab);
	else
		displayVisibilityTools(false,false);
	
	if(documentViewer.isMobile === true)
	{
		//document.getElementById('page-handtool').style.display='none';
		hideDocCompletedTools();
	}
	else
	{
		hideVisibilityTools(documentViewer.annotateTab,documentViewer.redactTab);
		displayDocCompletedTools();	
	}
	
	//hideVisibilityTools(documentViewer.annotateTab,documentViewer.redactTab);
	var downloadDoc = $('.downloadDocument');
	if(display === true) {
		displayTool(downloadDoc, true);
		downloadDoc.attr("data-toggle","modal");
		downloadDoc.attr("data-target","#downloadModal");
	} else {
		displayTool(downloadDoc, false);
		downloadDoc.removeAttr( "data-toggle" );
		downloadDoc.removeAttr( "data-target" );
	}
//		checkRedactedFile();
}

function displayReviewTabs(isReviewable)
{
	var displayMode = (isReviewable) ? 'block' : 'none';
	var tab;
	var displayTab;
	reviewTools = $('.review-tab');
	for (var i=0; i<reviewTools.length; i++) {
		tab = reviewTools[i];
		displayTab = true;
		if(tab.id === 'redactTab' && documentViewer.redactTab === false)
		{
			displayTab = false;
		}
		
		if(tab.id === 'annotateTab' && documentViewer.annotateTab === false)
		{
			displayTab = false;
		}
		
		if(tab.id === 'searchTab' && documentViewer.searchTab === false)
		{
			displayTab = false;
		}
		
		if(displayTab)
		{
			$(reviewTools[i]).css('display', displayMode);
			
			if(tab.id === 'redactTab' && documentViewer.redactPattern === false)
			{
				$('.redact-pattern-container').css('display', 'none');
			}
			
		}
	}
}

function displayVisibilityTools(allowAnnotate,allowRedact)
{
	var redactTool = $('.selected-visibility-redaction').children('.visibility-holder-redaction');
	var annotateTool = $('.selected-visibility-annotation').children('.visibility-holder-annotation');
	displayTool(redactTool, allowRedact);
	displayTool(annotateTool, allowAnnotate);
}

function hideVisibilityTools(allowAnnotate,allowRedact)
{
	var redactTool = $('.selected-visibility-redaction').children('.visibility-holder-redaction');
	var annotateTool = $('.selected-visibility-annotation').children('.visibility-holder-annotation');
	if(allowRedact === false)
	{
		$(getElement('redactVisibility')).css('display','none');
		hideTool(redactTool);
	}
	if(allowAnnotate === false)
	{
		$(getElement('annotateVisibility')).css('display','none');
		hideTool(annotateTool);
	}
}

function displayVisibilityToolsForAvailableObjects()
{
	var objects = hasObjectsOnDocument();
	displayVisibilityTools(objects.hasAnnotations,objects.hasRedactions);
	hideVisibilityTools(objects.hasAnnotations,objects.hasRedactions);
}

function displayDocCompletedTools()
{
	if(logFileStatus === "Completed") {
		if(documentViewer.disablePrintButton === undefined)
		{
			displayTool($('.printDocument'), true);			
		}

		displayTool($('.saveDocSettings'), true);
	} else {
		displayTool($('.printDocument'), false);
		displayTool($('.saveDocSettings'), false);
	}
}

function hideDocCompletedTools(annotateTab,redactTab)
{
	$('.printDocument').hide();
	$('.saveDocSettings').hide();
}

function displayTool(tool, display)
{
	if(display === true) {
		tool.addClass('enable-tool');
		tool.removeClass('disable-tool');
	} else {
		tool.addClass('disable-tool');
		tool.removeClass('enable-tool');
	}
}

function hideTool(tool)
{
	tool.hide();
}

//pass page markups attribute
function reloadAnnotationLayers(pageMarkups,parentGroup){
	var pageMarkupLen = pageMarkups.length;
	if (pageMarkupLen > 0){
		for (var ctr = 0; ctr < pageMarkupLen; ctr++) {
			var layerIdx = pageMarkups[ctr].attributes.layerIndex;
			var markupObjShapeGrp = pageMarkups[ctr].shapes.group;
			var refNode = $(markupObjShapeGrp.parentNode.childNodes).get(layerIdx);
			
			if(refNode && refNode !== markupObjShapeGrp){
				if(layerIdx == 0){
					parentGroup.insertBefore(markupObjShapeGrp,parentGroup.firstChild);	
				} else if (layerIdx == pageMarkupLen-1){
					parentGroup.appendChild(markupObjShapeGrp);
				} else if (layerIdx > ctr) {
					if (refNode.nextSibling!==null)
						parentGroup.insertBefore(markupObjShapeGrp,refNode.nextSibling);
					else
						parentGroup.appendChild(markupObjShapeGrp);
				} else if (layerIdx < ctr){
					parentGroup.insertBefore(markupObjShapeGrp,refNode);
				}
			}
		}
	}
}

function checkNavigation(){
	var pageCount = parseInt($('.pages').text()),
		currentPage = parseInt($('.current-page').val()),
		FPimgs = $("#firstPage > i,#prevPage > i"),
		FPBtn = $("#firstPage, #prevPage"),
		LNimgs = $("#lastPage > i, #nextPage > i"),
		LNBtn = $("#lastPage, #nextPage");
	
	//For First and Prev Button
	if(currentPage <= 1){
		FPimgs.css({
			'opacity':'0.5'
		});
		FPBtn.css({
			'cursor':'default'
		}).data("enable",false);
	}else{
		FPimgs.css({
			'opacity':'1'
		});
		FPBtn.css({
			'cursor':'pointer'
		}).data("enable",true);
	}
	
	//For Last and Next Button
	if(currentPage >= pageCount){
		LNimgs.css({
			'opacity':'0.5'
		});
		LNBtn.css({
			'cursor':'default'
		}).data("enable",false);
	}else{
		LNimgs.css({
			'opacity':'1'
		});
		LNBtn.css({
			'cursor':'pointer'
		}).data("enable",true);
	}
}
