// src/lib/baseTags.ts
export type BaseTag = { slug: string; name: string };

export const BASE_TAGS: BaseTag[] = [
  { slug: "underground", name: "Underground" },
  { slug: "process", name: "Process" },
  { slug: "noir", name: "Noir" },
  { slug: "glitch", name: "Glitch" },
  { slug: "analog", name: "Analog" },
  { slug: "hardware", name: "Hardware" },
  { slug: "no-computer", name: "No computer" },

  { slug: "tattoo", name: "Tattoo" },
  { slug: "music", name: "Music" },
  { slug: "film", name: "Film" },
  { slug: "art", name: "Art" },
  { slug: "dev", name: "Dev" },
  { slug: "journal", name: "Journal" },

  { slug: "blackout", name: "Blackout" },
  { slug: "blackwork", name: "Blackwork" },
  { slug: "organic", name: "Organic" },

  { slug: "techno", name: "Techno" },
  { slug: "electronica", name: "Electrónica" },
  { slug: "acid", name: "Acid" },
  { slug: "metal", name: "Metal" },

  { slug: "track", name: "Track" },
  { slug: "live-set", name: "Live set" },
  { slug: "sound-experiment", name: "Sound experiment" },
  { slug: "samplepack", name: "Samplepack" },
  { slug: "release", name: "Release" },

  { slug: "photo", name: "Photo" },
  { slug: "painting", name: "Painting" },
  { slug: "ink", name: "Ink" },
  { slug: "drawing", name: "Drawing" },

  // ✅ este es el que te rompe Featured si no existe
  { slug: "home-featured", name: "Home featured" },
];
