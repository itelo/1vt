import React, { useEffect } from "react";
import { Box, Text } from "ink";
import { useVaultStore } from "../stores/vault-store.js";
import { useAppStore } from "../stores/app-store.js";
import { ListView } from "../components/list-view.js";
import { LoadingView } from "../components/loading-view.js";
import { Footer } from "../components/footer.js";
import type { Vault } from "../lib/types.js";
import { padRight, truncate } from "../lib/format.js";

export function VaultListScreen() {
  const vaults = useVaultStore((s) => s.vaults);
  const loading = useVaultStore((s) => s.loading);
  const error = useVaultStore((s) => s.error);
  const fetchVaults = useVaultStore((s) => s.fetchVaults);
  const push = useAppStore((s) => s.push);

  const hasVaults = vaults.length > 0;
  useEffect(() => {
    if (!hasVaults) fetchVaults();
  }, [hasVaults, fetchVaults]);

  if (loading && vaults.length === 0) {
    return (
      <>
        <LoadingView label="Loading vaults..." />
        <Footer hints="q:quit" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Box flexGrow={1} justifyContent="center" alignItems="center">
          <Text color="red">{error}</Text>
        </Box>
        <Footer hints="q:quit  R:retry" />
      </>
    );
  }

  return (
    <ListView<Vault>
      items={vaults}
      onSelect={(vault) => {
        push({ type: "item-list", vaultId: vault.id, vaultName: vault.name });
      }}
      filterFn={(vault, query) =>
        vault.name.toLowerCase().includes(query.toLowerCase())
      }
      emptyMessage="No vaults found"
      footerHints="j/k:nav  enter:open  /:search  q:quit  Q:quit all"
      renderItem={(vault, isSelected, width) => (
        <Box>
          <Text color={isSelected ? "cyan" : undefined} bold={isSelected}>
            {isSelected ? "> " : "  "}
          </Text>
          <Text bold={isSelected}>
            {padRight(truncate(vault.name, width - 16), width - 16)}
          </Text>
          {vault.items !== undefined && (
            <Text dimColor> {vault.items}</Text>
          )}
        </Box>
      )}
    />
  );
}
