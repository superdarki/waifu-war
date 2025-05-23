-- Migration number: 0001 	 2025-05-23T15:14:37.780Z

-- CreateTable
CREATE TABLE "Kiss" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Slap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Kiss_value_key" ON "Kiss"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Slap_value_key" ON "Slap"("value");