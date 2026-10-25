import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Save, Undo2, Redo2, Download, Github, Rocket, Eye, Code2, History,
} from 'lucide-react';
import { api } from '../lib/api';
import PromptInput from '../components/PromptInput';
import AIMessage from '../components/AIMessage';
import PreviewFrame from '../components/PreviewFrame';
import FileTree from '../components/FileTree';
import CodeEditor from '../components/CodeEditor';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import ErrorState from '../components/ErrorState';

export default function Builder() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [activePath, setActivePath] = useState(null);
  const [rightTab, setRightTab] = useState('preview'); // 'preview' | 'code'
  const [messages, setMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const undoStack = useRef([]);
  const redoStack = useRef([]);

  const [publishOpen, setPublishOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data.data.project);
      setActivePath(res.data.data.project.files[0]?.path || null);
      if (res.data.data.project.lastPrompt) {
        setMessages([{ role: 'assistant', content: `Loaded "${res.data.data.project.name}".` }]);
      }
    } catch (err) {
      setLoadError(err.message);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  function pushUndoSnapshot() {
    if (!project) return;
    undoStack.current.push(project.files);
    redoStack.current = [];
  }

  function setFiles(newFiles, { snapshot = true } = {}) {
    if (snapshot) pushUndoSnapshot();
    setProject((p) => ({ ...p, files: newFiles }));
    setDirty(true);
  }

  function handleUndo() {
    if (undoStack.current.length === 0) return;
    redoStack.current.push(project.files);
    const prev = undoStack.current.pop();
    setProject((p) => ({ ...p, files: prev }));
    setDirty(true);
  }

  function handleRedo() {
    if (redoStack.current.length === 0) return;
    undoStack.current.push(project.files);
    const next = redoStack.current.pop();
    setProject((p) => ({ ...p, files: next }));
    setDirty(true);
  }

  function handleEditorChange(newContent) {
    if (!activePath) return;
    const newFiles = project.files.map((f) => (f.path === activePath ? { ...f, content: newContent } : f));
    setFiles(newFiles);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.put(`/projects/${projectId}`, { files: project.files, name: project.name });
      setProject(res.data.data.project);
      setDirty(false);
      toast.success('Project saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAiSubmit(instruction) {
    setMessages((m) => [...m, { role: 'user', content: instruction }]);
    setAiLoading(true);
    try {
      const res = await api.post('/ai/modify', { projectId, instruction });
      pushUndoSnapshot();
      setProject(res.data.data.project);
      setDirty(false);
      setMessages((m) => [...m, { role: 'assistant', content: res.data.data.explanation || 'Done!', changedFiles: res.data.data.changedFiles }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: `I couldn't make that change: ${err.message}` }]);
      toast.error(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleDownload() {
    try {
      const res = await api.get(`/projects/${projectId}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || 'Unable to download project.');
    }
  }

  if (loadError) return <div className="p-8"><ErrorState message={loadError} onRetry={load} /></div>;
  if (!project) return <div className="p-8 text-sm text-slate-400">Loading project…</div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Top toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/projects" className="focus-ring rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft size={17} /></Link>
          <input
            value={project.name}
            onChange={(e) => { setProject((p) => ({ ...p, name: e.target.value })); setDirty(true); }}
            className="focus-ring font-semibold bg-transparent rounded px-1.5 py-0.5 truncate max-w-xs"
          />
          {dirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={handleUndo} title="Undo"><Undo2 size={15} /></Button>
          <Button variant="ghost" size="sm" onClick={handleRedo} title="Redo"><Redo2 size={15} /></Button>
          <Button variant="ghost" size="sm" onClick={() => setVersionsOpen(true)} title="Version history"><History size={15} /></Button>
          <Button variant="secondary" size="sm" onClick={handleSave} loading={saving}><Save size={14} /> Save</Button>
          <Button variant="secondary" size="sm" onClick={handleDownload}><Download size={14} /> Download</Button>
          <Button variant="secondary" size="sm" onClick={() => setPublishOpen(true)}><Github size={14} /> GitHub</Button>
          <Button size="sm" onClick={() => toast('Connect a hosting provider from your own account to deploy — see the README for Vercel/Netlify/Render instructions.')}>
            <Rocket size={14} /> Deploy
          </Button>
        </div>
      </div>

      {/* Main 3-pane layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: AI assistant */}
        <div className="w-80 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-slate-400">Ask WebForge AI to change anything — "make the hero blue", "add a pricing section", "add login functionality".</p>
            )}
            {messages.map((m, i) => <AIMessage key={i} {...m} />)}
            {aiLoading && <AIMessage role="assistant" content="Working on it…" />}
          </div>
          <PromptInput onSubmit={handleAiSubmit} loading={aiLoading} />
        </div>

        {/* Center: preview / code toggle */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 px-3 py-1.5">
            <TabButton active={rightTab === 'preview'} onClick={() => setRightTab('preview')} icon={Eye} label="Preview" />
            <TabButton active={rightTab === 'code'} onClick={() => setRightTab('code')} icon={Code2} label="Code" />
          </div>
          <div className="flex-1 min-h-0">
            {rightTab === 'preview' ? (
              <PreviewFrame files={project.files} />
            ) : (
              <div className="flex h-full">
                <div className="w-56 shrink-0 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
                  <FileTree files={project.files} activePath={activePath} onSelect={setActivePath} />
                </div>
                <div className="flex-1 min-w-0">
                  <CodeEditor
                    path={activePath}
                    value={project.files.find((f) => f.path === activePath)?.content || ''}
                    onChange={handleEditorChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PublishModal open={publishOpen} onClose={() => setPublishOpen(false)} projectId={projectId} project={project} onPublished={setProject} />
      <VersionsModal open={versionsOpen} onClose={() => setVersionsOpen(false)} projectId={projectId} onRestored={(p) => { setProject(p); setDirty(false); }} />
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
        active ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={13} /> {label}
    </button>
  );
}

function PublishModal({ open, onClose, projectId, project, onPublished }) {
  const [repoName, setRepoName] = useState(project?.name?.toLowerCase().replace(/\s+/g, '-') || '');
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    try {
      const res = await api.post('/github/publish', { projectId, repoName, isPrivate });
      onPublished(res.data.data.project);
      toast.success('Published to GitHub!');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePush() {
    setLoading(true);
    try {
      const res = await api.post('/github/push', { projectId });
      onPublished(res.data.data.project);
      toast.success('Changes pushed to GitHub!');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const alreadyPublished = Boolean(project?.githubRepo?.name);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={alreadyPublished ? 'Push changes to GitHub' : 'Publish to GitHub'}
      footer={
        alreadyPublished ? (
          <Button onClick={handlePush} loading={loading}>Push changes</Button>
        ) : (
          <Button onClick={handlePublish} loading={loading}>Publish</Button>
        )
      }
    >
      {alreadyPublished ? (
        <p className="text-sm text-slate-500">
          This project is already published at{' '}
          <a href={project.githubRepo.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{project.githubRepo.url}</a>.
          Push your latest changes as a new commit.
        </p>
      ) : (
        <div className="space-y-3">
          <Input label="Repository name" value={repoName} onChange={(e) => setRepoName(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            Private repository
          </label>
          <p className="text-xs text-slate-400">You'll need to connect GitHub first from Settings if you haven't already.</p>
        </div>
      )}
    </Modal>
  );
}

function VersionsModal({ open, onClose, projectId, onRestored }) {
  const [versions, setVersions] = useState(null);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    if (!open) return;
    api.get(`/versions/${projectId}`).then((res) => setVersions(res.data.data.versions)).catch(() => setVersions([]));
  }, [open, projectId]);

  async function handleRestore(versionId) {
    setRestoring(versionId);
    try {
      const res = await api.post(`/versions/${projectId}/${versionId}/restore`);
      onRestored(res.data.data.project);
      toast.success('Version restored');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRestoring(null);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Version history">
      {!versions ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : versions.length === 0 ? (
        <p className="text-sm text-slate-400">No versions yet — versions are created automatically before AI edits and manual saves.</p>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-y-auto">
          {versions.map((v) => (
            <li key={v._id} className="flex items-center justify-between text-sm border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{v.label || v.reason}</p>
                <p className="text-xs text-slate-400">{new Date(v.createdAt).toLocaleString()}</p>
              </div>
              <Button size="sm" variant="secondary" loading={restoring === v._id} onClick={() => handleRestore(v._id)}>Restore</Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
