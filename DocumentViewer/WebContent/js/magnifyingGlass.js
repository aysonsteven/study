var clippedImage;
var cp;
var mycircle;
var frame;
var gMouseDown = 0;
var scaleFactorM = 2.0;
var pageNo;
var viewerWrapper = $(getElement('viewer-document-wrapper'));	

	
$('#magnifyingGlass').on('click',function() {
	if ($(this).hasClass("active-state")){ 
		disableMagnifyingGlass();
		$('#magnifyingGlassCaret').removeClass('active-state');
		$('.range-slider').addClass('hide');
	}else{
		$('#magnifyingGlassCaret').addClass('active-state');
		document.removeEventListener('mousedown', selectAnnotationObject, true);
		document.addEventListener('mousedown', magnifyingGlassFunction, true);
	}	
});

$('#magnifyingGlassCaret').on('click', function() {
	$('.range-slider').toggleClass('hide');
	if(!$('.range-slider').hasClass('hide') && (!$('#magnifyingGlass').hasClass("active-state"))){
		 $("#magnifyingGlass" ).click();
	}
});
	
function magnifyingGlassFunction(e){
	var eTarget = (e.target.correspondingUseElement) ? e.target.correspondingUseElement : e.target;
	
	var selectedPageNo = (eTarget.farthestViewportElement) ? eTarget.farthestViewportElement.id.substring(5) : eTarget.id.substring(5);
	
	if(selectedPageNo != '' && isNaN(selectedPageNo) === false){
		
		if(pageNo && pageNo != selectedPageNo){
			var svgPageToClear = document.getElementById("svgp_" + pageNo);
			if (svgPageToClear){
				disablePageMagnifyEvents(svgPageToClear);
			}
		}
		pageNo = selectedPageNo;
		svgPage=document.getElementById("svgp_" + pageNo);	

		var x = e.clientX;
		var y = e.clientY;
		var transformed = convertToSVGCoordinateSpace(svgPage, x, y);
		x = transformed.x;
		y = transformed.y;

		var content = "<clipPath id='CP_" + pageNo + "'>"
				+ "<circle id='myCircle_" + pageNo + "' cx = '" + x + "' cy='" + y + "' r='24.7'/>" 
				+ "</clipPath>" + "<g  id='clippedI_" + pageNo + "' >" 
				+ "<circle id = 'Frame_" + pageNo + "' cx = '" + x + "' cy='" + y + "' r='25' fill='white' stroke='black' stroke-width='.75' />"
				+ "<use xlink:href='#svgpWrap_" + pageNo + "' clip-path='url(#CP_" + pageNo + ")' />" + "</g>";
		
		$('#magnify_'+ pageNo).html(content);
		
		clippedImage = document.getElementById("clippedI_" + pageNo);
		cp = document.getElementById("CP_" + pageNo);
		mycircle = document.getElementById("myCircle_" + pageNo);
		frame = document.getElementById("Frame_" + pageNo);
		
		svgPage.addEventListener('mouseup', mgMouseUp, true);
		svgPage.addEventListener('mousemove', mgMouseMove, true);	
		svgPage.addEventListener('mousedown', mgMouseDown, true);	
		
		var wrap = document.getElementById('svgpWrap_' + pageNo);
		wrap.addEventListener('mousedown', mgMouseDown, true);
		wrap.addEventListener('mouseup', mgMouseUp, true);
		wrap.addEventListener('mousemove', mgMouseMove, true);
		
		clippedImage.addEventListener('mousedown', mgMouseDown, true);
		clippedImage.addEventListener('mouseup', mgMouseUp, true);
		
		if(scaleFactorM != 1.0){
			scaleFactorM = $('.range-slider__range').val();
			mgResizeImage(x,y);
		}
		magnifyButton="on";
	}

}

function mgMouseMove(evt)
{
  if(!gMouseDown) return;
  var x = evt.clientX;
  var y = evt.clientY;
  
 
  var transformed = convertToSVGCoordinateSpace(svgPage,x,y);
	x = transformed.x;
	y = transformed.y;
  mycircle.setAttributeNS(null,"cx", x);
  mycircle.setAttributeNS(null,"cy", y);
  frame.setAttributeNS(null,"cx", x);
  frame.setAttributeNS(null,"cy", y);
  
  mgResizeImage(x,y);
}

function mgMouseDown(evt)
{
  gMouseDown = 1;
  viewerWrapper.css('cursor','move');
  //mgModifyPercentText();
}

function mgMouseUp(evt)
{
  gMouseDown = 0;
  viewerWrapper.css('cursor','default');
}

function mgZoomIn(evt)
{
  scaleFactorM+=1;
  scaleFactorM = parseInt(scaleFactorM);
  
  if(pageNo){
	  var x = mycircle.getAttributeNS(null,"cx");
	  var y = mycircle.getAttributeNS(null,"cy");
	  mgResizeImage(x,y);
  }
}

function mgResizeImage(x,y)
{   
  var newx = x - scaleFactorM*x;
  var newy = y - scaleFactorM*y;

  var tx = "translate(" + newx + "," + newy 
             + "),scale(" + scaleFactorM + "," + scaleFactorM +")";
  
  clippedImage.setAttribute("transform", tx);
}

function myFunctiontests(){
	
	alert($('.current-page').val());
}

function convertToSVGCoordinateSpace(svgPage,x,y)
{
	var svgPointForConversion = svgPage.createSVGPoint();
	svgPointForConversion.x = x;
	svgPointForConversion.y = y;
	var transformed = svgPointForConversion.matrixTransform(svgPage.getScreenCTM().inverse());
	return transformed;
}

function disableMagnifyingGlass(){
	
	document.removeEventListener('mousedown', magnifyingGlassFunction, true);
	document.addEventListener('mousedown', selectAnnotationObject, true);
	$('.range-slider').addClass('hide')
	if(pageNo){
		var svgPageToClear = document.getElementById("svgp_" + pageNo);
		if (svgPageToClear){
			disablePageMagnifyEvents(svgPageToClear);
		}
	}
};

function disablePageMagnifyEvents(svgPageToClear){
	$('#magnify_'+ pageNo).html("");
	scaleFactorM = 2.0;
	svgPageToClear.removeEventListener('mouseup', mgMouseUp, true);
	svgPageToClear.removeEventListener('mousemove', mgMouseMove, true);	
	svgPageToClear.removeEventListener('mousedown', mgMouseDown, true);	
	document.getElementById('svgpWrap_' + pageNo).removeEventListener('mousedown', mgMouseDown, true);
	document.getElementById('svgpWrap_' + pageNo).removeEventListener('mouseup', mgMouseUp, true);
	document.getElementById('svgpWrap_' + pageNo).removeEventListener('mousemove', mgMouseMove, true);
	
};

var rangeSlider = function(){
  var slider = $('.range-slider'),
      range = $('.range-slider__range'),
      value = $('.range-slider__value');
    
  slider.each(function(){

    value.each(function(){
      var value = $(this).prev().attr('value');
      $(this).html(value*10+'%');
    });

    range.on('input', function(){
    	
      $(this).next(value).html(this.value*10+'%');
      scaleFactorM = this.value;
	  
	  if(pageNo){
		  var x = mycircle.getAttributeNS(null,"cx");
		  var y = mycircle.getAttributeNS(null,"cy");
		  mgResizeImage(x,y);
	  }
    });
    
  });
};

rangeSlider();
