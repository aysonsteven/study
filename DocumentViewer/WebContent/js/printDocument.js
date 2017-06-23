
var PreloaderModal = document.getElementById('PreloaderModal'),
	blockerContainer = document.getElementById('blocker'),
	currentGenNo = 0,
	cur_gen_no = document.getElementById('cur_generate_no'),
 	to_gen_no = document.getElementById('to_generate_no'),
 	preloaderBarFill = document.getElementById('preloaderBarFill'),
	preloaderLoadingValue,
	preLoaderHolder = 0;
	isFirstPrint = true;

function printDocument() {
	isPrintingCancelled = false;
	// reset loading bar to 0%
	preloaderBarFill.style.width = "0%";
	preLoaderHolder = 0;
	preloaderLoadingValue = 0;
	currentGenNo = 0;
	//get PrintingOptions
	printOptions = new PrintingOptions();
	generatePrintFrame();
}

function generatePrintFrame() {
	var exPrintFrame = document.getElementById('udvPrint');
	if (exPrintFrame) exPrintFrame.parentNode.removeChild(exPrintFrame);
	
	var printFrame = document.createElement('iframe');
	printFrame.id = 'udvPrint';
	//printFrame.className = 'udvPrint';
	printFrame.style.position = 'absolute';
	printFrame.style.bottom = printFrame.style.right = '0px';
	printFrame.style.width = printFrame.style.height = '1px';
	printFrame.style.zIndex = '0';
	printFrame.style.border = 'none';
	document.body.appendChild(printFrame);
	addPrintMediaStyle();
	isFirstPrint = false;
	
	var frameDoc;
	if (printFrame.contentDocument) {
		frameDoc = printFrame.contentDocument;
	} else if (printFrame.contentWindow) {
		frameDoc = printFrame.contentWindow.document;
	} else {
		frameDoc = printFrame.document;
	}
	
	var printHtml = documentViewer.printTemplateStr;
	printHtml = printHtml.replace(/udvPrintOrientation/g, printOptions.landscape ? 'landscape' : 'portrait');
	
	frameDoc.open();
	frameDoc.write(printHtml);
	frameDoc.close();

	var docTotalPgCount = $('.pages').text(),
		currentPgNo = $('.current-page').val(),
		udvPageLen = pageCollection.length;
	
	to_gen_no.innerHTML = printOptions.currentPage ? 1 : docTotalPgCount;
	preloaderLoadingValue = 100 / Number(to_gen_no.innerHTML);
	
	if (docTotalPgCount == udvPageLen) {
		if (printOptions.currentPage) {
			generatePrintPageContent(frameDoc, parseInt(currentPgNo)-1);
		} else if (printOptions.allPages) {
			generatePrintPageContent(frameDoc, 0);
		}
	}
}

function generatePrintPageContent(printFrameDoc, index) {
	//Show Preloader
	PreloaderModal.style.display = "block";
	
	currentGenNo++;
	cur_gen_no.innerHTML = currentGenNo;
	
	//Get the Width Value
	preLoaderHolder += preloaderLoadingValue;
	//Add Width to the Preloader Fill
	preloaderBarFill.style.width = preLoaderHolder + "%";
	
	var udvPage = pageCollection[index];
	var pageDiv = $(document.createElement('div'));
	pageDiv.attr('id', 'print_' + udvPage.attributes.id);
		
	if(isChrome || isFirefox || isOpera){
		pageDiv.addClass('page');
	}else if(isIE){
		pageDiv.addClass('pageIE');
	}else if(isSafari){
		pageDiv.addClass('pageSafari');
	}
	
	var printViewerContainer = $(printFrameDoc.getElementById('print-viewerContainer'));
	printViewerContainer.append(pageDiv);
	loadSvgPrintPage(pageDiv, udvPage, index, printFrameDoc);
}

function loadSvgPrintPage(printPage, pageToProcess, pgIndex, printFrame) {
	var svgWrapper = createSVGElement("svg");
	svgWrapper.setAttribute("id", "print_svgp_" + (pgIndex + 1));
	svgWrapper.setAttributeNS(xmlNamespace, "xmlns", svgNamespace);
	svgWrapper.setAttributeNS(xmlNamespace, "xmlns:xlink", "http://www.w3.org/1999/xlink");
	svgWrapper.setAttribute("version", "1.1");

	var gWrapper = createSVGElement("g");
	gWrapper.setAttribute("class", "print_gWrapper");
	gWrapper.setAttribute("transform", getTransformVal(pageToProcess,printPage));

	var markupGroupClone = null;
	if (pageToProcess.svgMarkupGroup) {
		markupGroupClone = generateMarkUpGrp(pageToProcess);
		if(markupGroupClone) markupGroupClone.setAttribute('data-isi', "print_" + markupGroupClone.getAttribute('data-isi'));
	}

	var iterate = function()
	{
		getSVGFileFromServerForPrintPage(gWrapper, markupGroupClone, pgIndex,printFrame);
	};
	
	executeTimeout(iterate,100);


	svgWrapper.appendChild(gWrapper);
	printPage.append($(svgWrapper));

}

function generateMarkUpGrp(pageToProcess) {
	var markupGrp = null;
	var annotationGrp = pageToProcess.svgMarkupGroup;
	
	if (printOptions.withRedaction | printOptions.withAnnotation) {
		markupGrp = annotationGrp.cloneNode(true);
		var markupGrpChild = $(markupGrp).children(),
			markupChild = null;
		
		for(var i=0; i<markupGrpChild.length; i++) {
			markupChild = markupGrpChild.eq(i);
			if(printOptions.withRedaction && (markupChild.attr('data-isi').indexOf('redaction') > -1)) {
				//updateOpacityVal(markupChild);
			} else if (printOptions.withAnnotation && (markupChild.attr('data-isi').indexOf('annotation') > -1)) {
				//updateOpacityVal(markupChild);
				if (markupChild.length > 0 && markupChild[0].firstChild.nodeName == "rect") {
					//current collab tools have rect as nodeName (strikethrough & highlight) 
					var y = markupChild;
					var type = $(y).attr('data-isi');
					var markIdSelected = parseInt(type.substring(type.indexOf('-')+1,type.length));
					var markupInPage = pageToProcess.retrieveMarkObjectInPage(markIdSelected);
					if (markupInPage == null || markupInPage == undefined){
						continue;
					}
					if (markupTypes.StrikeThrough == markupInPage.attributes.type || markupTypes.CollabHighlight == markupInPage.attributes.type){
						markupChild.remove();
					}
				}
			} else {
				markupChild.remove();
			}
		}
	}

	return markupGrp;
}

function getSVGFileFromServerForPrintPage(gWrapper, markupGroup, pageIndex,	udvPrintFrame) {
	
	var onSuccess  = function(req){
		var responseJSON = JSON.parse(req.responseText), 
		pageStatus = responseJSON.status;

		if(pageStatus === "Completed"){  
			getGzForPrint(responseJSON.content, gWrapper, markupGroup,pageIndex, udvPrintFrame);
		}else{
			if (pageStatus != "Queued") {
				var tempG = html5.createElement('g');
				tempG.innerHTML = responseJSON.content;
				gWrapper.appendChild(tempG.firstChild);
				if (markupGroup) {
					gWrapper.appendChild(markupGroup);
				}
			}
			
			if(printOptions.allPages && pageIndex < (pageCollection.length - 1)) {
				if(!isPrintingCancelled)
				generatePrintPageContent(udvPrintFrame, (pageIndex + 1));
			} else {
				// trigger window.print upon div printPage completion
				
				PreloaderModal.style.display="none";
				blockerContainer.style.display="none";
				executeTimeout(showPrintFormForBrowser, 1000);
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

/**
 * Show native print dialog from browser
 */
function showPrintFormForBrowser() {
	var udvPrintFrame = document.getElementById('udvPrint');
	if (isChrome || isSafari){
		udvPrintFrame.contentWindow.focus();
		udvPrintFrame.contentWindow.document.execCommand('print', false, null);
	}else if(isFirefox || isIE){
		udvPrintFrame.contentWindow.focus();
		udvPrintFrame.contentWindow.print();
	}
	if(documentViewer.printCallback)
		documentViewer.printCallback(printOptions.withAnnotation, printOptions.withRedaction);
	
}

/*function updateOpacityVal(markupChild) {
	markupChild.find('[data-opacity]').each(function() {
		var elem = $(this);
		elem.css('opacity', elem.attr('data-opacity'));
	});
}*/

function getTransformVal(udvPage, divPage) {
	var currentPageWidth = udvPage.rotatedDimensions().width,
		currentPageHeight = udvPage.rotatedDimensions().height,
		rDeg = udvPage.attributes.rotateDegrees,
		rX = udvPage.attributes.rotateX,
		rY = udvPage.attributes.rotateY,
		sf = sfW = sfH = 1;
	var isPageLandscape = currentPageWidth > currentPageHeight;
	rDeg = (rDeg===360) ? 0 : rDeg;
	
	switch(true) {
	default:
	case printOptions.autoOrientation:
		if (isSafari) {
			divPage.addClass('portraitSafari'); //letterSizePortrait: 6.9in by 8.9in || 662.4px by 854.4px
			if(isPageLandscape) { //letterSizeLandscape: 8.4in by 6.5in || 806.4px by 624px
				rDeg += 90;
				rX = setRotationAxis(rDeg, udvPage).rx;
				rY = setRotationAxis(rDeg, udvPage).ry;
				sfW = setPrintScaleFactor(currentPageWidth, 806.4);
				sfH = setPrintScaleFactor(currentPageHeight, 624);
			} else {
				sfW = setPrintScaleFactor(currentPageWidth, 662.4);
				sfH = setPrintScaleFactor(currentPageHeight, 854.4);
			}
		} else if (isIE) {
			divPage.addClass('portraitIE'); //letterSizePortrait: 7.3in by 9.5in || 700.8px by 912px
			if(isPageLandscape) { //letterSizeLandscape: 9.05in by 7in || 868.8px by 672px
				rDeg += 90;
				rX = setRotationAxis(rDeg, udvPage).rx;
				rY = setRotationAxis(rDeg, udvPage).ry;
				sfW = setPrintScaleFactor(currentPageWidth, 868.8);
				sfH = setPrintScaleFactor(currentPageHeight, 672);
			} else {
				sfW = setPrintScaleFactor(currentPageWidth, 700.8);
				sfH = setPrintScaleFactor(currentPageHeight, 912);
			}
		} else {
			divPage.addClass('portrait'); //letterSizePortrait: 8.5in by 11in || 816px by 1056px	
			if(isPageLandscape) { //letterSizeLandscape: 11in by 8.5in || 1056px by 816px
				rDeg += 90;
				rX = setRotationAxis(rDeg, udvPage).rx;
				rY = setRotationAxis(rDeg, udvPage).ry;
				sfW = setPrintScaleFactor(currentPageWidth, 1056);
				sfH = setPrintScaleFactor(currentPageHeight, 816);
			} else {
				sfW = setPrintScaleFactor(currentPageWidth, 816);
				sfH = setPrintScaleFactor(currentPageHeight, 1056);
			}
		}
		sf = sfH < sfW ? sfH : sfW;
		break;
		
	case printOptions.portrait:
		if (isSafari) {
			divPage.addClass('portraitSafari'); //letterSizePortrait: 6.9in by 8.9in || 662.4px by 854.4px
			sfW = setPrintScaleFactor(currentPageWidth, 662.4);
			sfH = setPrintScaleFactor(currentPageHeight, 854.4);
		} else if (isIE) {
			divPage.addClass('portraitIE'); //letterSizePortrait: 7.3in by 9.5in || 700.8px by 912px
			sfW = setPrintScaleFactor(currentPageWidth, 700.8);
			sfH = setPrintScaleFactor(currentPageHeight, 912);
		} else {
			divPage.addClass('portrait'); //letterSizePortrait: 8.5in by 11in || 816px by 1056px
			sfW = setPrintScaleFactor(currentPageWidth, 816);
			sfH = setPrintScaleFactor(currentPageHeight, 1056);
		}	
		sf = sfH < sfW ? sfH : sfW;
		break;
		
	case printOptions.landscape:
		if (isSafari) {
			divPage.addClass('landscapeSafari'); //letterSizeLandscape: 8.4in by 6.5in || 806.4px by 624px
			sfW = setPrintScaleFactor(currentPageWidth, 806.4);
			sfH = setPrintScaleFactor(currentPageHeight, 624);
		} else if (isIE) {
			divPage.addClass('landscapeIE'); //letterSizeLandscape: 9.05in by 7in || 868.8px by 672px
			sfW = setPrintScaleFactor(currentPageWidth, 868.8);
			sfH = setPrintScaleFactor(currentPageHeight, 672);
		} else {
			divPage.addClass('landscape'); //letterSizeLandscape: 11in by 8.5in || 1056px by 816px
			sfW = setPrintScaleFactor(currentPageWidth, 1056);
			sfH = setPrintScaleFactor(currentPageHeight, 816);
		}
		sf = sfH < sfW ? sfH : sfW; // get lower sf to Fit-to-Page
		break;
	}
	var trans = getTransformMatrixValue(sf, rDeg, rX, rY);
	return trans;
}

function setPrintScaleFactor(currentDimension, printDimension) {
	var printSF = 1;
	if (currentDimension > printDimension) {
		printSF = printDimension / currentDimension;
	}
	return printSF;
}

function setRotationAxis(deg,udvPage) {
	var rotationAxis = {};
	switch(deg) {
		case 0:
		case 90:
		case 360:
			rotationAxis.rx = rotationAxis.ry = udvPage.attributes.pageHeight / 2;
			break;
		case 180:
			rotationAxis.rx = udvPage.attributes.pageWidth / 2;
			rotationAxis.ry = udvPage.attributes.pageHeight / 2;
			break;
		case 270:
			rotationAxis.rx = rotationAxis.ry = udvPage.attributes.pageWidth / 2;
			break;
	}
	return rotationAxis;
}

function addPrintMediaStyle() {
	if (!isIE) return;
	if (!isFirstPrint) return;
	
	var parentWindow = window.parent.document;
	var parentActiveElem = parentWindow.activeElement;
	var parentWindowDoc = parentWindow.defaultView.document;
	var isParentUDV = parentWindowDoc.getElementById('udvPrint') ? true : false;
	
	if(!isParentUDV) {
		var udvContainerID = '[data-udvcontainer|="UDVContainer"]';
		if (parentActiveElem.id) {
			udvContainerID = '#' + parentActiveElem.id;
		} else {
			parentActiveElem.setAttribute('data-udvcontainer','UDVContainer');
		}
		var mediaPrintRule = udvContainerID+'{width: 100%;}';
		
		// Create the <style> tag
		var style = document.createElement("style");
		style.setAttribute('type', 'text/css');
		style.setAttribute("media", "print");
		if (style.sheet) { // IE
			style.sheet.cssText = mediaPrintRule;
		}
		
		// Add the <style> element to parent window
		parentWindow.head.appendChild(style);
	}
}


function getGzForPrint(gz_path, gWrapper, markupGroup, pageIndex, udvPrintFrame) {
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
			
			var tempG = html5.createElement('g');
			tempG.innerHTML =str;
			gWrapper.appendChild(tempG.firstChild);
			if (markupGroup) {
				gWrapper.appendChild(markupGroup);
			}
			
			if(printOptions.allPages && pageIndex < (pageCollection.length - 1)) {
				if(!isPrintingCancelled)
				generatePrintPageContent(udvPrintFrame, (pageIndex + 1));
			} else {
				// trigger window.print upon div printPage completion
				
				PreloaderModal.style.display="none";
				getElement('blocker').style.display="none";
				executeTimeout(showPrintFormForBrowser, 1000);
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
