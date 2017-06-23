
$(function(){
	var Dropdown_lineWidth = new Dropdown ('.circleWidthPicker','.width-available-container'),
		Dropdown_Opacity = new Dropdown('.circleopacityPicker','.opacity-available-container'),

	colorPickerBox =  $('.circlecolorPickerBox'),
	opacityPicker = $('.circleopacityPicker'),
	WidthPicker = $('.circleWidthPicker'),
	availableColors = $('.availableColors'),

	close = $('#closeCircle'),
	resizer = $('#resizeCircleAnnotate'),
	controls = $('.CircleControls'),
	contents = $('.CircleControls-contents'),
	container = $('#viewer-circleAnnotate'),
	circleDelete = $('#circle_delete'),

	style = $('#CircleStyle'),
	index = $('#Circle_index'),
	border = $('#CircleB'),

	styleTab = $('.circleAnnotateStyle'),
	indexTab = $('.circlelayering-controls'),
	borderTab = $('.circleborder-controls'),
	
	circleBringFront = $('.circleBringFront'),
	circleBringBack = $('.circleBringBack'),
	circleMoveFront = $('.circleMoveFront'),
	circleMoveBack = $('.circleMoveBack');

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
			$this.parent().siblings('.selectedCircleOpacity').children('span').text(selectedReason); 
			
			if($('#viewer-circleAnnotate').css('display')==='block')
			{
			setOpacity(getSingleSelectedObject(0), 'circle_fillOpacity');
			}
		}
	});

	$('.width-holder').on({
		click:function(){
			var $this = $(this),
			selectedReason = $this.text();
			$this.parent().siblings('.selectedCircleWidth').children('span').text(selectedReason); 
			
			if($('#viewer-circleAnnotate').css('display')==='block')
			{
			setWidth(getSingleSelectedObject(0), 'circle_borderWidth');
			}
		}
	});

	availableColors.on('click','div',function(e){
		$(this).parent().removeClass('active');
		$(this).parent('.availableColors').siblings('.selectedColor').attr('style',$(this).attr('style'));
		
		//for border color
		if($('#viewer-circleAnnotate').css('display')==='block')
		{
			if ($('#CircleB').hasClass('selected')){
				setAttributeColor('stroke',getSingleSelectedObject(0),'circle_borderColor');
				
			}
			//for fill color
			if ($('#CircleStyle').hasClass('selected')){
				setAttributeColor('fill',getSingleSelectedObject(0),'circle_fillColor');
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
			circleDelete.css('display','none');
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
				circleDelete.css('display','block');
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
			borderTab.css('display','none');
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
			borderTab.css('display','none');
		}
	});
	border.on({
		mousedown:function(){
			var $this = $(this);
			$this.siblings('img').removeClass('selected')
			.end()
			.addClass('selected');
			styleTab.css('display','none');
			indexTab.css('display','none');
			borderTab.css('display','block');
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
			circleDelete.css('display','block');
			controls.css('display','block');
			contents.css('display','block');
			container.css('display','none');
			removeActivate()
		}
	});

	function removeActivate()
	{
		var viewerWrapper = $('#viewer-document-wrapper'),
		viewerChild = viewerWrapper.children(".pageContent");
		$('#addCircle').data('active',false).removeClass('selected-tool');
		viewerChild.removeClass('cursorCrosshair');
	}
	
	circleDelete.on({
		mouseup:function(){
			deleteSingleMarkup();
			removeSingleMarkupInArray();
			clearAllHandles();
		}
	});
	
	circleBringFront.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if (selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Top);		
		}
	});
	
	circleBringBack.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();		
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Bottom);			
		}
	});
	
	circleMoveFront.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Forward);
		}
	});

	circleMoveBack.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Backward);
		}
	});
	
});