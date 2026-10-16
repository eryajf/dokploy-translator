import type { CustomTranslations, ExportBundle, ExtensionSettings } from "./settings";
import { sanitizeUnknownTextEntries } from "../translation/unknown-text";

export function createConfigBackup(settings: ExtensionSettings, customTranslations: CustomTranslations): ExportBundle {
  return { schemaVersion: 1, exportedAt: new Date().toISOString(), settings, customTranslations, unknownTexts: [] };
}

export function importUnknownTexts(value: unknown) {
  return sanitizeUnknownTextEntries(value);
}
