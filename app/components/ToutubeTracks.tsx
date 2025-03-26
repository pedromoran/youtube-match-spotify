"use client";
import { useEffect, useState } from "react";
import { YoutubeTrack } from "./YoutubeTrack";
import Image from "next/image";
import { SpotifyTrack } from "./SpotifyTrack";
import { GetTracksResponse, Track } from "../yt-tracks/route";

export const ToutubeTracks = () => {
  const [tracks, setTracks] = useState<GetTracksResponse | null>(null);

  const fetchTracks = async () => {
    const res = await fetch("http://localhost:3000/yt-tracks");
    const data = await res.json();
    setTracks(data);
  };

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

  const notifyMismatch = () => {
    return;
    if (Notification.permission === "granted") {
      new Notification("There is a mismatch! 🙂");
      new Audio("notification.wav").play();
      return;
    }
  };

  const handleSpotifyTracks = (sfyTracks: SpotifyTrack[]) => {
    const hasMismatch =
      sfyTracks.length > 0 && sfyTracks[0].title !== tracks?.current.title;

    if (hasMismatch) notifyMismatch();
  };

  useEffect(() => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "default") {
      alert("Let us notify you when there is a mismatch!");
      Notification.requestPermission();
      return;
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, []);

  if (!tracks) {
    return <>...</>;
  }

  // https://www.googleapis.com/youtube/v3/playlistItems?playlistId=PLzXxG3O_lu6A7Ad8Iz9A7pa0_zhT0WXmy&part=contentDetails,id,snippet

  // https://www.googleapis.com/youtube/v3/videos?id=fyrmM_SYC0Q&part=contentDetails,fileDetails,id,liveStreamingDetails,player,processingDetails,recordingDetails,snippet,statistics,topicDetails

  return (
    <section>
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
      <button
        onClick={() => {
          goPrevYTSong();
        }}
        className="mx-auto block place-self-center cursor-pointer active:outline-4 outline-sky-600 bg-sky-600 hover:brightness-115 rounded-lg w-max px-3 py-1.5"
      >
        Move to previous song
      </button>
      <Image
        src="/youtube_music.svg"
        alt="youtube music logo"
        width={120}
        height={120}
      />
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
    </section>
  );
};
