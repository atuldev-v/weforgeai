import { Link } from 'react-router-dom';
import { Github, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Button from './Button';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Sparkles className="text-brand-600" size={20} />
          WebForge AI
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="/#features" className="hover:text-slate-900 dark:hover:text-white">Features</a>
          <a href="/#how-it-works" className="hover:text-slate-900 dark:hover:text-white">How it Works</a>
          <a href="/#pricing" className="hover:text-slate-900 dark:hover:text-white">Pricing</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
            <Github size={16} /> GitHub
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link to="/dashboard"><Button size="sm">Dashboard</Button></Link>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/register"><Button size="sm">Get Started</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
