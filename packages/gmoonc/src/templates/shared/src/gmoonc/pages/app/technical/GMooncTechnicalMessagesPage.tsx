import React from 'react';
import { GMooncMensagensTecnicasManager } from '../../../components/GMooncMensagensTecnicasManager';

export function GMooncTechnicalMessagesPage() {
  return (
    <div className="gmoonc-content-wrapper">
      <div className="gmoonc-content-header">
        <h2>Technical Messages Management</h2>
      </div>
      <div className="gmoonc-content-body">
        <GMooncMensagensTecnicasManager />
      </div>
    </div>
  );
}
