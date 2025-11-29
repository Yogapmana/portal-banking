-- CreateIndex
CREATE INDEX "call_logs_call_date_idx" ON "call_logs"("call_date");

-- CreateIndex
CREATE INDEX "customers_sales_id_idx" ON "customers"("sales_id");

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "customers"("name");

-- CreateIndex
CREATE INDEX "customers_phoneNumber_idx" ON "customers"("phoneNumber");

-- CreateIndex
CREATE INDEX "customers_score_idx" ON "customers"("score");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
