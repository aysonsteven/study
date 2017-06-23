
$(function(){
	var Dropdown_lineWidth = new Dropdown( '.arrowopacityPicker', '.opacity-available-container'),
	Dropdown_Opacity = new Dropdown('.arrowWidthPicker', '.width-available-container'),

	colorPickerBox =  $('.arrowcolorPickerBox'),
	opacityPicker = $('.arrowopacityPicker'),
	WidthPicker = $('.arrowWidthPicker'),
	availableColors = $('.availableColors'),

	close = $(getElement('closeArrow')),
	resizer = $(getElement('resizeArrowAnnotate')),
	controls = $('.ArrowControls'),
	contents = $('.ArrowControls-contents'),
	container = $(getElement('viewer-arrowAnnotate')),
	arrowDelete = $(getElement('arrow_delete')),
	style = $(getElement('ArrowStyle')),
	index = $(getElement('Arrow_index')),

	styleTab = $('.arrowAnnotateStyle'),
	indexTab = $('.arrowlayering-controls'),
	
	arrowBringFront = $('.arrowBringFront'),
	arrowBringBack = $('.arrowBringBack'),
	arrowMoveFront = $('.arrowMoveFront'),
	arrowMoveBack = $('.arrowMoveBack');

	$(document).on('click',function(){
		opacityPicker.children('.opacity-available-container').removeClass('active');
		WidthPicker.children('.width-available-container').removeClass('active');
		colorPickerBox.children('.availableColors').removeClass('active');
	});

	opacityPicker.on('click',function(){
		WidthPicker.children('.width-available-container').removeClass('active');
		colorPickerBox.children('.availableColors').removeClass('active');
	});

	WidthPicker.on('click',function(){
		opacityPicker.children('.opacity-available-container').removeClass('active');
		colorPickerBox.children('.availableColors').removeClass('active');
	});

	colorPickerBox.on('click',function(){
		var $this = $(this);
		$this.children('.availableColors').addClass('active');
		opacityPicker.children('.opacity-available-container').removeClass('active');
		WidthPicker.children('.width-available-container').removeClass('active');
		return false;
	});

	$('.opacity-holder').on({
		click:function(){
			var $this = $(this),
			selectedReason = $this.text();
			$this.parent().siblings('.selectedArrowOpacity').children('span').text(selectedReason); 
			if($(getElement('viewer-arrowAnnotate')).css('display')==='block')
			{
				setOpacity(getSingleSelectedObject(0), 'arrow_fillOpacity');
			}
		}
	});

	$('.width-holder').on({
		click:function(){
			var $this = $(this),
			selectedReason = $this.text();
			$this.parent().siblings('.selectedArrowWidth').children('span').text(selectedReason); 
			if($(getElement('viewer-arrowAnnotate')).css('display')==='block')
			{
				setWidth(getSingleSelectedObject(0), 'arrow_fillWidth');
			}
		}
	});

	availableColors.on('click','div',function(e){
		$(this).parent().removeClass('active');
		$(this).parent('.availableColors').siblings('.selectedColor').attr('style',$(this).attr('style'));
		
		
		if($(getElement('viewer-arrowAnnotate')).css('display')==='block')
		{
			if ($(getElement('ArrowStyle')).hasClass('selected')){
				
				var xMarkerID = getSingleSelectedObject(0).parentNode.lastChild;
				
				setAttributeColor('stroke',getSingleSelectedObject(0),'arrow_fillColor');
				setAttributeColor('fill',xMarkerID,'arrow_fillColor');
				
				
				

			}
		}
		return false;
	});


	//Resize Box
	resizer.on('click',function(){
		var $this = $(this);

		if($this.data('resize') == "minimize"){
			controls.css('display','none');
			contents.css('display','none');
			arrowDelete.css('display','none');
			container.animate({
				'width' : '35px',
			},500,function(){
				$this.attr({
					'src':'images/under-redact/RedactBox/Maximize.png',
					'title':'Maximize'
				})
				.data('resize','maximize');
			});
		}
		else if($this.data('resize') == 'maximize'){

			container.animate({
				'width' : '284px',

			},500,function(){
				controls.css('display','block');
				contents.css('display','block');
				arrowDelete.css('display','block');
				$this.attr({
					'src':'images/under-redact/RedactBox/Minimize.png',
					'title':'Minimize'
				})
				.data('resize','minimize');
			});
		}
	});
	//End of Box

	style.on({
		mousedown:function(){
			var $this = $(this);
			$this.siblings('img').removeClass('selected')
			.end()
			.addClass('selected');
			styleTab.css('display','block');
			indexTab.css('display','none');
		}
	});
	index.on({
		mousedown:function(){
			var $this = $(this);
			$this.siblings('img').removeClass('selected')
			.end()
			.addClass('selected');
			styleTab.css('display','none');
			indexTab.css('display','block');
		}
	});

	close.on('click',function(){
		if ( !container.is(':animated') ){
			if(resizer.data('resize') == "maximize"){
				container.css({	
					'width' : '284px',
				});
				resizer.attr({
					'src':'images/under-redact/RedactBox/Minimize.png',
					'title':'Minimize'
				}).data('resize','minimize');
			}
			arrowDelete.css('display','block');
			controls.css('display','block');
			contents.css('display','block');
			container.css('display','none');
			removeActivate()
		}
	});

	function removeActivate()
	{
		var viewerWrapper = $(getElement('viewer-document-wrapper')),
		viewerChild = viewerWrapper.children(".pageContent");
		$(getElement('addArrow')).data('active',false).removeClass('selected-tool');
			viewerChild.removeClass('cursorCrosshair');
	}
	
	arrowDelete.on({
		mouseup:function(){
			deleteSingleMarkup();
			removeSingleMarkupInArray();
			clearAllHandles();
		}
	});

	arrowBringFront.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if (selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Top);		
		}
	});
	
	arrowBringBack.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();		
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Bottom);			
		}
	});
	
	arrowMoveFront.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Forward);
		}
	});

	arrowMoveBack.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Backward);
		}
	});

});