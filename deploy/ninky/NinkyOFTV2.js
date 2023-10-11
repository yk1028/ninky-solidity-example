const LZ_ENDPOINTS = require("../constants/layerzeroEndpoints.json")
const CONFIG = require("./config.json")

module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    console.log(`>>> your address: ${deployer}`)

    const name = CONFIG.NinkyOFTV2.NAME
    const symbol = CONFIG.NinkyOFTV2.SYMBOL
    const sharedDecimal = CONFIG.NinkyOFTV2.sharedDecimal
    const lzEndpointAddress = LZ_ENDPOINTS[hre.network.name]

    console.log(`[${hre.network.name}] OFT Name: ${name}`)
    console.log(`[${hre.network.name}] OFT Symbol: ${symbol}`)
    console.log(`[${hre.network.name}] OFT Shared Decimal: ${sharedDecimal}`)
    console.log(`[${hre.network.name}] Endpoint Address: ${lzEndpointAddress}`)

    await deploy("OFTV2", {
        from: deployer,
        args: [name, symbol, sharedDecimal, lzEndpointAddress],
        log: true,
        waitConfirmations: 1,
    })
}

module.exports.tags = ["NinkyOFTV2"]
