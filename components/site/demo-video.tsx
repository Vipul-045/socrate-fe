"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import {
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { m, useMotionValue, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { useScrollLinkedMotion } from "@/components/motion/use-scroll-linked-motion";

import {
  Container,
  MonoLabel,
  Section,
  SectionHeading,
} from "@/components/site/primitives";

/** How long the controls stay up after the pointer stops moving. */
const IDLE_MS = 2200;
/** Arrow-key seek step, in seconds. */
const SEEK_STEP = 5;

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

const controlButton =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-paper transition-colors duration-200 ease-calm hover:bg-paper/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70";

/**
 * The demo well. Only the poster loads with the page: hovering it fetches
 * the file's metadata, and the click starts playback inside the same
 * gesture so phones allow it. The poster holds until the first frame is on
 * screen and then fades, so there's no black flash between the two.
 *
 * The well fades up as it arrives, and on wider screens settles from 97% to
 * full size as it scrolls toward the middle of the viewport. Once the video
 * starts it holds at full size so the picture stays sharp.
 */
export function DemoVideo({
  src,
  poster,
  duration: durationHint,
}: {
  src: string;
  poster: StaticImageData;
  /** Length in seconds, for the poster label before the file's metadata loads. */
  duration: number;
}) {
  const wellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const idleTimer = useRef<number>();
  const scrubbing = useRef(false);
  const pointerType = useRef("mouse");

  const [preload, setPreload] = useState<"none" | "metadata">("none");
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false); // first frame is on screen
  const [paused, setPaused] = useState(true);
  const [ended, setEnded] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [active, setActive] = useState(true); // pointer moved recently
  const [fullscreen, setFullscreen] = useState(false);
  const [duration, setDuration] = useState(durationHint);
  const [second, setSecond] = useState(0);

  const progress = useMotionValue(0);
  const knobLeft = useTransform(progress, (p) => `${p * 100}%`);

  const scrollLinked = useScrollLinkedMotion();
  const { scrollYProgress } = useScroll({
    target: wellRef,
    offset: ["start end", "center center"],
  });
  const settle = useTransform(scrollYProgress, [0, 1], [0.97, 1]);

  const loading = started && (!ready || buffering);
  // The file fades to black, so the poster comes back at the end.
  const showPoster = !ready || ended;
  const showMark = !ready || paused || buffering;
  const showControls = !ended && (paused || active);

  const sync = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    progress.set(video.currentTime / video.duration);
    setSecond(Math.floor(video.currentTime));
  }, [progress]);

  /** Bring the controls up, and let them fade again after a quiet spell. */
  const wake = useCallback(() => {
    setActive(true);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setActive(false), IDLE_MS);
  }, []);

  // timeupdate only fires a few times a second; glide the bar between them.
  useEffect(() => {
    if (paused) return;
    let frame = requestAnimationFrame(function tick() {
      sync();
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [paused, sync]);

  useEffect(() => {
    const onChange = () =>
      setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      window.clearTimeout(idleTimer.current);
    };
  }, []);

  // The poster button goes away once the video shows, so a keyboard user
  // who pressed it carries on from the pause button.
  useEffect(() => {
    if (!showPoster && document.activeElement === posterRef.current) {
      toggleRef.current?.focus({ preventScroll: true });
    }
  }, [showPoster]);

  function start() {
    const video = videoRef.current;
    if (!video) return;
    setStarted(true);
    // Inside the click, so the browser counts it as the user's own gesture.
    video.play().catch(() => {
      if (video.paused) setStarted(false);
    });
  }

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    wake();
  }

  function onSurfaceClick() {
    // On a phone the first tap brings the controls back; the next one pauses.
    if (pointerType.current === "touch" && !showControls) wake();
    else toggle();
  }

  function seek(seconds: number) {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = Math.min(Math.max(seconds, 0), video.duration);
    sync();
    wake();
  }

  function scrub(event: PointerEvent<HTMLDivElement>) {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    seek(((event.clientX - left) / width) * duration);
  }

  function onSeekKey(event: KeyboardEvent<HTMLDivElement>) {
    const video = videoRef.current;
    if (!video) return;
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[
      event.key
    ];
    if (step) seek(video.currentTime + step * SEEK_STEP);
    else if (event.key === "Home") seek(0);
    else if (event.key === "End") seek(duration);
    else return;
    event.preventDefault();
  }

  function toggleFullscreen() {
    const frame = frameRef.current;
    const video = videoRef.current as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (document.fullscreenEnabled && frame)
      frame.requestFullscreen().catch(() => {});
    // iPhone Safari only lets the <video> itself go full screen.
    else video?.webkitEnterFullscreen?.();
  }

  return (
    <Section id="demo" rule className="scroll-mt-20">
      <Container>
        <Reveal>
          <SectionHeading
            aside
            title="See Socrate in action"
            description="Watch how students are transforming their study workflow."
          />
        </Reveal>

        {/* The static box is what the scroll offset is measured from; the
            transforms go on the layers inside it. */}
        <div ref={wellRef} className="mt-9 sm:mt-11">
          <Reveal delay={0.08}>
            <m.div
              style={{ scale: scrollLinked && !started ? settle : 1 }}
              className="rounded-well border border-line bg-card p-1.5 shadow-[0_1px_2px_rgba(26,24,21,0.05),0_32px_64px_-36px_rgba(26,24,21,0.42)] sm:p-2"
            >
              <div
                ref={frameRef}
                onPointerMove={(event) => {
                  if (ready && event.pointerType !== "touch") wake();
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "touch" || scrubbing.current) return;
                  window.clearTimeout(idleTimer.current);
                  setActive(false);
                }}
                className="group relative aspect-video w-full overflow-hidden rounded-[7px] bg-ink sm:rounded-[5px] [&:fullscreen]:rounded-none [&:fullscreen]:bg-black"
              >
                <video
                  ref={videoRef}
                  src={src}
                  preload={preload}
                  playsInline
                  aria-label="Socrate product demo"
                  onPointerDown={(event) => {
                    pointerType.current = event.pointerType;
                  }}
                  onClick={onSurfaceClick}
                  onPlay={() => {
                    setPaused(false);
                    setEnded(false);
                  }}
                  onPause={() => {
                    setPaused(true);
                    setBuffering(false);
                  }}
                  onPlaying={() => {
                    setBuffering(false);
                    setReady(true);
                    wake();
                  }}
                  onWaiting={() => setBuffering(true)}
                  onEnded={() => setEnded(true)}
                  onDurationChange={(event) => {
                    const { duration } = event.currentTarget;
                    if (Number.isFinite(duration)) setDuration(duration);
                  }}
                  onTimeUpdate={sync}
                  onError={() => {
                    setStarted(false);
                    setReady(false);
                  }}
                  className={cn(
                    "absolute inset-0 h-full w-full object-contain",
                    showControls ? "cursor-pointer" : "cursor-none",
                  )}
                />

                <button
                  ref={posterRef}
                  type="button"
                  data-poster=""
                  onClick={start}
                  onPointerEnter={() => setPreload("metadata")}
                  onFocus={() => setPreload("metadata")}
                  aria-label={
                    ended
                      ? "Replay the Socrate product demo"
                      : `Play the Socrate product demo (${Math.round(duration)} seconds)`
                  }
                  className={cn(
                    "absolute inset-0 overflow-hidden transition-[opacity,visibility] duration-500 ease-calm focus-visible:outline-none",
                    !showPoster && "pointer-events-none invisible opacity-0",
                  )}
                >
                  <Image
                    src={poster}
                    alt=""
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1160px) 1080px, (min-width: 640px) calc(100vw - 5rem), calc(100vw - 3.5rem)"
                    className="object-cover transition-transform duration-700 ease-calm group-hover:scale-[1.02]"
                  />
                  <span className="absolute inset-0 bg-ink/25 transition-colors duration-500 ease-calm group-hover:bg-ink/15" />
                  <span className="absolute bottom-2.5 left-2.5 rounded-full bg-ink/70 px-2.5 py-1 backdrop-blur-sm sm:bottom-4 sm:left-4 sm:px-3">
                    <MonoLabel as="span" className="text-[10px] text-paper/90 sm:text-[11px]">
                      <span className="hidden sm:inline">Product demo · </span>
                      {clock(duration)}
                    </MonoLabel>
                  </span>
                </button>

                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  <span
                    className={cn(
                      // The poster button is the whole picture, so its focus
                      // ring goes round the mark people actually aim for.
                      "relative flex h-12 w-12 items-center justify-center rounded-full bg-paper text-ink shadow-[0_12px_32px_-8px_rgba(0,0,0,0.55)] ring-1 ring-ink/5 transition-[opacity,transform] duration-300 ease-calm group-hover:scale-105 group-active:scale-95 group-has-[[data-poster]:focus-visible]:ring-4 group-has-[[data-poster]:focus-visible]:ring-paper/60 sm:h-[4.25rem] sm:w-[4.25rem]",
                      showMark
                        ? cn("opacity-100", ready && buffering && "delay-300")
                        : "scale-90 opacity-0",
                    )}
                  >
                    {/* The spinner only takes over if loading outlasts a
                        blink, so a fast start never flickers. */}
                    <span
                      className={cn(
                        "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                        loading ? "opacity-0 delay-150" : "opacity-100",
                      )}
                    >
                      {ended ? (
                        <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <Play className="ml-0.5 h-5 w-5 fill-current sm:h-6 sm:w-6" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                        loading ? "opacity-100 delay-150" : "opacity-0",
                      )}
                    >
                      <Loader2 className="h-5 w-5 animate-spin sm:h-6 sm:w-6" />
                    </span>
                  </span>
                </div>

                {ready ? (
                  <div
                    className={cn(
                      "absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/60 via-black/25 to-transparent px-2 pb-1.5 pt-12 transition-opacity duration-300 ease-calm animate-in fade-in sm:gap-2 sm:px-3 sm:pb-2.5",
                      showControls
                        ? "opacity-100"
                        : "pointer-events-none opacity-0 has-[:focus-visible]:pointer-events-auto has-[:focus-visible]:opacity-100",
                    )}
                  >
                    <button
                      ref={toggleRef}
                      type="button"
                      onClick={toggle}
                      aria-label={paused ? (ended ? "Replay" : "Play") : "Pause"}
                      className={controlButton}
                    >
                      {!paused ? (
                        <Pause className="h-4 w-4 fill-current" />
                      ) : ended ? (
                        <RotateCcw className="h-4 w-4" />
                      ) : (
                        <Play className="ml-px h-4 w-4 fill-current" />
                      )}
                    </button>

                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Seek"
                      aria-valuemin={0}
                      aria-valuemax={Math.round(duration)}
                      aria-valuenow={second}
                      aria-valuetext={`${clock(second)} of ${clock(duration)}`}
                      onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        scrubbing.current = true;
                        scrub(event);
                      }}
                      onPointerMove={(event) => {
                        if (scrubbing.current) scrub(event);
                      }}
                      onPointerUp={() => (scrubbing.current = false)}
                      onPointerCancel={() => (scrubbing.current = false)}
                      onKeyDown={onSeekKey}
                      className="group/seek relative mx-1 flex h-8 flex-1 cursor-pointer touch-none items-center focus-visible:outline-none"
                    >
                      <span className="relative h-[3px] w-full rounded-full bg-paper/25 transition-[height] duration-200 ease-calm group-hover/seek:h-[5px] group-focus-visible/seek:h-[5px]">
                        <m.span
                          style={{ scaleX: progress }}
                          className="absolute inset-0 origin-left rounded-full bg-paper"
                        />
                        <m.span
                          style={{ left: knobLeft }}
                          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-paper shadow-[0_1px_4px_rgba(0,0,0,0.4)] transition-transform duration-200 ease-calm group-hover/seek:scale-100 group-focus-visible/seek:scale-100 group-active/seek:scale-100"
                        />
                      </span>
                    </div>

                    <span className="shrink-0 px-1 font-mono text-[11px] tabular-nums tracking-[0.04em] text-paper/80">
                      {clock(second)}
                      <span className="hidden sm:inline"> / {clock(duration)}</span>
                    </span>

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      aria-label={fullscreen ? "Exit full screen" : "Full screen"}
                      className={controlButton}
                    >
                      {fullscreen ? (
                        <Minimize className="h-4 w-4" />
                      ) : (
                        <Maximize className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ) : null}
              </div>
            </m.div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
