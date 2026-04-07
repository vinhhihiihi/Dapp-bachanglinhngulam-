import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { Link, useParams } from "react-router-dom";
import {
  donateToCreator,
  followCreator,
  getCreator,
  getDonations,
  getFollowStatus,
  unfollowCreator,
} from "../api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import "./CreatorProfilePage.css";

const MAX_DONATIONS = 20;

function getOrCreateGuestId() {
  const storageKey = "bmac_guest_id";
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;

  const newId =
    globalThis.crypto?.randomUUID?.() ||
    `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(storageKey, newId);
  return newId;
}

function formatDate(value) {
  return new Date(value).toLocaleString("vi-VN");
}

export function CreatorProfilePage() {
  const { id } = useParams();
  const guestFollowerId = useMemo(getOrCreateGuestId, []);

  const [creator, setCreator] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [sendingDonation, setSendingDonation] = useState(false);
  const [form, setForm] = useState({
    name: "",
    walletAddress: "",
    message: "",
    amount: "0.01",
  });

  const followerAddress = (walletAddress || guestFollowerId).toLowerCase();

  const loadPageData = useCallback(async () => {
    if (!id) return;
    setLoadingPage(true);

    try {
      setPageError("");
      const [creatorData, donationData] = await Promise.all([
        getCreator(id),
        getDonations(id, MAX_DONATIONS),
      ]);
      setCreator(creatorData);
      setDonations(Array.isArray(donationData) ? donationData : []);
    } catch (error) {
      setPageError(error.message || "Khong the tai profile creator.");
    } finally {
      setLoadingPage(false);
    }
  }, [id]);

  const refreshFollowStatus = useCallback(async () => {
    if (!id || !followerAddress) return;
    try {
      const response = await getFollowStatus(id, followerAddress);
      setIsFollowing(Boolean(response.isFollowing));
    } catch {
      setIsFollowing(false);
    }
  }, [followerAddress, id]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  useEffect(() => {
    refreshFollowStatus();
  }, [refreshFollowStatus]);

  useEffect(() => {
    if (!window.ethereum) return undefined;

    const onAccountsChanged = (accounts) => {
      const nextAddress = accounts?.[0] || "";
      setWalletAddress(nextAddress);
      setForm((prev) => ({
        ...prev,
        walletAddress: prev.walletAddress || nextAddress,
      }));
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
    };
  }, []);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Ban can cai MetaMask truoc khi gui tang.");
      return;
    }

    setConnectingWallet(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts?.[0] || "";
      setWalletAddress(address);
      setForm((prev) => ({
        ...prev,
        walletAddress: prev.walletAddress || address,
      }));
    } catch (error) {
      alert(error.message || "Khong ket noi duoc vi MetaMask.");
    } finally {
      setConnectingWallet(false);
    }
  }

  async function onToggleFollow() {
    if (!creator) return;
    setLoadingFollow(true);
    try {
      const response = isFollowing
        ? await unfollowCreator(creator._id, followerAddress)
        : await followCreator(creator._id, followerAddress);

      setIsFollowing(Boolean(response.isFollowing));
      setCreator((prev) =>
        prev
          ? {
              ...prev,
              followersCount: response.followersCount,
            }
          : prev
      );
    } catch (error) {
      alert(error.message || "Khong the cap nhat follow.");
    } finally {
      setLoadingFollow(false);
    }
  }

  function onFieldChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmitDonation(event) {
    event.preventDefault();
    if (!creator) return;

    const amountNumber = Number(form.amount);
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      alert("So tien ETH khong hop le.");
      return;
    }

    if (!window.ethereum) {
      alert("Ban can cai MetaMask de gui giao dich.");
      return;
    }

    setSendingDonation(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      let signer;

      if (!walletAddress) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts?.[0] || "";
        if (account) {
          setWalletAddress(account);
          setForm((prev) => ({
            ...prev,
            walletAddress: prev.walletAddress || account,
          }));
        }
      }

      signer = await provider.getSigner();
      const senderAddress = (form.walletAddress || (await signer.getAddress())).trim();

      const tx = await signer.sendTransaction({
        to: creator.walletAddress,
        value: ethers.parseEther(String(amountNumber)),
      });
      await tx.wait();

      const donation = await donateToCreator({
        creatorId: creator._id,
        name: form.name || "Anonymous",
        walletAddress: senderAddress,
        message: form.message,
        amount: amountNumber,
        txHash: tx.hash,
      });

      setDonations((prev) => [donation, ...prev].slice(0, MAX_DONATIONS));
      setForm((prev) => ({
        ...prev,
        name: "",
        message: "",
        amount: "0.01",
        walletAddress: prev.walletAddress || senderAddress,
      }));
      alert("Gui tang thanh cong. Cam on ban!");
    } catch (error) {
      alert(error.message || "Giao dich that bai.");
    } finally {
      setSendingDonation(false);
    }
  }

  if (loadingPage) {
    return (
      <main className="creator-page">
        <LoadingSpinner label="Dang tai profile creator..." />
      </main>
    );
  }

  if (!creator || pageError) {
    return (
      <main className="creator-page">
        <section className="creator-error">
          <p>{pageError || "Khong tim thay creator."}</p>
          <Link to="/" className="link-button">
            Quay lai landing
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="creator-page">
      <section className="creator-layout">
        <Link to="/" className="link-button">
          Ve trang landing
        </Link>

        <header className="creator-header">
          <img src={creator.avatar} alt={creator.name} className="creator-avatar" />
          <div className="creator-info">
            <h1>{creator.name}</h1>
            <p>{creator.bio}</p>
            <code>{creator.walletAddress}</code>
          </div>
          <div className="follow-box">
            <button
              type="button"
              className={`follow-button ${isFollowing ? "is-following" : ""}`}
              onClick={onToggleFollow}
              disabled={loadingFollow}
            >
              {loadingFollow ? "Dang xu ly..." : isFollowing ? "Unfollow" : "Follow"}
            </button>
            <span>{creator.followersCount} followers</span>
          </div>
        </header>

        <section className="creator-donate">
          <div className="donate-top">
            <h2>Donate ETH</h2>
            <button type="button" onClick={connectWallet} disabled={connectingWallet}>
              {walletAddress
                ? `Vi: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : connectingWallet
                  ? "Dang ket noi..."
                  : "Ket noi MetaMask"}
            </button>
          </div>

          <form onSubmit={onSubmitDonation}>
            <input
              name="name"
              placeholder="Ten nguoi gui"
              value={form.name}
              onChange={onFieldChange}
            />
            <input
              name="walletAddress"
              placeholder="Dia chi vi cua ban (0x...)"
              value={form.walletAddress}
              onChange={onFieldChange}
            />
            <textarea
              name="message"
              placeholder="Loi nhan cua ban"
              value={form.message}
              onChange={onFieldChange}
              rows={4}
            />
            <input
              type="number"
              name="amount"
              min="0.0001"
              step="0.0001"
              placeholder="So tien ETH"
              value={form.amount}
              onChange={onFieldChange}
            />
            <button type="submit" className="submit-donation" disabled={sendingDonation}>
              {sendingDonation ? "Dang gui..." : "Gui tang"}
            </button>
          </form>
        </section>

        <section className="creator-messages">
          <h2>Loi nhan gan day</h2>
          {donations.length === 0 ? (
            <p className="empty-message">Chua co donation nao.</p>
          ) : (
            <ul>
              {donations.map((donation) => (
                <li key={donation._id}>
                  <div className="message-head">
                    <strong>{donation.name || "Anonymous"}</strong>
                    <span>{donation.amount} ETH</span>
                  </div>
                  <p>{donation.message || "Khong co loi nhan."}</p>
                  <small>{formatDate(donation.createdAt)}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
