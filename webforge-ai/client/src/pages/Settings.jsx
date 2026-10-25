import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Github, KeyRound, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import Button from '../components/Button';
import Input from '../components/Input';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Settings() {
  const [params] = useSearchParams();
  const [githubStatus, setGithubStatus] = useState(null);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [byokProvider, setByokProvider] = useState('openai');
  const [byokKey, setByokKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  async function loadGithub() {
    try {
      const res = await api.get('/github/status');
      setGithubStatus(res.data.data);
    } catch {
      setGithubStatus({ connected: false });
    }
  }

  useEffect(() => {
    loadGithub();
    if (params.get('github') === 'connected') toast.success('GitHub connected!');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConnect() {
    try {
      const res = await api.get('/github/connect');
      window.location.href = res.data.data.url;
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDisconnect() {
    try {
      await api.post('/github/disconnect');
      toast.success('GitHub disconnected');
      setDisconnectOpen(false);
      loadGithub();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleSaveKey(e) {
    e.preventDefault();
    setSavingKey(true);
    try {
      await api.post('/users/byok', { provider: byokProvider, apiKey: byokKey });
      toast.success('API key saved — it will be used for your generations.');
      setByokKey('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingKey(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl space-y-10">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section>
        <h2 className="font-semibold flex items-center gap-2"><Github size={18} /> GitHub</h2>
        <p className="text-sm text-slate-500 mt-1">Connect GitHub to publish generated projects as repositories.</p>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          {githubStatus?.connected ? (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-green-600" />
              Connected as <strong>{githubStatus.githubUsername}</strong>
            </div>
          ) : (
            <span className="text-sm text-slate-500">Not connected</span>
          )}
          {githubStatus?.connected ? (
            <Button variant="danger" size="sm" onClick={() => setDisconnectOpen(true)}>Disconnect</Button>
          ) : (
            <Button size="sm" onClick={handleConnect}>Connect GitHub</Button>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-semibold flex items-center gap-2"><KeyRound size={18} /> Bring your own AI key (optional)</h2>
        <p className="text-sm text-slate-500 mt-1">
          Supply your own OpenAI or Anthropic API key to use it for your generations instead of the server default.
          Your key is encrypted at rest and never shown again after saving.
        </p>
        <form onSubmit={handleSaveKey} className="mt-4 space-y-3 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex gap-2">
            <select value={byokProvider} onChange={(e) => setByokProvider(e.target.value)} className="focus-ring rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
            <Input type="password" placeholder="sk-…" value={byokKey} onChange={(e) => setByokKey(e.target.value)} className="flex-1" />
          </div>
          <Button type="submit" size="sm" loading={savingKey} disabled={byokKey.length < 10}>Save key</Button>
        </form>
      </section>

      <ConfirmDialog
        open={disconnectOpen}
        onClose={() => setDisconnectOpen(false)}
        onConfirm={handleDisconnect}
        title="Disconnect GitHub?"
        description="You'll need to reconnect to publish or push project updates."
        confirmLabel="Disconnect"
        danger
      />
    </div>
  );
}
