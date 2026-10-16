import { storage } from "wxt/utils/storage";
import { migrateSettings } from "./migrations";
export { migrateSettings } from "./migrations";
export { normalizeOrigin, originPattern, siteId, parseSiteConfig } from "./site";

export type Locale = "zh-CN";

export type SiteConfig = {
  id: string;
  origin: string;
  enabled: boolean;
  locale: Locale;
  createdAt: number;
  updatedAt: number;
};

export type ExtensionSettings = {
  version: 2;
  enabled: boolean;
  sites: SiteConfig[];
  debugUnknown: boolean;
};

export type UnknownTextEntry = {
  text: string;
  url: string;
  tagName: string;
  seenAt: number;
};

const fallback: ExtensionSettings = {
  version: 2,
  enabled: true,
  sites: [],
  debugUnknown: false,
};

export const settings = storage.defineItem<ExtensionSettings>("local:settings", {
  fallback,
  version: 2,
  migrations: {
    1: (oldValue) => migrateSettings(oldValue) as ExtensionSettings,
  },
});

export const unknownTexts = storage.defineItem<UnknownTextEntry[]>("local:unknownTexts", {
  fallback: [],
});

export type CustomTranslations = Record<string, string>;

export const customTranslations = storage.defineItem<CustomTranslations>("local:customTranslations", {
  fallback: {},
});

export type ExportBundle = {
  schemaVersion: 1;
  exportedAt: string;
  settings: ExtensionSettings;
  unknownTexts: UnknownTextEntry[];
  customTranslations: CustomTranslations;
};
