import React, { useState, useEffect } from "react";
import { Box, useStdout } from "ink";

function useAlternateScreen() {
  const { stdout } = useStdout();

  useEffect(() => {
    stdout.write("\x1b[?1049h"); // Enter alternate buffer
    stdout.write("\x1b[?25l"); // Hide cursor

    return () => {
      stdout.write("\x1b[?25h"); // Show cursor
      stdout.write("\x1b[?1049l"); // Leave alternate buffer
    };
  }, [stdout]);
}

function useTerminalSize() {
  const { stdout } = useStdout();
  const [size, setSize] = useState({
    columns: stdout.columns || 80,
    rows: stdout.rows || 24,
  });

  useEffect(() => {
    const onResize = () => {
      setSize({ columns: stdout.columns || 80, rows: stdout.rows || 24 });
    };
    stdout.on("resize", onResize);
    return () => {
      stdout.off("resize", onResize);
    };
  }, [stdout]);

  return size;
}

export function FullScreen({ children }: { children: React.ReactNode }) {
  useAlternateScreen();
  const { columns, rows } = useTerminalSize();

  return (
    <Box width={columns} height={rows} flexDirection="column">
      {children}
    </Box>
  );
}

export { useTerminalSize };
