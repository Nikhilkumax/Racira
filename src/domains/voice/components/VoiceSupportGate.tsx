"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { checkVoiceSupport, type SupportResult } from "../lib/browserSupport";

/**
 * Renders the studio when the browser can synthesize speech locally, and a
 * plain explanation when it cannot.
 *
 * No hardware tiers, no engine names, no browser-version matrix: the check is
 * about the two browser features the tool actually uses.
 */
export function VoiceSupportGate({ children }: { children: React.ReactNode }) {
  const [result, setResult] = useState<SupportResult | null>(null);

  useEffect(() => {
    let active = true;
    checkVoiceSupport().then((next) => {
      if (active) setResult(next);
    });
    return () => {
      active = false;
    };
  }, []);

  // Placeholder sized exactly like the studio so the page does not jump on
  // resolve. The heights are the studio's real rendered height at each
  // breakpoint — measured at 360/390/430/768/1024/1366 and identical for a
  // first visit and a returning one (the stored-voice rows are reserved, and
  // the result area is reserved, so no state changes the studio's height):
  //   <640   stacked panels, two-row player  → 1225px
  //   sm     stacked panels, one-row player  → 1173px
  //   lg     two-column panels               → 675px
  // Layout only: this does not change when or why the gate decides.
  if (!result) {
    return (
      <div className="mx-auto flex min-h-[1225px] w-full max-w-7xl animate-pulse flex-col items-center justify-center gap-4 rounded-3xl border border-border-subtle bg-muted/20 sm:min-h-[1173px] lg:min-h-[675px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">Checking your browser...</p>
      </div>
    );
  }

  if (!result.supported) {
    return <UnsupportedNotice reason={result.reason} />;
  }

  return <>{children}</>;
}

function UnsupportedNotice({ reason }: { reason: "no-wasm" | "no-storage" }) {
  const message =
    reason === "no-wasm"
      ? "This browser can't run the speech engine, which needs JavaScript and WebAssembly enabled. Turning them off, or an extension that blocks them, is the usual cause."
      : "This browser won't let the tool store its voice files on your device, so speech can't be generated offline. Private-browsing windows and strict site-data settings are the usual cause.";

  // Natural height: the notice is far shorter than the studio, so reserving
  // the studio's full height here leaves several hundred pixels of blank card
  // (measured: ~600px at 390). The gate accepts a single shift of the page
  // below when it resolves instead — reject-path CLS stays under the 0.02
  // budget, and the supported path is unaffected because the skeleton above
  // keeps its reserved heights.
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-3xl border border-border-subtle bg-gradient-card px-6 py-16 text-center shadow-elevated sm:px-12">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Browser Not Supported</h2>
      <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
        {message}
      </p>

      <div className="rounded-2xl border border-border-subtle bg-muted/30 p-6 text-left text-sm text-muted-foreground">
        <p className="mb-3 text-base font-semibold text-foreground">What works</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>A current version of Chrome, Edge, Firefox, Safari or Brave.</li>
          <li>Standard (non-private) browsing, with site storage allowed.</li>
          <li>Desktop or mobile — no graphics hardware requirement.</li>
        </ul>
      </div>
    </div>
  );
}
