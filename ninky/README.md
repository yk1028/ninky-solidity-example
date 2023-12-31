# NINKY LayerZero ProxyOFTV2, OFTV2
| 해당 문서는 bsc의 ERC20을 xpla로 옮기는 상황에 해당하는 문서입니다. 다른 chain에서 테스트하기 위해서는 수정이 필요합니다.

## Install
```shell
git clone https://github.com/yk1028/ninky-solidity-example
cd ninky-solidity-example
npm i
```

## Configuration
`hardhat.config.js`, `constants`, `ninky/config`에 chain 정보와 account 등록
- [`hardhat.config.js`](/hardhat.config.js)
  - rpc url
  - chain id
  - xpla, bsc deploy account (required private key)
    - `.env` 파일을 생성하여 private key 등록 필요
      ```
      BSC_PRIVKEY="{your bsc private key}"
      CUBE_PRIVKEY="{your cube private key}"
      ```
  - 아래의 모든 tx는 여기에서 등록한 chain별 private key로 전송
  - example (bsc-testnet, cube)
    ```
    ...
    networks: {
      ...
      'bsc-testnet': {
        url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        chainId: 97,
        accounts: [process.env.BSC_PRIVKEY], // use dotenv 
      },
      cube: {
        url: "https://cube-evm-rpc.xpla.dev/",
        chainId: 47,
        accounts: [process.env.CUBE_PRIVKEY], // use dotenv
      },
      ...
    }
    ...
    ```
    
- [`/constants`](/constants)
  - `chainIds.json` : [layerzero chainId](https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids)
  - `layerzeroEndpoints.json` : [endpoint contract address](https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids)
    
- [`/ninky/config.json`](/ninky/config.json)
  - NINKY ERC20 token adreess (bnb)
  - NinkyProxyOFTV2 (bnb)
    - shared decimal
  - NinkyOFTV2 (xpla)
    - name
    - symbol
    - shared decimal
  - example
    ``` json
    {
        "NINKY_TOKEN_ADDR" : "0x1E41d27265A486397BA2FD85dDdEC08C81B51F9F",
        "NinkyProxyOFTV2" : {
            "SHARED_DECIMAL" : 6
        },
        "NinkyOFTV2" : {
            "NAME" : "xpla layerzero shared decimal 6 test token",
            "SYMBOL" : "xLZST",
            "SHARED_DECIMAL" : 6
        }   
    }
    ```    
## Deploy
### XPLA - BSC contract deploy
1. **[BSC] ProxyOFTV2 deploy**
     - 기존 ERC20을 layerzero를 통해 전송 가능하도록 해주는 ProxyOFTV2 배포
     - [`/deploy/ninky/NinkyProxyOFTV2.js`](/deploy/ninky/NinkyProxyOFTV2.js)
    ``` shell
    npx hardhat --network bsc deploy --tags NinkyProxyOFTV2
    ```

2. **[XPLA] OFTV2 deploy**
     - BSC에서 proxyOFTV2를 통해 넘어와 Xpla에서 사용될 OFTV2 token 배포
     - [`/deploy/ninky/NinkyOFTV2.js`](/deploy/ninky/NinkyOFTV2.js)
    ``` shell
    npx hardhat --network xpla deploy --tags NinkyOFTV2
    ```

- **주의**: contract를 재배포하는 경우 /deployments에서 해당 contract의 json file을 삭제해야 reuse하지 않고 새로운 contract가 배포된다.
   
## Tasks
### setTustedRemote
- 기존 setTrustedRemote task를 사용하여 contract간 신뢰 관계 설정
- [`/tasks/setTrustedRemote.js`](/tasks/setTrustedRemote.js)
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
 - [`/tasks/setMinDstGas.js`](/tasks/setMinDstGas.js)
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
- 위에서 생성한 ProxyOFTV2, OFTV2 contract 주소를 [send_config.json](/ninky/send_config.json)에 지정
- example
  ``` json
  {
    "PROXYOFTV2_ADDR" : "0x200036829cDAB10bE56B82a24078E14CC5439a1a",
    "OFTV2_ADDR" : "0x200036829cDAB10bE56B82a24078E14CC5439a1a"
  }
  ```

### sendFrom
- 자산 전송 tasks
- [`/tasks/ninky/sendFromProxyOFTV2.js`](/tasks/ninky/sendFromProxyOFTV2.js)
- [`/tasks/ninky/sendFromOFTV2.js`](/tasks/ninky/sendFromOFTV2.js)
- amount는 ERC20 token local decimal 기준으로 shared decimal 맞춰 보내야 한다.
  - amount exmaple
    - local decimal이 18이고, shared decimal이 6인 경우 amount의 최소값은 1000000000000 (12자리, 0.000001)
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
