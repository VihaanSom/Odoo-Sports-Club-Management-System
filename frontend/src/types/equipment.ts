export type EquipmentCategoryType =
  | 'racket'
  | 'ball'
  | 'shoe'
  | 'accessory'
  | 'apparel'
  | 'Rackets'
  | 'Balls'
  | 'Protective Gear'
  | 'Gym Accessories'
  | 'Court Accessories';

export interface EquipmentItem {
  id: number;
  name: string;
  category: EquipmentCategoryType | string;
  brand?: string | null;
  description?: string | null;
  pricePaise: number;
  stockQty: number;
  lowStockThreshold: number;
  isActive: boolean;
  imageUrl?: string | null;
  condition?: string;
  rentalRatePaise?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEquipmentPayload {
  name: string;
  category: string;
  brand?: string;
  description?: string;
  pricePaise: number;
  stockQty: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  imageUrl?: string;
  condition?: string;
  rentalRatePaise?: number;
}

export interface UpdateEquipmentPayload {
  name?: string;
  category?: string;
  brand?: string;
  description?: string;
  pricePaise?: number;
  stockQty?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  imageUrl?: string;
  condition?: string;
  rentalRatePaise?: number;
}

export interface AdjustStockPayload {
  adjustmentQty: number;
  reason: string;
}
