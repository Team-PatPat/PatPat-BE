/*
  Warnings:

  - Added the required column `counselor_id` to the `Letter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Letter" ADD COLUMN     "counselor_id" VARCHAR(36) NOT NULL;
