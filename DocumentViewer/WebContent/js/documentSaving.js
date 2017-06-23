/**
 * JS file handling saving of UDV objects (annotation/redaction/collaboration)
 * Including saving of rotations for the document
 */
var saveDoc = $('.saveDocSettings');

saveDoc.on('click', function() {
	if(!documentViewer.isRestrictAnnFn){
		saveWithCallback();
	}
}); 

/**
 * Saves all markupObjects and rotations on current document to markupPath.
 * @param isCallback - determines whether to execute custom callback defined by client application
 */
function save(isCallback)
{
	clearGroupDrag();
	isSaved = true;
	if (saveDoc.hasClass('disable-tool'))
		return;
	transferTextAreaValuetoDiv(lastSelectedDivReason);
	saveDocumentSettings(isCallback);
	
	showAlert('Saving document modification(s).', "accept");
	
//	if(documentViewer.redactTab == false){
//		showAlert('Annotations/Rotations are saved.', "accept");
//	}else{
//		showAlert('Annotations, redactions and rotations are saved.', "accept");
//	}
	
	
	setTimeout(function(){
		var DVNotif = $('#DV-Notif');
		DVNotif.animate({
			'top':'-85px',
			'opacity':0
		},600);
	},3000);
	//Burning of annotation using RSVG
	var documentContents = getEditedElements();
	burnAnnotation(documentContents);
	burnRedactionAnnotation(documentContents);
}

function saveNoCallback()
{
	save(false);
}

function saveWithCallback()
{
	save(true);
}

function saveDocumentSettings(isCallback) {
	var saveDoc = getStoredMarkup();
	sendXMLToServer(saveDoc.markup,saveDoc.hasRedactions,isCallback);
}

/**
 * Parses saved rotations and UDV objects
 * And returns as an XML string for persisting
 * To backend
 * @returns {___anonymous3464_3549}
 */
function getStoredMarkup()
{
	var collectionLength = pageCollection.length;
	var hasRedactions = false;
	var hasRotation = false;
	var p = '<documentAnnotations><pages>';
	for ( var i = 0; i < collectionLength; i++) {
		var pageForParsing = pageCollection[i];
		if(!hasRedactions)
			hasRedactions = pageForParsing.hasRedactions();
		
		if(!hasRotation)
			hasRotation = pageForParsing.isRotationAdjusted();
		
		if(pageForParsing.hasDrawnObject() || pageForParsing.isRotationAdjusted())
		{
			p += parseXML('page', pageForParsing.attributes);
			var markupLength = pageForParsing.markups.length;
			var markupCollectionForPage = pageForParsing.markups;
			if(pageForParsing.hasDrawnObject())
			{
				for ( var ii = 0; ii < markupLength; ii++) {
					markupCollectionForPage[ii].attributes.layerIndex = $(markupCollectionForPage[ii].shapes.group).index();
				}
				for ( var jj = 0; jj < markupLength; jj++) {
					var layeredMarkObjectInPage = pageForParsing.retrieveLayeredMarkObjectInPage(markupCollectionForPage[jj].attributes.layerIndex);
					p += parseXML('annotation', layeredMarkObjectInPage);
					if(layeredMarkObjectInPage.attributes.type === markupTypes.Text || layeredMarkObjectInPage.attributes.type === markupTypes.StickyNote)
					{
						var textCollection = layeredMarkObjectInPage.attributes.text;
						var lenText = textCollection.length;

						for(var eachLine = 0 ; eachLine<lenText ; eachLine++)
						p += '<text>'+escapeHtml(textCollection[eachLine])+'</text>';
					}
					if (layeredMarkObjectInPage.attributes.type === markupTypes.TextHighLight || layeredMarkObjectInPage.attributes.type === markupTypes.TextRedactHighlight 
							|| layeredMarkObjectInPage.attributes.type === markupTypes.StrikeThrough || layeredMarkObjectInPage.attributes.type === markupTypes.CollabHighlight){
						var drawnObjCollection = layeredMarkObjectInPage.drawnObjectCollection;
						var boxLen = drawnObjCollection.length;
						for (var k=0;k<boxLen;k++){
							p += '<hlbox '+ getHlObjectsXML(drawnObjCollection[k].attributes, layeredMarkObjectInPage.attributes.type) +'></hlbox>';
						} 
					}
					
					if(layeredMarkObjectInPage.attributes.comment != null)
					{
						var commentCollection = layeredMarkObjectInPage.attributes.comment;
						var lenComment = commentCollection.length;

						for(var kk = 0 ; kk<lenComment ; kk++)
						p += '<comment>'+escapeHtml(commentCollection[kk])+'</comment>';
					}
					
					p += '</annotation>';
				}
			}
			p += '</page>';
		}
	}
	p += '</pages></documentAnnotations>';
	recalculateMarkups(p);
	
	var retValue = {
			markup : p,
			hasRedactions : hasRedactions,
			hasRotation : hasRotation
	};
	return retValue;
}

function getHlObjectsXML(markupAttr, type){
	var annotationObject = '';
	//create string containing property for every attribute
	for ( var F in markupAttr) {
		if (markupAttr.hasOwnProperty(F)) {
			var value = markupAttr[F];
			if (F == 'comment'){
				value = escapeHtml(value);
			}
			annotationObject += ' ' + F + '="' + value + '"';
		}
		if(type == markupTypes.RectangleRedaction && F === 'text')
		{
			annotationObject += ' ' + F + '="' + markupAttr[F][0] + '"';
		}
		
	}
	return annotationObject;
}

/**
 * Retrieves string representation of ALL markup objects currently in the viewer
 * 
 */
function getMarkup()
{
	return getStoredMarkup().markup;
}

function parseXML(tag, markup) {
	var annotationObject = '<' + tag;
	var markupForProcessing = markup;
	var matrixValue = {};
	var temp = {};

	if (tag == 'annotation') {
		matrixValue = markup.shapes.retrieveOriginCoordinates();
		markupForProcessing = markup.attributes;
	}
	else if(tag === 'page')
	{
		if(documentViewer.excludeRotation === true)
		{
			temp.rotateDegrees = parseInt(markupForProcessing.rotateDegrees);
			temp.rotateX = parseInt(markupForProcessing.rotateX);
			temp.rotateY = parseInt(markupForProcessing.rotateY);
			markupForProcessing.rotateDegrees=0;
			markupForProcessing.rotateX=markupForProcessing.pageHeight/2;
			markupForProcessing.rotateY=markupForProcessing.pageHeight/2;
		}
	}

	for ( var F in markupForProcessing) {
		if (markupForProcessing.hasOwnProperty(F)) {
			if(markupForProcessing.type == markupTypes.RectangleRedaction && F === 'text')
			{
				annotationObject += ' ' + F + '="' + markupForProcessing[F][0] + '"';
			}
			else
			{
				//TODO: Exclude other attributes from TextHighlights being written
					if(F != 'text' || (F!= 'pageHeight' || F!= 'pageWidth'))
					{
						var value = markupForProcessing[F];
						if(markupForProcessing.type === markupTypes.Line || markupForProcessing.type === markupTypes.Arrow )
						{
							if(F === 'x1' || F === 'x2' || F === 'y1' || F === 'y2')
							{
								value = parseFloat(value);
								switch(F)
								{
									case 'x1' :
									case 'x2' :
										value += parseFloat(matrixValue.x);
										break;
									case 'y1' :
									case 'y2' :
										value += parseFloat(matrixValue.y);
										break;
								}
							}

						}
						else if(markupForProcessing.type === markupTypes.Circle)
						{
							if(F === 'cx' || F === 'cy')
							{
								value = parseFloat(value);
								switch(F)
								{
									case 'cx' :
										value += parseFloat(matrixValue.x);
										break;
									case 'cy' :
										value += parseFloat(matrixValue.y);
										break;
								}
							}
						}
						else if(markupForProcessing.type != markupTypes.Circle)
						{
							if(F === 'x' || F === 'y')
							{
								value = parseFloat(value);
								switch(F)
								{
									case 'x' :
										value += parseFloat(matrixValue.x);
										break;
									case 'y' :
										value += parseFloat(matrixValue.y);
										break;
								}
							}

						}
						if (F == 'text'){
							value = escapeHtml(value);
						}
						if (F == 'comment'){
							value = escapeHtml(value);
						}
						annotationObject += ' ' + F + '="' + value + '"';
					}

			}
		}
	}
	
	annotationObject += '>';
	
	if(documentViewer.excludeRotation === true)
	{
		markupForProcessing.rotateDegrees=temp.rotateDegrees;
		markupForProcessing.rotateX=temp.rotateX;
		markupForProcessing.rotateY=temp.rotateY;
	}
	return annotationObject;
}

function sendXMLToServer(markup,isBurn,isCallback) {
	var httpRequest = new XMLHttpRequest();
	if(isCallback && documentViewer.saveCallback)
		documentViewer.saveCallback(markup);
	httpRequest.open('POST', documentViewer.domain+'/DocViewerWS/rest/convert/save?path='+documentViewer.markupPath, true);
	httpRequest.setRequestHeader("Content-Type",
			"application/x-www-form-urlencoded");
	httpRequest.onreadystatechange = function() {
		if (isBurn && httpRequest.readyState == 4 && httpRequest.status == 200) {
			burnRedactedFile();
			return;
		}
		else
		{
			if(documentViewer.postRedactGeneration)
				documentViewer.postRedactGeneration(documentViewer.documentAbsPath,false);
		}
		if (httpRequest.readyState !== 4) {
			return;
		}
		if (httpRequest.status !== 200 && httpRequest.status !== 304) {
			return;
		}
	};
	httpRequest.send(markup);
}

function burnRedactedFile()
{
	var httpRequest = new XMLHttpRequest();
	httpRequest.open('POST', documentViewer.domain+'/DocViewerWS/rest/convert/burnredactedfile?nativeFilePath='+documentViewer.documentAbsPath+'&markupPath='+documentViewer.markupPath, true);
	httpRequest.setRequestHeader("Content-Type",
			"application/x-www-form-urlencoded");
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState !== 4) {
			return;
		}
		checkRedactedFilePostBurn(1);

		if (httpRequest.status !== 200 && httpRequest.status !== 304) {
			return;
		}
	};
	httpRequest.send();
}

var processingAnnotation;
function burnAnnotation(document){
	
	var json = processAnnotations(document);
	for (var i = 0; i < pageCollection.length; i++){
		if (pageCollection[i].hasAnnotations()){
			json.isAnnotated = true;
			break;
		} else {
			json.isAnnotated = false;
		}
	}
	processingAnnotation = true;
	
	var burnAnnotationOnSuccess = function(response)
	{
		processingAnnotation = false;
		hasAnnotationFile();
	};
	
	var request = 
	{
		type : 'POST',
		url :  "processAnnotatedPDF",
		onSuccess : burnAnnotationOnSuccess,
		data : JSON.stringify(json),
		mimeType : "application/json"
	};
	createDocumentServiceRequest(request);
}

var processingRedactionAnnotation;
function burnRedactionAnnotation(document){
	var json = processRedactionAnnotation(document);
	
	processingRedactionAnnotation = true;
	
	var burnSuccess = function(response)
	{
		processingRedactionAnnotation = false;
		hasRedactionAnnotationFile();
	};
	
	var request = 
	{
		type : 'POST',
		url :  "processRedactedAnnotatedPDF",
		onSuccess : burnSuccess,
		data : JSON.stringify(json),
		mimeType : "application/json"
	};
	createDocumentServiceRequest(request);
}

//Process annotation data for post
function processAnnotations(documentContents) {
//	var documentContents = getEditedElements("annotation");
	
	var json = {"path": documentViewer.documentAbsPath,
				"markup": documentViewer.markupPath,
				"docPages": documentContents.pagesAnnotation,
				"isAnnotated": documentContents.isEdited};
	
	return json;
}

function processRedactionAnnotation(documentContents){
//	var documentContents = getEditedElements(null);
	
	var json = {"path": documentViewer.documentAbsPath,
				"markup": documentViewer.markupPath,
				"docPages": documentContents.pagesAll,
				"isEdited": documentContents.isEdited};
	
	return json;
}

function getEditedElements(){
	var isEdited = false;
	var pagesAnnotation = [], pagesAll = [];
	var localCollection = pageCollection;
	var totalPages = pageCollection.length;
	for(var key=0;key<totalPages;key++){
		var value = localCollection[key];
		var markupGroup = value.svgMarkupGroup;
		var elementsAll = [], elementsAnnotation = [];
		if (markupGroup != null){
			var markupChildren = markupGroup.childNodes,
			length = markupChildren.length;
			for(var i = 0;i<length;i++){
				var y = markupChildren[i];
				var type = $(y).attr('data-isi');
				var firstChild = removeCircleArrowHead(y);

				isEdited = true;
				var elementOutput;
				if(y.firstChild.tagName === 'rect')
				{
					var markIdSelected = parseInt(type.substring(type.indexOf('-')+1,type.length));
					var markupInPage = value.retrieveMarkObjectInPage(markIdSelected);
					if (markupInPage == null || markupInPage == undefined){
						continue;
					}
					isWithin = true;
					var tempMarkupGrp = isEdge ? $('.currentView')[0].firstChild.firstChild.childNodes[2] : markupGroup;
					switch (markupInPage.attributes.type){
					case markupTypes.StickyNote:
					case markupTypes.Text:
					case markupTypes.RectangleRedaction:
						var markupObject = createMarkupObject(markupInPage,key+1,true);
						console.log(markupObject);
						elementOutput = getIEEquivalentHTML(markupObject,tempMarkupGrp,value.attributes.rotateDegrees);
						break;
					case markupTypes.TextRedactHighlight:
						var markupArray = createTempRedactionObject(markupInPage,key+1,true);
						elementOutput = '';
						for(var k = 0; k<markupArray.length; k++)
							elementOutput = getIEEquivalentHTML(markupArray[k],tempMarkupGrp,value.attributes.rotateDegrees);
						break;
					case markupTypes.Rectangle:
					case markupTypes.TextHighLight:
						elementOutput = getOuterHTML(y);
						break;
					case markupTypes.StrikeThrough:
					case markupTypes.CollabHighlight:
						continue;
					}
					isWithin = false;
				}
				else
				{
					elementOutput = getOuterHTML(y);
				}
				
				if (type.match("^" + "annotation")){ //add type to be burned. eg. "annotation"
					elementsAnnotation.push(elementOutput);
				}
				elementsAll.push(elementOutput);
				
				if (firstChild != undefined){
					y.insertBefore(firstChild, y.firstChild);
					var marker = $(y).children()[1];
					marker.removeAttribute("style");
				}
			}
			pagesAnnotation.push({"pageIndex": key, "elements": elementsAnnotation});
			pagesAll.push({"pageIndex": key, "elements": elementsAll});
		}
	}
	
	var documentContents = {isEdited: isEdited, pagesAnnotation: pagesAnnotation, pagesAll: pagesAll};
	return documentContents;
}

function getIEEquivalentHTML(markupObject,markupGroup,rotateDegrees)
{
	isWithin = true;
	var shapes = markupObject.shapes,
	gGroup = shapes.group,
	rect = shapes.SVGRectangle,
	gWrap = shapes.SVGGWrapper,
	out = "";
	isWithin = false;
	appendObjectToDom(markupGroup,gGroup);
	console.log(markupGroup);
	markupObject.rotateTextObject(rotateDegrees,true,true);
	var color = rect.getAttributeNS(null,'fill');
	color = 'rgb'+color.substring(4,color.lastIndexOf(','))+')';
	rect.setAttributeNS(null,'fill',color);
	//showTextArea(shapes.SVGRectangle);
//	var trans = gWrap.transform.animVal, //disabled due to existing transform applied in rotateFunc
//	degMat = trans[0].matrix,
//	scaleMat = trans[1].matrix,
//	newMat = 'matrix('+degMat.a+','+degMat.b+','+degMat.c+','+degMat.d+','+scaleMat.e+','+scaleMat.f+')';
//	gWrap.setAttributeNS(null,'transform',newMat);

	if(markupObject.markupType === markupTypes.RectangleRedaction || markupObject.markupType === markupTypes.TextRedactHighlight)
	{
		color = shapes.SVGText.getAttributeNS(null,'style').substring(5);
		//fix for older version GC
//		color = 'rgb'+color.substring(4,color.lastIndexOf(','))+',255)';
		color = 'rgb'+color.substring(4,color.lastIndexOf(','))+')';
		shapes.SVGText.setAttributeNS(null,'style','fill:'+color);
	}
	//showTextArea(shapes.SVGRectangle);
	var childrens = shapes.SVGText.childNodes;
	var lenChild = childrens.length;
	var style = shapes.SVGText.getAttributeNS(null,'style');
	if(isChrome || isSafari)
	{
		if(markupObject.attributes.fontFamily === 'Comic Sans MS')
		{
			style = style.replace("'Comic Sans MS'","Comic Sans MS");
		}
		else if(markupObject.attributes.fontFamily === 'Times New Roman')
		{
			style = style.replace("'Times New Roman'","Times New Roman");
		}
		shapes.SVGText.setAttributeNS(null,'style',style);
	}

	for(var x = 0 ; x<lenChild;x++){
		childrens[x].setAttributeNS(null,'style',style);
	}
	
	var clipPathID = gWrap.getAttributeNS(null,'clip-path');
	gWrap.setAttributeNS(null,'clip-path','');
//	var clipRect = shapes.clip; disabled due to clip disregarding styles applied on text
//	clipRect.removeChild(shapes.SVGClipRect);
//	gWrap.removeChild(shapes.SVGText);
//	clipRect.appendChild(shapes.SVGText);
//	gWrap.appendChild(shapes.SVGClipRect);
//	shapes.SVGClipRect.setAttributeNS(null,'clip-path',clipPathID);
	shapes.SVGText.setAttributeNS(null,'clip-path',clipPathID);
	console.log(markupObject);
	out = getOuterHTML(gGroup);
//	if (!isSafari && !(/Edge/.test(navigator.userAgent)))
//		out = gGroup.outerHTML;
//	else
//		out = new XMLSerializer().serializeToString(gGroup);
	markupGroup.removeChild(gGroup);
	return out;
}

function removeCircleArrowHead(element){
	if ($(element).children().length > 2 && $(element).has("marker[id^='arrowhead']").length>0){
		var firstChild = element.firstChild;
		element.removeChild(firstChild);
		var children = $(element).children();
		var marker = children[0];
		var line = children[1];
		var opacity = $(line).attr("style");
		$(marker).attr("style", opacity);
		return firstChild;
	} 
}

function getMatrixValue(markupSVG, index) {
	if (markupSVG && markupSVG.hasAttribute("transform")) {
		var matrixVal = markupSVG.getAttribute("transform");
		if (matrixVal && matrixVal.length > 0) {
			var matrixSlice = matrixVal.slice(7, -1);
			if (isIE) {
				var matrixArr = matrixSlice.split(" ");
				return parseFloat(matrixArr[index]);
			} else {
				var matrixArr = matrixSlice.split(",");
				return parseFloat(matrixArr[index]);
			}
		} else
			return 0;
	} else
		return 0;
}