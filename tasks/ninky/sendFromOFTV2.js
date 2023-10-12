const CHAIN_IDS = require("../../constants/chainIds.json")

module.exports = async function (taskArgs, hre) {
    const signers = await ethers.getSigners()
    const owner = signers[0]

    const OFTV2 = await ethers.getContract("OFTV2")
    const dstChainId = CHAIN_IDS[taskArgs.targetNetwork]

    const toAddr = taskArgs.toAddr
    const toAddressBytes = ethers.utils.defaultAbiCoder.encode(['address'],[toAddr])
    const amount = taskArgs.amount

    // estimate fee
    const defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 200000])
    const fee = await OFTV2.estimateSendFee(dstChainId, toAddressBytes, amount, false, defaultAdapterParams)
    console.log(`fees: ${fee[0]}`)

    const callParams = { refundAddress: owner.address, zroPaymentAddress: owner.address, adapterParams: defaultAdapterParams }

    console.log(`[${hre.network.name} -> ${taskArgs.targetNetwork}] Send from ${owner.address} to ${toAddr}. amount: ${amount}`)

    let tx = await (
        await OFTV2.sendFrom(
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