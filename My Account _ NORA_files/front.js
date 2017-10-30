
jQuery( document ).ready(function( $ ) {
	$('.searchandfilter input[type=radio], .searchandfilter input[type=hidden]').on('change', function() {
	    $(this).closest("form").submit();
	});
});