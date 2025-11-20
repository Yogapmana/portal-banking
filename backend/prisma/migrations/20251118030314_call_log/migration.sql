/*
  Warnings:

  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('INTERESTED', 'NOT_INTERESTED', 'NO_ANSWER', 'WRONG_NUMBER', 'CALLBACK', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_sales_id_fkey";

-- DropTable
DROP TABLE "Customer";

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "originalId" INTEGER NOT NULL,
    "sales_id" INTEGER,
    "name" TEXT,
    "phoneNumber" TEXT,
    "score" DOUBLE PRECISION,
    "age" INTEGER NOT NULL,
    "job" TEXT NOT NULL,
    "marital" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "default" TEXT NOT NULL,
    "housing" TEXT NOT NULL,
    "loan" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "campaign" INTEGER NOT NULL,
    "pdays" INTEGER NOT NULL,
    "previous" INTEGER NOT NULL,
    "poutcome" TEXT NOT NULL,
    "emp.var.rate" DOUBLE PRECISION NOT NULL,
    "cons.price.idx" DOUBLE PRECISION NOT NULL,
    "cons.conf.idx" DOUBLE PRECISION NOT NULL,
    "euribor3m" DOUBLE PRECISION NOT NULL,
    "nr.employed" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "call_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CallStatus" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_originalId_key" ON "customers"("originalId");

-- CreateIndex
CREATE INDEX "call_logs_customer_id_idx" ON "call_logs"("customer_id");

-- CreateIndex
CREATE INDEX "call_logs_user_id_idx" ON "call_logs"("user_id");

-- CreateIndex
CREATE INDEX "call_logs_status_idx" ON "call_logs"("status");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_sales_id_fkey" FOREIGN KEY ("sales_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
