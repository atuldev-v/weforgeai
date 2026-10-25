import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wand2 } from 'lucide-react';
import { api } from '../lib/api';
import Textarea from '../components/Textarea';
import Button from '../components/Button';

const EXAMPLE = `Create a modern restaurant website called FreshBite.
Include a homepage, navigation bar, hero section, restaurant menu,
about section, testimonials, contact section and footer.
Use a modern dark theme. Make it responsive. Add a Node.js backend
with an API for contact form submissions.`;

export default function NewProject() {
  const [params] = useSearchParams();
  const [prompt, setPrompt] = useState(params.get('prompt') || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleGenerate(e) {
    e.preventDefault();
    if (prompt.trim().length < 5) {
      toast.error('Please describe the website you want in a bit more detail.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/ai/generate', { prompt });
      toast.success('Website generated!');
      navigate(`/builder/${res.data.data.project._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Wand2 className="text-brand-600" size={22} /> Describe your website</h1>
      <p className="text-sm text-slate-500 mt-1">Be as specific as you like — pages, sections, theme, and whether you need a backend.</p>

      <form onSubmit={handleGenerate} className="mt-6 space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={10}
          placeholder={EXAMPLE}
        />
        <div className="flex items-center gap-3">
          <Button type="submit" loading={loading}>Generate website</Button>
          <button type="button" onClick={() => setPrompt(EXAMPLE)} className="text-xs text-slate-500 hover:underline">
            Use example prompt
          </button>
        </div>
      </form>
    </div>
  );
}
