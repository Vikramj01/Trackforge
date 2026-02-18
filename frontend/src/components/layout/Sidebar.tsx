import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Zap,
  Plus,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/templates', icon: FileText, label: 'Templates' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside
      style={{
        width: '248px',
        minWidth: '248px',
        backgroundColor: '#0A0D15',
        borderRight: '1px solid #1A1E28',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '1.5rem',
          borderBottom: '1px solid #1A1E28',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #0BBFAA, #099d8b)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Zap size={18} color="#080B12" strokeWidth={2.5} />
        </div>
        <span
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#E8ECF2',
            letterSpacing: '-0.02em',
          }}
        >
          ATLAS
        </span>
      </div>

      {/* New Project Button */}
      <div style={{ padding: '1rem' }}>
        <button
          onClick={() => navigate('/wizard')}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #0BBFAA, #099d8b)',
            color: '#080B12',
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '0.625rem 1rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.5rem' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: '8px',
              marginBottom: '0.25rem',
              color: isActive ? '#0BBFAA' : '#7A8599',
              backgroundColor: isActive ? 'rgba(11,191,170,0.1)' : 'transparent',
              fontWeight: isActive ? 500 : 400,
              fontSize: '0.875rem',
              transition: 'all 0.15s',
              textDecoration: 'none',
            })}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              if (!el.classList.contains('active')) {
                el.style.color = '#E8ECF2';
                el.style.backgroundColor = '#1A1E28';
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              if (!el.classList.contains('active')) {
                el.style.color = '#7A8599';
                el.style.backgroundColor = 'transparent';
              }
            }}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid #1A1E28',
        }}
      >
        <NavLink
          to="/help"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 0.875rem',
            borderRadius: '8px',
            color: '#7A8599',
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          <HelpCircle size={18} />
          Help & Support
        </NavLink>
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            backgroundColor: '#12161E',
            borderRadius: '8px',
            border: '1px solid #1A1E28',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#7A8599', marginBottom: '0.25rem' }}>
            Agency Plan
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#E8ECF2', fontWeight: 500 }}>
            3 / 10 clients used
          </div>
          <div
            style={{
              height: '3px',
              backgroundColor: '#1A1E28',
              borderRadius: '2px',
              marginTop: '0.5rem',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '30%',
                height: '100%',
                background: 'linear-gradient(90deg, #0BBFAA, #099d8b)',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
