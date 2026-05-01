-- Add composite index on Customer for name search within tenant
CREATE INDEX IF NOT EXISTS "Customer_tenantId_name_idx" ON "Customer"("tenantId", "name");

-- Add composite indexes on Bill for date-range and list queries
CREATE INDEX IF NOT EXISTS "Bill_tenantId_billDate_idx" ON "Bill"("tenantId", "billDate");
CREATE INDEX IF NOT EXISTS "Bill_tenantId_createdAt_idx" ON "Bill"("tenantId", "createdAt");

-- Add indexes on BillItem foreign keys (critical for JOIN performance)
CREATE INDEX IF NOT EXISTS "BillItem_billId_idx" ON "BillItem"("billId");
CREATE INDEX IF NOT EXISTS "BillItem_itemId_idx" ON "BillItem"("itemId");
