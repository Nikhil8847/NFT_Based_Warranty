require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = "ER26V21QEBSW2NB8HJ1BDE5DBWXSX6Q1WK"
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL
module.exports = {
    solidity: "0.8.8",
    settings: {
        optimizer: {
            enabled: true,
            runs: 10,
        },
    },
    defaultNetwork: "localhost",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        rinkeby: {
            chainId: 4,
            blockConfirmations: 6,
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
        localhost: {
            chainId: 31337,
        },
        mumbai: {
            chainId: 80001,
            url: MUMBAI_RPC_URL,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 2,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    etherscan: {
        apiKey: "ER26V21QEBSW2NB8HJ1BDE5DBWXSX6Q1WK",
    },
    gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
    },
    // mocha: {
    //     timeout: 20000,
    // },
}
