export function normalizeOrigin(value: string): string {
  const input = value.trim();
  if (!input) throw new Error("请输入 Dokploy 地址");
  const url = new URL(input.includes("://") ? input : `http://${input}`);
  if (!/^https?:$/.test(url.protocol)) throw new Error("仅支持 HTTP 或 HTTPS 地址");
  if (url.username || url.password) throw new Error("地址不能包含用户名或密码");
  if (url.hash || url.search) throw new Error("地址不能包含查询参数或片段");
  return url.origin;
}

export function originPattern(origin: string): string {
  return `${origin}/*`;
}

export function siteId(origin: string): string {
  return `dokploy-${Array.from(origin).reduce((hash, char) => ((hash * 33) ^ char.charCodeAt(0)) >>> 0, 5381).toString(16)}`;
}
