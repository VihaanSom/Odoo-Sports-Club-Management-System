import { Router } from 'express';
import { z } from 'zod';
import { leadsController } from './leads.controller';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import { prisma } from '../../config/prisma';
import { broadcast } from '../../ws';
import { sendSuccess } from '../../utils/response';
import {
  submitLeadSchema,
  requestTrialSchema,
  publicRegisterSchema,
  publicEquipmentQuerySchema,
  publicSlotsQuerySchema,
} from './leads.schema';

const router = Router();

const simplifiedTrialSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(150).optional(),
    fullName: z.string().trim().min(1, 'Name is required').max(150).optional(),
    email: z.string().trim().email('Invalid email address').max(255),
    phone: z.string().trim().max(20).nullable().optional(),
    date: z.string().trim().optional(),
    preferredDate: z.string().trim().optional(),
    sport: z.any().optional(),
    preferredTime: z.any().optional(),
    preferredSlot: z.any().optional(),
    experienceLevel: z.any().optional(),
    state: z.any().optional(),
  })
  .refine(
    (data) => Boolean((data.name && data.name.length > 0) || (data.fullName && data.fullName.length > 0)),
    {
      message: 'Name is required',
      path: ['name'],
    }
  );

const handleTrialRequest = async (req: any, res: any, next: any) => {
  try {
    // If sport and preferredTime are provided and valid, delegate to full booking flow
    if (req.body.sport && req.body.preferredTime) {
      const legacyValidation = requestTrialSchema.safeParse(req.body);
      if (legacyValidation.success) {
        return await leadsController.requestPublicTrial(req, res, next);
      }
    }

    // Simplified Trial Request flow (Bug #11)
    const name = (req.body.name || req.body.fullName || '').trim();
    const email = req.body.email?.trim() || null;
    const phone = req.body.phone?.trim() || null;
    const date = req.body.date || req.body.preferredDate || '';
    const messageText = date ? `Trial session request for ${date}` : 'Trial session request';

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        message: messageText,
        status: 'new',
      },
    });

    broadcast('leads:new', {
      event: 'lead:created',
      data: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        createdAt: lead.createdAt.toISOString(),
      },
    });

    return sendSuccess(
      res,
      {
        leadId: lead.id,
        bookingId: null,
        passCode: `CHAMP-PASS-${lead.id}`,
        fullName: lead.name,
        name: lead.name,
        date,
        message: `Your trial pass has been issued! See you on ${date || 'your visit'}.`,
      },
      'Trial session requested successfully',
      201
    );
  } catch (err) {
    next(err);
  }
};

// PU-01: Get active membership plans grouped by tier
router.get('/plans', (req, res, next) => leadsController.getPublicPlans(req, res, next));

// PU-02: Get active courts list
router.get('/courts', (req, res, next) => leadsController.getPublicCourts(req, res, next));

// PU-03: Get public shop catalogue
router.get(
  '/equipment',
  validateQuery(publicEquipmentQuerySchema),
  (req, res, next) => leadsController.getPublicEquipment(req, res, next)
);

// PU-04: Get public slot availability
router.get(
  '/slots',
  validateQuery(publicSlotsQuerySchema),
  (req, res, next) => leadsController.getPublicSlots(req, res, next)
);

// PU-05: Submit visitor inquiry
router.post(
  '/leads',
  validateBody(submitLeadSchema),
  (req, res, next) => leadsController.submitPublicLead(req, res, next)
);

// PU-06: Request trial session (supports simplified payload & creates lead)
router.post(
  '/trial',
  validateBody(simplifiedTrialSchema),
  handleTrialRequest
);

router.post(
  '/leads/public/trial',
  validateBody(simplifiedTrialSchema),
  handleTrialRequest
);

// PU-07: Member self-registration
router.post(
  '/register',
  validateBody(publicRegisterSchema),
  (req, res, next) => leadsController.registerPublicMember(req, res, next)
);

export default router;
