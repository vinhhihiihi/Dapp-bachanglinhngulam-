import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  BUY_ME_A_COFFEE_ABI,
  getBuyCoffeeAddress,
} from "./lib/buyCoffeeContract";
import {
  ensureOasisSapphireTestnet,
  OASIS_SAPPHIRE_TESTNET,
} from "./lib/oasisSapphire";
import "./App.css";

const contractAddress = getBuyCoffeeAddress(
  OASIS_SAPPHIRE_TESTNET.chainIdDecimal,
);

function Home() {
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [memos, setMemos] = useState([]);
  const [contractInstance, setContractInstance] = useState(null);

  useEffect(() => {
    if (!window.ethereum) return undefined;

    const onAccountsChanged = (accounts) => {
      setAccount(accounts?.[0] || "");
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
    };
  }, []);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Vui long cai dat vi MetaMask.");
      return;
    }

    if (!contractAddress) {
      alert("Chua cau hinh dia chi contract BuyMeACoffee cho Sapphire Testnet.");
      return;
    }

    try {
      await ensureOasisSapphireTestnet();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const nextAccount = accounts?.[0] || "";
      setAccount(nextAccount);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        BUY_ME_A_COFFEE_ABI,
        signer,
      );

      setContractInstance(contract);
      await loadMemos(contract);
    } catch (error) {
      console.error("Loi ket noi vi:", error);
      alert(error.message || "Khong ket noi duoc MetaMask.");
    }
  }

  async function loadMemos(contract) {
    try {
      const data = await contract.getMemos();
      setMemos(data);
    } catch (error) {
      console.error("Loi tai du lieu:", error);
    }
  }

  async function buyCoffee() {
    if (!contractAddress) {
      alert("Chua cau hinh dia chi contract BuyMeACoffee cho Sapphire Testnet.");
      return;
    }

    if (!contractInstance) {
      alert("Vui long ket noi vi truoc.");
      return;
    }

    if (!recipientAddress) {
      alert("Vui long nhap dia chi vi nhan ung ho.");
      return;
    }

    if (!ethers.isAddress(recipientAddress)) {
      alert("Dia chi vi khong hop le.");
      return;
    }

    try {
      await ensureOasisSapphireTestnet();
      const tx = await contractInstance.buyCoffee(recipientAddress, name, message, {
        value: ethers.parseEther(amount),
      });

      alert("Dang xu ly giao dich tren Oasis Sapphire Testnet.");
      await tx.wait();

      alert("Gui ung ho thanh cong.");
      await loadMemos(contractInstance);
      setName("");
      setMessage("");
      setRecipientAddress("");
    } catch (error) {
      console.error("Loi giao dich:", error);
      alert(`Loi giao dich: ${error.message}`);
    }
  }

  return (
    <div className="container">
      <h1>Buy Me A Coffee</h1>

      {!account ? (
        <button className="wallet-btn" onClick={connectWallet}>
          Ket noi MetaMask
        </button>
      ) : (
        <div className="connected-text">
          <b>Vi:</b> {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      )}

      <h3>Ung ho du an tren Oasis Sapphire Testnet</h3>
      <input
        placeholder="Ten cua ban..."
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        placeholder="Dia chi vi nhan ung ho (0x...)"
        value={recipientAddress}
        onChange={(event) => setRecipientAddress(event.target.value)}
      />
      <input
        placeholder="Loi nhan nho..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />

      <div className="donate-row">
        <input
          placeholder="So tien TEST"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <button className="donate-btn" onClick={buyCoffee}>
          Gui tang TEST
        </button>
      </div>

      {!contractAddress && (
        <p style={{ textAlign: "center", color: "#b45309", marginTop: "20px" }}>
          Can dat VITE_BUY_ME_A_COFFEE_ADDRESS_23295 trong client/.env.local sau khi
          deploy contract len Sapphire Testnet.
        </p>
      )}

      <h3>Loi nhan gan day</h3>
      <div className="memos-container">
        {memos.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>
            Chua co loi nhan nao.
          </p>
        ) : (
          memos.map((memo, index) => (
            <div key={index} className="memo-card">
              <div className="memo-header">
                <span className="memo-name">{memo.name || "Nguoi an danh"}</span>
                <span className="memo-address">
                  {memo.from.slice(0, 6)}...{memo.from.slice(-4)}
                </span>
              </div>
              <p className="memo-message">{memo.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
