import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
      <AlertTriangle className="text-red-500 mb-3" size={28} />
      <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
