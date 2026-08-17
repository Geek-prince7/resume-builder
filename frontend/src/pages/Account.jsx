import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { deleteAccount, exportAccount, logoutAllSessions } from '../api';
import { useUser } from '../context/UserContext';

export default function Account() {
  const { user, logout } = useUser(); const navigate = useNavigate();
  const download = async () => { const res = await exportAccount(); const url = URL.createObjectURL(res.data); const a = document.createElement('a'); a.href = url; a.download = 'resumeai-data.json'; a.click(); URL.revokeObjectURL(url); };
  const revoke = async () => { await logoutAllSessions(); await logout(); navigate('/login'); };
  const remove = async () => { if (!window.confirm('Permanently delete your account and all resumes?')) return; await deleteAccount(); localStorage.clear(); navigate('/signup'); };
  return <div className="mx-auto max-w-2xl"><h1 className="mb-6 text-2xl font-bold">Account</h1><section className="space-y-5 rounded-xl border bg-white p-6"><div><span className="text-sm text-gray-500">Email</span><p>{user?.email} {user?.emailVerified ? <span className="text-emerald-600">✓ verified</span> : <span className="text-amber-600">not verified</span>}</p></div><button onClick={download} className="rounded-lg border px-4 py-2 text-sm">Export all my data</button><button onClick={revoke} className="ml-2 rounded-lg border px-4 py-2 text-sm">Log out all devices</button><div className="border-t pt-5"><button onClick={remove} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Delete account permanently</button></div></section></div>;
}
