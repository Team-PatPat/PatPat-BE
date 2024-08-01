/*
  Warnings:

  - You are about to drop the column `isLiked` on the `Letter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Letter" DROP COLUMN "isLiked",
ADD COLUMN     "is_liked" BOOLEAN DEFAULT false;
