import { useEffect, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "DÁN_ADDRESS_VÀO_ĐÂY";

const abi = [
  "function buyCoffee(string memory name, string memory message) public payable",
  "function getMemos() public view returns (tuple(address sender, string name, string message, uint256 timestamp)[])",
  "function withdraw() public"
];

function App() {
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [memos, setMemos] = useState([]);

  let contract;

  // 🔌 Connect wallet
  async function connectWallet() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    window.contract = contract;
    loadMemos(contract);
  }

  // 📜 Load memos
  async function loadMemos(contract) {
    const data = await contract.getMemos();
    setMemos(data);
  }

  // ☕ Donate
  async function buyCoffee() {
    const tx = await window.contract.buyCoffee(name, message, {
      value: ethers.utils.parseEther(amount),
    });
    await tx.wait();
    loadMemos(window.contract);
  }

  // 💰 Withdraw
  async function withdraw() {
    const tx = await window.contract.withdraw();
    await tx.wait();
  }

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "auto" }}>
      <h1>☕ Buy Me A Coffee DApp</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {account}</p>
      )}

      <hr />

      <h3>Donate</h3>
      <input placeholder="Your name" onChange={(e) => setName(e.target.value)} />
      <br />
      <input placeholder="Message" onChange={(e) => setMessage(e.target.value)} />
      <br />
      <input
        placeholder="ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <br />
      <button onClick={buyCoffee}>Send ☕</button>

      <hr />

      <h3>Messages</h3>
      {memos.map((memo, i) => (
        <div key={i} style={{ borderBottom: "1px solid #ccc" }}>
          <p><b>{memo.name}</b>: {memo.message}</p>
        </div>
      ))}

      <hr />

      <button onClick={withdraw}>Withdraw (Owner)</button>
    </div>
  );
}

export default App;