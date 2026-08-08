-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "upiId" TEXT;

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN "publicToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Bill_publicToken_key" ON "Bill"("publicToken");
