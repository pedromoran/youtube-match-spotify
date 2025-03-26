"use client";
import { useEffect, useState } from "react";
import { SpotifyTrack } from "./SpotifyTrack";
import { SearchResponse } from "../interfaces/spotify/search-response";

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTracksProps {
  query: string;
  onFetchedTracks: (tracks: SpotifyTrack[]) => void;
}

export const SpotifyTracks = ({
  query,
  onFetchedTracks,
}: SpotifyTracksProps) => {
  const [tracks, setTracks] = useState<SpotifyTrack[] | null>(null);

  const fetchToken = async () => {
    const data = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(
          `${process.env.NEXT_PUBLIC_CLIENT_ID}:${process.env.NEXT_PUBLIC_CLIENT_SECRET}`
        )}`,
      },
      body: "grant_type=client_credentials",
    })
      .then((res) => res.json())
      .then((data) => data);
    return data as SpotifyTokenResponse;
  };

  const formatSpotifyTracks = (payload: SearchResponse): SpotifyTrack[] => {
    const { tracks } = payload;
    const { items } = tracks;
    const formattedTracks = items.map((track) => {
      const { album, artists, name, explicit, external_urls } = track;
      const artist = artists.map((artist) => artist.name).join(", ");
      const t: SpotifyTrack = {
        artist,
        title: name,
        album: album.name,
        explicit,
        thumbnail: album.images[1].url,
        link: external_urls.spotify,
      };
      return t;
    });
    return formattedTracks;
  };

  const fetchSpotifyTracks = async (query: string) => {
    const token = await fetchToken();
    const data = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=3`,
      {
        headers: {
          Authorization: `${token.token_type} ${token.access_token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => data);

    const formattedTracks = formatSpotifyTracks(data);
    setTracks(formattedTracks);
    onFetchedTracks(formattedTracks);
  };

  useEffect(() => {
    setTracks(null);
    fetchSpotifyTracks(query);
  }, [query]);

  return (
    <ul className="space-y-5">
      {tracks === null && <Skeleton />}
      {tracks?.map((track) => (
        <SpotifyTrack key={track.link} track={track} />
      ))}
    </ul>
  );
};

function Skeleton() {
  return (
    <ul className="space-y-5">
      {[1, 2, 3].map((_, i) => (
        <div
          key={i}
          className="skeleton h-[140px] grid grid-cols-[100px_auto] gap-8 rounded-lg shadow p-5  space-x-5"
        >
          <div className="skeleton w-[100px] h-[100px]"></div>
          <div>
            <h3 className="text-2xl text-transparent skeleton font-extrabold">
              _
            </h3>
            <p className="w-32 text-transparent skeleton mt-2">_</p>
            <button
              // onClick={() => {}}
              className="mt-2 text-transparent skeleton ml-auto block font-bold rounded-lg w-max px-3 py-1.5"
            >
              ____________
            </button>
          </div>
        </div>
      ))}
    </ul>
  );
}
