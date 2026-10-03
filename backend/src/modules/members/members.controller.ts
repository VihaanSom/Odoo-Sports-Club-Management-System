import { Request, Response } from 'express';
import { membersService } from './members.service';
import { sendSuccess } from '../../utils/response';

export class MembersController {
  /**
   * ME-01: GET /api/v1/members
   */
  async listMembers(req: Request, res: Response): Promise<Response> {
    const result = await membersService.listMembers(req.query as any);
    return sendSuccess(res, result.data, undefined, 200, result.pagination);
  }

  /**
   * ME-02: POST /api/v1/members
   */
  async createMember(req: Request, res: Response): Promise<Response> {
    const member = await membersService.createMember(req.body);
    return sendSuccess(res, member, 'Member created successfully', 201);
  }

  /**
   * ME-03: GET /api/v1/members/:id
   */
  async getMember(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const member = await membersService.getMemberById(id);
    return sendSuccess(res, member);
  }

  /**
   * ME-04: PUT /api/v1/members/:id
   */
  async updateMember(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const isSelf = req.user?.role === 'member' && req.user.id === id;
    const member = await membersService.updateMember(id, req.body, isSelf);
    return sendSuccess(res, member, 'Member updated successfully');
  }

  /**
   * ME-05: POST /api/v1/members/:id/renew
   */
  async renewMembership(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const result = await membersService.renewMembership(id, req.body);
    return sendSuccess(res, result, 'Membership renewed successfully');
  }

  /**
   * ME-06: GET /api/v1/members/:id/history
   */
  async getMemberHistory(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const history = await membersService.getMemberHistory(id, req.query as any);
    return sendSuccess(res, history);
  }
}

export const membersController = new MembersController();
