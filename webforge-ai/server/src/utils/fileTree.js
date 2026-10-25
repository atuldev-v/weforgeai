import path from 'node:path';

const MAX_FILE_BYTES = 500 * 1024; // 500KB per file guard against runaway AI output
const MAX_FILES = 400;
const FORBIDDEN_SEGMENTS = new Set(['..', '.git', 'node_modules']);

/**
 * Validates a single relative file path used inside a generated project.
 * Throws on anything that could escape the project sandbox:
 *  - absolute paths
 *  - parent traversal (../)
 *  - null bytes
 *  - reserved segments (.git, node_modules writes)
 */
export function assertSafeRelativePath(rawPath) {
  if (typeof rawPath !== 'string' || rawPath.length === 0) {
    throw new Error('File path must be a non-empty string');
  }
  if (rawPath.includes('\0')) {
    throw new Error('File path contains a null byte');
  }
  if (path.isAbsolute(rawPath)) {
    throw new Error(`Absolute paths are not allowed: ${rawPath}`);
  }

  const normalized = path.normalize(rawPath).replace(/\\/g, '/');
  const segments = normalized.split('/').filter(Boolean);

  for (const seg of segments) {
    if (FORBIDDEN_SEGMENTS.has(seg)) {
      throw new Error(`Path segment "${seg}" is not allowed in: ${rawPath}`);
    }
  }
  if (normalized.startsWith('..') || normalized.includes('/../') || normalized === '..') {
    throw new Error(`Path traversal detected in: ${rawPath}`);
  }

  return normalized;
}

/**
 * Validates an entire AI-generated (or user-edited) file list before it is
 * persisted. Returns a sanitized array or throws with a descriptive message.
 */
export function validateFileList(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('Generated project must include at least one file');
  }
  if (files.length > MAX_FILES) {
    throw new Error(`Generated project exceeds the maximum of ${MAX_FILES} files`);
  }

  const seen = new Set();
  const sanitized = [];

  for (const f of files) {
    if (!f || typeof f.path !== 'string' || typeof f.content !== 'string') {
      throw new Error('Every file must have a string "path" and string "content"');
    }
    const safePath = assertSafeRelativePath(f.path);

    if (seen.has(safePath)) {
      throw new Error(`Duplicate file path in generation output: ${safePath}`);
    }
    seen.add(safePath);

    const byteLength = Buffer.byteLength(f.content, 'utf8');
    if (byteLength > MAX_FILE_BYTES) {
      throw new Error(`File ${safePath} exceeds max size of ${MAX_FILE_BYTES} bytes`);
    }

    sanitized.push({ path: safePath, content: f.content });
  }

  return sanitized;
}

/** Merges a patch (partial file list) into an existing file list, replacing matching paths. */
export function mergeFiles(existingFiles, patchFiles) {
  const map = new Map(existingFiles.map((f) => [f.path, f]));
  for (const f of patchFiles) {
    map.set(f.path, f);
  }
  return Array.from(map.values());
}

/** Builds a nested tree structure (for the FileTree UI component) from a flat file list. */
export function buildTree(files) {
  const root = { name: '', type: 'folder', children: [] };
  for (const file of files) {
    const parts = file.path.split('/');
    let node = root;
    parts.forEach((part, idx) => {
      const isLeaf = idx === parts.length - 1;
      let child = node.children.find((c) => c.name === part);
      if (!child) {
        child = isLeaf
          ? { name: part, type: 'file', path: file.path }
          : { name: part, type: 'folder', children: [] };
        node.children.push(child);
      }
      node = child;
    });
  }
  return root.children;
}
