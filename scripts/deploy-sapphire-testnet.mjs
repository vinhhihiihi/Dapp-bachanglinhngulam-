import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { JsonRpcProvider, Wallet, ContractFactory } from "../client/node_modules/ethers/lib.esm/index.js";

const rpcUrl =
  process.env.SAPPHIRE_TESTNET_RPC_URL || "https://testnet.sapphire.oasis.io";
const privateKey = process.env.SAPPHIRE_TESTNET_PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing SAPPHIRE_TESTNET_PRIVATE_KEY");
}

const artifactPath = resolve(
  "artifacts/contracts/BuyCoffee.sol/BuyMeACoffee.json",
);
const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

const provider = new JsonRpcProvider(rpcUrl, 23295);
const wallet = new Wallet(privateKey, provider);
const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);

console.log(`Deploying BuyMeACoffee to Oasis Sapphire Testnet via ${rpcUrl}`);
console.log(`Deployer: ${wallet.address}`);

const contract = await factory.deploy();
await contract.waitForDeployment();

const address = await contract.getAddress();
const deployment = {
  network: "Oasis Sapphire Testnet",
  chainId: 23295,
  rpcUrl,
  contractName: "BuyMeACoffee",
  address,
  deployer: wallet.address,
  deployedAt: new Date().toISOString(),
};

const deploymentPath = resolve("deployments/sapphire-testnet.json");
mkdirSync(dirname(deploymentPath), { recursive: true });
writeFileSync(deploymentPath, `${JSON.stringify(deployment, null, 2)}\n`);

console.log("Deployment complete");
console.log(`Contract address: ${address}`);
console.log(`Saved deployment metadata to ${deploymentPath}`);
