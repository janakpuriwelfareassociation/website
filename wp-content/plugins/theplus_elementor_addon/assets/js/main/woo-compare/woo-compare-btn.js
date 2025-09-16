/**All click*/
function tp_woo_compare_button_change(mainContainer, btncontainer, currentcmpare){
    var shopName = mainContainer[0].dataset.wid;
    let inComparelist = '',        
        removeComparelist = '',     
        addComparelist = '',     
        woocompare = new Array,
        locsto = JSON.parse(localStorage.getItem(shopName));

        
        // tp_woo_compare_count(); 
    if( btncontainer.length && (currentcmpare.type == 'tp_wc_button' || currentcmpare.type == 'tp_wc_count' ) ){
        inComparelist = currentcmpare.alreadytext,
        removeComparelist = currentcmpare.removetext,    
        addComparelist = currentcmpare.addtext;   
    }
    
    if (typeof(locsto) != 'undefined' && locsto != null) {            
        woocompare = locsto;
    }
    
    Array.prototype.unique = function() {
        return this.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });
    }

    mainContainer[0].querySelectorAll('.tp_compare_button').forEach(btnCon => {
        var currentProduct = JSON.parse(btnCon.getAttribute('data-product')),
            currentcmpare = JSON.parse(btnCon.getAttribute('data-compare'));

            currentProduct = currentProduct.toString(); 

        if (tp_wc_in_list(currentProduct, woocompare)) {

            btnCon.classList.add('tp-wc-active');
            btnCon.setAttribute('title', inComparelist);
            btnCon.classList.remove('tp_compare_button');
            btnCon.classList.add('tp_woo_compare_remove');
            btnCon.textContent = removeComparelist;
            
            if('tp_wc_text' === currentcmpare.btn_type ){
                btnCon.textContent = '';
                var tBtn = document.createElement('button');
                    tBtn.className = 'tp_compare_addr';
                
                var tspnEle = document.createElement('span');
                    tspnEle.className = 'tp_compare_extra';
                    tspnEle.textContent = currentcmpare.removetext;
                    tspnEle.style.opacity = '1';

                tBtn.appendChild(tspnEle);
                btnCon.appendChild(tBtn);
            } else if ( 'tp_wc_icon' === currentcmpare.btn_type){
                var existingButtons = btnCon.querySelectorAll('.tp_compare_addr');
                    existingButtons.forEach(function(button) {
                        button.remove();
                    });
                btnCon.textContent = '';
                var iBtn = document.createElement('button');
                    iBtn.className = 'tp_compare_addrs';    

                var ispnEle = document.createElement('span');
                    ispnEle.style.opacity = '1';
                var iEle = document.createElement('i');
                    iEle.className = 'tp_icon_rm ' + currentcmpare.addicon;

                ispnEle.appendChild(iEle);
                iBtn.appendChild(ispnEle);
                btnCon.appendChild(iBtn);
            } else if ( 'tp_wc_texti' === currentcmpare.btn_type){
                btnCon.textContent = '';
                var buttonElement = document.createElement('button');
                    buttonElement.className = 'tp_compare_addr';

                var spanElement1 = document.createElement('span');
                    spanElement1.className = 'tp_compare_extra';
                    spanElement1.textContent = currentcmpare.removetext;

                var iElement = document.createElement('i');
                    iElement.className = 'tp_icon_rm ' + currentcmpare.addicon;
                
                var spanElement2 = document.createElement('span');
                    spanElement2.style.opacity = '1';

                spanElement2.appendChild(iElement);
                buttonElement.appendChild(spanElement1);
                buttonElement.appendChild(spanElement2);
                btnCon.appendChild(buttonElement);
            }
        }

        btnCon.addEventListener("click", function(e){
            e.preventDefault();
            if(!(btnCon.classList.contains('tp-wc-active')) && !(btnCon.classList.contains('tp-wc-loading'))){
                btnCon.classList.add('tp-wc-loading');
                woocompare = JSON.parse(localStorage.getItem(shopName));
                if(woocompare === null){
                    woocompare = [];
                }

                woocompare.push(currentProduct);
                woocompare = woocompare.unique();

                localStorage.setItem(shopName, JSON.stringify(woocompare));
                // tp_woo_compare_complete($this, inComparelist);

                btnCon.classList.remove('tp-wc-loading');
                btnCon.classList.add('tp-wc-active');
                btnCon.classList.add('tp_woo_compare_remove');
                btnCon.classList.remove('tp_compare_button');
                btnCon.setAttribute('title', inComparelist);
                btnCon.textContent = removeComparelist;

                tp_woo_compare_count_change(shopName);
                // tp_woo_compare_get_list(mainContainer, getType);

                if('tp_wc_text' === currentcmpare.btn_type ){
                    btnCon.textContent = '';
                    var tbtnEle = document.createElement('button');
                        tbtnEle.className = 'tp_compare_addrs'; 

                    var spanEle1 = document.createElement('span');
                        spanEle1.className = 'tp_compare_extra';

                    var spanEle2 = document.createElement('span');
                        spanEle2.style.opacity = '0';
                        spanEle2.textContent = currentcmpare.addtext;
                    
                    var loadingDiv = document.createElement('div');
                        loadingDiv.className = 'tp-wc-button-loading';

                    spanEle1.appendChild(spanEle2);
                    tbtnEle.appendChild(spanEle1);
                    tbtnEle.appendChild(loadingDiv);
                    btnCon.appendChild(tbtnEle);
                    setTimeout(function() {
                        btnCon.textContent = '';
                        
                        var newbtnEle = document.createElement('button');
                            newbtnEle.className = 'tp_compare_addrs';

                        var newspanEle1 = document.createElement('span');
                            newspanEle1.className = 'tp_compare_extra';

                        var newspanEle2 = document.createElement('span');
                            newspanEle2.style.opacity = '1';
                            newspanEle2.textContent = currentcmpare.removetext;

                        newspanEle1.appendChild(newspanEle2);
                        newbtnEle.appendChild(newspanEle1);
                        btnCon.appendChild(newbtnEle);
                    }, 500);
                }else if('tp_wc_texti' === currentcmpare.btn_type ){
                    btnCon.textContent = '';
                    var btnEle = document.createElement('button');
                        btnEle.className = 'tp_compare_addr';

                    var spanEle1 = document.createElement('span');
                        spanEle1.className = 'tp_compare_extra';
                        spanEle1.textContent = currentcmpare.addtext;

                    var spanEle2 = document.createElement('span');
                        spanEle2.style.opacity = '0';

                    var iEle = document.createElement('i');
                        iEle.className = 'tp_icon_rm ' + currentcmpare.removeicon;

                    var loadingDiv = document.createElement('div');
                        loadingDiv.className = 'tp-wc-button-loading';
                        loadingDiv.style.left = 'auto';

                    spanEle2.appendChild(iEle);
                    btnEle.appendChild(spanEle1);
                    btnEle.appendChild(spanEle2);
                    btnEle.appendChild(loadingDiv);
                    btnCon.appendChild(btnEle);

                    setTimeout(function(){
                        btnCon.textContent = '';

                        var newBtnEle = document.createElement('button');
                            newBtnEle.className = 'tp_compare_addr';

                        var newSpanEle1 = document.createElement('span');
                            newSpanEle1.className = 'tp_compare_extra';
                            newSpanEle1.textContent = currentcmpare.removetext;

                        var newSpanEle2 = document.createElement('span');
                            newSpanEle2.style.opacity = '1';

                        var newiEle = document.createElement('i');
                            newiEle.className = 'tp_icon_rm ' + currentcmpare.addicon;

                        newSpanEle2.appendChild(newiEle);
                        newBtnEle.appendChild(newSpanEle1);
                        newBtnEle.appendChild(newSpanEle2);
                        btnCon.appendChild(newBtnEle);
                    }, 500);
                }else if('tp_wc_icon' === currentcmpare.btn_type ){ 
                    btnCon.textContent = '';
                    var buttonElement = document.createElement('button');
                        buttonElement.className = 'tp_compare_addrs';

                    var spanElement = document.createElement('span');
                        spanElement.style.opacity = '0';

                    var iElement = document.createElement('i');
                        iElement.className = 'tp_icon_rm ' + currentcmpare.removeicon;

                    var loadingDiv = document.createElement('div');
                        loadingDiv.className = 'tp-wc-button-loading';

                    spanElement.appendChild(iElement);
                    buttonElement.appendChild(spanElement);
                    buttonElement.appendChild(loadingDiv);
                    btnCon.appendChild(buttonElement);

                    setTimeout(function(){
                        btnCon.textContent = '';

                        var newButtonElement = document.createElement('button');
                            newButtonElement.className = 'tp_compare_addrs';

                        var newSpanElement = document.createElement('span');
                            newSpanElement.style.opacity = '1';

                        var newiElement = document.createElement('i');
                            newiElement.className = 'tp_icon_rm ' + currentcmpare.addicon;

                        newSpanElement.appendChild(newiElement);
                        newButtonElement.appendChild(newSpanElement);
                        btnCon.appendChild(newButtonElement);
                    }, 500);
                }
                e.stopImmediatePropagation();
            }
        });
    });
}

/**Click for the remove btn*/
function tp_woo_compare_button_remove($scope, mainContainer, currentcmpare){
    var shopName = mainContainer[0].dataset.wid;

    inComparelist = currentcmpare.alreadytext,
    removeComparelist = currentcmpare.removetext,    
    addComparelist = currentcmpare.addtext;
    var removeBtn = $scope[0].querySelector('.tp-woo-compare.tp_wc_button > a');
    if( removeBtn ){
        removeBtn.addEventListener('click', function(e) {
            if(removeBtn.classList.contains('tp_woo_compare_remove')){
                e.preventDefault();
                var currentProduct = JSON.parse(this.getAttribute('data-product')),
                    currentcmpare = JSON.parse(this.getAttribute('data-compare'));

                currentProduct = currentProduct.toString();

                var cparr = JSON.parse(currentProduct);
                this.classList.remove('tp-wc-active');
                this.setAttribute('title', addComparelist);
                this.textContent = addComparelist;
                this.classList.add('tp_compare_button');
                this.classList.remove('tp_woo_compare_remove');

                if(!(this.classList.contains('tp-wc-active')) && !(this.classList.contains('tp-wc-loading'))){
                    this.classList.add('tp-wc-loading');
                    var getlsvalue = JSON.parse(localStorage.getItem(shopName));
                    var woocompare = jQuery.grep(getlsvalue, function(value) {
                        return value != currentProduct;
                    });

                    localStorage.setItem(shopName, JSON.stringify(woocompare));
                    // $this.removeClass('tp-wc-loading').addClass('tp_compare_button').removeClass('tp_woo_compare_remove').attr('title',removeComparelist).text(addComparelist);
                    
                    this.classList.remove('tp-wc-loading');
                    this.classList.add('tp_compare_button');
                    this.classList.remove('tp_woo_compare_remove');
                    this.setAttribute('title', removeComparelist);
                    this.textContent = addComparelist;

                    tp_woo_compare_count_change(shopName);
                    // tp_woo_compare_get_list(mainContainer, getType);

                    this.classList.remove('tp-wc-button-loading');

                    if( currentcmpare.btn_type === 'tp_wc_text' ){
                        var self = this;
                        this.textContent = '';
                        var btnEle = document.createElement('button');
                            btnEle.className = 'tp_compare_addrs';

                        var spanEle1 = document.createElement('span');
                            spanEle1.className = 'tp_compare_extra';

                        var spanEle2 = document.createElement('span');
                            spanEle2.style.opacity = '0';
                            spanEle2.textContent = currentcmpare.removetext;

                        var loadingDiv = document.createElement('div');
                            loadingDiv.className = 'tp-wc-button-loading';

                        spanEle1.appendChild(spanEle2);
                        btnEle.appendChild(spanEle1);
                        btnEle.appendChild(loadingDiv);
                        this.appendChild(btnEle);

                        setTimeout(function(){
                            self.textContent = '';
                            var newBtnEle = document.createElement('button');
                                newBtnEle.className = 'tp_compare_addrs';

                            var newSpanEle1 = document.createElement('span');
                                newSpanEle1.className = 'tp_compare_extra';

                            var newSpanEle2 = document.createElement('span');
                                newSpanEle2.style.opacity = '1';
                                newSpanEle2.textContent = currentcmpare.addtext;

                            newSpanEle1.appendChild(newSpanEle2);
                            newBtnEle.appendChild(newSpanEle1);
                            self.appendChild(newBtnEle);
                        }, 500);
                    }else if(currentcmpare.btn_type == 'tp_wc_icon'){
                        var self = this;
                        this.textContent = '';
                        var btnEle = document.createElement('button');
                            btnEle.className = 'tp_compare_addrs';

                        var spanEle = document.createElement('span');
                            spanEle.style.opacity = '0';

                        var iElement = document.createElement('i');
                            iElement.className = 'tp_icon_rm ' + currentcmpare.addicon;

                        var loadingDiv = document.createElement('div');
                            loadingDiv.className = 'tp-wc-button-loading';

                        spanEle.appendChild(iElement);
                        btnEle.appendChild(spanEle);
                        btnEle.appendChild(loadingDiv);
                        this.appendChild(btnEle);

                        setTimeout(function(){
                            self.textContent = '';
                            var newBtnEle = document.createElement('button');
                                newBtnEle.className = 'tp_compare_addrs';

                            var newSpanElement = document.createElement('span');
                                newSpanElement.style.opacity = '1';

                            var newiElement = document.createElement('i');
                                newiElement.className = 'tp_icon_rm ' + currentcmpare.removeicon;

                            newSpanElement.appendChild(newiElement);
                            newBtnEle.appendChild(newSpanElement);
                            self.appendChild(newBtnEle);
                        }, 500);
                    }else if(currentcmpare.btn_type == 'tp_wc_texti'){
                        var self = this;
                        this.textContent = '';
                        var btnEle = document.createElement('button');
                            btnEle.className = 'tp_compare_addr';

                        var spanEle1 = document.createElement('span');
                            spanEle1.className = 'tp_compare_extra';
                            spanEle1.textContent = currentcmpare.removetext;

                        var spanEle2 = document.createElement('span');
                            spanEle2.style.opacity = '0';

                        var iElement = document.createElement('i');
                            iElement.className = 'tp_icon_rm ' + currentcmpare.addicon;

                        var loadingDiv = document.createElement('div');
                            loadingDiv.className = 'tp-wc-button-loading';
                            loadingDiv.style.left = 'auto';

                        spanEle2.appendChild(iElement);
                        btnEle.appendChild(spanEle1);
                        btnEle.appendChild(spanEle2);
                        btnEle.appendChild(loadingDiv);
                        this.appendChild(btnEle);

                        setTimeout(function(){
                            self.textContent = '';
                            var newBtnEle = document.createElement('button');
                                newBtnEle.className = 'tp_compare_addr';

                            var newSpanEle1 = document.createElement('span');
                                newSpanEle1.className = 'tp_compare_extra';
                                newSpanEle1.textContent = currentcmpare.addtext;

                            var newSpanEle2 = document.createElement('span');
                                newSpanEle2.style.opacity = '1';

                            var newiElement = document.createElement('i');
                                newiElement.className = 'tp_icon_rm ' + currentcmpare.removeicon;

                            newSpanEle2.appendChild(newiElement);
                            newBtnEle.appendChild(newSpanEle1);
                            newBtnEle.appendChild(newSpanEle2);
                            self.appendChild(newBtnEle);
                        }, 500);
                    }
                } 

                e.stopImmediatePropagation(); 
            }
        });
    }
}

function tp_wc_in_list(value, array) {
    return array.indexOf(value) > -1;
}

function tp_woo_compare_count_change(shopName){
    var findCompareCount = document.querySelectorAll('.tp-woo-compare-count');
        findCompareCount.forEach((self) => {
            var countMainName = self.closest('.tp-woo-compare').dataset.wid;
            if(shopName === countMainName){
                var getlsvalue = JSON.parse(localStorage.getItem(shopName));
                self.textContent = getlsvalue.length;
            }
        });
}