import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Box, Text, useInput } from "ink";
import { useVaultStore, selectItemDetail } from "../stores/vault-store.js";
import { useUiStore } from "../stores/ui-store.js";
import { LoadingView } from "../components/loading-view.js";
import { Footer } from "../components/footer.js";
import { FieldRow } from "../components/field-row.js";
import { op } from "../services/op.js";
import { copyToClipboard } from "../services/clipboard.js";
import type { Field } from "../lib/types.js";
import { extractDomain } from "../lib/format.js";
import { getCategoryLabel } from "../lib/constants.js";

interface ItemDetailScreenProps {
  itemId: string;
  vaultId: string;
}

export function ItemDetailScreen({ itemId, vaultId }: ItemDetailScreenProps) {
  const detailSelector = useMemo(() => selectItemDetail(itemId), [itemId]);
  const detail = useVaultStore(detailSelector);
  const loading = useVaultStore((s) => s.loading);
  const error = useVaultStore((s) => s.error);
  const fetchItemDetail = useVaultStore((s) => s.fetchItemDetail);
  const showStatus = useUiStore((s) => s.showStatus);
  const mode = useUiStore((s) => s.mode);
  const keyBuffer = useUiStore((s) => s.keyBuffer);
  const setKeyBuffer = useUiStore((s) => s.setKeyBuffer);
  const clearKeyBuffer = useUiStore((s) => s.clearKeyBuffer);
  const [selectedField, setSelectedField] = useState(0);
  const pendingG = useRef(false);

  useEffect(() => {
    fetchItemDetail(itemId, vaultId);
  }, [itemId, vaultId, fetchItemDetail]);

  const fields = detail?.fields?.filter(
    (f) => f.value && f.label && f.purpose !== "NOTES",
  ) || [];

  const notesField = detail?.fields?.find((f) => f.purpose === "NOTES" && f.value);

  const copyField = useCallback(
    async (field: Field) => {
      if (!field.value) return;
      try {
        await copyToClipboard(field.value);
        showStatus(`${field.label} copied!`, "success");
      } catch {
        showStatus("Failed to copy", "error");
      }
    },
    [showStatus],
  );

  const copyByPurpose = useCallback(
    async (purpose: "USERNAME" | "PASSWORD") => {
      const field = detail?.fields?.find((f) => f.purpose === purpose);
      if (field?.value) {
        await copyToClipboard(field.value);
        showStatus(
          `${purpose === "PASSWORD" ? "Password" : "Username"} copied!`,
          "success",
        );
      } else {
        showStatus(`No ${purpose.toLowerCase()} found`, "error");
      }
    },
    [detail, showStatus],
  );

  const copyOtp = useCallback(async () => {
    try {
      const otp = await op.getOtp(itemId, vaultId);
      await copyToClipboard(otp);
      showStatus("OTP copied!", "success");
    } catch {
      showStatus("No OTP available", "error");
    }
  }, [itemId, vaultId, showStatus]);

  const openUrl = useCallback(async () => {
    const url = detail?.urls?.find((u) => u.primary)?.href || detail?.urls?.[0]?.href;
    if (url) {
      const { execa } = await import("execa");
      await execa("open", [url]);
      showStatus("Opened in browser", "success");
    } else {
      showStatus("No URL available", "error");
    }
  }, [detail, showStatus]);

  const consumeCount = useCallback((): number => {
    const num = keyBuffer.replace(/g$/, "");
    const count = num.length > 0 ? parseInt(num, 10) : 1;
    clearKeyBuffer();
    pendingG.current = false;
    return isNaN(count) ? 1 : count;
  }, [keyBuffer, clearKeyBuffer]);

  const clamp = useCallback(
    (n: number) => Math.max(0, Math.min(fields.length - 1, n)),
    [fields.length],
  );

  useInput(
    (input, key) => {
      if (mode !== "normal") return;
      if (fields.length === 0) return;

      // Count prefix
      if (/^[1-9]$/.test(input) || (input === "0" && keyBuffer.length > 0)) {
        setKeyBuffer(keyBuffer + input);
        return;
      }

      // gg
      if (input === "g") {
        if (pendingG.current) {
          consumeCount();
          setSelectedField(0);
          return;
        }
        pendingG.current = true;
        setKeyBuffer(keyBuffer + "g");
        return;
      }
      if (pendingG.current) pendingG.current = false;

      const count = consumeCount();

      if (input === "j" || key.downArrow) {
        setSelectedField((prev) => clamp(prev + count));
      } else if (input === "k" || key.upArrow) {
        setSelectedField((prev) => clamp(prev - count));
      } else if (input === "G") {
        setSelectedField(fields.length - 1);
      } else if (input === "y" || key.return) {
        const field = fields[selectedField];
        if (field) copyField(field);
      } else if (input === "p") {
        copyByPurpose("PASSWORD");
      } else if (input === "u") {
        copyByPurpose("USERNAME");
      } else if (input === "t") {
        copyOtp();
      } else if (input === "o") {
        openUrl();
      }
    },
    { isActive: mode === "normal" },
  );

  if (!detail && !error) {
    return (
      <>
        <LoadingView label="Loading item..." />
        <Footer hints="q:back" />
      </>
    );
  }

  if (error || !detail) {
    return (
      <>
        <Box flexGrow={1} justifyContent="center" alignItems="center">
          <Text color="red">{error || "Item not found"}</Text>
        </Box>
        <Footer hints="q:back" />
      </>
    );
  }

  const primaryUrl = detail.urls?.find((u) => u.primary)?.href;

  return (
    <>
      <Box flexDirection="column" flexGrow={1} gap={0}>
        {/* Meta info */}
        <Box flexDirection="column" paddingBottom={1}>
          <Box>
            <Text dimColor>{"  Category     "}</Text>
            <Text>{getCategoryLabel(detail.category)}</Text>
          </Box>
          {primaryUrl && (
            <Box>
              <Text dimColor>{"  Website      "}</Text>
              <Text color="blue">{extractDomain(primaryUrl)}</Text>
            </Box>
          )}
          {detail.tags && detail.tags.length > 0 && (
            <Box>
              <Text dimColor>{"  Tags         "}</Text>
              <Text>{detail.tags.join(", ")}</Text>
            </Box>
          )}
        </Box>

        {/* All fields */}
        <Box flexDirection="column">
          {fields.map((field, idx) => (
            <FieldRow
              key={field.id}
              field={field}
              isSelected={idx === selectedField}
            />
          ))}
        </Box>

        {/* Notes */}
        {notesField && (
          <Box flexDirection="column" paddingTop={1}>
            <Text dimColor bold>
              {"  \u2500\u2500 Notes " + "\u2500".repeat(30)}
            </Text>
            <Text>  {notesField.value}</Text>
          </Box>
        )}
      </Box>
      <Footer
        hints="y:copy  p:pass  u:user  t:otp  o:url  q:back"
        cursorLine={selectedField}
        totalLines={fields.length}
      />
    </>
  );
}
