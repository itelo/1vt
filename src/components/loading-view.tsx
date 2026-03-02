import React from "react";
import { Box, Text } from "ink";
import { Spinner } from "@inkjs/ui";

interface LoadingViewProps {
  label?: string;
}

export function LoadingView({ label = "Loading..." }: LoadingViewProps) {
  return (
    <Box flexGrow={1} justifyContent="center" alignItems="center">
      <Spinner label={label} />
    </Box>
  );
}
