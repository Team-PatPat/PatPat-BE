-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('pending', 'completed');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'pending';
