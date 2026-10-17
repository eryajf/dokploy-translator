import { afterEach, describe, expect, it, vi } from "vitest";
import { restore, scan, startTranslator } from "../../src/translation/dom-translator";

afterEach(() => {
  restore();
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
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
    document.body.innerHTML = '<p>My custom label</p><p>Future Dokploy action</p><p hidden>Save</p><p>No clusters found</p><p>Add a new server</p>';
    scan(document.body, { customTranslations: { "My custom label": "我的自定义标签" }, onUnknown: (entry) => unknown.push(entry.text) });
    expect(document.body.textContent).toContain("我的自定义标签");
    expect(document.querySelector("p:nth-of-type(2)")?.textContent).toBe("Future Dokploy action");
    expect(document.querySelector("p:nth-of-type(3)")?.textContent).toBe("Save");
    expect(document.querySelector("p:nth-of-type(4)")?.textContent).toBe("No clusters found");
    expect(document.querySelector("p:nth-of-type(5)")?.textContent).toBe("添加新服务器");
    expect(unknown).toEqual(expect.arrayContaining(["Future Dokploy action", "No clusters found"]));
    expect(unknown).not.toContain("Add a new server");
  });

  it.each([false, true])("preserves all selector-sensitive placeholders and Add interactions (custom overrides: %s)", (custom) => {
    const placeholders = [
      "Enter a label (e.g. enhancements, needs-review)",
      "Enter a path to watch (e.g., src/**, dist/*.js)",
      "e.g., rate-limit@file, auth@file",
    ];
    const selectors = [
      'input[placeholder*="Enter a label"]',
      'input[placeholder="Enter a path to watch (e.g., src/**, dist/*.js)"]',
      'input[placeholder="e.g., rate-limit@file, auth@file"]',
    ];
    const values = ["needs-review", "src/**", "rate-limit@file"];
    document.body.innerHTML = placeholders.map((placeholder) => `<div><input placeholder="${placeholder}" /><button>Add</button><output></output></div>`).join("");
    document.querySelectorAll("button").forEach((button, index) => {
      button.addEventListener("click", () => {
        const input = document.querySelector<HTMLInputElement>(selectors[index]);
        if (input?.value) button.parentElement!.querySelector("output")!.textContent = input.value;
      });
    });
    const unknown: string[] = [];
    scan(document.body, {
      customTranslations: custom ? Object.fromEntries(placeholders.map((value) => [value, "自定义占位符"])) : {},
      onUnknown: (entry) => unknown.push(entry.text),
    });
    document.querySelectorAll("input").forEach((input, index) => {
      expect(input.placeholder).toBe(placeholders[index]);
      input.value = values[index];
      document.querySelectorAll("button")[index].click();
      expect(document.querySelectorAll("output")[index].textContent).toBe(input.value);
    });
    for (const placeholder of placeholders) expect(unknown).not.toContain(placeholder);
  });

  it("skips only raw log payloads including nested text and attributes", () => {
    const unknown: string[] = [];
    document.body.innerHTML = `
      <div class="custom-logs-scrollbar">
        <button title="Save">Save</button><p>Future log toolbar action</p>
        <span id="payload" class="font-mono whitespace-pre-wrap break-all" title="Save">Save<strong title="Save">Save</strong><em>Future private log message</em><i>Future unrecognized log message</i></span>
        <span id="ordinary" class="font-mono">Save</span>
      </div>
      <span id="outside" class="font-mono whitespace-pre-wrap break-all">Save</span>`;
    scan(document.body, { customTranslations: { Save: "自定义保存", "Future private log message": "不应出现" }, onUnknown: (entry) => unknown.push(entry.text) });
    expect(document.querySelector("#payload")?.textContent).toBe("SaveSaveFuture private log messageFuture unrecognized log message");
    expect(document.querySelector("#payload")?.getAttribute("title")).toBe("Save");
    expect(document.querySelector("#payload strong")?.getAttribute("title")).toBe("Save");
    expect(document.querySelector("button")?.textContent).toBe("自定义保存");
    expect(document.querySelector("button")?.title).toBe("自定义保存");
    expect(document.querySelector("#ordinary")?.textContent).toBe("自定义保存");
    expect(document.querySelector("#outside")?.textContent).toBe("自定义保存");
    expect(unknown).toContain("Future log toolbar action");
    expect(unknown).not.toContain("Future private log message");
    expect(unknown).not.toContain("Future unrecognized log message");
  });

  it("restores the latest app source after reused text nodes and attributes are translated", () => {
    document.body.innerHTML = '<p title="Save">Save</p><input placeholder="Search" />';
    const paragraph = document.querySelector("p")!;
    const text = paragraph.firstChild!;
    const input = document.querySelector("input")!;
    scan();
    text.nodeValue = "Cancel";
    paragraph.title = "Cancel";
    input.placeholder = "Save";
    scan();
    expect(text.nodeValue).toBe("取消");
    expect(paragraph.title).toBe("取消");
    expect(input.placeholder).toBe("保存");
    restore();
    expect(text.nodeValue).toBe("Cancel");
    expect(paragraph.title).toBe("Cancel");
    expect(input.placeholder).toBe("Save");
    expect(document.querySelector("[data-dokploy-zh-translated]")).toBeNull();
  });

  it("does not overwrite app changes made after translation and clears stale ownership", () => {
    document.body.innerHTML = '<p title="Save">Save</p><input placeholder="Search" />';
    const paragraph = document.querySelector("p")!;
    const text = paragraph.firstChild!;
    const input = document.querySelector("input")!;
    scan();
    text.nodeValue = "App-owned message";
    paragraph.title = "App-owned title";
    input.removeAttribute("placeholder");
    restore();
    expect(text.nodeValue).toBe("App-owned message");
    expect(paragraph.title).toBe("App-owned title");
    expect(input.hasAttribute("placeholder")).toBe(false);
    text.nodeValue = "Cancel";
    paragraph.title = "Cancel";
    input.placeholder = "Save";
    scan();
    restore();
    expect(text.nodeValue).toBe("Cancel");
    expect(paragraph.title).toBe("Cancel");
    expect(input.placeholder).toBe("Save");
  });

  it("drops translation state when rescans see empty or untranslated app values", () => {
    document.body.innerHTML = '<p title="Save">Save</p><input placeholder="Search" />';
    const paragraph = document.querySelector("p")!;
    const text = paragraph.firstChild!;
    const input = document.querySelector("input")!;
    scan();
    text.nodeValue = "";
    paragraph.title = "App-owned title";
    input.removeAttribute("placeholder");
    scan();
    restore();
    expect(text.nodeValue).toBe("");
    expect(paragraph.title).toBe("App-owned title");
    expect(input.hasAttribute("placeholder")).toBe(false);
  });

  it("does not chain custom translations on its own output", () => {
    document.body.innerHTML = '<p title="Save">Save</p>';
    const options = { customTranslations: { Save: "Cancel", Cancel: "删除" } };
    scan(document.body, options);
    scan(document.body, options);
    expect(document.querySelector("p")?.textContent).toBe("Cancel");
    expect(document.querySelector("p")?.title).toBe("Cancel");
    restore();
    expect(document.querySelector("p")?.textContent).toBe("Save");
    expect(document.querySelector("p")?.title).toBe("Save");
  });

  it("restores translated nodes moved away from their original marked parents", () => {
    document.body.innerHTML = '<p>Save</p><section></section>';
    scan();
    const text = document.querySelector("p")!.firstChild!;
    document.querySelector("section")!.append(text);
    restore();
    expect(text.nodeValue).toBe("Save");
  });

  it("cancels queued scans on stop and makes old stop callbacks idempotent", async () => {
    let queued: FrameRequestCallback | undefined;
    const request = vi.fn((callback: FrameRequestCallback) => { queued = callback; return 42; });
    const cancel = vi.fn();
    vi.stubGlobal("requestAnimationFrame", request);
    vi.stubGlobal("cancelAnimationFrame", cancel);
    document.documentElement.lang = "en";
    document.body.innerHTML = "<p>Save</p>";
    const stop = startTranslator();
    document.querySelector("p")!.firstChild!.nodeValue = "Cancel";
    await Promise.resolve();
    expect(request).toHaveBeenCalledTimes(1);
    stop();
    expect(cancel).toHaveBeenCalledWith(42);
    queued?.(0);
    expect(document.querySelector("p")?.textContent).toBe("Cancel");
    expect(document.documentElement.lang).toBe("en");
    const stopAgain = startTranslator();
    expect(document.querySelector("p")?.textContent).toBe("取消");
    stop();
    expect(document.querySelector("p")?.textContent).toBe("取消");
    expect(document.documentElement.lang).toBe("zh-CN");
    stopAgain();
    expect(document.querySelector("p")?.textContent).toBe("Cancel");
    expect(document.documentElement.lang).toBe("en");
  });

  it("restores language once, without overwriting app-owned language updates", () => {
    document.documentElement.removeAttribute("lang");
    const stop = startTranslator();
    stop();
    expect(document.documentElement.hasAttribute("lang")).toBe(false);
    document.documentElement.lang = "fr";
    stop();
    restore();
    expect(document.documentElement.lang).toBe("fr");
    const stopAgain = startTranslator();
    document.documentElement.lang = "de";
    stopAgain();
    expect(document.documentElement.lang).toBe("de");
    document.documentElement.removeAttribute("lang");
  });

  it("applies reporting safety without blocking explicit custom translations", () => {
    const unknown: string[] = [];
    document.body.innerHTML = '<p>Contact alice@example.com</p><span title="Bearer secret-token">Bearer secret-token</span><p>Future safe dashboard action</p>';
    scan(document.body, { onUnknown: (entry) => unknown.push(entry.text) });
    expect(unknown).toEqual(["Future safe dashboard action"]);
    scan(document.body, { customTranslations: { "Contact alice@example.com": "自定义联系人", "Bearer secret-token": "自定义令牌" } });
    expect(document.querySelector("p")?.textContent).toBe("自定义联系人");
    expect(document.querySelector("span")?.textContent).toBe("自定义令牌");
    expect(document.querySelector("span")?.title).toBe("自定义令牌");
  });

  it("translates complete React sibling contexts and preserves numeric node updates and latest sources", () => {
    document.body.innerHTML = '<div role="dialog"><div data-slot="dialog-footer"><button></button></div><p data-slot="dialog-description"></p></div><div class="flex items-center justify-between text-sm text-muted-foreground"><span id="overview"></span></div><div data-slot="card-footer"><span id="project"></span></div>';
    const examples = [
      { element: document.querySelector("button")!, parts: ["Import ", "1", " secret", ""], output: "导入 1 个密钥", next: ["Import ", "2", " secret", "s"], updated: "导入 2 个密钥" },
      { element: document.querySelector("#overview")!, parts: ["1", " ", "service", " total"], output: "1 项服务 总计", next: ["2", " ", "services", " total"], updated: "2 项服务 总计" },
      { element: document.querySelector("#project")!, parts: ["1", " ", "service"], output: "1 项服务", next: ["2", " ", "services"], updated: "2 项服务" },
      { element: document.querySelector("p")!, parts: ["Select the target project and environment to move ", "1", " services"], output: "选择目标项目和环境以移动 1 项服务", next: ["Select the target project and environment to move ", "2", " services"], updated: "选择目标项目和环境以移动 2 项服务" },
    ];
    for (const example of examples) example.element.append(...example.parts.map((part) => document.createTextNode(part)));
    const originals = examples.map(({ element }) => Array.from(element.childNodes));
    scan();
    examples.forEach((example, index) => {
      expect(example.element.textContent).toBe(example.output);
      expect(Array.from(example.element.childNodes)).toEqual(originals[index]);
      // React updates only changed numeric/plural nodes, leaving translated literals alone.
      example.next.forEach((value, part) => {
        if (value !== example.parts[part]) originals[index][part].nodeValue = value;
      });
    });
    scan();
    examples.forEach((example) => expect(example.element.textContent).toBe(example.updated));
    scan();
    examples.forEach((example) => expect(example.element.textContent).toBe(example.updated));
    restore();
    examples.forEach((example, index) => {
      expect(example.element.textContent).toBe(example.next.join(""));
      expect(Array.from(example.element.childNodes)).toEqual(originals[index]);
    });
  });

  it("uses natural empty-count import copy and survives empty-to-count-to-empty React updates", () => {
    document.body.innerHTML = '<div role="dialog"><div data-slot="dialog-footer"><button></button></div></div>';
    const button = document.querySelector("button")!;
    const nodes = ["Import ", "", " secret", "s"].map((part) => document.createTextNode(part));
    button.append(...nodes);
    scan();
    expect(button.textContent).toBe("导入密钥");
    nodes[1].nodeValue = "1";
    nodes[3].nodeValue = "";
    scan();
    expect(button.textContent).toBe("导入 1 个密钥");
    nodes[1].nodeValue = "";
    nodes[3].nodeValue = "s";
    scan();
    expect(button.textContent).toBe("导入密钥");
    expect(Array.from(button.childNodes)).toEqual(nodes);
    restore();
    expect(button.textContent).toBe("Import  secrets");
  });

  it("preserves explicit custom overrides before and after contextual translation", () => {
    document.body.innerHTML = '<div role="dialog"><div data-slot="dialog-footer"><button></button></div><p data-slot="dialog-description"></p></div><div data-slot="card-footer"><span></span></div>';
    const button = document.querySelector("button")!;
    const span = document.querySelector("span")!;
    const description = document.querySelector("p")!;
    const prefix = "Select the target project and environment to move";
    button.append(...["Import ", "2", " secret", "s"].map((value) => document.createTextNode(value)));
    span.append(...["2", " ", "services"].map((value) => document.createTextNode(value)));
    description.append(...[prefix + " ", "2", " services"].map((value) => document.createTextNode(value)));
    scan();
    const options = { customTranslations: { Import: "自定义导入", services: "自定义服务", [prefix]: "自定义移动" } };
    scan(document.body, options);
    expect(button.textContent).toBe("自定义导入 2 secrets");
    expect(span.textContent).toBe("2 自定义服务");
    expect(description.textContent).toBe("自定义移动 2 自定义服务");
    scan(document.body, options);
    expect(button.textContent).toBe("自定义导入 2 secrets");
    expect(span.textContent).toBe("2 自定义服务");
    restore();
    scan(document.body, options);
    expect(button.textContent).toBe("自定义导入 2 secrets");
    expect(span.textContent).toBe("2 自定义服务");
    expect(description.textContent).toBe("自定义移动 2 自定义服务");
  });

  it("does not contextualize technical nouns, attributes, nested elements or unknown count containers", () => {
    document.body.innerHTML = '<input placeholder="secret" /><ul><li>services</li></ul><div class="cm-editor"><span>2 services</span></div><span>2 services</span><div data-slot="card-footer"><span>2 <b>services</b></span><span>2 services extra</span></div><button>Import 2 secrets</button>';
    const before = document.body.innerHTML;
    scan();
    expect(document.body.innerHTML).toBe(before);
  });

  it("preserves names and technical values displayed as ordinary text or titles", () => {
    const values = ["John", "Doe", "Vandelay Industries", "username", "local", "swarm", "primary", "production"];
    for (const value of values) {
      const element = document.createElement("span");
      element.textContent = value;
      element.title = value;
      document.body.append(element);
    }
    scan();
    expect(Array.from(document.querySelectorAll("span"), (element) => element.textContent)).toEqual(values);
    expect(Array.from(document.querySelectorAll("span"), (element) => element.title)).toEqual(values);
  });

  it("omits query strings and fragments from unknown-text records", () => {
    window.history.pushState({}, "", "/dashboard?token=secret#logs");
    const unknown: { url: string }[] = [];
    document.body.innerHTML = "<p>Untranslated dashboard notice</p>";
    scan(document.body, { onUnknown: (entry) => unknown.push(entry) });
    expect(unknown[0]?.url).toBe("http://localhost:3000/dashboard");
  });
});
