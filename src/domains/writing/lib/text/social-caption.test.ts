import { test } from "node:test";
import assert from "node:assert/strict";
import { PLATFORMS, buildSocialCaptions } from "./social-caption.ts";

const FULL = {
  hook: "Your support queue is not a mystery.",
  body: "We looked at 2,000 tickets to find where response time actually goes.",
  hashtags: ["support", "customerservice", "ops"],
  link: "https://northwind.example/report",
};

test("buildSocialCaptions renders the same post for four platforms", () => {
  const draft = buildSocialCaptions(FULL);
  assert.equal(draft.captions.length, 4);
  assert.deepEqual(draft.captions.map((caption) => caption.platform.id), ["x", "linkedin", "instagram", "facebook"]);
  for (const caption of draft.captions) {
    assert.equal(caption.chars, 173);
    assert.equal(caption.over, false);
    assert.ok(caption.caption.includes("#support #customerservice #ops"));
  }
});

test("buildSocialCaptions sends the link to the bio on Instagram", () => {
  const draft = buildSocialCaptions(FULL);
  assert.deepEqual(draft.checks.map((check) => check.id), ["link-instagram"]);
});

test("buildSocialCaptions flags a caption past the platform limit", () => {
  const body = Array.from({ length: 60 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildSocialCaptions({ ...FULL, body, hashtags: [] });
  const x = draft.captions.find((caption) => caption.platform.id === "x");
  assert.equal(x?.over, true);
  assert.ok(draft.checks.some((check) => check.id === "over-x"));
  assert.ok(!draft.checks.some((check) => check.id === "over-facebook"));
});

test("buildSocialCaptions caps hashtags per platform and overall", () => {
  const four = buildSocialCaptions({ ...FULL, hashtags: ["a", "b", "c", "d"] });
  assert.ok(four.checks.some((check) => check.id === "tags-x"));
  const eleven = buildSocialCaptions({ ...FULL, hashtags: Array.from({ length: 11 }, (_, index) => `tag${index + 1}`) });
  assert.ok(eleven.checks.some((check) => check.id === "hashtags-many"));
});

test("PLATFORMS states each limit and hashtag cap", () => {
  const x = PLATFORMS.find((platform) => platform.id === "x");
  assert.deepEqual(x, { id: "x", label: "X", limit: 280, hashtagCap: 3, linkInCaption: true });
});
