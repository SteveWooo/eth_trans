global.ETS = {
    
}

let genKeys = function(ets){
    let privateKey = require('crypto').randomBytes(32).toString('hex');
    let publicKey = ets.attack.ea.web3.eth.accounts.privateKeyToAccount(privateKey.toString('hex'));
    console.log(`publicKey : ${publicKey.address}`);
    console.log(`privateKey : ${privateKey}`);
}

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
    let ets = {
        ea: ea,
        attack : await require(`${__dirname}/actions/initAttack`)(ea)
    }
    // await ets.ea.handle.checkAllBalance();
    // trans money to attacker
    // genKeys(ets);
    // await ets.ea.handle.sendTrans(ets.ea.Config, ets.ea.Config.attackers[0], 100);
    // return ;

    await ets.attack.handle.attack();
    // console.log(await ea.web3.eth.txpool.content())
    
}
main();