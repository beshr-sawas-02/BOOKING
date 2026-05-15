/*
  Warnings:

  - You are about to drop the column `passport_id` on the `embassy_results` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[booking_id]` on the table `embassy_results` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `embassy_results` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMED', 'BOOKING_REJECTED', 'EMBASSY_APPROVED', 'EMBASSY_REJECTED', 'PASSPORT_VERIFIED', 'PASSPORT_REJECTED', 'DOCUMENT_APPROVED', 'DOCUMENT_REJECTED', 'GENERAL');

-- DropForeignKey
ALTER TABLE "embassy_results" DROP CONSTRAINT "embassy_results_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "embassy_results" DROP CONSTRAINT "embassy_results_passport_id_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "sent_to_embassy_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "embassy_results" DROP COLUMN "passport_id",
ADD COLUMN     "matched_name" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "related_id" BIGINT,
    "related_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "embassy_results_booking_id_key" ON "embassy_results"("booking_id");

-- AddForeignKey
ALTER TABLE "embassy_results" ADD CONSTRAINT "embassy_results_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
