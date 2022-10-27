const { assert } = require('chai')
const { deployments, ethers, network } = require('hardhat')
const { developmentChains } = require('../helper-hardhat-config')

!developmentChains.includes(network.name)
    ? describe.skip
    : (describe('RandomIpfsNFT unit test', async function () {
        let deployer, randomIpfsNft

        beforeEach(async function () {
            accounts = await ethers.getSigners()
            deployer = accounts[0]            //  await deployments.fixture(['all'])
            await deployments.fixture(["mocks", "randomipfs"])
            randomIpfsNft = await ethers.getContract('RandomIpfsNft', deployer)
            vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock', deployer)
        })

        describe("constructor", () => {
            it("sets starting values correctly", async function () {
                const dogTokenUriZero = await randomIpfsNft.getDogTokenUris(0)
                assert(dogTokenUriZero.includes("ipfs://"))
            })
        })

        describe("fulfillRandomWords", () => {
            it("mints NFT after random number is returned", async function () {
                await new Promise(async (resolve, reject) => {
                    randomIpfsNft.once("NftMinted", async () => {
                        try {
                            const tokenUri = await randomIpfsNft.tokenURI("0")
                            const tokenCounter = await randomIpfsNft.getTokenCounter()
                            assert.equal(tokenUri.toString().includes("ipfs://"), true)
                            assert.equal(tokenCounter.toString(), "1")
                            resolve()
                        } catch (e) {
                            console.log(e)
                            reject(e)
                        }
                    })
                    try {
                        const fee = await randomIpfsNft.getMintFee()
                        const requestNftResponse = await randomIpfsNft.requestNft({
                            value: fee.toString(),
                        })
                        const requestNftReceipt = await requestNftResponse.wait(1)
                        await vrfCoordinatorV2Mock.fulfillRandomWords(
                            requestNftReceipt.events[1].args.requestId,
                            randomIpfsNft.address
                        )
                    } catch (e) {
                        console.log(e)
                        reject(e)
                    }
                })
            })
        })
    }))