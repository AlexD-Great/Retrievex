import "@nomicfoundation/hardhat-toolbox";
import type { HardhatUserConfig } from "hardhat/config";
import "dotenv/config";

const CALIBRATION_RPC =
  process.env.FILECOIN_RPC_URL ?? "https://api.calibration.node.glif.io/rpc/v1";
const deployerAccounts = process.env.DEPLOYER_PRIVATE_KEY
  ? [process.env.DEPLOYER_PRIVATE_KEY]
  : [];

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    // Filecoin Calibration testnet (Filecoin EVM).
    calibration: {
      url: CALIBRATION_RPC,
      chainId: 314159,
      accounts: deployerAccounts
    },
    // Backwards-compatible alias used by existing scripts/docs.
    filecoinTestnet: {
      url: CALIBRATION_RPC,
      chainId: 314159,
      accounts: deployerAccounts
    }
  }
};

export default config;
