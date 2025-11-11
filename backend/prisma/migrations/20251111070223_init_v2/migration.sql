-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "originalId" INTEGER NOT NULL,
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

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_originalId_key" ON "Customer"("originalId");
