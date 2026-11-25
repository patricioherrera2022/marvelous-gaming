export const ADMIN_COOKIE_NAME = "mg_admin_session";
export const ADMIN_PATH = "/adminfacu";

export interface AdminSessionPayload {
  email: string;
  mode: "supabase" | "local";
  exp: number;
}

export function getAllowedAdminEmails(): string[] {
  const raw =
    process.env.ADMIN_ALLOWED_EMAILS ||
    "facu@marvelousgaming.com,admin@marvelousgaming.com";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string): boolean {
  const allowed = getAllowedAdminEmails();
  return allowed.includes(email.trim().toLowerCase());
}

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    "marvelous-gaming-dev-session-secret-change-me"
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    "raw",
    enc,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signAdminSession(
  payload: Omit<AdminSessionPayload, "exp">,
  ttlSeconds = 60 * 60 * 24 * 7
): Promise<string> {
  const fullPayload: AdminSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = toBase64Url(
    new TextEncoder().encode(JSON.stringify(fullPayload))
  );
  const key = await importHmacKey(getSessionSecret());
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encoded)
  );
  const sig = toBase64Url(new Uint8Array(sigBuffer));
  return `${encoded}.${sig}`;
}

export async function verifyAdminSession(
  token: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  try {
    const key = await importHmacKey(getSessionSecret());
    const sigBytes = fromBase64Url(sig);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as BufferSource,
      new TextEncoder().encode(encoded)
    );
    if (!valid) return null;

    const jsonStr = new TextDecoder().decode(fromBase64Url(encoded));
    const parsed = JSON.parse(jsonStr) as AdminSessionPayload;
    if (!parsed.email || !parsed.exp) return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    if (!isEmailAllowed(parsed.email)) return null;
    return parsed;
  } catch {
    return null;
  }
}
