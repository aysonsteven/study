
	//var dropdown = new Dropdown('.zoomDefinedContainer', '.zoom-available-container');
	//var zoomHolder = $('.zoom-holder');
	
	var zoomControls = $('.zoomControls > img'),
	zoomOut = $('.zoomOut'),
	zoomIn = $('.zoomIn'),
	currentPageCount = $('.current-page'),
	viewerContainer = $('#viewerContainer'),
	lastCurrentPage = currentPageCount.val();
	/*$('.zoom-holder').on({
		click:function(){
			var $this = $(this),
			selectedZoom = $this.text();

			$this.parent().siblings('.selected-zoom').children('span').text(selectedZoom);
		}
	});

	zoomHolder.on({
		mouseenter:function(){
			var $this = $(this);
			$this.css({
				'background-color':'#837F7F'
			})
		},
		mouseleave:function(){
			var $this = $(this);
			$this.removeAttr('style');
		}
	});*/

	zoomControls.on({
		mouseenter:function(){
			var $this = $(this);
			if(scaleFactor > 0.25 && scaleFactor < 5) {
				$this.addClass('hoveredBtn');
			}
			return false;
		},
		mouseleave:function(){
			var $this = $(this);
			$this.removeClass('hoveredBtn');
			return false;
		}
	});

	/*//Hide the Zoom Dropdown
	$(document).on('click',function(){
		$('.zoom-available-container').removeClass('active');
	});
	//End of Hide*/

	
	// Define function onclick ZoomOut (-)
	zoomOut.on('click', zoomOutFn);
	
	function zoomOutFn() {
		
		var fitToWidthButton = $('#fitToWidth');
		var classes = fitToWidthButton.attr('class');
		var indexOfState = classes.indexOf('active-state');
		if(indexOfState>0 && !isResizing)
		{
			classes = classes.substring(0,indexOfState);
			fitToWidthButton.attr('class',classes);
			isFitContent = false;
			scaleFactor = scaleFactor - (scaleFactor%0.25);
			scaleFactor+=0.25;
			originalScaleFactor = -1;
		}
		zoomOut.off("click",zoomOutFn);
		transferTextAreaValuetoDiv(lastSelectedDivReason);
		if(logFileStatus == "FileNotFound" || logFileStatus == "Queued" || logFileStatus == "ConvertingToPDF") {
			return;
		}

		// zoomOut/subtract every 25% scaleFactor until 25% scale factor
		if (scaleFactor >= '0.50') {
			scaleFactor -= 0.25;
			//scaleFactor = Math.round(scaleFactor * 10) / 10;

			// Set zoom percent text/label
			setZoomLabel(parseFloat((scaleFactor * 100)).toFixed(0) + "%");

			// Apply zoomOut factor to all pages
			zoomAllPages(scaleFactor);
			// pantry-955
			if(documentViewer.scaleFactorCallback){
				documentViewer.scaleFactorCallback(scaleFactor);
			}
			if(documentViewer.isJPLT === true){
				updateScaleFactorJPLT(scaleFactor);
				updateIsFitOnLoadJPLT(false);
				documentViewer.fitOnLoad=false;
			}
			documentViewer.scaleFactor=scaleFactor;
			
			if(documentViewer.fitOnLoadCallback){
				documentViewer.fitOnLoadCallback(false);
				documentViewer.fitOnLoad=false;
			}
		}
		
		setTimeout(function(){
			zoomOut.on("click",zoomOutFn);
		},100);
	}

	// Define function onclick ZoomIn (+)
	zoomIn.on('click', zoomInFn);
	
	function zoomInFn(){
		
		var fitToWidthButton = $('#fitToWidth');
		var classes = fitToWidthButton.attr('class');
		var indexOfState = classes.indexOf('active-state');
		if(indexOfState>0 && !isResizing)
		{
			classes = classes.substring(0,indexOfState);
			fitToWidthButton.attr('class',classes);
			isFitContent = false;
			scaleFactor = scaleFactor - (scaleFactor%0.25);
			if(scaleFactor === 4.75)
				scaleFactor-=0.25;
			originalScaleFactor = -1;
		}

		/*$('#viewer-menu-content').css('width','100% !important');*/
		zoomIn.off("click",zoomInFn);
		transferTextAreaValuetoDiv(lastSelectedDivReason);
		if(logFileStatus == "FileNotFound" || logFileStatus == "Queued" || logFileStatus == "ConvertingToPDF") {
			return;
		}
		
		// zoomIn/add every 25% scaleFactor until 500% scale factor
		if (scaleFactor <= '4.75') {
			scaleFactor += 0.25;
			//scaleFactor = Math.round(scaleFactor * 10) / 10;

			// Set zoom percent text/label
			setZoomLabel(parseFloat((scaleFactor * 100)).toFixed(0) + "%");

			// Apply zoomIn factor to all pages
			zoomAllPages(scaleFactor);
			// pantry-955
			if(documentViewer.scaleFactorCallback){
				documentViewer.scaleFactorCallback(scaleFactor);
			}
			if(documentViewer.isJPLT === true){
				updateScaleFactorJPLT(scaleFactor);
				updateIsFitOnLoadJPLT(false);
				documentViewer.fitOnLoad=false;
			}
			documentViewer.scaleFactor=scaleFactor;
			
			if(documentViewer.fitOnLoadCallback){
				documentViewer.fitOnLoadCallback(false);
				documentViewer.fitOnLoad=false;
			}
		}
		
		setTimeout(function(){
			zoomIn.on("click",zoomInFn);
		},100);
	}
	
	function zoomAllPages(sf) {
		var viewerWrapper = $('#viewer-document-wrapper');
		viewerChild = viewerWrapper.children(".pageContent"),
		pageCount = viewerChild.length;
		
		var viewerContainer = $('#viewerContainer');
		var lastCurScrollPercent = curscrollPercentage;
		preZoomPageNo = parseInt($('.current-page').val());
		zoomScroll = true;
		
		for (var i=0; i<pageCount; i++) {
			var $this = viewerChild.eq(i);
			var udvPage = pageCollection[i];
			
			// Set transform matrix value
			var attributes = udvPage.attributes,
			rotateDeg = udvPage.attributes.rotateDegrees, 
			rotateX = udvPage.attributes.rotateX, 
			rotateY = udvPage.attributes.rotateY, 
			t = getTransformMatrixValue(sf, rotateDeg, rotateX, rotateY);
			
			if(!isFitContent && attributes.isFitted)
			{
				attributes.isFitted = false;
			}
			if ($this.children().length > 0) {
				var gWrap = $this.find(".gWrapper");
				if (gWrap.prop("tagName") == "g") {
					Snap(gWrap[0]).transform(t);
				}
			}

			// Set page dimensions, depending on rotate angle
			var newPageW = udvPage.attributes.pageWidth * sf;
			var newPageH = udvPage.attributes.pageHeight * sf;
			//recalculate handles
			reCalculateHandles(udvPage);
			
			if (rotateDeg == 90 || rotateDeg == 270) {
				$this.width(newPageH + "px");
				$this.height(newPageW + "px");
			} else {
				$this.width(newPageW + "px");
				$this.height(newPageH + "px");
			}
			
			/*if (rotateDeg == 90 || rotateDeg == 270) {
				viewerChild.width(newPageH + "px");
				viewerChild.height(newPageW + "px");
			} else {
				viewerChild.width(newPageW + "px");
				viewerChild.height(newPageH + "px");
			}*/
			
			/*if (rotateDeg == 90 || rotateDeg == 270) {
				$('#viewerContainer').width(newPageH + "px");
				$('#viewerContainer').height(newPageW + "px");
			} else {
				$('#viewerContainer').width(newPageW + "px");
				$('#viewerContainer').height(newPageH + "px"); 
			}*/
			
			/*if (rotateDeg == 90 || rotateDeg == 270) {
				$('#viewer-document-wrapper').width(newPageH + "px");
				$('#viewer-document-wrapper').height(newPageW + "px");
			} else {
				$('#viewer-document-wrapper').width(newPageW + "px");
				$('#viewer-document-wrapper').height(newPageH + "px"); 
			}*/
			
			 
			/*if (rotateDeg == 90 || rotateDeg == 270) {
				$(this).width(newPageH + "px");
				$(this).height(newPageW + "px");
				console.log($(this).attr()); 
			} else { 
				$(this).width(newPageW + "px");
				$(this).height(newPageH + "px");
			}*/
			
			//Check each page if viewable in the view port
//			displayViewableSvg($this);
		}
		
		//Enable Hand Tool when there is horizontal scrollbar
		HScrollBarChecker();
	
		getScrollHeightPercentage(pageCount);
		viewerContainer.scrollTop(currentScrollVal(lastCurScrollPercent, scrollDiff));
	}

function setZoomLabel(zoomPercent) { 
	$('.selected-zoom','#page-zoomtool').children('span').text(zoomPercent);
	if(zoomPercent === '25%') {
		$('.zoomOut').css('opacity', '0.5');
		$('.zoomOut').removeClass('hoveredBtn');
	} else if(zoomPercent === '500%') {
		$('.zoomIn').css('opacity', '0.5');
		$('.zoomIn').removeClass('hoveredBtn');
	} else {
		$('.zoomOut').css('opacity', '1');
		$('.zoomIn').css('opacity', '1');
	}
}

function getWidth() {
	
	if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
		
	
	
	var getIosWidth = $('body').width() - 5; 
	$('#viewerContainer').css('max-width',getIosWidth); 
	}
}

$(document).on('resize', function(){
	getWidth();
});

