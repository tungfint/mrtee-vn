"use client";

import { CircleAlert, ListMusic, Music2, Pause, Play, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { playableAudioUrl } from "@/lib/media-urls";

export type AudioTrack = {
  artist?: string | null;
  id: string;
  title: string;
  url: string;
};

export type AudioPlaylist = {
  id: string;
  name: string;
  tracks: AudioTrack[];
};

declare global {
  interface WindowEventMap {
    "mrtee:playlist": CustomEvent<AudioPlaylist>;
    "mrtee:video-close": Event;
    "mrtee:video-open": Event;
  }
}

export function SiteMusicPlayer({
  initialPlaylist,
}: {
  initialPlaylist?: AudioPlaylist | null;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const manualPauseRef = useRef(false);
  const resumeAfterVideoRef = useRef(false);
  const [playlist, setPlaylist] = useState<AudioPlaylist | null>(initialPlaylist ?? null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [awaitingGesture, setAwaitingGesture] = useState(false);
  const [playbackMessage, setPlaybackMessage] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.36);
  const track = playlist?.tracks[currentIndex];

  const startPlayback = useCallback(async (automatic = false) => {
    const audio = audioRef.current;

    if (!audio || !track) return;

    try {
      await audio.play();
      setAwaitingGesture(false);
      setPlaybackMessage(null);
      setPlaying(true);
      window.localStorage.setItem("mrtee.music.enabled", "true");
    } catch {
      setPlaying(false);
      if (automatic) {
        setAwaitingGesture(true);
        setPlaybackMessage("Trình duyệt yêu cầu một lần bấm để bật nhạc nền.");
      } else {
        setPlaybackMessage("Không thể phát bài này. Hãy kiểm tra quyền chia sẻ file Google Drive.");
      }
    }
  }, [track]);

  function stopPlayback() {
    manualPauseRef.current = true;
    audioRef.current?.pause();
    setPlaying(false);
    setAwaitingGesture(false);
    setPlaybackMessage(null);
    window.localStorage.setItem("mrtee.music.enabled", "false");
  }

  function moveTrack(offset: number) {
    if (!playlist?.tracks.length) return;
    setCurrentIndex((value) => (value + offset + playlist.tracks.length) % playlist.tracks.length);
  }

  useEffect(() => {
    const storedVolume = Number(window.localStorage.getItem("mrtee.music.volume"));
    if (Number.isFinite(storedVolume) && storedVolume >= 0 && storedVolume <= 1) {
      const timer = window.setTimeout(() => setVolume(storedVolume), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
    window.localStorage.setItem("mrtee.music.volume", String(volume));
  }, [volume]);

  useEffect(() => {
    if (!track) {
      return;
    }

    const musicEnabled = window.localStorage.getItem("mrtee.music.enabled") !== "false";
    manualPauseRef.current = !musicEnabled;

    if (musicEnabled) {
      const timer = window.setTimeout(() => void startPlayback(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, [startPlayback, track]);

  useEffect(() => {
    if (!awaitingGesture || manualPauseRef.current) {
      return;
    }

    const unlockPlayback = () => {
      setAwaitingGesture(false);
      void startPlayback(true);
    };

    document.addEventListener("pointerdown", unlockPlayback, { capture: true, once: true });
    document.addEventListener("keydown", unlockPlayback, { capture: true, once: true });

    return () => {
      document.removeEventListener("pointerdown", unlockPlayback, true);
      document.removeEventListener("keydown", unlockPlayback, true);
    };
  }, [awaitingGesture, startPlayback]);

  useEffect(() => {
    const selectPlaylist = (event: WindowEventMap["mrtee:playlist"]) => {
      manualPauseRef.current = false;
      setPlaylist(event.detail);
      setCurrentIndex(0);
      setExpanded(true);
      window.localStorage.setItem("mrtee.music.enabled", "true");
    };
    const pauseForVideo = () => {
      if (playing) {
        resumeAfterVideoRef.current = true;
        audioRef.current?.pause();
        setPlaying(false);
      }
    };
    const resumeAfterVideo = () => {
      if (resumeAfterVideoRef.current) {
        resumeAfterVideoRef.current = false;
        void startPlayback();
      }
    };
    const nativeVideoStarted = (event: Event) => {
      if (event.target instanceof HTMLVideoElement) pauseForVideo();
    };
    const nativeVideoStopped = (event: Event) => {
      if (event.target instanceof HTMLVideoElement) resumeAfterVideo();
    };

    window.addEventListener("mrtee:playlist", selectPlaylist);
    window.addEventListener("mrtee:video-open", pauseForVideo);
    window.addEventListener("mrtee:video-close", resumeAfterVideo);
    document.addEventListener("play", nativeVideoStarted, true);
    document.addEventListener("pause", nativeVideoStopped, true);
    document.addEventListener("ended", nativeVideoStopped, true);

    return () => {
      window.removeEventListener("mrtee:playlist", selectPlaylist);
      window.removeEventListener("mrtee:video-open", pauseForVideo);
      window.removeEventListener("mrtee:video-close", resumeAfterVideo);
      document.removeEventListener("play", nativeVideoStarted, true);
      document.removeEventListener("pause", nativeVideoStopped, true);
      document.removeEventListener("ended", nativeVideoStopped, true);
    };
  }, [playing, startPlayback]);

  if (!playlist?.tracks.length || !track) {
    return null;
  }

  return (
    <aside className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)]">
      {expanded ? (
        <div className="w-80 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/16">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Music2 aria-hidden className="h-4 w-4 text-emerald-700" />
              {playlist.name}
            </p>
            <button
              aria-label="Thu gọn trình phát"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              onClick={() => setExpanded(false)}
              type="button"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
          <div className="px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{track.title}</p>
            {track.artist ? <p className="truncate text-xs text-slate-500">{track.artist}</p> : null}
            <div className="mt-3 flex items-center gap-2">
              <button
                aria-label="Bài trước"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={() => moveTrack(-1)}
                type="button"
              >
                <SkipBack aria-hidden className="h-4 w-4" />
              </button>
              <button
                aria-label={playing ? "Tạm dừng nhạc" : "Phát nhạc"}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-emerald-700 text-white hover:bg-emerald-800"
                onClick={() => {
                  if (playing) {
                    stopPlayback();
                  } else {
                    manualPauseRef.current = false;
                    void startPlayback();
                  }
                }}
                type="button"
              >
                {playing ? <Pause aria-hidden className="h-4 w-4" /> : <Play aria-hidden className="h-4 w-4" />}
              </button>
              <button
                aria-label="Bài tiếp theo"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={() => moveTrack(1)}
                type="button"
              >
                <SkipForward aria-hidden className="h-4 w-4" />
              </button>
              <Volume2 aria-hidden className="ml-2 h-4 w-4 text-slate-500" />
              <input
                aria-label="Âm lượng"
                className="w-20 accent-emerald-700"
                max="1"
                min="0"
                onChange={(event) => setVolume(Number(event.target.value))}
                step="0.01"
                type="range"
                value={volume}
              />
            </div>
            {playbackMessage ? (
              <p className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                <CircleAlert aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {playbackMessage}
              </p>
            ) : null}
          </div>
          <div className="max-h-44 overflow-y-auto border-t border-slate-100 px-2 py-2">
            {playlist.tracks.map((item, index) => (
              <button
                className={
                  index === currentIndex
                    ? "flex w-full items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-left text-sm text-emerald-900"
                    : "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                }
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                type="button"
              >
                <ListMusic aria-hidden className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          className="inline-flex h-12 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-lg hover:bg-slate-50"
          onClick={() => setExpanded(true)}
          type="button"
        >
          <Music2 aria-hidden className="h-4 w-4 text-emerald-700" />
          Nhạc nền
        </button>
      )}
      <audio
        onEnded={() => moveTrack(1)}
        onError={() => {
          setPlaying(false);
          setPlaybackMessage("Không tải được file nhạc. Hãy bật chia sẻ công khai cho link Google Drive.");
        }}
        ref={audioRef}
        src={playableAudioUrl(track.url)}
      />
    </aside>
  );
}
