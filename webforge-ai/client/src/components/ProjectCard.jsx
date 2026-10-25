import { Link } from 'react-router-dom';
import { MoreVertical, Trash2, Copy, Github } from 'lucide-react';
import Dropdown from './Dropdown';

const STATUS_STYLE = {
  ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  generating: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function ProjectCard({ project, onDelete, onDuplicate }) {
  return (
    <div className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <Link to={`/builder/${project._id}`} className="min-w-0">
          <h3 className="font-semibold truncate">{project.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{project.description || 'No description yet.'}</p>
        </Link>
        <Dropdown
          trigger={<button className="focus-ring rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><MoreVertical size={16} /></button>}
          items={[
            { label: 'Duplicate', icon: <Copy size={14} />, onClick: () => onDuplicate?.(project) },
            { label: 'Delete', icon: <Trash2 size={14} />, danger: true, onClick: () => onDelete?.(project) },
          ]}
        />
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_STYLE[project.status] || STATUS_STYLE.draft}`}>{project.status}</span>
        <div className="flex items-center gap-2 text-slate-400">
          {project.githubRepo?.url && <Github size={13} />}
          <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
