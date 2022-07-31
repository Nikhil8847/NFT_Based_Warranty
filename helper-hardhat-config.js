const { ethers } = require("hardhat")

const developmentChains = ["hardhat", "localhost"]
const networkConfig = {
    4: {
        name: "rinkeby",
    },
    31337: {
        name: "hardhat",
    },
}

module.exports = {
    developmentChains,
    networkConfig,
}
