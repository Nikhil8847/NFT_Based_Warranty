const { assert, expect } = require("chai")
const { fetchJson } = require("ethers/lib/utils")
const { deployments, ethers, network, getNamedAccounts } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Testing Product Factory", async function () {
          let deployer, productFactory
          const chainId = network.config.chainId
          log = deployments.log
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["productfactory"])
              productFactory = await ethers.getContract("ProductFactory")
          })

          it("product Factory Constructor", async function () {
              const factoryOwner = await productFactory.getFactoryOwner()
              const numberOfProducts = await productFactory.getNumberOfProducts()
              assert.equal(factoryOwner.toString(), deployer.toString())
              assert.equal(numberOfProducts.toString(), "0")
          })

          describe("Testing related to Products itself", async () => {
              let transactionResponse, transactionReceipt, productAddress

              beforeEach(async () => {
                  transactionResponse = await productFactory.addProduct(
                      "testing",
                      "test",
                      10,
                      1,
                      "0x"
                  )
                  transactionReceipt = await transactionResponse.wait(
                      network.config.blockConfirmations
                  )
                  // Getting the address of the added Product
                  productAddress = await transactionReceipt.events[0].args.productAddress
              })

              it("Product Adding retains the data", async () => {
                  //   Number of products should be equal to 1 now
                  const numberOfProducts = await productFactory.getNumberOfProducts()
                  assert.equal(numberOfProducts.toString(), "1")

                  const name = await productFactory.getProductName(productAddress)
                  const symbol = await productFactory.getProductSymbol(productAddress)
                  const warrantyPeriod = await productFactory.getWarrantyPeriod(productAddress)
                  // assertion statements
                  assert.equal(name.toString(), "testing")
                  assert.equal(symbol.toString(), "test")
                  assert.equal(warrantyPeriod.toString(), "10")
              })

              it("product only deleted by seller", async () => {
                  const tempDeployer = (await ethers.getSigners())[1]
                  productFactory = await productFactory.connect(tempDeployer)
                  expect(productFactory.deleteProduct(productAddress)).to.be.revertedWith(
                      "ProductFactory__NotSeller()"
                  )
              })

              it("Deleting Product reduces the size", async () => {
                  await productFactory.deleteProduct(productAddress)
                  const numberOfProducts = await productFactory.getNumberOfProducts()
                  console.log(numberOfProducts.toString())
                  assert.equal(numberOfProducts.toString(), "0")
              })
          })

          describe("Events are emitted properly", async () => {
              let transactionResponse, transactionReceipt, productAddress, productABI
              beforeEach(async () => {
                  transactionResponse = await productFactory.addProduct(
                      "testing",
                      "test",
                      10,
                      1,
                      "0x"
                  )
                  transactionReceipt = await transactionResponse.wait(
                      network.config.blockConfirmations
                  )
                  productAddress = transactionReceipt.events[0].args.productAddress
              })

              it("Address of Added Product is emitted", async () => {
                  const tempAddress = await productFactory.getProductAtIndex(0)
                  assert.equal(productAddress.toString(), tempAddress.toString())
              })
          })

          describe("Testing Product itself", async () => {
              let transactionResponse, transactionReceipt, productAddress, productABI, firstProduct
              const chainId = network.config.chainId
              beforeEach(async function () {
                  deployer = (await getNamedAccounts()).deployer
                  await deployments.fixture(["productfactory"])
                  productFactory = await ethers.getContract("ProductFactory")
                  transactionResponse = await productFactory.addProduct(
                      "testing",
                      "test",
                      10,
                      1,

                      "0x"
                  )
                  transactionReceipt = await transactionResponse.wait(
                      network.config.blockConfirmations
                  )
                  productAddress = transactionReceipt.events[0].args.productAddress
                  productABI = require("../../artifacts/contracts/Product.sol/Product.json")
                  firstProduct = await ethers.getContractAt("Product", productAddress)
                  //   productABI = fs.readFileSync(filePath, "utf8")
              })

              it("Checking if the seller of the contract is persisting", async () => {
                  const seller = await firstProduct.getSeller()
                  assert.equal(seller.toString(), deployer)
              })

              it("Checking Name, symbol, warrantyPeriod of the Product", async () => {
                  const name = await firstProduct.name()
                  const symbol = await firstProduct.symbol()
                  const warrantyPeriod = await firstProduct.getWarrantyPeriod()
                  assert.equal(name.toString(), "testing")
                  assert.equal(symbol.toString(), "test")
                  assert.equal(warrantyPeriod.toString(), "10")
              })

              describe("Testing When buyer buys a product from seller", async () => {
                  let tokenID
                  beforeEach(async () => {
                      const address2 = (await ethers.getSigners())[1]
                      firstProduct = await firstProduct.connect(address2)
                      transactionResponse = await firstProduct.mint()
                      transactionReceipt = await transactionResponse.wait(1)
                      tokenID = transactionReceipt.events[0].args.tokenId
                  })

                  it("Checks if the warranty remains before time limit", async () => {
                      await network.provider.send("evm_increaseTime", [2])
                      await network.provider.send("evm_mine")
                      const inWarranty = await firstProduct.inWarranty(tokenID)
                      assert.equal(inWarranty.toString(), "true")
                  })

                  it("Checks if the warranty expire after given time", async () => {
                      await network.provider.send("evm_increaseTime", [11])
                      await network.provider.send("evm_mine")
                      const inWarranty = await firstProduct.inWarranty(tokenID)
                      assert.equal(inWarranty.toString(), "false")
                  })
              })
          })
      })
