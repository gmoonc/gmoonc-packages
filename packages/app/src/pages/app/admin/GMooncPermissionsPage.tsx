import React, { useState } from 'react';

// Mock data (ported from legacy sicoop-app)
const mockRoles = [
  { id: '1', name: 'admin', description: 'Administrator role', is_system_role: true },
  { id: '2', name: 'user', description: 'Regular user role', is_system_role: true },
  { id: '3', name: 'manager', description: 'Manager role', is_system_role: false }
];

const mockModules = [
  { id: '1', name: 'admin', display_name: 'Admin' },
  { id: '2', name: 'technical', display_name: 'Technical' },
  { id: '3', name: 'customer', display_name: 'Customer' }
];

export function GMooncPermissionsPage() {
  const [permissions, setPermissions] = useState<Record<string, Record<string, any>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePermissionChange = (roleId: string, moduleId: string, key: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [moduleId]: {
          ...prev[roleId]?.[moduleId],
          [key]: checked
        }
      }
    }));
  };

  const savePermissions = async () => {
    setSaving(true);
    setError(null);
    // Mock save
    setTimeout(() => {
      setSuccess('Permissions saved successfully!');
      setSaving(false);
      setTimeout(() => setSuccess(null), 3000);
    }, 500);
  };

  return (
    <div className="gmoonc-content-wrapper">
      <div className="gmoonc-content-header">
        <h2>Permissions Management</h2>
      </div>
      <div className="gmoonc-content-body">
        {error && (
          <div style={{ backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: '#efe', border: '1px solid #cfc', color: '#3c3', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {success}
          </div>
        )}

        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={savePermissions}
            disabled={saving}
            style={{
              backgroundColor: '#71b399',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <thead style={{ backgroundColor: '#eaf0f5' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #dbe2ea', color: '#374161', fontWeight: '600', minWidth: '220px' }}>
                  Roles / Modules
                </th>
                {mockModules.map(module => (
                  <th key={module.id} style={{ padding: '16px', textAlign: 'center', borderBottom: '2px solid #dbe2ea', color: '#374161', fontWeight: '600', minWidth: '140px' }}>
                    {module.display_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockRoles.map((role, idx) => (
                <tr key={role.id} style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : '#fafbfc', borderBottom: '1px solid #eaf0f5' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '600', color: '#374161', marginBottom: '4px' }}>{role.name}</div>
                    {role.description && (
                      <div style={{ fontSize: '14px', color: '#6374AD', marginTop: '4px' }}>{role.description}</div>
                    )}
                    {role.is_system_role && (
                      <span style={{ display: 'inline-block', fontSize: '12px', padding: '4px 8px', borderRadius: '12px', backgroundColor: '#dbe2ea', color: '#374161', marginTop: '8px' }}>
                        System
                      </span>
                    )}
                  </td>
                  {mockModules.map(module => {
                    const permission = permissions[role.id]?.[module.id] || {};
                    return (
                      <td key={module.id} style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                          {['can_access', 'can_create', 'can_read', 'can_update', 'can_delete'].map((key) => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={!!permission[key]}
                                onChange={(e) => handlePermissionChange(role.id, module.id, key, e.target.checked)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#71b399' }}
                              />
                              <span style={{ fontSize: '12px', color: '#6374AD' }}>
                                {key.replace('can_', '').charAt(0).toUpperCase() + key.replace('can_', '').slice(1)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
