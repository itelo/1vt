import React, { useCallback, useEffect, useState } from "react";
import { Box, Text, useInput, useStdout } from "ink";
import { spawnSync } from "node:child_process";
import { op } from "../services/op.js";
import { useAppStore } from "../stores/app-store.js";
import { useVaultStore } from "../stores/vault-store.js";
import { LoadingView } from "../components/loading-view.js";
import { Footer } from "../components/footer.js";

export function AuthScreen() {
  const push = useAppStore((s) => s.push);
  const fetchVaults = useVaultStore((s) => s.fetchVaults);
  const { stdout } = useStdout();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    setChecking(true);
    setError(null);
    const user = await op.whoami();
    if (user) {
      fetchVaults();
      push({ type: "vault-list" });
    } else {
      setError("Not signed in to 1Password");
      setChecking(false);
    }
  }, [push, fetchVaults]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useInput(
    (input) => {
      if (input === "s" && error) {
        // Temporarily leave fullscreen TUI so op signin can use the terminal
        stdout.write("\x1b[?25h"); // Show cursor
        stdout.write("\x1b[?1049l"); // Leave alternate buffer

        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }

        // Run op signin interactively — blocks until complete
        spawnSync("op", ["signin"], { stdio: "inherit" });

        // Restore terminal state
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(true);
        }
        stdout.write("\x1b[?1049h"); // Re-enter alternate buffer
        stdout.write("\x1b[?25l"); // Hide cursor

        // Retry auth
        checkAuth();
      }
    },
    { isActive: !checking },
  );

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
      <Box
        flexDirection="column"
        flexGrow={1}
        justifyContent="center"
        alignItems="center"
        gap={1}
      >
        <Text color="red" bold>
          {error}
        </Text>
        <Text> </Text>
        <Text>Make sure the 1Password desktop app is running with</Text>
        <Text>CLI integration enabled in Settings &gt; Developer.</Text>
        <Text> </Text>
        <Text dimColor>
          Press <Text color="cyan" bold>s</Text> to sign in, or run manually:
        </Text>
        <Text color="cyan" bold>
          eval $(op signin)
        </Text>
      </Box>
      <Footer hints="s:sign in  q:quit" />
    </>
  );
}
