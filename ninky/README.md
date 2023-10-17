# NINKY LayerZero ProxyOFTV2, OFTV2
## Configuration
`hardhat.config.js`, `constants`, `ninky/config`에 xpla 정보와 account 등록
- [`hardhat.config.js`](/hardhat.config.js)
  - rpc url
  - [layerzero chainId](https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids)
  - xpla, bsc deploy account (required private key)
  - example
    ```
    networks: {
      ..
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
      ...
    }
    ```
- [`constants`](/constants)
  - `chainIds.json` : [layerzero chainId](https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids)
  - `layerzeroEndpoints.json` : [Endpoint contract address](https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids)
- [`ninky/config.json`](/ninky/config.json)
  - NINKY ERC20 token adreess (bnb)
  - NinkyProxyOFTV2 (bnb)
    - shared decimal
  - NinkyOFTV2 (xpla)
    - name
    - symbol
    - shared decimal
## Deploy
### XPLA - BSC contract deploy
1. **[BSC] ProxyOFTV2 deploy**
     - 기존 ERC20을 layerzero를 통해 전송 가능하도록 해주는 ProxyOFTV2 배포
     - [`deploy/ninky/NinkyProxyOFTV2.js`](/deploy/ninky/NinkyProxyOFTV2.js)
    ``` shell
    npx hardhat --network bsc deploy --tags NinkyProxyOFTV2
    ```

2. **[XPLA] OFTV2 deploy**
     - BSC에서 proxyOFTV2를 통해 넘어와 Xpla에서 사용될 OFTV2 token 형태
     - [`deploy/ninky/NinkyOFTV2.js`](/deploy/ninky/NinkyOFTV2.js)
    ``` shell
    npx hardhat --network xpla deploy --tags NinkyOFTV2
    ```
   
## Tasks
### setTustedRemote
- 기존 setTrustedRemote task를 사용하여 contract간 신뢰 관계 설정
- [`tasks/setTrustedRemote.js`](/tasks/setTrustedRemote.js)
1. **XPLA -> BSC**
    ``` shell
    npx hardhat --network xpla setTrustedRemote --target-network bsc --local-contract OFTV2 --remote-contract ProxyOFTV2
    ```
2. **BSC -> XPLA**
    ``` shell
    npx hardhat --network bsc setTrustedRemote --target-network xpla --local-contract ProxyOFTV2 --remote-contract OFTV2
    ```

### setMinDstGas
 - 기존 setMinDstGas task를 사용하여 min gas 설정
 - [`tasks/setMinDstGas.js`](/tasks/setMinDstGas.js)
 - `--packet-type 0`: sendFrom method에 대한 설정을 의미
 - `--min-gas 100,000`: layerzero에서 기본적으로 사용하는 값으로 설정 (arbitrum을 제외한 체인에서는 100k면 충분하다는 layerzero측 답변)
  
1. **BSC -> XPLA**
    ```shell
    npx hardhat --network bsc setMinDstGas --target-network xpla --contract ProxyOFTV2 --packet-type 0 --min-gas 100000
    ```

2. **XPLA -> BSC**
    ```shell
    npx hardhat --network xpla setMinDstGas --target-network bsc --contract OFTV2 --packet-type 0 --min-gas 100000
    ```

### send Configuration
- 위에서 생성한 ProxyOFTV2,OFTV2 contract 주소를 [send_config.json](/ninky/send_config.json)에 지정
- example
  ``` json
  {
    "PROXYOFTV2_ADDR" : "0x200036829cDAB10bE56B82a24078E14CC5439a1a",
    "OFTV2_ADDR" : "0x200036829cDAB10bE56B82a24078E14CC5439a1a"
  }
  ```

### sendFrom
- 자산 전송 tasks
- [`task/ninky/sendFromProxyOFTV2.js`](/task/ninky/sendFromProxyOFTV2.js)
- [`task/ninky/sendFromOFTV2.js`](/task/ninky/sendFromOFTV2.js)
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