export type MigratableSettings = {
  version: 2;
  enabled: boolean;
  sites: unknown[];
  debugUnknown: boolean;
};

export function migrateSettings(oldValue: Partial<MigratableSettings> | null | undefined): MigratableSettings {
  return {
    version: 2,
    enabled: oldValue?.enabled !== false,
    sites: Array.isArray(oldValue?.sites) ? oldValue.sites : [],
    debugUnknown: oldValue?.debugUnknown === true,
  };
}
