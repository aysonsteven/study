
$(function(){
	var Dropdown_lineWidth = new Dropdown ('.squareWidthPicker','.width-available-container'),
		Dropdown_Opacity = new Dropdown('.squareopacityPicker','.opacity-available-container'),

	colorPickerBox =  $('.squarecolorPickerBox'),
	opacityPicker = $('.squareopacityPicker'),
	WidthPicker = $('.squareWidthPicker'),
	availableColors = $('.availableColors'),

	close = $('#closeSquare'),
	resizer = $('#resizeSquareAnnotate'),
	controls = $('.SquareControls'),
	contents = $('.SquareControls-contents'),
	container = $('#viewer-squareAnnotate'),
	squareDelete = $('#square_delete'),

	style = $('#SquareStyle'),
	index = $('#Square_index'),
	border = $('#SquareB'),

	styleTab = $('.squareAnnotateStyle'),
	indexTab = $('.squarelayering-controls'),
	borderTab = $('.squareborder-controls'),
	
	squareBringFront = $('.squareBringFront'),
	squareBringBack = $('.squareBringBack'),
	squareMoveFront = $('.squareMoveFront'),
	squareMoveBack = $('.squareMoveBack');

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

	$('.opacity-holder').on({click:function(){
			var $this = $(this),
			selectedReason = $this.text();
			$this.parent().siblings('.selectedSquareOpacity').children('span').text(selectedReason); 
			
			if($('#viewer-squareAnnotate').css('display')==='block')
			{
			setOpacity(getSingleSelectedObject(0), 'rect_fillOpacity');
			
			}
	}
	});

	$('.width-holder').on({
		click:function(){
			var $this = $(this),
			selectedReason = $this.text();
			$this.parent().siblings('.selectedSquareWidth').children('span').text(selectedReason); 
			
			if($('#viewer-squareAnnotate').css('display')==='block')
			{
			setWidth(getSingleSelectedObject(0), 'rect_borderWidth');
			}
		}
	});

	availableColors.on('click','div',function(e){
		$(this).parent().removeClass('active');
		$(this).parent('.availableColors').siblings('.selectedColor').attr('style',$(this).attr('style'));


		if($('#viewer-squareAnnotate').css('display')==='block')
		{
			if ($('#SquareB').hasClass('selected')){
				setAttributeColor('stroke',getSingleSelectedObject(0),'rect_borderColor');
				
			}
			if ($('#SquareStyle').hasClass('selected')){
				setAttributeColor('fill',getSingleSelectedObject(0),'rect_fillColor');
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
			squareDelete.css('display','none');
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
				squareDelete.css('display','block');
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
	})

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
			squareDelete.css('display','block');
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
		$('#addSquare').data('active',false).removeClass('selected-tool');
			viewerChild.removeClass('cursorCrosshair');
	}
		
	squareDelete.on({
		mouseup:function(){
			deleteSingleMarkup();
			removeSingleMarkupInArray();
			clearAllHandles();
		}
	});

	squareBringFront.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if (selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Top);		
		}
	});
	
	squareBringBack.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();		
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Bottom);			
		}
	});
	
	squareMoveFront.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Forward);
		}
	});

	squareMoveBack.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Backward);
		}
	});

});
