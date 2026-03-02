import React from "react";
import { Box, Text } from "ink";
import type { Field } from "../lib/types.js";
import { maskValue, padRight } from "../lib/format.js";

interface FieldRowProps {
  field: Field;
  isSelected: boolean;
  labelWidth?: number;
}

export function FieldRow({ field, isSelected, labelWidth = 14 }: FieldRowProps) {
  const isConcealed = field.type === "CONCEALED" || field.purpose === "PASSWORD";
  const displayValue = field.value
    ? isConcealed
      ? maskValue(field.value)
      : field.value
    : "";

  return (
    <Box>
      <Text color={isSelected ? "cyan" : undefined} bold={isSelected}>
        {isSelected ? "> " : "  "}
      </Text>
      <Text dimColor={!isSelected}>
        {padRight(field.label, labelWidth)}
      </Text>
      <Text color={isConcealed ? "yellow" : undefined}>
        {displayValue}
      </Text>
    </Box>
  );
}
