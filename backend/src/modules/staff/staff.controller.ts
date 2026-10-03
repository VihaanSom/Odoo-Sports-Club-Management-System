import { Request, Response } from 'express';
import { staffService } from './staff.service';
import { sendSuccess } from '../../utils/response';

export class StaffController {
  /**
   * ST-01: GET /api/v1/staff
   */
  async listStaff(req: Request, res: Response): Promise<Response> {
    const isAdmin = req.user?.role === 'admin';
    const result = await staffService.listStaff(req.query as any, isAdmin);
    return sendSuccess(res, result.data, undefined, 200, result.pagination);
  }

  /**
   * ST-03: GET /api/v1/staff/:id
   */
  async getStaff(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const isAdmin = req.user?.role === 'admin';
    const staff = await staffService.getStaffById(id, isAdmin);
    return sendSuccess(res, staff);
  }

  /**
   * ST-02: POST /api/v1/staff
   */
  async createStaff(req: Request, res: Response): Promise<Response> {
    const staff = await staffService.createStaff(req.body);
    return sendSuccess(res, staff, 'Staff member created successfully', 201);
  }

  /**
   * ST-04: PUT /api/v1/staff/:id
   */
  async updateStaff(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const updated = await staffService.updateStaff(id, req.body);
    return sendSuccess(res, updated, 'Staff member updated successfully');
  }

  /**
   * SH-01: POST /api/v1/staff/:id/shifts
   */
  async startShift(req: Request, res: Response): Promise<Response> {
    const staffId = parseInt(req.params.id as string, 10);
    const shift = await staffService.startShift(staffId, req.body);
    return sendSuccess(res, shift, 'Shift started successfully', 201);
  }

  /**
   * SH-02: PUT /api/v1/staff/:id/shifts/:shiftId
   */
  async endShift(req: Request, res: Response): Promise<Response> {
    const staffId = parseInt(req.params.id as string, 10);
    const shiftId = parseInt(req.params.shiftId as string, 10);
    const shift = await staffService.endShift(staffId, shiftId, req.body);
    return sendSuccess(res, shift, 'Shift ended successfully');
  }

  /**
   * GET /api/v1/staff/:id/shifts
   */
  async getShifts(req: Request, res: Response): Promise<Response> {
    const staffId = parseInt(req.params.id as string, 10);
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20;
    const result = await staffService.getStaffShifts(staffId, page, pageSize);
    return sendSuccess(res, result.data, undefined, 200, result.pagination);
  }

  /**
   * LV-01: POST /api/v1/leave
   */
  async createLeave(req: Request, res: Response): Promise<Response> {
    const staffId = (req.user?.sub ?? req.user?.id) as number;
    const leave = await staffService.submitLeaveRequest(staffId, req.body);
    return sendSuccess(res, leave, 'Leave request submitted successfully', 201);
  }

  /**
   * LV-02: GET /api/v1/staff/:id/leave
   */
  async getStaffLeaves(req: Request, res: Response): Promise<Response> {
    const staffId = parseInt(req.params.id as string, 10);
    const result = await staffService.getStaffLeaves(staffId, req.query as any);
    return sendSuccess(res, result.data, undefined, 200, result.pagination);
  }

  /**
   * GET /api/v1/leave
   */
  async listAllLeaves(req: Request, res: Response): Promise<Response> {
    const result = await staffService.listAllLeaves(req.query as any);
    return sendSuccess(res, result.data, undefined, 200, result.pagination);
  }

  /**
   * LV-03: PUT /api/v1/leave/:id
   */
  async reviewLeave(req: Request, res: Response): Promise<Response> {
    const leaveId = parseInt(req.params.id as string, 10);
    const reviewerId = (req.user?.sub ?? req.user?.id) as number;
    const reviewed = await staffService.reviewLeaveRequest(leaveId, reviewerId, req.body);
    return sendSuccess(res, reviewed, `Leave request ${reviewed.status} successfully`);
  }
}

export const staffController = new StaffController();
