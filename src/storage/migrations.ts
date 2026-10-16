import { parseSiteConfig } from "./site";

export type MigratableSettings = {
  version: 2;
  enabled: boolean;
  sites: unknown[];
  debugUnknown: boolean;
};

export function migrateSettings(oldValue: Partial<MigratableSettings> | null | undefined): MigratableSettings {
  const sites = Array.isArray(oldValue?.sites)
    ? [...new Map([...oldValue.sites].reverse().map((site) => parseSiteConfig(site)).filter((site): site is NonNullable<typeof site> => site !== null).map((site) => [site.origin, site])).values()]
    : [];
  return {
    version: 2,
    enabled: oldValue?.enabled !== false,
    sites,
    debugUnknown: oldValue?.debugUnknown === true,
  };
}
