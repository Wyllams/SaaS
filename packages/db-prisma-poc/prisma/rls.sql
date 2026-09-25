

-- CrewCommand PoC additions that Prisma schema cannot express directly.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_workspace_isolation"
ON "customers"
FOR ALL
TO PUBLIC
USING ("workspace_id" = current_setting('app.workspace_id', true)::uuid)
WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true)::uuid);
