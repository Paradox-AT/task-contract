import { ethers } from "hardhat";

async function main() {
  const task = await ethers.deployContract("Task");

  await task.waitForDeployment();

  console.log(
    `Task contract deployed to ${task.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
