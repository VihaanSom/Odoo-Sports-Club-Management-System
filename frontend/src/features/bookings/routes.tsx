import React from 'react';
import { Route } from 'react-router-dom';
import { BookingsPage } from './BookingsPage';
import { BookingCalendarPage } from './BookingCalendarPage';
import { NewBookingPage } from './NewBookingPage';
import { BookingDetailPage } from './BookingDetailPage';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { CourtManagementPage } from '../facilities/CourtManagementPage';

export const bookingRoutes = (
  <React.Fragment key="agent-1-booking-routes">
    <Route path="bookings" element={<BookingsPage />} />
    <Route path="bookings/calendar" element={<BookingCalendarPage />} />
    <Route path="bookings/new" element={<NewBookingPage />} />
    <Route path="bookings/:id" element={<BookingDetailPage />} />
    <Route element={<ProtectedRoute allowedRoles={['admin', 'front_desk']} />}>
      <Route path="facilities/manage" element={<CourtManagementPage />} />
    </Route>
  </React.Fragment>
);
