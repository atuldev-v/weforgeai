import { useMemo, useState } from 'react';
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from 'lucide-react';
import { buildPreviewDocument } from '../lib/previewBuilder';

const SIZES = {
  desktop: { width: '100%', label: 'Desktop', icon: Monitor },
  tablet: { width: '768px', label: 'Tablet', icon: Tablet },
  mobile: { width: '390px', label: 'Mobile', icon: Smartphone },
};

export default function PreviewFrame({ files }) {
  const [device, setDevice] = useState('desktop');
  const [reloadKey, setReloadKey] = useState(0);

  const doc = useMemo(() => buildPreviewDocument(files), [files, reloadKey]);

  function openInNewTab() {
    const blob = new Blob([doc], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="flex h-full flex-col bg-slate-100 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-3 py-2 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-1">
          {Object.entries(SIZES).map(([key, { label, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              aria-label={label}
              title={label}
              className={`focus-ring rounded-md p-1.5 ${device === key ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setReloadKey((k) => k + 1)} title="Refresh" className="focus-ring rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <RefreshCw size={15} />
          </button>
          <button onClick={openInNewTab} title="Open in new tab" className="focus-ring rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ExternalLink size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex justify-center p-3">
        <div style={{ width: SIZES[device].width, maxWidth: '100%' }} className="h-full bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200">
          <iframe
            key={reloadKey}
            title="Website preview"
            srcDoc={doc}
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
