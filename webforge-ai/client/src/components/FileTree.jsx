import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

function buildTree(files) {
  const root = [];
  for (const file of files) {
    const parts = file.path.split('/');
    let level = root;
    parts.forEach((part, idx) => {
      const isLeaf = idx === parts.length - 1;
      let node = level.find((n) => n.name === part);
      if (!node) {
        node = isLeaf ? { name: part, type: 'file', path: file.path } : { name: part, type: 'folder', children: [] };
        level.push(node);
      }
      if (!isLeaf) level = node.children;
    });
  }
  return root;
}

function TreeNode({ node, depth, activePath, onSelect }) {
  const [open, setOpen] = useState(true);

  if (node.type === 'file') {
    const active = node.path === activePath;
    return (
      <button
        onClick={() => onSelect(node.path)}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        className={`focus-ring flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left text-sm truncate ${
          active ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
        }`}
        title={node.path}
      >
        <File size={13} className="shrink-0 opacity-60" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
        className="focus-ring flex w-full items-center gap-1 rounded-md py-1 pr-2 text-left text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <Folder size={13} className="shrink-0" />
        <span className="truncate">{node.name}</span>
      </button>
      {open && node.children.map((child) => (
        <TreeNode key={child.path || child.name} node={child} depth={depth + 1} activePath={activePath} onSelect={onSelect} />
      ))}
    </div>
  );
}

export default function FileTree({ files, activePath, onSelect }) {
  const tree = buildTree(files);
  if (files.length === 0) {
    return <p className="p-4 text-sm text-slate-400">No files yet — generate a website to see the project tree.</p>;
  }
  return (
    <div className="py-2">
      {tree.map((node) => (
        <TreeNode key={node.path || node.name} node={node} depth={0} activePath={activePath} onSelect={onSelect} />
      ))}
    </div>
  );
}
