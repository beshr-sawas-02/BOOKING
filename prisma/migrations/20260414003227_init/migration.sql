-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EmbassyStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('HAJJ', 'UMRAH');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('PRIMARY', 'SPOUSE', 'SON', 'DAUGHTER', 'MOTHER', 'FATHER', 'SIBLING', 'OTHER');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('FRONT', 'BACK');

-- CreateTable
CREATE TABLE "users" (
    "user_id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "admins" (
    "admin_id" BIGSERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "packages" (
    "package_id" BIGSERIAL NOT NULL,
    "package_title" TEXT NOT NULL,
    "package_type" "PackageType" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "duration_days" INTEGER NOT NULL,
    "price_per_person" DECIMAL(10,2) NOT NULL,
    "max_participants" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("package_id")
);

-- CreateTable
CREATE TABLE "hotels" (
    "hotel_id" BIGSERIAL NOT NULL,
    "hotel_name" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "room_types" TEXT,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotels_pkey" PRIMARY KEY ("hotel_id")
);

-- CreateTable
CREATE TABLE "package_hotels" (
    "id" BIGSERIAL NOT NULL,
    "package_id" BIGINT NOT NULL,
    "hotel_id" BIGINT NOT NULL,

    CONSTRAINT "package_hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_images" (
    "image_id" BIGSERIAL NOT NULL,
    "hotel_id" BIGINT NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_order" INTEGER NOT NULL DEFAULT 0,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hotel_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "booking_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "package_id" BIGINT NOT NULL,
    "booking_status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "total_price" DECIMAL(10,2) NOT NULL,
    "deposit_due_date" TIMESTAMP(3),
    "final_payment_due_date" TIMESTAMP(3),
    "trip_end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "booking_participants" (
    "participant_id" BIGSERIAL NOT NULL,
    "booking_id" BIGINT NOT NULL,
    "user_id" BIGINT,
    "passport_id" BIGINT,
    "full_name" TEXT NOT NULL,
    "relation_type" "RelationType" NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "family_proof_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_participants_pkey" PRIMARY KEY ("participant_id")
);

-- CreateTable
CREATE TABLE "passports" (
    "passport_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "participant_id" BIGINT,
    "full_name_en" TEXT,
    "full_name_ar" TEXT,
    "passport_number" TEXT NOT NULL,
    "nationality" TEXT,
    "gender" "Gender",
    "date_of_birth" DATE,
    "issue_date" DATE,
    "expiry_date" DATE,
    "ai_extracted" BOOLEAN NOT NULL DEFAULT false,
    "extraction_confidence" DOUBLE PRECISION,
    "verified_by_admin" BOOLEAN NOT NULL DEFAULT false,
    "sent_to_embassy" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passports_pkey" PRIMARY KEY ("passport_id")
);

-- CreateTable
CREATE TABLE "passport_images" (
    "image_id" BIGSERIAL NOT NULL,
    "passport_id" BIGINT NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_type" "ImageType" NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passport_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "embassy_results" (
    "result_id" BIGSERIAL NOT NULL,
    "booking_id" BIGINT NOT NULL,
    "passport_id" BIGINT NOT NULL,
    "embassy_status" "EmbassyStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "embassy_results_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "family_proof_documents" (
    "document_id" BIGSERIAL NOT NULL,
    "uploaded_by" BIGINT NOT NULL,
    "booking_id" BIGINT NOT NULL,
    "document_url" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "father_name" TEXT,
    "mother_name" TEXT,
    "im_extracted" BOOLEAN NOT NULL DEFAULT false,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_proof_documents_pkey" PRIMARY KEY ("document_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "package_hotels_package_id_hotel_id_key" ON "package_hotels"("package_id", "hotel_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_participants_passport_id_key" ON "booking_participants"("passport_id");

-- CreateIndex
CREATE UNIQUE INDEX "passports_passport_number_key" ON "passports"("passport_number");

-- AddForeignKey
ALTER TABLE "package_hotels" ADD CONSTRAINT "package_hotels_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("package_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_hotels" ADD CONSTRAINT "package_hotels_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("hotel_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_images" ADD CONSTRAINT "hotel_images_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("hotel_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("package_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "passports"("passport_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_family_proof_id_fkey" FOREIGN KEY ("family_proof_id") REFERENCES "family_proof_documents"("document_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passports" ADD CONSTRAINT "passports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passport_images" ADD CONSTRAINT "passport_images_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "passports"("passport_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "embassy_results" ADD CONSTRAINT "embassy_results_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "embassy_results" ADD CONSTRAINT "embassy_results_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "passports"("passport_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_proof_documents" ADD CONSTRAINT "family_proof_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_proof_documents" ADD CONSTRAINT "family_proof_documents_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;
