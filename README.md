# RCC stake contract

操作流程以及命令

```shell
git clone https://github.com/ProjectsTask/rcc-stake-contract

npm install
## 编译
npx hardhat compile
##  部署Rcc token
npx hardhat ignition deploy ./ignition/modules/Rcc.js
## 部署完Rcc Token,token 的地址作为stake 合约的初始化参数,
## 设置好RCCStake.js 中的参数
## 将stake合约部署到sepolia上
 npx hardhat run scripts/RCCStake.js --network sepolia
```
