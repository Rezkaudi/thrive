import { ReactNode } from 'react';

export interface StatItem {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  description?: string;
}