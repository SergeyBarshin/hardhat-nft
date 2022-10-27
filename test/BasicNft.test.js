const { assert, expect } = require('chai')
const { deployments, ethers, network } = require('hardhat')
const { developmentChains } = require('../helper-hardhat-config')

!developmentChains.includes(network.name)
    ? describe.skip
    : (describe('BasicNft unit test', async function () {
        let deployer, basicNft

        beforeEach(async function () {
            accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(['all'])
            basicNft = await ethers.getContract('BasicNft', deployer)

        })

        it('Allows to mint, and updates', async () => {
            const txResponse = await basicNft.mintNft()
            await txResponse.wait(1)

            const tokenURI = await basicNft.tokenURI(0)
            const tokenCounter = await basicNft.getTokenCounter()

            assert.equal(tokenCounter.toString(), "1")
            assert.equal(tokenURI, await basicNft.TOKEN_URI())
        })
    }))