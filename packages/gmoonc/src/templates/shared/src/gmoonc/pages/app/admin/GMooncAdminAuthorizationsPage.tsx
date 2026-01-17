import React from 'react';
import { GMooncAuthorizationsManager } from '../../../features/authorizations/GMooncAuthorizationsManager';

export function GMooncAdminAuthorizationsPage() {
  return (
    <div className="gmoonc-content-wrapper">
      <div className="gmoonc-content-header">
        <h2>Authorization Management</h2>
      </div>
      <div className="gmoonc-content-body">
        <GMooncAuthorizationsManager />
      </div>
    </div>
  );
}
