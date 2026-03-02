import React from "react";
import { useInput, useApp } from "ink";
import { FullScreen } from "./components/fullscreen.js";
import { ScreenLayout } from "./components/screen-layout.js";
import { AuthScreen } from "./screens/auth-screen.js";
import { VaultListScreen } from "./screens/vault-list-screen.js";
import { ItemListScreen } from "./screens/item-list-screen.js";
import { ItemDetailScreen } from "./screens/item-detail-screen.js";
import { useAppStore, selectCurrentScreen } from "./stores/app-store.js";
import { useUiStore } from "./stores/ui-store.js";
import { useVaultStore } from "./stores/vault-store.js";

export function App() {
  const { exit } = useApp();
  const screen = useAppStore(selectCurrentScreen);
  const pop = useAppStore((s) => s.pop);
  const mode = useUiStore((s) => s.mode);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setMode = useUiStore((s) => s.setMode);
  const clearSearch = useUiStore((s) => s.clearSearch);
  const showStatus = useUiStore((s) => s.showStatus);
  const invalidate = useVaultStore((s) => s.invalidate);

  useInput(
    (input, key) => {
      if (key.ctrl && input === "c") {
        exit();
        return;
      }

      // Search mode is fully handled by SearchInput component
      if (mode === "search") return;

      // Q = quit all (force exit from any screen)
      if (input === "Q") {
        exit();
        return;
      }

      // c = clear search filter
      if (input === "c" && searchQuery) {
        clearSearch();
        return;
      }

      if (input === "q" || key.escape) {
        if (screen.type === "vault-list" || screen.type === "auth") {
          exit();
        } else {
          pop();
        }
        return;
      }

      if (input === "/") {
        setMode("search");
        return;
      }

      if (input === "R") {
        invalidate();
        showStatus("Cache cleared \u2014 refreshing...", "info");
      }
    },
    { isActive: true },
  );

  const renderScreen = () => {
    switch (screen.type) {
      case "auth":
        return <AuthScreen />;
      case "vault-list":
        return <VaultListScreen />;
      case "item-list":
        return (
          <ItemListScreen
            vaultId={screen.vaultId}
            vaultName={screen.vaultName}
          />
        );
      case "item-detail":
        return (
          <ItemDetailScreen
            itemId={screen.itemId}
            vaultId={screen.vaultId}
          />
        );
    }
  };

  return (
    <FullScreen>
      <ScreenLayout>{renderScreen()}</ScreenLayout>
    </FullScreen>
  );
}
