import React from 'react';
import './styles.css';

export interface GmooncSidebarProps {
  children?: React.ReactNode;
  className?: string;
  isOpen?: boolean;
}

export function GmooncSidebar({
  children,
  className = '',
  isOpen = true
}: GmooncSidebarProps) {
  return (
    <aside className={`gmoonc-sidebar ${isOpen ? 'open' : ''} ${className}`}>
      {children}
    </aside>
  );
}
