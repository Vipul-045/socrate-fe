"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { m, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { useScrollLinkedMotion } from "@/components/motion/use-scroll-linked-motion";

import {
  Container,
  MonoLabel,
  Section,
  SectionHeading,
} from "@/components/site/primitives";

/**
 * The demo well. Until a real recording is wired up this renders a hatched
 * placeholder; drop the embed into `videoSrc` and the play button swaps the
 * placeholder for the iframe.
 *
 * The well fades up as it arrives, and on wider screens settles from 97% to
 * full size as it scrolls toward the middle of the viewport. Once the video
 * plays it holds at full size so the picture stays sharp.
 */
export function DemoVideo({ videoSrc }: { videoSrc?: string }) {
  const [playing, setPlaying] = useState(false);
  const wellRef = useRef<HTMLDivElement>(null);
  const scrollLinked = useScrollLinkedMotion();
  const { scrollYProgress } = useScroll({
    target: wellRef,
    offset: ["start end", "center center"],
  });
  const settle = useTransform(scrollYProgress, [0, 1], [0.97, 1]);

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
              style={{ scale: scrollLinked && !playing ? settle : 1 }}
              className="overflow-hidden rounded-well border border-line bg-card"
            >
              <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
                {playing && videoSrc ? (
                  <iframe
                    src={videoSrc}
                    title="Socrate product demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    disabled={!videoSrc}
                    aria-label={
                      videoSrc
                        ? "Play the Socrate product demo"
                        : "Product demo — coming soon"
                    }
                    className={cn(
                      "group absolute inset-0 flex flex-col items-center justify-center gap-6 u-hatch",
                      videoSrc ? "cursor-pointer" : "cursor-default",
                    )}
                  >
                    <span className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-full bg-ink text-card transition-transform duration-200 ease-calm sm:h-[4.25rem] sm:w-[4.25rem]",
                        videoSrc && "group-hover:scale-105",
                      )}>
                      <Play className="ml-0.5 h-5 w-5 fill-current sm:h-6 sm:w-6" />
                    </span>
                    <MonoLabel as="span">Product demo — 90 sec</MonoLabel>
                  </button>
                )}
              </div>
            </m.div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
