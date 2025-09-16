(function($){
    "use strict";
    var WidgetwishlistHandler = function( $scope, $ ) {
        var mainContainer = $scope[0].querySelectorAll('.tp-woo-wishlist'),
            btncontainer = $scope.find('.tp_wishlist_button'),
            buttoncontainer = $scope[0].querySelectorAll('.tp_wishlist_button'),
            currentwish = btncontainer.data('wish'),
            cntBtnCon = $scope[0].querySelectorAll('.tp-wishlist-count'),
            getType = mainContainer[0]?.dataset?.type ? mainContainer[0].dataset.type : '';
        
        Array.prototype.unique = function() {
            return this.filter(function (value, index, self) {
                return self.indexOf(value) === index;
            });
        }    
        
        var shopName   = mainContainer[0].dataset.wid,
            SesshopName   = mainContainer[0].dataset.wid,
            inWishlist = '',       
            removeWishlist = '',    
            addWishlist = '',  
            wishlist   = new Array,        
            sesstore   = sessionStorage.getItem(SesshopName),
            locstore   = localStorage.getItem(shopName),
            login   = ($('body').hasClass('logged-in')) ? 'true' : 'false',
            query = mainContainer[0].dataset.query,
            userData   = '';     

            tp_wishlist_count();
        
        if( btncontainer.length && currentwish.type == 'tp_wl_button' ) {
            inWishlist = currentwish.alreadytext,
            removeWishlist = currentwish.removetext,    
            addWishlist = currentwish.addtext;   
        }

        function tp_wl_in_list(value, array) {
            if(typeof array === 'object'){
                array = Object.values(array);
                return array.indexOf(value) > -1;
            }

            if(value && array && (typeof array != 'object')){
                return array.indexOf(value) > -1;
            }        
        }

        var tpgbSkeleton_filter = function(val1) {
            let skeleton = document.querySelectorAll('.tp-skeleton');
                if( skeleton.length > 0 ){
                    skeleton.forEach(function(self) {
                        if( self.style.visibility == 'visible' && self.style.opacity == 1 ){
                            if(val1 == "hidden"){
                                self.style.cssText = "visibility: hidden; opacity: 0;";
                            }
                        }else{
                            if(val1 == "visible"){
                                self.style.cssText = "visibility: visible; opacity: 1;";
                            }
                        }
                    });
                }
        }

        function tp_wishlist_complete_on_change(){
            var login = ($('body').hasClass('logged-in')) ? 'true' : 'false',
                arraylist = [];

            if(document.querySelectorAll('.tp-pro-l-type-wishlist .tp-row').length){
                let tprow = document.querySelectorAll('.tp-pro-l-type-wishlist .tp-row');
                let oneArray = Array.prototype.slice.call(tprow);
                    Array.prototype.push.apply(arraylist, oneArray);
            }

            if(document.querySelectorAll('.tp-dy-l-type-wishlist .tp-row').length){
                let tprow = document.querySelectorAll('.tp-dy-l-type-wishlist .tp-row');
                let twoArray = Array.prototype.slice.call(tprow);
                    Array.prototype.push.apply(arraylist, twoArray);
            }

            let listing_type = 'wishlist';
            let option = [];
            let shopList = [];
            if(arraylist.length){
                arraylist.forEach(function(item, index) {
                    // option[index] = item.dataset.wooattr ? JSON.parse(item.dataset.wooattr) : [];
                    option[index] = item.dataset.wooattr ? item.dataset.wooattr : [];

                    if( login == 'false' ){
                        var getlsvaluewlnl = [];
                        if( item.offsetParent.classList.contains('product-list') ){
                            let notloginl = item.dataset.wid;
                            getlsvaluewlnl = JSON.parse(localStorage.getItem( notloginl ));

                            shopList[index] = getlsvaluewlnl ? getlsvaluewlnl : [];
                        } else if( item.offsetParent.classList.contains('dynamic-listing') ){
                            let notloginl = item.offsetParent.dataset.wid;
                            getlsvaluewlnl = JSON.parse(localStorage.getItem( notloginl ));

                            shopList[index] = getlsvaluewlnl ? getlsvaluewlnl : [];
                        }
                    }
                });
            }
            
            tpgbSkeleton_filter("visible");
            
            // getlsvaluewlnl=[];
            // if( login == 'false' ){
            //     var getlsvaluewlnl = JSON.parse(localStorage.getItem(shopName));
            // } 

            var ajaxdata = {
                'action' : 'tp_wl_get_all_data_ajax',
                'listingtype': listing_type,
                'dataType': 'json',
                'option': option,
                'login': login,
                'notloginwl' : shopList,
                'security' : theplus_nonce,
            };

            $.ajax({
                type: 'POST',
                url: theplus_ajax_url,
                async: true,
                cache: false,
                data: ajaxdata,
                success:function(response) {

                    if( arraylist.length == 0 ) {
                        tpgbSkeleton_filter("hidden");
                    } else {
                        arraylist.forEach(function( item, index ) {
                            if( response.length > 0 ){
                                var wishlistarray = JSON.parse(response[index].htmljsondata);
                                if ( wishlistarray.listdata != null && wishlistarray.listdata.length != 0 ) {
                                    item.innerHTML = '';

                                    item.insertAdjacentHTML("afterbegin", response[index].HtmlData);
                                    $( item ).isotope('reloadItems').isotope();

                                    tpgbSkeleton_filter("visible");

                                    setTimeout(function(){                            
                                        tpgbSkeleton_filter("hidden");
                                    },1500);
                                }else{
                                    item.innerHTML = '';

                                    var notFound = response[index].HtmlError ? response[index].HtmlError : 'Not Found';
                                        item.insertAdjacentHTML("afterbegin", `<h3 class="theplus-posts-not-found tp-pl-nf-space">${notFound}</h3>`);
                                }
                            } else {
                                tpgbSkeleton_filter("visible");
                            }
                        });
                    }
                }
            });  
        }

        function tp_wishlist_removed(target, title){
            setTimeout(function(){            
                target
                .removeClass('tp-wl-loading')
                .addClass('tp_wishlist_button')
                .removeClass('tp_wishlist_remove')
                .attr('title',title)
                .text(addWishlist);
            },500);
        }

        function tp_in_wishlist_alr(wishlist){        
            $('.tp_wishlist_button').each(function(){            
                var $this = $(this);
                var currentProduct = $this.data('product');
                var currentwish = $this.data('wish');
                currentProduct = currentProduct.toString();

                if ( tp_wl_in_list(currentProduct,wishlist) ) {                
                    $this.addClass('tp-wl-active tp_wishlist_remove').removeClass('tp_wishlist_button').attr('title',removeWishlist).text(removeWishlist);
                    if(currentwish.wishtype == 'tp_wl_text'){
                        $this.text('').append('<button class="tp_wishlist_addr"><span class="tp_wish_extra"><span style="opacity: 1;">'+currentwish.removetext+'</span></span>');
                    }
                    if(currentwish.wishtype == 'tp_wl_icon'){
                        $this.find('.tp_wishlist_addr').remove();
                        $this.text('').append('<button class="tp_wishlist_addrs"><span style="opacity: 1;"><i class="tp_icon_rm '+currentwish.addicon+'"></i></span></button>'); 
                    }else if(currentwish.wishtype == 'tp_wl_texti'){
                        $this.text('').append('<button class="tp_wishlist_addr"><span class="tp_wish_extra">'+currentwish.removetext+'</span><span style="opacity: 1;"><i class="tp_icon_rm '+currentwish.addicon+'"></i></span></button>');
                    }
                }
            });  
        }

    function tp_wishlist_count() {
        setTimeout(function(){            
            if( cntBtnCon.length > 0 ) {
                if(login == 'true') {
                    // setTimeout(function(){
                    //     var wlcount = $('.tp-wl-active.tp_wishlist_remove').length;
                    //     $('.tp-wishlist-count').text(wlcount);
                    // },500);         
                    $.ajax({
                        type: 'POST',
                        url: theplus_ajax_url,
                        data: {
                            'action' : 'tp_wl_get_user_data',
                            'dataType': 'json',
                            'status': 'publish',
                            'query' : query,
                            'shopname' : SesshopName,
                            'security' : theplus_nonce, 
                        },
                        success:function(data) { 
                            userData = JSON.parse(data);
                            if (userData && userData.wishlist ) {
                                var wlcount = userData.count;
                                $scope[0].querySelector('.tp-wishlist-count').textContent = wlcount;              
                            }
                        }
                    });
                }else{
                    var getlsvalue = JSON.parse(localStorage.getItem(shopName));
                    if( getlsvalue && getlsvalue.length > 0){
                        cntBtnCon[0].textContent = ''; 
                        cntBtnCon[0].textContent = getlsvalue.length; 
                    }
                }
            }
        }, 500);
    }

    function tp_woo_wishlist_count_change( shopName ){
        var findCompareCount = document.querySelectorAll('.tp-woo-wishlist.tp_wl_count ');
            findCompareCount.forEach((self) => {
                var countMainName = self.dataset.wid;
                if( shopName === countMainName ) {
                    if(login == 'true') {
                        $.ajax({
                            type: 'POST',
                            url: theplus_ajax_url,
                            data: {
                                'action' : 'tp_wl_get_user_data',
                                'dataType': 'json',
                                'status': 'publish',
                                'query' : query,
                                'shopname' : shopName,
                                'security' : theplus_nonce, 
                            },
                            success:function(data) { 
                                userData = JSON.parse(data);
                                if (userData && userData.wishlist ) {
                                    var updatecount = userData.count;
                                    self.querySelector('.tp-wishlist-count').textContent = updatecount;              
                                }
                            }
                        });
                    } else {
                        var getlsvalue = JSON.parse(localStorage.getItem(shopName));
                        self.querySelector('.tp-wishlist-count').textContent = '';
                        self.querySelector('.tp-wishlist-count').textContent = getlsvalue.length;
                    }
                }
            });
    }

    if( login == 'true' ) {
        $.ajax({
            type: 'POST',
            url: theplus_ajax_url,
            data: {
                'action' : 'tp_wl_get_user_data',
                'dataType': 'json',
                'status': 'publish',
                'query' : query,
                'shopname' : SesshopName,
                'security' : theplus_nonce, 
            },
            success:function(data) {                
                userData = JSON.parse(data);
                if (userData && userData.wishlist ) {
                    
                    var wishlist = userData.wishlist;
                    
                    tp_in_wishlist_alr(wishlist,inWishlist);
                    
                    if (typeof(sesstore) != 'undefined' && sesstore != null) {                        
                        sesstore.removeItem(SesshopName);
                    }                    
                } else {
                    if (typeof(sesstore) != 'undefined' && sesstore != null) {                       
                        wishlist = sesstore;
                    }
                    
                    $.ajax({
                        type: 'POST',
                        url:theplus_ajax_post_url,
                        data:{
                            action:'user_wishlist_update',
                            user_id : userData.user_id,
                            'query' : query,
                            'shopname' : SesshopName,
                            wishlist : wishlist,
                            'status': 'publish',
                            'security' : theplus_nonce,
                        }
                    })
                    .done(function(response) {                        
                        if (typeof(sesstore) != 'undefined' && sesstore != null) {
                            sesstore.removeItem(SesshopName);
                        }                        
                        tp_in_wishlist_alr(wishlist,inWishlist);                        
                    });
                }
            },
            error: function(){                
                console.log('No user info');
            }
        });
        
    } else {        
        if (typeof(locstore) != 'undefined' && locstore != null) {            
            wishlist = locstore;
        }
    }

    if( buttoncontainer.length > 0 ){
        buttoncontainer.forEach( function(self) {

            var currentwish = JSON.parse(self.getAttribute('data-wish'));
            var currentProduct = self.getAttribute('data-product');
            currentProduct = currentProduct.toString();
            
            if ( login == 'false' && tp_wl_in_list(currentProduct, wishlist)) { 
                self.classList.add('tp-wl-active');
                self.setAttribute('title', inWishlist);
                self.classList.remove('tp_wishlist_button');
                self.classList.add('tp_wishlist_remove');
                self.textContent = removeWishlist;

                if( currentwish.wishtype == 'tp_wl_text' ){
                    self.textContent = '';
                    var tBtn = document.createElement('button');
                        tBtn.className = 'tp_wishlist_addr';
                    
                    var tspnEle = document.createElement('span');
                        tspnEle.className = 'tp_wish_extra';
                        tspnEle.textContent = currentwish.removetext;
                        tspnEle.style.opacity = '1';

                    tBtn.appendChild(tspnEle);
                    self.appendChild(tBtn);
                } else if ( currentwish.wishtype == 'tp_wl_icon' ) {
                    // var existingButtons = btnCon.querySelectorAll('.tp_wishlist_addrs');
                    //     existingButtons.forEach(function(button) {
                    //         button.remove();
                    //     });
                    self.textContent = '';
                    var iBtn = document.createElement('button');
                        iBtn.className = 'tp_wishlist_addrs';    

                    var ispnEle = document.createElement('span');
                        ispnEle.style.opacity = '1';
                    var iEle = document.createElement('i');
                        iEle.className = 'tp_icon_rm ' + currentwish.addicon;

                    ispnEle.appendChild(iEle);
                    iBtn.appendChild(ispnEle);
                    self.appendChild(iBtn);
                } else if ( currentwish.wishtype == 'tp_wl_texti' ) {
                    
                    self.textContent = '';
                    var buttonElement = document.createElement('button');
                        buttonElement.className = 'tp_wishlist_addr';

                    var spanElement1 = document.createElement('span');
                        spanElement1.className = 'tp_wish_extra';
                        spanElement1.textContent = currentwish.removetext;

                    var iElement = document.createElement('i');
                        iElement.className = 'tp_icon_rm ' + currentwish.addicon;
                    
                    var spanElement2 = document.createElement('span');
                        spanElement2.style.opacity = '1';

                    spanElement2.appendChild(iElement);
                    buttonElement.appendChild(spanElement1);
                    buttonElement.appendChild(spanElement2);
                    self.appendChild(buttonElement);
                }
            }

            self.addEventListener( "click", function(e) {
                e.preventDefault();

                if (!(self.classList.contains('tp-wl-active')) && !(self.classList.contains('tp-wl-loading'))) {
                    // self.textContent = '';
                    self.classList.add('tp_wishlist_button');
                    self.classList.add('tp-wl-loading');

                    if( currentwish.wishtype == 'tp_wl_text' ){
                        self.textContent = '';
                        var tbtnEle = document.createElement('button');
                            tbtnEle.className = 'tp_wishlist_addrs';
                        var spanEle1 = document.createElement('span');
                            spanEle1.className = 'tp_wish_extra';
                        var spanEle2 = document.createElement('span');
                            spanEle2.style.opacity = '0';
                            spanEle2.textContent = currentwish.addtext;
                        
                        var loadingDiv = document.createElement('div');
                            loadingDiv.className = 'tp-wl-button-loading';
                        spanEle1.appendChild(spanEle2);
                        tbtnEle.appendChild(spanEle1);
                        tbtnEle.appendChild(loadingDiv);
                        self.appendChild(tbtnEle);
                    } else if ( currentwish.wishtype == 'tp_wl_icon' ) {
                        self.textContent = '';
                        var buttonElement = document.createElement('button');
                            buttonElement.className = 'tp_wishlist_addrs';
                        var spanElement = document.createElement('span');
                            spanElement.style.opacity = '0';
                        var iElement = document.createElement('i');
                            iElement.className = 'tp_icon_rm ' + currentwish.addicon;
                        var loadingDiv = document.createElement('div');
                            loadingDiv.className = 'tp-wl-button-loading';
                        spanElement.appendChild(iElement);
                        buttonElement.appendChild(spanElement);
                        buttonElement.appendChild(loadingDiv);
                        self.appendChild(buttonElement);
                    } else if ( currentwish.wishtype == 'tp_wl_texti' ) {
                        self.textContent = '';
                        var btnEle = document.createElement('button');
                            btnEle.className = 'tp_wishlist_addr';
                        var spanEle1 = document.createElement('span');
                            spanEle1.className = 'tp_wish_extra';
                            spanEle1.textContent = currentwish.addtext;
                        var spanEle2 = document.createElement('span');
                            spanEle2.style.opacity = '0';
                        var iEle = document.createElement('i');
                            iEle.className = 'tp_icon_rm ' + currentwish.removeicon;
                        var loadingDiv = document.createElement('div');
                            loadingDiv.className = 'tp-wl-button-loading';
                            loadingDiv.style.left = 'auto;';
                        spanEle2.appendChild(iEle);
                        btnEle.appendChild(spanEle1);
                        btnEle.appendChild(spanEle2);
                        btnEle.appendChild(loadingDiv);
                        self.appendChild(btnEle);
                    }

                    if ( login == 'true' ) {
                        if (userData['user_id']) {
                            $.ajax({
                                type: 'POST',
                                url: theplus_ajax_post_url,
                                data: {
                                    action: 'user_wishlist_update',
                                    user_id: userData['user_id'],
                                    'query': query,
                                    'shopname': SesshopName,
                                    wishlist: currentProduct,
                                    'status': 'publish',
                                    'security': theplus_nonce,
                                }
                            }).done(function(response) {
                                self.classList.remove('tp-wl-loading');
                                self.classList.add('tp-wl-active');
                                self.classList.add('tp_wishlist_remove');
                                self.classList.remove('tp_wishlist_button');
                                self.setAttribute('title', inWishlist);
                                self.textContent = removeWishlist;
                                tp_wishlist_complete_on_change();      
                                // tp_wishlist_count();
                                tp_woo_wishlist_count_change( SesshopName );
  
                                self.classList.remove('tp-wl-button-loading');
                                //$this.text(removeWishlist);
                                if( currentwish.wishtype == 'tp_wl_text' ) {
                                    setTimeout(function(){
                                        self.textContent = '';
                                        var newbtnEle = document.createElement('button');
                                            newbtnEle.className = 'tp_wishlist_addrs';
        
                                        var newspanEle1 = document.createElement('span');
                                            newspanEle1.className = 'tp_wish_extra';
        
                                        var newspanEle2 = document.createElement('span');
                                            newspanEle2.style.opacity = '1';
                                            newspanEle2.textContent = currentwish.removetext;
        
                                        newspanEle1.appendChild(newspanEle2);
                                        newbtnEle.appendChild(newspanEle1);
                                        self.appendChild(newbtnEle);
                                    }, 500);
                                } else if ( currentwish.wishtype == 'tp_wl_icon' ) {
                                    setTimeout(function(){
                                        self.textContent = '';
                                        var newButtonElement = document.createElement('button');
                                            newButtonElement.className = 'tp_wishlist_addrs';
                
                                        var newSpanElement = document.createElement('span');
                                            newSpanElement.style.opacity = '1';
                
                                        var newiElement = document.createElement('i');
                                            newiElement.className = 'tp_icon_rm ' + currentwish.addicon;
                
                                        newSpanElement.appendChild(newiElement);
                                        newButtonElement.appendChild(newSpanElement);
                                        self.appendChild(newButtonElement);
                                    }, 500);
                                } else if ( currentwish.wishtype == 'tp_wl_texti' ) {
                                    self.textContent = '';
                                    var btnEle = document.createElement('button');
                                        btnEle.className = 'tp_wishlist_addr';

                                    var spanEle1 = document.createElement('span');
                                        spanEle1.className = 'tp_wish_extra';
                                        spanEle1.textContent = currentwish.addtext;

                                    var spanEle2 = document.createElement('span');
                                        spanEle2.style.opacity = '0';

                                    var iEle = document.createElement('i');
                                        iEle.className = 'tp_icon_rm ' + currentwish.removeicon;

                                    var loadingDiv = document.createElement('div');
                                        loadingDiv.className = 'tp-wl-button-loading';
                                        loadingDiv.style.left = 'auto';

                                    spanEle2.appendChild(iEle);
                                    btnEle.appendChild(spanEle1);
                                    btnEle.appendChild(spanEle2);
                                    btnEle.appendChild(loadingDiv);
                                    self.appendChild(btnEle);
                                    setTimeout(function(){
                                        self.textContent = '';
                                        var newBtnEle = document.createElement('button');
                                            newBtnEle.className = 'tp_wishlist_addr';
                
                                        var newSpanEle1 = document.createElement('span');
                                            newSpanEle1.className = 'tp_wish_extra';
                                            newSpanEle1.textContent = currentwish.removetext;
                
                                        var newSpanEle2 = document.createElement('span');
                                            newSpanEle2.style.opacity = '1';
                
                                        var newiEle = document.createElement('i');
                                            newiEle.className = 'tp_icon_rm ' + currentwish.addicon;
                
                                        newSpanEle2.appendChild(newiEle);
                                        newBtnEle.appendChild(newSpanEle1);
                                        newBtnEle.appendChild(newSpanEle2);
                                        self.appendChild(newBtnEle);
                                    }, 500);
                                }
                            }).fail(function(data) {                           
                                alert("Something went wrong");
                                self.classList.remove('tp-wl-button-loading');
                                self.textContent = removeWishlist;
                                if(currentwish.wishtype == 'tp_wl_icon'){ 
                                    self.textContent = '';
                                    var newButtonElement = document.createElement('button');
                                        newButtonElement.className = 'tp_wishlist_addrs';
            
                                    var newiElement = document.createElement('i');
                                        newiElement.className = 'tp_icon_rm ' + currentwish.addicon;
            
                                    newButtonElement.appendChild(newiElement);
                                    self.appendChild(newButtonElement);
                                }
                            });
                        }
                    } else {
                        wishlist = JSON.parse(localStorage.getItem(shopName));
                        if(wishlist == null){                    
                            wishlist = [];
                        }
                        wishlist.push(currentProduct);
                        wishlist = wishlist.unique();
                                    
                        localStorage.setItem(shopName, JSON.stringify(wishlist));

                        self.classList.remove('tp-wl-loading');
                        self.classList.add('tp-wl-active');
                        self.classList.add('tp_wishlist_remove');
                        self.classList.remove('tp_wishlist_button');
                        self.setAttribute('title', inWishlist);
                        self.textContent = removeWishlist;

                        tp_wishlist_complete_on_change();
                        // tp_wishlist_count();
                        tp_woo_wishlist_count_change( shopName );

                        if( currentwish.wishtype == 'tp_wl_text' ) {
                            self.textContent = '';
                            var tbtnEle = document.createElement('button');
                                tbtnEle.className = 'tp_wishlist_addrs'; 

                            var spanEle1 = document.createElement('span');
                                spanEle1.className = 'tp_wish_extra';

                            var spanEle2 = document.createElement('span');
                                spanEle2.style.opacity = '0';
                                spanEle2.textContent = currentwish.addtext;
                            
                            var loadingDiv = document.createElement('div');
                                loadingDiv.className = 'tp-wl-button-loading';

                            spanEle1.appendChild(spanEle2);
                            tbtnEle.appendChild(spanEle1);
                            tbtnEle.appendChild(loadingDiv);
                            self.appendChild(tbtnEle);
                            setTimeout(function(){
                                self.textContent = '';
                                var newbtnEle = document.createElement('button');
                                    newbtnEle.className = 'tp_wishlist_addrs';

                                var newspanEle1 = document.createElement('span');
                                    newspanEle1.className = 'tp_wish_extra';

                                var newspanEle2 = document.createElement('span');
                                    newspanEle2.style.opacity = '1';
                                    newspanEle2.textContent = currentwish.removetext;

                                newspanEle1.appendChild(newspanEle2);
                                newbtnEle.appendChild(newspanEle1);
                                self.appendChild(newbtnEle);
                            }, 500);
                        } else if ( currentwish.wishtype == 'tp_wl_icon' ) {
                            self.textContent = '';
                            var buttonElement = document.createElement('button');
                                buttonElement.className = 'tp_wishlist_addrs';

                            var spanElement = document.createElement('span');
                                spanElement.style.opacity = '0';

                            var iElement = document.createElement('i');
                                iElement.className = 'tp_icon_rm ' + currentwish.addicon;

                            var loadingDiv = document.createElement('div');
                                loadingDiv.className = 'tp-wl-button-loading';

                            spanElement.appendChild(iElement);
                            buttonElement.appendChild(spanElement);
                            buttonElement.appendChild(loadingDiv);
                            self.appendChild(buttonElement);
                            setTimeout(function(){
                                self.textContent = '';
                                var newButtonElement = document.createElement('button');
                                    newButtonElement.className = 'tp_wishlist_addrs';
        
                                var newSpanElement = document.createElement('span');
                                    newSpanElement.style.opacity = '1';
        
                                var newiElement = document.createElement('i');
                                    newiElement.className = 'tp_icon_rm ' + currentwish.addicon;
        
                                newSpanElement.appendChild(newiElement);
                                newButtonElement.appendChild(newSpanElement);
                                self.appendChild(newButtonElement);
                            }, 500);
                        } else if ( currentwish.wishtype == 'tp_wl_texti' ) {
                            self.textContent = '';
                            var btnEle = document.createElement('button');
                                btnEle.className = 'tp_wishlist_addr';

                            var spanEle1 = document.createElement('span');
                                spanEle1.className = 'tp_wish_extra';
                                spanEle1.textContent = currentwish.addtext;

                            var spanEle2 = document.createElement('span');
                                spanEle2.style.opacity = '0';

                            var iEle = document.createElement('i');
                                iEle.className = 'tp_icon_rm ' + currentwish.removeicon;

                            var loadingDiv = document.createElement('div');
                                loadingDiv.className = 'tp-wl-button-loading';
                                loadingDiv.style.left = 'auto';

                            spanEle2.appendChild(iEle);
                            btnEle.appendChild(spanEle1);
                            btnEle.appendChild(spanEle2);
                            btnEle.appendChild(loadingDiv);
                            self.appendChild(btnEle);
                            setTimeout(function(){
                                self.textContent = '';
                                var newBtnEle = document.createElement('button');
                                    newBtnEle.className = 'tp_wishlist_addr';
        
                                var newSpanEle1 = document.createElement('span');
                                    newSpanEle1.className = 'tp_wish_extra';
                                    newSpanEle1.textContent = currentwish.removetext;
        
                                var newSpanEle2 = document.createElement('span');
                                    newSpanEle2.style.opacity = '1';
        
                                var newiEle = document.createElement('i');
                                    newiEle.className = 'tp_icon_rm ' + currentwish.addicon;
        
                                newSpanEle2.appendChild(newiEle);
                                newBtnEle.appendChild(newSpanEle1);
                                newBtnEle.appendChild(newSpanEle2);
                                self.appendChild(newBtnEle);
                            }, 500);
                        }
                        e.stopImmediatePropagation();
                    }
                }
                
            });
        });
    }
    

    $(mainContainer[0]).on('click', '.tp_wishlist_remove', function(e){
     
        e.preventDefault();
        var $this = $(this);
        var currentProduct = $this.data('product');
        var currentwish = $this.data('wish');
    
        currentProduct = currentProduct.toString();
        var cparr = JSON.parse(currentProduct);
        $this.removeClass('tp-wl-active').attr('title',addWishlist);
        $this.addClass('tp_wishlist_button')    
        
        if(currentwish.wishtype == 'tp_wl_text'){
            setTimeout(function(){
                $this.text('').append('<button class="tp_wishlist_addrs"><span class="tp_wish_extra"><span style="opacity: 0;">'+currentwish.removetext+'</span></span><div class="tp-wl-button-loading"></div></button>');
        }, 500);
        }else if(currentwish.wishtype == 'tp_wl_texti'){
            setTimeout(function(){
                $this.text('').append('<button class="tp_wishlist_addr"><span class="tp_wish_extra">'+currentwish.removetext+'</span><span style="opacity: 0;"><i class="tp_icon_rm '+currentwish.removeicon+'"></i></span><div class="tp-wl-button-loading" style="left: auto;"></div></button>');
        }, 500);
        }else if(currentwish.wishtype == 'tp_wl_icon'){
            setTimeout(function(){
                $this.text('').append('<button class="tp_wishlist_addrs"><span style="opacity: 0;"><i class="tp_icon_rm '+currentwish.addicon+'"></i></span><div class="tp-wl-button-loading"></div></button>');
        }, 500);
        }
    
        if (!$this.hasClass('tp-wl-active') && !$this.hasClass('tp-wl-loading')) {

            if ( login == 'true' ) {
                $this.addClass('tp-wl-loading');
                if (userData['user_id']) {
                    $.ajax({
                        type: 'POST',
                        url:theplus_ajax_post_url,
                        data:{
                            action:'tp_user_wishlist_remove',
                            user_id :userData['user_id'],
                            'query' : query,
                            'shopname' : SesshopName,
                             wishlist :cparr,
                            'status': 'publish',
                            'security' : theplus_nonce, 
                        }
                    }).done(function(response) {                            
                        tp_wishlist_removed($this, addWishlist);
                        tp_wishlist_complete_on_change();
                        // tp_wishlist_count();
                        tp_woo_wishlist_count_change( SesshopName );
                        $this.removeClass('tp-wl-button-loading');
                        if(currentwish.wishtype == 'tp_wl_text'){
                            setTimeout(function(){
                                $this.text('').append('<button class="tp_wishlist_addrs"><span class="tp_wish_extra"><span style="opacity: 1;">'+currentwish.addtext+'</span></span></button>');
                            }, 500);
                        }else if(currentwish.wishtype == 'tp_wl_icon'){ 
                            setTimeout(function(){
                                $this.text('').append('<button class="tp_wishlist_addrs"><span style="opacity: 1;"><i class="tp_icon_rm '+currentwish.removeicon+'"></i></span></button>');
                            }, 500);
                            
                        }else if(currentwish.wishtype == 'tp_wl_texti'){
                            setTimeout(function(){
                                $this.text('').append('<button class="tp_wishlist_addr"><span class="tp_wish_extra">'+currentwish.addtext+'</span><i class="tp_icon_rm '+currentwish.removeicon+'"></i></button>');
                            }, 500);
                        }       
                    })
                    .fail(function(data) {                           
                        alert("Something went wrong");
                        $this.text(addWishlist).removeClass('tp-wl-button-loading');
                        if(currentwish.wishtype == 'tp_wl_icon'){ 
                            $this.append('<button class="tp_wishlist_addrs"><i class="tp_icon_rm '+currentwish.removeicon+'"></i></button>');  
                        } 
                    });
                     
                }
            }else{
             

                var getlsvalue = JSON.parse(localStorage.getItem(shopName));
                var wishlist = jQuery.grep(getlsvalue, function(value) {
                    return value != currentProduct;
                }); 

                localStorage.setItem(shopName, JSON.stringify(wishlist));
                tp_wishlist_removed($this, addWishlist);
                tp_wishlist_complete_on_change();
                // tp_wishlist_count();
                tp_woo_wishlist_count_change( shopName );

                if(currentwish.wishtype == 'tp_wl_text'){
                    $this.text('').append('<button class="tp_wishlist_addrs"><span class="tp_wish_extra"><span style="opacity: 0;">'+currentwish.removetext+'</span></span><div class="tp-wl-button-loading"></div></button>');
                    setTimeout(function(){
                        $this.text('').append('<button class="tp_wishlist_addrs"><span class="tp_wish_extra"><span style="opacity: 1;">'+currentwish.addtext+'</span></span></button>');
                    }, 500);

                }else if(currentwish.wishtype == 'tp_wl_icon'){ 
                    $this.text('').append('<button class="tp_wishlist_addrs"><span style="opacity: 0;"><i class="tp_icon_rm '+currentwish.addicon+'"></i></span><div class="tp-wl-button-loading"></div></button>');
                    setTimeout(function(){
                        $this.text('').append('<button class="tp_wishlist_addrs"><span style="opacity: 1;"><i class="tp_icon_rm '+currentwish.removeicon+'"></i></span></button>');
                    }, 500);  
                }else if(currentwish.wishtype == 'tp_wl_texti'){
                        $this.text('').append('<button class="tp_wishlist_addr"><span class="tp_wish_extra">'+currentwish.removetext+'</span><span style="opacity: 0;"><i class="tp_icon_rm '+currentwish.addicon+'"></i></span><div class="tp-wl-button-loading" style="left: auto;"></div></button>');
                    setTimeout(function(){
                        $this.text('').append('<button class="tp_wishlist_addr"><span class="tp_wish_extra">'+currentwish.addtext+'</span><span style="opacity: 1;"><i class="tp_icon_rm '+currentwish.removeicon+'"></i></span></button>');
                    }, 500);
                } 
            } 
            e.stopImmediatePropagation();
        }
        
    });
}
$(window).on('elementor/frontend/init', function () {
    elementorFrontend.hooks.addAction( 'frontend/element_ready/tp-woo-wishlist.default', WidgetwishlistHandler );
});
})(jQuery);