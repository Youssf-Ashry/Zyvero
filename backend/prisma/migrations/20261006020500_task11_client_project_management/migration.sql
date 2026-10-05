-- Preserve existing project lifecycle data before replacing the enum.
ALTER TABLE "Project" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "status" TYPE TEXT;
UPDATE "Project" SET "status" = 'NOT_STARTED' WHERE "status" = 'PLANNING';
UPDATE "Project" SET "status" = 'IN_PROGRESS' WHERE "status" = 'ACTIVE';
UPDATE "Project" SET "status" = 'ON_HOLD' WHERE "status" = 'ARCHIVED';

DROP TYPE "ProjectStatus";
CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');
ALTER TABLE "Project"
  ALTER COLUMN "status" TYPE "ProjectStatus"
  USING "status"::"ProjectStatus",
  ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';

ALTER TABLE "Project" ADD COLUMN "clientId" TEXT;

CREATE TABLE "ProjectMember" (
  "projectId" TEXT NOT NULL,
  "workspaceMemberId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("projectId", "workspaceMemberId")
);

CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");
CREATE INDEX "ProjectMember_workspaceMemberId_idx" ON "ProjectMember"("workspaceMemberId");

ALTER TABLE "Project"
  ADD CONSTRAINT "Project_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectMember"
  ADD CONSTRAINT "ProjectMember_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectMember"
  ADD CONSTRAINT "ProjectMember_workspaceMemberId_fkey"
  FOREIGN KEY ("workspaceMemberId") REFERENCES "WorkspaceMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
