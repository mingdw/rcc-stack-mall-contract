const { ethers } = require("hardhat");
const RCC_TOKEN_ADDRESS = "0xb345C90046974FcDeC85cfe30B9DeDA138206Fbc";
const RCC_STAKE_ADDRESS = "0xF28699665d460F58a775E4B7C430dFD4007fb2Cd";


async function main() {
  // 合约地址 - 确保这些是 Sepolia 测试网上的实际地址
  try {
    // 验证合约地址格式
    if (!ethers.isAddress(RCC_TOKEN_ADDRESS)) {
      throw new Error("Invalid RCC Token address");
    }
    if (!ethers.isAddress(RCC_STAKE_ADDRESS)) {
      throw new Error("Invalid RCC Stake address");
    }

    // 检查合约是否存在
    const tokenCode = await ethers.provider.getCode(RCC_TOKEN_ADDRESS);
    if (tokenCode === "0x") {
      throw new Error("No contract deployed at RCC Token address");
    }

    console.log("Attempting to connect to contracts...");
    
    // 获取合约实例
    const rccToken = await ethers.getContractAt("RccToken", RCC_TOKEN_ADDRESS);
    const rccStake = await ethers.getContractAt("RCCStake", RCC_STAKE_ADDRESS);

    if (!rccStake) {
      throw new Error("Failed to get RCCStake contract instance");
    }

    // 测试 RCC Token
    console.log("\nTesting RCC Token:");
    try {
      const name = await rccToken.name();
      const symbol = await rccToken.symbol();
      const decimals = await rccToken.decimals();
      console.log(`Name: ${name}`);
      console.log(`Symbol: ${symbol}`);
      console.log(`Decimals: ${decimals}`);
    } catch (error) {
      console.error("Failed to read RCC Token properties:", error.message);
    }

    // 测试 RCCStake
    console.log("\nTesting RCCStake:");
    try {
      // 使用正确的属性名称
      const rccTokenAddress = await rccStake.RCC();
      const startBlock = await rccStake.startBlock();
      const endBlock = await rccStake.endBlock();
      const rccPerBlock = await rccStake.rccPerBlock();
      
      if (!rccTokenAddress) {
        throw new Error("RCC token address is undefined");
      }

      const blockNumber = await ethers.provider.getBlockNumber();
      console.log("Current block number:", blockNumber);
    
      // 获取区块详情
      const block = await ethers.provider.getBlock("latest");
      console.log("Latest block:", {
        number: block.number,
        timestamp: new Date(block.timestamp * 1000).toLocaleString(),
        hash: block.hash
      });

      // 获取最新区块信息用于计算平均出块时间
      const latestBlock = await ethers.provider.getBlock("latest");
      const oldBlock = await ethers.provider.getBlock(latestBlock.number - 100); // 取100个区块前
      
      // 计算平均出块时间（秒）
      const averageBlockTime = (Number(latestBlock.timestamp) - Number(oldBlock.timestamp)) / 100;

      // 计算总区块数和预计时间
      const totalBlocks = Number(endBlock) - Number(startBlock);
      const totalSeconds = totalBlocks * averageBlockTime;
      
      // 转换为天/小时/分钟
      const days = Math.floor(totalSeconds / (24 * 60 * 60));
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

      console.log("\n区块信息:");
      console.log(`当前区块: ${blockNumber}`);
      console.log(`开始区块: ${startBlock}`);
      console.log(`结束区块: ${endBlock}`);
      console.log(`总区块数: ${totalBlocks}`);
      console.log(`\n时间估算:`);
      console.log(`平均出块时间: ${averageBlockTime.toFixed(2)} 秒`);
      console.log(`预计总时间: ${days}天 ${hours}小时 ${minutes}分钟`);

      // 计算进度
      if (blockNumber > startBlock) {
        const elapsedBlocks = Number(blockNumber) - Number(startBlock);
        const progress = (elapsedBlocks * 100 / totalBlocks).toFixed(2);
        const remainingBlocks = Number(endBlock) - Number(blockNumber);
        const remainingSeconds = remainingBlocks * averageBlockTime;
        
        const remainingDays = Math.floor(remainingSeconds / (24 * 60 * 60));
        const remainingHours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
        const remainingMinutes = Math.floor((remainingSeconds % (60 * 60)) / 60);

        console.log(`\n进度信息:`);
        console.log(`已完成: ${progress}%`);
        console.log(`剩余时间: ${remainingDays}天 ${remainingHours}小时 ${remainingMinutes}分钟`);
      }

      // 验证合约关联
      if (rccTokenAddress.toLowerCase() === RCC_TOKEN_ADDRESS.toLowerCase()) {
        console.log("\n✅ Contracts are correctly linked!");
      } else {
        console.log("\n❌ Contract linking error!");
      }
    } catch (error) {
      console.error("Failed to read RCCStake properties:", error.message);
      // 打印更详细的错误信息
      if (error.error) {
        console.error("Additional error details:", error.error);
      }
    }
    console.log("********************test_AddPool********************");
    //await test_AddPool();

    console.log("\n********************test_GetPools********************");
    await test_GetPools();

  } catch (error) {
    console.error("Test failed:", error.message);
    if (error.error) {
      console.error("Additional error details:", error.error);
    }
  }


  
}




main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 


async function test_AddPool() {
  try {
    const RCCStake = await ethers.getContractAt("RCCStake", RCC_STAKE_ADDRESS);
    
    // 获取现有池子数量
    const currentPoolLength = await RCCStake.poolLength();
    console.log("Current pool length:", currentPoolLength.toString());

    // 设置池子参数
    const allocPoint = 100;
    const minDepositAmount = ethers.parseEther("0.01"); // 最小质押数量
    const unstakeLockedBlocks = 100; // 解锁所需区块数
    const withUpdate = true;
    
    // 根据是否是第一个池子来决定使用什么地址
    const stTokenAddress = currentPoolLength.toString() === "0" 
        ? "0x0000000000000000000000000000000000000000"  // 第一个池子用 ETH
        : RCC_TOKEN_ADDRESS;  // 之后的池子用 RCC token
    
    console.log("\nAdding new pool with parameters:");
    console.log(`Staking Token: ${stTokenAddress}`);
    console.log(`Allocation Points: ${allocPoint}`);
    console.log(`Min Deposit Amount: ${minDepositAmount}`);
    console.log(`Unstake Locked Blocks: ${unstakeLockedBlocks}`);
    
    // 调用addPool函数
    const tx = await RCCStake.addPool(
      stTokenAddress,
      allocPoint,
      minDepositAmount,
      unstakeLockedBlocks,
      withUpdate,
      { gasLimit: 3000000 }
    );
    
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // 验证池子是否添加成功
    const newPoolLength = await RCCStake.poolLength();
    console.log(`Total pools after addition: ${newPoolLength}`);
    
  } catch (error) {
    console.error("\nFailed to add pool:");
    console.error("Error message:", error.message);
    if (error.error) {
      console.error("Additional error details:", error.error);
    }
    throw error;
  }
}

async function test_GetPools() {
  try {
    const RCCStake = await ethers.getContractAt("RCCStake", RCC_STAKE_ADDRESS);
    
    // 获取池子数量
    const poolLength = await RCCStake.poolLength();
    console.log("\nTotal Pools:", poolLength.toString());
    
    // 遍历所有池子
    for (let pid = 0; pid < poolLength; pid++) {
      console.log(`\n=== Pool ${pid} Information ===`);
      const pool = await RCCStake.pool(pid);
      
      // 格式化池子信息
      console.log(`Staking Token: ${pool.stTokenAddress}`);
      console.log(`Pool Weight: ${pool.poolWeight.toString()}`);
      console.log(`Last Reward Block: ${pool.lastRewardBlock.toString()}`);
      console.log(`Accumulated RCC Per ST: ${ethers.formatEther(pool.accRCCPerST)}`);
      console.log(`Total Staked Amount: ${ethers.formatEther(pool.stTokenAmount)}`);
      console.log(`Minimum Deposit: ${ethers.formatEther(pool.minDepositAmount)} ${pid === 0 ? 'ETH' : 'RCC'}`);
      console.log(`Unstake Locked Blocks: ${pool.unstakeLockedBlocks.toString()}`);
      
      // 如果是 RCC 池子，显示代币信息
      if (pid > 0) {
        const token = await ethers.getContractAt("RccToken", pool.stTokenAddress);
        const symbol = await token.symbol();
        const name = await token.name();
        console.log(`Token Name: ${name}`);
        console.log(`Token Symbol: ${symbol}`);
      }
      
      // 获取当前区块信息
      const currentBlock = await ethers.provider.getBlockNumber();
      console.log(`\nCurrent Block: ${currentBlock}`);
      
      // 计算距离解锁还需要多少区块
      if (pool.lastRewardBlock > currentBlock) {
        const blocksUntilReward = Number(pool.lastRewardBlock) - Number(currentBlock);
        console.log(`Blocks until next reward: ${blocksUntilReward}`);
      }
    }
    
    // 获取全局信息
    const startBlock = await RCCStake.startBlock();
    const endBlock = await RCCStake.endBlock();
    const rccPerBlock = await RCCStake.rccPerBlock();
    const totalPoolWeight = await RCCStake.totalPoolWeight();
    
    console.log("\n=== Global Staking Information ===");
    console.log(`Start Block: ${startBlock.toString()}`);
    console.log(`End Block: ${endBlock.toString()}`);
    console.log(`RCC Per Block: ${ethers.formatEther(rccPerBlock)}`);
    console.log(`Total Pool Weight: ${totalPoolWeight.toString()}`);
    
    // 计算质押进度
    const currentBlock = await ethers.provider.getBlockNumber();
    if (currentBlock > startBlock) {
      // 将 BigInt 转换为 Number 进行计算
      const progress = ((Number(currentBlock) - Number(startBlock)) * 100 / Number(endBlock - startBlock)).toFixed(2);
      const remainingBlocks = Number(endBlock) - Number(currentBlock);
      console.log(`\nStaking Progress: ${progress}%`);
      console.log(`Remaining Blocks: ${remainingBlocks}`);
    }
    
  } catch (error) {
    console.error("\nFailed to get pools information:");
    console.error("Error message:", error.message);
    if (error.error) {
      console.error("Additional error details:", error.error);
    }
    throw error;
  }
}