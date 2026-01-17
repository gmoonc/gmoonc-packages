import React from 'react';
import { GMooncPermissionsManager } from '../../../components/GMooncPermissionsManager';

export function GMooncPermissionsPage() {
  return (
    <div className="gmoonc-content-wrapper">
      <div className="gmoonc-content-header">
        <h2>Permissions Management</h2>
      </div>
      <div className="gmoonc-content-body">
        <GMooncPermissionsManager />
      </div>
    </div>
  );
}
