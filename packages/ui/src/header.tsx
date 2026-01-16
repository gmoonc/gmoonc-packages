import React from 'react';
import './styles.css';

export interface GmooncHeaderProps {
  title: string;
  titleMobile?: string;
  children?: React.ReactNode;
  className?: string;
}

export function GmooncHeader({
  title,
  titleMobile,
  children,
  className = ''
}: GmooncHeaderProps) {
  return (
    <div className={`gmoonc-header ${className}`}>
      <h1>
        {titleMobile && <span className="gmoonc-title-mobile">{titleMobile}</span>}
        <span className="gmoonc-title-full">{title}</span>
      </h1>
      {children && (
        <div className="gmoonc-header-right">
          {children}
        </div>
      )}
    </div>
  );
}
