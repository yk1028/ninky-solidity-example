const LZ_ENDPOINTS = require("../../constants/layerzeroEndpoints.json")
const CONFIG = require("./config.json")

module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    console.log(`>>> your address: ${deployer}`)

    const tokenAddress = CONFIG.NinkyProxyOFTV2.NINKY_TOKEN_ADDRESS
    const sharedDecimal = CONFIG.NinkyProxyOFTV2.SHARED_DECIMAL
    const lzEndpointAddress = LZ_ENDPOINTS[hre.network.name]
    
    console.log(`[${hre.network.name}] Token Address: ${tokenAddress}`)
    console.log(`[${hre.network.name}] Shared Decimal: ${sharedDecimal}`)
    console.log(`[${hre.network.name}] Endpoint Address: ${lzEndpointAddress}`)

    await deploy("ProxyOFTV2", {
        from: deployer,
        args: [tokenAddress, sharedDecimal, lzEndpointAddress],
        log: true,
        waitConfirmations: 1,
    })
}

module.exports.tags = ["NinkyProxyOFTV2"]
