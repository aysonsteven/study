
$(function(){
	var Dropdown_lineWidth = new Dropdown ('.textboxWidthPicker','.width-available-container'),
		Dropdown_Opacity = new Dropdown('.textboxopacityPicker','.opacity-available-container'),

		Dropdown_font = new Dropdown ('.textfontPicker','.fonts-available-container'),
		Dropdown_fontsize = new Dropdown('.textsizePicker','.size-available-container'),

	colorPickerBox =  $('.textboxcolorPickerBox'),
	textcolorPickerBox = $('.textcolorPickerBox'),

	opacityPicker = $('.textboxopacityPicker'),
	WidthPicker = $('.textboxWidthPicker'),

	fontPicker = $('.textfontPicker'),
	fontSizePicker = $('.textsizePicker'),

	availableColors = $('.availableColors'),

	close = $('#closeText'),
	resizer = $('#resizeTextAnnotate'),
	controls = $('.TextboxControls'),
	contents = $('.TextboxControls-contents'),
	container = $('#viewer-textAnnotate'),
	textDelete = $('#textbox_delete'),

	style = $('#TextboxStyle'),
	styleFont = $('#TextStyle'),
	border = $('#TextB'),
	charStyle = $("#characterStyle"),
	index = $('#Textbox_index'),


	styleTab = $('.textboxAnnotateStyle'),
	styleFontTab = $('.textStyleTab'),
	borderTab = $('.textborder-controls'),
	charTab = $('.characterStyle-controls'),
	indexTab = $('.textboxlayering-controls'),

	textBoxBringFront = $('.textBoxBringFront'),
	textBoxBringBack = $('.textBoxBringBack'),
	textBoxMoveFront = $('.textBoxMoveFront'),
	textBoxMoveBack = $('.textBoxMoveBack')
	
	
	
	boldText = $('#boldText'),
	italicText = $('#italicText'),
	underlineText = $('#underlineText'),
	strikeoutText = $('#strikeoutText');

	
	boldText.on('click',function(){
		var $this = $(this);
		var textDivId = getSelectedObjectGroup().childNodes[1].children[0].children[0].id;
		if ($this.hasClass("selected")){
			$this.removeClass("selected");
			//unbold
			document.getElementById(textDivId).style.fontWeight = 'normal';
			return
		}
		$this.addClass("selected");
		//make bold
		document.getElementById(textDivId).style.fontWeight = 'bold';
	});
	
	italicText.on('click',function(){
		var $this = $(this);
		var textDivId = getSelectedObjectGroup().childNodes[1].children[0].children[0].id;
		if ($this.hasClass("selected")){
			$this.removeClass("selected");
			document.getElementById(textDivId).style.fontStyle = 'normal';
			return
		}
		$this.addClass("selected");
		document.getElementById(textDivId).style.fontStyle = 'italic';
	});
	
	underlineText.on('click',function(){
		var $this = $(this);
		var textDivId = getSelectedObjectGroup().childNodes[1].children[0].children[0].id;
		
		if ($this.hasClass("selected")){
			$this.removeClass("selected");
			
			if(strikeoutText.hasClass("selected")){
				document.getElementById(textDivId).style.textDecoration='line-through';
			}else{
				document.getElementById(textDivId).style.textDecoration='none';
			}
			return
		}
		$this.addClass("selected");
		
		if(strikeoutText.hasClass("selected")){
			document.getElementById(textDivId).style.textDecoration='underline line-through';
		}else{
			document.getElementById(textDivId).style.textDecoration='underline';
		}

	});
	
	strikeoutText.on('click',function(){
		var $this = $(this);
		var textDivId = getSelectedObjectGroup().childNodes[1].children[0].children[0].id;
		if ($this.hasClass("selected")){
			$this.removeClass("selected");
			
			if(underlineText.hasClass("selected")){
				document.getElementById(textDivId).style.textDecoration='underline';
			}else{
				document.getElementById(textDivId).style.textDecoration='none';
			}
			return
		}
		$this.addClass("selected");

		if(underlineText.hasClass("selected")){
			document.getElementById(textDivId).style.textDecoration='underline line-through';
		}else{
			document.getElementById(textDivId).style.textDecoration='line-through';
		}
		
	});
	

	$(document).on('click',function(){
		opacityPicker.children('.opacity-available-container').removeClass('active');
		WidthPicker.children('.width-available-container').removeClass('active');
		availableColors.removeClass('active');
	});

	opacityPicker.on('click',function(){
		WidthPicker.children('.width-available-container').removeClass('active');
		availableColors.removeClass('active');
	});

	WidthPicker.on('click',function(){
		opacityPicker.children('.opacity-available-container').removeClass('active');
		availableColors.removeClass('active');
	});

	fontPicker.on('click',function(){
		fontSizePicker.children('.size-available-container').removeClass('active');
		availableColors.removeClass('active');
		
		//for fontFace
		var toolBarFontFaceId = document.getElementById('text_fontFace');
		var textDivId = getSelectedObjectGroup().childNodes[1].children[0].children[0].id;
		document.getElementById(textDivId).style.fontFamily = toolBarFontFaceId.innerHTML;
		
		
	});

	fontSizePicker.on('click',function(){
		fontPicker.children('.fonts-available-container').removeClass('active');
		availableColors.removeClass('active');
				
		
		//for Font Size
		var toolBarFontSizeId = document.getElementById('text_fontSize');
		var textDivId = getSelectedObjectGroup().childNodes[1].children[0].children[0].id;
		document.getElementById(textDivId).style.fontSize = toolBarFontSizeId.innerHTML+"px";
		
		
		
		
	});

	//TextBox Color
	colorPickerBox.on('click',function(){
		var $this = $(this);
		$this.children(availableColors).addClass('active');
		opacityPicker.children('.opacity-available-container').removeClass('active');
		WidthPicker.children('.width-available-container').removeClass('active');
		return false;
	});

	//Font Color
	textcolorPickerBox.on('click',function(){
		var $this = $(this);
		$this.children(availableColors).addClass('active');
		fontPicker.children('.fonts-available-container').removeClass('active');
		fontSizePicker.children('.size-available-containerr').removeClass('active');
		
		return false;
	});


	$('.opacity-holder').on({
		click:function(){
			var $this = $(this),
			selectedReason = $this.text();
			$this.parent().siblings('.selectedTextboxOpacity').children('span').text(selectedReason); 
			
			if($('#viewer-textAnnotate').css('display')==='block')
			{
				setOpacity(getSingleSelectedObject(0), 'text_fillOpacity');
			}
		}
	});

	$('.width-holder').on({
		click:function(){
			var $this = $(this),
			selectedReason = $this.text();
			$this.parent().siblings('.selectedTextboxWidth').children('span').text(selectedReason); 
			
			if($('#viewer-textAnnotate').css('display')==='block')
			{
				setWidth(getSingleSelectedObject(0), 'text_borderWidth');	
			}
		}
	});

	$('.font-holder').on({
		click:function(){
			var $this = $(this),
			selectedReason = $this.text();
			$this.parent().siblings('.selectedTextFont').children('span').text(selectedReason); 
		}
	});

	$('.size-holder').on({
		click:function(){
			var $this = $(this),
			selectedReason = $this.text();
			$this.parent().siblings('.selectedFontSize').children('span').text(selectedReason); 
		}
	});


	availableColors.on('click','div',function(e){
		$(this).parent().removeClass('active');
		$(this).parent().siblings('.selectedColor').attr('style',$(this).attr('style'));
		
		if($('#viewer-textAnnotate').css('display')==='block')
		{
			if ($('#TextB').hasClass('selected')){
				setAttributeColor('stroke',getSingleSelectedObject(0),'text_borderColor');
			}
			//for fill color
			if ($('#TextboxStyle').hasClass('selected')){
				setAttributeColor('fill',getSingleSelectedObject(0),'text_fillColor');

			}
			if ($('#TextStyle').hasClass('selected')){
				

				var textDivId = getSelectedObjectGroup().childNodes[1].children[0].children[0].id;
				document.getElementById(textDivId).style.color = getSelectedColor('text_fontColor');
				
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
			textDelete.css('display','none');
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
				textDelete.css('display','block');
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

			indexTab.css('display','none');
			styleTab.css('display','block');
			styleFontTab.css('display','none');
			charTab.css('display','none');
			borderTab.css('display','none');
		}
	});

	styleFont.on({
		mousedown:function(){
			var $this = $(this);
			$this.siblings('img').removeClass('selected')
			.end()
			.addClass('selected');

			indexTab.css('display','none');
			styleTab.css('display','none');
			styleFontTab.css('display','block');
			charTab.css('display','none');
			borderTab.css('display','none');
		}
	});

	border.on({
		mousedown:function(){
			var $this = $(this);
			$this.siblings('img').removeClass('selected')
			.end()
			.addClass('selected');

			indexTab.css('display','none');
			styleTab.css('display','none');
			styleFontTab.css('display','none');
			charTab.css('display','none');
			borderTab.css('display','block');
		}
	});
	
	charStyle.on({
			mousedown:function(){
				var $this = $(this);
				$this.siblings('img').removeClass('selected')
				.end()
				.addClass('selected');
				
				indexTab.css('display','none');
				styleTab.css('display','none');
				styleFontTab.css('display','none');
				charTab.css('display','block');
				borderTab.css('display','none');
			}
	});
	
	
	index.on({
		mousedown:function(){
			var $this = $(this);
			$this.siblings('img').removeClass('selected')
			.end()
			.addClass('selected');

			indexTab.css('display','block');
			styleTab.css('display','none');
			styleFontTab.css('display','none');
			charTab.css('display','none');
			borderTab.css('display','none');
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
			textDelete.css('display','block');
			controls.css('display','block');
			contents.css('display','block');
			container.css('display','none');
			removeActivate();
		}
	});


	function removeActivate()
	{
		var viewerWrapper = $('#viewer-document-wrapper'),
		viewerChild = viewerWrapper.children(".pageContent");
		$('#addText').data('active',false).removeClass('selected-tool');
		viewerChild.removeClass('cursorCrosshair');
	}
		
	textDelete.on({
		mouseup:function(){
			deleteSingleMarkup();
			removeSingleMarkupInArray();
			clearAllHandles();
		}
	});
	
	textBoxBringFront.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if (selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Top);		
		}
	});
	
	textBoxBringBack.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();		
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Bottom);			
		}
	});
	
	textBoxMoveFront.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Forward);
		}
	});

	textBoxMoveBack.on('click', function(){
		var selObjGrp = getSelectedObjectGroup();
		if(selObjGrp) {
			layerAnnotationObject(selObjGrp, layerOptions.Backward);
		}
	});

});