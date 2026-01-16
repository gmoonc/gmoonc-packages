import React, { useState } from 'react';

// Mock data (ported from legacy sicoop-app)
const mockMessages = [
  { id: '1', nome: 'John Doe', email: 'john@example.com', telefone: '123456789', empresa_fazenda: 'Company A', mensagem: 'Test message', status: 'pendente', created_at: '2024-01-01' },
  { id: '2', nome: 'Jane Smith', email: 'jane@example.com', telefone: '987654321', empresa_fazenda: 'Company B', mensagem: 'Another message', status: 'em_analise', created_at: '2024-01-02' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pendente', label: 'Pending' },
  { value: 'em_analise', label: 'In Analysis' },
  { value: 'concluida', label: 'Completed' }
];

export function GMooncTechnicalMessagesPage() {
  const [messages] = useState(mockMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = !searchTerm || 
      msg.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.empresa_fazenda.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="gmoonc-content-wrapper">
      <div className="gmoonc-content-header">
        <h2>🔧 Technical Messages Management</h2>
      </div>
      <div className="gmoonc-content-body">
        <div style={{ 
          background: 'linear-gradient(135deg, #374161, #6374AD)', 
          color: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          marginBottom: '24px' 
        }}>
          <p style={{ margin: 0, opacity: 0.9 }}>Control message distribution among system users</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }}>
              📊 Total: {messages.length}
            </span>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #dbe2ea' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374161', fontWeight: '600', fontSize: '14px' }}>Search</label>
              <input
                type="text"
                placeholder="Name, email, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #dbe2ea', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374161', fontWeight: '600', fontSize: '14px' }}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #dbe2ea', borderRadius: '8px', fontSize: '14px' }}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dbe2ea' }}>
          {filteredMessages.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <p style={{ color: '#6374AD', fontSize: '16px' }}>No messages found</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'linear-gradient(135deg, #374161, #293047)' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontSize: '14px', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontSize: '14px', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontSize: '14px', fontWeight: '600' }}>Company</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontSize: '14px', fontWeight: '600' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg, idx) => (
                  <tr key={msg.id} style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : '#fafbfc', borderBottom: '1px solid #eaf0f5' }}>
                    <td style={{ padding: '12px 16px', color: '#374161', fontSize: '14px' }}>{msg.nome}</td>
                    <td style={{ padding: '12px 16px', color: '#374161', fontSize: '14px' }}>{msg.email}</td>
                    <td style={{ padding: '12px 16px', color: '#374161', fontSize: '14px' }}>{msg.empresa_fazenda}</td>
                    <td style={{ padding: '12px 16px', color: '#374161', fontSize: '14px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        backgroundColor: msg.status === 'pendente' ? '#fff3cd' : msg.status === 'em_analise' ? '#d1ecf1' : '#d4edda',
                        color: msg.status === 'pendente' ? '#856404' : msg.status === 'em_analise' ? '#0c5460' : '#155724'
                      }}>
                        {msg.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374161', fontSize: '14px' }}>{msg.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
