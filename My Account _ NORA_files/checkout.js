jQuery(document).ready(function(){
	jQuery("#social_login_button").hide();
	jQuery("#social_login").click(function(){
		jQuery("#social_login_button").slideToggle( "slow");
	});
	jQuery("#social_login").click(function(e){
		e.preventDefault();
	});
		
});
