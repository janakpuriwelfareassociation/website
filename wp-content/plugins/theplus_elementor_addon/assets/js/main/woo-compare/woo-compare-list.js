function tp_woo_compare_get_list(mainContainer, getType){
    var containerwctable = mainContainer[0].querySelectorAll('.tp-woo-compare-table-wrapper');

    var loadingText = '';
    if( 'tp_wc_list' === getType ){
        loadingText = containerwctable[0].dataset.loadtext;
    }

    var getlsvaluewlnl=[],
        getlsvaluewlnltype = false;
        shopName = mainContainer[0].getAttribute('data-wid');

    var getlsfortable=[],
        getlsfortabletype = false;
    
    if ( localStorage.getItem(shopName) && JSON.parse(localStorage.getItem(shopName)).length != 0 ) {
        getlsvaluewlnl = JSON.parse(localStorage.getItem(shopName));
        getlsvaluewlnltype = true;
    }

    if(containerwctable.length > 0){
        getlsfortable = containerwctable[0].dataset.tptablewc;
        var bbc = containerwctable[0].dataset.query;
            getlsfortabletype = true;
    }
    jQuery.ajax({
        type: 'POST',
        url: theplus_ajax_url,
        data: {
            'action' : 'tp_wc_ql_data_ajax',
            'dataType': 'json',                
            'status': 'publish',
            'getvaluebrowser' : getlsvaluewlnl,
            'getvaluebrowsertype' : getlsfortabletype,
            'getvaluefortable' : getlsfortable,
            'getvaluefortabletype' : getlsfortabletype,
            'bbc' : bbc,
            'security' : theplus_nonce, 
        },
        beforeSend: function() {
            if(loadingText){
                containerwctable[0].textContent = loadingText;
            }
        },
        success:function(response) {
            var wcqvlistarray = JSON.parse(response.htmljsonwcqvlist);

            if( containerwctable.length > 0 && response.HtmlDataTableLength ){
                containerwctable[0].innerHTML='';
                
                if (wcqvlistarray.wcqvlist != null && wcqvlistarray.wcqvlist.length != 0) {
                    containerwctable[0].insertAdjacentHTML("afterbegin", response.HtmlDataTable);
                }else{
                    containerwctable[0].insertAdjacentHTML("afterbegin", 'You have no comparison lists.');
                }
            }else{
                containerwctable[0] ? containerwctable[0].innerHTML = '<h3 class="theplus-posts-not-found"> You have no comparison lists. </h3>' : '';
            }

            if( 'tp_wc_count' === getType ){
                tp_woo_compare_count_list(mainContainer, response, wcqvlistarray );
                tp_woo_compare_popup_hide(mainContainer);
            }
        },
        complete: function() {
        }
    });
}

/** Remove from list*/
function tp_woo_compare_table_remove(mainContainer, getType){
    jQuery( mainContainer ).on('click', '.tp-wc-table-remove-item,.tp-wc-qlist-grid-remove', function(e){
        e.preventDefault();
        var currentProduct = this?.dataset?.product ? this.dataset.product : '';
            currentProduct = currentProduct.toString();

            if( currentProduct ){
                var getlsvalue = JSON.parse(localStorage.getItem(shopName));

                var woocompare = jQuery.grep(getlsvalue, function(value) {
                    return value != currentProduct;
                });

                localStorage.setItem(shopName, JSON.stringify(woocompare));

                if( 'tp_wc_list' === getType ){
                    tp_woo_compare_get_list(mainContainer);
                }

                if( 'tp_wc_count' === getType ){
                    var GetPerant = this.offsetParent;
                        GetPerant.remove();

                    tp_compare_count_after_remove(shopName);
                }
            }
    });
}

