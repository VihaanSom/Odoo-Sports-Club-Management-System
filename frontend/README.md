# Odoo Sports Club Management System - Frontend

A modern, high-performance, and visually stunning web application for sports facility management, court reservations, equipment rental, and membership operations, seamlessly integrated with Odoo ERP.

---

## 🏗️ Architecture & Directory Structure

```text
frontend/
├── public/                      # Static assets and icons
│   ├── favicon.svg
│   └── vite.svg
├── src/
│   ├── assets/                  # Images, SVGs, and brand media
│   ├── components/
│   │   ├── layout/              # AppShell, Navbar, Sidebar, Footer, AuthGuard, AdminGuard, PublicLayout
│   │   ├── shared/              # Reusable feature widgets (EmptyState, SearchBar, FilterToolbar, ThemeToggle)
│   │   └── ui/                  # Atomic DaisyUI primitives (Button, Badge, Card, Input, Modal, Avatar, etc.)
│   ├── config/                  # App constants and theme configuration
│   ├── features/                # Feature-based domain modules
│   │   ├── auth/                # LoginPage, RegisterPage
│   │   ├── bookings/            # BookingsPage, BookingsTable
│   │   ├── dashboard/           # DashboardPage, SystemPulseCard (Newton's Cradle), KpiStats, FacilityOccupancy
│   │   ├── equipment/           # EquipmentPage, EquipmentTable, EquipmentCategoryTabs
│   │   ├── errors/              # NotFoundPage
│   │   ├── facilities/          # FacilitiesPage, FacilityCard, FacilityFilterBar
│   │   ├── members/             # MembersPage, MemberFormModal, MembersTable
│   │   ├── memberships/         # MembershipsPage, MembershipPlanCard
│   │   └── settings/            # SettingsPage, ThemeSettingsSection, ErpSettingsSection
│   ├── lib/                     # Third-party utilities (cn, queryClient)
│   ├── mock/                    # Mock datasets (members, facilities, bookings, equipment, plans)
│   ├── services/                # Axios API services (apiClient, authService, memberService, etc.)
│   ├── stores/                  # Zustand stores (authStore, themeStore, uiStore)
│   ├── types/                   # TypeScript interfaces (models, enums, api, ui)
│   ├── App.tsx                  # Top-level routes and provider tree
│   ├── index.css                # Tailwind CSS v4 & DaisyUI v5 tokens
│   ├── main.tsx                 # Root React DOM entry
│   └── vite-env.d.ts            # Client environment & custom element JSX definitions
├── .node-version                # Node v26.5.0 for fnm
├── .nvmrc                       # Node version specification
├── index.html                   # HTML entry point with Google Fonts
├── package.json                 # Dependency manifests and scripts
├── tsconfig.app.json            # Strict TypeScript configuration with @/* alias
├── tsconfig.json                # Project references configuration
├── tsconfig.node.json           # Node configuration for Vite
└── vite.config.ts               # Vite build configuration with Tailwind v4 & React
```

---

## ⚡ Tech Stack

- **Framework**: React 19 + TypeScript (Strict mode)
- **Styling**: Tailwind CSS v4 + DaisyUI v5 (semantic components)
- **State Management**:
  - **Server State**: TanStack Query v5 (`@tanstack/react-query`)
  - **Client State**: Zustand v5
- **Animation**: Motion (`motion/react`) & `ldrs` (Newton's Cradle physics loader)
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Font Awesome 6 strictly via `react-icons/fa6`
- **Linting**: Oxlint

---

## 🚀 Getting Started

### 1. Requirements
- **Node.js**: `26.5.0` (managed via `fnm`)
- **npm**: `11.17.0`

```bash
fnm use 26.5.0
```

### 2. Installation & Development

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run TypeScript type check
npm run typecheck

# Run high-speed Oxlint linter
npm run lint

# Production build
npm run build
```
