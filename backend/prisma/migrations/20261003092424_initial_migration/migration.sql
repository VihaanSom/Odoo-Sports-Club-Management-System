-- CreateEnum
CREATE TYPE "membership_tier" AS ENUM ('Gold', 'Silver', 'Junior');

-- CreateEnum
CREATE TYPE "membership_status" AS ENUM ('active', 'expired');

-- CreateEnum
CREATE TYPE "sport_type" AS ENUM ('tennis', 'cricket');

-- CreateEnum
CREATE TYPE "booking_type" AS ENUM ('member', 'walk_in', 'social');

-- CreateEnum
CREATE TYPE "booking_status" AS ENUM ('confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('cash', 'card', 'upi', 'plan');

-- CreateEnum
CREATE TYPE "order_type" AS ENUM ('in_store', 'online', 'bar');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending', 'confirmed', 'fulfilled', 'cancelled');

-- CreateEnum
CREATE TYPE "equipment_category" AS ENUM ('racket', 'ball', 'shoe', 'accessory', 'apparel');

-- CreateEnum
CREATE TYPE "menu_category" AS ENUM ('food', 'beverage', 'snack');

-- CreateEnum
CREATE TYPE "tab_status" AS ENUM ('open', 'settled');

-- CreateEnum
CREATE TYPE "lead_status" AS ENUM ('new', 'contacted', 'converted', 'lost');

-- CreateEnum
CREATE TYPE "staff_role" AS ENUM ('admin', 'front_desk', 'bar', 'shop');

-- CreateEnum
CREATE TYPE "leave_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "members" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "date_of_birth" DATE,
    "tier" "membership_tier" NOT NULL,
    "membership_start" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membership_end" DATE NOT NULL,
    "status" "membership_status" NOT NULL DEFAULT 'active',
    "photo_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_address" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "addr_line1" VARCHAR(255) NOT NULL,
    "addr_line2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "pincode" VARCHAR(6) NOT NULL,

    CONSTRAINT "member_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_plans" (
    "id" SERIAL NOT NULL,
    "tier" "membership_tier" NOT NULL,
    "duration_months" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "court_rate" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "shop_discount_pct" INTEGER NOT NULL DEFAULT 0,
    "bar_discount_pct" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "sport" "sport_type" NOT NULL,
    "open_time" TEXT NOT NULL DEFAULT '00:00',
    "close_time" TEXT NOT NULL DEFAULT '23:30',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "courts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "court_id" INTEGER NOT NULL,
    "member_id" INTEGER,
    "guest_name" VARCHAR(150),
    "guest_phone" VARCHAR(20),
    "booking_type" "booking_type" NOT NULL DEFAULT 'member',
    "slot_start" TIMESTAMPTZ NOT NULL,
    "slot_end" TIMESTAMPTZ NOT NULL,
    "status" "booking_status" NOT NULL DEFAULT 'confirmed',
    "amount_paid" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "payment_method" "payment_method",
    "notes" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_participants" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "member_id" INTEGER,
    "guest_name" VARCHAR(150),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "category" "equipment_category" NOT NULL,
    "brand" VARCHAR(100),
    "description" VARCHAR(1000),
    "price" DECIMAL(10,2) NOT NULL,
    "stock_qty" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "image_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "category" "menu_category" NOT NULL,
    "description" VARCHAR(500),
    "price" DECIMAL(10,2) NOT NULL,
    "stock_qty" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "image_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER,
    "order_type" "order_type" NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'pending',
    "payment_method" "payment_method",
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "delivery_address" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items_equipment" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items_menu" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "menu_item_id" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bar_tables" (
    "id" SERIAL NOT NULL,
    "table_no" VARCHAR(10) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "bar_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bar_tabs" (
    "id" SERIAL NOT NULL,
    "bar_table_id" INTEGER NOT NULL,
    "member_id" INTEGER,
    "opened_by" INTEGER NOT NULL,
    "status" "tab_status" NOT NULL DEFAULT 'open',
    "opened_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settled_at" TIMESTAMPTZ,
    "notes" VARCHAR(500),

    CONSTRAINT "bar_tabs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bar_tab_items" (
    "id" SERIAL NOT NULL,
    "tab_id" INTEGER NOT NULL,
    "menu_item_id" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bar_tab_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "message" VARCHAR(2000),
    "status" "lead_status" NOT NULL DEFAULT 'new',
    "assigned_to" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "staff_role" NOT NULL,
    "phone" VARCHAR(20),
    "salary" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" SERIAL NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "shift_date" DATE NOT NULL,
    "shift_start" TIMESTAMPTZ NOT NULL,
    "shift_end" TIMESTAMPTZ,
    "notes" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" SERIAL NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "from_date" DATE NOT NULL,
    "to_date" DATE NOT NULL,
    "reason" VARCHAR(500),
    "status" "leave_status" NOT NULL DEFAULT 'pending',
    "reviewed_by" INTEGER,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER,
    "booking_id" INTEGER,
    "order_id" INTEGER,
    "bar_tab_id" INTEGER,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" "payment_method" NOT NULL,
    "reference_no" VARCHAR(100),
    "notes" VARCHAR(500),
    "paid_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE INDEX "members_email_idx" ON "members"("email");

-- CreateIndex
CREATE INDEX "members_phone_idx" ON "members"("phone");

-- CreateIndex
CREATE INDEX "members_tier_idx" ON "members"("tier");

-- CreateIndex
CREATE INDEX "members_status_idx" ON "members"("status");

-- CreateIndex
CREATE INDEX "member_address_member_id_idx" ON "member_address"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_plans_tier_duration_months_key" ON "membership_plans"("tier", "duration_months");

-- CreateIndex
CREATE INDEX "bookings_court_id_idx" ON "bookings"("court_id");

-- CreateIndex
CREATE INDEX "bookings_member_id_idx" ON "bookings"("member_id");

-- CreateIndex
CREATE INDEX "bookings_slot_start_idx" ON "bookings"("slot_start");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "booking_participants_booking_id_idx" ON "booking_participants"("booking_id");

-- CreateIndex
CREATE INDEX "equipment_category_idx" ON "equipment"("category");

-- CreateIndex
CREATE INDEX "menu_items_category_idx" ON "menu_items"("category");

-- CreateIndex
CREATE INDEX "orders_member_id_idx" ON "orders"("member_id");

-- CreateIndex
CREATE INDEX "orders_order_type_idx" ON "orders"("order_type");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "order_items_equipment_order_id_idx" ON "order_items_equipment"("order_id");

-- CreateIndex
CREATE INDEX "order_items_menu_order_id_idx" ON "order_items_menu"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "bar_tables_table_no_key" ON "bar_tables"("table_no");

-- CreateIndex
CREATE INDEX "bar_tabs_bar_table_id_idx" ON "bar_tabs"("bar_table_id");

-- CreateIndex
CREATE INDEX "bar_tabs_status_idx" ON "bar_tabs"("status");

-- CreateIndex
CREATE INDEX "bar_tab_items_tab_id_idx" ON "bar_tab_items"("tab_id");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE INDEX "staff_role_idx" ON "staff"("role");

-- CreateIndex
CREATE INDEX "shifts_staff_id_idx" ON "shifts"("staff_id");

-- CreateIndex
CREATE INDEX "shifts_shift_date_idx" ON "shifts"("shift_date");

-- CreateIndex
CREATE INDEX "leave_requests_staff_id_idx" ON "leave_requests"("staff_id");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");

-- CreateIndex
CREATE INDEX "payments_member_id_idx" ON "payments"("member_id");

-- CreateIndex
CREATE INDEX "payments_paid_at_idx" ON "payments"("paid_at");

-- AddForeignKey
ALTER TABLE "member_address" ADD CONSTRAINT "member_address_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items_equipment" ADD CONSTRAINT "order_items_equipment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items_equipment" ADD CONSTRAINT "order_items_equipment_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items_menu" ADD CONSTRAINT "order_items_menu_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items_menu" ADD CONSTRAINT "order_items_menu_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bar_tabs" ADD CONSTRAINT "bar_tabs_bar_table_id_fkey" FOREIGN KEY ("bar_table_id") REFERENCES "bar_tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bar_tabs" ADD CONSTRAINT "bar_tabs_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bar_tabs" ADD CONSTRAINT "bar_tabs_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bar_tab_items" ADD CONSTRAINT "bar_tab_items_tab_id_fkey" FOREIGN KEY ("tab_id") REFERENCES "bar_tabs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bar_tab_items" ADD CONSTRAINT "bar_tab_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bar_tab_id_fkey" FOREIGN KEY ("bar_tab_id") REFERENCES "bar_tabs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
