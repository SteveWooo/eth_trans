global.ETS = {
    
}

async function main(){
    let ea = await require(`${__dirname}/actions/initEthAction`)();
    let ets = {
        buss : await require(`${__dirname}/actions/initBussAction`)(ea)
    }

    while(true) {
        await ets.buss.handle.sendLotsTrans();
    }

    await ets.ea.handle.checkAllBalance();
}
main();