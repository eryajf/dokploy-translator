import { readFileSync, existsSync } from "node:fs";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const manifestPath = new URL("../.output/chrome-mv3/manifest.json", import.meta.url);
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.version !== packageJson.version) {
    throw new Error(`版本不一致：package.json=${packageJson.version}, manifest=${manifest.version}`);
  }
  for (const required of ["background.js", "dokploy-script.js", "options.html"]) {
    if (!existsSync(new URL(`../.output/chrome-mv3/${required}`, import.meta.url))) throw new Error(`发布产物缺少 ${required}`);
  }
} else {
  throw new Error("未找到生产构建 manifest.json");
}

const forbidden = /(bearer\s+[a-z0-9._-]{24,}|BEGIN [A-Z ]+PRIVATE KEY|6660491268:|webhook\/[A-Z0-9_-]{20,})/i;
const dictionarySource = readFileSync(new URL("../src/translation/core-dictionary.ts", import.meta.url), "utf8");
if (forbidden.test(dictionarySource)) throw new Error("正式词典疑似包含敏感凭据或 Token");
for (const generated of ["dictionary.generated.json", "dictionary.sensitive.json"]) {
  const path = new URL(`../src/translation/${generated}`, import.meta.url);
  if (existsSync(path) && forbidden.test(readFileSync(path, "utf8"))) throw new Error(`${generated} 疑似包含未脱敏凭据`);
}
console.log(`Release checks passed for dokploy-translator v${packageJson.version}`);
