
$(function(){
	var closeAnnotateBox= $('#closeAnnotateBox');//Close
	// Visibility Dropdown for Redaction
	//var dropdown = new Dropdown('.visibilityDefinedContainerRedaction', '.visibility-available-container');
	var visibilityHolderRedaction = $('.selected-visibility-redaction').children('.visibility-holder-redaction');
	visibilityHolderRedaction.on({
		click:function(){
			if($(this).hasClass('disable-tool')) return;
			
			transferTextAreaValuetoDiv(lastSelectedDivReason);
			var $this = $(this),
			selectedVisibility = null,
			dataVisibility = $this.attr('data-visibility');//$this.data('visibility'),
			availableVisibility = $('.selected-visibility-redaction').siblings('.visibility-available-container');
			
			switch(dataVisibility) {
			case 'Show Redaction':
				//$this.data('visibility',"Semi-Transparent Redaction");
				$this.attr('data-visibility',"Semi-Transparent Redaction");
				selectedVisibility = availableVisibility.children()[1].getAttribute('src');
				redactionVisibility(visibilityMode.Transparent);
				$this.attr('title',"Change Redaction Visibility to Hide");
				break;
			case 'Semi-Transparent Redaction':
				//$this.data('visibility',"Hide Redaction");
				$this.attr('data-visibility',"Hide Redaction");
				selectedVisibility = availableVisibility.children()[2].getAttribute('src');
				redactionVisibility(visibilityMode.Hidden);
				$this.attr('title',"Change Redaction Visibility to Show");
				break;
			case 'Hide Redaction':
				//$this.data('visibility',"Show Redaction");
				$this.attr('data-visibility',"Show Redaction");
				selectedVisibility = availableVisibility.children()[0].getAttribute('src');
				redactionVisibility(visibilityMode.Shown);
				$this.attr('title',"Change Redaction Visibility to Semi-Transparent");
				break;
			}
			$('.selected-visibility-redaction').children('img').attr('src',selectedVisibility);
		}
	});
	
	// Visibility Dropdown for Annotation
	//var dropdown = new Dropdown('.visibilityDefinedContainerAnnotation', '.visibility-available-container');
	var visibilityHolderAnnotation = $('.selected-visibility-annotation').children('.visibility-holder-annotation');
	visibilityHolderAnnotation.on({
		click:function(){
			if($(this).hasClass('disable-tool')) return;
			
			transferTextAreaValuetoDiv(lastSelectedDivReason);
			var $this = $(this),
			selectedVisibility = null,
			dataVisibility = $this.attr('data-visibility');//$this.data('visibility');
			availableVisibility = $('.selected-visibility-annotation').siblings('.visibility-available-container');	
			
			switch(dataVisibility) {
			case 'Show Annotation':
				//$this.data('visibility',"Semi-Transparent Annotation");
				$this.attr('data-visibility',"Semi-Transparent Annotation");
				selectedVisibility = availableVisibility.children()[1].getAttribute('src');
				annotationVisibility(visibilityMode.Transparent);
				$this.attr('title',"Change Annotation Visibility to Hide");
				break;
			case 'Semi-Transparent Annotation':
				//$this.data('visibility',"Hide Annotation");
				$this.attr('data-visibility',"Hide Annotation");
				selectedVisibility = availableVisibility.children()[2].getAttribute('src');
				annotationVisibility(visibilityMode.Hidden);
				$this.attr('title',"Change Annotation Visibility to Show");
				break;
			case 'Hide Annotation':
				//$this.data('visibility',"Show Annotation");
				$this.attr('data-visibility',"Show Annotation");
				selectedVisibility = availableVisibility.children()[0].getAttribute('src');
				annotationVisibility(visibilityMode.Shown);
				$this.attr('title',"Change Annotation Visibility to Semi-Transparent");
				break;
			}
			$('.selected-visibility-annotation').children('img').attr('src',selectedVisibility);
		}
	});
	
	function redactionVisibility(visibility){
		for(var i=0; i<pageCollection.length; i++){ //iterate doc pages
			var udvPage = pageCollection[i];			
			for(var j=0; j<udvPage.markups.length; j++) { // iterate page markups				
				if(udvPage.markups[j].markupType === markupTypes.RectangleRedaction || udvPage.markups[j].markupType === markupTypes.TextRedactHighlight) {
					applyVisibilityMode(udvPage, udvPage.markups[j], visibility);
				}
				/*if(udvPage.markups[j].markupType == markupTypes.Text) {
					var markupObjId = udvPage.markups[j].id;
					if(udvPage.isMarkupSelected(markupObjId)) { // check if markup is selected
						var markupObjIdIndex = udvPage.selectedMarkupIds.indexOf(markupObjId);			
						var markupObjHandle = udvPage.handleCollections[markupObjIdIndex].parentHandle;
						markupObjHandle.lastChild.style.display = "block";
					}
				}*/
			}
		}
		
		if(visibility === visibilityMode.Hidden)
		{
			selectObject();
		}
	}
	
	function annotationVisibility(visibility) {
		for(var i=0; i<pageCollection.length; i++){ //iterate doc pages
			var udvPage = pageCollection[i];			
			for(var j=0; j<udvPage.markups.length; j++) { // iterate page markups	
				var markupObjectType = udvPage.markups[j].markupType;
				if(markupObjectType !== markupTypes.RectangleRedaction && 
						markupObjectType !== markupTypes.TextRedactHighlight && 
							markupObjectType !== markupTypes.StrikeThrough &&
							markupObjectType !== markupTypes.CollabHighlight) {
					applyVisibilityMode(udvPage, udvPage.markups[j], visibility);
				}
			}
		}
		
		if(visibility === visibilityMode.Hidden)
		{
			selectObject();
		}
	}
	
	function applyVisibilityMode(udvPage, udvDrawnObj, visibility) {
		
		if(udvDrawnObj.markupType == markupTypes.TextHighLight || udvDrawnObj.markupType == markupTypes.TextRedactHighlight){
			var drawObjColl = udvDrawnObj.drawnObjectCollection;
			var len = drawObjColl.length;
			for(var i = 0; i < len; i++){
				//set annotationGroup display
				drawObjColl[i].shapes.group.style.display = (visibility === visibilityMode.Hidden) ? "none" : "block";
			
				//set drawnObject visibilityMode
				drawObjColl[i].setVisibilityMode(visibility);
			}
		} else {
			//set annotationGroup display
			udvDrawnObj.shapes.group.style.display = (visibility === visibilityMode.Hidden) ? "none" : "block";
		
			//set drawnObject visibilityMode
			udvDrawnObj.setVisibilityMode(visibility);
		}		
		
		// set selected drawnObject's handle visibility
		if(udvPage.isMarkupSelected(udvDrawnObj.id)) {
			var markupObjIdIndex = udvPage.selectedMarkupIds.indexOf(udvDrawnObj.id);			
			var markupObjHandle = udvPage.handleCollections[markupObjIdIndex].parentHandle;
			markupObjHandle.style.display = (visibility === visibilityMode.Hidden) ? "none" : "block";
		}
		
		if(visibility === visibilityMode.Hidden)
		{
			if(udvPage.isMarkupSelected(udvDrawnObj.id))
				udvPage.deSelectMarkup(udvDrawnObj.id);
		}
	}
	
});