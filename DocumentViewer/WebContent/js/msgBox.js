
	var DVNotif = $('#DV-Notif'),
	IconNotif = $('.icon-Notif'),
	Textmsg = $('#textMsg'),
	closeNotif = $('#close-Notif');


	closeNotif.click(function(){
		DVNotif.animate({
			'top': 0
		},500,'linear',function(){
				$(this).css({
					'display':'none',
					'visibility':'hidden'
				});
		});
	});

	DVNotif.on('click',function(){
		//closeNotif.trigger('click');
	});

	$(document).keyup(function(e){
		if (e.keyCode == 27){
			DVNotif.trigger('click');
		}
	});

	function clearAlert()
	{
		DVNotif.css({'top' : '0','display' : 'none','visibility' : 'hidden'});
	}
	
	function showAlert(msg,msgtype){
		clearAlert();
		switch(msgtype){
			case "accept":
			IconNotif.attr("src","images/messagebox/accept.png");
			//closeNotif.attr("class","closeAccept");
			closeNotif.addClass('closeAccept');
			break;
			case "warning":
			IconNotif.attr("src","images/messagebox/warning.png");
			//closeNotif.attr("class","closeWarning");
			closeNotif.addClass('closeWarning');
			break;
			case "error":
			IconNotif.attr("src","images/messagebox/error.png");
			//closeNotif.attr("class","closeError");
			closeNotif.addClass('closeError');
			break;
		}

		DVNotif.css({
			'display':'block',
			'visibility':'visible'
		})
		.attr("class",msgtype).animate({
			'top':'85px',
			'opacity':1
		},600);
		Textmsg.text(msg);
	}
	//Showing the Message
	//showAlert("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras porta lobortis ex,","error");