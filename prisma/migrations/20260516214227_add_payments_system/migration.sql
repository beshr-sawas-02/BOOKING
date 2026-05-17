-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DEPOSIT', 'FINAL', 'FULL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('VISA', 'MASTERCARD', 'CASH');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_REQUIRED';

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" BIGSERIAL NOT NULL,
    "booking_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "payment_method" "PaymentMethod" NOT NULL,
    "card_last_4" TEXT,
    "card_holder_name" TEXT,
    "transaction_ref" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_ref_key" ON "payments"("transaction_ref");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
