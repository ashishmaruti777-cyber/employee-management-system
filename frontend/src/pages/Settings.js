import React, { useEffect, useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
import { settingsAPI } from '../api/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsAPI.getAll().then((r) => { setSettings(r.data.data || {}); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleChange = (key, value, category) => {
    setSettings((prev) => ({ ...prev, [category]: { ...(prev[category] || {}), [key]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const allSettings = {};
      Object.values(settings).forEach((cat) => Object.entries(cat).forEach(([k, v]) => { allSettings[k] = v; }));
      await settingsAPI.update({ settings: allSettings });
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'basic', label: 'Basic Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { key: 'leave', label: 'Leave Policies', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { key: 'payroll', label: 'Payroll Settings', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { key: 'email', label: 'Email Settings', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { key: 'ui', label: 'UI Settings', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  ];

  const tabDescriptions = {
    basic: 'Configure general application settings and company information.',
    leave: 'Manage leave types, quotas, and approval policies.',
    payroll: 'Set up salary components, tax rules, and payment schedules.',
    email: 'Configure email templates, SMTP settings, and notification preferences.',
    ui: 'Customize the appearance and layout of the application.',
  };

  const fieldLabels = {
    company_name: 'Company Name',
    company_email: 'Company Email',
    company_phone: 'Company Phone',
    company_address: 'Company Address',
    date_format: 'Date Format',
    timezone: 'Timezone',
    currency: 'Currency',
    fiscal_year_start: 'Fiscal Year Start',
    annual_leave_days: 'Annual Leave Days',
    sick_leave_days: 'Sick Leave Days',
    casual_leave_days: 'Casual Leave Days',
    leave_approval_required: 'Leave Approval Required',
    carry_forward: 'Carry Forward Unused Leave',
    max_carry_forward: 'Max Carry Forward Days',
    payroll_frequency: 'Payroll Frequency',
    tax_enabled: 'Tax Enabled',
    auto_generate_payslip: 'Auto Generate Payslip',
    payment_terms_days: 'Payment Terms (Days)',
    smtp_host: 'SMTP Host',
    smtp_port: 'SMTP Port',
    smtp_username: 'SMTP Username',
    smtp_password: 'SMTP Password',
    email_from_name: 'From Name',
    email_from_address: 'From Email Address',
    email_notifications: 'Enable Email Notifications',
    leave_request_notification: 'Leave Request Notifications',
    payroll_notification: 'Payroll Processing Notifications',
    attendance_notification: 'Attendance Notifications',
    theme: 'Theme',
    sidebar_collapsed: 'Collapsed Sidebar',
    compact_mode: 'Compact Mode',
    show_avatars: 'Show Employee Avatars',
    items_per_page: 'Items Per Page',
  };

  const formatFieldName = (key) => {
    if (fieldLabels[key]) return fieldLabels[key];
    return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getFieldType = (key, value) => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (key.includes('password') || key.includes('secret')) return 'password';
    if (key.includes('email') || key.includes('address') || key.includes('host')) return 'text';
    return 'text';
  };

  const renderToggle = (key, value, category) => (
    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text)', marginBottom: 2 }}>{formatFieldName(key)}</label>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Configure this setting as needed</p>
      </div>
      <div style={{ position: 'relative', marginLeft: 16 }}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => handleChange(key, e.target.checked, category)}
          style={{ display: 'none' }}
          id={`toggle-${key}`}
        />
        <label
          htmlFor={`toggle-${key}`}
          style={{
            display: 'block', width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
            background: value ? 'var(--primary)' : 'var(--bg-alt)',
            border: `2px solid ${value ? 'var(--primary)' : 'var(--border)'}`,
            transition: 'var(--transition)', position: 'relative',
          }}
        >
          <span style={{
            position: 'absolute', top: value ? 1 : 2, left: value ? 20 : 1,
            width: value ? 20 : 18, height: value ? 20 : 18, borderRadius: '50%',
            background: 'white', boxShadow: 'var(--shadow-xs)', transition: 'var(--transition)',
          }} />
        </label>
      </div>
    </div>
  );

  const renderTextField = (key, value, category) => {
    const fieldType = getFieldType(key, value);
    return (
      <div key={key} className="form-group">
        <label>{formatFieldName(key)}</label>
        <input
          type={fieldType}
          value={value}
          onChange={(e) => handleChange(key, e.target.value, category)}
          placeholder={`Enter ${formatFieldName(key).toLowerCase()}`}
        />
      </div>
    );
  };

  const renderNumberField = (key, value, category) => (
    <div key={key} className="form-group">
      <label>{formatFieldName(key)}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => handleChange(key, Number(e.target.value), category)}
        min={0}
      />
    </div>
  );

  const renderSelectField = (key, value, category) => {
    const options = {
      date_format: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'DD-MM-YYYY'],
      timezone: ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo'],
      currency: ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY', 'AED'],
      fiscal_year_start: ['January', 'April', 'July', 'October'],
      payroll_frequency: ['Monthly', 'Bi-Weekly', 'Weekly', 'Quarterly'],
      payment_terms_days: ['15', '30', '45', '60', '90'],
      smtp_port: ['25', '465', '587', '2525'],
      theme: ['Light', 'Dark', 'System Default'],
      items_per_page: ['10', '25', '50', '100'],
    };

    const choices = options[key] || [];
    return (
      <div key={key} className="form-group">
        <label>{formatFieldName(key)}</label>
        <select value={value} onChange={(e) => handleChange(key, e.target.value, category)}>
          {choices.length > 0 ? (
            choices.map((opt) => <option key={opt} value={opt}>{opt}</option>)
          ) : (
            <>
              <option value={String(value)}>{String(value)}</option>
            </>
          )}
        </select>
      </div>
    );
  };

  const renderFields = () => {
    const cat = settings[activeTab] || {};
    const entries = Object.entries(cat);

    if (entries.length === 0) {
      return (
        <div className="empty-state" style={{ padding: '60px 20px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.3 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3>No settings available</h3>
          <p>Settings for this category haven't been configured yet.</p>
        </div>
      );
    }

    const booleans = entries.filter(([_, v]) => typeof v === 'boolean');
    const others = entries.filter(([_, v]) => typeof v !== 'boolean');

    return (
      <div style={{ maxWidth: 640 }}>
        {others.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Configuration</h4>
              <div style={{ height: 1, background: 'var(--border-light)' }} />
            </div>
            <div className="form-row">
              {others.map(([key, value]) => {
                if (typeof value === 'number') return renderNumberField(key, value, activeTab);
                const selectFields = ['date_format', 'timezone', 'currency', 'fiscal_year_start', 'payroll_frequency', 'payment_terms_days', 'smtp_port', 'theme', 'items_per_page'];
                if (selectFields.includes(key)) return renderSelectField(key, value, activeTab);
                return renderTextField(key, value, activeTab);
              })}
            </div>
          </div>
        )}

        {booleans.length > 0 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Preferences</h4>
              <div style={{ height: 1, background: 'var(--border-light)' }} />
            </div>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '4px 20px' }}>
              {booleans.map(([key, value]) => renderToggle(key, value, activeTab))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1>Settings</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>{tabDescriptions[activeTab]}</p>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-outline" onClick={() => settingsAPI.getAll().then((r) => { setSettings(r.data.data || {}); toast.success('Settings reloaded'); })} disabled={saving}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Reset
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Saving...
                </span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ width: 240, padding: '20px 0', borderRight: '1px solid var(--border-light)', flexShrink: 0 }}>
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '11px 20px', border: 'none', background: activeTab === t.key ? 'var(--primary-50)' : 'transparent',
                    cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                    color: activeTab === t.key ? 'var(--primary)' : 'var(--text-secondary)',
                    transition: 'var(--transition)', textAlign: 'left', borderRight: activeTab === t.key ? '3px solid var(--primary)' : '3px solid transparent',
                    fontFamily: 'inherit',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18, opacity: activeTab === t.key ? 1 : 0.5 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                  </svg>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, padding: 28 }}>
              {loading ? (
                <Loading />
              ) : (
                renderFields()
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <div style={{ flex: 1, background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>Changes are saved immediately</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Click "Save Settings" to apply all modifications across the system.</p>
            </div>
          </div>
          <div style={{ flex: 1, background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>Some settings require admin approval</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Critical changes may need administrator confirmation before taking effect.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
