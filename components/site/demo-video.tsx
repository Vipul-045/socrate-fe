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
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  m,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

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
/** Hover intent: a cursor just passing over the well doesn't start the film. */
const HOVER_MS = 250;
/** Arrow-key seek step, in seconds. */
const SEEK_STEP = 5;

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

const controlButton =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-paper transition-colors duration-200 ease-calm hover:bg-paper/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70 sm:h-9 sm:w-9";

/**
 * The demo well. Only the poster loads with the page; nothing of the film
 * is fetched until someone hovers it or presses play.
 *
 * Resting a mouse on the well plays a muted preview — browsers only let a
 * film start without a click if it's silent — which pauses again when the
 * pointer leaves. The first click of any kind takes over: sound comes on
 * and hover stops steering playback. Touch and keyboard have no hover, so
 * there a tap or Enter plays with sound straight away, inside the gesture
 * so phones allow it. The poster is the film's first frame and holds until
 * that frame is on screen, so the hand-off is seamless.
 *
 * The well fades up as it arrives, and on wider screens settles from 97% to
 * full size as it scrolls toward the middle of the viewport. Once someone
 * clicks into the film it holds at full size so the picture stays sharp; a
 * hover preview leaves it alone, so resting the mouse there doesn't jolt it.
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
  const hoverTimer = useRef<number>();
  const scrubbing = useRef(false);
  const pointerType = useRef("mouse");
  // Mirrors `committed` for timers, which would otherwise read a stale render.
  const committedRef = useRef(false);

  const reduceMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [committed, setCommitted] = useState(false); // clicked, not just hovered
  const [ready, setReady] = useState(false); // first frame is on screen
  const [paused, setPaused] = useState(true);
  const [ended, setEnded] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [active, setActive] = useState(true); // pointer moved recently
  const [fullscreen, setFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
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

  const loading = started && !paused && (!ready || buffering);
  const showPoster = !ready;
  // The film closes on its title card; leave that clear and offer the
  // replay from the control bar instead of stamping a mark over it.
  const showMark = !ready || (paused && !ended) || buffering;
  // A preview the pointer has left stays quiet: just the frame and the mark.
  const showControls = active || (paused && committed);

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
      window.clearTimeout(hoverTimer.current);
    };
  }, []);

  // The poster button goes away once the video shows, so a keyboard user
  // who pressed it carries on from the pause button.
  useEffect(() => {
    if (!showPoster && document.activeElement === posterRef.current) {
      toggleRef.current?.focus({ preventScroll: true });
    }
  }, [showPoster]);

  /** The first real interaction: sound on, and hover no longer steers. */
  function commit() {
    const video = videoRef.current;
    if (!video || committedRef.current) return;
    committedRef.current = true;
    setCommitted(true);
    window.clearTimeout(hoverTimer.current);
    // Safe to unmute here: we're inside the user's click.
    video.muted = false;
  }

  function start() {
    const video = videoRef.current;
    if (!video) return;
    commit();
    setStarted(true);
    // Inside the click, so the browser counts it as the user's own gesture.
    video.play().catch(() => {});
  }

  function preview() {
    const video = videoRef.current;
    if (!video || committedRef.current || !video.paused) return;
    video.muted = true;
    setStarted(true);
    // Rejected when the pointer leaves before it starts; nothing to undo.
    video.play().catch(() => {});
  }

  function onPointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || reduceMotion || committedRef.current)
      return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(preview, HOVER_MS);
  }

  function onPointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || scrubbing.current) return;
    window.clearTimeout(hoverTimer.current);
    window.clearTimeout(idleTimer.current);
    setActive(false);
    if (!committedRef.current) videoRef.current?.pause();
  }

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    commit();
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    wake();
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    // Unmuting a hover preview is the click that takes it over.
    if (committedRef.current) video.muted = !video.muted;
    else commit();
    wake();
  }

  function onSurfaceClick() {
    const video = videoRef.current;
    if (!video) return;
    if (!committedRef.current) {
      // Clicking a muted preview means "watch this": keep it running, with sound.
      commit();
      if (video.paused) video.play().catch(() => {});
      wake();
    } else if (pointerType.current === "touch" && !showControls) {
      // On a phone the first tap brings the controls back; the next one pauses.
      wake();
    } else toggle();
  }

  function seek(seconds: number) {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    commit();
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
    commit();
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
              style={{ scale: scrollLinked && !committed ? settle : 1 }}
              className="rounded-well border border-line bg-card p-1.5 shadow-[0_1px_2px_rgba(26,24,21,0.05),0_32px_64px_-36px_rgba(26,24,21,0.42)] sm:p-2"
            >
              <div
                ref={frameRef}
                onPointerEnter={onPointerEnter}
                onPointerMove={(event) => {
                  if (ready && event.pointerType !== "touch") wake();
                }}
                onPointerLeave={onPointerLeave}
                // Surface matches the film's own paper, so full-screen
                // letterboxing reads as more of the page, not black bars.
                className="group relative aspect-video w-full overflow-hidden rounded-[7px] bg-surface sm:rounded-[5px] [&:fullscreen]:rounded-none"
              >
                <video
                  ref={videoRef}
                  src={src}
                  preload="none"
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
                  onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
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
                  aria-label={`Play the Socrate product demo (${Math.round(duration)} seconds)`}
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
                  <span className="absolute bottom-2.5 left-2.5 rounded-full border border-line bg-card/85 px-2.5 py-1 backdrop-blur-sm sm:bottom-4 sm:left-4 sm:px-3">
                    <MonoLabel as="span" className="text-[10px] text-ink-soft sm:text-[11px]">
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
                      "relative flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-[0_14px_30px_-12px_rgba(26,24,21,0.6)] transition-[opacity,transform,background-color] duration-300 ease-calm group-hover:scale-105 group-hover:bg-ink-hover group-active:scale-95 group-has-[[data-poster]:focus-visible]:ring-4 group-has-[[data-poster]:focus-visible]:ring-ink/20 sm:h-[4.25rem] sm:w-[4.25rem]",
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
                      <Play className="ml-0.5 h-5 w-5 fill-current sm:h-6 sm:w-6" />
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

                {/* A floating ink bar rather than a dark gradient, which
                    would muddy the film's light frames. */}
                {ready ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center px-2 sm:bottom-4 sm:px-4">
                    <div
                      className={cn(
                        "flex h-10 w-full max-w-xl items-center gap-0.5 rounded-full bg-ink/80 px-1 shadow-[0_8px_24px_-12px_rgba(26,24,21,0.6)] backdrop-blur-md transition-opacity duration-300 ease-calm animate-in fade-in sm:h-11 sm:gap-1 sm:px-1.5",
                        showControls
                          ? "pointer-events-auto opacity-100"
                          : "opacity-0 has-[:focus-visible]:pointer-events-auto has-[:focus-visible]:opacity-100",
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
                        onClick={toggleMute}
                        aria-label={muted ? "Unmute" : "Mute"}
                        className={controlButton}
                      >
                        {muted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>

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
