import type { BarTable } from '@/types/bar';
import { mockBarTabs } from './barTabs';

export const mockBarTables: BarTable[] = [
  {
    id: 1,
    tableNo: 'T-01',
    capacity: 2,
    isActive: true,
    activeTab: null,
  },
  {
    id: 2,
    tableNo: 'T-02',
    capacity: 4,
    isActive: true,
    activeTab: mockBarTabs.find((t) => t.id === 101 && t.status === 'open') || null,
  },
  {
    id: 3,
    tableNo: 'T-03',
    capacity: 2,
    isActive: true,
    activeTab: null,
  },
  {
    id: 4,
    tableNo: 'T-04',
    capacity: 6,
    isActive: true,
    activeTab: mockBarTabs.find((t) => t.id === 102 && t.status === 'open') || null,
  },
  {
    id: 5,
    tableNo: 'T-05',
    capacity: 4,
    isActive: true,
    activeTab: null,
  },
  {
    id: 6,
    tableNo: 'T-06',
    capacity: 8,
    isActive: true,
    activeTab: mockBarTabs.find((t) => t.id === 103 && t.status === 'open') || null,
  },
  {
    id: 7,
    tableNo: 'T-07',
    capacity: 4,
    isActive: true,
    activeTab: null,
  },
  {
    id: 8,
    tableNo: 'T-08',
    capacity: 2,
    isActive: false, // Under cleaning/maintenance
    activeTab: null,
  },
];
