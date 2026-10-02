"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
} from "./ui";
import { formatTestimonials } from "@/domains/writing/lib/text/testimonial.ts";

/**
 * Testimonial formatter: one testimonial per line, formatted for a wall, a
 * carousel and a pull quote at once, with the weaknesses named.
 */
export default function TestimonialFormatter() {
  const [text, setText] = useState("");
  const result = useMemo(() => formatTestimonials(text), [text]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your testimonials</PanelTitle>
        <TextArea
          name="text"
          label="One per line: quote | name | role"
          value={text}
          onChange={setText}
          rows={8}
          placeholder={
            "The kettle holds 70 degrees for a whole pot of green tea | Maya Chen | tea buyer\nThe second pot tastes as good as the first | Alex Doe | writer"
          }
          hint="Name and role may be left empty; the checks name what is missing."
        />
      </Panel>

      <Panel>
        <PanelTitle right={result.formatted ? <CopyButton text={result.formatted} testid="copy-wall" /> : undefined}>
          Testimonial wall
        </PanelTitle>
        <HeroStat
          label="Testimonials"
          value={result.counts.total}
          testid="res-total"
          sub={`${result.counts.attributed} attributed · ${result.counts.withResult} with a result`}
        />
        <StatGrid>
          <Stat label="Attributed" value={result.counts.attributed} testid="res-attributed" />
          <Stat label="Slide-ready" value={result.counts.slideReady} testid="res-slide-ready" />
          <Stat label="Checks" value={result.checks.length} testid="res-checks-count" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="formatted" value={result.formatted} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={result.formatted} filename="testimonials.txt" testid="download-wall" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={result.slideReady ? <CopyButton text={result.slideReady} testid="copy-slides" /> : undefined}>
          Carousel selection
        </PanelTitle>
        {result.slideReady ? (
          <OutputBlock name="slides" value={result.slideReady} mono={false} />
        ) : (
          <Notice>No quote is short enough for a slide yet; the carousel needs one line under twenty words.</Notice>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Pull quote</PanelTitle>
        {result.pullQuote ? (
          <OutputBlock name="pull" value={result.pullQuote} mono={false} />
        ) : (
          <Notice>No attributed quote yet; the pull quote is taken from the longest attributed line.</Notice>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {result.checks.length === 0 ? (
          <Notice>No documented problem: the quotes are attributed, short enough to read and specific about their results.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {result.checks.map((check) => (
              <li key={check}>
                <Notice tone="warn">{check}</Notice>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The formatter attributes, measures and grades each line. A quote past fifty words stops being read, one
            under twenty is slide-ready, and a set with no number in it is decoration rather than evidence.
          </Notice>
          <Notice tone="warn">
            It cannot tell whether a testimonial is genuine, and it cannot verify a result. Published testimonials are
            a claim the business makes; keep the permission to use each name on file.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
