/**
 * JS File responsible for loading SVG pages on UDV. This is where ajax requests
 * are sent to UDVGateway for retrievable of SVGs/GZs to be appended to the DOM
 * of the viewer. Viewer displays at the minimum only pages that are viewable based
 * on viewport. For instance, if a document has 10 pages and only 2 pages are viewable,
 * only 2 pages will be loaded onto viewer
 */

/**
 * Parent function for loading SVGs onto DOM. Creates necessary DOM structure
 * First before loading SVGs
 */
function loadSVG(childPage) {
	
	var hasError = false;
	if (!((logFileStatus == "ConvertingToSVG") || (logFileStatus == "Completed"))) {
		hasError = true;
	}
	
	var $this = childPage,
		index = $this.index(),
		pageNo = index + 1,
		pageToProcess = pageCollection[index];
	
	if(!$this.attr("id"))
		$this.attr("id",("udv_page_"+pageNo));
	
	//Create svg wrapper
	var svgWrapper = createSVGElement("svg");
	svgWrapper.setAttribute("id","svgp_"+pageNo);
	svgWrapper.setAttributeNS(xmlNamespace, "xmlns", svgNamespace);
	svgWrapper.setAttributeNS(xmlNamespace, "xmlns:xlink", "http://www.w3.org/1999/xlink");
	svgWrapper.setAttribute("version", "1.1");
	svgWrapper.setAttribute("class","svgWrapperClass");
	
	//Create g wrapper
	var gWrapper = createSVGElement("g");
	gWrapper.setAttribute("id","svgpWrap_"+pageNo);
	gWrapper.setAttribute("class", "gWrapper");
	
	//Create g for magnifying glass function
	var gMagnify = createSVGElement("g");
	gMagnify.setAttribute("id","magnify_"+pageNo);

	
	
	var annotationG = null;
	var highlightG = null;
	var groupDragG =  null; 
	if (!hasError) {
		if(!pageToProcess.svgMarkupGroup) 
		{
			annotationG = createSVGElement("g");
			annotationG.setAttribute("data-isi", "markups-"+pageNo);
			highlightG = createSVGElement("g");
			highlightG.setAttribute("data-isi", "highlights-"+pageNo);
			pageToProcess.svgMarkupGroup = annotationG;	
			pageToProcess.svgHighlightGroup = highlightG;
		} else {
			annotationG = pageToProcess.svgMarkupGroup;
			highlightG = pageToProcess.svgHighlightGroup;
		}
		
		if(!pageToProcess.svgHighlightGroup) 
		{
			highlightG = createSVGElement("g");
			highlightG.setAttribute("data-isi", "highlights-"+pageNo);
			pageToProcess.svgHighlightGroup = highlightG;
		} else {
			highlightG = pageToProcess.svgHighlightGroup;
		}
		
		if(!pageToProcess.groupDragGroup) 
		{
			groupDragG = createSVGElement("g");
			groupDragG.setAttribute("id", "groupDrag-"+ppageNo);
			pageToProcess.groupDragGroup = highlightG;
		} else {
			groupDragG = pageToProcess.groupDragGroup;
		}
	}
	
	//Set transform matrix value
	var attributes = pageToProcess.attributes,
	rotateDeg = attributes.rotateDegrees,
	rotateX = attributes.rotateX,
	rotateY = attributes.rotateY,
	matrixVal = getTransformMatrixValue(isFitContent ? getFitToWidthScaleFactor(attributes.pageWidth) : scaleFactor,rotateDeg, rotateX, rotateY);
	gWrapper.setAttribute("transform", matrixVal);	

	//Append native svg to g tag wrapper
	getSVGFileFromServer(pageToProcess,index,annotationG,highlightG,gWrapper,childPage,groupDragG);
	
	//Append g tag wrapper to svg wrapper
	svgWrapper.appendChild(gWrapper);

	//Append g magnify to svg wrapper
	svgWrapper.appendChild(gMagnify);
	
	//gWrapper.appendChild(groupDragG);
	$this.append($(svgWrapper));
	
	
	
	if(!hasError) {
		//Load svgWrapper to UDVPage.svgPage
		pageToProcess.svgPage = svgWrapper;
		if(isFitContent)
			newFit(pageToProcess,gWrapper,isFitContent,getElement('viewer-document-wrapper').offsetWidth-20);
	}
}

/**
 * Executes ajax request to retrieve SVG from file server. Also retrieves status of pages
 * Whether it will render placeholders or generated SVGs since there is a chance some pages
 * UDV was not able to convert to SVG from PDF or there were errors encountered during optimization
 * or compression
 */
function getSVGFileFromServer(pageForProcess,pageIndex,markupGroup,highlightGroup,gWrapper,divPageContent,groupDragGroup) {
	var onSuccess = function(req)
	{		
		var iterate = function()
		{
			getSVGFileFromServer(pageForProcess,pageIndex,markupGroup,highlightGroup,gWrapper,divPageContent,groupDragGroup);
		};		
		var responseJSON = JSON.parse(req.responseText),
		pageStatus = responseJSON.status,
		pageContent = $(divPageContent);
		
		if(pageStatus === "Queued"){
			pageForProcess.isErroredPage = true; //set to true to trigger no drawing of annotation/redaction
			if(isPageViewable(pageContent)) {
				setPageContentBackground(pageContent,pageStatus);
				setTimeout(iterate, 200); //continue to loop getSVGFileFromServer() method...
			} else {
				pageForProcess.isPageRequested = false;
			}
		
		} else {
			pageForProcess.isErroredPage = false;
			setPageContentBackground(pageContent,pageStatus);
			var tempG = html5.createElement('g'); //container is shived so we can add HTML5 elements using `innerHTML`
			
			if(pageStatus === "Completed"){  
				getGz(responseJSON.content, tempG, markupGroup,highlightGroup, gWrapper, pageForProcess, pageContent,groupDragGroup);
			}else if (isErroredPage(pageStatus)){
				pageForProcess.isErroredPage = true;
				setPageContentBackground(pageContent,pageStatus);
				tempG.innerHTML = responseJSON.content;
				gWrapper.appendChild(tempG.firstChild);	
				recalculateErroredPageAttr(pageForProcess,pageContent);
			}

			if(pageForProcess.textElements === undefined && pageForProcess.textCharacters === undefined)
			{
				var retrieveCharactersPerPage = function (textResult){
					var resJSON = JSON.parse(textResult.responseText);
					if (resJSON === undefined || resJSON === null || resJSON.length === 0){
						return;
					}
					pageForProcess.textElements = resJSON.textElements; 
					pageForProcess.textCharacters = resJSON.textCharacters; 
				};
				
				var request = 
				{
					type : 'GET',
					url :  documentViewer.domain+'/DocViewerWS/rest/document/getPageCharacterCoordinates?nativeFilePath=' + documentAbsPath + '&pgn=' + (pageIndex + 1),
					onSuccess : retrieveCharactersPerPage
				};
				
				createAJAXRequestNew(request);
			}
		}
	};
	
	var request = 
	{
		nativeFilePath : documentAbsPath,
		pageNumber : (pageIndex + 1),
		logFileStatus : logFileStatus,
		onSuccess : onSuccess
	};
	
	WSGetViewerFileStatus(request);
}

//Checking if status is considered an error
//Used to determine if placeholders will be rendered
function isErroredPage(status)
{
	var isError = false;
	switch(status)
	{
	case 'ErroredPage':
	case 'Unsupported':
	case 'Encrypted':
	case 'PasswordProtected':
	case 'Corrupted':
	case 'Timeout':
	case 'ConversionError':
		isError = true;
		break;
	default:
		isError = false;
		break;
	}
	return isError;
}

/**
 * Displays loading animation when SVG is prepared.
 * @param pgContent
 * @param pgStatus
 */
function setPageContentBackground(pgContent,pgStatus) {
	if(pgStatus === "Queued") {
		pgContent.css("background-image","url(\"images/loader.gif\")");
		pgContent.css("background-repeat","no-repeat");
		pgContent.css("background-attachment","relative");
		pgContent.css("background-position","center");
	} else {
		pgContent.css("background-image","none");
	}
}

/**
 * Determines whether page given is viewable. Uses computation based on current scroll bar position
 * Against position of given page.
 * @param childPage
 * @returns {Boolean}
 */
function isPageViewable(childPage) {
	var $this = childPage,
	currentChildTop = $this.position().top,
	currentChildBottom = $this.position().top + $this.outerHeight(true),
	viewPortTop = $(getElement('viewerContainer')).position().top,
	viewPortHeight = $(getElement('viewerContainer')).outerHeight(true);

	if ($this.hasClass("currentView")) {
		return true; 
	} else if (currentChildBottom > viewPortTop && currentChildTop < (viewPortHeight + viewPortTop)) {
		return true;
	} else {
		return false;
	}
}

function hasChildren(childPage) {
	var $this = childPage;
	if ($this.children().length > 0) {
		return true;
	} else {
		return false;
	}
}

/**
 * Removes SVG from page
 * @param childPage
 */
function removeSVG(childPage) {
	var $this = childPage;
	// Set UDVPage.svgPage to null before removing svgWrapper
	pageCollection[$this.index()].svgPage = null;
	$this.children().remove();
}

function hasNativeSVG(childPage) {
	var $this = childPage;
	if ($this.children().length > 0) {
		var $nativeSVG = $this.find(".gWrapper").find("svg");
		if  ($nativeSVG.prop("tagName") == 'svg') {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

/**
 * Updates dimension of pages if it is an errored page. This is needed
 * Due to placeholder having specific dimensions deviating from the 
 * Document/file being attempted to be viewed
 * @param udvPage
 * @param pgContent
 */
function recalculateErroredPageAttr(udvPage, pgContent) {
	var rotateX, rotateY,
	rotateDeg = udvPage.attributes.rotateDegrees;
	switch(rotateDeg) {
	case 180:
		rotateX = erroredPage.width / 2;
		rotateY = erroredPage.height / 2;
		break;
	case 270:
		rotateX = erroredPage.width / 2;
		rotateY = rotateX;
		break;
	case 0:
	case 90:
	case 360:
	default:
		rotateX = erroredPage.height / 2;
		rotateY = rotateX;
		break;
	}
	udvPage.attributes.rotateX = rotateX;
	udvPage.attributes.rotateY = rotateY;
	udvPage.attributes.pageWidth = erroredPage.width;
	udvPage.attributes.pageHeight = erroredPage.height;
	
	newPageW = erroredPage.width * scaleFactor;
	newPageH = erroredPage.height * scaleFactor;
	
	if(rotateDeg == 90 || rotateDeg == 270) {
		pgContent.css("height", newPageW);
		pgContent.css("width", newPageH);						
	} else {
		pgContent.css("height", newPageH);
		pgContent.css("width", newPageW);
	}
}

function displayViewableSvg(divPage) {
	if (isPageViewable(divPage)) {
		var udvPage = pageCollection[divPage.index()];
		// if viewable and no appended svgWrapper element, load svg file of page
		if (!hasChildren(divPage)) {
			loadSVG(divPage);
			udvPage.isPageRequested = true;
		} 
		// if viewable and no appended native svg element, load svg file of page
		else if (!hasNativeSVG(divPage)) {
			if (!udvPage.isPageRequested) {
				removeSVG(divPage);
				loadSVG(divPage);
				udvPage.isPageRequested = true;
			}
		}
		return true;
	} else {
		// remove svg if page is not anymore viewable
		if (hasChildren(divPage)) {
			removeSVG(divPage);
		}
		return false;
	}
}

/**
 * Ajax request to retrieve GZ file from file system
 * @param gz_path
 * @param tempG
 * @param markupGroup
 * @param highlightGroup
 * @param gWrapper
 * @param pageForProcess
 * @param pageContent
 */
function getGz(gz_path, tempG, markupGroup, highlightGroup, gWrapper,
		pageForProcess, pageContent, groupDragGroup) {
	var str = "";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", documentViewer.domain+"/DocViewerWS/rest/document/getGZippedContent?gzPath="+ gz_path);
	xhr.responseType = "arraybuffer";

	xhr.onload = function(e) {
		if (this.status == 200) {
			var arraybuffer = new Uint8Array(this.response);
			var gunzip = new Zlib.Gunzip(arraybuffer);
			var plain = gunzip.decompress();

			str = Uint8ToString(plain);
			tempG.innerHTML = str;
			gWrapper.appendChild(tempG.firstChild);
			if (markupGroup) {
				if (highlightGroup)
					gWrapper.appendChild(highlightGroup);
					gWrapper.appendChild(markupGroup);
					gWrapper.appendChild(groupDragGroup);
					pageForProcess.initializeHighlights();
					pageContent.append($(pageForProcess.divHandles)); 
					reCalculateHandles(pageForProcess);
					pageForProcess
						.rotateTextMarkups(pageForProcess.attributes.rotateDegrees);
			}
		}
	};

	xhr.send();

}

function Uint8ToString(u8a){
	  var CHUNK_SZ = 0x8000;
	  var c = [];
	  for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
	    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
	  }
	  return c.join("");
}


