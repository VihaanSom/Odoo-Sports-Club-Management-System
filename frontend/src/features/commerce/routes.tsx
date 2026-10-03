import React from 'react';
import type { RouteObject } from 'react-router-dom';
import { Route } from 'react-router-dom';

// Bar Pages
import BarTablesPage from '../bar/BarTablesPage';
import OpenTabsPage from '../bar/OpenTabsPage';
import TabDetailPage from '../bar/TabDetailPage';

// Menu Pages
import MenuItemsPage from '../menu/MenuItemsPage';
import MenuItemDetailPage from '../menu/MenuItemDetailPage';

// Orders Pages
import OrdersListPage from '../orders/OrdersListPage';
import NewOrderPage from '../orders/NewOrderPage';
import OrderDetailPage from '../orders/OrderDetailPage';

// Equipment Page
import EquipmentDetailPage from '../equipment/EquipmentDetailPage';

export const commerceRoutes: RouteObject[] = [
  {
    path: 'bar',
    element: <BarTablesPage />,
  },
  {
    path: 'bar/tabs',
    element: <OpenTabsPage />,
  },
  {
    path: 'bar/tabs/:id',
    element: <TabDetailPage />,
  },
  {
    path: 'menu',
    element: <MenuItemsPage />,
  },
  {
    path: 'menu/:id',
    element: <MenuItemDetailPage />,
  },
  {
    path: 'orders',
    element: <OrdersListPage />,
  },
  {
    path: 'orders/new',
    element: <NewOrderPage />,
  },
  {
    path: 'orders/:id',
    element: <OrderDetailPage />,
  },
  {
    path: 'equipment/:id',
    element: <EquipmentDetailPage />,
  },
];

// JSX fragment export for router compatibility
export const commerceJsxRoutes = (
  <React.Fragment key="agent-2-commerce-routes">
    <Route path="bar" element={<BarTablesPage />} />
    <Route path="bar/tabs" element={<OpenTabsPage />} />
    <Route path="bar/tabs/:id" element={<TabDetailPage />} />
    <Route path="menu" element={<MenuItemsPage />} />
    <Route path="menu/:id" element={<MenuItemDetailPage />} />
    <Route path="orders" element={<OrdersListPage />} />
    <Route path="orders/new" element={<NewOrderPage />} />
    <Route path="orders/:id" element={<OrderDetailPage />} />
    <Route path="equipment/:id" element={<EquipmentDetailPage />} />
  </React.Fragment>
);

export default commerceRoutes;
