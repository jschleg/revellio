-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Untitled Session',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dataMeshPrompt" TEXT,
    "userPrompt" TEXT,
    "dataMeshSummary" TEXT,
    "aiOutputReasoning" TEXT,
    "aiOutputMetadata" TEXT
);

-- CreateTable
CREATE TABLE "CSVFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "rawContent" TEXT NOT NULL DEFAULT '',
    "hasHeader" BOOLEAN NOT NULL DEFAULT true,
    "rowCount" INTEGER NOT NULL,
    "columns" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CSVFile_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CSVRow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "csvFileId" TEXT NOT NULL,
    "rowData" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    CONSTRAINT "CSVRow_csvFileId_fkey" FOREIGN KEY ("csvFileId") REFERENCES "CSVFile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataMeshRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "relationExplanation" TEXT NOT NULL,
    "elements" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DataMeshRelation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VisualizationInstruction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "schema" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "VisualizationInstruction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Relation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sourceColumn" TEXT NOT NULL,
    "targetColumn" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "Relation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Session_createdAt_idx" ON "Session"("createdAt");

-- CreateIndex
CREATE INDEX "Session_updatedAt_idx" ON "Session"("updatedAt");

-- CreateIndex
CREATE INDEX "CSVFile_sessionId_idx" ON "CSVFile"("sessionId");

-- CreateIndex
CREATE INDEX "CSVRow_csvFileId_idx" ON "CSVRow"("csvFileId");

-- CreateIndex
CREATE INDEX "CSVRow_csvFileId_rowIndex_idx" ON "CSVRow"("csvFileId", "rowIndex");

-- CreateIndex
CREATE INDEX "DataMeshRelation_sessionId_idx" ON "DataMeshRelation"("sessionId");

-- CreateIndex
CREATE INDEX "VisualizationInstruction_sessionId_idx" ON "VisualizationInstruction"("sessionId");

-- CreateIndex
CREATE INDEX "Relation_sessionId_idx" ON "Relation"("sessionId");
