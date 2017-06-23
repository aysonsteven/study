
function Dropdown(target,children){
	this.select = $(target);
	this.container = this.select.children(children);
	this.init();
}

Dropdown.prototype = {
	init:function(){
		var obj = this;
		obj.select.on('click',function(e){
			obj.container.toggleClass('active');
			return false;
		});
	}
}
