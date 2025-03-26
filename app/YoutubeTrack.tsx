"use client";
// import fs from "fs";
// import songsPosition from "@/app/api/data/yt-tracks-position.json";

interface TrackProps {
  title: string;
  artist: string;
  album: string;
  q: string;
  thumbnail: string;
  viewOnly?: boolean;
  onNextTrack?: () => void;
}

export const YoutubeTrack = ({
  thumbnail,
  album,
  artist,
  q,
  title,
  viewOnly,
  onNextTrack,
}: TrackProps) => {
  async function goNextYTSong() {
    try {
      await fetch("/yt-tracks?go=next", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      onNextTrack?.();
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <div className="grid grid-cols-[100px_auto] gap-8 rounded-lg shadow p-5 bg-[#181818] space-x-5">
      <img src={thumbnail} alt="track thumbnail" />
      {/* <Image src={thumbnail} alt="track thumbnail" width={120} height={120} /> */}
      <div>
        <h3 className="text-2xl font-extrabold">{title}</h3>
        <p>
          <strong>{artist}</strong> &deg;{album}
        </p>
        {!viewOnly && (
          <button
            onClick={() => {
              goNextYTSong();
            }}
            className="mt-2 cursor-pointer active:outline-4 outline-sky-600 ml-auto block bg-[#d71e1e] hover:brightness-115 font-bold rounded-lg w-max px-3 py-1.5"
          >
            Discard song
          </button>
        )}
        <p className="hidden">{q}</p>
      </div>
    </div>
  );
};
