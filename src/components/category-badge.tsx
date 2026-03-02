import React from "react";
import { Text } from "ink";
import type { ItemCategory } from "../lib/types.js";
import { getCategoryLabel, getCategoryColor } from "../lib/constants.js";

interface CategoryBadgeProps {
  category: ItemCategory;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Text color={getCategoryColor(category)} dimColor>
      [{getCategoryLabel(category)}]
    </Text>
  );
}
