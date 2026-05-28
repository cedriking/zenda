import { ENCRYPTION_KEY } from "../config/env.js";

const ALGORITHM = "AES-GCM";
const _KEY_LENGTH = 256;
const IV_LENGTH = 12;
const TAG_LENGTH = 128;

function getKey(): ArrayBuffer {
  const hex = ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes)"
    );
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer;
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a JSON string with base64-encoded iv, ciphertext, and tag.
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    getKey(),
    { name: ALGORITHM },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const result = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    encoded
  );

  // result contains ciphertext + tag concatenated
  const resultBytes = new Uint8Array(result);
  const ciphertext = resultBytes.slice(0, resultBytes.length - TAG_LENGTH / 8);
  const tag = resultBytes.slice(resultBytes.length - TAG_LENGTH / 8);

  return JSON.stringify({
    iv: Buffer.from(iv).toString("base64"),
    ct: Buffer.from(ciphertext).toString("base64"),
    tag: Buffer.from(tag).toString("base64"),
  });
}

/**
 * Decrypt a JSON string produced by encrypt().
 * Returns the original plaintext.
 */
export async function decrypt(ciphertext: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    getKey(),
    { name: ALGORITHM },
    false,
    ["decrypt"]
  );

  const { iv, ct, tag } = JSON.parse(ciphertext) as {
    iv: string;
    ct: string;
    tag: string;
  };

  const ivBytes = Uint8Array.from(Buffer.from(iv, "base64"));
  const ctBytes = Uint8Array.from(Buffer.from(ct, "base64"));
  const tagBytes = Uint8Array.from(Buffer.from(tag, "base64"));

  // Combine ciphertext + tag for decryption
  const combined = new Uint8Array(ctBytes.length + tagBytes.length);
  combined.set(ctBytes);
  combined.set(tagBytes, ctBytes.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: ivBytes, tagLength: TAG_LENGTH },
    key,
    combined
  );

  return new TextDecoder().decode(decrypted);
}
