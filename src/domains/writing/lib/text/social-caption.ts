/**
 * Social post caption builder: one hook, one body, one link and a hashtag list
 * rendered into captions for each platform, checked against the platform's
 * character limit and each network's small habits.
 *
 * The engine writes nothing; it arranges the same post for four audiences and
 * says where it will be cut off.
 */

export interface SocialCaptionInput {
  hook: string;
  body: string;
  hashtags: string[];
  link: string;
}

export interface PlatformSpec {
  id: string;
  label: string;
  limit: number;
  hashtagCap: number;
  /** Instagram captions cannot carry a working link — it belongs in the bio. */
  linkInCaption: boolean;
}

export const PLATFORMS: PlatformSpec[] = [
  { id: "x", label: "X", limit: 280, hashtagCap: 3, linkInCaption: true },
  { id: "linkedin", label: "LinkedIn", limit: 3000, hashtagCap: 5, linkInCaption: true },
  { id: "instagram", label: "Instagram", limit: 2200, hashtagCap: 10, linkInCaption: false },
  { id: "facebook", label: "Facebook", limit: 63206, hashtagCap: 5, linkInCaption: true },
];

export interface PlatformCaption {
  platform: PlatformSpec;
  caption: string;
  chars: number;
  over: boolean;
}

export interface SocialCheck {
  id: string;
  message: string;
}

export interface SocialCaptionDraft {
  captions: PlatformCaption[];
  checks: SocialCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");
const normaliseTag = (tag: string): string => (tag.startsWith("#") ? tag : `#${tag}`);

export function buildSocialCaptions(input: SocialCaptionInput): SocialCaptionDraft {
  const hook = clean(input.hook);
  const body = clean(input.body);
  const hashtags = input.hashtags.map(clean).filter(Boolean).map(normaliseTag);
  const link = clean(input.link);

  const captions = PLATFORMS.map((platform) => {
    const parts = [hook, body, link, hashtags.join(" ")].filter(Boolean);
    const caption = parts.join("\n\n");
    return { platform, caption, chars: caption.length, over: caption.length > platform.limit };
  });

  const checks: SocialCheck[] = [];
  if (!hook) checks.push({ id: "hook", message: "Write the hook: the first line is the only one some readers see." });
  if (!body) checks.push({ id: "body", message: "Add the body; a caption that is only a hook is a headline, not a post." });
  if (hashtags.length > 10) {
    checks.push({ id: "hashtags-many", message: `${hashtags.length} hashtags is a wall; ten is already generous and some platforms want three.` });
  }
  for (const caption of captions) {
    if (caption.over) {
      checks.push({
        id: `over-${caption.platform.id}`,
        message: `The ${caption.platform.label} caption runs ${caption.chars} characters; the limit is ${caption.platform.limit}.`,
      });
    }
    if (!caption.platform.linkInCaption && link) {
      checks.push({
        id: `link-${caption.platform.id}`,
        message: `${caption.platform.label} does not make caption links clickable; put the link in the bio or the first comment.`,
      });
    }
    if (hashtags.length > caption.platform.hashtagCap) {
      checks.push({
        id: `tags-${caption.platform.id}`,
        message: `${caption.platform.label} reads best with ${caption.platform.hashtagCap} hashtags or fewer; you have ${hashtags.length}.`,
      });
    }
  }

  return { captions, checks };
}
