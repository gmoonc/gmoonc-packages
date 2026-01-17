import React from 'react';
import { GMooncMensagensManager } from '../../../components/GMooncMensagensManager';

export function GMooncCustomerMessagesPage() {
  return (
    <div className="gmoonc-content-wrapper">
      <div className="gmoonc-content-header">
        <h2>Customer Messages Management</h2>
      </div>
      <div className="gmoonc-content-body">
        <GMooncMensagensManager />
      </div>
    </div>
  );
}
