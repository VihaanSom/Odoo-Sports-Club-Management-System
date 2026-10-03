import { Request, Response } from 'express';
import { barTabsService } from './tabs.service';
import { sendSuccess } from '../../../utils/response';

export class BarTabsController {
  /**
   * TB-01: GET /api/v1/bar/tabs
   */
  async listTabs(req: Request, res: Response): Promise<Response> {
    const tabs = await barTabsService.listTabs(req.query as any);
    return sendSuccess(res, tabs);
  }

  /**
   * TB-02: POST /api/v1/bar/tabs
   */
  async openTab(req: Request, res: Response): Promise<Response> {
    const staffUserId = req.user!.sub ?? req.user!.id;
    const tab = await barTabsService.openTab(req.body, staffUserId);
    return sendSuccess(res, tab, 'Bar tab opened successfully', 201);
  }

  /**
   * TB-03: GET /api/v1/bar/tabs/:id
   */
  async getTab(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const tab = await barTabsService.getTabById(id, req.user!);
    return sendSuccess(res, tab);
  }

  /**
   * TB-04: POST /api/v1/bar/tabs/:id/items
   */
  async addItems(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const tab = await barTabsService.addItemsToTab(id, req.body);
    return sendSuccess(res, tab, 'Items added to bar tab successfully', 201);
  }

  /**
   * TB-05: PUT /api/v1/bar/tabs/:id/settle
   */
  async settleTab(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const data = await barTabsService.settleTab(id, req.body);
    return sendSuccess(res, data, 'Bar tab settled successfully');
  }
}

export const barTabsController = new BarTabsController();
