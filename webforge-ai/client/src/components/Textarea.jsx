export default function Textarea({ label, error, id, className = '', ...props }) {
  const inputId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`focus-ring w-full rounded-lg border px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 placeholder:text-slate-400 ${error ? 'border-red-500' : ''} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
