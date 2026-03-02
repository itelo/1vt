import React from "react";
import { Box } from "ink";
import { Header } from "./header.js";

export function ScreenLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box flexDirection="column" flexGrow={1}>
      <Header />
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {children}
      </Box>
    </Box>
  );
}
