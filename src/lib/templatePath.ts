import path from "path";

// Resolve a user-supplied template name to an absolute path INSIDE the allowed
// template directories, or null if it would escape them. Templates are named
// either "foo.html" (public/templates) or "backup-templates/foo.html"
// (public/backup-templates) — nothing else is permitted.
//
// This is the single guard against path traversal: `?template=../../.env` and
// friends must never resolve to a file outside these two directories.
const TEMPLATES_DIR = path.resolve(process.cwd(), "public", "templates");
const BACKUP_DIR = path.resolve(process.cwd(), "public", "backup-templates");

export function resolveTemplatePath(templateName: unknown): string | null {
  if (typeof templateName !== "string" || templateName.length === 0) {
    return null;
  }

  let baseDir = TEMPLATES_DIR;
  let name = templateName;
  if (name.startsWith("backup-templates/")) {
    baseDir = BACKUP_DIR;
    name = name.slice("backup-templates/".length);
  }

  // Only a bare .html filename is allowed — no directory parts, no traversal,
  // no null bytes.
  if (
    name.includes("/") ||
    name.includes("\\") ||
    name.includes("..") ||
    name.includes("\0") ||
    !name.toLowerCase().endsWith(".html")
  ) {
    return null;
  }

  const resolved = path.resolve(baseDir, name);

  // Containment check: the resolved file must sit directly in baseDir.
  if (path.dirname(resolved) !== baseDir) {
    return null;
  }

  return resolved;
}
