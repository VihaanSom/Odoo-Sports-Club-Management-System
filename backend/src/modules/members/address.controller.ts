import { Request, Response } from 'express';
import { addressService } from './address.service';
import { sendSuccess } from '../../utils/response';

export class AddressController {
  /**
   * MA-01: GET /api/v1/members/:id/address
   */
  async getAddress(req: Request, res: Response): Promise<Response> {
    const memberId = parseInt(req.params.id as string, 10);
    const address = await addressService.getAddressByMemberId(memberId);
    return sendSuccess(res, address);
  }

  /**
   * MA-02: PUT /api/v1/members/:id/address
   */
  async upsertAddress(req: Request, res: Response): Promise<Response> {
    const memberId = parseInt(req.params.id as string, 10);
    const address = await addressService.upsertAddress(memberId, req.body);
    return sendSuccess(res, address, 'Address saved successfully');
  }

  /**
   * MA-03: DELETE /api/v1/members/:id/address
   */
  async deleteAddress(req: Request, res: Response): Promise<Response> {
    const memberId = parseInt(req.params.id as string, 10);
    await addressService.deleteAddress(memberId);
    return sendSuccess(res, null, 'Address deleted successfully');
  }
}

export const addressController = new AddressController();
