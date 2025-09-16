(function($){
    "use strict";
    var WidgetWooCompareQuickListHandler = function($scope, $) {
        var mainContainer = $scope[0].querySelectorAll('.tp-woo-compare'),
            getType = mainContainer[0]?.dataset?.type ? mainContainer[0].dataset.type : '',
            btncontainer = $scope[0].querySelectorAll('.tp_compare_button'),

            currentcmpare = btncontainer[0] ? JSON.parse( btncontainer[0].getAttribute('data-compare') ) : [];

        if( 'tp_wc_list' === getType ){
            tp_woo_compare_get_list(mainContainer, getType); 
            tp_woo_compare_table_remove(mainContainer, getType); 
        }
        
        if( 'tp_wc_count' === getType ){
            tp_woo_compare_count(mainContainer);

            var Countwrp = mainContainer[0].querySelectorAll('.tp-woo-compare-count-wrapper');
            if( 'tp_wc_count_list_view' === Countwrp[0]?.dataset?.countType ){
                tp_woo_compare_get_list(mainContainer, getType); 
                tp_woo_compare_table_remove(mainContainer, getType); 
                tp_woo_compare_popup_show(mainContainer);
            }
        }

        if( 'tp_wc_button' === getType ){
            tp_woo_compare_button_change(mainContainer, btncontainer, currentcmpare);
            tp_woo_compare_button_remove($scope, mainContainer, currentcmpare);
        }
    };

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/tp-woo-compare.default', WidgetWooCompareQuickListHandler);
    });
})(jQuery);