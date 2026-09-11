CREATE TABLE "WorkspaceContent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "ProjectContentType" NOT NULL DEFAULT 'NOTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkspaceContent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkspaceContent_workspaceId_type_idx" ON "WorkspaceContent"("workspaceId", "type");
CREATE INDEX "WorkspaceContent_workspaceId_updatedAt_idx" ON "WorkspaceContent"("workspaceId", "updatedAt");

ALTER TABLE "WorkspaceContent"
ADD CONSTRAINT "WorkspaceContent_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
