/*
*
*
*
*
*
*/

$(document).ready(function() {

	/*$('#pageTab, #annotateTab, #redactTab, #searchTab')*/

	$('#collabTab').on('click',function() {
		$('.under-page, .under-annotate, .under-redact, .under-search, .magnify-container').hide();
		$('.collab-container').show();
	});

//	$('.collab-container ul li button').on('click',function() {
//		$(this).toggleClass('active');
//	});

//	$('#collabHighlightBtn').on('click',function() {
//
//		//RESET ALL BUTTON STATES
//		resetAllAnnotationButtonState(); 
//		resetAllRedactionButtonState();
//		closeAllPropertyPanel();
//		$('#textSelection').removeClass('active-state');
//		//RESET ALL BUTTON STATES
//
//		$('.pageContent').toggleClass('text-cursor');
//	});

//	$('#collabStrikeOutBtn').on('click',function() {
//
//		//RESET ALL BUTTON STATES
//		resetAllAnnotationButtonState();
//		resetAllRedactionButtonState();
//		closeAllPropertyPanel();
//		$('#textSelection').removeClass('active-state');
//		//RESET ALL BUTTON STATES
//		
//	});
	
//	//PAGE TAB
//	$('.page-tool-container').children().click(function() {
//		resetCollabBtns();
//	});
//	
//	//ANNOTATE TAB
//	$('.under-annotate > .redact-container > i').click(function() {
//		resetCollabBtns();
//	});
//	
//	//REDACT TAB
//	$('#addRedact, #showRedactModal, #highLightRedactBtn').click(function() {
//		resetCollabBtns();
//	}); 
//	
//	//SEARCH TAB
//	$('#searchOptionId, #searchBtn, #clearSearchBox, .next-prev-btn i').click(function() {
//		resetCollabBtns();
//	});
//	
//	//ZOOM CONTROLS
//	$('.zoomControls i').click(function() {
//		resetCollabBtns();
//	});
//	
//	//RIGHT SIDE 
//	$('.otherMenus').children().click(function() {
//		resetCollabBtns();
//	});
//	$('#redactVisibility, #annotateVisibility').click(function() {
//		resetCollabBtns();
//	});
//	//^END OF RIGHT SIDE 
	
	//TRI-STATE BUTTON FUNCTION
	$('.collabBtnWithProperties').click(function() {
		if($(document.body).width() <= 800) {
			$('.rs-btn').hide('fast');
			//console.log('1');
		}
		$(this).removeClass('selected-tool');

		if($(this).is('.mute')) {
			/*
			 * Should Turn ON Continuous Application
			 */
			$(this).removeClass('selected-tool');
			$( ".collabBtnWithProperties" ).each(function( index ) {
//				$( this ).removeClass('on off').addClass('mute');
				resetAllDrawingButtonState();
			});
			$(this).toggleClass("mute on");
			
			
//			if($(document.body).width() <= 800) {
//				$('#page-zoomtool').addClass('move-top');
//				$('#minimize').click();
//				$('.rs-btn').hide('fast');
//				$('#page-zoomtool').removeClass('move-right');
//			}
			
			
		} else if($(this).is('.on')) {
			/*
			 * Should Turn OFF Continuous Application and turn on SINGLE Application
			 */
			$(this).removeClass('selected-tool');
			$(this).toggleClass("on off");
			
		} else if($(this).is('.off')) {
			/*
			 * Should Turn close Property Box
			 */
			$(this).removeClass('selected-tool');
			$(this).toggleClass("off mute");
			$('#closeAnnotateBox').click();
			
			
//			if($(document.body).width() <= 800) {
//				$('#page-zoomtool').removeClass('move-top');
//			}
			
		}
		
	});

});

//function resetCollabBtns() {
//	$('.collab-container ul li button').removeClass('on off').addClass('mute');
//	$('.pageContent').removeClass('text-cursor');
//}