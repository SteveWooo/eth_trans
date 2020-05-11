const fs = require("fs");
const Config = {
    publicKey : '0xdbb8ccb1f8b158ecf2c478b8cc83e3b4f9ad090b', // 矿工的hash我就写死了
    privateKey : 'cecd0e79abcbb9040225d940915fafe7d712cbbdb6aea27f8434dc1ec660f44c',
    password : require(`${__dirname}/config/config.json`).password
}
const solc = require('solc');
const Tx = require('ethereumjs-tx');
var Shh = require('web3-shh');
var shh = new Shh(Shh.givenProvider);
let Web3 = require('web3');
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
let accounts = require(`${__dirname}/example/accounts`)

async function getPrivate(){
    let result = await web3.eth.accounts.decrypt(JSON.parse(fs.readFileSync(`${__dirname}/config/UTC--2020-05-10T06-35-48.099600300Z--dbb8ccb1f8b158ecf2c478b8cc83e3b4f9ad090b`).toString()), Config.password);
    Config.publicKey = result.address;
    Config.privateKey = web3.utils.toHex(result.privateKey);
    console.log('get PrivateKey successed!');
    web3.eth.personal.unlockAccount(Config.publicKey, Config.password);
    console.log('unlock account successed!');
    console.log(`balance: ${web3.utils.fromWei(await web3.eth.getBalance(Config.publicKey))} eth`);
    return ;
}

async function createPK(){
    let accounts = [];
    for(var i=0;i<10;i++) {
        let privateKey = require('crypto').randomBytes(32).toString('hex');
        let publicKey = web3.eth.accounts.privateKeyToAccount(privateKey.toString('hex'));

        accounts.push({
            publicKey : publicKey.address,
            privateKey : privateKey
        })
    }

    fs.writeFileSync(`${__dirname}/example/accounts.json`, JSON.stringify(accounts));
}

async function checkAllAccountBalance(){
    for(var i=0;i<accounts.length;i++) {
        await getBalance(accounts[i].publicKey);
    }
}

async function getBalance(address) {
    console.log(`${address} balance: ${web3.utils.fromWei(await web3.eth.getBalance(address))} eth`);
}

async function getTransaction(transAddr){
    let trans = await web3.eth.getTransaction(transAddr);
    console.log(trans)
}

async function callContract(){
    const contractData = require(`${__dirname}/example/colContract.json`);
    let contract = new web3.eth.Contract(JSON.parse(contractData.abi), contractData.hashTx.contractAddress);
    let result = await contract.methods.getCount().call()
    console.log(result);
}

async function deployERC20(){
    const solInput = fs.readFileSync(`${__dirname}/example/erc20.sol`, 'utf8').toString();
    const solOutput = solc.compile(solInput, 1);
    console.log(`compile successed!`);
    console.log(solOutput)
    var bytecode = solOutput.contracts[':ERC20'].bytecode;
    var abi = solOutput.contracts[':ERC20'].interface;
    var count = await web3.eth.getTransactionCount(Config.publicKey);
    var gasPrice = web3.eth.gasPrice;
    var gasLimit = 3000000;

    //要打包的交易信息
    var rawTx = {
        'from': Config.publicKey,
        'nonce': web3.utils.toHex(count),
        'gasPrice': web3.utils.toHex(gasPrice),
        'gasLimit': web3.utils.toHex(gasLimit),
        'value': '0x0',
        'data': '0x' + bytecode
    };

    var tx = new Tx(rawTx);
    tx.sign(Buffer.from(Config.privateKey.substring(2), 'hex'));
    var serializedTx = tx.serialize();

    var hashTx = await web3.eth.sendSignedTransaction('0x'+serializedTx.toString('hex'));
    /**
     * 存个合约地址方便后续调用
     */
    const contractFile = {
        hashTx : hashTx,
        abi : abi
    }

    fs.writeFileSync(`${__dirname}/example/erc20Contract.json`, JSON.stringify(contractFile));

    return ;
}

async function deployContract(){
    const solInput = fs.readFileSync(`${__dirname}/example/col.sol`, 'utf8').toString();
    const solOutput = solc.compile(solInput, 1);
    console.log(`compile successed!`);
    var bytecode = solOutput.contracts[':Calc'].bytecode;
    var abi = solOutput.contracts[':Calc'].interface;
    var count = await web3.eth.getTransactionCount(Config.publicKey);
    var gasPrice = web3.eth.gasPrice;
    var gasLimit = 3000000;
    //要打包的交易信息
    var rawTx = {
        'from': Config.publicKey,
        'nonce': web3.utils.toHex(count),
        'gasPrice': web3.utils.toHex(gasPrice),
        'gasLimit': web3.utils.toHex(gasLimit),
        'value': '0x0',
        'data': '0x' + bytecode
    };

    var tx = new Tx(rawTx);
    tx.sign(Buffer.from(Config.privateKey.substring(2), 'hex'));
    var serializedTx = tx.serialize();

    var hashTx = await web3.eth.sendSignedTransaction('0x'+serializedTx.toString('hex'));
    /**
     * 存个合约地址方便后续调用
     */
    const contractFile = {
        hashTx : hashTx,
        abi : abi
    }

    fs.writeFileSync(`${__dirname}/example/colContract.json`, JSON.stringify(contractFile));

    return ;
}

async function sendTrans(){
    const contractData = require(`${__dirname}/example/colContract.json`);
    // console.log(contractData);
    let contract = new web3.eth.Contract(JSON.parse(contractData.abi), contractData.hashTx.contractAddress);
    let result = contract.methods.add(99, 2).send({
        from : Config.publicKey
    }).on('transactionHash', function (hash) {
        console.log('hash:')
        console.log(hash)
    }).on('receipt', function (receipt) {
        console.log('receipt:')
        console.log(receipt)
    }).on('confirmation', function (confirmationNumber, receipt) {
        console.log('confirmationNumber:');
        console.log(confirmationNumber)
        console.log(receipt)
    }).on('error', console.error)
}

/**
 * 用密钥就能掉合约
 */
async function sendLotsTrans(){
    const contractData = require(`${__dirname}/example/colContract.json`);
    let contract = new web3.eth.Contract(JSON.parse(contractData.abi), contractData.hashTx.contractAddress);
    for(var i=0;i<1;i++) {
        // let privateKey = require('crypto').randomBytes(32);
        // let publicKey = web3.eth.accounts.privateKeyToAccount(privateKey.toString('hex'));
        // 调用合约
        let data = contract.methods.add(3, 5).encodeABI();
        var rawTx = {
            'from': accounts[1].publicKey,
            'to' : contractData.hashTx.contractAddress,
            'nonce': 0,
            'gasPrice': web3.eth.gasPrice,
            'gasLimit': web3.utils.toHex(3123400),
            'value': '0x0',
            'data': data
        };

        var tx = new Tx(rawTx);
        tx.sign(Buffer.from(accounts[1].privateKey, 'hex'));
        var serializedTx = tx.serialize();

        var hashTx = await web3.eth.sendSignedTransaction('0x'+serializedTx.toString('hex'));
        console.log(hashTx);
    }
}

/**
 * 转账测试
 */
async function transTest(){
    var rawTx = {
        'from': accounts[1].publicKey,
        'to' : accounts[0].publicKey,
        'nonce': 3,
        'gasPrice': web3.eth.gasPrice,
        'gasLimit': web3.utils.toHex(3123400),
        'value': '0x' + parseInt(web3.utils.toWei('1', 'ether')).toString(16),
        'data': ''
    };
    // hh
    var tx = new Tx(rawTx);
    tx.sign(Buffer.from(accounts[1].privateKey, 'hex'));
    var serializedTx = tx.serialize();

    var hashTx = await web3.eth.sendSignedTransaction('0x'+serializedTx.toString('hex'));
    console.log(hashTx)
    return ;
}

async function main(){
    // await getPrivate();
    // await createPK();

    // await deployERC20();
    // await deployContract();
    
    // await sendTrans();

    // await callContract();
    await sendLotsTrans();
    // await getTransaction('0xc500f35d0047ae73d04d3a5727951230327d014cddd333f35c4d2298c49c68fd');

    // await transTest();

    // await checkAllAccountBalance()
}
main()






