const CHAIN_IDS = require("../../constants/chainIds.json")
const NINKY_CONFIG = require("../../ninky/config.json")
const ABI = require("./abi.json")

const approve = async (owner, proxyOFTV2, amount) => {
    const provider = ethers.getDefaultProvider() 
    const ninkyContract = new ethers.Contract(NINKY_CONFIG.NINKY_TOKEN_ADDR, ABI.sendABI, provider).connect(owner)

    const approveTx = await ninkyContract.approve(proxyOFTV2.address, amount)
    await approveTx.wait()

    console.log(`approved ${approveTx.hash}`)
}

module.exports = async function (taskArgs, hre) {
    const signers = await ethers.getSigners()
    const owner = signers[0]

    const proxyOFTV2 = await ethers.getContractAt("ProxyOFTV2", "0x200036829cDAB10bE56B82a24078E14CC5439a1a", owner)
    const dstChainId = CHAIN_IDS[taskArgs.targetNetwork]

    const toAddr = taskArgs.toAddr
    const toAddressBytes = ethers.utils.defaultAbiCoder.encode(['address'],[toAddr])
    const amount = taskArgs.amount

    // estimate fee
    const defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 100000])
    const fee = await proxyOFTV2.estimateSendFee(dstChainId, toAddressBytes, amount, false, defaultAdapterParams)
    console.log(`fees: ${fee[0]}`)

    // approve
    await approve(owner, proxyOFTV2, amount)

    const callParams = { refundAddress: owner.address, zroPaymentAddress: owner.address, adapterParams: defaultAdapterParams }

    console.log(`[${hre.network.name} -> ${taskArgs.targetNetwork}] Send from ${owner.address} to ${toAddr}. amount: ${amount}`)

    let tx = await (
        await proxyOFTV2.sendFrom(
            owner.address,
            dstChainId,
            toAddressBytes,
            amount,
            callParams,
            { value: fee[0] }
        )
    ).wait()
    console.log(`send tx: ${tx.transactionHash}`)
}