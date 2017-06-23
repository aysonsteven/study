//All functionalities for annotation navigation are here :D
//xtian


//drawtype is either annotation or redaction
function nextDrawing(drawType){
	var markupObject;
	var UDV_id;
	var currentPosition = $("#currentPosition").text();
	
	if (drawType == 'Navigate Annotation'){
		resetAnnotationVisibility();
		
		var foundInPage = 0;
		if (currentPosition==annotationsNav.length){
			foundInPage = annotationsNav[parseInt(annotationsNav.length)-1].page; 
		}else {
			foundInPage = annotationsNav[currentPosition].page; 
		} 
		
		var currentPage = parseInt($('.current-page').val());
		if (currentPage != foundInPage){
			jumpPage(foundInPage);
			setTimeout(function(){
				var page_id = parseInt($('.current-page').val())-1;
				markupObject = annotationsNav[parseInt(currentPosition)];
				UDV_id = "annotation-"+markupObject.id;
				currentPosition++;
				$("#currentPosition").text(currentPosition);
				selectAnnotationObjectNavigate(UDV_id, page_id);
				page_id++;
				navigateToMarkup(markupObject.position, page_id);
			}, 1000);
		}else {
			var page_id = parseInt($('.current-page').val())-1;
			if (currentPosition == annotationsNav.length){
				markupObject = annotationsNav[parseInt(annotationsNav.length)-1];
				$("#currentPosition").text(annotationsNav.length);
			}else {
				if (currentPosition>0){
					markupObject = annotationsNav[parseInt(currentPosition)];
					currentPosition++;
					$("#currentPosition").text(currentPosition);
				}else {
					markupObject = annotationsNav[0];
					$("#currentPosition").text(1);
				}
				
			}
			UDV_id = "annotation-"+markupObject.id;
			selectAnnotationObjectNavigate(UDV_id, page_id);
			navigateToMarkup(markupObject.position, currentPage);
		}
		
	}else {
		resetRedactionVisibility();
		//redaction
		var foundInPage = 0;
		if (currentPosition==redactionsNav.length){
			foundInPage = redactionsNav[parseInt(redactionsNav.length)-1].page; 
		}else {
			foundInPage = redactionsNav[currentPosition].page; 
		} 
		
		var currentPage = parseInt($('.current-page').val());
		if (currentPage != foundInPage){
			jumpPage(foundInPage);
			setTimeout(function(){
				var page_id = parseInt($('.current-page').val())-1;
				markupObject = redactionsNav[parseInt(currentPosition)];
				UDV_id = "annotation-"+markupObject.id;
				currentPosition++;
				$("#currentPosition").text(currentPosition);
				selectAnnotationObjectNavigate(UDV_id, page_id);
				page_id++;
				navigateToMarkup(markupObject.position, page_id);
			}, 1000);
		}else {
			var page_id = parseInt($('.current-page').val())-1;
			if (currentPosition == redactionsNav.length){
				markupObject = redactionsNav[parseInt(redactionsNav.length)-1];
				$("#currentPosition").text(redactionsNav.length);
			}else {
				if (currentPosition>0){
					markupObject = redactionsNav[parseInt(currentPosition)];
					currentPosition++;
					$("#currentPosition").text(currentPosition);
				}else {
					markupObject = redactionsNav[0];
					$("#currentPosition").text(1);
				}
				
			}
			UDV_id = "annotation-"+markupObject.id;
			selectAnnotationObjectNavigate(UDV_id, page_id);
			navigateToMarkup(markupObject.position, currentPage);
		}
	}
}


//drawtype is either annotation or redaction
function prevDrawing(drawType){
	var markupObject;
	var UDV_id;
	var currentPosition = $("#currentPosition").text();
	
	if (drawType == 'Navigate Annotation'){
		resetAnnotationVisibility();
		
		var foundInPage = 0;
		if (currentPosition==0 || currentPosition==1){
			foundInPage = annotationsNav[0].page; 
		}else {
			foundInPage = annotationsNav[parseInt(currentPosition)-2].page;
		}
		
		var currentPage = parseInt($('.current-page').val());
		if (currentPage != foundInPage){
			jumpPage(foundInPage);
			setTimeout(function(){
				var page_id = parseInt($('.current-page').val())-1;
				if (currentPosition==0 || currentPosition==1){
					markupObject = annotationsNav[0];
					$("#currentPosition").text(1);
				}else {
					markupObject = annotationsNav[parseInt(currentPosition)-2];
					currentPosition--;
					$("#currentPosition").text(currentPosition);
				}
				UDV_id = "annotation-"+markupObject.id;
				selectAnnotationObjectNavigate(UDV_id, page_id);
				page_id++;
				navigateToMarkup(markupObject.position, page_id);
			}, 1000);
		}else {
			var page_id = parseInt($('.current-page').val())-1;
			if (currentPosition==0 || currentPosition==1){
				markupObject = annotationsNav[0];
				$("#currentPosition").text(1);
			}else {
				markupObject = annotationsNav[parseInt(currentPosition)-2];
				currentPosition--;
				$("#currentPosition").text(currentPosition);
			}
			
			UDV_id = "annotation-"+markupObject.id;
			selectAnnotationObjectNavigate(UDV_id, page_id);
			navigateToMarkup(markupObject.position, currentPage);
		}
		
	}else {
		resetRedactionVisibility();
		//redaction
		var foundInPage = 0;
		if (currentPosition==0 || currentPosition==1){
			foundInPage = redactionsNav[0].page; 
		}else {
			foundInPage = redactionsNav[parseInt(currentPosition)-2].page;
		}
		
		var currentPage = parseInt($('.current-page').val());
		if (currentPage != foundInPage){
			jumpPage(foundInPage);
			setTimeout(function(){
				var page_id = parseInt($('.current-page').val())-1;
				if (currentPosition==0 || currentPosition==1){
					markupObject = redactionsNav[0];
					$("#currentPosition").text(1);
				}else {
					markupObject = redactionsNav[parseInt(currentPosition)-2];
					currentPosition--;
					$("#currentPosition").text(currentPosition);
				}
				UDV_id = "annotation-"+markupObject.id;
				selectAnnotationObjectNavigate(UDV_id, page_id);
				page_id++;
				navigateToMarkup(markupObject.position, page_id);
			}, 1000);
		}else {
			var page_id = parseInt($('.current-page').val())-1;
			if (currentPosition==0 || currentPosition==1){
				markupObject = redactionsNav[0];
				$("#currentPosition").text(1);
			}else {
				markupObject = redactionsNav[parseInt(currentPosition)-2];
				currentPosition--;
				$("#currentPosition").text(currentPosition);
			}
			
			UDV_id = "annotation-"+markupObject.id;
			selectAnnotationObjectNavigate(UDV_id, page_id);
			navigateToMarkup(markupObject.position, currentPage);
		}
	}
	
}


//on page save
function recalculateMarkups(p){
	annotationsNav = [];
	redactionsNav = [];
	
	var yToUse = 0;
	var idToUse = 0;
	var pageId = 0;	
	
	var annotationsCount = 0;
	var redactionsCount = 0;
	var annotationsCounter = 0;
	var redactionsCounter = 0;

	$(p).find('page').each(function(){
		pageId = $(this).attr('id');
		pageId = pageId.replace("udv_page_", "");
		$(this).find('annotation').each(function(){
			//yToUse = $(this).attr('y'); //change
			yToUse = getPosition($(this));
			idToUse = $(this).attr('id');
			
			var annotationObject = {
					id: parseInt(idToUse),
					position: parseInt(yToUse),
					markupType: parseInt($(this).attr('type')),
					page: parseInt(pageId)
			};
			
			if ($(this).attr('type') != 9 && $(this).attr('type') != 10){
				if ($(this).attr('type') == 5 || $(this).attr('type') == 8){
					pushRedaction(annotationObject, redactionsCounter);
					redactionsCount++;
				}else {
					pushAnnotation(annotationObject, annotationsCounter);
					annotationsCount++;
				}
			}
			
		});
		annotationsCounter = annotationsCount;
		redactionsCounter = redactionsCount;
	});
	
	$('#totalObjectAnnotation').text(annotationsCount);
	$('#totalObjectRedation').text(redactionsCount);
}

function getPosition(annotation){
	var markupType = annotation.attr('type');
	var position = 0;
	
	switch (parseInt(markupType)){
		case 0: position = parseInt(annotation.attr('cy')) - parseInt(annotation.attr('ry'));
		break;
		case 1: position = annotation.attr('y');
		break;
		case 2: position = annotation.attr('y1');
		break;
		case 3: position = annotation.attr('y1');
		break;
		case 4: position = annotation.attr('y');
		break;
		case 5: position = annotation.attr('y');
		break;
		case 6: position = annotation.attr('y');
		break;
		case 7: position = annotation.attr('y');
		break;
		case 8: position = annotation.attr('y');
		break;
		default: position = annotation.attr('y');
		break;
	}
	
	return parseInt(position);
}

function pushAnnotation(annotationObject, counter) {
	var inserted = false;

	if (annotationsNav.length == 0) {
		annotationsNav.push(annotationObject);
	} else {
		for ( var i = counter; i < annotationsNav.length; i++) {
			if (parseInt(annotationObject.position) < parseInt(annotationsNav[i].position)) {
				annotationsNav.splice(i, 0, annotationObject);
				inserted = true;
				break;
			}
		}
		if (!inserted) {
			annotationsNav.push(annotationObject);
		}
	}
}

function pushRedaction(annotationObject, counter) {
	var inserted = false;

	if (redactionsNav.length == 0) {
		redactionsNav.push(annotationObject);
	} else {
		for ( var i = counter; i < redactionsNav.length; i++) {
			if (parseInt(annotationObject.position) < parseInt(redactionsNav[i].position)) {
				redactionsNav.splice(i, 0, annotationObject);
				inserted = true;
				break;
			}
		}
		if (!inserted) {
			redactionsNav.push(annotationObject);
		}
	}
}

//on page load
function computeMarkupsForNavigation(){
	annotationsNav = [];
	redactionsNav = [];
	var annotationsCounter = 0;
	var redactionsCounter = 0;
	
	var annotationObject = {};
	for (var i = 0; i < pageCollection.length; i++){
		for (var j=0; j < pageCollection[i].markups.length; j++){
			if (pageCollection[i].markups[j].markupType != 9 && pageCollection[i].markups[j].markupType != 10){
				if (countMarkup(pageCollection[i].markups[j].markupType) == "annotation") {
					pushToAnnotations(pageCollection[i].markups[j],annotationsCounter, annotationObject, i);
				} else {
					pushToRedactions(pageCollection[i].markups[j],redactionsCounter, annotationObject, i);
				}
			}
		}
		annotationsCounter = annotationsNav.length;
		redactionsCounter = redactionsNav.length;
	}
	
	countTotalMarkupsForNavigation();
}

//xtian for deleting drawings from global list
function deleteFromList(){
	computeMarkupsForNavigation();
	$('#currentPosition').text(0);
}

function countMarkup(markupType){
	var type = "";
	switch(markupType)
	{
		
		case markupTypes.RectangleRedaction:
			type = "redaction";
			break;
		case markupTypes.TextRedactHighlight:
			type = "redaction";
			break;
		default:
			type = "annotation";
			break;
	}
	return type;
}

function pushToAnnotations(markupObject, pageCounter, annotationObject, page){
	if (annotationsNav.length==0){
		annotationObject = {
				id: markupObject.id,
				position: getValueToUse(markupObject),
				markupType: markupObject.markupType,
				page: page+1
		};
		annotationsNav.push(annotationObject);
	}else {
		var currentValue = getValueToUse(markupObject); 
		var hasBeenAdded = false;
		for (var i=pageCounter; i<annotationsNav.length; i++){
			if (currentValue < annotationsNav[i].position) {
				hasBeenAdded = true;
				annotationObject = {
						id: markupObject.id,
						position: getValueToUse(markupObject),
						markupType: markupObject.markupType,
						page: page+1
				};
				annotationsNav.splice(i, 0, annotationObject);
				break;	
			}
		}
		if (!hasBeenAdded){
			annotationObject = {
					id: markupObject.id,
					position: getValueToUse(markupObject),
					markupType: markupObject.markupType,
					page: page+1
			};
			annotationsNav.splice(i, 0, annotationObject);
		}
	}
}

function pushToRedactions(markupObject, pageCounter, annotationObject, page){
	if (redactionsNav.length==0){
		annotationObject = {
				id: markupObject.id,
				position: getValueToUse(markupObject),
				markupType: markupObject.markupType,
				page: page+1
		};
		redactionsNav.push(annotationObject);
	}else {
		var currentValue = getValueToUse(markupObject); 
		var hasBeenAdded = false;
		for (var i=pageCounter; i<redactionsNav.length; i++){
			if (currentValue < redactionsNav[i].position) {
				hasBeenAdded = true;
				annotationObject = {
						id: markupObject.id,
						position: getValueToUse(markupObject),
						markupType: markupObject.markupType,
						page: page+1
				};
				redactionsNav.splice(i, 0, annotationObject);
				break;	
			}
		}
		if (!hasBeenAdded){
			annotationObject = {
					id: markupObject.id,
					position: getValueToUse(markupObject),
					markupType: markupObject.markupType,
					page: page+1
			};
			redactionsNav.splice(i, 0, annotationObject);
		}
	}
}

function countTotalMarkupsForNavigation(){
	$('#totalObjectAnnotation').text(annotationsNav.length);
	$('#totalObjectRedation').text(redactionsNav.length);
}

function getValueToUse(markupObject){
	var valueToUse;
	switch (markupObject.markupType) {
	case markupTypes.Circle:
		valueToUse = parseInt(markupObject.attributes.cy) - parseInt(markupObject.attributes.ry);
		break;
	case markupTypes.Arrow:
		valueToUse = markupObject.attributes.y1;
		break;
	case markupTypes.Line:
		valueToUse = markupObject.attributes.y1;
		break;
	case markupTypes.Rectangle:
		valueToUse = markupObject.attributes.y;
		break;
	case markupTypes.Text:
		valueToUse = markupObject.attributes.y;
		break;
	case markupTypes.TextHighLight:
		valueToUse = markupObject.attributes.y;
		break;
	case markupTypes.RectangleRedaction:
		valueToUse = markupObject.attributes.y;
		break;
	case markupTypes.TextRedactHighlight:
		valueToUse = markupObject.attributes.y;
		break;
		//add redation types for full pageredaction navigation
	}
	return parseInt(valueToUse);
}

function navigateToMarkup(position, currentPage){
	//var viewerContainer = $(document.getElementById('viewerContainer'));
	//viewerContainer.scrollTop(position);
	jumpPage(currentPage);
	viewerContainer.scrollTop(0);
	
	var pageId = 'udv_page_'+(currentPage);
	var pageTop = parseInt($(document.getElementById(pageId)).position().top);
	var pageTopPosition =pageTop-60;
	var termYPosition = position;

	viewerContainer.scrollTop(pageTopPosition+((termYPosition)+(10)));
}

function resetAnnotationVisibility(){
	var val = $('.selected-visibility-annotation').children('.visibility-holder-annotation')[0].getAttribute('data-visibility');
	if (val == "Semi-Transparent Annotation"){
		var toClick = $('.selected-visibility-annotation').children('.visibility-holder-annotation');
		toClick.click();
		toClick.click();
	}else if (val == "Hide Annotation") {
		var toClick = $('.selected-visibility-annotation').children('.visibility-holder-annotation');
		toClick.click();
	}	
}

function resetRedactionVisibility(){
	var val = $('.selected-visibility-redaction').children('.visibility-holder-redaction')[0].getAttribute('data-visibility');
	if (val == "Semi-Transparent Redaction"){
		var toClick = $('.selected-visibility-redaction').children('.visibility-holder-redaction');
		toClick.click();
		toClick.click();
	}else if (val == "Hide Redaction") {
		var toClick = $('.selected-visibility-redaction').children('.visibility-holder-redaction');
		toClick.click();
	}	
}