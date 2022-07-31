const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("-----------------------------------------------------------")
    let args = []
    let productFactory
    try {
        await deploy("ProductFactory", {
            from: deployer,
            log: true,
            args: args,
            waitConfirmations: network.config.blockConfirmations || 1,
        })
        // productFactory = await ethers.getContract("ProductFactory")
    } catch (error) {
        log(error)
    }
    // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //     log("Verifying...")
    //     await verify(nft.address, args)
    // }
}

async function handleTokenUris() {}

module.exports.tags = ["all", "productfactory"]
