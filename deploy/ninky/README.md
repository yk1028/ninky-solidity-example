# NINKY Deploy
## XPLA - BSC contract deploy
1. `hardhat.config.js`와 `constants`에 xpla 정보와 account 등록
   - lcd url
   - layerzero chainid
   - lzEndpoint contract address
   - xpla, bsc deploy account (with private key)
2. [BSC] ProxyOFTV2 deploy
   1. 기존 BSC chain에 있던 NINKY ERC20 token adreess와 shared decimal을 `config.json`에 입력
      - NINKY ERC20 token adreess
      - shared decimal
    2. deploy 명령어 실행
        ``` shell
        npx hardhat --network bsc deploy --tags NinkyProxyOFTV2
        ```
3. [XPLA] OFTV2 deploy
   1. OFTV2에 필요한 정보를 `config.json`에 입력
      - name
      - symbol
      - shared decimal 
   2. deploy 명령어 실행
        ``` shell
        npx hardhat --network xpla deploy --tags NinkyOFTV2
        ```