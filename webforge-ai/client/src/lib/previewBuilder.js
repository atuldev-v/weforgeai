/**
 * Builds a self-contained HTML document that renders the generated React
 * project inside a sandboxed iframe.
 *
 * How it works (deliberately simple, not a real bundler):
 *  1. Every frontend/src/**\/*.jsx file is treated as a module. We strip
 *     `import ... from './X'` statements referencing sibling project files
 *     (since everything is inlined into one scope) and strip `export default`,
 *     turning each file into a plain function/const declaration.
 *  2. All files are concatenated in dependency-friendly order (components
 *     before App, App before main) and transpiled together by Babel Standalone
 *     (loaded from a CDN at runtime in the user's browser) directly in the iframe.
 *  3. Tailwind is loaded via the Play CDN so utility classes render without a build step.
 *
 * Known limitation: this supports the common patterns WebForge generates
 * (function components, useState/useEffect, relative imports of local
 * components) but is not a substitute for actually running `npm run dev` —
 * arbitrary third-party npm packages beyond React are not resolved here.
 */
export function buildPreviewDocument(files) {
  const jsxFiles = files.filter((f) => /^frontend\/src\/.*\.(jsx|js)$/.test(f.path) && !f.path.endsWith('main.jsx'));

  if (jsxFiles.length === 0) {
    return basicHtmlDocument(files);
  }

  // Order: components/* first, then App.jsx, so declarations exist before use
  // (function declarations are hoisted by Babel's output anyway, but keeping
  // this order makes the generated bundle easier to debug).
  const ordered = [...jsxFiles].sort((a, b) => {
    const aIsApp = a.path.endsWith('/App.jsx');
    const bIsApp = b.path.endsWith('/App.jsx');
    return Number(aIsApp) - Number(bIsApp);
  });

  const modules = ordered.map((f) => stripModuleSyntax(f.content)).join('\n\n');

  const cssFile = files.find((f) => f.path.endsWith('index.css'));
  const hasTailwind = /@tailwind/.test(cssFile?.content || '');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${hasTailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : `<style>${cssFile?.content || ''}</style>`}
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif;}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel" data-presets="react">
      const { useState, useEffect, useCallback, useMemo, useRef } = React;

      ${modules}

      ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    </script>
  </body>
</html>`;
}

function stripModuleSyntax(src) {
  return src
    .replace(/^import\s+.*?;\s*$/gm, '') // drop import lines entirely (React/hooks provided globally above)
    .replace(/export\s+default\s+function/, 'function')
    .replace(/export\s+default\s+/, 'const __default__ = ')
    .replace(/export\s+(function|const|class)/, '$1');
}

function basicHtmlDocument(files) {
  const html = files.find((f) => f.path.endsWith('.html'));
  if (html) return html.content;
  return `<!doctype html><html><body style="font-family:sans-serif;padding:2rem;color:#64748b">
    <p>No previewable frontend files yet. Generate a website to see a live preview here.</p>
  </body></html>`;
}
