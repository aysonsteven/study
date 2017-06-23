
$(function(){
	var select = new Dropdown( '.reason-container', '.reasons-available-container');

	$(document).on('click',function(){
		$('.reasons-available-container').removeClass('active');
	});

	$('.reasons-holder').on({
		click:selectRedactionReason
	});

	var controls = $('.redactControls'),
	contents = $('.redactControls-contents'),
	container = $('#viewer-redactbox'), 
	resizer = $('#resizeRedactBox'),
	redactDelete = $('#Redact_delete'),
	redactFill = $('#Redact_fill'),
	redactIndex = $('#Redact_index'),
	reasonsHolder = $('.reasons-holder'),
	reasonContainer = $('.reason-container'),
	layerContainer = $('.layering-controls'),
	downloadDoc = $('.downloadDocument');

	//Resize Box
	resizer.on('click',function(){
		var $this = $(this);

		if($this.data('resize') == "minimize"){
			controls.css('display','none');
			contents.css('display','none');
			redactDelete.css('display','none');
			$('#redactionInfiniteBtn').css('display','none');
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
				redactDelete.css('display','block');
				$('#redactionInfiniteBtn').css('display','block');
				$this.attr({
					'src':'images/under-redact/RedactBox/Minimize.png',
					'title':'Minimize'
				})
				.data('resize','minimize');
			});
		}
	});
	//End of Box

	reasonsHolder.on({
		mouseenter:hoverOption,
		mouseleave:outOption
	});


	redactFill.on({
		mousedown:function(){
			var $this = $(this);
			$this.siblings('img').removeClass('selected')
			.end()
			.addClass('selected');
			reasonContainer.css('display','block');
			layerContainer.css('display','none');
			$('.reasons-holder').parent().siblings('.selected-reason').children('span').text(getSelectedRedactionReason(0)); 
		}
	});

	redactIndex.on({
		mousedown:function(){
			var $this = $(this);
			$this.siblings('img').removeClass('selected')
			.end()
			.addClass('selected');

			reasonContainer.css('display','none');
			layerContainer.css('display','block');
			
			//clear selected layer
			layerContainer.children('img').each(function(){
				if($(this).hasClass('selected')){
					$(this).removeClass('selected');
				}
			});
		}
	});


	$('#closeRedact').on('click',function(){

		if ( !container.is(':animated') ){

			$('#addRedact').data('active',false).removeClass('selected-tool');

			if(resizer.data('resize') == "maximize"){
				container.css({	
					'width' : '284px',
				});
				resizer.attr({
					'src':'images/under-redact/RedactBox/Minimize.png',
					'title':'Minimize'
				}).data('resize','minimize');
			}

			redactDelete.css('display','block');
			controls.css('display','block');
			contents.css('display','block');

			container.css('display','none');
			removeActivate();
			deactivateAnnotationDraw();
			setMouseStyle();
		}
	});

	//Drag Box
	/*container.drags();*/
	function removeActivate()
	{
		var viewerWrapper = $('#viewer-document-wrapper'),
		viewerChild = viewerWrapper.children(".pageContent");
		$('#addRedact').data('active',false).removeClass('selected-tool');
		viewerChild.removeClass('cursorCrosshair');
	}
		
	redactDelete.on({
		mouseup:function(){
			deleteSingleMarkup();
			removeSingleMarkupInArray();
			clearAllHandles();
		}
	});
	
	//Redact Layers
	layerContainer.children('img').each(function(){
		$(this).on({
			'click':function(){
				$(this).siblings().removeClass('selected')
				.end()
				.addClass('selected');
				
				switch(this.id) {
				case 'redactionBringFront':
					layerMarkupObject(layerOptions.Top);
					break;
				case 'redactionMoveFront':
					layerMarkupObject(layerOptions.Forward);
					break;
				case 'redactionMoveBack':
					layerMarkupObject(layerOptions.Backward);
					break;
				case 'redactionBringBack':
					layerMarkupObject(layerOptions.Bottom);
					break;
				}
			}
		});
	});
	
	//Download Redacted Document
	downloadDoc.on({
		'click':function(){
			transferTextAreaValuetoDiv(lastSelectedDivReason);
			if($(this).hasClass('disable-tool')) return;			
//				if(hasRedactedFile) getRedactedFile();
		}
	});
;
});

var hasRedactedFile = false;

function checkRedactedFile()
{
	if(documentViewer.markupPath && documentViewer.markupPath!='')
	{
		if(logFileStatus === "Completed") {
			var onSuccess  = function(req){
				var hasRedacted = req.responseText;
				if(hasRedacted == "true") {
					hasRedactedFile = true;
					displayTool($('.downloadDocument'), true);
				}
				else
				{
					displayTool($('.downloadDocument'), false);
				}
			};
			
			var request = 
			{
				markupPath : documentViewer.markupPath,
				onSuccess : onSuccess
			};
			
			WSRedactedFileStatus(request);
		} else {
			displayTool($('.downloadDocument'), false);
		}
	}

}

function checkRedactedFilePostBurn(attempt)
{
	if(!attempt)
		attempt = 1;
	//if(logFileStatus === "Completed") {
		var iterate = function()
		{
			checkRedactedFilePostBurn(attempt+1);
		};
		
		var onSuccess  = function(req){
			var hasRedacted = req.responseText;
			if(hasRedacted === "true") {
				hasRedactedFile = true;
				if(documentViewer.postRedactGeneration)
					documentViewer.postRedactGeneration(documentViewer.documentAbsPath,true);
			}
			else
			{
				if(attempt<200)
					executeTimeout(iterate,100);
				else
				{
					if(documentViewer.postRedactGeneration)
						documentViewer.postRedactGeneration(documentViewer.documentAbsPath,false);
				}
			}
		};
		
		var request = 
		{
			markupPath : documentViewer.markupPath,
			onSuccess : onSuccess
		};
		
		WSRedactedFileStatus(request);
		
	//}
}

function getRedactedFile()
{
	var url = documentViewer.domain + '/DocViewerWS/rest/document/redactedFile?markupPath=' + documentViewer.markupPath+breakCacheParameter();
	window.location=url;
}
