import { create } from "zustand";
import type { Vault, Item, ItemDetail } from "../lib/types.js";
import { op } from "../services/op.js";
import { cache } from "../services/cache.js";

const EMPTY_ITEMS: Item[] = [];

interface VaultState {
  vaults: Vault[];
  itemsByVault: Record<string, Item[]>;
  itemDetailCache: Record<string, ItemDetail>;
  loading: boolean;
  error: string | null;

  fetchVaults: () => Promise<void>;
  fetchItems: (vaultId: string) => Promise<void>;
  fetchItemDetail: (itemId: string, vaultId?: string) => Promise<void>;
  refreshVaults: () => Promise<void>;
  refreshItems: (vaultId: string) => Promise<void>;
  invalidate: () => void;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  vaults: [],
  itemsByVault: {},
  itemDetailCache: {},
  loading: false,
  error: null,

  fetchVaults: async () => {
    if (get().vaults.length > 0) return;

    // Try cache first — instant render
    const cached = cache.getVaults();
    if (cached) {
      set({ vaults: cached });
      // Refresh in background (no loading spinner)
      get().refreshVaults();
      return;
    }

    set({ loading: true, error: null });
    try {
      const vaults = await op.listVaults();
      cache.setVaults(vaults);
      set({ vaults, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  fetchItems: async (vaultId) => {
    if (get().itemsByVault[vaultId]) return;

    // Try cache first
    const cached = cache.getItems(vaultId);
    if (cached) {
      set((state) => ({
        itemsByVault: { ...state.itemsByVault, [vaultId]: cached },
      }));
      // Refresh in background
      get().refreshItems(vaultId);
      return;
    }

    set({ loading: true, error: null });
    try {
      const items = await op.listItems(vaultId);
      cache.setItems(vaultId, items);
      set((state) => ({
        itemsByVault: { ...state.itemsByVault, [vaultId]: items },
        loading: false,
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  // Item details are NOT cached — they contain secrets.
  // Only fetched live from op when the user opens an item.
  fetchItemDetail: async (itemId, vaultId) => {
    if (get().itemDetailCache[itemId]) return;
    set({ loading: true, error: null });
    try {
      const detail = await op.getItem(itemId, vaultId);
      set((state) => ({
        itemDetailCache: { ...state.itemDetailCache, [itemId]: detail },
        loading: false,
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  // Silent background refresh — updates cache + store without loading state
  refreshVaults: async () => {
    try {
      const vaults = await op.listVaults();
      cache.setVaults(vaults);
      set({ vaults });
    } catch {
      // silent — cached data is still showing
    }
  },

  refreshItems: async (vaultId) => {
    try {
      const items = await op.listItems(vaultId);
      cache.setItems(vaultId, items);
      set((state) => ({
        itemsByVault: { ...state.itemsByVault, [vaultId]: items },
      }));
    } catch {
      // silent
    }
  },

  invalidate: () => {
    cache.clear();
    set({ vaults: [], itemsByVault: {}, itemDetailCache: {} });
  },
}));

// Stable selectors
export function selectItems(vaultId: string) {
  return (state: VaultState): Item[] =>
    state.itemsByVault[vaultId] ?? EMPTY_ITEMS;
}

export function selectItemDetail(itemId: string) {
  return (state: VaultState): ItemDetail | undefined =>
    state.itemDetailCache[itemId];
}
