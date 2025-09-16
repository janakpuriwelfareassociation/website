/*Dynamic Listing*/
( function( $ ) {
	"use strict";
	var WidgetDynamicListingHandler = function ($scope, $) {
        var containerJs = $scope[0].querySelectorAll('.dynamic-listing');
		var container = $scope.find('.dynamic-listing');

        if (container.length > 0) {
            var filterType = $(container[0]).attr('filter-type');
            
            if( 'ajax_base' === filterType){
                wish_filter_onload_call($scope);
            }

			jQuery($scope).on('click', '.filter-category-list-ajax', function (e) {
                e.preventDefault();
                var $this = this;
                click_category_list($this);
            });
        }
        
        let tp_wishlist = $scope[0].querySelectorAll('.dynamic-listing.tp-dy-l-type-wishlist');
		if ( tp_wishlist.length > 0 ) {
			tp_woo_listing( $scope, tp_wishlist, 'dynamic' );
		}

		var loadmoremain = $scope[0].querySelectorAll( '.post-load-more' );
		if ( loadmoremain.length > 0 ) {
			loadmore_onload_call( loadmoremain );

			jQuery(loadmoremain).on("click", function(e){
				e.preventDefault();
				clickloadmore($(this));
			});
		}

		if(container.hasClass('.dynamic-listing.dynamic-listing-style-1')){
			$('.dynamic-listing.dynamic-listing-style-1 .grid-item .blog-list-content').on('mouseenter',function() {
				$(this).find(".post-hover-content").slideDown(300)				
			});
			$('.dynamic-listing.dynamic-listing-style-1 .grid-item .blog-list-content').on('mouseleave',function() {
				$(this).find(".post-hover-content").slideUp(300)				
			});
		}

		$(document).ready(function () {
			if($('.tp-child-filter-enable').length){
				$( ".tp-child-filter-enable.pt-plus-filter-post-category .category-filters li a" ).on( "click", function(event) {
					event.preventDefault();
					var get_filter = $(this).data("filter"),
					get_filter_remove_dot = get_filter.split('.').join(""),  
					get_sub_class = 'cate-parent-',
					get_filter_add_class = get_sub_class.concat(get_filter_remove_dot);

					if(get_filter_remove_dot=="*" && get_filter_remove_dot !=undefined){
						$(this).closest(".post-filter-data").find(".category-filters-child").removeClass( "active");
					}else{
						$(this).closest(".post-filter-data").find(".category-filters-child").removeClass( "active");
						$(this).closest(".post-filter-data").find(".category-filters-child."+get_filter_add_class).addClass( "active");
					}
				});
			}
		});

		if( $scope.hasClass("elementor-widget") && $scope.find('.dynamic-listing.dynamic-listing-style-1').length > 0 ){
			$(document).ready(function($) {
				$(document).on('mouseenter',".dynamic-listing.dynamic-listing-style-1 .grid-item",function() {				
					$(this).find(".post-hover-content").slideDown(300)
				});
				$(document).on('mouseleave',".dynamic-listing.dynamic-listing-style-1 .grid-item",function() {
					$(this).find(".post-hover-content").slideUp(300)
				})
			});
		}
		
		/**Relayout*/
		if( containerJs[0] && elementorFrontend.isEditMode() ){
			var layoutType = (containerJs[0].dataset && containerJs[0].dataset.layoutType) ? containerJs[0].dataset.layoutType : '';
			
				Resizelayout(layoutType, 4000)
				
				function Resizelayout( loadlayout, duration=500 ) {	
					if (loadlayout == 'layoutType' || loadlayout == 'masonry') {
						let FindGrid = containerJs[0].querySelectorAll(`.list-isotope .post-inner-loop`);
						if( FindGrid.length ){
							setTimeout(function(){
								jQuery(FindGrid[0]).isotope('reloadItems').isotope();
							}, duration);
						}
					}
				}
		}
	};

	$(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/tp-dynamic-listing.default', WidgetDynamicListingHandler);
	});
})(jQuery);