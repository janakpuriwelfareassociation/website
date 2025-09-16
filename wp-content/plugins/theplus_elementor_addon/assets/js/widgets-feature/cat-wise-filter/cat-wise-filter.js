
/** Cat Wise Filter using AJAX*/
var ajax_wishfilter = new Map();

function click_category_list($this) {

    var current_widget = $this.closest('.plus_ajax_filter'),
        get_attr = current_widget.querySelectorAll('.post-inner-loop'),
        get_wooattr = get_attr[0].dataset.wooattr ? get_attr[0].dataset.wooattr : '',
        dataFilter = $this.dataset.filter ? $this.dataset.filter : '';

    // showSpinner();

    tp_Skeleton_filter("visible", current_widget);

    // setTimeout(() => {
    //     hideSpinner();
    // }, 5000);

    var category = dataFilter.replace(/^\./, '');

    var category_filters = $this.closest('.category-filters');
        activeFilter = category_filters.querySelector(".filter-category-list-ajax.active");

    if (activeFilter) {
        activeFilter.classList.remove("active")
    }
    $this.classList.add("active");

    tp_wise_filter(current_widget, get_wooattr, category, 'click');
}

var tp_wise_filter = function (current_widget, get_wooattr, category, type) {

    var AjaxData = {
        action: 'tp_wise_filter',
        security: theplus_nonce,
        'option': get_wooattr,
        'load_type': type,
    };

    if (type === 'click') {
        AjaxData.filter_id = category;
    } else if (type === 'onload') {
        AjaxData.filter_ids = category;
    }

    jQuery.ajax({
        url: theplus_ajax_url,
        dataType: 'json',
        type: "POST",
        data: AjaxData,
        beforeSend: function (jqXHR) {
            if (type === 'click') {
                if (ajax_wishfilter != null && ajax_wishfilter.size != 0 && ajax_wishfilter.size != 'undefined' && typeof ajax_wishfilter.abort !== "undefined") {
                    ajax_wishfilter.abort();
                }

                ajax_wishfilter = jqXHR;
            }
        },
        success: function (response) {
            var get_row = current_widget.querySelectorAll('.post-inner-loop');
            get_row[0].innerHTML = response.HtmlData;

            tp_resizelayout(get_row, response, current_widget);

            setTimeout(function () {
                tp_Skeleton_filter("hidden", current_widget);
            }, 1000);

            if (response.url_name) {
                var key = Object.keys(response.url_name)[0],
                    value = response.url_name[key];

                if ('*' === value) {
                    urlHandler(key, '');
                } else {
                    urlHandler(key, value);
                }
            }

            if (type === 'onload') {
                if (response.filter_id) {
                    var activecheck = current_widget.querySelector('.post-filter-data ul li .active');
                    if(activecheck){
                        activecheck.classList.remove("active")
                    }
                    current_widget.querySelector(`.post-filter-data ul li a[data-filter=".${response.filter_id}"]`).classList.add("active");
                }
            } else if (type === 'click') {
                if (response.url_name && response.widget_id) {
                    urlHandler(`loadmore_${response.widget_id}`, '0');
                }
            }

            var isloadmore = current_widget.querySelectorAll('.ajax_load_more .post-load-more');
            if (isloadmore.length > 0) {

                var click = isloadmore[0],
                    page = click.dataset.page,
                    total_page = click.dataset.total_page,
                    display_post = click.dataset.display_post,
                    offset_posts = click?.dataset?.offsetPosts ? click.dataset.offsetPosts : 0,
                    post_load_more = click.dataset.post_load_more,
                    current_text = click.innerText,
                    loaded_posts = click.dataset.loaded_posts;

                if (type === 'onload') {
                    let loadkey = `loadmore_${response.widget_id}`;
                    click.setAttribute('loadmore-count', category[loadkey]);
                }
                if (type === 'click') {
                    click.setAttribute('loadmore-count', 0);
                }

                countTotalpages(response, display_post, offset_posts, post_load_more, click);

                loadmore_count = click.getAttribute('loadmore-count') ? click.getAttribute('loadmore-count') : '';
                page = parseInt(click.dataset.page) + parseInt(loadmore_count);

                total_page = click.dataset.total_page;
                if (type === 'click') {
                    let doneDiv = click.closest('.ajax_load_more').querySelectorAll('.plus-all-posts-loaded');
                    if (doneDiv) {
                        doneDiv.forEach(function (self) {
                            self.remove();
                        });
                    }
                }

                pageCheck(page, total_page, click, loaded_posts, current_text);
                if (type == 'click' && page != total_page) {
                    if (click.classList.contains('hide')) {
                        click.classList.remove('hide');
                        click.textContent = current_text;
                    }
                }
            }
        },
        complete: function (res) {
        },
        error: function (xhr, status, error) {
        }
    });
}

var tp_Skeleton_filter = function (type, item) {
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

var tp_resizelayout = function (html, option, item) {
    var delayload = 500;

    if ('grid' === option.layout || 'masonry' === option.layout) {
        setTimeout(function () {
            jQuery(html).isotope('reloadItems').isotope();
        }, delayload);
    } else if ('metro' === option.layout) {
        if (item.classList.contains('list-isotope-metro')) {
            setTimeout(function () {
                theplus_setup_packery_portfolio();
                jQuery(html).isotope('reloadItems').isotope();
            }, delayload);
        }
    }

    EqualHeightlayout();
}

var EqualHeightlayout = function () {
    var Equalcontainer = jQuery('.elementor-element[data-tp-equal-height-loadded]');
    if (Equalcontainer.length > 0) {
        EqualHeightsLoadded();
    }
}

var urlHandler = function (key, val) {

    let url = new URL(window.location),
        params = new URLSearchParams(url.search);

    if (val) {
        params.set(key, val)
    } else {
        params.delete(key)
    }

    url.search = params.toString();
    window.history.pushState({}, '', url);
}

function wish_filter_onload_call($scope) {
    let url = new URL(window.location.href);
    if (url && url.search) {
        let params = new URLSearchParams(url.search);
        var filteredParams = {},
            filteredkeys = {};

        params.forEach((value, key) => {
            if (key.startsWith('wish_filter_')) {
                let widget_key = key.replace('wish_filter_', '');

                filteredParams[key] = value;
                filteredkeys[widget_key] = widget_key;
            }

            if (key.startsWith('loadmore')) {
                let widget_key = key.replace('loadmore_', '');

                filteredParams[key] = value;
                filteredkeys[widget_key] = widget_key;
            }
        });

        if (Object.keys(filteredParams).length > 0) {
            filteredkeys = Object.values(filteredkeys);

            var get_list = $scope[0].querySelectorAll('.filter-category-list-ajax');
            if (get_list.length > 0) {
                var current_widget = get_list[0].closest('.plus_ajax_filter'),
                    get_attr = current_widget.querySelectorAll('.post-inner-loop'),
                    get_wooattr = get_attr[0].dataset.wooattr ? get_attr[0].dataset.wooattr : '';

                var check_widget = false;
                filteredkeys.forEach(self => {
                    if (current_widget.closest(`.elementor-element-${self}`)) {
                        check_widget = true;
                    }
                });

                if (check_widget) {
                    tp_Skeleton_filter("visible", current_widget);
                    tp_wise_filter(current_widget, get_wooattr, filteredParams, 'onload');
                }

            }
        }

    }
}

function showSpinner() {
    var spinner = document.querySelector('.spinner');
    var tpRow = document.querySelector('.tp-row');

    tpRow.style.opacity = '0';
    spinner.classList.add('active');

}

function hideSpinner() {
    var spinner = document.querySelector('.spinner');
    var tpRow = document.querySelector('.tp-row');
    spinner.classList.remove('active');

    setTimeout(() => {
        tpRow.style.opacity = '1';
    }, 500);
}