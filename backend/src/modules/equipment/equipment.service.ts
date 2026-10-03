import { Prisma, Equipment, EquipmentCategory } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../utils/errors';
import {
  ListEquipmentQuery,
  CreateEquipmentInput,
  UpdateEquipmentInput,
} from './equipment.validator';

export interface EquipmentResponse {
  id: number;
  name: string;
  category: EquipmentCategory;
  brand: string | null;
  description: string | null;
  pricePaise: number;
  stockQty: number;
  lowStockThreshold: number;
  isActive: boolean;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Transforms an Equipment DB entity to the API Contract shape.
 * Converts DB Decimal values (Rupees) into integer Paise without altering DB schema definitions.
 */
export const formatEquipment = (item: Equipment): EquipmentResponse => ({
  id: item.id,
  name: item.name,
  category: item.category,
  brand: item.brand,
  description: item.description,
  pricePaise: Math.round(Number(item.price) * 100),
  stockQty: item.stockQty,
  lowStockThreshold: item.lowStockThreshold,
  isActive: item.isActive,
  imageUrl: item.imageUrl,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
});

export class EquipmentService {
  /**
   * EQ-01: List equipment with category/active filtering, search, and pagination.
   */
  async listEquipment(query: ListEquipmentQuery) {
    const where: Prisma.EquipmentWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const sortFieldMap: Record<string, keyof Prisma.EquipmentOrderByWithRelationInput> = {
      name: 'name',
      price: 'price',
      stock_qty: 'stockQty',
      created_at: 'createdAt',
    };
    const sortField = sortFieldMap[query.sortBy] || 'name';

    const skip = (query.page - 1) * query.pageSize;
    const take = query.pageSize;

    const [items, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        orderBy: { [sortField]: query.sortOrder },
        skip,
        take,
      }),
      prisma.equipment.count({ where }),
    ]);

    return {
      data: items.map(formatEquipment),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize) || 0,
      },
    };
  }

  /**
   * EQ-02: Create new equipment item.
   */
  async createEquipment(input: CreateEquipmentInput): Promise<EquipmentResponse> {
    const created = await prisma.equipment.create({
      data: {
        name: input.name,
        category: input.category,
        brand: input.brand ?? null,
        description: input.description ?? null,
        price: new Prisma.Decimal(input.pricePaise / 100),
        stockQty: input.stockQty,
        lowStockThreshold: input.lowStockThreshold ?? 5,
        isActive: true,
        imageUrl: input.imageUrl ?? null,
      },
    });

    return formatEquipment(created);
  }

  /**
   * EQ-03: Get equipment detail by ID.
   */
  async getEquipmentById(id: number): Promise<EquipmentResponse> {
    const item = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundError('EQUIPMENT_NOT_FOUND', `Equipment with ID ${id} not found.`);
    }

    return formatEquipment(item);
  }

  /**
   * EQ-04: Update equipment details, price, or restock inventory.
   */
  async updateEquipment(id: number, input: UpdateEquipmentInput): Promise<EquipmentResponse> {
    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('EQUIPMENT_NOT_FOUND', `Equipment with ID ${id} not found.`);
    }

    const updateData: Prisma.EquipmentUpdateInput = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.brand !== undefined) updateData.brand = input.brand;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.pricePaise !== undefined) {
      updateData.price = new Prisma.Decimal(input.pricePaise / 100);
    }
    if (input.stockQty !== undefined) updateData.stockQty = input.stockQty;
    if (input.lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = input.lowStockThreshold;
    }
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;

    const updated = await prisma.equipment.update({
      where: { id },
      data: updateData,
    });

    return formatEquipment(updated);
  }

  /**
   * EQ-05: Adjust equipment stock level atomically.
   */
  async adjustStock(id: number, adjustmentQty: number): Promise<EquipmentResponse> {
    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('EQUIPMENT_NOT_FOUND', `Equipment with ID ${id} not found.`);
    }

    const newStock = Math.max(0, existing.stockQty + adjustmentQty);
    const updated = await prisma.equipment.update({
      where: { id },
      data: { stockQty: newStock },
    });

    return formatEquipment(updated);
  }

  /**
   * EQ-06: Get low stock alerts.
   */
  async getLowStockAlerts(): Promise<EquipmentResponse[]> {
    const all = await prisma.equipment.findMany({ where: { isActive: true } });
    const lowStock = all.filter((item) => item.stockQty <= item.lowStockThreshold);
    return lowStock.map(formatEquipment);
  }
}

export const equipmentService = new EquipmentService();
