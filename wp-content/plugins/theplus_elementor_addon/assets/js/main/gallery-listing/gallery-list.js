/*posts listing*/
(function( $ ) {
	"use strict";
	var WidgetThePlusHandler = function ($scope, $) {

        if( $scope.hasClass("elementor-widget") && $scope.find('.gallery-list.gallery-style-3').length > 0 ){
			$('.gallery-list.gallery-style-3 .grid-item').each( function() { $(this).hoverdir(); } );
		}

        if( $scope.hasClass("elementor-widget") && $scope.find('.gallery-list.gallery-style-2').length > 0 ){
			$(document).ready(function($) {
				$(document).on('mouseenter',".gallery-list.gallery-style-2 .grid-item .gallery-list-content",function() {				
					$(this).find(".post-hover-content").slideDown(300)
				});
				$(document).on('mouseleave',".gallery-list.gallery-style-2 .grid-item .gallery-list-content",function() {
					$(this).find(".post-hover-content").slideUp(300)
				})
			});
		}
	};
	
	$(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/global', WidgetThePlusHandler);
	});

})(jQuery);