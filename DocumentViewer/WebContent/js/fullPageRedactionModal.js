
/*     FOR FULL PAGE REDACTION MODAL     */

var temp = [];

$(document).ready(function() {
	
	/**
	 * Close the Properties that has conflict with the Apply Button
	 */
	
	$('#showRedactModal').on('click',function() {
		$('#closeRedact').click();
		$('#closeAnnotateBox').click();
		$('#addLine, #addArrow, #addSquare, #addCircle, #addText, #highLightBtn, #highLightRedactBtn, #addRedact').removeClass('on off').addClass('mute');
	});
	
	/**
	 * Close the Properties that has conflict with the Apply Button
	 */
	
	/*---------------------------------------------------------------------------*/
		
	$('#redactionBtn').on('click',function() {
		if($('#pagesId').val().length == 0) {
			$('#page-note').text('Please Enter pages.');
			$('#page-note').fadeIn('fast');
		} else {
			var numRange = getPageRange(temp[0]);			
			if (numRange !== null) {
				$('#cancelfpRedactionBtn').click();
				createFullPageRedact(numRange, $('#selectReason').find(":selected")[0].value);
			} else {
				$('#page-note').text('Invalid Page range.');
				$('#page-note').fadeIn('fast');
			}
		}
	});
	
	$('#pagesId').focus(function() {
		$('#page-note').fadeOut('fast');
	});
	
	/*---------------------------------------------------------------------------*/
		
	/**
	 * Ellipsis on SearchField for Safari Issue
	 */
	$('#pagesId').focusout(function() 	{
		temp[0] = $('#pagesId').val();
		var a = $('#pagesId').val().length;
		if(a >= 30) $('#pagesId').val($('#pagesId').val().substr(0,30) + '...');
	});
	$('#pagesId').focusin(function() { $('#pagesId').val(temp[0]); });
	/**
	 * Ellipsis on SearchField for Safari Issue
	 */
	
	/*---------------------------------------------------------------------------*/
	
	/**
	 * Validation on page entries upon entering numbers
	 */
	$('#pagesId').keypress(function (e) {
	    var regex = new RegExp("^[0-9,\b\-]+$");
	    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
	    if (regex.test(str)) { return true; }

	    e.preventDefault();
	    return false;
	});
	/**
	 * End of Validation on page entries upon entering numbers
	 */
	
	$('#cancelfpRedactionBtn').on('click',function() { 
		$('#pagesId').val(''); 
		$('#page-note').hide();
		temp[0] = '';
	});
	
	/*---------------------------------------------------------------------------*/
	
	/**
	 * This is for fitToWidth button only
	 */
	
	//$('#fitToWidth').on('click',function() { $(this).toggleClass('active-state');});
	
	/**
	 * End of fitToWidth button
	 */
	
	/*---------------------------------------------------------------------------*/
});

/*     FOR FULL PAGE REDACTION MODAL     */

/**
 * Get page entries from a string of 1,2-5,9 etc
 * http://codereview.stackexchange.com/questions/26125/getting-all-number-from-a-string-like-this-1-2-5-9
 * @param pageRange
 * @returns {Array}
 */
function getPageRange(pageRange){
	var numbers = [];
	var entries = pageRange.split(',');
	var len = entries.length;
	
	var i, entry, low, high, range;
	
	for (i = 0; i < len; i++) {
		entry = entries[i];
		if (+entry > pageCollection.length || 0 >= +entry) {
			return null;
		}
		//shortcut for testing a -1
		if(!~entry.indexOf('-')){
			//absence of dash, must be a number
			//force to a number using +
			numbers.push(+entry);
		} else {
			if (entry.split('-').length != 2) {
				return null
			}
			range = entry.split('-');
			
			low = +range[0];
			high = +range[1];
			
			if (high < low) {
				//do not accept wrong sequence for range
				return null;
			} else {
				while (low <= high) {
					numbers.push(low++);
				}
			}
		}
	}
	return numbers;
}