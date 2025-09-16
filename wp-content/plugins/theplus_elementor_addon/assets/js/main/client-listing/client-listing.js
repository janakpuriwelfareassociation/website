/** Client listing*/
(function( $ ) {
	"use strict";
	var WidgetClientListingHandler = function ($scope, $) {

		var wish_filter = $scope.find('.clients-list');
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

			jQuery(loadmoremain).on("click", function(e){
				e.preventDefault();
				clickloadmore($(this));
			});
		}

	};

	$(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/tp-clients-listout.default', WidgetClientListingHandler);
	});

})(jQuery);