/** Plus Wishlist Lazy Load*/
(function ($) {
	"use strict";
	var WidgetProQCWHandler = function($scope, $) {

        let llOption = $scope[0].querySelectorAll( '.tp-pro-l-type-wishlist .ajax_lazy_load .post-lazy-load, .tp-dy-l-type-wishlist .ajax_lazy_load .post-lazy-load' );

        var login = jQuery('body').hasClass('logged-in') ? 'true' : 'false';
        var shopList = '';

        if( llOption.length > 0 ) {
            lazyloadStart( llOption, $scope );
        }

        function lazyloadStart( llOption, $scope ) {
            
            var windowWidth, windowHeight, documentHeight, scrollTop, containerHeight, containerOffset, $window = $(window);

            var recalcValues = function() {
                windowWidth = $window.width();
                windowHeight = $window.height();
                documentHeight = $('body').height();
                containerHeight = $('.list-isotope,.list-isotope-metro', $scope).height();
                containerOffset = $('.list-isotope,.list-isotope-metro', $scope).offset().top+50;
                setTimeout(function(){
                    containerHeight = $('.list-isotope,.list-isotope-metro', $scope).height();
                    containerOffset = $('.list-isotope,.list-isotope-metro', $scope).offset().top+50;
                }, 50);
            };
        
            recalcValues();
            $window.resize(recalcValues);

            $window.bind('scroll', function(e) {

                e.preventDefault();
                recalcValues();
                scrollTop = $window.scrollTop();

                $('.list-isotope,.list-isotope-metro', $scope).each(function() {

                    containerHeight = $scope.height();
                    containerOffset = $scope.offset().top+50;

                    if( $scope.find(".post-lazy-load").length && scrollTop < documentHeight && scrollTop > (containerHeight + containerOffset - windowHeight) ) {

                        var click = llOption[0],
                            shopname = click.dataset.wid,
                            page = click.dataset.page,
                            total_page = click.dataset.total_page,
                            load_class = click.dataset.loadClass,
                            layout = click.dataset.layout,
                            loadattr = click.dataset.loadattr,
                            display_post = click.dataset.display_post,
                            offset_posts = click.dataset.offset_posts,
                            post_load_more = click.dataset.post_load_more,
                            current_text = click.innerText,
                            loaded_posts = click.dataset.loaded_posts,
                            loading_text = click.dataset.tp_loading_text;

                        if( click.dataset.requestRunning == "true" ) {
                            return;
                        }
                        
                        if( offset_posts == undefined || offset_posts == ""){
                            offset_posts = 0;
                        }

                        if( total_page >= page ) {
                            click.dataset.requestRunning = true;

                            var offset = parseInt(page-1)*parseInt(post_load_more)+parseInt(display_post)+parseInt(offset_posts);

                            if( login == 'false' ) {
                                var getlsvaluewlnl = JSON.parse( localStorage.getItem( shopname ) );
                                    shopList = getlsvaluewlnl ? getlsvaluewlnl : '';
                            }

                            var ajaxData = {
                                action : 'theplus_more_post',
                                offset : offset,
                                paged : page,
                                loadattr: loadattr,
                                nonce : 'theplus-addons',
                                'login': login,
                                'shopname': shopname,
                                'notloginwl': shopList,
                            };

                            jQuery.ajax({ 
                                type: 'POST',
                                data: ajaxData,
                                url: theplus_ajax_url,
                                beforeSend: function() {
                                    click.textContent = loading_text;
                                },
                                success: function(response) {
                                    var data = response.HtmlData;
                                    var tp_row = click.closest('.ajax_lazy_load')?.previousSibling;

                                    setTimeout( function () {
                                        tp_Skeleton_filter("hidden", tp_row);
                                    }, 1000 );

                                    if( data == '' ){
                                        click.classList.add('hide');
                                    } else {
                                        jQuery("."+load_class+' .post-inner-loop').append( data );
                    
                                        Resizelayout(layout, load_class);
                                    }

                                    page++;
                                    if( page == total_page ) {
                                        click.classList.add('hide');
                                        click.setAttribute('data-page', page);
                                        var parentElement = click.closest('.ajax_lazy_load');
                                        var plDiv = document.createElement('div');
                                            plDiv.className = 'plus-all-posts-loaded';
                                            plDiv.textContent = loaded_posts;

                                        parentElement.appendChild(plDiv);
                                    } else {
                                        click.textContent = current_text;
                                        click.setAttribute('data-page', page);
                                    }
                                },
                                complete: function() {
                                    click.dataset.requestRunning = false;
                                }
                            }).then(function(){  

                            });
                        }
                    } 
                });
            });
        }

        var tp_Skeleton_filter = function (type, item) {
            if (item) {
                let skeleton = item.querySelectorAll('.tp-skeleton');
                if (skeleton.length > 0) {
                    skeleton.forEach(function (self) {
                        if (self.style.visibility == 'visible' && self.style.opacity == 1) {
                            if ("hidden" === type) {
                                self.style.cssText = "visibility: hidden; opacity: 0;";
                            }
                        } else {
                            if ("visible" === type) {
                                self.style.cssText = "visibility: visible; opacity: 1;";
                            }
                        }
                    });
                }
            }
        }    

        var Resizelayout = function(layout, load_class) {
            if( layout == 'grid' || layout == 'masonry' ){
                var container = $("."+load_class+' .post-inner-loop');
                    container.isotope({
                        itemSelector: '.grid-item',
                    });
        
                if( !$("."+load_class).hasClass("list-grid-client") ){
                    setTimeout(function(){	
                        $("."+load_class+' .post-inner-loop').isotope( 'reloadItems' ).isotope();
                    }, 500);
                }
            }
        
            if( layout == 'metro' ){
                if ( $("."+load_class+'.list-isotope-metro .post-inner-loop').length > 0) {
                    var container = $("."+load_class),
                        uid = container.data("id"),
                        columns = container.attr('data-metro-columns'),
                        metro_style = container.attr('data-metro-style');
        
                    theplus_backend_packery_portfolio(uid,columns, metro_style);
                }
            }
        }
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/tp-product-listout.default', WidgetProQCWHandler);
        // elementorFrontend.hooks.addAction('frontend/element_ready/tp-dynamic-listing.default', WidgetProQCWHandler);
    });
})(jQuery);