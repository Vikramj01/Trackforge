import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Clients', icon: Users, href: '/clients' },
  { name: 'Templates', icon: FileText, href: '/templates' },
  { name: 'Billing', icon: CreditCard, href: '/billing' },
  { name: 'Settings', icon: Settings, href: '/settings' },
  { name: 'Help', icon: HelpCircle, href: '/help' },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div
      style={{ width: '248px', fontFamily: 'Inter, sans-serif' }}
      className="h-screen bg-card-bg border-r border-border flex flex-col fixed left-0 top-0 z-20"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img
            src="/atlas-logo.svg"
            alt="Atlas"
            style={{ width: '28px', height: '28px' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div
            style={{
              width: '28px',
              height: '28px',
              background: 'linear-gradient(135deg, #14DFC8 0%, #0BBFAA 60%, #085A50 100%)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '700',
              color: '#080B12',
            }}
          >
            A
          </div>
          <span
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700,
              fontSize: '18px',
              letterSpacing: '0.08em',
              color: '#E8ECF2',
            }}
          >
            ATLAS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                isActive
                  ? 'bg-atlas-teal/10 text-atlas-teal border border-atlas-teal/20'
                  : 'text-text-muted hover:text-text-primary hover:bg-hover-bg border border-transparent'
              }`
            }
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: plan badge + sign out */}
      <div className="p-4 border-t border-border space-y-3">
        <div
          className="px-3 py-2 rounded-lg text-center"
          style={{
            background: 'rgba(11, 191, 170, 0.05)',
            border: '1px solid rgba(11, 191, 170, 0.15)',
          }}
        >
          <p className="text-xs font-semibold text-atlas-teal capitalize" style={{ letterSpacing: '0.05em' }}>
            {profile?.plan ?? 'free'} plan
          </p>
          <p className="text-xs text-text-muted mt-0.5">ATLAS v1.0</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-hover-bg transition-all duration-150 text-sm font-medium"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}
