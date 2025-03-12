require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");

// 检查环境变量是否存在
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";

console.log("PRIVATE_KEY: ", PRIVATE_KEY);
console.log("INFURA_API_KEY: ", INFURA_API_KEY);
// 确保私钥格式正确
const privateKey = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY.substring(2) : PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,  // 为生产部署启用优化器
        runs: 200,
      },
    },
  },
  networks: {
    // 本地开发网络
    hardhat: {},
    
    // Sepolia 测试网
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: privateKey ? [`0x${privateKey}`] : [],
      chainId: 11155111,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.2,
    },
    
    // Goerli 测试网
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: privateKey ? [`0x${privateKey}`] : [],
      chainId: 5,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.2,
    },
    
    // Mumbai 测试网 (Polygon)
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`,
      accounts: privateKey ? [`0x${privateKey}`] : [],
      chainId: 80001,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.2,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  // 添加 Solidity 编译器输出选项
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  // 添加 Mocha 测试配置
  mocha: {
    timeout: 40000, // 增加测试超时时间
  },
};
