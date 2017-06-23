	var documentAbsPath = "";

	var currentView,
	selectedObject={pageIndex : -1,markupIndex : -1},
	selectedObjectCollection = [],
	currentSelectedMarkup,
	selectedPages = [],
	scaleFactor = 1, //Scale of how document is zoomed in or out. Used by zooming functionality to keep track of zoom percentage
	logFileStatus, //Stores status of document. Used to determine how viewer will behave throughout different statuses (ConvertingToPDF,ConvertingToSVG, etc..)
	printOptions,
	isPrintingCancelled = false,
	isSaved = false,
	isFitContent = false,
	highlightWalkerCollection = [],
	currentTermIndex = 0,
	originalScaleFactor = -1,
	isResizing = false, //Used to determine if window is being resized. This is being used by fit to width to re-apply calculations based on overall window dimension
	collabTools = false,
	lastQuery;  
	modifiedQuery = "";
	
	PrintingOptions = function() {
		this.withRedaction = document.getElementById('w_redaction').checked ? true : false;
		this.withAnnotation = document.getElementById('w_annotation').checked ? true : false;
		this.autoOrientation = document.getElementById('orient_auto').checked ? true : false;
		this.portrait = document.getElementById('orient_port').checked ? true : false;
		this.landscape = document.getElementById('orient_land').checked ? true : false;
		this.currentPage = document.getElementById('printCurrent').checked ? true : false;
		this.allPages = document.getElementById('printAll').checked ? true : false;
		return this;
	};

	AnnotationObject = function(pageId,markupId){
		this.pageId = pageId;
		this.markupId = markupId;
		return this;
	};
	
	Redaction = function(id,rectangleSVG,redactionReasonDiv,textReason,foreignGroup) {
	this.id = id;
	this.rectangleSVG = rectangleSVG;
	this.redactionReasonDiv = redactionReasonDiv;
	this.foreignGroup = foreignGroup;
	this.textReason = textReason;
	return this;
	};
	
	function RectangleToolBox()
	{
		
	}
	
	function CircleToolBox()
	{
		
	}
	
	function LineToolBox()
	{
		
	}
	
	function StrikeThrough()
	{
		
	}
	
	function ArrowToolBox()
	{
		
	}
	
	function SearchToolBox()
	{
		
	}
	
	function TextAnnotationToolBox()
	{
		this.fontColor = defaultFontColor;
		this.fontSize = '12';
		this.fontFamily = 'Comic Sans MS';
		this.boldStyle=false;
		this.italicStyle=false;
		this.underlineStyle=false;
		this.strikeStyle=false;
		this.horizontalAlign = 'center';
		this.verticalAlign = 'middle';
		this.fillColor = defaultFillColorText;
	}
	
	function StickyNoteAnnotationToolBox()
	{
		this.fontColor = defaultFontColor;
		this.fontSize = '12';
		this.fontFamily = 'Comic Sans MS'; //'Comic Sans MS, cursive, sans-serif';
		this.boldStyle=false;
		this.italicStyle=false;
		this.underlineStyle=false;
		this.strikeStyle=false;
		this.horizontalAlign = 'left';
		this.fillColor = 'rgb(255, 255, 0)';
		this.opacityLevel = defaultOpacity;
		this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
	}
	
	function StampAnnotationToolBox()
	{
		this.fontColor = defaultFontColor;
		this.fontSize = '20';
		this.fontFamily = 'Comic Sans MS'; //'Comic Sans MS, cursive, sans-serif';
		this.boldStyle=true;
		this.italicStyle=false;
		this.opacityLevel = defaultOpacity;
		this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
	}
	
	function ImageAnnotationToolBox()
	{
		
	}
	
	
	function RectangleRedction()
	{
		this.redactionReason;
	}
	
	function RedactionRectangleToolBox()
	{
		this.reason = 'Redaction';
	}
	
	function CollabHighlightToolBox()
	{
		this.fillColor = defaultCollabHighlightColor;
		this.opacityLevel = defaultHighlightOpacity;
		this.continuous = false;
	}
	
	function TextHighlightToolBox()
	{
		this.fillColor = defaultHighlightTextColor;
		this.opacityLevel = defaultHighlightOpacity;
		this.continuous = false;
	}
	
	function defaultShapeSettings() {
		this.fillColor = defaultFillColorShapes;
		this.borderColor = defaultFillColorBorder;
		this.borderWeight = defaultFillWidthShapes;
		this.opacityLevel = defaultOpacity;
		this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		
		this.setOpacityLevel = function (opacityLevel)
		{
			this.opacityLevel = opacityLevel;
			this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		};
	}
	
	function defaultImageSettings() {
		this.opacityLevel = defaultOpacity;
		this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		
		this.setOpacityLevel = function (opacityLevel)
		{
			this.opacityLevel = opacityLevel;
			this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		};
	}
	
	function defaultHighlightShapeSettings() {
		this.fillColor = defaultHighlightTextColor;
		this.opacityLevel = defaultHighlightOpacity;
		this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		
		this.setOpacityLevel = function (opacityLevel)
		{
			this.opacityLevel = opacityLevel;
			this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		};
		this.continuous = false;
	}
	
	function defaulCollabHighlightShapeSettings() {
		this.fillColor = defaultCollabHighlightColor;
		this.opacityLevel = defaultHighlightOpacity;
		this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		
		this.setOpacityLevel = function (opacityLevel)
		{
			this.opacityLevel = opacityLevel;
			this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		};
		this.continuous = false;
	}
	
	RectangleToolBox.prototype = new defaultShapeSettings();
	CircleToolBox.prototype = new defaultShapeSettings();
	LineToolBox.prototype = new defaultLineSettings();
	StrikeThrough.prototype = new defaultStrikeThroughSettings();
	ArrowToolBox.prototype = new defaultArrowSettings();
	TextAnnotationToolBox.prototype = new defaultShapeSettings();
	StickyNoteAnnotationToolBox.prototype = new defaultShapeSettings();
	StampAnnotationToolBox.prototype = new defaultShapeSettings();
	ImageAnnotationToolBox.prototype = new defaultImageSettings();
	TextHighlightToolBox.prototype = new defaultHighlightShapeSettings();
	CollabHighlightToolBox.prototype = new defaulCollabHighlightShapeSettings();
	
	function defaultStrikeThroughSettings() {
		this.fillColor = defaultLineColor;
		this.borderWeight = defaultFillWidthLine;
		this.opacityLevel = defaultOpacity;
		this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		this.setOpacityLevel = function (opacityLevel)
		{
			this.opacityLevel = opacityLevel;
			this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		};
	}
	
	function defaultLineSettings() {
		this.fillColor = defaultFillColorShapes;
		this.borderWeight = defaultFillWidthLine;
		this.opacityLevel = defaultOpacity;
		this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		this.setOpacityLevel = function (opacityLevel)
		{
			this.opacityLevel = opacityLevel;
			this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		};
	}
	
	function defaultArrowSettings() {
		this.fillColor = defaultLineColor;
		this.borderWeight = defaultFillWidthLine;
		this.opacityLevel = defaultOpacity;
		this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		this.setOpacityLevel = function (opacityLevel)
		{
			this.opacityLevel = opacityLevel;
			this.opacityLevelDecimal = this.opacityLevel.replace('%','')/100;
		};
	}
	
	function setDefaultLineProperties(object)
	{
		object.borderWeight = defaultFillWidthLine;
		object.opacityLevel = defaultOpacity;
		object.opacityLevelDecimal = object.opacityLevel.replace('%','')/100;
		object.setOpacityLevel = function (opacityLevel)
		{
			object.opacityLevel = opacityLevel;
			object.opacityLevelDecimal = object.opacityLevel.replace('%','')/100;
		};
	}

	RedactionMarkup = function(x,y,height,width,text) {
		this.x = x;
		this.y = y;
		this.height = height;
		this.width = width;
		this.text = text;
		return this;
	};
	
	HandleGroup = function(parentHandle,handleCollection)
	{
		this.parentHandle = parentHandle;
		this.handleCollection = handleCollection;
	};
	
	MarkObject = function(pageIndex,markupId) {
		this.pageIndex = pageIndex;
		this.markupId = markupId;
		return this;
	};
	
	UDVPage = function(id, pageIndex, pageHeight,pageWidth,svgMarkupGroup,svgHighlightGroup, groupDragGroup)
	{
		function createParentDivHandles()
		{
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.width = '10px';
			div.style.height = '10px';
			div.style.left = '0px';
			div.style.top = '0px';
			div.style.overflow = 'visible';
			div.id='handlegroup-'+id;
			return div;
		}
		
		this.attributes = {
				id : pagePrefixId + id,
				pageHeight : pageHeight,
				pageWidth : pageWidth,
				rotateDegrees : 0,
				rotateX : parseFloat(pageHeight) / 2,
				rotateY : parseFloat(pageHeight) / 2,
				pageIndex : pageIndex,
				isFitted : false,
		};
		
		this.svgMarkupGroup = svgMarkupGroup; //Contains <g> group with ALL annotations of the document
		this.svgHighlightGroup = svgHighlightGroup; //Contains <g> group with ALL search highlight of the document
		this.groupDragGroup = groupDragGroup; 
		this.tempHighlights = []; //Temporary collection containing search highlights to be loaded once user navigates
		this.textElements;
		this.textCharacters;
		this.svgPage; //SVG to be loaded onto DocumentViewer
		this.markups = [];
		this.highlightCollection = []; //Collection of all search highlights on this page
		this.divHandles = createParentDivHandles();
		this.handleCollections = []; //Contains all resize handles per each markup object selected
		this.selectedMarkupIds = [];
		this.isPageRequested = false;
		this.isErroredPage = false;
		this.textMarkups = [];
		this.lastHighlightIndex;
		
		this.retrieveMarkObjectInPage = function(checkId)
		{
			var arrLength = this.markups.length;
			for(var i=0; i<arrLength;i++)
			{
				if(this.markups[i].attributes.id == checkId)
				{
					return this.markups[i];
				}
			}
			return null;
		};
		
		this.retrieveLayeredMarkObjectInPage = function(layerOrder)
		{
			var arrLength = this.markups.length;
			for(var i=0; i<arrLength;i++)
			{
				if(this.markups[i].attributes.layerIndex == layerOrder)
				{
					return this.markups[i];
				}
			}
			return null;
		};
		
		/**
		 * Applies rotation to all markups with text. This is used so text
		 * Will always be right-side even if page is rotated other than 0 or 360
		 */
		this.rotateTextMarkups = function(rotateDegrees)
		{
			for(var i=0; i<this.textMarkups.length;i++)
			{
				if (this.textMarkups[i].markupType == markupTypes.TextRedactHighlight){
					var textRedactCollection = this.textMarkups[i].drawnObjectCollection;
					var collectionLen = textRedactCollection.length;
					for (var j=0; j<collectionLen; j++){
						textRedactCollection[j].rotateTextObject(rotateDegrees);
					}
				} else {
					this.textMarkups[i].rotateTextObject(rotateDegrees);	
				}
			}
		};
		
		/**
		 * Retrieves rotated dimensions of the page. When page is rotated height and width is interchanged.
		 */
		this.rotatedDimensions = function()
		{
			var rotation = this.attributes.rotateDegrees;
			var obj = 
				{
					height : 0,
					width : 0
				};
			
			if(rotation === 0 || rotation === 180 || rotation === 360)
			{
				obj.height = this.attributes.pageHeight;
				obj.width = this.attributes.pageWidth;
				return obj;
			}
			else
			{
				obj.height = this.attributes.pageWidth;
				obj.width = this.attributes.pageHeight;
				return obj;
			}
		};
		
		this.isMarkupSelected = function(markUpId)
		{
			if(this.selectedMarkupIds.indexOf(markUpId)>=0)
				return true;
			return false;
		};
		
		this.setLastHighlightIndex = function(index)
		{
			this.lastHighlightIndex = index;
		}
		
		this.getLastHighlightIndex = function()
		{
			return this.lastHighlightIndex;
		};
		
		this.selectMarkup = function(markupId,handleGroup)
		{
			this.selectedMarkupIds.push(markupId);
			selectedObjectCollection.push(new AnnotationObject(this.attributes.pageIndex,markupId));
			this.handleCollections.push(handleGroup);
			if(selectedPages.indexOf(this.attributes.pageIndex)<0)
			{
				selectedPages.push(this.attributes.pageIndex);
			}
		};
		
		this.updateHandles = function(handleGroupIndex,handleGroup)
		{
			this.handleCollections[handleGroupIndex] = handleGroup;
		};
		
		this.deSelectMarkup = function(markupId)
		{
			var markupIndex = this.selectedMarkupIds.indexOf(markupId),
				indexToRemove = checkCollection(selectedObjectCollection,markupId);
			
			this.selectedMarkupIds.splice(markupIndex,1);
			selectedObjectCollection.splice(indexToRemove,1);
			clearMarkupHandle(this.handleCollections[markupIndex]);
			this.handleCollections.splice(markupIndex,1);
			
			if(this.selectedMarkupIds.length==0)
			{
				selectedPages.splice(selectedPages.indexOf(this.attributes.pageIndex),1);
			}
		};
		
		this.clearAllSelectedMarkups = function(pageNumber)
		{
			this.selectedMarkupIds = [];
			this.handleCollections = [];
			if(selectedObjectCollection.length > 1) {
				for(var i=selectedObjectCollection.length-1; i>=0; i--) {
					if(selectedObjectCollection[i].pageId == pageNumber) {
						selectedObjectCollection.splice(i, 1);
					}
				}
			} else {
				selectedObjectCollection = [];
			}
			clearChildren(this.divHandles);
			var index = selectedPages.indexOf(this.attributes.pageIndex);
			if(index>-1)
				selectedPages.splice(index,1);
		};
		
		this.retrieveMarkHandles = function(markupId)
		{
			var arrLength = this.markups.length;
			for(var i=0; i<arrLength;i++)
			{
				if(this.handleCollections[i].id == checkId)
				{
					return this.handleCollections[i];
				}
			}
			return null;
		};
		
		this.getPageCoordinates = function(x,y)
		{
			return convertToSVGCoordinateSpace(this.svgPage,x,y);
		};
		
		this.addMarkupObject = function(drawnObject)
		{
			this.markups.push(drawnObject);
			if(drawnObject.markupType === markupTypes.RectangleRedaction 
					|| drawnObject.markupType === markupTypes.Text
					|| drawnObject.markupType === markupTypes.TextRedactHighlight)
			{
				this.textMarkups.push(drawnObject);
			}
		};
		
		this.removeAllAnnotations = function()
		{
			this.clearAllSelectedMarkups();
			clearChildren(this.svgMarkupGroup);
			this.markups = [];
		};
		this.hasDrawnObject = function()
		{
			if(this.markups.length>0)
				return true;
			return false;
		};
		
		this.hasRedactions = function()
		{
			var len = this.markups.length;
			for(var z=0;z<len;z++)
			{
				if(this.markups[z].markupType === markupTypes.RectangleRedaction || this.markups[z].markupType === markupTypes.TextRedactHighlight)
					return true;
			}
			return false;
		};
		
		this.hasAnnotations = function()
		{
			var len = this.markups.length;
			if(len===0)
				return false;
			for(var z=0;z<len;z++)
			{
				if(this.markups[z].markupType != markupTypes.RectangleRedaction && this.markups[z].markupType !== markupTypes.TextRedactHighlight 
						&& this.markups[z].markupType !== markupTypes.StrikeThrough && this.markups[z].markupType !== markupTypes.CollabHighlight)
				{
					return true;					
				}

			}

			return false;
		};
		
		this.isRotationAdjusted = function()
		{
			if(this.attributes.rotateDegrees>0)
				return true;
			return false;
		};
		
		this.addHighlight = function(rectangle)
		{
			var tempAnnotation=null;
			if(rectangle != undefined)
			{
				if(!this.svgHighlightGroup)
				{
					this.svgHighlightGroup = createSVGElement("g");
					this.svgHighlightGroup.setAttribute("data-isi", "highlights-"+pageIndex);
				}
				
				//edited by arvin : Pantry864
				if(this.svgHighlightGroup.parentNode)
				{
					tempAnnotation = createHighlightAnnotations(this.svgHighlightGroup,rectangle);
					this.highlightCollection.push(tempAnnotation);
					return tempAnnotation;
				}else if(this.svgHighlightGroup){
					tempAnnotation = createHighlightAnnotations(this.svgHighlightGroup,rectangle);
					this.highlightCollection.push(tempAnnotation);
					return tempAnnotation;
				}
			}
		};
		
		this.addTextRedaction = function(rectangle,reason)
		{
			var tempAnnotation=null;
			if(rectangle != undefined)
			{
				tempAnnotation = createTextRedaction(this.svgMarkupGroup,rectangle,reason,this);
				tempAnnotation.drawnObjectCollection[0].rotateTextObject(this.attributes.rotateDegrees);
				this.setLastHighlightIndex($(tempAnnotation.shapes.group).index()); //populate latest index to prevent layering of highlight
				this.addMarkupObject(tempAnnotation);
				return tempAnnotation;
			}
		};
		
		this.clearHighlights = function()
		{
			clearChildren(this.svgHighlightGroup);
			this.highlightCollection = [];
			this.tempHighlights = [];
		};
		
		this.initializeHighlights = function()
		{
			var cachedHighlights = this.tempHighlights.length;
			if(cachedHighlights>0)
			{
				if(this.svgHighlightGroup.parentNode)
				{
					if(this.tempHighlights.length>0)
					{
						var highlightWalkerObject;
						// find walkerObject for page
						for(var n=0;n<highlightWalkerCollection.length;n++)
						{
							if(highlightWalkerCollection[n].pageId === this.attributes.pageIndex)
							{
								highlightWalkerObject = highlightWalkerCollection[n];
								break;
							}
						}
						
						for(var x=0;x<this.tempHighlights.length;x++)
						{
							var words = this.tempHighlights[x];
							var rectAnnotations = [];
							for(var y=0;y<words.length;y++)
							{
								var highlightAnnotation = createHighlightAnnotations(this.svgHighlightGroup,words[y]);
								this.highlightCollection.push(highlightAnnotation);
								rectAnnotations.push(highlightAnnotation);
							}
							highlightWalkerObject.rectangles = rectAnnotations;
						}
						this.tempHighlights=[];

					}					
				}
			}
		};
		
		this.addHitTerm = function(words)
		{
			var highlightWalkerObject,
			length = words.length,
			annotations =[],
			tempAnnotation,
			rectangle,
			rectangleAnnots = [];
			highlightWalkerObject = {
					pageId:this.attributes.pageIndex,
					highlightPosition:parseFloat(words[0][1]),
					rectangles:[]
			};
			for(var i=0;i<length;i++)
			{
				rectangle = words[i];

				tempAnnotation = this.addHighlight(rectangle);
				
				if(tempAnnotation != null && tempAnnotation != undefined)
				{
					highlightWalkerObject.rectangles.push(tempAnnotation);
				}
				//annotations.push(tempAnnotation);
			}
			highlightWalkerCollection.push(highlightWalkerObject);	
			
			if(highlightWalkerObject.rectangles.length === 0)
			{
				this.tempHighlights.push(words);
			}
		};
		
		this.addPatternRedaction = function(words,reason)
		{
			var highlightWalkerObject,
			length = words.length,
			annotations =[],
			tempAnnotation,
			rectangle;
			var combinedCoordinates =
				{
					0:parseFloat(words[0][0]),
					1:parseFloat(words[0][1]),
					2:0,
					3:parseFloat(words[0][3])
				};
			
			var lastChar = words[length-1];
			var totalWidth = parseFloat(lastChar[0])+parseFloat(lastChar[2]);
			totalWidth = totalWidth - parseFloat(words[0][0]);
			combinedCoordinates[2] = parseFloat(totalWidth);
			tempAnnotation = this.addTextRedaction(combinedCoordinates,reason);
			
		};

		return this;
	};
	
	DrawnRectangle = function(x,y,width,height)
	{
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		return this;
	};
	
	DrawnRectangle.prototype.toString = function()
	{
	    return 'x: '+this.x+','+'y: '+this.y+'width: '+this.width+'height: '+this.height;
	}
