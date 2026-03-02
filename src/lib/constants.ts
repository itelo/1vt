import type { ItemCategory } from "./types.js";

export const CATEGORY_LABELS: Record<string, string> = {
  LOGIN: "Login",
  PASSWORD: "Pass",
  SECURE_NOTE: "Note",
  CREDIT_CARD: "Card",
  IDENTITY: "ID",
  BANK_ACCOUNT: "Bank",
  DATABASE: "DB",
  SERVER: "Server",
  API_CREDENTIAL: "API",
  SOFTWARE_LICENSE: "License",
  EMAIL_ACCOUNT: "Email",
  SSH_KEY: "SSH",
  DOCUMENT: "Doc",
  MEMBERSHIP: "Member",
  PASSPORT: "Passport",
  DRIVER_LICENSE: "License",
  REWARD_PROGRAM: "Reward",
  SOCIAL_SECURITY_NUMBER: "SSN",
  WIRELESS_ROUTER: "WiFi",
  OUTDOOR_LICENSE: "License",
  MEDICAL_RECORD: "Medical",
};

export const CATEGORY_COLORS: Record<string, string> = {
  LOGIN: "green",
  PASSWORD: "yellow",
  SECURE_NOTE: "blue",
  CREDIT_CARD: "magenta",
  IDENTITY: "cyan",
  API_CREDENTIAL: "red",
  SSH_KEY: "red",
  SERVER: "yellow",
  DATABASE: "yellow",
};

export function getCategoryLabel(category: ItemCategory): string {
  return CATEGORY_LABELS[category] || category;
}

export function getCategoryColor(category: ItemCategory): string {
  return CATEGORY_COLORS[category] || "white";
}
