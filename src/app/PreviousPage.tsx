"use client";
import { useEffect, useRef, useState } from "react";
import { GetTracksResponse, Track } from "src/app/yt-tracks/route";
import { YoutubeTrack } from "src/components/YoutubeTrack";
import Image from "next/image";
import { SpotifyTracks } from "src/components/SpotifyTracks";
import { SpotifyTrack } from "src/components/SpotifyTrack";
import { SpotifySearchForm } from "src/components/SpotifySearchForm";
import Script from "node_modules/next/script";

// https://developers.google.com/identity/oauth2/web/reference/js-reference#CodeClientConfig
interface CodeClientConfig {
  client_id: string;
  scope: string;
  include_granted_scopes?: boolean;
  redirect_uri?: string;
  callback?: (response: unknown) => void;
  state?: string;
  login_hint?: string;
  hd?: string;
  ux_mode?: "popup" | "redirect";
  select_account?: boolean;
  error_callback?: (error: { type: string; details: unknown }) => void;
}

// https://developers.google.com/identity/oauth2/web/reference/js-reference#CodeResponse
export interface CodeResponse {
  code: string;
  scope: string;
  state: string;
  error: string;
  error_description: string;
  error_uri: string;
}

interface CodeClient {
  requestCode(): void;
}

// https://developers.google.com/identity/oauth2/web/reference/js-reference#TokenClientConfig
export interface TokenClientConfig {
  client_id: string;
  callback: (response: unknown) => void;
  scope: string;
  include_granted_scopes?: boolean;
  prompt?: string;
  enable_granular_consent?: boolean;
  enable_serial_consent?: boolean;
  login_hint?: string;
  hd?: string;
  state?: string;
  error_callback?: (error: { type: string; details: unknown }) => void;
}

// https://developers.google.com/identity/oauth2/web/reference/js-reference#TokenResponse
interface TokenResponse {
  access_token: string;
  expires_in: number;
  hd: string;
  prompt: string;
  token_type: string;
  scope: string;
  state: string;
  error: string;
  error_description: string;
  error_uri: string;
}

// https://developers.google.com/identity/oauth2/web/reference/js-reference#OverridableTokenClientConfig
interface OverridableTokenClientConfig {
  scope?: string;
  include_granted_scopes?: boolean;
  prompt?: string;
  enable_granular_consent?: boolean;
  enable_serial_consent?: boolean;
  login_hint?: string;
  hd?: string;
  state?: string;
  error_callback?: (error: { type: string; details: unknown }) => void;
}

interface TokenClient {
  requestAccessToken(overrideConfig?: OverridableTokenClientConfig): void;
}

// https://developers.google.com/identity/oauth2/web/reference/js-reference#RevocationResponse
interface RevocationResponse {
  successful: boolean;
  error: string;
  error_description: string;
}

export interface OAuth2 {
  initCodeClient: (config: CodeClientConfig) => CodeClient;
  initTokenClient: (config: TokenClientConfig) => TokenClient;
  hasGrantedAllScopes: (
    tokenResponse: TokenResponse,
    firstScope: string,
    ...restScopes: string[]
  ) => boolean;
  hasGrantedAnyScope: (
    tokenResponse: TokenResponse,
    firstScope: string,
    ...restScopes: string[]
  ) => boolean;
  revoke(accessToken: string, done: () => void): RevocationResponse;
}

export default function Home() {
  const [tracks, setTracks] = useState<GetTracksResponse | null>(null);
  // const [oauth2, setOauth2] = useState<OAuth2 | null>(null);
  const oauth2 = useRef<OAuth2>(null);
  // const [codeClient, setCodeClient] = useState<CodeClient | null>(null);

  const fetchTracks = async () => {
    const res = await fetch(window.origin + "/yt-tracks");
    const data = await res.json();
    setTracks(data);
  };

  /*
   * Create form to request access token from Google's OAuth 2.0 server.
   */
  function requestGoogleOauth() {
    if (!oauth2.current) return;
    const NEXT_PUBLIC_GOOGLE_CLIENT_ID =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error("Missing client id or client secret");
      return;
    }

    const client = oauth2.current.initCodeClient({
      client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      include_granted_scopes: true,
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      ux_mode: "popup",
      error_callback: (error) => {
        console.error("Error: " + error.type);
        console.error("Error details: " + error.details);
      },
      callback: (response: unknown) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", window.origin + "/auth/code", true);
        xhr.setRequestHeader(
          "Content-Type",
          "application/x-www-form-urlencoded"
        );
        // Set custom header for CRSF
        xhr.setRequestHeader("X-Requested-With", "XmlHttpRequest");
        xhr.onload = function () {
          console.log("Auth code response: " + xhr.responseText);
        };
        //@ts-expect-error: authorization code (string)
        xhr.send("code=" + response.code);
      },
    });

    client.requestCode();
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

  const notifyMismatch = () => {
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

    // (async () => {
    //   fetch("https://accounts.google.com/gsi/client").then((res) => {
    //     if (res.ok) {
    //       console.log(res.json());
    //       // const script = document.createElement("script");
    //       // script.src = "https://accounts.google.com/gsi/client";
    //       // script.async = true;
    //       // document.body.appendChild(script);
    //     } else {
    //       console.error("Failed to load Google Sign-In library");
    //     }
    //   });
    // })();
  }, []);

  useEffect(() => {
    if (!window.location.hash) return;
    const parsedHash = new URLSearchParams(window.location.hash.substring(1));
    // state: pass-through value
    // access_token:
    // token_type: Bearer
    // expires_in:
    // scope:
    console.log(parsedHash);

    // access_token
  }, []);

  if (!tracks) {
    return <>...</>;
  }

  return (
    <div className="min-h-screen">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        onLoad={() => {
          //@ts-expect-error: google object injected by gsi
          if (google) oauth2.current = google.accounts.oauth2;
        }}
      />
      <main className="w-full flex flex-col items-center py-16 space-y-10">
        <button
          onClick={requestGoogleOauth}
          className="flex space-x-2 mt-2 cursor-pointer text-black active:outline-4 outline-sky-600   bg-[#ffffff] hover:brightness-115 rounded-lg w-max px-3 py-1.5"
        >
          <span>
            <img src="google.svg" alt="google icon" />
          </span>
          <span>Code Authorization with Google</span>
        </button>
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
            className="mx-auto block place-self-center cursor-pointer active:outline-4 outline-sky-600 bg-sky-600 hover:brightness-115 rounded-lg w-max px-3 py-1.5"
          >
            Move to previous song
          </button>
          <SpotifySearchForm defaultSearchQuery={tracks.current.title} />
        </section>
        <section className="grid gap-x-8 grid-cols-[600px_600px]">
          <ul className="space-y-5">
            <YoutubeTrack
              title={tracks.current.title}
              artist={tracks.current.artist}
              album={tracks.current.album}
              q={tracks.current.q}
              thumbnail={tracks.current.thumbnail}
              onNextTrack={() => {
                fetch(window.origin + "/yt-tracks")
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
          {tracks.current && (
            <SpotifyTracks
              query={tracks.current.q}
              onFetchedTracks={handleSpotifyTracks}
            />
          )}
        </section>
      </main>
    </div>
  );
}
