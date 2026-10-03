import type { UserRole } from '@/types';

/**
 * Check if the user is a normal club member (Gold, Silver, Junior, etc.)
 */
export const isMemberRole = (role?: UserRole | string): boolean => role === 'member';

/**
 * Check if the user is a super admin
 */
export const isAdminRole = (role?: UserRole | string): boolean => role === 'admin';

/**
 * Check if the user is any internal staff member (admin, front_desk, bar, shop)
 */
export const isStaffRole = (role?: UserRole | string): boolean =>
  ['admin', 'front_desk', 'bar', 'shop'].includes(role || '');

/**
 * Check if the user can manage club members
 */
export const canManageMembers = (role?: string): boolean =>
  ['admin', 'front_desk'].includes(role || '');

/**
 * Check if the user can view the full club bookings ledger and manage court operations
 */
export const canManageBookings = (role?: string): boolean =>
  ['admin', 'front_desk'].includes(role || '');

/**
 * Check if the user can access Staff & HR operations
 */
export const canAccessStaffHR = (role?: string): boolean => role === 'admin';

/**
 * Check if the user can access Bar & Floor POS
 */
export const canAccessBarPOS = (role?: string): boolean =>
  ['admin', 'bar'].includes(role || '');

/**
 * Check if the user can add or edit menu items
 */
export const canManageMenu = (role?: string): boolean =>
  ['admin', 'bar'].includes(role || '');

/**
 * Check if the user can access Orders & Desk POS
 */
export const canAccessOrdersPOS = (role?: string): boolean =>
  ['admin', 'front_desk', 'shop'].includes(role || '');

/**
 * Check if the user can create, update, or rent equipment in Pro Shop
 */
export const canManageEquipment = (role?: string): boolean =>
  ['admin', 'shop'].includes(role || '');

/**
 * Check if the user can access CRM Leads
 */
export const canAccessCRMLeads = (role?: string): boolean =>
  ['admin', 'front_desk'].includes(role || '');

/**
 * Check if the user can access Renewal Invoices
 */
export const canAccessInvoices = (role?: string): boolean =>
  ['admin', 'front_desk'].includes(role || '');

/**
 * Check if the user can access Payments Ledger
 */
export const canAccessPayments = (role?: string): boolean => role === 'admin';

/**
 * Check if the user can access Club Reports & Analytics
 */
export const canAccessReports = (role?: string): boolean => role === 'admin';

/**
 * Check if the user can create or edit membership plans
 */
export const canManagePlans = (role?: string): boolean => role === 'admin';

/**
 * Check if the user can edit ERP connection parameters and operating rules
 */
export const canManageClubSettings = (role?: string): boolean => role === 'admin';
