!function ($) {

    "use strict";

    // TABCOLLAPSE CLASS DEFINITION
    // ======================

    var TabCollapse = function (el, options) {
        this.options   = options;
        this.$tabs  = $(el);

        this._accordionVisible = false; //content is attached to tabs at first
        this._initAccordion();
        this._checkStateOnResize();


        // checkState() has gone to setTimeout for making it possible to attach listeners to
        // shown-accordion.bs.tabcollapse event on page load.
        // See https://github.com/flatlogic/bootstrap-tabcollapse/issues/23
        var that = this;
        setTimeout(function() {
          that.checkState();
        }, 0);
    };

    TabCollapse.DEFAULTS = {
        accordionClass: 'visible-xs',
        tabsClass: 'hidden-xs',
        accordionTemplate: function(heading, groupId, parentId, active) {
            return  '<div class="panel panel-default">' +
                    '   <div class="panel-heading">' +
                    '      <h4 class="panel-title">' +
                    '      </h4>' +
                    '   </div>' +
                    '   <div id="' + groupId + '" class="panel-collapse collapse ' + (active ? 'in' : '') + '">' +
                    '       <div class="panel-body js-tabcollapse-panel-body">' +
                    '       </div>' +
                    '   </div>' +
                    '</div>'

        }
    };

    TabCollapse.prototype.checkState = function(){
        if (this.$tabs.is(':visible') && this._accordionVisible){
            this.showTabs();
            this._accordionVisible = false;
        } else if (this.$accordion.is(':visible') && !this._accordionVisible){
            this.showAccordion();
            this._accordionVisible = true;
        }
    };

    TabCollapse.prototype.showTabs = function(){
        var view = this;
        this.$tabs.trigger($.Event('show-tabs.bs.tabcollapse'));

        var $panelHeadings = this.$accordion.find('.js-tabcollapse-panel-heading').detach();

        $panelHeadings.each(function() {
            var $panelHeading = $(this),
            $parentLi = $panelHeading.data('bs.tabcollapse.parentLi');

            var $oldHeading = view._panelHeadingToTabHeading($panelHeading);

            $parentLi.removeClass('active');
            if ($parentLi.parent().hasClass('dropdown-menu') && !$parentLi.siblings('li').hasClass('active')) {
                $parentLi.parent().parent().removeClass('active');
            }

            if (!$oldHeading.hasClass('collapsed')) {
                $parentLi.addClass('active');
                if ($parentLi.parent().hasClass('dropdown-menu')) {
                    $parentLi.parent().parent().addClass('active');
                }
            } else {
                $oldHeading.removeClass('collapsed');
            }

            $parentLi.append($panelHeading);
        });

        if (!$('li').hasClass('active')) {
            $('li').first().addClass('active')
        }

        var $panelBodies = this.$accordion.find('.js-tabcollapse-panel-body');
        $panelBodies.each(function(){
            var $panelBody = $(this),
                $tabPane = $panelBody.data('bs.tabcollapse.tabpane');
            $tabPane.append($panelBody.contents().detach());
        });
        this.$accordion.html('');

        if(this.options.updateLinks) {
            var $tabContents = this.getTabContentElement();
            $tabContents.find('[data-toggle-was="tab"], [data-toggle-was="pill"]').each(function() {
                var $el = $(this);
                var href = $el.attr('href').replace(/-collapse$/g, '');
                $el.attr({
                    'data-toggle': $el.attr('data-toggle-was'),
                    'data-toggle-was': '',
                    'data-parent': '',
                    href: href
                });
            });
        }

        this.$tabs.trigger($.Event('shown-tabs.bs.tabcollapse'));
    };

    TabCollapse.prototype.getTabContentElement = function(){
        var $tabContents = $(this.options.tabContentSelector);
        if($tabContents.length === 0) {
            $tabContents = this.$tabs.siblings('.tab-content');
        }
        return $tabContents;
    };

    TabCollapse.prototype.showAccordion = function(){
        this.$tabs.trigger($.Event('show-accordion.bs.tabcollapse'));

        var $headings = this.$tabs.find('li:not(.dropdown) [data-toggle="tab"], li:not(.dropdown) [data-toggle="pill"]'),
            view = this;
        $headings.each(function(){
            var $heading = $(this),
                $parentLi = $heading.parent();
            $heading.data('bs.tabcollapse.parentLi', $parentLi);
            view.$accordion.append(view._createAccordionGroup(view.$accordion.attr('id'), $heading.detach()));
        });

        if(this.options.updateLinks) {
            var parentId = this.$accordion.attr('id');
            var $selector = this.$accordion.find('.js-tabcollapse-panel-body');
            $selector.find('[data-toggle="tab"], [data-toggle="pill"]').each(function() {
                var $el = $(this);
                var href = $el.attr('href') + '-collapse';
                $el.attr({
                    'data-toggle-was': $el.attr('data-toggle'),
                    'data-toggle': 'collapse',
                    'data-parent': '#' + parentId,
                    href: href
                });
            });
        }

        this.$tabs.trigger($.Event('shown-accordion.bs.tabcollapse'));
    };

    TabCollapse.prototype._panelHeadingToTabHeading = function($heading) {
        var href = $heading.attr('href').replace(/-collapse$/g, '');
        $heading.attr({
            'data-toggle': 'tab',

            'data-parent': ''
        });
        return $heading;
    };

    TabCollapse.prototype._tabHeadingToPanelHeading = function($heading, groupId, parentId, active) {
        $heading.addClass('js-tabcollapse-panel-heading ' + (active ? '' : 'collapsed'));
        $heading.attr({
            'data-toggle': 'collapse',
            'data-parent': '#' + parentId,

        });
        return $heading;
    };

    TabCollapse.prototype._checkStateOnResize = function(){
        var view = this;
        $(window).resize(function(){
            clearTimeout(view._resizeTimeout);
            view._resizeTimeout = setTimeout(function(){
                view.checkState();
            }, 100);
        });
    };


    TabCollapse.prototype._initAccordion = function(){
        var randomString = function() {
            var result = "",
                possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for( var i=0; i < 5; i++ ) {
                result += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return result;
        };

        var srcId = this.$tabs.attr('id'),
            accordionId = (srcId ? srcId : randomString()) + '-accordion';

        this.$accordion = $('<div class="panel-group ' + this.options.accordionClass + '" id="' + accordionId +'"></div>');
        this.$tabs.after(this.$accordion);
        this.$tabs.addClass(this.options.tabsClass);
        this.getTabContentElement().addClass(this.options.tabsClass);
    };

    TabCollapse.prototype._createAccordionGroup = function(parentId, $heading){
        var tabSelector = $heading.attr('data-target'),
            active = $heading.data('bs.tabcollapse.parentLi').is('.active');

        if (!tabSelector) {
            tabSelector = $heading.attr('href');
            tabSelector = tabSelector && tabSelector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }

        var $tabPane = $(tabSelector),
            groupId = $tabPane.attr('id') + '-collapse',
            $panel = $(this.options.accordionTemplate($heading, groupId, parentId, active));
        $panel.find('.panel-heading > .panel-title').append(this._tabHeadingToPanelHeading($heading, groupId, parentId, active));
        $panel.find('.panel-body').append($tabPane.contents().detach())
            .data('bs.tabcollapse.tabpane', $tabPane);

        return $panel;
    };



    // TABCOLLAPSE PLUGIN DEFINITION
    // =======================

    $.fn.tabCollapse = function (option) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('bs.tabcollapse');
            var options = $.extend({}, TabCollapse.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data) $this.data('bs.tabcollapse', new TabCollapse(this, options));
        });
    };

    $.fn.tabCollapse.Constructor = TabCollapse;


}(window.jQuery);
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

jQuery(document).ready(function($) {
    
    if($( "#field_2_4" ).hasClass( "gfield_error" )){
       var modal = document.getElementById('myModal');
        var button_modal = document.getElementById('go_to_dashboard');
        var span = document.getElementsByClassName("close")[0];
        modal.style.display = "block";
        span.onclick = function() {
            modal.style.display = "none";
            window.location.href = "/my-account";
        }

        button_modal.onclick = function() {
            modal.style.display = "none";
            window.location.href = "/my-account";
        }
                             
    }


    $('.datepicker.mdy').change(function(){
        createNewDate();
        
    });
    
    if($('.datepicker.mdy').val() !=''){
        createNewDate();
    }
    
    function createNewDate(){
        var current_date = $('.datepicker.mdy').val();
        var m_names = new Array("Jan", "Feb", "Mar", 
        "Apr", "May", "Jun", "Jul", "Aug", "Sep", 
        "Oct", "Nov", "Dec");
        
        var d = new Date("'" + current_date + "'");
        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        var curr_year = d.getFullYear();
        var new_formate_date = curr_date + "/" + m_names[curr_month] 
        + "/" + curr_year;
        $('#show-date-in-page').attr('value', new_formate_date);
        
    }


    $('#input_1_2').change(function() {
        var email_validate = $('#input_1_2').val();
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if(re.test(email_validate) == false ){ 
            $('#input_1_2').css('color','red'); 
                return (false);
        }
    });

    

    var search_input = false;

	// External Jump Links
    $('html, body').hide();

    if (window.location.hash) {
        setTimeout(function() {
            $('html, body').scrollTop(0).show();
            $('html, body').animate({
                //scrollTop: $(window.location.hash).offset().top - 10
                }, 1000)
        }, 0);
    }
    else {
        $('html, body').show();
    }

    $('#search-tabs-accordion').on('shown.bs.collapse', function (e) {
        var offset = $(this).find('.collapse.in').prev('.panel-heading');
        if(offset) {
            $('html,body').animate({
                scrollTop: $(offset).offset().top -20
            }, 500);
        }
    });

    var orderby = getUrlParameter('orderby');
    if(orderby == 'date' || orderby == 'rating' || orderby == 'views'){
        var button_text = 'Order by ' + $(".orderby .dropdown-menu li a[data-order=" + orderby + "]").text() + ' <span class="caret"></span>';
        $(".orderby.dropdown").find(".btn:first-child").html(button_text);
        $('#hidden_orderby').val(orderby);
    }
    // Sortby dropdown
    $(".orderby .dropdown-menu li a").click(function(e){

        e.preventDefault();
        var button_text = 'Order by ' + $(this).text() + ' <span class="caret"></span>';
        //set the button text
        $(this).parents(".dropdown").find(".btn:first-child").html(button_text);
        //trigger the form submit
        $('#hidden_orderby').val($(this).attr('data-order')).trigger("change");
   });

    // Load More
    load_more = function(list){
        size_li = $(list).children("article").size();
        $(list).find('article').hide();
        x=2;
        if(x >= size_li){
            $(list).find('.show-more').hide();
        }
        $(list).children('article:lt('+x+')').show();
        $(list).find('.show-more').click(function () {
            x= x + 2;
            $(list).children('article:lt('+x+')').show();
            if(x >= size_li){
                $(list).find('.show-more').hide();
            }
        });

        /*
        $(list).find('.show-less').click(function () {
            x=(x-1<=0) ? 3 : x-3;
            $(list).children('article').not(':lt('+x+')').hide();
        });
        */
    }
    load_more('.author #author-reviews');
    load_more($('.author #book-solutions'));
    load_more($('.author #articles'));
    load_more($('.author #reference-papers'));
    load_more($('.author #case-studies'));

    if($('#non_author').val() == 0){
        $('#field_2_3').hide();     
    };

    $('#field_2_5').change(function(){
       if($('#non_author').val() == 0){
            $('#field_2_3').hide();     
        }
    });
    $('.search_input').change(function(){
          search_input = true;
    });
    
    $('#select_search').change(function(){
        if(search_input == false){
            $('.search_input').attr('value', '');
        }
        var value_c = $('#select_search').attr('value'); 
        var value_s = $('.search_input').attr('value');
        if(value_s!=''){
            var result = value_s + " " + value_c;
        }else{
            var result = value_c;
        }
        $('.search_input').attr('value', result);
        $('#searchsubmit').click();
    });
  
    setTimeout(function() {
        $('.authors_container .selectized').change(function(){
            $('.click_filter_button').click();
        });
    }, 0);


    var servise_order; var difficulty_level; var page_count;

   $('#gform_8').change(function(){
        var total_price = 9;

        if(jQuery('#input_8_1').val() == 'Project type 2'){
            total_price += 1;
        }else if(jQuery('#input_8_1').val() == 'Project type 3'){
            total_price += 2;
        }else if(jQuery('#input_8_1').val() == 'Project type 4'){
            total_price += 3;
        }else{
            total_price += 0;
        }
        
        if(jQuery('#input_8_3').val() == 'Lower tier'){
            total_price *= 1.0;
        }else if(jQuery('#input_8_3').val() == 'Mid tier'){
            total_price *= 1.1;
        }else{
            total_price *= 1.2;
        }
        if(jQuery('#input_8_2').val() != ''){
            total_price = parseInt(jQuery('#input_8_2').val()) * total_price;
        }
        var deadline = new Date(jQuery('#input_8_4').val());
        var today = new Date();
        
        timeDiff = deadline.getTime() - today.getTime();
        diference_day = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        if(diference_day > 0){
            if(diference_day >= 10){
                total_price = total_price * 1;
            }else if(diference_day >= 6){
                total_price = total_price * 1.2;
            }else if(diference_day >= 5){
                total_price = total_price * 1.5;
            }else if(diference_day >= 4){
                total_price = total_price * 1.8;
            }else if(diference_day >= 3){
                total_price = total_price * 2.2;
            }else if(diference_day >= 2){
                total_price = total_price * 2.5;
            }else if(diference_day >= 1){
                total_price = total_price * 3;
            }            
        }

       $(document).on('input change', '#range_field', function() {
           $('#input_8_2').val( $(this).val() );
       });
       document.getElementById('total_prise_for_order').innerHTML = '<div class="calculate_order_wrap"><span id="esimate">Price</span> <br /> <span id="total-prise">$' + total_price.toFixed(1) +'</span></div>';
       $('#input_8_6').val(total_price.toFixed(1));


       
        
    });
   /* $(document).ready(function() {
        $("#ex6").slider();
        $("#ex6").on("slide", function(slideEvt) {
            $("#input_8_2").val(slideEvt.value);
        });}); */

    jQuery('#text_message').addClass('ShowMessage');
    jQuery('#ShowMessage').click(function(){
        if(jQuery('#text_message').hasClass('ShowMessage')){
            jQuery('#text_message').removeClass('ShowMessage');
        }else{
            jQuery('#text_message').addClass('ShowMessage');
        }
    });

    $('.pay_order_button').click(function(event){
        var modal_id = $(this).attr("order-id");
        var modal = document.getElementById('show-pay-button-'+modal_id);
        var button_modal = document.getElementById('go_to_dashboard-'+modal_id);
        var span = document.getElementsByClassName("close-"+modal_id)[0];
        modal.style.display = "block";
        span.onclick = function() {
            modal.style.display = "none";
        }

        button_modal.onclick = function() {
            modal.style.display = "none";
            $('#pay_user_order-'+modal_id).click();
            $('#pay_order_button').hide();
        }
    });
    
});

jQuery(document).ready(function(){
    
    var iframe = jQuery('#input_2_9_ifr', parent.document.body);
        iframe.height(jQuery(document.body).height());
	// Set the first tabs as active
	jQuery('.nav-tabs li:first-child, .tab-content .tab-pane:first-child').addClass('active');

  // Carousels
    $('.authors-carousel').slick({
        initialSlide: 0,
        centerMode: true,
        centerPadding: '0',
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
        draggable:false,
        autoplay: false,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 991,
                settings: {
                    arrows: true,
                    vertical: true,
                    centerMode: false,
                    centerPadding: '0',
                    draggable:true,
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 567,
                settings: {
                    arrows: true,
                    vertical: true,
                    centerMode: false,
                    centerPadding: '0',
                    draggable:true,
                    slidesToShow: 2
                }
            }
        ]
    });

    $('.testimonial-carousel').slick({
        initialSlide: 0,
        centerMode: false,
        centerPadding: '0',
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        draggable:false,
        autoplay: false,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 991,
                settings: {
                    arrows: true,
                    vertical: true,
                    centerMode: false,
                    centerPadding: '0',
                    draggable:true,
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 567,
                settings: {
                    arrows: true,
                    vertical: true,
                    centerMode: false,
                    centerPadding: '0',
                    draggable:true,
                    slidesToShow: 2
                }
            }
        ]
    });
    $('.how_t_a_t_slider_listing').slick({
        initialSlide: 0,
        centerMode: true,
        centerPadding: '0',
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        draggable:false,
        autoplay: false,
        autoplaySpeed: 3000,
        vertical: true,
        dots: true,
        arrows: false,
        responsive: [
            {
                breakpoint: 991
            },
            {
                breakpoint: 567,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    });

    $('.how_to_and_tips_slider_wrapper').slick({
        initialSlide: 0,
        centerMode: true,
        centerPadding: '0',
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        draggable:false,
        autoplay: false,
        autoplaySpeed: 3000
    });
    $('.cat-post-carousel').on('init', function (slick) {

        // check to see if there are one or less slides
        if (!($('.cat-post-carousel .slick-slide').length > 1)) {

            // remove arrows
            $('.cat-post-carousel .slider__arrow').hide();
            $('.single_services_slider_content').css("height", "400px");
            $('.single_services_slider_content').css("overflow", "hidden");

        } else if (!($('.cat-post-carousel .slick-slide').length > 2)) {
            $('.single_services_slider_content').css("height", "800px");
            $('.single_services_slider_content').css("overflow", "hidden");
        }

    });

    $('.cat-post-carousel').slick({
        initialSlide: 0,
        centerMode: false,
        centerPadding: '0',
        dots: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
        draggable:false,
        autoplay: false,
        autoplaySpeed: 3000,
        arrows: true,
        vertical: true,
        responsive: [
            {
                breakpoint: 991,
                settings: {
                    vertical: true,
                    centerMode: false,
                    centerPadding: '0',
                    draggable:true,
                    slidesToShow: 3,
                    arrows: false

                }
            },
            {
                breakpoint: 567,
                settings: {
                    vertical: true,
                    centerMode: false,
                    centerPadding: '0',
                    draggable:true,
                    slidesToShow: 3,
                    arrows: false
                }
            }
        ]
    });
    if ($(window).width() < 992) {
        $('.services_listing_tabs').slick({
            initialSlide: 0,
            centerMode: false,
            centerPadding: '0',
            dots: false,
            slidesToShow: 5,
            slidesToScroll: 1,
            infinite: true,
            draggable:false,
            autoplay: false,
            autoplaySpeed: 3000,
            arrows: true,
            vertical: false,
            responsive: [
                {
                    breakpoint: 767,
                    settings: {
                        centerMode: false,
                        centerPadding: '0',
                        draggable:true,
                        slidesToShow: 2,
                        arrows: true
                    }
                }
            ]
        });
        $('.assignment_type_tabs').slick({
            initialSlide: 0,
            centerMode: false,
            centerPadding: '0',
            dots: false,
            slidesToShow: 5,
            slidesToScroll: 1,
            infinite: true,
            draggable:false,
            autoplay: false,
            autoplaySpeed: 3000,
            arrows: true,
            vertical: false,
            responsive: [
                {
                    breakpoint: 767,
                    settings: {
                        centerMode: false,
                        centerPadding: '0',
                        draggable:true,
                        slidesToShow: 2,
                        arrows: true
                    }
                }
            ]
        });
    }
    else {
    }



});


// Collapsable Filter
jQuery(document).ready( function() {
    function prepareList() {
        var current_url = window.location.href;
        if ((current_url.indexOf('how-to-n-tips') + 1) == 0){
            jQuery('.expList').find('li li').has("ul")
            .click( function(event) {
                if (this == event.target) {

                    jQuery(this).toggleClass('collapsed');
                    jQuery(this).toggleClass('expanded');
                    jQuery(this).children('ul').toggle('medium');
                }

            })
            .addClass('collapsed')
            .children('ul').hide();
        }else{
            //$('.searchandfilter ul :not(*li:first-child)').hide();
            $('.searchandfilter li ').hide();
            $('.searchandfilter ul *li:first-child ').show();
            $('.searchandfilter ul li ul *li ').show();
            $('.searchandfilter ul li ul li:first-child ').hide();
        }
    }
    prepareList();

    jQuery('.current-cat-parent').removeClass('collapsed').addClass('expanded').children('ul').show();
    jQuery('.current-cat-parent').removeClass('collapsed').addClass('expanded').children('ul').show();;
});
// Popup div
jQuery(document).ready( function() {
    $('#menu-main-menu, .woocommerce-account .sidebar .sidebar-menu').slicknav({
        label: '',
        beforeOpen: function(){
            $('.slicknav_menu').addClass('opened');
        },
        afterClose: function(){
            $('.slicknav_menu').removeClass('opened');
        }
    });
    $('.price-calculator select').on('change', function(){
        var fields = {'difficulty_level': 100, 'citations_count': 0, 'pages_count': 0};
        for (var k in fields){
            if (fields.hasOwnProperty(k)) {
                var curr_val = parseInt($('.price-calculator select[name=' + k + ']').val());
                fields[k] = curr_val > 1 ? curr_val : fields[k];
            }
        }
        var price = fields.difficulty_level/100 * (fields.citations_count + fields.pages_count);
        $('.estimate span.price').text(price);
    });
    jQuery('.faq > div').on('click', '.expand-sibling', function(e){
        jQuery(this).toggleClass('expanded');
        jQuery(this).next().slideToggle(300);
    });

    jQuery('.top-filter a[data-action]').on('click', function(e){
        e.preventDefault();

        // var action = String(jQuery(this).data('action'));
        var url = [location.protocol, '//', location.host, location.pathname].join('');
        var data_str = '?';
        jQuery('.top-filter').find(':input').each(function() {
            var key = jQuery( this ).attr('name');
            var val = jQuery( this ).val();
            if (key != 'undefined' && val != 'undefined' && val > 0) data_str = data_str + key + '=' + val + '&';
        });

        window.location.href = url + data_str;
    });

  /*  if(document.documentElement.clientWidth > 1200){
        setTimeout(function(){
            var content_height = jQuery('.woocommerce-account .main-content').height();
            jQuery('.woocommerce-account .sidebar').css('min-height', content_height + 'px');
        }, 300);
    } */

    jQuery('a[popup]').on("click", function(e){
        e.preventDefault();
        var target = jQuery(this).attr('popup');
        $.magnificPopup.open({
            items: {
                src: '.' + target,
                type: 'inline'
            }
        });
    });

    jQuery('a.btn-details').on("click", function(e){
        e.preventDefault();
        var target = jQuery(this).data('target');
        var alt = jQuery(this).data('alt-text');
        var curr = jQuery(this).text();

        jQuery('.' + target).toggleClass('hidden');
        jQuery(this).toggleClass('less');
        jQuery(this).data('alt-text', curr);
        jQuery(this).text(alt);
    });
    
    
    
    jQuery('a.update-deadline').on("click", function(e){
        console.log(2134);
    });

    jQuery('#order-search,  #order-search_orders').on('keyup', function (e) {
        if (e.keyCode == 13) {
            var order_id = jQuery(this).val();
            var endpoint = jQuery(this).data('target');
            window.location.href = endpoint + '?order_id=' + order_id;
        }
    });

    jQuery('.deadline form').on("submit", function(e){
        e.preventDefault();
        var form = $( this );
        var form_data = form.serializeArray();
        jQuery.ajax({
            type: "POST",
            url: nora.url,
            data: {
                action: "nora_deadline",
                reason: form_data
            },
            success:function(data){
                var message = (data == 'OK') ? '.deadline_success' : '.deadline_error';
                form.replaceWith(jQuery(message).html())
                setTimeout(function(){
                    location.reload();
                }, 600);
            },
            error: function(errorThrown){
                console.log(errorThrown);
            }

        });
    });

    jQuery('.refund form').on("submit", function(e){
        e.preventDefault();
        var form = $( this );
        var form_data = form.serializeArray();
        jQuery.ajax({
            type: "POST",
            url: nora.url,
            data: {
                action: "nora_refund",
                reason: form_data
            },
            success:function(data){
                var message = (data == 'OK') ? '.refund_success' : '.refund_error';
                form.replaceWith(jQuery(message).html())
                setTimeout(function(){
                    location.reload();
                }, 600);
            },
            error: function(errorThrown){
                console.log(errorThrown);
            }

        });
    });
    
    
    jQuery('.button_action').on("click", function(e){
       $('.' + $(this).attr('popup')).find('input[name=order_id]').val($(this).attr('order_id')); 
    });
    
    jQuery('.cancel form').on("submit", function(e){
        e.preventDefault();
        var form = $( this );
        var form_data = form.serializeArray();
        jQuery.ajax({
            type: "POST",
            url: nora.url,
            data: {
                action: "nora_cancel",
                reason: form_data
            },
            success:function(data){
                var message = (data == 'OK') ? '.cancel_success' : '.cancel_error';
                form.replaceWith(jQuery(message).html())
                setTimeout(function(){
                    location.reload();
                }, 600);
            },
            error: function(errorThrown){
                console.log(errorThrown);
            }

        });
    });
    jQuery('.current-cat-parent').removeClass('collapsed').addClass('expanded').children('ul').show();
    
    
/*document.getElementById("name_file_upload").innerHTML = '';  
        names = list_files.split(',');
        for (var i = 0; i < $(this).get(0).files.length; ++i) {
            names.push($(this).get(0).files[i]);
        }
       
        for (var i = 0; i < names.length; ++i) {
            if(names[i] != undefined && names[i] != ''){
                document.getElementById("name_file_upload").innerHTML += names[i] + '  <button onclick="canselUploadFile('+i+')">X</button>  <br/>';
            } 
        }
         */



    var names = [];
    var all_name = '';


    jQuery(".note_attachment").click(function(){
        var count_file = jQuery("#count_files").val();
        jQuery("#note_attachment" + count_file).click();
        selectNextFile(count_file, '');
    });

   function selectNextFile(count_files, delete_element){

        document.getElementById("name_file_upload").innerHTML = '';
        all_name = '';
        add_list = jQuery('#new_list_file_upload').val().split(',');

        if(delete_element != undefined && delete_element != ''){
            delete names[delete_element];
        }

        jQuery("#note_attachment" + count_files).change(function() {
            var list_files = document.getElementById("note_attachment" + count_files).files;

            function addHidden(theForm, key, id) {
                var input = document.createElement('input');
                count_files++;
                input.type = 'file';
                input.name = key; // 'the key/name of the attribute/field that is sent to the server
                input.id = id + count_files;
                theForm.appendChild(input);
                $("#note_attachment" + count_files).addClass('note_attachment_input').attr('multiple', 'multiple');
                $("#count_files").attr('value', count_files);


            }
            var theForm = document.forms['chat-message'];
            addHidden(theForm, 'note_attachment[]', 'note_attachment');

            remove_id = jQuery('#delete_id').val();
            for (var i = 0; i < remove_id.length; ++i) {
               if(remove_id != '' && remove_id != undefined){
                    delete names[remove_id[i]];
               }
            }

            console.log(names);

            for (var i = 0; i < list_files.length; ++i) {
                names.push(list_files[i]);
            }

            console.log(names);

            for (var i = 0; i < names.length; ++i) {

                if(names[i] != undefined && names[i] != ''){
                    document.getElementById("name_file_upload").innerHTML += names[i]['name'] + '  <button onclick="canselUploadFile('+i+')">X</button>  <br/>';
                    all_name += names[i]['name'] + ",";

                }
            }

            jQuery('#new_list_file_upload').val(all_name);

        });
    } 



  /*  jQuery('.blog-detail').addClass('allText');
    jQuery("#read_more").click(function() {
        jQuery('.blog-detail').removeClass('allText');
        jQuery("#read_more").css('display', 'none');
    });
    */
    //jQuery(".actions").addClass('show-button');
    jQuery(".action_button").live('click', function() {
        var id = $(this).attr('id');
        if(jQuery(".actions_"+id).hasClass('show-button')){
            jQuery(".actions_"+id).removeClass('show-button');
        }else{
            jQuery(".actions_"+id).addClass('show-button');
        }
    });

});

function canselUploadFile(id_upload) {

    new_list = jQuery('#new_list_file_upload').val().split(',');
    delete new_list[id_upload];
    document.getElementById("name_file_upload").innerHTML = '';

    for (var i = 0; i < new_list.length; i++) {
        if(new_list[i] != undefined && new_list[i] != ''){
            document.getElementById("name_file_upload").innerHTML +=  new_list[i] + '  <button onclick="canselUploadFile('+i+')">X</button>  <br/>';
        }
    }
    var add_id = jQuery('#delete_id').val();
    add_id += id_upload + ",";
    jQuery('#delete_id').attr('value', add_id);
    jQuery('#new_list_file_upload').val(new_list);
}


// Naty scripts
jQuery(document).ready( function() {

//Naty short description content order details
    var visibleChar = 380;
    var ellipsestext = "...";
    var moretext = "Read More";
    var lesstext = "Read Less";
    jQuery('.order-piece .project-description p').each(function() {
        var content = jQuery(this).html();

        if(content.length > visibleChar) {

            var c = content.substr(0, visibleChar);
            var h = content.substr(visibleChar-1, content.length - visibleChar);

            var html = c + '<span class="moreellipses">' + ellipsestext+ '</span><span class="morecontent"><span>' + h + '</span><a href="#" class="morelink">' + moretext + '</a></span>';

            jQuery(this).html(html);
        }

    });
    jQuery(".morelink").click(function(e){
        e.preventDefault();
        if(jQuery(this).hasClass("less")) {
            jQuery(this).removeClass("less");
            jQuery(this).html(moretext);
        } else {
            jQuery(this).addClass("less");
            jQuery(this).html(lesstext);
        }
        jQuery(this).parent().prev().slideToggle(300);
        jQuery(this).prev().slideToggle(300);;
        return false;
    });

    // New project form tricger file attachment
    jQuery('.attache_file').click(function(){
        jQuery('.attachment_form input[type=file]').trigger( "click" );
        });

    // Header messages notification
    jQuery('#text_message').addClass('ShowMessage');

    jQuery('#ShowMessage').click(function(){
        if(jQuery('#text_message').hasClass('ShowMessage')){
            jQuery('#text_message').removeClass('ShowMessage');
        }else{
            jQuery('#text_message').addClass('ShowMessage');
        }
    });

    // Hide  dashboard header notification
    if(jQuery('#all_message').text() == '0' ){
        jQuery('#all_message').parent().addClass('message_wrapper_empty');
    } else {
        jQuery('#all_message').parent().removeClass('message_wrapper_empty');
    }

    // How to dashboard account close button action
    jQuery('.close_howto').on('click', function(){
        jQuery('.close_howto').parent().fadeOut('300');
    });

    // Adding class to order type, transactions history
    jQuery( ".deposit-amount:contains('-')" ).parent().addClass('order_output');
    jQuery( ".deposit-amount:contains('+')" ).parent().addClass('order_input');

    //Naty Adding class to deposit button, add funds
    jQuery('#make-a-deposit .deposit_button').on('click', function (e) {
        jQuery('#make-a-deposit .deposit_button').removeClass('active');
        jQuery(this).addClass('active');
    });

    // Header background on scroll
    jQuery(window).on('scroll', function(){
        if (jQuery(window).scrollTop() > 0){
            jQuery(".navigation-wrapper .secondary-navigation-wrapper").addClass("nav_dark_bg");}
        else {
            jQuery(".navigation-wrapper .secondary-navigation-wrapper").removeClass("nav_dark_bg");}
    });

    // Subjects tabs
    jQuery('.services_listing_tabs li:first-child').addClass('active');
    jQuery('.services_listing_tabs li.slick-current').addClass('active');
    jQuery('.services_listing_wrap .single_service_wrap:first-child').addClass('active');
    jQuery('.services_listing_tabs li').click(function(){
        var tab_id = jQuery(this).attr('data-tab');

        jQuery('.services_listing_tabs li').removeClass('active');
        jQuery('.single_service_wrap').removeClass('active');

        jQuery(this).addClass('active');
        jQuery("#cat_"+tab_id).addClass('active');
    });

    // Assignment Type tabs
    jQuery('.assignment_type_tabs li:first-child').addClass('active');
    jQuery('.assignment_type_tabs li.slick-current').addClass('active');
    jQuery('.assignment_type_listing_wrap .single_assignment_type_wrap:first-child').addClass('active');
    jQuery('.assignment_type_tabs li').click(function(){
        var tab_id = jQuery(this).attr('data-tab');

        jQuery('.assignment_type_tabs li').removeClass('active');
        jQuery('.single_assignment_type_wrap').removeClass('active');

        jQuery(this).addClass('active');
        jQuery("#"+tab_id).addClass('active');
    });

    //Naty Read more article
    jQuery("#read_more").click(function() {
        jQuery(this).toggleClass('less');
        jQuery('.post_question_content').toggleClass('allText');
        if (jQuery(this).hasClass('less')){
            jQuery(this).html('Read less<span class="glyphicon glyphicon-chevron-up"></span>')
        } else {
            jQuery(this).html('Read more<span class="glyphicon glyphicon-chevron-down"></span>')
        }
    });
    // Naty scroll to comments article
    jQuery(".comment_to").on("click", function (event) {
        event.preventDefault();
        var id = jQuery(this).attr('href'),
            top = jQuery(id).offset().top;
        jQuery('body,html').animate({ scrollTop: top-100 }, 700);
    });

    //Naty sign_in_up modal window
    jQuery('.menu_signin a').click( function(event){
        event.preventDefault();
        jQuery('#overlay').fadeIn(400,
            function(){
                jQuery('#sign_form')
                    .css('display', 'block')
                    .animate({opacity: 1, top: '0'}, 200);
            });
    });
    jQuery('#overlay').click( function(){
        jQuery('#sign_form')
            .animate({opacity: 0, top: '45%'}, 200,
                function(){
                    jQuery(this).css('display', 'none');
                    jQuery('#overlay').fadeOut(400);
                }
            );
    });
    //Naty sign_in_up tabs
    jQuery('#sign_form li').click(function(){
        var tab_id = $(this).attr('data-tab');

        jQuery('#sign_form li').removeClass('current');
        jQuery('.tab-content').removeClass('current');
        jQuery(this).addClass('current');
        jQuery("#"+tab_id).addClass('current');
    });

});


jQuery(document).ready(function(){
	jQuery('#form_comment_author_page').on('submit', function(){
		var author = jQuery('#author').val();
		var email = jQuery('#email').val();
		var comment = jQuery('#comment').val();
		var pattern = /^[a-z0-9_-]+@[a-z0-9-]+\.[a-z]{2,6}$/i;

		if(email === ''  && author === '' && comment === ''){
			jQuery('#valid-email').empty();
			jQuery('#valid-comment').empty();
			jQuery('#valid-author').empty();
			jQuery('#valid-author').append('<p>Please fill in the field correctly.</p>');
			jQuery('#valid-email').append('<p>Please fill in the field correctly.</p>');
			jQuery('#valid-comment').append('<p>Please fill in the field correctly.</p>');
			return false;
		}else if(email === ''  && author === ''){
			jQuery('#valid-email').empty();
			jQuery('#valid-comment').empty();
			jQuery('#valid-author').empty();
			jQuery('#valid-author').append('<p>Please fill in the field correctly.</p>');
			jQuery('#valid-email').append('<p>Please fill in the field correctly.</p>');
			return false;
		}else if(author === '' && comment === ''){
			jQuery('#valid-email').empty();
			jQuery('#valid-comment').empty();
			jQuery('#valid-author').empty();
			jQuery('#valid-author').append('<p>Please fill in the field correctly.</p>');
			jQuery('#valid-comment').append('<p>Please fill in the field correctly.</p>');
			return false;
		} else if(email === ''  && comment === ''){
			jQuery('#valid-email').empty();
			jQuery('#valid-comment').empty();
			jQuery('#valid-author').empty();
			jQuery('#valid-email').append('<p>Please fill in the field correctly.</p>');
			jQuery('#valid-comment').append('<p>Please fill in the field correctly.</p>');
			return false;
		} else if(author === '' && email.search(pattern) !== 0){
			jQuery('#valid-email').empty();
			jQuery('#valid-comment').empty();
			jQuery('#valid-author').empty();
			jQuery('#valid-author').append('<p>Please fill in the field correctly.</p>');
			jQuery('#valid-email').append('<p>Please fill in the field correctly.</p>');
			return false;
		} else if(comment === '' && email.search(pattern) !== 0){
			jQuery('#valid-email').empty();
			jQuery('#valid-comment').empty();
			jQuery('#valid-author').empty();
			jQuery('#valid-comment').append('<p>Please fill in the field correctly.</p>');
			jQuery('#valid-email').append('<p>Please fill in the field correctly.</p>');
			return false;
		} else if(author === '' && comment === '' && email.search(pattern) !== 0){
			jQuery('#valid-email').empty();
			jQuery('#valid-comment').empty();
			jQuery('#valid-author').empty();
			jQuery('#valid-comment').append('<p>Please fill in the field correctly.</p>');
			jQuery('#valid-author').append('<p>Please fill in the field correctly.</p>');
			jQuery('#valid-email').append('<p>Please fill in the field correctly.</p>');
			return false;
		} else if(email === ''){
			jQuery('#valid-email').empty();
			jQuery('#valid-comment').empty();
			jQuery('#valid-author').empty();
			jQuery('#valid-email').append('<p>Please fill in the field correctly.</p>');
			return false;
		} else if (email.search(pattern) !== 0){
			jQuery('#valid-email').empty();
			jQuery('#valid-comment').empty();
			jQuery('#valid-author').empty();
			jQuery('#valid-email').append('<p>Please fill in the field correctly.</p>');
			return false;
		} else if (author === ''){
			jQuery('#valid-email').empty();
			jQuery('#valid-comment').empty();
			jQuery('#valid-author').empty();
			jQuery('#valid-author').append('<p>Please fill in the field correctly.</p>');
			return false;
		} else if (comment === '') {
			jQuery('#valid-email').empty();
			jQuery('#valid-comment').empty();
			jQuery('#valid-author').empty();
			jQuery('#valid-comment').append('<p>Please fill in the field correctly.</p>');
			return false;
		} else {
			jQuery('#valid-email').empty();
			jQuery('#valid-author').empty();
			jQuery('#valid-comment').empty();
			return true;
		}

	});

});



jQuery(document).ready(function(){
	
	var class = "div.order-piece.row.all";
	
	function load_more_init(class){
		
		jQuery(class).slice(0, 10).show();

		jQuery("#loadMoreButton").click(function () {
				
			//e.preventDefault();

			jQuery(class + ":hidden").slice(0, 10).slideDown();

			if (jQuery(class + ":hidden").length == 0) {

				jQuery("#loadMoreButton").fadeOut('slow');

			}
			
			jQuery('html,body').animate({
				
				scrollTop: $(this).offset().top
				
			}, 1500);
			
		});
	}
	
	load_more_init();

});

