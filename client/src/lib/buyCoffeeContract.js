import { OASIS_SAPPHIRE_TESTNET } from "./oasisSapphire";

export const BUY_ME_A_COFFEE_ABI = [
  "function buyCoffee(address payable _to, string memory _name, string memory _message) public payable",
  "function getMemos() public view returns (tuple(address from, address to, uint256 timestamp, string name, string message)[])",
];

const configuredAddress =
  import.meta.env.VITE_BUY_ME_A_COFFEE_ADDRESS_23295 ||
  import.meta.env.VITE_BUY_ME_A_COFFEE_ADDRESS ||
  "";

export function getBuyCoffeeAddress(chainId) {
  if (Number(chainId) !== OASIS_SAPPHIRE_TESTNET.chainIdDecimal) {
    return "";
  }

  return configuredAddress.trim();
}
