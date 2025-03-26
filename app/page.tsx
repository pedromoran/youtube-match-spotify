"use client";
import { useEffect, useState } from "react";
import { GetTracksResponse, Track } from "./yt-tracks/route";
import { YoutubeTrack } from "./YoutubeTrack";
import Image from "next/image";
import { SpotifyTracks } from "./SpotifyTracks";

export default function Home() {
  const [tracks, setTracks] = useState<GetTracksResponse | null>(null);

  const fetchTracks = async () => {
    const res = await fetch("http://localhost:3000/yt-tracks");
    const data = await res.json();
    setTracks(data);
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  if (!tracks) {
    return <>...</>;
  }

  async function goPrevYTSong() {
    try {
      await fetch("/yt-tracks?go=prev", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      fetchTracks();
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="min-h-screen">
      <main className="w-full flex flex-col items-center py-16 space-y-10">
        <section className="grid gap-8 grid-cols-[600px_600px] grid-rows-[auto_auto]">
          <ul className="space-y-5 opacity-50">
            {tracks.prev.map((track: Track) => (
              <YoutubeTrack
                key={track.q}
                title={track.title}
                artist={track.artist}
                album={track.album}
                q={track.q}
                thumbnail={track.thumbnail}
                viewOnly
              />
            ))}
          </ul>
          <ul></ul>
          <button
            onClick={() => {
              goPrevYTSong();
            }}
            className="mx-auto block cursor-pointer active:outline-4 outline-sky-600 bg-[#1e71d7] hover:brightness-115 font-bold rounded-lg w-max px-3 py-1.5"
          >
            Move to previous song
          </button>
          <a
            href={`https://open.spotify.com/search/${tracks.current.q}`}
            target="_blank"
            className="mx-auto block cursor-pointer active:outline-4 outline-sky-600 bg-[#1e71d7] hover:brightness-115 font-bold rounded-lg w-max px-3 py-1.5"
          >
            Go to Spotify with search
          </a>
          {/* <ul></ul> */}
        </section>
        <header className="grid gap-x-8 place-items-center grid-cols-[600px_600px]">
          <Image
            src="/youtube_music.svg"
            alt="youtube music logo"
            width={120}
            height={120}
          />
          <Image
            src="/spotify.svg"
            alt="spotify logo"
            width={120}
            height={120}
          />
        </header>
        <section className="grid gap-x-8 grid-cols-[600px_600px]">
          <ul className="space-y-5">
            <YoutubeTrack
              title={tracks.current.title}
              artist={tracks.current.artist}
              album={tracks.current.album}
              q={tracks.current.q}
              thumbnail={tracks.current.thumbnail}
              onNextTrack={() => {
                fetch("http://localhost:3000/yt-tracks")
                  .then((res) => res.json())
                  .then((data) => setTracks(data));
              }}
            />
            {tracks.next.map((track: Track) => (
              <YoutubeTrack
                key={track.q}
                title={track.title}
                artist={track.artist}
                album={track.album}
                q={track.q}
                thumbnail={track.thumbnail}
                viewOnly
              />
            ))}
          </ul>
          {tracks.current && <SpotifyTracks query={tracks.current.q} />}
        </section>
      </main>
    </div>
  );
}
