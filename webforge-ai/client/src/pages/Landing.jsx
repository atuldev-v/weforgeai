import { Link } from 'react-router-dom';
import { Sparkles, Layers, Eye, Wand2, Code2, Github, FolderKanban, Smartphone, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

const FEATURES = [
  { icon: Wand2, title: 'AI Website Generation', desc: 'Describe your site in plain language and get a complete, working project — not a mockup.' },
  { icon: Layers, title: 'Full-Stack Generation', desc: 'Frontend and backend generated together, with real API routes and database models when needed.' },
  { icon: Eye, title: 'Live Preview', desc: 'See your generated site render instantly, with desktop, tablet, and mobile views.' },
  { icon: Sparkles, title: 'AI Editing', desc: 'Ask for changes in plain English — only the relevant files are touched, nothing else breaks.' },
  { icon: Code2, title: 'Monaco Code Editor', desc: 'Full manual control with the same editor that powers VS Code.' },
  { icon: Github, title: 'GitHub Publishing', desc: 'Push your generated project straight to a new or existing GitHub repository.' },
  { icon: FolderKanban, title: 'Project Management', desc: 'Save, duplicate, rename, and version every project you generate.' },
  { icon: Smartphone, title: 'Responsive Design', desc: 'Every generated site is mobile-first and responsive out of the box.' },
];

const STEPS = [
  { n: '1', title: 'Describe', desc: 'Tell WebForge what you want to build, in your own words.' },
  { n: '2', title: 'Generate', desc: 'The AI plans and generates a complete, structured project.' },
  { n: '3', title: 'Customize', desc: 'Refine it with more prompts, or edit code directly in Monaco.' },
  { n: '4', title: 'Publish', desc: 'Download it, or push it straight to GitHub.' },
];

const FAQS = [
  { q: 'Is WebForge AI free?', a: 'Yes — WebForge AI itself is free and open-source. If you use a paid AI provider (like OpenAI) with your own API key, that provider may charge you for usage.' },
  { q: 'Do I need my own API key?', a: 'You can use a server-configured provider, bring your own OpenAI/Anthropic key, or try the built-in offline demo mode with no key at all.' },
  { q: 'Can I edit the generated code myself?', a: 'Yes — every generated project opens in a full Monaco editor alongside the live preview.' },
  { q: 'Can I deploy what I generate?', a: 'Download the project as a ZIP or publish it to GitHub, then deploy the frontend to Vercel/Netlify and the backend to Render/Railway/Fly.io.' },
];

export default function Landing() {
  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 px-3 py-1 text-xs font-medium text-slate-500">
          <Sparkles size={13} className="text-brand-600" /> Open-source AI website builder
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">Build complete websites with AI.</h1>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Describe what you want in plain language. WebForge AI generates a complete frontend and backend application —
          then lets you refine it with more prompts or edit the code directly.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/register"><Button size="lg">Start Building <ArrowRight size={16} /></Button></Link>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <Button variant="secondary" size="lg"><Github size={16} /> View on GitHub</Button>
          </a>
        </div>

        <div className="mt-16 mx-auto max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 text-left font-mono text-sm">
          <p className="text-slate-400"># prompt</p>
          <p className="mt-1">"Create a modern fitness website with pricing, trainers, and a contact form."</p>
          <p className="mt-4 text-slate-400"># → AI plans, generates frontend + backend + APIs → live preview</p>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Everything you need to ship a real site</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <Icon className="text-brand-600" size={20} />
              <h3 className="mt-3 font-semibold text-sm">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-50 dark:bg-slate-900/50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center">How it works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto h-9 w-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-sm">{s.n}</div>
                <h3 className="mt-3 font-semibold text-sm">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Free and open-source</h2>
        <p className="mt-3 text-slate-500">
          WebForge AI has no paid tiers. Connect your own OpenAI or Anthropic API key, or run it against a
          server-configured provider — usage costs, if any, come from that provider, not from WebForge.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Frequently asked questions</h2>
        <div className="mt-8 space-y-4">
          {FAQS.map((f) => (
            <details key={f.q} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <summary className="font-medium cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-sm text-slate-500">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} WebForge AI — open-source and free to use.
      </footer>
    </div>
  );
}
