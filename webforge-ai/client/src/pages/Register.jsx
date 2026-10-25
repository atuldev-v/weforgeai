import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Navbar from '../components/Navbar';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (form.name.trim().length < 1) e.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.password.length < 8 || !/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      e.password = 'At least 8 characters, with a letter and a number.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard', { replace: true });
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
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Start building websites with AI — it's free.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Name" name="name" value={form.name} error={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required />
          <Input label="Email" type="email" name="email" value={form.email} error={errors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
          <Input label="Password" type="password" name="password" value={form.password} error={errors.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" required />
          <Button type="submit" className="w-full" loading={loading}>Create account</Button>
        </form>
        <p className="mt-5 text-sm text-center text-slate-500">
          Already have an account? <Link to="/login" className="text-brand-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
