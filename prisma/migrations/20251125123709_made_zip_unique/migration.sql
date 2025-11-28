/*
  Warnings:

  - A unique constraint covering the columns `[pincode]` on the table `Region` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Region_pincode_key` ON `Region`(`pincode`);
