import { Request, Response } from 'express';
import { ordersService } from './orders.service';
import { sendSuccess } from '../../utils/response';

export class OrdersController {
  /**
   * OR-01: GET /api/v1/orders
   */
  async listOrders(req: Request, res: Response): Promise<Response> {
    const result = await ordersService.listOrders(req.query as any, req.user!);
    return sendSuccess(res, result.data, undefined, 200, result.pagination);
  }

  /**
   * OR-02: POST /api/v1/orders
   */
  async createOrder(req: Request, res: Response): Promise<Response> {
    const order = await ordersService.createOrder(req.body, req.user!);
    return sendSuccess(res, order, 'Order created successfully', 201);
  }

  /**
   * OR-03: GET /api/v1/orders/:id
   */
  async getOrder(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const order = await ordersService.getOrderById(id, req.user!);
    return sendSuccess(res, order);
  }

  /**
   * OR-04: PUT /api/v1/orders/:id/status
   */
  async updateStatus(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const updated = await ordersService.updateOrderStatus(id, req.body.status);
    return sendSuccess(res, updated, 'Order status updated successfully');
  }
}

export const ordersController = new OrdersController();
