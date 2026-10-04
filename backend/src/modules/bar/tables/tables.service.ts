import { prisma } from '../../../config/prisma';
import { NotFoundError, ConflictError } from '../../../utils/errors';
import { CreateTableInput, UpdateTableInput } from './tables.validator';
import { TabStatus, MembershipTier } from '@prisma/client';

export interface CurrentTabResponse {
  tabId: number;
  status: TabStatus;
  openedAt: string;
  itemCount: number;
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  runningTotalPaise: number;
  memberId: number | null;
  memberName: string | null;
  memberTier: MembershipTier | null;
}

export interface BarTableResponse {
  id: number;
  tableNo: string;
  capacity: number;
  isActive: boolean;
  currentTab: CurrentTabResponse | null;
}

export class BarTablesService {
  /**
   * BT-01: List all bar tables with their active/open tab status embedded.
   */
  async listTables(): Promise<BarTableResponse[]> {
    const tables = await prisma.barTable.findMany({
      orderBy: { id: 'asc' },
      include: {
        tabs: {
          where: { status: TabStatus.open },
          include: {
            items: true,
            member: true,
          },
        },
      },
    });

    return tables.map((t) => {
      const openTab = t.tabs[0]; // at most 1 open tab per table
      let currentTab: CurrentTabResponse | null = null;

      if (openTab) {
        const itemCount = openTab.items.reduce((acc, it) => acc + it.qty, 0);
        const subtotalPaise = openTab.items.reduce(
          (acc, it) => acc + Math.round(Number(it.subtotal) * 100),
          0
        );

        let discountPct = 0;
        if (openTab.member) {
          if (openTab.member.tier === MembershipTier.Gold) discountPct = 0.15;
          else if (openTab.member.tier === MembershipTier.Silver) discountPct = 0.10;
          else if (openTab.member.tier === MembershipTier.Junior) discountPct = 0.05;
        }

        const discountPaise = Math.round(subtotalPaise * discountPct);
        const totalPaise = Math.max(0, subtotalPaise - discountPaise);

        currentTab = {
          tabId: openTab.id,
          status: openTab.status,
          openedAt: openTab.openedAt.toISOString(),
          itemCount,
          subtotalPaise,
          discountPaise,
          totalPaise,
          runningTotalPaise: totalPaise,
          memberId: openTab.memberId,
          memberName: openTab.member ? `${openTab.member.firstName} ${openTab.member.lastName}`.trim() : null,
          memberTier: openTab.member?.tier || null,
        };
      }

      return {
        id: t.id,
        tableNo: t.tableNo,
        capacity: t.capacity,
        isActive: t.isActive,
        currentTab,
      };
    });
  }

  /**
   * BT-02: Create new bar table with unique tableNo check.
   */
  async createTable(input: CreateTableInput): Promise<BarTableResponse> {
    const existing = await prisma.barTable.findUnique({
      where: { tableNo: input.tableNo },
    });

    if (existing) {
      throw new ConflictError('DUPLICATE_TABLE_NO', `tableNo '${input.tableNo}' already exists`);
    }

    const created = await prisma.barTable.create({
      data: {
        tableNo: input.tableNo,
        capacity: input.capacity ?? 4,
        isActive: input.isActive ?? true,
      },
    });

    return {
      id: created.id,
      tableNo: created.tableNo,
      capacity: created.capacity,
      isActive: created.isActive,
      currentTab: null,
    };
  }

  /**
   * BT-03: Update bar table (capacity, tableNo, isActive).
   */
  async updateTable(id: number, input: UpdateTableInput): Promise<BarTableResponse> {
    const existing = await prisma.barTable.findUnique({
      where: { id },
      include: {
        tabs: {
          where: { status: TabStatus.open },
          include: { items: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('TABLE_NOT_FOUND', `Bar table with ID ${id} not found.`);
    }

    if (input.tableNo && input.tableNo !== existing.tableNo) {
      const duplicate = await prisma.barTable.findUnique({
        where: { tableNo: input.tableNo },
      });
      if (duplicate) {
        throw new ConflictError('DUPLICATE_TABLE_NO', `tableNo '${input.tableNo}' already exists`);
      }
    }

    const updated = await prisma.barTable.update({
      where: { id },
      data: {
        ...(input.tableNo !== undefined && { tableNo: input.tableNo }),
        ...(input.capacity !== undefined && { capacity: input.capacity }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        tabs: {
          where: { status: TabStatus.open },
          include: { items: true, member: true },
        },
      },
    });

    const openTab = updated.tabs[0];
    let currentTab: CurrentTabResponse | null = null;
    if (openTab) {
      const itemCount = openTab.items.reduce((acc, it) => acc + it.qty, 0);
      const subtotalPaise = openTab.items.reduce(
        (acc, it) => acc + Math.round(Number(it.subtotal) * 100),
        0
      );

      let discountPct = 0;
      if (openTab.member) {
        if (openTab.member.tier === MembershipTier.Gold) discountPct = 0.15;
        else if (openTab.member.tier === MembershipTier.Silver) discountPct = 0.10;
        else if (openTab.member.tier === MembershipTier.Junior) discountPct = 0.05;
      }

      const discountPaise = Math.round(subtotalPaise * discountPct);
      const totalPaise = Math.max(0, subtotalPaise - discountPaise);

      currentTab = {
        tabId: openTab.id,
        status: openTab.status,
        openedAt: openTab.openedAt.toISOString(),
        itemCount,
        subtotalPaise,
        discountPaise,
        totalPaise,
        runningTotalPaise: totalPaise,
        memberId: openTab.memberId,
        memberName: openTab.member ? `${openTab.member.firstName} ${openTab.member.lastName}`.trim() : null,
        memberTier: openTab.member?.tier || null,
      };
    }

    return {
      id: updated.id,
      tableNo: updated.tableNo,
      capacity: updated.capacity,
      isActive: updated.isActive,
      currentTab,
    };
  }
}

export const barTablesService = new BarTablesService();
