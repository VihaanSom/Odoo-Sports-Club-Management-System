import React from 'react';

export type AppTheme = 'corporate' | 'black';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

export interface StatItem {
  title: string;
  value: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}

export interface ColorPreset {
  name: string;
  color: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
