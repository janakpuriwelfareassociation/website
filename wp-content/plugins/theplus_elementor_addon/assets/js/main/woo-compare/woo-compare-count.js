function tp_woo_compare_count_list( mainContainer, response, wcqvlistarray ){
    var containerwclqv = mainContainer[0].querySelectorAll('.tp-wc-count-list-quick-view');
        
    if( containerwclqv.length ){
        var GetContent = containerwclqv[0].querySelector('.tp-wc-count-list-quick-view-content');

        if( GetContent.length != 0 ){
            GetContent.innerHTML = '';
        }                            

        if ( wcqvlistarray.wcqvlist != null && wcqvlistarray.wcqvlist.length != 0 ) {
            GetContent.insertAdjacentHTML("afterbegin", response.HtmlData);                    
        }
    }
}

/** Count list popup Active - Popup Show*/
function tp_woo_compare_popup_show( mainContainer ){
    var cntListview = mainContainer[0].querySelector('.tp-woo-compare-count-wrapper.tp_wc_count_list_view a');
    if( cntListview ){
        cntListview.addEventListener('click', function(e) {
            e.preventDefault();
            cntListview.closest('.tp-woo-compare.tp_wc_count').querySelector('.tp-wc-count-list-quick-view').classList.add('tp-wc-c-lqv-open');
        });
    }
}

/** Count list Popup Hide/Remove*/
function tp_woo_compare_popup_hide( mainContainer ){
    var cntListview = mainContainer[0].querySelectorAll('.tp-wc-count-list-quick-view-close');
    if( cntListview.length > 0 ){
        cntListview[0].addEventListener('click', function(e) {
            var target = e.target,
                hidepopup = target.closest('.tp-wc-count-list-quick-view');

                if( hidepopup ){
                    hidepopup.classList.remove('tp-wc-c-lqv-open');
                }
        });
    }
}

function tp_woo_compare_count(mainContainer){
    var compareCount = mainContainer[0].querySelectorAll('.tp-woo-compare-count');
    var shopName = mainContainer[0].dataset.wid;

    setTimeout(function(){
        if(compareCount.length){ 
            var getlsvalue = JSON.parse(localStorage.getItem(shopName));

            if(getlsvalue && getlsvalue.length > 0){
                compareCount[0].textContent = getlsvalue.length;
            }else{
                compareCount[0].textContent = '0';
            }
        }
    },100);
}

function tp_compare_count_after_remove(shopName){
    var findCompareCount = document.querySelectorAll('.tp-woo-compare-count');
        findCompareCount.forEach((self) => {
            var countMainName = self.closest('.tp-woo-compare').dataset.wid;
            if(shopName === countMainName){
                var getlsvalue = JSON.parse(localStorage.getItem(shopName));
                self.textContent = getlsvalue.length;
            }
        });
}