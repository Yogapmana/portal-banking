-- CreateIndex
CREATE INDEX "call_logs_customer_id_call_date_idx" ON "call_logs"("customer_id", "call_date");

-- CreateIndex
CREATE INDEX "call_logs_user_id_call_date_idx" ON "call_logs"("user_id", "call_date");

-- CreateIndex
CREATE INDEX "call_logs_status_call_date_idx" ON "call_logs"("status", "call_date");

-- CreateIndex
CREATE INDEX "customers_sales_id_score_idx" ON "customers"("sales_id", "score");

-- CreateIndex
CREATE INDEX "customers_job_idx" ON "customers"("job");

-- CreateIndex
CREATE INDEX "customers_marital_idx" ON "customers"("marital");

-- CreateIndex
CREATE INDEX "customers_education_idx" ON "customers"("education");

-- CreateIndex
CREATE INDEX "customers_age_score_idx" ON "customers"("age", "score");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_expires_at_idx" ON "refresh_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_revoked_at_idx" ON "refresh_tokens"("token", "revoked_at");

-- CreateIndex
CREATE INDEX "users_email_role_idx" ON "users"("email", "role");
