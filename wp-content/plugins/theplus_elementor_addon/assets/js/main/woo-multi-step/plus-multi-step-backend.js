function multistepBackEnd(container, mscbackendprevl, lgnswitch, copnswitch){
    let count = 0;
    let liNumber;
    if(lgnswitch == 'yes'){
        if(mscbackendprevl ==='mscplogin'){ liNumber = 1;}
        if(mscbackendprevl==='mscpcoupon'){ liNumber = 2; }
        if(mscbackendprevl ==='mscpbilling'){ liNumber = 3;}
        if(mscbackendprevl ==='mscppayment'){ liNumber = 4;}
    }else if(lgnswitch == 'no' && copnswitch == 'no'){
        if(mscbackendprevl==='mscpcoupon'){ liNumber = 1; }
        if(mscbackendprevl ==='mscpbilling'){ liNumber = 2;}
        if(mscbackendprevl ==='mscppayment'){ liNumber = 3;}
    }else if(lgnswitch == 'no' && copnswitch == 'yes'){
        if(mscbackendprevl ==='mscpbilling'){ liNumber = 1;}
        if(mscbackendprevl ==='mscppayment'){ liNumber = 2;}
    }

    let listItems = container[0].querySelector(".tp-multi-step-nav-steps").querySelectorAll('li');
    for(let i=0;i<listItems.length;i++) {  
        listItems[i].classList.add('tp-msc-step-done');
        listItems[i].classList.remove('tp-msc-step-active');    
        count++;
        
        if(count == liNumber) {
            listItems[i].classList.remove('tp-msc-step-done');
            listItems[i].classList.add('tp-msc-step-active');
            break;
        }
    }
}