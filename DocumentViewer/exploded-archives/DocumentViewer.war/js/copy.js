$("#textSelection").on("click.copy", function(e){
	
	if ($(this).hasClass("active-state")){ //disable text selection copy
		disableCopy();
	} else { //enable text selection copy
		$(document).on("keydown.copy", attachKeyDown);
		for (var i = 0; i < pageCollection.length; i++){
			var page = document.getElementById(pageCollection[i].attributes.id);
			enableMouseEvents(page);
		}
	}
	
	function enableMouseEvents(element){
		
		var characterData = null;
		var startRowIndex = null;
		var firstC = null;
		var lastRowHitIndex = null;
		var lastC = firstC;
		
		$(element).on("mousedown.copy", function (e) {
			if (!$("#textSelection").hasClass("active-state")){
				disableCopy();
				return;
			}
			
			if (e.which == 3){
				$(this).off("mousemove.copy");
				$(this).off("mouseup.copy");
				return;
			}
			
			//getCurrentPage
			var eTarget = (e.target.correspondingUseElement) ? e.target.correspondingUseElement : e.target; 
			var pageNumber = retrievePageNumber(eTarget);
			var container = $(element).find("g[data-isi^='markups']"); //get the container for markups
			var mouseDown = true;
			
			var viewerChild = viewerWrapper.children(".pageContent").filter(":nth-child(" + (pageNumber) + ")");
			var pageWidth = viewerChild.width();
			var pageHeight = viewerChild.height();
			var rotateDeg = pageCollection[(pageNumber-1)].attributes.rotateDegrees;
			
			//get current mouse coordinate
			var transformed = convertToSVGCoordinateSpace(pageCollection[pageNumber-1].svgPage, e.clientX, e.clientY);
			var startX = transformed.x;
		    var startY = transformed.y;
		    var convertedCoordinates = rotatedCoordinates(rotateDeg, startX, startY, pageWidth, pageHeight);
		    startX = convertedCoordinates.x * (1/scaleFactor);
		    startY = convertedCoordinates.y * (1/scaleFactor);
			
			//get character data [{rowX, rowY, rowWidth, rowHeight, data:[{x,y,w,h,c}, ...]},...]
			characterData = getCharacterData(pageNumber);
			
			var gHighlight = document.createElementNS(svgNamespace, "g"); 
			gHighlight.setAttribute("style", "display: block;");
			gHighlight.setAttribute("class", "copyGroup");
			
			for(var i = 0; i < pageCollection.length; i++){
				var list = pageCollection[i].svgMarkupGroup;
				if (list != undefined && list.childNodes.length != 0){
					for (var x = 0; x < list.childNodes.length; x++){
						if (list.childNodes[x].getAttribute("class") == "copyGroup"){
							list.removeChild(list.childNodes[x]);
						}
					}
				}
			}
			
			$("#dummy").remove();
			
			//create all rows for a page with zero width
			for (var i = 0; i < characterData.length; i++){
				var rowArea = characterData[i];
				var rowX = rowArea.rowX;
				var rowY = rowArea.rowY;
				var rowWidth = 0;
				var rowHeight = rowArea.rowHeight;
				
				var rect = drawRect(rowX, rowY, rowWidth, rowHeight);
				gHighlight.appendChild(rect);
			}
			$(container).prepend(gHighlight);
			
			var rectArray = document.getElementsByClassName("forCopy");
			startRowIndex = isWithinRowArea(startX, startY, characterData);
			firstC = findCharacter(startX, startY, startRowIndex, characterData);
			lastRowHitIndex = startRowIndex;
			
			$(this).on("mousemove.copy",function (e) {
				if (mouseDown){
					//Moving cursor coordinates
					var transformed = convertToSVGCoordinateSpace(pageCollection[pageNumber-1].svgPage, e.clientX, e.clientY);
					var endX = transformed.x;
					var endY = transformed.y;
					var endCoordinates = rotatedCoordinates(rotateDeg, endX, endY, pageWidth, pageHeight);
					
					endX = endCoordinates.x * (1/scaleFactor);
					endY = endCoordinates.y * (1/scaleFactor);
					
					if (startRowIndex == null || firstC == null){
						startRowIndex = isWithinRowArea(endX, endY, characterData);
						firstC = findCharacter(endX, endY, startRowIndex, characterData);
						lastRowHitIndex = startRowIndex;
						lastC = firstC;
					} else {
						var endRowIndex = isWithinRowArea(endX, endY, characterData);
						
						if (endRowIndex != null){
							lastC = findCharacter(endX, endY, endRowIndex, characterData);
							resetAllRectWidth(rectArray);
							
							if (lastC != null){
								if(startRowIndex == endRowIndex){ // if cursor is currently on same row as start
									if(lastC.x > firstC.x){ 
										rectArray[startRowIndex].setAttribute("x", firstC.x);
										rectArray[startRowIndex].setAttribute("width", Math.abs(lastC.x - firstC.x) + lastC.w);
									} else if (lastC.x < firstC.x){ 
										rectArray[startRowIndex].setAttribute("x", lastC.x);
										rectArray[startRowIndex].setAttribute("width", Math.abs(lastC.x - firstC.x) + firstC.w);
									} else {
										rectArray[startRowIndex].setAttribute("x", firstC.x);
										rectArray[startRowIndex].setAttribute("width", firstC.w);
									}
									
								} else if (endRowIndex > startRowIndex){
									
									var startRow = characterData[startRowIndex];
									var startRowRect = rectArray[startRowIndex];
									startRowRect.setAttribute("x", firstC.x);
									startRowRect.setAttribute("width", Math.abs(startRow.rowWidth - (firstC.x - startRow.rowX)));
									for (var i = startRowIndex+1; i < endRowIndex; i++){
										rectArray[i].setAttribute("x", characterData[i].rowX);
										rectArray[i].setAttribute("width", characterData[i].rowWidth);
									}
									rectArray[endRowIndex].setAttribute("width", (Math.abs(lastC.x  - characterData[endRowIndex].rowX) + lastC.w));
									
								} else if (endRowIndex < startRowIndex) {
									var endRow = characterData[startRowIndex];
									var endRowRect = rectArray[startRowIndex];
									endRowRect.setAttribute("x", endRow.rowX);
									endRowRect.setAttribute("width", Math.abs(firstC.x - endRow.rowX) + firstC.w);
									for (var i = endRowIndex+1; i < startRowIndex; i++){
										rectArray[i].setAttribute("x", characterData[i].rowX);
										rectArray[i].setAttribute("width", characterData[i].rowWidth);
									}
									rectArray[endRowIndex].setAttribute("x", lastC.x);
									rectArray[endRowIndex].setAttribute("width", Math.abs(characterData[endRowIndex].rowWidth - (lastC.x - characterData[endRowIndex].rowX)));
								}
								lastRowHitIndex = endRowIndex;
							}
							
							
						} else {
							//TODO selection if cursor didn't hit any rows.
						}
					}
				}
			}).on("mouseup.copy",function () {
				mouseDown = false;
				$(this).off("mousemove.copy");
				var selectedRectArray;
				if (startRowIndex != null && lastRowHitIndex != null){
					selectedRectArray = $(".forCopy").filter(function(){
						return $(this).attr("width") > 0;
					});
					var startRow = selectedRectArray[0];
					var endRow = selectedRectArray[selectedRectArray.length -1];
					
					$("#dummy").remove();
					var textArea = document.createElement("textarea");
					var selectedText = '';
					textArea.setAttribute("id", "dummy");
					textArea.setAttribute("style", "opacity:0;position:fixed; top:0; z-index:-999");
					if (lastRowHitIndex == startRowIndex){
						if (firstC != null && lastC != null){
							if (lastC.x > firstC.x){
								selectedText = copy(startRowIndex, lastRowHitIndex, firstC.index, lastC.index, characterData);
								textArea.innerHTML = selectedText;
							} else if (lastC.x < firstC.x){
								selectedText = copy(startRowIndex, lastRowHitIndex, lastC.index, firstC.index, characterData);
								textArea.innerHTML = selectedText;
							} else {
								selectedText = copy(startRowIndex, lastRowHitIndex, lastC.index, firstC.index, characterData);
								textArea.innerHTML = selectedText;
							}
						}
					} else if (lastRowHitIndex > startRowIndex){
						selectedText = copy(startRowIndex, lastRowHitIndex, firstC.index, lastC.index + 1, characterData);
						textArea.innerHTML = selectedText;
					} else {
						selectedText = copy(lastRowHitIndex, startRowIndex, lastC.index, firstC.index + 1, characterData);
						textArea.innerHTML = selectedText;
					}
					$("#mainbody").append(textArea);
					$("#dummy").focus().select();
					
					if(documentViewer.onCopyCallback!=null && documentViewer.onCopyCallback != undefined && typeof documentViewer.onCopyCallback == 'function')
					{
						documentViewer.onCopyCallback(selectedText);
					}
					
				}
			});
		});
		
	}
	
	function rotatedCoordinates(rotateDeg, x, y, pageWidth, pageHeight){
		var coordinates = {};
		
		switch(rotateDeg) {

		case 0:
		case 360:
		default:

			coordinates.x = x;
			coordinates.y = y;

			break;

		case 90:

			coordinates.x = y;
			coordinates.y = parseFloat(pageWidth-x);

			break;

		case 180:

			coordinates.x = parseFloat(pageWidth-x);
			coordinates.y = parseFloat(pageHeight-y);

			break;

		case 270:

			coordinates.x = parseFloat(pageHeight-y);
			coordinates.y = x;

			break;
		}
		
		return coordinates;
	}
	
	function resetAllRectWidth(rectArray){
		for (var i = 0; i < rectArray.length; i++){
			rectArray[i].setAttribute("width", 0);
		}
	}
	
	function drawRect(x, y, w, h){
		var rect = document.createElementNS(svgNamespace, "rect");
		rect.setAttribute("style", "opacity:0.5");
		rect.setAttribute("x", x);
		rect.setAttribute("y", y);
		rect.setAttribute("width", w);
		rect.setAttribute("height", h);
		rect.setAttribute("fill", defaultCopyTextHighlightColor);
		rect.setAttribute("class", "forCopy");
		return rect;
	}
	
	
	function copy(startRowIndex, endRowIndex, startIndex, endIndex, data){
		var string = "";
		function connectChar(start, end, arr){
			var s = "";
			for (var j = start; j < end; j++){
				s += arr[j].c;
			}
			return s;
		}
		
		for (var i = startRowIndex; i <= endRowIndex; i++){
			var row = data[i];
			var cData = row.cData;
			if (startRowIndex == endRowIndex){
				string += connectChar(startIndex, endIndex + 1, cData);
			} else if (i == startRowIndex){
				string += connectChar(startIndex, cData.length, cData);
			} else if (i == endRowIndex){
				string += connectChar(0, endIndex, cData);
			} else {
				string += connectChar(0, cData.length, cData);
			}
		}
		
		return string;
	}
	
	//check if cursor coordinate is within bounds of a literal character
	function findCharacter(x, y, rowIndex, data){
		if (rowIndex != null){
			var row = data[rowIndex];
			var cData = row.cData;
			for (var i = 0; i < cData.length; i++){
				var c = cData[i];
				var cx = c.x;
				var cy = c.y;
				var cw = c.w;
				var ch = c.h;
				
				if ((x >= cx && x <= cx + cw) && (y >= cy && y <= cy + ch)){
					c.index = i;
					return c;
				}
			}
		}
		
		return null;
	}
	
	function isWithinRowArea(x,y,data){
		for (var i = 0; i < data.length; i++){
			var rowArea = data[i];
			var rowX = rowArea.rowX;
			var rowY = rowArea.rowY;
			var rowWidth = rowArea.rowWidth;
			var rowHeight = rowArea.rowHeight;
			
			if ((x >= rowX && x <= rowX + rowWidth) && (y >= rowY && y <= rowY + rowHeight)){
				return i;
			}
		}
		
		return null;
	}
	
	function getCharacterData(pageNumber){
		return pageCollection[pageNumber-1].textCharacters;
	}
	
	function attachKeyDown(e){
		var ctrlKey = 17;
		
		if (e.keyCode == ctrlKey){
			$("#dummy").focus().select();
		}
	}
});


function disableCopy(){
	for (var i = 0; i < pageCollection.length; i++){
		var page = document.getElementById(pageCollection[i].attributes.id);
		disableMouseEvent(page);
	}
	$(document).off("keydown.copy");
	$(".copyGroup").remove();
	$("#dummy").remove();
}

function disableMouseEvent(element){
	$(element).off("mousedown.copy");
	$(element).off("mouseup.copy");
	$(element).off("mousemove.copy");
}