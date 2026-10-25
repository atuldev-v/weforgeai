import { useNavigate } from 'react-router-dom';
import { Briefcase, UtensilsCrossed, Rocket, ShoppingCart, Newspaper, Building2, LayoutTemplate, LayoutDashboard } from 'lucide-react';

const TEMPLATES = [
  { icon: Briefcase, name: 'Portfolio', prompt: 'Create a modern personal portfolio website with a hero introduction, projects grid, skills section, and contact form.' },
  { icon: UtensilsCrossed, name: 'Restaurant', prompt: 'Create a modern restaurant website with a hero section, menu, about section, testimonials, and a contact form with a Node.js backend.' },
  { icon: Rocket, name: 'SaaS', prompt: 'Create a modern SaaS landing page with a hero, feature grid, pricing tiers, testimonials, and a signup form.' },
  { icon: ShoppingCart, name: 'E-commerce', prompt: 'Create an e-commerce storefront with a homepage, product listing, product detail page, and a cart UI, with a Node.js backend for products and cart APIs.' },
  { icon: Newspaper, name: 'Blog', prompt: 'Create a clean, minimal blog homepage with a list of articles, an article detail layout, and an about page.' },
  { icon: Building2, name: 'Agency', prompt: 'Create a creative agency website with a bold hero, services section, portfolio showcase, team section, and contact form.' },
  { icon: LayoutTemplate, name: 'Landing Page', prompt: 'Create a high-converting product landing page with a hero, feature highlights, social proof, and a strong call to action.' },
  { icon: LayoutDashboard, name: 'Dashboard', prompt: 'Create an admin dashboard UI with a sidebar, stat cards, and a data table, using mock data.' },
];

export default function Templates() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold">Templates</h1>
      <p className="text-sm text-slate-500 mt-1">Start from a template prompt — you can edit it before generating.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TEMPLATES.map(({ icon: Icon, name, prompt }) => (
          <button
            key={name}
            onClick={() => navigate(`/projects/new?prompt=${encodeURIComponent(prompt)}`)}
            className="focus-ring text-left rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all bg-white dark:bg-slate-900"
          >
            <Icon className="text-brand-600" size={22} />
            <h3 className="mt-3 font-semibold">{name}</h3>
            <p className="mt-1 text-xs text-slate-500 line-clamp-3">{prompt}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
