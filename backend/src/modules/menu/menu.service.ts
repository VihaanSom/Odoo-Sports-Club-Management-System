import { Prisma, MenuItem, MenuCategory } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../utils/errors';
import {
  ListMenuItemsQuery,
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from './menu.validator';

export interface MenuItemResponse {
  id: number;
  name: string;
  category: MenuCategory;
  description: string | null;
  pricePaise: number;
  stockQty: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Transforms a MenuItem entity to the API Contract shape.
 * Converts DB Decimal values (Rupees) into integer Paise without altering DB schema definitions.
 */
export const formatMenuItem = (item: MenuItem): MenuItemResponse => ({
  id: item.id,
  name: item.name,
  category: item.category,
  description: item.description,
  pricePaise: Math.round(Number(item.price) * 100),
  stockQty: item.stockQty,
  lowStockThreshold: item.lowStockThreshold,
  isAvailable: item.isAvailable,
  imageUrl: item.imageUrl,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
});

export class MenuService {
  /**
   * MI-01: List menu items with category/availability filters, search, and pagination.
   */
  async listMenuItems(query: ListMenuItemsQuery) {
    const where: Prisma.MenuItemWhereInput = {};

    if (query.isAvailable !== undefined) {
      where.isAvailable = query.isAvailable;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const sortFieldMap: Record<string, keyof Prisma.MenuItemOrderByWithRelationInput> = {
      name: 'name',
      price: 'price',
      created_at: 'createdAt',
    };
    const sortField = sortFieldMap[query.sortBy] || 'name';

    const skip = (query.page - 1) * query.pageSize;
    const take = query.pageSize;

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        orderBy: { [sortField]: query.sortOrder },
        skip,
        take,
      }),
      prisma.menuItem.count({ where }),
    ]);

    return {
      data: items.map(formatMenuItem),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize) || 0,
      },
    };
  }

  /**
   * MI-02: Create new menu item.
   */
  async createMenuItem(input: CreateMenuItemInput): Promise<MenuItemResponse> {
    const created = await prisma.menuItem.create({
      data: {
        name: input.name,
        category: input.category,
        description: input.description ?? null,
        price: new Prisma.Decimal(input.pricePaise / 100),
        stockQty: input.stockQty,
        lowStockThreshold: input.lowStockThreshold ?? 5,
        isAvailable: true,
        imageUrl: input.imageUrl ?? null,
      },
    });

    return formatMenuItem(created);
  }

  /**
   * MI-03: Get menu item detail by ID.
   */
  async getMenuItemById(id: number): Promise<MenuItemResponse> {
    const item = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundError('MENU_ITEM_NOT_FOUND', `Menu item with ID ${id} not found.`);
    }

    return formatMenuItem(item);
  }

  /**
   * MI-04: Update menu item details, pricing, availability, or restock.
   */
  async updateMenuItem(id: number, input: UpdateMenuItemInput): Promise<MenuItemResponse> {
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('MENU_ITEM_NOT_FOUND', `Menu item with ID ${id} not found.`);
    }

    const updateData: Prisma.MenuItemUpdateInput = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.pricePaise !== undefined) {
      updateData.price = new Prisma.Decimal(input.pricePaise / 100);
    }
    if (input.stockQty !== undefined) updateData.stockQty = input.stockQty;
    if (input.lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = input.lowStockThreshold;
    }
    if (input.isAvailable !== undefined) updateData.isAvailable = input.isAvailable;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;

    const updated = await prisma.menuItem.update({
      where: { id },
      data: updateData,
    });

    return formatMenuItem(updated);
  }
}

export const menuService = new MenuService();
