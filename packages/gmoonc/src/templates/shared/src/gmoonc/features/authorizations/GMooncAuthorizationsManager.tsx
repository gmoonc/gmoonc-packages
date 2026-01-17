import React, { useState, useEffect } from 'react';
import { useGMooncAuthorizations, type GMooncUserForAuth, type GMooncRole } from '../../hooks/useGMooncAuthorizations';
import { Search, Check, X, Users, Shield, User, AlertCircle, Loader2 } from 'lucide-react';

export function GMooncAuthorizationsManager() {
  const { users, roles, loading, error: hookError, updateUserRole } = useGMooncAuthorizations();
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (hookError) {
      setError(hookError);
    }
  }, [hookError]);

  // Function to update user authorization
  const handleUpdateUserAuthorization = async (userId: string, newRole: string) => {
    try {
      setUpdatingUser(userId);
      setError(null);

      console.log('Attempting to update user:', userId, 'to authorization:', newRole);

      // Check if authorization exists
      const roleExists = roles.find(r => r.name === newRole);
      if (!roleExists) {
        throw new Error(`Authorization '${newRole}' not found`);
      }

      const success = await updateUserRole(userId, newRole);

      if (!success) {
        throw new Error('Failed to update user role');
      }

      // Clear pending change
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[userId];
        return newChanges;
      });

      setSuccess('Authorization updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating authorization:', error);
      setError(`Error updating authorization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingUser(null);
    }
  };

  // Function to handle pending changes
  const handleRoleChange = (userId: string, newRole: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  // Function to confirm change
  const confirmRoleChange = (userId: string) => {
    const newRole = pendingChanges[userId];
    if (newRole) {
      handleUpdateUserAuthorization(userId, newRole);
    }
  };

  // Function to cancel pending change
  const cancelRoleChange = (userId: string) => {
    setPendingChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[userId];
      return newChanges;
    });
  };

  // Function to generate avatar using UI Avatars (more reliable)
  const getAvatarUrl = (userName: string | null, userEmail: string) => {
    const name = userName || userEmail.split('@')[0];
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=3B82F6&color=fff&size=80&bold=true&font-size=0.4`;
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#6374AD' }} />
        <span className="ml-3 text-lg" style={{ color: '#374161' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Description */}
      <div className="mb-6">
        <p className="text-sm sm:text-base" style={{ color: '#6374AD' }}>
          Manage user roles (authorizations) in the system. System authorizations are fundamental and cannot be deleted.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border flex items-start gap-3" style={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          borderColor: '#ef4444',
          color: '#991b1b' 
        }}>
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 rounded-lg border flex items-start gap-3" style={{ 
          backgroundColor: 'rgba(113, 179, 153, 0.1)', 
          borderColor: '#71b399',
          color: '#374161' 
        }}>
          <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#879FED' }} />
          <input
            type="text"
            placeholder="Search users by name, email or authorization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 pl-9 sm:pl-11 rounded-lg border transition-all focus:outline-none focus:ring-2 text-sm sm:text-base"
            style={{ 
              borderColor: '#dbe2ea',
              backgroundColor: '#ffffff',
              color: '#374161'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#71b399';
              e.target.style.boxShadow = '0 0 0 3px rgba(113, 179, 153, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#dbe2ea';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <p className="text-xs sm:text-sm mt-2" style={{ color: '#879FED' }}>
          {filteredUsers.length} of {users.length} users found
        </p>
      </div>

      {/* Desktop Table View (1024px+) */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border shadow-sm" style={{ 
        borderColor: '#dbe2ea',
        backgroundColor: '#ffffff'
      }}>
        <table className="min-w-full">
          <thead style={{ backgroundColor: '#eaf0f5' }}>
            <tr>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                User
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                Email
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                Current Authorization
              </th>
              <th className="px-3 lg:px-4 py-3 text-center text-xs font-semibold" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                New Authorization
              </th>
              <th className="px-3 lg:px-4 py-3 text-center text-xs font-semibold" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => {
              const hasPendingChange = pendingChanges[user.id];
              const currentRole = hasPendingChange || user.role;
              
              return (
                <tr 
                  key={user.id} 
                  className="transition-colors hover:bg-opacity-50"
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                    borderBottom: '1px solid #dbe2ea'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafbfc'}
                >
                  <td className="px-3 lg:px-4 py-3">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="flex-shrink-0 h-9 w-9 lg:h-10 lg:w-10">
                        <img
                          src={getAvatarUrl(user.name, user.email)}
                          alt={user.name || user.email}
                          className="h-9 w-9 lg:h-10 lg:w-10 rounded-full object-cover border-2"
                          style={{ borderColor: '#dbe2ea' }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: '#374161' }}>
                          {user.name || 'No name'}
                        </div>
                        <div className="text-xs truncate" style={{ color: '#879FED' }}>
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-3">
                    <div className="text-sm" style={{ color: '#374161' }}>{user.email}</div>
                    <div className="text-xs" style={{ color: '#879FED' }}>
                      Created: {new Date(user.created_at || '').toLocaleDateString('en-US')}
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-3">
                    <span 
                      className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full" 
                      style={{
                        backgroundColor: user.role === 'administrator' ? 'rgba(239, 68, 68, 0.15)' :
                                       user.role === 'customer' ? 'rgba(99, 116, 173, 0.15)' :
                                       user.role === 'employee' ? 'rgba(113, 179, 153, 0.15)' :
                                       user.role === 'technician' ? 'rgba(135, 159, 237, 0.15)' : 'rgba(219, 226, 234, 0.5)',
                        color: user.role === 'administrator' ? '#991b1b' :
                              user.role === 'customer' ? '#374161' :
                              user.role === 'employee' ? '#065f46' :
                              user.role === 'technician' ? '#3F4A6E' : '#6374AD'
                      }}
                    >
                      {user.role || 'N/A'}
                    </span>
                  </td>
                  <td className="px-3 lg:px-4 py-3">
                    <select
                      value={currentRole || ''}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updatingUser === user.id}
                      className="w-full px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs lg:text-sm"
                      style={{ 
                        borderColor: '#dbe2ea',
                        backgroundColor: '#ffffff',
                        color: '#374161'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#71b399';
                        e.target.style.boxShadow = '0 0 0 3px rgba(113, 179, 153, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#dbe2ea';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.name}>
                          {role.name} {role.is_system_role ? '(System)' : ''}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 lg:px-4 py-3">
                    {updatingUser === user.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#879FED' }} />
                        <span className="text-xs hidden lg:inline" style={{ color: '#879FED' }}>Updating...</span>
                      </div>
                    ) : hasPendingChange ? (
                      <div className="flex items-center justify-center gap-1.5 lg:gap-2">
                        <button
                          onClick={() => confirmRoleChange(user.id)}
                          className="px-2 lg:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                          style={{ backgroundColor: '#71b399', color: '#ffffff' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5fa086'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#71b399'}
                          title="Confirm authorization change"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">Confirm</span>
                        </button>
                        <button
                          onClick={() => cancelRoleChange(user.id)}
                          className="px-2 lg:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                          style={{ backgroundColor: '#6374AD', color: '#ffffff' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374161'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6374AD'}
                          title="Cancel change"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-center block" style={{ color: '#879FED' }}>No changes</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Portrait Card View (0-1023px) */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.map(user => {
          const hasPendingChange = pendingChanges[user.id];
          const currentRole = hasPendingChange || user.role;
          
          return (
            <div 
              key={user.id} 
              className="rounded-lg border p-4 shadow-sm"
              style={{ 
                backgroundColor: '#ffffff',
                borderColor: '#dbe2ea'
              }}
            >
              {/* User Info */}
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={getAvatarUrl(user.name, user.email)}
                  alt={user.name || user.email}
                  className="h-11 w-11 rounded-full object-cover border-2 flex-shrink-0"
                  style={{ borderColor: '#dbe2ea' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: '#374161' }}>
                    {user.name || 'No name'}
                  </div>
                  <div className="text-xs truncate" style={{ color: '#6374AD' }}>
                    {user.email}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#879FED' }}>
                    Created: {new Date(user.created_at || '').toLocaleDateString('en-US')}
                  </div>
                </div>
              </div>

              {/* Current Role Badge */}
              <div className="mb-3 pb-3 border-b" style={{ borderColor: '#eaf0f5' }}>
                <label className="text-xs font-medium block mb-2" style={{ color: '#879FED' }}>
                  Current Authorization
                </label>
                <span 
                  className="inline-flex px-3 py-1 text-xs font-semibold rounded-full" 
                  style={{
                    backgroundColor: user.role === 'administrator' ? 'rgba(239, 68, 68, 0.15)' :
                                   user.role === 'customer' ? 'rgba(99, 116, 173, 0.15)' :
                                   user.role === 'employee' ? 'rgba(113, 179, 153, 0.15)' :
                                   user.role === 'technician' ? 'rgba(135, 159, 237, 0.15)' : 'rgba(219, 226, 234, 0.5)',
                    color: user.role === 'administrator' ? '#991b1b' :
                          user.role === 'customer' ? '#374161' :
                          user.role === 'employee' ? '#065f46' :
                          user.role === 'technician' ? '#3F4A6E' : '#6374AD'
                  }}
                >
                  {user.role || 'N/A'}
                </span>
              </div>

              {/* New Role Select */}
              <div className="mb-3">
                <label className="text-xs font-medium block mb-2" style={{ color: '#879FED' }}>
                  New Authorization
                </label>
                <select
                  value={currentRole || ''}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={updatingUser === user.id}
                  className="w-full px-3 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50 text-sm"
                  style={{ 
                    borderColor: '#dbe2ea',
                    backgroundColor: '#ffffff',
                    color: '#374161'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#71b399';
                    e.target.style.boxShadow = '0 0 0 3px rgba(113, 179, 153, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#dbe2ea';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.name} {role.is_system_role ? '(System)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t" style={{ borderColor: '#eaf0f5' }}>
                {updatingUser === user.id ? (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#879FED' }} />
                    <span className="text-sm" style={{ color: '#879FED' }}>Updating...</span>
                  </div>
                ) : hasPendingChange ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmRoleChange(user.id)}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#71b399', color: '#ffffff' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5fa086'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#71b399'}
                    >
                      <Check className="h-4 w-4" />
                      Confirm
                    </button>
                    <button
                      onClick={() => cancelRoleChange(user.id)}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#6374AD', color: '#ffffff' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374161'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6374AD'}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-center py-2" style={{ color: '#879FED' }}>
                    No pending changes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics Cards */}
      <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-lg border transition-all hover:shadow-md" style={{ 
          backgroundColor: 'rgba(234, 240, 245, 0.5)',
          borderColor: '#dbe2ea'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#6374AD' }} />
            <div className="text-xs font-medium" style={{ color: '#6374AD' }}>Total Users</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#374161' }}>
            {users.length}
          </div>
        </div>
        
        <div className="p-4 rounded-lg border transition-all hover:shadow-md" style={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.2)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#991b1b' }} />
            <div className="text-xs font-medium" style={{ color: '#991b1b' }}>Administrators</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#7f1d1d' }}>
            {users.filter(u => u.role === 'administrator').length}
          </div>
        </div>
        
        <div className="p-4 rounded-lg border transition-all hover:shadow-md" style={{ 
          backgroundColor: 'rgba(99, 116, 173, 0.1)',
          borderColor: 'rgba(99, 116, 173, 0.2)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#374161' }} />
            <div className="text-xs font-medium" style={{ color: '#374161' }}>Customers</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#293047' }}>
            {users.filter(u => u.role === 'customer').length}
          </div>
        </div>
        
        <div className="p-4 rounded-lg border transition-all hover:shadow-md" style={{ 
          backgroundColor: 'rgba(113, 179, 153, 0.1)',
          borderColor: 'rgba(113, 179, 153, 0.2)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#065f46' }} />
            <div className="text-xs font-medium" style={{ color: '#065f46' }}>Other Authorizations</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#064e3b' }}>
            {users.filter(u => !['administrator', 'customer'].includes(u.role || '')).length}
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-lg border" style={{ 
        backgroundColor: 'rgba(234, 240, 245, 0.5)',
        borderColor: '#dbe2ea'
      }}>
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#6374AD' }} />
          <h3 className="text-base sm:text-lg font-semibold" style={{ color: '#374161' }}>
            About the Authorization System
          </h3>
        </div>
        <div className="text-xs sm:text-sm space-y-2.5" style={{ color: '#3F4A6E' }}>
          <p>
            <strong style={{ color: '#374161' }}>System Authorizations:</strong> Cannot be deleted (administrator, customer)
          </p>
          <p>
            <strong style={{ color: '#374161' }}>Custom Authorizations:</strong> Can be created, edited and deleted freely
          </p>
          <p>
            <strong style={{ color: '#374161' }}>Automatic Synchronization:</strong> Changes in authorizations are automatically reflected
          </p>
          <p>
            <strong style={{ color: '#374161' }}>Security:</strong> Users with deleted authorizations are automatically converted to 'customer'
          </p>
          <p>
            <strong style={{ color: '#374161' }}>Default Authorization:</strong> All new users are automatically created as 'customer'
          </p>
        </div>
      </div>
    </div>
  );
}
