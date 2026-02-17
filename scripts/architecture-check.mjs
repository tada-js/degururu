import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const ignoredDirs = new Set(["node_modules", ".git", "output", "dist-vite", ".next"]);
const MAX_IF_CHAIN_LENGTH = 3;

/**
 * @typedef {{
 *   file: string;
 *   line: number;
 *   column: number;
 *   rule: "no-nested-ternary" | "max-if-chain";
 *   message: string;
 * }} ArchitectureFinding
 */

/**
 * @param {string} dir
 * @param {string[]} out
 */
function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath, out);
      continue;
    }
    if (sourceExtensions.has(path.extname(fullPath))) out.push(fullPath);
  }
}

/**
 * @param {string} ext
 * @returns {ts.ScriptKind}
 */
function toScriptKind(ext) {
  const byExt = {
    ".ts": ts.ScriptKind.TS,
    ".tsx": ts.ScriptKind.TSX,
    ".js": ts.ScriptKind.JS,
    ".jsx": ts.ScriptKind.JSX,
    ".mjs": ts.ScriptKind.JS,
  };
  return byExt[ext] ?? ts.ScriptKind.Unknown;
}

/**
 * @param {ts.Node} node
 * @returns {boolean}
 */
function hasConditionalDescendant(node) {
  let found = false;
  /** @param {ts.Node} current */
  const visit = (current) => {
    if (found) return;
    if (ts.isConditionalExpression(current)) {
      found = true;
      return;
    }
    ts.forEachChild(current, visit);
  };
  ts.forEachChild(node, visit);
  return found;
}

/**
 * @param {ts.IfStatement} node
 * @returns {number}
 */
function getIfChainLength(node) {
  let length = 1;
  let current = node;
  while (current.elseStatement && ts.isIfStatement(current.elseStatement)) {
    length += 1;
    current = current.elseStatement;
  }
  return length;
}

/**
 * @param {ArchitectureFinding[]} out
 * @param {string} file
 * @param {ts.SourceFile} sourceFile
 * @param {ts.Node} node
 * @param {ArchitectureFinding["rule"]} rule
 * @param {string} message
 */
function addFinding(out, file, sourceFile, node, rule, message) {
  const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  out.push({
    file: path.relative(root, file),
    line: pos.line + 1,
    column: pos.character + 1,
    rule,
    message,
  });
}

/**
 * @param {string} file
 * @returns {ArchitectureFinding[]}
 */
function checkFile(file) {
  const text = readFileSync(file, "utf8");
  const ext = path.extname(file);
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, toScriptKind(ext));
  /** @type {ArchitectureFinding[]} */
  const findings = [];

  /** @param {ts.Node} node */
  const visit = (node) => {
    if (ts.isConditionalExpression(node)) {
      const hasNested =
        hasConditionalDescendant(node.whenTrue) ||
        hasConditionalDescendant(node.whenFalse);
      if (hasNested) {
        addFinding(
          findings,
          file,
          sourceFile,
          node,
          "no-nested-ternary",
          "Nested ternary detected. Use mapping/selector functions instead."
        );
      }
    }

    if (ts.isIfStatement(node)) {
      const chainLength = getIfChainLength(node);
      if (chainLength > MAX_IF_CHAIN_LENGTH) {
        addFinding(
          findings,
          file,
          sourceFile,
          node,
          "max-if-chain",
          `If/else-if chain is too long (${chainLength}). Move branching into data mapping or selectors.`
        );
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return findings;
}

const files = [];
walk(root, files);

/** @type {ArchitectureFinding[]} */
const allFindings = [];
for (const file of files) {
  allFindings.push(...checkFile(file));
}

if (!allFindings.length) {
  console.log("[architecture-check] ok");
  process.exit(0);
}

for (const finding of allFindings) {
  console.error(
    `[architecture-check] ${finding.file}:${finding.line}:${finding.column} ${finding.rule} - ${finding.message}`
  );
}

console.error(`[architecture-check] failed with ${allFindings.length} finding(s)`);
process.exit(1);

