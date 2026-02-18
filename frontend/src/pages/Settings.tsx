import { useState } from 'react';
import { Save, User, Bell, Shield, CreditCard, Zap } from 'lucide-react';

export default function Settings() {
  const [agencyName, setAgencyName] = useState('My Agency');
  const [email, setEmail] = useState('admin@myagency.com');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    backgroundColor: '#12161E',
    border: '1px solid #1A1E28',
    borderRadius: '8px',
    color: '#E8ECF2',
    padding: '0.625rem 0.875rem',
    width: '100%',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
  };

  const labelStyle = {
    display: 'block' as const,
    color: '#7A8599',
    fontSize: '0.8125rem',
    fontWeight: 500 as const,
    marginBottom: '0.375rem',
  };

  const sectionStyle = {
    backgroundColor: '#0D1117',
    border: '1px solid #1A1E28',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '720px' }}>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#E8ECF2', margin: 0, marginBottom: '0.375rem' }}>
        Settings
      </h1>
      <p style={{ color: '#7A8599', fontSize: '0.9rem', margin: 0, marginBottom: '2rem' }}>
        Manage your agency account and preferences.
      </p>

      {/* Agency Profile */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <User size={18} color="#0BBFAA" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#E8ECF2' }}>Agency Profile</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Agency Name</label>
            <input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#0BBFAA'} onBlur={(e) => e.target.style.borderColor = '#1A1E28'} />
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#0BBFAA'} onBlur={(e) => e.target.style.borderColor = '#1A1E28'} />
          </div>
        </div>
      </div>

      {/* Plan */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <Zap size={18} color="#0BBFAA" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#E8ECF2' }}>Current Plan</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#12161E', borderRadius: '8px', border: '1px solid #1A1E28' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#E8ECF2', marginBottom: '0.25rem' }}>Agency Plan</div>
            <div style={{ fontSize: '0.8125rem', color: '#7A8599' }}>3 / 10 clients · Unlimited projects · All templates</div>
          </div>
          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', backgroundColor: 'rgba(11,191,170,0.15)', color: '#0BBFAA', fontSize: '0.8125rem', fontWeight: 500 }}>Active</span>
        </div>
        <button style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #1A1E28', borderRadius: '8px', color: '#E8ECF2', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <CreditCard size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Manage Billing
        </button>
      </div>

      {/* Notifications */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <Bell size={18} color="#0BBFAA" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#E8ECF2' }}>Notifications</h2>
        </div>
        {[
          { label: 'Scan Completed', desc: 'When a site scan finishes' },
          { label: 'Deployment Ready', desc: 'When assets are ready to download' },
          { label: 'Weekly Summary', desc: 'Weekly overview of all projects' },
        ].map(({ label, desc }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid #1A1E28' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#E8ECF2', fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: '0.8125rem', color: '#7A8599' }}>{desc}</div>
            </div>
            <div style={{ width: '42px', height: '24px', backgroundColor: '#0BBFAA', borderRadius: '12px', cursor: 'pointer', position: 'relative' }}>
              <div style={{ width: '18px', height: '18px', backgroundColor: '#080B12', borderRadius: '50%', position: 'absolute', right: '3px', top: '3px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Security */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <Shield size={18} color="#0BBFAA" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#E8ECF2' }}>Security</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input type="password" placeholder="••••••••" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#0BBFAA'} onBlur={(e) => e.target.style.borderColor = '#1A1E28'} />
          </div>
          <div>
            <label style={labelStyle}>New Password</label>
            <input type="password" placeholder="••••••••" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#0BBFAA'} onBlur={(e) => e.target.style.borderColor = '#1A1E28'} />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        style={{ background: saved ? 'rgba(11,191,170,0.15)' : 'linear-gradient(135deg, #0BBFAA, #099d8b)', color: saved ? '#0BBFAA' : '#080B12', fontWeight: 600, fontSize: '0.875rem', padding: '0.625rem 1.5rem', borderRadius: '8px', border: saved ? '1px solid #0BBFAA' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <Save size={16} />
        {saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}
