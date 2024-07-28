/*
  Warnings:

  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Chat` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(36)`.
  - You are about to alter the column `counselor_id` on the `Chat` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(36)`.
  - You are about to alter the column `user_id` on the `Chat` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(36)`.
  - The primary key for the `Counselor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Counselor` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(36)`.
  - You are about to alter the column `name` on the `Counselor` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `description` on the `Counselor` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.
  - You are about to alter the column `link` on the `Letter` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(36)`.
  - You are about to alter the column `chat_id` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(36)`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(36)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(70)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_counselor_id_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chat_id_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(36),
ALTER COLUMN "counselor_id" SET DATA TYPE VARCHAR(36),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(36),
ALTER COLUMN "created_at" SET DATA TYPE DATE,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE DATE,
ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Counselor" DROP CONSTRAINT "Counselor_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(36),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "description" SET DATA TYPE VARCHAR(300),
ALTER COLUMN "created_at" SET DATA TYPE DATE,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE DATE,
ADD CONSTRAINT "Counselor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Letter" ALTER COLUMN "link" DROP NOT NULL,
ALTER COLUMN "link" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "created_at" SET DATA TYPE DATE,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(36),
ALTER COLUMN "chat_id" SET DATA TYPE VARCHAR(36),
ALTER COLUMN "created_at" SET DATA TYPE DATE,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE DATE,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(36),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(70),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "created_at" SET DATA TYPE DATE,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE DATE,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_counselor_id_fkey" FOREIGN KEY ("counselor_id") REFERENCES "Counselor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
