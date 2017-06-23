
$(function(){
	var select = new Dropdown( '.tagset-container', '.tagSet-available-container');
	$('#applyStamp').on('click', function(){
		applyStamp($('input[name=tagName]:checked').val());
	});
});

