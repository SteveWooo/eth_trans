global.ETS = {
    
}

async function main(){
    let ea = await require(`${__dirname}/actions/initEthAction`)();
    let ets = {
        attack : await require(`${__dirname}/actions/initAttack`)(ea)
    }

    while(true) {
        await ets.attack.handle.attack();
    }

    await ets.ea.handle.checkAllBalance();
}
main();1