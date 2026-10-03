import React, { useState } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import {
  FaGear,
  FaSliders,
  FaFloppyDisk,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdBadge,
  FaShieldHalved,
  FaBell,
  FaCrown,
} from 'react-icons/fa6';
import { Card, Button, Input, Badge } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { canManageClubSettings, isMemberRole } from '@/lib/permissions';
import { ErpSettingsSection } from './components';

export const SettingsPage = () => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = canManageClubSettings(user?.role);
  const isMember = isMemberRole(user?.role);

  const [activeTab, setActiveTab] = useState<'profile' | 'system'>(
    isAdmin ? 'system' : 'profile'
  );

  // Profile Form States
  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'Member';

  const [name, setName] = useState(displayName);
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');

  // Notification toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const handleSaveSystem = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Club system settings updated successfully!');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Account preferences saved successfully!');
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
          <FaGear className="size-7 text-primary" />
          {isAdmin ? 'System & Account Settings' : 'Account & Portal Settings'}
        </h1>
        <p className="text-sm text-base-content/70 mt-1">
          {isAdmin
            ? 'Manage Odoo ERP sync, club operating rules, and administrator profile.'
            : 'Manage your profile details, notification preferences, and account security.'}
        </p>
      </div>

      {/* Tabs for Admins */}
      {isAdmin && (
        <div className="join bg-base-200 p-1 rounded-xl">
          <button
            type="button"
            className={`btn btn-sm join-item ${
              activeTab === 'system' ? 'btn-primary' : 'btn-ghost'
            }`}
            onClick={() => setActiveTab('system')}
          >
            <FaGear className="size-3.5" /> Club System & ERP
          </button>
          <button
            type="button"
            className={`btn btn-sm join-item ${
              activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser className="size-3.5" /> Administrator Profile
          </button>
        </div>
      )}

      {/* Club System Settings (Admin only) */}
      {isAdmin && activeTab === 'system' && (
        <form onSubmit={handleSaveSystem} className="space-y-6">
          <ErpSettingsSection />

          {/* Operating Rules */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FaSliders className="size-4 text-primary" /> Operating Rules
            </h2>

            <div className="flex items-center justify-between py-2 border-b border-base-300">
              <div>
                <h4 className="font-semibold text-sm">Allow Member Self-Booking</h4>
                <p className="text-xs text-base-content/60">
                  Members can book courts up to 7 days in advance via the portal.
                </p>
              </div>
              <input type="checkbox" defaultChecked className="toggle toggle-primary" />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-base-300">
              <div>
                <h4 className="font-semibold text-sm">Strict Booking Cancellation Window</h4>
                <p className="text-xs text-base-content/60">
                  Enforce 12-hour penalty fee for late court cancellations.
                </p>
              </div>
              <input type="checkbox" defaultChecked className="toggle toggle-primary" />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="font-semibold text-sm">Allow Equipment Walk-in Checkout</h4>
                <p className="text-xs text-base-content/60">
                  Allow pro-shop desk staff to issue gear to members without prior reservation.
                </p>
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
      )}

      {/* Profile & Account Preferences (Members and Staff Profile) */}
      {(!isAdmin || activeTab === 'profile') && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Account Overview Card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-base-300">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-2xl border border-primary/20">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-base-content">{displayName}</h3>
                  <p className="text-xs text-base-content/60 font-mono mt-0.5">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="primary" size="sm" className="capitalize font-semibold">
                      {user?.role || 'Member'}
                    </Badge>
                    {user?.tier && (
                      <Badge variant="outline" size="sm" className="gap-1 font-semibold text-amber-600 border-amber-300 bg-amber-50">
                        <FaCrown className="size-3 text-amber-500" />
                        {user.tier} Tier
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-base-content/50 block">Account Reference</span>
                <span className="text-xs font-mono font-bold text-base-content/80">
                  #{user?.memberId || user?.id || 'MEM-104'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<FaUser className="size-3.5 text-base-content/40" />}
              />
              <Input
                label="Email Address"
                value={email}
                disabled
                helperText="Email is bound to your club membership"
                leftIcon={<FaEnvelope className="size-3.5 text-base-content/40" />}
              />
              <Input
                label="Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<FaPhone className="size-3.5 text-base-content/40" />}
              />
              <Input
                label="Membership Tier"
                value={user?.tier || (isMember ? 'Standard Club Member' : 'Staff Access')}
                disabled
                leftIcon={<FaIdBadge className="size-3.5 text-base-content/40" />}
              />
            </div>
          </Card>

          {/* Portal & Notification Preferences */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FaBell className="size-4 text-primary" /> Notification Preferences
            </h2>

            <div className="flex items-center justify-between py-2 border-b border-base-300">
              <div>
                <h4 className="font-semibold text-sm">Court Booking Confirmations</h4>
                <p className="text-xs text-base-content/60">
                  Receive email confirmations and calendar invites when reserving courts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="toggle toggle-primary"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-base-300">
              <div>
                <h4 className="font-semibold text-sm">Slot & Event Reminders</h4>
                <p className="text-xs text-base-content/60">
                  Get reminder alerts 2 hours prior to scheduled court slots.
                </p>
              </div>
              <input
                type="checkbox"
                checked={bookingReminders}
                onChange={(e) => setBookingReminders(e.target.checked)}
                className="toggle toggle-primary"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="font-semibold text-sm">Club Announcements & Cafe Offers</h4>
                <p className="text-xs text-base-content/60">
                  Stay updated on tournament events, pro-shop discounts, and menu specials.
                </p>
              </div>
              <input
                type="checkbox"
                checked={promotions}
                onChange={(e) => setPromotions(e.target.checked)}
                className="toggle toggle-primary"
              />
            </div>
          </Card>

          {/* Security & Access */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FaShieldHalved className="size-4 text-primary" /> Security & Passwords
            </h2>
            <p className="text-xs text-base-content/70">
              To update your account password or modify authorized billing methods, please visit the Front Desk or contact club administration.
            </p>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              leftIcon={<FaFloppyDisk className="size-4" />}
            >
              Save Preferences
            </Button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default SettingsPage;
