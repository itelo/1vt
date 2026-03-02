import { create } from "zustand";
import type { Mode } from "../lib/types.js";

interface UiState {
  mode: Mode;
  searchQuery: string;
  statusMessage: string | null;
  statusType: "success" | "error" | "info";
  keyBuffer: string; // Shows pending count/key combo like "12" or "g"

  setMode: (mode: Mode) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  finishSearch: () => void;
  setKeyBuffer: (buf: string) => void;
  appendKeyBuffer: (char: string) => void;
  clearKeyBuffer: () => void;
  showStatus: (message: string, type?: "success" | "error" | "info") => void;
  clearStatus: () => void;
}

let statusTimer: ReturnType<typeof setTimeout> | null = null;

export const useUiStore = create<UiState>((set, get) => ({
  mode: "normal",
  searchQuery: "",
  statusMessage: null,
  statusType: "info",
  keyBuffer: "",

  setMode: (mode) => set({ mode, keyBuffer: "" }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  clearSearch: () => set({ searchQuery: "", mode: "normal" }),

  // Enter in search = keep filter active, go back to normal
  finishSearch: () => set({ mode: "normal" }),

  setKeyBuffer: (buf) => set({ keyBuffer: buf }),
  appendKeyBuffer: (char) => set({ keyBuffer: get().keyBuffer + char }),
  clearKeyBuffer: () => set({ keyBuffer: "" }),

  showStatus: (message, type = "success") => {
    if (statusTimer) clearTimeout(statusTimer);
    set({ statusMessage: message, statusType: type });
    statusTimer = setTimeout(() => {
      set({ statusMessage: null });
      statusTimer = null;
    }, 2000);
  },

  clearStatus: () => {
    if (statusTimer) clearTimeout(statusTimer);
    set({ statusMessage: null });
  },
}));
