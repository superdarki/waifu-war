-- Migration number: 0001 	 2025-05-23T15:14:44.600Z

-- CreateTable
CREATE TABLE "Kiss" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Slap" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Kiss_value_key" ON "Kiss"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Slap_value_key" ON "Slap"("value");