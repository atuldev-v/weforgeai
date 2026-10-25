import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }
    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [params]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <div className="max-w-sm mx-auto px-6 pt-16 text-center">
        {status === 'loading' && <p className="text-slate-500">Verifying your email…</p>}
        {status === 'success' && <p className="text-green-600">Your email has been verified!</p>}
        {status === 'error' && <p className="text-red-600">This verification link is invalid or has expired.</p>}
        <Link to="/dashboard" className="mt-4 inline-block text-brand-600 hover:underline text-sm">Go to dashboard</Link>
      </div>
    </div>
  );
}
