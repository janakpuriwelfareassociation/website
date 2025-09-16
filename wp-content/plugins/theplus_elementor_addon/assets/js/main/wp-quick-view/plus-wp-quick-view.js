(function($) {    
    var WidgetWpQuckViewHandler = function($scope, $) {
        var mainContainer = $scope[0].querySelectorAll('.tp-wp-quickview-wrapper');

        if( mainContainer.length > 0 ){
            mainContainer.forEach(function(self) {
                self.addEventListener( "click", function(e) {
                    e.preventDefault();
					tp_wp_quick_view( self );
                });
            });
        }

    };
	$(window).on('elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction('frontend/element_ready/tp-wp-quickview.default', WidgetWpQuckViewHandler);
    });
})(jQuery);

function tp_wp_quick_view( mainEle ) {
    var dataAttr = mainEle.getAttribute('data-quickview');
    
    var btnClick = mainEle.querySelector( '.tp-quick-view-click' );
        postid = btnClick.getAttribute( 'data-postid' );

    dataAttr = dataAttr.replace(/^'|'$/g, '');
    dataAttr = JSON.parse( dataAttr );
    
    var query = dataAttr.query,
        customtemplate = dataAttr.customtemplateqcw ? dataAttr.customtemplateqcw : '',
        template = dataAttr.templateqcw ? dataAttr.templateqcw : '';

    if( postid !== undefined ){
        jQuery.ajax({
            type: 'POST',
            url: theplus_ajax_url,							
            data :{
                'action': 'tp_get_qv_post_info',
                'product_id':  postid,
                'qvquery':  query,
                'custom_template':  customtemplate,
                'template_id' : template,
                'status': 'publish',
                'security' : theplus_nonce,	 
            }, 
            success:function(response){	
                jQuery.fancybox.open(response);
                jQuery('.tp-pro-view-spinner').remove();
                btnClick.style.background = "";
                jQuery('.tpqvactive').css('display','block').removeClass('tpqvactive');
            }
        });
    }
    
    let idiv =  mainEle.querySelector( 'i' );
    if( idiv ) {
        idiv.classList.add( 'tpqvactive' );
        idiv.style.cssText = "display: none;";
    }

    let isvg = mainEle.querySelector( 'svg' );
    if( isvg ) {
        isvg.classList.add( 'tpqvactive' );
        isvg.style.cssText = "display: none;";
    }

    btnClick.style.background = "transparent";

    var spinDiv = document.createElement('div');
    spinDiv.className = 'tp-pro-view-spinner';
    btnClick.appendChild(spinDiv);
}