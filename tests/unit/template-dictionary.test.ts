import { describe, expect, it } from "vitest";
import { translateText } from "../../src/translation/dictionary";
import { templateTranslations } from "../../src/translation/template-dictionary";

import { runtimeCases } from "../../src/translation/template-runtime-cases";

const applyTemplate = (input: string): string | undefined => {
	input = input.trim();
	const rule = templateTranslations.find(({ pattern }) => pattern.test(input));
	return rule ? input.replace(rule.pattern, rule.target) : undefined;
};

describe("reviewed complete UI templates", () => {
	it.each([
		["Used:  1.25GiB / Limit: 512MiB ", "已用：1.25GiB / 限额：512MiB "],
		["Used:  256MiB / Limit: 2GiB ", "已用：256MiB / 限额：2GiB "],
		['Delete the HTTPS record "app.example.com"? This removes it from the DNS provider, not just from Dokploy.', "要删除 HTTPS 记录“app.example.com”吗？此操作会从 DNS 提供商处删除该记录，而不只是从 Dokploy 中移除。"],
		['Delete the DNSKEY record "app.example.com"? This removes it from the DNS provider, not just from Dokploy.', "要删除 DNSKEY 记录“app.example.com”吗？此操作会从 DNS 提供商处删除该记录，而不只是从 Dokploy 中移除。"],
	])("translates real monitoring/provider values: %s", (input, output) => {
		expect(translateText(input)).toBe(output);
	});

	it.each(runtimeCases)("translates actual runtime string: $input", ({ input, output }) => {
		expect(applyTemplate(input)).toBe(output);
	});

		it.each(runtimeCases)("preserves the curated result through runtime lookup: $input", ({ input, output }) => {
			expect(translateText(input)?.trim()).toBe(output);
		});

		it("exercises every explicit rule with actual runtime grammar", () => {
		for (const rule of templateTranslations) {
			const matching = runtimeCases.filter(({ source, input }) => source === rule.source && rule.pattern.test(input.trim()));
			expect(matching.length, `${rule.source}: ${rule.pattern}`).toBeGreaterThan(0);
			expect(matching.some(({ input, output }) => input.trim().replace(rule.pattern, rule.target) === output),
				`${rule.source}: own successful witness`).toBe(true);
			// A later alias rule may share grammar with an earlier one. Both need
			// their own correct replacement; first-match output is checked globally.
			for (const { input, output } of matching) expect(applyTemplate(input)).toBe(output);
		}
	});

	it("requires anchored, non-stateful rules and valid capture references", () => {
		for (const rule of templateTranslations) {
			expect(rule.pattern.source.startsWith("^")).toBe(true);
			expect(rule.pattern.source.endsWith("$")).toBe(true);
			expect(rule.pattern.global || rule.pattern.sticky).toBe(false);
			const sample = runtimeCases.find(({ source, input }) => source === rule.source && rule.pattern.test(input.trim()));
			expect(sample).toBeDefined();
			const captures = rule.pattern.exec(sample!.input.trim())!;
			for (const match of rule.target.replaceAll("$$", "").matchAll(/\$(\d+)/g)) {
				expect(Number(match[1])).toBeLessThan(captures.length);
			}
		}
	});

	it.each([
		"Unknown service action",
		"Backup my-user-service",
		"Backup Removed",
		"Container deploy successfully",
		"Container restarted successfully",
		"Failed to delete container: permission denied",
		"Error deleting a backup",
		"Requests paused",
		"Destination Removed",
		"Organization removed successfully",
		"Confirm new username",
		"Enter new service name",
		"Random user label copied",
		"Expected a complete arbitrary sentence",
		"Default my-custom-image:latest",
		"$12.00 per week",
		"In: a user message / Out: another message",
		"Read: foo / Write: bar",
		"Used: 1.25 apples / Limit: 2 oranges",
		'Delete the https record "app.example.com"? This removes it from the DNS provider, not just from Dokploy.',
		'Delete the HTTPS extra record "app.example.com"? This removes it from the DNS provider, not just from Dokploy.',
		"3 days left · some other user-defined suffix",
		"This will permanently delete an arbitrary sentence.",
		"Try manually: rclone ls :s3,provider=AWS:test",
		"ordinary error Try manually: rm -rf /",
		"Prefix Error creating a backup",
		"Error creating a backup extra text",
		"prefix Are you sure you want to stop 2 services? suffix",
		"Name must be at most unlimited characters",
	])("does not generalize reviewed branches: %s", (input) => {
		expect(applyTemplate(input)).toBeUndefined();
	});

	it.each([
		["Error creating a backup", "创建备份失败"],
		["Error updating a backup", "更新备份失败"],
		["Container restart successfully", "容器重启成功"],
		["Failed to stop container: permission denied", "停止容器失败：permission denied"],
		["In: 1.25 MB / Out: 2.50 GB", "入站：1.25 MB / 出站：2.50 GB"],
		["$12.00 per month", "每月 $12.00"],
		["Server production-server deleted successfully", "服务器 production-server 删除成功"],
		['Are you sure you want to deploy "Save Changes $1"?', "确定要部署“Save Changes $1”吗？"],
		['Role "a  b $& $$ $` $\'" updated', '角色“a  b $& $$ $` $\'”已更新'],
		["Error deploying service svc_1: Error: $& $1 $$\n/var/lib/a  b is missing", "部署服务 svc_1 失败：Error: $& $1 $$\n/var/lib/a  b is missing"],
		['Network "a&apos;b  c" updated from Docker', '网络“a&apos;b  c”已根据 Docker 中的配置更新'],
		["Logs for a  b $& $$", "a  b $& $$ 的日志"],
	])("is wired into translateText: %s", (input, output) => {
		expect(translateText(input)).toBe(output);
	});
});
