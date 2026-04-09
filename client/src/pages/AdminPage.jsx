import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import {
  adminLogin,
  createCreatorAsAdmin,
  deleteCreatorAsAdmin,
  getAdminSession,
  getCreators,
  updateCreatorAsAdmin,
} from "../api";
import "./AdminPage.css";

const ADMIN_TOKEN_STORAGE_KEY = "bmac_admin_token";

const defaultCreatorForm = {
  name: "",
  avatar: "",
  bio: "",
  walletAddress: "",
};

const defaultEditForm = {
  name: "",
  avatar: "",
  bio: "",
  walletAddress: "",
};

function toEditForm(creator) {
  return {
    name: creator?.name || "",
    avatar: creator?.avatar || "",
    bio: creator?.bio || "",
    walletAddress: creator?.walletAddress || "",
  };
}

export function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [manageError, setManageError] = useState("");
  const [manageSuccess, setManageSuccess] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [creatorForm, setCreatorForm] = useState(defaultCreatorForm);
  const [editForm, setEditForm] = useState(defaultEditForm);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState("");
  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";
  });

  const isAuthenticated = Boolean(adminToken);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!adminToken) {
      setCheckingSession(false);
      return;
    }

    let cancelled = false;
    setCheckingSession(true);
    setAuthError("");

    getAdminSession(adminToken)
      .then((response) => {
        if (cancelled) return;
        setAdminUsername(response.username || "admin");
      })
      .catch((error) => {
        if (cancelled) return;
        localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        setAdminToken("");
        setAdminUsername("");
        setSearchResults([]);
        setSelectedCreatorId("");
        setEditForm(defaultEditForm);
        setAuthError(error.message || "Phien dang nhap admin da het han.");
      })
      .finally(() => {
        if (cancelled) return;
        setCheckingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adminToken]);

  const canSubmitCreator = useMemo(() => {
    return (
      creatorForm.name.trim() &&
      creatorForm.avatar.trim() &&
      ethers.isAddress(creatorForm.walletAddress.trim())
    );
  }, [creatorForm.avatar, creatorForm.name, creatorForm.walletAddress]);

  const canSubmitEdit = useMemo(() => {
    return (
      editForm.name.trim() &&
      editForm.avatar.trim() &&
      ethers.isAddress(editForm.walletAddress.trim())
    );
  }, [editForm.avatar, editForm.name, editForm.walletAddress]);

  const selectedCreator = useMemo(() => {
    return searchResults.find((creator) => creator._id === selectedCreatorId) || null;
  }, [searchResults, selectedCreatorId]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    setSearchLoading(true);
    setManageError("");

    getCreators({
      page: 1,
      limit: 20,
      search: debouncedSearch,
    })
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response?.data) ? response.data : [];
        setSearchResults(list);

        if (!selectedCreatorId) return;
        const stillExists = list.find((creator) => creator._id === selectedCreatorId);
        if (!stillExists) {
          setSelectedCreatorId("");
          setEditForm(defaultEditForm);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setManageError(error.message || "Khong tai duoc danh sach creator.");
      })
      .finally(() => {
        if (cancelled) return;
        setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, isAuthenticated, selectedCreatorId]);

  function onLoginFieldChange(event) {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  function onCreatorFieldChange(event) {
    const { name, value } = event.target;
    setCreatorForm((prev) => ({ ...prev, [name]: value }));
  }

  function onEditFieldChange(event) {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  function onSelectCreator(creator) {
    setSelectedCreatorId(creator._id);
    setEditForm(toEditForm(creator));
    setManageError("");
    setManageSuccess("");
  }

  async function onLoginSubmit(event) {
    event.preventDefault();
    setAuthError("");
    setCreateSuccess("");
    setManageSuccess("");
    setLoginLoading(true);

    try {
      const response = await adminLogin(loginForm.username.trim(), loginForm.password);
      const token = response.token || "";

      if (!token) {
        throw new Error("Khong nhan duoc token admin.");
      }

      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
      setAdminToken(token);
      setAdminUsername(response.username || loginForm.username.trim());
      setLoginForm({ username: "", password: "" });
    } catch (error) {
      setAuthError(error.message || "Dang nhap admin that bai.");
    } finally {
      setLoginLoading(false);
    }
  }

  function onLogout() {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    setAdminToken("");
    setAdminUsername("");
    setCreateSuccess("");
    setCreateError("");
    setManageSuccess("");
    setManageError("");
    setSearchInput("");
    setDebouncedSearch("");
    setSearchResults([]);
    setSelectedCreatorId("");
    setEditForm(defaultEditForm);
  }

  async function onCreateCreatorSubmit(event) {
    event.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setManageSuccess("");

    if (!canSubmitCreator) {
      setCreateError("Vui long nhap day du name, avatar URL va walletAddress hop le.");
      return;
    }

    setCreateLoading(true);
    try {
      const payload = {
        name: creatorForm.name.trim(),
        avatar: creatorForm.avatar.trim(),
        bio: creatorForm.bio.trim(),
        walletAddress: creatorForm.walletAddress.trim(),
      };
      const created = await createCreatorAsAdmin(payload, adminToken);
      setCreatorForm(defaultCreatorForm);
      setCreateSuccess(`Da them creator moi: ${created.name}`);
      setSearchResults((prev) => [created, ...prev]);
    } catch (error) {
      setCreateError(error.message || "Khong the tao creator moi.");
    } finally {
      setCreateLoading(false);
    }
  }

  async function onUpdateCreatorSubmit(event) {
    event.preventDefault();
    setManageError("");
    setManageSuccess("");

    if (!selectedCreator) {
      setManageError("Vui long chon creator can chinh sua.");
      return;
    }

    if (!canSubmitEdit) {
      setManageError("Thong tin sua chua hop le.");
      return;
    }

    setEditLoading(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        avatar: editForm.avatar.trim(),
        bio: editForm.bio.trim(),
        walletAddress: editForm.walletAddress.trim(),
      };
      const updated = await updateCreatorAsAdmin(selectedCreator._id, payload, adminToken);
      setSearchResults((prev) =>
        prev.map((creator) => (creator._id === updated._id ? updated : creator))
      );
      setEditForm(toEditForm(updated));
      setManageSuccess(`Da cap nhat creator: ${updated.name}`);
    } catch (error) {
      setManageError(error.message || "Khong the cap nhat creator.");
    } finally {
      setEditLoading(false);
    }
  }

  async function onDeleteCreator() {
    if (!selectedCreator) {
      setManageError("Vui long chon creator can xoa.");
      return;
    }

    const confirmed = window.confirm(
      `Ban co chac muon xoa creator "${selectedCreator.name}" khong?`
    );
    if (!confirmed) return;

    setDeleteLoading(true);
    setManageError("");
    setManageSuccess("");

    try {
      await deleteCreatorAsAdmin(selectedCreator._id, adminToken);
      setSearchResults((prev) =>
        prev.filter((creator) => creator._id !== selectedCreator._id)
      );
      setSelectedCreatorId("");
      setEditForm(defaultEditForm);
      setManageSuccess(`Da xoa creator: ${selectedCreator.name}`);
    } catch (error) {
      setManageError(error.message || "Khong the xoa creator.");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="admin-page">
        <section className="admin-card">
          <p>Dang kiem tra phien dang nhap admin...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-card">
        <div className="admin-top">
          <Link to="/" className="admin-back-link">
            Ve trang landing
          </Link>
          {isAuthenticated && (
            <button type="button" className="admin-logout-button" onClick={onLogout}>
              Dang xuat
            </button>
          )}
        </div>

        <h1>Trang Admin</h1>
        <p className="admin-subtitle">
          Dang nhap bang tai khoan admin de them, tim kiem, chinh sua va xoa creator.
        </p>

        {authError && <p className="admin-error">{authError}</p>}

        {!isAuthenticated ? (
          <form className="admin-form" onSubmit={onLoginSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Tai khoan admin"
              value={loginForm.username}
              onChange={onLoginFieldChange}
              autoComplete="username"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Mat khau admin"
              value={loginForm.password}
              onChange={onLoginFieldChange}
              autoComplete="current-password"
              required
            />
            <button type="submit" disabled={loginLoading}>
              {loginLoading ? "Dang dang nhap..." : "Dang nhap admin"}
            </button>
          </form>
        ) : (
          <div className="admin-sections">
            <p className="admin-welcome">
              Dang dang nhap voi tai khoan: <strong>{adminUsername || "admin"}</strong>
            </p>

            <section className="admin-section">
              <h2>Them Creator Moi</h2>
              <form className="admin-form" onSubmit={onCreateCreatorSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Ten creator"
                  value={creatorForm.name}
                  onChange={onCreatorFieldChange}
                  required
                />
                <input
                  type="url"
                  name="avatar"
                  placeholder="Avatar URL"
                  value={creatorForm.avatar}
                  onChange={onCreatorFieldChange}
                  required
                />
                <textarea
                  rows={4}
                  name="bio"
                  placeholder="Mo ta ngan (khong bat buoc)"
                  value={creatorForm.bio}
                  onChange={onCreatorFieldChange}
                />
                <input
                  type="text"
                  name="walletAddress"
                  placeholder="Vi ETH creator (0x...)"
                  value={creatorForm.walletAddress}
                  onChange={onCreatorFieldChange}
                  required
                />
                {createError && <p className="admin-error">{createError}</p>}
                {createSuccess && <p className="admin-success">{createSuccess}</p>}
                <button type="submit" disabled={!canSubmitCreator || createLoading}>
                  {createLoading ? "Dang tao creator..." : "Them creator"}
                </button>
              </form>
            </section>

            <section className="admin-section">
              <h2>Quan Ly Creator</h2>
              <div className="admin-search-box">
                <input
                  type="text"
                  placeholder="Tim creator theo ten..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>

              {searchLoading ? (
                <p className="admin-muted">Dang tai creator...</p>
              ) : searchResults.length === 0 ? (
                <p className="admin-muted">Khong co creator phu hop.</p>
              ) : (
                <ul className="admin-search-results">
                  {searchResults.map((creator) => (
                    <li key={creator._id}>
                      <button
                        type="button"
                        className={creator._id === selectedCreatorId ? "is-active" : ""}
                        onClick={() => onSelectCreator(creator)}
                      >
                        <img src={creator.avatar} alt={creator.name} />
                        <div>
                          <strong>{creator.name}</strong>
                          <span>{creator.walletAddress}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {manageError && <p className="admin-error">{manageError}</p>}
              {manageSuccess && <p className="admin-success">{manageSuccess}</p>}

              {selectedCreator && (
                <form className="admin-form admin-edit-form" onSubmit={onUpdateCreatorSubmit}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ten creator"
                    value={editForm.name}
                    onChange={onEditFieldChange}
                    required
                  />
                  <input
                    type="url"
                    name="avatar"
                    placeholder="Avatar URL"
                    value={editForm.avatar}
                    onChange={onEditFieldChange}
                    required
                  />
                  <textarea
                    rows={4}
                    name="bio"
                    placeholder="Mo ta ngan"
                    value={editForm.bio}
                    onChange={onEditFieldChange}
                  />
                  <input
                    type="text"
                    name="walletAddress"
                    placeholder="Vi ETH creator (0x...)"
                    value={editForm.walletAddress}
                    onChange={onEditFieldChange}
                    required
                  />
                  <button type="submit" disabled={!canSubmitEdit || editLoading}>
                    {editLoading ? "Dang cap nhat..." : "Luu chinh sua"}
                  </button>
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={onDeleteCreator}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Dang xoa..." : "Xoa creator"}
                  </button>
                </form>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
