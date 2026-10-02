"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  Stat,
  StatGrid,
  StackLayout,
  TextArea,
  TextInput,
} from "./ui";
import { buildSocialCaptions } from "@/domains/writing/lib/text/social-caption.ts";

/**
 * Social post caption builder: one hook, body, link and hashtag list rendered
 * for X, LinkedIn, Instagram and Facebook, each measured against its limit.
 */
export default function SocialPostCaptionBuilder() {
  const [hook, setHook] = useState("");
  const [body, setBody] = useState("");
  const [hashtagsText, setHashtagsText] = useState("");
  const [link, setLink] = useState("");

  const hashtags = useMemo(
    () => hashtagsText.split(/[\n,\s]+/).map((tag) => tag.trim()).filter(Boolean),
    [hashtagsText],
  );
  const draft = useMemo(() => buildSocialCaptions({ hook, body, hashtags, link }), [hook, body, hashtags, link]);
  const hasParts = hook.trim().length > 0 || body.trim().length > 0;
  const overCount = draft.captions.filter((caption) => caption.over).length;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The post</PanelTitle>
        <div className="grid gap-3">
          <TextInput name="hook" label="Hook — the first line" value={hook} onChange={setHook} placeholder="Your support queue is not a mystery." />
          <TextArea
            name="body"
            label="Body"
            value={body}
            onChange={setBody}
            rows={3}
            placeholder="We looked at 2,000 tickets to find where response time actually goes."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="hashtags" label="Hashtags — space or comma separated" value={hashtagsText} onChange={setHashtagsText} placeholder="support, customerservice, ops" />
            <TextInput name="link" label="Link" value={link} onChange={setLink} placeholder="https://northwind.example/report" />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={hasParts ? <CopyButton text={draft.captions[0]?.caption ?? ""} testid="copy-caption-x" label="Copy X caption" /> : undefined}>
          Captions by platform
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Write the hook and the body — each platform&rsquo;s caption builds as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Platforms" value={draft.captions.length} testid="res-count" sub="one post, four audiences" />
            <StatGrid>
              <Stat label="Over a limit" value={overCount} testid="res-over" />
              <Stat label="Hashtags" value={hashtags.length} testid="res-hashtags" />
            </StatGrid>
            <ul data-testid="res-captions" className="mt-3 space-y-2">
              {draft.captions.map((caption) => (
                <li key={caption.platform.id} className="rounded-lg border border-border bg-card/40 px-3 py-2">
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{caption.platform.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {caption.chars} / {caption.platform.limit} characters
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-xs text-muted-foreground">{caption.caption}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the post is worth posting is still the writer&rsquo;s call.</Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {draft.checks.map((check) => (
              <li
                key={check.id}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300"
              >
                {check.message}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The builder arranges the same post for four platforms and measures each caption against the platform&rsquo;s
            published limit and hashtag habits. It schedules nothing and posts nothing.
          </Notice>
          <Notice tone="warn">
            Character limits and link behaviour change; the numbers here are the documented ones and worth re-checking
            against the platform help before a campaign leans on them.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
