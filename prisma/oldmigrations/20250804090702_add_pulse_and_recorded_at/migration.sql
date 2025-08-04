/*
  Warnings:

  - Added the required column `recordedAt` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Record" ADD COLUMN     "pulse" INTEGER,
ADD COLUMN     "recordedAt" TIMESTAMP(3) NOT NULL;
