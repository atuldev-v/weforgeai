import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusSquare, Github, FolderKanban, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ProjectList from '../components/ProjectList';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState(null);
  const [githubStatus, setGithubStatus] = useState(null);

  async function load() {
    setError(null);
    setProjects(null);
    try {
      const [projectsRes, githubRes] = await Promise.all([
        api.get('/projects', { params: { limit: 6, sort: '-updatedAt' } }),
        api.get('/github/status').catch(() => ({ data: { data: { connected: false } } })),
      ]);
      setProjects(projectsRes.data.data.projects);
      setGithubStatus(githubRes.data.data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(project) {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/projects/${project._id}`);
      toast.success('Project deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDuplicate(project) {
    try {
      await api.post(`/projects/${project._id}/duplicate`);
      toast.success('Project duplicated');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening with your projects.</p>
        </div>
        <Link to="/projects/new"><Button><PlusSquare size={16} /> Create New Website</Button></Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={FolderKanban} label="Total projects" value={projects?.length ?? '—'} />
        <StatCard icon={Clock} label="Recently edited" value={projects?.[0]?.name || '—'} small />
        <StatCard icon={Github} label="GitHub" value={githubStatus?.connected ? `Connected as ${githubStatus.githubUsername}` : 'Not connected'} small />
      </div>

      <div className="mt-10">
        <h2 className="font-semibold mb-4">Recent projects</h2>
        <ProjectList projects={projects} loading={projects === null && !error} error={error} onRetry={load} onDelete={handleDelete} onDuplicate={handleDuplicate} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, small }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
        <Icon size={14} /> {label}
      </div>
      <p className={`mt-1.5 font-semibold ${small ? 'text-sm truncate' : 'text-2xl'}`}>{value}</p>
    </div>
  );
}
