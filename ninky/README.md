# NINKY
## NINKY Deploy
### XPLA - BSC contract deploy
1. `hardhat.config.js`, `constants` `ninky/config`에 xpla 정보와 account 등록
   - `hardhat.config.js`
     - rpc url
     - chainId
     - xpla, bsc deploy account (required private key)
     - example
        ``` json
        'bsc-testnet': {
          url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
          chainId: 97, // layerzero chain id
          accounts: [process.env.BSC_PRIVKEY], // use dotenv
        },
        mumbai: {
          url: "https://rpc-mumbai.maticvigil.com/",
          chainId: 80001, // layerzero chain id
          accounts: [process.env.MUMBAI_PRIVKEY], // use dotenv
        },  
        ```
   - `constants`
     - layerzero chainid : `chainIds.json`
     - lzEndpoint contract address : `layerzeroEndpoints.json`
   - `ninky/config.json`
     - NINKY ERC20 token adreess (bnb)
     - NinkyProxyOFTV2 (bnb)
       - shared decimal
     - NinkyOFTV2 (xpla)
       - name
       - symbol
       - shared decimal
  
2. [BSC] ProxyOFTV2 deploy
| 기존 ERC20을 layerzero를 통해 전송 가능하도록 해주는 ProxyOFTV2 배포
``` shell
npx hardhat --network bsc deploy --tags NinkyProxyOFTV2
```

3. [XPLA] OFTV2 deploy
| BSC에서 proxyOFTV2를 통해 넘어와 Xpla에서 사용될 OFTV2 token 형태
``` shell
npx hardhat --network xpla deploy --tags NinkyOFTV2
```

4. 이후 tasks에서 setTrustedRemote 진행 후 send 가능
   
## NINKY Tasks
### setTustedRemote
| 기존 setTrustedRemote task를 사용하여 설정
1. **XPLA -> BSC**
    ``` shell
    npx hardhat --network xpla setTrustedRemote --target-network bsc --local-contract OFTV2 --remote-contract ProxyOFTV2
    ```
2. **BSC -> XPLA**
    ``` shell
    npx hardhat --network bsc setTrustedRemote --target-network xpla --local-contract ProxyOFTV2 --remote-contract OFTV2
    ```

### setMinDstGas
| 기존 setMinDstGas task를 사용하여 설정, `packet-type 0`은 sendFrom method에 대한 설정을 의미, `min-gas 200,000`은 layerzero에서 기본적으로 사용하는 값으로 설정
1. **BSC**
```shell
npx hardhat --network bsc setMinDstGas --target-network xpla --contract ProxyOFTV2 --packet-type 0 --min-gas 200000
```

2. **XPLA**
```shell
npx hardhat --network xpla setMinDstGas --target-network bsc-testnet --contract OFTV2 --packet-type 0 --min-gas 200000
```

### send
1. **BNB ProxyOFTV2 -> XPLA OFTV2**
   - `./config.json`에 BSC의 NinkY ERC20 token address 등록 필요
   - **[bsc -> xpla]** `hardhat.config.js`에 등록된 account[0]에서 `to address`에게 `amount`만큼 전송
        ``` shell
        npx hardhat --network bsc sendFromProxyOFTV2 --target-network xpla --to-addr {to address} --amount {amount}
        ```
   - approve, sendFrom tx 발생

2. **XPLA OFTV2 -> BNB ProxyOFTV2**
   - **[xpla -> bsc]** `hardhat.config.js`에 등록된 account[0]에서 `to address`에게 `amount`만큼 전송
        ``` shell
        npx hardhat --network xpla sendFromOFTV2 --target-network bsc --to-addr {to address} --amount {amount}
        ```
   - sendFrom tx 발생