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

    // ✅ Added: Get current timestamp
    const now = Math.floor(Date.now() / 1000) // ✅

    // ✅ Added: Set opening/closing times
    const openingTime = now               // ✅ Starts with deployment
    const closingTime = now + 7 * 24 * 60 * 60 // ✅ Ends in 7 days

    // Deploy Crowdsale
    // ✅ Fixed: Pass 5 constructor arguments to match updated Crowdsale.sol
    const Crowdsale = await hre.ethers.getContractFactory('Crowdsale')
    let crowdsale = await Crowdsale.deploy(token.address, PRICE, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'), openingTime, closingTime)
    await crowdsale.deployed()

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