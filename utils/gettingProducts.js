const pinataSDk = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()
const { Contract } = require("ethers")
const { deployments, getNamedAccounts, ethers } = require("hardhat")
const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecretKey = process.env.PINATA_API_SECRET_KEY
const pinata = pinataSDk(pinataApiKey, pinataApiSecretKey)

async function getProducts() {
    const { deploy, log } = deployments
    const deployer = (await getNamedAccounts()).deployer
    let args = []
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
    const productFactory = await ethers.getContract("ProductFactory")
    let transactionResponse = await productFactory.addProduct("testing", "test", 10, 1, "0x")
    let transactionReceipt = await transactionResponse.wait(1)
    console.log(transactionReceipt)
    let productAddress = await transactionReceipt.events[0].args.productAddress
    let numberOfProducts = await productFactory.getNumberOfProducts()
    console.log(productAddress)
    let product = await productFactory.getProductAtIndex(parseInt(numberOfProducts.toString()) - 1)
    console.log(product)
    // const temp = "ipfs://" + responses[0]["IpfsHash"]
    // console.log(files)
    // return { responses, files }
}

getProducts()
