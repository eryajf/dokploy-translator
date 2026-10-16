import { siteId } from "../storage/site";
import type { SiteConfig } from "../storage/settings";

export const SCRIPT_PREFIX = "dokploy-";

export function desiredScriptIds(sites: SiteConfig[], enabled: boolean, grantedOrigins: Set<string>): Set<string> {
  return new Set(sites.filter((site) => enabled && site.enabled && grantedOrigins.has(site.origin)).map((site) => siteId(site.origin)));
}

export function staleScriptIds(registeredIds: string[], desiredIds: Set<string>): string[] {
  return registeredIds.filter((id) => id.startsWith(SCRIPT_PREFIX) && !desiredIds.has(id));
}
