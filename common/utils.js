let multiple = 1.5;

exports.getCurBestDays = function getCurBestDays(arr){
    arr = arr.sort((a,b)=>{
        return a.date - b.date
    });
    let len = 0;
    let curDate = new Date().getTime();
    if(arr.length == 0){
        return 0;
    }else if(arr.length == 1){
        let a = arr[arr.length-1].date;
        return (curDate - a) < 1000*60*60*24 * multiple ? 1 : 0;
    }else{
        let a = arr[arr.length-1].date;
        if((curDate - a) > 1000*60*60*24 * multiple){
            return 0
        }
        len ++;
        for(let i = arr.length-1; i > 0; i--){
            let start = arr[i].date;
            let end = arr[i-1].date;
            if((start - end) < 1000*60*60*24  * multiple){
                len++
            }else{
                break;
            }
        }
    }
    return len
}

exports.getBestDays = function getBestDays(arr){
    let len = 0;
    let begin = 0, end = 1;
    if(arr.length == 0){
        return 0;
    }else  if(arr.length == 1){
        len = 1;
    }else{
        while(end < arr.length){
            let a = arr[end-1].date;
            let b = arr[end].date;
            if((b-a) < 1000*60*60*24*multiple){
                end - begin > len ? len = end - begin : null;
                end++
            }else{
                begin = end;
                end = begin + 1
            }
        }
        len += 1;
    }
    return len
}