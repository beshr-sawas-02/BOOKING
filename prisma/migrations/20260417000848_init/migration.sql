/*
  Warnings:

  - The values [SIBLING] on the enum `RelationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RelationType_new" AS ENUM ('PRIMARY', 'SPOUSE', 'SON', 'DAUGHTER', 'MOTHER', 'FATHER', 'BROTHER', 'SISTER', 'GRANDSON', 'GRANDDAUGHTER', 'SON_WIFE', 'DAUGHTER_HUSBAND', 'NEPHEW', 'NIECE', 'BROTHER_WIFE', 'SISTER_HUSBAND', 'OTHER');
ALTER TABLE "booking_participants" ALTER COLUMN "relation_type" TYPE "RelationType_new" USING ("relation_type"::text::"RelationType_new");
ALTER TYPE "RelationType" RENAME TO "RelationType_old";
ALTER TYPE "RelationType_new" RENAME TO "RelationType";
DROP TYPE "RelationType_old";
COMMIT;
