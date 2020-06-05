/**
 * 初始化web3，返回一个整体对象，里面啥都有
 */
const fs = require("fs");
let Web3 = require('web3');

let accounts = require(`${__dirname}/../example/accounts`);
let attackers = require(`${__dirname}/../example/attackers`);
const Config = {
    publicKey : '0xdbb8ccb1f8b158ecf2c478b8cc83e3b4f9ad090b', // 矿工的hash我就写死了
    privateKey : 'cecd0e79abcbb9040225d940915fafe7d712cbbdb6aea27f8434dc1ec660f44c',
    accounts : accounts,
    attackers : attackers
}
const solc = require('solc');
const Tx = require('ethereumjs-tx');
var Shh = require('web3-shh');
var shh = new Shh(Shh.givenProvider);
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

/**
 * 拿账号里面所有的用户信息出来
 */
async function logBalance(address) {
    console.log(`${address} balance: ${web3.utils.fromWei(await web3.eth.getBalance(address))} eth`);
}
async function checkAllBalance(){
    console.log('miner:')
    await logBalance(Config.publicKey);
    console.log('normal accounts:');
    for(var i=0;i<accounts.length;i++) {
        await logBalance(accounts[i].publicKey);
    }
    console.log('attackers:');
    for(var i=0;i<attackers.length;i++) {
        await logBalance(attackers[i].publicKey);
    }
}

async function sendTrans(from, to, total, nonceIncrease=0) {
    var rawTx = {
        'from': from.publicKey,
        'to' : to.publicKey,
        'nonce': await web3.eth.getTransactionCount(from.publicKey) + nonceIncrease,
        // 'gasPrice': await web3.eth.getGasPrice(),
        'gasPrice': web3.utils.toHex(21000),
        'gasLimit': web3.utils.toHex(30000),
        'value': '0x' + parseInt(web3.utils.toWei(total+'', 'ether')).toString(16), // 转账金额
        'data': ''
    };

    var tx = new Tx(rawTx);
    tx.sign(Buffer.from(from.privateKey, 'hex'));
    var serializedTx = tx.serialize();
    var hashTx = web3.eth.sendSignedTransaction('0x'+serializedTx.toString('hex'));
    return hashTx;
}

async function init(){
    let obj = {
        Config : Config,
        web3 : web3
    }

    let handle = {
        checkAllBalance : checkAllBalance,

        sendTrans : sendTrans
    }

    obj.handle = handle;

    return obj;
}

module.exports = init;