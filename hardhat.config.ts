import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  solidity: {
    version: "0.8.28",
  },
  networks: {
    sapphireTestnet: {
      type: "http",
      chainType: "generic",
      url: configVariable("SAPPHIRE_TESTNET_RPC_URL"),
      chainId: 23295,
      accounts: [configVariable("SAPPHIRE_TESTNET_PRIVATE_KEY")],
    },
  },
});
