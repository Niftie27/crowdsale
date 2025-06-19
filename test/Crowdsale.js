const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
}

const ether = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('Crowdsale', () => {
    let crowdsale, token
    let accounts, deployer, user1

    beforeEach(async () => {
        // Load Contracts
        const Crowdsale = await ethers.getContractFactory("Crowdsale")
        const Token = await ethers.getContractFactory("Token")

        //Deploy token
        token = await Token.deploy("Dapp University", "DAPP", "1000000")

        // Configure Accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user1 = accounts[1]

        // deploy Crowdsale
        crowdsale = await Crowdsale.deploy(token.address, ether(0.05), "1000000")

        // Send tokens to crowdsale
        let transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000))
        await transaction.wait()
    })

    describe('Deployment', () => {

        it('sends tokens to the Crowdsale contract', async () => {
            expect(await token.balanceOf(crowdsale.address)).to.eq(tokens(1000000))
        })

        it('returns the price', async () => {
            expect(await crowdsale.price()).to.eq(ether(0.05)) 
        })

        it('returns token address', async () => {
            expect(await crowdsale.token()).to.eq(token.address) 
        })
    })

    describe('buying Tokens', () => {
        let transaction, result
        let amount = tokens(10)

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await crowdsale.connect(user1).buyTokens(amount, { value: ether(0.5) })
                result = await transaction.wait()
            })

            it('transfers tokens', async () => {
                expect(await token.balanceOf(crowdsale.address)).to.eq(tokens(999990))
                expect(await token.balanceOf(user1.address)).to.eq(amount)
            })

            it('updates contract ether balance', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.eq(ether(0.5))
            })

            it('updates tokensSold', async () => {
                expect(await crowdsale.tokensSold()).to.eq(amount)
            })

            it('emits a buy event', async () => {
                // --> https://hardhat.org/hardhat-chai-matchers/docs/overview
                await expect(transaction).to.emit(crowdsale, 'Buy')
                    .withArgs(amount, user1.address)
            })
        })

        describe('Failure', () => {
            beforeEach(async () => {
                let transaction = await crowdsale.connect(user1).buyTokens(amount, { value: ether(0.5) })
                let result = await transaction.wait()
            })

            it('rejects insufficient ETH', async () => {
                await expect(crowdsale.connect(user1).buyTokens(tokens(10), { value: 0 })).to.be.reverted
            })

        })
    })

    describe('Sending ETH', () => {
        let transaction, result
        let ethSent = ether(10)
        let expectedTokens = tokens(200)  // 10 / 0.05 = 200 tokens

        describe('Success', () => {

            beforeEach(async () => {
                transaction = await user1.sendTransaction({ to: crowdsale.address, value: ethSent })
                result = await transaction.wait()
            })

            // it('transfers tokens', async () => {
            //     expect(await token.balanceOf(crowdsale.address)).to.eq(tokens(999990))
            //     expect(await token.balanceOf(user1.address)).to.eq(amount)
            // })

            it('updates contract ether balance', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.eq(ethSent)
            })

            it('updates user token balance', async () => {
                expect(await token.balanceOf(user1.address)).to.eq(expectedTokens)
            })

            // it('updates tokensSold', async () => {
            //     expect(await crowdsale.tokensSold()).to.eq(amount)
            // })

            // it('emits a buy event', async () => {
            //     // --> https://hardhat.org/hardhat-chai-matchers/docs/overview
            //     await expect(transaction).to.emit(crowdsale, 'Buy')
            //         .withArgs(amount, user1.address)
            // })
        })
    })

    describe('Updating price', async () => {
        let transaction, result
        let price = ether(2)

        describe('Success', () => {

            beforeEach(async () => {
                transaction = await crowdsale.connect(deployer).setPrice(ether(2))
                result = await transaction.wait()
            })

            it('updates theprice', async () => {
                expect(await crowdsale.price()).to.eq(ether(2))
            })
        })

        describe('Failure', () => {
            it('prevents non-owner from finalizing', async () => {
                await expect(crowdsale.connect(user1).setPrice(price)).to.be.reverted
            })
        })
    })

    describe('Finalizing Sale', () => {
        let transaction, result
        let amount = tokens(20)
        let value = ether(1)

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await crowdsale.connect(user1).buyTokens(amount, { value: value})
                result = await transaction.wait()

                transaction = await crowdsale.connect(deployer).finalize()
                result = await transaction.wait()
            })

            it('transfers remaining tokens to owner', async () => {
                expect(await token.balanceOf(crowdsale.address)).to.eq(0)
                expect(await token.balanceOf(deployer.address)).to.eq(tokens(999980))
            })

            it('transfers ETH balance to owner', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.eq(0)
            })

            it('emits Finalize event', async () => {
                await expect(transaction).to.emit(crowdsale, "Finalize")
                    .withArgs(amount, value)
            })

        })

        describe('Failure', () => {
            it('prevents non-owner from finalizing', async () => {
                await expect(crowdsale.connect(user1).finalize()).to.be.reverted
            })
        })
    })
})  