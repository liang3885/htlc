const { network, ethers } = require("hardhat")
const fs = require("fs")
const {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")

module.exports = async({ getNamedAccounts, deployments }) => {
    console.log("Hi")
    const {deploy, log} = deployments
    const {deployer, receiver} = await getNamedAccounts()
    const chainId = network.config.chainId
    console.log(chainId)
    console.log(deployer)
    const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS
    console.log(waitBlockConfirmations)

    const htlc = await deploy("HTLC", {
        from: deployer,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    //记录abi文件
    const frontEndAbiFile = "constants/abi.json"
    fs.writeFileSync(frontEndAbiFile, JSON.stringify(htlc.abi, null, 2))

    //记录合约地址
    const frontEndContractsFile = "constants/contractAddresses.json"
    let contractAddresses = {}

    if (fs.existsSync(frontEndContractsFile)) {
        contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    }
    
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(htlc.address)) {
            contractAddresses[network.config.chainId.toString()].push(htlc.address)
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [htlc.address]
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))

} 