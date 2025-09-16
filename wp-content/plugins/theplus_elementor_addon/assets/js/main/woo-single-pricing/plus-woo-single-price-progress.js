(function($) {	
    var WidgetSinglePriceProgressHandler = function($scope, $) {
        
        var container = $scope[0].querySelectorAll('.tp-woo-stock-progress');
            if(container.length){
                var tprow = container[0].querySelectorAll('.tp-progress-bar');
                if(tprow.length){
                    tprow.forEach(function(item, index) {                
                        let totalqty = item.dataset.totalQty,
                            totalsale = item.dataset.totalSale,
                            final = (totalsale*100)/totalqty;
                            item.querySelector('.tp-progress-bar-inner').style.width = final+"%";
                    });
                }
            }
    };
    $(window).on('elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction('frontend/element_ready/tp-woo-single-pricing.default', WidgetSinglePriceProgressHandler);
    });
})(jQuery);