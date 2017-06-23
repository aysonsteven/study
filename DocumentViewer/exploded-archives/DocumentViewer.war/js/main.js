/**
 * Creates UDVViewer instance. Initializes the components of the UDVViewer.
 * These includes the following:
 * -Resets states of all buttons
 * -Attaches all relevant listeners for features
 * @param documentToLoad
 * @returns
 */
UDViewer = function(documentToLoad){ 	// Viewport Control
	
	var currentUDViewer = this, currentSelectedAnnotation,
	viewerContainer = $(getElement('viewerContainer')), 
	viewerWrapper = $(getElement('viewer-document-wrapper')), 
	pageContents = viewerWrapper.children('.pageContent'),
	viewerWrapperH = viewerWrapper.outerHeight(), 
	viewerChild = viewerWrapper.children("div"), 
	pageCountLabel = $('.pages', '#viewer-menu'), 
	currentCount = pageCountLabel.siblings('.current-page'), 
	wrapper = $(getElement('wrapper')), 
	selectedMarkup, 
	manualScroll = true, 
	redactBox = wrapper.find('#viewer-redactbox'), // Containers
	annotationBox = wrapper.find('#viewer-annotateBox'), 
	arrowBox = $(getElement('viewer-arrowAnnotate')), 
	lineBox = $(getElement('viewer-lineAnnotate')), 
	squareBox = $(getElement('viewer-squareAnnotate')), 
	circleBox = $(getElement('viewer-circleAnnotate')), 
	textBox = $(getElement('viewer-textAnnotate')), 
	searchContainer = $(getElement('viewer-searchbox')), 
	pageNavContainer = $('.page-nav-container'), 
	multipleBox = $(getElement('deleteMultiple')), // End of Container
	searchMenu = $(getElement('showSearchMenu')), // Controls
	// tab
	// contents (START)
	addRedact = $(getElement('addRedact')), 
	addArrow = $(getElement('addArrow')), 
	addLine = $(getElement('addLine')), 
	addSquare = $(getElement('addSquare')), 
	addCircle = $(getElement('addCircle')), 
	addText = $(getElement('addText')), 
	magnifyingGlass = $(getElement('magnifyingGlass')),
	textSelection = $(getElement('textSelection')),
	addTextHighlight = $(getElement('highLightBtn')), 
	addRedactTextHighlight = $(getElement('highLightRedactBtn')), 
	addStrikeThrough = $(getElement('collabStrikeOutBtn')), 
	addCollabHighlight = $(getElement('collabHighlightBtn')),
	addStamp = $(getElement('stampBtn')),
	addStickyNote = $(getElement('stickyNoteBtn')),
	addImage = $(getElement('imageBtn')),
	addComment = $(getElement('commentTab')),
	handToolJS = getElement('page-handtool'), // End of Controls
	handTool = $(handToolJS), 
	// tab
	// contents (END)
	tabContent = $('.tabContent'), // Annotate Tab
	annotateBoxTab = $('.annotateBoxTab'),
	//Property panel tabs START
	arrowTab = $(getElement('arrowTab')), 
	lineTab = $(getElement('lineTab')), 
	rectTab = $(getElement('rectTab')), 
	rectBorderTab = $(getElement('rectBorderTab')), 
	circleTab = $(getElement('circleTab')), 
	circleBorderTab = $(getElement('circleBorderTab')), 
	textTab = $(getElement('textTab')), 
	textstyleTab = $(getElement('textstyleTab')), 
	textAlignTab = $(getElement('textAlignTab')), 
	verticalAlignTab = $(getElement('verticalAlignTab')), 
	layerTab = $(getElement('layerTab')), 
	positionTab = $(getElement('positionTab')),
	tagSetTab = $(getElement('tagSetTab')),
	imageTab = $(getElement('imageTab')),
	//Property panel tabs END
	
	addNote = $(getElement('addNote')),
	applyStamp = $(getElement('applyStamp')),
	applyImage = $(getElement('applyImage')),
	
	//Property buttons START
	opacityDropdown = $(getElement('fillOpacity')), 
	fillWidthDropdown = $(getElement('fillWidth')), 
	fillColorSelection = $(getElement('fillColor')), 
	leftAlign = $(getElement('leftAlign')), 
	centerAlign = $(getElement('centerAlign')), 
	rightAlign = $(getElement('rightAlign')), 
	topAlign = $(getElement('topAlign')), 
	middleAlign = $(getElement('middleAlign')), 
	bottomAlign = $(getElement('bottomAlign')), 
	redactionReasons = $('.reasons-available-container'), 
	tagSets = $('.tagSet-available-container'),
	colorPickerBox = $('.colorPickerBox'),
	opacityPickerBox = $('.opacityPickerBox'), 
	widthPickerBox = $('.widthPickerBox'), 
	fontFacePickerBox = $('.fontFacePickerBox'), 
	textSizePickerBox = $('.textSizePickerBox'), 
	textStyleContainer = $('.textStyleContainer'), 
	textAlignContainer = $('.textAlignContainer'), 
	verticalAlignContainer = $('.verticalAlignContainer'), 
	layerContainer = $('.layerContainer'), 
	availableColors = $(getElement('availableColors')), // Picker
	positionContainer = $('.positionContainer'),
	stampControlsContainer = $('.stampControlsContainer'),
	pageZoomTool = $(getElement('page-zoomtool')),
	imageContainer = $('.imageContainer'),
	commentTxtArea = $('#commentField');
	//Property buttons END
	
	
	// DropMenu
	// Menus
	availableOpacity = $(getElement('availableOpacity')), 
	availableWidth = $(getElement('availableWidth')), 
	availableFonts = $(getElement('availableFonts')), 
	availableSize = $(getElement('availableSize')), 
	deleteAnnotation = $('.deleteObject'), // Toolbox
	
	// Control
	closeAnnotateBox = $(getElement('closeAnnotateBox')), 
	closeRedact = $(getElement('closeRedact'));
	resizeAnnotateBox = $(getElement('resizeAnnotateBox')), 
	boldText = $(getElement('boldText')), // Additional
	// ID
	// for
	// TextAnnotation
	italicText = $(getElement('italicText')), 
	underlineText = $(getElement('underlineText')), 
	strikeoutText = $(getElement('strikeoutText')), 
	leftAlignText = $(getElement('leftAlign')), 
	rightAlignText = $(getElement('rightAlign')), 
	topAlignText = $(getElement('topAlign')), 
	middleAlignText = $(getElement('middleAlign')), 
	bottomAlignText = $(getElement('bottomAlign')), 
	blockerContainer = $(getElement('blocker')), // Blocker
	DV_PrintModal = $(getElement('DV-PrintModal')), // Modals
	preloaderModal = $(getElement('PreloaderModal')), // Preloader Printing
	searchBox = $(getElement('searchBox'));
	localDoc = document;

	window.html5.shivMethods = false;
	// initialize document
	documentViewer = this;
	var defaultProperties = {
//			documentAbsPath : documentToLoad.doc, Do not include since this will be loaded ONLY on loadDocument() function
			udvVersion: documentToLoad.docViewerVersion,
			printTemplateStr : '',
			markupPath : documentToLoad.markupPath,
			domain : documentToLoad.domain,
			allowRotation : documentToLoad.allowRotation,
			rotationMarkupPath : documentToLoad.rotationMarkupPath,
			saveCallBack : null,
			onCopyCallback : null,
			scaleFactorCallback : null,
			fitOnLoadCallback : null,
			autoGeneration : true,
			excludeRotation : documentToLoad.excludeRotation,
			redactTab : documentToLoad.redactTab,
			redactPattern : documentToLoad.redactPattern,
			annotateTab : documentToLoad.annotateTab,
			isMobile : documentToLoad.isMobile,
			fitOnLoad : documentToLoad.fitOnLoad,
			patternPath : documentToLoad.patternPath,
			defaultTab : documentToLoad.defaultTab,
			userId : (documentToLoad.userId != undefined || documentToLoad.userId != null) ? documentToLoad.userId : undefined,
			timezone : documentToLoad.timezone,
			annotationToolBox : [],
			scaleFactor : documentToLoad.scaleFactor,
			libUdvSearchQuery : documentToLoad.libUdvSearchQuery, 
			isJPLT : documentToLoad.isJPLT,
			stampData : documentToLoad.stampData,
			refresh : function()
			{
				pageContents = viewerWrapper.children('.pageContent');
			}
		};

	for(var key in defaultProperties)
	{
		this[key] = defaultProperties[key];
	}
	
	var color = documentToLoad.highlightColor;
	if (color != undefined && color != null && color.length > 2) {
		defaultHighlightColor = color;
	}
	
	color = documentToLoad.copyTextHighlightColor;
	
	if(color != undefined && color != null && color.length > 2)
	{
		defaultCopyTextHighlightColor = color;
	}

	defaultActiveHighlightColor = shadeBlendConvert(-0.68,
			defaultHighlightColor);
	if (this.isMobile === true) {
		// $('#mobile-warning').show();
		this.redactTab = false;
		this.annotateTab = false;
		this.searchTab = false;

	}
	
	if (this.redactTab === false) {
		$('#dlRedactCheckBoxDiv').hide();
		$('#prRedactCheckBoxDiv').hide();
	}
	
	if (documentToLoad.autoGeneration != undefined) {
		this.autoGeneration = documentToLoad.autoGeneration;
	}
	
	if(documentToLoad.allowPrint == false)
	{
		$(".printDocument").remove();
	}
	
	if(documentToLoad.allowDownload == false)
	{
		$(".downloadDocument").remove();
	}
	
	if (!documentToLoad.timezone)
		documentToLoad.timezone = 0;

	var shiftPushed = false;

	
	function executeSearch(query) {
		getModifiedQuery(query);

		if (modifiedQuery === lastQuery) {
			console.log('Query has already been searched.');
		} else {
			clearSearch2();
			search(modifiedQuery, true);
			lastQuery = modifiedQuery;
		}
	}

	function getModifiedQuery(query) {
		var isCaseSensitive = document.getElementById('caseSensitive').firstChild.classList
				.contains('selected-visibility');
		var isExactMatch = document.getElementById('exactWord').firstChild.classList
				.contains('selected-visibility');
		modifiedQuery = query;

		if (isCaseSensitive) {
			modifiedQuery = ':' + modifiedQuery;
		}
		if (isExactMatch) {
			modifiedQuery = '=' + modifiedQuery;
		}

		modifiedQuery = '*' + modifiedQuery + '*';
	}


	var localAnnotationToolBox = this.annotationToolBox;
	initializeAnnotationToolBox(documentToLoad.annotation);
	initializeViewer(documentToLoad);
	loadDocument(documentToLoad.doc, this.markupPath, undefined, undefined,
			this.rotationMarkupPath);

	// document session properties
	function initializeAnnotationToolBox(configuration) {
		// console.log(configuration);
		var toolBoxCreated = null, config = null;
		for ( var k in markupTypes) {
			config = null;
			var index = markupTypes[k];
			switch (index) {
			case markupTypes.TextRedactHighlight:
			case markupTypes.RectangleRedaction:
				toolBoxCreated = new RedactionRectangleToolBox();
				// localAnnotationToolBox.push(new RedactionRectangleToolBox());
				break;
			case markupTypes.Rectangle:
				toolBoxCreated = new RectangleToolBox();
				if (configuration != undefined
						&& configuration.rectangle != undefined)
					config = configuration.rectangle;
				// localAnnotationToolBox.push(new RectangleToolBox());
				break;

			case markupTypes.Arrow:
				toolBoxCreated = new ArrowToolBox();
				// localAnnotationToolBox.push(new ArrowToolBox());
				break;

			case markupTypes.Line:
				toolBoxCreated = new LineToolBox();
				// localAnnotationToolBox.push(new LineToolBox());
				break;

			case markupTypes.Circle:
				toolBoxCreated = new CircleToolBox();
				if (configuration != undefined
						&& configuration.circle != undefined)
					config = configuration.circle;
				break;
			case markupTypes.Text:
				toolBoxCreated = new TextAnnotationToolBox();
				if (configuration != undefined
						&& configuration.text != undefined)
					config = configuration.text;
				break;
			case markupTypes.StickyNote:
				toolBoxCreated = new StickyNoteAnnotationToolBox();
				if (configuration != undefined
						&& configuration.text != undefined)
					config = configuration.text;
				break;
				
			case markupTypes.Stamp:
				toolBoxCreated = new StampAnnotationToolBox();
				if (configuration != undefined
						&& configuration.text != undefined)
					config = configuration.text;
				break;	
			case markupTypes.Image:
				toolBoxCreated = new ImageAnnotationToolBox();
				break;	
			case markupTypes.SearchHighlight:
				toolBoxCreated = new TextAnnotationToolBox();
				// localAnnotationToolBox.push(new TextAnnotationToolBox());
				break;
			case markupTypes.TextHighLight:
				toolBoxCreated = new TextHighlightToolBox();
				toolBoxCreated.setOpacityLevel(defaultTextHighlightOpacity);
				if (configuration != undefined
						&& configuration.texthighlight != undefined)
					config = configuration.texthighlight;
				break;
			case markupTypes.CollabHighlight:
				toolBoxCreated = new CollabHighlightToolBox();
				toolBoxCreated.setOpacityLevel(defaultTextHighlightOpacity);
				if (configuration != undefined
						&& configuration.collabhighlight != undefined)
					config = configuration.collabhighlight;
				break;
			case markupTypes.StrikeThrough :
				toolBoxCreated = new StrikeThrough();
				if (configuration != undefined
						&& configuration.strikeout != undefined)
					config = configuration.strikeout;
				break;
			}
			if (config != null && config != undefined) {
				for ( var x in config) {
					if (x === 'opacity') {
						toolBoxCreated.setOpacityLevel(config[x]);
					} else {
						if (toolBoxCreated[x] != undefined
								&& toolBoxCreated[x] != null) {
							toolBoxCreated[x] = config[x];
						}
					}
				}

			}

			localAnnotationToolBox.push(toolBoxCreated);
		}
	}
	
	//Stores current selected object within this documentViewer instance.
	//Useful for quickly retrieving selected object
	this.setCurrentSelectedMarkup = function setCurrentSelected(markupType) {
		currentSelectedAnnotation = markupType;
	};

	//Adds a redaction reason on front-end options
	//These will be available in the following:
	// Redaction Reason Option in Redaction property panel
	// Redaction Reason List in Redaction Pattern
	function addRedactionReason(reason) {
		var select = document.getElementById('selectReason');
		var opt = document.createElement('option');
		opt.value = reason;
		opt.innerHTML = reason;
		select.appendChild(opt);

		var redactionReasonDiv = document.createElement('div');
		redactionReasonDiv.className = "reasons-holder";
		redactionReasonDiv.innerHTML = reason;
		var reason = $(redactionReasonDiv);
		reason.on({
			click : selectRedactionReason
		});

		reason.on({
			mouseenter : hoverOption,
			mouseleave : outOption
		});
		redactionReasons.append(reason);
		truncateTextOption(opt,35);
		var redOption = opt.cloneNode(true);
		
		var reasonOptionsPatternRedact = getElement('patternReason');
		reasonOptionsPatternRedact.appendChild(redOption);
	}
	
	function addTagSet(tagSetName, index) {
	
		var tagSetDiv = document.createElement('div');
		tagSetDiv.className = "tagSets-holder";
		tagSetDiv.setAttribute("data-tagset-index", index);
		tagSetDiv.innerHTML = tagSetName;
		var tagSet = $(tagSetDiv);
		tagSet.on({
			click : selectTagSet
		});

		tagSet.on({
			mouseenter : hoverOption,
			mouseleave : outOption
		});
		tagSets.append(tagSet);
	}
	
	
	function addPatternName(patternName)
	{
		var pat = document.getElementById('redactPattern');
		var opt = document.createElement('option');
		opt.value = patternName;
		opt.innerHTML = patternName;
		pat.appendChild(opt);
		truncateTextOption(opt,35);
	}

	function truncateTextOption(option,length)
	{
		var jOpt = $(option);
		var option_temp = jOpt.text();
		var maxLength = length;
		if(jOpt.text().length >= maxLength) { jOpt.text(jOpt.text().substr(0,maxLength) + '...');
		 jOpt.attr('title',option_temp);
		} 
	}

	function deleteHandler(event) {
		var key = event.keyCode;
		var userAgent = navigator.userAgent.indexOf('Mac OS X');

		if (key === 46 && userAgent == -1 || key === 8 && userAgent != -1) {
			if (annotationBox.css('display') === 'block') {
				deleteAnnotation.mouseup();
			} else if (redactBox.css('display') === 'block') {
				$(getElement('Redact_delete')).mouseup();
			} else {
				$(getElement('multiple_delete')).mouseup();
			}
		}
	}

	/**
	 * Initialize property selections for annotations/redactions
	 */
	function initializeViewer(documentToLoad) {
		populateRedactionReasons(documentToLoad.redactionReason);
		populateTagSets(documentToLoad.stampData);
		if(documentToLoad.patternList != undefined && documentToLoad.patternList.length > 0)
			populatePatternList(documentToLoad.patternList);
	}
	
	function populatePatternList(patternList)
	{
		var len = patternList.length;
		for(var x = 0; x<len;x++)
		{
			addPatternName(patternList[x]);
		}
	}
	
	/**
	 * Initializes redaction reason UI elements for FullPageRedaction,Pattern Redact,Rectangle Redaction
	 */
	function populateRedactionReasons(redactionReasonList)
	{
		redactionReasonList = "" + redactionReasonList;
		redactionReasonList = redactionReasonList.split(",");
		var req = new XMLHttpRequest();
		if (redactionReasonList) {
			$('.selected-reason').children('span').text(redactionReasonList[0]);
			localAnnotationToolBox[markupTypes.RectangleRedaction].reason = redactionReasonList[0];

			for ( var iy = 0; iy < redactionReasonList.length; iy++) {
				addRedactionReason(redactionReasonList[iy]);
			}
		} else {
			addRedactionReason('Redaction');
		}
	}
	
	
	function populateTagSets(stampData)
	{
		if(stampData != ""){
			stampData = JSON.parse(stampData);
			var tagSetArr = stampData.tagSets;
			var tagSetArrLen = tagSetArr.length;
			var tagSetList= [];
			
			for(var i=0; i<tagSetArrLen; i++){
				tagSetList[i]=tagSetArr[i].tagSetName;
			}
						
			if(tagSetList){
				$('.selected-tagSet').children('span').text(tagSetList[0]);
				populateTag(0);
				//localAnnotationToolBox[markupTypes.RectangleRedaction].reason = redactionReasonList[0];
				
				for( var i = 0; i < tagSetList.length; i++){
					addTagSet(tagSetList[i], [i]);
				}
			}
		}else{
			$("#stampBtn").hide();
		}
		
	}	
	
	
	/**
	 * Load last selected properties for annotation. Properties are cached from last selected annotation or last drawn object
	 * Based from annotation type.
	 */
	function selectAnnotationDraw(type, tab, annotationTool) {
		if(!documentViewer.isRestrictAnnFn){
			disableMagnifyingGlass();
			$(getElement('magnifyingGlass')).removeClass('active-state');
			annotationObject = type;
			clearAllHandles();
			currentSelectedAnnotation = type;
			activeAnnotation(annotationTool, tab);
			selectedObjectCollection = [];
			// if(selectedObjectCollection.length===0)
			// {
			var toolBox = localAnnotationToolBox[type];
			switch (type) {
			case markupTypes.TextRedactHighlight:
			case markupTypes.RectangleRedaction:
				// redactBox.children(".redactControls").children("#Redact_index").css("display","none
				// ");
				$(getElement('Redact_fill')).siblings('img')
						.removeClass('selected').end().addClass('selected');
				$("#Redact_index").css("display", "none ");
				$('.reason-container').css('display', 'block');
				$('.layering-controls').css('display', 'none');
				break;
			case markupTypes.Stamp:
				viewerWrapper.removeClass('cursorCrosshair');
				viewerWrapper.removeClass('text-cursor');
				
				break;	
			case markupTypes.Image:
				viewerWrapper.removeClass('cursorCrosshair');
				viewerWrapper.removeClass('text-cursor');
				
				break;					
			case markupTypes.Rectangle:
				opacityDropdown.html(toolBox.opacityLevel);
				fillWidthDropdown.html(toolBox.borderWeight);
				fillColorSelection.css('background-color', toolBox.fillColor);
				break;
			case markupTypes.Arrow:
				fillWidthDropdown.html(toolBox.borderWeight);
				opacityDropdown.html(toolBox.opacityLevel);
				fillColorSelection.css('background-color', toolBox.fillColor);
				break;
			case markupTypes.Line:
				fillWidthDropdown.html(toolBox.borderWeight);
				opacityDropdown.html(toolBox.opacityLevel);
				fillColorSelection.css('background-color', toolBox.fillColor);
				break;
			case markupTypes.StrikeThrough:
				fillWidthDropdown.html(toolBox.borderWeight);
				fillColorSelection.css('background-color', toolBox.fillColor);
				break;
			case markupTypes.CollabHighlight:
				fillColorSelection.css('background-color', toolBox.fillColor);
				break;
			case markupTypes.Circle:
				opacityDropdown.html(toolBox.opacityLevel);
				fillWidthDropdown.html(toolBox.borderWeight);
				fillColorSelection.css('background-color', toolBox.fillColor);
				break;
	
			case markupTypes.SearchHighlight:
				$('.annotateBoxTab img#layerTab').addClass('standBy');
	
				break;
			case markupTypes.StickyNote:
			case markupTypes.Text:
				opacityDropdown.html(toolBox.opacityLevel);
				fillWidthDropdown.html(toolBox.borderWeight);
				fillColorSelection.css('background-color', toolBox.fillColor);
	
				clearTextStyleTab();
				clearHorizontalAlignTab();
				clearVerticalAlignTab();
	
				if (toolBox.boldStyle)
					boldText.addClass("selected");
	
				if (toolBox.italicStyle)
					italicText.addClass("selected");
	
				if (toolBox.underlineStyle)
					underlineText.addClass("selected");
	
				if (toolBox.strikeStyle)
					strikeoutText.addClass("selected");
				
				if (type == markupTypes.StickyNote){
					viewerWrapper.removeClass('cursorCrosshair');
					viewerWrapper.removeClass('text-cursor');
				}
	
				switch (toolBox.horizontalAlign) {
				case 'center':
					centerAlign.addClass("selected");
					break;
				case 'left':
					leftAlignText.addClass("selected");
					break;
				case 'right':
					rightAlignText.addClass("selected");
					break;
				}
	
				switch (toolBox.verticalAlign) {
				case 'top':
					topAlignText.addClass("selected");
					break;
				case 'middle':
					middleAlignText.addClass("selected");
					break;
				case 'bottom':
					bottomAlignText.addClass("selected");
					break;
				}
				break;
			case markupTypes.TextHighLight:
				opacityDropdown.html(toolBox.opacityLevel);
				fillColorSelection.css('background-color', toolBox.fillColor);
				break;
			}
		}
	}

	/**
	 * Activates annotation draw for given type and display default tab for property panel
	 */
	function activeAnnotation($this, container) {
		if ($this.data('active') == false) {
			var annotateType = $this.data("annotate");
			if ($(addText).hasClass("selected-tool")
					&& annotateType != markupTypes.Text) {
				deactivateCurrentSelection(addText, container);
				document.removeEventListener("mousedown", initStartPosition,
						false);
			}
			if ($(addStickyNote).hasClass("selected-tool")
					&& annotateType != markupTypes.StickyNote) {
				deactivateCurrentSelection(addStickyNote, container);
				document.removeEventListener("mousedown", initStartPosition,
						false);
			}

			deactivateAnnotation();
			if(annotateType != markupTypes.Stamp && annotateType != markupTypes.StickyNote && annotateType != markupTypes.Image){
				addAnnotationDraw();
			}

			handTool.data('drag', 'unable').removeClass('selected-tool');
			viewerWrapper.removeDragScroll();

			container.siblings().css('display', 'none').end().css('display',
					'block');

			// $this.data('active',true).addClass('selected-tool');

			if (annotateType == markupTypes.TextHighLight
					|| annotateType == markupTypes.TextRedactHighlight
					|| annotateType == markupTypes.StrikeThrough
					|| annotateType == markupTypes.CollabHighlight) {
				viewerWrapper.addClass('text-cursor');
				viewerWrapper.removeClass('cursorCrosshair');
			} else {
				viewerWrapper.addClass('cursorCrosshair');
				viewerWrapper.removeClass('text-cursor');
			}
			
			collabTools = annotateType == markupTypes.StrikeThrough ? true : false;

			annotateBoxTab.children('img').css('display', 'none').removeClass(
					"selected").removeClass("standBy");
			annotateBoxTab.children('i').css('display', 'none').removeClass(
			"selected").removeClass("standBy");

			switch (annotateType) {

			case markupTypes.Arrow:
				arrowTab.siblings().removeClass("standBy selected").end().addClass('standBy selected');
				arrowTab.trigger('click');
				availableColors.children("#nofillColor").css({
					"display" : "none",
					"cursor" : "default"
				}).removeClass("nofillColor");
				availableColors.children("#nofillColor").removeClass("nofillColor");
				break;

			case markupTypes.Line:
				lineTab.siblings().removeClass("standBy selected").end().addClass('standBy selected');
				lineTab.trigger('click');
				availableColors.children("#nofillColor").css({
					"display" : "none",
					"cursor" : "default"
				}).removeClass("nofillColor");
				availableColors.children("#nofillColor").removeClass("nofillColor");
				break;
			case markupTypes.StrikeThrough:
				//arvin
				lineTab.addClass('standBy');
				addComment.addClass('standBy selected');
				tabFillColorWidth();
				addComment.trigger('click');
				availableColors.children("#nofillColor").css({
					"display" : "none",
					"cursor" : "default"
				}).removeClass("nofillColor");
				availableColors.children("#nofillColor").removeClass("nofillColor");
				
				break;

			case markupTypes.Rectangle:
				rectTab.siblings().removeClass("standBy selected").end().addClass('standBy selected');
				rectBorderTab.addClass('standBy');
				rectTab.trigger('click');
				availableColors.children("#nofillColor").css({
					"display" : "block",
					"cursor" : "pointer"
				});
				availableColors.children("#nofillColor").addClass("nofillColor");
				break;

			case markupTypes.Circle:				
				circleTab.siblings().removeClass("standBy selected").end().addClass('standBy selected');
				circleBorderTab.addClass('standBy');
				circleTab.trigger('click');
				availableColors.children("#nofillColor").css({
					"display" : "block",
					"cursor" : "pointer"
				});
				availableColors.children("#nofillColor").addClass("nofillColor");
				break;

			case markupTypes.Text:
				// For Filling
				rectTab.siblings().removeClass("standBy selected").end().addClass('standBy selected');
				rectBorderTab.addClass('standBy');
				textTab.addClass('standBy');
				textstyleTab.addClass('standBy');
				textAlignTab.addClass('standBy');
				verticalAlignTab.addClass('standBy');
				// Same as rectangle
				rectTab.trigger('click');
				availableColors.children("#nofillColor").css({
					"display" : "block",
					"cursor" : "pointer"
				});
				availableColors.children("#nofillColor").addClass("nofillColor");
				break;
				
			case markupTypes.StickyNote:
				// For Filling
				rectTab.siblings().removeClass("standBy selected").end().addClass('standBy selected');
				textTab.addClass('standBy');
				textstyleTab.addClass('standBy');
				textAlignTab.addClass('standBy');
				verticalAlignTab.addClass('standBy');
				positionTab.addClass('standBy');
				addNote.addClass('standBy');
				// Same as rectangle
				rectTab.trigger('click');
				//opacityPickerBox.css('display', 'none').removeClass('standBy');
				availableColors.children("#nofillColor").css({
					"display" : "block",
					"cursor" : "pointer"
				});
				availableColors.children("#nofillColor").addClass("nofillColor");
				break;
				
			case markupTypes.Stamp:
				tagSetTab.siblings().removeClass("standBy selected").end().addClass('standBy selected');
				textTab.addClass('standBy');
				textstyleTab.addClass('standBy');
				positionTab.addClass('standBy');
				applyStamp.addClass('standBy');
				tagSetTab.trigger('click');
				availableColors.children("#nofillColor").addClass("nofillColor");
				
				break;	
				
			case markupTypes.Image:
				imageTab.siblings().removeClass("standBy selected").end().addClass('standBy selected');
				positionTab.addClass('standBy');
				applyImage.addClass('standBy');
				imageTab.trigger('click');
				
				break;		
				
			case markupTypes.TextHighLight:
				rectTab.siblings().removeClass("standBy selected").end().addClass('standBy selected');
				rectTab.trigger('click');
				availableColors.children("#nofillColor").css({
					"display" : "none",
					"cursor" : "default"
				}).removeClass("nofillColor");
				availableColors.children("#nofillColor").removeClass("nofillColor");
				break;
			case markupTypes.CollabHighlight:
				rectTab.addClass('standBy');
				//rectTab.siblings().removeClass("standBy selected").end().addClass('standBy selected');
				addComment.addClass('standBy selected');
				tabFillColor();
				addComment.trigger('click');
				//rectTab.trigger('click');
				availableColors.children("#nofillColor").css({
					"display" : "none",
					"cursor" : "default"
				}).removeClass("nofillColor");
				availableColors.children("#nofillColor").removeClass("nofillColor");				
				break;
							
			}
		} else if ($this.data('active') == true) {
			deactivateCurrentSelection($this, container);
		}
	}

	/**
	 * Deactivates current selected annotation/redaction/collaboration draw tool.
	 */
	function deactivateCurrentSelection(element, container) {
		deactivateAnnotationDraw();
		element.data('active', false).removeClass('selected-tool');
		viewerWrapper.removeClass('cursorCrosshair');
		viewerWrapper.removeClass('text-cursor');
		container.css('display', 'none');
		setMouseStyle();
	}

	function displaySettings(type, tab) {
		var color, opacity, strokeWidth, fontFamily, fontSize, horizontalAlign, verticalAlign, isBold = false, isItalic = false, isUnderline = false, isStrike = false;
		var singleObject = (type === markupTypes.Text && (tab != "fill" && tab != "border")) ? getSingleSelectedTextObject()
				: getSingleSelectedObject(0);
		var mark = getSingleSelectedMarkupObject(0);
		var toolBox = localAnnotationToolBox[type];
		switch (tab) {
		case 'fill':
			if (singleObject) {
				switch (type) {
				case markupTypes.Line:
				case markupTypes.Arrow:
					color = singleObject.getAttribute('stroke');
					strokeWidth = singleObject.getAttribute('stroke-width');
					break;
				default:
					color = singleObject.getAttribute('fill');
					break;
				}
				// opacity =
				// getComputedStyle(singleObject,null).getPropertyValue('opacity');
				opacity = (mark.attributes.opacity);
			} else {
				color = toolBox.fillColor;
				opacity = toolBox.opacityLevel;
				opacity = parseInt(opacity.substring(0, opacity.indexOf('%'))) / 100;
				if (type != markupTypes.TextHighLight && type != markupTypes.CollabHighlight)
					strokeWidth = toolBox.borderWeight;
			}
			break;
		case 'border':
			if (singleObject) {
				color = singleObject.getAttribute('stroke');
				strokeWidth = singleObject.getAttribute('stroke-width');
			} else {
				color = toolBox.borderColor;
				strokeWidth = toolBox.borderWeight;
			}
			break;
		case 'text':
			if (singleObject) {
				if (isIE) {
					// color =
					// getComputedStyle(singleObject,null).getPropertyValue("fill");
					color = getRGBvalue(getComputedStyle(singleObject, null)
							.getPropertyValue("fill"));
				} else if (isFirefox) {
					color = getRGBvalue(singleObject.style.color);
				} else {
					// color =
					// getComputedStyle(singleObject,null).getPropertyValue("color");
					color = getRGBvalue(getComputedStyle(singleObject, null)
							.getPropertyValue("color"));
				}
				fontFamily = getComputedStyle(singleObject, null)
						.getPropertyValue("font-family");
				fontFamily = fontFamily.replace("'", '');
				fontSize = getComputedStyle(singleObject, null)
						.getPropertyValue("font-size");
				fontSize = fontSize.replace("px", "");
			} else {
				color = toolBox.fontColor;
				fontFamily = toolBox.fontFamily.replace("'", '');
				fontSize = toolBox.fontSize.replace("px", "");
			}
			break;
		case 'textStyle':
			clearTextStyleTab();
			if (singleObject) {
				isBold = singleObject.style["fontWeight"] != 'normal';
				isItalic = singleObject.style["fontStyle"] != 'normal';
				var textDecoration = getComputedStyle(singleObject, null)
						.getPropertyValue("text-decoration");

				if (textDecoration == 'underline') {
					isUnderline = true;
				} else if (textDecoration == 'line-through') {
					isStrike = true;
				} else if (textDecoration == 'underline line-through') {
					isUnderline = true;
					isStrike = true;
				}
			} else {
				isBold = toolBox.boldStyle;
				isItalic = toolBox.italicStyle;
				isUnderline = toolBox.underlineStyle;
				isStrike = toolBox.strikeStyle;
			}
			break;
		case 'textAlign':
			clearHorizontalAlignTab();
			clearVerticalAlignTab();

			if (singleObject) {
				horizontalAlign = getComputedStyle(singleObject, null)
						.getPropertyValue("text-align");
				verticalAlign = getComputedStyle(singleObject, null)
						.getPropertyValue("vertical-align");
			} else {
				horizontalAlign = toolBox.horizontalAlign;
				verticalAlign = toolBox.verticalAlign;
			}

			switch (horizontalAlign) {
			case 'left':
				leftAlign.addClass("selected");
				break;
			case 'center':
				centerAlign.addClass("selected");
				break;
			case 'right':
				rightAlign.addClass("selected");
				break;
			}

			switch (verticalAlign) {
			case 'top':
				topAlign.addClass("selected");
				break;
			case 'middle':
				middleAlign.addClass("selected");
				break;
			case 'bottom':
				bottomAlign.addClass("selected");
				break;
			}

			break;
		}

		// if(color && color.indexOf('0)')>-1 && color.split(',').length===4 &&
		// (color == 'rgba(176, 176, 176, 0)' || color == 'rgba(0, 0, 0, 0)'||
		// color == 'transparent'))
		
		
		if (color == 'rgba(176, 176, 176, 0)' || color == 'rgba(0, 0, 0, 0)'
				|| color == 'transparent') {
			fillColorSelection.addClass('nofillColor');
		} else {
			fillColorSelection.removeClass('nofillColor');
		}

		if (tab == 'fill' || tab == 'border' || tab == 'text') {
			if(color != null){
				fillColorSelection.css('background-color', getRGBvalue(color));
			}
		}
		setToolBarOpacity('fillOpacity', opacity);
		setToolBarWidth('fillWidth', strokeWidth);
		setToolBarFontFace('fontFace', fontFamily);
		setToolBarFontSize('textSize', fontSize);

		if (isBold === true) {
			boldText.addClass("selected");
		}
		if (isItalic === true) {
			italicText.addClass("selected");
		}
		if (isUnderline === true) {
			underlineText.addClass("selected");
		}
		if (isStrike === true) {
			strikeoutText.addClass("selected");
		}
	}

	// Show Fill Color
	function tabFillColor() {
		hideTabContent();
		colorPickerBox.addClass('standBy');
		opacityPickerBox.addClass('standBy');
	}

	function tabFillColorWidth() {
		hideTabContent();
		colorPickerBox.addClass('standBy');
		if(!collabTools)
			opacityPickerBox.addClass('standBy');
		widthPickerBox.addClass('standBy');
	}

	// Show Border Tools
	function tabBorderColor() {
		hideTabContent();
		colorPickerBox.addClass('standBy');
		widthPickerBox.addClass('standBy');
	}

	// Show Font Face Tools
	function tabFontFace() {
		hideTabContent();
		colorPickerBox.addClass('standBy');
		fontFacePickerBox.addClass('standBy');
		textSizePickerBox.addClass('standBy');
	}

	// Show Text Style Tools
	function tabTextStyle() {
		hideTabContent();
		textStyleContainer.addClass('standBy');
	}

	// Show Text Align Tools
	function tabTextAlign() {
		hideTabContent();
		textAlignContainer.addClass('standBy');
	}

	// Show Text Align Tools
	function tabVerticalAlign() {
		hideTabContent();
		verticalAlignContainer.addClass('standBy');
	}

	// Show Layers
	function tabLayers() {
		hideTabContent();
		layerContainer.addClass('standBy');

		// clear selected layer
		layerContainer.children('img').each(function() {
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
			}
		});
	}



	/**
	 * Deactivates all object draw tools
	 */
	function deactivateAnnotation() {
		// Unselect Annotation
		addRedact.data('active', false).removeClass('selected-tool');
		addArrow.data('active', false).removeClass('selected-tool');
		addLine.data('active', false).removeClass('selected-tool');
		addSquare.data('active', false).removeClass('selected-tool');
		addCircle.data('active', false).removeClass('selected-tool');
		addText.data('active', false).removeClass('selected-tool');
		addTextHighlight.data('active', false).removeClass('selected-tool');
		addStamp.data('active', false).removeClass('selected-tool');
		addStickyNote.data('active', false).removeClass('selected-tool');
		addImage.data('active', false).removeClass('selected-tool');
		addRedactTextHighlight.data('active', false).removeClass(
				'selected-tool');

		// Hide Container
		redactBox.css('display', 'none');
		arrowBox.css('display', 'none');
		lineBox.css('display', 'none');
		squareBox.css('display', 'none');
		circleBox.css('display', 'none');
		textBox.css('display', 'none');
		multipleBox.css('display', 'none');
		addComment.css('display','none');

	}

	// Page Navigation Control
	pageNavContainer.find('ul > li').css({
		'cursor' : 'default'
	});
	pageNavContainer.find('ul > li > i').css({
		'opacity' : '1'
	});

	/*----- LEX ------*/

	var pageCountTemp = pageCountLabel.text();

	if (pageCountLabel.text() == pageCountTemp) {
		$(getElement('firstBtn')).css({
			'cursor' : 'not-allowed',
			'opacity' : '0.5'
		});
		$(getElement('prevBtn')).css({
			'cursor' : 'not-allowed',
			'opacity' : '0.5'
		});
	} else if (pageCountLabel.text() == parseInt('1')) {
		$(getElement('lastBtn')).css({
			'cursor' : 'not-allowed',
			'opacity' : '0.5'
		});
		$(getElement('nextBtn')).css({
			'cursor' : 'not-allowed',
			'opacity' : '0.5'
		});
	}

	/*----- LEX ------*/
	
	detectMobile();

	try {
		if (this.isMobile === false) {
			document.addEventListener('mousedown', selectAnnotationObject, true);
			if (isIE) {
				if (msieversion() === 11) {
					document.addEventListener('mousemove', fixArrows, true);
					document.addEventListener('mouseup', fixArrows, true);
				}
			}
		}
	} catch (er) {
		console.error("Exception: " + er);
	}

	function nextHitTerm() {
		var walker = document.getElementById('walker');
		var walkerCount = parseInt(walker.innerHTML);
		var currentTerm = walkerCount - 1;
		var currentTermWalkerObject = highlightWalkerCollection[currentTerm];
		var rectangleObjects = currentTermWalkerObject.rectangles;
		var len = rectangleObjects.length;
		for ( var i = 0; i < len; i++) {
			changeToHighlightColor(rectangleObjects[i]);
		}
		if (currentTerm === highlightWalkerCollection.length - 1
				&& currentTerm != 0) {
			currentTerm = 0;
			walkerCount = 0;
		} else {
			if (highlightWalkerCollection.length != 1)
				currentTerm++;
		}
		navigateToNextTerm(currentTerm);
		if (highlightWalkerCollection.length != 1)
			walker.innerHTML = walkerCount + 1;
	}

	function previousHitTerm() {
		var walker = document.getElementById('walker');
		var walkerCount = parseInt(walker.innerHTML);
		var currentTerm = walkerCount - 1;
		var currentTermWalkerObject = highlightWalkerCollection[currentTerm];
		var rectangleObjects = currentTermWalkerObject.rectangles;
		var len = rectangleObjects.length;
		for ( var i = 0; i < len; i++) {
			changeToHighlightColor(rectangleObjects[i]);
		}
		if (currentTerm === 0
				&& currentTerm != (highlightWalkerCollection.length - 1)) {
			currentTerm = highlightWalkerCollection.length - 1;
			walkerCount = highlightWalkerCollection.length + 1;
		} else {
			if (highlightWalkerCollection.length != 1)
				currentTerm--;
		}
		navigateToNextTerm(currentTerm);
		if (highlightWalkerCollection.length != 1)
			walker.innerHTML = walkerCount - 1;
	}

	window.addEventListener('message', function(event) {
		var data = event.data;
		if (typeof data == 'function') {
			data();
		}
		UDVApi(data);
	});

	var resizeId;

	var viewContainer = getElement('viewerContainer');
	new ResizeSensor($(viewContainer), function() {
		isResizing = true;
	    clearTimeout(resizeId);
	    resizeId = setTimeout(doneResizing, 250);
	});
	//Realign handles
	function doneResizing(){
		if(isFitContent)
		{
			fitToWidthViewablePages();			
		}
		isResizing = false;
	}
	if(isSafari === true)
	{
		$(viewContainer).attr('style');
		$(viewContainer).removeAttr('style');
		$(viewContainer).attr('style');
	}
	else
	{
		viewContainer.removeAttribute('style');		
	}


	/**
	 * Attaches all listeners for features/modules.
	 */
	function attachListeners()
	{
		
		$(window.parent).keydown(deleteHandler);
		$(document).keydown(deleteHandler);

		textSelection.on('click',
				function() {
					$(this).toggleClass('active-state');
					pageContents.toggleClass('text-cursor');
					closeAllPropertyPanel();
					resetAllAnnotationButtonState();
					resetAllRedactionButtonState();
					disableMagnifyingGlass();
					$(getElement('magnifyingGlass')).removeClass('active-state');
					handTool.data("drag", "unable").removeClass(
							'selected-tool');
					handTool.data('laststate', false);
					viewerWrapper.removeDragScroll();
					clearAllHandles();
				});
		
		magnifyingGlass.on('click',
				function() {
					$(this).toggleClass('active-state');
					resetAllAnnotationButtonState();
					resetAllRedactionButtonState();
					resetAllCollabBtns();
					closeAllPropertyPanel();
					$(getElement('textSelection')).removeClass('active-state');
					$('.pageContent').removeClass('text-cursor');
					$(getElement('page-zoomtool')).removeClass('move-top');
					clearAllHandles();
					handTool.data("drag", "unable").removeClass(
							'selected-tool');
					handTool.data('laststate', false);
					viewerWrapper.removeDragScroll();
				});
		
		$(getElement('clearSearchBox')).mouseup(function(evt) {
			clearSearch();
		});
		
		searchBox.keydown(function(event) {
			function getConfig() {
				var options = $('.search-btns > li > span', '#"searchOptions"');
				return options;
			}
			var key = event.keyCode;
			if (key === 16) {
				shiftPushed = true;
			}
			if (key === 13) {
				getModifiedQuery(this.value);
				if (this.value === '' && this.value === undefined)
					console.log('Query is empty. Try again.');
				else if (this.value.length < 2)
					console.log('Query is too short');
				else if (lastQuery === modifiedQuery) {

					var walker = document.getElementById('walker');
					var walkerCount = parseInt(walker.innerHTML);

					if (walkerCount != 0) {
						if (shiftPushed) {
							previousHitTerm();
						} else {
							nextHitTerm();
						}
					}
				} else {
					executeSearch(this.value);
				}
			}

		});
		
		$('#searchBtn').on('click', function() {
			var query = searchBox.val();
			if (query.indexOf('...') > -1) {
				if (_temp.length > 1)
					executeSearch(_temp);
			} else {
				if (query.length > 1)
					executeSearch(query);
			}

		});

		searchBox.keyup(function(event) {
			var key = event.keyCode;
			if (key === 16) {
				shiftPushed = false;
			}
		});
		
		// Last selected color
		$('.tab-menu').on("click","li", function() {
			if($(document.body).width() <= 800) {
				$('.rs-btn').hide('fast'); 
			}
			transferTextAreaValuetoDiv(lastSelectedDivReason);
			var $this = $(this);
			$this.addClass("tab-active").siblings('li')
					.removeClass("tab-active");

			switch ($this.data("name")) {
			case "page":
				$('.under-page').show().siblings().hide();
				break;
			case "search":
				if(documentViewer.isMobile === true){
				//$('.under-search').hide();
					$(getElement('textSelection')).css('display','none');
					$('.tab-menu #pageTab').trigger('click');
				
				} else {
					$('.under-search').show().siblings().hide();
				}
				var currentSelected = currentlySelectedAnnotation(annotationObject);
				if (currentSelected != undefined) {
					$(currentSelected).removeClass("on")
							.removeClass("off").addClass("mute");
					if (currentSelected.getAttribute("id") == "addText") {
						deactivateCurrentSelection(addText,
								annotationBox);
						document.removeEventListener("mousedown",
								initStartPosition, false);
					}
				}
				break;
			case "annotate":
				$('.under-annotate').show().siblings().hide();
				/* handTool.trigger("mouseup"); */
				break;
			case "redact":
				$('.under-redact').show().siblings().hide();
				/* handTool.trigger("mouseup"); */
				break;
			}

			// Hide RedactBox when changing Tab
			/*
			 * if($this.name != 'redact'){
			 * redactBox.removeAttr('style'); redactBox.css({
			 * 'top':'80px', 'right':$('#redactBox').width() * -1
			 * }); }
			 */
			// End
			// Hide SearBox when changing Tab
			if ($this.data('name') != 'search') {
				searchContainer.removeAttr('style');

				searchContainer.css({
					'display' : 'none'
				});
				searchMenu.data('active', false).removeClass(
						'selected-tool');
			}
			// End
		});

		$('#page-handtool, #page-rotatePage, #page-rotatePageCounter, #page-rotateDoc, #page-rotateDocCounter, #zoomOut, #zoomIn, #fitToWidth').on('click', function() {
			resetAllDrawingButtonState();
			closeAllPropertyPanel();
			disableMagnifyingGlass();
			if($(document.body).width() <= 800) {
				$('.rs-btn').hide('fast');
				//console.log('1');
			} 
		});

		// Use Hand Tool
		handTool.on({
			mouseup : function() {
				transferTextAreaValuetoDiv(lastSelectedDivReason);
				var $this = $(this);
				if ($this.data("drag") == "unable") {
					viewerChild.removeClass('cursorCrosshair');
					viewerChild.removeClass('text-cursor');
					$this.data("drag", "enable").addClass('selected-tool');
					$this.data('laststate', true);
					viewerWrapper.dragScroll();
					$this.removeAttr('style');

					// Cancel Drawing
					document.removeEventListener("mousedown", initStartPosition,
							false);
				} else if ($this.data("drag") == "enable") {
					$this.data("drag", "unable").removeClass('selected-tool');
					$this.data('laststate', false);
					viewerWrapper.removeDragScroll();
				}

				// Cancel Annotation
				if (!selectedObjectCollection.length) {
					closeAnnotateBox.trigger('click');
					closeRedact.trigger('click');
				}
				// deactivateAnnotation();
			}
		});

		// handTool.trigger('mouseup');

		$('.annotationBtnWithProperties').click(function() {
			
			if(!documentViewer.isRestrictAnnFn){
				if($(document.body).width() <= 800) {
					$('.rs-btn').hide('fast');
					//console.log('1');
				}
				$(this).removeClass('selected-tool');
	
				if ($(this).is('.mute')) {
					/*
					 * Should Turn ON Continuous Application
					 */
					// console.log('123 should ON');
					$(this).removeClass('selected-tool');
					$(".annotationBtnWithProperties").each(function(index) {
						// console.log( index + ": " + $( this ).hasClass('on') || index
						// + ": " + $( this ).hasClass('off') );
						// $( this ).removeClass('on off').addClass('mute');
						resetAllDrawingButtonState();
					});
					$(this).toggleClass("mute on");
					
	//				if($(document.body).width() <= 800) {
	//					pageZoomTool.addClass('move-top');
	//					$('#minimize').click();
	//					$('.rs-btn').hide('fast');
	//					pageZoomTool.removeClass('move-right');
	//				}
					
				} else if ($(this).is('.on')) {
					/*
					 * Should Turn OFF Continuous Application and turn on SINGLE
					 * Application
					 */
					$(this).removeClass('selected-tool');
					$(this).toggleClass("on off");
					// console.log('123 should OFF');
	
				} else if ($(this).is('.off')) {
					/*
					 * Should Turn close Property Box
					 */
					$(this).removeClass('selected-tool');
					$(this).toggleClass("off mute");
					// console.log('123 should MUTE');
					closeAnnotateBox.click();
					
	//				if($(document.body).width() <= 800) {
	//					pageZoomTool.removeClass('move-top');
	//				}
					
	
				}
			}
		});

		$('.redactionBtnWithProperties').click(function() {
			if($(document.body).width() <= 800) {
				$('.rs-btn').hide('fast');
				//console.log('1');
			}
			$(this).removeClass('selected-tool');

			if ($(this).is('.mute')) {
				/*
				 * Should Turn ON Continuous Application
				 */
				// console.log('123 should ON');
				$(this).removeClass('selected-tool');
				$(".redactionBtnWithProperties").each(function(index) {
					// console.log( index + ": " + $( this ).hasClass('on') || index
					// + ": " + $( this ).hasClass('off') );
					// $( this ).removeClass('on off').addClass('mute');
					resetAllDrawingButtonState();
				});
				$(this).toggleClass("mute on");
				
//				if($(document.body).width() <= 800) {
//					pageZoomTool.addClass('move-top');
//					$('#minimize').click();
//					$('.rs-btn').hide('fast');
//					pageZoomTool.removeClass('move-right');
//				}
				

			} else if ($(this).is('.on')) {
				/*
				 * Should Turn OFF Continuous Application and turn on SINGLE
				 * Application
				 */
				$(this).removeClass('selected-tool');
				$(this).toggleClass("on off");
				// console.log('123 should OFF');

			} else if ($(this).is('.off')) {
				/*
				 * Should Turn close Property Box
				 */
				$(this).removeClass('selected-tool');
				$(this).toggleClass("off mute");
				// console.log('123 should MUTE');
				closeRedact.click();
				
//				if($(document.body).width() <= 800) {
//					pageZoomTool.removeClass('move-top');
//				}
				
			}

		});
		
		addRedact.mouseup(function() {
			selectAnnotationDraw(markupTypes.RectangleRedaction, redactBox,$(this));
		});

		addRedactTextHighlight.mouseup(function() {
			selectAnnotationDraw(markupTypes.TextRedactHighlight, redactBox,$(this));
		});
		
		addStamp.mouseup(function() {
			selectAnnotationDraw(markupTypes.Stamp, annotationBox, $(this));
		});
		
		addImage.mouseup(function() {
			selectAnnotationDraw(markupTypes.Image, annotationBox, $(this));
		});
		
		addStickyNote.mouseup(function() {
			selectAnnotationDraw(markupTypes.StickyNote, annotationBox, $(this));
		});

		addArrow.mouseup(function() {
			selectAnnotationDraw(markupTypes.Arrow, annotationBox, $(this));
		});

		addLine.mouseup(function() {
			selectAnnotationDraw(markupTypes.Line, annotationBox, $(this));
		});

		addSquare.mouseup(function() {
			selectAnnotationDraw(markupTypes.Rectangle, annotationBox, $(this));
		});

		addCircle.mouseup(function() {
			selectAnnotationDraw(markupTypes.Circle, annotationBox, $(this));
		});

		addText.mouseup(function() {
			selectAnnotationDraw(markupTypes.Text, annotationBox, $(this));
		});

		addTextHighlight.mouseup(function() {
			selectAnnotationDraw(markupTypes.TextHighLight, annotationBox,$(this));
		});

		addStrikeThrough.mouseup(function() {
			selectAnnotationDraw(markupTypes.StrikeThrough, annotationBox,$(this));
		});
		
		addStrikeThrough.click(function() {
			commentTxtArea.val('');
		});
		
		addCollabHighlight.mouseup(function() {
			selectAnnotationDraw(markupTypes.CollabHighlight, annotationBox,$(this));
		});
		
		addCollabHighlight.click(function() {
			commentTxtArea.val('');
		});
		
		
		$(getElement('applyPattern')).mouseup(function() {
			var patternQuery = getElement('redactPattern').value;
			var selectedReason = getElement('patternReason').value;
			patternSearch(patternQuery,selectedReason,false);
		});
		
		$(getElement('applyAndSavePattern')).mouseup(function() {
			var patternQuery = getElement('redactPattern').value;
			var selectedReason = getElement('patternReason').value;
			patternSearch(patternQuery,selectedReason,true);
		});
		
		$("#viewer-wrapper").click(function(){
			if(!textSelection.hasClass("active-state")){
				disableCopy();
			}
		});
		
		// Hide dropdown when user click anywhere at the page
		viewerWrapper.on('click', function() {
			hideDropDown();
		});
		
		// Arrow Tab
		arrowTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				tabFillColorWidth();
				displaySettings(markupTypes.Arrow, 'fill');
				showHideNoFillColor('stroke');
			}
		});

		// Line Tab
		lineTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				tabFillColorWidth();
				displaySettings(markupTypes.Line, 'fill');
				showHideNoFillColor('stroke');
				if(currentSelectedAnnotation==markupTypes.StrikeThrough)
				{
					var mark = getSingleSelectedMarkupObject(0);
					if(!mark)
					{
						var toolBox = localAnnotationToolBox[markupTypes.StrikeThrough];
						fillWidthDropdown.html(toolBox.borderWeight);
						fillColorSelection.css('background-color', toolBox.fillColor);
					}
				}
			}
		});
		
		// Note position
		positionTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				hideTabContent();
				positionContainer.addClass('standBy');
			}
		});
		
		//tagSet Tab
		tagSetTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				hideTabContent();
				stampControlsContainer.addClass('standBy');
				opacityPickerBox.addClass('standBy');
				$("#opacityCssTemp").css('display', 'block');
				displaySettings(parseInt(currentSelectedAnnotation), 'fill');
			}
		});

		//image Tab
		imageTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				hideTabContent();
				imageContainer.addClass('standBy');
				setImagePreviewData(documentToLoad.imagePath);
				//opacityPickerBox.addClass('standBy');
				//displaySettings(parseInt(currentSelectedAnnotation), 'fill');
				
			}
		});
		
		// Rect Tab
		rectTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				tabFillColor();
				displaySettings(parseInt(currentSelectedAnnotation), 'fill');
				showHideNoFillColor('fill');
//				if(currentSelectedAnnotation === markupTypes.StickyNote){
//					opacityPickerBox.css('display', 'none').removeClass('standBy');
//				}
			}
		});

		// Rect Border
		rectBorderTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				tabBorderColor();
				displaySettings(parseInt(currentSelectedAnnotation), 'border');
				showHideNoFillColor('border');
			}
		});

		// Circle Tab
		circleTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				tabFillColor();
				displaySettings(markupTypes.Circle, 'fill');
				showHideNoFillColor('fill');
			}
		});

		// Circle Border
		circleBorderTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				tabBorderColor();
				displaySettings(markupTypes.Circle, 'border');
				showHideNoFillColor('border');
			}
		});

		// Font Face
		textTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				tabFontFace();
				displaySettings(markupTypes.Text, 'text');
				showHideNoFillColor('text');
			}
		});

		// Text Style
		textstyleTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				tabTextStyle();
				displaySettings(markupTypes.Text, 'textStyle');
				// unselect the bold, italic strike and underline
			}
		});

		// Text Align
		textAlignTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				tabTextAlign();
				displaySettings(markupTypes.Text, 'textAlign');
			}
		});

		// Vertical Align
		verticalAlignTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				tabVerticalAlign();
			}
		});

		layerTab.on({
			click : function() {
				$(this).siblings().removeClass("selected").end().addClass(
						'selected');
				tabLayers();
			}
		});
		
		// Show DropDowns
		// Color Picker
		colorPickerBox.on({
			click : function() {
				var $this = $(this);
				$this.siblings('div').children().each(function() {
					if ($(this).hasClass('active')) {
						$(this).removeClass('active');
					}
				});
				if (availableColors.hasClass('active')) {
					availableColors.removeClass('active');
				} else {
					availableColors.addClass('active');
				}
			}
		});

		// Opacity Picker
		opacityPickerBox.on({
			click : function() {
				var $this = $(this);
				$this.siblings('div').children().each(function() {
					if ($(this).hasClass('active')) {
						$(this).removeClass('active');
					}
				});
				if (availableOpacity.hasClass('active')) {
					availableOpacity.removeClass('active');
				} else {
					availableOpacity.addClass('active');
				}
			}
		});

		// Width Picker
		widthPickerBox.on({
			click : function() {
				var $this = $(this);
				$this.siblings('div').children().each(function() {
					if ($(this).hasClass('active')) {
						$(this).removeClass('active');
					}
				});
				if (availableWidth.hasClass('active')) {
					availableWidth.removeClass('active');
				} else {
					availableWidth.addClass('active');
				}
			}
		});

		// Fontface Picker
		fontFacePickerBox.on({
			click : function() {
				var $this = $(this);
				$this.siblings('div').children().each(function() {
					if ($(this).hasClass('active')) {
						$(this).removeClass('active');
					}
				});
				if (availableFonts.hasClass('active')) {
					availableFonts.removeClass('active');
				} else {
					availableFonts.addClass('active');
				}
			}
		});

		// Textsize Picker
		textSizePickerBox.on({
			click : function() {
				var $this = $(this);
				$this.siblings('div').children().each(function() {
					if ($(this).hasClass('active')) {
						$(this).removeClass('active');
					}
				});
				if (availableSize.hasClass('active')) {
					availableSize.removeClass('active');
				} else {
					availableSize.addClass('active');
				}
			}
		});
		// End of Dropdowns

		// Picking Colors
		availableColors.on({
							click : function() {
								var $this = $(this);
								if ($this.attr('data-bgcolor') == "none") {
									fillColorSelection.addClass('nofillColor');
								} else {
									fillColorSelection.removeClass('nofillColor');
								}
								fillColorSelection.attr('style', $this
										.attr('style'));

								var selectedObject = getSingleSelectedMarkupObject(0);
								var selectedAnnotationToolBox = localAnnotationToolBox[currentSelectedAnnotation];
								switch (currentSelectedAnnotation) {
								case markupTypes.Arrow:
								case markupTypes.Line:
									if (selectedObject) {
										selectedObject
												.setFillColor(fillColorSelection
														.css('background-color'));
									}
									// else
									// {
									selectedAnnotationToolBox.fillColor = fillColorSelection
											.css('background-color');
									// }
									break;
									
								//////check this arvin	
								case markupTypes.Stamp:	
								case markupTypes.StickyNote:	
								case markupTypes.Text:
									if (selectedObject) {
										if (textTab.hasClass('selected')) {
											selectedObject
													.setFontColor(getRGBAcolor(
															fillColorSelection
																	.css('background-color'),
															getSingleSelectedObject(
																	0)
																	.getAttribute(
																			'data-opacity')));
											document
													.getElementById('textAreaContainer').style.color = fillColorSelection
													.css('background-color');
										}
									}
									// else
									// {
									if (textTab.hasClass('selected')) {
										selectedAnnotationToolBox.fontColor = fillColorSelection
												.css('background-color');
									}
									// }
								case markupTypes.Rectangle:
									if (selectedObject) {
										if (rectTab.hasClass('selected')) {
											selectedObject
													.setFillColor(fillColorSelection
															.css('background-color'));
											if (document
													.getElementById("textAreaContainer").style.display != 'none') {
												var fillColor = fillColorSelection
														.css('background-color');
												if (fillColor == 'rgba(176, 176, 176, 0)'
														|| fillColor == 'rgba(0, 0, 0, 0)'
														|| fillColor == 'transparent') {
													fillColor = 'rgba(255, 255, 255, 1)';
												}
												$(getElement('textAreaContainer'))
														.css('background-color',
																fillColor);
											}
										}
										if (rectBorderTab.hasClass('selected')) {
											selectedObject
													.setBorderColor(fillColorSelection
															.css('background-color'));
										}
									}
									// else
									// {
									if (rectTab.hasClass('selected')) {
										selectedAnnotationToolBox.fillColor = fillColorSelection
												.css('background-color');
									}

									if (rectBorderTab.hasClass('selected')) {
										selectedAnnotationToolBox.borderColor = fillColorSelection
												.css('background-color');
									}
									// }
									break;
								case markupTypes.TextHighLight:
								case markupTypes.CollabHighlight:
									if (selectedObject) {
										var len = selectedObject.drawnObjectCollection.length;
										var selectedArray = selectedObject.drawnObjectCollection
										for ( var i = 0; i < len; i++)
											selectedArray[i]
													.setFillColor(fillColorSelection
															.css('background-color'));
									}
									selectedAnnotationToolBox.fillColor = fillColorSelection
											.css('background-color');
									break;
								case markupTypes.StrikeThrough:
									if(selectedObject)
									{
										var len = selectedObject.drawnObjectCollection.length;
										var selectedArray = selectedObject.drawnObjectCollection
										for (var i = 0; i < len; i++)
											selectedArray[i].setFillColor(fillColorSelection.css('background-color'));
									}
									selectedAnnotationToolBox.fillColor = fillColorSelection.css('background-color');
									break;
								case markupTypes.Circle:

									if (selectedObject) {
										if (circleTab.hasClass('selected')) {
											selectedObject
													.setFillColor(fillColorSelection
															.css('background-color'));
										}
										if (circleBorderTab.hasClass('selected')) {
											selectedObject
													.setBorderColor(fillColorSelection
															.css('background-color'));
										}
									}
									// else
									// {
									if (circleTab.hasClass('selected')) {
										selectedAnnotationToolBox.fillColor = fillColorSelection
												.css('background-color');
									}
									if (circleBorderTab.hasClass('selected')) {
										selectedAnnotationToolBox.borderColor = fillColorSelection
												.css('background-color');
									}
									// }

									break;
								}

								hideDropDown();
								return false;
							}
						}, "div");

		// Picking Opacity
		availableOpacity.on({
			click : function() {
				opacityDropdown.text($(this).text());
				var selectedMark = getSingleSelectedMarkupObject(0);
				if (selectedMark) {
					if (selectedMark.setOpacity) {
						selectedMark.setOpacity(getSelectedOpacity('fillOpacity'));
					} else {
						var len = selectedMark.drawnObjectCollection.length;
						var selectedArray = selectedMark.drawnObjectCollection;
						for ( var i = 0; i < len; i++) {
							selectedArray[i]
									.setOpacity(getSelectedOpacity('fillOpacity'));
						}
					}

				}
				// else
				// {
				localAnnotationToolBox[currentSelectedAnnotation]
						.setOpacityLevel($(this).text());
				// }

				hideDropDown();
				return false;
			}
		}, "div");

		// Picking Width
		availableWidth.on({
							click : function() {
								fillWidthDropdown.text($(this).text());
								var selectedObject = getSingleSelectedMarkupObject(0);
								if (selectedObject) {
									if(selectedObject.markupType === markupTypes.StrikeThrough) {
										var len = selectedObject.drawnObjectCollection.length;
										var selectedArray = selectedObject.drawnObjectCollection
										for (var i = 0; i < len; i++)
											selectedArray[i].setBorderWeight(getSelectedWidth('fillWidth'));
									} else {
										selectedObject
											.setBorderWeight(getSelectedWidth('fillWidth'));
										if(selectedObject.markupType === markupTypes.Arrow) {
											changeArrowHeadSize(
												selectedObject.shapes.SVGArrowHead,
												selectedObject.shapes.SVGPath,
												selectedObject.attributes);
										}
											//setWidth(getSingleSelectedObject(0), 'fillWidth');
									}
									var currentPage = pageCollection[(selectedObjectCollection[0].pageId)];
									reCalculateHandles(currentPage);
								}
								// else
								// {
								localAnnotationToolBox[currentSelectedAnnotation].borderWeight = $(
										this).text();
								// }

								hideDropDown();
								return false;
							}
						}, "div");

		// Picking Font Face
		availableFonts.on({
							click : function() {
								$(getElement('fontFace')).text($(this).text());
								hideDropDown();

								var fontFamily = document
										.getElementById('fontFace').innerHTML;
								if (getSelectedObjectGroup() != null) {
									var selectedObject = getSingleSelectedMarkupObject(0);
									selectedObject.setFontFamily(fontFamily);
									document.getElementById("textAreaContainer").style.fontFamily = fontFamily;
								}
								// else
								// {
								localAnnotationToolBox[currentSelectedAnnotation].fontFamily = fontFamily;
								// }

								return false;
							}
						}, "div");

		// Picking Text size
		availableSize.on({
							click : function() {
								$(getElement('textSize')).text($(this).text());
								hideDropDown();
								var fontSize = document.getElementById('textSize').innerHTML;
								if (getSelectedObjectGroup() != null) {
									var textDivId = parseInt(selectedObjectCollection[0].markupId);
									var selectedObject = getSingleSelectedMarkupObject(0);
									selectedObject.setFontSize(fontSize);
									document.getElementById("textAreaContainer").style.fontSize = fontSize;
									if (isIE) {
										wrapTextOnSizeChange();
										setVerticalAlignOnChange(document
												.getElementById("divText-"
														+ textDivId));
									}
								}
								// else
								// {
								localAnnotationToolBox[currentSelectedAnnotation].fontSize = fontSize;
								// }

								return false;
							}
						}, "div");
		
		// Text Style
		$('.textStyleContainer').children('img').each(function() {
			$(this).on({'click' : function() {
					if ($(this).hasClass('selected')) {
						$(this).removeClass('selected');
						return false;
					} else {
						$(this).addClass('selected');
					}
				}
			});
		});

		// Text Style -- BOLD
		boldText.on('click',
						function() {
							var $this = $(this);
							if (getSelectedObjectGroup() != null) {
								var selectedObject = getSingleSelectedMarkupObject(0);
								if ($this.hasClass("selected")) {
									// make bold
									selectedObject.setBoldStyle('bold');
									document.getElementById("textAreaContainer").style.fontWeight = 'bold';
								} else {
									// unbold
									selectedObject.setBoldStyle('normal');
									document.getElementById("textAreaContainer").style.fontWeight = 'normal';
								}
							}
							// else
							// {
							localAnnotationToolBox[currentSelectedAnnotation].boldStyle = $this
									.hasClass("selected");
							// }
						});

		// Text Style -- ITALIC
		italicText.on('click',
						function() {
							var $this = $(this);
							if (getSelectedObjectGroup() != null) {
								var selectedObject = getSingleSelectedMarkupObject(0);
								if ($this.hasClass("selected")) {
									selectedObject.setItalicStyle('italic');
									document.getElementById("textAreaContainer").style.fontStyle = 'italic';
								} else {
									selectedObject.setItalicStyle('normal');
									document.getElementById("textAreaContainer").style.fontStyle = 'normal';
								}
							}
							// else
							// {
							localAnnotationToolBox[currentSelectedAnnotation].italicStyle = $this
									.hasClass("selected");
							// }

						});

		// Text Style -- UNDERLINE
		underlineText.on('click',
						function() {
							var $this = $(this);

							if (getSelectedObjectGroup() != null) {
								var selectedObject = getSingleSelectedMarkupObject(0);
								if ($this.hasClass("selected")) {
									if (strikeoutText.hasClass("selected")) {
										selectedObject
												.setUnderlineStrikeStyle('underline line-through');
										document
												.getElementById("textAreaContainer").style.textDecoration = 'underline line-through';
									} else {
										selectedObject
												.setUnderlineStrikeStyle('underline');
										document
												.getElementById("textAreaContainer").style.textDecoration = 'underline';
									}

								} else {
									if (strikeoutText.hasClass("selected")) {
										selectedObject
												.setUnderlineStrikeStyle('line-through');
										document
												.getElementById("textAreaContainer").style.textDecoration = 'line-through';
									} else {
										selectedObject
												.setUnderlineStrikeStyle('none');
										document
												.getElementById("textAreaContainer").style.textDecoration = 'none';
									}
								}
							}
							// else
							// {
							localAnnotationToolBox[currentSelectedAnnotation].underlineStyle = $this
									.hasClass("selected");
							// }

						});

		// Text Style -- STRIKEOUT
		strikeoutText.on('click',
						function() {
							var $this = $(this);
							if (getSelectedObjectGroup() != null) {
								var selectedObject = getSingleSelectedMarkupObject(0);
								if ($this.hasClass("selected")) {
									if (underlineText.hasClass("selected")) {
										selectedObject
												.setUnderlineStrikeStyle('underline line-through');
										document
												.getElementById("textAreaContainer").style.textDecoration = 'underline line-through';
									} else {
										selectedObject
												.setUnderlineStrikeStyle('line-through');
										document
												.getElementById("textAreaContainer").style.textDecoration = 'line-through';
									}

								} else {
									if (underlineText.hasClass("selected")) {
										selectedObject
												.setUnderlineStrikeStyle('underline');
										document
												.getElementById("textAreaContainer").style.textDecoration = 'underline';
									} else {
										selectedObject
												.setUnderlineStrikeStyle('none');
										document
												.getElementById("textAreaContainer").style.textDecoration = 'none';
									}
								}
							}
							// else
							// {
							localAnnotationToolBox[currentSelectedAnnotation].strikeStyle = $this
									.hasClass("selected");
							// }

						});

		// Text Alignment
		$('.textAlignContainer')
				.children('img')
				.each(
						function() {
							$(this)
									.on(
											{
												'click' : function() {
													$(this).siblings().removeClass(
															'selected').end()
															.addClass('selected');

													var selectedValue = $(this).context.id;
													var index = selectedValue
															.indexOf('Align');
													selectedValue = selectedValue
															.substring(0, index);

													if (getSelectedObjectGroup() != null) {
														// for with selected text
														var textDivId = parseInt(selectedObjectCollection[0].markupId);
														var udvPage = pageCollection[parseInt(selectedObjectCollection[0].pageId)];
														var pageRotation = udvPage.attributes.rotateDegrees;
														var widthValue = getSelectedObjectGroup().firstChild
																.getAttribute('width');
														if (pageRotation === 90
																|| pageRotation === 270) {
															widthValue = getSelectedObjectGroup().firstChild
																	.getAttribute('height');
														}
														var childLength = document
																.getElementById("divText-"
																		+ textDivId).childNodes.length;
														var selectedObject = getSingleSelectedMarkupObject(0);
														switch ($(this).context.id) {

														case 'leftAlign':
															if (isIE) {
																selectedObject
																		.setSVGTextValueX(5);
																selectedObject
																		.setTextAnchor('start');
																for ( var i = 1; i < childLength; i++) {
																	document
																			.getElementById("divText-"
																					+ textDivId).childNodes[i]
																			.setAttributeNS(
																					null,
																					'x',
																					5);
																}
															}
															selectedObject
																	.setHorizontalAlign('left');
															break;

														case 'centerAlign':
															if (isIE) {
																selectedObject
																		.setSVGTextValueX(parseInt(widthValue / 2));
																selectedObject
																		.setTextAnchor('middle');
																for ( var i = 1; i < childLength; i++) {
																	document
																			.getElementById("divText-"
																					+ textDivId).childNodes[i]
																			.setAttributeNS(
																					null,
																					'x',
																					parseInt(widthValue / 2));
																}
															}
															selectedObject
																	.setHorizontalAlign('center');
															break;

														case 'rightAlign':
															if (isIE) {
																selectedObject
																		.setSVGTextValueX(parseInt(widthValue - 5));
																selectedObject
																		.setTextAnchor('end');
																for ( var i = 1; i < childLength; i++) {
																	document
																			.getElementById("divText-"
																					+ textDivId).childNodes[i]
																			.setAttributeNS(
																					null,
																					'x',
																					parseInt(widthValue - 5));
																}
															}
															selectedObject
																	.setHorizontalAlign('right');
															break;
														}

													}
													// else{
													// for newly drawn text
													localAnnotationToolBox[currentSelectedAnnotation].horizontalAlign = selectedValue;
													// }

												}
											});
						});

		// Vertical Alignment
		$('.verticalAlignContainer')
				.children('img')
				.each(
						function() {
							$(this)
									.on(
											{
												'click' : function() {
													$(this).siblings().removeClass(
															'selected').end()
															.addClass('selected');

													var selectedValue = $(this).context.id;
													var index = selectedValue
															.indexOf('Align');
													selectedValue = selectedValue
															.substring(0, index);

													if (getSelectedObjectGroup() != null) {
														var textDivId = parseInt(selectedObjectCollection[0].markupId);
														var udvPage = pageCollection[parseInt(selectedObjectCollection[0].pageId)];
														var pageRotation = udvPage.attributes.rotateDegrees;
														var heightValue = getSelectedObjectGroup().firstChild
																.getAttribute('height');
														if (pageRotation === 90
																|| pageRotation === 270) {
															heightValue = getSelectedObjectGroup().firstChild
																	.getAttribute('width');
														}
														var fontSize = document
																.getElementById("divText-"
																		+ textDivId).style['fontSize']
																.replace("px", "");
														var childLength = document
																.getElementById("divText-"
																		+ textDivId).childNodes.length;
														var numChild = parseInt(fontSize)
																* parseInt(childLength - 1);
														var valueY = parseInt(heightValue)
																+ (parseInt(fontSize) / 2);
														var selectedObject = getSingleSelectedMarkupObject(0);
														switch ($(this).context.id) {

														case 'topAlign':
															if (isIE) {
																selectedObject
																		.setSVGTextValueY(parseInt(fontSize));
															}
															selectedObject
																	.setVerticalAlign('top');
															break;

														case 'middleAlign':
															if (isIE) {
																selectedObject
																		.setSVGTextValueY(parseInt(valueY / 2)
																				- parseInt(numChild / 2));
															}
															selectedObject
																	.setVerticalAlign('middle');
															break;

														case 'bottomAlign':
															if (isIE) {
																selectedObject
																		.setSVGTextValueY(parseInt(heightValue - 10)
																				- numChild);
															}
															selectedObject
																	.setVerticalAlign('bottom');
															break;
														}
													}
													// else{
													// for newly drawn text
													localAnnotationToolBox[currentSelectedAnnotation].verticalAlign = selectedValue;
													// }
												}
											});
						});

		// Annotate Layers
		layerContainer.children('img').each( function() {
			$(this).on(
					{
						'click' : function() {
							// if($(this).hasClass('selected')){
							// $(this).removeClass('selected');
							// return false;
							// }else{
							$(this).siblings().removeClass('selected')
									.end().addClass('selected');
		
							switch (this.id) {
							case 'annotationBringFront':
								layerMarkupObject(layerOptions.Top);
								break;
							case 'annotationMoveFront':
								layerMarkupObject(layerOptions.Forward);
								break;
							case 'annotationMoveBack':
								layerMarkupObject(layerOptions.Backward);
								break;
							case 'annotationBringBack':
								layerMarkupObject(layerOptions.Bottom);
								break;
						}
					}
			});
		});

		// Cancel Generating Pages for Printing
		$(getElement('cancelPrinting')).on('click', function() {
			isPrintingCancelled = true;
			clearTimeoutCollection();
			preloaderModal.css('display', 'none');
			blockerContainer.css('display', 'none');
		});

		// Modals functions
		$(getElement('cancelPrintDoc')).on('click', function() {
			hidePrintModal();
		});

		$('.saveDocSettings').click(function() {
			disableMagnifyingGlass();
			$(getElement('magnifyingGlass')).removeClass('active-state');
			textSelection.removeClass('active-state');
			pageContents.removeClass('text-cursor');
			// resetts states of the icons from on/off to mute and
			// close the property panel
			$('#addLine, #addArrow, #addSquare, #addCircle, #addText, #highLightBtn, #highLightRedactBtn, #addRedact').removeClass('on off').addClass('mute');
			closeRedact.click();
			closeAnnotateBox.click();
			if($(document.body).width() <= 800) {
				$('.rs-btn').hide('fast');
				//console.log('1');
			}
			// --END of resetts states of the icons from on/off to
			// mute and close the property panel
		});

		$('.visibility-holder-redaction, .visibility-holder-annotation').click( function() {
			disableMagnifyingGlass();
			$(getElement('magnifyingGlass')).removeClass('active-state');
			textSelection.removeClass('active-state');
			pageContents.removeClass('text-cursor');
		});

		$('#showRedactModal, #prevHit, #nextHit, #clearSearchBox, #searchBtn, #searchOptionId, #showDownloadModal, #redactPatternBtn').click(function() {
			disableMagnifyingGlass();
			$(getElement('magnifyingGlass')).removeClass('active-state');
			textSelection.removeClass('active-state');
			pageContents.removeClass('text-cursor');
			// resetts states of the icons from on/off to mute and
			// close the property panel
			$('#addLine, #addArrow, #addSquare, #addCircle, #addText, #highLightBtn, #highLightRedactBtn, #addRedact').removeClass('on off').addClass('mute');
			closeRedact.click();
			closeAnnotateBox.click();
			if($(document.body).width() <= 800) {
				$('.rs-btn').hide('fast');
				//console.log('1');
			}
			// --END of resetts states of the icons from on/off to
			// mute and close the property panel
		});

		$('.printDocument').on('click',function() {
			clearGroupDrag();
			disableMagnifyingGlass();
			$(getElement('magnifyingGlass')).removeClass('active-state');
			textSelection.removeClass('active-state');
			pageContents.removeClass('text-cursor');
			transferTextAreaValuetoDiv(lastSelectedDivReason);
			if ($(this).hasClass('disable-tool'))
				return;

			// Reset Printing Options
			document.getElementById('printAll').checked = true;
			document.getElementById('printCurrent').checked = false;

			var hasObjects = hasObjectsOnDocument();

			document.getElementById('w_redaction').checked = hasObjects.hasRedactions;
			if (hasObjects.hasRedactions === false)
				document.getElementById('w_redaction').disabled = true;
			else
				document.getElementById('w_redaction').disabled = false;

			document.getElementById('w_annotation').checked = false;

			if (hasObjects.hasAnnotations === false)
				document.getElementById('w_annotation').disabled = true;
			else
				document.getElementById('w_annotation').disabled = false;
			DV_PrintModal.css('display', 'block');
			blockerContainer.css('display', 'block');

			// resetts states of the icons from on/off to mute and
			// close the property panel
			$('#addLine, #addArrow, #addSquare, #addCircle, #addText, #highLightBtn, #highLightRedactBtn, #addRedact').removeClass('on off').addClass('mute');
			closeRedact.click();
			closeAnnotateBox.click();
			if($(document.body).width() <= 800) {
				$('.rs-btn').hide('fast');
				//console.log('1');
			}
			// --END of resetts states of the icons from on/off to
			// mute and close the property panel
		});

		$(getElement('printDoc')).on('click', function() {
			DV_PrintModal.css('display', 'none');
			printDocument();
		});

		// Deleting,Resizing,Closing Annotation Toolbox
		deleteAnnotation.on('mouseup', function() {
			deleteSingleMarkup();
			removeSingleMarkupInArray();
			clearAllHandles();
			annotationBox.css('display', 'none');
			redactBox.css('display', 'none');
		});

		resizeAnnotateBox.on('click',
						function() {
							var $this = $(this), tabContent = $('.tabContent');

							if (annotationBox.is(':animated')) {
								return false;
							}

							annotateBoxTab.css('display', 'none');
							tabContent.css('display', 'none');
							deleteAnnotation.css('display', 'none');
							$('#annotationInfiniteBtn').css('display', 'none');

							if ($this.data('resize') == "minimize") {
								$this.attr(
												{
													'src' : 'images/under-redact/RedactBox/Maximize.png',
													'title' : 'Maximize'
												}).data('resize', 'maximize');
								annotationBox.animate({
									'width' : '35px'
								}, 500);

							} else if ($this.data('resize') == "maximize") {
								$this.attr(
												{
													'src' : 'images/under-redact/RedactBox/Minimize.png',
													'title' : 'Maximize'
												}).data('resize', 'minimize');
								annotationBox.animate({
									'width' : '284px'
								}, 500, function() {
									annotateBoxTab.css('display', 'inline-block');
									tabContent.css('display', 'block');
									deleteAnnotation.css('display', 'block');
									$('#annotationInfiniteBtn').css('display',
											'block');
								});
							}
						});

		closeAnnotateBox.on('click', function() {
			resetAllAnnotationButtonState();
			resetAllCollabBtns();
			$('.redact-container').children('img').each(function() {
				$(this).data('active', false).removeClass('selected-tool');
			});
			annotationBox.css('display', 'none');
			deactivateAnnotationDraw();
			setMouseStyle();
			return false;
		});
		closeRedact.on('click', function() {
			resetAllRedactionButtonState();
		});
		
		// TODO: implement close for collab tab props
		
		// Show SearchBoxMenu
		searchMenu.on({
			mousedown : function() {
				var $this = $(this);
				if ($this.data('active') == false) {
					searchContainer.css('display', "block");

					$this.data('active', true).addClass('selected-tool')
							.removeAttr('style');
					getSearchedWordRow(); // get the searched count*/
				} else if ($this.data('active') == true) {
					searchContainer.css('display', 'none');
					$this.data('active', false).removeClass('selected-tool');
				}
			},
			mouseenter : function() {
				var $this = $(this);
				if ($this.data("active") == false) {
					$this.css({
						'background-color' : '#767676'
					});
				}
			},
			mouseleave : function() {
				var $this = $(this);
				if ($this.data("active") == false) {
					$this.removeAttr('style');
				}
			}
		});
		// End

		viewerContainer.on("scroll", scrollFn);
		// End of Detect
		
		/*----- LEX ------*/
		//right-side buttons
		
		$('.right-side .btn.bars').click(function() {
			$(this).parent().find('.rs-btn').slideToggle('fast');
			pageZoomTool.toggleClass('move-right');
			resetAllDrawingButtonState();
			closeAllPropertyPanel();
			clearAllHandles();
			$('#minimize').click();
		});
		
		$('#viewer-document-wrapper').click(function() {
			if($(document.body).width() <= 800) { 
				$('.rs-btn').hide('fast');
				console.log('Hahaha ');
			}
		});
		
		/*----- COMMENT PROPERTY -----*/
//		$('#commentField').on('click', function(){$(this).focus();});
//		$(document).on('click', function(e){
//			$('#commentField').focusout();
//			console.log('Hahiiii');
//			if(!$(e.target).hasClass('comment-field')) {
//				console.log('Haha');
//				$(e.target).blur();
//			}
//		}); 
		$('#commentField').css('padding-right: 20px;');
		commentTxtArea.focusin(function() {
			if(commentTxtArea.val()!='')
			{
				$('.clear-comment-btn').show();
			}else
			{
				$('.clear-comment-btn').hide();
			}
		});
		commentTxtArea.focusout(function() {
			if(commentTxtArea.val()!='')
			{
				$('.clear-comment-btn').show();
			}else
			{
				$('.clear-comment-btn').hide();
			}
		});
		
		$('.clear-comment-btn').click(function(){  
			var selectedObject = getSingleSelectedMarkupObject(0);
			commentTxtArea.text(''); 
			commentTxtArea.val(''); 
			$(this).css({ 'right':'0' }); 
			if(selectedObject){
				selectedObject.attributes.comment = commentToArray(commentTxtArea.val());
			}
			$('.clear-comment-btn').hide();
				commentTxtArea.focus();
		});
		
		//has_scrollbar('commentField'); //upon load
		commentTxtArea.keypress(function(e) { //on typing
			has_scrollbar('commentField');
		});
		
		commentTxtArea.keyup(function(e) {
			var selectedObject = getSingleSelectedMarkupObject(0);
			if(selectedObject)
			{
				selectedObject.attributes.comment = commentToArray(commentTxtArea.val());
			}
			if(commentTxtArea.val()!='')
			{
				$('.clear-comment-btn').show();
			}else
			{
				$('.clear-comment-btn').hide();
			}
			
			if(e.keyCode == 8){
				has_scrollbar('commentField');
			}
		});
		
		addComment.click(function() {
			$(this).siblings().removeClass("selected").end().addClass('selected');
				$('.commentContainer').css('display','block');			
				$('.colorPickerBox.cursorHand.standBy' ).removeClass( "standBy" );
				$('.widthPickerBox.cursorHand.standBy' ).removeClass( "standBy" );
				$('.opacityPickerBox.cursorHand' ).removeClass( "standBy" );
				addComment.addClass('selected');
				displayComment();
		});
		
	
		/*--------- Omit option to remove color of Collaborate highlight --------*/
//		$('#collabHighlightBtn, #highLightBtn').on('click',function() {
//			$('#nofillColor').hide();
//		});
		/*--------- Omit option to remove color of Collaborate highlight --------*/ 
		
		$('.zoomControls i').click(function() {
			if($(document.body).width() <= 800) {
				$('.rs-btn').hide('fast');
				//console.log('1');
			}
		});
		
		$('#firstPage, #firstBtn, #prevPage, #prevBtn, #nextPage, #nextBtn, #lastPage, #lastBtn, .current-page, .pageContent.currentView > svg').click(function() {
			if($(document.body).width() <= 800) {
				$('.rs-btn').hide('fast'); 
			}
		}); 
		
		pageNavContainer.on('click', 'ul > li', function() {

			transferTextAreaValuetoDiv(lastSelectedDivReason);
			var $this = $(this);
			var e = $.Event('keypress');
			e.which = 13;

			if ($this.data("enable") == true) {
				switch ($this.attr('id')) {

				case "firstPage":
					jumpPage(1);
					$(getElement('firstBtn')).css({
						'cursor' : 'not-allowed',
						'opacity' : '0.5'
					});
					$(getElement('prevBtn')).css({
						'cursor' : 'not-allowed',
						'opacity' : '0.5'
					});
					$(getElement('lastBtn')).css({
						'cursor' : 'pointer',
						'opacity' : '1'
					});
					$(getElement('nextBtn')).css({
						'cursor' : 'pointer',
						'opacity' : '1'
					});
					break;
				case "prevPage":
					if (currentCount.val() == "") {
						jumpPage(1);
					} else {
						jumpPage(parseInt(currentCount.val()) - 1);
						if (currentCount.val() == parseInt('1')) {
							$(getElement('firstBtn')).css({
								'cursor' : 'not-allowed',
								'opacity' : '0.5'
							});
							$(getElement('prevBtn')).css({
								'cursor' : 'not-allowed',
								'opacity' : '0.5'
							});
							$(getElement('lastBtn')).css({
								'cursor' : 'pointer',
								'opacity' : '1'
							});
							$(getElement('nextBtn')).css({
								'cursor' : 'pointer',
								'opacity' : '1'
							});
						} else {
							$(getElement('firstBtn')).css({
								'cursor' : 'pointer',
								'opacity' : '1'
							});
							$(getElement('prevBtn')).css({
								'cursor' : 'pointer',
								'opacity' : '1'
							});
							$(getElement('lastBtn')).css({
								'cursor' : 'pointer',
								'opacity' : '1'
							});
							$(getElement('nextBtn')).css({
								'cursor' : 'pointer',
								'opacity' : '1'
							});
						}
					}
					break;

				case "nextPage":
					if (currentCount.val() == "") {
						jumpPage(1);
					} else {
						jumpPage(parseInt(currentCount.val()) + 1);
						if (currentCount.val() == parseInt(pageCountLabel.text())) {
							$(getElement('firstBtn')).css({
								'cursor' : 'pointer',
								'opacity' : '1'
							});
							$(getElement('prevBtn')).css({
								'cursor' : 'pointer',
								'opacity' : '1'
							});
							$(getElement('lastBtn')).css({
								'cursor' : 'not-allowed',
								'opacity' : '0.5'
							});
							$(getElement('nextBtn')).css({
								'cursor' : 'not-allowed',
								'opacity' : '0.5'
							});
						} else {
							$(getElement('firstBtn')).css({
								'cursor' : 'pointer',
								'opacity' : '1'
							});
							$(getElement('prevBtn')).css({
								'cursor' : 'pointer',
								'opacity' : '1'
							});
							$(getElement('lastBtn')).css({
								'cursor' : 'pointer',
								'opacity' : '1'
							});
							$(getElement('nextBtn')).css({
								'cursor' : 'pointer',
								'opacity' : '1'
							});
						}
					}
					break;

				case "lastPage":
					jumpPage(parseInt(pageCountLabel.text()));
					$(getElement('lastBtn')).css({
						'cursor' : 'not-allowed',
						'opacity' : '0.5'
					});
					$(getElement('nextBtn')).css({
						'cursor' : 'not-allowed',
						'opacity' : '0.5'
					});
					$(getElement('firstBtn')).css({
						'cursor' : 'pointer',
						'opacity' : '1'
					});
					$(getElement('prevBtn')).css({
						'cursor' : 'pointer',
						'opacity' : '1'
					});
					break;

				}
			} else if ($this.data("enable") == false) {
				return;
			}

		});
		// End of Page Navigation

		// Jump Page Navigation
		currentCount.keypress(function(e) {
			if (e.which == 13) {
				jumpPage(e.target.value);
				if (currentCount.val() == parseInt(pageCountLabel.text())) {
					$(getElement('firstBtn')).css({
						'cursor' : 'pointer',
						'opacity' : '1'
					});
					$(getElement('prevBtn')).css({
						'cursor' : 'pointer',
						'opacity' : '1'
					});
					$(getElement('lastBtn')).css({
						'cursor' : 'not-allowed',
						'opacity' : '0.5'
					});
					$(getElement('nextBtn')).css({
						'cursor' : 'not-allowed',
						'opacity' : '0.5'
					});
				} else if (currentCount.val() == parseInt('1')) {
					$(getElement('firstBtn')).css({
						'cursor' : 'not-allowed',
						'opacity' : '0.5'
					});
					$(getElement('prevBtn')).css({
						'cursor' : 'not-allowed',
						'opacity' : '0.5'
					});
					$(getElement('lastBtn')).css({
						'cursor' : 'pointer',
						'opacity' : '1'
					});
					$(getElement('nextBtn')).css({
						'cursor' : 'pointer',
						'opacity' : '1'
					});
				} else if (currentCount.val() != parseInt(pageCountLabel.text())
						|| currentCount.val() != parseInt('1')) {
					$(getElement('firstBtn')).css({
						'cursor' : 'pointer',
						'opacity' : '1'
					});
					$(getElement('prevBtn')).css({
						'cursor' : 'pointer',
						'opacity' : '1'
					});
					$(getElement('lastBtn')).css({
						'cursor' : 'pointer',
						'opacity' : '1'
					});
					$(getElement('nextBtn')).css({
						'cursor' : 'pointer',
						'opacity' : '1'
					});
				}
			}
			if (e.which == 8) {
				return true;
			}
			if ((e.which < 48 || e.which > 57)) {// Disabled all characters
													// except numbers
				return false;
			}
		});
		// End of Jump
		
		getElement('nextHit').addEventListener('mouseup', nextHitTerm,
				true);
		getElement('prevHit').addEventListener('mouseup',
				previousHitTerm, true);
		window.onresize = function(event) {
			transferTextAreaValuetoDiv(lastSelectedDivReason);
		};

		/*
		 * window.onscroll = function(event) { transferTextAreaValuetoDiv(); };
		 */

		window.addEventListener("onscroll", transferTextAreaValuetoDiv, false);
		
		addNote.on('click', function(){
			applyStickyNote();
			
		});
		
		applyImage.on('click', function(){
			applyImageData();
			
		});
		
	}
	
	attachListeners();
	
};

UDViewer.prototype = {
	getRectangleToolbox : function() {
		return this.rectangleToolBox;
	}
};

// Deprecated as of 07/23/2015 jcyau Need to explore an alternative once there's a
// better security policy implemented for iframe and cross domain requests
// Possible to implement with sub domain implementation for web application
function UDVApi(request) {
	var args = request.arguments;
	switch (request.functionName) {
	case "loadDocument":
		loadDocument(args.document, args.markup);
		break;
	case "loadAnnotations":
		getXMLFromServer(true, true, args.markup);
		break;
	case "displayReviewTools":
		displayReviewTools(args.isDisplay);
		break;
	}
}

function clearTextStyleTab() {
	$(getElement('boldText')).removeClass("selected");
	$(getElement('italicText')).removeClass("selected");
	$(getElement('strikeoutText')).removeClass("selected");
	$(getElement('underlineText')).removeClass("selected");
};

function clearHorizontalAlignTab() {
	$(getElement('leftAlign')).removeClass("selected");
	$(getElement('centerAlign')).removeClass("selected");
	$(getElement('rightAlign')).removeClass("selected");
};
function clearVerticalAlignTab() {
	$(getElement('topAlign')).removeClass("selected");
	$(getElement('middleAlign')).removeClass("selected");
	$(getElement('bottomAlign')).removeClass("selected");
};

function jumpPage(jumpTo) {
	var viewerContainer = $(getElement('viewerContainer')), pageCountLabel = $('.pages'), currentCount = $('.current-page');
	var pageCount = parseInt(pageCountLabel.text());

	// Check the Jump Page No.
	if (jumpTo <= 1) {
		jumpTo = 1;
		currentCount.val(jumpTo);
		viewerContainer.scrollTop(0);
		return false;
	} else if (jumpTo > pageCount) {
		jumpTo = pageCount;
		currentCount.val(jumpTo);
		viewerContainer.scrollTop(scrollDiff);
		return false;
	}

	viewerContainer.scrollTop(0);// Reset the scroll bar of the Viewer to 0
	/*
	 * var selectedZoom = $(".selected-zoom").children("span").text();
	 * if((selectedZoom =="50%") || (selectedZoom == "25%")){ var scrollPixel =
	 * (scrollHeightPercentage / 100) * scrollDiff; currentCount.val(jumpTo);
	 * viewerContainer.scrollTop(Number(currentCount.val()) *
	 * scrollPixel);//After resetting do the jumpPage return; }
	 */

	pageNavScroll = true;
	var gotoPage = viewerContainer.find(".pageContent").filter(
			":nth-child(" + jumpTo + ")");
	viewerContainer.scrollTop(gotoPage.position().top);
	currentCount.val(jumpTo);
}

function hideInfiniteBtn() {

	$('.redactionReason').on('click', function() {
		if ($(this).height() == 1056) {
			$('#redactionInfiniteBtn').hide();
		} else if ($(this).height() == 816) {
			$('#redactionInfiniteBtn').hide();
		} else {
			$('#redactionInfiniteBtn').show();
		}
	});

	if (isSafari) { // for Sarafi version below 8.0.0

		$('.annotationClass rect').on('click', function() {

			var $this = $(this).parent().find('.redactionReason');
			$.get('index.jsp', function() {
				console.log($this.height());
				if ($this.height() == 1056) {
					$('#redactionInfiniteBtn').hide();
				} else if ($this.height() == 816) {
					$('#redactionInfiniteBtn').hide();
				} else {
					$('#redactionInfiniteBtn').show();
				}
			});

		});

	}
}
function resetAllAnnotationButtonState() {
	// $('#addArrow, #addLine, #addSquare, #addCircle, #addText, #highLightBtn,
	// #addRedact, #highLightRedactBtn').removeClass('on off').addClass('mute');
	$('.annotationBtnWithProperties').removeClass('on off').addClass('mute');
	$(getElement('page-zoomtool')).removeClass('move-top');
}
function resetAllRedactionButtonState() {
	$('.redactionBtnWithProperties').removeClass('on off').addClass('mute');
	$(getElement('page-zoomtool')).removeClass('move-top');
}
function resetAllCollabBtns() {
	$('.collabBtnWithProperties').removeClass('on off').addClass('mute');
	$(getElement('page-zoomtool')).removeClass('move-top');
}
function resetAllDrawingButtonState() {
	resetAllAnnotationButtonState();
	resetAllRedactionButtonState();
	resetAllCollabBtns();

	$(getElement('textSelection')).removeClass('active-state');
	$('.pageContent').removeClass('text-cursor');
	$(getElement('page-zoomtool')).removeClass('move-top');
	$(getElement('magnifyingGlass')).removeClass('active-state');
}
function closeAllPropertyPanel() {
	$(getElement('closeRedact')).click();
	$(getElement('closeAnnotateBox')).click();
	$(getElement('page-zoomtool')).removeClass('move-top');
}

// NAVIGATION FOR ANNOTATION
$(document).ready(function() {
	$('#docViewerVersion').html(documentViewer.udvVersion);

	// $('.collab-container ul li button').on('click',function()
	// {
	// $(this).toggleClass('active');
	// });
	
	$( window ).resize(function() {
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast'); 
		}
	});

	$('.drawing-nav label, .drawing-nav div, .drawing-nav .stats, .drawing-nav .position, #switch').hide();
	$('.drawing-nav').css('padding', '7px 10px');

	$('#minimize').on('click',function() {
		$('.drawing-nav label, .drawing-nav div, .drawing-nav .stats, .drawing-nav .position, #switch').hide();
		$(this).hide('fast');
		$('#maximize').show('fast');
		$('.drawing-nav').css('padding','7px 10px');
	});

	$('#maximize').on('click',function() {
		$('.drawing-nav label, .drawing-nav div, .drawing-nav .stats, .drawing-nav .position, #switch').show();
		$(this).hide('fast');
		$('#minimize').show('fast');
		$('.drawing-nav').css('padding', '15px');
		$('#totalObjectAnnotation').css("display","inline-block");
		$('#totalObjectRedation').css("display","none");
	});

	$('#switch').click(function() {
		$("#currentPosition").text(0);
		var navLabel = $('#navLabel').text();
		if (navLabel == 'Navigate Annotation') {
			$('#navLabel').text('Navigate Redaction');
			$(this).attr('title', 'Switch to Annotation');
			$('#totalObjectAnnotation').css("display","none");
			$('#totalObjectRedation').css("display","inline-block");
		} else if (navLabel == 'Navigate Redaction') {
			$('#navLabel').text('Navigate Annotation');
			$(this).attr('title', 'Switch to Redaction');
			$('#totalObjectAnnotation').css("display","inline-block");
			$('#totalObjectRedation').css("display","none");
		}
	});
	
	$('#previousDraw').click(function(){
		prevDrawing($('#navLabel').text());
	});
	
	$('#nextDraw').click(function(){
		nextDrawing($('#navLabel').text());
	});

	$(getElement('redactPatternBtn')).click(function() {
		resetAllDrawingButtonState();
		closeAllPropertyPanel();
		resetAllCollabBtns();
	});

});
// NAVIGATION FOR ANNOTATION

function detectMobile() {
	if(navigator != undefined && navigator.userAgent != undefined) {
        user_agent = navigator.userAgent.toLowerCase();
        if(user_agent.indexOf('android') > -1) { // Is Android.
            $(document.body).addClass('android');

        } 
    }
	
	if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) { //Is Ios
		
        $(document.body).addClass('ios');
        
    }
}

function has_scrollbar(elem_id) { 
    elem = document.getElementById(elem_id); 
    if (elem.clientHeight < elem.scrollHeight) {
    	//console.log("The element #" + elem_id + " has a vertical scrollbar.");
    	$('.clear-comment-btn').css({ 
    		'right':'15px'
    	});
    } else {
    	//console.log("The element #" + elem_id + " doesn't have a vertical scrollbar.");
    	$('.clear-comment-btn').css({
    		'right':'0'
    	});
    }
}

function displayComment() {
	var selectedObject = getSingleSelectedMarkupObject(0);
	commentTxtArea.val('');
	if (selectedObject) {
		var comment = selectedObject.attributes.comment;
		if (comment) {
			comment = getCurrentComment(comment);
			commentTxtArea.val(comment);
		}
		has_scrollbar('commentField');
		//$('.clear-comment-btn').show();
	}
	if(commentTxtArea.val()!='')
	{
		$('.clear-comment-btn').show();
		commentTxtArea.blur();
	}else
	{
		$('.clear-comment-btn').hide();
		setTimeout(function() {
			commentTxtArea.focus();
		}, 50);	
	}
	
//	setTimeout(function() {
//		var html = commentTxtArea.val();
//		commentTxtArea.focus().val("").val(html);
//	}, 50);	
}

function getCurrentComment(currentComment) {
	var wholeText = "";
	var len = currentComment.length;
	if (len === undefined || len === null)
		len = Object.keys(currentComment).length;
	wholeText = currentComment[0];
	for ( var z = 1; z < len; z++) {
		wholeText += "\n" + currentComment[z];
	}
	return wholeText;
}

function commentToArray(comment) {
	var splitted = [];
	splitted = comment.split("\n");
	return splitted;
}

function jPLTDisable(){
	$('.redact-container').children().addClass("restrict");
	$('.fa.fa-floppy-o').addClass("restrict");
};

function setImagePreviewData(imagePath){
	var imagePreview = $('#imagePreview');
	var onSuccess = function(req){
		var uri = req.responseText;
		imagePreview.attr('src',uri);
		
	};
	var request = 
	{
		uriFilePath : imagePath,
		onSuccess : onSuccess
	};
	WSImageData(request);
}


// Hide All Tab Contents
function hideTabContent() {
	$('.tabContent').children('div').css('display', 'none')
			.removeClass('standBy');
	hideDropDown();// Hide DropDown(s) menu
}

// Hide DropDown
function hideDropDown() {
	$('.tabContent').children('div').children('div').each(function() {
		if ($(this).hasClass('active')) {
			$(this).removeClass('active');
		}
	});
}

