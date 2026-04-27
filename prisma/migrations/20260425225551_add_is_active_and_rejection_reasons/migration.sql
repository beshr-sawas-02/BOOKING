-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "embassy_results" ADD COLUMN     "rejection_reason" TEXT;

-- AlterTable
ALTER TABLE "family_proof_documents" ADD COLUMN     "rejection_reason" TEXT;

-- AlterTable
ALTER TABLE "passports" ADD COLUMN     "rejection_reason" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
