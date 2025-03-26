import { NextRequest } from "next/server";
import yt_tracks from "./yt-tracks.json";
import fs from "fs";

const DIR_NAME = process.cwd() + "/app/yt-tracks/";

export interface Track {
  title: string;
  artist: string;
  album: string;
  thumbnail: string;
  q: string;
}

export interface GetTracksResponse {
  prev: Track[];
  current: Track;
  next: Track[];
}

export async function GET() {
  const p = Number(await fs.readFileSync(DIR_NAME + "yt-tracks-position.json"));
  const tracks = {
    prev: yt_tracks.slice(p - 1, p),
    current: yt_tracks[p],
    next: yt_tracks.slice(p + 1, p + 6),
  };
  return Response.json(tracks);
}

export async function PUT(request: NextRequest) {
  const p = Number(await fs.readFileSync(DIR_NAME + "yt-tracks-position.json"));
  const go = new URL(request.url).searchParams.get("go");
  const newCount = p + (go === "next" ? 1 : -1);
  await fs.writeFileSync(
    DIR_NAME + "yt-tracks-position.json",
    JSON.stringify(newCount)
  );
  return Response.json({ message: "ok" });
}
