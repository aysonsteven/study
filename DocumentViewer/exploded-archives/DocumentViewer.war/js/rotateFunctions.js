
	var rotatePageCW = $(getElement('page-rotatePage')),
	rotatePageCCW = $(getElement('page-rotatePageCounter')),
	rotateDocCW = $(getElement('page-rotateDoc')),
	rotateDocCCW = $(getElement('page-rotateDocCounter')),
	currentPageCount = $('.current-page');

	// Clockwise Rotate Page Tool
	rotatePageCW.on('click', function() {
		//disableFitToWidth();
		transferTextAreaValuetoDiv(lastSelectedDivReason);
		var totalPageCount = parseInt($('.pages').text()),
		currentPage = parseInt($('.current-page').val()),
		pgIndex = currentPage-1;
		
		if (currentPage >= 1 && currentPage <= totalPageCount) {
			var degrees = parseInt(pageCollection[pgIndex].attributes.rotateDegrees);
			degrees = (degrees == 360) ? 0 : degrees;
			degrees += 90;
			rotatePage(pgIndex, degrees);
			//getScrollHeightPercentage(totalPageCount);
			jumpPage(parseInt(currentPageCount.val()));
		}
		
		getScrollHeightPercentage(totalPageCount);
	});
	
	// CounterClockwise Rotate Page Tool
	rotatePageCCW.on('click', function() {
		//disableFitToWidth();
		transferTextAreaValuetoDiv(lastSelectedDivReason);
		var totalPageCount = parseInt($('.pages').text()),
		currentPage = parseInt($('.current-page').val()),
		pgIndex = currentPage-1;
		
		if (currentPage >= 1 && currentPage <= totalPageCount) {
			var degrees = parseInt(pageCollection[pgIndex].attributes.rotateDegrees);
			degrees = (degrees == 0) ? 360 : degrees;
			degrees -= 90;
			rotatePage(pgIndex, degrees);
			//getScrollHeightPercentage(totalPageCount);
			jumpPage(parseInt(currentPageCount.val()));
		}
		
		getScrollHeightPercentage(totalPageCount);
	});
	

	// Clockwise Rotate Document Tool
	rotateDocCW.on('click', function() {
		//disableFitToWidth();
		transferTextAreaValuetoDiv(lastSelectedDivReason);
		var totalPageCount = parseInt($('.pages').text());
		if(totalPageCount > 0) {
			for (var pgIndex = 0; pgIndex < totalPageCount; pgIndex++) {
				var degrees = parseInt(pageCollection[pgIndex].attributes.rotateDegrees);
				degrees = (degrees == 360) ? 0 : degrees;
				degrees += 90;
				rotatePage(pgIndex, degrees);
			}
			//getScrollHeightPercentage(totalPageCount);
			jumpPage(parseInt(currentPageCount.val()));
		}
		
		getScrollHeightPercentage(totalPageCount);
	});
	
	// CounterClockwise Rotate Document Tool
	rotateDocCCW.on('click', function() {
		//disableFitToWidth();
		transferTextAreaValuetoDiv(lastSelectedDivReason);
		var totalPageCount = parseInt($('.pages').text());
		if(totalPageCount > 0) {
			for (var pgIndex = 0; pgIndex < totalPageCount; pgIndex++) {
				var degrees = parseInt(pageCollection[pgIndex].attributes.rotateDegrees);
				degrees = (degrees == 0) ? 360 : degrees;
				degrees -= 90;
				rotatePage(pgIndex, degrees);
			}
			//getScrollHeightPercentage(totalPageCount);
			jumpPage(parseInt(currentPageCount.val()));
		}
		
		getScrollHeightPercentage(totalPageCount);
	});
	
	function rotatePage(pageIndex, degrees) {
		var viewerChild = getElement('viewer-document-wrapper').getElementsByClassName("pageContent");
		var page =  $(viewerChild[pageIndex]);

		if (page.length) { // Check if page element is existing

			var udvPage = pageCollection[pageIndex];
			var newPgW, newPgH, rotateX, rotateY,
			pgContentW = page[0].style.width, 
			pgContentH = page[0].style.height,
			svgPgW = udvPage.attributes.pageWidth,
			svgPgH = udvPage.attributes.pageHeight,
			currentViewerWidth = getViewerContainerWidth(),
			fitToWidthFactor;
			
			if(degrees === 90 || degrees === 270)
			{
				fitToWidthFactor = currentViewerWidth/svgPgH;				
			}
			else
			{
				fitToWidthFactor = currentViewerWidth/svgPgW;
			}
				
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
			
			if(isFitContent)
			{
				if(degrees == 90 || degrees == 270)
				{
					newPgW =  parseFloat(fitToWidthFactor*svgPgH);
					newPgH = parseFloat(fitToWidthFactor*svgPgW);
				}
				else
				{
					newPgW = parseFloat(fitToWidthFactor*svgPgW);
					newPgH = parseFloat(fitToWidthFactor*svgPgH);					
				}

				
			}

			// Store page rotate settings
			udvPage.attributes.rotateDegrees = degrees;
			udvPage.attributes.rotateX = rotateX;
			udvPage.attributes.rotateY = rotateY;
			
			var gWrap = page.find(".gWrapper");
			if (page.has("svg").length != 0 || gWrap.length != 0) {
				if (gWrap.prop("tagName") == "g") {
					// Set transform matrix value
					var t;
					if(!isFitContent)
						t = getTransformMatrixValue(scaleFactor, degrees, rotateX, rotateY);
					else
					{
						if(degrees == 270 || degrees == 90)
						{
							t = getTransformMatrixValue((getViewerContainerWidth()/svgPgH), degrees, rotateX, rotateY);
						}
						else
						{
							t = getTransformMatrixValue((getViewerContainerWidth()/svgPgW), degrees, rotateX, rotateY);							
						}

						if(degrees == 270)
						{
							t.f=parseFloat(newPgH);
						}
						else if(degrees == 90)
						{
							t.e = parseFloat(newPgW);
						}
					}
					Snap(gWrap[0]).transform(t);
					
					// rotate text objects 
					udvPage.rotateTextMarkups(degrees);
				}
			}
			// Set new page dimensions
			page.width(newPgW);
			page.height(newPgH);

			reCalculateHandles(pageCollection[pageIndex]);
		}
		
		//Check each page if viewable in the view port
//		displayViewableSvg($this); 

		HScrollBarChecker();
	}
	
	function rotatePageOnLoad(pageIndex, degrees) {
		var viewerChild = $(getElement('viewer-document-wrapper')).children(".pageContent"),
		$this =  viewerChild.eq(pageIndex);

		if ($this.length) { // Check if page element is existing

			var udvPage = pageCollection[pageIndex];
			var newPgW, newPgH, rotateX, rotateY,
			pgContentW = $this[0].style.width, 
			pgContentH = $this[0].style.height,
			svgPgW = udvPage.attributes.pageWidth,
			svgPgH = udvPage.attributes.pageHeight,
			currentViewerWidth = getViewerContainerWidth(),
			fitToWidthFactor = currentViewerWidth/svgPgW;
			
			switch (degrees) {
			case 90:
				newPgW = svgPgH;
				newPgH = svgPgW;
				rotateX = svgPgH / 2;
				rotateY = rotateX;
				break;
			case 180:
				newPgW = svgPgW;
				newPgH = svgPgH;
				rotateX = svgPgW / 2;
				rotateY = svgPgH / 2;
				break;
			case 270:
				newPgW = svgPgH;
				newPgH = svgPgW;
				rotateX = svgPgW / 2;
				rotateY = rotateX;
				break;
			case 0:
			case 360:
			default:
				newPgW = svgPgW;
				newPgH = svgPgH;
				rotateX = svgPgH / 2;
				rotateY = rotateX;
				break;
			}

			// Store page rotate settings
			udvPage.attributes.rotateDegrees = degrees;
			udvPage.attributes.rotateX = rotateX;
			udvPage.attributes.rotateY = rotateY;
			
			var gWrap = $this.find(".gWrapper");
			if (hasNativeSVG($this) || gWrap) {
				if (gWrap.prop("tagName") == "g") {
					// Set transform matrix value
					var t;
					if(!isFitContent)
						t = getTransformMatrixValue(scaleFactor, degrees, rotateX, rotateY);
					else
						t = getTransformMatrixValue((getViewerContainerWidth()/svgPgW), degrees, rotateX, rotateY);
					Snap(gWrap[0]).transform(t);
					
					// rotate text objects
					udvPage.rotateTextMarkups(degrees);
				}
			}
			// Set new page dimensions
			$this.width(newPgW);
			$this.height(newPgH);

			reCalculateHandles(pageCollection[pageIndex]);
		}
		
		//Check each page if viewable in the view port
		displayViewableSvg($this);

		HScrollBarChecker();
	}


