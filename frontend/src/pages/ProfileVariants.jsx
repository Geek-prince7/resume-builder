import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createProfileVariant, deleteProfileVariant, getProfileVariants } from '../api';

export default function ProfileVariants() {
  const [variants, setVariants] = useState([]);
  const [form, setForm] = useState({ name: '', targetRole: '', summary: '', skillNames: '' });

  const load = () => getProfileVariants().then((res) => setVariants(res.data));
  useEffect(() => { load().catch(() => toast.error('Could not load variants')); }, []);

  const create = async (event) => {
    event.preventDefault();
    try {
      await createProfileVariant({
        ...form,
        skillNames: form.skillNames.split(',').map((item) => item.trim()).filter(Boolean),
      });
      setForm({ name: '', targetRole: '', summary: '', skillNames: '' });
      await load();
      toast.success('Profile variant created');
    } catch (error) { toast.error(error.response?.data?.error || 'Could not create variant'); }
  };

  const remove = async (id) => {
    await deleteProfileVariant(id);
    setVariants((items) => items.filter((item) => item._id !== id));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={create} className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-bold text-gray-900">New profile variant</h1>
        <p className="mb-5 mt-1 text-sm text-gray-500">Create role-specific subsets without changing your master profile.</p>
        <div className="space-y-4">
          <input required placeholder="Variant name (e.g. Backend)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
          <input placeholder="Target role" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
          <textarea rows={5} placeholder="Optional variant summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
          <input placeholder="Skills to include, comma-separated" value={form.skillNames} onChange={(e) => setForm({ ...form, skillNames: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
          <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Create variant</button>
        </div>
      </form>
      <section><h2 className="mb-4 text-xl font-bold text-gray-900">Saved variants</h2><div className="space-y-3">
        {variants.map((variant) => <article key={variant._id} className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex justify-between"><div><h3 className="font-semibold">{variant.name}</h3><p className="text-sm text-gray-500">{variant.targetRole || 'Any role'}</p></div><button onClick={() => remove(variant._id)} className="text-sm text-red-600">Delete</button></div><p className="mt-3 text-sm text-gray-600">{variant.skillNames?.join(', ') || 'Uses all profile skills'}</p></article>)}
        {!variants.length && <p className="rounded-xl border border-dashed p-8 text-center text-gray-500">No variants yet.</p>}
      </div></section>
    </div>
  );
}
