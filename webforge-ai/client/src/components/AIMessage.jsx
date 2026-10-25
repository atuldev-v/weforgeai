import { Bot, User, FileCode } from 'lucide-react';

export default function AIMessage({ role, content, changedFiles }) {
  const isUser = role === 'user';
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isUser ? 'bg-slate-200 dark:bg-slate-700' : 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'}`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${isUser ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'}`}>
        <p className="whitespace-pre-wrap">{content}</p>
        {changedFiles?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs opacity-80">
            {changedFiles.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded bg-black/10 px-1.5 py-0.5">
                <FileCode size={11} /> {f.split('/').pop()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
