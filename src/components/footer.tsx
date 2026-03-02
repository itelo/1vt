import React from "react";
import { Box, Text } from "ink";
import { useUiStore } from "../stores/ui-store.js";
import { SearchInput } from "./search-input.js";

interface FooterProps {
  hints?: string;
  cursorLine?: number;
  totalLines?: number;
}

export function Footer({ hints = "", cursorLine, totalLines }: FooterProps) {
  const mode = useUiStore((s) => s.mode);
  const keyBuffer = useUiStore((s) => s.keyBuffer);
  const statusMessage = useUiStore((s) => s.statusMessage);
  const statusType = useUiStore((s) => s.statusType);

  const statusColor =
    statusType === "error" ? "red" : statusType === "success" ? "green" : "yellow";

  // Mode colors like nvim: NORMAL=green, SEARCH=yellow
  const modeColor = mode === "search" ? "yellow" : "green";
  const modeLabel = mode === "normal" ? " NORMAL " : " SEARCH ";

  // Position indicator like nvim: "12/48  25%"  or "Top" / "Bot" / "All"
  let positionText = "";
  if (cursorLine !== undefined && totalLines !== undefined && totalLines > 0) {
    const pct = Math.round(((cursorLine + 1) / totalLines) * 100);
    let pctLabel: string;
    if (totalLines <= 1) pctLabel = "All";
    else if (cursorLine === 0) pctLabel = "Top";
    else if (cursorLine === totalLines - 1) pctLabel = "Bot";
    else pctLabel = `${pct}%`;
    positionText = `${cursorLine + 1}:${totalLines}  ${pctLabel}`;
  }

  return (
    <Box flexDirection="column">
      {mode === "search" && <SearchInput />}
      {/* Statusline row 1: mode + hints/status */}
      <Box
        borderStyle="single"
        borderTop={true}
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
        paddingX={1}
        justifyContent="space-between"
      >
        <Box gap={1}>
          <Text bold inverse color={modeColor}>
            {modeLabel}
          </Text>
          {hints && <Text dimColor>{hints}</Text>}
        </Box>
        <Box gap={2}>
          {statusMessage && (
            <Text color={statusColor}>{statusMessage}</Text>
          )}
          {keyBuffer && (
            <Text color="magenta" bold>{keyBuffer}</Text>
          )}
          {positionText && (
            <Text dimColor>{positionText}</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}
