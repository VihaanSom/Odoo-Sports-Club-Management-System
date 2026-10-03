import { z } from 'zod';

export const memberIdParamSchema = z.object({
  memberId: z.coerce.number().int().positive('Member ID must be a positive integer'),
});

export type MemberIdParam = z.infer<typeof memberIdParamSchema>;
