(function($){

	$.fn.dragScroll = function(options){
		var allowScroll;
		var settings = $.extend({
			draggable : this,
		},options)
		

		var startPointY,startPointX,endPointY,endPointX,currentPointY,currentPointX,scrollValueY,scrollValueY,
		target = settings.draggable,
		targetParent = target.closest('div#viewerContainer');
		
		target.css({
			"cursor":'url("images/under-page/grab.png"), move'
		});
		
		target.on({
			mousedown:function(e){
				e.preventDefault();
				allowScroll = true;
				startPointY = e.pageY;
				startPointX = e.pageX;
				scrollValueY = targetParent.scrollTop();
				scrollValueX = targetParent.scrollLeft();
				
				target.css({
					"cursor":'url("images/under-page/grab.png"), move'
					/*"-webkit-touch-callout": "none",
					"-webkit-user-select": "none",
					"-khtml-user-select": "none",
					"-moz-user-select": "none",
					"-ms-user-select": "none",
					"user-select": "none"*/
				});
			},

			mouseup:function(e){
				allowScroll = false;
				endPointY = e.pageY;
				endPointX = e.pageX;
				
				target.css({
					"cursor":'url("images/under-page/grab.png"), move'
					/*"-webkit-touch-callout": "none",
					"-webkit-user-select": "none",
					"-khtml-user-select": "none",
					"-moz-user-select": "none",
					"-ms-user-select": "none",
					"user-select": "none"*/
				});
			},

			mouseleave:function(){
				allowScroll=false;
				target.css({
					"cursor" : "auto"
				});
			},

			mouseenter:function(){
				target.css({
					"cursor":'url("images/under-page/grab.png"), move'
					/*"-webkit-touch-callout": "none",
					"-webkit-user-select": "none",
					"-khtml-user-select": "none",
					"-moz-user-select": "none",
					"-ms-user-select": "none",
					"user-select": "none"*/
				});
			},
			mousemove:function(e){
				if(allowScroll)
				{
					currentPointY = e.pageY;
					currentPointX = e.pageX;
					targetParent.scrollTop( scrollValueY + (startPointY - currentPointY ) );
					targetParent.scrollLeft( scrollValueX	+ (startPointX	 - currentPointX) );
				}
			}
		});

		return this;
	};

	$.fn.removeDragScroll = function(options){

		var settings = $.extend({
			"draggable" : this
		},options);

		var target = settings.draggable;

		target.off('mousedown');
		target.off('mouseup');
		target.off('mouseenter');
		target.off('mouseleave');
		target.css('cursor','auto');

		return this;
	}

})(jQuery);