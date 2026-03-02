export interface Vault {
  id: string;
  name: string;
  content_version?: number;
  type?: string;
  created_at?: string;
  updated_at?: string;
  items?: number;
}

export interface Item {
  id: string;
  title: string;
  version?: number;
  vault: { id: string; name: string };
  category: ItemCategory;
  created_at: string;
  updated_at: string;
  additional_information?: string;
  urls?: ItemUrl[];
  tags?: string[];
  favorite?: boolean;
}

export interface ItemDetail extends Item {
  sections?: Section[];
  fields?: Field[];
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  value?: string;
  reference?: string;
  purpose?: "USERNAME" | "PASSWORD" | "NOTES";
  section?: Section;
  totp?: string;
  password_details?: {
    entropy?: number;
    generated?: boolean;
    strength?: string;
  };
}

export interface Section {
  id: string;
  label?: string;
}

export interface ItemUrl {
  label?: string;
  primary: boolean;
  href: string;
}

export interface WhoAmI {
  url: string;
  email: string;
  user_uuid: string;
  account_uuid: string;
}

export type ItemCategory =
  | "LOGIN"
  | "PASSWORD"
  | "SECURE_NOTE"
  | "CREDIT_CARD"
  | "IDENTITY"
  | "BANK_ACCOUNT"
  | "DATABASE"
  | "SERVER"
  | "API_CREDENTIAL"
  | "SOFTWARE_LICENSE"
  | "EMAIL_ACCOUNT"
  | "SSH_KEY"
  | "DOCUMENT"
  | "MEMBERSHIP"
  | "PASSPORT"
  | "DRIVER_LICENSE"
  | "REWARD_PROGRAM"
  | "SOCIAL_SECURITY_NUMBER"
  | "WIRELESS_ROUTER"
  | "OUTDOOR_LICENSE"
  | "MEDICAL_RECORD";

export type FieldType =
  | "STRING"
  | "CONCEALED"
  | "URL"
  | "EMAIL"
  | "DATE"
  | "MONTH_YEAR"
  | "PHONE"
  | "ADDRESS"
  | "OTP"
  | "REFERENCE"
  | "MENU"
  | "CREDIT_CARD_NUMBER"
  | "CREDIT_CARD_TYPE"
  | "GENDER"
  | "FILE"
  | "SSHKEY"
  | "UNKNOWN";

export type Screen =
  | { type: "auth" }
  | { type: "vault-list" }
  | { type: "item-list"; vaultId: string; vaultName: string }
  | { type: "item-detail"; itemId: string; vaultId: string };

export type Mode = "normal" | "search";
