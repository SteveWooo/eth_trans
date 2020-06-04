async function init(ea){
    let obj = {
        ea : ea,
    }

    async function attack(){
        // let begin = +new Date();
        // let promiss = [];
        // for(var i=0;i<10;i++) {
        //     let result = ea.handle.sendTrans(ea.Config, ea.Config.accounts[i], 0.1, i);
        //     promiss.push(result);
        // }
        // let result = await Promise.all(promiss);
        // let now = +new Date();
        // console.log(`time cost: ${now - begin} ms`);
        return ;
    }

    let handle = {
        attack : attack
    }

    obj.handle = handle;

    return obj;
}

module.exports = init;