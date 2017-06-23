
var closeSearch = $('#closeSearchMenu'),
searchBox = $('#viewer-searchbox'),
searchWordCol = $('.searchedWord-column'),
searchedWordRowContainer = $('.searchedWord-row-container'),
searchedWordRow = $('.searchedWord-row'),
searchWordControls = $('.searchWord-controls'),
searchWordCount = $('.searchWord-count'),
searchControls = $('.searchControls'),
viewerWrapper = $('#viewer-document-wrapper'),//Parent

//Search Options
matchExact = $('#matchExact'),
matchCase = $('#matchCase'),
wholeWord = $('#wholeWord'),
beginsWith = $('#beginsWith'),
endsWith = $('#endsWith'),
wildCard = $('#wildCard'),




searchResult = searchedWordRowContainer.children('.searchedWord-row').length;

matchExact.on('click',function(){
	var $this = $(this);
	if($this.data('active') == false){
		$this.addClass('selected-searchControl');
		$this.data('active',true);
	}else if ($this.data('active') == true){
		$this.removeClass('selected-searchControl');
		$this.data('active',false);
	}
});

matchCase.on('click',function(){
	var $this = $(this);
	if($this.data('active') == false){
		$this.addClass('selected-searchControl');
		$this.data('active',true);
	}else if ($this.data('active') == true){
		$this.removeClass('selected-searchControl');
		$this.data('active',false);
	}
});


wholeWord.on('click',function(){
	var $this = $(this);
	if($this.data('active') == false){
		$this.addClass('selected-searchControl');
		$this.data('active',true);
	}else if ($this.data('active') == true){
		$this.removeClass('selected-searchControl');
		$this.data('active',false);
	}
});


beginsWith.on('click',function(){
	var $this = $(this);
	if($this.data('active') == false){
		$this.addClass('selected-searchControl');
		$this.data('active',true);
	}else if ($this.data('active') == true){
		$this.removeClass('selected-searchControl');
		$this.data('active',false);
	}
});

endsWith.on('click',function(){
	var $this = $(this);
	if($this.data('active') == false){
		$this.addClass('selected-searchControl');
		$this.data('active',true);
	}else if ($this.data('active') == true){
		$this.removeClass('selected-searchControl');
		$this.data('active',false);
	}
});

wildCard.on('click',function(){
	var $this = $(this);
	if($this.data('active') == false){
		$this.addClass('selected-searchControl');
		$this.data('active',true);
	}else if ($this.data('active') == true){
		$this.removeClass('selected-searchControl');
		$this.data('active',false);
	}
});


searchControls.on({
	mouseenter:function(){
		var $this = $(this);
		$this.css({
			"background-color":"#696969"
		})
	},
	mouseleave:function(){
		var $this = $(this);
		$this.css({
			"background-color":"transparent"
		})
	}
},"img")

//Close the Search Box
closeSearch.on('click',function(){
	$('#showSearchMenu').data('active', false).removeClass('selected-tool');
	searchBox.removeAttr('style');
	searchBox.css({
		'display':'none'
	});
});


searchedWordRow.on({
	mouseenter:function(e){
		var $this = $(this);
		$this.css({
			'background-color':"#e5e5e5"
		})
	},
	mouseleave:function(e){
		var $this = $(this);
		$this.css({
			'background-color':"#fff"
		})
	},

})

//Sort Search Items by Page Number
searchWordCol.on('click',function(){
	var sortBool = false;
});

searchWordControls.on({
	mouseenter:function(){
		var $this = $(this);
		$this.css({
			"background-color":"#696969"
		})
	},
	mouseleave:function(){
		var $this = $(this);
		$this.css({
			"background-color":"#474747"
		})
	},
	mousedown:function(){
		var $this = $(this);
		$this.css({
			"background-color":"#8C8C8C"
		})
	},
	mouseup:function(){
		var $this = $(this);
		$this.css({
			"background-color":"#696969"
		});
	}
},"li")





//Drag Box
/*searchBox.drags();*/

function getSearchedWordRow(){
	searchWordCount.children('.count').text(searchedWordRowContainer.children().length);
}

/*    Lex Script     */

//var hlBtn 			= $('#highLightBtn');
//var hlRedactBtn 		= $('#highLightRedactBtn');
var searchBtns 			= $('.search-btns ul > li');
var label 				= $('span.addon').text();
var searchFieldVal 		= $('#searchBox');
var clearInput			= $('#clearSearchBox');
var min					= $('#min');
var max					= $('#max');
var _temp;

var exactWordOption 	= $('#exactWord');
var caseSentivieOption 	= $('#caseSensitive');

var checkSearchOptionState = $('#searchOptionId').attr('aria-expanded');

$(document).ready( function() {

	$('#searchTab')		.on('click',function() 	{$('#closeAnnotateBox').click();$('#closeRedact').click();});
	exactWordOption		.on('click',function() 	{ $(this).find('i').toggleClass('selected-visibility'); });
	caseSentivieOption	.on('click',function() 	{ $(this).find('i').toggleClass('selected-visibility'); });
//	hlBtn				.on('click',function() 	{ $('.pageContent').toggleClass('text-cursor'); $(this).toggleClass('active-state');		});
//	hlRedactBtn			.on('click',function() 	{ $('.pageContent').toggleClass('text-cursor'); $(this).toggleClass('active-state');		});
	searchBtns 			.on('click',function() 	{ $('.addon').text($(this).find('span').text()); $('.search-content').show(); $(this).toggleClass('active-state');			});
	$('#csBtn')			.on('click',function() 	{ $('.cs-btns').fadeIn('fast'); 					$('.match-btns').hide(); 	});
	$('#begWBtn')		.on('click',function() 	{ $('.match-btns').fadeIn('fast'); 				$('.cs-btns').hide(); 			});
	$('#exactBtn')		.on('click',function() 	{ $('.cs-btns').hide(); 							$('.match-btns').hide(); 	});
	$('#alphaBtn')		.on('click',function() 	{ $('.cs-btns').hide(); 							$('.match-btns').hide(); 	});
	min					.on('click',function() 	{ $('.search-content').hide(); 					$(this).hide(); max.show(); 	});
	max 				.on('click',function() 	{ $('.search-content').show(); 					$(this).hide(); min.show(); 	});
	searchFieldVal 		.attr("maxlength", 50);
	searchFieldVal 		.focusin(function() 	{ searchFieldVal.val(_temp); 													});
	clearInput 			.on('click',function() 	{ _temp = ''; searchFieldVal.val('');  											});
	
	searchFieldVal 		.focusout(function() 	{
		_temp = searchFieldVal.val();
		var a = searchFieldVal.val().length;
		if(a >= 9) { 
			searchFieldVal.val(searchFieldVal.val().substr(0,9) + '...');
		}
	});
	
	$('#searchTab').on('click',function() {
		$('.search-content').hide();
		max.show();
		min.hide();
	});
	
	$( "#clearSearchBox" ).mousedown(function(evt) {
		evt.preventDefault();
	});

	$('#searchOptionId').parent().on('hidden.bs.dropdown', function () {
		  // change color 
		if ($('.dropdown-menu i').hasClass("selected-visibility")) {
			 $('.input-group-btn > button').css({
				 "background-color":"#323D40",
				 "border-color":"#ccc"
			 });
			 $('#searchOptionId').parent().find('.caret').css('color','#fff');
			 
		}else {
			$('.input-group-btn > button').css({
				 "background-color":"#fff",
				 "border-color":"#ccc"
			 });
			$('#searchOptionId').parent().find('.caret').css('color','#575757');
		}
		
		//change title
		
		if($('#exactWord i').hasClass("selected-visibility")) {
			$('#searchOptionId').attr('title','Exact Word or Phrase');
		}else if($('#caseSensitive i').hasClass("selected-visibility")) {
			$('#searchOptionId').attr('title','Case Sensitive');
		}else {
			$('#searchOptionId').attr('title','Search Options');
		}
		
		$( ".dropdown-menu i" ).each(function() {
			if($('.dropdown-menu i.selected-visibility').length == 2) {
				$('#searchOptionId').attr('title','Exact Word or Phrase & Case Sensitive');
			}
		});
		
	});
	
});

/*    Lex Script     */
