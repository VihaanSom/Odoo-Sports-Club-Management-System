import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import {
  FaGear,
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
import { authService } from '@/services/authService';

export const SettingsPage = () => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = canManageClubSettings(user?.role);
  const isMember = isMemberRole(user?.role);

  // Profile Form States
  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'User';

  const [name, setName] = useState(displayName);
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [saving, setSaving] = useState(false);

  // Sync state when user profile is loaded or updated
  useEffect(() => {
    if (user) {
      const dName =
        user.name ||
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.email?.split('@')[0] ||
        '';
      setName(dName);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Notification toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await authService.updateProfile({
        fullName: name,
        phone,
      });
      useAuthStore.getState().setUser(updatedUser);
      toast.success('Account preferences saved successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
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
          {isAdmin ? 'Administrator Settings' : 'Account & Portal Settings'}
        </h1>
        <p className="text-sm text-base-content/70 mt-1">
          {isAdmin
            ? 'Manage your administrator profile details, contact information, and preferences.'
            : 'Manage your profile details, notification preferences, and account security.'}
        </p>
      </div>

      {/* Profile & Account Preferences */}
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
              placeholder="Enter full name"
              leftIcon={<FaUser className="size-3.5 text-base-content/40" />}
            />
            <Input
              label="Email Address"
              value={email}
              disabled
              helperText="Email is bound to your club account"
              leftIcon={<FaEnvelope className="size-3.5 text-base-content/40" />}
            />
            <Input
              label="Contact Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              leftIcon={<FaPhone className="size-3.5 text-base-content/40" />}
            />
            <Input
              label="Membership Tier / Role"
              value={user?.tier ? `${user.tier} Tier` : isMember ? 'Standard Club Member' : `${user?.role || 'Staff'} Role`}
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
            isLoading={saving}
            leftIcon={<FaFloppyDisk className="size-4" />}
          >
            Save Preferences
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default SettingsPage;
