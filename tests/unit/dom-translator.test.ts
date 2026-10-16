import { afterEach, describe, expect, it } from "vitest";
import { restore, scan, startTranslator } from "../../src/translation/dom-translator";

afterEach(() => {
  restore();
  document.body.innerHTML = "";
});

describe("DOM translator", () => {
  it("translates visible text and supported attributes", () => {
    document.body.innerHTML = '<button title="Save">Save</button><input placeholder="Search" />';
    scan();
    expect(document.body.textContent).toContain("保存");
    expect(document.querySelector("button")?.getAttribute("title")).toBe("保存");
    expect(document.querySelector("input")?.getAttribute("placeholder")).toBe("搜索");
  });

  it("skips inputs, code and restores translated nodes", () => {
    document.body.innerHTML = '<input value="Save" /><pre>Save</pre><p>Save</p>';
    const stop = startTranslator();
    expect(document.querySelector("input")?.getAttribute("value")).toBe("Save");
    expect(document.querySelector("pre")?.textContent).toBe("Save");
    expect(document.querySelector("p")?.textContent).toBe("保存");
    stop();
    expect(document.querySelector("p")?.textContent).toBe("Save");
  });

  it("translates custom entries, skips hidden content and reports unknown UI text", () => {
    const unknown: string[] = [];
    document.body.innerHTML = '<p>My custom label</p><p>Future Dokploy action</p><p hidden>Save</p>';
    scan(document.body, { customTranslations: { "My custom label": "我的自定义标签" }, onUnknown: (entry) => unknown.push(entry.text) });
    expect(document.body.textContent).toContain("我的自定义标签");
    expect(document.querySelector("p:nth-of-type(3)")?.textContent).toBe("Save");
    expect(unknown).toContain("Future Dokploy action");
  });
});
