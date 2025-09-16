( function( $ ) {
	"use strict";
	var WidgetGoogleMapHandler = function ($scope, $) {
		var gmap = $scope.find('.pt-plus-adv-map'),
			OSM_class = $scope[0].querySelectorAll('.tp-osm-map');

		var mainWrap = $scope.find('.pt-plus-adv-gmap'),
			getType = mainWrap[0]?.dataset?.type ? mainWrap[0].dataset.type : '';

		if( 'googlemap' === getType ){
			tp_map_gmap($);
		}
		if( 'osmmap' === getType ){
			tp_map_osm(OSM_class);
		}
	};
 
	$(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/tp-google-map.default', WidgetGoogleMapHandler);		
		if (elementorFrontend.isEditMode()) {		
			elementorFrontend.hooks.addAction('frontend/element_ready/tp-google-map.default', WidgetGoogleMapHandler);
		}
	});
})(jQuery);