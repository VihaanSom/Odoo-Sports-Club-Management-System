import type { PaymentMethod } from './enums';

export type TabStatus = 'open' | 'settled';

export interface BarTabItem {
  id: number;
  tabId: number;
  menuItemId: number;
  name: string;
  qty: number;
  unitPricePaise: number;
  subtotalPaise: number;
  createdAt?: string;
}

export interface BarTab {
  id: number;
  barTableId: number;
  tableNo?: string;
  memberId?: number | null;
  memberName?: string | null;
  memberTier?: string | null;
  openedBy: number;
  openedByName?: string;
  status: TabStatus;
  openedAt: string;
  settledAt?: string | null;
  notes?: string | null;
  items: BarTabItem[];
  itemCount?: number;
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  paymentMethod?: PaymentMethod | string | null;
}

export interface BarTable {
  id: number;
  tableNo: string;
  capacity: number;
  isActive: boolean;
  activeTab?: BarTab | null;
}

export interface CreateBarTabPayload {
  barTableId: number;
  memberId?: number | null;
  notes?: string;
  openedBy?: number;
}

export interface AddBarTabItemPayload {
  menuItemId: number;
  qty: number;
}

export interface SettleBarTabPayload {
  paymentMethod: PaymentMethod | string;
  notes?: string;
}

export interface CreateBarTablePayload {
  tableNo: string;
  capacity: number;
  isActive?: boolean;
}

export interface UpdateBarTablePayload {
  tableNo?: string;
  capacity?: number;
  isActive?: boolean;
}

export interface BarTodayEarnings {
  totalPaise: number;
  totalRupees: number;
  settledTabsCount: number;
  date: string;
}
