import React from 'react';
import { FaServer } from 'react-icons/fa6';
import { Card, Input } from '@/components/ui';
import { ODOO_DEFAULT_URL, ODOO_DEFAULT_DB } from '@/config/constants';

export const ErpSettingsSection: React.FC = () => {
  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <FaServer className="size-4 text-primary" /> Odoo Backend ERP Sync
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Odoo Server URL"
          defaultValue={ODOO_DEFAULT_URL}
          className="font-mono text-sm"
        />
        <Input
          label="Database Name"
          defaultValue={ODOO_DEFAULT_DB}
          className="font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="API Key / User Token"
          type="password"
          defaultValue="••••••••••••••••"
          className="font-mono text-sm"
        />
        <div className="fieldset">
          <label className="fieldset-label font-medium text-xs">Sync Interval</label>
          <select defaultValue="5" className="select select-bordered w-full text-sm">
            <option value="1">Every 1 minute (Real-time)</option>
            <option value="5">Every 5 minutes (Recommended)</option>
            <option value="15">Every 15 minutes</option>
          </select>
        </div>
      </div>
    </Card>
  );
};
