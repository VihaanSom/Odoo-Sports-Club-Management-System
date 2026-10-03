import { MemberAddress } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../utils/errors';
import { AddressInput } from './address.validator';

export class AddressService {
  /**
   * Helper to verify member existence. Throws 404 MEMBER_NOT_FOUND if member doesn't exist.
   */
  private async ensureMemberExists(memberId: number): Promise<void> {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true },
    });
    if (!member) {
      throw new NotFoundError('MEMBER_NOT_FOUND', `Member with ID ${memberId} not found.`);
    }
  }

  /**
   * MA-01: Get a member's structured address.
   * Returns null if no address is present (contract specifies: data: null, not 404).
   */
  async getAddressByMemberId(memberId: number): Promise<MemberAddress | null> {
    await this.ensureMemberExists(memberId);

    const address = await prisma.memberAddress.findFirst({
      where: { memberId },
    });

    return address || null;
  }

  /**
   * MA-02: Create or update (upsert) the member's address.
   * If address exists -> UPDATE. If absent -> INSERT.
   * memberId is always bound from path, never request body.
   */
  async upsertAddress(memberId: number, input: AddressInput): Promise<MemberAddress> {
    await this.ensureMemberExists(memberId);

    const existing = await prisma.memberAddress.findFirst({
      where: { memberId },
    });

    if (existing) {
      return await prisma.memberAddress.update({
        where: { id: existing.id },
        data: {
          addrLine1: input.addrLine1,
          addrLine2: input.addrLine2 ?? null,
          city: input.city ?? null,
          state: input.state ?? null,
          pincode: input.pincode,
        },
      });
    }

    return await prisma.memberAddress.create({
      data: {
        memberId,
        addrLine1: input.addrLine1,
        addrLine2: input.addrLine2 ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        pincode: input.pincode,
      },
    });
  }

  /**
   * MA-03: Delete member's address.
   * Throws 404 ADDRESS_NOT_FOUND if no address is registered for this member.
   */
  async deleteAddress(memberId: number): Promise<void> {
    await this.ensureMemberExists(memberId);

    const existing = await prisma.memberAddress.findFirst({
      where: { memberId },
    });

    if (!existing) {
      throw new NotFoundError('ADDRESS_NOT_FOUND', `No address exists for member with ID ${memberId}.`);
    }

    await prisma.memberAddress.delete({
      where: { id: existing.id },
    });
  }
}

export const addressService = new AddressService();
