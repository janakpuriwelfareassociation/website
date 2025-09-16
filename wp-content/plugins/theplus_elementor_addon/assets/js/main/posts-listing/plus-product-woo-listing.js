/*woo_listing*/
function tp_woo_listing( $scope, listing, widget ) {
    $ = jQuery;

    var container = listing;
    var login  = $('body').hasClass('logged-in') ? 'true' : 'false',
        tprow  = container[0].querySelectorAll('.tp-row'),
        listing_type = JSON.parse( tprow[0].getAttribute('data-wooattr') );
    let	option = [];
    let	shopList = [];

    if( container[0].classList.contains('tp-pro-l-type-wishlist') || container[0].classList.contains('tp-dy-l-type-wishlist') ) {
        listing_type = 'wishlist';
        if( widget === 'products' ) {
            var shopName = 'tpwishlist';
        } else if( widget === 'dynamic' ) {
            var shopName = $scope[0].querySelector('.dynamic-listing.tp-dy-l-type-wishlist').dataset.wid;
        }
    } else if ( container[0].classList.contains('tp-pro-l-type-recently_viewed') ) {
        listing_type = 'recently_viewed';
    }

    if ( tprow.length ) {
        tprow.forEach( function( item, index ) {
            option[index] = item.dataset.wooattr ? JSON.parse(item.dataset.wooattr) : [];
            // option[index] = item.dataset.wooattr ? item.dataset.wooattr : [];

            if( login == 'false' ){
                if ( 'wishlist' == listing_type ) {
                    getlsvaluewlnl = [];
                    if( item.offsetParent.classList.contains('product-list') ){
                        let notloginl = item.dataset.wid;
                        var getlsvaluewlnl = JSON.parse( localStorage.getItem( notloginl ) );

                        shopList[index] = getlsvaluewlnl ? getlsvaluewlnl : [];
                    }
                    else if( item.offsetParent.classList.contains('dynamic-listing') ){
                        let notloginl = item.offsetParent.dataset.wid;
                        var getlsvaluewlnl = JSON.parse( localStorage.getItem( notloginl ) );

                        shopList[index] = getlsvaluewlnl ? getlsvaluewlnl : [];
                    }
                }
            }
        });
    }

    if( container.length ) {
        var getlsvaluewlnl = [];

        if( login == 'false' ) {
            if ( 'wishlist' == listing_type ) {
                // if ( JSON.parse( localStorage.getItem(shopName) ) != null ) {
                //     getlsvaluewlnl = JSON.parse( localStorage.getItem(shopName) ); 
                // }
            } else if ( 'recently_viewed' == listing_type ) {
                let nonlogincookies = Cookies.get('tpwoorplnonlogin');
                if ( !nonlogincookies ) {
                    console.log('');
                } else if ( nonlogincookies.length != 0 ) {
                    if ( nonlogincookies.includes("|")) {
                        getlsvaluewlnl = nonlogincookies.split("|");
                    } else {
                        getlsvaluewlnl = nonlogincookies.split(" ");
                    }
                    shopList = getlsvaluewlnl;
                }
            }
        }

        let loadmoreWrap = document.querySelectorAll( '.tp-pro-l-type-wishlist .post-load-more, .tp-dy-l-type-wishlist .post-load-more' );
        if( loadmoreWrap.length > 0 ) {
            let url = new URL(window.location.href);
            if (url && url.search) {
                
                let params = new URLSearchParams(url.search);
                var loadmoreParams = {},
                    loadmorekeys = {};

                params.forEach((value, key) => {
                    if ( key.startsWith('loadmore') ) {
                        let widget_key = key.replace('loadmore_', '');
        
                        loadmoreParams[key] = value;
                        loadmorekeys[widget_key] = widget_key;
                    }
                });

                if( Object.keys(loadmoreParams).length > 0 ) {
                    loadmorekeys = Object.values(loadmorekeys);

                    loadmoreWrap.forEach( function( self, idx ) { 
                        let current_widget = self;
                        var check_widget = false;
                        
                        loadmorekeys.forEach(self => { 
                            if( current_widget.closest(`.elementor-element-${self}`) ){
                                check_widget = true;
                            } else {
                                check_widget = false;
                            }

                            if( check_widget ) {
                                current_widget.setAttribute('loadmore-count', loadmoreParams[`loadmore_${self}`]);
                            }
                        })

                    });
                }

            }
        }

        $.ajax({
            type: 'POST',
            url: theplus_ajax_url,
            data: {
                'action': 'tp_wl_get_all_data_ajax',
                'listingtype': listing_type,
                'dataType': 'json',
                'option': option,
                'login': login,
                'notloginwl': shopList,
                'security': theplus_nonce,
                'loadmoreParams': loadmoreParams,
            },
            success:function(response) {
                tprow.forEach(function(item, index) {
                    var wishlistarray = JSON.parse(response[index].htmljsondata);

                    if( 'wishlist' === listing_type ){
                        var idx = 0;

                        if( widget === 'products' ) {
                            var paginData = container[0].querySelector('.tp-pro-l-type-wishlist .tp-ajax-paginate-wrapper');
                            if( paginData ) {
                                addPagination( idx, wishlistarray, item, paginData );
                            }
                            var loadmoreData = container[0].querySelector('.tp-pro-l-type-wishlist .ajax_load_more > .post-load-more');
                            if( loadmoreData ) {
                                addLoadmore( wishlistarray, loadmoreData, widget );
                            }
                            var lazyloadData = container[0].querySelector('.tp-pro-l-type-wishlist .ajax_lazy_load > .post-lazy-load');
                            if( lazyloadData ) {
                                addLazyload( wishlistarray, lazyloadData, widget );
                            }
                        } else if( widget === 'dynamic' ) {
                            var paginData = container[0].querySelector('.tp-dy-l-type-wishlist .tp-ajax-paginate-wrapper');
                            if( paginData ) {
                                addPagination( idx, wishlistarray, item, paginData );
                            }
                            var loadmoreData = container[0].querySelector('.tp-dy-l-type-wishlist .ajax_load_more > .post-load-more');
                            if( loadmoreData ) {
                                addLoadmore( wishlistarray, loadmoreData, widget );
                            }
                        }
                    }else if( 'recently_viewed' == listing_type ){
                        var productData = container[0].querySelector('.tp-pro-l-type-recently_viewed .tp-ajax-paginate-wrapper');
                        var idx = 0;

                        addPagination( idx, wishlistarray, item, productData );
                    }

                    if ( wishlistarray.listdata != null && wishlistarray.listdata.length != 0 ) {
                        if( container[0].querySelector('.tp-row .theplus-posts-not-found') ){
                            container[0].querySelector('.tp-row .theplus-posts-not-found').remove();
                        }

                        // container[0].querySelector('.tp-row').insertAdjacentHTML("afterbegin", response[index].HtmlData);

                        let tpRow = container[0].querySelector('.tp-row');
                            tpRow.innerHTML = ""; 
                            tpRow.insertAdjacentHTML("afterbegin", response[index].HtmlData);

                        let extparam = item.dataset.extparam ? JSON.parse(item.dataset.extparam) : [];
                        let loading_optn = extparam['loading-opt'] ? extparam['loading-opt'] : '';
                        if( loading_optn == 'skeleton' ){
                            tpgbSkeleton_filter("visible");
                        }

                        setTimeout( function(){
                            if( loading_optn == 'skeleton' ){
                                tpgbSkeleton_filter("hidden");
                            }

                            if( widget === 'products' ) {
                                var containermetro = document.querySelectorAll('.product-list.list-isotope-metro'),
                                    gridlayout = document.querySelectorAll('.product-list .tp-row.layout-fitRows'),
                                    masonrylayout = document.querySelectorAll('.product-list .tp-row.layout-masonry'),
                                    slicklayout = document.querySelectorAll('.product-list .list-carousel-slick > .post-inner-loop');
                            } else if( widget === 'dynamic' ) {
                                var containermetro = document.querySelectorAll('.dynamic-listing.list-isotope-metro'),
                                    gridlayout = document.querySelectorAll('.dynamic-listing .tp-row.layout-fitRows'),
                                    masonrylayout = document.querySelectorAll('.dynamic-listing .tp-row.layout-masonry'),
                                    slicklayout = document.querySelectorAll('.dynamic-listing.list-carousel-slick > .post-inner-loop');
                            }

                            if( gridlayout.length || masonrylayout.length ){
                                $(container[0].querySelector('.tp-row')).isotope('reloadItems').isotope();
                            }
                            
                            if( slicklayout.length ) {                                                    
                                $(container[0].querySelector('.list-carousel-slick > .post-inner-loop')).slick('setPosition');
                            }

                            if( containermetro.length ) {                                              
                                theplus_setup_packery_portfolio('all');                                                    
                            }

                        },1000);
                    } else {
                        item.innerHTML = '';

                        var notFound = response[index].HtmlError ? response[index].HtmlError : '';
                            item.insertAdjacentHTML("afterbegin", `<h3 class="theplus-posts-not-found tp-pl-nf-space">${notFound}</h3>`);
                            item.style.cssText = 'height: 75px;';
                    }
                });
            }
        });

        function addLazyload( wishlistarray, lazyloadData, widget ) {
            var total_post = parseInt(wishlistarray.count),
                oldOffset = parseInt(lazyloadData.dataset.offsetPosts),
                display_post = parseInt(lazyloadData.dataset.display_post),
                post_load_more = parseInt(lazyloadData.dataset.post_load_more),
                offset_posts = display_post + oldOffset;
            
            if( display_post >= total_post ) {
                lazyloadData.classList.add('hide');
                var parentElement = lazyloadData.closest('.ajax_lazy_load');
                var plDiv = document.createElement('div');
                    plDiv.className = 'plus-all-posts-loaded';
                    plDiv.textContent = lazyloadData.dataset.loaded_posts;

                parentElement.appendChild(plDiv);
            }

            total_post = parseInt(total_post - offset_posts);

            if( total_post != 0 && post_load_more !=0 ){
                var load_page = Math.ceil( total_post/post_load_more );
            } else {
                var load_page = 1;
            }
            load_page = load_page + 1;

            lazyloadData.setAttribute('data-total_page', load_page);

            var click = lazyloadData,
                page = click.dataset.page,
                total_page = click.dataset.total_page,
                current_text = click.innerText,
                loaded_posts = click.dataset.loaded_posts,
                loadmore_count = click.getAttribute('loadmore-count');

            if( loadmore_count ) {
                page = parseInt(page) + parseInt(loadmore_count);
                if( page == total_page ){
                    click.classList.add('hide');
                    click.setAttribute('data-page', page);
                    var parentElement = click.closest('.ajax_load_more');
                    var plDiv = document.createElement('div');
                        plDiv.className = 'plus-all-posts-loaded';
                        plDiv.textContent = loaded_posts;
                    
                    parentElement.appendChild(plDiv);
                } else {
                    click.textContent = current_text;
                    click.setAttribute('data-page', page);
                }
            }
        }

        function addLoadmore( wishlistarray, loadmoreData, widget ){
            var total_post = parseInt(wishlistarray.count),
                oldOffset = parseInt(loadmoreData.dataset.offsetPosts),
                display_post = parseInt(loadmoreData.dataset.display_post),
                post_load_more = parseInt(loadmoreData.dataset.post_load_more),
                offset_posts = display_post + oldOffset;

            if ( display_post >= total_post ) {
                loadmoreData.classList.add('hide');
                var parentElement = loadmoreData.closest('.ajax_load_more');
                var plDiv = document.createElement('div');
                    plDiv.className = 'plus-all-posts-loaded';
                    plDiv.textContent = loadmoreData.dataset.loaded_posts;

                parentElement.appendChild(plDiv);
            }

            total_post = parseInt(total_post - offset_posts);
            
            if( total_post != 0 && post_load_more !=0 ){
                var load_page = Math.ceil( total_post/post_load_more );
            } else {
                var load_page = 1;
            }
            load_page = load_page + 1;

            loadmoreData.setAttribute('data-total_page', load_page);

            var click = loadmoreData,
                page = click.dataset.page,
                total_page = click.dataset.total_page,
                current_text = click.innerText,
                loaded_posts = click.dataset.loaded_posts,
                loadmore_count = click.getAttribute('loadmore-count');

            if( loadmore_count ) {
                page = parseInt(page) + parseInt(loadmore_count);
                if( page == total_page ){
                    click.classList.add('hide');
                    click.setAttribute('data-page', page);
                    var parentElement = click.closest('.ajax_load_more');
                    var plDiv = document.createElement('div');
                        plDiv.className = 'plus-all-posts-loaded';
                        plDiv.textContent = loaded_posts;
                    
                    parentElement.appendChild(plDiv);
                } else {
                    click.textContent = current_text;
                    click.setAttribute('data-page', page);
                }
            }
        }

        function addPagination( index, wishlistarray, item, conproData ){

            // var conproData = container[0].querySelector('.tp-pro-l-type-wishlist .tp-ajax-paginate-wrapper');
            var producAttr = (conproData && conproData.dataset.searchattr) ? JSON.parse(conproData.dataset.searchattr) : [],
                oldOffset = producAttr.offset_posts ? producAttr.offset_posts : 0,
                total_post = wishlistarray.count;
                
            if( ( producAttr.listing_type == 'wishlist' || producAttr.listing_type == 'recently_viewed' ) && producAttr.paginationType == 'ajaxbased' ){
                var display_posts = producAttr.display_post ? producAttr.display_post : 0;
                var offset_posts = display_posts + oldOffset;
                var tpPagNum = Math.ceil( total_post/display_posts );
                var load_page = 1;
                var total_posts = total_post - offset_posts;

                if( display_posts < total_post ) {
                    let paginWrap = container[0].querySelector( '.theplus-pagination' );
                    if( paginWrap ) {
                        var nextBtn = paginWrap.querySelector('.paginate-next');
                        if( nextBtn.classList.contains('tp-page-hide') ){
                            nextBtn.classList.remove('tp-page-hide');
                        }
                        if (!paginWrap.querySelector('.tp-number.current')){
                            for ( i = 1; i <= tpPagNum; i++ ){
                                var name = '';
                                if ( i == 1 ) {
                                    name = 'current';
                                } else if ( i > 3 ) {
                                    name = 'tp-page-hide';
                                }
                                
                                var pagiDiv = document.createElement('a');
                                    pagiDiv.setAttribute('href', '#');
                                    pagiDiv.setAttribute('class', 'tp-ajax-paginate tp-number ' + name);
                                    pagiDiv.setAttribute('data-page', i);
                                    pagiDiv.textContent = i;

                                nextBtn.parentNode.insertBefore(pagiDiv, nextBtn);
                            } 
                        }
                    }
                }

                let Pagin = container[0].querySelectorAll( '.theplus-pagination' );
                if (Pagin.length > 0) {
                    let pagBtn = container[0].querySelectorAll( '.theplus-pagination .tp-ajax-paginate' );
                    if( pagBtn.length > 0 ) {
                        onpagBtnClick(pagBtn, item, Pagin, producAttr, oldOffset, tpPagNum, index);
                    }
                }
            }

        }

        /** Remove from list - Wishlist*/
        $(container).on('click', '.tp-pro-wl-remove-item', function(e){
            e.preventDefault();
            var $this = $(this);
            var currentProduct = $this.data('product');
                currentProduct = currentProduct.toString();

            jQuery(".tp-woo-wishlist .tp_wishlist_remove").each(function(){
                var $this1 = $(this);
                var testdata = $this1.data('product');                                
                if ( testdata.toString() === currentProduct ) {
                    $(this).trigger( "click" );
                }
            });
        });
    }

    var tpgbSkeleton_filter = function(val1) {
        let skeleton = $scope[0].querySelectorAll('.tp-skeleton');
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
}