-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "deliveryAddress" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "bankDetails" TEXT;
