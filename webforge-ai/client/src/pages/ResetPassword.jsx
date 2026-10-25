import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Navbar from '../components/Navbar';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error('Password must be at least 8 characters, with a letter and a number.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset — please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <div className="max-w-sm mx-auto px-6 pt-16">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        {!token && <p className="mt-4 text-sm text-red-600">Missing reset token. Use the link from your email.</p>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full" loading={loading} disabled={!token}>Reset password</Button>
        </form>
        <p className="mt-5 text-sm text-center text-slate-500">
          <Link to="/login" className="text-brand-600 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
