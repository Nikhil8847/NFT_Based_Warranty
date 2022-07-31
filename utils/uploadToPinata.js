const pinataSDk = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()
const { Contract } = require("ethers")
const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecretKey = process.env.PINATA_API_SECRET_KEY
const pinata = pinataSDk(pinataApiKey, pinataApiSecretKey)

async function storeProductMetadata(metadataFilePath) {
    const fullMetadataPath = path.resolve(metadataFilePath)
    const files = fs.readdirSync(fullMetadataPath)
    let responses = []
    for (file in files) {
        const streamForFile = fs.createReadStream(`${fullMetadataPath}/${files[file]}`)
        try {
            response = await pinata.pinJSONToIPFS(streamForFile)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    console.log(response)
    console.log(responses[0]["IpfsHash"])
    const temp = "ipfs://" + response.IpfsHash
    console.log(temp)
}

storeProductMetadata("./ProductMetadata/")
