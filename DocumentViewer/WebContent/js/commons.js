/**
 * commons.js
 * Responsible for utility functions used for processes
 * Within UDV.
 * This JS file is being utilized by many other UDV js files.
 */
//Functions used for on hover action of redactions <<< START
var hoverOption = function(){
	var $this = $(this);
	$this.addClass('hoveredSelect')
	},
outOption = function(){
	var $this = $(this);
	$this.removeClass('hoveredSelect')
},
//When selected, redaction must not be transparent
selectRedactionReason = function(){
	var $this = $(this),
	selectedReason = $this.text(); 
	$this.parent().siblings('.selected-reason').children('span').text(selectedReason);
	var selectedObject = getSingleSelectedMarkupObject(0);
	var body,width=0,svgText;
	if(selectedObject)
	{
		if (selectedObject.markupType == markupTypes.TextRedactHighlight){
			var selObj = selectedObject.drawnObjectCollection;
			var selObjLen = selObj.length;
			for (var i = 0; i<selObjLen; i++){
				selObj[i].setText(selectedReason);
				if(isIE)
				{
					width = selObj[i].shapes.SVGRectangle.getAttribute("width");
					svgText = selObj[i].shapes.SVGText;
					clearChildren(svgText);
					processWrapping(svgText,selectedReason,redactionFontSize,width,selObj[i].id,(width/2));
					selObj[i].shapes.redactionText.data = selectedReason;
				}
				else
				{
					selObj[i].shapes.divText.innerHTML = selectedReason;
				}
			}
		} else {
			selectedObject.setText(selectedReason);
			if(isIE)
			{
				width = selectedObject.shapes.SVGRectangle.getAttribute("width");
				svgText = selectedObject.shapes.SVGText;
				clearChildren(svgText);
				processWrapping(svgText,selectedReason,redactionFontSize,width,selectedObject.id,(width/2));
				selectedObject.shapes.redactionText.data = selectedReason;
			}
			else
			{
				selectedObject.shapes.divText.innerHTML = selectedReason;
			}	
		}
	}
	documentViewer.annotationToolBox[markupTypes.RectangleRedaction].reason = selectedReason;
};
//Functions used for on hover action of redactions <<< END


selectTagSet = function(){
	var $this = $(this),
	selectedTagSet = $this.text(); 
	selectedTagSetIndex = $this.attr("data-tagset-index");
	$this.parent().siblings('.selected-tagSet').children('span').text(selectedTagSet);
	populateTag(selectedTagSetIndex);

};

selectTag = function(){
	var $this = $(this),
	selectedTag = $this.text(); 
	$this.parent().siblings('.selected-tag').children('span').text(selectedTag);

};

function populateTag(tagSetIndex)
{
	var stampData = JSON.parse(documentViewer.stampData);
	var tagListArr = stampData.tagSets[tagSetIndex].tags;
	var tagListLen = tagListArr.length;
	var tagList = [];
	
	var tags= $('.tag-radio-container');
	tags.html("");
	
	for(var i = 0; i < tagListLen; i++){
		tagList[i] = tagListArr[i];
	}
	
	if(tagList){
		var radioHtml = '';
		for( var i = 0; i < tagList.length; i++){
			if(i===0){
				radioHtml += '<input type="radio" name="tagName" value="'+tagList[i]+'" checked />'+tagList[i]+'<br>';
			}else{
				radioHtml += '<input type="radio" name="tagName" value="'+tagList[i]+'" />'+tagList[i]+'<br>';
			}
		}
	    tags.html(radioHtml);
	}
}

function addTag(tagName) {
	var radioHtml = '<input type="radio" name="tagName" value="tagname">tagname<br>';
	var tags = $('.tag-available-container');
	var radioFragment = document.createElement('div');
	radioFragment.innerHTML = radioHtml;

	tags.append(radioFragment.firstChild);
}

//Utility function used to create any element based on the given namespace, mainly used for creating SVG elements. EX: g,svg
function createSVGElement(elementType)
{
	return document.createElementNS(svgNamespace, elementType);
}

//Populates all attributes of nodeAttribute into given objectForPopulation. Handy when copying attributes instead of clone
//Only compatible for node type objects. Example: <g>, <svg>, <div>, etc...
function populateAttributes(objectForPopulation, nodeAttribute) {
	for (var F in nodeAttribute) {
		if (nodeAttribute.hasOwnProperty(F)) {
			objectForPopulation.setAttribute(F, nodeAttribute[F].toString());
		}
	}
}

//Used to convert HTML x and y coordinate into SVG coordinate space. Essentially converting mouse coordinate from document into SVG coordinates
//Mainly used for drawing functions
function convertToSVGCoordinateSpace(svgPage,x,y)
{
	var svgPointForConversion = svgPage.createSVGPoint();
	svgPointForConversion.x = x;
	svgPointForConversion.y = y;
	var transformed = svgPointForConversion.matrixTransform(svgPage.getScreenCTM().inverse());
	return transformed;
}

//Retrieves pageNumber where an object is residing. Example: There is a redaction on page 10, given DOM structure
//Crawl up the DOM using redaction as reference to get id value of parent div
//Then parse id (udv_page_#) to extract pageNumber
function retrievePageNumber(object)
{
	var seekParent = object.parentNode,pageNumber=-1,pageId;
	while((seekParent && seekParent.id && seekParent.id.indexOf(pagePrefix)==-1) || (seekParent && !seekParent.id))
	{
		seekParent = seekParent.parentNode;
	}
	if(seekParent && seekParent.id)
	{
		pageId = seekParent.id;
		pageNumber = pageId.substring(pageId.indexOf('_page_')+6,pageId.length);
	}
	return pageNumber;
}

//Creates standard body object
//Used for creating redactions when in Google Chrome, Firefox, 
function createBodyObject()
{
	var bodyObject = document.createElementNS('http://www.w3.org/1999/xhtml','body');
	populateAttributes(bodyObject,
			{
		xmlns : 'http://www.w3.org/1999/xhtml',
		style : 'display:table; width: 100%;table-layout: fixed;margin:0'
			});
	return bodyObject;
}

//Removes resize handles on
//Selected annotation object
//Used to clear any handles left on markupHandle object
function clearMarkupHandle(markupHandle)
{
	var domHandle = markupHandle.parentHandle;
	var parent = domHandle.parentNode;

	clearChildren(domHandle);
	parent.removeChild(domHandle);
}

//Vanilla javascript removal of all children
function clearChildren(elementForClearing)
{
	if(elementForClearing)
	{
		while (elementForClearing.firstChild) {
			elementForClearing.removeChild(elementForClearing.firstChild);
		}
	}
}

//Retrieves annotation/redaction draw button object based off given
//markupObjectType. See markupTypes under constants.js
function currentlySelectedAnnotation(selectedObj){
	switch (selectedObj){
	case markupTypes.Line:
		return document.getElementById("addLine");
		break;
	case markupTypes.Circle:
		return document.getElementById("addCircle");
		break;
	case markupTypes.Rectangle:
		return document.getElementById("addSquare");
		break;
	case markupTypes.Arrow:
		return document.getElementById("addArrow");
		break;
	case markupTypes.RectangleRedaction:
		return document.getElementById("addRedact");
		break;
	case markupTypes.Text:
		return document.getElementById("stickyNoteBtn");
		break;
	case markupTypes.StickyNote:
		return document.getElementById("addText");
		break;
	case markupTypes.TextHighLight:
		return document.getElementById("highLightBtn");  
		break;
	case markupTypes.TextRedactHighlight:
		return document.getElementById("highLightRedactBtn"); 
		break;
	case markupTypes.StrikeThrough:
		return document.getElementById("collabStrikeOutBtn");
		break;
	case markupTypes.CollabHighlight:
		return document.getElementById("collabHighlightBtn");
		break;
	}
}

function selectAnnotationObjectNavigate(UDV_id, pageNumber)
{
	var addRedact = $(getElement('addRedact')),
	addArrow = $(getElement('addArrow')),
	addLine = $(getElement('addLine')),
	addSquare = $(getElement('addSquare')),
	addCircle = $(getElement('addCircle')),
	addText = $(getElement('addText')),
	addTextHighlight = $(getElement('highLightBtn')),
	addTextRedact = $(getElement('highLightRedactBtn')),
	addStrikeThrough = $(getElement('collabStrikeOutBtn'));

	var	redactBox = $(getElement('viewer-redactbox')),
	multipleDeleteBox = $(getElement('deleteMultiple')),
	annotateBox = $(getElement('viewer-annotateBox'));
	
		var udvPageInstance = pageCollection[pageNumber];
		var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
		var selectedMarkup = udvPageInstance.retrieveMarkObjectInPage(markIdSelected);
		var isMarkupAlreadySelected = udvPageInstance.isMarkupSelected(markIdSelected);
	
			transferTextAreaValuetoDiv(lastSelectedDivReason);
			if(!isMarkupAlreadySelected && ((UDV_id.indexOf('annotation')>-1) || UDV_id.indexOf('redaction')>-1))
			{
				if(selectedPages.length>0)
				{
					while(selectedPages.length>0)
					{
						var indexToClear = selectedPages[0];
						pageCollection[indexToClear].clearAllSelectedMarkups(indexToClear);
					}
				}

				if (!$(currentlySelectedAnnotation(annotationObject)).hasClass("on") && !$("#textSelection").hasClass("active-state")){
					udvPageInstance.clearAllSelectedMarkups(pageNumber);
					hideInfiniteBtn();
					handleGroup = applyHandles(selectedMarkup,udvPageInstance);
					udvPageInstance.selectMarkup(markIdSelected,handleGroup);
				}
			}
		

		if(selectedObjectCollection.length==1)
		{
			// single selected
			var singleSelectedAnnotation = selectedObjectCollection[0];
			var udvPage = pageCollection[singleSelectedAnnotation.pageId];
			var markup = udvPage.retrieveMarkObjectInPage(singleSelectedAnnotation.markupId);

			documentViewer.setCurrentSelectedMarkup(markup.markupType);

			switch(markup.markupType){
			case markupTypes.Circle:
				activeAnnotation( addCircle,annotateBox );
				break;
			case markupTypes.Rectangle:
				activeAnnotation( addSquare,annotateBox );
				break;
			case markupTypes.Line:
				activeAnnotation( addLine,annotateBox );
				break;
			case markupTypes.RectangleRedaction:
				markup.resetViewable();
				activeAnnotation( addRedact,redactBox );
				break;
			case markupTypes.TextRedactHighlight:
				var drawObj = markup.drawnObjectCollection;
				var len = drawObj.length;
				for (var i = 0; i < len; i++){
					drawObj[i].resetViewable();
				}
				activeAnnotation( addTextRedact,redactBox );
				break;
			case markupTypes.Arrow:
				activeAnnotation( addArrow,annotateBox );
				break;
			case markupTypes.Text:
				activeAnnotation( addText,annotateBox );
				break;
			case markupTypes.TextHighLight:
				activeAnnotation( addTextHighlight,annotateBox );
				break;
			case markupTypes.StrikeThrough:
				activeAnnotation( addStrikeThrough,annotateBox );
			}
			setToolBoxValues(markup.markupType);
			activateTab(markup.markupType);
			curSelectedMarkup = markup;
			multipleDeleteBox.css('display','none');
		}
		else
		{
			if(selectedObjectCollection.length > 1){
				// multiple select
				// Show multiple Delete
				multipleDeleteBox.css('display','block');
				// hideEditButton();
			}
			else{
				multipleDeleteBox.css('display','none');
			}
			dedactiveAnnotation();
		}
	
}

//Selects annotation object and does the following
//*Applies selector handles on annotationObject
//*Displays property panel for the given object
function selectAnnotationObject(e)
{
	if(!documentViewer.isRestrictAnnFn){
		var eTarget = (e.target.correspondingUseElement) ? e.target.correspondingUseElement : e.target; // IE &
		// Safari
		// use
		// SVGElementInstance
		var UDV_id = eTarget.getAttribute('data-isi'),
		handleGroup;
		
		//List of drawButtons based off object type. Ex: Arrow,line,
		var addRedact = $(getElement('addRedact')),
		addArrow = $(getElement('addArrow')),
		addLine = $(getElement('addLine')),
		addSquare = $(getElement('addSquare')),
		addCircle = $(getElement('addCircle')),
		addText = $(getElement('addText')),
		addStickyNote = $(getElement('stickyNoteBtn')),
		addStamp = $(getElement('stampBtn')),
		addImage = $(getElement('imageBtn')),
		handTool = $(getElement('page-handtool')),
		addTextHighlight = $(getElement('highLightBtn')),
		addTextRedact = $(getElement('highLightRedactBtn')),
		addStrikeThrough = $(getElement('collabStrikeOutBtn'));
		addCollabHighlight = $(getElement('collabHighlightBtn'));
		
		var	redactBox = $(getElement('viewer-redactbox')),
		multipleDeleteBox = $(getElement('deleteMultiple')),
		annotateBox = $(getElement('viewer-annotateBox'));
	
		var pageNumber = retrievePageNumber(eTarget)-1;//Retrieves page number to determine which page the object has been selected
	
		if(UDV_id && !readyToDraw)
		{
			$('#currentPosition').text(0);
			var udvPageInstance = pageCollection[pageNumber];
			var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
			
			//Retrieves markupObject from collection in UDVPage. Purpose of doing this is to allows
			//Easy way of manipulating the selected markupObject
			//Since markupObject have convenience functions in modifying attributes. EX: fill color, line color, font color, font size, opacity, etc...
			var selectedMarkup = udvPageInstance.retrieveMarkObjectInPage(markIdSelected);
			
			//Determines if the object which was clicked by the user was already selected o
			var isMarkupAlreadySelected = udvPageInstance.isMarkupSelected(markIdSelected);
			
			if(e.shiftKey || e.ctrlKey) //Checking if CTRL or SHIFT key is pressed
			{
				$('#textSelection').removeClass('active-state');
				transferTextAreaValuetoDiv(lastSelectedDivReason);
				if(!isMarkupAlreadySelected && (UDV_id.indexOf('annotation')>-1 || UDV_id.indexOf('redaction')>-1))
				{
					handleGroup = applyHandles(selectedMarkup,udvPageInstance);
					udvPageInstance.selectMarkup(markIdSelected,handleGroup);
					if($(document.body).width() <= 800) {
						$('.rs-btn').hide('fast');
						//console.log('1');
					}
					
					if(selectedObjectCollection.length>1){
						var socLen= selectedObjectCollection.length;
						
						for(var i=0; i<socLen; i++){
							if(selectedObjectCollection[i]){
								if(selectedObjectCollection[i].pageId != pageNumber){
									var udvPage = pageCollection[selectedObjectCollection[i].pageId];
									udvPage.deSelectMarkup(selectedObjectCollection[i].markupId);
									clearGroupDrag2(selectedObjectCollection[i].pageId);
									i--;
								}
							}
						}
					}
					applyMultipledrag(udvPageInstance);
				}
				else if(UDV_id.indexOf('outline')>-1 || (UDV_id.indexOf('annotation')>-1 || UDV_id.indexOf('redaction')>-1) && isMarkupAlreadySelected)
				{
					
					if (selectedMarkup.markupType != markupTypes.TextHighLight && selectedMarkup.markupType != markupTypes.TextRedactHighlight && selectedMarkup.markupType != markupTypes.StrikeThrough
							&& selectedMarkup.markupType != markupTypes.CollabHighlight){
						
						var markUpGrp = udvPageInstance.svgMarkupGroup;
						var grpDrag = udvPageInstance.groupDragGroup;
						
						updateRemovedFromGroup(udvPageInstance, selectedMarkup.shapes.group, grpDrag );
						markUpGrp.appendChild(selectedMarkup.shapes.group);
						
						//setTimeout(function() {
						//	attachSnapToDrag(selectedMarkup.shapes.group);
						//}, 1000);
						
						if(selectedObjectCollection.length==0){
							grpDrag.removeAttribute('transform');
						}
						removeSnapToDrag(grpDrag);
					}
					udvPageInstance.deSelectMarkup(markIdSelected);
					console.log("inside de select markup");
					if($(document.body).width() <= 800) {
						$('.rs-btn').hide('fast');
						//console.log('2');
					}
				}
			}
			else
			{
				transferTextAreaValuetoDiv(lastSelectedDivReason);
				if(!isMarkupAlreadySelected && ((UDV_id.indexOf('annotation')>-1) || UDV_id.indexOf('redaction')>-1))
				{
					if(selectedPages.length>0)
					{
						while(selectedPages.length>0)
						{
							var indexToClear = selectedPages[0];
							removeSnapToDrag(pageCollection[indexToClear].groupDragGroup);
							for(var i=0; i<pageCollection[indexToClear].selectedMarkupIds.length; i++){
								
								var sMarkup = pageCollection[indexToClear].retrieveMarkObjectInPage(pageCollection[indexToClear].selectedMarkupIds[i]);
								if (sMarkup.markupType != markupTypes.TextHighLight && sMarkup.markupType != markupTypes.TextRedactHighlight && sMarkup.markupType != markupTypes.StrikeThrough
										&& sMarkup.markupType != markupTypes.CollabHighlight){
									attachSnapToDrag(sMarkup.shapes.group);
								}
							}
							pageCollection[indexToClear].clearAllSelectedMarkups(indexToClear);
						}
					}
	
					if (!$(currentlySelectedAnnotation(annotationObject)).hasClass("on") && !$("#textSelection").hasClass("active-state")){
						udvPageInstance.clearAllSelectedMarkups(pageNumber);
						hideInfiniteBtn();
						handleGroup = applyHandles(selectedMarkup,udvPageInstance);
						udvPageInstance.selectMarkup(markIdSelected,handleGroup);
						if($(document.body).width() <= 800) {
							$('.rs-btn').hide('fast');
							//console.log('3');
						}
					}
				}
			}
	
			if(selectedObjectCollection.length==1)
			{
				// single selected
				var singleSelectedAnnotation = selectedObjectCollection[0];
				var udvPage = pageCollection[singleSelectedAnnotation.pageId];
				var markup = udvPage.retrieveMarkObjectInPage(singleSelectedAnnotation.markupId);
				var imagePreview = $('#imagePreview');
			
				documentViewer.setCurrentSelectedMarkup(markup.markupType);
	
				switch(markup.markupType){
				case markupTypes.Circle:
					activeAnnotation( addCircle,annotateBox );
					break;
				case markupTypes.Rectangle:
					activeAnnotation( addSquare,annotateBox );
					break;
				case markupTypes.Line:
					activeAnnotation( addLine,annotateBox );
					break;
				case markupTypes.RectangleRedaction:
					markup.resetViewable();
					activeAnnotation( addRedact,redactBox );
					break;
				case markupTypes.TextRedactHighlight:
					var drawObj = markup.drawnObjectCollection;
					var len = drawObj.length;
					for (var i = 0; i < len; i++){
						drawObj[i].resetViewable();
					}
					activeAnnotation( addTextRedact,redactBox );
					break;
				case markupTypes.Arrow:
					activeAnnotation( addArrow,annotateBox );
					break;
				case markupTypes.Text:
					activeAnnotation( addText,annotateBox );
					break;
				case markupTypes.StickyNote:
					activeAnnotation( addStickyNote,annotateBox );
					break;
				case markupTypes.Stamp:
					activeAnnotation( addStamp,annotateBox );
					break;
				case markupTypes.Image:
					activeAnnotation( addImage, annotateBox );
					imagePreview.attr('src', markup.attributes.href);
					break;
				case markupTypes.TextHighLight:
					activeAnnotation( addTextHighlight,annotateBox );
					break;
				case markupTypes.StrikeThrough:
					activeAnnotation( addStrikeThrough,annotateBox );
					break;
				case markupTypes.CollabHighlight:
					activeAnnotation( addCollabHighlight,annotateBox );
				}
				setToolBoxValues(markup.markupType);
				activateTab(markup.markupType);
				curSelectedMarkup = markup;
				multipleDeleteBox.css('display','none');
				
				if (markup.markupType != markupTypes.TextHighLight && markup.markupType != markupTypes.TextRedactHighlight && markup.markupType != markupTypes.StrikeThrough
						&& markup.markupType != markupTypes.CollabHighlight){
					clearGroupDrag2(singleSelectedAnnotation.pageId);
					attachSnapToDrag(markup.shapes.group);
				}
			}
			else
			{
				if(selectedObjectCollection.length > 1){
					// multiple select
					// Show multiple Delete
					multipleDeleteBox.css('display','block');
					// hideEditButton();
					if(!e.shiftKey && !e.ctrlKey){
						applyMultipledrag(udvPageInstance);
					}
				}
				else{
					multipleDeleteBox.css('display','none');
				}
				deactivateAnnotation();
			}
		}
		else if(!UDV_id && pageNumber>=0)
		{
			var udvPageInstance = pageCollection[pageNumber];
			$('#currentPosition').text(0);
			if (eTarget.getAttribute('id') != "textAreaContainer") {
				transferTextAreaValuetoDiv(lastSelectedDivReason);
				// multipleDeleteBox.css('display','none');
			}
			if(pageNumber>-1)
			{
				if(!(e.shiftKey || e.ctrlKey))
				{
					if(selectedPages.length>0)
					{
						var markUpGrp = udvPageInstance.svgMarkupGroup;
						var grpDrag = udvPageInstance.groupDragGroup;
						for(var i =0; i<selectedObjectCollection.length; i++){
							
							var selectedMarkup = udvPageInstance.retrieveMarkObjectInPage(selectedObjectCollection[i].markupId);
							if (selectedMarkup != null && selectedMarkup.markupType != markupTypes.TextHighLight && selectedMarkup.markupType != markupTypes.TextRedactHighlight && selectedMarkup.markupType != markupTypes.StrikeThrough
									&& selectedMarkup.markupType != markupTypes.CollabHighlight){
								updateRemovedFromGroup(udvPageInstance, selectedMarkup.shapes.group, grpDrag );
								attachSnapToDrag(selectedMarkup.shapes.group);
								markUpGrp.appendChild(selectedMarkup.shapes.group);
							}
							
						}
						while(selectedPages.length>0)
						{
							var indexToClear = selectedPages[0];
							pageCollection[indexToClear].clearAllSelectedMarkups(indexToClear);
						}
						if(selectedObjectCollection.length==0){
							grpDrag.removeAttribute('transform');
							removeSnapToDrag(udvPageInstance.groupDragGroup);
						}
						
					}
				}
			}
	
			// if(handTool.data("drag") == "enable"){
			if(!(e.shiftKey || e.ctrlKey))
			{
				deactivateAnnotation();
				multipleDeleteBox.css('display','none');
			}
			// }
		}
		/*
		 * else { transferTextAreaValuetoDiv(lastSelectedDivReason); }
		 */
		
	//	if($(document.body).width() <= 800) {
	//		$('.rs-btn').hide('fast'); 
	//	}
	}
}


function selectObject()
{
	var addRedact = $(getElement('addRedact')),
	addArrow = $(getElement('addArrow')),
	addLine = $(getElement('addLine')),
	addSquare = $(getElement('addSquare')),
	addCircle = $(getElement('addCircle')),
	addText = $(getElement('addText')),
	handTool = $(getElement('page-handtool'));

	var	redactBox = $(getElement('viewer-redactbox')),
	multipleDeleteBox = $(getElement('deleteMultiple')),
	annotateBox = $(getElement('viewer-annotateBox'));

	if(selectedObjectCollection.length===1)
	{
		// single selected
		var singleSelectedAnnotation = selectedObjectCollection[0];
		var udvPage = pageCollection[singleSelectedAnnotation.pageId];
		var markup = udvPage.retrieveMarkObjectInPage(singleSelectedAnnotation.markupId);

		documentViewer.setCurrentSelectedMarkup(markup.markupType);

		switch(markup.markupType){
		case markupTypes.Circle:
			activeAnnotation( addCircle,annotateBox );
			break;
		case markupTypes.Rectangle:
			activeAnnotation( addSquare,annotateBox );
			break;
		case markupTypes.Line:
			activeAnnotation( addLine,annotateBox );
			break;
		case markupTypes.RectangleRedaction:
			markup.resetViewable();
			activeAnnotation( addRedact,redactBox );
			break;
		case markupTypes.Arrow:
			activeAnnotation( addArrow,annotateBox );
			break;
		case markupTypes.Text:
			activeAnnotation( addText,annotateBox );
			break;
		}
		setToolBoxValues(markup.markupType);
		activateTab(markup.markupType);
		curSelectedMarkup = markup;
		multipleDeleteBox.css('display','none');
	}
	else
	{
		if(selectedObjectCollection.length > 1){
			// multiple select
			// Show multiple Delete
			multipleDeleteBox.css('display','block');
			// hideEditButton();
		}
		else{
			multipleDeleteBox.css('display','none');
		}
		deactivateAnnotation();
	}
}

function retrieveSelectedMarkup()
{
	if(selectedObject.pageIndex>-1 && selectedObject.markupIndex>-1)
	{
		var udvPage = pageCollection[pageIndex];
		return udvPage.retrieveMarkObjectInPage(markupIndex);
	}
	return null;
}

//Activates given object for drawing
function activeAnnotation($this,container){
	var viewerWrapper = $(getElement('viewer-document-wrapper')),
	viewerChild = viewerWrapper.children(".pageContent");

	var annotateBoxTab = $('.annotateBoxTab'), //Parent container for property panel
	arrowTab = $(getElement('arrowTab')),
	lineTab = $(getElement('lineTab')),
	rectTab = $(getElement('rectTab')),
	circleTab = $(getElement('circleTab')),
	textTab = $(getElement('textTab')),
	textstyleTab = $(getElement('textstyleTab')),
	textAlignTab = $(getElement('textAlignTab')),
	verticalAlignTab = $(getElement('verticalAlignTab')),
	annotateLayerTab = $(getElement('layerTab')),
	rectBorderTab = $(getElement('rectBorderTab')),
	circleBorderTab = $(getElement('circleBorderTab')),
	redactLayerTab = $(getElement('Redact_index')),
	redactReasonTab = $(getElement('Redact_fill'));
	addComment = $(getElement('commentTab')),
	tagSetTab = $(getElement('tagSetTab')),
	positionTab = $(getElement('positionTab')),
	imageTab = $(getElement('imageTab')),
	imageContainer = $('.imageContainer'),
	
	//Reset previously selected tools
	$this.siblings().data('active',false).removeClass('selected-tool');
	
	//Hide other tabs 
	$this.data('active',false).removeClass('selected-tool');
	
	//Reset mouse cursor style
	viewerChild.removeClass('cursorCrosshair');
	viewerChild.removeClass('text-cursor');
	container.siblings().css('display','none')
	.end()
	.css('display','block');

	$('.annotateBoxTab').children('img')
	.css('display','none')
	.removeClass("selected")
	.removeClass("standBy");
	
	$('.annotateBoxTab').children('i')
	.css('display', 'none')
	.removeClass("selected")
	.removeClass("standBy");

	var annotateType = $this.data("annotate");
	
	collabTools = annotateType == markupTypes.StrikeThrough ? true : false;
	
	//disable other tabs other than selected tab
	switch(annotateType){

	case markupTypes.Arrow:
		//Make inactive sibling tabs of arrow fill tab
		arrowTab.siblings().removeClass("standBy selected")
		.end()
		.addClass('standBy selected');
		annotateLayerTab.addClass("standBy");
		arrowTab.trigger('click');
		
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		
		break;

	case markupTypes.Line:
		//Make inactive sibling tabs of line fill tab
		lineTab.siblings().removeClass("standBy selected")
		.end()
		.addClass('standBy selected');
		annotateLayerTab.addClass("standBy");
		lineTab.trigger('click');
		
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		
		break;

	case markupTypes.Rectangle:
		//Make inactive sibling tabs of rectangle fill tab
		rectTab.siblings().removeClass("standBy selected")
		.end()
		.addClass('standBy selected');

		rectBorderTab.addClass('standBy');
		annotateLayerTab.addClass("standBy");
		rectTab.trigger('click');

		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		
		break;

	case markupTypes.Circle:
		//Make inactive sibling tabs of circle fill tab
		circleTab.siblings().removeClass("standBy selected")
		.end()
		.addClass('standBy selected');

		circleBorderTab.addClass('standBy');
		annotateLayerTab.addClass("standBy");
		circleTab.trigger('click');
		
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		
		break;
		
	case markupTypes.Text:
		//Make inactive sibling tabs of rect fill tab
		// For Filling
		rectTab.siblings().removeClass("standBy selected")
		.end()
		.addClass('standBy selected');

		rectBorderTab.addClass('standBy');
		textTab.addClass('standBy');
		textstyleTab.addClass('standBy');
		textAlignTab.addClass('standBy');
		verticalAlignTab.addClass('standBy');
		annotateLayerTab.addClass("standBy");
		// Same as rectangle
		rectTab.trigger('click');
		
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		
		break;

	case markupTypes.StickyNote:	
		//Make inactive sibling tabs of rect fill tab
		// For Filling
		rectTab.siblings().removeClass("standBy selected")
		.end()
		.addClass('standBy selected');

		textTab.addClass('standBy');
		textstyleTab.addClass('standBy');
		textAlignTab.addClass('standBy');
		verticalAlignTab.addClass('standBy');
		annotateLayerTab.addClass("standBy");
		// Same as rectangle
		rectTab.trigger('click');
		
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		
		break;
	case markupTypes.Stamp:	
		
		tagSetTab.siblings().removeClass("standBy selected").end().addClass('standBy selected');
		textTab.addClass('standBy');
		textstyleTab.addClass('standBy');
		//positionTab.addClass('standBy');
		tagSetTab.trigger('click');
		
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		break;	
		
	case markupTypes.Image:
		imageTab.siblings().removeClass("standBy selected").end().addClass('standBy selected');
		hideTabContent();
		imageContainer.addClass('standBy');
		break;		
		
	case markupTypes.RectangleRedaction:
		//Make active redaction reason tab
		redactLayerTab.css("display","block");
		redactReasonTab.trigger('mousedown');
		
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		
		break;
	case markupTypes.TextRedactHighlight:
		//Make active redaction reason tab
		redactLayerTab.css("display","none");
		redactReasonTab.trigger('mousedown');
		
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		
		break;
	case markupTypes.TextHighLight:
		//Make inactive sibling tabs of rectangle fill tab
		rectTab.siblings().removeClass("standBy selected")
		.end()
		.addClass('standBy selected');
		
		rectTab.trigger('click');
		$("#nofillColor").css({
			"display" : "none",
			"cursor" : "default"
		}).removeClass("nofillColor");
		
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		
		break;
	case markupTypes.CollabHighlight:
		rectTab.siblings().removeClass("standBy selected")
		.end()
		.addClass('standBy selected');
		
		rectTab.trigger('click');
		$("#nofillColor").css({
			"display" : "none",
			"cursor" : "default"
		}).removeClass("nofillColor");
		
		addComment.addClass('standBy');
		$('#commentTab').trigger('click');
		
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		
		break;
	case markupTypes.StrikeThrough:
		//Make inactive sibling tabs of line fill tab
		lineTab.siblings().removeClass("standBy selected")
		.end()
		.addClass('standBy selected');
		lineTab.trigger('click');

		addComment.addClass('standBy');
		$('#commentTab').trigger('click');
		
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		break;
	}
}

//Hide All Tab Contents
function hideTabContent(){
	tabContent.children('div')
	.css('display','none')
	.removeClass('standBy');
	hideDropDown();// Hide DropDown(s) menu
}

//Hide DropDown
function hideDropDown(){
	tabContent.children('div').children('div').each(function(){
		if($(this).hasClass('active')){
			$(this).removeClass('active');
		}
	});
}

function deactivateAnnotation(){
	var addRedact = $(getElement('addRedact')),
	addArrow = $(getElement('addArrow')),
	addLine = $(getElement('addLine')),
	addSquare = $(getElement('addSquare')),
	addCircle = $(getElement('addCircle')),
	addText = $(getElement('addText')),
	addHighlightText = $(getElement('highLightBtn')),
	addTextRedact = $(getElement('highLightRedactBtn')),
	addStrikeOut = $(getElement('collabStrikeOutBtn')),
	addCollabHighlight = $(getElement('collabHighlightBtn'));
	

	var	redactBox = $(getElement('viewer-redactbox')),
	annotateBox = $(getElement('viewer-annotateBox'));

	// Unselect Annotation
	if (!viewerWrapper.hasClass('cursorCrosshair') || !viewerWrapper.hasClass('text-cursor')){
		addRedact.data('active',false).removeClass('selected-tool');
		addArrow.data('active',false).removeClass('selected-tool');
		addLine.data('active',false).removeClass('selected-tool');
		addSquare.data('active',false).removeClass('selected-tool');
		addCircle.data('active',false).removeClass('selected-tool');
		addText.data('active',false).removeClass('selected-tool');
		addHighlightText.data('active',false).removeClass('selected-tool');
		addTextRedact.data('active',false).removeClass('selected-tool');
		addStrikeOut.data('active',false).removeClass('selected-tool');
		addCollabHighlight.data('active',false).removeClass('selected-tool');
	}

	// Hide Container
	redactBox.css('display','none');
	annotateBox.css('display','none');
}

//Clears all handles on all pages
function clearAllHandles()
{
	var pageCount = pageCollection.length;
	for(var ctr=0;ctr<pageCount;ctr++)
	{
		if(pageCollection[ctr].selectedMarkupIds.length>0)
			pageCollection[ctr].clearAllSelectedMarkups(ctr);
	}
}

//Retrieve total dimension of pages from (0 - (pageIndex-1)) accounting their rotation (landscape/portrait)
//Used when applying handles on annotation
function computeRelativePageDimensions(pageIndex)
{
	var animatedPageDimension =
	{
			height : 0,
			width : 0
	},
	tempDimension;
	for(var i=0; i < pageIndex ; i++)
	{
		tempDimension = pageCollection[i].rotatedDimensions();
		animatedPageDimension.height+=tempDimension.height;
		animatedPageDimension.width+=tempDimension.width;
	}
	return animatedPageDimension;
}

//Calculate x and y coordinate accounting for the following:
//*Page number
//*Horizontal Scroll
//*Vertical Scroll
//*Zoom percentage (scaleFactor)
//*Total page dimension from 0 to pageIndex
function computeCoordinates(x,y,rotatedDimension,pageIndex)
{
	var coordinatePoint = {
			x : x,
			y : y
	},
	obj = $(getElement('viewer-document-wrapper')).closest('div#viewerContainer'),
	childPage = document.getElementById('udv_page_'+(pageIndex+1)),
	pageHeight = rotatedDimension.height,
	pageWidth = rotatedDimension.width,
	margin = 10 * pageIndex,
	offsetTop = childPage.offsetTop - ((pageHeight*(scaleFactor)) + margin),
	offsetLeft = childPage.offsetLeft;

	y-= offsetTop  - obj.scrollTop();
	y = y - ((pageHeight*(scaleFactor))) - ((10*pageIndex));
	x-= offsetLeft - obj.scrollLeft();
	// x = x - ((pageWidth*(scaleFactor))) - ((10*pageIndex));
	coordinatePoint.x = x;
	coordinatePoint.y = y;
	return coordinatePoint;
}

//Calculate x,y,height,width of an SVG element. Resulting values are for HTML coordinate space 
function calculateLeftAndTop(elementForCalculation)
{
	var dimensionObject = {left : 0, top : 0, width: 0, height: 0};
	var processedElement = elementForCalculation;
	var box = { left: 0, top: 0 };
	box = processedElement.getBoundingClientRect();
	var doc = document,
	docElem = doc.documentElement,
	body = document.body,
	win = window,
	clientTop  = docElem.clientTop  || body.clientTop  || 0,
	clientLeft = docElem.clientLeft || body.clientLeft || 0,
	scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
	scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft;
	dimensionObject.top  = box.top  + scrollTop  - clientTop,
	dimensionObject.left = box.left + scrollLeft - clientLeft;
	dimensionObject.height  = processedElement.getBoundingClientRect().height,
	dimensionObject.width = processedElement.getBoundingClientRect().width;
	return dimensionObject;
}

//Retrieve position and dimension of an SVG element as HTML coordinates
function calculatePosition(objectForCalculation,rotatedDimension,pageIndex)
{
	var dimensionObject = calculateLeftAndTop(objectForCalculation);
	var coordinatePointWithOffset = computeCoordinates(dimensionObject.left,dimensionObject.top,rotatedDimension,pageIndex);
	dimensionObject.left = coordinatePointWithOffset.x;
	dimensionObject.top = coordinatePointWithOffset.y;
	return dimensionObject;
}

//Recalculate position of handles
//This is executed when the document or its pages are either rotated or zoomed
function reCalculateHandles(pvi)
{
	var numberOfMarkups = pvi.selectedMarkupIds.length;
	var handleGroup;
	clearChildren(pvi.divHandles);
	for(var i=0; i<numberOfMarkups ; i++)
	{
		var annoObj = pvi.retrieveMarkObjectInPage(pvi.selectedMarkupIds[i]);
		if(annoObj)
		{
			handleGroup = applyHandles(annoObj,pvi);
			pvi.updateHandles(i,handleGroup);
		}
	}
}

//Calculate x and y coordinate accounting for the following:
//*Page number
//*Horizontal Scroll
//*Vertical Scroll
//*Zoom percentage (scaleFactor)
//*Total page dimension from 0 to pageIndex
//This function is similar to computeCoordinates() function but only retrieves point1 and point2
function computeLineCoordinates(forCalculation,svgPage,rotatedDimension,pageIndex)
{
	var doc = document,
	docElem = doc.documentElement,
	body = document.body,
	win = window,
	clientTop  = docElem.clientTop  || body.clientTop  || 0,
	clientLeft = docElem.clientLeft || body.clientLeft || 0,
	scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
	scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft;

	var corners = {};
	var pt = svgPage.createSVGPoint();
	var matrix  = forCalculation.getScreenCTM();
	pt.x = forCalculation.x1.animVal.value;
	pt.y = forCalculation.y1.animVal.value;
	corners.nw = pt.matrixTransform(matrix);
	corners.nw.x += (scrollLeft - clientLeft);	
	corners.nw.y += (scrollTop - clientTop);
	pt.x = forCalculation.x2.animVal.value;
	pt.y = forCalculation.y2.animVal.value;
	corners.se = pt.matrixTransform(matrix);
	corners.se.x += (scrollLeft - clientLeft);
	corners.se.y += (scrollTop - clientTop);
	return { pt1 : computeCoordinates(corners.nw.x,corners.nw.y,rotatedDimension,pageIndex),
		pt2 : computeCoordinates(corners.se.x,corners.se.y,rotatedDimension,pageIndex)};
}

//Uses calculations relative to the selecteMarkup
//to apply the resize handle selectors
//On the given selectedMarkup (object)
function applyHandles(selectedMarkup,udvPageInstance)
{
	var forCalculation,
	pageAttributes=udvPageInstance.attributes,
	dimension,
	dimension2,
	divHandles = udvPageInstance.divHandles,
	handleGroup,
	rotatedDimension = computeRelativePageDimensions(pageAttributes.pageIndex),
	forCalculation,
	forCalculation2,
	firstBox,
	lastBox;
	
	if (selectedMarkup.markupType==markupTypes.TextHighLight || selectedMarkup.markupType==markupTypes.TextRedactHighlight 
			|| selectedMarkup.markupType==markupTypes.StrikeThrough || selectedMarkup.markupType==markupTypes.CollabHighlight){
		firstBox = selectedMarkup.drawnObjectCollection[0];
		forCalculation = firstBox.shapes.retrieveShapeForCalculation();
		if(selectedMarkup.drawnObjectCollection.length > 1){
			lastBox = selectedMarkup.drawnObjectCollection[selectedMarkup.drawnObjectCollection.length-1];
			forCalculation2 = lastBox.shapes.retrieveShapeForCalculation();
		}
	} else {
		forCalculation = selectedMarkup.shapes.retrieveShapeForCalculation();
	}
	
	switch(selectedMarkup.markupType)
	{
	case markupTypes.Line :
	case markupTypes.Arrow :
	case markupTypes.StrikeThrough :
		if (selectedMarkup.drawnObjectCollection && selectedMarkup.drawnObjectCollection.length > 1){
			var lineCoordinates1 = computeLineCoordinates(forCalculation,udvPageInstance.svgPage,rotatedDimension,pageAttributes.pageIndex);
			var lineCoordinates2 = computeLineCoordinates(forCalculation2,udvPageInstance.svgPage,rotatedDimension,pageAttributes.pageIndex);
			handleGroup = resizeHandlesArrow(firstBox,lastBox,divHandles,lineCoordinates1.pt1.x,lineCoordinates2.pt1.x,lineCoordinates1.pt1.y,lineCoordinates2.pt1.y,
				lineCoordinates1.pt2.x,lineCoordinates2.pt2.x,lineCoordinates1.pt2.y,lineCoordinates2.pt2.y,udvPageInstance,selectedMarkup);
		} else {
			var lineCoordinates = computeLineCoordinates(forCalculation,udvPageInstance.svgPage,rotatedDimension,pageAttributes.pageIndex);
			handleGroup = resizeHandlesArrow(selectedMarkup,null,divHandles,lineCoordinates.pt1.x,0,lineCoordinates.pt1.y,0,
					lineCoordinates.pt2.x,0,lineCoordinates.pt2.y,0,udvPageInstance,selectedMarkup);	
		}
		break;
	case markupTypes.Circle :
		dimension = calculatePosition(forCalculation,rotatedDimension,pageAttributes.pageIndex);
		handleGroup = resizeHandles(selectedMarkup,divHandles,dimension.left,dimension.top,dimension.height,dimension.width,udvPageInstance);
		break;
	case markupTypes.Stamp :
	case markupTypes.Image :	
		dimension = calculatePosition(forCalculation,rotatedDimension,pageAttributes.pageIndex);
		handleGroup = resizeHandles(selectedMarkup,divHandles,dimension.left,dimension.top,dimension.height,dimension.width,udvPageInstance);
		break;
	case markupTypes.StickyNote :	
	case markupTypes.Text :
	case markupTypes.Rectangle :
	case markupTypes.RectangleRedaction :
		dimension = calculatePosition(forCalculation,rotatedDimension,pageAttributes.pageIndex);
		handleGroup = resizeHandles(selectedMarkup,divHandles,dimension.left,dimension.top,dimension.height,dimension.width,udvPageInstance);
		break;
	case markupTypes.TextHighLight:
	case markupTypes.TextRedactHighlight:
	case markupTypes.CollabHighlight:
		if (selectedMarkup.drawnObjectCollection.length > 1){
			dimension = calculatePosition(forCalculation,rotatedDimension,pageAttributes.pageIndex);
			dimension2 = calculatePosition(forCalculation2,rotatedDimension,pageAttributes.pageIndex);
			handleGroup = resizeHandlesText(firstBox,lastBox,divHandles,dimension.left,dimension2.left,dimension.top,dimension2.top,
					dimension.height,dimension2.height,dimension.width,dimension2.width,udvPageInstance,selectedMarkup.drawnObjectCollection,selectedMarkup);
		} else {
			//selectedMarkup = selectedMarkup.drawnObjectCollection[0];
			dimension = calculatePosition(forCalculation,rotatedDimension,pageAttributes.pageIndex);
			handleGroup = resizeHandlesText(selectedMarkup.drawnObjectCollection[0],selectedMarkup.drawnObjectCollection[0],divHandles,dimension.left,dimension.left,dimension.top,
					dimension.top,dimension.height,dimension.height,dimension.width,dimension.width,udvPageInstance,selectedMarkup.drawnObjectCollection,selectedMarkup);
		}
		
		break;
	}
	return handleGroup;
}

/**
 * Verify markup is selected using global selectedObjectCollection
	Each element in selectedObjectCollection has this format
	collection - collection of currently selected objects
	markId - id of the given annotation
 */
function checkCollection(collection,markId)
{
	var length = selectedObjectCollection.length;
	for(var i=0;i<length;i++)
	{
		var annotation = selectedObjectCollection[i];

		if(annotation.markupId === markId)
		{
			return i;
		}
	}
	return null;
}

/**
 * Retrieves initial position and dimensions of an object
 * @param annotation - markupObject of the given annotation
 * @returns object containing position and dimension of object
 */
function initializeAttributesTransformed(annotation)
{
	var initialDimension = {
			x : 0,
			y : 0,
			width : 0,
			height : 0
	},shape;

	switch(annotation.markupType)
	{
	case markupTypes.StickyNote :
	case markupTypes.Text :
	case markupTypes.Rectangle :
	case markupTypes.RectangleRedaction :
		shape = annotation.SVGRectangle.getBoundingClientRect();
		initialDimension.x = shape.x;
		initialDimension.y = shape.y;
		initialDimension.width = shape.width;
		initialDimension.height = shape.height;
		break;
	case markupTypes.Circle :
		shape = annotation.SVGEllipse.getBoundingClientRect();
		initialDimension.x = shape.x;
		initialDimension.y = shape.y;
		initialDimension.width = shape.width;
		initialDimension.height = shape.height;
		break;
	}
	return shape;

}

/**
 *
 * Function used to attach resizing logic for the selected annotation. 
 * Determines how object is resized depending on the following factors:
 * -Page orientation
 * -Zoom factor
 * -Which resize handle is selected
 * @param markupSelected - Selected markup object (text highlight,redaction text highlight).
 * @param anchorMarkup - Anchor object of the highlight annotation. Used to determine resizing functionality as a relative for all movements (up and down)
 * @param createdDivForHandle - Resize handle selected
 * @param udvPageInstance - udvPage instance where highlight is applied
 * @param degreesRotated - Orientation of the page. Different calculations are used relative to how the page is rotated
 * @param selectedHandleIndex - Used to determine which resize handle index is selected. This is used to determine what type of behavior when resizing is used.
 * @param annotationHandles - Collection of all the resize handles currently applied on the annotation
 * @param drawnObjStack - Collection of lines represented as markupObjects. This is used to easily manipulate position and dimension of highlight when resizing.
 * @param originalMarkupObject - Instance of the selected markupObject
 */
function applyResizeHighlightLogic(markupSelected,anchorMarkup,createdDivForHandle,udvPageInstance,degreesRotated,selectedHandleIndex,annotationHandles, drawnObjStack,originalMarkupObject){ 
	var startResize = function(e){
		e.stopPropagation();
		e.preventDefault();
		var viewerWrapper = $(getElement('viewer-document-wrapper')),
		initialShapeAttributes,
		handTool = $(getElement('page-handtool')),
		closestChild = $(getElement('viewer-document-wrapper')).closest('div#viewerContainer');
		handTool.data('drag','unable').removeClass('selected-tool');
		viewerWrapper.removeDragScroll(),
		startX = e.clientX,
		startY = e.clientY,
		degrees = degreesRotated,
		pageAttributes = udvPageInstance.attributes,
		markAttr = markupSelected!=null ? markupSelected.attributes : anchorMarkup.attributes,
		isRedactionHighlight = markAttr.type === markupTypes.TextRedactHighlight,
		rotateDeg = pageAttributes.rotateDegrees,
		initScrollTop = closestChild.scrollTop(),
		initScrollLeft = closestChild.scrollLeft(),
		rotatedDimension = udvPageInstance.rotatedDimensions(),
		svgPage = udvPageInstance.svgPage,
		viewerPortTop = parseInt(closestChild.position().top),
		viewerPortLeft = parseInt(closestChild.position().left),
		viewerPortRight = parseInt(closestChild.outerWidth()),
		viewerPortBottom = parseInt(closestChild.outerHeight());
		viewerPortBottom += viewerPortTop,
		pageHeight = udvPageInstance.rotatedDimensions().height * scaleFactor,
		pageWidth = udvPageInstance.rotatedDimensions().width * scaleFactor,
		pageTextElements = udvPageInstance.textElements,
		highlightIdxStack = [],
		highlightObjStack = originalMarkupObject.drawnObjectCollection != undefined ? originalMarkupObject.drawnObjectCollection : [],
		selectedIndex =	null,
		anchorIndex = null,
		rectGroup = anchorMarkup.shapes.group,
		isReversed = false,
		redactionReason = "",
		currOpacity = isRedactionHighlight ? 0.5 : markAttr.opacity,
		currFillColor = isRedactionHighlight ? defaultResizeTextRedactionHighlightColor : markAttr.fillColor,
		toolBoxx = 
			{
				fillColor : currFillColor,
				opacityLevelDecimal : currOpacity
			},
		isAnchorLast = false,
		type = anchorMarkup.markupType;
		
		if(selectedHandleIndex === 0)
		{
			markupSelected = highlightObjStack[0];
			anchorMarkup =highlightObjStack[highlightObjStack.length-1];
			selectedIndex =	checkBoundingBoxOverlap(markupSelected.attributes.x, markupSelected.attributes.y, pageTextElements).pop();
			anchorIndex = checkBoundingBoxOverlap(anchorMarkup.attributes.x, anchorMarkup.attributes.y, pageTextElements).pop();
		}
		else
		{
			anchorMarkup = highlightObjStack[0];
			markupSelected = highlightObjStack[highlightObjStack.length-1];
			anchorIndex = checkBoundingBoxOverlap(anchorMarkup.attributes.x, anchorMarkup.attributes.y, pageTextElements).pop();
			selectedIndex = checkBoundingBoxOverlap(markupSelected.attributes.x, markupSelected.attributes.y, pageTextElements).pop();
		}
		
		/**
		 * Retrieves initial position and dimension of an object
		 */
		initialShapeAttributes = initializeAttributes(anchorMarkup);
	
		
		if(isRedactionHighlight)
			redactionReason = anchorMarkup.attributes.text[0];
		
		var len = annotationHandles.length;
		for(var i=0;i<len;i++)
		{
			annotationHandles[i].style.display="none";
		}

		/**
		 * Determine which resize handle was selected. This is used to adjust the highlightObject stack.
		 * Since stack is ordered depending on how it was created. Example: if a highlight is created with 
		 * 5 lines and selectedHandleIndex is 1 (this means the handle selected was on the last line.
		 * Reverse order of collection to still satisfy resize logic.
		 */
		if (selectedHandleIndex == 0) {
			var lastIndexStack = anchorIndex-1;
			while (selectedIndex <= lastIndexStack){
				highlightIdxStack.push(lastIndexStack);
				lastIndexStack--;
			}
			isReversed = true;
			highlightObjStack.reverse();
		}
		else
		{
			var lastIndexStack = anchorIndex+1;
			while (selectedIndex >= lastIndexStack){
				highlightIdxStack.push(lastIndexStack);
				lastIndexStack++;
			}
		}
		
		if(isRedactionHighlight)
		{
			var xx = highlightObjStack.length;
			var redactHighlight = null;
			for(var o=0;o<xx;o++)
			{
				redactHighlight = highlightObjStack[o];
				redactHighlight.setFillColor(defaultResizeTextRedactionHighlightColor);
				redactHighlight.setOpacityDisplay(0.4);
				redactHighlight.shapes.divText.innerHTML = '';
			}
		}
		
		/**
		 * Retrieve all highlightObjects EXCEPT the first element. The first element acts as anchor during highlight
		 */
		highlightObjStack = highlightObjStack.splice(1,originalMarkupObject.drawnObjectCollection.length);

		var resizeOnMove = function(e){
			e.stopPropagation();
			e.preventDefault();

			var convertedPoints = convertToSVGCoordinateSpace(svgPage,e.clientX,e.clientY),
			scrollTops = closestChild.scrollTop(),
			scrollLefts = closestChild.scrollLeft(),
			transf = convertToSVGCoordinateSpace(svgPage,e.clientX,e.clientY);

			
			switch(rotateDeg) {

			case 0:
			case 360:
			default:	

				transf.x = convertedPoints.x;
				transf.y = convertedPoints.y;

				break;

			case 90:

				transf.x = convertedPoints.y;
				transf.y = parseFloat(pageWidth-convertedPoints.x);

				break;

			case 180:

				transf.x = parseFloat(pageWidth-convertedPoints.x);
				transf.y = parseFloat(pageHeight-convertedPoints.y);

				break;

			case 270:

				transf.x = parseFloat(pageHeight-convertedPoints.y);
				transf.y = convertedPoints.x;

				break;
			}
			
			/**
			 * Apply scaleFactor computation. Takes into account zoom-in or zoom-out of the page
			 * And adjusts coordinates to match how the page is scaled
			 */
			transf.x = transf.x * (1/scaleFactor);
			transf.y = transf.y * (1/scaleFactor);

			var hitIndex = checkBoundingBox(transf.x, transf.y, pageTextElements);

			/**
			 * Determine if there were any bounding boxes hit by mouse move
			 */
			if(hitIndex!=null)
			{
				firstHighlightedIndex = anchorIndex;
				var highlightIdxHit = highlightIdxStack;
				if (hitIndex != anchorIndex && highlightIdxStack.indexOf(hitIndex) < 0){
					var lastIndexInStack = highlightIdxStack[highlightIdxHit.length-1];
				}
				if (firstHighlightedIndex != hitIndex && highlightIdxHit.indexOf(hitIndex) < 0){
					// if stack does not contain hit boxes, initialize stack
					var lastIndexInStack = 0;
					if (highlightIdxHit.length == 0){
						lastIndexInStack = firstHighlightedIndex;
					} else {
						lastIndexInStack = highlightIdxHit[highlightIdxHit.length-1];
					}
					if (hitIndex > firstHighlightedIndex) {
						//downward selection, add increasing index to stack, considering skips
						if(lastIndexInStack < anchorIndex)
						{
							while(highlightIdxHit.length > 0){
								highlightIdxHit.pop();
								var elementRemove = highlightObjStack.pop();
								switch(type)
								{
								case markupTypes.TextRedactHighlight : 
									removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.foreignObj);
								case markupTypes.TextHighLight :
								case markupTypes.CollabHighlight :
									removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.SVGRectangle);									
									break;
								}
	
							}
						}
						while(hitIndex > lastIndexInStack){
							lastIndexInStack++;
							if(highlightIdxHit.indexOf(lastIndexInStack)<0 && lastIndexInStack!=anchorIndex && lastIndexInStack > anchorIndex)
							{
								highlightIdxHit.push(lastIndexInStack);
								highlightObjStack.push(drawNextObject(markAttr.type,markupId,rectGroup));								
							}

						}
					} else if (hitIndex < firstHighlightedIndex) {
						if(lastIndexInStack > firstHighlightedIndex)
						{
							while(highlightIdxHit.length > 0){
								highlightIdxHit.pop();
								var elementRemove = highlightObjStack.pop();
								switch(type)
								{
								case markupTypes.TextRedactHighlight : 
									removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.foreignObj);
								case markupTypes.TextHighLight :
								case markupTypes.CollabHighlight :
									removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.SVGRectangle);									
									break;
								}
							}
						}
						//upward selection add decreasing index to stack, considering skips
						while(hitIndex < lastIndexInStack){
							lastIndexInStack--;
							if(highlightIdxHit.indexOf(lastIndexInStack)<0 && lastIndexInStack!=anchorIndex && lastIndexInStack < anchorIndex)
							{
								highlightIdxHit.push(lastIndexInStack);
								highlightObjStack.push(drawNextObject(markAttr.type,markupId,rectGroup));
							}
						}
					}
				}


				var drawnObject = anchorMarkup;
				
				/**
				 * Determine if there were any bounding boxes hit by mouse move
				 */
				if(hitIndex!=null)
				{
					var firstElement = pageTextElements[firstHighlightedIndex];
					var anchX = firstElement[0];
					var anchY = firstElement[1];
					var anchWidth = firstElement[2];
					var anchHeight = firstElement[3];
					
					var nextElement = pageTextElements[hitIndex];
					var currX = nextElement[0];
					var currY = nextElement[1];
					var currWidth = nextElement[2];
					var currHeight = nextElement[3];

					/**
					 * if hitIndex is below the anchor line. This means mouse movement is downwards relative to anchor position.
					 */
					if (hitIndex > firstHighlightedIndex) {

						if(isAnchorLast)
						{
							while(highlightIdxHit.length > 0){
								highlightIdxHit.pop();
								var elementRemove = highlightObjStack.pop();
								switch(type)
								{
								case markupTypes.TextRedactHighlight : 
									removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.foreignObj);
								case markupTypes.TextHighLight :
								case markupTypes.CollabHighlight :
									removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.SVGRectangle);									
									break;
								}
							}
							isAnchorLast = false;							
						}
						//complete anchor
						if(selectedHandleIndex === 0)
						{
							moveHighlightObject(initialShapeAttributes.x+initialShapeAttributes.width, anchY, (anchWidth)-(initialShapeAttributes.width), anchHeight, 
									currFillColor, currOpacity, drawnObject);
						}
						else
						{
							moveHighlightObject(initialShapeAttributes.x, anchY, (anchWidth)-(initialShapeAttributes.x-anchX), anchHeight, 
									currFillColor, currOpacity, drawnObject);							
						}
						if (highlightIdxHit.indexOf(hitIndex) > -1){
							//check if hit stack contains hitIdx
							if (highlightIdxHit[highlightIdxHit.length-1] == hitIndex) {
								//check if hitIndex is last in stack
								shiftHighlightPosition(hitIndex,highlightIdxHit,highlightObjStack,pageTextElements,currFillColor,currOpacity);
								moveHighlightObject(currX, currY, transf.x-currX, currHeight, currFillColor, 
										currOpacity, highlightObjStack[highlightObjStack.length-1]);
							} else {
								//cursor moving back to previous box, remove from stack
								while(highlightIdxHit[highlightIdxHit.length-1] != hitIndex){
									highlightIdxHit.pop();
									var elementRemove = highlightObjStack.pop();
									switch(type)
									{
									case markupTypes.TextRedactHighlight : 
										removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.foreignObj);
									case markupTypes.TextHighLight :
									case markupTypes.CollabHighlight :
										removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.SVGRectangle);									
										break;
									}
								}
								moveHighlightObject(currX, currY, transf.x-currX, currHeight, currFillColor, 
										currOpacity, highlightObjStack[highlightObjStack.length-1]);
							}
						}
						
					} 
					
					/**
					 * if hitIndex is below the anchor line. This means mouse movement is downwards relative to anchor position.
					 */
					else if (hitIndex < firstHighlightedIndex) {
						if(isAnchorLast)
						{
							while(highlightIdxHit.length > 0){
								highlightIdxHit.pop();
								var elementRemove = highlightObjStack.pop();
								switch(type)
								{
								case markupTypes.TextRedactHighlight : 
									removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.foreignObj);
								case markupTypes.TextHighLight :
								case markupTypes.CollabHighlight :
									removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.SVGRectangle);									
									break;
								}
							}
							isAnchorLast = false;							
						}

						if(parseInt(initialShapeAttributes.x-anchX)>0)
							moveHighlightObject(anchX, anchY, (initialShapeAttributes.x-anchX), anchHeight,currFillColor, currOpacity, drawnObject);
						else
							moveHighlightObject(anchX, anchY, (initialShapeAttributes.width), anchHeight,currFillColor, currOpacity, drawnObject);

						if (highlightIdxHit.indexOf(hitIndex) > -1){
							//check if hit stack contains hitIdx
							if (highlightIdxHit[highlightIdxHit.length-1] === hitIndex) {
								//check if hitIndex is last in stack
								shiftHighlightPosition(hitIndex,highlightIdxHit,highlightObjStack,pageTextElements,currFillColor,currOpacity);
								moveHighlightObject(transf.x, currY, (currWidth+currX)-transf.x, currHeight, currFillColor, 
										currOpacity, highlightObjStack[highlightIdxHit.indexOf(hitIndex)]);
							} else {
								//cursor moving back to previous box, remove from stack
								while(highlightIdxHit[highlightIdxHit.length-1] != hitIndex){
									highlightIdxHit.pop();
									var elementRemove = highlightObjStack.pop(); 
									switch(type)
									{
									case markupTypes.TextRedactHighlight : 
										removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.foreignObj);
									case markupTypes.TextHighLight :
									case markupTypes.CollabHighlight :
										removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.SVGRectangle);									
										break;
									}
								}
								moveHighlightObject(transf.x, currY, (currWidth+currX)-transf.x, currHeight, currFillColor, 
										currOpacity, highlightObjStack[highlightIdxHit.indexOf(hitIndex)]);
							}
						}
					} 
					/**
					 * If anchor is being resized.
					 */
					else {
						if(!isAnchorLast)
						{
							while(highlightIdxHit.length > 0){
								highlightIdxHit.pop();
								var elementRemove = highlightObjStack.pop();
								switch(type)
								{
								case markupTypes.TextRedactHighlight : 
									removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.foreignObj);
								case markupTypes.TextHighLight :
								case markupTypes.CollabHighlight :
									removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.SVGRectangle);									
									break;
								}
							}
							isAnchorLast = true;							
						}
						//modify anchor
						var newDeltaX = transf.x;
						var newXR = initialShapeAttributes.x;
						var newWidth;
						if(transf.x <= initialShapeAttributes.x)
						{
							if(selectedHandleIndex !=0)
							{
								newWidth = (initialShapeAttributes.x-transf.x);
								newXR = transf.x;								
							}
							else
							{
								newWidth = initialShapeAttributes.width + (initialShapeAttributes.x-transf.x);
								newXR = transf.x;	
							}

						}
						else if(transf.x >= initialShapeAttributes.x)
						{

							if(selectedHandleIndex !=0)
							{
								newXR = initialShapeAttributes.x;
								newWidth = transf.x-initialShapeAttributes.x;
							}
							else
							{
								if(transf.x > (initialShapeAttributes.x+initialShapeAttributes.width))
								{
									newXR = initialShapeAttributes.x+initialShapeAttributes.width;
									newWidth = transf.x-(initialShapeAttributes.x+initialShapeAttributes.width);
								}
								else
								{
									newXR = transf.x;
									newWidth = (initialShapeAttributes.x-transf.x)+initialShapeAttributes.width;									
								}

							}
						}
						else
						{
							if(transf.x <= initialShapeAttributes.x+initialShapeAttributes.width)
							{
								newXR = transf.x;
								newWidth = initialShapeAttributes.width - (transf.x - initialShapeAttributes.x);
							}
							else
							{
								newXR = initialShapeAttributes.x + initialShapeAttributes.width;		
								newWidth = Math.abs(transf.x - (initialShapeAttributes.x + initialShapeAttributes.width));
							}
						}

						moveHighlightObject(newXR, currY, newWidth, currHeight, currFillColor, currOpacity,
								drawnObject);
						while(highlightIdxHit.length > 0){
							highlightIdxHit.pop();
							var elementRemove = highlightObjStack.pop();
							switch(type)
							{
							case markupTypes.TextRedactHighlight : 
								removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.foreignObj);
							case markupTypes.TextHighLight :
							case markupTypes.CollabHighlight :
								removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.SVGRectangle);									
								break;
							}
						}
					}
					var firstObj = anchorMarkup;
					var lastObj = highlightObjStack.length === 0 ? anchorMarkup : highlightObjStack[highlightObjStack.length-1];
					var temp;
					if(highlightIdxHit[highlightIdxHit.length-1]<anchorIndex)
					{
						temp = lastObj;
						lastObj = firstObj;
						firstObj = temp;
						temp = null;
					}
					
					/**
					 * Recalculate position of handles given new position and dimension of highlight lines
					 */
					
					var dimensions = calculatePosition(firstObj.shapes.retrieveShapeForCalculation(),rotatedDimension,pageAttributes.pageIndex);
					var dimensions2 = calculatePosition(lastObj.shapes.retrieveShapeForCalculation(),rotatedDimension,pageAttributes.pageIndex);
					var markupX = parseInt(dimensions.left-5);
					var markupY = parseInt(dimensions.top-5);
					var markupX2 = parseInt(dimensions2.left-5)+parseInt(dimensions2.width);
					var markupY2 = parseInt(dimensions2.top-5)+parseInt(dimensions2.height);

					var markupXValuePX = markupX + 'px';
					var markupYValuePX = markupY + 'px';
					var markupXValuePX2 = markupX2 + 'px';
					var markupYValuePX2 = markupY2 + 'px';
					
					annotationHandles[0].style.left = markupXValuePX;
					annotationHandles[0].style.top = markupYValuePX;
					annotationHandles[1].style.left = markupXValuePX2;
					annotationHandles[1].style.top = markupYValuePX2;
					
					originalMarkupObject.attributes = firstObj.attributes;
					originalMarkupObject.id = originalMarkupObject.attributes.id;
					originalMarkupObject.shapes = firstObj.shapes;
					
					if(e.clientY>=(viewerPortBottom-30)) {
						closestChild.scrollTop(closestChild.scrollTop()+30);
					} else if(e.clientY<=(viewerPortTop+30)) {
						closestChild.scrollTop(closestChild.scrollTop()-30);
					} else if(e.clientX>(viewerPortRight-30)) {
						closestChild.scrollLeft(closestChild.scrollLeft()+30);
					} else if(e.clientX<=(viewerPortLeft+30)) {
						closestChild.scrollLeft(closestChild.scrollLeft()-30);
					}
				}
			}
		};
		window.addEventListener('mousemove', resizeOnMove, false);
		var stopResize = function(e)
		{
			if(isReversed)
			{
				highlightObjStack.reverse();
			}
			firstHighlightedIndex = null;
			if(!isReversed)
			{
				highlightObjStack.splice(0,0,anchorMarkup);
			}
			else
			{
				highlightObjStack.push(anchorMarkup);				
			}
			
			if(highlightObjStack.length >1)
			{
				var firstElement = highlightObjStack[0].attributes.y;
				var lastElement = highlightObjStack[highlightObjStack.length-1].attributes.y;
				
				if(firstElement > lastElement)
				{
					highlightObjStack.reverse();
				}
			}

			if(isRedactionHighlight)
			{
				var xx = highlightObjStack.length;
				var redactHighlight = null;
				for(var o=0;o<xx;o++)
				{
					redactHighlight = highlightObjStack[o];
					redactHighlight.setFontColor('rgb(255, 255, 255)');
					redactHighlight.setFillColor('rgb(0, 0, 0)');
					redactHighlight.setOpacityDisplay(1);
					redactHighlight.setText(redactionReason);
					redactHighlight.visibilityMode = visibilityMode.Shown;
					attachDrawFinishFunction(redactHighlight);
					redactHighlight.rotateTextObject(rotateDeg);
				}
			}
			
			originalMarkupObject.attributes = highlightObjStack[0].attributes;
			originalMarkupObject.drawnObjectCollection = highlightObjStack;
			var len = highlightObjStack.length;
			var obj = null;
			for(var ctr=0;ctr<len;ctr++)
			{
				obj = highlightObjStack[ctr];
				if(obj.resetViewable === undefined)
				{
					attachDrawFinishFunction(highlightObjStack[ctr]);
				}
			}

			highlightIdxHit = [];
			highlightObjStack = [];
			window.removeEventListener('mousemove',resizeOnMove,false);
			window.removeEventListener('mouseup',stopResize,false);
			if(handTool.data('laststate') == true){
				handTool.data('drag','enable').addClass('selected-tool');
				viewerWrapper.dragScroll();
			}
			

			var len = annotationHandles.length;
			for(var i=0;i<len;i++)
			{
				annotationHandles[i].style.display="block";
			}
		};
		window.addEventListener('mouseup',stopResize,false);
	};
	createdDivForHandle.addEventListener('mousedown',startResize,false);
}

/**
*
* Function used to attach resizing logic for the selected annotation. 
* Determines how object is resized depending on the following factors:
* -Page orientation
* -Zoom factor
* -Which resize handle is selected
* @param markupSelected - Selected markup object (text highlight,redaction text highlight).
* @param createdDivForHandle - Resize handle selected
* @param udvPageInstance - udvPage instance where highlight is applied
* @param degreesRotated - Orientation of the page. Different calculations are used relative to how the page is rotated
* @param selectedHandleIndex - Used to determine which resize handle index is selected. This is used to determine what type of behavior when resizing is used.
* @param annotationHandles - Collection of all the resize handles currently applied on the annotation
*/
function applyResizeLogic(markupSelected,createdDivForHandle,udvPageInstance,degreesRotated,selectedHandleIndex,annotationHandles)
{
	var startResize = function(e)
	{
		e.stopPropagation();
		e.preventDefault();
		var viewerWrapper = $(getElement('viewer-document-wrapper')),
		handTool = $(getElement('page-handtool')),
		closestChild = $(getElement('viewer-document-wrapper')).closest('div#viewerContainer');
		handTool.data('drag','unable').removeClass('selected-tool');
		viewerWrapper.removeDragScroll();

		//create own implementation of initXYW
		var startX = e.clientX,
		startY = e.clientY,
		degrees = degreesRotated,
		pageAttributes = udvPageInstance.attributes,
		markupForResizing = markupSelected,
		initialShapeAttributes = initializeAttributes(markupForResizing),
		rotateDeg = pageAttributes.rotateDegrees,
		initX = initialShapeAttributes.x,
		initY = initialShapeAttributes.y,
		initWidth = initialShapeAttributes.width,
		initHeight = initialShapeAttributes.height,
		initScrollTop = closestChild.scrollTop(),
		initScrollLeft = closestChild.scrollLeft(),
		initCX,
		initCY,
		initRX,
		initRY,
		shapeForResizing,
		rotatedDimension = udvPageInstance.rotatedDimensions();

		var viewerPortTop = parseInt(closestChild.position().top),
		viewerPortLeft = parseInt(closestChild.position().left),
		viewerPortRight = parseInt(closestChild.outerWidth()),
		viewerPortBottom = parseInt(closestChild.outerHeight());
		viewerPortBottom += viewerPortTop;			

		if(markupSelected.markupType == markupTypes.Text || markupSelected.markupType == markupTypes.StickyNote)
		{
			transferTextAreaValuetoDiv(lastSelectedDivReason);
		}

		if(markupSelected.markupType == markupTypes.Circle)
		{
			initCX = parseFloat(markupSelected.shapes.SVGEllipse.cx.animVal.value);
			initCY = parseFloat(markupSelected.shapes.SVGEllipse.cy.animVal.value);
			initRX = parseFloat(markupSelected.shapes.SVGEllipse.rx.animVal.value);
			initRY = parseFloat(markupSelected.shapes.SVGEllipse.ry.animVal.value);
		}

		var resizeOnMove = function(e)
		{
			e.stopPropagation();
			e.preventDefault();

			var deltaX,
			deltaY,
			scrollTops = closestChild.scrollTop(),
			scrollLefts = closestChild.scrollLeft(),
			testHeight,
			testWidth,
			objX=0,
			objY=0,
			objWidth=0,
			objHeight=0,
			newCX=0,
			newRX=0,
			newCY=0,
			newRY=0,
			pageHeight = udvPageInstance.rotatedDimensions().height * scaleFactor,
			pageWidth = udvPageInstance.rotatedDimensions().width * scaleFactor;

			var transf = convertToSVGCoordinateSpace(udvPageInstance.svgPage,e.clientX,e.clientY);
			var checkX = parseInt(pageWidth - transf.x);
			var checkY = parseInt(pageHeight - transf.y);
			var newDX = e.clientX;
			var newDY = e.clientY;

			if(checkX<0)
			{
				newDX = newDX + checkX;
			}
			else if(transf.x<0)
			{
				newDX = newDX + (-1*transf.x);
			}

			if(checkY<0)
			{
				newDY = newDY + checkY;
			}
			else if(transf.y<0)
			{
				newDY = newDY + (-1*transf.y);
			}

			switch(rotateDeg)
			{
			case 270:
			case 90:
				deltaX = newDY-startY + (scrollTops-initScrollTop);
				deltaY = newDX-startX + (scrollLefts-initScrollLeft);
				break;
			case 180:
			default:
				deltaX = newDX-startX + (scrollLefts-initScrollLeft);
			deltaY = newDY-startY + (scrollTops-initScrollTop);
			break;
			}

			deltaX *= 1/scaleFactor;
			deltaY *= 1/scaleFactor;

			var transformed = markupForResizing.shapes.retrieveOriginCoordinates();
			var transformed2 =
			{
					x : parseInt(''+transformed.x),
					y : parseInt(''+transformed.y)
			};

			if(selectedHandleIndex>=0 && selectedHandleIndex<=2)
			{
				if(markupSelected.markupType == markupTypes.Circle)
				{
					if(rotateDeg==90)
						testHeight = initHeight+deltaY;
					else
						testHeight = initHeight-deltaY;

					if(rotateDeg == 180)
					{
						objY = -deltaY;
						objHeight = deltaY;
					}
					else if(rotateDeg == 90)
					{
						objY = -deltaY;
						objHeight = -deltaY;
					}
					else
					{
						objY = deltaY;
						objHeight = deltaY;
					}

					newCY = initCY + (objY/2);
					if(testHeight>0)
					{
						newRY = initRY - (objHeight/2);
					}
					else
					{
						newRY = (objHeight/2) - initRY;
					}
				}
				else
				{
					if(rotateDeg==90)
						testHeight = initHeight+deltaY;
					else
						testHeight = initHeight-deltaY;

					if(testHeight>0)
					{
						if(rotateDeg == 180)
						{
							objY = 0;
							objHeight = (deltaY);
						}
						else if(rotateDeg == 90)
						{
							objY = -deltaY;
							objHeight = -deltaY;
						}
						else
						{
							objY = deltaY;
							objHeight = deltaY;
						}
					}
					else
					{
						if(rotateDeg == 180)
						{
							objY = (testHeight);
						}
						else
						{
							objY = initHeight;
						}
						objHeight = (testHeight+initHeight);
					}
				}
			}

			// sw,s,se resize Y
			if(selectedHandleIndex>=4 && selectedHandleIndex<=6)
			{
				if(markupSelected.markupType == markupTypes.Circle)
				{

					if(rotateDeg==90)
						testHeight = initHeight-deltaY;
					else
						testHeight = initHeight+deltaY;

					if(rotateDeg == 180)
					{
						objY = -deltaY;
						objHeight = -deltaY;
					}
					else if(rotateDeg == 90)
					{
						objY = -deltaY;
						objHeight = deltaY;
					}
					else
					{
						objY = deltaY;
						objHeight = -deltaY;
					}

					newCY = initCY + (objY/2);

					if(testHeight>0)
					{
						newRY = initRY - (objHeight/2);
					}
					else
					{
						newRY = (objHeight/2) - initRY;
					}
				}
				else
				{
					if(rotateDeg==90)
						testHeight = initHeight-deltaY;
					else
						testHeight = initHeight+deltaY;

					if(testHeight>0)
					{
						if(rotateDeg == 180)
						{
							objY = -deltaY;
							objHeight = -deltaY;
						}
						else if(rotateDeg == 90)
						{
							objY = 0;
							objHeight = deltaY;
						}
						else
						{
							objY = 0;
							objHeight = -deltaY;
						}
					}
					else
					{
						if(rotateDeg == 180)
						{
							objY = initHeight;
						}
						else if(rotateDeg == 90)
						{
							objY = testHeight;
						}
						else
						{
							objY = testHeight;
						}
						objHeight = (testHeight+initHeight);
					}
				}

			}

			// nw,w,sw reize X
			if(selectedHandleIndex==0 || selectedHandleIndex==7 || selectedHandleIndex==6)
			{
				if(markupSelected.markupType == markupTypes.Circle)
				{
					if(rotateDeg==270)
						testWidth = initWidth+deltaX;
					else
						testWidth = initWidth-deltaX;

					if(rotateDeg == 180)
					{
						objX = -deltaX;
						objWidth = deltaX;
					}
					else if(rotateDeg == 270)
					{
						objX = -deltaX;
						objWidth = -deltaX;
					}
					else
					{
						objX = deltaX;
						objWidth = deltaX;
					}

					newCX = initCX + (objX/2);

					if(testWidth>0)
					{
						newRX = initRX - (objWidth/2);
					}
					else
					{
						newRX = (objWidth/2) - initRX;
					}
				}
				else
				{
					if(rotateDeg==270)
						testWidth = initWidth+deltaX;
					else
						testWidth = initWidth-deltaX;
					if(testWidth>0)
					{
						if(rotateDeg == 180)
						{
							objX = 0;
							objWidth = (deltaX);
						}
						else if(rotateDeg == 270)
						{
							objX = -deltaX;
							objWidth = -deltaX;
						}
						else
						{
							objX = deltaX;
							objWidth = deltaX;
						}
					}
					else
					{
						if(rotateDeg == 180)
						{
							objX = (testWidth);
						}
						else
						{
							objX = initWidth;
						}
						objWidth = initWidth+testWidth;
					}
				}
			}

			// ne,e,se resize X
			if(selectedHandleIndex>=2 && selectedHandleIndex<=4)
			{

				if(markupSelected.markupType == markupTypes.Circle)
				{
					if(rotateDeg==270)
						testWidth = initWidth-deltaX;
					else
						testWidth = initWidth+deltaX;

					if(rotateDeg == 180)
					{
						objX = -deltaX;
						objWidth = -deltaX;
					}
					else if(rotateDeg == 270)
					{
						objX = -deltaX;
						objWidth = deltaX;
					}
					else
					{
						objX = deltaX;
						objWidth = -deltaX;
					}

					newCX = initCX + (objX/2);

					if(testWidth>0)
					{
						newRX = initRX - (objWidth/2);
					}
					else
					{

						newRX = (objWidth/2)-(initRX);
					}
				}
				else
				{
					if(rotateDeg==270)
						testWidth = initWidth-deltaX;
					else
						testWidth = initWidth+deltaX;
					if(testWidth>0)
					{
						if(rotateDeg == 180)
						{
							objX = -deltaX;
							objWidth = -deltaX;
						}
						else if(rotateDeg == 270)
						{
							objX = 0;
							objWidth = (deltaX);
						}
						else
						{
							objX = 0;
							objWidth = (-deltaX);
						}
					}
					else
					{
						if(rotateDeg == 180)
						{
							objX = initWidth;
						}
						else
						{
							objX = testWidth;

						}
						objWidth = (testWidth+initWidth);
					}
				}
			}

			if(markupSelected.markupType!=markupTypes.Circle)
			{
				transformed.x+=parseInt(initX)+objX;
				transformed.y+=parseInt(initY)+objY;
				transformed.xWidth=transformed.x + (parseInt(initWidth)-objWidth);
				transformed.yHeight=parseInt(transformed.y + (parseInt(initHeight)-objHeight));
			}
			else
			{
				transformed.x+=newCX-newRX;
				transformed.y+=newCY-newRY;
				transformed.xWidth=parseInt(transformed.x + (newRX*2));
				transformed.yHeight=parseInt(transformed.y + (newRY*2));
			}

			if(selectedHandleIndex==1 || selectedHandleIndex==5 || selectedHandleIndex%2==0)
			{
				var newSVGHeight,newSVGY;
				if(markupSelected.markupType!=markupTypes.Circle)
				{
					newSVGY = parseInt(initY)+objY;
					newSVGHeight = parseInt(initHeight)-objHeight;
				}
				else
				{
					newSVGY = newCY;
					newSVGHeight = newRY;
				}

				switch(markupSelected.markupType)
				{
				case markupTypes.StickyNote :
				case markupTypes.Text :
				case markupTypes.RectangleRedaction :
				case markupTypes.TextHighLight :
					markupSelected.setY(newSVGY);
					markupSelected.setHeight(newSVGHeight);
				case markupTypes.Rectangle :
				case markupTypes.Image :	
					markupSelected.setY(newSVGY);
					markupSelected.setHeight(newSVGHeight);
					shapeForResizing = markupSelected.shapes.retrieveShapeForCalculation();
					break;
				case markupTypes.Circle :
					markupSelected.setCY(newSVGY);
					markupSelected.setRY(newSVGHeight);
					shapeForResizing = markupSelected.shapes.retrieveShapeForCalculation();
				}
			}

			if(selectedHandleIndex==3 || selectedHandleIndex==7 || selectedHandleIndex%2==0)
			{
				var newSVGWidth,newSVGX;

				if(markupSelected.markupType!=markupTypes.Circle)
				{
					newSVGX = parseInt(initX)+objX;
					newSVGWidth = parseInt(initWidth)-objWidth;
				}
				else
				{
					newSVGX = newCX;
					newSVGWidth = newRX;
				}



				switch(markupSelected.markupType)
				{
				case markupTypes.StickyNote :
				case markupTypes.Text :
				case markupTypes.RectangleRedaction :
				case markupTypes.TextHighLight :
					markupSelected.setX(newSVGX);
					markupSelected.setWidth(newSVGWidth);
				case markupTypes.Rectangle :
				case markupTypes.Image :	
					markupSelected.attributes.x = newSVGX + transformed.x;
					markupSelected.attributes.width = newSVGWidth;
					markupSelected.setX(newSVGX);
					markupSelected.setWidth(newSVGWidth);
					shapeForResizing = markupSelected.shapes.retrieveShapeForCalculation();
					break;
				case markupTypes.Circle :
					markupSelected.setCX(newSVGX);
					markupSelected.setRX(newSVGWidth);
					shapeForResizing = markupSelected.shapes.retrieveShapeForCalculation();
					break;
				}

			}

			/*
			 * if(markupSelected.markupType ===
			 * markupTypes.RectangleRedaction) {
			 * clearChildren(markupSelected.shapes.SVGText);
			 * processWrapping(markupSelected.SVGText,markupSelected.reason,15,markupSelected.attributes.width,markupSelected.id,newSVGWidth/2); }
			 * else if(markupSelected.markupType ===
			 * markupTypes.Text) { if(isIE) {
			 * wrapTextOnSizeChange();
			 * setVerticalAlignOnChange(markupSelected.shapes.SVGText); } }
			 */

			markupSelected.rotateTextObject(udvPageInstance.attributes.rotateDegrees);
			var dimensiones = calculatePosition(shapeForResizing,rotatedDimension,pageAttributes.pageIndex);
			var markupX = parseInt(dimensiones.left-5);
			var markupY = parseInt(dimensiones.top-5);
			var markupWidth = parseInt(dimensiones.width);
			var markupHeight = parseInt(dimensiones.height);
			var bagongWidth,bagongHeight;
			bagongHeight = markupHeight-1;
			bagongWidth = markupWidth-1;

			var markupXValuePX = markupX + 'px';
			var markupXWidthValuePX = (markupX + bagongWidth) + 'px';
			var markupXMiddleValuePX = (markupX + bagongWidth/2) + 'px';

			var markupYValuePX = markupY + 'px';
			var markupYHeightValuePX = (markupY + bagongHeight) + 'px';
			var markupYMiddleValuePX = (markupY + bagongHeight/2) + 'px';

			annotationHandles[0].style.left = (markupX+5) + 'px';
			annotationHandles[0].style.top = (markupY+5) + 'px';
			annotationHandles[0].style.width = bagongWidth + 'px';
			annotationHandles[0].style.height = bagongHeight + 'px';
			if(markupSelected.markupType != markupTypes.TextHighLight) {
				annotationHandles[1].style.left = markupXValuePX;
				annotationHandles[7].style.left = markupXValuePX;
				annotationHandles[8].style.left = markupXValuePX;

				annotationHandles[2].style.left = markupXMiddleValuePX;
				annotationHandles[6].style.left = markupXMiddleValuePX;

				annotationHandles[3].style.left = markupXWidthValuePX;
				annotationHandles[4].style.left = markupXWidthValuePX;
				annotationHandles[5].style.left = markupXWidthValuePX;

				annotationHandles[1].style.top = markupYValuePX;
				annotationHandles[2].style.top = markupYValuePX;
				annotationHandles[3].style.top = markupYValuePX;

				annotationHandles[4].style.top = markupYMiddleValuePX;
				annotationHandles[8].style.top = markupYMiddleValuePX;

				annotationHandles[5].style.top = markupYHeightValuePX;
				annotationHandles[6].style.top = markupYHeightValuePX;
				annotationHandles[7].style.top = markupYHeightValuePX;	
			} else {
				annotationHandles[1].style.left = markupXValuePX;
				annotationHandles[1].style.top = markupYValuePX;
				annotationHandles[2].style.left = markupXWidthValuePX;
				annotationHandles[2].style.top = markupYHeightValuePX;
			}

			if(markupSelected.markupType == markupTypes.Text || markupSelected.markupType == markupTypes.StickyNote ) {
				if(dimensiones.height <= 50 || dimensiones.width <= 50) {
					annotationHandles[9].style.top = (markupY + bagongHeight + 10) + 'px';
					annotationHandles[9].style.left = (markupX-8) + (bagongWidth/2) + 'px';
				} else {
					annotationHandles[9].style.top = (markupY-10) + (bagongHeight/2) + 'px';
					annotationHandles[9].style.left = (markupX-8) + (bagongWidth/2) + 'px';
				}
			}

			if(e.clientY>=(viewerPortBottom-30))
			{
				closestChild.scrollTop(closestChild.scrollTop()+30);
			}					
			else if(e.clientY<=(viewerPortTop+30))
			{
				closestChild.scrollTop(closestChild.scrollTop()-30);
			}
			else if(e.clientX>(viewerPortRight-30))
			{
				closestChild.scrollLeft(closestChild.scrollLeft()+30);
			}
			else if(e.clientX<=(viewerPortLeft+30))
			{
				closestChild.scrollLeft(closestChild.scrollLeft()-30);
			}

		};
		window.addEventListener('mousemove', resizeOnMove, false);
		var stopResize = function(e)
		{
			window.removeEventListener('mousemove',resizeOnMove,false);
			window.removeEventListener('mouseup',stopResize,false);
			if(handTool.data('laststate') == true){
				handTool.data('drag','enable').addClass('selected-tool');
				viewerWrapper.dragScroll();
			}
		};
		window.addEventListener('mouseup',stopResize,false);
	};
	createdDivForHandle.addEventListener('mousedown',startResize,false);
}

/**
 * Applies the resize handles and outline of an object. 
 * 
 * @param markupSelected - Selected markup object to have resize handles applied
 * @param parentHandles - Parent <div> where resize handles will be appended onto the page
 * @param x - x position of the annotation (document based, not svg coordinates)
 * @param y - y position of the annotation (document based, not svg coordinates)
 * @param height - height of the annotation (document based, not svg coordinates)
 * @param width - width of the annotation (document based, not svg coordinates)
 * @param udvPageInstance - udvPage instance of the selected object to retrieve height,width,rotated degrees of the page
 * @returns {HandleGroup} - Returns HandleGroup instance containing the parent of resize handles and a collection of all resize handles applied for object
 */
function resizeHandles(markupSelected,parentHandles,x,y,height,width,udvPageInstance)
{
	var rotateDeg = udvPageInstance.attributes.rotateDegrees,
	annotationHandles = [],
	trueHeight,
	trueWidth,
	p = document.createElement('div'),
	styleHandle = p.style,
	defaultUnit = 'px',
	defaultValue = '0'+defaultUnit,
	markupIdSelected = markupSelected.id,
	transformed =
	{
		x : x,
		y : y
	};
	x-=5;
	y-=5;

	trueHeight = parseInt(height)-1;
	trueWidth = parseInt(width)-1;

	styleHandle.width = defaultValue;
	styleHandle.height = defaultValue;
	styleHandle.left = defaultValue;
	styleHandle.top = defaultValue;
	styleHandle.zIndex = '1';
	styleHandle.cursor = 'move';
	styleHandle.display = 'block';

	parentHandles.appendChild(p);

	var outline = document.createElement('div');
	outline.style.position='absolute';
	outline.style.top = (y+5)+defaultUnit;
	outline.style.left = (x+5) +defaultUnit;
	outline.style.width=(trueWidth)+defaultUnit;
	outline.style.height=(trueHeight)+defaultUnit;
	outline.style.border='1px solid gray';
	outline.style.display='block';
	outline.style.pointerEvents = 'none';
	outline.setAttributeNS(null, 'data-isi','outlineHandle-'+markupIdSelected);
	p.appendChild(outline);
	annotationHandles.push(outline);
	
	
	if(markupSelected.markupType != markupTypes.Stamp){
		for(var i=1;i<9;i+=1)
		{
			var createdDivForHandle = document.createElement('div');
			createdDivForHandle.style.position='absolute';
			createdDivForHandle.style.width='12px';
			createdDivForHandle.style.height='12px';
			createdDivForHandle.style.display='block';
			createdDivForHandle.style.zIndex='1';
			createdDivForHandle.setAttributeNS(null, 'data-isi','handle-'+i);
			var backgroundPath = 'transparent url(images/handles.png)';
	
			switch(i)
			{
			case 1:
				createdDivForHandle.style.left=x+defaultUnit;
				createdDivForHandle.style.top=y+defaultUnit;
				createdDivForHandle.style.cursor='nw-resize';
				createdDivForHandle.style.background=backgroundPath+' 0px 0px ';
				if(rotateDeg==90)
					selectedHandleIndex = 6;
				else if(rotateDeg==270)
					selectedHandleIndex = 2;
				else
					selectedHandleIndex = 0;
				break;
			case 2:
				createdDivForHandle.style.left=(x+(trueWidth/2))+defaultUnit;
				createdDivForHandle.style.top=y+defaultUnit;
				createdDivForHandle.style.cursor='n-resize';
				createdDivForHandle.style.background=backgroundPath+' -60px 0px ';
				if(rotateDeg==90)
					selectedHandleIndex = 7;
				else if(rotateDeg==270)
					selectedHandleIndex = 3;
				else
					selectedHandleIndex = 1;
				break;
			case 3:
				createdDivForHandle.style.left=(x+trueWidth)+defaultUnit;
				createdDivForHandle.style.top=y+defaultUnit;
				createdDivForHandle.style.cursor='ne-resize';
				createdDivForHandle.style.background=backgroundPath+' -12px 0px ';
				if(rotateDeg==90)
					selectedHandleIndex = 0;
				else if(rotateDeg==270)
					selectedHandleIndex = 4;
				else
					selectedHandleIndex = 2;
				break;
			case 4:
				createdDivForHandle.style.left=(x+trueWidth)+defaultUnit;
				createdDivForHandle.style.top=(y+(trueHeight/2))+defaultUnit;
				createdDivForHandle.style.cursor='e-resize';
				createdDivForHandle.style.background=backgroundPath+' -60px 0px ';
				if(rotateDeg==90)
					selectedHandleIndex = 1;
				else if(rotateDeg==270)
					selectedHandleIndex = 5;
				else
					selectedHandleIndex = 3;
				break;
			case 5:
				createdDivForHandle.style.left=(x+trueWidth)+defaultUnit;
				createdDivForHandle.style.top=(y+trueHeight)+defaultUnit;
				createdDivForHandle.style.cursor='se-resize';
				createdDivForHandle.style.background=backgroundPath+' -36px 0px ';
				if(rotateDeg==90)
					selectedHandleIndex = 2;
				else if(rotateDeg==270)
					selectedHandleIndex = 6;
				else
					selectedHandleIndex = 4;
				break;
			case 6:
				createdDivForHandle.style.left=(x+(trueWidth/2))+defaultUnit;
				createdDivForHandle.style.top=(y+trueHeight)+defaultUnit;
				createdDivForHandle.style.cursor='s-resize';
				createdDivForHandle.style.background=backgroundPath+' -60px 0px ';
				if(rotateDeg==90)
					selectedHandleIndex = 3;
				else if(rotateDeg==270)
					selectedHandleIndex = 7;
				else
					selectedHandleIndex = 5;
				break;
			case 7:
				createdDivForHandle.style.left=x+defaultUnit;
				createdDivForHandle.style.top=(y+trueHeight)+defaultUnit;
				createdDivForHandle.style.cursor='sw-resize';
				createdDivForHandle.style.background=backgroundPath+' -24px 0px ';
				if(rotateDeg==90)
					selectedHandleIndex = 4;
				else if(rotateDeg==270)
					selectedHandleIndex = 0;
				else
					selectedHandleIndex = 6;
				break;
			case 8:
				createdDivForHandle.style.left=x+defaultUnit;
				createdDivForHandle.style.top=(y+(trueHeight/2))+defaultUnit;
				createdDivForHandle.style.cursor='w-resize';
				createdDivForHandle.style.background=backgroundPath+' -60px 0px ';
				if(rotateDeg==90)
					selectedHandleIndex = 5;
				else if(rotateDeg==270)
					selectedHandleIndex = 1;
				else
					selectedHandleIndex = 7;
				break;
			}
			applyResizeLogic(markupSelected,createdDivForHandle,udvPageInstance,rotateDeg,selectedHandleIndex,annotationHandles);
			createdDivForHandle.style.left+=5;
			createdDivForHandle.style.top+=5;
			p.appendChild(createdDivForHandle);
			annotationHandles.push(createdDivForHandle);
		}
	}

	if(markupSelected.markupType == markupTypes.Text || markupSelected.markupType == markupTypes.StickyNote) {
		var editButton = document.createElement('div');
		editButton.style.position='absolute';
		editButton.style.cursor='pointer';
		if(trueWidth <= 50 || trueHeight <= 50) {
			editButton.style.top = (y + trueHeight + 10) + defaultUnit;
			editButton.style.left = (x-8) + (trueWidth/2) + defaultUnit;
		} else {
			editButton.style.top = ((y-10)+(trueHeight/2))+defaultUnit;
			editButton.style.left = ((x-8)+(trueWidth/2)) +defaultUnit;
		}
		editButton.style.backgroundColor = 'transparent';
		editButton.style.backgroundImage = 'url(images/under-redact/EditTextMark.png)';
		editButton.style.backgroundSize = 'cover';
		editButton.style.width=editButtonWidth+defaultUnit;
		editButton.style.height=editButtonHeight+defaultUnit;
		editButton.setAttributeNS(null, 'data-isi','editHandle-'+markupIdSelected);
		editButton.onclick = function(){
			// editButton.style.display = 'none';
			var dimension = calculateLeftAndTop(markupSelected.shapes.retrieveShapeForCalculation());
			if(isIE) {
				transferDivValuetoTextArea(markupSelected.shapes.divText, dimension.top, dimension.left, dimension.height, dimension.width, markupSelected);
				lastSelectedDivReason = markupSelected.shapes.divText;
			} else {
				transferDivValuetoTextArea(markupSelected.shapes.para, dimension.top, dimension.left, dimension.height, dimension.width, markupSelected);
				lastSelectedDivReason = markupSelected.shapes.para;
			}
		};
		editButton.onmousedown = function(){
			transferTextAreaValuetoDiv(lastSelectedDivReason);
		};
		p.appendChild(editButton);
		annotationHandles.push(editButton);
	}

	var handleGroup = new HandleGroup(p,annotationHandles);
	return handleGroup;
}

/**
*
* Function used to attach resizing logic for the selected annotation. 
* Determines how object is resized depending on the following factors:
* -Page orientation
* -Zoom factor
* -Which resize handle is selected
* @param markupSelected - Selected markup object (text highlight,redaction text highlight).
* @param createdDivForHandle - Resize handle selected
* @param udvPageInstance - udvPage instance where highlight is applied
* @param degreesRotated - Orientation of the page. Different calculations are used relative to how the page is rotated
* @param selectedHandleIndex - Used to determine which resize handle index is selected. This is used to determine what type of behavior when resizing is used.
* @param annotationHandles - Collection of all the resize handles currently applied on the annotation
*/
function applyResizeLogicArrow(markupSelected,createdDivForHandle,udvPageInstance,degreesRotated,selectedHandleIndex,annotationHandles)
{
	var startResize = function(e)
	{
		e.stopPropagation();
		e.preventDefault();
		var viewerWrapper = $(getElement('viewer-document-wrapper')),
		handTool = $(getElement('page-handtool'));
		closestChild = $(getElement('viewer-document-wrapper')).closest('div#viewerContainer');
		handTool.data("drag", "unable").removeClass('selected-tool');
		viewerWrapper.removeDragScroll();

		var startX = e.clientX,
		startY = e.clientY,
		degrees = degreesRotated,
		pageAttributes = udvPageInstance.attributes,
		markupForResizing = markupSelected.shapes.retrieveShapeForCalculation(),
		rotateDeg = pageAttributes.rotateDegrees,
		initX = parseFloat(markupForResizing.x1.animVal.value),
		initY = parseFloat(markupForResizing.y1.animVal.value),
		initX2 = parseFloat(markupForResizing.x2.animVal.value),
		initY2 = parseFloat(markupForResizing.y2.animVal.value),
		shapeForResizing = markupSelected.shapes.retrieveShapeForCalculation(),
		rotatedDimension = udvPageInstance.rotatedDimensions(),
		pageHeight = pageAttributes.pageHeight,
		pageWidth = pageAttributes.pageWidth,
		initScrollTop = closestChild.scrollTop(),
		initScrollLeft = closestChild.scrollLeft(),
		isWithin = true,
		X1 = 0,
		Y1 = 0,
		X2 = 0,
		Y2 = 0;

		var viewerPortTop = parseInt(closestChild.position().top),
		viewerPortLeft = parseInt(closestChild.position().left),
		viewerPortRight = parseInt(closestChild.outerWidth()),
		viewerPortBottom = parseInt(closestChild.outerHeight());
		viewerPortBottom += viewerPortTop;

		var resizeOnMove = function(e)
		{
			e.stopPropagation();
			e.preventDefault();

			var deltaX,
			deltaY,
			scrollTops = closestChild.scrollTop(),
			scrollLefts = closestChild.scrollLeft(),
			transformed = {
				x : 0,
				y: 0
			},
			transformed2 = {
				x : 0,
				y: 0
			}; // offset for dragging

			var transf = convertToSVGCoordinateSpace(udvPageInstance.svgPage,e.clientX,e.clientY);
			transfPageHeight = udvPageInstance.rotatedDimensions().height * scaleFactor;
			transPageWidth = udvPageInstance.rotatedDimensions().width * scaleFactor;
			var checkX = parseInt(transPageWidth - transf.x);
			var checkY = parseInt(transfPageHeight - transf.y);
			var newDX = e.clientX;
			var newDY = e.clientY;

			if(checkX<0)
			{
				newDX = newDX + checkX;
			}
			else if(transf.x<0)
			{
				newDX = newDX + (-1*transf.x);
			}

			if(checkY<0)
			{
				newDY = newDY + checkY;
			}
			else if(transf.y<0)
			{
				newDY = newDY + (-1*transf.y);
			}

			switch(rotateDeg)
			{
			case 270:
				deltaX = -1*(newDY-startY) + (initScrollTop-scrollTops);
				deltaY = newDX-startX + (scrollLefts-initScrollLeft);
				break;
			case 90:
				deltaX = newDY-startY + (scrollTops-initScrollTop);
				deltaY = -1*(newDX-startX) + (initScrollLeft-scrollLefts);
				break;
			case 180:
				deltaX = -1*(newDX-startX) + (initScrollLeft-scrollLefts);
				deltaY = -1*(newDY-startY) + (initScrollTop-scrollTops);
				break;
			default:
				deltaX = newDX-startX + (scrollLefts-initScrollLeft);
			deltaY = newDY-startY + (scrollTops-initScrollTop);
			break;
			}

			deltaX *= 1/scaleFactor;
			deltaY *= 1/scaleFactor;					

			var matrixTransformed = markupSelected.shapes.retrieveOriginCoordinates();
			transformed.x = initX+matrixTransformed.x+deltaX;
			transformed.y = initY+matrixTransformed.y+deltaY;
			transformed2.x = initX2+matrixTransformed.x+deltaX;
			transformed2.y = initY2+matrixTransformed.y+deltaY;

			if(transformed.x >=0 && transformed.x <=pageWidth)
			{
				X1 = initX+deltaX;
			}
			else if(transformed.x<0)
			{
				X1 = 0 - matrixTransformed.x;
			}
			else if(transformed.x > pageWidth)
			{
				X1 = pageWidth - matrixTransformed.x;
			}

			if(transformed.y >=0 && transformed.y <=pageHeight)
			{
				Y1 = initY+deltaY;
			}
			else if(transformed.y<0)
			{
				Y1 = 0 - matrixTransformed.y;
			}
			else if(transformed.y > pageHeight)
			{
				Y1 = pageHeight - matrixTransformed.y;
			}

			if(transformed2.x >=0 && transformed2.x <=pageWidth)
			{
				X2 = initX2+deltaX;
			}
			else if(transformed2.x<0)
			{
				X2 = 0 - matrixTransformed.x;
			}
			else if(transformed2.x > pageWidth)
			{
				X2 = pageWidth - matrixTransformed.x;
			}

			if(transformed2.y >=0 && transformed2.y <=pageHeight)
			{
				Y2 = initY2+deltaY;
			}
			else if(transformed2.y<0)
			{
				Y2 = 0 - matrixTransformed.y;
			}
			else if(transformed2.y > pageHeight)
			{
				Y2 = pageHeight - matrixTransformed.y;
			}

			if(selectedHandleIndex==0)
			{
				markupSelected.setX1(X1);
				markupSelected.setY1(Y1);
			}

			if(selectedHandleIndex==1)
			{
				markupSelected.setX2(X2);
				markupSelected.setY2(Y2);
				if(markupSelected.markupType == markupTypes.Arrow) {
					markupSelected.setCircMaskCX(X2);
					markupSelected.setCircMaskCY(Y2);
				}
			}

			var linePoints = computeLineCoordinates(shapeForResizing,udvPageInstance.svgPage,rotatedDimension,pageAttributes.pageIndex);
			annotationHandles[0].style.left = (linePoints.pt1.x-5) + 'px';
			annotationHandles[0].style.top = (linePoints.pt1.y-5) + 'px';
			annotationHandles[1].style.left = (linePoints.pt2.x-5) + 'px';
			annotationHandles[1].style.top = (linePoints.pt2.y-5) + 'px';

			if(e.clientY>=(viewerPortBottom-30))
			{
				closestChild.scrollTop(closestChild.scrollTop()+30);
			}					
			else if(e.clientY<=(viewerPortTop+30))
			{
				closestChild.scrollTop(closestChild.scrollTop()-30);
			}
			else if(e.clientX>(viewerPortRight-30))
			{
				closestChild.scrollLeft(closestChild.scrollLeft()+30);
			}
			else if(e.clientX<=(viewerPortLeft+30))
			{
				closestChild.scrollLeft(closestChild.scrollLeft()-30);
			}
		};

		var stopResize = function(e)
		{
			window.removeEventListener('mousemove',resizeOnMove,false);
			window.removeEventListener('mouseup',stopResize,false);
			if(handTool.data('laststate') == true){
				handTool.data('drag','enable').addClass('selected-tool');
				viewerWrapper.dragScroll();
			}
		};
		window.addEventListener('mousemove', resizeOnMove, false);
		window.addEventListener('mouseup',stopResize,false);
	};
	createdDivForHandle.addEventListener('mousedown',startResize,false);
}

/**
*
* Function used to attach resizing logic for the selected annotation. 
* Determines how object is resized depending on the following factors:
* -Page orientation
* -Zoom factor
* -Which resize handle is selected
* @param markupSelected - Selected markup object (text highlight,redaction text highlight).
* @param createdDivForHandle - Resize handle selected
* @param udvPageInstance - udvPage instance where highlight is applied
* @param degreesRotated - Orientation of the page. Different calculations are used relative to how the page is rotated
* @param selectedHandleIndex - Used to determine which resize handle index is selected. This is used to determine what type of behavior when resizing is used.
* @param annotationHandles - Collection of all the resize handles currently applied on the annotation
*/
function applyResizeLogicStrike(markupSelected,markupAnchor,createdDivForHandle,udvPageInstance,degreesRotated,selectedHandleIndex,annotationHandles,originalMarkupObject)
{
	var startResize = function(e)
	{
		e.stopPropagation();
		e.preventDefault();
		var viewerWrapper = $(getElement('viewer-document-wrapper')),
		handTool = $(getElement('page-handtool'));
		closestChild = $(getElement('viewer-document-wrapper')).closest('div#viewerContainer');
		handTool.data("drag", "unable").removeClass('selected-tool');
		viewerWrapper.removeDragScroll();
		
		//handling for continuous resizing pair with stopResize setting of drawnObjColl
		var strikeIdxStack = [],
		strikeObjStack = originalMarkupObject.drawnObjectCollection != undefined ? originalMarkupObject.drawnObjectCollection : [];
		
		if (selectedHandleIndex == 0 && strikeObjStack.length > 0) {
			markupSelected = strikeObjStack[0];
			markupAnchor = strikeObjStack[strikeObjStack.length-1];
		} else if (selectedHandleIndex == 1 && strikeObjStack.length > 0) {
			markupSelected = strikeObjStack[strikeObjStack.length-1];
			markupAnchor = strikeObjStack[0];
		}

		var startX = e.clientX,
		startY = e.clientY,
		degrees = degreesRotated,
		pageAttributes = udvPageInstance.attributes,
		markupForResizing = markupSelected.shapes.retrieveShapeForCalculation(),
		markupAnchorForResizing = markupAnchor.shapes.retrieveShapeForCalculation(),
		rotateDeg = pageAttributes.rotateDegrees,
		initX = parseFloat(markupForResizing.x1.animVal.value),
		initY = parseFloat(markupForResizing.y1.animVal.value),
		initX2 = parseFloat(markupForResizing.x2.animVal.value),
		initY2 = parseFloat(markupForResizing.y2.animVal.value),
		initAnchorX = parseFloat(markupAnchorForResizing.x1.animVal.value),
		initAnchorX2 = parseFloat(markupAnchorForResizing.x2.animVal.value),
		rotatedDimension = udvPageInstance.rotatedDimensions(),
		pageHeight = pageAttributes.pageHeight,
		pageWidth = pageAttributes.pageWidth,
		initScrollTop = closestChild.scrollTop(),
		initScrollLeft = closestChild.scrollLeft(),
		isWithin = true,
		X1 = 0,
		Y1 = 0,
		X2 = 0,
		Y2 = 0;

		var viewerPortTop = parseInt(closestChild.position().top),
		viewerPortLeft = parseInt(closestChild.position().left),
		viewerPortRight = parseInt(closestChild.outerWidth()),
		viewerPortBottom = parseInt(closestChild.outerHeight());
		viewerPortBottom += viewerPortTop;
		
		//initialize stack elements
		var pageTextElements = udvPageInstance.textElements,
		markupTypeResize = markupSelected.attributes.type,
		markupIdResize = markupSelected.id,
		markupGroupResize = markupSelected.shapes.group,
		selectedIdx = null, // lastHighlightIdx
		anchorIdx = null; // firstSelectedIdx
		
		//init indexes
		selectedIdx = checkBoundingBoxOverlap(markupSelected.attributes.x1, markupSelected.attributes.y1, pageTextElements).pop();
		anchorIdx = markupSelected!=markupAnchor ? checkBoundingBoxOverlap(markupAnchor.attributes.x1, markupAnchor.attributes.y1, pageTextElements).pop() : selectedIdx;
		
		//init stack, do not include anchor index for use later in shifting
		var lastIndexInStack = anchorIdx;
		if (selectedIdx > anchorIdx) { //selected handle is bottom object
			lastIndexInStack++;
			while (selectedIdx >= lastIndexInStack) {
				strikeIdxStack.push(lastIndexInStack);
				lastIndexInStack++;
			}
		} else if (selectedIdx < anchorIdx) { //selected handle is top object
			lastIndexInStack--;
			while (selectedIdx <= lastIndexInStack) {
				strikeIdxStack.push(lastIndexInStack);
				lastIndexInStack--;
			}
			strikeObjStack.reverse();
		}
		strikeObjStack.splice(0,1); //remove anchor object in object stack, for use in shifting strikeout
		lastIndexInStack = strikeIdxStack.length > 0 ? strikeIdxStack[strikeIdxStack.length-1] : anchorIdx;
		
		//hide selection handle display
		var len = annotationHandles.length;
		for(var i=0;i<len;i++)
		{
			annotationHandles[i].style.display="none";
		}

		var resizeOnMove = function(e)
		{
			e.stopPropagation();
			e.preventDefault();

			var deltaX,
			deltaY,
			scrollTops = closestChild.scrollTop(),
			scrollLefts = closestChild.scrollLeft(),
			transformed = {
				x : 0,
				y: 0
			},
			transformed2 = {
				x : 0,
				y: 0
			}; // offset for dragging

			var transf = convertToSVGCoordinateSpace(udvPageInstance.svgPage,e.clientX,e.clientY);
			transfPageHeight = udvPageInstance.rotatedDimensions().height * scaleFactor;
			transPageWidth = udvPageInstance.rotatedDimensions().width * scaleFactor;
			var checkX = parseInt(transPageWidth - transf.x);
			var checkY = parseInt(transfPageHeight - transf.y);
			var newDX = e.clientX;
			var newDY = e.clientY;

			if(checkX<0)
			{
				newDX = newDX + checkX;
			}
			else if(transf.x<0)
			{
				newDX = newDX + (-1*transf.x);
			}

			if(checkY<0)
			{
				newDY = newDY + checkY;
			}
			else if(transf.y<0)
			{
				newDY = newDY + (-1*transf.y);
			}

			switch(rotateDeg)
			{
			case 270:
				deltaX = -1*(newDY-startY) + (initScrollTop-scrollTops);
				deltaY = newDX-startX + (scrollLefts-initScrollLeft);
				break;
			case 90:
				deltaX = newDY-startY + (scrollTops-initScrollTop);
				deltaY = -1*(newDX-startX) + (initScrollLeft-scrollLefts);
				break;
			case 180:
				deltaX = -1*(newDX-startX) + (initScrollLeft-scrollLefts);
				deltaY = -1*(newDY-startY) + (initScrollTop-scrollTops);
				break;
			default:
				deltaX = newDX-startX + (scrollLefts-initScrollLeft);
			deltaY = newDY-startY + (scrollTops-initScrollTop);
			break;
			}

			deltaX *= 1/scaleFactor;
			deltaY *= 1/scaleFactor;					

			var matrixTransformed = markupSelected.shapes.retrieveOriginCoordinates();
			transformed.x = initX+matrixTransformed.x+deltaX;
			transformed.y = initY+matrixTransformed.y+deltaY;
			transformed2.x = initX2+matrixTransformed.x+deltaX;
			transformed2.y = initY2+matrixTransformed.y+deltaY;

			if(transformed.x >=0 && transformed.x <=pageWidth)
			{
				X1 = initX+deltaX;
			}
			else if(transformed.x<0)
			{
				X1 = 0 - matrixTransformed.x;
			}
			else if(transformed.x > pageWidth)
			{
				X1 = pageWidth - matrixTransformed.x;
			}

			if(transformed.y >=0 && transformed.y <=pageHeight)
			{
				Y1 = initY+deltaY;
			}
			else if(transformed.y<0)
			{
				Y1 = 0 - matrixTransformed.y;
			}
			else if(transformed.y > pageHeight)
			{
				Y1 = pageHeight - matrixTransformed.y;
			}

			if(transformed2.x >=0 && transformed2.x <=pageWidth)
			{
				X2 = initX2+deltaX;
			}
			else if(transformed2.x<0)
			{
				X2 = 0 - matrixTransformed.x;
			}
			else if(transformed2.x > pageWidth)
			{
				X2 = pageWidth - matrixTransformed.x;
			}

			if(transformed2.y >=0 && transformed2.y <=pageHeight)
			{
				Y2 = initY2+deltaY;
			}
			else if(transformed2.y<0)
			{
				Y2 = 0 - matrixTransformed.y;
			}
			else if(transformed2.y > pageHeight)
			{
				Y2 = pageHeight - matrixTransformed.y;
			}
			
			//check for bounding box hit
			var hitIndex = selectedHandleIndex == 0 ? checkBoundingBoxOverlap(X1, Y1, pageTextElements).pop() : 
				checkBoundingBoxOverlap(X2, Y2, pageTextElements).pop();
			
			if(hitIndex!=null){
				var firstStrikeIdx = anchorIdx;
				if (strikeIdxStack.indexOf(hitIndex) < 0) { //if index hit is new to stack
					
					//push new indexes to stack
					if (hitIndex > lastIndexInStack) { // selected bottom, moving down
						//before adding to stack check if hitIndex passes the anchor
						if (lastIndexInStack < firstStrikeIdx){
							while (strikeObjStack.length > 0){
								strikeIdxStack.pop();
								var elementRemove = strikeObjStack.pop();
								removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveBoxShape());
								removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveShapeForCalculation());
							}
							lastIndexInStack = anchorIdx;
						}
						while (hitIndex > lastIndexInStack){ // loop for skips in selection
							lastIndexInStack++;
							strikeIdxStack.push(lastIndexInStack);
							strikeObjStack.push(drawNextObject(markupTypeResize,markupIdResize,markupGroupResize));
						}
					} else if (hitIndex < lastIndexInStack) { // selected top, moving up
						//before adding to stack check if hitIndex passes the anchor
						if (lastIndexInStack > firstStrikeIdx){
							while (strikeObjStack.length > 0){
								strikeIdxStack.pop();
								var elementRemove = strikeObjStack.pop();
								removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveBoxShape());
								removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveShapeForCalculation());
							}
							lastIndexInStack = anchorIdx;
						}
						while (hitIndex < lastIndexInStack){ // loop for skips in selection
							lastIndexInStack--;
							strikeIdxStack.push(lastIndexInStack);
							strikeObjStack.push(drawNextObject(markupTypeResize,markupIdResize,markupGroupResize));
						}
					} else { // hitIndex is equal to anchorIdx, clear stack
						while (strikeObjStack.length > 0){
							strikeIdxStack.pop();
							var elementRemove = strikeObjStack.pop();
							removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveBoxShape());
							removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveShapeForCalculation());
						}
						lastIndexInStack = anchorIdx;
					}
				} else { // if index hit is already in the stack
					//pop
					if (hitIndex < lastIndexInStack){ //selected btm moving up
						while (hitIndex < lastIndexInStack) {
							lastIndexInStack--;
							strikeIdxStack.pop();
							var elementRemove = strikeObjStack.pop();
							removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveBoxShape());
							removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveShapeForCalculation());	
						}
					} else if (hitIndex > lastIndexInStack){ //selected top moving bot
						while (hitIndex > lastIndexInStack) {
							lastIndexInStack++;
							strikeIdxStack.pop();
							var elementRemove = strikeObjStack.pop();
							removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveBoxShape());
							removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveShapeForCalculation());
						}
					}
				}
				//end shifting of stack
				
				var anchorObj = markupAnchor;
				var anchX = pageTextElements[anchorIdx][0];
				var anchY = pageTextElements[anchorIdx][1];
				var anchWidth = pageTextElements[anchorIdx][2];
				var anchHeight = pageTextElements[anchorIdx][3];
				
				var currX = pageTextElements[hitIndex][0];
				var currY = pageTextElements[hitIndex][1];
				var currWidth = pageTextElements[hitIndex][2];
				var currHeight = pageTextElements[hitIndex][3];
				
				var fillColor = markupSelected.attributes.fillColor;
				var lineWidth = markupSelected.attributes.borderWeight;
				var opacityLevelDecimal = defaultHighlightOpacity.replace('%','')/100;
				var xOffset = selectedHandleIndex == 0 ? X1 : X2;  //checking which reference point will the resize follow
				
				if (hitIndex > anchorIdx) { // strikeout moving down from anchor
					if (selectedHandleIndex == 0) {
						moveHighlightObject(initAnchorX2, anchY, (anchWidth+anchX)-initAnchorX2, anchHeight, 
								fillColor, opacityLevelDecimal, anchorObj, lineWidth);
					} else {
						moveHighlightObject(initAnchorX, anchY, (anchWidth+anchX)-initAnchorX, anchHeight, 
								fillColor, opacityLevelDecimal, anchorObj, lineWidth);
					}
					
					if (strikeIdxStack.indexOf(hitIndex) > -1){
						//check if hit stack contains hitIdx
						if (strikeIdxStack[strikeIdxStack.length-1] == hitIndex) {
							//check if hitIndex is last in stack
							shiftHighlightPosition(hitIndex,strikeIdxStack,strikeObjStack,pageTextElements,fillColor,opacityLevelDecimal,lineWidth);
						}
						moveHighlightObject(currX, currY, xOffset-currX, currHeight, fillColor, 
								opacityLevelDecimal, strikeObjStack[strikeObjStack.length-1],lineWidth);
					}
				} else if (hitIndex < anchorIdx) { //strikeout moving up from anchor
					if (selectedHandleIndex == 0) {
						moveHighlightObject(anchX, anchY, initAnchorX2-anchX, anchHeight, 
								fillColor, opacityLevelDecimal, anchorObj, lineWidth);
					} else {
						moveHighlightObject(anchX, anchY, initAnchorX-anchX, anchHeight, 
								fillColor, opacityLevelDecimal, anchorObj, lineWidth);
					}
					
					if (strikeIdxStack.indexOf(hitIndex) > -1){
						//check if hit stack contains hitIdx
						if (strikeIdxStack[strikeIdxStack.length-1] == hitIndex) {
							//check if hitIndex is last in stack
							shiftHighlightPosition(hitIndex,strikeIdxStack,strikeObjStack,pageTextElements,fillColor,opacityLevelDecimal,lineWidth);
						}
						moveHighlightObject(xOffset, currY, (currWidth+currX)-xOffset, currHeight, fillColor, 
								opacityLevelDecimal, strikeObjStack[strikeObjStack.length-1], lineWidth);
					}
				} else { // moving on same line
					var xVal,widthVal;
					if (selectedHandleIndex == 0) {
						if (X1 < initAnchorX2) {
							xVal = X1;
							widthVal = initAnchorX2-X1;
						} else {
							xVal = initAnchorX2;
							widthVal = X1-initAnchorX2;
						}
					} else {
						if (X2 > initAnchorX) {
							xVal = initAnchorX;
							widthVal = X2-initAnchorX;
						} else {
							xVal = X2;
							widthVal = initAnchorX-X2;
						}
					}
					moveHighlightObject(xVal, anchY, widthVal, anchHeight, fillColor, opacityLevelDecimal,anchorObj,lineWidth);
					if (strikeIdxStack.length > 0){
						strikeIdxStack.pop();
						while (strikeObjStack.length > 0){
							var elementRemove = strikeObjStack.pop();
							removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveBoxShape());
							removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveShapeForCalculation());
						}
					}
				}
			}
			
//			var firstLine, lastLine;
//			var anchorObj = markupAnchor;
//			if (strikeIdxStack.length > 0) { // multi-line
//				if (strikeIdxStack[strikeIdxStack.length-1]<anchorIdx) {
//					firstLine = strikeObjStack[strikeObjStack.length-1];
//					lastLine = anchorObj;
//				} else {
//					firstLine = anchorObj;
//					lastLine = strikeObjStack[strikeObjStack.length-1];
//				}
//			} else { //single line
//				firstLine = anchorObj;
//				lastLine = anchorObj;
//			}
//
//			var linePoints = computeLineCoordinates(firstLine.shapes.retrieveShapeForCalculation(),udvPageInstance.svgPage,rotatedDimension,pageAttributes.pageIndex);
//			var linePoints2 = computeLineCoordinates(lastLine.shapes.retrieveShapeForCalculation(),udvPageInstance.svgPage,rotatedDimension,pageAttributes.pageIndex);
//			annotationHandles[0].style.left = (linePoints.pt1.x-5) + 'px';
//			annotationHandles[0].style.top = (linePoints.pt1.y-7) + 'px';
//			annotationHandles[1].style.left = linePoints2 ? (linePoints2.pt2.x-5) + 'px' : (linePoints.pt2.x-5) + 'px';
//			annotationHandles[1].style.top = linePoints2 ? (linePoints2.pt2.y-7) + 'px': (linePoints.pt2.x-5) + 'px';

			if(e.clientY>=(viewerPortBottom-30))
			{
				closestChild.scrollTop(closestChild.scrollTop()+30);
			}					
			else if(e.clientY<=(viewerPortTop+30))
			{
				closestChild.scrollTop(closestChild.scrollTop()-30);
			}
			else if(e.clientX>(viewerPortRight-30))
			{
				closestChild.scrollLeft(closestChild.scrollLeft()+30);
			}
			else if(e.clientX<=(viewerPortLeft+30))
			{
				closestChild.scrollLeft(closestChild.scrollLeft()-30);
			}
		};
		window.addEventListener('mousemove', resizeOnMove, false);
		var stopResize = function(e)
		{
			
			//starttest
			var firstLine, lastLine;
			var anchorObj = markupAnchor;
			if (strikeIdxStack.length > 0) { // multi-line
				if (strikeIdxStack[strikeIdxStack.length-1]<anchorIdx) {
					firstLine = strikeObjStack[strikeObjStack.length-1];
					lastLine = anchorObj;
				} else {
					firstLine = anchorObj;
					lastLine = strikeObjStack[strikeObjStack.length-1];
				}
			} else { //single line
				firstLine = anchorObj;
				lastLine = anchorObj;
			}

			var linePoints = computeLineCoordinates(firstLine.shapes.retrieveShapeForCalculation(),udvPageInstance.svgPage,rotatedDimension,pageAttributes.pageIndex);
			var linePoints2 = computeLineCoordinates(lastLine.shapes.retrieveShapeForCalculation(),udvPageInstance.svgPage,rotatedDimension,pageAttributes.pageIndex);
			annotationHandles[0].style.left = (linePoints.pt1.x-5) + 'px';
			annotationHandles[0].style.top = (linePoints.pt1.y-7) + 'px';
			annotationHandles[1].style.left = linePoints2 ? (linePoints2.pt2.x-5) + 'px' : (linePoints.pt2.x-5) + 'px';
			annotationHandles[1].style.top = linePoints2 ? (linePoints2.pt2.y-7) + 'px': (linePoints.pt2.x-5) + 'px';
			//endtest
			
			strikeObjStack.splice(0,0,markupAnchor);
			if (strikeObjStack.length > 1 && anchorIdx > strikeIdxStack[strikeIdxStack.length-1]) {
				strikeObjStack.reverse();
			}
			
			originalMarkupObject.attributes = strikeObjStack[0].attributes;
			originalMarkupObject.drawnObjectCollection = strikeObjStack;
			
			strikeIdxStack = [];
			strikeObjStack = [];
			window.removeEventListener('mousemove',resizeOnMove,false);
			window.removeEventListener('mouseup',stopResize,false);
			if(handTool.data('laststate') == true){
				handTool.data('drag','enable').addClass('selected-tool');
				viewerWrapper.dragScroll();
			}
			
			window.removeEventListener('mousemove',resizeOnMove,false);
			window.removeEventListener('mouseup',stopResize,false);
			if(handTool.data('laststate') == true){
				handTool.data('drag','enable').addClass('selected-tool');
				viewerWrapper.dragScroll();
			}
			
			var len = annotationHandles.length;
			for(var i=0;i<len;i++)
			{
				annotationHandles[i].style.display="block";
			}
		};
		window.addEventListener('mouseup',stopResize,false);
	};
	createdDivForHandle.addEventListener('mousedown',startResize,false);
}

/**
 * Applies the resize handles and outline of an object. This function only applies two handles, one for each point.
 * This is used for line, arrow, and strikethrough annotation
 * 
 * @param markupSelected1 - First line of strikethrough object or selectedAnnotationObject for line or arrow.
 * @param markupSelected2 - Last line of strikethrough object
 * @param parentHandles - Parent <div> containing childNodes representing all instances of resize handles
 * @param x - x position of first point
 * @param strikeX - x position of first strikethrough point
 * @param y- y position of first point
 * @param strikeY - y position of first strikethrough point
 * @param x2 - x position of second point
 * @param strikeX2 - x position of second strikethrough point
 * @param y2- y position of second point
 * @param strikeY2 - y position of second strikethrough point
 * @param udvPageInstance - udvPage instance used to retrieve page attributes:
 * 						*pageRotation degrees
 * 						*dimensions of the page
 * @param originalMarkupObject
 * @returns {HandleGroup}
 */
function resizeHandlesArrow(markupSelected1,markupSelected2,parentHandles,x,strikeX,y,strikeY,x2,strikeX2,y2,strikeY2,udvPageInstance,originalMarkupObject)
{
	var annotationHandles = [],
	p = document.createElement('div'),
	styleHandle = p.style,
	markupIdSelected = markupSelected1.id,
	markupType = markupSelected1.markupType,
	rotateDegrees = udvPageInstance.attributes.rotateDegrees;

	x-=5;
	x2-=5;
	y-=7;
	y2-=7;
	
	if(markupSelected2!=null){
		strikeX -= 5;
		strikeY -= 7;
		strikeX2 -= 5;
		strikeY2 -= 7;
	}

	styleHandle.width = '0px';
	styleHandle.height = '0px';
	styleHandle.left = '0px';
	styleHandle.top = '0px';
	styleHandle['z-index'] = '1';
	styleHandle.cursor = 'move';
	styleHandle.display = 'block';
	parentHandles.appendChild(p);
	var backgroundPath = 'transparent url(images/handles.png)';
	for(var i=0;i<2;i+=1)
	{
		var createdDivForHandle = document.createElement('div');
		createdDivForHandle.style.position='absolute';
		createdDivForHandle.style.width='12px';
		createdDivForHandle.style.height='12px';
		createdDivForHandle.style.display='block';
		createdDivForHandle.style.zindex='1';
		createdDivForHandle.setAttributeNS(null, 'data-isi','handle-'+i);
		createdDivForHandle.style.background=backgroundPath+' -48px 0px ';
		createdDivForHandle.style.cursor='move';

		switch(i)
		{
		case 0:
			createdDivForHandle.style.left=x+'px';
			createdDivForHandle.style.top=y+'px';
			if (markupType == markupTypes.StrikeThrough){
				if (markupSelected2){
					applyResizeLogicStrike(markupSelected1,markupSelected2,createdDivForHandle,udvPageInstance,rotateDegrees,0,annotationHandles,originalMarkupObject);	
				} else {
					applyResizeLogicStrike(markupSelected1.drawnObjectCollection[0],markupSelected1.drawnObjectCollection[0],createdDivForHandle,udvPageInstance,rotateDegrees,0,annotationHandles,originalMarkupObject);
				}
			} else {
				applyResizeLogicArrow(markupSelected1,createdDivForHandle,udvPageInstance,rotateDegrees,0,annotationHandles);
			}
			break;
		case 1:
			if (markupSelected2!=null){
				createdDivForHandle.style.left=(strikeX2)+'px';
				createdDivForHandle.style.top=(strikeY2)+'px';
			} else {
				createdDivForHandle.style.left=(x2)+'px';
				createdDivForHandle.style.top=(y2)+'px';
			}
			if (markupType == markupTypes.StrikeThrough) {
				if (markupSelected2){
					applyResizeLogicStrike(markupSelected2,markupSelected1,createdDivForHandle,udvPageInstance,rotateDegrees,1,annotationHandles,originalMarkupObject);	
				} else {
					applyResizeLogicStrike(markupSelected1.drawnObjectCollection[0],markupSelected1.drawnObjectCollection[0],createdDivForHandle,udvPageInstance,rotateDegrees,1,annotationHandles,originalMarkupObject);
				}
			} else {
				applyResizeLogicArrow(markupSelected1,createdDivForHandle,udvPageInstance,rotateDegrees,1,annotationHandles);
			}
			break;
		}
		p.appendChild(createdDivForHandle);
		annotationHandles.push(createdDivForHandle);
	}
	var handleGroup = new HandleGroup(p,annotationHandles);
	return handleGroup;
}

/**
 * Applies the resize handles and outline of a text highlight object.
 * 
 * @param firstMarkup - First line instance of the text highlight annotation.
 * @param secondMarkup - Last line instance of the text highlight annotation.
 * @param parentHandles - Parent <div> where resize handles will be appended onto the page
 * @param x - x position (document position not SVG position) of the firstMarkup
 * @param x2 - x position (document position not SVG position) of the secondMarkup
 * @param y - y position (document position not SVG position) of the firstMarkup
 * @param y2 - y position (document position not SVG position) of the secondMarkup
 * @param height
 * @param height2
 * @param width
 * @param width2
 * @param udvPageInstance - udvPage instance used to retrieve page attributes:
 * 						*pageRotation degrees
 * 						*dimensions of the page
 * @param drawnObjStack
 * @param originalMarkupObject
 * @returns {HandleGroup}
 */
function resizeHandlesText(firstMarkup,secondMarkup,parentHandles,x,x2,y,y2,height,height2,width,width2,udvPageInstance,drawnObjStack,originalMarkupObject)
{
	var rotateDeg = udvPageInstance.attributes.rotateDegrees,
	annotationHandles = [],
	trueHeight,trueHeight2,
	trueWidth,trueWidth2,
	p = document.createElement('div'),
	styleHandle = p.style,
	defaultUnit = 'px',
	defaultValue = '0'+defaultUnit,
	selectedHandleIndex;
	
	x-=5
	y-=5
	if (secondMarkup!=null) {
		x2-=5;
		y2-=5;
	}

	trueHeight = parseInt(height)-1;
	trueWidth = parseInt(width)-1;
	trueHeight2 = parseInt(height2)-1;
	trueWidth2 = parseInt(width2)-1;

	styleHandle.width = defaultValue;
	styleHandle.height = defaultValue;
	styleHandle.left = defaultValue;
	styleHandle.top = defaultValue;
	styleHandle.zIndex = '1';
	styleHandle.cursor = 'move';
	styleHandle.display = 'block';

	parentHandles.appendChild(p);

	for(var i=0;i<2;i+=1)
	{
		var createdDivForHandle = document.createElement('div');
		createdDivForHandle.style.position='absolute';
		createdDivForHandle.style.width='12px';
		createdDivForHandle.style.height='12px';
		createdDivForHandle.style.display='block';
		createdDivForHandle.style.zIndex='1';
		createdDivForHandle.setAttributeNS(null, 'data-isi','handle-'+i);
		var backgroundPath = 'transparent url(images/handles.png)';

		switch(i)
		{
		case 0:
			if (rotateDeg==90 || rotateDeg==270){
				if (rotateDeg==90) {
					createdDivForHandle.style.left=x2+defaultUnit;
					createdDivForHandle.style.top=y2+trueHeight2+defaultUnit;	
				} else {
					createdDivForHandle.style.left=x+defaultUnit;
					createdDivForHandle.style.top=y+trueHeight+defaultUnit;
				}
				createdDivForHandle.style.cursor='sw-resize';
				createdDivForHandle.style.background=backgroundPath+' -24px 0px ';
				selectedHandleIndex = 1; 
			} else {
				if (rotateDeg==180){
					createdDivForHandle.style.left=x2+defaultUnit;
					createdDivForHandle.style.top=y2+defaultUnit;
				} else {
					createdDivForHandle.style.left=x+defaultUnit;
					createdDivForHandle.style.top=y+defaultUnit;
				}
				createdDivForHandle.style.cursor='nw-resize';
				createdDivForHandle.style.background=backgroundPath+' 0px 0px ';
				selectedHandleIndex = 0;
			}
			applyResizeHighlightLogic(firstMarkup,secondMarkup,createdDivForHandle,udvPageInstance,rotateDeg,selectedHandleIndex,annotationHandles, drawnObjStack,originalMarkupObject);				
			break;
		case 1:
			if (rotateDeg==90 || rotateDeg==270){
				if (rotateDeg==90){
					createdDivForHandle.style.left=x+trueWidth+defaultUnit;
					createdDivForHandle.style.top=y+defaultUnit;
				} else {
					createdDivForHandle.style.left=x2+trueWidth2+defaultUnit;
					createdDivForHandle.style.top=y2+defaultUnit;
				}
				createdDivForHandle.style.cursor='ne-resize';
				createdDivForHandle.style.background=backgroundPath+' -12px 0px ';
				selectedHandleIndex = 0;
			} else {
				if (rotateDeg==180){
					createdDivForHandle.style.left=x+trueWidth+defaultUnit;
					createdDivForHandle.style.top=y+trueHeight+defaultUnit;	
				} else {
					createdDivForHandle.style.left=x2+trueWidth2+defaultUnit;
					createdDivForHandle.style.top=y2+trueHeight2+defaultUnit;	
				}
				createdDivForHandle.style.cursor='se-resize';
				createdDivForHandle.style.background=backgroundPath+' -36px 0px ';
				selectedHandleIndex = 1;
			}
			applyResizeHighlightLogic(secondMarkup,firstMarkup,createdDivForHandle,udvPageInstance,rotateDeg,selectedHandleIndex,annotationHandles, drawnObjStack,originalMarkupObject);
			break;
		}
		
		createdDivForHandle.style.left+=5;
		createdDivForHandle.style.top+=5;
		p.appendChild(createdDivForHandle);
		annotationHandles.push(createdDivForHandle);
	}

	var handleGroup = new HandleGroup(p,annotationHandles);
	return handleGroup;
}

/**
 * Retrieve position and dimension of an annotation object
 * @param annotation
 * @returns
 */
function initializeAttributes(annotation)
{
	var initialDimension = {
			x : 0,
			y : 0,
			width : 0,
			height : 0
	},
	shape = annotation.shapes.retrieveShapeForCalculation().getBBox();

	switch(annotation.markupType)
	{
	case markupTypes.StickyNote :
	case markupTypes.Text :
	case markupTypes.Rectangle :
	case markupTypes.RectangleRedaction :
	case markupTypes.TextHighLight :
	case markupTypes.CollabHighlight :
		initialDimension.x = shape.x;
		initialDimension.y = shape.y;
		initialDimension.width = shape.width;
		initialDimension.height = shape.height;
		break;
	case markupTypes.Circle :
		initialDimension.x = shape.x;
		initialDimension.y = shape.y;
		initialDimension.width = shape.width;
		initialDimension.height = shape.height;
		break;
	}
	return shape;

}

function getSelectedObjectGroup() {
	var selObjGrp = null;
	if (selectedObjectCollection.length == 1) {
		selObjGrp = getSelectedObjectParentGroup(0);
	}
	return selObjGrp;
}

function getMultipleSelectedObjectGroup() {
	var mulSelObjGrp = [];
	var arrLength = selectedObjectCollection.length;
	if (arrLength > 1) {
		for(var i=0; i<arrLength; i++) {
			mulSelObjGrp.push(getSelectedObjectParentGroup(i));
		}
	}
	return mulSelObjGrp;
}

function getSelectedObjectParentGroup(index) {
	var selObjParentGrp = null,
	selPageIndex = selectedObjectCollection[index].pageId,
	selMarkupIndex = selectedObjectCollection[index].markupId;
	if(selPageIndex > -1 && selMarkupIndex > -1) {
		var annoObj = getSingleSelectedObject(index);
		if(annoObj) {
			var annoObjParentG = annoObj.parentNode;
			var annoObjMarkupGrp = (annoObjParentG) ? annoObjParentG.parentNode : null;

			if (annoObjMarkupGrp && annoObjParentG.tagName == "g") {
				var annoObjMarkupGrpName = annoObjMarkupGrp.getAttribute("data-isi");
				var annoObjgroupDragGrpName = annoObjMarkupGrp.getAttribute("id");
				var markupsName = "markups-" + (selPageIndex + 1);
				var groupDragName = "groupDrag-" + (selPageIndex + 1);
				if (annoObjMarkupGrpName == markupsName||annoObjgroupDragGrpName==groupDragName) {
					selObjParentGrp = annoObjParentG;
				}
			}
		}
	}
	return selObjParentGrp;
}

function getSingleSelectedObject(index) {

	var selectedObject = selectedObjectCollection[index],
	obj = null;
	if(selectedObject)
	{
		var selPageIndex = selectedObject.pageId,
		selMarkupIndex = selectedObject.markupId,
		udvPage = pageCollection[selPageIndex],
		markup = udvPage.retrieveMarkObjectInPage(selMarkupIndex);
		obj = markup.shapes.retrieveShapeForCalculation();
	}
	return obj;
}

function getSingleSelectedMarkupObject(index) {

	var selectedObject = selectedObjectCollection[index],
	obj = null;
	if(selectedObject)
	{
		var selPageIndex = selectedObject.pageId,
		selMarkupIndex = selectedObject.markupId,
		udvPage = pageCollection[selPageIndex],
		markup = udvPage.retrieveMarkObjectInPage(selMarkupIndex);
		obj = markup;
	}
	return obj;
}

function getSelectedRedactionReason(index) {
	var selectedObject = selectedObjectCollection[index],
	obj = null;
	if(selectedObject){
		var selPageIndex = selectedObject.pageId,
		selMarkupIndex = selectedObject.markupId,
		udvPage = pageCollection[selPageIndex],
		markup = udvPage.retrieveMarkObjectInPage(selMarkupIndex);
		if(markup.markupType === markupTypes.RectangleRedaction || markup.markupType === markupTypes.TextRedactHighlight) {
			if(isIE) {
				obj = markup.shapes.redactionText.data;
			} else {
				obj = markup.shapes.divText.innerHTML;
			}
		}
	}

	return obj;
}

function getSingleSelectedTextObject()
{
	var obj = getSelectedObjectGroup();
	if(obj) {
		var textDivId = parseInt(selectedObjectCollection[0].markupId);
		return document.getElementById("divText-"+textDivId);
	} else {
		return null;
	}
}

function deleteSingleMarkup() {
	var selObjGrp = getSelectedObjectGroup();
	if (selObjGrp) {
		var selObjMarkupGrp = selObjGrp.parentNode;
		selObjMarkupGrp.removeChild(selObjGrp);
	}
}

function deleteMultipleMarkups() {
	var selObjGrp = getMultipleSelectedObjectGroup();
	var arrLength = selObjGrp.length;
	for(var i=0; i<arrLength; i++) {
		if (selObjGrp[i]) {
			var selObjMarkupGrp = selObjGrp[i].parentNode;
			selObjMarkupGrp.removeChild(selObjGrp[i]);
		}
	}
}

function applyMultipledrag(udvPageInstance) {
	
	var viewerWrapper = $(getElement('viewer-document-wrapper'));
	var snapGroup =[];
	var markUpGrp = udvPageInstance.svgMarkupGroup;
	var grpDrag = udvPageInstance.groupDragGroup;
	var grpDragLen = grpDrag.childNodes.length;
	removeSnapToDrag(grpDrag);
	
	if(grpDragLen>0){
		for(var i=0; i<grpDragLen; i++){
			updateRemovedFromGroup(udvPageInstance, grpDrag.childNodes[0], grpDrag );
			markUpGrp.appendChild(grpDrag.childNodes[0]);
			//removeSnapToDrag(grpDrag.childNodes[0]);
		}
		grpDrag.removeAttribute('transform');
	}else{
		grpDrag.removeAttribute('transform');
	}
	
	for(var i =0; i<selectedObjectCollection.length; i++){
		var selectedMarkup = udvPageInstance.retrieveMarkObjectInPage(selectedObjectCollection[i].markupId);
		if (selectedMarkup.markupType != markupTypes.TextHighLight && selectedMarkup.markupType != markupTypes.TextRedactHighlight && selectedMarkup.markupType != markupTypes.StrikeThrough
				&& selectedMarkup.markupType != markupTypes.CollabHighlight){
			//do not include snap to drag since it wont be dragged but resized only
			removeSnapToDrag(selectedMarkup.shapes.group);
			snapGroup.push(selectedMarkup.shapes.group);
		}
	}
	snapGroupLength= snapGroup.length;
	for(var i=0; i<snapGroupLength; i++){
		grpDrag.appendChild(snapGroup[i]);
	}
	var snapAnnotation = Snap(grpDrag);
	snapAnnotation.drag();
	viewerWrapper.removeClass('cursorCrosshair');
	snapAnnotation.drag(function(){
		//move of drag
		},function(){
			//start of drag
			var handTool = $(getElement('page-handtool'));
			var handToolJS = document.getElementById('page-handtool');
			handToolJS.setAttributeNS(null, 'data-drag', 'unable');
			handTool.data('drag','unable').removeClass('selected-tool');
			viewerWrapper.removeDragScroll();
			viewerWrapper.css('cursor','move');
		},function(){
			//end of drag
			var handToolJS = document.getElementById('page-handtool');
			var handTool = $(getElement('page-handtool'));
			if(handTool.data('laststate') == true){
				handTool.data('drag','enable').addClass('selected-tool');
				viewerWrapper.dragScroll();
			} else {
				viewerWrapper.css('cursor','default');
			}
	});
	
}
function clearGroupDrag() {
	var pageCollectionLen = pageCollection.length;
	
	for(var i=0; i<pageCollectionLen; i++){
		var udvPageInstance = pageCollection[i],
		markUpGrp = udvPageInstance.svgMarkupGroup,
		grpDrag = udvPageInstance.groupDragGroup,
		grpDragLen = grpDrag.childNodes.length;
		
		if(grpDragLen>0){
			for(var i=0; i<grpDragLen; i++){
				attachSnapToDrag(grpDrag.childNodes[0]);
				updateRemovedFromGroup(udvPageInstance, grpDrag.childNodes[0], grpDrag );
				markUpGrp.appendChild(grpDrag.childNodes[0]);
				
			}
			grpDrag.removeAttribute('transform');
			removeSnapToDrag(udvPageInstance.groupDragGroup);
		}
		
	}
	
	
	while(selectedPages.length>0)
	{
		var indexToClear = selectedPages[0];
		pageCollection[indexToClear].clearAllSelectedMarkups(indexToClear);
	}
	$(getElement('deleteMultiple')).css('display','none');
}

function clearGroupDrag2(pageNumber) {
	
	var udvPageInstance = pageCollection[pageNumber],
	markUpGrp = udvPageInstance.svgMarkupGroup,
	grpDrag = udvPageInstance.groupDragGroup,
	grpDragLen = grpDrag.childNodes.length;
		
	if(grpDragLen>0){
		for(var i=0; i<grpDragLen; i++){
			attachSnapToDrag(grpDrag.childNodes[0]);
			updateRemovedFromGroup(udvPageInstance, grpDrag.childNodes[0], grpDrag );
			markUpGrp.appendChild(grpDrag.childNodes[0]);
		}
		grpDrag.removeAttribute('transform');
		removeSnapToDrag(udvPageInstance.groupDragGroup);
	}
}
	
function removeSingleMarkupInArray() {
	if(selectedObjectCollection.length == 1) {
		var udvPage = pageCollection[selectedObjectCollection[0].pageId];
		var arrLength = udvPage.markups.length;
		for(var i=0; i<arrLength; i++)
		{
			if(udvPage.markups[i].id == selectedObjectCollection[0].markupId)
			{
				udvPage.markups.splice(i,1);
				break;
			}
		}
		var collection = udvPage.textMarkups;
		arrLength = collection.length;

		for(var i=0; i<arrLength; i++)
		{
			if(collection[i].id == selectedObjectCollection[0].markupId)
			{
				collection.splice(i,1);
				break;
			}
		}
	}
	
}

function removeMultipleMarkupInArray() {
	if(selectedObjectCollection.length > 1) {
		for(var i=selectedObjectCollection.length-1; i>=0; i--) {
			var udvPage = pageCollection[selectedObjectCollection[i].pageId];
			var arrLength = udvPage.markups.length;
			for(var a=arrLength-1; a>=0; a--)
			{
				if(udvPage.markups[a].id == selectedObjectCollection[i].markupId)
				{
					udvPage.markups.splice(a,1);
				}
			}

			var collection = udvPage.textMarkups;
			arrLength = collection.length;

			for(var a=arrLength-1; a>=0; a--)
			{
				if(collection[a].id == selectedObjectCollection[i].markupId)
				{
					collection.splice(a,1);
				}
			}
		}
	}

}

function layerMarkupObject(layerOpt) {
	var selObjGrp = getSelectedObjectGroup();
	var pageId = selectedObjectCollection[0].pageId;

	if (selObjGrp && layerOpt) {
		var selObjMarkupGrp = selObjGrp.parentNode;
		var lastHighlightIdx = pageCollection[pageId].getLastHighlightIndex();
		var lastHighlightGroup;
		if(lastHighlightIdx != undefined){
			lastHighlightGroup = $(selObjMarkupGrp.childNodes).get(lastHighlightIdx); //DV-1112
		}
		

		switch (layerOpt) {
		case layerOptions.Top:
			selObjMarkupGrp.appendChild(selObjGrp);
			break;

		case layerOptions.Bottom:
			if (lastHighlightGroup){
				if(lastHighlightGroup.nextSibling != null){
					selObjMarkupGrp.insertBefore(selObjGrp, lastHighlightGroup.nextSibling);
				}
			} else {
				selObjMarkupGrp.insertBefore(selObjGrp, selObjMarkupGrp.firstChild);
			}
			break;

		case layerOptions.Forward:
			if(selObjGrp.nextElementSibling !== null) {
				selObjMarkupGrp.insertBefore(selObjGrp.nextElementSibling, selObjGrp);
			}
			break;

		case layerOptions.Backward:
			if(selObjGrp.previousElementSibling !== null) {
				if (lastHighlightGroup){
					if(selObjGrp.previousElementSibling !== lastHighlightGroup){
						selObjMarkupGrp.insertBefore(selObjGrp, selObjGrp.previousElementSibling);
					}
				} else {
					selObjMarkupGrp.insertBefore(selObjGrp, selObjGrp.previousElementSibling);
				}
			}
			break;
		default:
		}
	}
}

/** For Annotation Attribute * */

function setAttributeColor(attribute, elem, toolbarElem){

	switch (attribute) {
	case 'fill':
		elem.setAttribute( "fill", getSelectedColor(toolbarElem));
		elem = null;
		break;
	case 'stroke':
		elem.setAttribute( "stroke", getSelectedColor(toolbarElem));
		elem = null;
		break;
	}
};

function setOpacity(elem, toolbarElem){
	elem.setAttribute('style', 'opacity:'+getSelectedOpacity(toolbarElem));
	elem.setAttribute('data-opacity', getSelectedOpacity(toolbarElem));
	var selPageIndex = selectedObjectCollection[0].pageId,
	selMarkupIndex = selectedObjectCollection[0].markupId,
	udvPage = pageCollection[selPageIndex],
	markup = udvPage.retrieveMarkObjectInPage(selMarkupIndex);
	markup.markupOpacity = getSelectedOpacity(toolbarElem);
	if(markup.markupType === markupTypes.Text || markup.markupType === markupTypes.StickyNote ) {
		if(isIE){
			markup.SVGText.style.fill = getRGBAcolor(markup.SVGText.style.fill, markup.markupOpacity);
		} else{
			markup.divText.style.color = getRGBAcolor(markup.divText.style.color, markup.markupOpacity);
		}
	}

};

function setWidth(elem, toolbarElem){
	var xElem=elem;
	xElem.setAttribute('stroke-width', getSelectedWidth(toolbarElem));
	if(elem.hasAttribute("marker-end")) {
		var markerId = isIE ? elem.getAttribute("marker-end").slice(5,-2) : elem.getAttribute("marker-end").slice(4,-1),
				markerElem = $(elem).siblings(markerId)[0];
		changeArrowHeadSize(markerElem, markerElem.firstChild);
	}
};

//For retrieving current value of
function setToolBarColor(toolbarElem, val){
	var xtoolbarElem = document.getElementById(toolbarElem);
	xtoolbarElem.style.backgroundColor = val;
};

function setToolBarWidth(toolbarElem, val){
	var xtoolbarElem = document.getElementById(toolbarElem);
	xtoolbarElem.innerHTML = val;
};

function setToolBarFontFace(toolbarElem, val){
	var xtoolbarElem = document.getElementById(toolbarElem);
	xtoolbarElem.innerHTML = val;
};

function setToolBarFontSize(toolbarElem, val){
	var xtoolbarElem = document.getElementById(toolbarElem);
	xtoolbarElem.innerHTML = val;
};

function setToolBarOpacity(toolbarElem, val){
	var xtoolbarElem = document.getElementById(toolbarElem);
	var yval = (parseFloat(val).toFixed(2) * parseInt(100)) + '%';
	xtoolbarElem.innerHTML = yval;
};

function parseText(currentText)
{
	var wholeText = "";
	var len = this.attributes.text.length;
	wholeText = currentText[0];
	switch(this.markupType)
	{
	case markupTypes.StickyNote : 
	case markupTypes.Text : 
		for(var z=1;z<len;z++)
		{
			if(isIE) {
				wholeText+="\n"+currentText[z];
			}
			else
			{
				wholeText+="<br/>"+currentText[z];
			}

		}
		break;
	}
	return wholeText;
}
//functions to manipulate text annotation
function transferTextAreaValuetoDiv(lastSelectedDivReason){
	if (lastSelectedDivReason == null) {
		lastSelectedDivReason = lastDrawnDivReason;
	}
	var textArea = document.getElementById("textAreaContainer");
	if (textArea.style.display != 'none'){
		if(isIE) {
			// var words = textArea.value.replace(/^\s+|\s+$/g, '');
			var words = textArea.value;
			// performWrappingAndNewLineForText(lastSelectedDivReason,
			// words);
			// setVerticalAlignOnChange(lastSelectedDivReason.parentNode);
			rotateTextLabel(lastSelectedDivReason,words);
		} else {
			lastSelectedDivReason.innerHTML = textArea.value.replace(/(<([^>]+)>)/ig, function(tag){
			    return tag.replace("<", "&lt;");
			 }).replace(/\n/g, "<br/>");
			rotateTextLabel(lastSelectedDivReason,textArea.value);
		}
		resetTextAreaStyle();
		var currentSelected = currentlySelectedAnnotation(annotationObject);
		if (currentSelected != undefined){
			if(currentSelected.getAttribute("id") == "addText"){
				reenableAnnotation($(currentSelected));
			} 
		}
	}
}

function insertTextValuetoDiv(markupObject,textValue){
	var divText;
	if(isIE) {
		divText = markupObject.shapes.divText;
	} else {
		divText = markupObject.shapes.para;
	}

	if(isIE) {
		// rotateTextLabel(divText,markupObject.attributes.text);
	} else {
		divText.innerHTML = escapeHtml(textValue).replace(/&lt;br\/&gt;/ig, "<br/>");
		// rotateTextLabel(divText);
	}
	resetTextAreaStyle();
}

function transferDivValuetoTextArea(textValue, top, left, height, width, markupSelected){
	var div = document.getElementById(textValue.getAttribute('id'));
	var textColor = null;
	if(isIE){
		lastSelectedDivReason = textValue.divText;
		var textParent = div.parentNode;
		var textParentLength = textParent.childNodes.length;
		var allText = "";
		for (var i=0; i<textParentLength; i++) {
			var divText = textParent.childNodes[i];
			if(divText.getAttribute('class') === 'wrapTextWithNewLine') {
				allText += divText.textContent;
				allText += "\n";
				divText.textContent = "";
			} else {
				allText += divText.textContent;
				divText.textContent = "";
			}
		}

		for (var i=textParentLength-1; i>=1; i--) {
			textParent.removeChild(textParent.childNodes[i]);
		}

		document.getElementById('textAreaContainer').value = allText.replace(/((\s*\S+)*)\s*/, "$1");
		textColor = getRGBvalue(window.getComputedStyle(div).getPropertyValue('fill'));
	} else {
		lastSelectedDivReason = textValue.para;
		// document.getElementById('textAreaContainer').value =
		// div.innerHTML.replace(/<br>/g, "\n").replace(/&amp;/g,
		// "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<");
		document.getElementById('textAreaContainer').value = htmlDecode(div.innerHTML.replace(/<br>/g, "\n"));
		div.innerHTML = "";
		textColor = getRGBvalue(window.getComputedStyle(div).getPropertyValue('color'));
	}

	// set text area attributes based from the selected text annotation
	var fontFace = window.getComputedStyle(div).getPropertyValue('font-family');
	var fontSize = window.getComputedStyle(div).getPropertyValue('font-size');
	var fontWeight = window.getComputedStyle(div).getPropertyValue('font-weight');
	var fontStyle = window.getComputedStyle(div).getPropertyValue('font-style');
	var textDecoration = div.parentNode.style['textDecoration'];
	var horizontalAlign = window.getComputedStyle(div).getPropertyValue('text-align');
	var verticalAlign = window.getComputedStyle(div).getPropertyValue('vertical-align');
	var backGroundColor = markupSelected.attributes.fillColor;
	if(backGroundColor == 'rgba(176, 176, 176, 0)' || backGroundColor == 'rgba(0, 0, 0, 0)' || backGroundColor == 'transparent') {
		backGroundColor = 'rgba(255, 255, 255, 1)';
	} else {
		backGroundColor = getRGBAcolor(backGroundColor, '1');
	}
	var txta = document.getElementById('textAreaContainer');
	txta.setAttribute('style','outline: none; border: none; position: absolute; overflow: auto; resize: none; display: block; width: '+((width-15)+'px')+'; height: '+((height-15)+'px')+'; top: '+((top+5)+'px')+'; left: '+((left+8)+'px')+'; font-family: '+fontFace+'; font-size: '+fontSize+'; color: '+textColor+'; font-weight: '+fontWeight+'; font-style: '+fontStyle+'; text-decoration: '+textDecoration+'; text-align:left; vertical-align:top; background: '+backGroundColor+';');
	txta.focus();
	var length = txta.value.length;
	txta.setSelectionRange(length, length);
	txta.select();
}

function htmlDecode(value){
	return $('<div/>').html(value).text();
}

function htmlEncode(value){
	return $('<div/>').text(value).html();
}

function clearTextAreaContents() {
	document.getElementById('textAreaContainer').value = '';
}

function resetTextAreaStyle(){
	var xta = document.getElementById('textAreaContainer');
	xta.setAttribute('style','position: absolute; overflow: auto; width: 1px; height: 1px; resize: none; display: none; cursor: none');
	clearTextAreaContents();
}

function showTextArea(createdText) {
	var fillColor = createdText.getAttribute('fill');
	if(fillColor == 'rgba(176, 176, 176, 0)' || fillColor == 'rgba(0, 0, 0, 0)' || fillColor == 'transparent') {
		fillColor = 'rgba(255, 255, 255, 1)';
	} else {
		fillColor = getRGBAcolor(fillColor, '1');
	}
	var backGroundColor = fillColor;
	var txta = document.getElementById('textAreaContainer');
	var dimension = calculateLeftAndTop(createdText);
	var width = (dimension.width - 15 < 1 ? 0 : dimension.width - 15);
	var height = (dimension.height - 15 < 1 ? 0 : dimension.height - 15);
	var top = dimension.top + (createdText.getAttribute("height") > 5 ? 5 : 1);
	var left = dimension.left + (createdText.getAttribute("width") > 8 ? 8 : 1);
	
	txta.setAttribute('style','outline: none; border: none; position: absolute; overflow: auto; resize: none; display: block; text-align:left; vertical-align: top; width: '+ width +'px; height: '+ height +'px; top: '+ top +'px; left: '+ left +'px; background: '+backGroundColor+';');
	applyAttributesInTextArea(markupTypes.Text);
	txta.focus();
}

function showStickyTextArea(createdText) {
	var fillColor = createdText.getAttribute('fill');
	if(fillColor == 'rgba(176, 176, 176, 0)' || fillColor == 'rgba(0, 0, 0, 0)' || fillColor == 'transparent') {
		fillColor = 'rgba(255, 255, 255, 1)';
	} else {
		fillColor = getRGBAcolor(fillColor, '1');
	}
	var backGroundColor = fillColor;
	var txta = document.getElementById('textAreaContainer');
	var dimension = calculateLeftAndTop(createdText);
	var width = (dimension.width - 15 < 1 ? 0 : dimension.width - 15);
	var height = (dimension.height - 15 < 1 ? 0 : dimension.height - 15);
	var top = dimension.top + (createdText.getAttribute("height") > 5 ? 5 : 1);
	var left = dimension.left + (createdText.getAttribute("width") > 8 ? 8 : 1);
	
	txta.setAttribute('style','outline: none; border: none; position: absolute; overflow: auto; resize: none; display: block; text-align:left; vertical-align: top; width: '+ width +'px; height: '+ height +'px; top: '+ top +'px; left: '+ left +'px; background: '+backGroundColor+';');
	applyAttributesInTextArea(markupTypes.StickyNote);
	//txta.focus();
}


function moveHandles(selectedMarkup,udvPageInstance)
{
	var forCalculation,
	pageAttributes=udvPageInstance.attributes,
	handles=udvPageInstance.handleCollections[0],
	dimension,
	rotatedDimension = computeRelativePageDimensions(pageAttributes.pageIndex);
	forCalculation = selectedMarkup.shapes.retrieveShapeForCalculation();
	switch(selectedMarkup.markupType)
	{
	case markupTypes.Line :
	case markupTypes.Arrow :
		dimension = computeLineCoordinates(forCalculation,udvPageInstance.svgPage,rotatedDimension,pageAttributes.pageIndex);
		changeHandlePosition(selectedMarkup, dimension, handles);
		break;
	case markupTypes.Circle :
		dimension = calculatePosition(forCalculation,rotatedDimension,pageAttributes.pageIndex);
		changeHandlePosition(selectedMarkup, dimension, handles);
		break;
	case markupTypes.StickyNote : 	
	case markupTypes.Stamp :
	case markupTypes.Image :	
	case markupTypes.Text :
	case markupTypes.Rectangle :
	case markupTypes.RectangleRedaction :
		dimension = calculatePosition(forCalculation,rotatedDimension,pageAttributes.pageIndex);
		changeHandlePosition(selectedMarkup, dimension, handles);
		break;
	}
}

function moveGroupHandles(udvPageInstance)
{
	var forCalculation,
	pageAttributes=udvPageInstance.attributes,
	handleLen = udvPageInstance.handleCollections.length,
	deselectIds=[];
	
	for(var i=0; i<handleLen; i++){
		
		
		var selectedMarkup = udvPageInstance.retrieveMarkObjectInPage(selectedObjectCollection[i].markupId);
		
		if (selectedMarkup.markupType != markupTypes.TextHighLight && selectedMarkup.markupType != markupTypes.TextRedactHighlight && selectedMarkup.markupType != markupTypes.StrikeThrough
				&& selectedMarkup.markupType != markupTypes.CollabHighlight){
			
			var	handles=udvPageInstance.handleCollections[i],
			dimension;
			rotatedDimension = computeRelativePageDimensions(pageAttributes.pageIndex);
			forCalculation = selectedMarkup.shapes.retrieveShapeForCalculation();
			
			switch(selectedMarkup.markupType)
			{
			case markupTypes.Line :
			case markupTypes.Arrow :
				dimension = computeLineCoordinates(forCalculation,udvPageInstance.svgPage,rotatedDimension,pageAttributes.pageIndex);
				changeHandlePosition(selectedMarkup, dimension, handles);
				break;
			case markupTypes.Circle :
				dimension = calculatePosition(forCalculation,rotatedDimension,pageAttributes.pageIndex);
				changeHandlePosition(selectedMarkup, dimension, handles);
				break;
			case markupTypes.StickyNote :	
			case markupTypes.Stamp :
			case markupTypes.Image :	
			case markupTypes.Text :
			case markupTypes.Rectangle :
			case markupTypes.RectangleRedaction :
				dimension = calculatePosition(forCalculation,rotatedDimension,pageAttributes.pageIndex);
				changeHandlePosition(selectedMarkup, dimension, handles);
				break;
			}
			
			
		}else{
			deselectIds.push(selectedObjectCollection[i].markupId);
		}
	}
	if(deselectIds.length>0){
		for(var i=0; i<deselectIds.length; i++){
			udvPageInstance.deSelectMarkup(deselectIds[i]);
		}
		//applyMultipledrag(udvPageInstance);
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('2');
		}
	}
}

function changeHandlePosition(selectedMarkup, dimension, handles) {

	var markupX = parseInt(dimension.left-5);
	var markupY = parseInt(dimension.top-5);
	var markupWidth = parseInt(dimension.width);
	var markupHeight = parseInt(dimension.height);
	var bagongWidth,bagongHeight;
	bagongHeight = markupHeight-1;
	bagongWidth = markupWidth-1;

	var markupXValuePX = markupX + 'px';
	var markupXWidthValuePX = (markupX + bagongWidth) + 'px';
	var markupXMiddleValuePX = (markupX + bagongWidth/2) + 'px';

	var markupYValuePX = markupY + 'px';
	var markupXHeightValuePX = (markupY + bagongHeight) + 'px';
	var markupYMiddleValuePX = (markupY + bagongHeight/2) + 'px';

	if(selectedMarkup.markupType == markupTypes.Line || selectedMarkup.markupType == markupTypes.Arrow) {
		
		handles.handleCollection[0].style.left = (dimension.pt1.x-5) + 'px';
		handles.handleCollection[0].style.top = (dimension.pt1.y-5) + 'px';

		handles.handleCollection[1].style.left = (dimension.pt2.x-5) + 'px';
		handles.handleCollection[1].style.top = (dimension.pt2.y-5) + 'px';
	}else if(selectedMarkup.markupType == markupTypes.Stamp){
		
		handles.handleCollection[0].style.left = (markupX+5) + 'px';
		handles.handleCollection[0].style.top = (markupY+5) + 'px';
	
	}else{
		
		handles.handleCollection[0].style.left = (markupX+5) + 'px';
		handles.handleCollection[0].style.top = (markupY+5) + 'px';
		
		handles.handleCollection[1].style.left = markupXValuePX;
		handles.handleCollection[7].style.left = markupXValuePX;
		handles.handleCollection[8].style.left = markupXValuePX;

		handles.handleCollection[2].style.left = markupXMiddleValuePX;
		handles.handleCollection[6].style.left = markupXMiddleValuePX;

		handles.handleCollection[3].style.left = markupXWidthValuePX;
		handles.handleCollection[4].style.left = markupXWidthValuePX;
		handles.handleCollection[5].style.left = markupXWidthValuePX;

		handles.handleCollection[1].style.top = markupYValuePX;
		handles.handleCollection[2].style.top = markupYValuePX;
		handles.handleCollection[3].style.top = markupYValuePX;

		handles.handleCollection[4].style.top = markupYMiddleValuePX;
		handles.handleCollection[8].style.top = markupYMiddleValuePX;

		handles.handleCollection[5].style.top = markupXHeightValuePX;
		handles.handleCollection[6].style.top = markupXHeightValuePX;
		handles.handleCollection[7].style.top = markupXHeightValuePX;

		if(selectedMarkup.markupType == markupTypes.Text || selectedMarkup.markupType == markupTypes.StickyNote ) {
			if(dimension.height <= 50 || dimension.width <= 50) {
				handles.handleCollection[9].style.top = (markupY + bagongHeight + 10) + 'px';
				handles.handleCollection[9].style.left = (markupX-8) + (bagongWidth/2) + 'px';
			} else {
				handles.handleCollection[9].style.top = (markupY-10) + (bagongHeight/2) + 'px';
				handles.handleCollection[9].style.left = (markupX-8) + (bagongWidth/2) + 'px';
			}
		}
	}
}

function getSelectedFontFace(markupType) {
	var toolBox = documentViewer.annotationToolBox[markupType];
	document.getElementById('textAreaContainer').style.fontFamily = toolBox.fontFamily;
	return toolBox.fontFamily;
}

function getSelectedFontSize(markupType) {
	var toolBox = documentViewer.annotationToolBox[markupType];
	document.getElementById('textAreaContainer').style.fontSize = toolBox.fontSize;
	return toolBox.fontSize;
}

function getSelectedTextColor(markupType) {
	var toolBox = documentViewer.annotationToolBox[markupType];
	document.getElementById('textAreaContainer').style.color = getRGBvalue(toolBox.fontColor);
	return getRGBvalue(toolBox.fontColor);
}

function getSelectedFontWeight(markupType) {
	var toolBox = documentViewer.annotationToolBox[markupType];
	if(toolBox.boldStyle) {
		document.getElementById('textAreaContainer').style.fontWeight = 'bold';
		return 'bold';
	} else {
		return 'normal';
	}
}

function getSelectedFontStyle(markupType) {
	var toolBox = documentViewer.annotationToolBox[markupType];
	if(toolBox.italicStyle) {
		document.getElementById('textAreaContainer').style.fontStyle = 'italic';
		return 'italic';
	} else {
		return 'normal';
	}
}

function getSelectedTextDecoration(markupType) {
	var toolBox = documentViewer.annotationToolBox[markupType];
	if(toolBox.underlineStyle) {
		if(toolBox.strikeStyle) {
			document.getElementById('textAreaContainer').style.textDecoration='underline line-through';
			return 'underline line-through';
		} else {
			document.getElementById('textAreaContainer').style.textDecoration='underline';
			return 'underline';
		}
	} else if(toolBox.strikeStyle) {
		if(toolBox.underlineStyle) {
			document.getElementById('textAreaContainer').style.textDecoration='underline line-through';
			return 'underline line-through';
		} else {
			document.getElementById('textAreaContainer').style.textDecoration='line-through';
			return 'line-through';
		}
	}
}

function getSelectedHorizontalAlignment() {
	var toolBox = documentViewer.annotationToolBox[markupTypes.Text];
	switch(toolBox.horizontalAlign){
	case 'left':
		document.getElementById('textAreaContainer').style.textAlign = 'left';
		return 'left';
		break;
	case 'center':
		document.getElementById('textAreaContainer').style.textAlign = 'center';
		return 'center';
		break;
	case 'right':
		document.getElementById('textAreaContainer').style.textAlign = 'right';
		return 'right';
		break;
	}
}

function getSelectedVerticalAlignment() {
	if(getSelectedObjectGroup() != null) {
		var selectedObject = getSingleSelectedTextObject();
		var verticalAlign = getComputedStyle(selectedObject,null).getPropertyValue("vertical-align");
		switch(verticalAlign) {
		case 'top':
			return 'top';
			break;
		case 'middle':
			return 'middle';
			break;
		case 'bottom':
			return 'bottom';
			break;
		}
	} else {
		var toolBox = documentViewer.annotationToolBox[markupTypes.Text];
		switch(toolBox.verticalAlign){
		case 'top':
			document.getElementById('textAreaContainer').style.verticalAlign = 'top';
			return 'top';
			break;
		case 'middle':
			document.getElementById('textAreaContainer').style.verticalAlign = 'middle';
			return 'middle';
			break;
		case 'bottom':
			document.getElementById('textAreaContainer').style.verticalAlign = 'bottom';
			return 'bottom';
			break;
		}
	}
}

function applyAttributesInTextArea(markupType) {
	getSelectedFontFace(markupType);
	getSelectedFontSize(markupType);
	getSelectedTextColor(markupType);
	getSelectedFontWeight(markupType);
	getSelectedFontStyle(markupType);
	getSelectedTextDecoration(markupType);
	// getSelectedHorizontalAlignment();
	// getSelectedVerticalAlignment();
}

function isMouseWithinPageBoundary(transformed, pageWidth, pageHeight) {
	if((parseInt(transformed.x) > 0) && (parseInt(transformed.y) > 0) && (parseInt(transformed.x) < pageWidth) && (parseInt(transformed.y) < pageHeight)){
		return true;
	} else {
		return false;
	}
}

function changeArrowHeadSize(marker, path, attributes){
	var lineWidth = (readyToDraw || selectedObjectCollection.length > 0) ? parseInt($(getElement('fillWidth')).text()) : parseInt(attributes.borderWeight);
	switch(lineWidth) {
	case 1:
		marker.setAttributeNS(null, 'markerWidth', '13');
		marker.setAttributeNS(null, 'markerHeight', '13');
		break;
	case 2:
		marker.setAttributeNS(null, 'markerWidth', '15');
		marker.setAttributeNS(null, 'markerHeight', '15');
		break;
	case 3:
		marker.setAttributeNS(null, 'markerWidth', '18');
		marker.setAttributeNS(null, 'markerHeight', '18');
		break;
	case 4:
		marker.setAttributeNS(null, 'markerWidth', '20');
		marker.setAttributeNS(null, 'markerHeight', '20');
		break;
	case 5:
		marker.setAttributeNS(null, 'markerWidth', '23');
		marker.setAttributeNS(null, 'markerHeight', '23');
		break;
	case 6:
		marker.setAttributeNS(null, 'markerWidth', '25');
		marker.setAttributeNS(null, 'markerHeight', '25');
		break;
	case 7:
		marker.setAttributeNS(null, 'markerWidth', '28');
		marker.setAttributeNS(null, 'markerHeight', '28');
		break;
	case 8:
		marker.setAttributeNS(null, 'markerWidth', '30');
		marker.setAttributeNS(null, 'markerHeight', '30');
		break;
	}

	if(isIE){
		if(lineWidth == 1) {
			path.setAttributeNS(null, 'd', 'M 0 0.5 L 9.5 5 L 0 9.5 z');
		} else if(lineWidth == 2) {
			path.setAttributeNS(null, 'd', 'M 0 1 L 8 5 L 0 9 z');
		} else if(lineWidth == 3) {
			path.setAttributeNS(null, 'd', 'M 0 2 L 6.5 5 L 0 8 z');
		} else if(lineWidth == 4) {
			path.setAttributeNS(null, 'd', 'M 0 2.5 L 5.5 5 L 0 7.5 z');
		} else if(lineWidth == 5) {
			path.setAttributeNS(null, 'd', 'M 0 3 L 4 5 L 0 7 z');
		} else if (lineWidth == 6) {
			path.setAttributeNS(null, 'd', 'M 0 3.5 L 3.15 5 L 0 6.5 z');
		} else if (lineWidth == 7) {
			path.setAttributeNS(null, 'd', 'M 0 4 L 2 5 L 0 6 z');
		} else if (lineWidth == 8) {
			path.setAttributeNS(null, 'd', 'M 0 4.5 L 1 5 L 0 5.5 z');
		}
	} else {
		path.setAttributeNS(null, 'd', 'M 0 0 L 10 5 L 0 10 z');
	}
}

function hideEditButton() {
	var arrLength = selectedObjectCollection.length;
	for(var i=0; i<arrLength; i++) {
		var selectedPage = pageCollection[(selectedObjectCollection[i].pageId)];
		var selectedMarkup = selectedPage.retrieveMarkObjectInPage(selectedObjectCollection[i].markupId);
		var handles=selectedPage.handleCollections[i];
		if(selectedMarkup.markupType == markupTypes.Text || selectedMarkup.markupType == markupTypes.StickyNote){
			handles.handleCollection[9].style.display = 'none';
		}
	}
}

function showEditButton() {
	var selectedPage = pageCollection[(selectedObjectCollection[0].pageId)];
	var selectedMarkup = selectedPage.retrieveMarkObjectInPage(selectedObjectCollection[0].markupId);
	var handles=selectedPage.handleCollections[0];
	if(selectedMarkup.markupType == markupTypes.Text  || selectedMarkup.markupType == markupTypes.StickyNote){
		handles.handleCollection[9].style.display = 'block';
	}
}

function setVerticalAlignOnChange(divText,verticalAlignment) {
	var childLength = divText.childNodes.length;
	var fontSize = divText.style['fontSize'].replace("px", "");
	var heightValue = parseInt(divText.getAttribute('height'));
	var numChild = parseInt(fontSize) * parseInt(childLength-1);
	var valueY = parseInt(heightValue) + (parseInt(fontSize)/2);
	var verticalAlign = (verticalAlignment) ? verticalAlignment : getSelectedVerticalAlignment();

	if(childLength > 1) {
		switch(verticalAlign){
		case 'top':
			divText.setAttributeNS(null, 'y', parseInt(fontSize));
			break;
		case 'middle':
			divText.setAttributeNS(null, 'y', parseInt(valueY/2)-parseInt(numChild/2));
			break;
		case 'bottom':
			divText.setAttributeNS(null, 'y', parseInt(heightValue-10)-numChild);
			break;
		}
	} else {
		switch(verticalAlign){
		case 'top':
			divText.setAttributeNS(null, 'y', parseInt(fontSize));
			break;
		case 'middle':
			divText.setAttributeNS(null, 'y', parseInt(valueY/2));
			break;
		case 'bottom':
			divText.setAttributeNS(null, 'y', parseInt(heightValue-10));
			break;
		}
	}
}

function changeTspanFontSize(divText, prevFontSize) {
	var childLength = divText.childNodes.length;
	for(var i=1; i<childLength; i++) {
		var selectedSize = parseInt(divText.style['font-size'].replace('px', ''));
		var currentSize = parseInt(divText.childNodes[i].getAttribute('dy'));
		var multiplier = parseInt(currentSize/prevFontSize);
		divText.childNodes[i].setAttributeNS(null, 'dy', parseInt(selectedSize*multiplier));
	}
}

function getObjectMatrix(node)
{
	try
	{
		var matrix,
		transform = {
				x : 0,
				y : 0
		};

		if(node.transform.animVal.numberOfItems!=0)
		{
			matrix = node.transform.animVal.getItem(0).matrix;
			transform.x = parseFloat(matrix.e);
			transform.y = parseFloat(matrix.f);
		}

	}catch(err)
	{
		console.error('Exception in getObjectMatrix: '+err);
	}

	return transform;
}

function parseMatrix(matrix,index,value)
{
	matrix = matrix.substring(matrix.indexOf('('));
	matrix = matrix.substring(1,matrix.length-1);
	var splittedMatrix = matrix.split(' ');

	if(matrix.indexOf(' ')=== -1 && matrix.indexOf(',')>-1)
	{
		splittedMatrix = matrix.split(',');
	}
	newMatrix ="matrix(";
	for(var i=0;i<splittedMatrix.length;i++)
	{
		if(i===0 && index===0)
		{
			newMatrix += value;
		}
		else if(i===0)
		{
			newMatrix += splittedMatrix[i];
		}
		else if(index===i)
		{
			newMatrix +=','+value;
		}
//		else if(index===5 && i===5)
//		{
//		newMatrix +=','+value;
//		}
		else
		{
			newMatrix +=','+splittedMatrix[i];				
		}
	}
	newMatrix+=")";
	return newMatrix;
}

function showHideNoFillColor(tab) {
	var availableColors = $(getElement('availableColors'));
	if(tab != 'fill' && tab != 'border') {
		availableColors.children("#nofillColor").css({
			"display":"none",
			"cursor":"default"
		}).removeClass("nofillColor");
		availableColors.children("#nofillColor").removeClass("nofillColor");
	} else {
		availableColors.children("#nofillColor").css({
			"display":"block",
			"cursor":"pointer"
		});
		availableColors.children("#nofillColor").addClass("nofillColor");
	}
}

function processWrapping(text_element,text,fontSize,widthArea,markID,deltaX)
{
	try
	{
		widthArea-=15;
		var tspan_element = createSVGElement("tspan");
		var text_node = document.createTextNode(text[0]);
		tspan_element.appendChild(text_node);
		text_element.appendChild(tspan_element);
		tspan_element.setAttributeNS(null, 'data-isi','redaction-'+(markID));
		var adjustedDY = 2;
		for(var i=1; i<text.length; i++)
		{
			var len = tspan_element.firstChild.data.length;
			tspan_element.firstChild.data += text[i];
			console.log('============================1');
			console.log(tspan_element.getComputedTextLength);
			console.log(tspan_element.getComputedTextLength());
			console.log(widthArea);
			console.log('============================2');
			if (tspan_element.getComputedTextLength() > widthArea)        
			{
				adjustedDY-=fontSize/2;
				tspan_element.firstChild.data = tspan_element.firstChild.data.slice(0, len);
				var tspan_element = createSVGElement("tspan");
				tspan_element.setAttributeNS(null, "x", deltaX);
				tspan_element.setAttributeNS(null, "dy", fontSize);
				text_node = document.createTextNode(text[i]);
				tspan_element.appendChild(text_node);
				text_element.appendChild(tspan_element);
				tspan_element.setAttributeNS(null, 'data-isi','redaction-'+(markID));
			}
		}
		text_element.setAttributeNS(null, 'dy', adjustedDY);
	}
	catch(err)
	{
		console.log(err);
	}
}

function wrapTextOnSizeChange() {
	var currentPage = pageCollection[(selectedObjectCollection[0].pageId)];
	var markupObj = currentPage.retrieveMarkObjectInPage(selectedObjectCollection[0].markupId);
	var lastSelectedDivReason = markupObj.shapes.divText;
	var textParent = lastSelectedDivReason.parentNode;
	var textParentLength = textParent.childNodes.length;
	var fullText = "";
	for (var i=0; i<textParentLength; i++) {
		var divText = textParent.childNodes[i];
		if(divText.getAttribute('class') === 'wrapTextWithNewLine') {
			fullText += divText.textContent;
			fullText += "\n";
			divText.textContent = "";
		} else {
			fullText += divText.textContent;
			divText.textContent = "";
		}
	}
	clearTextNodes(textParent);
	performWrappingAndNewLineForText(lastSelectedDivReason, fullText);
}

function clearTextNodes(textParent) {
	var textParentLength = textParent.childNodes.length;
	for (var i=textParentLength-1; i>=1; i--) {
		textParent.removeChild(textParent.childNodes[i]);
	}
}

function rotateAllTextObjects()
{
	var len = pageCollection.length;
	for(var o=0;o<len;o++)
	{					
		var page = pageCollection[o];
		if(page.textMarkups.length>0)
			page.rotateTextMarkups(page.attributes.rotateDegrees);
	}
}

function performWrappingAndNewLineForText(lastSelectedDivReason, words) {
	lastSelectedDivReason.setAttributeNS(null, 'class', 'wrapText');
	var lastCreatedTSpan = null;
	var multiplier = 1;
	var allText = words[0];
	var consecutiveLineBreaks = false;
	var widthArea = parseInt(lastSelectedDivReason.parentNode.getAttribute('width') - 15);
	for(var i=1; i<words.length; i++) {
		// if character is not a new line and is the first tspan and does
		// not need to wrap
		console.log(lastSelectedDivReason.getComputedTextLength());
		console.log(widthArea);
		if(words[i] != "\n" && lastCreatedTSpan == null && lastSelectedDivReason.getComputedTextLength() <= widthArea) {
			allText = allText + "" + words[i];
			var tspanObj = document.getElementById(lastSelectedDivReason.getAttribute('id'));
			if(tspanObj != undefined && tspanObj != null)
			{
				tspanObj.textContent = allText;
			}
			// document.getElementById(lastSelectedDivReason.getAttribute('id')).textContent
			// = allText;
		} // if character is not a new line and already has an added tspan
		// and does not need to wrap
		else if(words[i] != "\n" && lastCreatedTSpan != null && lastCreatedTSpan.getComputedTextLength() < widthArea) {
			lastCreatedTSpan.textContent = lastCreatedTSpan.textContent + "" + words[i];
		} // new line
		else {
			if(lastCreatedTSpan){
				// lastCreatedTSpan.textContent =
				// lastCreatedTSpan.textContent.replace(/^\s+|\s+$/g, '');
				lastCreatedTSpan.textContent = lastCreatedTSpan.textContent;
			}

			// handle font-size for UI naming in IE/edge
			var fontSize = lastSelectedDivReason.parentNode.style['fontSize'].replace('px', "");
			var createdSVGTspan = createSVGElement('tspan');
			createdSVGTspan.setAttributeNS(null, 'x', lastSelectedDivReason.parentNode.getAttribute('x'));
			createdSVGTspan.setAttributeNS(null, 'id', lastSelectedDivReason.getAttribute('id'));
			createdSVGTspan.setAttributeNS(null, 'data-isi', lastSelectedDivReason.getAttribute('data-isi'));
			if(consecutiveLineBreaks) {
				createdSVGTspan.setAttributeNS(null, 'dy', (parseInt(fontSize) * (multiplier-1))+2);
				consecutiveLineBreaks = false;
			} else {
				createdSVGTspan.setAttributeNS(null, 'dy', (parseInt(fontSize) * (multiplier))+2);
			}
			// if current character is not a new line and has an added tspan
			// and is greater than width of box
			if(words[i] != "\n" && lastCreatedTSpan != null && lastCreatedTSpan.getComputedTextLength() >= widthArea) {
				createdSVGTspan.textContent = words[i];
				lastCreatedTSpan = createdSVGTspan;
				createdSVGTspan.setAttributeNS(null, 'class', 'wrapText');
			} // if current character is not a new line and has no added
			// tspan and is greater than width of box
			else if(words[i] != "\n" && lastSelectedDivReason != null && lastSelectedDivReason.getComputedTextLength() >= widthArea) {
				createdSVGTspan.textContent = words[i];
				lastCreatedTSpan = createdSVGTspan;
				createdSVGTspan.setAttributeNS(null, 'class', 'wrapText');
			} // new line
			else {
				if(words[i+1] && words[i+1] != "\n"){
					if(lastCreatedTSpan){
						lastCreatedTSpan.setAttributeNS(null, 'class', 'wrapTextWithNewLine');
					} else {
						lastSelectedDivReason.setAttributeNS(null, 'class', 'wrapTextWithNewLine');
					}
					createdSVGTspan.textContent = words[i+1];
					lastCreatedTSpan = createdSVGTspan;
					multiplier=1;
					i=i+1;
					createdSVGTspan.setAttributeNS(null, 'class', 'wrapText');
				} else {
					if(lastCreatedTSpan){
						lastCreatedTSpan.setAttributeNS(null, 'class', 'wrapTextWithNewLine');
					} else {
						lastSelectedDivReason.setAttributeNS(null, 'class', 'wrapTextWithNewLine');
					}
					createdSVGTspan.textContent = words[i];
					multiplier+=1;
					consecutiveLineBreaks = true;
					createdSVGTspan.setAttributeNS(null, 'class', 'newLine');
				}
			}
			lastSelectedDivReason.parentNode.appendChild(createdSVGTspan);
		}
	}
	if(allText) {
		// document.getElementById(lastSelectedDivReason.getAttribute('id')).textContent
		// = allText.replace(/^\s+|\s+$/g, '');
		var newTspan = document.getElementById(lastSelectedDivReason.getAttribute('id'));
		if(newTspan != undefined && newTspan != null)
			document.getElementById(lastSelectedDivReason.getAttribute('id')).textContent = allText;
	}
}

function getRGBAcolor(xrgb, a)
{
	return "rgba("
	+ getRvalue(xrgb) + ", "
	+ getGvalue(xrgb) + ", "
	+ getBvalue(xrgb) + ", "
	+ a + ")";
}

function getRGBvalue(rgba)
{
	if(rgba.indexOf('transparent')>-1) return "rgb(0, 0, 0)";
	else return "rgb("
	+ getRvalue(rgba) + ", "
	+ getGvalue(rgba) + ", "
	+ getBvalue(rgba) + ")";
}

function getRGBarray(xrgb)
{
	var rgbArray = "";
	if(xrgb.indexOf('transparent')>-1) {
		rgbArray = "0, 0, 0";
	} else {
		rgbArray = xrgb.substring(xrgb.indexOf('(')+1, xrgb.lastIndexOf(')'));
	}
	return rgbArray.split(",");
}

function getRvalue(rgb)
{
	var rgbArrLen = getRGBarray(rgb);
	if(rgbArrLen.length === 3 || rgbArrLen.length === 4){
		return getRGBarray(rgb)[0].trim();
	}
}

function getGvalue(rgb)
{
	var rgbArrLen = getRGBarray(rgb);
	if(rgbArrLen.length === 3 || rgbArrLen.length === 4){
		return getRGBarray(rgb)[1].trim();
	}
}

function getBvalue(rgb)
{
	var rgbArrLen = getRGBarray(rgb);
	if(rgbArrLen.length === 3 || rgbArrLen.length === 4){
		return getRGBarray(rgb)[2].trim();
	}
}

function getAvalue(rgba)
{
	var rgbArrLen = getRGBarray(rgba);
	if(rgbArrLen.length === 3 || rgbArrLen.length === 4){
		return getRGBarray(rgba)[3].trim();
	}
}

function rotatePageLoadAnnotation(pageIndex, degrees) {
	var viewerChild = $(getElement('viewer-document-wrapper')).children(".pageContent"),
	$this =  viewerChild.eq(pageIndex);
	if ($this.length) { // Check if page element is existing
		var newPgW, newPgH, rotateX, rotateY,
		pgContentW = $this[0].style.width,
		pgContentH = $this[0].style.height,
		svgPgW = pageCollection[pageIndex].attributes.pageWidth,
		svgPgH = pageCollection[pageIndex].attributes.pageHeight;

		switch (degrees) {
		case 90:
			newPgW = pgContentH;
			newPgH = pgContentW;
			rotateX = svgPgH / 2;
			rotateY = rotateX;
			break;
		case 180:
			newPgW = pgContentH;
			newPgH = pgContentW;
			rotateX = svgPgW / 2;
			rotateY = svgPgH / 2;
			break;
		case 270:
			newPgW = pgContentH;
			newPgH = pgContentW;
			rotateX = svgPgW / 2;
			rotateY = rotateX;
			break;
		case 0:
		case 360:
		default:
			newPgW = pgContentH;
		newPgH = pgContentW;
		rotateX = svgPgH / 2;
		rotateY = rotateX;
		break;
		}

		// Store page rotate settings
		pageCollection[pageIndex].attributes.rotateDegrees = degrees;
		pageCollection[pageIndex].attributes.rotateX = rotateX;
		pageCollection[pageIndex].attributes.rotateY = rotateY;

		var gWrap = $this.find(".gWrapper");
		if (hasNativeSVG($this) || gWrap) {
			if (gWrap.prop("tagName") == "g") {
				// Set transform matrix value
				var t = getTransformMatrixValue(scaleFactor, degrees, rotateX, rotateY);
				Snap(gWrap[0]).transform(t);
			}
		}
		// Set new page dimensions
		$this.width(newPgW);
		$this.height(newPgH);

		reCalculateHandles(pageCollection[pageIndex]);
	}

	// Check each page if viewable in the view port
	displayViewableSvg($this);
}

function attachDrawFinishFunction(drawnObject,isIEX)
{
	var previousIE = JSON.parse(JSON.stringify(isIE));
	if(isIEX != undefined)
	{
		isIE = isIEX;
	}	
	if(drawnObject.attributes.type == markupTypes.RectangleRedaction || drawnObject.attributes.type == markupTypes.TextRedactHighlight)
	{
		var mouseOut = function(e)
		{
			var redactionObj = drawnObject;
			var opacity = (redactionObj.visibilityMode === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
			redactionObj.setOpacityDisplay(opacity);
		};

		var mouseOver = function(e)
		{
			var redactionObj = drawnObject;
			var udvPage = pageCollection[retrievePageNumber(redactionObj.shapes.SVGRectangle)-1];

			if(!udvPage.isMarkupSelected(redactionObj.attributes.id))
			{
				redactionObj.shapes.SVGRectangle.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=20)';
				if(isSafari)
				{
					redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill-opacity','0.2');
				}
				else
				{
					redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill','rgba(0, 0, 0, 0.2)');
				}

				if(isIE)
				{
					redactionObj.shapes.SVGText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';
					redactionObj.shapes.SVGText.style.fill = 'rgba(255, 255, 255, 0)';	
				}
				else
				{
					redactionObj.shapes.divText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';
					redactionObj.shapes.divText.style.color = 'rgba(255, 255, 255, 0)';	
				}
			}
		};

		drawnObject.resetViewable = function()
		{
			var redactionObj = drawnObject;
			var opacity = (redactionObj.visibilityMode === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
			redactionObj.setOpacityDisplay(opacity);
		};

		drawnObject.shapes.SVGRectangle.addEventListener('mouseover',mouseOver,false);
		drawnObject.shapes.SVGRectangle.addEventListener('mouseout',mouseOut,false);

		if(isIE)
		{
			drawnObject.shapes.SVGText.addEventListener('mouseover',mouseOver,false);
			drawnObject.shapes.SVGText.addEventListener('mouseout',mouseOut,false);
		}
		else // Non-IE
		{
			drawnObject.shapes.divText.addEventListener('mouseover',mouseOver,false);
			drawnObject.shapes.divText.addEventListener('mouseout',mouseOut,false);
		}
	}
	if(previousIE != isIE)
		isIE = previousIE;
}

function redactionHandlingMouseOut()
{
	var UDV_id = this.getAttributeNS(null, 'data-isi');
	var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
	var udvPage = pageCollection[pageNumber-1];
	var redactionObj = udvPage.retrieveMarkObjectInPage(markIdSelected);
	var opacity = (redactionObj.markupVisibility === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
	drawnObject.shapes.SVGRectangle.style.fill = 'rgba(0, 0, 0, ' + opacity + ')';
	drawnObject.shapes.SVGRectangle.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=20)';

	drawnObject.shapes.SVGText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
	drawnObject.shapes.SVGText.style.fill = 'rgba(255, 255, 255, ' + opacity + ')';
}

function redactionHandlingMouseOver()
{
	var UDV_id = this.getAttributeNS(null, 'data-isi');
	var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
	var udvPage = pageCollection[pageNumber-1];
	if(!udvPage.isMarkupSelected(markIdSelected)) {
		drawnObject.shapes.SVGRectangle.style.fill = 'rgba(0, 0, 0, 0.2)';
		drawnObject.shapes.SVGRectangle.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=20)';

		drawnObject.shapes.SVGText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';
		drawnObject.shapes.SVGText.style.fill = 'rgba(255, 255, 255, 0)';
	}
}

function resetViewable()
{
	var UDV_id = drawnObject.shapes.SVGText.getAttributeNS(null, 'data-isi');
	var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
	var udvPage = pageCollection[pageNumber-1];
	var redactionObj = udvPage.retrieveMarkObjectInPage(markIdSelected);
	var opacity = (redactionObj.markupVisibility === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
	drawnObject.shapes.SVGRectangle.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
	drawnObject.shapes.SVGRectangle.style.fill = 'rgba(0, 0, 0, ' + opacity + ')';
	drawnObject.shapes.SVGRectangle.style.fill = 'rgba(0, 0, 0, ' + opacity + ')';

	drawnObject.shapes.SVGText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
	drawnObject.shapes.SVGText.style.fill = 'rgba(255, 255, 255, ' + opacity + ')';
}

function setToolBoxValues(annotationObject) {
	var selectedToolBox = documentViewer.annotationToolBox[annotationObject];
	var singleSelectedObject = getSingleSelectedObject(0);
	var singleSelectedText = getSingleSelectedTextObject();
	switch(annotationObject){

	case markupTypes.Text:
		selectedToolBox.fontColor = isIE ? singleSelectedText.style['fill'] : singleSelectedText.style['color'];
		selectedToolBox.fontFamily = singleSelectedText.style['fontFamily'];
		selectedToolBox.fontSize = singleSelectedText.style['fontSize'];
		selectedToolBox.horizontalAlign = singleSelectedText.style['textAlign'];
		selectedToolBox.verticalAlign = singleSelectedText.style['verticalAlign'];
		selectedToolBox.boldStyle = singleSelectedText.style['fontWeight'] == 'bold' ? true : false;
		selectedToolBox.italicStyle = singleSelectedText.style['fontStyle'] == 'italic' ? true : false;
		if(singleSelectedText.style['textDecoration'] == 'underline') {
			selectedToolBox.underlineStyle = true;
			selectedToolBox.strikeStyle = false;
		} else if(singleSelectedText.style['textDecoration'] == 'line-through') {
			selectedToolBox.underlineStyle = false;
			selectedToolBox.strikeStyle = true;
		} else if(singleSelectedText.style['textDecoration'] == 'underline line-through') {
			selectedToolBox.underlineStyle = true;
			selectedToolBox.strikeStyle = true;
		} else {
			selectedToolBox.underlineStyle = false;
			selectedToolBox.strikeStyle = false;
		}
	case markupTypes.Circle:
	case markupTypes.Rectangle:
		selectedToolBox.fillColor = singleSelectedObject.getAttribute('fill');
		selectedToolBox.borderColor = singleSelectedObject.getAttribute('stroke');
		selectedToolBox.borderWeight = singleSelectedObject.getAttribute('stroke-width');
		selectedToolBox.opacityLevel = singleSelectedObject.getAttribute('data-opacity') * 100 + '%';
		selectedToolBox.opacityLevelDecimal = singleSelectedObject.getAttribute('data-opacity');
		break;
	case markupTypes.Line:
	case markupTypes.Arrow:
		selectedToolBox.fillColor = singleSelectedObject.getAttribute('stroke');
		selectedToolBox.borderWeight = singleSelectedObject.getAttribute('stroke-width');
		selectedToolBox.opacityLevel = singleSelectedObject.getAttribute('data-opacity') * 100 + '%';
		selectedToolBox.opacityLevelDecimal = singleSelectedObject.getAttribute('data-opacity');
		break;
	case markupTypes.RectangleRedaction:
	case markupTypes.TextRedactHighlight:
		selectedToolBox.reason = $('.reasons-holder').parent().siblings('.selected-reason').children('span').text();
		break;
	case markupTypes.TextHighLight:
	case markupTypes.CollabHighlight:
		selectedToolBox.fillColor = singleSelectedObject.getAttribute('fill');
		selectedToolBox.opacityLevel = singleSelectedObject.getAttribute('data-opacity') * 100 + '%';
		selectedToolBox.opacityLevelDecimal = singleSelectedObject.getAttribute('data-opacity');
		break;
	}
}

function getTransformMatrixValue(scaleFactor, rotationDegrees, rotationXaxis, rotationYaxis) {
	var transformMatrix = new Snap.Matrix();
	transformMatrix.scale(scaleFactor);
	transformMatrix.rotate(rotationDegrees, rotationXaxis, rotationYaxis);
	return transformMatrix;
}

function getTextTransformRotate(degrees,x,y,width,height)
{
	var deg,rx,ry;
	switch(degrees)
	{
	case 0:
	case 360:
		deg = 0;
		if(isIE) {
			rx = x;
			ry = y;
		} else {
			rx = x + (height / 2);
			ry = y + (height / 2);			
		}
		break;
	case 90:
		deg = 270;
		if(isIE) {
			rx = (y + (height)) * -1;
			ry = x;
		} else {
			rx = x + (height / 2);
			ry = y + (height / 2);			
		}
		break;
	case 180:
		deg = 180;
		if(isIE) {
			rx = (x + (width)) * -1;
			ry = (y + (height)) * -1;
		} else {
			rx = x + (width / 2);
			ry = y + (height / 2);			
		}
		break;
	case 270:
		deg = 90;
		if(isIE) {
			rx = y;
			ry = (x + width) * -1;
		} else {
			rx = x + (width / 2);
			ry = y + (width / 2);			
		}
		break;
	}
	var transform = new Snap.Matrix();
	if(isIE) {
		transform = 'rotate('+deg+') translate('+rx+' '+ry+')';
	} else {
		transform = 'rotate('+deg+','+rx+','+ry+')';
	}
	return transform;
}

function rotateTextLabel(textMarkupDom,textValue)
{
	if(textMarkupDom) {
		var udvId = textMarkupDom.getAttribute('data-isi');
		if(udvId) {
			var pageIndex = parseInt(retrievePageNumber(textMarkupDom))-1;
			var udvPage = pageCollection[pageIndex];
			if(udvPage) {
				var markIdSelected = parseInt(udvId.substring(udvId.indexOf('-')+1,udvId.length));
				var selectedMarkup = udvPage.retrieveMarkObjectInPage(markIdSelected);
				if(selectedMarkup) {
					selectedMarkup.setText(textValue);
					selectedMarkup.rotateTextObject(udvPage.attributes.rotateDegrees);
				}
			}
		}
	}
}

function activateTab(markupType) {
	if(markupType === markupTypes.RectangleRedaction || markupType === markupTypes.TextRedactHighlight) {
		$(getElement('redactTab')).addClass("tab-active").siblings('li').removeClass("tab-active");
		$('.under-redact').show().siblings().hide();
	} else if (markupType === markupTypes.StrikeThrough || markupType === markupTypes.CollabHighlight) {
		$(getElement('collabTab')).addClass("tab-active").siblings('li').removeClass("tab-active");
		$('.collab-container').show().siblings().hide();
	} else {
		$(getElement('annotateTab')).addClass("tab-active").siblings('li').removeClass("tab-active");
		$('.under-annotate').show().siblings().hide();
	}
}

function retrieveViewableIndex()
{
	var viewablePages = $('.gWrapper');
	var length = viewablePages.length;
	var pgid = '';
	var pages = [];

	for(var i=0;i<length;i++)
	{
		pgid = viewablePages[i].parentNode.id;
		pgid = parseInt(pgid.substring(5,pgid.length))-1;
		pages.push(pgid);
	}
	return pages;
}

function msieversion()
{
	var ua = window.navigator.userAgent;
	var msie = ua.substring(ua.indexOf("rv")+3,ua.length);
	msie = parseInt(msie.substring(0,msie.indexOf(")")));
	return msie;
}

function fixArrows()
{
	var viewablePages = retrieveViewableIndex();
	var pageLength = viewablePages.length;
	for(var p=0;p<pageLength;p++)
	{
		var udvPage = pageCollection[viewablePages[p]];
		if(udvPage.hasDrawnObject())
		{
			for(var i=0;i<udvPage.markups.length;i++)
			{
				var markup = udvPage.markups[i];
				if(markup.markupType === markupTypes.Arrow)
				{
					removeObjectFromDom(markup.shapes.group, markup.shapes.SVGArrowHead);
					removeObjectFromDom(markup.shapes.group, markup.shapes.SVGLine);
					appendObjectToDom(markup.shapes.group, markup.shapes.SVGArrowHead);
					appendObjectToDom(markup.shapes.group, markup.shapes.SVGLine);
				}
			}
		}
	}
}

function setMouseStyle() {
	var viewerWrapper = $(getElement('viewer-document-wrapper'));
	var handTool = $(getElement('page-handtool'));
	viewerWrapper.removeClass('cursorCrosshair');
	viewerWrapper.removeClass('text-cursor');
	if(handTool.data('laststate') == true){
		handTool.data('drag','enable').addClass('selected-tool');
		viewerWrapper.dragScroll();
	} else {
		viewerWrapper.css('cursor','default');
	}
}

function breakCacheParameter()
{
	return '&date='+ new Date().getTime();
}

function sendConversionRequest(fileAbsPath)
{	
	var request = 
	{
		nativeFilePath : fileAbsPath,
		timezone : documentViewer.timezone,
	};
	
	WSConvertDocument(request);
}

function sendBatchConversionRequest(fileAbsPath,batchSize,callback)
{
	var batchSuccess = function()
	{
			callback();
			getReportFile(fileAbsPath,batchSize);
	};
	
	var request = 
	{
		type : 'POST',
		url : 'tosvgbatch?nativeFilePath=' + fileAbsPath + "&timezone=" + documentViewer.timezone+"&batchSize="+batchSize,
		onSuccess : batchSuccess
	};
	createConvertServiceRequest(request);
	
}

function cleanUpDocument(fileAbsPath)
{
	var request = 
	{
		type : 'POST',
		url :  'cleanUpDocument?nativePath=' + fileAbsPath
	};
	createDocumentServiceRequest(request);
}

function duplicateNativeFile(fileAbsPath,destination,batchSize)
{
	var request = 
	{
		type : 'POST',
		url :  'duplicateFile?nativePath=' + fileAbsPath+'&destinationFolderPath='+destination+'&batchSize='+batchSize
	};
	createDocumentServiceRequest(request);
}

function getReportFile(nativePath,batchSize)
{
	var url = documentViewer.domain + '/DocViewerWS/rest/document/reportFile?nativePath=' + nativePath+'&batchSize='+batchSize+breakCacheParameter();
	window.location=url;
}

function hideNotification() {
	try
	{
		var DVNotif = $(getElement('DV-Notif'));
		DVNotif.animate({
			'top':'-85px',
			'opacity':0
		},600);		
	}
	catch(err)
	{
		console.log('WARNING.Notification was not cleared.');
	}

}

function hideNavigationButtons() {
	var navButtons = $('.page-nav-container');
	navButtons.css('display', 'none');
}

function resetDefaultVisibilityMode() {
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
}

/**
 * Show/hide print button.
 * @param isEnable
 */
function displayPrintButton(isEnable) {
	if(isEnable === true) {
		displayTool($('.printDocument'), true);
	} else {
		documentViewer.disablePrintButton = true;
		displayTool($('.printDocument'), false);
	}
}

function hideRedactTab()
{
	displayTool($('.redact-tab'), false);
}

function hideAnnotateTab()
{
	displayTool($('.annotate-tab'), false);
}

function displaySaveButton(isEnable) {
	if(isEnable === true) {
		displayTool($('.saveDocSettings'), true);
	} else {
		displayTool($('.saveDocSettings'), false);
	}
}

function hasObjectsOnDocument()
{
	var hasObjects =
	{
			hasRedactions : false,
			hasAnnotations : false
	};

	var length = pageCollection.length;
	var hasRedactions = false;
	var hasAnnotations = false;
	var page;
	for(var i=0;i<length;i++)
	{
		page = pageCollection[i];
		if(!hasRedactions)
		{
			if(page.hasRedactions())
			{
				hasRedactions = true;
				hasObjects.hasRedactions = true;
			}
		}

		if(!hasAnnotations)
		{
			if(page.hasAnnotations())
			{
				hasAnnotations = true;
				hasObjects.hasAnnotations = true;
			}
		}
	}

	return hasObjects;
}

//
//function isMobile()
//{
//	var isMobile = false; // initiate as false
//	// device detection
//	if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
//			|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) 
//		isMobile = true;
//}

/**
 * Clears document of all search highlights. This is used
 * To prepare the document for another search query
 */
function clearSearch()
{
	lastQuery = '';
	highlightWalkerCollection = [];
	getElement('walker').innerHTML='0';
	getElement('resultHit').innerHTML='0';
	clearAllSearchHighlights();
}

function clearSearch2()
{
	highlightWalkerCollection = [];
	getElement('walker').innerHTML='0';
	getElement('resultHit').innerHTML='0';
	clearAllSearchHighlights();
}

/**
 * Executes search ajax request to retrieve hit terms and creates SearchHighlight annotations on the viewer
 * To display hit terms
 * @param searchQuery
 * @param isUDV
 */
function search(searchQuery,isUDV)
{
	clearAllSearchHighlights();
	var onSuccessSearch = function(searchRequest)
	{
		var totalHits = 0;
		var responseJSON = JSON.parse(searchRequest.responseText);
		if(responseJSON=== undefined || responseJSON === null || responseJSON.length === 0)
		{
			//no hit
			getElement('walker').innerHTML='0';
			return;
		}

			
		var len = responseJSON.length;
		// var pages = responseJSON.pages;
		var page;
		var rectanglesGenerated = null;
		var rectLength = null;
		var udvPage = null;
		var word = null;
		var wordLength = null;
		for(var i=0;i<len;i++)
		{
			page = responseJSON[i];
			udvPage = pageCollection[parseInt(page.page)];
			if(udvPage)
			{
				rectanglesGenerated = page.rectangles;
				rectLength = rectanglesGenerated.length;
				for(var x=0;x<rectLength;x++)
				{
					totalHits++;
					word = rectanglesGenerated[x];
					wordLength = rectanglesGenerated[x].length;
					udvPage.addHitTerm(word);
				}
			}
			else
			{
				tempHighlightCollection[parseInt(page.page)] = page;
			}

		}
		getElement('walker').innerHTML='1';
		document.getElementById('resultHit').innerHTML = totalHits;
		navigateToNextTerm(0);
	};

	var request = 
	{
		type : 'POST',
		url :  'queryUDV?nativeFilePath=' + documentViewer.documentAbsPath + "&isUDV="+(isUDV === undefined ? 'false' : 'true')+"&searchQuery=" + searchQuery,
		onSuccess : onSuccessSearch
	};
	createSearchServiceRequest(request);
}

function patternSearch(patternQuery,reason,save)
{
	var onSuccessPatternSearch = function(searchRequest)
	{
		var totalHits = 0;
		var responseJSON = JSON.parse(searchRequest.responseText);
		var len = responseJSON.length;
		var page;
		var rectanglesGenerated = null;
		var rectLength = null;
		var udvPage = null;
		var word = null;
		var wordLength = null;
		var firstTextRedactInstance;
		var temp;
		for(var i=0;i<len;i++)
		{
			page = responseJSON[i];
			udvPage = pageCollection[parseInt(page.page)];
			if(udvPage != undefined)
			{
				rectanglesGenerated = page.rectangles;
				rectLength = rectanglesGenerated.length;
				for(var x=0;x<rectLength;x++)
				{
//					totalHits++;
					word = rectanglesGenerated[x];
//					wordLength = rectanglesGenerated[x].length;
					temp = udvPage.addPatternRedaction(word,reason);
					if(x===0)
					{
						firstTextRedactInstance = temp;
					}
				}
				if(firstTextRedactInstance !== undefined)
				{
					udvPage.setLastHighlightIndex($(firstTextRedactInstance.shapes.group).index());
				}
			}


		}
		
		if(save === true)
		{
			saveWithCallback();
		}

	};

	var patternPath = documentViewer.patternPath;
	if(patternPath!=undefined && patternPath.length>0)
	{
		patternPath = '&patternPath='+patternPath;
	}
	else
	{
		patternPath = '';
	}
	
	var request = 
	{
		type : 'POST',
		url :  'patternSearch?nativeFilePath=' + documentViewer.documentAbsPath + patternPath + "&searchQuery=" + patternQuery,
		onSuccess : onSuccessPatternSearch
	};
	createSearchServiceRequest(request);
} 

function createFullPageRedact(pageRedactCollection, redactText){
	var pageRedactLen = pageRedactCollection.length;
	for(var i = 0; i < pageRedactLen; i++) {
		var pageIndexRedact = pageRedactCollection[i]-1;
		var drawObject = createDrawnObject(markupTypes.RectangleRedaction);
		var udvPageForProcessing = pageCollection[pageIndexRedact];
		var rotateDeg = udvPageForProcessing.attributes.rotateDegrees;
		var attributes;
		if (udvPageForProcessing.svgMarkupGroup == null || udvPageForProcessing.svgMarkupGroup == undefined) {
			var svgMarkupGroup = createSVGElement("g");
			svgMarkupGroup.setAttribute("data-isi", "markups-"+ (pageIndexRedact+1));	// markups-<pageNo>
			udvPageForProcessing.svgMarkupGroup = svgMarkupGroup;
		}
		markupId++;
		drawObject.setId(markupId);
		initializePreDrawProcess(markupTypes.RectangleRedaction, drawObject, udvPageForProcessing.svgMarkupGroup, redactText);
		drawObject.shapes.group.setAttributeNS(null, 'data-isi','redaction-'+markupId);
		drawObject.setX(0);
		drawObject.setY(0);
		drawObject.setWidth(udvPageForProcessing.attributes.pageWidth);
		drawObject.setHeight(udvPageForProcessing.attributes.pageHeight);
		drawObject.setFontColor('rgb(255, 255, 255)');
		drawObject.setFillColor('rgba(0, 0, 0, 1)');
		drawObject.visibilityMode = visibilityMode.Shown;
		drawObject.setOpacity(1);
		drawObject.setText(redactText);
		drawObject.rotateTextObject(rotateDeg);
		attachSnapToDrag(drawObject.shapes.group);
		udvPageForProcessing.addMarkupObject(drawObject);
		attachDrawFinishFunction(drawObject);
		//RM:change function call redaction transparency
//		showHideRedactedFileContent(drawObject, pageIndexRedact+1);
	}
}

function createHighlightAnnotations(svgHighlightGroup,rectangles)
{
	var drawnObject;
	drawnObject = createDrawnObject(markupTypes.SearchHighlight);
	markupId++;
	drawnObject.setId(markupId);
	initializePreDrawProcess(markupTypes.SearchHighlight, drawnObject, svgHighlightGroup, undefined);
	drawnObject.setX(parseFloat(rectangles[0]));
	drawnObject.setY(parseFloat(rectangles[1]));
	drawnObject.setWidth(parseFloat(rectangles[2]));
	drawnObject.setHeight(parseFloat(rectangles[3]));
	drawnObject.setOpacity(0.5);
	drawnObject.setFillColor(defaultHighlightColor);
	return drawnObject;
}

function createTextRedaction(svgTextRedactionGroup,rectangles,reason,currentPage)
{
	var drawnObject;
	drawnObject = createDrawnObject(markupTypes.TextRedactHighlight);

	markupId++;
	drawnObject.setId(markupId);
	initializePreDrawProcess(markupTypes.TextRedactHighlight, drawnObject, svgTextRedactionGroup, true);
	if(drawnObject.shapes.group){
		var drawnObjMarkupGrp = drawnObject.shapes.group.parentNode;
		if(currentPage.getLastHighlightIndex()!== undefined)
		{
			var lastHighlightGroup = $(drawnObject.shapes.group.parentNode.childNodes).get(currentPage.getLastHighlightIndex());
			if (lastHighlightGroup){
				if (lastHighlightGroup.nextSibling != null && lastHighlightGroup.nextSibling != drawnObject.shapes.group){
					drawnObjMarkupGrp.insertBefore(drawnObject.shapes.group,lastHighlightGroup.nextSibling);
				} else {
					drawnObjMarkupGrp.appendChild(drawnObject.shapes.group);
				}
			}
		}
		else
		{
			drawnObjMarkupGrp.insertBefore(drawnObject.shapes.group,drawnObjMarkupGrp.firstChild);		
		}
	}
	drawnObject.setX(parseFloat(rectangles[0]));
	drawnObject.setY(parseFloat(rectangles[1]));
	drawnObject.setWidth(parseFloat(rectangles[2]));
	drawnObject.setHeight(parseFloat(rectangles[3]));
	drawnObject.setOpacity(1);
	drawnObject.setFillColor(defaultRedactionFillColor);
	drawnObject.setFontColor(defaultRedactionFontColor);
	drawnObject.setText(reason);
	drawnObject.visibilityMode = visibilityMode.Shown;
	drawnObject.rotateTextObject(currentPage.attributes.rotateDegrees);
	attachDrawFinishFunction(drawnObject);
	var objStack = [];
	objStack.push(drawnObject);
	var redactionInstance = 
		{
			attributes : drawnObject.attributes,
			id : drawnObject.id,
			markupType : markupTypes.TextRedactHighlight,
			shapes : drawnObject.shapes,
			drawnObjectCollection : objStack
		};
	return redactionInstance;
}

function clearAllSearchHighlights()
{
	var pageCount = pageCollection.length;
	var page;
	for(var ctr=0;ctr<pageCount;ctr++)
	{
		page = pageCollection[ctr];
		if(page.highlightCollection.length>0 || page.tempHighlights.length)
			pageCollection[ctr].clearHighlights();
	}
}

function hidePrintModal()
{
	var blockerContainer = $(getElement('blocker'));
	var	DV_PrintModal = $(getElement('DV-PrintModal'));
	DV_PrintModal.css('display','none');
	blockerContainer.css('display','none');
}

var fitToWidthHandler = function()
{
	isFitContent = !isFitContent;
	$(getElement('fitToWidth')).toggleClass('active-state');
	fitToWidthViewablePages();
	if(!isFitContent)
	{
		transferTextAreaValuetoDiv(lastSelectedDivReason);
		zoomAllPages(scaleFactor);
	}
	
	if($(getElement('fitToWidth')).hasClass('active-state')){
		if(documentViewer.fitOnLoadCallback){
			documentViewer.fitOnLoadCallback(true);
			documentViewer.fitOnLoad=true;
		}
		if(documentViewer.isJPLT === true){
			updateIsFitOnLoadJPLT(true);
			documentViewer.fitOnLoad=true;
		}
		
	}else{
		if(documentViewer.fitOnLoadCallback){
			documentViewer.fitOnLoadCallback(false);
			documentViewer.fitOnLoad=false;
		}
		if(documentViewer.isJPLT === true){
			updateIsFitOnLoadJPLT(false);
			documentViewer.fitOnLoad=false;
		}
	}	
};

try
{
	document.getElementById('fitToWidth').addEventListener('mouseup',
			fitToWidthHandler
	);	
}
catch(err)
{
	console.log(err);
}

function fitToWidthViewablePages()
{

	var isFitted = isFitContent;
	var pageWidth = getViewerContainerWidth();

	function fitCurrentPage() {
		var viewerWrapper = $(getElement('viewer-document-wrapper'));
		viewerChild = viewerWrapper.children(".pageContent"),
		pageCount = viewerChild.length;

		var viewerContainer = $(getElement('viewerContainer'));
		var lastCurScrollPercent = curscrollPercentage;
		preZoomPageNo = parseInt($('.current-page').val());
		zoomScroll = true;

		var pages = viewerWrapper.children('.pageContent:has(svg)');
		var docLength = pages.length;
		var udvPage;
		var extractId;
		var divPage;
		for(var i=0;i<docLength;i++)
		{
			divPage = pages[i];
			extractId = divPage.id;
			extractId = extractId.substring(extractId.indexOf('_page_')+6,extractId.length)-1;
			udvPage = pageCollection[extractId];
			newFit(udvPage,divPage.firstChild.firstChild,isFitted,pageWidth);
		}

		HScrollBarChecker();

		getScrollHeightPercentage(pageCount);
		viewerContainer.scrollTop(currentScrollVal(lastCurScrollPercent, scrollDiff));
	}

	fitCurrentPage();

}

/**
 * Retrieves current viewer width. Used for calculation of new
 * Page width when enabling Fit To Width
 * @returns
 */
function getViewerContainerWidth()
{
	return parseFloat(document.getElementById('viewer-document-wrapper').offsetWidth-20);
}


function getFitToWidthScaleFactor(pageWidth)
{
	return parseFloat(parseFloat(document.getElementById('viewer-document-wrapper').offsetWidth-20)/pageWidth);
}

/**
 * Applies fit to width to specific page of the document.
 * @param udvPage
 * @param gWrap
 * @param isFitted
 * @param viewerWidth
 */
function newFit(udvPage,gWrap,isFitted,viewerWidth)
{
	var facter,newDivHeight,rotDeg = udvPage.attributes.rotateDegrees; 

	if(rotDeg === 90 || rotDeg === 270)
	{
		facter = viewerWidth/udvPage.attributes.pageHeight;
		newDivHeight=parseFloat(udvPage.attributes.pageWidth*facter);
	}
	else
	{
		facter = viewerWidth/udvPage.attributes.pageWidth;
		newDivHeight=parseFloat(udvPage.attributes.pageHeight*facter);
	}
	
	var newMatrix,
	originalHeightMatrix = gWrap.transform.animVal.getItem(0).matrix.d,
	newHeightMatrix = (originalHeightMatrix*1.0)/facter,
	divParent = gWrap.parentNode.parentNode,
	attributes = udvPage.attributes,
	pgContentW = attributes.pageWidth,
	pgContentH = attributes.pageHeight,
	newPgW = 0,
	newPgH = 0,
	xPost = 0,
	yPost = 3,
	xFactor = facter,
	yFactor = facter;
	if(isFitted && (originalScaleFactor === -1 || isResizing))
	{
		if(!isResizing)
		{
			originalScaleFactor = scaleFactor;
			scaleFactor = facter;			
		}
		else if(isResizing)
		{
			scaleFactor = facter;
		}
	}
	else if(!isFitted)
	{
		if(originalScaleFactor!= -1)
			scaleFactor = originalScaleFactor;
		else
			scaleFactor = documentViewer.scaleFactor;
		originalScaleFactor = -1;
	}

	if(!isFitted && !isResizing)
	{
		divParent.style.width=attributes.pageWidth+'px';
		divParent.style.height=attributes.pageHeight+'px';
		newMatrix = parseMatrix(gWrap.getAttributeNS(null,'transform'),0,scaleFactor);
		newMatrix = parseMatrix(newMatrix,3,scaleFactor);	
	}
	else
	{
		if(attributes.isFitted === false)
		{
			if(rotDeg === 90 || rotDeg === 270)
			{
				divParent.style.height = parseFloat(pgContentW*facter)+'px';
				divParent.style.width = parseFloat(pgContentH*facter)+'px';
			}
			else
			{
				divParent.style.height = parseFloat(pgContentH*facter)+'px';
				divParent.style.width = parseFloat(pgContentW*facter)+'px';				
			}

			// attributes.isFitted = true;
		}

		switch(attributes.rotateDegrees)
		{
			case 90: 
			case 270: 
				xPost = 1;
				yPost = 2;
				break;
		}

		switch(attributes.rotateDegrees)
		{
			case 90: yFactor*=-1;break;
			case 270: xFactor*=-1;break;
			case 180: xFactor*=-1;yFactor*=-1;break;
		}

		newMatrix = parseMatrix(gWrap.getAttributeNS(null,'transform'),xPost,xFactor);
		newMatrix = parseMatrix(newMatrix,yPost,yFactor);
		if(attributes.rotateDegrees == 270)
		{
			newMatrix = parseMatrix(newMatrix,5,parseFloat(pgContentW*facter));
		}
		else if(attributes.rotateDegrees == 90)
		{
			newMatrix = parseMatrix(newMatrix,4,parseFloat(pgContentH*facter));
		}
	}
	setZoomLabel(parseFloat((scaleFactor * 100)).toFixed(0) + "%");
	gWrap.setAttributeNS(null,'transform',newMatrix);
	reCalculateHandles(udvPage);
	getScrollHeightPercentage(pageCollection.length);
	udvPage.rotateTextMarkups(udvPage.attributes.rotateDegrees);
}

/**
 * Disables fit to width state and resets
 * Zoom value to before fit to width was applied
 */
function disableFitToWidth()
{
	if(isFitContent === true)
	{
		fitToWidthHandler();
	}
}

/**
 * Retrieves outerHTML value of a given DOM element. This handles different browsers.
 * Also takes into account how IE Edge handles color values like rgba and rgb
 * @param element
 * @returns {String}
 */
function getOuterHTML(element)
{
	var elementOutput = '';
	if (!isSafari && !(isEdge))
		elementOutput = element.outerHTML;
	else
	{
		if(isEdge)
		{
			elementOutput = new XMLSerializer().serializeToString(element).split('rgba').join('rgb');
		}
		else
		{
			elementOutput = new XMLSerializer().serializeToString(element);			
		}
		
	}

	return elementOutput;
}

/**
 * Creates a deep copy of a markupObject. This is different from reassigning a reference since this
 * Will return a unique object with identical properties and functions.
 * This is mainly used for generating SVG with markups (annotation & redaction) for RSVG burning
 * @param markup
 * @param pageNumber
 * @param generateAsIE
 * @returns {___anonymous184170_184171}
 */
function createMarkupObject(markup,pageNumber,generateAsIE)
{
	var tempMarkup = {},
	attributes = {};
	attributes = deepCopy(attributes,markup.attributes);
	tempMarkup.attributes = attributes;
	tempMarkup.id = attributes.id;
	tempMarkup.markupType = markup.markupType;
	tempMarkup.shapes=createShapeObject(markup.markupType,generateAsIE);

	attachShapeFunctions(tempMarkup,generateAsIE);
	attachDrawFinishFunction(tempMarkup,generateAsIE);
	var svgMarkupGroup = createSVGElement("g");
	svgMarkupGroup.setAttribute("data-isi", "markups-"+ pageNumber);
	initializePreDrawProcess(tempMarkup.markupType,tempMarkup,svgMarkupGroup,tempMarkup.attributes.text,generateAsIE);
	initializeAnnotationObject(tempMarkup,generateAsIE);

	return tempMarkup;
}

function createTempRedactionObject(markup,pageNumber,generateAsIE){
	var redactBoxObjCollection = markup.drawnObjectCollection;
	var redactBoxLen = redactBoxObjCollection.length;
	var markupArray = [];
	var parentGroup;
	var svgMarkupGroup = createSVGElement("g");
	svgMarkupGroup.setAttribute("data-isi", "markups-"+ pageNumber);
	for (var k = 0; k < redactBoxLen; k++){
		var tempMarkup = {},
		attributes = {};
		attributes = deepCopy(attributes,redactBoxObjCollection[k].attributes);
		tempMarkup.attributes = attributes;
		tempMarkup.id = attributes.id;
		tempMarkup.markupType = redactBoxObjCollection[k].markupType;
		tempMarkup.shapes=createShapeObject(redactBoxObjCollection[k].markupType,generateAsIE,parentGroup);
		if (parentGroup == undefined || parentGroup == null){
			parentGroup = tempMarkup.shapes.group;
		}

		attachShapeFunctions(tempMarkup,generateAsIE);
		attachDrawFinishFunction(tempMarkup,generateAsIE);
		if(k==0){
			initializePreDrawProcess(tempMarkup.markupType,tempMarkup,svgMarkupGroup,tempMarkup.attributes.text,generateAsIE);	
		} else {
			initializePreDrawProcess(tempMarkup.markupType,tempMarkup,svgMarkupGroup,tempMarkup.attributes.text,generateAsIE,true);
		}
		initializeAnnotationObject(tempMarkup,generateAsIE);
		
		markupArray.push(tempMarkup);
	}
	
	return markupArray;
}

function deepCopy(destination, source) 
{
	for (var property in source) {
		if (typeof source[property] === "object" &&
				source[property] !== null ) {
			destination[property] = destination[property] || {};
			arguments.callee(destination[property], source[property]);
		} else {
			destination[property] = source[property];
		}
	}
	return destination;
}

function getElement(id)
{
	return document.getElementById(id);
}


function navigateToNextTerm(index)
{
	var term = highlightWalkerCollection[index];
	jumpPage(parseInt(term.pageId+1));
	var viewerContainer = $(document.getElementById('viewerContainer'));
	var rectangleObjects = term.rectangles;
	var len = rectangleObjects.length;
	viewerContainer.scrollTop(0);

	var pageId = 'udv_page_'+(term.pageId+1);
	var pageTop = parseInt($(document.getElementById(pageId)).position().top);
	var pageTopPosition =pageTop-60;
	var termYPosition = term.highlightPosition;

	viewerContainer.scrollTop(pageTopPosition+((termYPosition)+(10)));
	for(var x=0;x<len;x++)
	{
		changeToActiveHighlightColor(rectangleObjects[x]);
	}
}

/**
 * Reverts to non-active highlight color of a markupObject
 * @param markupObject
 */
function changeToHighlightColor(markupObject)
{
	markupObject.setFillColor(defaultHighlightColor);
}

/**
 * Changes the highlight color of a markupObject to active search color.
 * This is utilized by hit term navigation to differentiate the active term.
 * @param markupObject
 */
function changeToActiveHighlightColor(markupObject)
{
	markupObject.setFillColor(defaultActiveHighlightColor);
}

function shadeBlendConvert(p, from, to) {
	if(typeof(p)!="number"||p<-1||p>1||typeof(from)!="string"||(from[0]!='r'&&from[0]!='#')||(typeof(to)!="string"&&typeof(to)!="undefined"))return null; // ErrorCheck
	if(!this.sbcRip)this.sbcRip=function(d){
		var l=d.length,RGB=new Object();
		if(l>9){
			d=d.split(",");
			if(d.length<3||d.length>4)return null;// ErrorCheck
			RGB[0]=i(d[0].slice(4)),RGB[1]=i(d[1]),RGB[2]=i(d[2]),RGB[3]=d[3]?parseFloat(d[3]):-1;
		}else{
			switch(l){case 8:case 6:case 3:case 2:case 1:return null;} // ErrorCheck
			if(l<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(l>4?d[4]+""+d[4]:""); // 3
			// digit
			d=i(d.slice(1),16),RGB[0]=d>>16&255,RGB[1]=d>>8&255,RGB[2]=d&255,RGB[3]=l==9||l==5?r(((d>>24&255)/255)*10000)/10000:-1;
		}
		return RGB;}
	var i=parseInt,r=Math.round,h=from.length>9,h=typeof(to)=="string"?to.length>9?true:to=="c"?!h:false:h,b=p<0,p=b?p*-1:p,to=to&&to!="c"?to:b?"#000000":"#FFFFFF",f=sbcRip(from),t=sbcRip(to);
	if(!f||!t)return null; // ErrorCheck
	if(h)return "rgb("+r((t[0]-f[0])*p+f[0])+","+r((t[1]-f[1])*p+f[1])+","+r((t[2]-f[2])*p+f[2])+(f[3]<0&&t[3]<0?")":","+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*10000)/10000:t[3]<0?f[3]:t[3])+")");
	else return "#"+(0x100000000+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*255):t[3]>-1?r(t[3]*255):f[3]>-1?r(f[3]*255):255)*0x1000000+r((t[0]-f[0])*p+f[0])*0x10000+r((t[1]-f[1])*p+f[1])*0x100+r((t[2]-f[2])*p+f[2])).toString(16).slice(f[3]>-1||t[3]>-1?1:3);
}

var inheritsFrom = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
};

/**
 * accepts mouse coordinates and bounding box collection from back-end
 * returns bounding box index
 */
function checkBoundingBox(mouseX, mouseY, pageTextBBox){
	var numBoxes = pageTextBBox.length;
	var rectangleGen = null;
	var hit = false;
	var i = 0;
	var indexHit = null;
	var previousBox = null;
	while (!hit && i < numBoxes) {
//		previousBox = rectangleGen;
		rectangleGen = pageTextBBox[i];
		var x = rectangleGen[0];
		var y = rectangleGen[1];
		var width = rectangleGen[2];
		var height = rectangleGen[3];
		if ((mouseX >= x && mouseX <= x+width) && (mouseY >= y && mouseY <= y+height)){
			hit = true;
			indexHit = i;
		}
//		else if(previousBox)
//		{
//			var prevX = previousBox[0];
//			var prevY = previousBox[1];
//			var prevWidth = previousBox[2];
//			var prevHeight = previousBox[3];
//			if(mouseY > (prevY+prevHeight) && mouseY < y)
//			{
//				if(mouseY > (y-(prevY+prevHeight))/4)
//				{
//					hit = true;
//					indexHit = i;
//				}
//				else
//				{
//					hit = true;
//					indexHit = i-1;
//				}
//			}
//
//		}
		i++;
	}
	return indexHit;
}


/**
 * accepts mouse coordinates and bounding box collection from back-end
 * returns bounding box index
 */
function checkBoundingBoxOverlap(mouseX, mouseY, pageTextBBox){
	var numBoxes = pageTextBBox.length;
	var rectangleGen = null;
	var hit = 0;
	var i = 0;
	var previousBox = null;
	var hitCollection = [];
	while (hit<2 && i < numBoxes) {
//		previousBox = rectangleGen;
		rectangleGen = pageTextBBox[i];
		var x = rectangleGen[0];
		var y = rectangleGen[1];
		var width = rectangleGen[2];
		var height = rectangleGen[3];
		if ((mouseX >= x && mouseX <= x+width) && (mouseY >= y && mouseY <= y+height)){
//			hit = true;
			hit++;
			hitCollection.push(i);
		}
//		else if(previousBox)
//		{
//			var prevX = previousBox[0];
//			var prevY = previousBox[1];
//			var prevWidth = previousBox[2];
//			var prevHeight = previousBox[3];
//			if(mouseY > (prevY+prevHeight) && mouseY < y)
//			{
//				if(mouseY > (y-(prevY+prevHeight))/4)
//				{
//					hit = true;
//					indexHit = i;
//				}
//				else
//				{
//					hit = true;
//					indexHit = i-1;
//				}
//			}
//
//		}
		i++;
	}
	return hitCollection;
}

function hasTextCopied()
{
	var hasTextCopied = false;
	
	var textProcessed = getSelectedTextForCopy();
	if(textProcessed != '' && textProcessed.length > 0 )
	{
		hasTextCopied = true;
	}
	
	return hasTextCopied;
}

function getSelectedTextForCopy()
{
	var textArea = document.getElementById('dummy');
	var textProcessed = '';
	if(textArea != null && textArea != undefined)
	{
		if(textArea.value != undefined && textArea.value != '')
		{
			textProcessed = textArea.value.trim();
		}
	}
	
	return textProcessed;
}

/**
 * Escapes characters to be HTML compliant.
 * @param text
 * @returns
 */
function escapeHtml(text){
	var returnText = "" + text;
	var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
	};
	
	return returnText.replace(/[&<>"']/g, function(m) { return map[m]; });
}

/**
 * Selects tab in DocumentViewer. Setting of default tab is being used by function to
 * select tab.
 * @param tab
 */
function selectTab(tab)
{
	if(tab!=undefined && tab!=null)
	{
		var tab;
		switch(tab)
		{
			case 'page':
						tab = $(getElement('pageTab'));
						break;
			case 'annotate':
						tab = $(getElement('annotateTab'));
						break;
			case 'redact':
						tab = $(getElement('redactTab'));
						break;
			case 'search':
						tab = $(getElement('searchTab'));
						break;
			case 'collab':
						tab = $(getElement('collabTab'));
						break;
		}
		
		if(tab!=undefined && tab!=null)
			tab.click();
	}

}


function updateRemovedFromGroup(udvPageInstance, shapeGroup, grpDragGroup){
	var UDV_id = shapeGroup.getAttribute('data-isi');
	var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
	var selectedMarkup = udvPageInstance.retrieveMarkObjectInPage(markIdSelected);
	var shapeGroupLen = shapeGroup.childNodes.length;

	if(grpDragGroup.hasAttribute('transform')){
		
		var matrixValue = getObjectMatrix(grpDragGroup);
		//var markupForProcessing = markup.attributes;
		var shape = shapeGroup.childNodes[0];
		if(selectedMarkup.markupType === markupTypes.Line || selectedMarkup.markupType === markupTypes.Arrow ){
			
			if(selectedMarkup.markupType === markupTypes.Arrow){
				shapeGroupLen = 3;
			}
			
			for(var i=0; i<shapeGroupLen; i++){
				var lineShape=shapeGroup.childNodes[i];
				
				if(lineShape.hasAttribute('x1')){
					var x1Val = parseFloat(lineShape.getAttribute('x1'));
					selectedMarkup.setX1(x1Val + parseFloat(matrixValue.x));
				}
				if(lineShape.hasAttribute('x2')){
					var x2Val = parseFloat(lineShape.getAttribute('x2'));
					selectedMarkup.setX2(x2Val + parseFloat(matrixValue.x));
				}
				if(lineShape.hasAttribute('y1')){
					var y1Val = parseFloat(lineShape.getAttribute('y1'));
					selectedMarkup.setY1(y1Val + parseFloat(matrixValue.y));
				}
				if(lineShape.hasAttribute('y2')){
					var y2Val = parseFloat(lineShape.getAttribute('y2'));
					selectedMarkup.setY2(y2Val + parseFloat(matrixValue.y));
				}
				
				if(lineShape.hasAttribute('cx')){
					var cxVal = parseFloat(lineShape.getAttribute('cx'));
					lineShape.setAttribute('cx',cxVal + parseFloat(matrixValue.x));
				}
				if(lineShape.hasAttribute('cy')){
					var cyVal =  parseFloat(lineShape.getAttribute('cy'));
					lineShape.setAttribute('cy',cyVal + parseFloat(matrixValue.y));
				}
				
				if(selectedMarkup.markupType === markupTypes.Line){
					break;
				}
			}
		}else if(selectedMarkup.markupType === markupTypes.Circle){
			if(shape.hasAttribute('cx')){
				var cxVal = parseFloat(shape.getAttribute('cx'));
				selectedMarkup.setCX(cxVal + parseFloat(matrixValue.x));
			}
			if(shape.hasAttribute('cy')){
				var cyVal =  parseFloat(shape.getAttribute('cy'));
				selectedMarkup.setCY(cyVal + parseFloat(matrixValue.y));
			}
		}else if(selectedMarkup.markupType === markupTypes.Text){
			for(var i=0; i<shapeGroupLen; i++){
				var textBoxShape=shapeGroup.childNodes[i];
				
				if(textBoxShape.localName != 'foreignObject' ){
					if(textBoxShape.hasAttribute('x')){
						var xVal = parseFloat(textBoxShape.getAttribute('x'));
						selectedMarkup.setX(xVal + parseFloat(matrixValue.x));
					}
					if(textBoxShape.hasAttribute('y')){
						var yVal =  parseFloat(textBoxShape.getAttribute('y'));
						selectedMarkup.setY(yVal + parseFloat(matrixValue.y));
					}
				}
			}
		}else if(selectedMarkup.markupType != markupTypes.Circle){
			if(shape.hasAttribute('x')){
				var xVal = parseFloat(shape.getAttribute('x'));
				selectedMarkup.setX(xVal + parseFloat(matrixValue.x));
			}
			if(shape.hasAttribute('y')){
				var yVal =  parseFloat(shape.getAttribute('y'));
				selectedMarkup.setY(yVal + parseFloat(matrixValue.y));
			}
		}
		
	}
	
}

function updateScaleFactorJPLT(scaleFactor){
	$.ajax({
		url: "/library/rest/udv/updateSf?scaleFactor=" + scaleFactor
	}).then(function(data) {
		console.log(data);
	});
}

function updateIsFitOnLoadJPLT(isFitonLoad){
	$.ajax({
		url: "/library/rest/udv/updateFol?fitOnLoad=" + isFitonLoad
	}).then(function(data) {
		console.log(data);
	});
}

