// src/lib/ensureBaseTags.ts
import type { PrismaClient } from "@prisma/client";
import { BASE_TAGS } from "./baseTags";

export async function ensureBaseTags(prisma: PrismaClient) {
  // idempotente: si existen, update no cambia nada relevante
  await prisma.$transaction(
    BASE_TAGS.map((t) =>
      prisma.tag.upsert({
        where: { slug: t.slug },
        update: { name: t.name },
        create: { slug: t.slug, name: t.name },
      })
    )
  );
}
