import React from "react";
import { Box, Text, useInput } from "ink";
import { useUiStore } from "../stores/ui-store.js";

export function SearchInput() {
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);
  const finishSearch = useUiStore((s) => s.finishSearch);
  const clearSearch = useUiStore((s) => s.clearSearch);
  const mode = useUiStore((s) => s.mode);

  useInput(
    (input, key) => {
      if (key.return) {
        // Enter = accept search, keep filter, go back to normal
        finishSearch();
      } else if (key.escape) {
        // Escape = cancel search, clear filter
        clearSearch();
      } else if (key.backspace || key.delete) {
        setSearchQuery(searchQuery.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        setSearchQuery(searchQuery + input);
      }
    },
    { isActive: mode === "search" },
  );

  return (
    <Box paddingX={1}>
      <Text color="yellow">/</Text>
      <Text>{searchQuery}</Text>
      <Text color="gray">|</Text>
    </Box>
  );
}
