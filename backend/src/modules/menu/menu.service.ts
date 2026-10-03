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
  createdAt: string;
  updatedAt: string;
}

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
   * MI-01: List menu items with pagination, filters, and search.
   */
  async listMenuItems(query: ListMenuItemsQuery) {
    const where: Prisma.MenuItemWhereInput = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.isAvailable !== undefined) {
      where.isAvailable = query.isAvailable;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.pageSize;
    const take = query.pageSize;

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        orderBy: { name: 'asc' },
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
   * MI-03: Get menu item by ID.
   */
  async getMenuItemById(id: number): Promise<MenuItemResponse> {
    const item = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundError(
        'MENU_ITEM_NOT_FOUND',
        `Menu item with ID ${id} not found.`
      );
    }

    return formatMenuItem(item);
  }

  /**
   * MI-02: Create new menu item.
   */
  async createMenuItem(input: CreateMenuItemInput): Promise<MenuItemResponse> {
    const priceDecimal = new Prisma.Decimal(input.pricePaise).div(100);

    const item = await prisma.menuItem.create({
      data: {
        name: input.name,
        category: input.category,
        description: input.description || null,
        price: priceDecimal,
        stockQty: input.stockQty,
        lowStockThreshold: input.lowStockThreshold ?? 5,
        isAvailable: true,
        imageUrl: input.imageUrl || null,
      },
    });

    return formatMenuItem(item);
  }

  /**
   * MI-04: Update menu item.
   */
  async updateMenuItem(
    id: number,
    input: UpdateMenuItemInput
  ): Promise<MenuItemResponse> {
    const existing = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(
        'MENU_ITEM_NOT_FOUND',
        `Menu item with ID ${id} not found.`
      );
    }

    const data: Prisma.MenuItemUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.category !== undefined) data.category = input.category;
    if (input.description !== undefined) data.description = input.description || null;
    if (input.pricePaise !== undefined) {
      data.price = new Prisma.Decimal(input.pricePaise).div(100);
    }
    if (input.stockQty !== undefined) data.stockQty = input.stockQty;
    if (input.lowStockThreshold !== undefined) {
      data.lowStockThreshold = input.lowStockThreshold;
    }
    if (input.isAvailable !== undefined) data.isAvailable = input.isAvailable;
    if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl || null;

    const updated = await prisma.menuItem.update({
      where: { id },
      data,
    });

    return formatMenuItem(updated);
  }
}

export const menuService = new MenuService();
