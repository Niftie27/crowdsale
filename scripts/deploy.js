const { ethers } = require("hardhat");

async function main() {
    // Deployment/Migration goes here...

    const NAME = 'Dapp University'
    const SYMBOL = 'DAPP'
    const MAX_SUPPLY = '1000000'
    const PRICE = ethers.utils.parseUnits('0.05', 'ether')

    // Deploy Token
    const Token = await hre.ethers.getContractFactory('Token')
    let token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY)

    await token.deployed()
    console.log(`Token deployed to: ${token.address}\n`)

    // Deploy Token
    const Crowdsale = await hre.ethers.getContractFactory('Crowdsale')
    let crowdsale = await Token.deploy(token.address, PRICE, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'))
    await token.deployed()

    console.log(`Crowdsale deployed to: ${crowdsale.address}\n`)

    // Send tokens to crowdsale
    const transaction = await token.transfer(crowdsale.address, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'))
    await transaction.wait()

    console.log(`Tokens transferred to Crowdsale\n`)
}



main()
    .then(() => process.exit(0))
    // The `then` method is used to handle the promise returned by the `main` function.
    // The `process.exit(0)` method is used to exit the process with a success code.
    // The `catch` method is used to handle any errors that occur during the execution of the `main` function.
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// The `catch` method is used to handle any errors that occur during the execution of the `main` function.
// The `process.exit(1)` method is used to exit the process with an error code.