import React from 'react';
import { Route } from 'react-router-dom';
import { BookingsPage } from './BookingsPage';
import { BookingCalendarPage } from './BookingCalendarPage';
import { NewBookingPage } from './NewBookingPage';
import { BookingDetailPage } from './BookingDetailPage';
import { CourtManagementPage } from '../facilities/CourtManagementPage';

export const bookingRoutes = (
  <React.Fragment key="agent-1-booking-routes">
    <Route path="bookings" element={<BookingsPage />} />
    <Route path="bookings/calendar" element={<BookingCalendarPage />} />
    <Route path="bookings/new" element={<NewBookingPage />} />
    <Route path="bookings/:id" element={<BookingDetailPage />} />
    <Route path="facilities/manage" element={<CourtManagementPage />} />
  </React.Fragment>
);
