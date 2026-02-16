import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const configPath = path.join(root, ".gitleaks.toml");

function fail(message) {
  console.error(`[gitleaks-allowlist] ${message}`);
  process.exit(1);
}

if (!fs.existsSync(configPath)) {
  fail(`missing config: ${configPath}`);
}

const source = fs.readFileSync(configPath, "utf8");
const lines = source.split(/\r?\n/);

let inAllowlist = false;
let inRegexes = false;
const violations = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  if (/^\[[^\]]+\]$/.test(trimmed)) {
    inAllowlist = trimmed === "[allowlist]";
    inRegexes = false;
    continue;
  }

  if (!inAllowlist) continue;

  if (!inRegexes && /^regexes\s*=\s*\[/.test(trimmed)) {
    inRegexes = true;
    continue;
  }

  if (!inRegexes) continue;
  if (trimmed === "]") {
    inRegexes = false;
    continue;
  }
  if (!trimmed || trimmed.startsWith("#")) continue;

  const isRegexEntry =
    /^'''[\s\S]*''',?$/.test(trimmed) ||
    /^"([^"\\]|\\.)*",?$/.test(trimmed) ||
    /^'([^'\\]|\\.)*',?$/.test(trimmed);

  if (!isRegexEntry) continue;

  let j = i - 1;
  while (j >= 0 && lines[j].trim() === "") j--;
  const prev = j >= 0 ? lines[j].trim() : "";
  if (!prev.startsWith("# reason:")) {
    violations.push({
      line: i + 1,
      value: trimmed,
    });
  }
}

if (violations.length) {
  console.error("[gitleaks-allowlist] every allowlisted regex must have an immediate '# reason:' comment.");
  for (const item of violations) {
    console.error(`- .gitleaks.toml:${item.line} -> ${item.value}`);
  }
  process.exit(1);
}

console.log("[gitleaks-allowlist] ok");
