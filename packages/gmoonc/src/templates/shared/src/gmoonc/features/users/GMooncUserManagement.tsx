import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGMooncSession } from '../../session/GMooncSessionContext';
import { useGMooncUsers, type GMooncUser } from '../../hooks/useGMooncUsers';
import { GMooncUserEdit } from './GMooncUserEdit';
import { Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';

export function GMooncUserManagement() {
  const { user: currentUser } = useGMooncSession();
  const { users, loading: isLoading, fetchUsers, deleteUser } = useGMooncUsers();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState<GMooncUser | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<GMooncUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [allUsers, setAllUsers] = useState<GMooncUser[]>([]);
  
  const usersPerPage = 10;

  const loadUsers = useCallback(async () => {
    const result = await fetchUsers(searchTerm, roleFilter, currentPage, usersPerPage);
    setAllUsers(result.users);
    setTotalPages(Math.ceil((result.total || 0) / usersPerPage));
  }, [searchTerm, roleFilter, currentPage, fetchUsers]);

  // Debounce para searchTerm e roleFilter
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [currentPage, loadUsers]);

  const handleEditUser = useCallback((user: GMooncUser) => {
    setEditingUser(user);
  }, []);

  const handleBackToList = useCallback(() => {
    setEditingUser(null);
  }, []);

  const handleUserUpdated = useCallback(() => {
    loadUsers();
    setEditingUser(null);
  }, [loadUsers]);

  // Function to show temporary notifications
  const showTemporaryNotification = useCallback((message: string, type: 'success' | 'error') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `temporary-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="notification-message">${message.replace(/\n/g, '<br>')}</span>
      </div>
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      console.log('🗑️ Starting user deletion:', userToDelete.id);

      const success = await deleteUser(userToDelete.id);

      if (!success) {
        throw new Error('Failed to delete user');
      }

      console.log('✅ User removed successfully');
      
      // 1. Close confirmation modal FIRST
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setDeleteMessage('');
      
      // 2. Update user list
      await loadUsers();
      
      // 3. Show success message
      const successMessage = `User "${userToDelete.name}" has been successfully deleted from the system.\n\n✅ Account removed from Auth\n✅ Profile removed from database\n✅ All related data has been cleaned`;
      
      showTemporaryNotification(successMessage, 'success');
      
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      
      // On error, also close modal
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setDeleteMessage('');
      
      const errorMessage = `Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`;
      showTemporaryNotification(errorMessage, 'error');
      
    } finally {
      setIsDeleting(false);
    }
  }, [userToDelete, deleteUser, loadUsers, showTemporaryNotification]);

  // Function to cancel deletion with animation
  const cancelDelete = useCallback(() => {
    // Add closing animation class
    const modal = document.querySelector('.delete-confirm-modal');
    if (modal) {
      modal.classList.add('closing');
      
      // Wait for animation to finish before closing
      setTimeout(() => {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
        setDeleteMessage('');
      }, 200);
    } else {
      // Fallback if modal not found
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setDeleteMessage('');
    }
  }, []);

  // Check if current user can delete the user
  const canDeleteUser = useCallback((user: GMooncUser) => {
    // 1. Check if current user exists
    if (!currentUser) {
      return false;
    }

    // 2. Check if not trying to delete self
    if (currentUser.id === user.id) {
      return false;
    }

    // 3. Check if current user is administrator
    if (currentUser.role === 'administrator' || currentUser.role === 'admin') {
      return true;
    }

    // 4. Check if current user is employee (can only delete customers)
    if (currentUser.role === 'employee' && user.role === 'customer') {
      return true;
    }

    // By default, do not allow deletion
    return false;
  }, [currentUser]);

  // Improved function to handle deletion
  const handleDeleteUser = useCallback((user: GMooncUser) => {
    // Check if can delete user
    if (!canDeleteUser(user)) {
      let errorMessage = 'You do not have permission to delete this user.';
      
      if (currentUser?.id === user.id) {
        errorMessage = 'You cannot delete your own account.';
      } else if (currentUser?.role === 'employee' && user.role !== 'customer') {
        errorMessage = 'Employees can only delete customer accounts.';
      } else if (currentUser?.role === 'customer') {
        errorMessage = 'Customers do not have permission to delete users.';
      }
      
      showTemporaryNotification(errorMessage, 'error');
      return;
    }

    setUserToDelete(user);
    setShowDeleteConfirm(true);
    setDeleteMessage(`Are you sure you want to delete user "${user.name}" (${user.email})?\n\n⚠️ WARNING: This action is IRREVERSIBLE and will remove:\n• User account\n• All associated data\n• Activity history\n• Custom settings\n\nThis operation cannot be undone.`);
  }, [canDeleteUser, currentUser, showTemporaryNotification]);

  const getRoleLabel = useCallback((role: string | null) => {
    const labels: Record<string, string> = {
      customer: 'Customer',
      employee: 'Employee',
      technician: 'Technician',
      administrator: 'Administrator',
      admin: 'Administrator',
      sales: 'Sales',
      office: 'Office',
      'help-desk': 'Help-Desk',
      financial: 'Financial'
    };
    return role ? labels[role] || role : '';
  }, []);

  const getRoleBadgeStyle = useCallback((role: string | null) => {
    const roleStyles: Record<string, { bg: string; text: string }> = {
      customer: { bg: '#6374AD', text: '#ffffff' },
      employee: { bg: '#879FED', text: '#ffffff' },
      technician: { bg: '#71b399', text: '#ffffff' },
      administrator: { bg: '#374161', text: '#ffffff' },
      admin: { bg: '#374161', text: '#ffffff' },
      sales: { bg: '#562632', text: '#ffffff' },
      office: { bg: '#856968', text: '#ffffff' },
      'help-desk': { bg: '#293047', text: '#ffffff' },
      financial: { bg: '#3F4A6E', text: '#ffffff' }
    };
    
    const style = role ? roleStyles[role] : { bg: '#dbe2ea', text: '#374161' };
    
    return {
      backgroundColor: style?.bg || '#dbe2ea',
      color: style?.text || '#374161'
    };
  }, []);

  const currentUsers = useMemo(() => {
    return allUsers;
  }, [allUsers]);

  const paginationStats = useMemo(() => {
    const start = (currentPage - 1) * usersPerPage + 1;
    const end = Math.min(currentPage * usersPerPage, allUsers.length);
    return { start, end, total: allUsers.length };
  }, [currentPage, allUsers]);

  if (editingUser) {
    return (
      <GMooncUserEdit
        user={editingUser}
        onBack={handleBackToList}
        onUserUpdated={handleUserUpdated}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6" style={{ borderColor: '#dbe2ea', borderWidth: '1px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6374AD' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 text-sm sm:text-base"
              style={{ 
                borderColor: '#dbe2ea',
                color: '#374161',
                backgroundColor: '#ffffff'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#71b399';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(113, 179, 153, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#dbe2ea';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#6374AD' }} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 text-sm sm:text-base appearance-none cursor-pointer"
              style={{ 
                borderColor: '#dbe2ea',
                color: '#374161',
                backgroundColor: '#ffffff'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#71b399';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(113, 179, 153, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#dbe2ea';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
              <option value="technician">Technician</option>
              <option value="administrator">Administrator</option>
              <option value="sales">Sales</option>
              <option value="office">Office</option>
              <option value="help-desk">Help-Desk</option>
              <option value="financial">Financial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center" style={{ borderColor: '#dbe2ea', borderWidth: '1px' }}>
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: '#71b399' }} />
          <p className="text-base sm:text-lg" style={{ color: '#6374AD' }}>Loading users...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden" style={{ borderColor: '#dbe2ea', borderWidth: '1px' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#eaf0f5' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374161' }}>
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374161' }}>
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374161' }}>
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374161' }}>
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#374161' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#dbe2ea' }}>
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-opacity-50 transition-colors duration-150" style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eaf0f5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: '#374161' }}>{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm" style={{ color: '#6374AD' }}>{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={getRoleBadgeStyle(user.role)}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm" style={{ color: '#6374AD' }}>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                            style={{ backgroundColor: '#71b399', color: 'white' }}
                            title="Edit user"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5fa385'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#71b399'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={!canDeleteUser(user)}
                            className={`p-2 rounded-lg transition-all duration-200 ${canDeleteUser(user) ? 'hover:scale-110' : 'opacity-40 cursor-not-allowed'}`}
                            style={{ 
                              backgroundColor: canDeleteUser(user) ? '#dc2626' : '#e5e7eb',
                              color: 'white'
                            }}
                            title={canDeleteUser(user) ? "Delete user" : "No permission to delete"}
                            onMouseEnter={(e) => {
                              if (canDeleteUser(user)) {
                                e.currentTarget.style.backgroundColor = '#b91c1c';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (canDeleteUser(user)) {
                                e.currentTarget.style.backgroundColor = '#dc2626';
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {currentUsers.map((user) => (
              <div 
                key={user.id} 
                className="bg-white rounded-2xl shadow-sm p-4 sm:p-6" 
                style={{ borderColor: '#dbe2ea', borderWidth: '1px' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-1" style={{ color: '#374161' }}>
                        {user.name}
                      </h3>
                      <p className="text-sm" style={{ color: '#6374AD' }}>{user.email}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={getRoleBadgeStyle(user.role)}>
                        {getRoleLabel(user.role)}
                      </span>
                      <span className="text-xs" style={{ color: '#6374AD' }}>
                        Created: {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US') : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:flex-col">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
                      style={{ backgroundColor: '#71b399', color: 'white' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5fa385'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#71b399'}
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      disabled={!canDeleteUser(user)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${canDeleteUser(user) ? 'hover:scale-105' : 'opacity-40 cursor-not-allowed'}`}
                      style={{ 
                        backgroundColor: canDeleteUser(user) ? '#dc2626' : '#e5e7eb',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        if (canDeleteUser(user)) {
                          e.currentTarget.style.backgroundColor = '#b91c1c';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (canDeleteUser(user)) {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {currentUsers.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center" style={{ borderColor: '#dbe2ea', borderWidth: '1px' }}>
              <Filter className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: '#6374AD' }} />
              <p className="text-base sm:text-lg font-medium mb-2" style={{ color: '#374161' }}>
                No users found
              </p>
              <p className="text-sm" style={{ color: '#6374AD' }}>
                Try adjusting the search filters
              </p>
            </div>
          )}

          {/* Pagination Info */}
          {currentUsers.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: '#6374AD' }}>
                Showing <span className="font-semibold" style={{ color: '#374161' }}>{paginationStats.start}</span> to{' '}
                <span className="font-semibold" style={{ color: '#374161' }}>{paginationStats.end}</span> of{' '}
                <span className="font-semibold" style={{ color: '#374161' }}>{paginationStats.total}</span> users
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                  currentPage === 1 
                    ? 'opacity-40 cursor-not-allowed' 
                    : 'hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: currentPage === 1 ? '#e5e7eb' : '#6374AD',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = '#4f5d8f';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = '#6374AD';
                  }
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <span className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: '#eaf0f5', color: '#374161' }}>
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                  currentPage === totalPages 
                    ? 'opacity-40 cursor-not-allowed' 
                    : 'hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#6374AD',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = '#4f5d8f';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = '#6374AD';
                  }
                }}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm delete-confirm-modal"
          onClick={cancelDelete}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ borderColor: '#dbe2ea', borderWidth: '1px' }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b" style={{ backgroundColor: '#eaf0f5', borderColor: '#dbe2ea' }}>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6" style={{ color: '#dc2626' }} />
                <h3 className="text-xl font-bold" style={{ color: '#374161' }}>
                  Confirm Deletion
                </h3>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#6374AD' }}>
                {deleteMessage}
              </div>
            </div>
            
            {/* Modal Actions */}
            <div className="p-6 border-t flex flex-col-reverse sm:flex-row gap-3 sm:justify-end" style={{ backgroundColor: '#eaf0f5', borderColor: '#dbe2ea' }}>
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 font-medium text-sm"
                style={{ 
                  backgroundColor: '#ffffff',
                  color: '#374161',
                  borderColor: '#dbe2ea',
                  borderWidth: '2px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eaf0f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 font-medium text-sm flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: '#dc2626',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
