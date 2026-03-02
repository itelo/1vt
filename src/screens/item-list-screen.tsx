import React, { useEffect, useMemo } from "react";
import { Box, Text } from "ink";
import { useVaultStore, selectItems } from "../stores/vault-store.js";
import { useAppStore } from "../stores/app-store.js";
import { ListView } from "../components/list-view.js";
import { LoadingView } from "../components/loading-view.js";
import { Footer } from "../components/footer.js";
import { CategoryBadge } from "../components/category-badge.js";
import type { Item } from "../lib/types.js";
import { truncate, extractDomain, padRight } from "../lib/format.js";

interface ItemListScreenProps {
  vaultId: string;
  vaultName: string;
}

export function ItemListScreen({ vaultId, vaultName }: ItemListScreenProps) {
  const itemsSelector = useMemo(() => selectItems(vaultId), [vaultId]);
  const items = useVaultStore(itemsSelector);
  const loading = useVaultStore((s) => s.loading);
  const error = useVaultStore((s) => s.error);
  const fetchItems = useVaultStore((s) => s.fetchItems);
  const push = useAppStore((s) => s.push);

  const hasFetched = useVaultStore((s) => vaultId in s.itemsByVault);
  useEffect(() => {
    if (!hasFetched) fetchItems(vaultId);
  }, [vaultId, hasFetched, fetchItems]);

  if (!hasFetched || (loading && items.length === 0)) {
    return (
      <>
        <LoadingView label={`Loading items from ${vaultName}...`} />
        <Footer hints="q:back" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Box flexGrow={1} justifyContent="center" alignItems="center">
          <Text color="red">{error}</Text>
        </Box>
        <Footer hints="q:back  R:retry" />
      </>
    );
  }

  return (
    <ListView<Item>
      items={items}
      onSelect={(item) => {
        push({ type: "item-detail", itemId: item.id, vaultId });
      }}
      filterFn={(item, query) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.additional_information?.toLowerCase().includes(q) ?? false) ||
          (item.urls?.some((u) => u.href.toLowerCase().includes(q)) ?? false)
        );
      }}
      emptyMessage="No items in this vault"
      footerHints="j/k:nav  enter:open  /:search  c:clear  q:back  Q:quit"
      renderItem={(item, isSelected, width) => {
        const badgeWidth = 10;
        const domainWidth = 20;
        const titleWidth = Math.max(10, width - badgeWidth - domainWidth - 6);
        const primaryUrl = item.urls?.find((u) => u.primary)?.href;

        return (
          <Box>
            <Text color={isSelected ? "cyan" : undefined} bold={isSelected}>
              {isSelected ? "> " : "  "}
            </Text>
            <CategoryBadge category={item.category} />
            <Text> </Text>
            <Text bold={isSelected}>
              {padRight(truncate(item.title, titleWidth), titleWidth)}
            </Text>
            {primaryUrl && (
              <Text dimColor> {truncate(extractDomain(primaryUrl), domainWidth)}</Text>
            )}
            {item.favorite && <Text color="yellow"> *</Text>}
          </Box>
        );
      }}
    />
  );
}
