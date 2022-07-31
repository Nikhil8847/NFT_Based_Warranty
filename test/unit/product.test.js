const { assert, expect } = require("chai")
const { deployments, ethers, network, getNamedAccounts } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Testing Product itself", async function () {
          let deployer, productFactory
          let transactionResponse, transactionReceipt, productAddress
          const filePath = "./artifacts/contracts/Product/Product.json"
          const productABI = require(filePath)
          const chainId = network.config.chainId
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["productfactory"])
              productFactory = await ethers.getContract("ProductFactory")
              transactionResponse = await productFactory.addProduct("testing", "test", 10, "0x")
              transactionReceipt = await transactionResponse.wait(network.config.blockConfirmations)
              productAddress = transactionReceipt.events[0].args.productAddress
              //   productABI = fs.readFileSync(filePath, "utf8")
          })
          it("temp test", async () => {
              console.log(productABI)
          })
      })
