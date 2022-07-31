// const { ethers, network } = require("hardhat")
const fs = require("fs")
const frontEndContractsFile = "../nft_based_warranty_front_end/constants/networkMapping.json"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("updating front end...")
        await updateContractAddress()
    }
}

async function updateContractAddress() {
    const productFactory = await ethers.getContract("ProductFactory")
    const chainId = (await network.config.chainId).toString()
    const contractAddress = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf-8"))
    if (chainId in contractAddress) {
        if (!contractAddress[chainId]["ProductFactory"].includes(productFactory.address)) {
            contractAddress[chainId]["ProductFactory"].push(productFactory.address)
        }
    } else {
        contractAddress[chainId] = { ProductFactory: [productFactory.address] }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddress))
}

module.exports.tags = ["all", "frontend"]
