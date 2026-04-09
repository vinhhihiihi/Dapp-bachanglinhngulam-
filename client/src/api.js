const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function parseResponse(response) {
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  return parseResponse(response);
}

export async function getCreators({ page = 1, limit = 18, search = "" } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  return request(`/creators?${params.toString()}`);
}

export async function getCreator(id) {
  return request(`/creators/${id}`);
}

export async function createCreator(payload) {
  return request("/creators", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createCreatorAsAdmin(payload, token) {
  return request("/creators", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateCreatorAsAdmin(id, payload, token) {
  return request(`/creators/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteCreatorAsAdmin(id, token) {
  return request(`/creators/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function adminLogin(username, password) {
  return request("/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getAdminSession(token) {
  return request("/admin/session", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getFollowStatus(creatorId, followerAddress) {
  return request(
    `/follow/${creatorId}?followerAddress=${encodeURIComponent(followerAddress || "")}`
  );
}

export async function followCreator(creatorId, followerAddress) {
  return request(`/follow/${creatorId}`, {
    method: "POST",
    body: JSON.stringify({ followerAddress }),
  });
}

export async function unfollowCreator(creatorId, followerAddress) {
  return request(`/follow/${creatorId}`, {
    method: "DELETE",
    body: JSON.stringify({ followerAddress }),
  });
}

export async function donateToCreator(payload) {
  return request("/donate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getDonations(creatorId, limit = 20) {
  return request(`/donations/${creatorId}?limit=${limit}`);
}
