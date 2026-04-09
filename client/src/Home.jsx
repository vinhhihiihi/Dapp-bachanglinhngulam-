import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css"; 

const contractAddress = "0x3eDC27edC8F8e7e9AE51248E78cD153aBD2F9746";
const abi = [
  "function buyCoffee(address payable _to, string memory _name, string memory _message) public payable",
  "function getMemos() public view returns (tuple(address from, address to, uint256 timestamp, string name, string message)[])"
];

function Home() {
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [memos, setMemos] = useState([]);
  const [contractInstance, setContractInstance] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) return alert("Vui lòng cài đặt ví Metamask!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      setContractInstance(contract);
      loadMemos(contract);
    } catch (error) {
      console.error("Lỗi kết nối ví:", error);
    }
  }

  async function loadMemos(contract) {
    try {
      const data = await contract.getMemos();
      setMemos(data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  }

  async function buyCoffee() {
    if (!contractInstance) return alert("Vui lòng kết nối ví trước!");
    if (!recipientAddress) return alert("Vui lòng nhập địa chỉ ví nhận ủng hộ!");
    if (!ethers.isAddress(recipientAddress)) return alert("Địa chỉ ví không hợp lệ!");
    
    try {
      const tx = await contractInstance.buyCoffee(
        recipientAddress, 
        name, 
        message, 
        { value: ethers.parseEther(amount) }
      );
      
      alert("Đang xử lý giao dịch trên Blockchain. Vui lòng chờ...");
      await tx.wait(); 
      
      alert("Cảm ơn bạn đã ủng hộ!");
      loadMemos(contractInstance); 
      
      setName(""); 
      setMessage(""); 
      setRecipientAddress("");
    } catch (error) {
      console.error("Lỗi giao dịch:", error);
      alert("Lỗi giao dịch: " + error.message);
    }
  }

  return (
    <div className="container">
      <h1>☕ Buy Me A Coffee</h1>

      {!account ? (
        <button className="wallet-btn" onClick={connectWallet}>
          🔗 Kết nối ví Metamask
        </button>
      ) : (
        <div className="connected-text">
          🟢 <b>Ví:</b> {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      )}

      <h3>💖 Ủng hộ dự án</h3>
      <input 
        placeholder="Tên của bạn..." 
        value={name}
        onChange={(e) => setName(e.target.value)} 
      />
      <input 
        placeholder="Địa chỉ ví nhận ủng hộ (0x...)" 
        value={recipientAddress}
        onChange={(e) => setRecipientAddress(e.target.value)} 
      />
      <input 
        placeholder="Lời nhắn nhủ..." 
        value={message}
        onChange={(e) => setMessage(e.target.value)} 
      />
      
      <div className="donate-row">
        <input
          placeholder="Số ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button className="donate-btn" onClick={buyCoffee}>Gửi Tặng 💰</button>
      </div>

      <h3>📜 Lời nhắn gần đây</h3>
      <div className="memos-container">
        {memos.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>Chưa có lời nhắn nào.</p>
        ) : (
          memos.map((memo, i) => (
            <div key={i} className="memo-card">
              <div className="memo-header">
                <span className="memo-name">{memo.name || "Người ẩn danh"}</span>
                <span className="memo-address">{memo.from.slice(0, 6)}...{memo.from.slice(-4)}</span>
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
