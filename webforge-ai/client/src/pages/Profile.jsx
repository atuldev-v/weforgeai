import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/profile', { name });
      setUser(res.data.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold">Profile</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input label="Email" value={user?.email || ''} disabled />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Button type="submit" loading={saving}>Save changes</Button>
      </form>
    </div>
  );
}
