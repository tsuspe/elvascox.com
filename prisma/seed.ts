// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedTag = {
  slug: string;
  name?: string;
};

function prettyNameFromSlug(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

async function upsertTag(slug: string, name?: string) {
  const pretty = (name ?? prettyNameFromSlug(slug)).trim();

  return prisma.tag.upsert({
    where: { slug },
    update: { name: pretty },
    create: { slug, name: pretty },
    select: { id: true, slug: true },
  });
}

async function ensureBaseTags() {
  // =========================================================
  // TAGS base (vocabulario) — SOLO ESTO (seed limpio)
  // =========================================================
  const baseTags: SeedTag[] = [
    // tono / universales
    { slug: "underground", name: "Underground" },
    { slug: "process", name: "Process" },
    { slug: "noir", name: "Noir" },
    { slug: "glitch", name: "Glitch" },
    { slug: "analog", name: "Analog" },
    { slug: "hardware", name: "Hardware" },
    { slug: "no-computer", name: "No computer" },

    // dominios
    { slug: "tattoo", name: "Tattoo" },
    { slug: "music", name: "Music" },
    { slug: "film", name: "Film" },
    { slug: "art", name: "Art" },
    { slug: "dev", name: "Dev" },
    { slug: "journal", name: "Journal" },

    // tattoo styles
    { slug: "blackout", name: "Blackout" },
    { slug: "blackwork", name: "Blackwork" },
    { slug: "organic", name: "Organic" },

    // music genres + formatos
    { slug: "techno", name: "Techno" },
    { slug: "electronica", name: "Electrónica" },
    { slug: "acid", name: "Acid" },
    { slug: "metal", name: "Metal" },

    // music content types (CLAVE)
    { slug: "track", name: "Track" },
    { slug: "live-set", name: "Live set" },
    { slug: "sound-experiment", name: "Sound experiment" },
    { slug: "samplepack", name: "Samplepack" },
    { slug: "release", name: "Release" },

    // roles metal
    { slug: "guitarra", name: "Guitarra" },
    { slug: "voz", name: "Voz" },
    { slug: "bajo", name: "Bajo" },

    // art mediums
    { slug: "photo", name: "Photo" },
    { slug: "painting", name: "Painting" },
    { slug: "ink", name: "Ink" },
    { slug: "drawing", name: "Drawing" },

    // home editorial curation
    { slug: "home-featured", name: "Home featured" },
  ];

  const results = await Promise.all(baseTags.map((t) => upsertTag(t.slug, t.name)));
  console.log(`✅ Seed base tags OK: ${results.length} tags asegurados.`);
}

async function main() {
  // Seed limpio por defecto: SOLO tags base.
  await ensureBaseTags();

  // Opcional: si quieres habilitar “demo mode” en local algún día,
  // lo dejamos preparado pero no hace nada ahora.
  // Ejecutar: SEED_MODE=demo npx prisma db seed
  if (process.env.SEED_MODE === "demo") {
    console.log("ℹ️ SEED_MODE=demo está activo, pero este seed está en modo limpio.");
    console.log("ℹ️ Si quieres demo data, crea prisma/seed.demo.ts y ejecútalo a mano.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
