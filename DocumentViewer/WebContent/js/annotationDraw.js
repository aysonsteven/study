
var annotationObject;
var markupId = 0;
var tempId = 0;
var readyToDraw = false;
var lastSelectedDivReason = null;
var lastDrawnDivReason = null;
var firstHighlightedIndex = null;
var highlightIdxHit = [];
var highlightObjStack = [];

function addAnnotationDraw()
{
	readyToDraw = true;
	transferTextAreaValuetoDiv(lastSelectedDivReason);
	document.addEventListener("mousedown", initStartPosition, false);
	lastSelectedDivReason = null;
	lastDrawnDivReason = null;
	markupId++;
}

function deactivateAnnotationDraw()
{
	if(readyToDraw)
	{
		markupId--;
		readyToDraw = false;
		//transferTextAreaValuetoDiv(lastSelectedDivReason);
		document.removeEventListener("mousedown", initStartPosition, false);
		lastSelectedDivReason = null;
		lastDrawnDivReason = null;
	}
	//markupId++;
}

function createDrawnObject(type,group)
{
	var drawnObject = {};
	drawnObject.attributes = createAttributesObject(type);
	if (type == markupTypes.TextRedactHighlight || type == markupTypes.TextHighLight 
			|| type == markupTypes.StrikeThrough || type == markupTypes.CollabHighlight){
		drawnObject.shapes = createShapeObject(type,null,group);
	} else {
		drawnObject.shapes = createShapeObject(type);
	} 
	//RM: change function call redaction transparency
//	if (type == markupTypes.TextRedactHighlight || type == markupTypes.RectangleRedaction){
//		drawnObject.shapes.SVGRectangle.drawObjRef = drawnObject;
//		drawnObject.shapes.divText.drawObjRef = drawnObject;	
//	}
	
	drawnObject.markupType = parseInt(type);
	attachShapeFunctions(drawnObject);
	
	drawnObject.toString = function()
	{
		var str ='';
		
		for(var i in this.attributes)
		{
			str+='('+i+','+this.attributes[i]+')';
		}
		return str;
	};
	return drawnObject;
}

function attachShapeFunctions(drawnObject,isIEX)
{
	var previousIE = JSON.parse(JSON.stringify(isIE));
	if(isIEX!=undefined)
		isIE = isIEX;
	drawnObject.setShapeAttribute = function(object,name,value)
	{
		object.setAttributeNS(null, name, value);
	};
	
	drawnObject.getShapeAttribute = function(object,name)
	{
		object.getAttributeNS(null, name);
	};
	
	drawnObject.setTextAttribute = function(object,name,value)
	{
		if(isIE === true && isSafari === true && name === 'fill')
		{
			object.setAttributeNS(null, name, value);
		}
		else
		{
			object.style[name] = value;			
		}
	};
	
	switch(drawnObject.markupType)
	{	
		case markupTypes.StickyNote:
		case markupTypes.Text:
			var object = isIE ? drawnObject.shapes.SVGText : drawnObject.shapes.divText;
			
			drawnObject.setFontFamily = function(fontFamily)
			{
				this.attributes.fontFamily = fontFamily;
				this.setTextAttribute(object,'font-family',fontFamily);
			};
			
			drawnObject.setFontSize = function(fontSize)
			{
				this.attributes.fontSize = fontSize;
				this.setTextAttribute(object,'font-size',fontSize);
			};
			
			drawnObject.setBoldStyle = function(boldStyle)
			{
				this.attributes.boldStyle = boldStyle;
				this.setTextAttribute(object,'fontWeight',boldStyle);
			};
			
			drawnObject.setItalicStyle = function(italicStyle)
			{
				this.attributes.italicStyle = italicStyle;
				this.setTextAttribute(object,'fontStyle',italicStyle);
			};
			
			drawnObject.setUnderlineStrikeStyle = function(underLineStrikeStyle)
			{
				this.attributes.underLineStrikeStyle = underLineStrikeStyle;
				this.setTextAttribute(object,'textDecoration',underLineStrikeStyle);
			};
			
			drawnObject.setHorizontalAlign = function(horizontalAlign)
			{
				this.attributes.horizontalAlign = horizontalAlign;
				this.setTextAttribute(object,'textAlign',horizontalAlign);
			};
			
			drawnObject.setVerticalAlign = function(verticalAlign)
			{
				this.attributes.verticalAlign = verticalAlign;
				this.setTextAttribute(object,'verticalAlign',verticalAlign);
			};
			
			drawnObject.setTextAnchor = function(textAnchor)
			{
				this.attributes.textAnchor = textAnchor;
				this.setShapeAttribute(object,'text-anchor',textAnchor);
			};
			
			drawnObject.getText = function()
			{
				var wholeText = "";
				var currentText = this.attributes.text;
				var len = this.attributes.text.length;
				if(len === undefined || len === null)
					len = Object.keys(currentText).length;
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
			};
			
			drawnObject.setSVGTextValueX = function(valueX)
			{
				this.attributes.valueX = valueX;
				this.setShapeAttribute(object,'x',valueX);
			};
			
			drawnObject.setSVGTextValueY = function(valueY)
			{
				this.attributes.valueY = valueY;
				this.setShapeAttribute(object,'y',valueY);
			};
		case markupTypes.RectangleRedaction:
		case markupTypes.TextRedactHighlight:
			var object = isIE ? drawnObject.shapes.SVGText : drawnObject.shapes.divText;
			drawnObject.setFontColor = function(fontColor)
			{
				this.attributes.fontColor = fontColor;
				var opacity = (this.visibilityMode===visibilityMode.Transparent) ? visibilityMode.Transparent : this.attributes.opacity;
				var rgbaColor = getRGBAcolor(fontColor,opacity);
				if(isIE) {
					this.setTextAttribute(object,'fill',rgbaColor);
				} else {
					this.setTextAttribute(object,'color',rgbaColor);
				}
			};
		case markupTypes.Rectangle:
		case markupTypes.SearchHighlight:
		case markupTypes.TextHighLight:
		case markupTypes.CollabHighlight:
			drawnObject.setX = function(x)
			{
				this.attributes.x = x;
				switch(this.markupType)
				{
					case markupTypes.RectangleRedaction:
					case markupTypes.TextRedactHighlight:
						if(isIE)
						{
							this.setShapeAttribute(this.shapes.SVGText,'x',this.attributes.width/2);
							this.setShapeAttribute(this.shapes.SVGClipRect,'x','0');
							this.setShapeAttribute(this.shapes.SVGRectangle,'x',x);
							if(this.getShapeAttribute(this.shapes.SVGGWrapper,'transform'))
								this.setShapeAttribute(this.shapes.SVGGWrapper,'transform',parseMatrix(this.shapes.SVGGWrapper.getAttributeNS(null,'transform'),4,x));
							else
								this.setShapeAttribute(this.shapes.SVGGWrapper,'transform','matrix(1,0,0,1,'+x+',0)');
						}
						else
						{
							this.setShapeAttribute(this.shapes.SVGRectangle,'x',x);
							this.setShapeAttribute(this.shapes.foreignObj,'x',x);
						}
						break;
					case markupTypes.StickyNote:	
					case markupTypes.Text:
						if(isIE)
						{
							this.setShapeAttribute(this.shapes.SVGClipRect,'x','0');
							this.setShapeAttribute(this.shapes.SVGRectangle,'x',x);
							
							if(this.getShapeAttribute(this.shapes.SVGGWrapper,'transform'))
								this.setShapeAttribute(this.shapes.SVGGWrapper,'transform',parseMatrix(this.shapes.SVGGWrapper.getAttributeNS(null,'transform'),4,x));
							else
								this.setShapeAttribute(this.shapes.SVGGWrapper,'transform','matrix(1,0,0,1,'+x+',0)');
							// accounting for SVGText with horizontal alignment
						}
						else
						{
							this.setShapeAttribute(this.shapes.foreignObj,'x',x+5);//ARVINCHANGE y+5
							this.setShapeAttribute(this.shapes.SVGRectangle,'x',x);
						}

						break;
					case markupTypes.Rectangle:
					case markupTypes.SearchHighlight:
					case markupTypes.TextHighLight:
					case markupTypes.CollabHighlight:
						this.setShapeAttribute(this.shapes.SVGRectangle,'x',x);
						break;
				}
				
			};
			
			drawnObject.setY = function(y)
			{
				try
				{
				this.attributes.y = y;
				
				switch(this.markupType)
				{
					case markupTypes.RectangleRedaction:
					case markupTypes.TextRedactHighlight:
						if(isIE)
						{
							this.setShapeAttribute(this.shapes.SVGText,'y',this.attributes.height/2);
							this.setShapeAttribute(this.shapes.SVGClipRect,'y','0');
							this.setShapeAttribute(this.shapes.SVGRectangle,'y',y);
							if(this.getShapeAttribute(this.shapes.SVGGWrapper,'transform'))
								this.setShapeAttribute(this.shapes.SVGGWrapper,'transform',parseMatrix(this.shapes.SVGGWrapper.getAttributeNS(null,'transform'),5,y));
							else
								this.setShapeAttribute(this.shapes.SVGGWrapper,'transform','matrix(1,0,0,1,0,'+y+')');
						}
						else
						{
							this.setShapeAttribute(this.shapes.SVGRectangle,'y',y);
							this.setShapeAttribute(this.shapes.foreignObj,'y',y);
						}
						break;
					case markupTypes.StickyNote:	
					case markupTypes.Text:
						if(isIE)
						{
							this.setShapeAttribute(this.shapes.SVGClipRect,'y','0');
							this.setShapeAttribute(this.shapes.SVGRectangle,'y',y);
							if(this.getShapeAttribute(this.shapes.SVGGWrapper,'transform'))
								this.setShapeAttribute(this.shapes.SVGGWrapper,'transform',parseMatrix(this.shapes.SVGGWrapper.getAttributeNS(null,'transform'),5,y));
							else
								this.setShapeAttribute(this.shapes.SVGGWrapper,'transform','matrix(1,0,0,1,0,'+y+')');
							// accounting for SVGText with vertical alignment
						}
						else
						{
							this.setShapeAttribute(this.shapes.foreignObj,'y',y+5);
							this.setShapeAttribute(this.shapes.SVGRectangle,'y',y);
						}

						break;
					case markupTypes.Rectangle:
					case markupTypes.SearchHighlight:
					case markupTypes.TextHighLight:
					case markupTypes.CollabHighlight:
						this.setShapeAttribute(this.shapes.SVGRectangle,'y',y);
						break;
				}
			}
			catch(err)
			{
				console.error('Exception in attachShapeFunctions setY: '+err);
			}
			};
			
			drawnObject.setWidth = function(width)
			{
				try
				{
					this.attributes.width = width;
					switch(this.markupType)
					{
						case markupTypes.RectangleRedaction:
						case markupTypes.TextRedactHighlight:
							if(isIE)
							{
								this.setShapeAttribute(this.shapes.SVGText,'width',width);
								this.setShapeAttribute(this.shapes.SVGClipRect,'width',width);
								this.setShapeAttribute(this.shapes.SVGRectangle,'width',width);
							}
							else
							{
								this.setShapeAttribute(this.shapes.SVGRectangle,'width',width);
								this.setShapeAttribute(this.shapes.foreignObj,'width',width);
								this.shapes.divText.style.width = width+'px';
							}
							break;
						case markupTypes.StickyNote:	
						case markupTypes.Text:
							if(isIE)
							{
								this.setShapeAttribute(this.shapes.SVGText,'width',width);
								this.setShapeAttribute(this.shapes.SVGClipRect,'width',width-5);
								this.setShapeAttribute(this.shapes.SVGRectangle,'width',width);
							}
							else
							{
								this.setShapeAttribute(this.shapes.SVGRectangle,'width',width);
								this.setShapeAttribute(this.shapes.foreignObj,'width',width-10); //arvinchangewidth-10
								this.shapes.divText.style.width = (width-10)+'px';
							}
							break;
						case markupTypes.Rectangle:
						case markupTypes.SearchHighlight:
						case markupTypes.TextHighLight:
						case markupTypes.CollabHighlight:
							this.setShapeAttribute(this.shapes.SVGRectangle,'width',width);
							break;
					}
				}
				catch(err)
				{
					console.error('Exception in attachShapeFunctions setWidth: '+err);
				}

			};
			
			drawnObject.setHeight = function(height)
			{
				try
				{
				this.attributes.height = height;
				switch(this.markupType)
				{
					case markupTypes.RectangleRedaction:
					case markupTypes.TextRedactHighlight:
						if(isIE)
						{
							this.setShapeAttribute(this.shapes.SVGText,'height',height);
							this.setShapeAttribute(this.shapes.SVGClipRect,'height',height);
							this.setShapeAttribute(this.shapes.SVGRectangle,'height',height);
						}
						else
						{
							this.setShapeAttribute(this.shapes.SVGRectangle,'height',height);
							this.setShapeAttribute(this.shapes.foreignObj,'height',height);
							this.shapes.divText.style.height = height+'px';
						}
						break;
					case markupTypes.StickyNote:	
					case markupTypes.Text:
						if(isIE)
						{
							this.setShapeAttribute(this.shapes.SVGText,'height',height);
							this.setShapeAttribute(this.shapes.SVGClipRect,'height',height-5);
							this.setShapeAttribute(this.shapes.SVGRectangle,'height',height);
						}
						else
						{
							this.setShapeAttribute(this.shapes.SVGRectangle,'height',height);
							this.setShapeAttribute(this.shapes.foreignObj,'height',height-10); 
							this.shapes.divText.style.height = (height-10)+'px'; 
						}
						break;
					case markupTypes.Rectangle:
					case markupTypes.SearchHighlight:
					case markupTypes.TextHighLight:
					case markupTypes.CollabHighlight:
						this.setShapeAttribute(this.shapes.SVGRectangle,'height',height);
						break;
					}
				}
				catch(err)
				{
					console.error('Exception in attachShapeFunctions setHeight: '+err);
				}
			};
			
			if(markupTypes.CollabHighlight){				
				drawnObject.setComment = function(comment)
				{
					this.attributes.comment = comment;
				};
			}
			
			break;
		case markupTypes.Arrow:	
			drawnObject.setMarkerEnd = function(markerEnd)
			{
				this.attributes.markerEnd = markerEnd;
				this.setShapeAttribute(this.shapes.SVGLine,'marker-end',markerEnd);
			};
			
						
			drawnObject.setCircMaskCX = function(circMaskCX)
			{
				//this.attributes.circMaskCX = circMaskCX;
				this.setShapeAttribute(this.shapes.circleMask,'cx',circMaskCX);
			};
			
			drawnObject.setCircMaskCY = function(circMaskCY)
			{
				//this.attributes.circMaskCY = circMaskCY;
				this.setShapeAttribute(this.shapes.circleMask,'cy',circMaskCY);
			};
			
			drawnObject.setCircMaskRX = function(circMaskRX)
			{
				//this.attributes.circMaskRX = circMaskRX;
				this.setShapeAttribute(this.shapes.circleMask,'rx',circMaskRX);
			};
			
			drawnObject.setCircMaskRY = function(circMaskRY)
			{
				//this.attributes.circMaskRY = circMaskRY;
				this.setShapeAttribute(this.shapes.circleMask,'ry',circMaskRY);
			};
		case markupTypes.Line:
			drawnObject.setX1 = function(x1)
			{
				this.attributes.x1 = x1;
				this.setShapeAttribute(this.shapes.SVGLine,'x1',x1);
				this.setShapeAttribute(this.shapes.SVGBoundingLine, 'x1', x1);
			};
			
			drawnObject.setY1 = function(y1)
			{
				this.attributes.y1 = y1;
				this.setShapeAttribute(this.shapes.SVGLine,'y1',y1);
				this.setShapeAttribute(this.shapes.SVGBoundingLine, 'y1', y1);
			};
			
			drawnObject.setX2 = function(x2)
			{
				this.attributes.x2 = x2;
				this.setShapeAttribute(this.shapes.SVGLine,'x2',x2);
				this.setShapeAttribute(this.shapes.SVGBoundingLine, 'x2', x2);
			};
			
			drawnObject.setY2 = function(y2)
			{
				this.attributes.y2 = y2;
				this.setShapeAttribute(this.shapes.SVGLine,'y2',y2);
				this.setShapeAttribute(this.shapes.SVGBoundingLine, 'y2', y2);
			};
			break;
		case markupTypes.StrikeThrough:
			drawnObject.setX1 = function(x1)
			{
				this.attributes.x1 = x1;
				this.setShapeAttribute(this.shapes.SVGLine,'x1',x1);
				this.setShapeAttribute(this.shapes.SVGRectangle,'x',x1);
			};
			
			drawnObject.setX2 = function(x2)
			{
				this.attributes.x2 = x2;
				this.setShapeAttribute(this.shapes.SVGLine,'x2',x2);
			};
			
			drawnObject.setY = function(y)
			{
				this.attributes.y1 = y;
				this.attributes.y2 = y;
				this.setShapeAttribute(this.shapes.SVGLine,'y1',y);
				this.setShapeAttribute(this.shapes.SVGLine,'y2',y);
			};
			
			drawnObject.setRectY = function(y)
			{
				this.setShapeAttribute(this.shapes.SVGRectangle,'y',y);
			};
			
			drawnObject.setHeight = function(height)
			{
				this.attributes.height = height;
				this.setShapeAttribute(this.shapes.SVGRectangle,'height',height);
			};
			
			drawnObject.setWidth = function(width)
			{
				this.attributes.width = width;
				this.setShapeAttribute(this.shapes.SVGRectangle,'width',width);
			};
			
			drawnObject.setComment = function(comment)
			{
				this.attributes.comment = comment;
			};
			
			break;
		case markupTypes.Circle:
			drawnObject.setCX = function(cx)
			{
				this.attributes.cx = cx;
				this.setShapeAttribute(this.shapes.SVGEllipse,'cx',cx);
			};
			
			drawnObject.setCY = function(cy)
			{
				this.attributes.cy = cy;
				this.setShapeAttribute(this.shapes.SVGEllipse,'cy',cy);
			};
			
			drawnObject.setRX = function(rx)
			{
				this.attributes.rx = rx;
				this.setShapeAttribute(this.shapes.SVGEllipse,'rx',rx);
			};
			
			drawnObject.setRY = function(ry)
			{
				this.attributes.ry = ry;
				this.setShapeAttribute(this.shapes.SVGEllipse,'ry',ry);
			};
			break;
		case markupTypes.Stamp:
			var object = drawnObject.shapes.textStamp;
			drawnObject.setFontFamily = function(fontFamily)
			{
				this.attributes.fontFamily = fontFamily;
				this.setShapeAttribute(object,'font-family',fontFamily);
			};
			
			drawnObject.setFontSize = function(fontSize)
			{
				this.attributes.fontSize = fontSize;
				this.setShapeAttribute(object,'font-size',fontSize);
			};
			
			drawnObject.setBoldStyle = function(boldStyle)
			{
				this.attributes.boldStyle = boldStyle;
				this.setShapeAttribute(object,'font-weight',boldStyle);
			};
			
			drawnObject.setItalicStyle = function(italicStyle)
			{
				this.attributes.italicStyle = italicStyle;
				this.setShapeAttribute(object,'font-style',italicStyle);
			};
			
			drawnObject.setUnderlineStrikeStyle = function(underLineStrikeStyle)
			{
				this.attributes.underLineStrikeStyle = underLineStrikeStyle;
				this.setShapeAttribute(object,'text-decoration',underLineStrikeStyle);
			};
			
			
			drawnObject.setX = function(x)
			{
				this.attributes.x = x;
				this.setShapeAttribute(object,'x',x);
			};
			
			drawnObject.setY = function(y)
			{
				this.attributes.y = y;
				this.setShapeAttribute(object,'y',y);
			};
			
			drawnObject.setWidth = function(width)
			{
				this.attributes.width = width;
				this.setShapeAttribute(object,'width',width);
			};
			
			drawnObject.setHeight = function(height)
			{
				this.attributes.height = height;
				this.setShapeAttribute(object,'height',height);
			};
			
			drawnObject.setFontColor = function(fontColor)
			{
				this.attributes.fontColor = fontColor;
				var opacity = (this.visibilityMode===visibilityMode.Transparent) ? visibilityMode.Transparent : this.attributes.opacity;
				var rgbaColor = getRGBAcolor(fontColor,opacity);
				this.setTextAttribute(object,'fill',rgbaColor);
			};
				
			drawnObject.setStampText = function(text)
			{
				this.attributes.stampText = text;
				var textNode = document.createTextNode(text);
				this.shapes.textStamp.appendChild(textNode);
			};
			
			
			drawnObject.getW = function(){
				var bbox = object.getBBox();				
				alert("Width:"+bbox.width+" height:"+bbox.height);								
			};
			
			drawnObject.getStampWidth = function(){
				var bbox = object.getBBox();
				var width = bbox.width;
				return width;
			};
			
			drawnObject.getStampHeight = function(){
				var bbox = object.getBBox();
				var height = bbox.height;
				return height;
			};
			break;
			
		case markupTypes.Image:
			var object = drawnObject.shapes.image;
			drawnObject.setX = function(x)
			{
				this.attributes.x = x;
				this.setShapeAttribute(object,'x',x);
			};
			
			drawnObject.setY = function(y)
			{
				this.attributes.y = y;
				this.setShapeAttribute(object,'y',y);
			};
			
			drawnObject.setWidth = function(width)
			{
				this.attributes.width = width;
				this.setShapeAttribute(object,'width',width);
			};
			
			drawnObject.setHeight = function(height)
			{
				this.attributes.height = height;
				this.setShapeAttribute(object,'height',height);
			};
			
			drawnObject.setImageData = function(data)
			{
				object.setAttributeNS('http://www.w3.org/1999/xlink', 'href',data);
				drawnObject.attributes.href = data;
			};
			
			drawnObject.getImageWidth = function(){
				var bbox = object.getBBox();
				var width = bbox.width;
				return width;
			};
			
			drawnObject.getImageHeight = function(){
				var bbox = object.getBBox();
				var height = bbox.height;
				return height;
			};
			
			break;			
			
			
			
	};
	
	drawnObject.setFillColor = function(fillColor)
	{
		this.attributes.fillColor = fillColor;
		var object;
		switch(this.markupType)
		{
			case markupTypes.StickyNote:
			case markupTypes.Text : 
			case markupTypes.RectangleRedaction :
			case markupTypes.TextRedactHighlight :
				object = this.shapes.SVGRectangle;
				if(fillColor == 'rgba(176, 176, 176, 0)' || fillColor == 'rgba(0, 0, 0, 0)'|| fillColor == 'transparent') {
					fillColor = getRGBAcolor(fillColor,'0');
				} else {
					//TODO: refactor: fill attribute to have rgb value only
					//fillColor = getRGBAcolor(fillColor,this.attributes.opacity);
					fillColor = getRGBAcolor(fillColor,1);
				}
				this.setShapeAttribute(object,'fill',fillColor);
				break;
			case markupTypes.Rectangle :
			case markupTypes.SearchHighlight:
			case markupTypes.TextHighLight:
			case markupTypes.CollabHighlight:
				object = this.shapes.SVGRectangle;
				this.setShapeAttribute(object,'fill',fillColor);
				break;
			case markupTypes.Arrow :
				object = this.shapes.SVGArrowHead;
				this.setShapeAttribute(object,'fill',fillColor);
			case markupTypes.Line :
			case markupTypes.StrikeThrough:
				object = this.shapes.SVGLine;
				this.setShapeAttribute(object,'stroke',fillColor);
				break;
			case markupTypes.Circle :
				object = this.shapes.SVGEllipse;
				this.setShapeAttribute(object,'fill',fillColor);
				break;
		}
	};
	
	drawnObject.setBorderColor = function(borderColor)
	{
		this.attributes.borderColor = borderColor;
		var object;
		switch(this.markupType)
		{
			case markupTypes.StickyNote:
			case markupTypes.Text : 
			case markupTypes.RectangleRedaction :
			case markupTypes.Rectangle :
			case markupTypes.SearchHighlight:
				object = this.shapes.SVGRectangle;
				break;
			case markupTypes.Circle :
				object = this.shapes.SVGEllipse;
				break;
		}
		this.setShapeAttribute(object,'stroke',borderColor);
	};
	
	drawnObject.setBorderWeight = function(strokeWidth)
	{
		this.attributes.borderWeight = strokeWidth;
		var object;
		switch(this.markupType)
		{
			case markupTypes.StickyNote:
			case markupTypes.Text : 
			case markupTypes.RectangleRedaction :
			case markupTypes.Rectangle :
			case markupTypes.SearchHighlight:
				object = this.shapes.SVGRectangle;
				this.setShapeAttribute(object,'stroke-width',strokeWidth);
				break;
			case markupTypes.Arrow :
				object = this.shapes.SVGArrowHead;
				this.setShapeAttribute(object,'stroke-width',strokeWidth);
			case markupTypes.Line :
			case markupTypes.StrikeThrough:
				object = this.shapes.SVGLine;
				this.setShapeAttribute(object,'stroke-width',strokeWidth);
				break;
			case markupTypes.Circle :
				object = this.shapes.SVGEllipse;
				this.setShapeAttribute(object,'stroke-width',strokeWidth);
				break;
		}
	};
	
	drawnObject.setOpacityDisplay = function(opacity)
	{
		var object;
		switch(this.markupType)
		{
			case markupTypes.Stamp :
				object = this.shapes.textStamp;
				this.setShapeAttribute(object,'fill-opacity',opacity);
				break;
			case markupTypes.Image :
				object = this.shapes.image;
				this.setShapeAttribute(object,'opacity',opacity);
				break;	
			case markupTypes.StickyNote:
			case markupTypes.Text :
			case markupTypes.RectangleRedaction :
			case markupTypes.TextRedactHighlight :
				object = isIE ? this.shapes.SVGText : this.shapes.divText;
				if (this.attributes.fontColor){
					this.setTextAttribute(object,isIE ?'fill':'color',getRGBAcolor(this.attributes.fontColor,opacity));
				}
				this.setShapeAttribute(object,'data-opacity',this.attributes.opacity);
				object = this.shapes.SVGRectangle;
				if(isSafari)
				{
					this.setShapeAttribute(object,'fill-opacity',opacity);
					this.setShapeAttribute(object,'stroke-opacity',opacity);
				}
				else
				{
					if(this.markupType===markupTypes.RectangleRedaction || this.markupType===markupTypes.TextRedactHighlight) {
						this.setShapeAttribute(object,'fill',getRGBAcolor(this.attributes.fillColor,opacity));
					} 
					else
					{
						object.style.opacity = opacity;
						if(this.attributes.fillColor == 'rgba(176, 176, 176, 0)' || this.attributes.fillColor == 'rgba(0, 0, 0, 0)'|| this.attributes.fillColor == 'transparent') {
							this.setShapeAttribute(object,'fill',getRGBAcolor(this.attributes.fillColor,'0'));	
						}
						else 
						{
							//TODO: refactor: fill attribute to have rgb value only
							//this.setShapeAttribute(object,'fill',getRGBAcolor(this.attributes.fillColor,opacity));
							this.setShapeAttribute(object,'fill',getRGBAcolor(this.attributes.fillColor,1));
						}
					}
				}
				this.setShapeAttribute(object,'data-opacity',this.attributes.opacity);
				break;
			case markupTypes.Rectangle:
			case markupTypes.SearchHighlight:
			case markupTypes.TextHighLight:
			case markupTypes.CollabHighlight:
				object = this.shapes.SVGRectangle;
				if(isSafari)
				{
					this.setShapeAttribute(object,'fill-opacity',opacity);
					this.setShapeAttribute(object,'stroke-opacity',opacity);
				}
				else
				{	
					object.style.opacity = opacity;
				}
				this.setShapeAttribute(object,'data-opacity',this.attributes.opacity);
				break;
			case markupTypes.Arrow :
				//handling for isSafari
				object = this.shapes.SVGArrowHead;
				if(isSafari)
				{
					this.setShapeAttribute(object,'fill-opacity',opacity);
					this.setShapeAttribute(object,'stroke-opacity',opacity);
				}
				/*else
				{
					object.style.opacity = opacity;
				}*/
			case markupTypes.Line :
				object = this.shapes.SVGLine;
				if(isSafari)
				{
					this.setShapeAttribute(object,'fill-opacity',opacity);
					this.setShapeAttribute(object,'stroke-opacity',opacity);
				}
				else
				{
					object.style.opacity = opacity;
				}
				this.setShapeAttribute(object,'data-opacity',this.attributes.opacity);
				break;
			case markupTypes.Circle :
				object = this.shapes.SVGEllipse;
				if(isSafari)
				{
					this.setShapeAttribute(object,'fill-opacity',opacity);
					this.setShapeAttribute(object,'stroke-opacity',opacity);
				}
				else
				{
					object.style.opacity = opacity;
				}
				this.setShapeAttribute(object,'data-opacity',this.attributes.opacity);
				break;
		}
	};
	
	drawnObject.setOpacity = function(opacity)
	{
		this.attributes.opacity = opacity;
		this.setOpacityDisplay(opacity);
	};
	
	drawnObject.setText = function(text,isIEX)
	{
		var previousIE = JSON.parse(JSON.stringify(isIE));
		if(isIEX != undefined)
		{
			isIE = isIEX;
		}	
		this.attributes.text = [];
		text = "" + text;
		var splitted = [];
		switch(this.markupType)
		{
			case markupTypes.StickyNote:
			case markupTypes.Text : 
				
				if(isIE)
				{
					splitted = text.split("\n");
				}
				else
				{
					splitted = text.split("\n");
				}
				this.attributes.text = splitted;
				break;
			case markupTypes.RectangleRedaction :
			case markupTypes.TextRedactHighlight :
				this.attributes.text.push(text);
				if(isIE) {
					//clearChildren(this.shapes.SVGText);
					//processWrapping(this.shapes.SVGText,text,15,this.attributes.width,this.attributes.id,(this.attributes.width/2));
				} else {
					this.shapes.divText.innerHTML = text;
				}
				break;
		}
		
		if(previousIE != isIE)
			isIE = previousIE;
	};
	
	drawnObject.setVisibilityMode = function(mode)
	{
		this.visibilityMode = mode;
		switch(this.visibilityMode)
		{
			case visibilityMode.Shown: 
				this.setOpacityDisplay(this.attributes.opacity);
				break;
			case visibilityMode.Hidden:
				this.setOpacityDisplay(0);
				break;
			case visibilityMode.Transparent:
				this.setOpacityDisplay(0.2);
				break;
		}
	};
	
	drawnObject.setId = function(id)
	{
		this.attributes.id = id;
		this.id = id;
		var prefix;
		if(this.markupType == markupTypes.RectangleRedaction || this.markupType == markupTypes.TextRedactHighlight)
		{
			prefix = 'redaction';
		}
		else
		{
			prefix = 'annotation';
		}
		
		for(var k in this.shapes)
		{
			if(k.indexOf('SVG')>-1 || k.indexOf('divText')>-1 || k.indexOf('para')>-1 || k.indexOf('foreign')>-1 || k.indexOf('body')>-1)
			{
				this.setShapeAttribute(this.shapes[k],'data-isi',prefix+'-'+id);
			}
		}
		
		if(this.markupType == markupTypes.Text || this.markupType == markupTypes.StickyNote)
		{
			if(isIE){
				this.setShapeAttribute(this.shapes.SVGText,'id','divText-'+id);
				this.setShapeAttribute(this.shapes.divText,'id','tSpan-'+id);
			} else {
				this.setShapeAttribute(this.shapes.divText,'id','divText-'+id);
				this.setShapeAttribute(this.shapes.para,'id','pText-'+id);
			}
			
		}

		this.setShapeAttribute(this.shapes.group,'data-isi',prefix+'-'+id);
		
	};
	
	drawnObject.rotateTextObject = function(degrees,isIEX,isForce)
	{
		if (this.markupType === markupTypes.StickyNote || this.markupType === markupTypes.Text || this.markupType === markupTypes.RectangleRedaction || this.markupType === markupTypes.TextRedactHighlight) {
			var previousIE = JSON.parse(JSON.stringify(isIE));
			if(isIEX != undefined)
			{
				isIE = isIEX;
			}	
			
			var tmpWidth = this.attributes.width;
			var tmpHeight = this.attributes.height;
			var tmpX = this.attributes.x;
			var tmpY = this.attributes.y;
			var textX = tmpWidth/2;
			var textY = tmpHeight/2;
			var tmpTextX, tmpTextY;
			var transformVal = getTextTransformRotate(degrees,tmpX,tmpY,tmpWidth,tmpHeight);
			
			if(degrees === 90 || degrees === 270) {
				tmpWidth = this.attributes.height;
				tmpHeight = this.attributes.width;
				tmpTextX = textY;
				tmpTextY = textX;
			} else {
				tmpWidth = this.attributes.width;
				tmpHeight = this.attributes.height;
				tmpTextX = textX;
				tmpTextY = textY;
			}		
			
			if (isIE) {
				
				if (this.markupType === markupTypes.Text || this.markupType === markupTypes.StickyNote) {
					this.shapes.SVGClipRect.setAttribute('width',tmpWidth-5);
					this.shapes.SVGClipRect.setAttribute('height',tmpHeight-5);
					this.shapes.SVGText.setAttribute('width',tmpWidth);
					this.shapes.SVGText.setAttribute('height',tmpHeight);
					
					var horizontalAlignString = null, valueX = 0;
					switch(this.attributes.horizontalAlign){
					case 'left':
						valueX = 5;
						horizontalAlignString = "start";
						break;
					case 'center':
						valueX = parseInt(tmpWidth/2);
						horizontalAlignString = "middle";
						break;
					case 'right':
						valueX = parseInt(tmpWidth-5);
						horizontalAlignString = "end";
						break;
					}
					this.setSVGTextValueX(valueX);
					this.setTextAnchor(horizontalAlignString);
					
					clearTextNodes(this.shapes.SVGText);
					this.shapes.divText.textContent = "";
					
					if(isForce != undefined && isForce === true)
					{
						//Force append of text object to viewable page to retrieve correct length of text
						//Mostly used for saving of SVGs
						var tempG = $('.gWrapper','.currentView')[0].childNodes[2];
						var originalG = this.shapes.group.parentNode;
						originalG.removeChild(this.shapes.group);
						tempG.appendChild(this.shapes.group);
						performWrappingAndNewLineForText(this.shapes.divText,this.getText());
						tempG.removeChild(this.shapes.group);
						originalG.appendChild(this.shapes.group);
					}
					else
					{
						performWrappingAndNewLineForText(this.shapes.divText,this.getText());
					}

					setVerticalAlignOnChange(this.shapes.SVGText,this.attributes.verticalAlign);
					var resY = parseFloat(this.shapes.SVGText.getAttributeNS(null, 'y'));
					var replaceY = parseFloat(this.shapes.SVGText.style['fontSize'].replace("px", ""));
					if (resY < replaceY)
						this.shapes.SVGText.setAttributeNS(null, 'y', replaceY+3);
					this.setSVGTextValueY(this.shapes.SVGText.getAttribute('y'));
					
					tmpTextX = this.attributes.valueX;
					tmpTextY = this.attributes.valueY;	
					this.shapes.SVGText.setAttribute('x',tmpTextX);
					this.shapes.SVGText.setAttribute('y',tmpTextY);
				}
				
				if (this.markupType === markupTypes.RectangleRedaction || this.markupType === markupTypes.TextRedactHighlight) {
					clearChildren(this.shapes.SVGText);
					processWrapping(this.shapes.SVGText,this.attributes.text[0],redactionFontSize,tmpWidth,this.id,(tmpWidth/2));
					this.shapes.SVGText.setAttribute('width',tmpWidth);
					this.shapes.SVGText.setAttribute('height',tmpHeight);
					this.shapes.SVGText.setAttribute('x',tmpTextX);
					this.shapes.SVGText.setAttribute('y',tmpTextY);
					this.shapes.SVGClipRect.setAttribute('width',tmpWidth-3);
					this.shapes.SVGClipRect.setAttribute('height',tmpHeight-3);
					transformVal = getTextTransformRotate(degrees,tmpX,tmpY,this.attributes.width-5,this.attributes.height-5);
				}
				
				this.shapes.SVGGWrapper.setAttribute('transform',transformVal);
				
			} else { // Non-IE
				if (this.markupType === markupTypes.StickyNote || this.markupType === markupTypes.Text) {
					tmpWidth -= 10;
					tmpHeight -= 10;
				}			
				this.shapes.foreignObj.setAttribute('width',tmpWidth);
				this.shapes.foreignObj.setAttribute('height',tmpHeight);
				this.shapes.divText.style.width = tmpWidth;
				this.shapes.divText.style.height = tmpHeight;
				this.shapes.foreignObj.setAttribute('transform',transformVal);
			}	
			if(previousIE != isIE)
				isIE = previousIE;
		}
	};
	if(previousIE != isIE)
		isIE = previousIE;
	
}

function createAttributesObject(type)
{
	var attributeObject = {};
	attributeObject.id = -1;
	attributeObject.type = type;
	attributeObject.userId;
	switch(type)
	{
		case markupTypes.Circle:
			attributeObject.x = 0;
			attributeObject.y = 0;
		//case markupTypes.StickyNote:	
		case markupTypes.RectangleRedaction:
		case markupTypes.Text:
			attributeObject.fontColor = 'rgb(0,0,0)';
		case markupTypes.Rectangle:
		case markupTypes.SearchHighlight:
			attributeObject.borderColor = 'rgb(0,0,0)';
		case markupTypes.TextHighLight:
		case markupTypes.TextRedactHighlight:
		case markupTypes.CollabHighlight:
			attributeObject.x = 0;
			attributeObject.y = 0;
			attributeObject.height = 0;
			attributeObject.width = 0;
			attributeObject.fillColor = 'rgb(0,0,0)';
			break;
		case markupTypes.StrikeThrough:
			attributeObject.height = 0;
			attributeObject.width = 0;
		case markupTypes.Arrow:	
		case markupTypes.Line:
			attributeObject.x1 = 0;
			attributeObject.y1 = 0;
			attributeObject.x2 = 0;
			attributeObject.y2 = 0;
			break;
	}
	return attributeObject;
}

function createShapeObject(annotationObject,isIEX,group) {
	var previousIE = JSON.parse(JSON.stringify(isIE));
	if(isIEX != undefined)
	{
		isIE = isIEX;
	}
	var annotationGroup;
	if (group){
		annotationGroup = group;
	} else {
		annotationGroup = createSVGElement('g');
		annotationGroup.setAttribute('style', 'display:block; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none;  -ms-user-select: none; user-select: none;');
		annotationGroup.setAttribute('class', 'annotationClass');
	}
	
	var shapesObject = {};
	switch(annotationObject) {
	case markupTypes.Circle:
		var createdCircle = createSVGElement('ellipse');
		shapesObject.SVGEllipse = createdCircle;
		shapesObject.retrieveOriginCoordinates = function()
		{
			transformed = getObjectMatrix(this.SVGEllipse.parentNode);
			return transformed;
		};
		
		shapesObject.retrieveShapeForCalculation = function()
		{
			return this.SVGEllipse;
		};
		break;
		
	case markupTypes.Arrow:	
		var marker = createSVGElement('marker');
		var path = createSVGElement('path');
		var createdCircMask = createSVGElement('ellipse');
		
		shapesObject.SVGArrowHead = marker;
		shapesObject.SVGPath = path;
		shapesObject.circleMask = createdCircMask;
	case markupTypes.Line:
		var createdLine = createSVGElement('line');
		var boundingLine = createSVGElement('line');
		
		shapesObject.SVGLine = createdLine;
		shapesObject.SVGBoundingLine = boundingLine
		var object = shapesObject.SVGBoundingLine;
		if (isSafari) {
			object.setAttributeNS(null,'fill-opacity',defaultCollabTransparency);
			object.setAttributeNS(null,'stroke-opacity',defaultCollabTransparency);
		} else {
			object.style.opacity = defaultCollabTransparency;
		}
		object.setAttributeNS(null,'data-opacity',defaultCollabTransparency);
		object.setAttributeNS(null, 'stroke-width', defaultBoundingLineBorderWidth);
		object.setAttributeNS(null, 'stroke', defaultLineColor);
		
		shapesObject.retrieveOriginCoordinates = function()
		{
			transformed = getObjectMatrix(this.SVGLine.parentNode);
			return transformed;
		};
		shapesObject.retrieveShapeForCalculation = function()
		{
			return this.SVGLine;
		};
		shapesObject.retrieveBoundingLineShape = function()
		{
			return this.SVGBoundingLine;
		}
		break;
	case markupTypes.StrikeThrough:
		var createdLine = createSVGElement('line');
		var createdRectangle = createSVGElement('rect');
		
		shapesObject.SVGLine = createdLine;
		shapesObject.SVGRectangle = createdRectangle;
		var object = shapesObject.SVGRectangle;
		if (isSafari) {
			object.setAttributeNS(null,'fill-opacity',defaultCollabTransparency);
			object.setAttributeNS(null,'stroke-opacity',defaultCollabTransparency);
		} else {
			object.style.opacity = defaultCollabTransparency;
		}
		object.setAttributeNS(null,'data-opacity',defaultCollabTransparency);
		
		shapesObject.retrieveOriginCoordinates = function()
		{
			transformed = getObjectMatrix(this.SVGLine.parentNode);
			return transformed;
		};
		shapesObject.retrieveShapeForCalculation = function()
		{
			return this.SVGLine;
		};
		shapesObject.retrieveBoxShape = function()
		{
			return this.SVGRectangle;
		};
		break;
	case markupTypes.RectangleRedaction:	
	case markupTypes.TextRedactHighlight:
		var createdRectangle = createSVGElement('rect');
		shapesObject.SVGRectangle = createdRectangle;
		if(isIE){
			var createdClipRect = createSVGElement('rect');
			var createdSVGText = createSVGElement('text');
			var clipPathAnnotationGroup = createSVGElement('g');
			var createdSVGTspan = createSVGElement('tspan');
			var createdClipPath = createSVGElement('clipPath');
			var redactionReason = document.createTextNode('');
			
			shapesObject.SVGClipRect = createdClipRect;
			shapesObject.SVGText = createdSVGText;
			shapesObject.SVGGWrapper = clipPathAnnotationGroup;									
			shapesObject.divText = createdSVGTspan;
			shapesObject.clip = createdClipPath;
			shapesObject.redactionText = redactionReason;
		} else {
			var varForBody = createBodyObject();
			var foreign = createSVGElement("foreignObject");
			foreign.setAttribute("style", "overflow:hidden");
			var createdRectangle = createSVGElement('rect');
			var divReason = document.createElement('div');
			
			shapesObject.body = varForBody;
			shapesObject.foreignObj = foreign;
			shapesObject.SVGRectangle = createdRectangle;
			shapesObject.divText = divReason;
		}
		shapesObject.retrieveShapeForCalculation = function()
		{
			return this.SVGRectangle;
		};
		shapesObject.retrieveOriginCoordinates = function()
		{
			transformed = getObjectMatrix(this.SVGRectangle.parentNode);
			return transformed;
		};
		break;
	case markupTypes.StickyNote :	
	case markupTypes.Text:
		var createdRectangle = createSVGElement('rect');
		shapesObject.SVGRectangle = createdRectangle;
		if(isIE){
			var createdClipRect = createSVGElement('rect');
			var createdSVGText = createSVGElement('text');
			var clipPathAnnotationGroup = createSVGElement('g');
			var createdSVGTspan = createSVGElement('tspan');
			var createdClipPath = createSVGElement('clipPath');

			shapesObject.SVGClipRect = createdClipRect;
			shapesObject.SVGText = createdSVGText;
			shapesObject.SVGGWrapper = clipPathAnnotationGroup;									
			shapesObject.divText = createdSVGTspan;
			shapesObject.clip = createdClipPath;
		} else {
			var varForBody = createBodyObject();
			var foreign = createSVGElement("foreignObject");
			var divReason = document.createElement('div');
			var p = document.createElement('p');
			
			shapesObject.body = varForBody;
			shapesObject.foreignObj = foreign;
			shapesObject.divText = divReason;
			shapesObject.para = p;
		}
		shapesObject.retrieveShapeForCalculation = function()
		{
			return this.SVGRectangle;
		};
		shapesObject.retrieveOriginCoordinates = function()
		{
			transformed = getObjectMatrix(this.SVGRectangle.parentNode);
			return transformed;
		};
		break;
	case markupTypes.Rectangle:
	case markupTypes.SearchHighlight:
	case markupTypes.TextHighLight:
	case markupTypes.CollabHighlight:
		var createdRectangle = createSVGElement('rect');
		
		shapesObject.SVGRectangle = createdRectangle;
		shapesObject.retrieveOriginCoordinates = function()
		{
			transformed = getObjectMatrix(this.SVGRectangle.parentNode);
			return transformed;
		};
		shapesObject.retrieveShapeForCalculation = function()
		{
			return this.SVGRectangle;
		};
		break;
	case markupTypes.Stamp:
		var createdTextStamp = createSVGElement("text");				
		shapesObject.textStamp = createdTextStamp;
		
		shapesObject.retrieveShapeForCalculation = function()
		{
			return this.textStamp;
		};
		shapesObject.retrieveOriginCoordinates = function()
		{
			transformed = getObjectMatrix(this.textStamp.parentNode);
			return transformed;
		};				
		break;
	case markupTypes.Image:

		var createdImage = createSVGElement("image");				
		shapesObject.image = createdImage;
		
		shapesObject.retrieveShapeForCalculation = function()
		{
			return this.image;
		};
		shapesObject.retrieveOriginCoordinates = function()
		{
			transformed = getObjectMatrix(this.image.parentNode);
			return transformed;
		};			

		break;
		
	}
	
	shapesObject.group = annotationGroup;
	if(previousIE != isIE)
		isIE = previousIE;
	return shapesObject;
}

function initializePreDrawProcess(type, drawnObject, markupParentGroup, selectedReason,isIEX, isSameLevel) {
	var previousIE = JSON.parse(JSON.stringify(isIE));
	if(isIEX != undefined)
	{
		isIE = isIEX;
	}
	var markupId = drawnObject.attributes.id;
	switch(type)
	{
	case markupTypes.Circle:
		appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGEllipse);
		break;
	case markupTypes.Rectangle:
	case markupTypes.SearchHighlight:
	case markupTypes.TextHighLight:
	case markupTypes.CollabHighlight:
		appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGRectangle);
		break;
	case markupTypes.StrikeThrough:
		appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGRectangle);
		appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGLine);
		break;
	case markupTypes.Line:
		appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGBoundingLine);
		appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGLine);
		break;
	case markupTypes.Arrow:
		createArrowHead(drawnObject.shapes.SVGArrowHead,markupId);
		changeArrowHeadSize(drawnObject.shapes.SVGArrowHead, drawnObject.shapes.SVGPath, drawnObject.attributes);
		appendObjectToDom(drawnObject.shapes.SVGArrowHead, drawnObject.shapes.SVGPath);
		appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.circleMask);
		drawnObject.shapes.circleMask.setAttributeNS(null, 'data-isi','annotation-'+(markupId));
		drawnObject.shapes.circleMask.setAttributeNS(null, 'fill','transparent');
		drawnObject.shapes.circleMask.setAttributeNS(null, 'stroke','transparent');
		break;
	case markupTypes.StickyNote:
	case markupTypes.Text:
		setDefaultTextStyle(drawnObject);
		if(isIE) {
			appendObjectToDom(drawnObject.shapes.SVGText, drawnObject.shapes.divText);
			appendObjectToDom(drawnObject.shapes.clip, drawnObject.shapes.SVGClipRect);
			appendObjectToDom(drawnObject.shapes.SVGGWrapper, drawnObject.shapes.clip);
			appendObjectToDom(drawnObject.shapes.SVGGWrapper, drawnObject.shapes.SVGText);
			appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGRectangle);
			appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGGWrapper);
			
			drawnObject.shapes.divText.textContent = "";
			drawnObject.shapes.divText.setAttributeNS(null, 'class', 'wrapText');
			drawnObject.shapes.clip.setAttributeNS(null, 'id', 'UDV'+(markupId));
			drawnObject.shapes.clip.setAttributeNS(null, 'clipPathUnits', 'userSpaceOnUse');
			drawnObject.shapes.SVGGWrapper.setAttributeNS(null, 'style', 'display: block;');
			drawnObject.shapes.SVGGWrapper.setAttributeNS(null, 'data-isi','annotation-'+(markupId));
			drawnObject.shapes.SVGGWrapper.setAttribute('clip-path', 'url(#UDV'+markupId+')');
			lastDrawnDivReason = drawnObject.shapes.divText;
		} else {
			appendObjectToDom(drawnObject.shapes.body, drawnObject.shapes.divText);
			appendObjectToDom(drawnObject.shapes.foreignObj, drawnObject.shapes.body);
			appendObjectToDom(drawnObject.shapes.divText, drawnObject.shapes.para);
			appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGRectangle);
			appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.foreignObj);
			
			drawnObject.shapes.foreignObj.setAttributeNS(null, 'style', 'overflow:hidden;position:absolute;z-index:-1;');
			drawnObject.shapes.para.setAttributeNS(null, 'style', 'word-break:break-all');
			lastDrawnDivReason = drawnObject.shapes.para;
		}
		break;
	case markupTypes.RectangleRedaction:
	case markupTypes.TextRedactHighlight:
		setDefaultRedactionStyle(drawnObject,isIE);
		if(isIE) {
			appendObjectToDom(drawnObject.shapes.SVGText, drawnObject.shapes.divText);
			appendObjectToDom(drawnObject.shapes.clip, drawnObject.shapes.SVGClipRect);
			appendObjectToDom(drawnObject.shapes.divText, drawnObject.shapes.redactionText);
			appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGRectangle);
			appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGGWrapper);
			appendObjectToDom(drawnObject.shapes.SVGGWrapper, drawnObject.shapes.clip);
			appendObjectToDom(drawnObject.shapes.SVGGWrapper, drawnObject.shapes.SVGText);
			
			drawnObject.shapes.redactionText.data = selectedReason;
			drawnObject.shapes.divText.setAttributeNS(null, 'data-isi','redaction-'+(markupId));
			drawnObject.shapes.clip.setAttributeNS(null, 'id', 'UDV'+(markupId));
			drawnObject.shapes.clip.setAttributeNS(null, 'clipPathUnits', 'userSpaceOnUse');
			//drawnObject.shapes.SVGRectangle.setAttributeNS(null, 'style', 'fill:rgba(0, 0, 0, 1)');
			drawnObject.shapes.SVGRectangle.setAttributeNS(null, 'data-isi','redaction-'+(markupId));
			drawnObject.shapes.SVGClipRect.setAttributeNS(null, 'data-isi','redaction-'+(markupId));
			drawnObject.shapes.SVGGWrapper.setAttribute('clip-path', 'url(#UDV'+markupId+')');
		} else {
			appendObjectToDom(drawnObject.shapes.body, drawnObject.shapes.divText);
			appendObjectToDom(drawnObject.shapes.foreignObj, drawnObject.shapes.body);
			appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGRectangle);
			appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.foreignObj);
		}
		break;		
	case markupTypes.Stamp:
		appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.textStamp);
		drawnObject.shapes.textStamp.setAttributeNS(null, 'data-isi','annotation-'+(markupId));
	
		break;
		
	case markupTypes.Image:
		appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.image);
		drawnObject.shapes.image.setAttributeNS(null, 'data-isi','annotation-'+(markupId));
	
		break;		
	}
	if(isSameLevel == undefined)
		appendObjectToDom(markupParentGroup, drawnObject.shapes.group);
	if(previousIE != isIE)
		isIE = previousIE;
}

function appendObjectToDom(parentObject, childObject) {
	parentObject.appendChild(childObject);
}
function removeObjectFromDom(parentObject, childObject) {
	parentObject.removeChild(childObject);
}

function setDefaultTextStyle(drawnObject) {
	var object = isIE ? drawnObject.shapes.SVGText : drawnObject.shapes.divText;
	object.setAttribute('style', 'resize: none; word-wrap: break-word; display: table-cell; white-space: normal; background-color: transparent;');
}

function setDefaultRedactionStyle(drawnObject,isIE) {	
	if(isIE) {
		object = drawnObject.shapes.SVGText;
		object.setAttribute('class','redactionReason');
		object.setAttributeNS(null, 'text-decoration', 'none');
		object.setAttributeNS(null, 'style', 'fill:rgba(255, 255, 255, 1)');
		object.setAttributeNS(null, 'data-isi','redaction-'+(markupId));
		object.setAttributeNS(null, 'text-anchor', 'middle');
		object.setAttributeNS(null, 'font-family', 'Arial');
		object.setAttributeNS(null, 'font-size', '12');
		object.setAttributeNS(null, 'font-style', 'normal');
		object.setAttributeNS(null, 'font-weight', 'normal');
	} else {
		object = drawnObject.shapes.divText;
		object.setAttribute('class','redactionReason');
		drawnObject.setTextAttribute(object,'wordWrap','break-word');
		drawnObject.setTextAttribute(object,'fontFamily','Arial');
		drawnObject.setTextAttribute(object,'fontSize','12px');
		drawnObject.setTextAttribute(object,'textAlign','center');
		drawnObject.setTextAttribute(object,'display','table-cell');
		drawnObject.setTextAttribute(object,'whiteSpace','normal');
		drawnObject.setTextAttribute(object,'verticalAlign','middle');
		drawnObject.setTextAttribute(object,'backgroundColor','transparent');
	}
}

function createArrowHead(arrowHead,markupId) {
	arrowHead.setAttributeNS(null, 'viewBox', '0 0 10 10');
	arrowHead.setAttributeNS(null, 'refX', '0.1');
	arrowHead.setAttributeNS(null, 'refY', '5');
	arrowHead.setAttributeNS(null, 'markerUnits', "userSpaceOnUse");
	arrowHead.setAttributeNS(null, 'orient', 'auto');
	arrowHead.setAttributeNS(null, 'id', 'arrowhead-'+markupId);
	arrowHead.setAttributeNS(null, 'data-isi', 'annotation-'+markupId);
}

var dragged = false;
function initStartPosition(e)
{
	var drawnObject = {};
	var eTarget = (e.target.correspondingUseElement) ? e.target.correspondingUseElement : e.target; //IE & Safari use SVGElementInstance
	var drawingMode = false;
	var isWithin = false;
	var pageNumber = retrievePageNumber(eTarget);
	var viewerWrapper = $(getElement('viewer-document-wrapper'));
	var viewerChild = viewerWrapper.children(".pageContent").filter(":nth-child(" + (pageNumber) + ")");
	var pageWidth = viewerChild.width();
	var pageHeight = viewerChild.height();
	var selectedReason = documentViewer.annotationToolBox[markupTypes.RectangleRedaction].reason;

	if(isFirefox && eTarget.tagName != 'INPUT'){
		e.preventDefault();
	}
	if(pageNumber > -1)
	{
		if(pageCollection[(pageNumber-1)].isErroredPage == true) {
			return;
		}
		
		var rotateDeg = pageCollection[(pageNumber-1)].attributes.rotateDegrees;
		var check = pageCollection[pageNumber-1].svgPage;
		var transformed = convertToSVGCoordinateSpace(check,e.clientX,e.clientY);
		var startX = transformed.x;
		var startY = transformed.y;
		var h = pageCollection[pageNumber-1];
		var markupsss = h.svgMarkupGroup;
		
		drawnObject = createDrawnObject(annotationObject);
		drawnObject.setId(markupId);
		initializePreDrawProcess(annotationObject, drawnObject, markupsss, selectedReason);
		switch(rotateDeg) {

		case 0:
		case 360:
		default:

			initialX = startX;
			initialY = startY;

			break;

		case 90:

			initialX = startY;
			initialY = parseFloat(pageWidth-startX);

			break;

		case 180:

			initialX = parseFloat(pageWidth-startX);
			initialY = parseFloat(pageHeight-startY);

			break;

		case 270:

			initialX = parseFloat(pageHeight-startY);
			initialY = startX;

			break;
		}

		// for zoom
		initialX = initialX * (1/scaleFactor);
		initialY = initialY * (1/scaleFactor);
		
		drawingMode = true;

		var viewerContainer = $(getElement('viewerContainer'));
		var	viewerPortTop = parseInt(viewerContainer.position().top),
		viewerPortLeft = parseInt(viewerContainer.position().left),
		viewerPortRight = parseInt(viewerContainer.outerWidth()),
		viewerPortBottom = parseInt(viewerContainer.outerHeight());
		viewerPortBottom += viewerPortTop;
		
		if(annotationObject == markupTypes.TextHighLight || annotationObject == markupTypes.TextRedactHighlight 
				|| annotationObject == markupTypes.StrikeThrough || annotationObject == markupTypes.CollabHighlight){
			//back-layering of highlight objects
//			var drawnObjGrp = drawnObject.shapes.retrieveShapeForCalculation().parentNode;
			if(drawnObject.shapes.group){
				var drawnObjMarkupGrp = drawnObject.shapes.group.parentNode;
				if(pageCollection[(pageNumber-1)].getLastHighlightIndex() == null || pageCollection[(pageNumber-1)].getLastHighlightIndex() == undefined ){
					drawnObjMarkupGrp.insertBefore(drawnObject.shapes.group,drawnObjMarkupGrp.firstChild);
				} else {
					var lastHighlightGroup = $(drawnObject.shapes.group.parentNode.childNodes).get(pageCollection[(pageNumber-1)].getLastHighlightIndex()); //replaced children due to Safari/IE issue DV-1112
					if (lastHighlightGroup){
						if (lastHighlightGroup.nextSibling != null && lastHighlightGroup.nextSibling != drawnObject.shapes.group){
							drawnObjMarkupGrp.insertBefore(drawnObject.shapes.group,lastHighlightGroup.nextSibling);
						} else {
							drawnObjMarkupGrp.appendChild(drawnObject.shapes.group);
						}
					}
				}	
			}
		}
		
		// draw redaction/annotation on mouse move
		var mouseMove = function(e)
		{
			dragged = true;
			if(isFirefox){
				e.preventDefault();
				if(e.clientY>=(viewerPortBottom-30)) viewerContainer.scrollTop(viewerContainer.scrollTop()+30);
				else if(e.clientY<=(viewerPortTop+30)) viewerContainer.scrollTop(viewerContainer.scrollTop()-30);
				else if(e.clientX>(viewerPortRight-30)) viewerContainer.scrollLeft(viewerContainer.scrollLeft()+30);
				else if(e.clientX<=(viewerPortLeft+30)) viewerContainer.scrollLeft(viewerContainer.scrollLeft()-30);
			}
			isWithin = isMouseWithinPageBoundary(transformed, pageWidth, pageHeight);
			if (drawingMode) {

				var pt = check.createSVGPoint();
				pt.x = e.clientX;
				pt.y = e.clientY;
				transformed = pt.matrixTransform(check.getScreenCTM().inverse());
				var lastPointX = 0;
				var lastPointY = 0;
				var endX = transformed.x;
				var endY = transformed.y;

				switch(rotateDeg) {

				case 0:
				case 360:
				default:	

					lastPointX = endX;
					lastPointY = endY;

					break;

				case 90:

					lastPointX = endY;
					lastPointY = parseFloat(pageWidth-endX);

					break;

				case 180:

					lastPointX = parseFloat(pageWidth-endX);
					lastPointY = parseFloat(pageHeight-endY);

					break;

				case 270:

					lastPointX = parseFloat(pageHeight-endY);
					lastPointY = endX;

					break;
				}

				//for zoom
				endX = endX * (1/scaleFactor);
				endY = endY * (1/scaleFactor);
				lastPointX = lastPointX * (1/scaleFactor);
				lastPointY = lastPointY * (1/scaleFactor);

				var width = 0, height = 0, cx = 0, cy = 0, x = initialX, y = initialY;

				switch(rotateDeg) {

				case 0:
				case 360:
				default:	

					width = parseFloat(lastPointX-initialX);
					height = parseFloat(lastPointY-initialY);
					cx = parseFloat((lastPointX+initialX)/2);
					cy = parseFloat((lastPointY+initialY)/2);

					if(width < 0) {
						width = parseFloat(initialX-lastPointX);
						x = x - width;
					}

					if(height < 0) {
						height = parseFloat(initialY-lastPointY);
						y = y - height;
					}

					break;

				case 90:

					width = parseFloat(endY-initialX);
					height = parseFloat(lastPointY-initialY);
					cx = parseFloat((lastPointX+initialX)/2);
					cy = parseFloat((lastPointY+initialY)/2);

					if(width < 0) {
						width = parseFloat(initialX-endY);
						x = x - width;
					}

					if(height < 0) {
						height = parseFloat(initialY-lastPointY);
						y = y - height;
					}

					break;

				case 180:

					width = parseFloat(lastPointX-initialX);
					height = parseFloat(lastPointY-initialY);
					cx = parseFloat((lastPointX+initialX)/2);
					cy = parseFloat((lastPointY+initialY)/2);

					if(width < 0) {
						width = parseFloat(initialX-lastPointX);
						x = x - width;
					}

					if(height < 0) {
						height = parseFloat(initialY-lastPointY);
						y = y - height;
					}

					break;

				case 270:

					width = parseFloat(lastPointX-initialX);
					height = parseFloat(endX-initialY);
					cx = parseFloat((lastPointX+initialX)/2);
					cy = parseFloat((endX+initialY)/2);

					if(width < 0) {
						width = parseFloat(initialX-lastPointX);
						x = x - width;
					}

					if(height < 0) {
						height = parseFloat(initialY-endX);
						y = y - height;
					}

					break;
				}

				var selectedToolBox = documentViewer.annotationToolBox[annotationObject];
				switch (annotationObject) {

				case markupTypes.Circle:
					
					if(isWithin){
						var rx = parseFloat((width)/2);
						var ry = parseFloat((height)/2);

						drawnObject.setCX(cx);
						drawnObject.setCY(cy);
						drawnObject.setRX(rx);
						drawnObject.setRY(ry);
						drawnObject.setFillColor(selectedToolBox.fillColor);
						drawnObject.setBorderColor(selectedToolBox.borderColor);
						drawnObject.setBorderWeight(selectedToolBox.borderWeight);
						drawnObject.setOpacity(selectedToolBox.opacityLevelDecimal);
						//drawnObject.setId(markupId);
					}
					break;

				case markupTypes.Rectangle:
					
					if(isWithin){
						drawnObject.setX(x);
						drawnObject.setY(y);
						drawnObject.setWidth(width);
						drawnObject.setHeight(height);
						drawnObject.setFillColor(selectedToolBox.fillColor);
						drawnObject.setBorderColor(selectedToolBox.borderColor);
						drawnObject.setBorderWeight(selectedToolBox.borderWeight);
						drawnObject.setOpacity(selectedToolBox.opacityLevelDecimal);
						//drawnObject.setId(markupId);
					}
					break;
					
				case markupTypes.SearchHighlight:
					
					if(isWithin){
						drawnObject.setX(x);
						drawnObject.setY(y);
						drawnObject.setWidth(width);
						drawnObject.setHeight(height);
						drawnObject.setFillColor(defaultHighlightColor);
						drawnObject.setBorderColor(selectedToolBox.borderColor);
						drawnObject.setBorderWeight(selectedToolBox.borderWeight);
						drawnObject.setOpacity(selectedToolBox.opacityLevelDecimal);
						//drawnObject.setId(markupId);
					}
					break;

				case markupTypes.Line:
					
					if(isWithin){
						
						drawnObject.setX1(initialX);
						drawnObject.setY1(initialY);
						drawnObject.setX2(lastPointX);
						drawnObject.setY2(lastPointY);
						drawnObject.setFillColor(selectedToolBox.fillColor);
						drawnObject.setBorderWeight(selectedToolBox.borderWeight);
						drawnObject.setOpacity(selectedToolBox.opacityLevelDecimal);
						//drawnObject.setId(markupId);
					}
					break;

				case markupTypes.Arrow:
					
					if(isWithin){
						drawnObject.setX1(initialX);
						drawnObject.setY1(initialY);
						drawnObject.setX2(lastPointX);
						drawnObject.setY2(lastPointY);
						drawnObject.setCircMaskCX(lastPointX);
						drawnObject.setCircMaskCY(lastPointY);
						drawnObject.setCircMaskRX(12);
						drawnObject.setCircMaskRY(12);
						drawnObject.setFillColor(selectedToolBox.fillColor);
						drawnObject.setBorderWeight(selectedToolBox.borderWeight);
						drawnObject.setOpacity(selectedToolBox.opacityLevelDecimal);
						//drawnObject.setId(markupId);
						drawnObject.setMarkerEnd('url(#arrowhead-'+markupId+')');
						appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGArrowHead);
						appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGLine);
						appendObjectToDom(drawnObject.shapes.group, drawnObject.shapes.SVGBoundingLine);
					}
					break;					
				case markupTypes.StickyNote:
				case markupTypes.Text:
					
					if(isWithin){
						drawnObject.shapes.SVGRectangle.setAttributeNS(null, 'style', 'z-index:-1;position:absolute;');
						drawnObject.setX(x);
						drawnObject.setY(y);
						drawnObject.setWidth(width);
						drawnObject.setHeight(height);
						drawnObject.setFillColor(selectedToolBox.fillColor);
						drawnObject.setBorderColor(selectedToolBox.borderColor);
						drawnObject.setBorderWeight(selectedToolBox.borderWeight);
						drawnObject.setOpacity(selectedToolBox.opacityLevelDecimal);
						//drawnObject.setId(markupId);
						
						drawnObject.setFontColor(selectedToolBox.fontColor);
						drawnObject.setFontFamily(selectedToolBox.fontFamily);
						drawnObject.setFontSize(selectedToolBox.fontSize);
						drawnObject.setBoldStyle(selectedToolBox.boldStyle ? 'bold' : 'normal');
						drawnObject.setItalicStyle(selectedToolBox.italicStyle? 'italic' : 'normal');
						drawnObject.setUnderlineStrikeStyle((selectedToolBox.underlineStyle && selectedToolBox.strikeStyle) ? 'underline line-through' : selectedToolBox.underlineStyle ? 'underline' : selectedToolBox.strikeStyle ? 'line-through' : 'none');
						drawnObject.setHorizontalAlign(selectedToolBox.horizontalAlign);
						drawnObject.setVerticalAlign(selectedToolBox.verticalAlign);
						
						if(isIE){
							var horizontalAlignString = null, valueX = 0;
							switch(getSelectedHorizontalAlignment()){
							case 'left':
								valueX = 5;
								horizontalAlignString = "start";
								break;
							case 'center':
								valueX = parseInt(width/2);
								horizontalAlignString = "middle";
								break;
							case 'right':
								valueX = parseInt(width-5);
								horizontalAlignString = "end";
								break;
							}

							drawnObject.shapes.SVGGWrapper.setAttributeNS(null, 'transform', 'matrix(1 0 0 1 '+x+' '+y+')');
							drawnObject.setSVGTextValueX(valueX);
							drawnObject.setTextAnchor(horizontalAlignString);	
						}
					}
					break;

				case markupTypes.RectangleRedaction:
					if(isWithin){
						drawnObject.shapes.group.setAttributeNS(null, 'data-isi','redaction-'+(markupId));
						drawnObject.setX(x);
						drawnObject.setY(y);
						drawnObject.setWidth(width);
						drawnObject.setHeight(height);
						drawnObject.setFontColor('rgb(255, 255, 255)');
						drawnObject.setFillColor('rgb(0, 0, 0)');
						drawnObject.visibilityMode = visibilityMode.Shown;
						//drawnObject.setId(markupId);
						drawnObject.setOpacity(1);
						drawnObject.setText(selectedReason);
						drawnObject.rotateTextObject(rotateDeg);
/*						if(isIE)
						{
							//drawnObject.shapes.SVGGWrapper.setAttributeNS(null,'transform','matrix(1,0,0,1,'+x+','+y+')');
							//clearChildren(drawnObject.shapes.SVGText);
							//processWrapping(drawnObject.shapes.SVGText,selectedReason,15,width,markupId,(width/2));
						}
						else
						{
							drawnObject.setText(selectedReason);
						}
*/
					}
					break;
				case markupTypes.TextHighLight:
				case markupTypes.TextRedactHighlight:
				case markupTypes.StrikeThrough:
				case markupTypes.CollabHighlight:
					if(isWithin){
						var page = pageCollection[(pageNumber-1)];
						var pageTextElements = page.textElements;
						var hitIndex = checkBoundingBox(lastPointX, lastPointY, pageTextElements);
						if (firstHighlightedIndex == null){
							//set anchor point of text highlight
							firstHighlightedIndex = hitIndex;
						}
						if (hitIndex != null) {
							
							if (firstHighlightedIndex != hitIndex && highlightIdxHit.indexOf(hitIndex) < 0){
								//if stack does not contain hit boxes, initialize stack
								var lastIndexInStack = 0;
								if (highlightIdxHit.length == 0){
									lastIndexInStack = firstHighlightedIndex;
								} else {
									lastIndexInStack = highlightIdxHit[highlightIdxHit.length-1];
								}
								if (hitIndex > firstHighlightedIndex) {
									//downward selection, add increasing index to stack, considering skips
									while(hitIndex > lastIndexInStack){
										lastIndexInStack++;
										highlightIdxHit.push(lastIndexInStack);
										highlightObjStack.push(drawNextObject(annotationObject,markupId, drawnObject.shapes.group));
									}
								} else if (hitIndex < firstHighlightedIndex) {
									//upward selection add decreasing index to stack, considering skips
									while(hitIndex < lastIndexInStack){
										lastIndexInStack--;
										highlightIdxHit.push(lastIndexInStack);
										highlightObjStack.push(drawNextObject(annotationObject,markupId, drawnObject.shapes.group));
									}
								}
							}
							var anchX = pageTextElements[firstHighlightedIndex][0];
							var anchY = pageTextElements[firstHighlightedIndex][1];
							var anchWidth = pageTextElements[firstHighlightedIndex][2];
							var anchHeight = pageTextElements[firstHighlightedIndex][3];
							
							var currX = pageTextElements[hitIndex][0];
							var currY = pageTextElements[hitIndex][1];
							var currWidth = pageTextElements[hitIndex][2];
							var currHeight = pageTextElements[hitIndex][3];
							
							var fillColor = annotationObject == markupTypes.TextRedactHighlight ? defaultHighlightTextColor : selectedToolBox.fillColor;
							var lineWidth = annotationObject == markupTypes.StrikeThrough ? selectedToolBox.borderWeight : 0;
							var opacityLevelDecimal;
							if (annotationObject == markupTypes.TextHighLight || annotationObject == markupTypes.CollabHighlight) {
								opacityLevelDecimal = selectedToolBox.opacityLevelDecimal;
							} else {
								opacityLevelDecimal = defaultHighlightOpacity.replace('%','')/100;
							}
							
							if (hitIndex > firstHighlightedIndex) {
								moveHighlightObject(initialX, anchY, (anchWidth+anchX)-initialX, anchHeight, 
										fillColor, opacityLevelDecimal, drawnObject, lineWidth);
								if (highlightIdxHit.indexOf(hitIndex) > -1){
									//check if hit stack contains hitIdx
									if (highlightIdxHit[highlightIdxHit.length-1] == hitIndex) {
										//check if hitIndex is last in stack
										shiftHighlightPosition(hitIndex,highlightIdxHit,highlightObjStack,pageTextElements,fillColor,opacityLevelDecimal,lineWidth);
										moveHighlightObject(currX, currY, lastPointX-currX, currHeight, fillColor, 
												opacityLevelDecimal, highlightObjStack[highlightObjStack.length-1], lineWidth);
									} else {
										//cursor moving back to previous box, remove from stack
										while(highlightIdxHit[highlightIdxHit.length-1] != hitIndex){
											highlightIdxHit.pop();
											var elementRemove = highlightObjStack.pop();
											removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveShapeForCalculation());
										}
//										shiftHighlightPosition(lastPointX,y,hitIndex,firstHighlightedIndex,page, 
//												selectedToolBox, highlightObjStack[highlightObjStack.length-1]);
										moveHighlightObject(currX, currY, lastPointX-currX, currHeight, fillColor, 
												opacityLevelDecimal, highlightObjStack[highlightObjStack.length-1],lineWidth);
									}
								}
							} else if (hitIndex < firstHighlightedIndex) {
								moveHighlightObject(anchX, anchY, initialX-anchX, anchHeight, 
										fillColor, opacityLevelDecimal, drawnObject,lineWidth);
								if (highlightIdxHit.indexOf(hitIndex) > -1){
									//check if hit stack contains hitIdx
									if (highlightIdxHit[highlightIdxHit.length-1] == hitIndex) {
										//check if hitIndex is last in stack
										shiftHighlightPosition(hitIndex,highlightIdxHit,highlightObjStack,pageTextElements,fillColor,opacityLevelDecimal,lineWidth);
										moveHighlightObject(lastPointX, currY, (currWidth+currX)-lastPointX, currHeight, fillColor, 
												opacityLevelDecimal, highlightObjStack[highlightObjStack.length-1],lineWidth);
									} else {
										//cursor moving back to previous box, remove from stack
										while(highlightIdxHit[highlightIdxHit.length-1] != hitIndex){
											highlightIdxHit.pop();
											var elementRemove = highlightObjStack.pop(); 
											removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveShapeForCalculation());
										}
//										shiftHighlightPosition(lastPointX,y,hitIndex,firstHighlightedIndex,page, 
//												selectedToolBox, highlightObjStack[highlightObjStack.length-1]);
										moveHighlightObject(lastPointX, currY, (currWidth+currX)-lastPointX, currHeight, fillColor, 
												opacityLevelDecimal, highlightObjStack[highlightObjStack.length-1],lineWidth);
									}
									
								}
							} else {
								if(checkBoundingBox(x, anchY, pageTextElements) != null) {
									moveHighlightObject(x, anchY, width, anchHeight, fillColor, opacityLevelDecimal,drawnObject,lineWidth);
								} else {
									moveHighlightObject(anchX, anchY, lastPointX-anchX, anchHeight, fillColor, opacityLevelDecimal,drawnObject,lineWidth);
								}
								if (highlightIdxHit.length > 0){
									highlightIdxHit.pop();
									var elementRemove = highlightObjStack.pop();
									removeObjectFromDom(elementRemove.shapes.group, elementRemove.shapes.retrieveShapeForCalculation());	
								}
							}
						}
					}
					break;
				}
				
				readyToDraw = false;
			}
		};
		var drawComplete =  function finish() {
			if (!dragged){
				//prevent adding element to DOM
				var selDrawnObjectGrp = drawnObject.shapes.group.parentNode;
				selDrawnObjectGrp.removeChild(drawnObject.shapes.group);
				
				document.removeEventListener( "mousedown", initStartPosition, false );
				document.removeEventListener( "mousemove", mouseMove, false );
				document.removeEventListener( "mouseup", finish, false );
				reenableDrawing(annotationObject);
				if (currentlySelectedAnnotation(annotationObject).getAttribute("id")=="addText"){
					var addText = $('#addText');
					addText.mouseup();
				}
				return;
			}
			
			if(isFirefox){
				e.preventDefault();
			}
			drawnObject.attributes.createdByUserId = documentViewer.userId;
			lastHighlightedIndex = null;
			if (annotationObject != markupTypes.TextHighLight && annotationObject != markupTypes.TextRedactHighlight && annotationObject != markupTypes.StrikeThrough
					&& annotationObject != markupTypes.CollabHighlight){
				//do not include snap to drag since it wont be dragged but resized only
				attachSnapToDrag(drawnObject.shapes.group);
			}
			else{
				viewerWrapper.removeClass('text-cursor');
			}
			if(tempId != markupId && !readyToDraw) {				
				if (annotationObject != markupTypes.TextHighLight && annotationObject != markupTypes.TextRedactHighlight && annotationObject != markupTypes.StrikeThrough
						&& annotationObject != markupTypes.CollabHighlight){
					pageCollection[pageNumber-1].addMarkupObject(drawnObject);
					var drawnObjectIndex = pageCollection[pageNumber-1].markups.indexOf(drawnObject);
				} else {
					var hlMarkupObject = {};
					var lastHlHit = highlightIdxHit[highlightIdxHit.length-1] ? highlightIdxHit[highlightIdxHit.length-1] : firstHighlightedIndex;
					highlightObjStack.splice(0,0,drawnObject);
					if(annotationObject == markupTypes.TextRedactHighlight){
						var colLen = highlightObjStack.length;
						for (var i = 0; i < colLen; i++){
							highlightObjStack[i].setFontColor('rgb(255, 255, 255)');
							highlightObjStack[i].setFillColor('rgb(0, 0, 0)');
							highlightObjStack[i].visibilityMode = visibilityMode.Shown;
							highlightObjStack[i].setOpacity(1);
							highlightObjStack[i].setText(selectedReason);
							highlightObjStack[i].rotateTextObject(rotateDeg);
						}
					}
					if (firstHighlightedIndex <= lastHlHit) {
						hlMarkupObject.drawnObjectCollection = highlightObjStack;
					} else if (firstHighlightedIndex > lastHlHit) {
						hlMarkupObject.drawnObjectCollection = highlightObjStack.reverse();
					}
					hlMarkupObject.attributes = highlightObjStack[0].attributes;
					hlMarkupObject.id = highlightObjStack[0].id;
					hlMarkupObject.markupType = annotationObject;
					hlMarkupObject.shapes = highlightObjStack[0].shapes;
					pageCollection[pageNumber-1].addMarkupObject(hlMarkupObject);
					pageCollection[pageNumber-1].setLastHighlightIndex($(hlMarkupObject.shapes.group).index());
				}
				
				if (annotationObject == markupTypes.Text || annotationObject == markupTypes.StickyNote) {
					showTextArea(drawnObject.shapes.SVGRectangle);
				}else if(annotationObject == markupTypes.RectangleRedaction) {
					//RM: change function call redaction transparency
//					showHideRedactedFileContent(drawnObject, pageNumber);
					attachDrawFinishFunction(drawnObject);
				}else if (annotationObject == markupTypes.TextRedactHighlight){
					var lenStack = highlightObjStack.length;
					for (var i = 0; i<lenStack; i++){
						//RM: change function call redaction transparency
//						showHideRedactedFileContent(highlightObjStack[i], pageNumber);
						attachDrawFinishFunction(highlightObjStack[i]);
					}
				}
				firstHighlightedIndex = null;
				highlightIdxHit = [];
				highlightObjStack = [];
				tempId = markupId;
			}
			
			drawingMode = false;
			
			if (!readyToDraw) {
				document.removeEventListener( "mousedown", initStartPosition, false );
			}
			document.removeEventListener( "mousemove", mouseMove, false );
			document.removeEventListener( "mouseup", finish, false );
			
			deactivateAnnotation();
			//check pan tool lastState
			var handTool = $(getElement('page-handtool'));
			if(handTool.data('laststate') == true){
				handTool.data('drag','enable').addClass('selected-tool');
				viewerWrapper.dragScroll();
			}
		
			if(annotationObject == markupTypes.StrikeThrough || annotationObject == markupTypes.CollabHighlight){
				drawnObject.setComment(commentToArray($('#commentField').val()));
			}
			reenableDrawing(annotationObject);
			$('#commentField').val('');
		};
		document.addEventListener( "mousemove", mouseMove, false );
		document.addEventListener( "mouseup", drawComplete , false );
		
	}
}

function drawNextObject(markupType,markupId,shapeGroup){
	var hlObject = {};
	hlObject = createDrawnObject(markupType,shapeGroup);
	hlObject.setId(markupId);
	initializePreDrawProcess(markupType,hlObject,shapeGroup.parentNode,"",undefined,true);
	return hlObject;
}

function moveHighlightObject(x, y, width, height, fill, opacity, drawnObject,lineWidth){
	if (drawnObject.markupType == markupTypes.StrikeThrough){
		drawnObject.setX1(x);
		drawnObject.setX2(x+width);
		drawnObject.setY(y+(height/2));
		drawnObject.setRectY(y);
		drawnObject.setWidth(width);
		drawnObject.setHeight(height);
		drawnObject.setFillColor(fill);
		drawnObject.setBorderWeight(lineWidth);
	} else {
		drawnObject.setX(x);
		drawnObject.setY(y);
		drawnObject.setWidth(width);
		drawnObject.setHeight(height);
		drawnObject.setFillColor(fill);
		drawnObject.setOpacity(opacity);	
	}
}

function shiftHighlightPosition(currHitIdx,idxStack,highlightObjStack,pageTextElements,fillColor,opacityLevelDecimal,lineWidth) {
	//check if passed boxes have been highlighted
	if (idxStack.length > 1){
		var idxCounter = highlightObjStack.length-1;
		var pageTextIdx = idxStack[idxCounter];
		var pageTextCoords = pageTextElements[pageTextIdx];
		var refWidth;
		switch (highlightObjStack[idxCounter].markupType) {
		case markupTypes.StrikeThrough:
			refWidth = highlightObjStack[idxCounter].attributes.x2 - highlightObjStack[idxCounter].attributes.x1;
			break;
		case markupTypes.TextHighLight:
		case markupTypes.CollabHighlight:	
		case markupTypes.TextRedactHighlight:
			refWidth = highlightObjStack[idxCounter].attributes.width;
			break;
		}
		while (idxCounter >= 0 && refWidth < pageTextCoords[2]){
			if (currHitIdx != pageTextIdx)
				moveHighlightObject(pageTextCoords[0],pageTextCoords[1],pageTextCoords[2],pageTextCoords[3],
						fillColor,opacityLevelDecimal,highlightObjStack[idxCounter],lineWidth);
			idxCounter--;
			pageTextIdx = idxStack[idxCounter];
			pageTextCoords = pageTextElements[pageTextIdx]
		}	
	}
} 

function reenableDrawing(drawingObject){
	readyToDraw = false;
	
	var currentSelection = currentlySelectedAnnotation(drawingObject);
	
	if (currentSelection != null) {
		if (currentSelection.getAttribute("id") == "addText"){
			if ($(currentSelection).hasClass("on")){
				viewerWrapper.addClass('cursorCrosshair');
				
				var textArea = document.getElementById('textAreaContainer');
				if ($(textArea).css("display") == "none"){
					var annotateBox = $(getElement('viewer-annotateBox'));
					annotateBox.css('display','block');
				}
			}
		} else {
			reenableAnnotation($(currentSelection));
		}
		
		dragged = false;
	}
}

function reenableAnnotation(annotationType) {
	if ($(annotationType).hasClass("on")){
		annotationType.mouseup();
	} else if ($(annotationType).hasClass("off")){
		$(annotationType).removeClass('selected-tool');
		$(annotationType).toggleClass("off mute");
	}
}

function attachSnapToDrag(markupGroup) {
	if(!documentViewer.isRestrictAnnFn){
		removeSnapToDrag(markupGroup);
		var viewerWrapper = $(getElement('viewer-document-wrapper'));
		var snapAnnotationGroup = new Snap(markupGroup);
		snapAnnotationGroup.drag();
		viewerWrapper.removeClass('cursorCrosshair');
		snapAnnotationGroup.drag(function(){
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
}

function removeSnapToDrag(markupGroup) {
	var snapAnnotationGroup = new Snap(markupGroup);
	snapAnnotationGroup.undrag();
}
//RM: change function call redaction transparency
//function showHideRedactedFileContent(drawnObject, pageNumber) {
//	if(isIE)
//	{
//		drawnObject.resetViewable = function()
//		{
//			var UDV_id = drawnObject.shapes.SVGText.getAttributeNS(null, 'data-isi');
//			var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
//			var udvPage = pageCollection[pageNumber-1];
//			var redactionObj = udvPage.retrieveMarkObjectInPage(markIdSelected);
//			var opacity = (redactionObj.visibilityMode === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
//			redactionObj.shapes.SVGRectangle.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
//			redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill','rgba(0, 0, 0, ' + opacity + ')');
//			
//			redactionObj.shapes.SVGText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
//			redactionObj.shapes.SVGText.style.fill = 'rgba(255, 255, 255, ' + opacity + ')';
//		};
//		drawnObject.shapes.SVGText.addEventListener('mouseover',function(e){
//			var UDV_id = this.getAttributeNS(null, 'data-isi');
//			var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
//			var udvPage = pageCollection[pageNumber-1];
//			if(!udvPage.isMarkupSelected(markIdSelected)) {
//				var redactionObj = udvPage.retrieveMarkObjectInPage(markIdSelected);
//				redactionObj.shapes.SVGRectangle.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=20)';
//				redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill','rgba(0, 0, 0, 0.2)');
//				
//				redactionObj.shapes.SVGText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';
//				redactionObj.shapes.SVGText.style.fill = 'rgba(255, 255, 255, 0)';
//			}
//		},false);
//		
//		drawnObject.shapes.SVGText.addEventListener('mouseout',function(e){
//			var UDV_id = this.getAttributeNS(null, 'data-isi');
//			var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
//			var udvPage = pageCollection[pageNumber-1];
//			var redactionObj = udvPage.retrieveMarkObjectInPage(markIdSelected);
//			var opacity = (redactionObj.visibilityMode === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
//			redactionObj.shapes.SVGRectangle.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=20)';
//			redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill','rgba(0, 0, 0, ' + opacity + ')');
//			
//			redactionObj.shapes.SVGText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
//			redactionObj.shapes.SVGText.style.fill = 'rgba(255, 255, 255, ' + opacity + ')';
//		},false);
//
//		drawnObject.shapes.SVGRectangle.addEventListener('mouseover',function(e){
//			var UDV_id = this.getAttributeNS(null, 'data-isi');
//			var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
//			var udvPage = pageCollection[pageNumber-1];
//			if(!udvPage.isMarkupSelected(markIdSelected)){
//				var redactionObj = udvPage.retrieveMarkObjectInPage(markIdSelected);
//				redactionObj.shapes.SVGRectangle.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=20)';
//				redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill','rgba(0, 0, 0, 0.2)');
//				
//				redactionObj.shapes.SVGText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';
//				redactionObj.shapes.SVGText.style.fill = 'rgba(255, 255, 255, 0)';
//			}
//		},false);
//		
//		drawnObject.shapes.SVGRectangle.addEventListener('mouseout',function(e){
//			var UDV_id = this.getAttributeNS(null, 'data-isi');
//			var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
//			var udvPage = pageCollection[pageNumber-1];
//			var redactionObj = udvPage.retrieveMarkObjectInPage(markIdSelected);
//			var opacity = (redactionObj.visibilityMode === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
//			redactionObj.shapes.SVGRectangle.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=20)';
//			redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill','rgba(0, 0, 0, ' + opacity + ')');
//
//			redactionObj.shapes.SVGText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
//			redactionObj.shapes.SVGText.style.fill = 'rgba(255, 255, 255, ' + opacity + ')';
//		},false);
//	}
//	else //Non-IE
//	{
//		drawnObject.resetViewable = function()
//		{
//			var UDV_id = drawnObject.shapes.divText.getAttributeNS(null, 'data-isi');
//			var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
//			var udvPage = pageCollection[pageNumber-1];
////			var redactionObj = udvPage.retrieveMarkObjectInPage(markIdSelected);
////			var opacity = (redactionObj.visibilityMode === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
////			redactionObj.shapes.divText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
////			redactionObj.shapes.divText.style.color = 'rgba(255, 255, 255, ' + opacity + ')';
////			if(isSafari) {
////				redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill-opacity',opacity);
////			} else {
////				redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill','rgba(0, 0, 0, ' + opacity + ')');
////			}
//			var opacity = (this.visibilityMode === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
//			this.shapes.divText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
//			this.shapes.divText.style.color = 'rgba(255, 255, 255, ' + opacity + ')';
//			if(isSafari) {
//				this.setShapeAttribute(this.shapes.SVGRectangle,'fill-opacity',opacity);
//			} else {
//				this.setShapeAttribute(this.shapes.SVGRectangle,'fill','rgba(0, 0, 0, ' + opacity + ')');
//			}
//		};
//								
//		drawnObject.shapes.divText.addEventListener('mouseover',function(e){
//			var UDV_id = this.getAttributeNS(null, 'data-isi');
//			var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
//			var udvPage = pageCollection[pageNumber-1];
//			if(!udvPage.isMarkupSelected(markIdSelected))
//			{
////				var redactionObj = udvPage.retrieveMarkObjectInPage(markIdSelected);
////				redactionObj.shapes.divText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';
////				redactionObj.shapes.divText.style.color = 'rgba(255, 255, 255, 0)';
////				if(isSafari) {
////					redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill-opacity','0.2');
////				} else {
////					redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill','rgba(0, 0, 0, 0.2)');					
////				}
//				this.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';
//				this.style.color = 'rgba(255, 255, 255, 0)';
//				if(isSafari) {
//					this.drawObjRef.shapes.SVGRectangle.setAttributeNS(null, 'fill-opacity', '0.2');
//				} else {	
//					this.drawObjRef.shapes.SVGRectangle.setAttributeNS(null, 'fill', 'rgba(0, 0, 0, 0.2)');
//				}
//			}
//		},false);
//		
//		drawnObject.shapes.divText.addEventListener('mouseout',function(e){
//			var UDV_id = this.getAttributeNS(null, 'data-isi');
//			var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
//			var udvPage = pageCollection[pageNumber-1];
////			var redactionObj = udvPage.retrieveMarkObjectInPage(markIdSelected);
////			var opacity = (redactionObj.visibilityMode === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
////			redactionObj.shapes.divText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
////			redactionObj.shapes.divText.style.color = 'rgba(255, 255, 255, ' + opacity + ')';
////			if(isSafari) {
////				redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill-opacity',opacity);
////			} else {
////				redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill','rgba(0, 0, 0, ' + opacity + ')');				
////			}
//			var opacity = (this.drawObjRef.visibilityMode === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
//			this.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
//			this.style.color = 'rgba(255, 255, 255, ' + opacity + ')';
//			if(isSafari) {
//				this.drawObjRef.shapes.SVGRectangle.setAttributeNS(null, 'fill-opacity', opacity);
//			} else {	
//				this.drawObjRef.shapes.SVGRectangle.setAttributeNS(null, 'fill', 'rgba(0, 0, 0, ' + opacity + ')');
//			}
//		},false);
//		
//		drawnObject.shapes.SVGRectangle.addEventListener('mouseout',function(e){
//			var UDV_id = this.getAttributeNS(null, 'data-isi');
//			var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
//			var udvPage = pageCollection[pageNumber-1];
////			var redactionObj = udvPage.retrieveMarkObjectInPage(markIdSelected);
////			var opacity = (redactionObj.visibilityMode === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
////			redactionObj.shapes.divText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
////			redactionObj.shapes.divText.style.color = 'rgba(255, 255, 255, ' + opacity + ')';
////			if(isSafari) {
////				redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill-opacity',opacity);
////			} else{
////				redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill','rgba(0, 0, 0, ' + opacity + ')');				
////			}
//			var opacity = (this.drawObjRef.visibilityMode === visibilityMode.Transparent) ? visibilityMode.Transparent : visibilityMode.Shown;
//			this.drawObjRef.shapes.divText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity*100) +')';
//			this.drawObjRef.shapes.divText.style.color = 'rgba(255, 255, 255, ' + opacity + ')';
//			if(isSafari) {
//				this.drawObjRef.shapes.SVGRectangle.setAttributeNS(null, 'fill-opacity', opacity);
//			} else{
//				this.drawObjRef.shapes.SVGRectangle.setAttributeNS(null, 'fill', 'rgba(0, 0, 0, ' + opacity + ')');
//			}
//		},false);
//		
//		drawnObject.shapes.SVGRectangle.addEventListener('mouseover',function(e){
//			var UDV_id = this.getAttributeNS(null, 'data-isi');
//			var markIdSelected = parseInt(UDV_id.substring(UDV_id.indexOf('-')+1,UDV_id.length));
//			var udvPage = pageCollection[pageNumber-1];
//			if(!udvPage.isMarkupSelected(markIdSelected))
//			{
////				var redactionObj = udvPage.retrieveMarkObjectInPage(markIdSelected);
////				redactionObj.shapes.divText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';
////				redactionObj.shapes.divText.style.color = 'rgba(255, 255, 255, 0)';
////				if(isSafari) {
////					redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill-opacity','0.2');
////				} else {
////					redactionObj.setShapeAttribute(redactionObj.shapes.SVGRectangle,'fill','rgba(0, 0, 0, 0.2)');					
////				}
//				this.drawObjRef.shapes.divText.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';
//				this.drawObjRef.shapes.divText.style.color = 'rgba(255, 255, 255, 0)';
//				if(isSafari) {
//					this.drawObjRef.shapes.SVGRectangle.setAttributeNS(null, 'fill-opacity', '0.2');
//				} else {
//					this.drawObjRef.shapes.SVGRectangle.setAttributeNS(null, 'fill', 'rgba(0, 0, 0, 0.2)');
//				}
//			}
//		},false);
//	}
//}

/* For Annotaion Attribute
*/				
function getSelectedOpacity(id_param){
	return (document.getElementById(id_param).innerHTML.replace('%','')) / 100;
}

function getSelectedColor(id_param){
	var selectedElement = document.getElementById(id_param);
	var bg = selectedElement.style.background;
	var colorSelected;
	//if(bg.indexOf('nofill')>-1)
	if(bg.indexOf('rgba(176, 176, 176, 0)')>-1)
		colorSelected = 'transparent';
	else
		colorSelected = selectedElement.style.backgroundColor;
	return colorSelected;
}

function getSelectedWidth(id_param){
	return document.getElementById(id_param).innerHTML;
}

function applyStamp(text){
	
	var selectedToolBox = documentViewer.annotationToolBox[annotationObject];
	//readyToDraw = true;
	transferTextAreaValuetoDiv(lastSelectedDivReason);
	//document.addEventListener("mousedown", initStartPosition, false);
	lastSelectedDivReason = null;
	lastDrawnDivReason = null;
	markupId++;
	
	var drawnObject = {};
	var pageNumber = parseInt($('.current-page').val());
	var udvPage = pageCollection[pageNumber-1];
	var pageWidth = udvPage.attributes.pageWidth;
	var pageHeight = udvPage.attributes.pageHeight;
	var markupsss = udvPage.svgMarkupGroup;
	var selectedReason = documentViewer.annotationToolBox[markupTypes.RectangleRedaction].reason;
	var stampPosition = $('input[name=position]:checked').val();
	
	if(pageCollection[(pageNumber-1)].isErroredPage == true) {
		return;
	}
	
	drawnObject = createDrawnObject(annotationObject);
	drawnObject.setId(markupId);
	initializePreDrawProcess(annotationObject, drawnObject, markupsss, selectedReason);
	
	
	drawnObject.setOpacity(selectedToolBox.opacityLevelDecimal);
	drawnObject.setFontColor(selectedToolBox.fontColor);
	drawnObject.setFontFamily(selectedToolBox.fontFamily);
	drawnObject.setFontSize(selectedToolBox.fontSize);
	drawnObject.setBoldStyle(selectedToolBox.boldStyle ? 'bold' : 'normal');
	drawnObject.setItalicStyle(selectedToolBox.italicStyle? 'italic' : 'normal');
	drawnObject.setUnderlineStrikeStyle((selectedToolBox.underlineStyle && selectedToolBox.strikeStyle) ? 'underline line-through' : selectedToolBox.underlineStyle ? 'underline' : selectedToolBox.strikeStyle ? 'line-through' : 'none');
	drawnObject.setStampText(text);
	drawnObject.attributes.createdByUserId = documentViewer.userId;
	
	drawnObject.setX(getX(stampPosition, pageWidth, drawnObject.getStampWidth()));
	drawnObject.setY(getY(stampPosition, pageHeight, drawnObject.getStampHeight(),annotationObject));
	
	drawnObject.setWidth(drawnObject.getStampWidth());
	drawnObject.setHeight(drawnObject.getStampHeight());
	
	pageCollection[pageNumber-1].addMarkupObject(drawnObject);
	//attachSnapToDrag(drawnObject.shapes.group);
	$(getElement('closeRedact')).click();
	$(getElement('closeAnnotateBox')).click();
	//drawnObject.getW();
	
}

function applyStickyNote(){
	//readyToDraw = true;
	var selectedToolBox = documentViewer.annotationToolBox[annotationObject];
	
	transferTextAreaValuetoDiv(lastSelectedDivReason);
	//document.addEventListener("mousedown", initStartPosition, false);
	lastSelectedDivReason = null;
	lastDrawnDivReason = null;
	markupId++;
	
	var drawnObject = {};
	
	var pageNumber = parseInt($('.current-page').val()); // get page for stamp application
	var selectedReason = documentViewer.annotationToolBox[markupTypes.RectangleRedaction].reason;
	var notePosition = $('input[name=position]:checked').val();
	var udvPage = pageCollection[pageNumber-1];
	var pageWidth = udvPage.attributes.pageWidth;
	var pageHeight = udvPage.attributes.pageHeight;
	var markupsss = udvPage.svgMarkupGroup;
	var noteHeight = 180;
	var noteWidth = 180;
	
	if(pageCollection[(pageNumber-1)].isErroredPage == true) {
		return;
	}
	drawnObject = createDrawnObject(annotationObject);
	drawnObject.setId(markupId);
	initializePreDrawProcess(annotationObject, drawnObject, markupsss, selectedReason);
	
	drawnObject.shapes.SVGRectangle.setAttributeNS(null, 'style', 'z-index:-1;position:absolute;');
	
	drawnObject.setX(getX(notePosition, pageWidth, noteWidth));
	drawnObject.setY(getY(notePosition, pageHeight, noteHeight, annotationObject));
	drawnObject.setWidth(noteWidth);
	drawnObject.setHeight(noteHeight);
	drawnObject.setFillColor(selectedToolBox.fillColor);
	//drawnObject.setBorderColor(selectedToolBox.borderColor);
	//drawnObject.setBorderWeight(selectedToolBox.borderWeight);
	drawnObject.setOpacity(selectedToolBox.opacityLevelDecimal);
	//drawnObject.setId(markupId);
	
	drawnObject.setFontColor(selectedToolBox.fontColor);
	drawnObject.setFontFamily(selectedToolBox.fontFamily);
	drawnObject.setFontSize(selectedToolBox.fontSize);
	drawnObject.setBoldStyle(selectedToolBox.boldStyle ? 'bold' : 'normal');
	drawnObject.setItalicStyle(selectedToolBox.italicStyle? 'italic' : 'normal');
	drawnObject.setUnderlineStrikeStyle((selectedToolBox.underlineStyle && selectedToolBox.strikeStyle) ? 'underline line-through' : selectedToolBox.underlineStyle ? 'underline' : selectedToolBox.strikeStyle ? 'line-through' : 'none');
	drawnObject.setHorizontalAlign(selectedToolBox.horizontalAlign);
	//drawnObject.setVerticalAlign(selectedToolBox.verticalAlign);
	
	if(isIE){
		var horizontalAlignString = null, valueX = 0;
		switch(getSelectedHorizontalAlignment()){
		case 'left':
			valueX = 5;
			horizontalAlignString = "start";
			break;
		case 'center':
			valueX = parseInt(width/2);
			horizontalAlignString = "middle";
			break;
		case 'right':
			valueX = parseInt(width-5);
			horizontalAlignString = "end";
			break;
		}

		drawnObject.shapes.SVGGWrapper.setAttributeNS(null, 'transform', 'matrix(1 0 0 1 '+x+' '+y+')');
		drawnObject.setSVGTextValueX(valueX);
		drawnObject.setTextAnchor(horizontalAlignString);	
		
	}
	
	pageCollection[pageNumber-1].addMarkupObject(drawnObject);
	drawnObject.attributes.createdByUserId = documentViewer.userId;
	
	$("#textAreaContainer").val("This is a Default Note");
	showStickyTextArea(drawnObject.shapes.SVGRectangle);
	attachSnapToDrag(drawnObject.shapes.group);
	transferTextAreaValuetoDiv(lastSelectedDivReason);
	
	
	
	$(getElement('closeRedact')).click();
	$(getElement('closeAnnotateBox')).click();
	
}

function applyImageData(){
	
	var selectedToolBox = documentViewer.annotationToolBox[annotationObject];
	//readyToDraw = true;
	transferTextAreaValuetoDiv(lastSelectedDivReason);
	//document.addEventListener("mousedown", initStartPosition, false);
	lastSelectedDivReason = null;
	lastDrawnDivReason = null;
	markupId++;
	
	var drawnObject = {};
	var pageNumber = parseInt($('.current-page').val());
	var selectedReason = documentViewer.annotationToolBox[markupTypes.RectangleRedaction].reason;
	var imagePosition = $('input[name=position]:checked').val();
	var udvPage = pageCollection[pageNumber-1];
	var pageWidth = udvPage.attributes.pageWidth;
	var pageHeight = udvPage.attributes.pageHeight;
	var markupsss = udvPage.svgMarkupGroup;
	var imageHeight = 180;
	var imageWidth = 200;
	 
	if(pageCollection[(pageNumber-1)].isErroredPage == true) {
		return;
	}
	
	drawnObject = createDrawnObject(annotationObject);
	drawnObject.setId(markupId);
	initializePreDrawProcess(annotationObject, drawnObject, markupsss, selectedReason);
	
	drawnObject.attributes.createdByUserId = documentViewer.userId;
	drawnObject.setWidth(imageWidth);
	drawnObject.setHeight(imageHeight);	
	drawnObject.setX(getX(imagePosition, pageWidth, imageWidth));
	drawnObject.setY(getY(imagePosition, pageHeight, imageHeight, annotationObject));
	drawnObject.setImageData($('#imagePreview').attr('src'));
	
	drawnObject.setOpacity(selectedToolBox.opacityLevelDecimal);
	
	pageCollection[pageNumber-1].addMarkupObject(drawnObject);
//	attachSnapToDrag(drawnObject.shapes.group);
	$(getElement('closeRedact')).click();
	$(getElement('closeAnnotateBox')).click();
}


function getX(position, pageWidth, elemenWidth){

	var retval = null;

	switch(position){
		case "topLeft" :
		case "bottomLeft" :
			retval = 20;
			break;
		case "topRight" :
		case "bottomRight" :
			retval = parseInt(pageWidth) - elemenWidth - 20; 
			break;
	}
	return retval;
}

function getY(position, pageHeight, elementHeight, annotationObject) {

	var retval = null;
	if (annotationObject === markupTypes.StickyNote||annotationObject === markupTypes.Image) {
		switch (position) {
		case "topLeft":
		case "topRight":
			retval = 20;
			break;
		case "bottomLeft":
		case "bottomRight":
			retval = parseInt(pageHeight) - elementHeight - 20;
			break;
		}
	} else if (annotationObject === markupTypes.Stamp) {
		switch (position) {
		case "topLeft":
		case "topRight":
			retval = elementHeight + 20;
			break;
		case "bottomLeft":
		case "bottomRight":
			retval = parseInt(pageHeight) -20;
			break;
		}

	}
	return retval;
}


