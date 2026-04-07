import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCreators } from "../api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import "./LandingPage.css";

const PAGE_SIZE = 18;

function useColumnCount() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (width >= 1536) return 6;
  if (width >= 1280) return 5;
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  return 2;
}

export function LandingPage() {
  const navigate = useNavigate();
  const columnCount = useColumnCount();
  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(0);
  const initializedRef = useRef(false);

  const [creators, setCreators] = useState([]);
  const [, setPage] = useState(0);
  const [, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadCreators = useCallback(async (nextPage) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (nextPage === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      setError("");
      const response = await getCreators({
        page: nextPage,
        limit: PAGE_SIZE,
      });
      setCreators((prev) => {
        if (nextPage === 1) {
          return response.data;
        }

        const map = new Map(prev.map((item) => [item._id, item]));
        for (const creator of response.data) {
          map.set(creator._id, creator);
        }
        return Array.from(map.values());
      });
      const nextHasMore = Boolean(response.meta?.hasMore);
      setHasMore(nextHasMore);
      hasMoreRef.current = nextHasMore;
      setPage(nextPage);
      pageRef.current = nextPage;
    } catch (requestError) {
      setError(requestError.message || "Khong the tai danh sach creator.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    loadCreators(1);
  }, [loadCreators]);

  useEffect(() => {
    if (!debouncedSearch) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      return;
    }

    let isCancelled = false;
    setSearchLoading(true);
    setSearchError("");

    getCreators({ page: 1, limit: 40, search: debouncedSearch })
      .then((response) => {
        if (isCancelled) return;
        setSearchResults(response.data || []);
      })
      .catch((requestError) => {
        if (isCancelled) return;
        setSearchError(requestError.message || "Khong tim kiem duoc creator.");
      })
      .finally(() => {
        if (isCancelled) return;
        setSearchLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (!sentinelRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (!hasMoreRef.current || isFetchingRef.current) return;

        if (pageRef.current >= 1) {
          loadCreators(pageRef.current + 1);
        }
      },
      { threshold: 0.1, rootMargin: "200px 0px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadCreators]);

  const columns = useMemo(() => {
    const result = Array.from({ length: columnCount }, () => []);
    creators.forEach((creator, index) => {
      result[index % columnCount].push(creator);
    });
    return result;
  }, [columnCount, creators]);

  if (loading && creators.length === 0) {
    return (
      <main className="landing-page">
        <LoadingSpinner label="Dang tai creators..." />
      </main>
    );
  }

  return (
    <main className="landing-page">
      <div className="landing-backdrop" />

      <section className="landing-content">
        <p className="landing-kicker">Buy Me A Coffee</p>
        <h1>Hon 1,000+ nha sang tao hang dau dang tham gia</h1>

        {error ? (
          <div className="landing-error">
            <p>{error}</p>
            <button type="button" onClick={() => loadCreators(1)}>
              Thu lai
            </button>
          </div>
        ) : (
          <>
            <section className="landing-search-area">
              <div className="landing-search">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Tim creator de donate... (VD: H, Hi, Him)"
                />
                {searchInput && (
                  <button type="button" onClick={() => setSearchInput("")}>
                    Xoa
                  </button>
                )}
              </div>

              {debouncedSearch && (
                <section className="search-result-panel">
                  <h2>Ket qua tim kiem</h2>
                  {searchLoading ? (
                    <p>Dang tim creator...</p>
                  ) : searchError ? (
                    <p>{searchError}</p>
                  ) : searchResults.length === 0 ? (
                    <p>Khong co creator bat dau bang "{debouncedSearch}".</p>
                  ) : (
                    <ul>
                      {searchResults.map((creator) => (
                        <li key={creator._id}>
                          <button
                            type="button"
                            onClick={() => navigate(`/creator/${creator._id}`)}
                          >
                            <img src={creator.avatar} alt={creator.name} loading="lazy" />
                            <div>
                              <strong>{creator.name}</strong>
                              <span>{creator.followersCount} theo doi</span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </section>

            <div className="creator-grid">
              {columns.map((column, columnIndex) => {
                const baseList =
                  column.length > 0 ? column : creators.slice(0, Math.min(6, creators.length));
                const loopList = [...baseList, ...baseList];
                const isUpward = columnIndex % 2 === 0;

                return (
                  <div key={`column-${columnIndex}`} className="creator-column">
                    <div className={`creator-track ${isUpward ? "track-up" : "track-down"}`}>
                      {loopList.map((creator, cardIndex) => (
                        <button
                          key={`${creator._id}-${cardIndex}`}
                          type="button"
                          className="creator-button"
                          onClick={() => navigate(`/creator/${creator._id}`)}
                        >
                          <img src={creator.avatar} alt={creator.name} loading="lazy" />
                          <div>
                            <h3>{creator.name}</h3>
                            <p>{creator.followersCount} theo doi</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        <div ref={sentinelRef} className="landing-sentinel" />
        {loadingMore && <LoadingSpinner label="Dang tai them creators..." />}

        <section className="quick-donate-cta">
          <h2>Creator chua dang ky?</h2>
          <p>
            Ban van co the donate truc tiep bang cach nhap dia chi vi nguoi nhan.
          </p>
          <button type="button" onClick={() => navigate("/quick-donate")}>
            Donate den dia chi bat ky
          </button>
        </section>
      </section>
    </main>
  );
}
