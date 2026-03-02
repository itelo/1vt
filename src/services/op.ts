import { execa } from "execa";
import type { Vault, Item, ItemDetail, WhoAmI } from "../lib/types.js";

class OpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpError";
  }
}

function parseError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    // op CLI errors look like: [ERROR] 2024/01/01 12:00:00 message
    const match = msg.match(/\[ERROR\].*?\d{2}:\d{2}:\d{2}\s+(.*)/);
    if (match) return match[1]!;
    return msg;
  }
  return String(error);
}

async function exec<T>(args: string[]): Promise<T> {
  try {
    const { stdout } = await execa("op", [...args, "--format", "json"]);
    if (!stdout.trim()) return [] as unknown as T;
    return JSON.parse(stdout) as T;
  } catch (error) {
    throw new OpError(parseError(error));
  }
}

async function execRaw(args: string[]): Promise<string> {
  try {
    const { stdout } = await execa("op", args);
    return stdout.trim();
  } catch (error) {
    throw new OpError(parseError(error));
  }
}

export const op = {
  async whoami(): Promise<WhoAmI | null> {
    try {
      return await exec<WhoAmI>(["whoami"]);
    } catch {
      return null;
    }
  },

  async listVaults(): Promise<Vault[]> {
    return exec<Vault[]>(["vault", "list"]);
  },

  async listItems(vaultId: string): Promise<Item[]> {
    return exec<Item[]>(["item", "list", "--vault", vaultId]);
  },

  async getItem(itemId: string, vaultId?: string): Promise<ItemDetail> {
    const args = ["item", "get", itemId];
    if (vaultId) args.push("--vault", vaultId);
    return exec<ItemDetail>(args);
  },

  async getOtp(itemId: string, vaultId?: string): Promise<string> {
    const args = ["item", "get", itemId, "--otp"];
    if (vaultId) args.push("--vault", vaultId);
    return execRaw(args);
  },
};
