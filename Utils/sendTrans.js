const Tx = require('ethereumjs-tx');
/**
 * @param web3 实例化的web3
 * @param account 需要发送的账号
 * @param account.publicKey 账号公钥
 * @param account.privateKey 账号密钥
 * @param contractData 需要调用的合约的JSON数据，来自本地。需要有abi喝hashTx
 */
module.exports = async function(param){
    let loop = param.loop || 1;
    const contractData = param.contractData;
    let contract = new param.web3.eth.Contract(JSON.parse(contractData.abi), contractData.hashTx.contractAddress);
    let results = [];
    for(var i=0;i<loop;i++) {
        // 调用合约
        let data = contract.methods.add(3, 5).encodeABI();
        var rawTx = {
            'from': param.account.publicKey,
            'to' : contractData.hashTx.contractAddress,
            'nonce': await param.web3.eth.getTransactionCount(param.account.publicKey),
            'gasPrice': await param.web3.eth.getGasPrice(),
            // 'gasPrice': param.web3.utils.toHex(0),
            'gasLimit': param.web3.utils.toHex(3123400),
            'value': '0x0',
            'data': data
        };

        var tx = new Tx(rawTx);
        tx.sign(Buffer.from(param.account.privateKey, 'hex'));
        var serializedTx = tx.serialize();

        try{
            var hashTx = await param.web3.eth.sendSignedTransaction('0x'+serializedTx.toString('hex'));
        }catch(e) {
            console.log(e)
        }
        results.push(hashTx);
    };

    return {
        results : results,
        account : param.account
    };
}