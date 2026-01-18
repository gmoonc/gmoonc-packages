import React from 'react';
import { GMooncUserManagement } from '../../../features/users/GMooncUserManagement';

export function GMooncAdminUsersPage() {
  return (
    <div className="gmoonc-content-wrapper">
      <div className="gmoonc-content-header">
        <h2>Users</h2>
      </div>
      <div className="gmoonc-content-body">
        <GMooncUserManagement />
      </div>
    </div>
  );
}
