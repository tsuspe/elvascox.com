-- CreateTable
CREATE TABLE "SitePageIndex" (
    "id" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "section" TEXT,
    "labels" TEXT[],
    "description" TEXT,
    "keywords" TEXT[],
    "excerpt" TEXT,
    "content" TEXT,
    "source" TEXT NOT NULL DEFAULT 'page',
    "workId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePageIndex_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SitePageIndex_href_key" ON "SitePageIndex"("href");

-- CreateIndex
CREATE INDEX "SitePageIndex_source_idx" ON "SitePageIndex"("source");

-- CreateIndex
CREATE INDEX "SitePageIndex_section_idx" ON "SitePageIndex"("section");
