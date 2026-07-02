import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account configured. Set DEPLOYER_PRIVATE_KEY.");
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Network:  ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} FIL`);

  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log(`\nEscrow deployed to ${address}`);

  if (network.name === "calibration" || network.name === "filecoinTestnet") {
    console.log(`Explorer: https://calibration.filfox.io/en/address/${address}`);
    console.log("\nSet this in the backend env as ESCROW_CONTRACT_ADDRESS.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
