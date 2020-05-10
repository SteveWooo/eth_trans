const fs = require("fs");
const Config = {
    publicKey : '',
    privateKey : '',
    password : require(`${__dirname}/config/config.json`).password
}
const solc = require('solc');
const Tx = require('ethereumjs-tx');
var Shh = require('web3-shh');
var shh = new Shh(Shh.givenProvider);
let Web3 = require('web3');
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

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
        'data': '0x'+bytecode
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

    fs.writeFileSync(`${__dirname}/example/contract.json`, JSON.stringify(contractFile));

    return ;
}

async function sendTrans(){
    const contractData = require(`${__dirname}/example/contract.json`);
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

async function callContract(){
    const contractData = require(`${__dirname}/example/contract.json`);
    let contract = new web3.eth.Contract(JSON.parse(contractData.abi), contractData.hashTx.contractAddress);
    let result = await contract.methods.getCount().call({
        from : Config.publicKey
    })
    console.log(result);
}

async function sendLotsTrans(){
    for(var i=0;i<1;i++) {
        let privateKey = require('crypto').randomBytes(32);
        let publicKey = web3.eth.accounts.privateKeyToAccount(privateKey.toString('hex'))
        console.log(privateKey.toString('hex'))
        console.log(publicKey)

        return ;

        var rawTx = {
            'from': Config.publicKey,
            'nonce': 0,
            'gasPrice': web3.utils.toHex(gasPrice),
            'gasLimit': web3.utils.toHex(gasLimit),
            'value': '0x0',
            'data': '0x'+bytecode
        };

    }
}

async function main(){
    // await getPrivate();
    // await deployContract();
    // await sendTrans();
    // await callContract();

    await sendLotsTrans();
}
main()






