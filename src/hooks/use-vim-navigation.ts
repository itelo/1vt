import { useState, useCallback, useRef } from "react";
import { useInput } from "ink";
import { useUiStore } from "../stores/ui-store.js";

interface UseVimNavigationOptions {
  totalItems: number;
  viewportHeight: number;
  onSelect?: (index: number) => void;
  isActive?: boolean;
}

export function useVimNavigation({
  totalItems,
  viewportHeight,
  onSelect,
  isActive = true,
}: UseVimNavigationOptions) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const mode = useUiStore((s) => s.mode);
  const keyBuffer = useUiStore((s) => s.keyBuffer);
  const setKeyBuffer = useUiStore((s) => s.setKeyBuffer);
  const clearKeyBuffer = useUiStore((s) => s.clearKeyBuffer);
  const pendingG = useRef(false);

  const clamp = useCallback(
    (index: number) => Math.max(0, Math.min(totalItems - 1, index)),
    [totalItems],
  );

  const ensureVisible = useCallback(
    (index: number, currentOffset: number) => {
      if (index < currentOffset) return index;
      if (index >= currentOffset + viewportHeight)
        return index - viewportHeight + 1;
      return currentOffset;
    },
    [viewportHeight],
  );

  const moveTo = useCallback(
    (index: number) => {
      const clamped = clamp(index);
      setSelectedIndex(clamped);
      setScrollOffset((prev) => ensureVisible(clamped, prev));
    },
    [clamp, ensureVisible],
  );

  // Parse count from keyBuffer (e.g. "12" -> 12, "" -> 1)
  const consumeCount = useCallback((): number => {
    const num = keyBuffer.replace(/g$/, "");
    const count = num.length > 0 ? parseInt(num, 10) : 1;
    clearKeyBuffer();
    pendingG.current = false;
    return isNaN(count) ? 1 : count;
  }, [keyBuffer, clearKeyBuffer]);

  useInput(
    (input, key) => {
      if (mode !== "normal") return;
      if (totalItems === 0) return;

      // Digit accumulation (count prefix): 1-9 start, 0 appends
      if (/^[1-9]$/.test(input) || (input === "0" && keyBuffer.length > 0)) {
        setKeyBuffer(keyBuffer + input);
        return;
      }

      // gg = go to top
      if (input === "g") {
        if (pendingG.current) {
          // Second g -> gg
          consumeCount();
          moveTo(0);
          return;
        }
        pendingG.current = true;
        setKeyBuffer(keyBuffer + "g");
        return;
      }

      // If we had a pending g but next key isn't g, cancel it
      if (pendingG.current) {
        pendingG.current = false;
      }

      const count = consumeCount();

      if (input === "j" || key.downArrow) {
        moveTo(selectedIndex + count);
      } else if (input === "k" || key.upArrow) {
        moveTo(selectedIndex - count);
      } else if (input === "G") {
        // [count]G = go to line, G alone = go to last
        if (keyBuffer.length > 0 || count > 1) {
          moveTo(count - 1); // 1-indexed like vim
        } else {
          moveTo(totalItems - 1);
        }
      } else if (key.ctrl && input === "d") {
        moveTo(selectedIndex + Math.floor(viewportHeight / 2) * count);
      } else if (key.ctrl && input === "u") {
        moveTo(selectedIndex - Math.floor(viewportHeight / 2) * count);
      } else if (input === "H") {
        // Screen top
        moveTo(scrollOffset);
      } else if (input === "M") {
        // Screen middle
        const visibleEnd = Math.min(scrollOffset + viewportHeight, totalItems);
        moveTo(scrollOffset + Math.floor((visibleEnd - scrollOffset) / 2));
      } else if (input === "L") {
        // Screen bottom
        moveTo(Math.min(scrollOffset + viewportHeight - 1, totalItems - 1));
      } else if (key.return && onSelect) {
        onSelect(selectedIndex);
      } else {
        // Unknown key — clear buffer
        clearKeyBuffer();
      }
    },
    { isActive: isActive && mode === "normal" },
  );

  const resetSelection = useCallback(() => {
    setSelectedIndex(0);
    setScrollOffset(0);
  }, []);

  return {
    selectedIndex,
    scrollOffset,
    visibleItems: {
      start: scrollOffset,
      end: Math.min(scrollOffset + viewportHeight, totalItems),
    },
    resetSelection,
  };
}
