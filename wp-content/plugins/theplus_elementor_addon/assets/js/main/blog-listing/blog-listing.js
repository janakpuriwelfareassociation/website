/** Blog listing*/
(function( $ ) {
	"use strict";
	var WidgetBlogListingHandler = function ($scope, $) {

        if( $scope.hasClass("elementor-widget") && $scope.find('.blog-list.blog-style-1').length > 0 ){
        	$(document).ready(function($) {
        		$(document).on('mouseenter',".blog-list-content,.blog-list.blog-style-1 .grid-item .blog-list-content",function() {				
        			$(this).find(".post-hover-content").slideDown(300)
        		});
        		$(document).on('mouseleave',".blog-list-content,.blog-list.blog-style-1 .grid-item .blog-list-content",function() {
        			$(this).find(".post-hover-content").slideUp(300)
        		})
        	});
        }

		var wish_filter = $scope.find('.blog-list');
        if (wish_filter.length > 0) {
            var filterType = $(wish_filter[0]).attr('filter-type');
            
            if( 'ajax_base' === filterType){
                wish_filter_onload_call($scope);
            }

			jQuery($scope).on('click', '.filter-category-list-ajax', function (e) {
                e.preventDefault();
                var $this = this;
                click_category_list($this);
            });
        }

		var loadmoremain = $scope[0].querySelectorAll( '.post-load-more' );
		if ( loadmoremain.length > 0 ) {
			loadmore_onload_call( loadmoremain );

			jQuery(loadmoremain).on( "click", function(e){
				e.preventDefault();
				clickloadmore($(this));
			});
		}

	};

	$(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/tp-blog-listout.default', WidgetBlogListingHandler);
	});

})(jQuery);