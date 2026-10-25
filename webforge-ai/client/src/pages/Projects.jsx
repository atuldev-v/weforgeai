import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusSquare } from 'lucide-react';
import { api } from '../lib/api';
import Button from '../components/Button';
import Input from '../components/Input';
import ProjectList from '../components/ProjectList';
import toast from 'react-hot-toast';

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-updatedAt');

  async function load() {
    setError(null);
    try {
      const res = await api.get('/projects', { params: { search, sort, limit: 50 } });
      setProjects(res.data.data.projects);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce search
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort]);

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <Link to="/projects/new"><Button><PlusSquare size={16} /> Create Project</Button></Link>
      </div>

      <div className="mt-5 flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="focus-ring rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
          <option value="-updatedAt">Recently updated</option>
          <option value="-createdAt">Recently created</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      <div className="mt-6">
        <ProjectList projects={projects} loading={projects === null && !error} error={error} onRetry={load} onDelete={handleDelete} onDuplicate={handleDuplicate} />
      </div>
    </div>
  );
}
