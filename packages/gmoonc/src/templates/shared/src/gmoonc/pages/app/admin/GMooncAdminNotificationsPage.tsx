import React from 'react';
import { GMooncNotificationsManager } from '../../../features/notifications/GMooncNotificationsManager';

export function GMooncAdminNotificationsPage() {
  return (
    <div className="gmoonc-content-wrapper">
      <div className="gmoonc-content-header">
        <h2>Notification Management</h2>
      </div>
      <div className="gmoonc-content-body">
        <GMooncNotificationsManager />
      </div>
    </div>
  );
}
