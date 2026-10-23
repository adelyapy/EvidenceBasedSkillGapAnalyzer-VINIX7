import "server-only";
import { posix } from "node:path";
import { normalizeProjectPath } from "./project-path";
export { normalizeProjectPath } from "./project-path";

const ignoredDirectories = new Set([
  "node_modules", ".git", ".next", "dist", "build", "coverage", "vendor", "cache", ".cache",
  ".turbo", ".nuxt", "out", "target", "bin", "obj", "__pycache__", ".venv", "venv",
  ".aws", ".ssh", ".docker", ".kube", ".azure", ".gnupg", "credentials", "secrets",
  ".idea", ".vscode", "__macosx", ".gradle", ".dart_tool",
]);
const lockfiles = new Set(["package-lock.json", "npm-shrinkwrap.json", "packages.lock.json", "pnpm-lock.yaml", "pnpm-lock.yml", "yarn.lock", "bun.lock", "bun.lockb", "composer.lock", "poetry.lock", "cargo.lock", "gemfile.lock", "pubspec.lock", "deno.lock", "pipfile.lock", "uv.lock"]);
const languages: Record<string, string> = {
  ".js": "JavaScript", ".jsx": "JavaScript", ".mjs": "JavaScript", ".cjs": "JavaScript",
  ".ts": "TypeScript", ".tsx": "TypeScript", ".mts": "TypeScript", ".cts": "TypeScript",
  ".py": "Python", ".java": "Java", ".php": "PHP", ".dart": "Dart",
  ".html": "HTML", ".htm": "HTML", ".css": "CSS", ".scss": "SCSS", ".sass": "Sass",
  ".json": "JSON", ".yaml": "YAML", ".yml": "YAML", ".md": "Markdown", ".mdx": "MDX",
  ".go": "Go", ".rs": "Rust", ".rb": "Ruby", ".c": "C", ".h": "C", ".cpp": "C++",
  ".hpp": "C++", ".cs": "C#", ".swift": "Swift", ".kt": "Kotlin", ".kts": "Kotlin",
  ".sql": "SQL", ".sh": "Shell", ".vue": "Vue", ".svelte": "Svelte", ".toml": "TOML",
  ".xml": "XML", ".gradle": "Gradle", ".r": "R", ".ex": "Elixir", ".exs": "Elixir",
};
const manifests = new Set(["package.json", "composer.json", "pyproject.toml", "requirements.txt", "cargo.toml", "go.mod", "pubspec.yaml", "pom.xml", "gemfile", "dockerfile", "makefile"]);

export function detectLanguage(path: string): string | undefined {
  const basename = posix.basename(path).toLowerCase();
  if (["dockerfile", "makefile", "gemfile"].includes(basename)) return basename === "gemfile" ? "Ruby" : basename === "dockerfile" ? "Dockerfile" : "Makefile";
  if (basename === "requirements.txt") return "Text";
  return languages[posix.extname(path).toLowerCase()];
}

export function isArchivePath(path: string): boolean {
  return /\.(zip|jar|war|ear|tar|gz|tgz|bz2|xz|7z|rar|apk|whl)$/i.test(path);
}

export function isRelevantPath(path: string): boolean {
  const normalized = normalizeProjectPath(path);
  const parts = normalized.toLowerCase().split("/");
  const basename = parts[parts.length - 1];
  if (parts.some((part) => ignoredDirectories.has(part)) || /(^|\/)\.config\/(gcloud|gh)(\/|$)/i.test(normalized) || lockfiles.has(basename) || containsPossibleSecret(normalized)) return false;
  if (parts.some((part) => part.startsWith(".env")) ||
      /(?:credentials?|secrets?|service[-_]?account|id_rsa|id_ed25519|passwords?|tokens?)(?:[._-]|$)/i.test(basename) ||
      [".npmrc", ".pypirc", ".netrc", ".htpasswd", ".git-credentials"].includes(basename) ||
      /\.(pem|key|p12|pfx|jks|keystore|crt|cer|map|lock)$/i.test(basename) ||
      /(?:\.min\.[cm]?js|\.min\.css|\.g\.dart|\.d\.ts|next-env\.d\.ts)$/i.test(basename) || /\.generated\./i.test(basename)) return false;
  return Boolean(detectLanguage(normalized)) || manifests.has(basename);
}

export function filePriority(path: string): number {
  const name = posix.basename(path).toLowerCase();
  if (/^readme(?:\.|$)/.test(name)) return 0;
  if (manifests.has(name)) return 1;
  if (/^(src|app|lib)\//i.test(path) && !/\.(test|spec)\./i.test(name)) return 2;
  if (/\.(test|spec)\.|(^|\/)(tests?|__tests__)\//i.test(path)) return 3;
  return 4;
}

export function comparePaths(a: string, b: string): number {
  return filePriority(a) - filePriority(b) || (a < b ? -1 : a > b ? 1 : 0);
}

export function hasArchiveMagic(bytes: Uint8Array): boolean {
  return (bytes[0] === 0x50 && bytes[1] === 0x4b && [0x03, 0x05, 0x07].includes(bytes[2])) ||
    (bytes[0] === 0x1f && bytes[1] === 0x8b) ||
    (bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72) ||
    (bytes[0] === 0x37 && bytes[1] === 0x7a && bytes[2] === 0xbc) ||
    (bytes[0] === 0x42 && bytes[1] === 0x5a && bytes[2] === 0x68) ||
    (bytes[0] === 0xfd && bytes[1] === 0x37 && bytes[2] === 0x7a && bytes[3] === 0x58) ||
    (bytes.length >= 262 && new TextDecoder().decode(bytes.subarray(257, 262)) === "ustar");
}

/** Conservative heuristics, not proof that arbitrary source code is secret-free. */
export function containsPossibleSecret(text: string): boolean {
  return /["']auths["']\s*:/i.test(text) ||
    /(?:["'](?:auth|_auth|_authToken|identitytoken|registrytoken)["']|\b(?:_auth|_authToken))\s*[:=]\s*["']?[A-Za-z0-9_+\/-]{4,}/i.test(text) ||
    /\b(?:authorization\s*:\s*)?Bearer\s+[A-Za-z0-9._~+\/-]{8,}/i.test(text) ||
    /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/i.test(text) ||
    /(?:AIza[\w-]{20,}|AKIA[A-Z0-9]{16}|(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{15,}|sk-(?:proj-)?[\w-]{20,}|xox[baprs]-[\w-]{10,})/.test(text) ||
    /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(text) ||
    /(?:api[_-]?key|secret|password|passwd|access[_-]?token|auth[_-]?token|private[_-]?key|client[_-]?secret|authorization)["']?\s*[:=]\s*["'`][^"'`\r\n]{4,}["'`]/i.test(text) ||
    /(?:password|secret|token|api[_-]?key)\s*=\s*[A-Za-z0-9_+\/-]{8,}/i.test(text) ||
    /(?:password|secret|token|api[_-]?key)\s*:\s*(?!["'`\s{])[A-Za-z0-9_+\/-]{4,}/i.test(text) ||
    /https?:\/\/[^\s/]+:[^\s/]+@/i.test(text) ||
    /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s]+@/i.test(text) ||
    /["'][A-Za-z0-9_+\/-]{40,}={0,2}["']/.test(text);
}

export function decodeSafeText(bytes: Uint8Array): string | undefined {
  if (bytes.some((byte) => byte === 0 || byte === 127 || (byte < 32 && ![9, 10, 13].includes(byte)))) return undefined;
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { return undefined; }
  if (containsPossibleSecret(text) || /(?:@generated|auto[- ]generated|do not edit this file)/i.test(text)) return undefined;
  return text;
}
