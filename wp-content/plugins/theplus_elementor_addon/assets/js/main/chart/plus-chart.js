/*chart js*/
( function( $ ) {
	"use strict";
	var WidgetChartHandler = function ($scope, $) {
		var container = $scope.find('.tp-chart-wrapper'),
			canvas = container.find( '> canvas' ),
			data_settings  = container.data('settings');

		if( container.length > 0 ) {
			var chartType = container[0].dataset.source;

			if( chartType === 'custom' ) {
				if( container.length ) {
					var $this = canvas,
					ctx = $this[0].getContext('2d');
					new Chart(ctx,data_settings);
				}
			}else if( chartType === 'g_sheet' || chartType === 'csv_file' ) {
				let chartparam = container[0].dataset.chartparam ? JSON.parse(container[0].dataset.chartparam) : [];
				if( container.length > 0 ) {
					var $this = canvas,
					ctx = $this[0].getContext('2d');
					new Chart(ctx, chartparam);
				}
			}
		}
	};

	$(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/tp-chart.default', WidgetChartHandler);
	});
})(jQuery);	