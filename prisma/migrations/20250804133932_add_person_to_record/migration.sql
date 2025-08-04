/*
  Warnings:

  - Added the required column `person` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Record" ADD COLUMN     "person" INTEGER NOT NULL;
