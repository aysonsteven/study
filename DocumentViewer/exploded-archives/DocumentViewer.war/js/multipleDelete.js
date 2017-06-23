
	var container = $('#deleteMultiple'),
		close = $('#closeMultipleDelete'),
		resizer = $('#resizeMultipleDelete'),
		multiDelete = $('#multiple_delete');
	
	//Resize Box
	resizer.on('click',function(){
		var $this = $(this);

		if($this.data('resize') == "minimize"){
			multiDelete.css('display','none');
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
				'width' : '68px',

			},500,function(){
				multiDelete.css('display','block');
				$this.attr({
					'src':'images/under-redact/RedactBox/Minimize.png',
					'title':'Minimize'
				})
				.data('resize','minimize');
			});
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
			multiDelete.css('display','block');
			container.css('display','none');
		}
	});
	
	multiDelete.on({
		mouseup:function(){
			deleteMultipleMarkups();
			removeMultipleMarkupInArray();
			selectedObjectCollection = [];
			clearAllHandles();
			container.css('display','none');
		}
	});