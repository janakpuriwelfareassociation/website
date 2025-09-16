/** Plus Load-More*/
$ = jQuery;
function loadmore_onload_call(mainWrap) {
    let url = new URL(window.location.href);
    if (url && url.search) {
        let params = new URLSearchParams(url.search);
        var loadmoreParams = {},
            loadmorekeys = {};

        params.forEach((value, key) => {
            if (key.startsWith('loadmore')) {
                let widget_key = key.replace('loadmore_', '');

                loadmoreParams[key] = value;
                loadmorekeys[widget_key] = widget_key;
            }
        });

        if (Object.keys(loadmoreParams).length > 0) {
            loadmorekeys = Object.values(loadmorekeys);

            mainWrap.forEach(function (self, idx) {
                let current_widget = self;
                var check_widget = false;

                loadmorekeys.forEach(self => {
                    if (current_widget.closest(`.elementor-element-${self}`)) {
                        check_widget = true;
                    }

                    if (check_widget) {
                        current_widget.setAttribute('loadmore-count', loadmoreParams[`loadmore_${self}`]);

                        let loadclass = current_widget.dataset.loadClass;
                        if (current_widget.closest(`.${loadclass}`).classList.contains('plus_ajax_filter')) {
                            return;
                        }

                        listingloadmore(current_widget, 'onload', loadmoreParams);

                        check_widget = false;
                    }
                });
            });
        }
    }
}

var clickloadmore = function (self) {
    listingloadmore(self[0], 'click', '');
}

function listingloadmore(current_widget, type, loadmoreParams) {
    var click = current_widget,
        page = click.dataset.page,
        total_page = click.dataset.total_page,
        load_class = click.dataset.loadClass,
        layout = click.dataset.layout,
        // loadattr = click.dataset.loadattr,
        display_post = click.dataset.display_post,
        offset_posts = click.dataset.offsetPosts,
        post_load_more = click.dataset.post_load_more,
        current_text = click.innerText,
        loaded_posts = click.dataset.loaded_posts,
        loading_text = click.dataset.tp_loading_text,
        loadmore_count = click.getAttribute('loadmore-count') ? click.getAttribute('loadmore-count') : '';

    var current_listing = click.closest(`.${load_class}`),
        get_row = current_listing.querySelector('.tp-row'),
        loadattr = get_row.dataset.wooattr ? get_row.dataset.wooattr : '',
        extparam = get_row.dataset.extparam ? JSON.parse(get_row.dataset.extparam) : [],
        URLpara = extparam['URL-para'] ? extparam['URL-para'] : '';

    let loadCount = 1;
    let current_textt = current_text;

    if (offset_posts == undefined || offset_posts == "") {
        offset_posts = 0;
    }

    if (parseInt(total_page) >= parseInt(page)) {
        let offset = getOffset(page, post_load_more, display_post, offset_posts);

        var ajaxData = {
            action: 'theplus_more_post',
            offset: offset,
            paged: page,
            loadattr: loadattr,
            nonce: 'theplus-addons',
        };

        if (current_listing.classList.contains('plus_ajax_filter')) {
            let ajaxFilter = current_listing.querySelector('.post-filter-data');
            let selectedCat = ajaxFilter.querySelector('.filter-category-list-ajax.active');
            if (selectedCat) {
                let filterValue = selectedCat.getAttribute('data-filter'); 
                // selectedCat.getAttribute('data-filter');
                
                // selectedCat = selectedCat.replace('.', '');
                filterValue = filterValue.replace('.', '');
                // if (selectedCat == '*') {
                //     selectedCat = '';
                // }
                if (filterValue == '*') {
                    filterValue = '';
                }
                ajaxData.filter_cat = filterValue;
            }

        }

        if (type === 'onload') {
            ajaxData.doaction = 'on-load';
            ajaxData.loadmoreParams = loadmoreParams;

            if (current_listing.classList.contains('plus_ajax_filter')) {
                return;
            }
        }

        $.ajax({
            type: 'POST',
            data: ajaxData,
            url: theplus_ajax_url,
            beforeSend: function () {
                click.textContent = loading_text;
            },
            success: function (response) {

                var data = response.HtmlData;
                var tp_row = current_listing.querySelector('.tp-row.post-inner-loop');

                if (current_listing.classList.contains('plus_ajax_filter')) {
                    countTotalpages(response, display_post, offset_posts, post_load_more, click);
                }

                setTimeout(function () {
                    tp_Skeleton_filter("hidden", tp_row);
                }, 1000);

                if (data == '') {
                    click.classList.add('hide');
                } else {
                    if (type === 'onload') {
                        $("." + load_class + ' .post-inner-loop').empty();
                    }
                    $("." + load_class + ' .post-inner-loop').append(data);

                    Resizelayout(layout, load_class);

                    var qvWrap = document.querySelectorAll(`.${load_class}.product-list .post-inner-loop .tp-wp-quickview-wrapper, .${load_class}.dynamic-listing .post-inner-loop .tp-wp-quickview-wrapper`);
                    if( qvWrap.length > 0 ){
                        qvWrap.forEach(function(self) {
                            self.addEventListener( "click", function(e) {
                                e.preventDefault();
                                tp_wp_quick_view( self );
                            });
                        });
                    }

                    animatecolumnscheck(load_class);
                }

                var totalrecord = response?.totalrecord || 0;
                SearchTotalResults(totalrecord);

                if (type === 'onload') {
                    page = parseInt(page) + parseInt(loadmore_count);
                }
                if (type === 'click') {
                    page++;
                }

                pageCheck(page, total_page, click, loaded_posts, current_text);

                var list_audio = $("." + load_class + ' .post-inner-loop').find(".tp-audio-player-wrapper");
                if (list_audio.length) {
                    list_audio.each(function () {
                        var id = $(this).data("id");
                        var style = container.data('style');
                        loadinitAudio($('.' + id + ' .playlist li:first-child'), id, style);
                    });
                }

                if (type === 'click') {
                    if (URLpara == 'yes') {
                        let checkcount = click.getAttribute('loadmore-count');
                        let widgetkey = click.closest('.elementor-widget').getAttribute('data-id');
                        if (checkcount) {
                            loadCount = parseInt(parseInt(checkcount) + 1);
                            urlHandler(`loadmore_${widgetkey}`, loadCount);
                        } else {
                            urlHandler(`loadmore_${widgetkey}`, loadCount);
                        }
                        click.setAttribute('loadmore-count', loadCount);
                    }
                    click.textContent = current_textt;
                }
            },
            complete: function () {
                EqualHeightlayout();
                Resizelayout(layout, load_class);

                if ($("." + load_class + ' .post-filter-data').length) {
                    $("." + load_class + ' .post-filter-data .category-filters > li > a').each(function () {
                        var filter = $(this).data("filter");
                        if (filter != '' && filter != undefined && filter === '*') {
                            var totle_count = $("." + load_class + ' .post-inner-loop .grid-item').length;
                        } else if (filter != '' && filter != undefined) {
                            var totle_count = $("." + load_class + ' .post-inner-loop .grid-item' + filter).length;
                        }
                        if (totle_count) {
                            if (!current_listing.classList.contains('plus_ajax_filter')) {
                                $(this).find(".all_post_count").text(totle_count);
                            }
                        }
                    });
                }

                $('.elementor-widget-tp-row-background').each(function () {
                    var trig = $(this).html();
                    $(this).closest('.e-con').prepend(trig);

                    $(this).children('div').first().remove();
                });
            }
        }).then(function () {

        });
    } else {
        click.classList.add('hide');
    }
}

function getOffset(page, post_load_more, display_post, offset_posts) {
    return parseInt(page - 1) * parseInt(post_load_more) + parseInt(display_post) + parseInt(offset_posts);
}

function countTotalpages(response, display_post, offset_posts, post_load_more, click) {
    var total_post = response.totalrecord,
        new_offset = parseInt(display_post) + parseInt(offset_posts);
    total_post = parseInt(total_post) - parseInt(new_offset);

    if (total_post == 0) {
        var load_page = 1;
    } else {
        var load_page = 1;
        if (total_post != 0 && post_load_more != 0) {
            load_page = Math.ceil(total_post / post_load_more);
        }

        load_page = load_page + 1;

        if (load_page <= 0) {
            load_page = 1;
        }
    }

    click.setAttribute('data-total_page', load_page);
    click.setAttribute('data-page', 1);
}

function pageCheck(page, total_page, current_click, loaded_posts, current_text) {
    if (page == total_page) {
        current_click.classList.add('hide');
        current_click.setAttribute('data-page', page);
        var parentElement = current_click.closest('.ajax_load_more');
        var plDiv = document.createElement('div');
        plDiv.className = 'plus-all-posts-loaded';
        plDiv.textContent = loaded_posts;

        parentElement.appendChild(plDiv);
    } else {
        current_click.textContent = current_text;
        current_click.setAttribute('data-page', page);
    }
}

var urlHandler = function (key, val) {
    let url = new URL(window.location),
        params = new URLSearchParams(url.search);

    if (val) {
        params.set(key, val)
    }
    url.search = params.toString();
    window.history.pushState({}, '', url);
}

var EqualHeightlayout = function () {
    var Equalcontainer = jQuery('.elementor-element[data-tp-equal-height-loadded]');
    if (Equalcontainer.length > 0) {
        EqualHeightsLoadded();
    }
}

var Resizelayout = function (layout, load_class) {
    if (layout == 'grid' || layout == 'masonry') {
        var container = $("." + load_class + ' .post-inner-loop');
        container.isotope({
            itemSelector: '.grid-item',
        });

        if (!$("." + load_class).hasClass("list-grid-client")) {
            setTimeout(function () {
                $("." + load_class + ' .post-inner-loop').isotope('reloadItems').isotope();
            }, 500);
        }
    }

    if (layout == 'metro') {
        if ($("." + load_class + '.list-isotope-metro .post-inner-loop').length > 0) {
            var container = $("." + load_class),
                uid = container.data("id"),
                columns = container.attr('data-metro-columns'),
                metro_style = container.attr('data-metro-style');

            theplus_backend_packery_portfolio(uid, columns, metro_style);
        }
    }
}

var animatecolumnscheck = function (load_class) {
    if ($("." + load_class).parents(".animate-general").length) {
        var c, d;
        if ($("." + load_class).find(".animated-columns").length) {
            var p = $("." + load_class).parents(".animate-general");
            var delay_time = p.data("animate-delay");
            var animation_stagger = p.data("animate-stagger");
            var d = p.data("animate-type");
            var animate_offset = p.data("animate-offset");
            var duration_time = p.data("animate-duration");
            c = p.find('.animated-columns:not(.animation-done)');
            if (p.data("animate-columns") == "stagger") {
                c.css("opacity", "0");
                setTimeout(function () {
                    if (!c.hasClass("animation-done")) {
                        c.addClass("animation-done").velocity(d, { delay: delay_time, display: 'auto', duration: duration_time, stagger: animation_stagger });
                    }
                }, 500);
            } else if (p.data("animate-columns") == "columns") {
                c.css("opacity", "0");
                setTimeout(function () {
                    c.each(function () {
                        var bc = $(this);
                        bc.waypoint(function (direction) {
                            if (direction === 'down') {
                                if (!bc.hasClass("animation-done")) {
                                    bc.addClass("animation-done").velocity(d, { delay: delay_time, duration: duration_time, drag: true, display: 'auto' });
                                }
                            }
                        }, { offset: animate_offset });
                    });
                }, 500);
            }
        } else {
            var b = $("." + load_class).parents(".animate-general");
            var delay_time = b.data("animate-delay");
            d = b.data("animate-type"),
                animate_offset = b.data("animate-offset"),
                b.waypoint(function (direction) {
                    if (direction === 'down') {
                        if (!b.hasClass("animation-done")) {
                            b.addClass("animation-done").velocity(d, { delay: delay_time, display: 'auto' });
                        }
                    }
                }, { triggerOnce: true, offset: animate_offset });
        }
    }
}

var SearchTotalResults = function(TotalRecord=0){
            
    let Notfound = document.querySelectorAll('.grid-item:not(.theplus-posts-not-found)'),
        GetTR = document.querySelectorAll('.tp-total-results-txt');

    if ( Notfound.length == 0 ) {
        GetTR.forEach(function(self, index) {
            let One = self.previousElementSibling.textContent.replaceAll('{visible_product_no}', 0),
                Two = One.replaceAll('{total_product_no}', 0);
                self.innerHTML = Two;
        })
    } else {
        let GetAllGrid = document.querySelectorAll('.tp-searchlist .grid-item > :not(.theplus-posts-not-found)');
            GetTR.forEach(function(self, index) {
                let One = self.previousElementSibling.textContent.replaceAll('{visible_product_no}', GetAllGrid.length),
                    Two = One.replaceAll('{total_product_no}', TotalRecord);
                    self.innerHTML = Two;
            })
    }
}

var tp_Skeleton_filter = function (type, item) {
    if (item) {
        let skeleton = item.querySelectorAll('.tp-skeleton');
        if (skeleton.length > 0) {
            skeleton.forEach(function (self) {
                if (self.style.visibility == 'visible' && self.style.opacity == 1) {
                    if ("hidden" === type) {
                        self.style.cssText = "visibility: hidden; opacity: 0;";
                    }
                } else {
                    if ("visible" === type) {
                        self.style.cssText = "visibility: visible; opacity: 1;";
                    }
                }
            });
        }
    }
}