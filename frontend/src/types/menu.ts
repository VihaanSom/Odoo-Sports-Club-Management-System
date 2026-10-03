export type MenuCategoryType = 'food' | 'beverage' | 'snack';

export interface MenuItem {
  id: number;
  name: string;
  category: MenuCategoryType | string;
  description?: string | null;
  pricePaise: number;
  stockQty: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuItemPayload {
  name: string;
  category: MenuCategoryType | string;
  description?: string;
  pricePaise: number;
  stockQty: number;
  lowStockThreshold?: number;
  isAvailable?: boolean;
  imageUrl?: string;
}

export interface UpdateMenuItemPayload {
  name?: string;
  category?: MenuCategoryType | string;
  description?: string;
  pricePaise?: number;
  stockQty?: number;
  lowStockThreshold?: number;
  isAvailable?: boolean;
  imageUrl?: string;
}

export interface MenuItemQueryParams {
  category?: string;
  search?: string;
  isAvailable?: boolean;
}
