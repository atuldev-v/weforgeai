import ProjectCard from './ProjectCard';
import EmptyState from './EmptyState';
import { ListSkeleton } from './LoadingSkeleton';
import ErrorState from './ErrorState';
import { FolderKanban } from 'lucide-react';
import Button from './Button';
import { Link } from 'react-router-dom';

export default function ProjectList({ projects, loading, error, onRetry, onDelete, onDuplicate }) {
  if (loading) return <ListSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon={<FolderKanban size={32} />}
        title="No projects yet"
        description="Generate your first AI-built website to see it here."
        action={<Link to="/projects/new"><Button>Create your first project</Button></Link>}
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p._id} project={p} onDelete={onDelete} onDuplicate={onDuplicate} />
      ))}
    </div>
  );
}
