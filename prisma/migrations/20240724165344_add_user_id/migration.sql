/*
  Warnings:

  - You are about to drop the column `link` on the `Letter` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `Letter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Letter" DROP COLUMN "link",
ADD COLUMN     "user_id" VARCHAR(36) NOT NULL;

-- AddForeignKey
ALTER TABLE "Letter" ADD CONSTRAINT "Letter_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
