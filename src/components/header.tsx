import React from "react";
import { Box, Text } from "ink";
import { useAppStore } from "../stores/app-store.js";
import { useShallow } from "zustand/react/shallow";
import type { Screen } from "../lib/types.js";

function buildBreadcrumbs(stack: Screen[]): string {
  const crumbs: string[] = ["1vp"];
  for (const screen of stack) {
    switch (screen.type) {
      case "vault-list":
        crumbs.push("Vaults");
        break;
      case "item-list":
        crumbs.push(screen.vaultName);
        break;
      case "item-detail":
        crumbs.push("...");
        break;
    }
  }
  return crumbs.join(" > ");
}

export function Header() {
  const screenStack = useAppStore(useShallow((s) => s.screenStack));
  const breadcrumb = buildBreadcrumbs(screenStack);

  return (
    <Box
      borderStyle="single"
      borderBottom={true}
      borderTop={false}
      borderLeft={false}
      borderRight={false}
      paddingX={1}
    >
      <Text bold color="cyan">
        {breadcrumb}
      </Text>
    </Box>
  );
}
