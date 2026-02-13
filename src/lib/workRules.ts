// src/lib/workRules.ts
import { WorkStatus, WorkType } from "@prisma/client";

export type WorkSectionRule = {
  key: string;
  title: string;
  route?: string;

  type: WorkType;
  status: WorkStatus;

  // tags que deben estar TODOS
  requiredTags: string[];

  // tags “de estilo” (no obligatorios)
  optionalTags?: string[];

  notes?: string;
};

export const WORK_RULES: WorkSectionRule[] = [
  // MUSIC · Techno
  {
    key: "techno_tracks",
    title: "Techno · Tracks",
    route: "/musica/techno/tracks",
    type: WorkType.MUSIC,
    status: WorkStatus.PUBLISHED,
    requiredTags: ["music", "techno", "track"],
    optionalTags: ["electronica", "acid", "analog", "hardware", "glitch", "underground", "process", "no-computer"],
    notes: "Para que salga en Tracks: MUSIC + PUBLISHED + tags music+techno+track (los 3).",
  },
  {
    key: "techno_livesets",
    title: "Techno · Live sets",
    type: WorkType.MUSIC,
    status: WorkStatus.PUBLISHED,
    requiredTags: ["music", "techno", "live-set"],
    optionalTags: ["analog", "hardware", "process", "underground"],
    notes: "Live sets: añade un embed YouTube en galería.",
  },
  {
    key: "techno_sound_experiments",
    title: "Techno · Sound experiments",
    type: WorkType.MUSIC,
    status: WorkStatus.PUBLISHED,
    requiredTags: ["music", "techno", "sound-experiment"],
    optionalTags: ["process", "analog", "hardware", "glitch", "underground"],
  },

  // MUSIC · Metal (por si lo conectas luego)
  {
    key: "metal_discography",
    title: "Metal · Discografía",
    type: WorkType.MUSIC,
    status: WorkStatus.PUBLISHED,
    requiredTags: ["music", "metal", "release"],
    optionalTags: ["guitarra", "voz", "bajo", "underground", "process"],
  },

  // ART / PHOTO (futuro)
  {
    key: "art_photo",
    title: "Arte · Fotografía",
    route: "/arte/photo",
    type: WorkType.ART,
    status: WorkStatus.PUBLISHED,
    requiredTags: ["art", "photo"],
    optionalTags: ["noir", "glitch", "process", "underground"],
  },
  {
    key: "art_painting",
    title: "Arte · Pintura / Ink",
    type: WorkType.ART,
    status: WorkStatus.PUBLISHED,
    requiredTags: ["art", "painting"],
    optionalTags: ["ink", "process", "underground", "glitch"],
  },
];

export function rule(key: string) {
  const r = WORK_RULES.find((x) => x.key === key);
  if (!r) throw new Error(`Missing work rule: ${key}`);
  return r;
}

/** Prisma where: requiere TODOS los requiredTags */
export function whereForRule(r: WorkSectionRule) {
  return {
    type: r.type,
    status: r.status,
    AND: r.requiredTags.map((slug) => ({
      tags: { some: { tag: { slug } } },
    })),
  };
}

/** Lista de slugs de tags que conviene asegurar en DB (requeridos+opcionales) */
export function allTagSlugsFromRules() {
  const set = new Set<string>();
  for (const r of WORK_RULES) {
    r.requiredTags.forEach((t) => set.add(t));
    (r.optionalTags ?? []).forEach((t) => set.add(t));
  }
  return Array.from(set);
}
