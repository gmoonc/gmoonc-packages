import React, { useState } from 'react';

// Mock data (ported from legacy sicoop-app)
const mockMessages = [
  { id: '1', nome: 'Customer A', email: 'customer@example.com', telefone: '111222333', empresa_fazenda: 'Farm A', mensagem: 'Customer inquiry', status: 'pendente', created_at: '2024-01-01' },
  { id: '2', nome: 'Customer B', email: 'customer2@example.com', telefone: '444555666', empresa_fazenda: 'Farm B', mensagem: 'Another inquiry', status: 'concluida', created_at: '2024-01-02' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pendente', label: 'Pending' },
  { value: 'em_analise', label: 'In Analysis' },
  { value: 'concluida', label: 'Completed' }
];

export function GMooncCustomerMessagesPage() {
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

  const stats = {
    total: messages.length,
    pendentes: messages.filter(m => m.status === 'pendente').length,
    emAnalise: messages.filter(m => m.status === 'em_analise').length,
    concluidas: messages.filter(m => m.status === 'concluida').length
  };

  return (
    <div className="gmoonc-content-wrapper">
      <div className="gmoonc-content-header">
        <h2>💬 Customer Messages</h2>
      </div>
      <div className="gmoonc-content-body">
        <div style={{ 
          background: 'linear-gradient(135deg, #374161, #6374AD)', 
          color: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          marginBottom: '24px' 
        }}>
          <p style={{ margin: 0, opacity: 0.9 }}>Manage your messages for Goalmoon Ctrl</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(255, 152, 0, 0.08)', border: '1px solid rgba(255, 152, 0, 0.25)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#856968', marginBottom: '8px' }}>📋 Total</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>{stats.total}</div>
          </div>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(99, 116, 173, 0.12)', border: '1px solid rgba(99, 116, 173, 0.3)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#856968', marginBottom: '8px' }}>📨 Pending</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6374AD' }}>{stats.pendentes}</div>
          </div>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(255, 235, 59, 0.12)', border: '1px solid rgba(255, 235, 59, 0.3)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#856968', marginBottom: '8px' }}>🔍 In Analysis</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F9A825' }}>{stats.emAnalise}</div>
          </div>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(113, 179, 153, 0.12)', border: '1px solid rgba(113, 179, 153, 0.3)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#856968', marginBottom: '8px' }}>✅ Completed</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#71b399' }}>{stats.concluidas}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #dbe2ea' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
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
