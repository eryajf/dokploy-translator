import { describe, expect, it } from "vitest";
import { collectCandidates, mergeCandidates } from "../../scripts/extract-dokploy-strings";

const collect = (source: string) => collectCandidates(source, "components/example.tsx");

describe("Dokploy string extraction", () => {
  it("collects direct and member notification calls, but not arbitrary call arguments", () => {
    const candidates = collect(`
      toast("Direct toast");
      notify("Direct notification");
      toast.success("Saved successfully");
      toast.error("Save failed");
      toast.info("Information available");
      toast.warning("Please confirm");
      notify.custom("Notification message");
      toast.success(dynamicMessage);
      toast.success("Primary message", "not a message");
      toaster("not a toast");
      other.success("not a notification");
    `);
    expect(candidates.map(({ source }) => source)).toEqual([
      "Direct toast", "Direct notification", "Saved successfully", "Save failed",
      "Information available", "Please confirm", "Notification message", "Primary message",
    ]);
    expect(candidates.every(({ kind, risk }) => kind === "toast" && risk === "ui")).toBe(true);
    expect(candidates[0].line).toBe(2);
  });

  it("preserves technical UI labels in JSX, notifications and named properties", () => {
    const candidates = collect(`
      const fields = { title: "Docker File", description: "Generate API Key", label: "Host Path",
        placeholder: "Application name", message: "Access token is required", "title": "Docker settings" };
      toast.success("Generate API Key");
      notify.info("Host Path");
      const input = <Field title="Docker File" description="Generate API Key" label="Host Path"
        placeholder={"API Key"} aria-label="Docker" message="Secret name" />;
      const label = <span>Docker File</span>;
    `);
    for (const source of ["Docker File", "Generate API Key", "Host Path", "Application name", "Access token is required", "Docker settings", "API Key", "Docker", "Secret name"]) {
      expect(candidates.find((candidate) => candidate.source === source)?.risk).toBe("ui");
    }
  });

  it.each([
    ["https://example.com/api?token=private", "url"],
    ["/var/run/docker.sock", "url"],
    ["git add .", "code"],
    ["npm run build", "code"],
    ["docker compose up -d", "code"],
    ["DATABASE_URL", "code"],
    ["API_KEY=private-value", "secret"],
    ["API Key: private-value", "secret"],
    ["Bearer private-token", "secret"],
    ["-----BEGIN PRIVATE KEY-----", "secret"],
    ["ghp_privatecredential", "secret"],
    ["Add ${name}", "dynamic"],
    ["Add {name}", "dynamic"],
    ["production-api-server", "dynamic"],
    ["serverName", "dynamic"],
    ["https://example.com", "url"],
    ["example.com", "url"],
    ["C:\\app\\config.json", "url"],
  ])("redacts concrete values even in explicit UI contexts: %s", (source, risk) => {
    const candidates = collect(`const form = { title: ${JSON.stringify(source)} }; toast.error(${JSON.stringify(source)});`);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({ source: `[REDACTED ${risk.toUpperCase()}]`, risk, exemption: risk, reviewed: false });
  });

  it("retains template static fragments and safe placeholder metadata", () => {
    const candidates = collect('toast.success(`Application ${application.name} saved successfully`); const form = { title: `Static template` };');
    expect(candidates).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: "Application", kind: "template", risk: "ui", placeholders: ["${application.name}"] }),
      expect.objectContaining({ source: "saved successfully", kind: "template", risk: "ui", placeholders: ["${application.name}"] }),
      expect.objectContaining({ source: "Static template", kind: "template", risk: "ui", placeholders: [] }),
    ]));
    expect(collect('toast.success(`Saved ${getKey("private-credential")} successfully`);')[0].placeholders).toEqual(["${…}"]);
  });

  it("attaches the complete normalized template to fragments without adding it as a candidate", () => {
    const candidates = collect('toast.success(`Network "${name}"  updated`);');
    expect(candidates.map(({ source }) => source)).toEqual(['Network "', '" updated']);
    expect(candidates.every(({ template }) => template === 'Network "${name}" updated')).toBe(true);
    expect(candidates.every(({ placeholders }) => JSON.stringify(placeholders) === '["${name}"]')).toBe(true);
  });

  it("shares one-pass exact-key entity normalization without decoding complete template shells", () => {
    const candidates = collect('const view = <p>Apps &amp; databases &amp;apos;</p>; toast.info(`Apps &amp; ${name}  ready`);');
    expect(candidates.find(({ source }) => source === "Apps & databases &apos;")?.risk).toBe("ui");
    expect(candidates.find(({ source }) => source === "Apps &")?.template).toBe("Apps &amp; ${name} ready");
  });

  it("does not leak literal credentials or arbitrary expressions through template metadata", () => {
    const candidates = collect('toast.success(`Saved ${getKey("private-credential")} successfully`); toast.info(`API Key: private-secret ${name}`);');
    expect(candidates.find(({ source }) => source === "Saved")?.template).toBe("Saved ${…} successfully");
    expect(candidates.filter(({ risk }) => risk !== "ui").every(({ template }) => template === undefined)).toBe(true);
    expect(JSON.stringify(candidates)).not.toMatch(/private-credential|private-secret|getKey/);
  });

  it("attaches template metadata when a fixed label was collected before its template fragment", () => {
    const candidates = collect('const fields = { label: "Network" }; toast.success(`Network ${name}`);');
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({ source: "Network", template: "Network ${name}", placeholders: ["${name}"] });
  });

  it("aggregates all safe templates for repeated fragments within a file", () => {
    const candidates = collect(`
      const fields = { label: "Error" };
      toast.error(\`Error \${name} while saving\`);
      toast.error(\`Error \${reason} while loading\`);
      toast.error(\`Error \${name} while saving\`);
      toast.error(\`Error \${getKey("private-credential")} while retrying\`);
      toast.error(\`Error API Key: private-secret \${name}\`);
    `);
    const error = candidates.find(({ source }) => source === "Error");
    expect(error).toMatchObject({
      template: "Error ${name} while saving",
      templates: ["Error ${name} while saving", "Error ${reason} while loading", "Error ${…} while retrying"],
    });
    expect(JSON.stringify(candidates)).not.toMatch(/private-credential|private-secret|getKey/);
    expect(candidates.filter(({ risk }) => risk !== "ui").every(({ template, templates }) => template === undefined && templates === undefined)).toBe(true);
  });

  it("merges UI templates across files while keeping first-template compatibility and sensitive records separate", () => {
    const first = collectCandidates('toast.error(`Error ${name} while saving`); toast.info("Bearer private-token");', "components/first.tsx");
    const second = collectCandidates('toast.error(`Error ${reason} while loading`); toast.error(`Error ${name} while saving`); toast.info("Bearer private-token");', "components/second.tsx");
    const merged = mergeCandidates([...first, ...second]);
    expect(merged.filter(({ source }) => source === "Error")).toEqual([
      expect.objectContaining({
        file: "components/first.tsx", template: "Error ${name} while saving",
        templates: ["Error ${name} while saving", "Error ${reason} while loading"],
        placeholders: ["${name}", "${reason}"],
      }),
    ]);
    expect(merged.filter(({ risk }) => risk === "secret").map(({ file }) => file)).toEqual(["components/first.tsx", "components/second.tsx"]);
    expect(first.find(({ source }) => source === "Error")?.templates).toEqual(["Error ${name} while saving"]);
  });

  it.each([
    ['toast.info(`Bearer ${token}`);', "secret"],
    ['toast.info(`API Key: ${key}`);', "secret"],
    ['toast.info(`https://${host}/api`);', "url"],
    ['toast.info(`npm run ${script}`);', "code"],
  ])("keeps operational template shells redacted: %s", (source, risk) => {
    const candidates = collect(source);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((candidate) => candidate.risk === risk && candidate.source === `[REDACTED ${risk.toUpperCase()}]`)).toBe(true);
  });

  it.each([
    "Enter full path to the config file, e.g. /app/config.json",
    "Visit https://example.com for documentation",
    "Enter the URL, e.g. https://example.com/api",
    "MTU must be a number between 68 and 65535",
    "Server 123456",
  ])("retains natural language containing URLs, paths or numbers: %s", (source) => {
    const candidates = collect(`const form = { description: ${JSON.stringify(source)} };`);
    expect(candidates).toEqual([expect.objectContaining({ source, risk: "ui" })]);
  });

  it("collects fixed JSX expression values and only visible conditional branches", () => {
    const candidates = collect(`
      const view = <>
        <span>{"Visible fixed text"}</span>
        <span>{enabled ? "Enabled state" : "Disabled state"}</span>
        <span>{mode === "not visible comparison" && "Visible guarded text"}</span>
        <span>{message ?? "Visible fallback text"}</span>
        <span>{message || "Visible empty fallback"}</span>
        <span>{("not visible guard" && "Nested visible guard")}</span>
        <span>{("Visible typed text" as const)}</span>
        <span>{format("not visible call argument")}</span>
        <span>{"not visible concatenation" + value}</span>
      </>;
    `);
    expect(candidates.map(({ source }) => source)).toEqual([
      "Visible fixed text", "Enabled state", "Disabled state", "Visible guarded text",
      "Visible fallback text", "Visible empty fallback", "Nested visible guard", "Visible typed text",
    ]);
    expect(candidates.every(({ kind, risk }) => kind === "jsx-text" && risk === "ui")).toBe(true);
  });

  it("collects visible attribute and notification conditionals, including nullish and OR fallbacks", () => {
    const candidates = collect(`
      const input = <Input title={enabled ? "Active title" : "Inactive title"}
        description={description ?? "Default description"}
        label={label || "Default label"} placeholder={ready && "Visible placeholder"}
        message={status === "not a visible status" ? "Ready message" : "Waiting message"} />;
      toast.error(error.message ?? "Unable to save changes");
      notify.info(result || "No result available");
      toast.success(enabled ? "Feature enabled" : "Feature disabled");
      toast.error(failed && "Operation failed");
      toast.error(mode === "not a toast condition" ? "Mode failed" : "Unknown failure");
      toast.error(getMessage("not a notification argument"));
      toast.error("Primary notification", "not the second argument");
    `);
    expect(candidates.map(({ source }) => source)).toEqual([
      "Active title", "Inactive title", "Default description", "Default label", "Visible placeholder",
      "Ready message", "Waiting message", "Unable to save changes", "No result available",
      "Feature enabled", "Feature disabled", "Operation failed", "Mode failed", "Unknown failure", "Primary notification",
    ]);
    expect(candidates.find(({ source }) => source === "Unable to save changes")?.kind).toBe("toast");
    expect(candidates.find(({ source }) => source === "Default description")?.kind).toBe("attribute");
  });

  it("limits templates to explicit UI contexts, not hook CSS or arbitrary technical values", () => {
    const candidates = collect(`
      const arbitrary = \`Unrelated template\`;
      const dynamic = \`Unrelated prefix \${value} unrelated suffix\`;
      const style = \`body { color: \${color}; }\`;
      console.log(\`Deployment log \${id}\`);
      const css = useMemo(() => \`Theme fragment \${theme}\`, []);
      const view = <Input className={\`flex \${size} technical class\`}
        style={{ label: \`Technical style label\`, color: \`Technical color \${color}\` }}
        href={\`https://\${host}/path\`} src={\`/icons/\${name}\`}
        value={enabled ? \`Technical input value\` : "Technical fixed value"}
        defaultValue={\`Technical default\`} id={\`Technical identifier\`}
        class={\`Technical class alias\`} key={\`Technical key\`}
        title={enabled ? \`Visible title \${name}\` : \`Visible static title\`}
        placeholder={placeholder ?? \`Visible placeholder\`} />;
      const label = <span>{\`Visible JSX \${name}\`}</span>;
      toast.info(ready ? \`Visible toast \${name}\` : \`Visible static toast\`);
      notify(message || \`Visible fallback toast\`);
      const fields = { description: ready ? \`Visible property \${name}\` : \`Visible static property\` };
    `);
    expect(candidates.map(({ source }) => source)).toEqual([
      "Visible title", "Visible static title", "Visible placeholder", "Visible JSX", "Visible toast",
      "Visible static toast", "Visible fallback toast", "Visible property", "Visible static property",
    ]);
    expect(candidates.every(({ kind, risk }) => kind === "template" && risk === "ui")).toBe(true);
  });

  it("does not extract fixed strings from technical JSX attributes", () => {
    expect(collect(`
      const view = <Input className={enabled ? "Technical class" : "Other class"}
        style={{ label: "Technical style label" }} href="Technical link"
        src={"Technical source"} value={value ?? "Technical value"} defaultValue="Technical default"
        id="Technical identifier" key="Technical key" />;
    `)).toEqual([]);
  });

  it("supports targeted zod message arguments and option messages, not constraint/default data", () => {
    const candidates = collect(`
      import { z as schema } from "zod";
      const name = z.string().min(1, "Project name is required")
        .max(80, ready ? "Name is too long" : "Please shorten the name")
        .regex(/^[a-z]+$/, "Only lowercase letters are allowed")
        .refine(check, "Project name is invalid");
      const mtu = z.number().min(68, { message: "MTU must be a number between 68 and 65535" });
      const password = schema.string({ required_error: "Password is required", invalid_type_error: "Password must be text" });
      const email = schema.string().email("Please enter a valid email address");
      const url = schema.string().url({ message: "Please enter a valid URL" });
      const code = schema.string().min(6, { error: "Code is too short" });
      const message = schema.string().min(1, fallback ?? "Value is required");
      const field = schema.string().startsWith("not a validation message", "Invalid prefix")
        .endsWith("not a suffix message", { message: "Invalid suffix" })
        .default("not a default message");
      const pattern = z.string().regex("not a regex message");
      const options = z.enum(["not an enum message", "not another enum message"]);
      const other = calculator.min(1, "not a zod message");
      refine(check, "not a validation call");
    `);
    expect(candidates.map(({ source }) => source)).toEqual([
      "Project name is required", "Name is too long", "Please shorten the name",
      "Only lowercase letters are allowed", "Project name is invalid",
      "MTU must be a number between 68 and 65535", "Password is required", "Password must be text",
      "Please enter a valid email address", "Please enter a valid URL", "Code is too short", "Value is required",
      "Invalid prefix", "Invalid suffix",
    ]);
    expect(candidates.every(({ risk }) => risk === "ui")).toBe(true);
  });

  it("retains UI contexts in ordinary hooks and pages while skipping unrelated templates", () => {
    const text = 'const css = `Hook CSS`; toast.error(error.message ?? "Unable to load data"); const config = { title: "Loading data" };';
    for (const file of ["hooks/use-data.tsx", "pages/dashboard.tsx", "lib/ui-config.ts"]) {
      expect(collectCandidates(text, file).map(({ source }) => source)).toEqual(["Unable to load data", "Loading data"]);
    }
  });

  it("does not let generic templates hide a later explicit UI label", () => {
    const candidates = collect('const setting = `Host Path`; const form = { title: "Host Path" };');
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({ source: "Host Path", risk: "ui", kind: "string-literal" });
  });

  it("follows only bounded local constants and static object members consumed by UI sinks", () => {
    const candidates = collect(`
      const unused = "Unconsumed local constant";
      const technical = { command: "npm run build", internal: "Unconsumed object member" };
      const copy = { button: "Create a project", nested: { help: "Choose a project first" } } as const;
      const alias = copy.nested.help;
      const message = ready ? "Creation complete" : "Creation failed";
      const cycle = cycle;
      const view = <><Button>{copy.button}</Button><p>{alias}</p><p>{cycle}</p></>;
      toast.success(message);
      const scoped = "Outer unused text";
      function Panel() { const scoped = "Inner visible text"; return <p>{scoped}</p>; }
      const mutable = "Mutable technical text";
      let changing = "Mutable value";
      const technicalView = <Input value={mutable} title={changing} />;
    `);
    expect(candidates.map(({ source }) => source)).toEqual([
      "Create a project", "Choose a project first", "Creation complete", "Creation failed", "Inner visible text",
    ]);
  });

  it("resolves demanded conditional handle-domain dictionary members", () => {
    const candidates = collect(`
      const dictionary = {
        success: domainId ? "Domain Updated" : "Domain Created",
        error: domainId ? "Error updating the domain" : "Error creating the domain",
        submit: domainId ? "Update" : "Create",
        dialogDescription: domainId ? "In this section you can edit a domain" : "In this section you can add domains",
        internal: "Unconsumed internal member",
      };
      toast.success(dictionary.success);
      toast.error(dictionary.error);
      const view = <><DialogDescription>{dictionary.dialogDescription}</DialogDescription><Button>{dictionary.submit}</Button></>;
    `);
    expect(candidates.map(({ source }) => source)).toEqual([
      "Domain Updated", "Domain Created", "Error updating the domain", "Error creating the domain",
      "In this section you can edit a domain", "In this section you can add domains", "Update", "Create",
    ]);
  });

  it("resolves rendered map fields and nested static plan features without collecting hidden fields", () => {
    const candidates = collect(`
      const plans = [{ name: "Starter plan", slug: "hidden-tier", features: ["Community support", \`Setup up to \${count} servers\`], internal: ["Hidden plan data"] }];
      const unused = [{ name: "Hidden unrelated name", features: ["Hidden unrelated feature"] }];
      const view = <>{plans.map((plan) => <section><h2>{plan.name}</h2><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></section>)}</>;
      const labels = ["First visible item", "Second visible item"];
      const list = <>{labels.map((label) => label)}</>;
      const ignored = plans.map((plan) => plan.internal);
    `);
    for (const source of ["Starter plan", "Community support", "Setup up to", "servers", "First visible item", "Second visible item"]) {
      expect(candidates.find((candidate) => candidate.source === source)?.risk).toBe("ui");
    }
    expect(JSON.stringify(candidates)).not.toMatch(/hidden-tier|Hidden plan data|Hidden unrelated/);
  });

  it("does not evaluate imported values, function calls, dynamic keys, or non-array map receivers", () => {
    expect(collect(`
      import { imported } from "./copy";
      const object = { visible: "Unproven member" };
      const fake = { map: (callback) => callback("Not an array item") };
      const view = <>{imported}{object[externalKey]}{fake.map((item) => <p>{item}</p>)}{getCopy("Not a rendered argument")}</>;
      function Panel(text = "Not a parameter message") { return <p>{text}</p>; }
    `)).toEqual([]);
  });

  it("bounds cyclic and excessively deep local dataflow", () => {
    const declarations = Array.from({ length: 60 }, (_, index) => `const alias${index} = ${index === 59 ? '"Too deeply nested"' : `alias${index + 1}`};`).join("\n");
    expect(collect(`${declarations}\nconst cycleA = cycleB; const cycleB = cycleA; const view = <>{alias0}{cycleA}</>;`)).toEqual([]);
  });

  it("collects approved UI properties and attributes", () => {
    const candidates = collect(`const docs = { docDescription: "Understand task scheduling", heading: "Swarm settings", dropMessage: "Drop files here" }; const view = <Panel docDescription="Read the guide" heading="Server settings" dropMessage="Drop a logo here" />;`);
    expect(candidates.map(({ source }) => source)).toEqual(["Understand task scheduling", "Swarm settings", "Drop files here", "Read the guide", "Server settings", "Drop a logo here"]);
  });

  it("limits the approved redeploy export exception to its exact file and exported name", () => {
    const text = 'export const COMPOSE_REDEPLOY_TOAST = "Redeploy the compose to apply the changes."; export const OTHER_MESSAGE = "Unconsumed export";';
    expect(collectCandidates(text, "components/dashboard/application/domains/redeploy-hint.tsx").map(({ source }) => source)).toEqual(["Redeploy the compose to apply the changes."]);
    expect(collectCandidates(text, "components/other.tsx")).toEqual([]);
    expect(collectCandidates(text.replace("export const COMPOSE", "const COMPOSE"), "components/dashboard/application/domains/redeploy-hint.tsx")).toEqual([]);
  });

  it.each([
    "The server requires sudo access.",
    "Ensure passwordless sudo is configured for this user.",
    'Layers cached by "docker build" on this server will appear here.',
    "Configure docker build options before deploying.",
    "Review the config file before continuing.",
  ])("retains technical prose without relaxing command or credential redaction: %s", (source) => {
    expect(collect(`const view = <p>${source}</p>;`)).toEqual([expect.objectContaining({ source, risk: "ui" })]);
  });

  it.each(["sudo apt update", "docker build -t app .", "docker config create app ./config", '{ "debug": true }', "password=private-value", "PASSWORD: private-value"])("keeps operational and credential values redacted: %s", (source) => {
    const candidates = collect(`const text = ${JSON.stringify(source)}; const view = <p>{text}</p>;`);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every(({ risk }) => risk !== "ui")).toBe(true);
    expect(JSON.stringify(candidates)).not.toContain("private-value");
  });

  it.each([
    "Control which nodes service tasks can be scheduled on. Constraints (node.id==xyz), Preferences (spread.node.labels.zone), MaxReplicas, and Platforms specify task placement rules.",
    "Add metadata to services using labels. Labels are key-value pairs (e.g., com.example.foo=bar) for organizing and filtering services.",
    "Time to wait before forcefully killing a container. Specified in nanoseconds (e.g., 10000000000 = 10 seconds). Allows containers to shutdown gracefully.",
  ])("retains Swarm documentation containing non-secret parenthetical examples: %s", (source) => {
    expect(collect(`const options = { docDescription: ${JSON.stringify(source)} };`)).toEqual([expect.objectContaining({ source, risk: "ui" })]);
  });

  it.each([
    "node.id==xyz", "com.example.foo=bar", "10000000000 = 10 seconds", "(node.id==xyz)",
    "Set the credentials here (API_KEY=private-value).",
    "Set the credentials here (com.example.secret=private-value).",
    "Review this sample config before continuing: { debug: true }",
    "Run this command before continuing: docker build -t app .",
  ])("does not treat actual assignments, credentials or command examples as safe prose: %s", (source) => {
    const candidates = collect(`const options = { docDescription: ${JSON.stringify(source)} };`);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every(({ risk }) => risk !== "ui")).toBe(true);
    expect(JSON.stringify(candidates)).not.toContain("private-value");
  });

  it.each([
    "http:\nrouters:\n    router-name:\n        rule: Host('domain.com')\n        service: container-name\n        entryPoints:\n            - web\n        tls: false\n        middlewares: []",
    "version: '3'\nservices:\n    web:\n    image: nginx\n    ports:\n        - \"80:80\"",
    "enabled: true\nretries: 3",
    "# This is a comment\necho \"Hello, world!\"\n",
    "docker info | grep Swarm",
    "docker stats",
  ])("redacts actual multiline configuration and comparable operational snippets: %s", (source) => {
    const candidates = collect(`const view = <CodeEditor placeholder={${JSON.stringify(source)}} />;`);
    expect(candidates).toEqual([expect.objectContaining({ source: "[REDACTED CODE]", risk: "code", exemption: "code" })]);
  });

  it.each([
    "Review the YAML config before continuing.\nUse spaces for indentation.",
    "Configuration:\n  Review the server settings before continuing.",
    "Note: Changes require a restart.\nWarning: Save your work first.",
    "Features:\n  - Community support\n  - Unlimited apps",
    'Layers cached by "docker build" on this server will appear here.',
  ])("retains multiline prose that merely mentions configuration: %s", (source) => {
    const candidates = collect(`const view = <Panel description={${JSON.stringify(source)}} />;`);
    expect(candidates).toEqual([expect.objectContaining({ source: source.replace(/\s+/g, " ").trim(), risk: "ui" })]);
  });

  it.each([
    ["components/dashboard/application/advanced/traefik/update-traefik-config.tsx", 159],
    ["components/dashboard/file-system/show-traefik-file.tsx", 127],
  ] as const)("classifies the actual Traefik YAML template form as code in %s", (file, line) => {
    const text = "\n".repeat(line - 1) + 'const view = <CodeEditor placeholder={`http:\nrouters:\n    router-name:\n        rule: Host(\'domain.com\')\n        service: container-name\n        entryPoints:\n            - web\n        tls: false\n        middlewares: []\n                                                    `} />;';
    expect(collectCandidates(text, file)).toEqual([
      expect.objectContaining({ source: "[REDACTED CODE]", file, line, kind: "template", risk: "code", exemption: "code" }),
    ]);
  });

  it("redacts YAML placeholders before normalization, including interpolated configuration", () => {
    const candidates = collect('const view = <CodeEditor placeholder={`http:\n  routers:\n    app:\n      service: ${serviceName}\n      tls: false`} />;');
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every(({ risk, template, templates, templateOccurrences }) => risk === "code" && template === undefined && templates === undefined && templateOccurrences === undefined)).toBe(true);
    expect(JSON.stringify(candidates)).not.toContain("service:");
  });

  it("keeps sensitive records per line and isolates protected template fragments from matching UI copy", () => {
    const candidates = collect('toast.info("Bearer private-token");\ntoast.info("Bearer private-token");\nconst fields = { label: "Error" };\ntoast.error(`Error ${name} API Key: private-value`);');
    expect(candidates.filter(({ risk }) => risk === "secret").map(({ line }) => line)).toEqual([1, 2, 4, 4]);
    const error = candidates.find(({ source }) => source === "Error")!;
    expect(error.occurrences).toEqual([{ file: "components/example.tsx", line: 3, kind: "string-literal" }]);
    expect(error.templateOccurrences).toBeUndefined();
    expect(JSON.stringify(candidates)).not.toMatch(/private-token|private-value/);
  });

  it("preserves all source and per-template occurrence locations and deeply clones merges", () => {
    const first = collectCandidates('const fields = { label: "Error" };\ntoast.error(`Error ${name} while saving`);\ntoast.error(`Error ${name} while saving`);\ntoast.error(`Error ${reason} while loading`);', "components/first.tsx");
    const second = collectCandidates('toast.error(`Error ${name} while saving`);', "components/second.tsx");
    const merged = mergeCandidates([...first, ...second]);
    const error = merged.find(({ source }) => source === "Error")!;
    expect(error.occurrences).toEqual([
      { file: "components/first.tsx", line: 1, kind: "string-literal" },
      ...[2, 3, 4].map((line) => ({ file: "components/first.tsx", line, kind: "template" })),
      { file: "components/second.tsx", line: 1, kind: "template" },
    ]);
    expect(error.templateOccurrences).toEqual([
      ...[2, 3].map((line) => ({ source: "Error ${name} while saving", file: "components/first.tsx", line, kind: "template" })),
      { source: "Error ${reason} while loading", file: "components/first.tsx", line: 4, kind: "template" },
      { source: "Error ${name} while saving", file: "components/second.tsx", line: 1, kind: "template" },
    ]);
    const before = JSON.stringify([first, second]);
    error.occurrences![0].line = 99;
    error.templateOccurrences![0].source = "Mutated shell";
    error.templates!.push("Mutated template");
    error.placeholders!.push("${mutated}");
    expect(JSON.stringify([first, second])).toBe(before);
  });

  it.each([
    "server/api.ts", "scripts/setup.ts", "drizzle/migration.ts", "__test__/sample.tsx", "__tests__/sample.tsx", "components/sample.test.tsx",
    "pages/api/deploy.ts", "pages/api/example.tsx", "apps/dokploy/pages/api/webhook.ts", "pages\\api\\webhook.ts",
    "lib/bundled-icons.ts", "lib/bundled-icons/index.ts", "components/dashboard/application/schedules/timezones.ts",
    "wait-for-db.ts", "wait-for-service.js", "wait-for.ts",
  ])("skips non-UI file %s", (file) => {
    expect(collectCandidates('toast.success("Not UI source");', file)).toEqual([]);
  });
});
