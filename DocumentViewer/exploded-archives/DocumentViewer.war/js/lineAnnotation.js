
	var Dropdown_lineWidth = new Dropdown ('.lineWidthPicker','.width-available-container'),
	Dropdown_Opacity = new Dropdown('.lineopacityPicker','.opacity-available-container'),

	colorPickerBox =  $('.linecolorPickerBox'),
	opacityPicker = $('.lineopacityPicker'),
	WidthPicker = $('.lineWidthPicker'),
	availableColors = $('.availableColors'),

	close = $('#closeLine'),
	resizer = $('#resizeLineAnnotate'),
	controls = $('.LineControls'),
	contents = $('.LineControls-contents'),
	container = $('#viewer-lineAnnotate'),
	lineDelete = $('#line_delete'),
	style = $('#LineStyle'),
	index = $('#Line_index'),

	styleTab = $('.lineAnnotateStyle'),
	indexTab = $('.linelayering-controls'),
	
	lineBringFront = $('.lineBringFront'),
	lineBringBack = $('.lineBringBack'),
	lineMoveFront = $('.lineMoveFront'),
	lineMoveBack = $('.lineMoveBack');

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
			$this.parent().siblings('.selectedLineOpacity').children('span').text(selectedReason); 
			
			if($('#viewer-lineAnnotate').css('display')==='block')
			{
				setOpacity(getSingleSelectedObject(0), 'line_fillOpacity');
			}
		}
	});

	$('.width-holder').on({
		click:function(){
			var $this = $(this),
			selectedReason = $this.text();
			$this.parent().siblings('.selectedLineWidth').children('span').text(selectedReason); 
			
			if($('#viewer-lineAnnotate').css('display')==='block')
			{
			setWidth(getSingleSelectedObject(0), 'line_fillWidth');
			}
		}
	});

	availableColors.on('click','div',function(e){
		$(this).parent().removeClass('active');
		$(this).parent('.availableColors').siblings('.selectedColor').attr('style',$(this).attr('style'));
		
		if($('#viewer-lineAnnotate').css('display')==='block')
		{
			if ($('#LineStyle').hasClass('selected')){
				setAttributeColor('stroke',getSingleSelectedObject(0),'line_fillColor');
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
			lineDelete.css('display','none');
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
				lineDelete.css('display','block');
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
			lineDelete.css('display','block');
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
		$('#addLine').data('active',false).removeClass('selected-tool');
		viewerChild.removeClass('cursorCrosshair');
	}
	
	lineDelete.on({
		mouseup:function(){
			deleteSingleMarkup();
			removeSingleMarkupInArray();
			clearAllHandles();
		}
	});
	
	lineBringFront.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if (selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Top);		
		}
	});
	
	lineBringBack.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();		
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Bottom);			
		}
	});
	
	lineMoveFront.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Forward);
		}
	});

	lineMoveBack.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Backward);
		}
	});