import React, { useMemo } from "react";
import { Box, Text } from "ink";
import { useVimNavigation } from "../hooks/use-vim-navigation.js";
import { useUiStore } from "../stores/ui-store.js";
import { useTerminalSize } from "./fullscreen.js";
import { Footer } from "./footer.js";

interface ListViewProps<T> {
  items: T[];
  renderItem: (item: T, isSelected: boolean, width: number) => React.ReactNode;
  onSelect: (item: T, index: number) => void;
  filterFn?: (item: T, query: string) => boolean;
  emptyMessage?: string;
  footerHints?: string;
  headerHeight?: number;
  footerHeight?: number;
}

export function ListView<T>({
  items,
  renderItem,
  onSelect,
  filterFn,
  emptyMessage = "No items",
  footerHints = "",
  headerHeight = 3,
  footerHeight = 3,
}: ListViewProps<T>) {
  const searchQuery = useUiStore((s) => s.searchQuery);
  const { rows, columns } = useTerminalSize();

  const filteredItems = useMemo(() => {
    if (!searchQuery || !filterFn) return items;
    return items.filter((item) => filterFn(item, searchQuery));
  }, [items, searchQuery, filterFn]);

  const viewportHeight = Math.max(1, rows - headerHeight - footerHeight);

  const { selectedIndex, visibleItems } = useVimNavigation({
    totalItems: filteredItems.length,
    viewportHeight,
    onSelect: (index) => {
      const item = filteredItems[index];
      if (item) onSelect(item, index);
    },
  });

  if (filteredItems.length === 0) {
    return (
      <>
        <Box flexDirection="column" flexGrow={1} justifyContent="center" alignItems="center">
          <Text dimColor>{emptyMessage}</Text>
        </Box>
        <Footer hints={footerHints} />
      </>
    );
  }

  const visible = filteredItems.slice(visibleItems.start, visibleItems.end);
  const gutterWidth = Math.max(3, String(filteredItems.length).length + 1);
  const contentWidth = columns - gutterWidth - 1;

  return (
    <>
      <Box flexDirection="column" flexGrow={1}>
        {visible.map((item, i) => {
          const actualIndex = visibleItems.start + i;
          const isSelected = actualIndex === selectedIndex;
          const relativeDistance = Math.abs(actualIndex - selectedIndex);
          const lineNum = isSelected
            ? String(actualIndex + 1)
            : String(relativeDistance);

          return (
            <Box key={actualIndex}>
              <Text
                color={isSelected ? "yellow" : undefined}
                dimColor={!isSelected}
              >
                {lineNum.padStart(gutterWidth, " ")}
              </Text>
              <Text dimColor> </Text>
              {renderItem(item, isSelected, contentWidth)}
            </Box>
          );
        })}
      </Box>
      <Footer
        hints={footerHints}
        cursorLine={selectedIndex}
        totalLines={filteredItems.length}
      />
    </>
  );
}
