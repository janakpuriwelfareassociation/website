/** Plus Load-More*/
$ = jQuery;
$( document ).ready(function() {
    if($('body').find('.post-lazy-load').length>=1){
        
        var windowWidth, windowHeight, documentHeight, scrollTop, containerHeight, containerOffset, $window = $(window);
        
        var recalcValues = function() {
            windowWidth = $window.width();
            windowHeight = $window.height();
            documentHeight = $('body').height();
            containerHeight = $('.list-isotope,.list-isotope-metro').height();
            containerOffset = $('.list-isotope,.list-isotope-metro').offset().top+50;
            setTimeout(function(){
                containerHeight = $('.list-isotope,.list-isotope-metro').height();
                containerOffset = $('.list-isotope,.list-isotope-metro').offset().top+50;
            }, 50);
        };
        
        recalcValues();
        $window.resize(recalcValues);
        
        $window.bind('scroll', function(e) {
            
            e.preventDefault();
            recalcValues();
            scrollTop = $window.scrollTop();
            $('.list-isotope,.list-isotope-metro').each(function() {
                containerHeight = $(this).height();
                containerOffset = $(this).offset().top+50;
                if($(this).find(".post-lazy-load").length && scrollTop < documentHeight && scrollTop > (containerHeight + containerOffset - windowHeight)){
                
                    var current_click= $(this).find(".post-lazy-load");
                    var a= $(this).find(".post-lazy-load");
                        
                    var page = a.attr('data-page');
                    var total_page=a.data('total_page');
                    var load_class= a.data('load-class');
                    var layout=a.data('layout');
                    var loadattr=a.data('loadattr');
                    var offset_posts=a.data('offset-posts');
                    
                    var display_post=a.data('display_post');
                    var post_load_more=a.data('post_load_more');
                    
                    var current_text= a.html();
                    var loaded_posts= a.data("loaded_posts");
                    var tp_loading_text= a.data("tp_loading_text");
                    
                    if ( current_click.data('requestRunning') ) {
                        return;
                    }

                    if(offset_posts==undefined || offset_posts==""){
                        offset_posts=0;
                    }

                    if(total_page > page){
                        current_click.data('requestRunning', true);
                        var offset=(parseInt(page-1)*parseInt(post_load_more))+parseInt(display_post)+parseInt(offset_posts);							
                        $.ajax({
                            type:'POST',
                            data:'action=theplus_more_post&offset='+offset+'&paged='+page+'&loadattr='+loadattr,
                            url:theplus_ajax_url,
                            beforeSend: function() {
                                $(current_click).text(tp_loading_text);
                            },
                            success: function(response) { 

                                let current_listing = current_click[0].closest(`.${load_class}`);

                                var tp_row = current_listing.querySelector('.tp-row.post-inner-loop');                                
                                
                                setTimeout(function () {
                                    tp_Skeleton_filter("hidden", tp_row);
                                }, 1000);

                                var totalrecord = response?.totalrecord || 0;
                                var data = response.HtmlData;
                                if(data==''){
                                    $(current_click).addClass("hide");										
                                }else{
                                    $("."+load_class+' .post-inner-loop').append( data );
                                    
                                    Resizelayout(layout, load_class);
                                    
                                    if($("."+load_class).parents(".animate-general").length){
                                        var c,d;
                                        if($("."+load_class).find(".animated-columns").length){
                                            var p = $("."+load_class).parents(".animate-general");
                                            var delay_time=p.data("animate-delay");
                                            var animation_stagger=p.data("animate-stagger");
                                            var d = p.data("animate-type");
                                            var animate_offset = p.data("animate-offset");
                                            var duration_time=p.data("animate-duration");
                                                c = p.find('.animated-columns:not(.animation-done)');
                                                if(p.data("animate-columns")=="stagger"){
                                                    c.css("opacity","0");
                                                    setTimeout(function(){
                                                        if(!c.hasClass("animation-done")){
                                                            c.addClass("animation-done").velocity(d,{ delay: delay_time,display:'auto',duration: duration_time,stagger: animation_stagger});
                                                        }
                                                    }, 500);
                                                }else if(p.data("animate-columns")=="columns"){
                                                    c.css("opacity","0");
                                                    setTimeout(function(){	
                                                    c.each(function() {
                                                        var bc=$(this);
                                                        bc.waypoint(function(direction) {
                                                            if( direction === 'down'){
                                                                if(!bc.hasClass("animation-done")){
                                                                    bc.addClass("animation-done").velocity(d,{ delay: delay_time,duration: duration_time,drag:true,display:'auto'});
                                                                }
                                                            }
                                                        }, {offset: animate_offset } );
                                                    });
                                                    }, 500);
                                                }
                                            }else{
                                            var b = $("."+load_class).parents(".animate-general");
                                            var delay_time=b.data("animate-delay");
                                            d = b.data("animate-type"),
                                            animate_offset = b.data("animate-offset"),
                                            b.waypoint(function(direction ) {
                                                if( direction === 'down'){
                                                    if(!b.hasClass("animation-done")){
                                                        b.addClass("animation-done").velocity(d, {delay: delay_time,display:'auto'});
                                                    }
                                                }
                                            }, {triggerOnce: true,  offset: animate_offset } );
                                        }
                                    }
                                }

                                SearchTotalResults(totalrecord);

                                page++;
                                if(page==total_page){
                                    $(current_click).addClass("hide");
                                    $(current_click).attr('data-page', page);
                                    $(current_click).parent(".ajax_lazy_load").append('<div class="plus-all-posts-loaded">'+loaded_posts+'</div>');
                                }else{
                                    $(current_click).html(current_text);
                                    $(current_click).attr('data-page', page);	
                                }
                                
                                var list_audio = $("."+load_class+' .post-inner-loop').find(".tp-audio-player-wrapper");
                                if(list_audio.length){
                                    list_audio.each(function(){
                                        var id = $(this).data("id");
                                        var style = container.data('style');
                                        loadinitAudio($('.'+id+' .playlist li:first-child'),id,style);
                                    });
                                }
                                
                            },
                            complete: function() {
                                EqualHeightlayout();
                                Resizelayout(layout, load_class);

                                if($("."+load_class+' .post-filter-data').length){
                                    $("."+load_class+' .post-filter-data .category-filters > li > a').each(function(){
                                        var filter = $(this).data("filter");
                                        if(filter!='' && filter!=undefined && filter==='*'){
                                            var totle_count = $("."+load_class+' .post-inner-loop .grid-item').length;
                                        }else if(filter!='' && filter!=undefined){
                                            var totle_count = $("."+load_class+' .post-inner-loop .grid-item'+filter).length;
                                        }
                                        if(totle_count){
                                            $(this).find(".all_post_count").text(totle_count);
                                        }
                                    });
                                }

                                $('.elementor-widget-tp-row-background').each(function () {
                                    var trig = $(this).html();
                                    $(this).closest('.e-con').prepend(trig);

                                    $(this).children('div').first().remove();
                                });

                                if ($("."+load_class+'.list-isotope-metro .post-inner-loop').length > 0) {
                                    var container=$("."+load_class);
                                    var uid=container.data("id");
                                    var columns=container.attr('data-metro-columns');
                                    var metro_style=container.attr('data-metro-style');
                                    theplus_backend_packery_portfolio(uid,columns,metro_style);
                                    $("."+load_class+'.list-isotope-metro .post-inner-loop').isotope('layout').isotope( 'reloadItems' );
                                }

                                current_click.data('requestRunning', false);
                            }
                            }).then(function(){
                                if ($("."+load_class+'.list-isotope-metro .post-inner-loop').length > 0) {
                                    var container=$("."+load_class);
                                    var uid=container.data("id");
                                    var columns=container.attr('data-metro-columns');
                                    var metro_style=container.attr('data-metro-style');
                                    theplus_backend_packery_portfolio(uid,columns,metro_style);
                                    $("."+load_class+'.list-isotope-metro .post-inner-loop').isotope('layout').isotope( 'reloadItems' );
                                }
                        });
                    }else{
                        $(current_click).addClass("hide");
                    }					
                }
            });
        });
    }
});

var EqualHeightlayout = function() {
    var Equalcontainer = jQuery('.elementor-element[data-tp-equal-height-loadded]');
    if( Equalcontainer.length > 0 ){
        EqualHeightsLoadded();
    }
}

var Resizelayout = function(layout, load_class) {
    if( layout == 'grid' || layout == 'masonry' ){
        var container = $("."+load_class+' .post-inner-loop');
            container.isotope({
                itemSelector: '.grid-item',
            });

        if( !$("."+load_class).hasClass("list-grid-client") ){
            setTimeout(function(){	
                $("."+load_class+' .post-inner-loop').isotope( 'reloadItems' ).isotope();
            }, 500);
        }
    }

    if( layout == 'metro' ){
        if ( $("."+load_class+'.list-isotope-metro .post-inner-loop').length > 0) {
            var container = $("."+load_class),
                uid = container.data("id"),
                columns = container.attr('data-metro-columns'),
                metro_style = container.attr('data-metro-style');

                theplus_backend_packery_portfolio(uid,columns, metro_style);
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