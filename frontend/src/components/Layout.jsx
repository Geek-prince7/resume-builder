import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AdSlot from './AdSlot';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/profile', label: 'Profile' },
  { to: '/profile-variants', label: 'Variants' },
  { to: '/generate', label: 'Generate Resume' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/billing', label: 'Usage' },
  { to: '/account', label: 'Account' },
];

export default function Layout() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="text-xl font-bold text-indigo-600">
              ResumeAI
            </NavLink>
            <div className="flex items-center gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <AdSlot
          slot={import.meta.env.VITE_ADSENSE_SLOT_HEADER}
          className="bg-white rounded-lg border border-gray-200 p-2"
          minHeight={100}
        />
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
