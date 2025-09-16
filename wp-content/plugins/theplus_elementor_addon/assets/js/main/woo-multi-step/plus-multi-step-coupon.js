function coupanSection(mainWrapper){
    let coupanWrapper = mainWrapper.querySelector('.tp-msc-coupon-wrapper');
    if(coupanWrapper.classList.contains('plus-active-step')){
        let showCoupancode = coupanWrapper.querySelector('.showcoupon');
        if (showCoupancode.hasAttribute('href')) {
            showCoupancode.removeAttribute('href');
        }
        showCoupancode.style.color = '#c36';
        showCoupancode.style.cursor = 'pointer';
        showCoupancode.addEventListener('click', function(e) {
            let checoutFormDisplay = coupanWrapper.querySelector('.checkout_coupon').style.display;
            if(checoutFormDisplay == 'block'){
                coupanWrapper.querySelector('.checkout_coupon').style.display = 'none';
            } else if(checoutFormDisplay == 'none'){
                coupanWrapper.querySelector('.checkout_coupon').style.display = 'block';
            }
        });
    }
}