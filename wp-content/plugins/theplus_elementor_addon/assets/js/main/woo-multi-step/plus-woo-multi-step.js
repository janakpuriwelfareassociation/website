/*Woo Multi Step*/
(function($) {    
    var WidgetMultiStepHandler = function($scope, $) {
        var container = $scope.find('.tp-multi-step-wrapper');
        container.each( function() {
            var mainWrapper = container[0],
                mscSettings = $(this).data("tp_msc_settings"),
                Style = mscSettings.mscstyle,
                Stylelayout = mscSettings.stylelayout,
                mscbm = mscSettings.mscbm,
                lgnswitch = mscSettings.lgnswitch,
                copnswitch = mscSettings.copnswitch,
                mscbackendprevl='';

            if(lgnswitch == 'yes' && copnswitch == 'yes' || (lgnswitch == 'no' && copnswitch == 'yes')){
                $(this).find('.tp-msc-coupon-wrapper').removeClass('plus-equal-step');
            }

            if(lgnswitch == 'yes'){
                mscbackendprevl = mscSettings.mscbackendprevl;
            } else if (lgnswitch == 'no' && copnswitch == 'no'){
                mscbackendprevl = mscSettings.mscbackendprev;
            } else if (lgnswitch == 'no' && copnswitch == 'yes'){
                mscbackendprevl = mscSettings.mscbackendprevb;
            }

            if(elementorFrontend.isEditMode()){
                multistepBackEnd(container, mscbackendprevl, lgnswitch, copnswitch);
            } 

            if(Style == 'style-5'){
                if(Stylelayout == 'msc-stl-hzt'){
                    container.find('.tp-multi-step-nav-steps').addClass('plus-hzl');  
                }else if(Stylelayout == 'msc-stl-vrt'){
                    container.css('display', 'flex');
                    container.find('.tp-multi-step-nav').css('min-width', 25 + '%');
                    container.find('.tp-multi-step-nav-steps').addClass('plus-vrl');
                    container.find('.tp-multi-step-content').css('min-width', 75 + '%');
                    container.find('.tp-multi-step-content .tp-multi-step-content-left').css('min-width', 57 + '%');
                    container.find('.tp-multi-step-content .tp-multi-step-content-right').css('min-width', 18 + '%');
                }
            }
            
            var nextBtn = container[0].querySelectorAll('.tp-msc-next');
            var prevBtn = container[0].querySelectorAll('.tp-msc-prev');
            
                nextBtn.forEach( nxt =>{
                    nxt.addEventListener('click',() => {
                        changeStep('ptnext',nxt);
                        navchangeStep('navptnext');
                        if( copnswitch == 'no' ){
                            coupanSection(mainWrapper);
                        }
                    });
                });

                prevBtn.forEach( pre =>{
                    pre.addEventListener('click',() => {
                        changeStep('ptprev',pre);
                        navchangeStep('navptprev');
                        if( copnswitch == 'no' ){
                            coupanSection(mainWrapper);
                        }
                    });
                });

            function changeStep(plusbtn,nxt){
                let mainLeft = nxt.closest('.tp-multi-step-content-left'),
                    allStep = mainLeft.querySelectorAll('.plus-equal-step');
                let nIndex = '';

                if(plusbtn == 'ptnext'){
                    allStep.forEach(function(el,index){
                        if(el.classList.contains('tp-step-three') && el.classList.contains('plus-active-step')) {                                       
                            var formData = jQuery('form[name="checkout"]').serializeArray();
                            var error = 0;
                            var errorList = '';
                            if(container.find("#ship-to-different-address-checkbox").prop('checked') == true){
                                var optionalElem = ['billing_company', 'billing_address_2','shipping_company','shipping_address_2','order_comments'];
                            } else {
                                var optionalElem = ['billing_company', 'billing_address_2','shipping_first_name','shipping_last_name','shipping_country','shipping_address_1','shipping_company','shipping_address_2','shipping_city','shipping_state','shipping_postcode','order_comments'];
                            }
                            for (var i = 0; i < formData.length; i++) {
                                if(optionalElem.includes(formData[i]['name'])){
                                    continue;
                                } else {
                                    if(formData[i]['value'].trim() === ''){
                                        error = 1;                                                
                                        errorList += '<li>' + upperCaseFirstChar(formData[i]['name'].replace(/_/g," ")) + mscbm + '</li>';
                                    }
                                }
                            }
                            jQuery('.woocommerce-error').remove();
                            if(error === 1){
                                errorList = `<ul class="woocommerce-error">` + errorList + `</ul>`;
                                container.find('.tp-step-three').prepend(errorList);
                            } else {
                                if(el.classList.contains('plus-active-step')){
                                    el.classList.remove('plus-active-step');
                                    nIndex = index + 1;
                                }
                                if(nIndex!='' && index==nIndex){
                                    nIndex = '';
                                    el.classList.add('plus-active-step');
                                }
                            }
                            function upperCaseFirstChar(str = ''){
                                const empsp = str.split(" ");
                                for (var i = 0; i < empsp.length; i++) {
                                    empsp[i] = empsp[i].charAt(0).toUpperCase() + empsp[i].slice(1);
                                }
                                const str2 = empsp.join(" ");
                                return str2;
                            }
                        } else {
                            if(el.classList.contains('plus-active-step')){
                                el.classList.remove('plus-active-step');
                                nIndex = index + 1;
                            }
                            if(nIndex!='' && index==nIndex){
                                nIndex = '';
                                el.classList.add('plus-active-step');
                            }
                        }
                    })
                } else {
                    allStep.forEach(function(el,index){
                        if(el.classList.contains('plus-active-step')){
                            el.classList.remove('plus-active-step');
                            nIndex = index - 1;
                        }
                    })
                    allStep.forEach(function(el,index){
                        if(nIndex!='' && index==nIndex){
                            nIndex = '';
                            el.classList.add('plus-active-step');
                        } else if (nIndex==0 && index==0){
                            el.classList.add('plus-active-step');
                        }
                    })
                }
            }

            function navchangeStep(navplusbtn){
                var navactive = container[0].querySelector('.tp-msc-step.tp-msc-step-active');
                let navsiblingLI = '';
                if(navplusbtn === 'navptnext'){
                    navsiblingLI = navactive.nextSibling;
                    if (navactive.classList.contains('tp-msc-step-active')) {
                        navactive.classList.add('tp-msc-step-done');
                        navactive.classList.remove('tp-msc-step-active');
                    }
                    if(navactive.classList.contains('tp-msc-step')){
                        navsiblingLI.classList.add('tp-msc-step-active');
                    }                                
                }else if(navplusbtn === 'navptprev'){
                    navsiblingLI = navactive.previousSibling;
                    if (navsiblingLI.classList.contains('tp-msc-step-done')) {
                        navsiblingLI.classList.remove('tp-msc-step-done');
                        navactive.classList.remove('tp-msc-step-active');
                        navsiblingLI.classList.add('tp-msc-step-active');  
                    }
                }
            }

        }); 
    };
    $(window).on('elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction('frontend/element_ready/tp-woo-multi-step.default', WidgetMultiStepHandler);
    });
})(jQuery);
