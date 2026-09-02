import crypto from "crypto";
import { nanoid } from "nanoid";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  if (!envKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL SECURITY CONFIGURATION ERROR: ENCRYPTION_KEY environment variable is required in production mode.");
    }
    // Development fallback key if not provided (32 bytes)
    return Buffer.from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", "hex");
  }

  if (envKey.length === 64) {
    return Buffer.from(envKey, "hex");
  }

  return crypto.createHash("sha256").update(envKey).digest();
}

/**
 * Encrypts sensitive string using AES-256-GCM authenticated encryption.
 * Output format: iv:authTag:encryptedData (hex encoded)
 */
export function encryptToken(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 */
export function decryptToken(encryptedPackage: string): string {
  const parts = encryptedPackage.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Generates a high-entropy API key with human-readable prefix.
 * Format: lmbr_live_<random_characters>
 */
export function generateApiKey(): { apiKey: string; apiKeyHash: string; apiKeyPrefix: string } {
  const randomPart = nanoid(24);
  const apiKey = `lmbr_live_${randomPart}`;
  const apiKeyPrefix = `lmbr_live_${randomPart.slice(0, 4)}...`;
  const apiKeyHash = hashApiKey(apiKey);

  return { apiKey, apiKeyHash, apiKeyPrefix };
}

/**
 * Hashes an API key using SHA-256 for secure database lookup.
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Sanitizes input values to prevent CSV / Google Sheets Formula Injection attacks.
 * Prepends a single quote if the string begins with risky characters (=, +, -, @, tab).
 */
export function sanitizeCellValue(val: unknown): string | number | boolean | null {
  if (val === null || val === undefined) {
    return null;
  }
  if (typeof val === "number" || typeof val === "boolean") {
    return val;
  }

  const str = String(val);
  const trimmed = str.trimStart();
  const riskyChars = ["=", "+", "-", "@", "\t", "\r", "|", "%"];

  if (riskyChars.some((char) => trimmed.startsWith(char))) {
    return `'${str}`;
  }

  return str;
}
