import crypto from "node:crypto";

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin123";
const DEFAULT_TOKEN_EXPIRY_SECONDS = 60 * 60 * 12;

function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME?.trim() || DEFAULT_ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const tokenSecret =
    process.env.ADMIN_TOKEN_SECRET ||
    process.env.JWT_SECRET ||
    "dev-admin-token-secret-change-me";
  const expiresInSeconds = Number.parseInt(
    process.env.ADMIN_TOKEN_EXPIRES_SECONDS ?? String(DEFAULT_TOKEN_EXPIRY_SECONDS),
    10
  );

  return {
    username,
    password,
    tokenSecret,
    expiresInSeconds:
      Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
        ? expiresInSeconds
        : DEFAULT_TOKEN_EXPIRY_SECONDS,
  };
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left ?? ""));
  const rightBuffer = Buffer.from(String(right ?? ""));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function base64urlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64urlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payloadPart, tokenSecret) {
  return crypto.createHmac("sha256", tokenSecret).update(payloadPart).digest("base64url");
}

export function authenticateAdminCredentials(username, password) {
  const config = getAdminConfig();
  return safeEqual(username?.trim(), config.username) && safeEqual(password, config.password);
}

export function issueAdminToken() {
  const config = getAdminConfig();
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    sub: config.username,
    iat: nowInSeconds,
    exp: nowInSeconds + config.expiresInSeconds,
  };
  const payloadPart = base64urlEncode(JSON.stringify(payload));
  const signaturePart = signPayload(payloadPart, config.tokenSecret);
  return `${payloadPart}.${signaturePart}`;
}

export function verifyAdminToken(token) {
  const config = getAdminConfig();
  const [payloadPart, signaturePart] = String(token || "").split(".");
  if (!payloadPart || !signaturePart) return null;

  const expectedSignature = signPayload(payloadPart, config.tokenSecret);
  if (!safeEqual(signaturePart, expectedSignature)) return null;

  try {
    const payload = JSON.parse(base64urlDecode(payloadPart));
    if (!payload?.sub || typeof payload?.exp !== "number") {
      return null;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowInSeconds) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getAdminAuthConfigForClient() {
  const config = getAdminConfig();
  return {
    username: config.username,
    expiresInSeconds: config.expiresInSeconds,
  };
}

export function requireAdminAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ message: "Missing admin token" });
  }

  const token = authorization.slice(7).trim();
  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired admin token" });
  }

  req.admin = { username: payload.sub };
  return next();
}
