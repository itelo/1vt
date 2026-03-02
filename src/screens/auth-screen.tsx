import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { op } from "../services/op.js";
import { useAppStore } from "../stores/app-store.js";
import { useVaultStore } from "../stores/vault-store.js";
import { LoadingView } from "../components/loading-view.js";
import { Footer } from "../components/footer.js";

export function AuthScreen() {
  const push = useAppStore((s) => s.push);
  const fetchVaults = useVaultStore((s) => s.fetchVaults);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await op.whoami();
      if (user) {
        // Start loading vaults eagerly so they're ready when screen renders
        fetchVaults();
        push({ type: "vault-list" });
      } else {
        setError("Not signed in to 1Password");
        setChecking(false);
      }
    })();
  }, [push, fetchVaults]);

  if (checking) {
    return (
      <>
        <LoadingView label="Checking authentication..." />
        <Footer hints="q:quit" />
      </>
    );
  }

  return (
    <>
      <Box flexDirection="column" flexGrow={1} justifyContent="center" alignItems="center" gap={1}>
        <Text color="red" bold>
          {error}
        </Text>
        <Text> </Text>
        <Text>Make sure the 1Password desktop app is running with</Text>
        <Text>CLI integration enabled in Settings &gt; Developer.</Text>
        <Text> </Text>
        <Text dimColor>Or run: </Text>
        <Text color="cyan" bold>
          eval $(op signin)
        </Text>
        <Text> </Text>
        <Text dimColor>Then restart itui.</Text>
      </Box>
      <Footer hints="q:quit" />
    </>
  );
}
