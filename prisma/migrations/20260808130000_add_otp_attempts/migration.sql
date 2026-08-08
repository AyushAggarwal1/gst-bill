-- AlterTable
ALTER TABLE "PasswordResetRequest" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SignupVerification" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;
