import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css"; 

const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";

const abi = [
  "function buyCoffee(string memory _name, string memory _message) public payable",
  "function getMemos() public view returns (tuple(address from, uint256 timestamp, string name, string message)[])",
  "function withdrawTips() public" 
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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Gửi tiền trực tiếp đến địa chỉ ví nhận ủng hộ
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(amount),
      });
      
      alert("Đang xử lý giao dịch trên Blockchain. Vui lòng chờ...");
      await tx.wait();
      
      // Ghi lại thông điệp vào contract
      await contractInstance.buyCoffee(name, message, { value: 0 });
      
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

  async function withdraw() {
    if (!contractInstance) return alert("Vui lòng kết nối ví trước!");
    try {
      const tx = await contractInstance.withdrawTips();
      await tx.wait();
      alert("Rút tiền về ví Owner thành công!");
    } catch (error) {
      alert("Lỗi: Chỉ chủ dự án (Owner) mới có quyền rút tiền!");
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
