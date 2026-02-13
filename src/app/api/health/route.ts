import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const counts = await Promise.all([
    prisma.blogPost.count(),
    prisma.tattooProject.count(),
    prisma.track.count(),
    prisma.artwork.count(),
  ]);

  return NextResponse.json({
    ok: true,
    counts: {
      blogPosts: counts[0],
      tattooProjects: counts[1],
      tracks: counts[2],
      artworks: counts[3],
    },
  });
}
