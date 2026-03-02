import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import type { Vault, Item } from "../lib/types.js";

const CACHE_DIR = path.join(os.homedir(), ".local", "share", "itui");
const VAULTS_FILE = path.join(CACHE_DIR, "vaults.enc");
const ITEMS_DIR = path.join(CACHE_DIR, "items");

const CACHE_TTL_MS = 60 * 60 * 1000;
const DIR_MODE = 0o700;
const FILE_MODE = 0o600;

const KEYCHAIN_ACCOUNT = "itui";
const KEYCHAIN_SERVICE = "itui-cache-key";
const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;

// ── Keychain-backed encryption key ──────────────────────────────

let _cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (_cachedKey) return _cachedKey;

  // Try to read key from macOS Keychain
  try {
    const hex = execFileSync("security", [
      "find-generic-password",
      "-a", KEYCHAIN_ACCOUNT,
      "-s", KEYCHAIN_SERVICE,
      "-w",
    ], { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
    _cachedKey = Buffer.from(hex, "hex");
    return _cachedKey;
  } catch {
    // Key doesn't exist yet — generate and store it
  }

  const key = crypto.randomBytes(32);
  execFileSync("security", [
    "add-generic-password",
    "-a", KEYCHAIN_ACCOUNT,
    "-s", KEYCHAIN_SERVICE,
    "-w", key.toString("hex"),
    "-U", // update if exists
  ], { stdio: ["pipe", "pipe", "pipe"] });

  _cachedKey = key;
  return key;
}

// ── Encrypt / Decrypt ───────────────────────────────────────────

function encrypt(data: string): Buffer {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(data, "utf-8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Layout: [iv 12B][tag 16B][ciphertext ...]
  return Buffer.concat([iv, tag, encrypted]);
}

function decrypt(buf: Buffer): string {
  const key = getKey();
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ciphertext = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf-8");
}

// ── Cache read/write ────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: DIR_MODE });
  } else {
    fs.chmodSync(dir, DIR_MODE);
  }
}

function readCache<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath);
    const json = decrypt(raw);
    const entry: CacheEntry<T> = JSON.parse(json);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache<T>(filePath: string, data: T) {
  ensureDir(path.dirname(filePath));
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  const encrypted = encrypt(JSON.stringify(entry));
  fs.writeFileSync(filePath, encrypted, { mode: FILE_MODE });
}

function itemsFile(vaultId: string): string {
  return path.join(ITEMS_DIR, `${vaultId}.enc`);
}

export const cache = {
  getVaults(): Vault[] | null {
    return readCache<Vault[]>(VAULTS_FILE);
  },

  setVaults(vaults: Vault[]) {
    writeCache(VAULTS_FILE, vaults);
  },

  getItems(vaultId: string): Item[] | null {
    return readCache<Item[]>(itemsFile(vaultId));
  },

  setItems(vaultId: string, items: Item[]) {
    writeCache(itemsFile(vaultId), items);
  },

  clear() {
    try {
      fs.rmSync(CACHE_DIR, { recursive: true, force: true });
    } catch {
      // ignore
    }
  },
};
