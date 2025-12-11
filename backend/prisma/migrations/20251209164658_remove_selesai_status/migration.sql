/*
  Warnings:

  - The values [SELESAI] on the enum `CallStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- First, update any existing SELESAI records to TERTARIK
UPDATE "call_logs" SET "status" = 'TERTARIK' WHERE "status" = 'SELESAI';

-- AlterEnum
BEGIN;
CREATE TYPE "CallStatus_new" AS ENUM ('TERTARIK', 'TIDAK_TERTARIK', 'TIDAK_TERSEDIA', 'SALAH_NOMOR', 'BERMINAT');
ALTER TABLE "call_logs" ALTER COLUMN "status" TYPE "CallStatus_new" USING ("status"::text::"CallStatus_new");
ALTER TYPE "CallStatus" RENAME TO "CallStatus_old";
ALTER TYPE "CallStatus_new" RENAME TO "CallStatus";
DROP TYPE "public"."CallStatus_old";
COMMIT;
