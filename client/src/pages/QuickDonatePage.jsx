import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import "./QuickDonatePage.css";

function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function QuickDonatePage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [form, setForm] = useState({
    recipientAddress: "",
    amount: "0.01",
    note: "",
  });

  const canSubmit = useMemo(() => {
    const amount = Number(form.amount);
    return (
      ethers.isAddress(form.recipientAddress.trim()) &&
      Number.isFinite(amount) &&
      amount > 0
    );
  }, [form.amount, form.recipientAddress]);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Ban can cai MetaMask truoc.");
      return;
    }

    setConnectingWallet(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts?.[0] || "");
    } catch (error) {
      alert(error.message || "Khong ket noi duoc vi.");
    } finally {
      setConnectingWallet(false);
    }
  }

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();

    if (!window.ethereum) {
      alert("Ban can cai MetaMask de gui giao dich.");
      return;
    }

    if (!canSubmit) {
      alert("Vui long nhap dung dia chi vi va so ETH.");
      return;
    }

    setSending(true);
    setTxHash("");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      if (!walletAddress) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      }

      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: form.recipientAddress.trim(),
        value: ethers.parseEther(String(Number(form.amount))),
      });

      await tx.wait();
      setTxHash(tx.hash);
      setForm((prev) => ({
        ...prev,
        amount: "0.01",
        note: "",
      }));
    } catch (error) {
      alert(error.message || "Giao dich that bai.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="quick-donate-page">
      <section className="quick-donate-card">
        <Link className="quick-back-link" to="/">
          Ve landing
        </Link>
        <h1>Donate nhanh cho vi bat ky</h1>
        <p className="quick-subtitle">
          Dung cho creator chua co profile tren he thong. Nhap dia chi vi va gui ETH
          truc tiep.
        </p>

        <div className="quick-wallet-row">
          <button type="button" onClick={connectWallet} disabled={connectingWallet}>
            {walletAddress
              ? `Vi: ${shortAddress(walletAddress)}`
              : connectingWallet
                ? "Dang ket noi..."
                : "Ket noi MetaMask"}
          </button>
        </div>

        <form onSubmit={onSubmit} className="quick-form">
          <input
            name="recipientAddress"
            placeholder="Dia chi vi nguoi nhan (0x...)"
            value={form.recipientAddress}
            onChange={onChange}
            required
          />
          <input
            type="number"
            min="0.0001"
            step="0.0001"
            name="amount"
            placeholder="So tien ETH"
            value={form.amount}
            onChange={onChange}
            required
          />
          <textarea
            rows={3}
            name="note"
            placeholder="Ghi chu rieng (khong gui len blockchain)"
            value={form.note}
            onChange={onChange}
          />
          <button type="submit" disabled={!canSubmit || sending}>
            {sending ? "Dang gui..." : "Gui ETH"}
          </button>
        </form>

        {txHash && (
          <div className="quick-success">
            <strong>Thanh cong</strong>
            <p>Tx Hash: {txHash}</p>
          </div>
        )}
      </section>
    </main>
  );
}
