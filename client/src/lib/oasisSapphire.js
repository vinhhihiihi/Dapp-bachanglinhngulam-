export const OASIS_SAPPHIRE_TESTNET = {
  chainId: "0x5aff",
  chainName: "Oasis Sapphire Testnet",
  // Decimal chainId for comparisons in code
  chainIdDecimal: 23295,
  nativeCurrency: {
    name: "Test Oasis Rose",
    symbol: "TEST",
    decimals: 18,
  },
  rpcUrls: ["https://testnet.sapphire.oasis.io"],
  blockExplorerUrls: ["https://explorer.oasis.io/testnet/sapphire"],
};

export async function ensureOasisSapphireTestnet() {
  if (!window.ethereum) {
    throw new Error("Ban can cai MetaMask truoc.");
  }

  const currentChainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (currentChainId === OASIS_SAPPHIRE_TESTNET.chainId) {
    return;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: OASIS_SAPPHIRE_TESTNET.chainId }],
    });
  } catch (error) {
    if (error?.code !== 4902) {
      throw error;
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [OASIS_SAPPHIRE_TESTNET],
    });
  }
}
