import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';

const EXT_TO_LANGUAGE = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  css: 'css', html: 'html', json: 'json', md: 'markdown', mjs: 'javascript',
};

function languageForPath(path) {
  const ext = path.split('.').pop();
  return EXT_TO_LANGUAGE[ext] || 'plaintext';
}

export default function CodeEditor({ path, value, onChange, readOnly = false }) {
  const { theme } = useTheme();

  if (!path) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Select a file to view or edit its code.
      </div>
    );
  }

  return (
    <Editor
      key={path}
      height="100%"
      language={languageForPath(path)}
      value={value}
      onChange={(v) => onChange?.(v ?? '')}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 13,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
      }}
    />
  );
}
