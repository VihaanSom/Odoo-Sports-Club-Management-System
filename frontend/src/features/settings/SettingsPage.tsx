import React from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { FaGear, FaSliders, FaFloppyDisk } from 'react-icons/fa6';
import { Card, Button } from '@/components/ui';
import { ThemeSettingsSection, ErpSettingsSection } from './components';

export const SettingsPage = () => {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings successfully updated!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 max-w-4xl"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <FaGear className="size-7 text-primary" /> Club System Settings
        </h1>
        <p className="text-sm text-base-content/70 mt-1">
          Configure ERP connection parameters, themes, and club operating rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <ThemeSettingsSection />
        <ErpSettingsSection />

        {/* Operating Rules */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaSliders className="size-4 text-primary" /> Operating Rules
          </h2>

          <div className="flex items-center justify-between py-2 border-b border-base-300">
            <div>
              <h4 className="font-semibold text-sm">Allow Member Self-Booking</h4>
              <p className="text-xs text-base-content/60">Members can book courts up to 7 days in advance via portal.</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle toggle-primary" />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-base-300">
            <div>
              <h4 className="font-semibold text-sm">Strict Booking Cancellation Window</h4>
              <p className="text-xs text-base-content/60">Enforce 12-hour penalty fee for late cancellations.</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle toggle-primary" />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            leftIcon={<FaFloppyDisk className="size-4" />}
          >
            Save Configuration
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default SettingsPage;
