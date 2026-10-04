# Champions Club Management System

![React](https://img.shields.io/badge/React-19.2.8-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![DaisyUI](https://img.shields.io/badge/DaisyUI-5.6.17-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-26.5.0-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

A unified web platform designed to streamline sports facility scheduling member management retail inventory bar point of sale operations and financial reporting for sports clubs.

## Database Schema

DB Schema: [Click here to view the DB schema](https://dbdiagram.io/d/Odoo-Sports-Club-DB-6ac099e6abcc87fb7adcdc78)

## User Roles

The platform contains two primary user roles:

- Administrator
- Member

Operational staff accounts function under administrative access with station specific permissions for front desk bookings bar service and pro shop inventory.

## Role Permissions

### Administrator

- Control the executive analytics dashboard and performance KPIs
- Schedule and manage tennis and cricket court reservations
- Oversee membership records plan configurations and member statuses
- Handle customer leads and assign prospective members to staff
- Operate retail equipment inventory and point of sale orders
- Manage bar floor tables and settle customer tabs
- Administer staff shift schedules leave submissions and payroll
- Track all club payments in a unified financial ledger
- Export system earnings and operational reports to PDF

### Member

- Access personal account details and active membership tier status
- Reserve tennis and cricket court slots with daily quota limits
- Register for Friday evening social play events
- Purchase gear from the pro shop and order items from the cafe menu
- Track personal court reservations and past purchase receipts

## Frontend Tech Stack

| Technology           | Version | Purpose                                       |
| :------------------- | :------ | :-------------------------------------------- |
| React                | 19.2.8  | User interface components                     |
| Vite                 | 8.2.0   | Development server and build bundler          |
| TypeScript           | 5.8.2   | Static type safety and compile checks         |
| Tailwind CSS         | 4.3.3   | Utility class styling system                  |
| DaisyUI              | 5.6.17  | Accessible interface components               |
| React Router DOM     | 7.18.2  | Client navigation and route protection        |
| TanStack React Query | 5.67.1  | Server state caching and data synchronization |
| Zustand              | 5.0.15  | Client side global state management           |
| Axios                | 1.19.0  | HTTP client for backend requests              |
| Motion               | 13.1.1  | Layout transitions and interface animations   |
| React Hook Form      | 7.54.2  | High performance form state handling          |
| Zod                  | 3.24.2  | Client input validation schemas               |
| Recharts             | 3.10.1  | Data visualization and analytics charts       |
| jsPDF                | 4.2.1   | Client side report generation in PDF format   |
| Oxlint               | 1.75.0  | High speed source code linting                |

## Backend Tech Stack

| Technology    | Version | Purpose                                         |
| :------------ | :------ | :---------------------------------------------- |
| Node.js       | 26.5.0  | JavaScript execution runtime                    |
| Express       | 5.2.1   | REST API routing and HTTP server framework      |
| TypeScript    | 6.0.3   | Backend static typing and maintainability       |
| Prisma ORM    | 6.19.3  | Database modeling migration and query execution |
| PostgreSQL    | 16      | Relational database storage                     |
| TSX           | 4.23.15 | TypeScript execution and live reload runner     |
| JSONWebToken  | 9.0.3   | Stateless authentication token generation       |
| Bcryptjs      | 3.0.3   | Password hashing and security verification      |
| Zod           | 4.6.5   | Request payload validation schemas              |
| WS WebSocket  | 8.22.0  | Real time bidirectional event broadcasting      |
| Multer        | 2.4.0   | Multipart file and image uploads                |
| Cookie Parser | 1.4.7   | HTTP cookie parsing for auth tokens             |
| CORS          | 2.8.6   | Cross origin resource sharing configuration     |
| Dotenv        | 18.0.5  | Environment variable configuration loading      |

## Functionalities

### Authentication and Access Control

- Account registration for new club members
- JWT authentication with secure HTTP cookies
- Role based route protection across all system endpoints
- Password reset request processing

### Court and Facility Booking

- Reservation scheduling for tennis and cricket courts
- Daily booking quota enforcement per member
- Real time court availability calendar grid
- Booking wizard supporting member walk in and social play types
- Automated conflict validation preventing double bookings
- Friday night social play booking mode with shared courts

### Membership Administration

- Membership tiers supporting Gold Silver and Junior categories
- Active plan status verification matching plan name and duration
- Member record management with address and photo upload support
- Member reservation records and order tracking history

### CRM and Lead Tracking

- Public trial session booking form
- Online visitor inquiry form
- Kanban board pipeline for lead status updates
- Staff member assignment for incoming inquiries

### Bar and Floor Operations

- Visual table layout displaying active occupancy
- Running tab management with real time itemization
- Tier based member discounts applied at checkout
- Tab payment settlement supporting cash card and UPI methods
- Daily bar revenue calculation and tracking

### Pro Shop and Inventory Management

- Product catalog categorized into rackets balls shoes apparel and accessories
- Inventory stock tracking with real time quantity adjustments
- Point of sale checkout for in store and member online orders
- Order lifecycle tracking from creation to fulfillment

### Staff Management and HR

- Staff member directory with role definitions and compensation records
- Work shift scheduling and shift roster management
- Leave request submission with supervisor approval workflows

### Finance and Analytics

- Centralized payment ledger recording all club transactions
- Executive dashboard showing key business metrics
- Financial tracking by day week and month
- Bar sales analytics and top selling item reports
- Sharable PDF report export functionality

### Public Web Portal

- Public club homepage highlighting sports and amenities
- Public membership tier comparison page
- Public facility details and court catalog
- Public retail shop catalog browsing
- Public online trial booking registration
