import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from './Button';

const EXAMPLES = [
  'Make the hero section blue.',
  'Add a pricing section.',
  'Make the website mobile responsive.',
  'Add login functionality.',
];

export default function PromptInput({ onSubmit, loading, placeholder = 'Describe what you want to change…' }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setValue('');
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 p-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e);
          }}
          placeholder={placeholder}
          rows={2}
          className="focus-ring flex-1 resize-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        />
        <Button type="submit" loading={loading} disabled={!value.trim()} aria-label="Send">
          <Send size={15} />
        </Button>
      </form>
      {!loading && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setValue(ex)}
              className="focus-ring rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
