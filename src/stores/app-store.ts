import { create } from "zustand";
import type { Screen } from "../lib/types.js";

interface AppState {
  screenStack: Screen[];
  push: (screen: Screen) => void;
  pop: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  screenStack: [{ type: "auth" }],

  push: (screen) =>
    set((state) => ({ screenStack: [...state.screenStack, screen] })),

  pop: () =>
    set((state) => ({
      screenStack:
        state.screenStack.length > 1
          ? state.screenStack.slice(0, -1)
          : state.screenStack,
    })),
}));

// Derived selectors — use these instead of methods in the store
export function selectCurrentScreen(state: AppState): Screen {
  return state.screenStack[state.screenStack.length - 1]!;
}

