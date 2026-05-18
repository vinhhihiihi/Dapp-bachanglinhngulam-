import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JsonRpcProvider, Contract } from "../client/node_modules/ethers/lib.esm/index.js";

const deploymentPath = resolve("deployments/sapphire-testnet.json");
const artifactPath = resolve(
  "artifacts/contracts/BuyCoffee.sol/BuyMeACoffee.json",
);

const deployment = JSON.parse(readFileSync(deploymentPath, "utf8"));
const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

const provider = new JsonRpcProvider(deployment.rpcUrl, deployment.chainId);
const contract = new Contract(deployment.address, artifact.abi, provider);

(async () => {
  console.log(`Using RPC: ${deployment.rpcUrl}`);
  console.log(`Contract: ${deployment.address}`);
  try {
    const memos = await contract.getMemos();
    console.log("getMemos result:", JSON.stringify(memos, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error calling getMemos:", err);
    process.exit(2);
  }
})();
