import { Prisma, Order, OrderItemEquipment, OrderStatus, OrderType, PaymentMethod, Equipment } from '@prisma/client';
import { prisma } from '../../config/prisma';
import {
  NotFoundError,
  ConflictError,
  UnprocessableError,
  ForbiddenError,
} from '../../utils/errors';
import { AuthUser } from '../../types';
import {
  ListOrdersQuery,
  CreateOrderInput,
} from './orders.validator';

export interface OrderItemResponse {
  id: number;
  equipmentId: number;
  equipmentName: string;
  qty: number;
  unitPricePaise: number;
  subtotalPaise: number;
}

export interface OrderResponse {
  id: number;
  memberId: number | null;
  orderType: OrderType;
  status: OrderStatus;
  subtotalPaise: number;
  discountAmountPaise: number;
  totalAmountPaise: number;
  paymentMethod: PaymentMethod | null;
  deliveryAddress: string | null;
  items?: OrderItemResponse[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * Transforms an Order entity into the API Contract representation.
 * Converts DB Decimals (Rupees) into integer Paise without modifying DB definitions.
 */
export const formatOrder = (
  order: Order & {
    equipmentItems?: (OrderItemEquipment & { equipment?: Equipment })[];
  }
): OrderResponse => {
  const items: OrderItemResponse[] | undefined = order.equipmentItems?.map((item) => ({
    id: item.id,
    equipmentId: item.equipmentId,
    equipmentName: item.equipment?.name || 'Equipment',
    qty: item.qty,
    unitPricePaise: Math.round(Number(item.unitPrice) * 100),
    subtotalPaise: Math.round(Number(item.subtotal) * 100),
  }));

  return {
    id: order.id,
    memberId: order.memberId,
    orderType: order.orderType,
    status: order.status,
    subtotalPaise: Math.round(Number(order.subtotal) * 100),
    discountAmountPaise: Math.round(Number(order.discountAmount) * 100),
    totalAmountPaise: Math.round(Number(order.totalAmount) * 100),
    paymentMethod: order.paymentMethod,
    deliveryAddress: order.deliveryAddress,
    ...(items !== undefined && { items }),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
};

export class OrdersService {
  /**
   * OR-01: List orders with pagination, status/type filters, and ownership scoping.
   */
  async listOrders(query: ListOrdersQuery, caller: AuthUser) {
    const where: Prisma.OrderWhereInput = {};

    // Members see strictly their own orders
    if (caller.role === 'member') {
      where.memberId = caller.id;
    } else if (query.memberId) {
      where.memberId = query.memberId;
    }

    if (query.orderType) {
      where.orderType = query.orderType;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) {
        where.createdAt.gte = new Date(`${query.from}T00:00:00.000Z`);
      }
      if (query.to) {
        where.createdAt.lte = new Date(`${query.to}T23:59:59.999Z`);
      }
    }

    const sortFieldMap: Record<string, keyof Prisma.OrderOrderByWithRelationInput> = {
      created_at: 'createdAt',
      total_amount: 'totalAmount',
      status: 'status',
    };
    const sortField = sortFieldMap[query.sortBy] || 'createdAt';

    const skip = (query.page - 1) * query.pageSize;
    const take = query.pageSize;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          equipmentItems: {
            include: { equipment: true },
          },
        },
        orderBy: { [sortField]: query.sortOrder },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders.map(formatOrder),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize) || 0,
      },
    };
  }

  /**
   * OR-02: Create shop order with ACID stock reservation and tier discounts.
   */
  async createOrder(input: CreateOrderInput, caller: AuthUser): Promise<OrderResponse> {
    // Member authorization check
    let targetMemberId = input.memberId ?? null;
    if (caller.role === 'member') {
      if (targetMemberId && targetMemberId !== caller.id) {
        throw new ForbiddenError(
          'Members cannot create orders on behalf of other users.',
          'FORBIDDEN'
        );
      }
      targetMemberId = caller.id;
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Verify equipment existence, active status, and stock availability
      const itemDetails: {
        equipment: Equipment;
        qty: number;
        subtotalPaise: number;
      }[] = [];

      const insufficientItems: {
        equipmentId: number;
        requested: number;
        available: number;
      }[] = [];

      let subtotalPaise = 0;

      for (const item of input.items) {
        const equipment = await tx.equipment.findUnique({
          where: { id: item.equipmentId },
        });

        if (!equipment || !equipment.isActive) {
          throw new NotFoundError(
            'EQUIPMENT_NOT_FOUND',
            `Equipment item with ID ${item.equipmentId} does not exist or is inactive.`
          );
        }

        if (equipment.stockQty < item.qty) {
          insufficientItems.push({
            equipmentId: equipment.id,
            requested: item.qty,
            available: equipment.stockQty,
          });
        }

        const unitPricePaise = Math.round(Number(equipment.price) * 100);
        const lineSubtotalPaise = unitPricePaise * item.qty;
        subtotalPaise += lineSubtotalPaise;

        itemDetails.push({
          equipment,
          qty: item.qty,
          subtotalPaise: lineSubtotalPaise,
        });
      }

      // If any items lack stock, abort transaction with 409 INSUFFICIENT_STOCK
      if (insufficientItems.length > 0) {
        throw new ConflictError(
          'INSUFFICIENT_STOCK',
          'One or more items have insufficient stock.',
          { items: insufficientItems }
        );
      }

      // 2. Compute member tier discount: Gold = 15%, Silver = 10%, Junior = 5%, Non-member = 0%
      let discountPct = 0;
      if (targetMemberId) {
        const member = await tx.member.findUnique({
          where: { id: targetMemberId },
          select: { tier: true },
        });

        if (member) {
          if (member.tier === 'Gold') discountPct = 15;
          else if (member.tier === 'Silver') discountPct = 10;
          else if (member.tier === 'Junior') discountPct = 5;
        }
      }

      const discountAmountPaise = Math.round(subtotalPaise * (discountPct / 100));
      const totalAmountPaise = subtotalPaise - discountAmountPaise;

      // 3. Create Order
      const order = await tx.order.create({
        data: {
          memberId: targetMemberId,
          orderType: input.orderType,
          status: OrderStatus.pending,
          paymentMethod: input.paymentMethod,
          subtotal: new Prisma.Decimal(subtotalPaise / 100),
          discountAmount: new Prisma.Decimal(discountAmountPaise / 100),
          totalAmount: new Prisma.Decimal(totalAmountPaise / 100),
          deliveryAddress: input.deliveryAddress ?? null,
        },
      });

      // 4. Create OrderItemEquipment and atomically decrement stock
      for (const detail of itemDetails) {
        await tx.orderItemEquipment.create({
          data: {
            orderId: order.id,
            equipmentId: detail.equipment.id,
            qty: detail.qty,
            unitPrice: detail.equipment.price,
            subtotal: new Prisma.Decimal(detail.subtotalPaise / 100),
          },
        });

        await tx.equipment.update({
          where: { id: detail.equipment.id },
          data: {
            stockQty: { decrement: detail.qty },
          },
        });
      }

      // 5. Create linked payment record
      await tx.payment.create({
        data: {
          memberId: targetMemberId,
          orderId: order.id,
          amount: new Prisma.Decimal(totalAmountPaise / 100),
          paymentMethod: input.paymentMethod,
          notes: `Shop order #${order.id} payment (${input.orderType})`,
        },
      });

      // 6. Refetch complete order with line items
      const fullOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: {
          equipmentItems: {
            include: { equipment: true },
          },
        },
      });

      return formatOrder(fullOrder!);
    });
  }

  /**
   * OR-03: Get full order detail with line items.
   */
  async getOrderById(id: number, caller: AuthUser): Promise<OrderResponse> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        equipmentItems: {
          include: { equipment: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('ORDER_NOT_FOUND', `Order with ID ${id} not found.`);
    }

    if (caller.role === 'member' && order.memberId !== caller.id) {
      throw new ForbiddenError(
        'You do not have permission to view this order.',
        'FORBIDDEN'
      );
    }

    return formatOrder(order);
  }

  /**
   * OR-04: Enforce order state machine transitions and stock reversal on cancellation.
   */
  async updateOrderStatus(id: number, newStatus: OrderStatus): Promise<OrderResponse> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        equipmentItems: true,
      },
    });

    if (!order) {
      throw new NotFoundError('ORDER_NOT_FOUND', `Order with ID ${id} not found.`);
    }

    // State Machine (§9.2):
    // pending -> confirmed | cancelled
    // confirmed -> fulfilled | cancelled
    // fulfilled -> terminal (FORBIDDEN)
    // cancelled -> terminal (FORBIDDEN)
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.pending]: [OrderStatus.confirmed, OrderStatus.cancelled],
      [OrderStatus.confirmed]: [OrderStatus.fulfilled, OrderStatus.cancelled],
      [OrderStatus.fulfilled]: [],
      [OrderStatus.cancelled]: [],
    };

    if (!validTransitions[order.status].includes(newStatus)) {
      throw new UnprocessableError(
        'INVALID_STATE_TRANSITION',
        `Cannot transition order #${id} from status '${order.status}' to '${newStatus}'.`
      );
    }

    return await prisma.$transaction(async (tx) => {
      // Stock reversal on cancellation
      if (newStatus === OrderStatus.cancelled) {
        for (const item of order.equipmentItems) {
          await tx.equipment.update({
            where: { id: item.equipmentId },
            data: {
              stockQty: { increment: item.qty },
            },
          });
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: newStatus,
        },
        include: {
          equipmentItems: {
            include: { equipment: true },
          },
        },
      });

      return formatOrder(updated);
    });
  }
}

export const ordersService = new OrdersService();
